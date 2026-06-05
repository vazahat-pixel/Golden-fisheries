import mongoose from 'mongoose';
import { Product } from '../src/modules/products/product.model.js';
import { Farmer } from '../src/modules/farmers/farmer.model.js';
import { Buyer } from '../src/modules/buyers/buyer.model.js';
import dotenv from 'dotenv';

dotenv.config();

const defaultProducts = [
  { name: 'POMFRET', category: 'SEAFOOD', baseUnit: 'KG', basePrice: 500, quantity: 100 },
  { name: 'MACKEREL', category: 'SEAFOOD', baseUnit: 'KG', basePrice: 200, quantity: 150 },
  { name: 'SARDINE', category: 'SEAFOOD', baseUnit: 'KG', basePrice: 100, quantity: 200 },
  { name: 'PRAWNS', category: 'PRAWNS', baseUnit: 'KG', basePrice: 400, quantity: 120 },
  { name: 'CRAB', category: 'CRAB', baseUnit: 'KG', basePrice: 350, quantity: 80 }
];

const defaultFarmers = [
  { fullName: 'RAMESH NAIK', phone: '9876543210', location: 'KARWAR', village: 'MUDGERI' },
  { fullName: 'MANJUNATH GOWDA', phone: '9876543211', location: 'ANKOLA', village: 'HARWADA' }
];

const defaultBuyers = [
  { buyerName: 'VAZAHAT QURESHI', phone: '9827607086', buyerType: 'EXTERNAL', deliveryAddress: 'MANGALORE WHARF' }
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://vazahat:golden123@cluster0.spf2aye.mongodb.net/golden-fisheries-v2?retryWrites=true&w=majority';
  
  console.log('Connecting to Database...');
  await mongoose.connect(mongoUri);
  console.log('Connected to Database successfully.');

  // 1. Seed Products
  console.log('Seeding products...');
  for (const prod of defaultProducts) {
    const exists = await Product.findOne({ name: prod.name });
    if (!exists) {
      const newProd = new Product(prod);
      await newProd.save();
      console.log(`- Created product: ${prod.name}`);
    } else {
      console.log(`- Product ${prod.name} already exists`);
    }
  }

  // 2. Seed Farmers
  console.log('Seeding farmers...');
  for (const farmer of defaultFarmers) {
    const exists = await Farmer.findOne({ phone: farmer.phone });
    if (!exists) {
      const newFarmer = new Farmer(farmer);
      await newFarmer.save();
      console.log(`- Created farmer: ${farmer.fullName}`);
    } else {
      console.log(`- Farmer ${farmer.fullName} already exists`);
    }
  }

  // 3. Seed Buyers
  console.log('Seeding buyers...');
  for (const buyer of defaultBuyers) {
    const exists = await Buyer.findOne({ phone: buyer.phone });
    if (!exists) {
      const newBuyer = new Buyer(buyer);
      await newBuyer.save();
      console.log(`- Created buyer: ${buyer.buyerName}`);
    } else {
      console.log(`- Buyer ${buyer.buyerName} already exists`);
    }
  }

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
  console.log('Disconnected from Database.');
}

run().catch(async (err) => {
  console.error('Error seeding data:', err);
  try { await mongoose.disconnect(); } catch {}
});
