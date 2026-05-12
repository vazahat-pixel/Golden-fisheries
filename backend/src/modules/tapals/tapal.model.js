import mongoose from 'mongoose';

const tapalLineItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: String, required: true }, // e.g. "300 KG"
  rate: { type: String, required: true }, // e.g. "₹95"
  total: { type: String, required: true } // e.g. "₹28,500"
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
    qty: {
      type: String, // Cached display string e.g. "500 KG"
      required: true
    },
    numericQty: {
      type: Number,
      required: true
    },
    amount: {
      type: String, // Cached display string e.g. "₹40,000"
      required: true
    },
    numericAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['CREATED', 'DRIVER_ASSIGNED', 'TRIP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'BILL_PENDING', 'COMPLETED'],
      default: 'CREATED',
      index: true
    },
    driver: {
      type: String,
      default: 'Unassigned'
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: String,
      required: true
    },
    products: [tapalLineItemSchema]
  },
  {
    timestamps: true
  }
);

// Auto-generate purchase/sale numbering sequence before validation
tapalSchema.pre('validate', async function (next) {
  if (this.tapalNumber) return next();
  try {
    const prefix = this.type === 'Purchase' ? 'PUR' : 'SAL';
    const lastTapal = await this.constructor.findOne({ type: this.type }).sort({ createdAt: -1 });
    let nextId = 1;
    if (lastTapal && lastTapal.tapalNumber) {
      const regex = new RegExp(`${prefix}-(\\d+)`);
      const match = lastTapal.tapalNumber.match(regex);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.tapalNumber = `${prefix}-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Tapal = mongoose.model('Tapal', tapalSchema);
export default Tapal;
