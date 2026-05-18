import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/modules/users/user.model.js';

dotenv.config();

const seedPanels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = [
      {
        phone: '9076062592',
        fullName: 'Rajesh Kumar (Admin)',
        role: 'ADMIN',
        password: 'password123',
        phoneVerified: true,
        isActive: true,
        otp: { code: '123456', expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
      },
      {
        phone: '9076062593',
        fullName: 'Suresh Singh (Driver)',
        role: 'DRIVER',
        password: 'password123',
        phoneVerified: true,
        isActive: true,
        otp: { code: '123456', expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
      },
      {
        phone: '9076062594',
        fullName: 'Anita Sharma (Fishmall)',
        role: 'FISHMALL',
        password: 'password123',
        phoneVerified: true,
        isActive: true,
        otp: { code: '123456', expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
      },
      {
        phone: '9076062595',
        fullName: 'Vijay Verma (Restaurant)',
        role: 'RESTAURANT',
        password: 'password123',
        phoneVerified: true,
        isActive: true,
        otp: { code: '123456', expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
      }
    ];

    for (const userData of users) {
      // Delete existing to avoid duplicate key error
      await User.deleteOne({ phone: userData.phone });
      
      // Create new user (this will trigger pre-save hook for password hashing)
      const user = await User.create(userData);
      console.log(`Seeded user: ${user.fullName} (${user.role}) - Phone: ${user.phone}`);
    }

    console.log('All 4 panel users seeded successfully with OTP: 123456');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedPanels();
