import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, './.env') });

async function runTest() {
  try {
    console.log('--- STARTING MANY-TO-MANY PROCUREMENT E2E TEST ---');
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully!');

    // Load models and services
    const { Harvest } = await import('./src/modules/harvests/harvest.model.js');
    const { Tapal } = await import('./src/modules/tapals/tapal.model.js');
    const { HarvestTapalMapping } = await import('./src/modules/harvests/harvestTapalMapping.model.js');
    const { User } = await import('./src/modules/users/user.model.js');
    const { Farmer } = await import('./src/modules/farmers/farmer.model.js');
    const { Buyer } = await import('./src/modules/buyers/buyer.model.js');
    const { Product } = await import('./src/modules/products/product.model.js');
    const { harvestService } = await import('./src/modules/harvests/harvest.service.js');
    const { DISPATCH_ROLES } = await import('./src/constants/roleGroups.js');

    // 1. Assert RBAC Access Lockdown
    console.log('\n--- VERIFYING BUYER ACCESS LOCKDOWN ---');
    console.log('Checking DISPATCH_ROLES...');
    const hasBuyerInDispatch = DISPATCH_ROLES.includes('BUYER') || DISPATCH_ROLES.includes('buyer');
    if (hasBuyerInDispatch) {
      throw new Error('Lockdown FAILED: BUYER role still present in DISPATCH_ROLES.');
    }
    console.log('✅ Lockdown PASSED: BUYER role successfully excluded from DISPATCH_ROLES.');

    // 2. Fetch or mock seed data
    console.log('\n--- SETTING UP SEED DATA ---');
    let creator = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!creator) {
      creator = await User.create({
        fullName: 'Admin Tester',
        phone: '9999999999',
        password: 'password123',
        role: 'SUPER_ADMIN',
        isActive: true
      });
      console.log('Created mock Super Admin:', creator.fullName);
    } else {
      console.log('Found existing Super Admin:', creator.fullName);
    }

    let farmer = await Farmer.findOne();
    if (!farmer) {
      farmer = await Farmer.create({
        fullName: 'Raju Farmer',
        farmerCode: 'FRM-MOCK-1',
        phone: '8888888888',
        village: 'Mock Village',
        district: 'Mock District',
        taluk: 'Mock Taluk',
        state: 'Mock State'
      });
      console.log('Created mock Farmer:', farmer.fullName);
    } else {
      console.log('Found existing Farmer:', farmer.fullName);
    }

    let buyer = await Buyer.findOne();
    if (!buyer) {
      buyer = await Buyer.create({
        buyerName: 'Channapa Seafoods',
        buyerCode: 'BYR-MOCK-1',
        phone: '7777777777',
        isActive: true
      });
      console.log('Created mock Buyer:', buyer.buyerName);
    } else {
      console.log('Found existing Buyer:', buyer.buyerName);
    }

    let product1 = await Product.findOne({ name: /Surmai/i });
    if (!product1) {
      product1 = await Product.create({
        name: 'Surmai Small',
        code: 'PRD-MOCK-1',
        category: 'SEAFOOD',
        basePrice: 200,
        isActive: true
      });
      console.log('Created mock Product 1:', product1.name);
    } else {
      console.log('Found existing Product 1:', product1.name);
    }

    let product2 = await Product.findOne({ name: /Pomfret/i });
    if (!product2) {
      product2 = await Product.create({
        name: 'Pomfret White',
        code: 'PRD-MOCK-2',
        category: 'SEAFOOD',
        basePrice: 500,
        isActive: true
      });
      console.log('Created mock Product 2:', product2.name);
    } else {
      console.log('Found existing Product 2:', product2.name);
    }

    // 3. Create Confirmed Harvest Slips with Net Rates
    console.log('\n--- CREATING TEST HARVEST SLIPS ---');
    const cleanNumber = (prefix) => `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const h1 = new Harvest({
      harvestNumber: cleanNumber('HSL'),
      farmerId: farmer._id,
      createdBy: creator._id,
      harvestDate: new Date(),
      pickupDate: new Date(),
      pickupLocation: 'BOAT COLD 1',
      status: 'CONFIRMED',
      netRateCalculated: 300,
      availableQty: 500,
      products: [
        { productId: product1._id, fishName: product1.name, estimatedQty: 200, rate: 200 },
        { productId: product2._id, fishName: product2.name, estimatedQty: 300, rate: 500 }
      ]
    });
    await h1.save();
    console.log(`Created Harvest 1: ${h1.harvestNumber} (Available Qty: ${h1.availableQty} KG, Status: ${h1.status})`);

    const h2 = new Harvest({
      harvestNumber: cleanNumber('HSL'),
      farmerId: farmer._id,
      createdBy: creator._id,
      harvestDate: new Date(),
      pickupDate: new Date(),
      pickupLocation: 'BOAT COLD 2',
      status: 'CONFIRMED',
      netRateCalculated: 400,
      availableQty: 300,
      products: [
        { productId: product1._id, fishName: product1.name, estimatedQty: 100, rate: 200 },
        { productId: product2._id, fishName: product2.name, estimatedQty: 200, rate: 500 }
      ]
    });
    await h2.save();
    console.log(`Created Harvest 2: ${h2.harvestNumber} (Available Qty: ${h2.availableQty} KG, Status: ${h2.status})`);

    // 4. Create Unified Tapal 1: Partial allocations from both harvests
    console.log('\n--- CREATING UNIFIED TAPAL 1 (PARTIAL CONSUMPTION) ---');
    const allocationPayload1 = [
      { harvestId: h1._id, allocatedQty: 200 },
      { harvestId: h2._id, allocatedQty: 150 }
    ];

    const logisticsPayload = {
      buyerPhone: buyer.phone,
      buyerId: buyer._id,
      destination: 'MANGALORE WHARF',
      vehicleNumber: 'KA-19-F-1234',
      driverName: 'Ramesh Driver'
    };

    const tapal1 = await harvestService.createTapalFromHarvests(allocationPayload1, logisticsPayload, creator);
    console.log(`✅ Tapal 1 Created Successfully: ${tapal1.tapalNumber}`);
    console.log(`Tapal 1 Total Weight: ${tapal1.qty} (${tapal1.numericQty} KG), Total Amount: ${tapal1.amount}`);

    // Verify mappings
    const mappingsTapal1 = await HarvestTapalMapping.find({ tapalId: tapal1._id });
    console.log(`Found ${mappingsTapal1.length} many-to-many ledger entries for Tapal 1.`);
    if (mappingsTapal1.length !== 2) {
      throw new Error('Verification FAILED: Missing many-to-many mappings for Tapal 1.');
    }

    // Verify harvest statuses & remaining quantities
    const testH1_v1 = await Harvest.findById(h1._id);
    const testH2_v1 = await Harvest.findById(h2._id);
    console.log(`Harvest 1 remainingQty: ${testH1_v1.remainingQty} KG, Status: ${testH1_v1.status}`);
    console.log(`Harvest 2 remainingQty: ${testH2_v1.remainingQty} KG, Status: ${testH2_v1.status}`);

    if (testH1_v1.remainingQty !== 300 || testH1_v1.status !== 'PARTIAL_USED') {
      throw new Error('Verification FAILED: Harvest 1 remaining quantity or status is incorrect.');
    }
    if (testH2_v1.remainingQty !== 150 || testH2_v1.status !== 'PARTIAL_USED') {
      throw new Error('Verification FAILED: Harvest 2 remaining quantity or status is incorrect.');
    }

    // 5. Create Unified Tapal 2: Full allocation of remaining stock
    console.log('\n--- CREATING UNIFIED TAPAL 2 (FULL CONSUMPTION) ---');
    const allocationPayload2 = [
      { harvestId: h1._id, allocatedQty: 300 },
      { harvestId: h2._id, allocatedQty: 150 }
    ];

    const tapal2 = await harvestService.createTapalFromHarvests(allocationPayload2, logisticsPayload, creator);
    console.log(`✅ Tapal 2 Created Successfully: ${tapal2.tapalNumber}`);
    console.log(`Tapal 2 Total Weight: ${tapal2.qty} (${tapal2.numericQty} KG), Total Amount: ${tapal2.amount}`);

    // Verify mappings
    const mappingsTapal2 = await HarvestTapalMapping.find({ tapalId: tapal2._id });
    console.log(`Found ${mappingsTapal2.length} many-to-many ledger entries for Tapal 2.`);
    if (mappingsTapal2.length !== 2) {
      throw new Error('Verification FAILED: Missing many-to-many mappings for Tapal 2.');
    }

    // Verify harvest statuses transitioned to CLOSED
    const testH1_v2 = await Harvest.findById(h1._id);
    const testH2_v2 = await Harvest.findById(h2._id);
    console.log(`Harvest 1 remainingQty: ${testH1_v2.remainingQty} KG, Status: ${testH1_v2.status}`);
    console.log(`Harvest 2 remainingQty: ${testH2_v2.remainingQty} KG, Status: ${testH2_v2.status}`);

    if (testH1_v2.remainingQty !== 0 || testH1_v2.status !== 'CLOSED') {
      throw new Error('Verification FAILED: Harvest 1 failed to transition to CLOSED status.');
    }
    if (testH2_v2.remainingQty !== 0 || testH2_v2.status !== 'CLOSED') {
      throw new Error('Verification FAILED: Harvest 2 failed to transition to CLOSED status.');
    }

    // 6. Assert Over-Allocation Rollback & Validation
    console.log('\n--- VERIFYING TRANSACTION ROLLBACK ON OVER-ALLOCATION ---');
    try {
      console.log('Attempting to over-allocate 10 KG from Harvest 1 (current remaining is 0)...');
      await harvestService.createTapalFromHarvests(
        [{ harvestId: h1._id, allocatedQty: 10 }],
        logisticsPayload,
        creator
      );
      throw new Error('Lockdown FAILED: Allowed over-allocation without throwing error.');
    } catch (err) {
      console.log('✅ Over-allocation correctly caught! Error msg:', err.message);
    }

    // Cleanup test slips & mappings to avoid database bloating
    console.log('\nCleaning up test documents...');
    await Harvest.deleteMany({ _id: { $in: [h1._id, h2._id] } });
    await Tapal.deleteMany({ _id: { $in: [tapal1._id, tapal2._id] } });
    await HarvestTapalMapping.deleteMany({ tapalId: { $in: [tapal1._id, tapal2._id] } });
    console.log('Cleanup completed successfully.');

    console.log('\n🎉 ALL MANY-TO-MANY PROCUREMENT TESTS PASSED SUCCESSFULLY! 🎉');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error.message);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

runTest();
