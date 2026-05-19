import { BaseService } from '../../services/base.service.js';
import { FarmerLedger } from './farmerLedger.model.js';
import { Farmer } from '../farmers/farmer.model.js';
import { Harvest } from '../harvests/harvest.model.js';
import { AppError } from '../../utils/appError.js';

class FarmerLedgerService extends BaseService {
  constructor() {
    super(FarmerLedger);
  }

  /**
   * Records a ledger entry for a farmer and dynamically computes the running balance.
   */
  async addEntry(data) {
    const { farmerId, harvestId, entryType, description, debitAmount = 0, creditAmount = 0, createdBy } = data;

    // Verify farmer exists
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      throw new AppError('Farmer not found in registry', 404);
    }

    // Get previous entry for running balance
    const lastEntry = await this.model.findOne({ farmerId }).sort({ createdAt: -1 });
    const previousBalance = lastEntry ? lastEntry.balanceAfter : 0;

    // Running Balance = Previous Balance + Debit (what we owe them) - Credit (what we paid them)
    const balanceAfter = previousBalance + debitAmount - creditAmount;

    const entry = await this.create({
      farmerId,
      harvestId,
      entryType,
      description,
      debitAmount,
      creditAmount,
      balanceAfter,
      createdBy
    });

    return entry;
  }

  /**
   * Fetch full ledger statement for a farmer
   */
  async getFarmerLedger(farmerId, queryParams) {
    const { page = 1, limit = 50 } = queryParams;
    return await this.findMany({ farmerId }, { page, limit, sort: { createdAt: 1 } }, 'harvestId');
  }

  /**
   * Get dynamic ledger balances summary for all active farmers
   */
  async getFarmersSummary() {
    const summary = await this.model.aggregate([
      {
        $sort: { createdAt: 1 }
      },
      {
        $group: {
          _id: '$farmerId',
          totalSupplied: { $sum: '$debitAmount' },
          totalPaid: { $sum: '$creditAmount' },
          lastEntry: { $last: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'farmers',
          localField: '_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $unwind: '$farmer'
      },
      {
        $project: {
          _id: 1,
          farmerCode: '$farmer.farmerCode',
          fullName: '$farmer.fullName',
          phone: '$farmer.phone',
          location: '$farmer.location',
          totalSupplied: 1,
          totalPaid: 1,
          balanceDue: '$lastEntry.balanceAfter'
        }
      }
    ]);
    return summary;
  }
}

export const farmerLedgerService = new FarmerLedgerService();
export default farmerLedgerService;
