import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Harvest } from './src/modules/harvests/harvest.model.js';

dotenv.config();

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const harvests = await Harvest.find().lean();
    console.log(`Found ${harvests.length} harvests`);

    harvests.forEach(h => {
      console.log(`Harvest ID: ${h._id}, HNo: ${h.harvestNumber}, Status: ${h.status}, netRateCalculated: ${h.netRateCalculated}, finalNetRate: ${h.finalNetRate}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspect();
