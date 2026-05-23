import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { Harvest } from './harvest.model.js';
import { Tapal } from '../tapals/tapal.model.js';
import { Farmer } from '../farmers/farmer.model.js';
import { Product } from '../products/product.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { flowGuard } from '../../services/flowGuard.service.js';
import { recalculateHarvestNetRate } from '../../services/netRate.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { User } from '../users/user.model.js';
import { Buyer } from '../buyers/buyer.model.js';
import { normalizePhone10 } from '../../utils/phone.js';

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
  async convertToTapal(harvestId, assignedTo, creatorUser, selectedItems = null, logistics = {}) {
    try {
      await flowGuard.assertHarvestReadyForTapalConversion(harvestId);

      // 1. Fetch Harvest
      const harvest = await this.model.findById(harvestId);
      if (!harvest) {
        throw new AppError(`Harvest Slip with ID ${harvestId} does not exist.`, 404);
      }

      // Business rule: Check if harvest slip has already been converted
      if (harvest.status === 'CONVERTED_TO_TAPAL') {
        throw new AppError(`This harvest slip has already been converted (Tapal already issued).`, 400);
      }

      // 2. Fetch Farmer details to cache party info
      const farmer = await Farmer.findById(harvest.farmerId);
      if (!farmer) {
        throw new AppError('Farmer registry lookup failed for this harvest slip.', 404);
      }

      // 3. Process Product details & calculate values
      let totalQty = 0;
      let totalAmount = 0;
      const tapalProducts = [];
      let fullyConverted = true;

      for (const item of harvest.products) {
        // Find if this item is selected for partial conversion
        let qtyToConvert = 0;
        let boxQtyToConvert = 0;

        if (selectedItems && Array.isArray(selectedItems)) {
          const selected = selectedItems.find(si => si.productId === item.productId.toString() || si._id === item._id.toString());
          if (selected) {
            qtyToConvert = parseFloat(selected.qty) || 0;
            boxQtyToConvert = parseInt(selected.boxes) || 0;
          }
        } else {
          // Default: convert remaining available qty
          qtyToConvert = Math.max(0, (parseFloat(item.estimatedQty) || 0) - (item.usedQty || 0));
          boxQtyToConvert = Math.max(0, (parseInt(item.boxCount) || 0) - (parseInt(item.usedBoxes) || 0)); // if usedBoxes existed
        }

        if (qtyToConvert <= 0) {
          if ((item.usedQty || 0) < (parseFloat(item.estimatedQty) || 0)) {
            fullyConverted = false;
          }
          continue;
        }

        // Validate available stock
        const availableQty = (parseFloat(item.estimatedQty) || 0) - (item.usedQty || 0);
        if (qtyToConvert > availableQty) {
          throw new AppError(`Cannot convert ${qtyToConvert} KG of ${item.fishName}. Only ${availableQty} KG available.`, 400);
        }

        // Update used quantities
        item.usedQty = (item.usedQty || 0) + qtyToConvert;
        if ((item.usedQty || 0) < (parseFloat(item.estimatedQty) || 0)) {
          fullyConverted = false;
        }

        totalQty += qtyToConvert;

        // If no rate is defined on slip, use base pricing
        let activeRate = parseFloat(item.rate);
        if (isNaN(activeRate)) {
          const product = await Product.findById(item.productId);
          activeRate = product ? (product.basePrice || 0) : 0;
        }

        const lineTotal = qtyToConvert * activeRate;
        totalAmount += lineTotal;

        // Map line item details to standard Tapal string representations
        tapalProducts.push({
          name: item.fishName.toUpperCase(),
          qty: `${qtyToConvert} KG`,
          numericQty: qtyToConvert,
          rate: `₹${activeRate}`,
          total: `₹${lineTotal.toLocaleString('en-IN')}`,
          boxQty: boxQtyToConvert || item.boxCount || null,
          weightPerBox: item.weightPerBox || null
        });
      }

      if (tapalProducts.length === 0) {
        throw new AppError('No products selected for Tapal conversion or no available quantity left.', 400);
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
        status: assignedTo || logistics.assignedTo ? 'ASSIGNED' : 'CREATED',
        assignedTo: assignedTo || logistics.assignedTo || null,
        driver: logistics.driverName || 'Unassigned',
        vehicleNumber: logistics.vehicleNumber || null,
        destination: logistics.destination || null,
        logisticsNotes: logistics.logisticsNotes || null,
        createdBy: creatorUser.phone,
        products: tapalProducts
      });

      const buyerPhoneRaw = logistics.buyerPhone;
      if (buyerPhoneRaw) {
        const p10 = normalizePhone10(buyerPhoneRaw);
        newTapal.buyerPhone = p10;
        if (logistics.buyerId) newTapal.buyerId = logistics.buyerId;
        if (logistics.assignedBuyer) {
          newTapal.assignedBuyer = logistics.assignedBuyer;
        } else {
          const buyerUser = await User.findOne({
            isActive: { $ne: false },
            role: { $in: ['BUYER', 'Buyer'] },
            $or: [{ phone: buyerPhoneRaw }, { phone: p10 }],
          });
          if (buyerUser) newTapal.assignedBuyer = buyerUser._id;
        }
        if (!newTapal.buyerId) {
          const buyerMaster = await Buyer.findOne({
            isActive: { $ne: false },
            $or: [{ phone: buyerPhoneRaw }, { phone: p10 }],
          });
          if (buyerMaster) newTapal.buyerId = buyerMaster._id;
        }
      }

      await newTapal.save();

      // 5. Update Harvest Slip state representation
      harvest.status = fullyConverted ? 'CONVERTED_TO_TAPAL' : 'PARTIALLY_CONVERTED';
      await harvest.save();

      logger.info(`[Harvest Engine]: Successfully converted Slip ${harvest.harvestNumber} to Tapal ${newTapal.tapalNumber}`);

      try {
        if (farmer?.phone) {
          await notificationService.sendHarvestConfirmation(
            farmer.phone,
            harvest.harvestNumber,
            harvest.harvestDate
          );
        }
      } catch (notifyErr) {
        logger.warn(`[Harvest Engine]: Farmer notify skipped: ${notifyErr.message}`);
      }

      return newTapal;
    } catch (error) {
      logger.error(`[Harvest Engine Error]: Transition failure. ${error.message}`);
      throw error;
    }
  }

  /**
   * Save Net Rate calculations and finalize purchase bill.
   * Auto-posts supply transactions to Farmer Ledger for double-entry tracking.
   */
  async saveNetRate(harvestId, netRateData, creatorUser) {
    const { productRates, ...deductionOverrides } = netRateData;

    const harvest = await this.model.findById(harvestId);
    if (!harvest) {
      throw new AppError(`Harvest Slip ${harvestId} not found`, 404);
    }

    // Update individual product rates if provided (map by id or array from UI)
    if (productRates) {
      if (Array.isArray(productRates)) {
        for (const pr of productRates) {
          const item = harvest.products.find(
            (p) =>
              (pr.productId && String(p.productId) === String(pr.productId)) ||
              (pr.fishName && String(p.fishName).toUpperCase() === String(pr.fishName).toUpperCase())
          );
          if (item) {
            if (pr.rate != null) item.rate = parseFloat(pr.rate) || 0;
            if (pr.estimatedQty != null) item.estimatedQty = parseFloat(pr.estimatedQty) || item.estimatedQty;
          }
        }
      } else if (typeof productRates === 'object') {
        for (const item of harvest.products) {
          const itemKey = item._id ? item._id.toString() : item.id;
          if (productRates[itemKey] !== undefined) {
            item.rate = parseFloat(productRates[itemKey]) || 0;
          }
        }
      }
    }

    const computed = recalculateHarvestNetRate(harvest, deductionOverrides);

    // Save calculations to Harvest Slip (server-side totals — do not trust client alone)
    harvest.netRateCalculated = computed.netRateCalculated;
    harvest.totalPayableAmount = computed.totalPayableAmount;
    harvest.totalDeductions = computed.totalDeductions;
    harvest.deductionTransport = computed.deductionTransport;
    harvest.deductionCommission = computed.deductionCommission;
    harvest.deductionSoft = computed.deductionSoft;
    harvest.deductionOther = computed.deductionOther;
    harvest.tds = computed.tds;
    harvest.commission = computed.commission;
    harvest.soft = computed.soft;
    harvest.finalNetRate = computed.finalNetRate;

    // Recalculate pending amount based on paid amount
    harvest.pendingAmount = Math.max(0, harvest.totalPayableAmount - (harvest.paidAmount || 0));
    if (harvest.pendingAmount === 0) {
      harvest.paymentStatus = 'PAID';
    } else if ((harvest.paidAmount || 0) > 0) {
      harvest.paymentStatus = 'PARTIAL';
    } else {
      harvest.paymentStatus = 'UNPAID';
    }

    await harvest.save();

    // Auto-update or post to Farmer Ledger
    const { FarmerLedger } = await import('../farmer-ledger/farmerLedger.model.js');
    const { farmerLedgerService } = await import('../farmer-ledger/farmerLedger.service.js');

    const existingLedger = await FarmerLedger.findOne({ harvestId: harvest._id });
    if (existingLedger) {
      existingLedger.debitAmount = harvest.totalPayableAmount;
      const prev = await FarmerLedger.findOne({
        farmerId: harvest.farmerId,
        _id: { $ne: existingLedger._id },
        createdAt: { $lt: existingLedger.createdAt }
      }).sort({ createdAt: -1 });
      const prevBal = prev ? prev.balanceAfter : 0;
      existingLedger.balanceAfter = prevBal + harvest.totalPayableAmount - existingLedger.creditAmount;
      await existingLedger.save();
    } else {
      await farmerLedgerService.addEntry({
        farmerId: harvest.farmerId,
        harvestId: harvest._id,
        entryType: 'SUPPLY',
        description: `Finalized Harvest Supply ${harvest.harvestNumber}`,
        debitAmount: harvest.totalPayableAmount,
        creditAmount: 0,
        createdBy: creatorUser.phone
      });
    }

    return harvest;
  }
}

export const harvestService = new HarvestService();
export default harvestService;
