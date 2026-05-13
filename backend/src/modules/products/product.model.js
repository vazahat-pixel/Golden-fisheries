import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['FRESHWATER', 'SEAFOOD', 'PRAWNS', 'CRAB', 'OTHER'],
      uppercase: true,
      index: true
    },
    scientificName: {
      type: String,
      trim: true
    },
    baseUnit: {
      type: String,
      required: true,
      enum: ['KG', 'BOX', 'PIECE'],
      default: 'KG'
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price per unit is required'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    minStockLimit: {
      type: Number,
      default: 50,
      min: [0, 'Limit cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model('Product', productSchema);
export default Product;
