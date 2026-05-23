import mongoose from 'mongoose';
import { formatSequentialDocNo } from '../../services/sequence.service.js';

// 1. Restaurant Shift Session Schema
const restaurantSessionSchema = new mongoose.Schema(
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
    discountTotal: { type: Number, default: 0 },

    expensesTotal: { type: Number, default: 0 },
    cashExpensesTotal: { type: Number, default: 0 },
    upiExpensesTotal: { type: Number, default: 0 },

    expectedClosingCash: { type: Number, default: 0 },
    expectedClosingUpi: { type: Number, default: 0 },

    // reported physical amounts
    actualClosingCash: { type: Number, default: 0 },
    actualClosingUpi: { type: Number, default: 0 },

    // discrepancies
    cashDiscrepancy: { type: Number, default: 0 },
    upiDiscrepancy: { type: Number, default: 0 },

    // Profit & Loss summaries
    netPnL: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Session number automatic sequential document series RSS-XXXX
restaurantSessionSchema.pre('validate', async function (next) {
  if (this.sessionNumber) return next();
  try {
    const Model = mongoose.models.RestaurantSession || this.constructor;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('restaurant-session', 'RSS', 4);
      const exists = await Model.findOne({ sessionNumber: candidate }).select('_id');
      if (!exists) {
        this.sessionNumber = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique Restaurant session number'));
  } catch (error) {
    next(error);
  }
});

// 2. Cashbook Entries Schema
const restaurantCashbookEntrySchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantSession',
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
      enum: ['OPENING_BALANCE', 'POS_SALE', 'EXPENSE', 'CLOSING_SESSION', 'OTHER'],
      required: true,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'SPLIT'],
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
      enum: ['RestaurantOrder', 'RestaurantExpense', 'RestaurantSession', null],
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

// Cashbook sequence counter RSCB-XXXX
restaurantCashbookEntrySchema.pre('validate', async function (next) {
  if (this.entryCode) return next();
  try {
    const Model = mongoose.models.RestaurantCashbookEntry || this.constructor;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('restaurant-cashbook', 'RSCB', 4);
      const exists = await Model.findOne({ entryCode: candidate }).select('_id');
      if (!exists) {
        this.entryCode = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique Restaurant cashbook entry code'));
  } catch (error) {
    next(error);
  }
});

// 3. Kitchen Expenses Schema
const restaurantExpenseSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantSession',
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
      enum: ['GAS', 'LABOR', 'INGREDIENT_WASTAGE', 'CLEANING', 'MISCELLANEOUS'],
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

// Expense sequence counter RSE-XXXX
restaurantExpenseSchema.pre('validate', async function (next) {
  if (this.expenseCode) return next();
  try {
    const Model = mongoose.models.RestaurantExpense || this.constructor;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = await formatSequentialDocNo('restaurant-expense', 'RSE', 4);
      const exists = await Model.findOne({ expenseCode: candidate }).select('_id');
      if (!exists) {
        this.expenseCode = candidate;
        return next();
      }
    }
    return next(new Error('Could not allocate unique Restaurant expense code'));
  } catch (error) {
    next(error);
  }
});

export const RestaurantSession = mongoose.model('RestaurantSession', restaurantSessionSchema);
export const RestaurantCashbookEntry = mongoose.model('RestaurantCashbookEntry', restaurantCashbookEntrySchema);
export const RestaurantExpense = mongoose.model('RestaurantExpense', restaurantExpenseSchema);
