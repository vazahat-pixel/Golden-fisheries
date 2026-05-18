import jwt from 'jsonwebtoken';
import { config } from './src/config/config.js';
import { User } from './src/modules/users/user.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testApi() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ role: 'ADMIN' });
  
  const token = jwt.sign(
    { id: user._id },
    config.jwt.accessSecret,
    { expiresIn: '1h' }
  );
  
  console.log('Testing /api/v1/drivers/all with token for:', user.fullName);
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/drivers/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
  
  process.exit(0);
}

testApi();
