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

  _harvestQuantities(harvest) {
    const totalEstWeight = harvest.products.reduce((sum, item) => sum + (item.estimatedQty || 0), 0);
    const availableQty = harvest.availableQty || totalEstWeight || 1;
    const remainingQty = availableQty - (harvest.allocatedQty || 0);
    return { totalEstWeight, availableQty, remainingQty };
  }

  _productRemaining(harvest, item, availableQty, remainingQty) {
    if ((item.usedQty || 0) > 0) {
      return Math.max(0, (item.estimatedQty || 0) - item.usedQty);
    }
    return availableQty > 0 ? (item.estimatedQty || 0) * (remainingQty / availableQty) : 0;
  }

  async _resolveItemRate(item, session) {
    let activeRate = parseFloat(item.rate);
    if (isNaN(activeRate) || activeRate === null) {
      const product = await Product.findById(item.productId).session(session);
      activeRate = product ? (product.basePrice || 0) : 0;
    }
    return activeRate;
  }

  _mergeIntoProductMap(productMap, item, qty, activeRate) {
    // Key by fish name and count so different counts of PRAWNS stay separate line items
    const countKey = (item.count || '').toString().trim();
    const key = `${String(item.productId)}:${(item.fishName || '').toUpperCase()}:${countKey}`;
    const boxRatio = (item.estimatedQty || 0) > 0 ? qty / item.estimatedQty : 0;
    const scaledBoxes = (item.boxCount || 0) * boxRatio;
    const lineTotal = qty * activeRate;

    if (!productMap[key]) {
      productMap[key] = {
        productId: item.productId,
        fishName: item.fishName,
        hsnCode: item.hsnCode,
        count: countKey,
        numericQty: 0,
        boxQty: 0,
        rate: activeRate,
        weightPerBox: item.weightPerBox || null,
        qualityType: item.qualityType || 'Mix',
        totalAmount: 0,
      };
    }

    productMap[key].numericQty += qty;
    productMap[key].boxQty += scaledBoxes;
    productMap[key].totalAmount += lineTotal;
  }

  /**
   * Safe transaction-controlled conversion from Harvest Slip to Purchase Tapal contract.
   * Leverages MongoDB Multi-Document ACID Transactions to guarantee data integrity.
   */
  /**
   * Create a purchase Tapal contract from multiple harvest slip allocations (Many-to-Many).
   */
  async createTapalFromHarvests(allocations, logistics = {}, creatorUser) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
        throw new AppError('Allocations list is required and cannot be empty.', 400);
      }

      // 1. Validate all harvests and verify stock availability
      const harvestIds = allocations.map(a => a.harvestId);
      const harvests = await this.model.find({ _id: { $in: harvestIds } }).session(session);
      
      if (harvests.length !== new Set(harvestIds.map(id => String(id))).size) {
        throw new AppError('One or more selected Harvest Slips do not exist.', 404);
      }

      // 2. Fetch Farmer details using the first harvest
      const firstHarvest = harvests.find(h => String(h._id) === String(allocations[0].harvestId));
      const farmer = await Farmer.findById(firstHarvest.farmerId).session(session);
      if (!farmer) {
        throw new AppError('Farmer registry lookup failed for the first harvest slip.', 404);
      }

      let totalQty = 0;
      let totalAmount = 0;
      const productMap = {};

      // 3. Process allocations one by one
      for (const allocation of allocations) {
        const harvest = harvests.find(h => String(h._id) === String(allocation.harvestId));
        const { availableQty, remainingQty } = this._harvestQuantities(harvest);
        const hasProductBreakdown =
          Array.isArray(allocation.products) && allocation.products.length > 0;
        let allocatedQty = 0;

        if (hasProductBreakdown) {
          for (const prodAlloc of allocation.products) {
            const qty = parseFloat(prodAlloc.allocatedQty) || 0;
            if (qty <= 0) continue;

            let item = null;
            if (prodAlloc.lineItemId) {
              item = harvest.products.find(
                (p) => String(p._id) === String(prodAlloc.lineItemId)
              );
            }
            if (!item) {
              item = harvest.products.find(
                (p) =>
                  (prodAlloc.productId && String(p.productId) === String(prodAlloc.productId)) ||
                  (prodAlloc.fishName &&
                    p.fishName?.toUpperCase() === String(prodAlloc.fishName).toUpperCase())
              );
            }
            if (!item) {
              throw new AppError(
                `Product not found on Harvest ${harvest.harvestNumber}`,
                400
              );
            }

            const productRemaining = this._productRemaining(
              harvest,
              item,
              availableQty,
              remainingQty
            );
            if (qty > productRemaining + 0.001) {
              throw new AppError(
                `Cannot allocate ${qty} KG of ${item.fishName} from Harvest ${harvest.harvestNumber}. Only ${productRemaining.toFixed(2)} KG remaining for this item.`,
                400
              );
            }

            const activeRate = await this._resolveItemRate(item, session);
            this._mergeIntoProductMap(productMap, item, qty, activeRate);
            item.usedQty = (item.usedQty || 0) + qty;
            allocatedQty += qty;
          }

          if (allocatedQty <= 0) {
            throw new AppError(
              `No product quantities allocated for Harvest ${harvest.harvestNumber}`,
              400
            );
          }
          if (allocatedQty > remainingQty + 0.001) {
            throw new AppError(
              `Cannot allocate ${allocatedQty} KG from Harvest ${harvest.harvestNumber}. Only ${remainingQty.toFixed(2)} KG remaining.`,
              400
            );
          }
        } else {
          allocatedQty = parseFloat(allocation.allocatedQty) || 0;

          if (allocatedQty <= 0) {
            throw new AppError(
              `Allocated quantity must be greater than zero for Harvest ${harvest.harvestNumber}`,
              400
            );
          }

          if (allocatedQty > remainingQty + 0.001) {
            throw new AppError(
              `Cannot allocate ${allocatedQty} KG from Harvest ${harvest.harvestNumber}. Only ${remainingQty.toFixed(2)} KG remaining.`,
              400
            );
          }

          const scaleFactor = allocatedQty / availableQty;

          for (const item of harvest.products) {
            const activeRate = await this._resolveItemRate(item, session);
            const scaledQty = (item.estimatedQty || 0) * scaleFactor;
            this._mergeIntoProductMap(productMap, item, scaledQty, activeRate);
            item.usedQty = (item.usedQty || 0) + scaledQty;
          }
        }

        totalQty += allocatedQty;
        harvest.allocatedQty += allocatedQty;
        allocation.allocatedQty = allocatedQty;
        await harvest.save({ session });
      }

      // Convert product map to Tapal products array format
      let totalBoxes = 0;
      const tapalProducts = Object.values(productMap).map(p => {
        totalAmount += p.totalAmount;
        const bQty = p.boxQty ? Math.ceil(p.boxQty) : (p.numericQty && p.weightPerBox ? Math.ceil(p.numericQty / p.weightPerBox) : null);
        if (bQty) totalBoxes += bQty;
        const formattedName = p.count
          ? `${p.fishName.toUpperCase()} (COUNT ${p.count})`
          : p.fishName.toUpperCase();
        return {
          name: formattedName,
          particulars: formattedName,
          hsnCode: p.hsnCode,
          count: p.count || '',
          qty: `${p.numericQty.toFixed(2)} KG`,
          numericQty: p.numericQty,
          rate: `₹${p.rate}`,
          total: `₹${p.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
          boxQty: bQty,
          boxes: bQty,
          noOfBoxes: bQty,
          weightPerBox: p.weightPerBox,
          boxWeight: p.weightPerBox,
          totalWeight: p.numericQty
        };
      });

      // 4. Resolve Buyer and Create Tapal document
      let buyerName = 'UNASSIGNED BUYER';
      const buyerPhoneRaw = logistics.buyerPhone;
      let p10 = buyerPhoneRaw ? normalizePhone10(buyerPhoneRaw) : null;
      let resolvedBuyerId = logistics.buyerId || null;

      if (resolvedBuyerId) {
        const buyerObj = await Buyer.findById(resolvedBuyerId).session(session);
        if (buyerObj) {
          buyerName = buyerObj.buyerName || buyerObj.name || 'UNASSIGNED BUYER';
          if (!p10 && buyerObj.phone) {
            p10 = normalizePhone10(buyerObj.phone);
          }
        }
      } else if (p10) {
        const buyerObj = await Buyer.findOne({
          isActive: { $ne: false },
          $or: [{ phone: buyerPhoneRaw }, { phone: p10 }],
        }).session(session);
        if (buyerObj) {
          resolvedBuyerId = buyerObj._id;
          buyerName = buyerObj.buyerName || buyerObj.name || 'UNASSIGNED BUYER';
        }
      }

      const newTapal = new Tapal({
        type: 'Purchase',
        harvestId: firstHarvest._id, // Backwards compatibility: keep first harvest id
        partyName: buyerName,
        farmerId: farmer._id,
        qty: `${totalQty.toFixed(2)} KG`,
        numericQty: totalQty,
        amount: `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        numericAmount: totalAmount,
        totalBoxes: totalBoxes || null,
        inWords: totalBoxes > 0 ? `${totalBoxes} BOXES ONLY` : `${totalQty.toFixed(2)} KILOGRAMS ONLY`,
        status: logistics.assignedTo ? 'ASSIGNED' : 'CREATED',
        assignedTo: logistics.assignedTo || null,
        driver: 'Unassigned',
        vehicleNumber: logistics.vehicleNumber || null,
        destination: logistics.destination || null,
        logisticsNotes: logistics.logisticsNotes || null,
        createdBy: creatorUser?.phone || String(creatorUser?._id || creatorUser?.id || 'erp-system'),
        products: tapalProducts
      });

      if (resolvedBuyerId) newTapal.buyerId = resolvedBuyerId;
      if (p10) newTapal.buyerPhone = p10;
      if (logistics.assignedBuyer) {
        newTapal.assignedBuyer = logistics.assignedBuyer;
      } else if (p10) {
        const buyerUser = await User.findOne({
          isActive: { $ne: false },
          role: { $in: ['BUYER', 'Buyer'] },
          $or: [{ phone: buyerPhoneRaw }, { phone: p10 }],
        }).session(session);
        if (buyerUser) newTapal.assignedBuyer = buyerUser._id;
      }

      await newTapal.save({ session });

      const { HarvestTapalMapping } = await import('./harvestTapalMapping.model.js');
      for (const allocation of allocations) {
        const mapping = new HarvestTapalMapping({
          harvestSlipId: allocation.harvestId,
          tapalId: newTapal._id,
          allocatedQty: allocation.allocatedQty,
          createdBy: creatorUser._id
        });
        await mapping.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      logger.info(`[Harvest Engine]: Successfully created Tapal ${newTapal.tapalNumber} from ${allocations.length} harvests.`);
      return newTapal;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`[Harvest Engine Error]: Many-to-Many conversion failure: ${error.message}`);
      throw error;
    }
  }

  /**
   * Legacy wrapper for single harvest slip conversion
   */
  async convertToTapal(harvestId, assignedTo, creatorUser, selectedItems = null, logistics = {}) {
    const harvest = await this.model.findById(harvestId);
    if (!harvest) {
      throw new AppError(`Harvest Slip with ID ${harvestId} does not exist.`, 404);
    }
    const totalEstWeight = harvest.products.reduce((sum, item) => sum + (item.estimatedQty || 0), 0);
    const availableQty = harvest.availableQty || totalEstWeight || 1;
    const remainingQty = Math.max(0, availableQty - harvest.allocatedQty) || availableQty;
    
    const finalLogistics = { ...logistics };
    if (assignedTo && !finalLogistics.assignedTo) {
      finalLogistics.assignedTo = assignedTo;
    }
    
    return await this.createTapalFromHarvests(
      [{ harvestId, allocatedQty: remainingQty }],
      finalLogistics,
      creatorUser
    );
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

    // Update individual product rates if provided (map by id, index, or array from UI)
    if (productRates) {
        const usedIndices = new Set();
        for (let idx = 0; idx < productRates.length; idx++) {
          const pr = productRates[idx];
          let item = null;

          // 1. Try direct line item ID / _id matching if provided
          if (pr.lineItemId || pr._id || pr.id) {
            const targetId = String(pr.lineItemId || pr._id || pr.id);
            const foundIdx = harvest.products.findIndex(
              (p) => String(p._id || p.id) === targetId
            );
            if (foundIdx !== -1) {
              item = harvest.products[foundIdx];
              usedIndices.add(foundIdx);
            }
          }

          // 2. Try index position matching if within bounds and not yet used
          if (!item && pr.lineIndex != null && harvest.products[pr.lineIndex] && !usedIndices.has(pr.lineIndex)) {
            item = harvest.products[pr.lineIndex];
            usedIndices.add(pr.lineIndex);
          } else if (!item && pr.index != null && harvest.products[pr.index] && !usedIndices.has(pr.index)) {
            item = harvest.products[pr.index];
            usedIndices.add(pr.index);
          } else if (!item && harvest.products[idx] && !usedIndices.has(idx)) {
            // Fallback to array index alignment
            item = harvest.products[idx];
            usedIndices.add(idx);
          }

          // 3. Match by count + fishName if available
          if (!item && pr.count) {
            const matchIndex = harvest.products.findIndex(
              (p, pIdx) =>
                !usedIndices.has(pIdx) &&
                String(p.count) === String(pr.count) &&
                pr.fishName &&
                String(p.fishName).toUpperCase() === String(pr.fishName).toUpperCase()
            );
            if (matchIndex !== -1) {
              item = harvest.products[matchIndex];
              usedIndices.add(matchIndex);
            }
          }

          // 4. Fallback to productId or fishName matching, skipping already used indices
          if (!item) {
            const matchIndex = harvest.products.findIndex(
              (p, pIdx) =>
                !usedIndices.has(pIdx) &&
                ((pr.productId && String(p.productId) === String(pr.productId)) ||
                  (pr.fishName && String(p.fishName).toUpperCase() === String(pr.fishName).toUpperCase()))
            );
            if (matchIndex !== -1) {
              item = harvest.products[matchIndex];
              usedIndices.add(matchIndex);
            }
          }

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

    const farmer = await Farmer.findById(harvest.farmerId);
    if (!farmer) {
      throw new AppError(`Farmer not found for harvest slip ${harvest.harvestNumber}`, 404);
    }

    // Auto-update or post to Farmer Ledger
    const { FarmerLedger } = await import('../farmer-ledger/farmerLedger.model.js');
    const { farmerLedgerService } = await import('../farmer-ledger/farmerLedger.service.js');

    const ledgerCreatedBy =
      creatorUser?.phone ||
      creatorUser?.email ||
      String(creatorUser?._id || creatorUser?.id || 'erp-system');

    try {
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
          createdBy: ledgerCreatedBy,
        });
      }
    } catch (ledgerErr) {
      logger.error(
        `[Farmer Ledger Sync Error]: Failed for harvest ${harvest.harvestNumber}: ${ledgerErr.message}`
      );
      throw new AppError(
        `Purchase invoice saved but farmer ledger update failed: ${ledgerErr.message}`,
        500
      );
    }

    // Auto-update or post to Billing (Invoice) & Inventory Stocks
    try {
      const { Billing } = await import('../billing/billing.model.js');
      const { inventoryService } = await import('../inventory/inventory.service.js');

      const existingBilling = await Billing.findOne({ harvestId: harvest._id });
      const billingItems = harvest.products.map(p => ({
        productId: p.productId,
        productName: p.fishName,
        quantity: p.estimatedQty,
        rate: p.rate || 0,
        amount: (p.rate || 0) * (p.estimatedQty || 0)
      }));

      const subtotal = billingItems.reduce((sum, item) => sum + item.amount, 0);

      const billingData = {
        type: 'PROCUREMENT',
        harvestId: harvest._id,
        partyName: farmer.fullName,
        partyId: farmer._id,
        items: billingItems,
        subtotal,
        taxRate: 5,
        taxAmount: (subtotal * 5) / 100,
        totalAmount: harvest.totalPayableAmount,
        paymentStatus: harvest.paymentStatus === 'PAID' ? 'PAID' : (harvest.paymentStatus === 'PARTIAL' ? 'PARTIALLY_PAID' : 'PENDING'),
        paidAmount: harvest.paidAmount || 0,
        balanceAmount: harvest.pendingAmount || harvest.totalPayableAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: creatorUser._id || harvest.createdBy,
        remarks: harvest.remarks || ''
      };

      if (existingBilling) {
        // Revert old stocks
        for (const item of existingBilling.items) {
          await inventoryService.adjustStock(
            item.productId,
            -item.quantity,
            'PROCUREMENT_IN',
            { referenceId: existingBilling._id, referenceModel: 'Billing' },
            creatorUser._id,
            `Stock reverted due to purchase bill update`
          );
        }

        Object.assign(existingBilling, billingData);
        await existingBilling.save();

        // Apply new stocks
        for (const item of existingBilling.items) {
          await inventoryService.adjustStock(
            item.productId,
            item.quantity,
            'PROCUREMENT_IN',
            { referenceId: existingBilling._id, referenceModel: 'Billing' },
            creatorUser._id,
            `Stock updated due to purchase bill update`
          );
        }
      } else {
        const newBilling = new Billing(billingData);
        await newBilling.save();

        // Apply new stocks
        for (const item of newBilling.items) {
          await inventoryService.adjustStock(
            item.productId,
            item.quantity,
            'PROCUREMENT_IN',
            { referenceId: newBilling._id, referenceModel: 'Billing' },
            creatorUser._id,
            `Stock added via finalized purchase bill`
          );
        }
      }
    } catch (billingErr) {
      logger.error(`[Billing Sync Error]: Failed to create/update procurement invoice for harvest ${harvest.harvestNumber}: ${billingErr.message}`);
    }

    return harvest;
  }
}

export const harvestService = new HarvestService();
export default harvestService;
