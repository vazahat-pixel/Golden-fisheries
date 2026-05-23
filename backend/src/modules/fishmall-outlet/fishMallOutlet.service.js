import { FishMallOutlet } from './fishMallOutlet.model.js';
import { FishMallInventoryItem } from '../fishmall/fishMallInventory.model.js';
import { AppError } from '../../utils/appError.js';

class FishMallOutletService {
  async ensureDefaultOutlet() {
    let outlet = await FishMallOutlet.findOne({ isDefault: true, isActive: true });
    if (!outlet) {
      const any = await FishMallOutlet.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (any) {
        any.isDefault = true;
        await any.save();
        outlet = any;
      } else {
        outlet = await FishMallOutlet.create({
          name: 'Main Fish Mall',
          location: 'Head Office',
          isDefault: true,
          isActive: true,
        });
      }
    }
    await FishMallInventoryItem.updateMany(
      { $or: [{ outletId: null }, { outletId: { $exists: false } }] },
      { $set: { outletId: outlet._id } }
    );
    return outlet;
  }

  async list(query = {}) {
    await this.ensureDefaultOutlet();
    const { activeOnly = 'true', search, page = 1, limit = 100 } = query;
    const filter = {};
    if (activeOnly === 'true' || activeOnly === true) filter.isActive = true;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { outletCode: new RegExp(search, 'i') },
      ];
    }
    const skip = (page - 1) * limit;
    const docs = await FishMallOutlet.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit, 10));
    const totalDocs = await FishMallOutlet.countDocuments(filter);
    return {
      docs,
      meta: { totalDocs, page: parseInt(page, 10), limit: parseInt(limit, 10) },
    };
  }

  async getById(id) {
    const outlet = await FishMallOutlet.findById(id);
    if (!outlet) throw new AppError('Fish Mall outlet not found', 404);
    return outlet;
  }

  async getActiveById(id) {
    const outlet = await this.getById(id);
    if (!outlet.isActive) throw new AppError('Fish Mall outlet is inactive', 400);
    return outlet;
  }

  async create(payload, userId) {
    const name = payload.name?.trim();
    if (!name) throw new AppError('Fish Mall name is required', 400);
    const existing = await FishMallOutlet.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) throw new AppError('Fish Mall with this name already exists', 409);

    const outlet = await FishMallOutlet.create({
      name,
      location: payload.location?.trim() || '',
      phone: payload.phone?.trim() || '',
      email: payload.email?.trim() || '',
      isActive: payload.isActive !== false,
      createdBy: userId,
    });

    if (payload.isDefault || (await FishMallOutlet.countDocuments()) === 1) {
      await FishMallOutlet.updateMany({ _id: { $ne: outlet._id } }, { $set: { isDefault: false } });
      outlet.isDefault = true;
      await outlet.save();
    }
    return outlet;
  }

  async update(id, payload) {
    const outlet = await this.getById(id);
    if (payload.name) {
      const name = payload.name.trim();
      const dup = await FishMallOutlet.findOne({
        name: new RegExp(`^${name}$`, 'i'),
        _id: { $ne: outlet._id },
      });
      if (dup) throw new AppError('Fish Mall with this name already exists', 409);
      outlet.name = name;
    }
    if (payload.location != null) outlet.location = payload.location.trim();
    if (payload.phone != null) outlet.phone = payload.phone.trim();
    if (payload.email != null) outlet.email = payload.email.trim();
    if (payload.isActive != null) outlet.isActive = payload.isActive;
    if (payload.isDefault === true) {
      await FishMallOutlet.updateMany({ _id: { $ne: outlet._id } }, { $set: { isDefault: false } });
      outlet.isDefault = true;
    }
    await outlet.save();
    return outlet;
  }
}

export const fishMallOutletService = new FishMallOutletService();
export default fishMallOutletService;
