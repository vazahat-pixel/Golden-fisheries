import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { RestaurantOutlet } from '../src/modules/restaurant-outlet/restaurantOutlet.model.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/golden-fisheries';
  await mongoose.connect(uri);
  const res = await RestaurantOutlet.updateMany({}, {
    $set: {
      name: 'Golden Seafood Restaurant',
      location: 'Fresh Seafood & Dine-In'
    }
  });
  console.log('Database outlet name updated:', res);
  await mongoose.disconnect();
}

run().catch(err => {
  console.log('Update note:', err.message);
  process.exit(0);
});
