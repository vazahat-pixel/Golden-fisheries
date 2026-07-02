/**
 * Golden Fisheries — Full E2E test (real API routes)
 *
 * Prerequisites:
 *   1. MongoDB + backend:  cd backend && npm run dev
 *   2. Seed users:         npm run seed:admin && npm run seed:e2e
 *
 * Run:  cd backend && node scripts/e2e_test.js
 *   or: npm run test:e2e:full
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || '5000';
const BASE = process.env.E2E_API_BASE || `http://127.0.0.1:${PORT}/api/v1`;
const HEALTH_URL = process.env.E2E_HEALTH_URL || `http://127.0.0.1:${PORT}/health`;

const USERS = {
  superAdmin: { phone: '9076062592', password: 'admin_password_123', label: 'Super Admin' },
  procurement: { phone: '9000000001', password: 'e2e_test_123', label: 'Procurement' },
  buyer: { phone: '9000000002', password: 'e2e_test_123', label: 'Buyer' },
  driver: { phone: '9000000003', password: 'e2e_test_123', label: 'Driver' },
  vehicleManager: { phone: '9000000004', password: 'e2e_test_123', label: 'Vehicle Manager' },
};

const STATE = {
  tokens: {},
  farmerId: null,
  productId: null,
  vehicleId: null,
  driverUserId: null,
  harvestId: null,
  harvestNumber: null,
  tapalId: null,
  tapalNumber: null,
  tripId: null,
  billId: null,
  newDriverPhone: null,
};

let PASS = 0;
let FAIL = 0;
let SKIP = 0;
const RESULTS = [];

function log(msg, color = 'reset') {
  const C = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
  };
  process.stdout.write((C[color] || '') + msg + C.reset + '\n');
}

function header(title) {
  log(`\n${'═'.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bold');
  log('═'.repeat(60), 'cyan');
}

function subheader(title) {
  log(`\n  ── ${title} ──`, 'blue');
}

function unwrap(json) {
  return json?.data ?? json;
}

async function request(method, urlPath, body = null, token = null, platform = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (platform) headers['X-Client-Platform'] = platform;
  try {
    const res = await fetch(`${BASE}${urlPath}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return { status: res.status, data, ok: res.ok };
  } catch (err) {
    return { status: 0, data: { message: err.message }, ok: false };
  }
}

function assert(name, condition, detail = '', skip = false) {
  if (skip) {
    SKIP++;
    log(`  ⊘ SKIP  ${name}${detail ? ` → ${detail}` : ''}`, 'yellow');
    RESULTS.push({ name, result: 'SKIP', detail });
    return false;
  }
  if (condition) {
    PASS++;
    log(`  ✓ PASS  ${name}${detail ? ` → ${detail}` : ''}`, 'green');
    RESULTS.push({ name, result: 'PASS', detail });
    return true;
  }
  FAIL++;
  log(`  ✗ FAIL  ${name}${detail ? ` → ${detail}` : ''}`, 'red');
  RESULTS.push({ name, result: 'FAIL', detail });
  return false;
}

function idOf(obj) {
  if (!obj) return null;
  return obj._id || obj.id || null;
}

async function loginUser(key, platform) {
  const u = USERS[key];
  const res = await request('POST', '/auth/login', { phone: u.phone, password: u.password }, null, platform);
  const token = res.data?.data?.accessToken || res.data?.accessToken;
  const ok = assert(`[${u.label}] Login (${platform})`, res.status === 200 && !!token, res.data?.message || `HTTP ${res.status}`);
  if (ok) STATE.tokens[`${key}_${platform}`] = token;
  return token;
}

// ─── PHASE 0 ───────────────────────────────────────────────
async function phase0() {
  header('PHASE 0 — Connectivity');
  const health = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  assert('Backend /health reachable', health?.ok === true, HEALTH_URL);
}

// ─── PHASE 1 — Auth ──────────────────────────────────────
async function phase1() {
  header('PHASE 1 — Authentication');
  await loginUser('superAdmin', 'WEB');
  await loginUser('procurement', 'MOBILE');
  // Buyer portal APIs allow web in routes but platform policy expects MOBILE for BUYER role
  await loginUser('buyer', 'MOBILE');
  await loginUser('driver', 'MOBILE');
  await loginUser('vehicleManager', 'MOBILE');

  const wrong = await request('POST', '/auth/login', { phone: USERS.superAdmin.phone, password: 'wrong' });
  assert('[Auth] Wrong password rejected', wrong.status === 401, `HTTP ${wrong.status}`);
}

// ─── PHASE 2 — Master data ─────────────────────────────────
async function phase2() {
  header('PHASE 2 — Master Data');
  const adminWeb = STATE.tokens.superAdmin_WEB;
  const procMobile = STATE.tokens.procurement_MOBILE;
  const adminMobile = STATE.tokens.superAdmin_MOBILE || adminWeb;

  if (!adminWeb) {
    assert('Master data', false, 'No admin token');
    return;
  }

  const farmers = await request('GET', '/farmers/all', null, adminWeb, 'WEB');
  if (assert('[Farmers] List', farmers.status === 200, farmers.data?.message)) {
    const list = unwrap(farmers.data);
    const arr = Array.isArray(list) ? list : list?.docs || [];
    if (arr.length) STATE.farmerId = idOf(arr[0]);
    else if (procMobile) {
      const created = await request(
        'POST',
        '/farmers/create',
        {
          fullName: 'E2E Farmer ' + Date.now(),
          phone: '9' + String(Math.floor(Math.random() * 1e9)).slice(0, 9),
          location: 'Karwar',
          farmerCode: 'EF' + Date.now().toString().slice(-6),
        },
        procMobile,
        'MOBILE'
      );
      STATE.farmerId = idOf(unwrap(created.data)?.farmer || unwrap(created.data));
      assert('[Farmers] Created test farmer', !!STATE.farmerId, STATE.farmerId);
    }
  }

  const products = await request('GET', '/products/all', null, adminWeb, 'WEB');
  if (assert('[Products] List', products.status === 200, products.data?.message)) {
    const list = unwrap(products.data);
    const arr = Array.isArray(list) ? list : list?.docs || [];
    if (arr.length) STATE.productId = idOf(arr[0]);
    assert('[Products] Has product id', !!STATE.productId, STATE.productId);
  }

  const vehicles = await request('GET', '/vehicles/all', null, adminMobile, 'MOBILE');
  if (assert('[Vehicles] List (mobile)', vehicles.status === 200, vehicles.data?.message)) {
    const list = unwrap(vehicles.data);
    const arr = Array.isArray(list) ? list : list?.docs || [];
    const avail = arr.find((v) => (v.status || '').toUpperCase() === 'AVAILABLE');
    STATE.vehicleId = idOf(avail || arr[0]);
    assert('[Vehicles] Vehicle id', !!STATE.vehicleId, STATE.vehicleId);
  }

  const drivers = await request('GET', '/users/drivers', null, adminWeb, 'WEB');
  if (assert('[Drivers] List endpoint', drivers.status === 200, drivers.data?.message)) {
    const list = unwrap(drivers.data);
    const arr = Array.isArray(list) ? list : [];
    const d = arr.find((x) => x.phone === USERS.driver.phone) || arr[0];
    STATE.driverUserId = idOf(d);
    assert('[Drivers] E2E driver user id', !!STATE.driverUserId, STATE.driverUserId);
  }
}

// ─── PHASE 3 — Harvest create ────────────────────────────
async function phase3() {
  header('PHASE 3 — Harvest Slip Create');
  const procMobile = STATE.tokens.procurement_MOBILE;
  if (!procMobile || !STATE.farmerId || !STATE.productId) {
    assert('Harvest create', false, 'Missing token or master ids', true);
    return;
  }

  const now = new Date().toISOString();
  const body = {
    farmerId: STATE.farmerId,
    harvestDate: now,
    pickupDate: now,
    pickupLocation: 'Chilika Ghat — E2E Test',
    vehicleNo: 'KA-E2E-01',
    driverName: 'Field Driver',
    graderName: 'Grader A',
    remarks: 'E2E harvest slip',
    products: [
      {
        productId: STATE.productId,
        fishName: 'PRAWNS',
        estimatedQty: 100,
        boxCount: 5,
        weightPerBox: 20,
        hsnCode: '03069500',
        count: '100',
      },
    ],
  };

  const noAuth = await request('POST', '/harvests/create', body);
  assert('[Harvest] No auth blocked', noAuth.status === 401, `HTTP ${noAuth.status}`);

  const res = await request('POST', '/harvests/create', body, procMobile, 'MOBILE');
  if (assert('[Harvest] Created (201)', res.status === 201, res.data?.message)) {
    const h = unwrap(res.data)?.harvest || unwrap(res.data);
    STATE.harvestId = idOf(h);
    STATE.harvestNumber = h?.harvestNumber;
    assert('[Harvest] Has id', !!STATE.harvestId, STATE.harvestId);
    assert('[Harvest] Has number', !!STATE.harvestNumber, STATE.harvestNumber);
  }

  const buyerTok = STATE.tokens.buyer_MOBILE;
  if (buyerTok) {
    const blocked = await request('POST', '/harvests/create', body, buyerTok, 'MOBILE');
    assert('[Harvest] Buyer cannot create', blocked.status === 403 || blocked.status === 401, `HTTP ${blocked.status}`);
  }
}

// ─── PHASE 4 — Farmer confirm ────────────────────────────
async function phase4() {
  header('PHASE 4 — Farmer Confirm (CONFIRMED)');
  const adminWeb = STATE.tokens.superAdmin_WEB;
  if (!STATE.harvestId || !adminWeb) {
    assert('Confirm', false, 'No harvest or admin token', true);
    return;
  }

  const res = await request(
    'PATCH',
    `/harvests/approve/${STATE.harvestId}`,
    { status: 'CONFIRMED' },
    adminWeb,
    'WEB'
  );
  if (assert('[Confirm] Approved (200)', res.status === 200, res.data?.message)) {
    const h = unwrap(res.data)?.harvest || unwrap(res.data);
    assert('[Confirm] Status CONFIRMED', h?.status === 'CONFIRMED', h?.status);
  }
}

// ─── PHASE 5 — Net rate ────────────────────────────────────
async function phase5() {
  header('PHASE 5 — Net Rate / Purchase Invoice');
  const procMobile = STATE.tokens.procurement_MOBILE;
  if (!STATE.harvestId || !procMobile) {
    assert('Net rate', false, 'Skip', true);
    return;
  }

  const body = {
    productRates: [{ productId: STATE.productId, rate: 500 }],
    tds: 500,
    commission: 1000,
    soft: 200,
    deductionTransport: 300,
    deductionOther: 0,
  };

  const res = await request('POST', `/harvests/net-rate/${STATE.harvestId}`, body, procMobile, 'MOBILE');
  assert('[NetRate] Saved', res.status === 200, res.data?.message || `HTTP ${res.status}`);
}

// ─── PHASE 6 — Tapal ─────────────────────────────────────
async function phase6() {
  header('PHASE 6 — Tapal from Harvest');
  const procMobile = STATE.tokens.procurement_MOBILE;
  const adminWeb = STATE.tokens.superAdmin_WEB;
  if (!STATE.harvestId || !procMobile) {
    assert('Tapal', false, 'Skip', true);
    return;
  }

  const res = await request(
    'POST',
    '/tapals/create-from-harvest',
    { harvestId: STATE.harvestId },
    procMobile,
    'MOBILE'
  );
  if (assert('[Tapal] Created (201)', res.status === 201, res.data?.message)) {
    const t = unwrap(res.data)?.tapal || unwrap(res.data);
    STATE.tapalId = idOf(t);
    STATE.tapalNumber = t?.tapalNumber;
    assert('[Tapal] Has id', !!STATE.tapalId, STATE.tapalId);
    assert('[Tapal] Has PUR number', !!STATE.tapalNumber, STATE.tapalNumber);
  }

  if (STATE.tapalId && adminWeb) {
    const link = await request(
      'PATCH',
      `/tapals/${STATE.tapalId}`,
      { buyerPhone: USERS.buyer.phone, destination: 'Mangalore Market' },
      adminWeb,
      'WEB'
    );
    assert('[Tapal] Buyer phone linked', link.status === 200, link.data?.message);
  }

  if (adminWeb) {
    const list = await request('GET', '/tapals/all', null, adminWeb, 'WEB');
    assert('[Tapal] Admin list', list.status === 200, `HTTP ${list.status}`);
  }
}

// ─── PHASE 7 — Assign driver ─────────────────────────────
async function phase7() {
  header('PHASE 7 — Assign Driver');
  const adminWeb = STATE.tokens.superAdmin_WEB;
  if (!STATE.tapalId || !STATE.driverUserId || !adminWeb) {
    assert('Assign', false, 'Skip', true);
    return;
  }

  const res = await request(
    'PATCH',
    '/tapals/assign-driver',
    {
      tapalId: STATE.tapalId,
      driverId: STATE.driverUserId,
      vehicleId: STATE.vehicleId || undefined,
    },
    adminWeb,
    'WEB'
  );
  if (assert('[Assign] Driver assigned (200)', res.status === 200, res.data?.message)) {
    const payload = unwrap(res.data);
    STATE.tripId = idOf(payload?.trip) || payload?.tripId;
    assert('[Assign] Trip spawned', !!STATE.tripId, STATE.tripId);
  }

  const driverToken = STATE.tokens.driver_MOBILE;
  if (driverToken) {
    const blocked = await request(
      'PATCH',
      '/tapals/assign-driver',
      { tapalId: STATE.tapalId, driverId: STATE.driverUserId },
      driverToken,
      'MOBILE'
    );
    assert('[Assign] Driver cannot assign', blocked.status === 403 || blocked.status === 401, `HTTP ${blocked.status}`);
  }
}

// ─── PHASE 8 — Driver trip ─────────────────────────────────
async function phase8() {
  header('PHASE 8 — Driver Trip (Start → Pickup → Deliver)');
  const driverToken = STATE.tokens.driver_MOBILE;
  if (!driverToken || !STATE.tapalId) {
    assert('Driver trip', false, 'Skip', true);
    return;
  }

  const trips = await request('GET', '/tapals/my-trips', null, driverToken, 'MOBILE');
  if (assert('[Trip] my-trips (200)', trips.status === 200, trips.data?.message)) {
    const list = unwrap(trips.data);
    const arr = Array.isArray(list) ? list : [];
    assert('[Trip] Driver has at least 1 trip', arr.length > 0, `count=${arr.length}`);
    if (!STATE.tripId && arr[0]) STATE.tripId = idOf(arr[0]);
  }

  const start = await request(
    'PATCH',
    '/tapals/start-trip',
    {
      tapalId: STATE.tapalId,
      startMeterPhotoUrl: 'data:image/png;base64,e2e',
      startOdometerKm: 1000,
    },
    driverToken,
    'MOBILE'
  );
  assert('[Trip] Started', start.status === 200, start.data?.message);

  const pickup = await request(
    'PATCH',
    '/tapals/pickup',
    { tapalId: STATE.tapalId, actualPickupQty: 98 },
    driverToken,
    'MOBILE'
  );
  assert('[Trip] Pickup', pickup.status === 200, pickup.data?.message);

  const deliver = await request(
    'PATCH',
    '/tapals/deliver',
    {
      tapalId: STATE.tapalId,
      actualDeliveredQty: 97,
      proofPhotoUrl: '',
      signatureUrl: '',
    },
    driverToken,
    'MOBILE'
  );
  assert('[Trip] Delivered', deliver.status === 200, deliver.data?.message);
}

// ─── PHASE 9 — End trip (admin) ──────────────────────────
async function phase9() {
  header('PHASE 9 — Admin End Trip');
  const adminWeb = STATE.tokens.superAdmin_WEB;
  if (!STATE.tapalId || !adminWeb) {
    assert('End trip', false, 'Skip', true);
    return;
  }

  const res = await request('PATCH', '/tapals/end-trip', { tapalId: STATE.tapalId }, adminWeb, 'WEB');
  assert('[EndTrip] Closed', res.status === 200, res.data?.message);
}

// ─── PHASE 10 — Buyer verify + bill ──────────────────────
async function phase10() {
  header('PHASE 10 — Buyer Verify + Bill');
  const buyerToken = STATE.tokens.buyer_MOBILE;
  const buyerPlatform = 'MOBILE';
  if (!buyerToken || !STATE.tapalId) {
    assert('Buyer', false, 'Run: npm run seed:e2e (buyer 9000000002)', true);
    return;
  }

  const list = await request('GET', '/buyer-portal/assigned-tapals', null, buyerToken, buyerPlatform);
  assert('[Buyer] Assigned tapals list', list.status === 200, list.data?.message);

  const verify = await request(
    'POST',
    `/buyer-portal/verify/${STATE.tapalId}`,
    {
      dispatchedQty: { weight: 97, noOfBoxes: 5 },
      receivedQty: { weight: 95, noOfBoxes: 5 },
      buyerRemarks: 'E2E verify',
    },
    buyerToken,
    buyerPlatform
  );
  assert('[Buyer] Verification submitted', verify.status === 200, verify.data?.message);

  const bill = await request(
    'POST',
    `/buyer-portal/bill/${STATE.tapalId}`,
    { ratePerKg: 600, finalWeight: 95, item: 'PRAWNS' },
    buyerToken,
    buyerPlatform
  );
  if (assert('[Buyer] Bill created', bill.status === 200 || bill.status === 201, bill.data?.message)) {
    const b = unwrap(bill.data)?.bill || unwrap(bill.data);
    STATE.billId = idOf(b);
    assert('[Buyer] Bill id', !!STATE.billId, STATE.billId);
  }

  const bills = await request('GET', '/buyer-portal/bills', null, buyerToken, buyerPlatform);
  assert('[Buyer] Bills list', bills.status === 200, bills.data?.message);
}

// ─── PHASE 11 — Access control (register user) ───────────
async function phase11() {
  header('PHASE 11 — Create Driver via /auth/register');
  STATE.newDriverPhone = '9' + String(Math.floor(100000000 + Math.random() * 900000000));

  const res = await request('POST', '/auth/register', {
    fullName: 'E2E Auto Driver',
    phone: STATE.newDriverPhone,
    password: 'e2e_new_driver_99',
    role: 'DRIVER',
  });

  if (assert('[Access] Register new driver', res.status === 201 || res.status === 200, res.data?.message)) {
    const loginRes = await request('POST', '/auth/login', {
      phone: STATE.newDriverPhone,
      password: 'e2e_new_driver_99',
    }, null, 'MOBILE');
    assert('[Access] New driver can login', loginRes.status === 200, loginRes.data?.message);
  }

  const dup = await request('POST', '/auth/register', {
    fullName: 'Dup',
    phone: STATE.newDriverPhone,
    password: 'e2e_new_driver_99',
    role: 'DRIVER',
  });
  assert('[Access] Duplicate phone rejected', dup.status === 400, dup.data?.message);
}

// ─── PHASE 12 — Security smoke ───────────────────────────
async function phase12() {
  header('PHASE 12 — Security Smoke');
  const fake = await request('GET', '/harvests/all', null, 'invalid.token.here', 'WEB');
  assert('[Security] Bad token rejected', fake.status === 401, `HTTP ${fake.status}`);

  const driverToken = STATE.tokens.driver_MOBILE;
  if (driverToken) {
    const r = await request('GET', '/harvests/all', null, driverToken, 'MOBILE');
    assert('[Security] Driver cannot list harvests (web)', r.status === 403 || r.status === 401, `HTTP ${r.status}`);
  }
}

function printSummary() {
  const total = PASS + FAIL + SKIP;
  const scored = total - SKIP;
  const pct = scored > 0 ? Math.round((PASS / scored) * 100) : 0;

  log(`\n${'═'.repeat(60)}`, 'cyan');
  log('  TEST SUMMARY', 'bold');
  log('═'.repeat(60), 'cyan');
  log(`  PASS: ${PASS}`, 'green');
  log(`  FAIL: ${FAIL}`, FAIL > 0 ? 'red' : 'green');
  log(`  SKIP: ${SKIP}`, 'yellow');
  log(`  Score: ${pct}%`, pct >= 80 ? 'green' : 'yellow');
  log('═'.repeat(60), 'cyan');

  if (FAIL > 0) {
    log('\n  Failed:', 'red');
    RESULTS.filter((r) => r.result === 'FAIL').forEach((r) => log(`    ✗ ${r.name} — ${r.detail}`, 'red'));
  }

  log('\n  IDs:', 'magenta');
  for (const [k, v] of Object.entries(STATE)) {
    if (k !== 'tokens' && v) log(`    ${k}: ${v}`, 'magenta');
  }
  log('');
}

async function main() {
  log('\n█ Golden Fisheries E2E (API-aligned)', 'cyan');
  log(`  ${new Date().toLocaleString()}`, 'yellow');
  log(`  ${BASE}\n`, 'yellow');

  try {
    await phase0();
    await phase1();
    await phase2();
    await phase3();
    await phase4();
    await phase5();
    await phase6();
    await phase7();
    await phase8();
    await phase9();
    await phase10();
    await phase11();
    await phase12();
  } catch (e) {
    log(`\nFATAL: ${e.message}`, 'red');
    console.error(e);
  }

  printSummary();
  process.exit(FAIL > 0 ? 1 : 0);
}

main();
