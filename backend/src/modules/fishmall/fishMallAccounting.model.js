import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

// 1. CLOSING SESSIONS & OPENING BALANCES Schema
const fishMallSessionSchema = new mongoose.Schema(
  {
    sessionNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallOutlet',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
      index: true
    },
    openingDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    openingCash: {
      type: Number,
      required: true,
      min: [0, 'Opening cash balance cannot be negative']
    },
    openingNotes: {
      type: String,
      default: '',
      trim: true
    },
    closingDate: {
      type: Date
    },
    closingNotes: {
      type: String,
      default: '',
      trim: true
    },
    // expected calculated aggregates
    salesTotal: { type: Number, default: 0 },
    cashSalesTotal: { type: Number, default: 0 },
    upiSalesTotal: { type: Number, default: 0 },
    cardSalesTotal: { type: Number, default: 0 },

    expensesTotal: { type: Number, default: 0 },
    cashExpensesTotal: { type: Number, default: 0 },
    upiExpensesTotal: { type: Number, default: 0 },

    transfersTotal: { type: Number, default: 0 }, // For internal supply bill value transfers

    expectedClosingCash: { type: Number, default: 0 },
    expectedClosingUpi: { type: Number, default: 0 },

    // reported physical amounts
    actualClosingCash: { type: Number, default: 0 },
    actualClosingUpi: { type: Number, default: 0 },

    // discrepancies
    cashDiscrepancy: { type: Number, default: 0 },
    upiDiscrepancy: { type: Number, default: 0 },

    // Profit & Loss summaries
    grossRevenue: { type: Number, default: 0 },
    netPnL: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Session number automatic sequential document series FMS-XXXX
fishMallSessionSchema.pre('validate', async function (next) {
  if (this.sessionNumber) return next();
  try {
    const Model = mongoose.models.FishMallSession;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('fishmall-session', 'FMS', 4);
      const exists = await Model.findOne({ sessionNumber: candidate }).select('_id');
      if (!exists) {
        this.sessionNumber = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique FishMall session number'));
  } catch (error) {
    next(error);
  }
});

// 2. CASHBOOK ENTRIES Schema
const fishMallCashbookEntrySchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallSession',
      required: true,
      index: true
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallOutlet',
      required: true,
      index: true
    },
    entryCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['INFLOW', 'OUTFLOW'],
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['OPENING_BALANCE', 'RETAIL_SALE', 'EXPENSE', 'INTERNAL_TRANSFER', 'CLOSING_SESSION', 'OTHER'],
      required: true,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'MIXED'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Cashbook amount cannot be negative']
    },
    cashAmount: { type: Number, default: 0 },
    upiAmount: { type: Number, default: 0 },
    cardAmount: { type: Number, default: 0 },
    description: {
      type: String,
      default: '',
      trim: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },
    referenceModel: {
      type: String,
      enum: ['FishMallSale', 'FishMallExpense', 'InternalSupplyBill', 'FishMallSession', null],
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Cashbook sequence counter FMCB-XXXX
fishMallCashbookEntrySchema.pre('validate', async function (next) {
  if (this.entryCode) return next();
  try {
    const Model = mongoose.models.FishMallCashbookEntry;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('fishmall-cashbook', 'FMCB', 4);
      const exists = await Model.findOne({ entryCode: candidate }).select('_id');
      if (!exists) {
        this.entryCode = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique FishMall cashbook entry code'));
  } catch (error) {
    next(error);
  }
});

// 3. OPERATIONAL EXPENSES Schema
const fishMallExpenseSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallSession',
      required: true,
      index: true
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FishMallOutlet',
      required: true,
      index: true
    },
    expenseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      enum: ['PETROL', 'AUTO', 'CUTTING', 'LABOR', 'ICE', 'TRANSPORT', 'MAINTENANCE', 'MISCELLANEOUS'],
      required: true,
      uppercase: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Expense amount must be greater than zero']
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI'],
      required: true
    },
    payee: {
      type: String,
      required: [true, 'Recipient/Payee name is required'],
      trim: true
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Expense sequence counter FME-XXXX
fishMallExpenseSchema.pre('validate', async function (next) {
  if (this.expenseCode) return next();
  try {
    const Model = mongoose.models.FishMallExpense;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('fishmall-expense', 'FME', 4);
      const exists = await Model.findOne({ expenseCode: candidate }).select('_id');
      if (!exists) {
        this.expenseCode = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique FishMall expense code'));
  } catch (error) {
    next(error);
  }
});

export const FishMallSession = mongoose.model('FishMallSession', fishMallSessionSchema);
export const FishMallCashbookEntry = mongoose.model('FishMallCashbookEntry', fishMallCashbookEntrySchema);
export const FishMallExpense = mongoose.model('FishMallExpense', fishMallExpenseSchema);
