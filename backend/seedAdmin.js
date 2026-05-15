import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/modules/users/user.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const phone = '9076062592';
    const otpCode = '123456';
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year expiry for dev ease

    const userData = {
      phone,
      fullName: 'SUPER ADMIN',
      role: 'ADMIN',
      password: 'admin_password_123',
      phoneVerified: true,
      otp: { code: otpCode, expiresAt }
    };

    const user = await User.findOneAndUpdate(
      { phone },
      userData,
      { upsert: true, new: true }
    );

    console.log('Admin user seeded successfully:', user.phone);
    console.log('Permanent OTP set to:', otpCode);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
