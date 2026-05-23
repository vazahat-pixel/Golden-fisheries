import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/modules/users/user.model.js';
import { DriverProfile } from './src/modules/drivers/driverProfile.model.js';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const driverProfiles = await DriverProfile.find().populate('userId', 'fullName').lean();
  console.log('\nAll DriverProfiles count:', driverProfiles.length);
  driverProfiles.forEach(dp => console.log(' -', dp.userId?.fullName, 'Status:', dp.registrationStatus, 'ProfileID:', dp._id));
  
  process.exit(0);
}

check().catch(console.error);
