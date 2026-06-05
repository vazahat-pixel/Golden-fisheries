import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define a minimal Buyer schema
const BuyerSchema = new mongoose.Schema({
  fullName: String,
  buyerName: String,
  name: String,
  phone: String,
  isActive: Boolean
}, { collection: 'buyers' });

const Buyer = mongoose.models.Buyer || mongoose.model('Buyer', BuyerSchema);

const inspect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const buyers = await Buyer.find().lean();
    console.log(`Found ${buyers.length} buyers`);

    buyers.forEach(b => {
      console.log(`Buyer ID: ${b._id}, Name: ${b.fullName || b.buyerName || b.name}, Phone: ${b.phone}, isActive: ${b.isActive}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspect();
