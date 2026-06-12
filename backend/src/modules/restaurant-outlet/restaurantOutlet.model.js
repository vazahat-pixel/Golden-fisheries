import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

const restaurantOutletSchema = new mongoose.Schema(
  {
    outletCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    kitchenLabel: { type: String, default: 'Kitchen', trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

restaurantOutletSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

restaurantOutletSchema.pre('validate', async function assignOutletCode(next) {
  if (this.outletCode) return next();
  try {
    this.outletCode = await formatSequentialDocNo('restaurant-outlet', 'RES', 4);
    next();
  } catch (err) {
    next(err);
  }
});

export const RestaurantOutlet = mongoose.model('RestaurantOutlet', restaurantOutletSchema);
export default RestaurantOutlet;
