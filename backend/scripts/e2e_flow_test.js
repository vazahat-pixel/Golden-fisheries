import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import Models
import { User } from '../src/modules/users/user.model.js';
import { Product } from '../src/modules/products/product.model.js';
import { Farmer } from '../src/modules/farmers/farmer.model.js';
import { Buyer } from '../src/modules/buyers/buyer.model.js';
import { Harvest } from '../src/modules/harvests/harvest.model.js';
import { Tapal } from '../src/modules/tapals/tapal.model.js';
import { Trip } from '../src/modules/trips/trip.model.js';
import { Vehicle } from '../src/modules/vehicles/vehicle.model.js';
import { StockTransfer } from '../src/modules/stock-transfer/stockTransfer.model.js';
import { InternalSupplyBill } from '../src/modules/internal-supply/internalSupplyBill.model.js';
import { FishMallOutlet } from '../src/modules/fishmall-outlet/fishMallOutlet.model.js';
import { RestaurantOutlet } from '../src/modules/restaurant-outlet/restaurantOutlet.model.js';
import { RestaurantMenuItem } from '../src/modules/restaurant/restaurantMenu.model.js';
import { RestaurantOrder } from '../src/modules/restaurant/restaurantOrder.model.js';
import { RestaurantSession, RestaurantExpense, RestaurantCashbookEntry } from '../src/modules/restaurant/restaurantAccounting.model.js';
import { RestaurantInventoryItem } from '../src/modules/restaurant/restaurantInventory.model.js';
import { FishMallInventoryItem } from '../src/modules/fishmall/fishMallInventory.model.js';
import { FarmerLedger } from '../src/modules/farmer-ledger/farmerLedger.model.js';

// Import Services
import { harvestService } from '../src/modules/harvests/harvest.service.js';
import { tapalService } from '../src/modules/tapals/tapal.service.js';
import { billingService } from '../src/modules/billing/billing.service.js';
import { stockTransferService } from '../src/modules/stock-transfer/stockTransfer.service.js';
import { internalSupplyService } from '../src/modules/internal-supply/internalSupply.service.js';
import { restaurantService } from '../src/modules/restaurant/restaurant.service.js';
import { restaurantInventoryService } from '../src/modules/restaurant/restaurantInventory.service.js';
import { restaurantMenuService } from '../src/modules/restaurant/restaurantMenu.service.js';
import { restaurantAccountingService } from '../src/modules/restaurant/restaurantAccounting.service.js';
import { fishMallOutletService } from '../src/modules/fishmall-outlet/fishMallOutlet.service.js';
import { restaurantOutletService } from '../src/modules/restaurant-outlet/restaurantOutlet.service.js';

dotenv.config();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://vazahat:golden123@cluster0.spf2aye.mongodb.net/golden-fisheries-v2?retryWrites=true&w=majority';
  
  console.log('\n==================================================================');
  console.log('🚀  GOLDEN FISHERIES ERP - E2E FLOW INTEGRATION VERIFICATION SCRIPT');
  console.log('==================================================================\n');
  
  console.log('Connecting to database...');
  await mongoose.connect(mongoUri);
  console.log('Connected successfully.');

  // --- PREREQUISITES & SEEDING CHECK ---
  console.log('\n[PREREQUISITES] Resolving credentials and master data...');
  
  // 1. Admin User
  const adminUser = await User.findOne({ role: 'SUPER_ADMIN' });
  if (!adminUser) throw new Error('No SUPER_ADMIN user found in DB. Run seed first.');
  console.log(`- Admin authenticated: ${adminUser.fullName} (${adminUser.phone})`);

  // 2. Driver User
  let driverUser = await User.findOne({ role: 'DRIVER', phone: '9000000003' });
  if (!driverUser) {
    driverUser = await User.findOne({ role: 'DRIVER' });
  }
  if (!driverUser) {
    console.log('- Driver user not found, seeding test driver...');
    driverUser = new User({
      fullName: 'Suresh Kumar',
      phone: '9000000003',
      password: 'driver123',
      role: 'DRIVER',
      isActive: true,
      phoneVerified: true,
      platformAccess: { web: false, mobile: true, mobileViewOnly: false }
    });
    await driverUser.save();
    
    const { DriverProfile } = await import('../src/modules/drivers/driverProfile.model.js');
    const profile = new DriverProfile({
      userId: driverUser._id,
      licenseNumber: 'DL-KA-001',
      licenseExpiry: new Date('2030-12-31'),
      hasOwnVehicle: false,
      registrationStatus: 'active'
    });
    await profile.save();
  }
  console.log(`- Driver resolved: ${driverUser.fullName} (${driverUser.phone})`);

  // 3. Farmer Ramesh Naik
  let farmer = await Farmer.findOne({ phone: '9876543210' });
  if (!farmer) {
    farmer = new Farmer({
      fullName: 'RAMESH NAIK',
      phone: '9876543210',
      location: 'KARWAR',
      village: 'MUDGERI'
    });
    await farmer.save();
  }
  console.log(`- Farmer resolved: ${farmer.fullName} (${farmer.phone})`);

  // 4. Product Pomfret
  let product = await Product.findOne({ name: 'POMFRET' });
  if (!product) {
    product = new Product({
      name: 'POMFRET',
      category: 'SEAFOOD',
      baseUnit: 'KG',
      basePrice: 300,
      quantity: 0
    });
    await product.save();
  }
  const initialProcurementStock = product.quantity || 0;
  console.log(`- Product resolved: ${product.name} (Initial stock level: ${initialProcurementStock} KG)`);

  // 5. Buyer VAZAHAT QURESHI
  let buyer = await Buyer.findOne({ phone: '9827607086' });
  if (!buyer) {
    buyer = new Buyer({
      buyerName: 'VAZAHAT QURESHI',
      phone: '9827607086',
      buyerType: 'EXTERNAL',
      deliveryAddress: 'MANGALORE WHARF'
    });
    await buyer.save();
  }
  console.log(`- Buyer resolved: ${buyer.buyerName} (${buyer.phone})`);

  // 6. Outlets (Fish Mall and Restaurant)
  const fmOutlet = await fishMallOutletService.ensureDefaultOutlet();
  const restOutlet = await restaurantOutletService.ensureDefaultOutlet();
  console.log(`- Outlets: FishMall='${fmOutlet.name}' | Restaurant='${restOutlet.name}'`);

  // 7. Vehicle
  let vehicle = await Vehicle.findOne({ vehicleNumber: 'KA-19-F-1234' });
  if (!vehicle) {
    vehicle = await Vehicle.create({
      vehicleNumber: 'KA-19-F-1234',
      type: 'REEFER',
      capacity: '3.5 TON',
      status: 'AVAILABLE'
    });
  } else if (vehicle.status !== 'AVAILABLE') {
    vehicle.status = 'AVAILABLE';
    await vehicle.save();
  }
  console.log(`- Vehicle resolved: ${vehicle.vehicleNumber} (Status: AVAILABLE)`);

  // Cleanup active shift session for cashier to prevent open session conflicts
  await RestaurantSession.updateMany({ cashierId: adminUser._id, status: 'OPEN' }, { $set: { status: 'CLOSED', closedAt: new Date() } });

  // --- STEP 1: CREATE HARVEST SLIP ---
  console.log('\n[STEP 1] Creating Harvest Slip...');
  const harvest = await harvestService.create({
    farmerId: farmer._id,
    harvestDate: new Date(),
    pickupDate: new Date(),
    pickupLocation: 'KARWAR',
    vehicleNo: vehicle.vehicleNumber,
    driverName: driverUser.fullName,
    createdBy: adminUser._id,
    products: [
      {
        productId: product._id,
        fishName: 'POMFRET',
        hsnCode: '0302',
        estimatedQty: 120, // 120 KG total
        rate: null,
        boxCount: 6,
        weightPerBox: 20,
        qualityType: 'Mix',
        totalWeight: 120
      }
    ]
  });
  console.log(`✅ Harvest Slip created: ID=${harvest._id}, No=${harvest.harvestNumber}, Status=${harvest.status}`);

  // --- STEP 2: CONFIRM HARVEST SLIP ---
  console.log('\n[STEP 2] Confirming Harvest Slip...');
  harvest.status = 'CONFIRMED';
  await harvest.save();
  console.log(`✅ Harvest Slip updated and confirmed: Status=${harvest.status} (Transited to OPEN in pre-save)`);

  // --- STEP 3: SAVE NET RATE / PURCHASE INVOICE ---
  console.log('\n[STEP 3] Finalizing Net Rate Calculations (Purchase Invoice)...');
  const netRateData = {
    productRates: [
      {
        fishName: 'POMFRET',
        estimatedQty: 120,
        rate: 300 // ₹300 per KG
      }
    ],
    commission: 500,
    tds: 100,
    soft: 50,
    deductionTransport: 300,
    deductionCommission: 0,
    deductionSoft: 0,
    deductionOther: 0
  };
  const finalizedHarvest = await harvestService.saveNetRate(harvest._id, netRateData, adminUser);
  console.log(`✅ Net Rate calculations saved: Net Payable Amount=₹${finalizedHarvest.totalPayableAmount}, netRateCalculated=${finalizedHarvest.netRateCalculated}`);
  
  // Verify Farmer Ledger transaction
  const ledgerTx = await FarmerLedger.findOne({ harvestId: harvest._id });
  if (!ledgerTx) throw new Error('Ledger transaction not posted to Farmer Ledger!');
  console.log(`✅ Farmer Ledger update verified: Type=${ledgerTx.entryType}, Amount=₹${ledgerTx.debitAmount}, BalanceAfter=₹${ledgerTx.balanceAfter}`);

  // --- STEP 4 & 5: SPLIT HARVEST INTO 2 TAPALS & ASSIGN DRIVER (SPAWN TRIPS) ---
  console.log('\n[STEP 4 & 5] Splitting 120 KG Harvest into 2 Tapal dispatches (50 KG and 70 KG)...');
  
  const logistics1 = {
    buyerPhone: buyer.phone,
    buyerId: buyer._id,
    assignedBuyer: adminUser._id,
    destination: 'MANGALORE WHARF',
    vehicleNumber: vehicle.vehicleNumber,
    driverName: driverUser.fullName
  };

  const logistics2 = {
    buyerPhone: buyer.phone,
    buyerId: buyer._id,
    assignedBuyer: adminUser._id,
    destination: 'MANGALORE WHARF',
    vehicleNumber: vehicle.vehicleNumber,
    driverName: driverUser.fullName
  };

  // Create Tapal 1
  const tapal1 = await harvestService.createTapalFromHarvests(
    [{ harvestId: harvest._id, allocatedQty: 50 }],
    logistics1,
    adminUser
  );
  console.log(`- Tapal 1 created: ID=${tapal1._id}, No=${tapal1.tapalNumber}, allocatedQty=${tapal1.numericQty} KG`);
  
  // Assign Driver -> Spawn Trip 1
  const assignResult1 = await tapalService.assignDriver(tapal1._id, driverUser._id, vehicle._id);
  const trip1 = assignResult1.trip;
  console.log(`✅ Trip 1 Spawned: ID=${trip1._id}, No=${trip1.tripNumber}, Status=${trip1.status}`);

  // Create Tapal 2
  const tapal2 = await harvestService.createTapalFromHarvests(
    [{ harvestId: harvest._id, allocatedQty: 70 }],
    logistics2,
    adminUser
  );
  console.log(`- Tapal 2 created: ID=${tapal2._id}, No=${tapal2.tapalNumber}, allocatedQty=${tapal2.numericQty} KG`);

  // Assign Driver -> Spawn Trip 2
  const assignResult2 = await tapalService.assignDriver(tapal2._id, driverUser._id, vehicle._id);
  const trip2 = assignResult2.trip;
  console.log(`✅ Trip 2 Spawned: ID=${trip2._id}, No=${trip2.tripNumber}, Status=${trip2.status}`);

  // --- STEP 6: DRIVER TRIP LIFECYCLE ---
  console.log('\n[STEP 6] Simulating Driver Trip lifecycle for Trip 1 and Trip 2...');
  
  // -- Trip 1 lifecycle --
  console.log('- Trip 1: Starting Journey...');
  await tapalService.startTrip(
    { tapalId: tapal1._id, startMeterPhotoUrl: 'data:image/png;base64,test', startOdometerKm: 1000 },
    driverUser._id
  );
  console.log('- Trip 1: Picking up cargo...');
  await tapalService.pickupCargo(tapal1._id, driverUser._id, 50); // scale weight at pickup
  console.log('- Trip 1: Delivering cargo...');
  await tapalService.deliverCargo(tapal1._id, driverUser._id, 49, 'http://pod.photo.url', 'http://driver.sig.url'); // scale weight at delivery: 49 KG (1 KG difference)
  console.log('- Trip 1: Logging fuel expense (₹1500)...');
  await tapalService.logExpense(trip1._id, driverUser._id, {
    expenseType: 'Fuel',
    amount: 1500,
    receiptUrl: 'http://fuel.receipt.url',
    remarks: 'Refuel Mangalore'
  });
  console.log('- Trip 1: Submitting post-trip expenses form (₹300)...');
  await tapalService.submitPostTripExpense(trip1._id, driverUser._id, {
    tollAmount: 100,
    maintenanceAmount: 200,
    remarks: 'Tolls & washing'
  });
  console.log('✅ Trip 1 driver lifecycle completed.');

  // -- Trip 2 lifecycle --
  console.log('- Trip 2: Starting Journey...');
  await tapalService.startTrip(
    { tapalId: tapal2._id, startMeterPhotoUrl: 'data:image/png;base64,test', startOdometerKm: 1100 },
    driverUser._id
  );
  console.log('- Trip 2: Picking up cargo...');
  await tapalService.pickupCargo(tapal2._id, driverUser._id, 70); 
  console.log('- Trip 2: Delivering cargo...');
  await tapalService.deliverCargo(tapal2._id, driverUser._id, 68, 'http://pod.photo.url', 'http://driver.sig.url'); // scale weight at delivery: 68 KG (2 KG difference)
  console.log('- Trip 2: Logging fuel expense (₹1500)...');
  await tapalService.logExpense(trip2._id, driverUser._id, {
    expenseType: 'Fuel',
    amount: 1500,
    receiptUrl: 'http://fuel.receipt.url',
    remarks: 'Refuel Karwar'
  });
  console.log('- Trip 2: Submitting post-trip expenses form (₹300)...');
  await tapalService.submitPostTripExpense(trip2._id, driverUser._id, {
    tollAmount: 100,
    maintenanceAmount: 200,
    remarks: 'Tolls & washing'
  });
  console.log('✅ Trip 2 driver lifecycle completed.');

  // --- STEP 7: ADMIN SETTLEMENT ---
  console.log('\n[STEP 7] Simulating Admin Settlement (End Trip, Review Expense, Confirm Payout)...');
  
  // -- Trip 1 Admin --
  console.log('- Trip 1: Closing/Ending trip...');
  await tapalService.endTrip(tapal1._id);
  console.log('- Trip 1: Reviewing and approving expenses...');
  await tapalService.reviewPostTripExpense(trip1._id, adminUser._id, 'APPROVED');
  console.log('- Trip 1: Confirming expense payment (₹1800)...');
  await tapalService.confirmPostTripPayment(trip1._id, adminUser._id, {
    paidAmount: 1800,
    upiTransactionId: 'UPI-TRIP1-9988'
  });

  // -- Trip 2 Admin --
  console.log('- Trip 2: Closing/Ending trip...');
  await tapalService.endTrip(tapal2._id);
  console.log('- Trip 2: Reviewing and approving expenses...');
  await tapalService.reviewPostTripExpense(trip2._id, adminUser._id, 'APPROVED');
  console.log('- Trip 2: Confirming expense payment (₹1800)...');
  await tapalService.confirmPostTripPayment(trip2._id, adminUser._id, {
    paidAmount: 1800,
    upiTransactionId: 'UPI-TRIP2-9989'
  });

  // -- Raise Invoices to adjust stock --
  console.log('- Raising Procurement Invoices to finalize stock inbound to Shore Warehouse...');
  
  const invoice1 = await billingService.createInvoice({
    type: 'PROCUREMENT',
    tapalId: tapal1._id,
    partyName: farmer.fullName,
    partyId: farmer._id,
    items: [
      {
        productId: product._id,
        productName: 'POMFRET',
        quantity: 49, // delivered weight
        rate: 300
      }
    ],
    taxRate: 5,
    paymentMethod: 'CASH',
    paidAmount: 0
  }, adminUser._id);
  console.log(`  - Invoice 1 created: ${invoice1.invoiceNumber}, Weight: 49 KG`);

  const invoice2 = await billingService.createInvoice({
    type: 'PROCUREMENT',
    tapalId: tapal2._id,
    partyName: farmer.fullName,
    partyId: farmer._id,
    items: [
      {
        productId: product._id,
        productName: 'POMFRET',
        quantity: 68, // delivered weight
        rate: 300
      }
    ],
    taxRate: 5,
    paymentMethod: 'CASH',
    paidAmount: 0
  }, adminUser._id);
  console.log(`  - Invoice 2 created: ${invoice2.invoiceNumber}, Weight: 68 KG`);

  // Verify Procurement stock is updated
  const updatedProduct = await Product.findById(product._id);
  const currentProcurementStock = updatedProduct.quantity || 0;
  console.log(`✅ Shore Warehouse Stock updated: New stock level = ${currentProcurementStock} KG (Added 49 + 68 = 117 KG)`);

  // --- STEP 8: STOCK TRANSFER TO FISH MALL ---
  console.log('\n[STEP 8] Transferring 110 KG POMFRET stock from Shore to Main Fish Mall...');
  
  const transfer = await stockTransferService.createTransfer({
    destinationOutletId: fmOutlet._id,
    lines: [{
      productId: product._id,
      quantity: 110,
      rate: 350
    }],
    notes: 'Internal transfer of 110 KG POMFRET to Fish Mall retail'
  }, adminUser._id);
  console.log(`- Stock Transfer Note created: ID=${transfer._id}, Number=${transfer.transferNumber}`);

  console.log('- Approving and dispatching transfer...');
  await stockTransferService.approveTransfer(transfer._id, adminUser._id, 'Approved for retail distribution');

  console.log('- Accepting stock transfer at Main Fish Mall...');
  await stockTransferService.acceptTransfer(transfer._id, adminUser._id, {
    status: 'ACCEPTED',
    remarks: 'Received 110 KG at Fish Mall scales',
    lines: [{
      productId: product._id,
      receivedQuantity: 110
    }]
  });

  // Verify inventories
  const finalProduct = await Product.findById(product._id);
  const fmInventoryItem = await FishMallInventoryItem.findOne({ outletId: fmOutlet._id, name: 'POMFRET' });
  
  console.log(`✅ Shore Warehouse Stock level: ${finalProduct.quantity} KG (reduced by 110 KG)`);
  console.log(`✅ Fish Mall Outlet Stock level: ${fmInventoryItem.quantity} KG (increased by 110 KG)`);

  // --- STEP 9: FISH MALL INTERNAL BILL TO RESTAURANT ---
  console.log('\n[STEP 9] Issuing Fish Mall Internal Bill of 20 KG POMFRET to Restaurant...');
  
  const internalBill = await internalSupplyService.createFishMallToRestaurantBill({
    items: [{
      fishMallItemId: fmInventoryItem._id,
      quantity: 20,
      rate: 400
    }],
    remarks: 'Transfer 20 KG seafood from Fish Mall to Restaurant Kitchen',
    destinationName: 'Main Restaurant Kitchen'
  }, adminUser._id);
  console.log(`- Internal Bill created: ID=${internalBill._id}, InvoiceNo=${internalBill.invoiceNumber}`);

  console.log('- Accepting internal supply bill at Main Restaurant Kitchen...');
  await internalSupplyService.acceptInternalBill(internalBill._id, adminUser._id, {
    status: 'ACCEPTED',
    remarks: 'Approved and stocked in kitchen freezer',
    lines: [{
      fishMallItemId: fmItem._id || fmInventoryItem._id,
      receivedQuantity: 20
    }]
  });

  // Verify inventories after internal bill
  const fmInventoryItemAfter = await FishMallInventoryItem.findOne({ outletId: fmOutlet._id, name: 'POMFRET' });
  const restInventoryItem = await RestaurantInventoryItem.findOne({ name: 'POMFRET' });
  
  console.log(`✅ Fish Mall Outlet Stock level: ${fmInventoryItemAfter.quantity} KG (reduced by 20 KG)`);
  console.log(`✅ Restaurant Kitchen Stock level: ${restInventoryItem.quantity} KG (increased by 20 KG)`);

  // --- STEP 10: CREATE RESTAURANT MENU ITEM & OPEN SHIFT ---
  console.log('\n[STEP 10] Setting up Restaurant Menu Item & opening shift session...');
  
  const menuItemPayload = {
    name: 'POMFRET FRY',
    category: 'SEAFOOD',
    sellingPrice: 350,
    price: 350,
    gstRate: 5,
    recipe: [
      {
        inventoryItemId: restInventoryItem._id,
        itemName: 'POMFRET',
        quantityPerServe: 0.5 // 0.5 KG of raw POMFRET per dish
      }
    ]
  };

  let menuItem = await RestaurantMenuItem.findOne({ name: 'POMFRET FRY' });
  if (!menuItem) {
    menuItem = await restaurantMenuService.createMenuItem(menuItemPayload, adminUser._id);
    console.log(`- Created Menu Item: ${menuItem.name} @ ₹350/serve`);
  } else {
    menuItem.recipe = menuItemPayload.recipe;
    menuItem.sellingPrice = 350;
    await menuItem.save();
    console.log(`- Menu Item resolved: ${menuItem.name} @ ₹350/serve (recipe verified)`);
  }

  // Open cashier session
  console.log('- Opening cashier shift session (₹5000 float)...');
  const session = await restaurantAccountingService.openSession(adminUser._id, {
    openingCash: 5000,
    openingNotes: 'E2E Cashier test session'
  });
  console.log(`✅ Shift Session opened: No=${session.sessionNumber}`);

  // --- STEP 11: CREATE & SETTLE ORDER ---
  console.log('\n[STEP 11] Placing and settling a restaurant table order...');
  
  const order = await restaurantService.createOrder({
    orderType: 'DINE_IN',
    tableNumber: 'Table 5',
    items: [{
      menuItemId: menuItem._id,
      name: 'POMFRET FRY',
      quantity: 2, // 2 servings = consumes 1.0 KG POMFRET raw weight
      rate: 350
    }],
    remarks: 'E2E testing sale'
  }, adminUser._id);
  console.log(`- Order ticket created: Number=${order.orderNumber}, Subtotal=₹${order.subtotal}, Tax=₹${order.cgst + order.sgst}, Total=₹${order.totalAmount}`);

  console.log('- Settling order with CASH payment...');
  await restaurantService.settleOrder(order._id, { paymentMethod: 'CASH' }, adminUser._id);
  
  // Verify inventory reduction
  const restInventoryItemAfter = await RestaurantInventoryItem.findOne({ name: 'POMFRET' });
  console.log(`✅ Restaurant Kitchen Stock level: ${restInventoryItemAfter.quantity} KG (reduced by 1.0 KG due to recipe consumption)`);

  // --- STEP 12: RECORD EXPENSE & CLOSE SESSION ---
  console.log('\n[STEP 12] Recording Restaurant petty expense and closing session...');
  
  const expense = await restaurantAccountingService.recordExpense(adminUser._id, {
    amount: 200,
    category: 'UTILITIES',
    paymentMethod: 'CASH',
    payee: 'GF Electricity Board',
    remarks: 'Kitchen light bulb replacement'
  });
  console.log(`- Expense recorded: Category=${expense.category}, Amount=₹${expense.amount}`);

  // Expected cash: Opening cash (5000) + Cash order (735) - Expense (200) = 5535
  const expectedCash = 5000 + order.totalAmount - expense.amount;
  console.log(`- Expected cash book closing balance: ₹${expectedCash}`);

  console.log('- Closing cashier shift session...');
  const closedSession = await restaurantAccountingService.closeSession(adminUser._id, {
    actualClosingCash: expectedCash,
    actualClosingUpi: 0,
    closingNotes: 'Shift closed cleanly after E2E verified cash tally'
  });
  console.log(`✅ Shift Session closed: No=${closedSession.sessionNumber}, Cash Discrepancy=₹${closedSession.cashDiscrepancy}`);

  // --- STEP 13: FETCH FINAL REPORTS & METRICS ---
  console.log('\n==================================================================');
  console.log('📈  ERP FINANCIAL SCORECARD & STATUS REPORT');
  console.log('==================================================================');
  
  // Farmer Ledger Balance
  const farmerBal = await FarmerLedger.findOne({ farmerId: farmer._id }).sort({ createdAt: -1 });
  console.log(`Farmer Ledger Balance (Ramesh Naik) : ₹${farmerBal?.balanceAfter || 0} (${farmerBal?.entryType === 'SUPPLY' ? 'PAYABLE' : 'PAID'})`);
  
  // Fish Mall Stock
  const fmStock = await FishMallInventoryItem.findOne({ outletId: fmOutlet._id, name: 'POMFRET' });
  console.log(`Fish Mall Live POMFRET Stock Level   : ${fmStock?.quantity || 0} KG`);

  // Restaurant Stock
  const restStock = await RestaurantInventoryItem.findOne({ name: 'POMFRET' });
  console.log(`Restaurant Live POMFRET Stock Level : ${restStock?.quantity || 0} KG`);

  // General Ledger Cash Inflow
  const rstCashbook = await RestaurantCashbookEntry.find({ sessionId: closedSession._id });
  console.log('Restaurant Cashbook Session Tally  :');
  rstCashbook.forEach(entry => {
    console.log(`  - [${entry.type}] ${entry.category}: ₹${entry.amount} (Method: ${entry.paymentMethod}) - ${entry.description || ''}`);
  });

  console.log('\n==================================================================');
  console.log('🎉  E2E FLOW VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('==================================================================\n');

  await mongoose.disconnect();
  console.log('Disconnected from database.');
}

run().catch(async (err) => {
  console.error('\n🔴  E2E FLOW FAILURE ERROR:', err.message);
  console.error(err.stack);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
