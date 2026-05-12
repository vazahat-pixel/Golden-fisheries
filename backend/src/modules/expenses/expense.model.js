import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    expenseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    expenseType: {
      type: String,
      required: true,
      enum: ['FUEL', 'TOLL', 'FOOD', 'REPAIR', 'SALARY', 'MARKETING', 'UTILITY', 'OTHER'],
      uppercase: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    payee: {
      type: String,
      required: [true, 'Recipient/Payee name is required'],
      trim: true
    },
    linkedTripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
      index: true
    },
    invoicePhotoUrl: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

// Auto-generate EXP-XXXX sequence
expenseSchema.pre('validate', async function (next) {
  if (this.expenseCode) return next();
  try {
    const lastExp = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextId = 1;
    if (lastExp && lastExp.expenseCode) {
      const match = lastExp.expenseCode.match(/EXP-(\d+)/);
      if (match) {
        nextId = parseInt(match[1], 10) + 1;
      }
    }
    this.expenseCode = `EXP-${String(nextId).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
