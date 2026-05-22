import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/modules/users/user.model.js';
import { Trip } from './src/modules/trips/trip.model.js';
import { Tapal } from './src/modules/tapals/tapal.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const driver = await User.findOne({ phone: '9000000003' }).lean();
  console.log('\n=== DRIVER USER ===');
  console.log(driver);
  
  if (driver) {
    const trips = await Trip.find({ driverId: driver._id }).populate('tapalId').lean();
    console.log('\n=== TRIPS FOR DRIVER ===');
    console.log(trips);

    const tapals = await Tapal.find({ driverId: driver._id }).lean();
    console.log('\n=== TAPALS FOR DRIVER ===');
    console.log(tapals);
  } else {
    console.log('Driver not found');
  }
  
  process.exit(0);
}

check().catch(console.error);
