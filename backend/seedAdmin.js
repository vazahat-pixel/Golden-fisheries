/**
 * Wipes ALL users (and linked driver profiles), then seeds one fresh SUPER_ADMIN.
 * Run: npm run seed:admin   (from backend folder)
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './src/modules/users/user.model.js';
import { DriverProfile } from './src/modules/drivers/driverProfile.model.js';
import { ROLES } from './src/constants/roles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ADMIN = {
  phone: process.env.SEED_ADMIN_PHONE || '9076062592',
  password: process.env.SEED_ADMIN_PASSWORD || 'admin_password_123',
  fullName: process.env.SEED_ADMIN_NAME || 'SUPER ADMIN',
  otpCode: process.env.SEED_ADMIN_OTP || '123456',
};

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI missing in backend/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const deletedUsers = await User.deleteMany({});
    const deletedDrivers = await DriverProfile.deleteMany({});
    console.log(`Removed ${deletedUsers.deletedCount} user(s), ${deletedDrivers.deletedCount} driver profile(s).`);

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const user = await User.create({
      phone: ADMIN.phone,
      fullName: ADMIN.fullName,
      role: ROLES.SUPER_ADMIN,
      password: ADMIN.password,
      phoneVerified: true,
      isActive: true,
      status: 'active',
      businessUnit: 'MKE',
      platformAccess: {
        web: true,
        mobile: true,
        mobileViewOnly: true,
      },
      permissions: {
        panels: {
          restaurant: true,
          fishmall: true,
          driver: true,
          admin: true,
          buyer: true,
        },
      },
      otp: { code: ADMIN.otpCode, expiresAt },
    });

    console.log('\n=== Fresh SUPER_ADMIN created ===');
    console.log('Phone:    ', user.phone);
    console.log('Password: ', ADMIN.password);
    console.log('OTP:      ', ADMIN.otpCode, '(dev login)');
    console.log('Role:     ', user.role);
    console.log('Mobile:   view-only (monitoring)');
    console.log('===========================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting users / seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
