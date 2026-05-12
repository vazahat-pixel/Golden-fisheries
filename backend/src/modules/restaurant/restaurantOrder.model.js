import mongoose from 'mongoose';

const restaurantItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
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
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'CREDIT'],
      default: 'CASH'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate RST-XXXX sequence
restaurantOrderSchema.pre('validate', async function (next) {
  if (this.orderNumber) return next();
  try {
    const lastOrder = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const match = lastOrder.orderNumber.match(/RST-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.orderNumber = `RST-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const RestaurantOrder = mongoose.model('RestaurantOrder', restaurantOrderSchema);
export default RestaurantOrder;
