import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

const kitchenLineSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantMenuItem',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
    lineStatus: {
      type: String,
      enum: ['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'],
      default: 'PENDING',
    },
    voidReason: { type: String, default: '' },
  },
  { _id: true }
);

const kitchenTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantOrder',
      default: null,
      index: true,
    },
    orderType: {
      type: String,
      enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
      default: 'DINE_IN',
    },
    tableNumber: { type: String, default: 'COUNTER', index: true },
    items: [kitchenLineSchema],
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
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

kitchenTicketSchema.pre('validate', async function assignTicketNumber(next) {
  if (this.ticketNumber) return next();
  try {
    this.ticketNumber = await formatSequentialDocNo('kitchen-ticket', 'KOT', 4);
    next();
  } catch (err) {
    next(err);
  }
});

export const KitchenTicket = mongoose.model('KitchenTicket', kitchenTicketSchema);
export default KitchenTicket;
