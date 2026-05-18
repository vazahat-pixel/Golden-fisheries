import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { Billing } from './billing.model.js';
import { Tapal } from '../tapals/tapal.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

class BillingService extends BaseService {
  constructor() {
    super(Billing);
  }

  /**
   * Search and filter Billing Invoices
   */
  async findInvoicesWithFilters(queryParams) {
    const { page = 1, limit = 10, search, type, paymentStatus } = queryParams;
    const filter = {};

    if (type) filter.type = type;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { invoiceNumber: searchRegex },
        { partyName: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit });
  }

  /**
   * Safe Transaction: Generates Invoices and triggers real stock adjustments with audit logs.
   */
  async createInvoice(invoiceData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // BUSINESS RULE: Billing only after delivery — verify Tapal status
      if (invoiceData.tapalId) {
        const linkedTapal = await Tapal.findById(invoiceData.tapalId).session(session);
        if (!linkedTapal) throw new AppError('Tapal not found for billing', 404);

        const billableStatuses = ['DELIVERED', 'BILL_PENDING', 'COMPLETED'];
        if (!billableStatuses.includes(linkedTapal.status)) {
          throw new AppError(
            `Billing blocked: Tapal must be DELIVERED before an invoice can be raised. Current status: ${linkedTapal.status}`,
            400
          );
        }

        // Auto-resolve harvestId from Tapal for permanent chain linkage
        if (!invoiceData.harvestId && linkedTapal.harvestId) {
          invoiceData.harvestId = linkedTapal.harvestId;
        }
      }

      // 1. Compute subtotals and totals
      let subtotal = 0;
      const verifiedItems = [];

      for (const item of invoiceData.items) {
        const lineTotal = item.quantity * item.rate;
        subtotal += lineTotal;
        verifiedItems.push({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          rate: item.rate,
          amount: lineTotal
        });
      }

      const taxRate = invoiceData.taxRate || 5; // Default 5% GST
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      const paidAmount = invoiceData.paidAmount || 0;
      const balanceAmount = totalAmount - paidAmount;

      let paymentStatus = 'PENDING';
      if (paidAmount > 0) {
        paymentStatus = balanceAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';
      }

      // 2. Instantiate and save Billing Invoice
      const invoice = new Billing({
        type: invoiceData.type,
        tapalId: invoiceData.tapalId || null,
        harvestId: invoiceData.harvestId || null,
        partyName: invoiceData.partyName,
        partyId: invoiceData.partyId || null,
        items: verifiedItems,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paymentStatus,
        paymentMethod: invoiceData.paymentMethod || 'CASH',
        paidAmount,
        balanceAmount,
        dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 day terms
        createdBy: userId,
        remarks: invoiceData.remarks || ''
      });

      await invoice.save({ session });

      // 3. Automated Stock Movements via Inventory Trigger Engine
      const stockChangeType = invoice.type === 'SALES' ? 'SALES_OUT' : 'PROCUREMENT_IN';
      
      for (const item of invoice.items) {
        // Stock reduction is negative, additions positive
        const stockChangeQty = invoice.type === 'SALES' ? -item.quantity : item.quantity;

        // Execute inventory adjust atomically within our active transaction session
        await inventoryService.adjustStock(
          item.productId,
          stockChangeQty,
          stockChangeType,
          {
            referenceId: invoice._id,
            referenceModel: 'Billing',
            session
          },
          userId,
          `Stock adjusted dynamically via Invoice ${invoice.invoiceNumber}`
        );
      }

      // 4. Update parent Tapal status to COMPLETED if linked to logistics
      if (invoice.tapalId) {
        await Tapal.findByIdAndUpdate(
          invoice.tapalId,
          { status: 'COMPLETED' },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      logger.info(`[Billing Engine]: Invoice ${invoice.invoiceNumber} created. Total: ₹${totalAmount}. Inventory updated.`);
      return invoice;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`[Billing Engine Error]: Transaction rollback. ${error.message}`);
      throw error;
    }
  }

  /**
   * Safe Transaction: Update Payment Status and tracking parameters
   */
  async updatePayment(invoiceId, updateData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoice = await this.model.findById(invoiceId).session(session);
      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      const newPaidAmount = (invoice.paidAmount || 0) + (updateData.paymentAmount || 0);
      if (newPaidAmount > invoice.totalAmount) {
        throw new AppError(`Payment Overflow: Paid amount ₹${newPaidAmount} exceeds total amount ₹${invoice.totalAmount}`, 400);
      }

      const balance = invoice.totalAmount - newPaidAmount;

      invoice.paidAmount = newPaidAmount;
      invoice.balanceAmount = balance;
      invoice.paymentMethod = updateData.paymentMethod || invoice.paymentMethod;

      if (balance === 0) {
        invoice.paymentStatus = 'PAID';
      } else if (newPaidAmount > 0) {
        invoice.paymentStatus = 'PARTIALLY_PAID';
      }

      await invoice.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[Billing Ledger]: Applied payment of ₹${updateData.paymentAmount} to Invoice ${invoice.invoiceNumber}. Balance remains: ₹${balance}`);
      return invoice;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

export const billingService = new BillingService();
export default billingService;
