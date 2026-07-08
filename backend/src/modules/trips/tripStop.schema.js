import mongoose from 'mongoose';

export const tripStopSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true, min: 1 },
    stopType: {
      type: String,
      required: true,
      enum: ['HARVEST_PICKUP', 'TAPAL_DELIVERY', 'HUB'],
      uppercase: true,
    },
    harvestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Harvest',
      default: null,
    },
    tapalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tapal',
      default: null,
    },
    label: { type: String, trim: true, default: '' },
    location: { type: String, required: true, trim: true },
    expectedQty: { type: Number, default: 0, min: 0 },
    actualQty: { type: Number, default: null },
    proofPhotoUrl: { type: String, default: null },
    signatureUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING',
    },
    completedAt: { type: Date, default: null },
  },
  { _id: true }
);
