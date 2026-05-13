import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema(
  {
    buyerCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    buyerName: {
      type: String,
      required: [true, 'Buyer name is required'],
      trim: true,
      uppercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
    },
    buyerType: {
      type: String,
      required: true,
      enum: ['EXTERNAL', 'INTERNAL'],
      default: 'EXTERNAL',
      index: true
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
      uppercase: true
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

// Auto-generate buyer sequence code before validation
buyerSchema.pre('validate', async function (next) {
  if (this.buyerCode) return next();
  try {
    const lastBuyer = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastBuyer && lastBuyer.buyerCode) {
      const match = lastBuyer.buyerCode.match(/BYR-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.buyerCode = `BYR-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Buyer = mongoose.model('Buyer', buyerSchema);
export default Buyer;
