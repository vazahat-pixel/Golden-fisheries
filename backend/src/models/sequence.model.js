import mongoose from 'mongoose';

/**
 * Atomic document counters for race-safe numbering (HSL-*, PUR-*, TRP-*, INV-*).
 */
const sequenceSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Sequence = mongoose.model('Sequence', sequenceSchema);
export default Sequence;
