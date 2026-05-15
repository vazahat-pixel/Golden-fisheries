import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/users/user.model.js';
import { DriverProfile } from '../modules/drivers/driverProfile.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/golden_fisheries';

async function seedDrivers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Driver 1
    const driver1Phone = '9000000001';
    let user1 = await User.findOne({ phone: driver1Phone });
    if (!user1) {
      user1 = new User({
        fullName: 'Suresh Kumar',
        phone: driver1Phone,
        password: 'driver123',
        role: 'DRIVER',
        isActive: true,
        phoneVerified: true
      });
      await user1.save();
      console.log(`Created User: Suresh Kumar`);
    } else {
      console.log(`User Suresh Kumar already exists.`);
    }

    let profile1 = await DriverProfile.findOne({ userId: user1._id });
    if (!profile1) {
      profile1 = new DriverProfile({
        userId: user1._id,
        licenseNumber: 'DL-KA-001',
        licenseExpiry: new Date('2030-12-31'),
        hasOwnVehicle: false,
        registrationStatus: 'active'
      });
      await profile1.save();
      console.log(`Created Profile for Suresh Kumar`);
    } else {
      console.log(`Profile for Suresh Kumar already exists.`);
    }

    // Driver 2
    const driver2Phone = '9000000002';
    let user2 = await User.findOne({ phone: driver2Phone });
    if (!user2) {
      user2 = new User({
        fullName: 'Ramesh Singh',
        phone: driver2Phone,
        password: 'driver123',
        role: 'DRIVER',
        isActive: true,
        phoneVerified: true
      });
      await user2.save();
      console.log(`Created User: Ramesh Singh`);
    } else {
      console.log(`User Ramesh Singh already exists.`);
    }

    let profile2 = await DriverProfile.findOne({ userId: user2._id });
    if (!profile2) {
      profile2 = new DriverProfile({
        userId: user2._id,
        licenseNumber: 'DL-KA-002',
        licenseExpiry: new Date('2030-12-31'),
        hasOwnVehicle: false,
        registrationStatus: 'active'
      });
      await profile2.save();
      console.log(`Created Profile for Ramesh Singh`);
    } else {
      console.log(`Profile for Ramesh Singh already exists.`);
    }

    console.log('Drivers seeded successfully!');
  } catch (error) {
    console.error('Error seeding drivers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDrivers();
