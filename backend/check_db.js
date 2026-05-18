import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Farmer } from './src/modules/farmers/farmer.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');
  
  const lastFarmer = await Farmer.findOne({}, 'farmerCode')
    .sort({ farmerCode: -1 })
    .collation({ locale: 'en_US', numericOrdering: true });
    
  console.log('Last Farmer:', lastFarmer);
  
  if (lastFarmer && lastFarmer.farmerCode) {
    const match = lastFarmer.farmerCode.match(/FRM-(\d+)/i);
    console.log('Match:', match);
  }
  
  // also let's just get the top 5 by string sort descending without collation
  const top5 = await Farmer.find({}, 'farmerCode').sort({farmerCode: -1}).limit(5);
  console.log('Top 5 without collation:', top5.map(f => f.farmerCode));
  
  const top5Coll = await Farmer.find({}, 'farmerCode').sort({farmerCode: -1}).collation({ locale: 'en_US', numericOrdering: true }).limit(5);
  console.log('Top 5 with collation:', top5Coll.map(f => f.farmerCode));
  
  process.exit(0);
}

check().catch(console.error);
