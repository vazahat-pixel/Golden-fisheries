import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';
import { tripStopSchema } from './tripStop.schema.js';

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

const postTripExpensePumpSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  litres: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
});

const postTripExpensesSchema = new mongoose.Schema({
  tripStartDate: { type: String },
  tripEndDate: { type: String },
  vehicleNumber: { type: String },
  driverName: { type: String },
  loadingPoint: { type: String },
  unloadingPoint: { type: String },
  tapalNo: { type: String },
  driverBatta: { type: Number, default: 0 },
  rtoPcRmc: { type: Number, default: 0 },
  maintenance: { type: Number, default: 0 },
  tollFastag: { type: Number, default: 0 },
  halting: { type: Number, default: 0 },
  startingKms: { type: Number, default: 0 },
  endingKms: { type: Number, default: 0 },
  totalKms: { type: Number, default: 0 },
  diesel: { type: Number, default: 0 },
  mileage: { type: Number, default: 0 },
  lessAdvance: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  pumps: [postTripExpensePumpSchema],
  totalExpenses: { type: Number, default: 0 },
  pumpTotal: { type: Number, default: 0 },
  balancePayable: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID'
  },
  paidAmount: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CASH', 'BANK'],
    default: 'UPI'
  },
  upiTransactionId: { type: String, trim: true, default: '' },
  paymentConfirmedBy: { type: String, default: null },
  paymentConfirmedAt: { type: Date, default: null },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' }
}, { _id: false });

// Status Timelog Schema
const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const tripStartOdometerSchema = new mongoose.Schema(
  {
    photoUrl: { type: String, default: null },
    odometerKm: { type: Number, default: null, min: 0 },
    recordedAt: { type: Date, default: null },
  },
  { _id: false }
);

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
      required: false,
      default: null,
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true,
    },
    stops: {
      type: [tripStopSchema],
      default: [],
    },
    tripNotes: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: false,
      default: null,
      index: true
    },
    driverName: {
      type: String,
      trim: true,
      default: null,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['PLANNED', 'ASSIGNED', 'STARTED', 'PICKED', 'DELIVERED', 'PAYMENT_PENDING', 'CLOSED'],
      default: 'PLANNED',
      index: true
    },
    pickupLocation: {
      type: String,
      default: '',
    },
    deliveryLocation: {
      type: String,
      default: '',
    },
    pickupCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    deliveryCoords: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    lastLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      updatedAt: { type: Date, default: null }
    },
    expectedQty: {
      type: Number,
      default: 0,
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
    tripStartOdometer: {
      type: tripStartOdometerSchema,
      default: null,
    },
    timeline: [timelineSchema],
    expenses: [tripExpenseSchema],
    postTripExpenses: {
      type: postTripExpensesSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

tripSchema.index({ tapalId: 1 }, { unique: true, sparse: true });

tripSchema.pre('validate', function (next) {
  const hasStops = Array.isArray(this.stops) && this.stops.length > 0;
  if (hasStops) {
    if (!this.pickupLocation && this.stops[0]?.location) {
      this.pickupLocation = this.stops[0].location;
    }
    if (!this.deliveryLocation && this.stops[this.stops.length - 1]?.location) {
      this.deliveryLocation = this.stops[this.stops.length - 1].location;
    }
    if (!this.expectedQty) {
      this.expectedQty = this.stops.reduce((s, stop) => s + (stop.expectedQty || 0), 0);
    }
    const primaryTapalStop = this.stops.find((s) => s.stopType === 'TAPAL_DELIVERY' && s.tapalId);
    if (primaryTapalStop?.tapalId && !this.tapalId) {
      this.tapalId = primaryTapalStop.tapalId;
    }
  }
  if (!this.pickupLocation) this.pickupLocation = 'PICKUP';
  if (!this.deliveryLocation) this.deliveryLocation = 'DELIVERY';
  next();
});

// Auto-generate TRP-XXXX sequence (atomic counter)
tripSchema.pre('validate', async function (next) {
  if (this.tripNumber) return next();
  try {
    this.tripNumber = await formatSequentialDocNo('trip', 'TRP', 4);
    next();
  } catch (error) {
    next(error);
  }
});

export const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
