import mongoose from 'mongoose';

const fishmallItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  fishName: {
    type: String,
    required: true
  },
  scaleWeight: {
    type: Number, // Measured in KG
    required: [true, 'Scale measured weight is required'],
    min: [0.01, 'Weight must be greater than zero']
  },
  rate: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative']
  },
  amount: {
    type: Number,
    required: true
  }
});

const fishmallSaleSchema = new mongoose.Schema(
  {
    saleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    customerPhone: {
      type: String,
      trim: true,
      default: 'WALK_IN'
    },
    items: [fishmallItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['CASH', 'UPI', 'CARD'],
      default: 'CASH'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate FML-XXXX sequence
fishmallSaleSchema.pre('validate', async function (next) {
  if (this.saleNumber) return next();
  try {
    const lastSale = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastSale && lastSale.saleNumber) {
      const match = lastSale.saleNumber.match(/FML-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.saleNumber = `FML-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const FishMallSale = mongoose.model('FishMallSale', fishmallSaleSchema);
export default FishMallSale;
