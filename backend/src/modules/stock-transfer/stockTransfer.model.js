import mongoose from 'mongoose';

/**
 * Future: Admin-initiated transfers from procurement → restaurant / fishmall.
 * Fish Mall → Restaurant uses InternalSupplyBill (see modules/internal-supply).
 */
const stockTransferSchema = new mongoose.Schema(
  {
    transferNumber: { type: String, unique: true, uppercase: true },
    fromScope: {
      type: String,
      enum: ['PROCUREMENT'],
      default: 'PROCUREMENT',
    },
    toScope: {
      type: String,
      enum: ['RESTAURANT', 'FISHMALL'],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    targetItemName: { type: String, trim: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
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

export const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);
