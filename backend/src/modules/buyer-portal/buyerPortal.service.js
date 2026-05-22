import { Tapal } from '../tapals/tapal.model.js';
import { Trip } from '../trips/trip.model.js';
import { Buyer } from '../buyers/buyer.model.js';
import { BuyerVerification } from './buyerVerification.model.js';
import { BuyerBill } from './buyerBill.model.js';
import { SalesReturn } from './salesReturn.model.js';
import { AppError } from '../../utils/appError.js';
import { flowGuard } from '../../services/flowGuard.service.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { Product } from '../products/product.model.js';
import { notificationService } from '../notifications/notification.service.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { normalizePhone10 } from '../../utils/phone.js';

const ASSIGNABLE_STATUSES = ['CREATED', 'ASSIGNED', 'CONFIRMED'];

/** Resolve tapals visible to logged-in buyer user */
async function buyerTapalFilter(user) {
  const p10 = normalizePhone10(user.phone);
  const phoneVariants = [...new Set([user.phone, p10].filter(Boolean))];
  const buyerMaster = await Buyer.findOne({
    isActive: { $ne: false },
    phone: { $in: phoneVariants },
  });
  const or = [
    { buyerPhone: { $in: phoneVariants } },
    { assignedBuyer: user._id },
  ];
  if (buyerMaster) or.push({ buyerId: buyerMaster._id });
  return { $or: or, isDeleted: { $ne: true } };
}

export const buyerPortalService = {
  async getAssignedTapals(user, query = {}) {
    const filter = await buyerTapalFilter(user);
    if (query.status) filter.status = query.status;

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, parseInt(query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Tapal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('harvestId'),
      Tapal.countDocuments(filter)
    ]);

    return {
      docs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 0, totalDocs: total }
    };
  },

  /** Tapals linked to this buyer that still need a driver */
  async getAssignableTapals(user, query = {}) {
    const filter = await buyerTapalFilter(user);
    filter.status = { $in: ASSIGNABLE_STATUSES };

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, parseInt(query.limit, 10) || 50);
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Tapal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('harvestId'),
      Tapal.countDocuments(filter),
    ]);

    return {
      docs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 0, totalDocs: total },
    };
  },

  /** Find tapal by number for buyer claim (unlinked + assignable only) */
  async lookupTapalByNumber(user, tapalNumber) {
    const tn = String(tapalNumber || '').trim().toUpperCase();
    if (!tn) throw new AppError('Tapal number is required', 400);

    const tapal = await Tapal.findOne({ tapalNumber: tn, isDeleted: { $ne: true } });
    if (!tapal) return { tapal: null, canClaim: false };

    const p10 = normalizePhone10(user.phone);
    const linked =
      (tapal.buyerPhone && normalizePhone10(tapal.buyerPhone) === p10) ||
      tapal.assignedBuyer?.toString() === user._id.toString();

    if (linked) {
      return { tapal, canClaim: false, alreadyYours: true };
    }

    if (tapal.buyerPhone) {
      return { tapal, canClaim: false, belongsToOther: true };
    }

    const canClaim = ASSIGNABLE_STATUSES.includes(tapal.status);
    return { tapal, canClaim, alreadyYours: false, belongsToOther: false };
  },

  /** Link an unassigned tapal to the logged-in buyer (Channapa self-claim) */
  async claimTapalByNumber(user, tapalNumber) {
    const { tapal, canClaim, belongsToOther, alreadyYours } = await this.lookupTapalByNumber(
      user,
      tapalNumber
    );

    if (!tapal) throw new AppError('Tapal not found', 404);
    if (belongsToOther) throw new AppError('This tapal belongs to another buyer', 403);
    if (alreadyYours) return tapal;
    if (!canClaim) {
      throw new AppError(
        `Cannot claim tapal in status "${tapal.status}". Must be CREATED, ASSIGNED, or CONFIRMED.`,
        400
      );
    }

    const p10 = normalizePhone10(user.phone);
    tapal.buyerPhone = p10;
    tapal.assignedBuyer = user._id;
    const buyerMaster = await Buyer.findOne({
      isActive: { $ne: false },
      phone: { $in: [user.phone, p10] },
    });
    if (buyerMaster) tapal.buyerId = buyerMaster._id;
    await tapal.save();
    return tapal;
  },

  async submitVerification(tapalId, user, body) {
    await flowGuard.assertBuyerCanVerify(tapalId);

    const tapal = await Tapal.findById(tapalId);
    if (!tapal) throw new AppError('Tapal not found', 404);

    const dispatched = body.dispatchedQty || {
      noOfBoxes: tapal.products?.[0]?.boxQty || 0,
      weight: tapal.numericQty || 0
    };
    const received = body.receivedQty || dispatched;

    const boxDisc = (dispatched.noOfBoxes || 0) - (received.noOfBoxes || 0);
    const wtDisc = (dispatched.weight || 0) - (received.weight || 0);
    const hasDiscrepancy = Math.abs(boxDisc) > 0.01 || Math.abs(wtDisc) > 0.01;

    let verificationStatus = body.verificationStatus;
    if (!verificationStatus) {
      verificationStatus = hasDiscrepancy ? 'APPROVED_WITH_DISCREPANCY' : 'APPROVED';
    }

    const verification = await BuyerVerification.findOneAndUpdate(
      { tapal: tapalId },
      {
        tapal: tapalId,
        buyer: user._id,
        dispatchedQty: dispatched,
        receivedQty: received,
        discrepancy: { boxes: boxDisc, weight: wtDisc, hasDiscrepancy },
        verificationStatus,
        buyerRemarks: body.buyerRemarks || '',
        verifiedAt: new Date(),
        photos: body.photos || []
      },
      { upsert: true, new: true, runValidators: true }
    );

    tapal.status = 'BUYER_VERIFIED';
    await tapal.save();

    broadcastEvent('buyer:verified', { tapalId, verificationStatus }, 'dashboard:updates');
    broadcastEvent('buyer:verified', { tapalId, verificationStatus }, 'buyer:updates');

    return verification;
  },

  async createBuyerBill(tapalId, user, body) {
    await flowGuard.assertBuyerCanBill(tapalId);

    const tapal = await Tapal.findById(tapalId);
    if (!tapal) throw new AppError('Tapal not found', 404);

    const verification = await BuyerVerification.findOne({ tapal: tapalId });
    const finalWeight =
      parseFloat(body.finalWeight) ||
      verification?.receivedQty?.weight ||
      tapal.numericQty ||
      0;

    const ratePerKg = parseFloat(body.ratePerKg) || 0;
    const grossAmount = parseFloat((finalWeight * ratePerKg).toFixed(2));
    const taxRate = parseFloat(body.taxRate) || 5;
    const taxAmount = parseFloat(((grossAmount * taxRate) / 100).toFixed(2));
    const totalAmount = parseFloat((grossAmount + taxAmount).toFixed(2));

    const primaryItem = tapal.products?.[0]?.name || body.item || 'SEAFOOD';

    const bill = await BuyerBill.create({
      tapal: tapalId,
      buyer: user._id,
      item: primaryItem,
      finalWeight,
      ratePerKg,
      grossAmount,
      taxRate,
      taxAmount,
      totalAmount,
      items: (body.items || []).map((line) => ({
        item: line.item || primaryItem,
        quantity: line.quantity || finalWeight,
        ratePerKg: line.ratePerKg || ratePerKg,
        amount: (line.quantity || finalWeight) * (line.ratePerKg || ratePerKg)
      })),
      status: 'ISSUED',
      date: body.date ? new Date(body.date) : new Date(),
      createdBy: user._id
    });

    // Inventory — sales out
    const product = await Product.findOne({ name: new RegExp(`^${primaryItem}$`, 'i') });
    if (product) {
      await inventoryService.adjustStock(
        product._id,
        -finalWeight,
        'SALES_OUT',
        { referenceId: bill._id, referenceModel: 'BuyerBill' },
        user._id,
        `Buyer bill ${bill.billNo}`
      );
    }

    tapal.status = 'BILLING_DONE';
    await tapal.save();

    if (user.phone) {
      await notificationService.sendBuyerBillCreated({
        phone: user.phone,
        billNo: bill.billNo,
        amount: totalAmount
      });
    }

    broadcastEvent('buyer:bill_created', { billNo: bill.billNo, tapalId }, 'dashboard:updates');

    return bill;
  },

  async listBills(user, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, parseInt(query.limit, 10) || 20);
    const skip = (page - 1) * limit;
    const filter = { buyer: user._id, isDeleted: { $ne: true } };

    const [docs, total] = await Promise.all([
      BuyerBill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('tapal'),
      BuyerBill.countDocuments(filter)
    ]);

    return {
      docs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 0, totalDocs: total }
    };
  },

  async createSalesReturn(user, body) {
    await flowGuard.assertSalesReturnAllowed(body.buyerBill);

    const bill = await BuyerBill.findById(body.buyerBill).populate('tapal');
    if (!bill) throw new AppError('Buyer bill not found', 404);
    if (bill.buyer.toString() !== user._id.toString()) {
      throw new AppError('Access denied for this bill', 403);
    }

    const tapalDoc = bill.tapal?._id ? bill.tapal : await Tapal.findById(bill.tapal);
    const normalizedItems = (body.items || []).map((line) => {
      const returnedQty = parseFloat(line.returnedQty ?? line.quantity) || 0;
      const damagedQty = parseFloat(line.damagedQty) || 0;
      return {
        item: line.item || bill.item,
        productId: line.productId || null,
        returnedQty,
        damagedQty,
        quantity: returnedQty,
        reason: line.reason || line.damageReason || body.remarks || '',
        damageReason: line.damageReason || line.reason || '',
      };
    });

    if (!normalizedItems.length) {
      throw new AppError('At least one return line item is required', 400);
    }

    const returnedQty =
      parseFloat(body.returnedQty) ||
      normalizedItems.reduce((s, i) => s + i.returnedQty, 0);
    const damagedQty =
      parseFloat(body.damagedQty) ||
      normalizedItems.reduce((s, i) => s + i.damagedQty, 0);

    let returnAmount = parseFloat(body.returnAmount);
    if (!returnAmount && bill.ratePerKg) {
      returnAmount = parseFloat((returnedQty * bill.ratePerKg).toFixed(2));
    }
    if (!returnAmount) {
      returnAmount = parseFloat(((returnedQty / (bill.finalWeight || returnedQty)) * bill.totalAmount).toFixed(2));
    }

    const adjustmentAmount = parseFloat(body.adjustmentAmount) || 0;
    const settlementDelta = -(returnAmount + adjustmentAmount);

    const salesReturn = await SalesReturn.create({
      buyerBill: bill._id,
      buyer: user._id,
      tapal: tapalDoc?._id || bill.tapal,
      tapalRef: body.tapalRef || tapalDoc?.tapalNumber || '',
      returnedQty,
      damagedQty,
      returnAmount,
      adjustmentAmount,
      remarks: body.remarks || '',
      items: normalizedItems,
      inventoryImpact: {
        applied: false,
        quantity: returnedQty,
        transactionType: 'RETURN_IN',
      },
      settlementImpact: {
        balanceAdjustment: settlementDelta,
        status: 'PENDING',
      },
      status: 'PENDING',
      date: body.date ? new Date(body.date) : new Date(),
    });

    if (bill.status !== 'CANCELLED') {
      bill.status = 'RETURN_PENDING';
      await bill.save();
    }

    broadcastEvent('buyer:return_created', { returnNo: salesReturn.returnNo, tapalId: salesReturn.tapal }, 'dashboard:updates');

    return salesReturn;
  },

  async approveSalesReturn(returnId, approverId) {
    const salesReturn = await SalesReturn.findById(returnId).populate('buyerBill');
    if (!salesReturn) throw new AppError('Sales return not found', 404);
    if (salesReturn.status === 'COMPLETED') {
      throw new AppError('Return already completed', 409);
    }

    let totalRestored = 0;
    let primaryProductId = null;

    for (const retItem of salesReturn.items) {
      const qtyIn = parseFloat(retItem.returnedQty ?? retItem.quantity) || 0;
      if (qtyIn <= 0) continue;

      const product =
        (retItem.productId && (await Product.findById(retItem.productId))) ||
        (await Product.findOne({ name: new RegExp(`^${retItem.item}$`, 'i') }));

      if (product) {
        await inventoryService.adjustStock(
          product._id,
          qtyIn,
          'RETURN_IN',
          { referenceId: salesReturn._id, referenceModel: 'SalesReturn' },
          approverId,
          `Sales return ${salesReturn.returnNo}: ${retItem.damageReason || retItem.reason}`
        );
        totalRestored += qtyIn;
        primaryProductId = product._id;
      }
    }

    salesReturn.status = 'COMPLETED';
    salesReturn.approvedBy = approverId;
    salesReturn.inventoryImpact = {
      applied: totalRestored > 0,
      quantity: totalRestored,
      productId: primaryProductId,
      transactionType: 'RETURN_IN',
    };
    salesReturn.settlementImpact = {
      balanceAdjustment: salesReturn.settlementImpact?.balanceAdjustment ?? 0,
      status: 'SETTLED',
    };
    await salesReturn.save();

    if (salesReturn.buyerBill) {
      const bill = await BuyerBill.findById(salesReturn.buyerBill);
      if (bill) {
        bill.status = 'RETURNED';
        await bill.save();
      }
    }

    broadcastEvent('buyer:return_approved', { returnNo: salesReturn.returnNo }, 'dashboard:updates');

    return salesReturn;
  },

  async getBuyerReconciliation(user) {
    const [bills, returns] = await Promise.all([
      BuyerBill.find({ buyer: user._id, isDeleted: { $ne: true } }).populate('tapal'),
      SalesReturn.find({ buyer: user._id, isDeleted: { $ne: true } }).populate('buyerBill'),
    ]);

    const totalBilled = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalReturned = returns
      .filter((r) => r.status === 'COMPLETED' || r.status === 'APPROVED')
      .reduce((s, r) => s + (r.returnAmount || 0) + (r.adjustmentAmount || 0), 0);
    const pendingReturns = returns
      .filter((r) => r.status === 'PENDING')
      .reduce((s, r) => s + (r.returnAmount || 0), 0);

    return {
      totalBilled,
      totalReturned,
      pendingReturns,
      balanceDue: Math.max(0, totalBilled - totalReturned),
      bills: bills.length,
      returns: returns.length,
      docs: { bills, returns },
    };
  },

  async listAllReturnsAdmin(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, parseInt(query.limit, 10) || 20);
    const skip = (page - 1) * limit;
    const filter = { isDeleted: { $ne: true } };
    if (query.status) filter.status = query.status;

    const [docs, total] = await Promise.all([
      SalesReturn.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('buyerBill buyer tapal'),
      SalesReturn.countDocuments(filter),
    ]);

    return { docs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 0, totalDocs: total } };
  },

  async listReturns(user, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, parseInt(query.limit, 10) || 20);
    const skip = (page - 1) * limit;
    const filter = { buyer: user._id, isDeleted: { $ne: true } };

    const [docs, total] = await Promise.all([
      SalesReturn.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('buyerBill'),
      SalesReturn.countDocuments(filter)
    ]);

    return { docs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 0, totalDocs: total } };
  }
};

export default buyerPortalService;
