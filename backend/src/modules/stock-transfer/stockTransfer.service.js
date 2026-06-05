import mongoose from 'mongoose';
import { StockTransfer } from './stockTransfer.model.js';
import { Product } from '../products/product.model.js';
import { InventoryTransaction } from '../inventory/inventoryTransaction.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { fishMallInventoryService } from '../fishmall/fishMallInventory.service.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { INVENTORY_SCOPES } from '../../constants/inventoryScopes.js';
import { fishMallOutletService } from '../fishmall-outlet/fishMallOutlet.service.js';
import { User } from '../users/user.model.js';
import { notificationService } from '../notifications/notification.service.js';


class StockTransferService {
  async _validateLines(lines, session = null) {
    const validated = [];
    for (const line of lines) {
      const qty = parseFloat(line.quantity);
      if (!qty || qty <= 0) {
        throw new AppError('Transfer quantity must be greater than zero', 400);
      }
      const product = await Product.findById(line.productId).session(session);
      if (!product || !product.isActive) {
        throw new AppError(`Product not found: ${line.productId}`, 404);
      }
      const available = product.quantity || 0;
      if (available < qty) {
        throw new AppError(
          `Insufficient procurement stock for ${product.name}. Available: ${available} KG, requested: ${qty} KG`,
          400
        );
      }
      validated.push({
        productId: product._id,
        productName: product.name,
        quantity: qty,
        unit: product.baseUnit || 'KG',
        rate: line.rate != null ? parseFloat(line.rate) : product.basePrice || 0,
      });
    }
    return validated;
  }

  async createTransfer(payload, userId) {
    const outlet = await fishMallOutletService.getActiveById(payload.destinationOutletId);
    const validatedLines = await this._validateLines(payload.lines);
    const transfer = await StockTransfer.create({
      lines: validatedLines,
      status: payload.status === 'DRAFT' ? 'DRAFT' : 'PENDING_APPROVAL',
      notes: payload.notes || '',
      transferDate: payload.transferDate ? new Date(payload.transferDate) : new Date(),
      createdBy: userId,
      toScope: 'FISHMALL',
      destinationOutletId: outlet._id,
    });
    broadcastEvent(
      'fishmall:transfer_pending',
      {
        transferId: transfer._id,
        transferNumber: transfer.transferNumber,
        outletId: outlet._id,
        outletName: outlet.name,
        outletCode: outlet.outletCode,
        lineCount: transfer.lines.length,
        status: transfer.status,
      },
      `fishmall:outlet:${outlet._id}`
    );
    broadcastEvent('fishmall:transfer_pending', {
      transferId: transfer._id,
      transferNumber: transfer.transferNumber,
      outletId: outlet._id,
      outletName: outlet.name,
      outletCode: outlet.outletCode,
      lineCount: transfer.lines.length,
      status: transfer.status,
    }, 'fishmall:updates');

    logger.info(`[Stock Transfer]: ${transfer.transferNumber} created (pending approval)`);
    return transfer;
  }

  async approveTransfer(transferId, userId, extraNotes = '') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transfer = await StockTransfer.findById(transferId).session(session);
      if (!transfer) throw new AppError('Stock transfer not found', 404);
      if (['IN_TRANSIT', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'PARTIAL_ACCEPTED', 'COMPLETED'].includes(transfer.status)) {
        throw new AppError(`Transfer ${transfer.transferNumber} has already been dispatched/completed`, 409);
      }
      if (transfer.status === 'CANCELLED') {
        throw new AppError(`Transfer ${transfer.transferNumber} was cancelled`, 400);
      }
      if (!transfer.destinationOutletId) {
        const fallback = await fishMallOutletService.ensureDefaultOutlet();
        transfer.destinationOutletId = fallback._id;
      }
      const destinationOutlet = await fishMallOutletService.getActiveById(transfer.destinationOutletId);

      const duplicateTx = await InventoryTransaction.findOne({
        referenceId: transfer._id,
        referenceModel: 'StockTransfer',
        type: 'TRANSFER_OUT',
      }).session(session);
      if (duplicateTx) {
        throw new AppError('Transfer stock movement already recorded', 409);
      }

      const validatedLines = await this._validateLines(
        transfer.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          rate: l.rate,
        })),
        session
      );

      for (const line of validatedLines) {
        await inventoryService.adjustStock(
          line.productId,
          -line.quantity,
          'TRANSFER_OUT',
          {
            referenceId: transfer._id,
            referenceModel: 'StockTransfer',
            session,
          },
          userId,
          `Procurement → Fish Mall transfer ${transfer.transferNumber}`
        );
      }

      transfer.status = 'IN_TRANSIT';
      transfer.approvedBy = userId;
      transfer.approvedAt = new Date();
      if (extraNotes) {
        transfer.notes = transfer.notes
          ? `${transfer.notes}\n[Dispatch] ${extraNotes}`
          : `[Dispatch] ${extraNotes}`;
      }
      await transfer.save({ session });

      await session.commitTransaction();

      // Trigger socket events
      broadcastEvent('inventory:transfer_completed', {
        transferId: transfer._id,
        transferNumber: transfer.transferNumber,
        scope: INVENTORY_SCOPES.PROCUREMENT,
        status: 'IN_TRANSIT',
      }, 'dashboard:updates');

      const transferPayload = {
        transferId: transfer._id,
        transferNumber: transfer.transferNumber,
        outletId: destinationOutlet._id,
        outletName: destinationOutlet.name,
        outletCode: destinationOutlet.outletCode,
        lineCount: transfer.lines.length,
        status: 'IN_TRANSIT',
        createdAt: transfer.createdAt,
      };

      broadcastEvent('fishmall:transfer_pending', transferPayload, `fishmall:outlet:${destinationOutlet._id}`);
      broadcastEvent('fishmall:transfer_pending', transferPayload, 'fishmall:updates');

      // Save in-app notification for Fish Mall Manager
      await notificationService.createInAppNotification({
        role: 'FISHMALL_MANAGER',
        outletId: destinationOutlet._id,
        title: 'New Inventory Transfer Dispatched',
        message: `New inventory transfer ${transfer.transferNumber} received from Procurement. Please verify and accept stock.`,
        type: 'STOCK_TRANSFER',
        referenceId: transfer._id,
        referenceModel: 'StockTransfer',
      });

      logger.info(
        `[Stock Transfer]: ${transfer.transferNumber} dispatched to ${destinationOutlet.name}`
      );
      return transfer;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async acceptTransfer(transferId, userId, payload) {
    const { status, remarks, lines } = payload;
    if (!['ACCEPTED', 'PARTIAL_ACCEPTED', 'REJECTED'].includes(status)) {
      throw new AppError('Invalid acceptance status', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transfer = await StockTransfer.findById(transferId).session(session);
      if (!transfer) throw new AppError('Stock transfer not found', 404);
      if (!['IN_TRANSIT', 'PENDING_ACCEPTANCE', 'PENDING_APPROVAL'].includes(transfer.status)) {
        throw new AppError(`Cannot accept transfer with status: ${transfer.status}`, 400);
      }

      const receiverUser = await User.findById(userId).session(session);
      const destinationOutlet = await fishMallOutletService.getActiveById(transfer.destinationOutletId);

      if (status === 'REJECTED') {
        // RESTORE stock back to Procurement warehouse
        for (const line of transfer.lines) {
          await inventoryService.adjustStock(
            line.productId,
            line.quantity, // Restore positive qty
            'TRANSFER_CANCELLED',
            {
              referenceId: transfer._id,
              referenceModel: 'StockTransfer',
              session,
            },
            userId,
            `Procurement ← Fish Mall transfer ${transfer.transferNumber} REJECTED`
          );
        }

        transfer.status = 'REJECTED';
        transfer.remarks = remarks || 'Shipment rejected';
        transfer.receiverId = userId;
        transfer.receiverName = receiverUser?.fullName || 'Receiver';
        transfer.acceptedAt = new Date();
        await transfer.save({ session });

        await session.commitTransaction();

        // Notify Admins
        await notificationService.createInAppNotification({
          role: 'SUPER_ADMIN',
          title: `Transfer ${transfer.transferNumber} Rejected`,
          message: `Fish Mall outlet ${destinationOutlet.name} rejected transfer ${transfer.transferNumber}. Reason: ${remarks}`,
          type: 'STOCK_TRANSFER',
          referenceId: transfer._id,
          referenceModel: 'StockTransfer',
        });

        broadcastEvent('fishmall:transfer_rejected', {
          transferId: transfer._id,
          transferNumber: transfer.transferNumber,
          outletId: destinationOutlet._id,
        }, 'fishmall:updates');

        return transfer;
      }

      // ACCEPTED or PARTIAL_ACCEPTED
      const linesMap = new Map((lines || []).map((l) => [l.productId?.toString(), l.receivedQuantity]));
      const completedLines = [];

      for (const line of transfer.lines) {
        const key = line.productId?.toString();
        // If missing or null, default to full quantity (fully accepted)
        const receivedQty = linesMap.has(key) && linesMap.get(key) !== null
          ? parseFloat(linesMap.get(key))
          : line.quantity;

        if (Number.isNaN(receivedQty) || receivedQty < 0 || receivedQty > line.quantity) {
          throw new AppError(`Invalid received quantity for ${line.productName}: ${receivedQty}`, 400);
        }

        const diff = Math.max(0, line.quantity - receivedQty);

        // Receive the actual verified stock in Fish Mall
        const { item: fmItem } = await fishMallInventoryService.receiveProcurementTransfer(
          {
            outletId: destinationOutlet._id,
            name: line.productName,
            quantity: receivedQty,
            rate: line.rate,
            unit: line.unit,
          },
          userId,
          session,
          transfer._id,
          transfer.transferNumber
        );

        completedLines.push({
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          receivedQuantity: receivedQty,
          differenceQuantity: diff,
          unit: line.unit,
          rate: line.rate,
          fishMallItemId: fmItem._id,
          _id: line._id,
        });
      }

      transfer.lines = completedLines;
      transfer.status = status;
      transfer.remarks = remarks || '';
      transfer.receiverId = userId;
      transfer.receiverName = receiverUser?.fullName || 'Receiver';
      transfer.acceptedAt = new Date();
      transfer.completedAt = new Date();

      await transfer.save({ session });

      await session.commitTransaction();

      // Trigger socket events and notifications
      const transferPayload = {
        transferId: transfer._id,
        transferNumber: transfer.transferNumber,
        outletId: destinationOutlet._id,
        outletName: destinationOutlet.name,
        status: transfer.status,
        completedAt: transfer.completedAt,
      };

      broadcastEvent('fishmall:inventory_updated', {
        transferNumber: transfer.transferNumber,
        scope: INVENTORY_SCOPES.FISHMALL,
        outletId: destinationOutlet._id,
      }, 'fishmall:updates');

      broadcastEvent('fishmall:procurement_transfer', transferPayload, 'fishmall:updates');

      await notificationService.createInAppNotification({
        role: 'SUPER_ADMIN',
        title: `Transfer ${transfer.transferNumber} Received`,
        message: `Fish Mall outlet ${destinationOutlet.name} received transfer ${transfer.transferNumber} (${transfer.status}). Remarks: ${remarks}`,
        type: 'STOCK_TRANSFER',
        referenceId: transfer._id,
        referenceModel: 'StockTransfer',
      });

      logger.info(
        `[Stock Transfer]: ${transfer.transferNumber} received/accepted by ${transfer.receiverName} as ${transfer.status}`
      );
      return transfer;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async cancelTransfer(transferId, userId, cancelReason) {
    const transfer = await StockTransfer.findById(transferId);
    if (!transfer) throw new AppError('Stock transfer not found', 404);
    if (['COMPLETED', 'ACCEPTED', 'PARTIAL_ACCEPTED'].includes(transfer.status)) {
      throw new AppError('Cannot cancel a completed/accepted transfer', 400);
    }
    if (transfer.status === 'CANCELLED') {
      throw new AppError('Transfer already cancelled', 409);
    }
    transfer.status = 'CANCELLED';
    transfer.cancelledBy = userId;
    transfer.cancelledAt = new Date();
    transfer.cancelReason = cancelReason || '';
    await transfer.save();
    return transfer;
  }

  async updateDraft(transferId, payload, userId) {
    const transfer = await StockTransfer.findById(transferId);
    if (!transfer) throw new AppError('Stock transfer not found', 404);
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(transfer.status)) {
      throw new AppError('Only draft or pending transfers can be modified', 400);
    }
    if (payload.lines?.length) {
      transfer.lines = await this._validateLines(payload.lines);
    }
    if (payload.notes != null) transfer.notes = payload.notes;
    if (payload.transferDate) transfer.transferDate = new Date(payload.transferDate);
    if (payload.status === 'PENDING_APPROVAL') transfer.status = 'PENDING_APPROVAL';
    await transfer.save();
    return transfer;
  }

  async listTransfers(query = {}) {
    const { page = 1, limit = 50, status, toScope = 'FISHMALL' } = query;
    const filter = { toScope };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const docs = await StockTransfer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('createdBy approvedBy', 'fullName phone role')
      .populate('destinationOutletId', 'name outletCode location');
    const totalDocs = await StockTransfer.countDocuments(filter);
    return {
      docs,
      meta: {
        totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalDocs / limit) || 0,
      },
    };
  }

  async getTransferById(id) {
    const transfer = await StockTransfer.findById(id)
      .populate('createdBy approvedBy cancelledBy', 'fullName phone role')
      .populate('destinationOutletId', 'name outletCode location phone');
    if (!transfer) throw new AppError('Stock transfer not found', 404);
    return transfer;
  }
}

export const stockTransferService = new StockTransferService();
export default stockTransferService;
