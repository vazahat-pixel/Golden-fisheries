import mongoose from 'mongoose';

const harvestTapalMappingSchema = new mongoose.Schema(
  {
    harvestSlipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Harvest',
      required: [true, 'Harvest reference is required'],
      index: true
    },
    tapalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tapal',
      required: [true, 'Tapal reference is required'],
      index: true
    },
    allocatedQty: {
      type: Number,
      required: [true, 'Allocated quantity is required'],
      min: [0.01, 'Allocated quantity must be greater than zero']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate mappings for the same Harvest-Tapal pair
harvestTapalMappingSchema.index({ harvestSlipId: 1, tapalId: 1 }, { unique: true });

export const HarvestTapalMapping = mongoose.model('HarvestTapalMapping', harvestTapalMappingSchema);
export default HarvestTapalMapping;
