import mongoose from 'mongoose';

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
    type: Number,
    min: [0, 'Weight per box cannot be negative'],
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
      enum: ['DRAFT', 'PENDING', 'SENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'PARTIALLY_CONVERTED', 'CONVERTED_TO_TAPAL', 'COMPLETED'],
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

// Auto-generate HSL-XXXX code sequence before database validations run
harvestSchema.pre('validate', async function (next) {
  if (this.harvestNumber) return next();
  try {
    const lastHarvest = await this.constructor.findOne({ harvestNumber: { $regex: /^HSL-\d+$/i } }, 'harvestNumber')
      .sort({ harvestNumber: -1 })
      .collation({ locale: 'en_US', numericOrdering: true });
    let nextId = 1;
    if (lastHarvest && lastHarvest.harvestNumber) {
      const match = lastHarvest.harvestNumber.match(/HSL-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.harvestNumber = `HSL-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Harvest = mongoose.model('Harvest', harvestSchema);
export default Harvest;
