import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

// Nested items inside the main harvest slip
const harvestItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  hsnCode: {
    type: String,
    trim: true
  },
  fishName: {
    type: String,
    required: [true, 'Fish name cache is required']
  },
  sticker: {
    type: String,
    trim: true,
    default: ''
  },
  estimatedQty: {
    type: Number,
    required: [true, 'Estimated quantity in KG is required'],
    min: [0, 'Quantity cannot be negative']
  },
  rate: {
    type: Number,
    min: [0, 'Rate cannot be negative'],
    default: null
  },
  count: {
    type: String,
    trim: true
  },
  boxCount: {
    type: Number,
    min: [0, 'Box count cannot be negative'],
    default: null
  },
  weightPerBox: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  qualityType: {
    type: String,
    enum: ['A', 'B', 'Mix'],
    default: 'Mix'
  },
  totalWeight: {
    type: Number,
    min: 0,
    default: null
  },
  totalAmount: {
    type: Number,
    min: 0,
    default: null
  },
  usedQty: {
    type: Number,
    min: [0, 'Used quantity cannot be negative'],
    default: 0
  }
});

const harvestSchema = new mongoose.Schema(
  {
    harvestNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Farmer reference is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'SENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'PARTIALLY_CONVERTED', 'CONVERTED_TO_TAPAL', 'COMPLETED', 'OPEN', 'PARTIAL_USED', 'CLOSED'],
      default: 'PENDING',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    },
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required'],
      index: true
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required']
    },
    pickupTime: {
      type: String,
      trim: true
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location coordinate or address is required'],
      trim: true,
      uppercase: true
    },
    logisticsNotes: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    },
    vehicleNo: {
      type: String,
      trim: true,
      default: null
    },
    driverName: {
      type: String,
      trim: true,
      default: null
    },
    graderName: {
      type: String,
      trim: true,
      default: null
    },
    damageComplaint: {
      type: String,
      trim: true
    },
    deductionsNotes: {
      type: String,
      trim: true
    },
    tds: {
      type: Number,
      min: [0, 'TDS cannot be negative'],
      default: 0
    },
    commission: {
      type: Number,
      min: [0, 'Commission cannot be negative'],
      default: 0
    },
    soft: {
      type: Number,
      min: [0, 'Soft cannot be negative'],
      default: 0
    },
    // Payment & Net Rate Tracking
    netRateCalculated: { type: Number, default: null },
    totalPayableAmount: { type: Number, default: null },
    totalDeductions: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: null },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID'],
      default: 'UNPAID'
    },
    deductionTransport: { type: Number, default: 0 },
    deductionCommission: { type: Number, default: 0 },
    deductionSoft: { type: Number, default: 0 },
    deductionOther: { type: Number, default: 0 },
    finalNetRate: { type: Number, default: null },
    availableQty: { type: Number, default: 0 },
    allocatedQty: { type: Number, default: 0 },
    remainingQty: { type: Number, default: 0 },
    products: {
      type: [harvestItemSchema],
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'A harvest slip must contain at least one fish product'
      }
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate HSL-XXXX code sequence (atomic counter — avoids race on concurrent creates)
harvestSchema.pre('validate', async function (next) {
  if (this.harvestNumber) return next();
  try {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('harvest', 'HSL', 4);
      const exists = await mongoose.models.Harvest.findOne({ harvestNumber: candidate }).select('_id');
      if (!exists) {
        this.harvestNumber = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique harvest number'));
  } catch (error) {
    next(error);
  }
});

harvestSchema.pre('save', function (next) {
  // If products are available, compute availableQty if it's 0 or not set
  if (this.products && this.products.length > 0) {
    const totalEstWeight = this.products.reduce((sum, item) => sum + (item.estimatedQty || 0), 0);
    if (!this.availableQty || this.availableQty === 0) {
      this.availableQty = totalEstWeight;
    }
    for (const item of this.products) {
      if (!item.totalWeight) {
        item.totalWeight = item.estimatedQty;
      }
      if (item.rate != null) {
        item.totalAmount = item.rate * item.totalWeight;
      }
    }
  }

  this.remainingQty = this.availableQty - this.allocatedQty;
  if (this.remainingQty < 0) {
    this.remainingQty = 0; // Guard
  }

  // Transition status dynamically for active/confirmed harvest slips
  const activeInventoryStatuses = ['CONFIRMED', 'CONVERTED_TO_TAPAL', 'PARTIALLY_CONVERTED', 'OPEN', 'PARTIAL_USED', 'CLOSED'];
  if (activeInventoryStatuses.includes(this.status)) {
    if (this.allocatedQty === 0) {
      this.status = 'OPEN';
    } else if (this.remainingQty > 0 && this.allocatedQty > 0) {
      this.status = 'PARTIAL_USED';
    } else if (this.remainingQty <= 0 && this.allocatedQty > 0) {
      this.status = 'CLOSED';
    }
  }
  next();
});

export const Harvest = mongoose.model('Harvest', harvestSchema);
export default Harvest;
