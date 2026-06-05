import mongoose from 'mongoose';
import { User } from '../src/modules/users/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://vazahat:golden123@cluster0.spf2aye.mongodb.net/golden-fisheries-v2?retryWrites=true&w=majority';
  
  console.log('Connecting to Database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to Database successfully.');

  const users = await User.find().select('fullName phone role platformAccess');
  console.log(`Total users: ${users.length}`);
  users.forEach(u => {
    console.log(`- User: ${u.fullName}, Phone: ${u.phone}, Role: ${u.role}, PlatformAccess: ${JSON.stringify(u.platformAccess)}`);
  });

  await mongoose.disconnect();
  console.log('Disconnected from Database.');
}

run().catch(async (err) => {
  console.error('Error:', err);
  try { await mongoose.disconnect(); } catch {}
});
