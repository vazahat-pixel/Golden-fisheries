import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FishMallSession, FishMallCashbookEntry, FishMallExpense } from './src/modules/fishmall/fishMallAccounting.model.js';

dotenv.config();

const test = async () => {
  try {
    console.log('Verifying Mongo connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connection successful!');

    console.log('FishMallSession schema loaded:', !!FishMallSession);
    console.log('FishMallCashbookEntry schema loaded:', !!FishMallCashbookEntry);
    console.log('FishMallExpense schema loaded:', !!FishMallExpense);

    console.log('Querying sessions...');
    const sessionCount = await FishMallSession.countDocuments();
    console.log('Session document count:', sessionCount);

    await mongoose.disconnect();
    console.log('Verification completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Verification failed with error:', err);
    process.exit(1);
  }
};

test();
