/**
 * One-shot: harvest → purchase tapal → assign driver (default: Vazahat 9827607086)
 * Requires: backend running (`npm run dev`), admin password in .env
 *
 * Usage:
 *   node scripts/quickDriverTrip.js
 *   DRIVER_PHONE=9827607086 node scripts/quickDriverTrip.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/modules/users/user.model.js';
import { Farmer } from '../src/modules/farmers/farmer.model.js';
import { Product } from '../src/modules/products/product.model.js';
import { Vehicle } from '../src/modules/vehicles/vehicle.model.js';
import { Buyer } from '../src/modules/buyers/buyer.model.js';
import { DriverProfile } from '../src/modules/drivers/driverProfile.model.js';
import { Harvest } from '../src/modules/harvests/harvest.model.js';
import { Tapal } from '../src/modules/tapals/tapal.model.js';
import { Sequence } from '../src/models/sequence.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || '5000';
const BASE = process.env.E2E_API_BASE || `http://127.0.0.1:${PORT}/api/v1`;
const HEALTH = process.env.E2E_HEALTH_URL || `http://127.0.0.1:${PORT}/health`;
const ADMIN_PHONE = process.env.SEED_ADMIN_PHONE || '9076062592';
const ADMIN_PASS = process.env.SEED_ADMIN_PASSWORD || 'admin_password_123';
const DRIVER_PHONE = (process.env.DRIVER_PHONE || '9827607086').replace(/\D/g, '').slice(-10);

async function api(method, path, { token, platform = 'WEB', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (platform) headers['X-Client-Platform'] = platform;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json;
  try {
    json = await res.json();
  } catch {
    json = { success: false, message: await res.text() };
  }
  return { status: res.status, json };
}

function unwrap(json) {
  return json?.data ?? json;
}

async function login(phone, password, platform) {
  const { status, json } = await api('POST', '/auth/login', {
    body: { phone, password },
    platform,
  });
  if (status !== 200 || !json?.data?.accessToken) {
    throw new Error(`Login failed (${phone}): ${json?.message || status}`);
  }
  return json.data.accessToken;
}

async function main() {
  console.log('\n=== Quick driver trip (harvest → tapal → assign) ===\n');
  console.log(`Driver phone: ${DRIVER_PHONE}`);

  const health = await fetch(HEALTH, { signal: AbortSignal.timeout(8000) });
  if (!health.ok) throw new Error(`Backend not running at ${HEALTH} — run: cd backend && npm run dev`);

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI missing in backend/.env');
  await mongoose.connect(uri);

  const driverUser = await User.findOne({
    $or: [{ phone: DRIVER_PHONE }, { phone: `+91${DRIVER_PHONE}` }, { phone: `91${DRIVER_PHONE}` }],
    role: 'DRIVER',
  });
  if (!driverUser) {
    throw new Error(`Driver user not found for ${DRIVER_PHONE}. Create in Access Control first.`);
  }
  if (driverUser.isActive === false) {
    driverUser.isActive = true;
    await driverUser.save();
    console.log('Activated driver user.');
  }

  await DriverProfile.findOneAndUpdate(
    { userId: driverUser._id },
    {
      $set: {
        status: 'active',
        verifiedAt: new Date(),
        rejectionReason: null,
      },
      $setOnInsert: {
        userId: driverUser._id,
        fullName: driverUser.fullName || 'Vazahat Qureshi',
        phone: driverUser.phone,
      },
    },
    { upsert: true }
  );
  console.log(`Driver: ${driverUser.fullName} (${driverUser._id})`);

  const adminWeb = await login(ADMIN_PHONE, ADMIN_PASS, 'WEB');
  let procToken = adminWeb;
  try {
    procToken = await login('9000000001', process.env.E2E_PASSWORD || 'e2e_test_123', 'MOBILE');
  } catch {
    console.log('Procurement mobile user missing — using admin token for harvest steps.');
  }

  let farmer = await Farmer.findOne({ isActive: { $ne: false } }).sort({ createdAt: -1 });
  if (!farmer) {
    const fr = await api('POST', '/farmers/create', {
      token: procToken,
      platform: 'MOBILE',
      body: {
        fullName: 'TEST FARMER',
        phone: '9876500001',
        location: 'KARWAR',
        farmerCode: 'TF' + Date.now().toString().slice(-5),
      },
    });
    farmer = unwrap(fr.json)?.farmer || unwrap(fr.json);
    if (!farmer?._id) throw new Error('Could not create farmer: ' + (fr.json?.message || fr.status));
    console.log('Created farmer:', farmer.fullName);
  }

  let product = await Product.findOne({ isActive: { $ne: false } });
  if (!product) {
    const pr = await api('POST', '/products/create', {
      token: adminWeb,
      body: { name: 'TEST PRAWNS', unit: 'KG', basePrice: 400, category: 'SEAFOOD' },
    });
    product = unwrap(pr.json)?.product || unwrap(pr.json);
    if (!product?._id) throw new Error('Could not create product');
    await api('POST', '/inventory/adjust', {
      token: adminWeb,
      body: { productId: product._id.toString(), quantityChange: 500, remarks: 'Quick trip seed stock' },
    });
    console.log('Created product:', product.name);
  }

  let vehicle = await Vehicle.findOne({ status: 'AVAILABLE' });
  if (!vehicle) {
    const vr = await api('POST', '/vehicles/create', {
      token: adminWeb,
      body: {
        vehicleNumber: 'KA-QK-' + Date.now().toString().slice(-4),
        type: 'TRUCK',
        capacity: 3000,
        status: 'AVAILABLE',
      },
    });
    vehicle = unwrap(vr.json)?.vehicle || unwrap(vr.json);
    if (!vehicle?._id) throw new Error('Could not create vehicle');
    console.log('Created vehicle:', vehicle.vehicleNumber);
  }

  const buyerUser = await User.findOne({ role: { $in: ['BUYER', 'Buyer'] }, isActive: { $ne: false } });
  let buyerMaster = buyerUser
    ? await Buyer.findOne({ $or: [{ phone: buyerUser.phone }, { buyerCode: { $exists: true } }] })
    : null;

  const now = new Date();
  const hCreate = await api('POST', '/harvests/create', {
    token: procToken,
    platform: 'MOBILE',
    body: {
      farmerId: farmer._id.toString(),
      harvestDate: now.toISOString(),
      pickupDate: now.toISOString(),
      pickupLocation: 'KARWAR LOADING POINT',
      vehicleNo: vehicle.vehicleNumber,
      driverName: driverUser.fullName,
      graderName: 'Admin Grader',
      products: [
        {
          productId: product._id.toString(),
          fishName: product.name,
          estimatedQty: 80,
          boxCount: 4,
          weightPerBox: 20,
        },
      ],
    },
  });
  if (hCreate.status !== 201) throw new Error('Harvest create failed: ' + (hCreate.json?.message || hCreate.status));
  const harvest = unwrap(hCreate.json)?.harvest || unwrap(hCreate.json);
  const harvestId = harvest._id || harvest.id;
  console.log('Harvest:', harvest.harvestNumber || harvestId);

  const approve = await api('PATCH', `/harvests/status/${harvestId}`, {
    token: procToken,
    platform: 'MOBILE',
    body: { status: 'CONFIRMED' },
  });
  if (approve.status !== 200) {
    const alt = await api('PATCH', `/harvests/approve/${harvestId}`, {
      token: adminWeb,
      body: { status: 'CONFIRMED' },
    });
    if (alt.status !== 200) throw new Error('Harvest approve failed');
  }
  console.log('Harvest approved (CONFIRMED)');

  const net = await api('POST', `/harvests/net-rate/${harvestId}`, {
    token: procToken,
    platform: 'MOBILE',
    body: {
      productRates: [{ productId: product._id.toString(), rate: 450 }],
      tds: 0,
      commission: 0,
      soft: 0,
    },
  });
  if (net.status !== 200) throw new Error('Net rate failed: ' + (net.json?.message || net.status));
  console.log('Purchase bill (net rate) saved');

  const tapalRes = await api('POST', '/tapals/create-from-harvest', {
    token: procToken,
    platform: 'MOBILE',
    body: {
      harvestId: harvestId.toString(),
      assignedTo: buyerUser?._id?.toString(),
      destination: 'MANGALORE TEST DELIVERY',
      vehicleNumber: vehicle.vehicleNumber,
      driverName: driverUser.fullName,
    },
  });
  if (tapalRes.status !== 201) throw new Error('Tapal create failed: ' + (tapalRes.json?.message || tapalRes.status));
  const tapal = unwrap(tapalRes.json)?.tapal || unwrap(tapalRes.json);
  const tapalId = tapal._id || tapal.id;
  console.log('Tapal:', tapal.tapalNumber, tapalId);

  const assign = await api('PATCH', '/tapals/assign-driver', {
    token: adminWeb,
    body: {
      tapalId: tapalId.toString(),
      driverId: driverUser._id.toString(),
      vehicleId: vehicle._id.toString(),
    },
  });
  if (assign.status !== 200) throw new Error('Assign driver failed: ' + (assign.json?.message || assign.status));
  const trip = unwrap(assign.json)?.trip;
  console.log('\n✅ Trip assigned!');
  console.log(`   Tapal: ${tapal.tapalNumber}`);
  console.log(`   Trip:  ${trip?.tripNumber || trip?._id}`);
  console.log(`   Driver app: login OTP ${DRIVER_PHONE} → keep app open on dashboard`);
  console.log('   Tap screen once for ring sound (browser rule).\n');

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('\n❌', e.message);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
