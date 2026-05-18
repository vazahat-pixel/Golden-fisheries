import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/modules/users/user.model.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const users = await User.find().lean();
  console.log('\nUsers:');
  users.forEach(u => console.log(' -', u.fullName, 'Role:', u.role));
  
  process.exit(0);
}

check().catch(console.error);
