import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

const restaurantItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantMenuItem',
    required: false,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RestaurantInventoryItem',
    required: false,
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number, // Servings or weight in KG
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  rate: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative']
  },
  amount: {
    type: Number,
    required: true
  }
});

const restaurantOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    orderType: {
      type: String,
      required: true,
      enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
      default: 'DINE_IN'
    },
    tableNumber: {
      type: String,
      default: 'TAKEAWAY' // For dine-in tables e.g. "Table 5"
    },
    items: [restaurantItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    cgst: {
      type: Number, // standard CGST 2.5%
      required: true,
      default: 0
    },
    sgst: {
      type: Number, // standard SGST 2.5%
      required: true,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'PREPARING', 'SERVED', 'PAID', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantSession',
      index: true,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'CREDIT', 'SPLIT'],
      default: 'CASH'
    },
    cashAmount: { type: Number, default: 0, min: 0 },
    upiAmount: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: '' },
    // A running dine-in tab can span several kitchen rounds (starters, then mains, ...);
    // each round gets its own ticket, all of which close together when the table is billed.
    kitchenTicketIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KitchenTicket' }],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    remarks: {
      type: String,
      default: ''
    },
    voidReason: { type: String, default: '' },
    voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    voidedAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

restaurantOrderSchema.pre('validate', async function assignOrderNumber(next) {
  if (this.orderNumber) return next();
  try {
    const Model = mongoose.models.RestaurantOrder || this.constructor;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('restaurant-order', 'RST', 4);
      const exists = await Model.findOne({ orderNumber: candidate }).select('_id');
      if (!exists) {
        this.orderNumber = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique restaurant order number'));
  } catch (error) {
    next(error);
  }
});

export const RestaurantOrder = mongoose.model('RestaurantOrder', restaurantOrderSchema);
export default RestaurantOrder;
