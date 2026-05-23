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
      if (transfer.status === 'COMPLETED') {
        throw new AppError(`Transfer ${transfer.transferNumber} is already completed`, 409);
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

      const completedLines = [];

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

        const { item: fmItem } = await fishMallInventoryService.receiveProcurementTransfer(
          {
            outletId: destinationOutlet._id,
            name: line.productName,
            quantity: line.quantity,
            rate: line.rate,
            unit: line.unit,
          },
          userId,
          session,
          transfer._id,
          transfer.transferNumber
        );

        completedLines.push({
          ...line,
          fishMallItemId: fmItem._id,
        });
      }

      transfer.lines = completedLines;
      transfer.status = 'COMPLETED';
      transfer.approvedBy = userId;
      transfer.approvedAt = new Date();
      transfer.completedAt = new Date();
      if (extraNotes) {
        transfer.notes = transfer.notes
          ? `${transfer.notes}\n[Approval] ${extraNotes}`
          : `[Approval] ${extraNotes}`;
      }
      await transfer.save({ session });

      await session.commitTransaction();

      broadcastEvent('inventory:transfer_completed', {
        transferId: transfer._id,
        transferNumber: transfer.transferNumber,
        scope: INVENTORY_SCOPES.PROCUREMENT,
      }, 'dashboard:updates');

      const transferPayload = {
        transferId: transfer._id,
        transferNumber: transfer.transferNumber,
        outletId: destinationOutlet._id,
        outletName: destinationOutlet.name,
        outletCode: destinationOutlet.outletCode,
        lines: completedLines.map((l) => ({
          productName: l.productName,
          quantity: l.quantity,
          unit: l.unit || 'KG',
        })),
        status: 'COMPLETED',
        completedAt: transfer.completedAt,
      };

      broadcastEvent(
        'fishmall:procurement_transfer',
        transferPayload,
        `fishmall:outlet:${destinationOutlet._id}`
      );
      broadcastEvent('fishmall:procurement_transfer', transferPayload, 'fishmall:updates');
      broadcastEvent('fishmall:inventory_updated', {
        transferNumber: transfer.transferNumber,
        scope: INVENTORY_SCOPES.FISHMALL,
        outletId: destinationOutlet._id,
      }, 'fishmall:updates');

      logger.info(
        `[Stock Transfer]: ${transfer.transferNumber} approved — ${completedLines.length} line(s) → ${destinationOutlet.name}`
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
    if (transfer.status === 'COMPLETED') {
      throw new AppError('Cannot cancel a completed transfer', 400);
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
