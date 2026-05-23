/**
 * Seeds role users for E2E audit (does not delete existing SUPER_ADMIN).
 * Run: node scripts/seedE2ETestUsers.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/modules/users/user.model.js';
import { ROLES } from '../src/constants/roles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PASS = process.env.E2E_PASSWORD || 'e2e_test_123';

const USERS = [
  { phone: '9000000001', fullName: 'E2E Procurement', role: ROLES.PROCUREMENT_MANAGER, mobile: true, web: false, mobileViewOnly: false },
  { phone: '9000000002', fullName: 'E2E Buyer', role: ROLES.BUYER, mobile: true, web: true, mobileViewOnly: false },
  { phone: '9000000003', fullName: 'E2E Driver', role: ROLES.DRIVER, mobile: true, web: false, mobileViewOnly: false },
  { phone: '9000000004', fullName: 'E2E Vehicle Mgr', role: ROLES.VEHICLE_MANAGER, mobile: true, web: false, mobileViewOnly: false },
  { phone: '9000000005', fullName: 'E2E Rest Manager', role: ROLES.REST_MANAGER, mobile: false, web: true, businessUnit: 'REST' },
  { phone: '9000000006', fullName: 'E2E Rest Cashier', role: ROLES.REST_CASHIER, mobile: false, web: true, businessUnit: 'REST' },
  { phone: '9000000007', fullName: 'E2E Fishmall Mgr', role: ROLES.FISHMALL_MANAGER, mobile: false, web: true, businessUnit: 'FISHMALL' },
  { phone: '9000000008', fullName: 'E2E Fishmall Cashier', role: ROLES.FISHMALL_CASHIER, mobile: false, web: true, businessUnit: 'FISHMALL' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const u of USERS) {
    await User.deleteOne({ phone: u.phone });
    await User.create({
      phone: u.phone,
      fullName: u.fullName,
      role: u.role,
      password: PASS,
      phoneVerified: true,
      isActive: true,
      status: 'active',
      businessUnit: u.businessUnit || 'MKE',
      platformAccess: {
        web: u.web !== false,
        mobile: u.mobile !== false,
        mobileViewOnly: u.mobileViewOnly || false,
      },
      otp: { code: '123456', expiresAt: new Date(Date.now() + 365 * 86400000) },
    });
    console.log(`Seeded ${u.role} — ${u.phone}`);
  }
  console.log(`\nPassword for all E2E users: ${PASS}`);
  await mongoose.disconnect();
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
