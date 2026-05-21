import mongoose from 'mongoose';

const qtyBlockSchema = new mongoose.Schema(
  {
    noOfBoxes: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }
  },
  { _id: false }
);

const buyerVerificationSchema = new mongoose.Schema(
  {
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
    dispatchedQty: { type: qtyBlockSchema, default: () => ({}) },
    receivedQty: { type: qtyBlockSchema, default: () => ({}) },
    discrepancy: {
      boxes: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
      hasDiscrepancy: { type: Boolean, default: false }
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'APPROVED_WITH_DISCREPANCY', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    buyerRemarks: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    photos: [{ type: String }]
  },
  { timestamps: true }
);

export const BuyerVerification = mongoose.model('BuyerVerification', buyerVerificationSchema);
export default BuyerVerification;
