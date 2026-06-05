import mongoose from 'mongoose';
import { Harvest } from '../src/modules/harvests/harvest.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://vazahat:golden123@cluster0.spf2aye.mongodb.net/golden-fisheries-v2?retryWrites=true&w=majority';
  
  console.log('Connecting to Database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to Database successfully.');

  const harvests = await Harvest.find().select('harvestNumber status netRateCalculated availableQty allocatedQty remainingQty');
  console.log(`Total harvests in DB: ${harvests.length}`);
  harvests.forEach(h => {
    console.log(`- Harvest: ${h.harvestNumber}, Status: ${h.status}, netRateCalculated: ${h.netRateCalculated}, Available: ${h.availableQty}, Allocated: ${h.allocatedQty}, Remaining: ${h.remainingQty}`);
  });

  await mongoose.disconnect();
  console.log('Disconnected from Database.');
}

run().catch(async (err) => {
  console.error('Error:', err);
  try { await mongoose.disconnect(); } catch {}
});
