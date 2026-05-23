import mongoose from 'mongoose';
import { FishMallSession, FishMallCashbookEntry, FishMallExpense } from './fishMallAccounting.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

class FishMallAccountingService {
  /**
   * Fetches the currently active open session for a cashier
   */
  async getActiveSession(userId, outletId) {
    return await FishMallSession.findOne({
      cashierId: userId,
      outletId,
      status: 'OPEN'
    });
  }

  /**
   * Opens a new shift/session for the cashier
   */
  async openSession(userId, outletId, sessionData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Guard: Check if cashier already has an active open session
      const existing = await FishMallSession.findOne({
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
      const [fmSession] = await FishMallSession.create(
        [
          {
            cashierId: userId,
            outletId,
            status: 'OPEN',
            openingCash,
            openingNotes: sessionData.openingNotes || '',
            expectedClosingCash: openingCash
          }
        ],
        { session }
      );

      // Record first inflow entry in Cashbook (Opening cash float)
      await FishMallCashbookEntry.create(
        [
          {
            sessionId: fmSession._id,
            outletId,
            type: 'INFLOW',
            category: 'OPENING_BALANCE',
            paymentMethod: 'CASH',
            amount: openingCash,
            cashAmount: openingCash,
            description: `Shift Opening Cash Float: ${fmSession.sessionNumber}`,
            referenceId: fmSession._id,
            referenceModel: 'FishMallSession',
            createdBy: userId
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(`[FishMall Accounting]: Cashier shift session ${fmSession.sessionNumber} opened with ₹${openingCash} opening cash.`);
      return fmSession;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Closes the shift session and aggregates physical totals vs expected cashbook tallies
   */
  async closeSession(userId, outletId, closeData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const activeSession = await FishMallSession.findOne({
        cashierId: userId,
        outletId,
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
      const ledger = await FishMallCashbookEntry.find({
        sessionId: activeSession._id
      }).session(session);

      // 2. Compute exact aggregates from cashbook entries
      let salesTotal = 0;
      let cashSalesTotal = 0;
      let upiSalesTotal = 0;
      let cardSalesTotal = 0;

      let expensesTotal = 0;
      let cashExpensesTotal = 0;
      let upiExpensesTotal = 0;

      let transfersTotal = 0;

      for (const entry of ledger) {
        if (entry.category === 'RETAIL_SALE') {
          salesTotal += entry.amount;
          cashSalesTotal += entry.cashAmount || 0;
          upiSalesTotal += entry.upiAmount || 0;
          cardSalesTotal += entry.cardAmount || 0;
        } else if (entry.category === 'EXPENSE') {
          expensesTotal += entry.amount;
          cashExpensesTotal += entry.cashAmount || 0;
          upiExpensesTotal += entry.upiAmount || 0;
        } else if (entry.category === 'INTERNAL_TRANSFER') {
          transfersTotal += entry.amount;
        }
      }

      // Expected Cash Balance = Opening + Cash Sales - Cash Expenses
      const expectedClosingCash = activeSession.openingCash + cashSalesTotal - cashExpensesTotal;
      const expectedClosingUpi = upiSalesTotal - upiExpensesTotal;

      const cashDiscrepancy = expectedClosingCash - actualClosingCash;
      const upiDiscrepancy = expectedClosingUpi - actualClosingUpi;

      const grossRevenue = salesTotal + transfersTotal;
      const netPnL = grossRevenue - expensesTotal;

      // 3. Update active session details
      activeSession.status = 'CLOSED';
      activeSession.closingDate = new Date();
      activeSession.closingNotes = closeData.closingNotes || '';

      activeSession.salesTotal = salesTotal;
      activeSession.cashSalesTotal = cashSalesTotal;
      activeSession.upiSalesTotal = upiSalesTotal;
      activeSession.cardSalesTotal = cardSalesTotal;

      activeSession.expensesTotal = expensesTotal;
      activeSession.cashExpensesTotal = cashExpensesTotal;
      activeSession.upiExpensesTotal = upiExpensesTotal;

      activeSession.transfersTotal = transfersTotal;

      activeSession.expectedClosingCash = expectedClosingCash;
      activeSession.expectedClosingUpi = expectedClosingUpi;

      activeSession.actualClosingCash = actualClosingCash;
      activeSession.actualClosingUpi = actualClosingUpi;

      activeSession.cashDiscrepancy = cashDiscrepancy;
      activeSession.upiDiscrepancy = upiDiscrepancy;

      activeSession.grossRevenue = grossRevenue;
      activeSession.netPnL = netPnL;

      await activeSession.save({ session });

      // Create a final closing log cashbook entry
      await FishMallCashbookEntry.create(
        [
          {
            sessionId: activeSession._id,
            outletId,
            type: 'OUTFLOW',
            category: 'CLOSING_SESSION',
            paymentMethod: 'MIXED',
            amount: actualClosingCash + actualClosingUpi,
            cashAmount: actualClosingCash,
            upiAmount: actualClosingUpi,
            description: `Shift Closing Session Cash Tally: ${activeSession.sessionNumber}`,
            referenceId: activeSession._id,
            referenceModel: 'FishMallSession',
            createdBy: userId
          }
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      logger.info(`[FishMall Accounting]: Session ${activeSession.sessionNumber} closed successfully. Sales: ₹${salesTotal}, Expenses: ₹${expensesTotal}, Variance: ₹${cashDiscrepancy + upiDiscrepancy}.`);
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
    const activeSession = await FishMallSession.findById(sessionId);
    if (!activeSession) {
      throw new AppError('Session shift not found', 404);
    }

    const cashbook = await FishMallCashbookEntry.find({ sessionId }).sort({ createdAt: -1 });
    const expenses = await FishMallExpense.find({ sessionId }).sort({ createdAt: -1 });

    return {
      session: activeSession,
      cashbook,
      expenses
    };
  }

  /**
   * Records a new petty expense for the store under the current active session
   */
  async recordExpense(userId, outletId, expenseData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const activeSession = await this.getActiveSession(userId, outletId);
      if (!activeSession) {
        throw new AppError('Operations are locked! Day cannot start without opening balance. Please open shift first.', 400);
      }

      const amount = parseFloat(expenseData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new AppError('Expense amount must be a positive number', 400);
      }

      // 1. Create FishMallExpense document
      const [expense] = await FishMallExpense.create(
        [
          {
            sessionId: activeSession._id,
            outletId,
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
      await FishMallCashbookEntry.create(
        [
          {
            sessionId: activeSession._id,
            outletId,
            type: 'OUTFLOW',
            category: 'EXPENSE',
            paymentMethod: method,
            amount,
            cashAmount: method === 'CASH' ? amount : 0,
            upiAmount: method === 'UPI' ? amount : 0,
            description: `Expense (${expense.category}): ${expense.remarks || 'No remarks'} - Paid to: ${expense.payee}`,
            referenceId: expense._id,
            referenceModel: 'FishMallExpense',
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
      
      await activeSession.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[FishMall Accounting]: Expense FME logged successfully. Total ₹${amount} via ${method}.`);
      return expense;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Appends an internal transfer supply bill credit entry directly in cashbook
   */
  async recordInternalTransfer(activeSession, invoiceNumber, totalAmount, userId, session) {
    // Record internal transfers which do NOT update physical cash, but count under P&L accounting credit ledger
    await FishMallCashbookEntry.create(
      [
        {
          sessionId: activeSession._id,
          outletId: activeSession.outletId,
          type: 'INFLOW',
          category: 'INTERNAL_TRANSFER',
          paymentMethod: 'CARD', // Maps to internal transfer account credit
          amount: totalAmount,
          description: `Internal Transfer Supply Bill: ${invoiceNumber} → Restaurant`,
          referenceId: null, // Linked via custom hook
          referenceModel: 'InternalSupplyBill',
          createdBy: userId
        }
      ],
      { session }
    );

    activeSession.transfersTotal += totalAmount;
    activeSession.grossRevenue = activeSession.salesTotal + activeSession.transfersTotal;
    activeSession.netPnL = activeSession.grossRevenue - activeSession.expensesTotal;
    await activeSession.save({ session });
  }
}

export const fishMallAccountingService = new FishMallAccountingService();
export default fishMallAccountingService;
