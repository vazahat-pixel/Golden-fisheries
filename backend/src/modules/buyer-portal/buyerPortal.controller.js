import { buyerPortalService } from './buyerPortal.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { aliasTapalResponse } from '../../utils/apiAliases.js';

export const buyerPortalController = {
  assignedTapals: asyncWrapper(async (req, res) => {
    const result = await buyerPortalService.getAssignedTapals(req.user, req.query);
    const rows = result.docs.map((t) => aliasTapalResponse(t));
    new ApiResponse(200, rows, 'Assigned tapals fetched', result.meta).send(res);
  }),

  assignableTapals: asyncWrapper(async (req, res) => {
    const result = await buyerPortalService.getAssignableTapals(req.user, req.query);
    const rows = result.docs.map((t) => aliasTapalResponse(t));
    new ApiResponse(200, rows, 'Assignable tapals fetched', result.meta).send(res);
  }),

  lookupTapal: asyncWrapper(async (req, res) => {
    const result = await buyerPortalService.lookupTapalByNumber(req.user, req.query.tapalNumber);
    const payload = {
      tapal: result.tapal ? aliasTapalResponse(result.tapal) : null,
      canClaim: result.canClaim,
      alreadyYours: result.alreadyYours,
      belongsToOther: result.belongsToOther,
    };
    new ApiResponse(200, payload, 'Tapal lookup complete').send(res);
  }),

  claimTapal: asyncWrapper(async (req, res) => {
    const tapal = await buyerPortalService.claimTapalByNumber(req.user, req.body.tapalNumber);
    new ApiResponse(200, { tapal: aliasTapalResponse(tapal) }, 'Tapal linked to your account').send(res);
  }),

  submitVerification: asyncWrapper(async (req, res) => {
    const verification = await buyerPortalService.submitVerification(
      req.params.tapalId,
      req.user,
      req.body
    );
    new ApiResponse(200, { verification }, 'Buyer verification submitted').send(res);
  }),

  createBill: asyncWrapper(async (req, res) => {
    const bill = await buyerPortalService.createBuyerBill(req.params.tapalId, req.user, req.body);
    new ApiResponse(201, { bill }, 'Buyer bill created').send(res);
  }),

  listBills: asyncWrapper(async (req, res) => {
    const result = await buyerPortalService.listBills(req.user, req.query);
    new ApiResponse(200, result.docs, 'Buyer bills fetched', result.meta).send(res);
  }),

  createReturn: asyncWrapper(async (req, res) => {
    const salesReturn = await buyerPortalService.createSalesReturn(req.user, req.body);
    new ApiResponse(201, { salesReturn }, 'Sales return submitted').send(res);
  }),

  listReturns: asyncWrapper(async (req, res) => {
    const result = await buyerPortalService.listReturns(req.user, req.query);
    new ApiResponse(200, result.docs, 'Sales returns fetched', result.meta).send(res);
  }),

  approveReturn: asyncWrapper(async (req, res) => {
    const salesReturn = await buyerPortalService.approveSalesReturn(req.params.id, req.user._id);
    new ApiResponse(200, { salesReturn }, 'Sales return approved and stock restored').send(res);
  }),

  reconciliation: asyncWrapper(async (req, res) => {
    const data = await buyerPortalService.getBuyerReconciliation(req.user);
    new ApiResponse(200, data, 'Buyer reconciliation summary').send(res);
  }),

  adminReturns: asyncWrapper(async (req, res) => {
    const result = await buyerPortalService.listAllReturnsAdmin(req.query);
    new ApiResponse(200, result.docs, 'All sales returns', result.meta).send(res);
  }),

  adminSalesOverview: asyncWrapper(async (req, res) => {
    const data = await buyerPortalService.getAdminSalesOverview();
    new ApiResponse(200, data, 'Buyer sales overview').send(res);
  }),

  adminListBills: asyncWrapper(async (req, res) => {
    const result = await buyerPortalService.listAllBillsAdmin(req.query);
    new ApiResponse(200, result.docs, 'All buyer bills', result.meta).send(res);
  }),

  adminSaleByTapal: asyncWrapper(async (req, res) => {
    const data = await buyerPortalService.getAdminSaleByTapal(req.params.tapalId);
    new ApiResponse(200, data, 'Buyer sale for tapal').send(res);
  }),

  markBillPaid: asyncWrapper(async (req, res) => {
    const bill = await buyerPortalService.markBillPaid(req.params.id, req.user, req.body);
    new ApiResponse(200, { bill }, 'Buyer bill marked as paid').send(res);
  }),
};
