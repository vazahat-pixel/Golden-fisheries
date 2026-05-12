import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    transactionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: [
        'PROCUREMENT_IN',
        'SALES_OUT',
        'RESTAURANT_CONSUMPTION',
        'FISHMALL_SALE',
        'RETURN_IN',
        'MANUAL_ADJUSTMENT'
      ],
      index: true
    },
    quantity: {
      type: Number,
      required: [true, 'Transaction quantity change is required'] // Positive for stock-in, negative for stock-out
    },
    previousQuantity: {
      type: Number,
      required: [true, 'Previous stock quantity is required']
    },
    newQuantity: {
      type: Number,
      required: [true, 'New stock quantity is required']
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // References Tapal, Billing, or Return document
      index: true
    },
    referenceModel: {
      type: String,
      enum: ['Tapal', 'Billing', 'Harvest', null],
      default: null
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User who executed the transaction is required']
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

// Auto-generate ITX-XXXX sequential code before database validations run
inventoryTransactionSchema.pre('validate', async function (next) {
  if (this.transactionCode) return next();
  try {
    const lastTx = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastTx && lastTx.transactionCode) {
      const match = lastTx.transactionCode.match(/ITX-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.transactionCode = `ITX-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
export default InventoryTransaction;
