import { billingService } from './billing.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { AppError } from '../../utils/appError.js';
import { aliasBillingResponse } from '../../utils/apiAliases.js';

export const billingController = {
  // Create a new Billing Invoice
  create: asyncWrapper(async (req, res) => {
    const invoice = await billingService.createInvoice(req.body, req.user.id);
    new ApiResponse(201, { invoice: aliasBillingResponse(invoice) }, 'Billing invoice created successfully').send(res);
  }),

  // Fetch all Invoices with filters and pagination
  all: asyncWrapper(async (req, res) => {
    const result = await billingService.findInvoicesWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Invoices fetched successfully', result.meta).send(res);
  }),

  // Retrieve details of a single Invoice by ID
  getById: asyncWrapper(async (req, res) => {
    const invoice = await billingService.findById(req.params.id);
    new ApiResponse(200, { invoice: aliasBillingResponse(invoice) }, 'Invoice retrieved successfully').send(res);
  }),

  // Record a payment installment on an Invoice
  patchPayment: asyncWrapper(async (req, res) => {
    const invoice = await billingService.updatePayment(req.params.id, req.body, req.user.id);
    new ApiResponse(200, { invoice: aliasBillingResponse(invoice) }, 'Payment recorded successfully').send(res);
  }),

  // Public payment recording
  patchPaymentPublic: asyncWrapper(async (req, res) => {
    const invoice = await billingService.findById(req.params.id);
    if (!invoice) throw new AppError('Invoice not found', 404);
    
    const remaining = invoice.totalAmount - (invoice.paidAmount || 0);
    
    const updatedInvoice = await billingService.updatePayment(req.params.id, {
      paymentAmount: remaining,
      paymentMethod: req.body.paymentMethod || 'UPI'
    }, null);
    
    new ApiResponse(200, { invoice: aliasBillingResponse(updatedInvoice) }, 'Payment recorded successfully').send(res);
  })
};
