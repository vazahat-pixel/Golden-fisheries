import { KitchenTicket } from './kitchenTicket.model.js';
import { AppError } from '../../utils/appError.js';
import { broadcastEvent } from '../../sockets/socket.js';

const ORDER_TYPE_MAP = {
  'Dine In': 'DINE_IN',
  'DINE_IN': 'DINE_IN',
  Takeaway: 'TAKEAWAY',
  TAKEAWAY: 'TAKEAWAY',
  Parcel: 'TAKEAWAY',
  Delivery: 'DELIVERY',
  DELIVERY: 'DELIVERY',
  'Online Order': 'DELIVERY',
  'Bulk Order': 'TAKEAWAY',
};

export function normalizeOrderType(input) {
  if (!input) return 'DINE_IN';
  return ORDER_TYPE_MAP[input] || ORDER_TYPE_MAP[input.trim()] || 'DINE_IN';
}

class KitchenService {
  async createTicket(payload, userId) {
    if (!payload?.items?.length) {
      throw new AppError('At least one kitchen line is required', 400);
    }

    const items = payload.items.map((line) => ({
      menuItemId: line.menuItemId || null,
      name: line.name || 'ITEM',
      quantity: parseInt(line.quantity, 10) || 1,
      notes: line.notes || '',
      lineStatus: 'PENDING',
    }));

    const ticket = await KitchenTicket.create({
      orderType: normalizeOrderType(payload.orderType),
      tableNumber: payload.tableNumber || payload.tableLabel || 'COUNTER',
      items,
      remarks: payload.remarks || '',
      createdBy: userId,
      status: 'ACTIVE',
    });

    broadcastEvent('restaurant:kot_created', { ticket });
    return ticket;
  }

  async listActive(query = {}) {
    const { limit = 50 } = query;
    const docs = await KitchenTicket.find({ status: 'ACTIVE' })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit, 10))
      .populate('createdBy', 'fullName phone');
    return docs;
  }

  async listAll(query = {}) {
    const { page = 1, limit = 50, status } = query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const docs = await KitchenTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('createdBy', 'fullName phone');
    const totalDocs = await KitchenTicket.countDocuments(filter);
    return { docs, meta: { totalDocs, page, limit } };
  }

  async getById(id) {
    const ticket = await KitchenTicket.findById(id).populate('createdBy', 'fullName phone');
    if (!ticket) throw new AppError('Kitchen ticket not found', 404);
    return ticket;
  }

  async updateLineStatus(ticketId, lineId, lineStatus) {
    const allowed = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
    if (!allowed.includes(lineStatus)) {
      throw new AppError(`Invalid line status: ${lineStatus}`, 400);
    }

    const ticket = await KitchenTicket.findById(ticketId);
    if (!ticket) throw new AppError('Kitchen ticket not found', 404);
    if (ticket.status !== 'ACTIVE') {
      throw new AppError('Kitchen ticket is no longer active', 400);
    }

    const line = ticket.items.id(lineId);
    if (!line) throw new AppError('Kitchen line not found', 404);
    line.lineStatus = lineStatus;

    this._maybeAutoCompleteTicket(ticket);

    await ticket.save();
    broadcastEvent('restaurant:kot_updated', { ticket });
    return ticket;
  }

  /**
   * A ticket is done once every non-voided line has been served. If every
   * single line ended up voided, the whole ticket is pointless — cancel it.
   */
  _maybeAutoCompleteTicket(ticket) {
    const live = ticket.items.filter((i) => i.lineStatus !== 'CANCELLED');
    if (live.length === 0) {
      ticket.status = 'CANCELLED';
    } else if (live.every((i) => i.lineStatus === 'SERVED')) {
      ticket.status = 'COMPLETED';
    }
  }

  /**
   * Voids one dish on an active ticket — e.g. kitchen ran out of it, or the
   * customer changed their mind before it was served. Leaves an audit trail
   * (reason) instead of silently deleting the line.
   */
  async voidLine(ticketId, lineId, reason) {
    const ticket = await KitchenTicket.findById(ticketId);
    if (!ticket) throw new AppError('Kitchen ticket not found', 404);
    if (ticket.status !== 'ACTIVE') {
      throw new AppError('Kitchen ticket is no longer active', 400);
    }

    const line = ticket.items.id(lineId);
    if (!line) throw new AppError('Kitchen line not found', 404);
    if (line.lineStatus === 'SERVED') {
      throw new AppError('This dish was already served — it can\'t be voided from the kitchen anymore', 400);
    }
    if (line.lineStatus === 'CANCELLED') {
      throw new AppError('This dish is already voided', 400);
    }

    line.lineStatus = 'CANCELLED';
    line.voidReason = (reason || '').trim() || 'No reason given';

    this._maybeAutoCompleteTicket(ticket);

    await ticket.save();
    broadcastEvent('restaurant:kot_updated', { ticket });
    return ticket;
  }

  async advanceLineStatus(ticketId, lineId) {
    const ticket = await KitchenTicket.findById(ticketId);
    if (!ticket) throw new AppError('Kitchen ticket not found', 404);
    const line = ticket.items.id(lineId);
    if (!line) throw new AppError('Kitchen line not found', 404);
    if (line.lineStatus === 'CANCELLED') {
      throw new AppError('This dish was voided and can\'t be advanced', 400);
    }

    const flow = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
    const idx = flow.indexOf(line.lineStatus);
    const next = flow[Math.min(idx + 1, flow.length - 1)];
    return this.updateLineStatus(ticketId, lineId, next);
  }

  async cancelTicket(ticketId) {
    const ticket = await KitchenTicket.findById(ticketId);
    if (!ticket) throw new AppError('Kitchen ticket not found', 404);
    if (ticket.status === 'COMPLETED') {
      throw new AppError('This ticket is already completed and cannot be cancelled', 400);
    }
    if (ticket.status === 'CANCELLED') {
      throw new AppError('This ticket is already cancelled', 400);
    }
    ticket.status = 'CANCELLED';
    await ticket.save();
    broadcastEvent('restaurant:kot_updated', { ticket });
    return ticket;
  }
}

export const kitchenService = new KitchenService();
export default kitchenService;
