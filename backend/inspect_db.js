import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Harvest } from './src/modules/harvests/harvest.model.js';
import { Farmer } from './src/modules/farmers/farmer.model.js';

dotenv.config();

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const harvests = await Harvest.find().lean();
    console.log(`Found ${harvests.length} harvests`);

    for (const h of harvests) {
      const farmer = await Farmer.findById(h.farmerId);
      console.log(`Harvest ID: ${h._id}, FarmerID: ${h.farmerId}, Found Farmer: ${!!farmer}`);
    }

    const allFarmers = await Farmer.find().lean();
    console.log(`Total Farmers in DB: ${allFarmers.length}`);
    allFarmers.forEach(f => console.log(`Farmer ID: ${f._id}, Name: ${f.fullName}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspect();
