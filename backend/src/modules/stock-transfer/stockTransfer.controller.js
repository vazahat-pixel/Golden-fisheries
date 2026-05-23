import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { stockTransferService } from './stockTransfer.service.js';

export const stockTransferController = {
  create: asyncWrapper(async (req, res) => {
    const transfer = await stockTransferService.createTransfer(req.body, req.user.id);
    new ApiResponse(
      201,
      { transfer },
      'Stock transfer note created — awaiting approval'
    ).send(res);
  }),

  list: asyncWrapper(async (req, res) => {
    const result = await stockTransferService.listTransfers(req.query);
    new ApiResponse(200, result.docs, 'Stock transfers fetched', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const transfer = await stockTransferService.getTransferById(req.params.id);
    new ApiResponse(200, { transfer }, 'Stock transfer retrieved').send(res);
  }),

  approve: asyncWrapper(async (req, res) => {
    const transfer = await stockTransferService.approveTransfer(
      req.params.id,
      req.user.id,
      req.body?.notes
    );
    new ApiResponse(
      200,
      { transfer },
      'Transfer approved — procurement stock reduced, Fish Mall stock increased'
    ).send(res);
  }),

  cancel: asyncWrapper(async (req, res) => {
    const transfer = await stockTransferService.cancelTransfer(
      req.params.id,
      req.user.id,
      req.body.cancelReason
    );
    new ApiResponse(200, { transfer }, 'Stock transfer cancelled').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const transfer = await stockTransferService.updateDraft(
      req.params.id,
      req.body,
      req.user.id
    );
    new ApiResponse(200, { transfer }, 'Stock transfer updated').send(res);
  }),
};

export default stockTransferController;
