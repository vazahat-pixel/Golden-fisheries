import { farmerLedgerService } from './farmerLedger.service.js';
import { harvestService } from '../harvests/harvest.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Harvest } from '../harvests/harvest.model.js';

export const farmerLedgerController = {
  // Get summary of all farmers' balances
  summary: asyncWrapper(async (req, res) => {
    const summary = await farmerLedgerService.getFarmersSummary();
    new ApiResponse(200, summary, 'Farmers summary fetched successfully').send(res);
  }),

  // Get full statement for a farmer
  getLedger: asyncWrapper(async (req, res) => {
    const result = await farmerLedgerService.getFarmerLedger(req.params.farmerId, req.query);
    new ApiResponse(200, result.docs, 'Farmer ledger statement fetched successfully', result.meta).send(res);
  }),

  // Manual payment or adjustment entry
  createPayment: asyncWrapper(async (req, res) => {
    const { farmerId, creditAmount, description, harvestId } = req.body;
    
    // Add transaction ledger record
    const entry = await farmerLedgerService.addEntry({
      farmerId,
      harvestId: harvestId || null,
      entryType: 'PAYMENT',
      description: description || 'Cash/Online Payment to Farmer',
      debitAmount: 0,
      creditAmount: parseFloat(creditAmount) || 0,
      createdBy: req.user.phone
    });

    // If payment is linked to a specific harvest slip, let's update that harvest's paid/pending balances
    if (harvestId) {
      const harvest = await Harvest.findById(harvestId);
      if (harvest) {
        harvest.paidAmount = (harvest.paidAmount || 0) + (parseFloat(creditAmount) || 0);
        harvest.pendingAmount = Math.max(0, (harvest.totalPayableAmount || 0) - harvest.paidAmount);
        if (harvest.pendingAmount === 0) {
          harvest.paymentStatus = 'PAID';
        } else if (harvest.paidAmount > 0) {
          harvest.paymentStatus = 'PARTIAL';
        }
        await harvest.save();
      }
    }

    new ApiResponse(200, entry, 'Payment ledger entry created successfully').send(res);
  })
};
