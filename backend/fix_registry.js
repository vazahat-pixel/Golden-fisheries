import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Farmer } from './src/modules/farmers/farmer.model.js';
import { Product } from './src/modules/products/product.model.js';

dotenv.config();

const fixRegistry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Ensure Fallback Farmer exists
    const farmerId = '66421455e2e9c15910000001';
    const farmerData = {
      _id: farmerId,
      farmerCode: 'FRM-FALLBACK',
      fullName: 'SYSTEM FALLBACK FARMER',
      phone: '0000000000',
      location: 'SYSTEM',
      village: 'SYSTEM',
      isActive: true
    };

    await Farmer.findOneAndUpdate(
      { _id: farmerId },
      farmerData,
      { upsert: true, new: true }
    );
    console.log('Fallback Farmer verified/created');

    // 2. Ensure Fallback Product exists
    const productId = '66421455e2e9c15910000002';
    const productData = {
      _id: productId,
      name: 'GENERAL FISH',
      category: 'FRESHWATER',
      baseUnit: 'KG',
      basePrice: 100,
      quantity: 1000,
      isActive: true
    };

    await Product.findOneAndUpdate(
      { _id: productId },
      productData,
      { upsert: true, new: true }
    );
    console.log('Fallback Product verified/created');

    console.log('Registry fix completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing registry:', error);
    process.exit(1);
  }
};

fixRegistry();
