import mongoose from 'mongoose';

const internalSupplyLineSchema = new mongoose.Schema(
  {
    fishMallItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallInventoryItem',
      required: true,
    },
    restaurantItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantInventoryItem',
      required: true,
    },
    itemName: { type: String, required: true, uppercase: true, trim: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, default: 'KG' },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const internalSupplyBillSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fromScope: {
      type: String,
      enum: ['FISHMALL'],
      default: 'FISHMALL',
    },
    toScope: {
      type: String,
      enum: ['RESTAURANT'],
      default: 'RESTAURANT',
    },
    lines: [internalSupplyLineSchema],
    subtotal: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['ISSUED', 'CANCELLED'],
      default: 'ISSUED',
      index: true,
    },
    remarks: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

internalSupplyBillSchema.pre('validate', async function (next) {
  if (this.invoiceNumber) return next();
  try {
    const last = await this.constructor.findOne().sort({ createdAt: -1 });
    let n = 1;
    if (last?.invoiceNumber) {
      const m = last.invoiceNumber.match(/INT-(\d+)/);
      if (m) n = parseInt(m[1], 10) + 1;
    }
    this.invoiceNumber = `INT-${String(n).padStart(4, '0')}`;
    next();
  } catch (e) {
    next(e);
  }
});

export const InternalSupplyBill = mongoose.model('InternalSupplyBill', internalSupplyBillSchema);
export default InternalSupplyBill;
