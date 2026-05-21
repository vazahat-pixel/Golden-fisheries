import mongoose from 'mongoose';

const restaurantInventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['KG', 'PIECE', 'PORTION'],
      default: 'KG',
    },
    /** Menu selling price (optional) */
    rate: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
      default: 'Main Course',
    },
    recordDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

const restaurantInventoryLogSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantInventoryItem',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['OPENING', 'SALE_OUT', 'ADJUSTMENT', 'RECEIPT'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    referenceModel: {
      type: String,
      enum: ['RestaurantOrder', null],
      default: null,
    },
    remarks: { type: String, default: '' },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const RestaurantInventoryItem = mongoose.model(
  'RestaurantInventoryItem',
  restaurantInventoryItemSchema
);
export const RestaurantInventoryLog = mongoose.model(
  'RestaurantInventoryLog',
  restaurantInventoryLogSchema
);
