import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

const tapalLineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hsnCode: { type: String, trim: true },
  count: { type: String, trim: true },
  qty: { type: String }, // e.g. "300 KG" — total weight display string
  rate: { type: String }, // e.g. "₹95"
  total: { type: String }, // e.g. "₹28,500"
  // Optional box-based weight fields (matches real Tapal slip format)
  boxQty: { type: Number, default: null }, // Number of boxes (optional)
  weightPerBox: { type: Number, default: null }, // KG per box (optional)
  totalWeight: { type: Number, default: null }
});

const tapalSchema = new mongoose.Schema(
  {
    tapalNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Purchase', 'Sale'],
      index: true
    },
    harvestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Harvest',
      default: null, // Required for purchases, null for external sales tapals
      index: true
    },
    partyName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      default: null
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      default: null
    },
    assignedBuyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    buyerPhone: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    destination: { type: String, trim: true, default: null },
    consignee: { type: String, trim: true, default: null },
    consigneeContact: { type: String, trim: true, default: null },
    pickupLocation: { type: String, trim: true, default: null },
    unloadingPoint: { type: String, trim: true, default: null },
    logisticsNotes: { type: String, trim: true, default: null },
    qty: {
      type: String, // Cached display string e.g. "500 KG"
    },
    numericQty: {
      type: Number,
    },
    amount: {
      type: String, // Cached display string e.g. "₹40,000"
    },
    numericAmount: {
      type: Number,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'CREATED',
        'ASSIGNED',
        'CONFIRMED',
        'DRIVER_ASSIGNED',
        'DRIVER_ACCEPTED',
        'TRIP_STARTED',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'BILL_PENDING',
        'BUYER_VERIFIED',
        'BILLING_DONE',
        'RETURNED',
        'COMPLETED'
      ],
      default: 'CREATED',
      index: true
    },
    driver: {
      type: String,
      default: 'Unassigned'
    },
    driverPhone: {
      type: String,
      default: null
    },
    vehicleNumber: {
      type: String,
      default: null
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    createdBy: {
      type: String,
      required: true
    },
    products: [tapalLineItemSchema],
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Auto-generate purchase/sale numbering sequence (atomic counter)
tapalSchema.pre('validate', async function (next) {
  if (this.tapalNumber) return next();
  try {
    const prefix = this.type === 'Purchase' ? 'PUR' : 'SAL';
    const key = this.type === 'Purchase' ? 'tapal-purchase' : 'tapal-sale';
    const Model = mongoose.models.Tapal;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo(key, prefix, 4);
      const exists = await Model.findOne({ tapalNumber: candidate }).select('_id');
      if (!exists) {
        this.tapalNumber = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique tapal number'));
  } catch (error) {
    next(error);
  }
});

export const Tapal = mongoose.model('Tapal', tapalSchema);
export default Tapal;
