import jwt from 'jsonwebtoken';
import { config } from './src/config/config.js';
import { User } from './src/modules/users/user.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testApi() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ phone: '9000000003' });
  
  if (!user) {
    console.error('Driver not found');
    process.exit(1);
  }

  const token = jwt.sign(
    { id: user._id },
    config.jwt.accessSecret,
    { expiresIn: '1h' }
  );
  
  console.log('Testing /api/v1/tapals/my-trips with token for:', user.fullName);
  
  try {
    const response = await fetch('http://localhost:5000/api/v1/tapals/my-trips', {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Client-Platform': 'MOBILE'
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
  
  process.exit(0);
}

testApi();
