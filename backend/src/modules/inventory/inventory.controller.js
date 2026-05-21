import { inventoryService } from './inventory.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

export const inventoryController = {
  // Fetch live inventory stock levels
  getLiveStock: asyncWrapper(async (req, res) => {
    const result = await inventoryService.getLiveStockLevels(req.query);
    new ApiResponse(200, result.docs, 'Procurement stock levels fetched successfully', {
      ...result.meta,
      inventoryScope: 'PROCUREMENT',
    }).send(res);
  }),

  // Fetch auditable stock movement ledger transactions
  getTransactionHistory: asyncWrapper(async (req, res) => {
    const result = await inventoryService.getTransactionHistory(req.query);
    new ApiResponse(200, result.docs, 'Inventory transactions fetched successfully', result.meta).send(res);
  }),

  // Admin executes manual stock adjustments
  adjustStock: asyncWrapper(async (req, res) => {
    const { productId, quantityChange, remarks } = req.body;
    const result = await inventoryService.manualAdjustment(productId, quantityChange, remarks, req.user.id);
    new ApiResponse(200, result, 'Manual stock adjustment logged and applied successfully').send(res);
  })
};
