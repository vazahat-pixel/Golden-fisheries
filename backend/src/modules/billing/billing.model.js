import mongoose from 'mongoose';

const billingItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name cache is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity in KG is required'],
    min: [0.1, 'Quantity must be greater than zero']
  },
  rate: {
    type: Number,
    required: [true, 'Rate per unit is required'],
    min: [0, 'Rate cannot be negative']
  },
  amount: {
    type: Number,
    required: [true, 'Total line amount is required']
  }
});

const billingSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['SALES', 'PROCUREMENT'],
      index: true
    },
    tapalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tapal',
      default: null, // Optional (required if triggered from delivered Tapals)
      index: true
    },
    partyName: {
      type: String,
      required: [true, 'Recipient/Party name is required'],
      trim: true,
      uppercase: true
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null // References FarmerId or BuyerId
    },
    items: [billingItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    taxRate: {
      type: Number, // Percentage value (e.g. 5, 12, 18)
      required: true,
      default: 5
    },
    taxAmount: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['PENDING', 'PAID', 'OVERDUE', 'PARTIALLY_PAID'],
      default: 'PENDING',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CREDIT'],
      default: 'CASH'
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative']
    },
    balanceAmount: {
      type: Number,
      required: true,
      min: [0, 'Balance amount cannot be negative']
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required']
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate INV-XXXX sequence before database validation runs
billingSchema.pre('validate', async function (next) {
  if (this.invoiceNumber) return next();
  try {
    const lastInv = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastInv && lastInv.invoiceNumber) {
      const match = lastInv.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.invoiceNumber = `INV-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Billing = mongoose.model('Billing', billingSchema);
export default Billing;
