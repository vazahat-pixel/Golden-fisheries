import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

const buyerBillItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  ratePerKg: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
});

const buyerBillSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    tapal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tapal',
      required: true,
      unique: true,
      index: true
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    item: { type: String, required: true },
    finalWeight: { type: Number, required: true, min: 0 },
    ratePerKg: { type: Number, required: true, min: 0 },
    grossAmount: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 5 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    items: [buyerBillItemSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'RETURN_PENDING', 'RETURNED'],
      default: 'ISSUED',
      index: true
    },
    paidAt: { type: Date, default: null },
    paidAmount: { type: Number, default: null, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CASH', 'BANK', 'CHEQUE', 'OTHER'],
      default: null,
    },
    paymentRef: { type: String, default: '' },
    markedPaidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    date: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

buyerBillSchema.pre('validate', async function (next) {
  if (this.billNo) return next();
  try {
    this.billNo = await formatSequentialDocNo('buyer-bill', 'BB', 4);
    next();
  } catch (e) {
    next(e);
  }
});

export const BuyerBill = mongoose.model('BuyerBill', buyerBillSchema);
export default BuyerBill;
