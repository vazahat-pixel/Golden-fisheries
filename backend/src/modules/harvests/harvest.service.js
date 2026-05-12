import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { Harvest } from './harvest.model.js';
import { Tapal } from '../tapals/tapal.model.js';
import { Farmer } from '../farmers/farmer.model.js';
import { Product } from '../products/product.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

class HarvestService extends BaseService {
  constructor() {
    super(Harvest);
  }

  /**
   * Fetches harvests matching specific filters, supporting pagination, text searching, and date ranges.
   */
  async findHarvestsWithFilters(queryParams) {
    const { page = 1, limit = 10, search, status, startDate, endDate } = queryParams;
    const filter = {};

    // 1. Filter by Status
    if (status) {
      filter.status = status;
    }

    // 2. Filter by Date Range
    if (startDate || endDate) {
      filter.harvestDate = {};
      if (startDate) filter.harvestDate.$gte = new Date(startDate);
      if (endDate) filter.harvestDate.$lte = new Date(endDate);
    }

    // 3. Search by Farmer name, code, or Harvest number
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // We perform lookup matches on farmer records to return matching harvests
      const matchingFarmers = await Farmer.find({
        $or: [
          { fullName: searchRegex },
          { farmerCode: searchRegex }
        ]
      }).select('_id');

      const farmerIds = matchingFarmers.map(f => f._id);

      filter.$or = [
        { harvestNumber: searchRegex },
        { pickupLocation: searchRegex },
        { farmerId: { $in: farmerIds } }
      ];
    }

    return await this.findMany(filter, { page, limit }, 'farmerId');
  }

  /**
   * Safe transaction-controlled conversion from Harvest Slip to Purchase Tapal contract.
   * Leverages MongoDB Multi-Document ACID Transactions to guarantee data integrity.
   */
  async convertToTapal(harvestId, creatorUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch Harvest and lock it in session
      const harvest = await this.model.findById(harvestId).session(session);
      if (!harvest) {
        throw new AppError(`Harvest Slip with ID ${harvestId} does not exist.`, 404);
      }

      // Business rule: Check if harvest slip has already been converted
      if (harvest.status === 'CONVERTED_TO_TAPAL') {
        throw new AppError(`This harvest slip has already been converted (Tapal already issued).`, 400);
      }

      // Business rule: Harvest slip must be in 'CONFIRMED' state to trigger downstream logistics Tapals
      if (harvest.status !== 'CONFIRMED') {
        throw new AppError(`Procurement workflow block: Harvest slip status must be CONFIRMED before generating a Tapal. Current status: ${harvest.status}`, 400);
      }

      // 2. Fetch Farmer details to cache party info
      const farmer = await Farmer.findById(harvest.farmerId).session(session);
      if (!farmer) {
        throw new AppError('Farmer registry lookup failed for this harvest slip.', 404);
      }

      // 3. Process Product details & calculate values
      let totalQty = 0;
      let totalAmount = 0;
      const tapalProducts = [];

      for (const item of harvest.products) {
        totalQty += item.estimatedQty;

        // If no rate is defined on slip, use base pricing
        let activeRate = item.rate;
        if (activeRate === null || activeRate === undefined) {
          const product = await Product.findById(item.productId).session(session);
          if (!product) {
            throw new AppError(`Product lookup failed for ID: ${item.productId}`, 404);
          }
          activeRate = product.basePrice;
        }

        const lineTotal = item.estimatedQty * activeRate;
        totalAmount += lineTotal;

        // Map line item details to standard Tapal string representations
        tapalProducts.push({
          name: item.fishName.toUpperCase(),
          qty: `${item.estimatedQty} KG`,
          rate: `₹${activeRate}`,
          total: `₹${lineTotal.toLocaleString('en-IN')}`
        });
      }

      // 4. Instantiate the Purchase Tapal Record
      const newTapal = new Tapal({
        type: 'Purchase',
        harvestId: harvest._id,
        partyName: farmer.fullName,
        farmerId: farmer._id,
        qty: `${totalQty} KG`,
        numericQty: totalQty,
        amount: `₹${totalAmount.toLocaleString('en-IN')}`,
        numericAmount: totalAmount,
        status: 'Pending Approval', // Initially requires admin rate/weight lock confirmation
        driver: 'Unassigned',
        createdBy: creatorUser.phone, // Track auditing details
        products: tapalProducts
      });

      // Save new Tapal
      await newTapal.save({ session });

      // 5. Update Harvest Slip state representation
      harvest.status = 'CONVERTED_TO_TAPAL';
      await harvest.save({ session });

      // Commit operations
      await session.commitTransaction();
      session.endSession();

      logger.info(`[Harvest Engine]: Successfully converted Slip ${harvest.harvestNumber} to Tapal ${newTapal.tapalNumber}`);
      return newTapal;
    } catch (error) {
      // Abort active changes
      await session.abortTransaction();
      session.endSession();
      logger.error(`[Harvest Engine Error]: Transition failure. ${error.message}`);
      throw error;
    }
  }
}

export const harvestService = new HarvestService();
export default harvestService;
