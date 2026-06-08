/**
 * Sync Access Control users → Buyer master records (for tapal dropdown).
 * Run after db:reset when users were kept but buyers were wiped.
 *
 * Usage: npm run db:sync-users
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { syncAllBuyerUsersToMaster } from '../src/services/userMasterSync.service.js';
import { User } from '../src/modules/users/user.model.js';
import { ROLES } from '../src/constants/roles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function main() {
  await mongoose.connect(URI);

  console.log('\n=== Sync users → master data ===\n');

  const buyerUsers = await User.countDocuments({ role: ROLES.BUYER, isActive: { $ne: false } });
  const driverUsers = await User.countDocuments({ role: ROLES.DRIVER, isActive: true });

  console.log(`Active BUYER users: ${buyerUsers}`);
  console.log(`Active DRIVER users (assign list): ${driverUsers}\n`);

  const result = await syncAllBuyerUsersToMaster();
  console.log(`Buyer master records created: ${result.buyersCreated}`);
  console.log(`Buyer users processed: ${result.buyerUsers}`);
  console.log('\nDrivers with role DRIVER + isActive=true appear on Assign Driver automatically.\n');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
