import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

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
    quantity: { type: Number, required: true, min: 0.01 }, // Sent quantity
    receivedQuantity: { type: Number, default: null }, // Received quantity entered by receiver
    differenceQuantity: { type: Number, default: null }, // Shortage or excess
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
    destinationName: {
      type: String,
      default: 'GF Restaurant Kitchen',
      trim: true,
    },
    billDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lines: [internalSupplyLineSchema],
    subtotal: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        'ISSUED',
        'CANCELLED',
        'PENDING_ACCEPTANCE',
        'ACCEPTED',
        'PARTIAL_ACCEPTED',
        'REJECTED'
      ],
      default: 'PENDING_ACCEPTANCE',
      index: true,
    },
    remarks: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receiverName: { type: String, default: '' },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

internalSupplyBillSchema.index({ status: 1, billDate: -1 });
internalSupplyBillSchema.index({ createdAt: -1 });

internalSupplyBillSchema.pre('validate', async function assignInvoiceNumber(next) {
  if (this.invoiceNumber) return next();
  try {
    this.invoiceNumber = await formatSequentialDocNo('internal-supply', 'INT', 4);
    next();
  } catch (err) {
    next(err);
  }
});

export const InternalSupplyBill = mongoose.model('InternalSupplyBill', internalSupplyBillSchema);
export default InternalSupplyBill;
