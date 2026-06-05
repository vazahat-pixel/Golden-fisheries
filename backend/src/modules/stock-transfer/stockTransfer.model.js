import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

const transferLineSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true, trim: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0.01 }, // Sent quantity
    receivedQuantity: { type: Number, default: null }, // Received quantity entered by destination
    differenceQuantity: { type: Number, default: null }, // Shortage or excess
    unit: { type: String, default: 'KG' },
    rate: { type: Number, min: 0, default: 0 },
    fishMallItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallInventoryItem',
      default: null,
    },
  },
  { _id: true }
);

const stockTransferSchema = new mongoose.Schema(
  {
    transferNumber: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fromScope: {
      type: String,
      enum: ['PROCUREMENT'],
      default: 'PROCUREMENT',
    },
    toScope: {
      type: String,
      enum: ['FISHMALL'],
      required: true,
      default: 'FISHMALL',
    },
    destinationOutletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallOutlet',
      default: null,
      index: true,
    },
    lines: {
      type: [transferLineSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one transfer line is required',
      },
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'CREATED',
        'IN_TRANSIT',
        'PENDING_ACCEPTANCE',
        'ACCEPTED',
        'PARTIAL_ACCEPTED',
        'REJECTED',
        'COMPLETED',
        'CANCELLED'
      ],
      default: 'CREATED',
      index: true,
    },
    transferDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    remarks: { type: String, default: '' }, // Receiver remarks
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
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

stockTransferSchema.index({ status: 1, createdAt: -1 });
stockTransferSchema.index({ 'lines.productId': 1 });

stockTransferSchema.pre('validate', async function assignTransferNumber(next) {
  if (this.transferNumber) return next();
  try {
    this.transferNumber = await formatSequentialDocNo('procurement-transfer', 'PT', 4);
    next();
  } catch (err) {
    next(err);
  }
});

export const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);
export default StockTransfer;
