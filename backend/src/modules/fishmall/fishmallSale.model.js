import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

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

// Auto-generate FML-XXXX sequence (atomic counter)
fishmallSaleSchema.pre('validate', async function (next) {
  if (this.saleNumber) return next();
  try {
    const Model = mongoose.models.FishMallSale;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('fishmall-sale', 'FML', 4);
      const exists = await Model.findOne({ saleNumber: candidate }).select('_id');
      if (!exists) {
        this.saleNumber = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique FishMall sale number'));
  } catch (error) {
    next(error);
  }
});

export const FishMallSale = mongoose.model('FishMallSale', fishmallSaleSchema);
export default FishMallSale;
