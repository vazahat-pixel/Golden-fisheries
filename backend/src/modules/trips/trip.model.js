import mongoose from 'mongoose';

// Nested Expense Schema within each Trip
const tripExpenseSchema = new mongoose.Schema({
  expenseType: {
    type: String,
    required: true,
    enum: ['FUEL', 'TOLL', 'FOOD', 'REPAIR', 'OTHER'],
    uppercase: true
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: [0.01, 'Amount must be greater than zero']
  },
  receiptUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Status Timelog Schema
const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    tapalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tapal',
      required: [true, 'Tapal reference is required'],
      unique: true,
      index: true
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver User reference is required'],
      index: true
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['ASSIGNED', 'STARTED', 'PICKED', 'DELIVERED', 'CLOSED'],
      default: 'ASSIGNED',
      index: true
    },
    pickupLocation: {
      type: String,
      required: true
    },
    deliveryLocation: {
      type: String,
      required: true
    },
    expectedQty: {
      type: Number,
      required: true
    },
    actualPickupQty: {
      type: Number,
      default: null
    },
    actualDeliveredQty: {
      type: Number,
      default: null
    },
    proofPhotoUrl: {
      type: String,
      default: null
    },
    signatureUrl: {
      type: String,
      default: null
    },
    timeline: [timelineSchema],
    expenses: [tripExpenseSchema]
  },
  {
    timestamps: true
  }
);

// Auto-generate TRP-XXXX sequence before validation
tripSchema.pre('validate', async function (next) {
  if (this.tripNumber) return next();
  try {
    const lastTrip = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastTrip && lastTrip.tripNumber) {
      const match = lastTrip.tripNumber.match(/TRP-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.tripNumber = `TRP-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
