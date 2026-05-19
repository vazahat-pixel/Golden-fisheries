import mongoose from 'mongoose';

const farmerLedgerSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: [true, 'Farmer reference is required'],
      index: true
    },
    harvestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Harvest',
      default: null,
      index: true
    },
    entryType: {
      type: String,
      enum: ['SUPPLY', 'PAYMENT', 'DEDUCTION', 'ADJUSTMENT'],
      required: [true, 'Ledger entry type is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    debitAmount: {
      type: Number,
      default: 0,
      min: [0, 'Debit amount cannot be negative']
    },
    creditAmount: {
      type: Number,
      default: 0,
      min: [0, 'Credit amount cannot be negative']
    },
    balanceAfter: {
      type: Number,
      required: [true, 'Running balance after entry is required']
    },
    createdBy: {
      type: String,
      required: [true, 'Creator phone or identity is required']
    }
  },
  {
    timestamps: true
  }
);

export const FarmerLedger = mongoose.model('FarmerLedger', farmerLedgerSchema);
export default FarmerLedger;
