/**
 * Full DB reset — keeps ONLY User accounts (roles/permissions on user doc).
 * Deletes all operational + master/registry data. Does NOT re-seed.
 *
 * Usage: npm run db:reset
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { User } from '../src/modules/users/user.model.js';
import { Farmer } from '../src/modules/farmers/farmer.model.js';
import { Buyer } from '../src/modules/buyers/buyer.model.js';
import { Product } from '../src/modules/products/product.model.js';
import { Vehicle } from '../src/modules/vehicles/vehicle.model.js';
import { DriverProfile } from '../src/modules/drivers/driverProfile.model.js';
import { Harvest } from '../src/modules/harvests/harvest.model.js';
import { HarvestTapalMapping } from '../src/modules/harvests/harvestTapalMapping.model.js';
import { Tapal } from '../src/modules/tapals/tapal.model.js';
import { Trip } from '../src/modules/trips/trip.model.js';
import { InventoryTransaction } from '../src/modules/inventory/inventoryTransaction.model.js';
import { Billing } from '../src/modules/billing/billing.model.js';
import { RestaurantOrder } from '../src/modules/restaurant/restaurantOrder.model.js';
import { RestaurantMenuItem } from '../src/modules/restaurant/restaurantMenu.model.js';
import {
  RestaurantInventoryItem,
  RestaurantInventoryLog,
} from '../src/modules/restaurant/restaurantInventory.model.js';
import {
  RestaurantSession,
  RestaurantCashbookEntry,
  RestaurantExpense,
} from '../src/modules/restaurant/restaurantAccounting.model.js';
import { KitchenTicket } from '../src/modules/restaurant/kitchenTicket.model.js';
import { FishMallSale } from '../src/modules/fishmall/fishmallSale.model.js';
import {
  FishMallInventoryItem,
  FishMallInventoryLog,
  FishMallDailyClosing,
} from '../src/modules/fishmall/fishMallInventory.model.js';
import {
  FishMallSession,
  FishMallCashbookEntry,
  FishMallExpense,
} from '../src/modules/fishmall/fishMallAccounting.model.js';
import { Expense } from '../src/modules/expenses/expense.model.js';
import { SalesReturn } from '../src/modules/buyer-portal/salesReturn.model.js';
import { BuyerVerification } from '../src/modules/buyer-portal/buyerVerification.model.js';
import { BuyerBill } from '../src/modules/buyer-portal/buyerBill.model.js';
import { StockTransfer } from '../src/modules/stock-transfer/stockTransfer.model.js';
import { InternalSupplyBill } from '../src/modules/internal-supply/internalSupplyBill.model.js';
import { Notification } from '../src/modules/notifications/notification.model.js';
import { AuditLog } from '../src/modules/integration/auditLog.model.js';
import { FarmerLedger } from '../src/modules/farmer-ledger/farmerLedger.model.js';
import { Sequence } from '../src/models/sequence.model.js';
import { RestaurantOutlet } from '../src/modules/restaurant-outlet/restaurantOutlet.model.js';
import { FishMallOutlet } from '../src/modules/fishmall-outlet/fishMallOutlet.model.js';

const URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/golden_fisheries';

/** Everything except User + SystemSettings — wiped completely */
const ALL_EXCEPT_USERS = [
  Harvest,
  HarvestTapalMapping,
  Tapal,
  Trip,
  InventoryTransaction,
  Billing,
  RestaurantOrder,
  KitchenTicket,
  RestaurantMenuItem,
  RestaurantInventoryItem,
  RestaurantInventoryLog,
  RestaurantSession,
  RestaurantCashbookEntry,
  RestaurantExpense,
  RestaurantOutlet,
  FishMallSale,
  FishMallInventoryItem,
  FishMallInventoryLog,
  FishMallDailyClosing,
  FishMallSession,
  FishMallCashbookEntry,
  FishMallExpense,
  FishMallOutlet,
  Expense,
  SalesReturn,
  BuyerVerification,
  BuyerBill,
  StockTransfer,
  InternalSupplyBill,
  Notification,
  AuditLog,
  FarmerLedger,
  Sequence,
  Farmer,
  Buyer,
  Product,
  Vehicle,
  DriverProfile,
];

async function wipeAll() {
  return Promise.all(
    ALL_EXCEPT_USERS.map(async (Model) => {
      const name = Model.collection?.collectionName || Model.modelName;
      const { deletedCount } = await Model.deleteMany({});
      return { name, deletedCount };
    })
  );
}

async function main() {
  await mongoose.connect(URI);
  const userCountBefore = await User.countDocuments();

  console.log('\n=== Golden Fisheries — FULL RESET (users only) ===\n');
  console.log(`Users preserved: ${userCountBefore} account(s)\n`);
  console.log('Deleting ALL other collections (no re-seed)…\n');

  const wiped = await wipeAll();
  let total = 0;
  wiped.forEach(({ name, deletedCount }) => {
    if (deletedCount > 0) {
      console.log(`  - ${name}: ${deletedCount}`);
      total += deletedCount;
    }
  });

  const userCountAfter = await User.countDocuments();
  if (userCountAfter !== userCountBefore) {
    throw new Error(`USER COUNT CHANGED ${userCountBefore} → ${userCountAfter} — ABORT`);
  }

  console.log(`\n✅ Done. Removed ${total} documents. Only users remain.`);
  console.log('   Create farmers, products, outlets fresh from the UI.\n');
  console.log('   Frontend: log out, hard refresh (Ctrl+Shift+R), or clear site data');
  console.log('   so old browser cache does not show stale lists.\n');

  const users = await User.find({})
    .select('fullName phone role isActive')
    .sort({ role: 1, phone: 1 })
    .lean();
  if (users.length) {
    console.log('--- Login accounts (password users: use Access Control password) ---');
    users.forEach((u) => {
      console.log(`  ${u.role?.padEnd(18)} ${u.phone || '—'}  ${u.fullName || ''}${u.isActive === false ? ' [inactive]' : ''}`);
    });
    console.log('--- Driver/Buyer mobile: OTP on /auth/driver or admin login for buyer ---\n');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
