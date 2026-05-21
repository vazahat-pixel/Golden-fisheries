import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

const returnItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  returnedQty: { type: Number, required: true, min: 0.01 },
  damagedQty: { type: Number, default: 0, min: 0 },
  /** @deprecated use returnedQty — kept for API compatibility */
  quantity: { type: Number, min: 0.01 },
  reason: { type: String, default: '' },
  damageReason: { type: String, default: '' },
});

const salesReturnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    tapal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tapal',
      default: null,
      index: true,
    },
    tapalRef: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
      index: true,
    },
    buyerBill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuyerBill',
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    returnedQty: {
      type: Number,
      required: true,
      min: 0.01,
    },
    damagedQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    returnAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    adjustmentAmount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    items: {
      type: [returnItemSchema],
      validate: {
        validator: (v) => v?.length > 0,
        message: 'At least one return line item is required',
      },
    },
    inventoryImpact: {
      applied: { type: Boolean, default: false },
      quantity: { type: Number, default: 0 },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
      },
      transactionType: { type: String, default: 'RETURN_IN' },
    },
    settlementImpact: {
      balanceAdjustment: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['PENDING', 'SETTLED', 'ADJUSTED'],
        default: 'PENDING',
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    date: { type: Date, default: Date.now },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

salesReturnSchema.pre('validate', async function (next) {
  if (this.returnNo) return next();
  try {
    this.returnNo = await formatSequentialDocNo('sales-return', 'SR', 4);
    next();
  } catch (e) {
    next(e);
  }
});

export const SalesReturn = mongoose.model('SalesReturn', salesReturnSchema);
export default SalesReturn;
