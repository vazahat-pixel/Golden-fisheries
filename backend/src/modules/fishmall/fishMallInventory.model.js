import mongoose from 'mongoose';

const fishMallInventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    openingStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ['KG'],
      default: 'KG',
    },
    recordDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

const fishMallInventoryLogSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallInventoryItem',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['OPENING', 'SALE_OUT', 'ADJUSTMENT', 'CLOSING', 'INTERNAL_TRANSFER_OUT'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    referenceModel: {
      type: String,
      enum: ['FishMallSale', 'FishMallDailyClosing', 'InternalSupplyBill', null],
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

const fishMallDailyClosingSchema = new mongoose.Schema(
  {
    closingDate: {
      type: Date,
      required: true,
      index: true,
    },
    openingStockTotal: { type: Number, default: 0 },
    salesTotal: { type: Number, default: 0 },
    expensesTotal: { type: Number, default: 0 },
    closingStockTotal: { type: Number, default: 0 },
    netPnL: { type: Number, default: 0 },
    remarks: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const FishMallInventoryItem = mongoose.model(
  'FishMallInventoryItem',
  fishMallInventoryItemSchema
);
export const FishMallInventoryLog = mongoose.model(
  'FishMallInventoryLog',
  fishMallInventoryLogSchema
);
export const FishMallDailyClosing = mongoose.model(
  'FishMallDailyClosing',
  fishMallDailyClosingSchema
);
