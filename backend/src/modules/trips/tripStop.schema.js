import mongoose from 'mongoose';

export const tripStopSchema = new mongoose.Schema(
  {
    sequence: { type: Number, required: true, min: 1 },
    stopType: {
      type: String,
      required: true,
      enum: ['HARVEST_PICKUP', 'TAPAL_DELIVERY'],
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
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  { _id: true }
);
