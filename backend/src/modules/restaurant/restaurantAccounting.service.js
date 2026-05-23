import mongoose from 'mongoose';
import { RestaurantSession, RestaurantCashbookEntry, RestaurantExpense } from './restaurantAccounting.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

class RestaurantAccountingService {
  /**
   * Fetches the currently active open session for a cashier
   */
  async getActiveSession(userId) {
    return await RestaurantSession.findOne({
      cashierId: userId,
      status: 'OPEN'
    });
  }

  /**
   * Opens a new shift/session for the cashier
   */
  async openSession(userId, sessionData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Guard: Check if cashier already has an active open session
      const existing = await RestaurantSession.findOne({
        cashierId: userId,
        status: 'OPEN'
      }).session(session);

      if (existing) {
        throw new AppError('You already have an active open shift session. Please close it first.', 400);
      }

      const openingCash = parseFloat(sessionData.openingCash);
      if (isNaN(openingCash) || openingCash < 0) {
        throw new AppError('Opening cash balance must be a positive number', 400);
      }

      // Create new session
      const [rstSession] = await RestaurantSession.create(
        [
          {
            cashierId: userId,
            status: 'OPEN',
            openingCash,
            openingNotes: sessionData.openingNotes || '',
            expectedClosingCash: openingCash
          }
        ],
        { session }
      );

      // Record first inflow entry in Cashbook (Opening cash float)
      await RestaurantCashbookEntry.create(
        [
          {
            sessionId: rstSession._id,
            type: 'INFLOW',
            category: 'OPENING_BALANCE',
            paymentMethod: 'CASH',
            amount: openingCash,
            cashAmount: openingCash,
            description: `Shift Opening Cash Float: ${rstSession.sessionNumber}`,
            referenceId: rstSession._id,
            referenceModel: 'RestaurantSession',
            createdBy: userId
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(`[Restaurant Accounting]: Cashier shift session ${rstSession.sessionNumber} opened with ₹${openingCash} opening cash.`);
      return rstSession;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Closes the shift session and aggregates physical totals vs expected cashbook tallies
   */
  async closeSession(userId, closeData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const activeSession = await RestaurantSession.findOne({
        cashierId: userId,
        status: 'OPEN'
      }).session(session);

      if (!activeSession) {
        throw new AppError('No active open shift session was found to close.', 404);
      }

      const actualClosingCash = parseFloat(closeData.actualClosingCash ?? 0);
      const actualClosingUpi = parseFloat(closeData.actualClosingUpi ?? 0);

      if (isNaN(actualClosingCash) || actualClosingCash < 0 || isNaN(actualClosingUpi) || actualClosingUpi < 0) {
        throw new AppError('Closing balances must be positive numbers', 400);
      }

      // 1. Query all ledger cashbook entries for this session
      const ledger = await RestaurantCashbookEntry.find({
        sessionId: activeSession._id
      }).session(session);

      // 2. Compute exact aggregates from cashbook entries
      let salesTotal = 0;
      let cashSalesTotal = 0;
      let upiSalesTotal = 0;
      let cardSalesTotal = 0;
      let discountTotal = 0;

      let expensesTotal = 0;
      let cashExpensesTotal = 0;
      let upiExpensesTotal = 0;

      for (const entry of ledger) {
        if (entry.category === 'POS_SALE') {
          salesTotal += entry.amount;
          cashSalesTotal += entry.cashAmount || 0;
          upiSalesTotal += entry.upiAmount || 0;
          cardSalesTotal += entry.cardAmount || 0;
        } else if (entry.category === 'EXPENSE') {
          expensesTotal += entry.amount;
          cashExpensesTotal += entry.cashAmount || 0;
          upiExpensesTotal += entry.upiAmount || 0;
        }
      }

      // Expected Cash Balance = Opening + Cash Sales - Cash Expenses
      const expectedClosingCash = activeSession.openingCash + cashSalesTotal - cashExpensesTotal;
      const expectedClosingUpi = upiSalesTotal - upiExpensesTotal;

      const cashDiscrepancy = expectedClosingCash - actualClosingCash;
      const upiDiscrepancy = expectedClosingUpi - actualClosingUpi;

      const netPnL = salesTotal - expensesTotal;

      // 3. Update active session details
      activeSession.status = 'CLOSED';
      activeSession.closingDate = new Date();
      activeSession.closingNotes = closeData.closingNotes || '';

      activeSession.salesTotal = salesTotal;
      activeSession.cashSalesTotal = cashSalesTotal;
      activeSession.upiSalesTotal = upiSalesTotal;
      activeSession.cardSalesTotal = cardSalesTotal;
      activeSession.discountTotal = discountTotal; // Handled in individual POS entries if logged

      activeSession.expensesTotal = expensesTotal;
      activeSession.cashExpensesTotal = cashExpensesTotal;
      activeSession.upiExpensesTotal = upiExpensesTotal;

      activeSession.expectedClosingCash = expectedClosingCash;
      activeSession.expectedClosingUpi = expectedClosingUpi;

      activeSession.actualClosingCash = actualClosingCash;
      activeSession.actualClosingUpi = actualClosingUpi;

      activeSession.cashDiscrepancy = cashDiscrepancy;
      activeSession.upiDiscrepancy = upiDiscrepancy;

      activeSession.netPnL = netPnL;

      await activeSession.save({ session });

      // Create a final closing log cashbook entry
      await RestaurantCashbookEntry.create(
        [
          {
            sessionId: activeSession._id,
            type: 'OUTFLOW',
            category: 'CLOSING_SESSION',
            paymentMethod: 'SPLIT',
            amount: actualClosingCash + actualClosingUpi,
            cashAmount: actualClosingCash,
            upiAmount: actualClosingUpi,
            description: `Shift Closing Session Cash Tally: ${activeSession.sessionNumber}`,
            referenceId: activeSession._id,
            referenceModel: 'RestaurantSession',
            createdBy: userId
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(`[Restaurant Accounting]: Session ${activeSession.sessionNumber} closed successfully. Sales: ₹${salesTotal}, Expenses: ₹${expensesTotal}, Variance: ₹${cashDiscrepancy + upiDiscrepancy}.`);
      return activeSession;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Returns a complete real-time Shift Session Summary & Mini P&L
   */
  async getSessionSummary(sessionId) {
    const activeSession = await RestaurantSession.findById(sessionId);
    if (!activeSession) {
      throw new AppError('Session shift not found', 404);
    }

    const cashbook = await RestaurantCashbookEntry.find({ sessionId }).sort({ createdAt: -1 });
    const expenses = await RestaurantExpense.find({ sessionId }).sort({ createdAt: -1 });

    return {
      session: activeSession,
      cashbook,
      expenses
    };
  }

  /**
   * Records a new petty expense for the restaurant under the current active session
   */
  async recordExpense(userId, expenseData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const activeSession = await this.getActiveSession(userId);
      if (!activeSession) {
        throw new AppError('Operations are locked! Day cannot start without opening balance. Please open shift first.', 400);
      }

      const amount = parseFloat(expenseData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new AppError('Expense amount must be a positive number', 400);
      }

      // 1. Create RestaurantExpense document
      const [expense] = await RestaurantExpense.create(
        [
          {
            sessionId: activeSession._id,
            category: expenseData.category.toUpperCase(),
            amount,
            paymentMethod: expenseData.paymentMethod || 'CASH',
            payee: expenseData.payee || 'Vendor',
            remarks: expenseData.remarks || '',
            createdBy: userId
          }
        ],
        { session }
      );

      // 2. Log Cashbook ledger outflow entry
      const method = expense.paymentMethod;
      await RestaurantCashbookEntry.create(
        [
          {
            sessionId: activeSession._id,
            type: 'OUTFLOW',
            category: 'EXPENSE',
            paymentMethod: method,
            amount,
            cashAmount: method === 'CASH' ? amount : 0,
            upiAmount: method === 'UPI' ? amount : 0,
            description: `Expense (${expense.category}): ${expense.remarks || 'No remarks'} - Paid to: ${expense.payee}`,
            referenceId: expense._id,
            referenceModel: 'RestaurantExpense',
            createdBy: userId
          }
        ],
        { session }
      );

      // 3. Update aggregates directly on the Session model
      activeSession.expensesTotal += amount;
      if (method === 'CASH') {
        activeSession.cashExpensesTotal += amount;
      } else {
        activeSession.upiExpensesTotal += amount;
      }
      activeSession.expectedClosingCash = activeSession.openingCash + activeSession.cashSalesTotal - activeSession.cashExpensesTotal;
      activeSession.expectedClosingUpi = activeSession.upiSalesTotal - activeSession.upiExpensesTotal;
      activeSession.netPnL = activeSession.salesTotal - activeSession.expensesTotal;
      
      await activeSession.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[Restaurant Accounting]: Expense logged successfully. Total ₹${amount} via ${method}.`);
      return expense;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

export const restaurantAccountingService = new RestaurantAccountingService();
export default restaurantAccountingService;
