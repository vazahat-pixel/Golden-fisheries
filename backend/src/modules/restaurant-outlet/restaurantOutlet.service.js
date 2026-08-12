import { RestaurantOutlet } from './restaurantOutlet.model.js';
import { AppError } from '../../utils/appError.js';

class RestaurantOutletService {
  async ensureDefaultOutlet() {
    let outlet = await RestaurantOutlet.findOne({ isDefault: true, isActive: true });
    if (!outlet) {
      const any = await RestaurantOutlet.findOne({ isActive: true }).sort({ createdAt: 1 });
      if (any) {
        any.isDefault = true;
        await any.save();
        outlet = any;
      } else {
        outlet = await RestaurantOutlet.create({
          name: 'Main Restaurant',
          location: 'Head Office',
          kitchenLabel: 'GF Restaurant Kitchen',
          isDefault: true,
          isActive: true,
        });
      }
    }
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
    const docs = await RestaurantOutlet.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit, 10));
    const totalDocs = await RestaurantOutlet.countDocuments(filter);
    return {
      docs,
      meta: { totalDocs, page: parseInt(page, 10), limit: parseInt(limit, 10) },
    };
  }

  async getById(id) {
    const outlet = await RestaurantOutlet.findById(id);
    if (!outlet) throw new AppError('Restaurant outlet not found', 404);
    return outlet;
  }

  async getActiveById(id) {
    const outlet = await this.getById(id);
    if (!outlet.isActive) throw new AppError('Restaurant outlet is inactive', 400);
    return outlet;
  }

  async create(payload, userId) {
    const name = payload.name?.trim();
    if (!name) throw new AppError('Restaurant name is required', 400);
    const existing = await RestaurantOutlet.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) throw new AppError('Restaurant with this name already exists', 409);

    const outlet = await RestaurantOutlet.create({
      name,
      location: payload.location?.trim() || '',
      phone: payload.phone?.trim() || '',
      email: payload.email?.trim() || '',
      gstin: payload.gstin?.trim() || '',
      kitchenLabel: payload.kitchenLabel?.trim() || 'Kitchen',
      isActive: payload.isActive !== false,
      createdBy: userId,
    });

    if (payload.isDefault || (await RestaurantOutlet.countDocuments()) === 1) {
      await RestaurantOutlet.updateMany({ _id: { $ne: outlet._id } }, { $set: { isDefault: false } });
      outlet.isDefault = true;
      await outlet.save();
    }
    return outlet;
  }

  async update(id, payload) {
    const outlet = await this.getById(id);
    if (payload.name) {
      const name = payload.name.trim();
      const dup = await RestaurantOutlet.findOne({
        name: new RegExp(`^${name}$`, 'i'),
        _id: { $ne: outlet._id },
      });
      if (dup) throw new AppError('Restaurant with this name already exists', 409);
      outlet.name = name;
    }
    if (payload.location != null) outlet.location = payload.location.trim();
    if (payload.phone != null) outlet.phone = payload.phone.trim();
    if (payload.email != null) outlet.email = payload.email.trim();
    if (payload.gstin != null) outlet.gstin = payload.gstin.trim();
    if (payload.kitchenLabel != null) outlet.kitchenLabel = payload.kitchenLabel.trim();
    if (payload.isActive != null) outlet.isActive = payload.isActive;
    if (payload.isDefault === true) {
      await RestaurantOutlet.updateMany({ _id: { $ne: outlet._id } }, { $set: { isDefault: false } });
      outlet.isDefault = true;
    }
    await outlet.save();
    return outlet;
  }

  async getMySettings() {
    return this.ensureDefaultOutlet();
  }

  async updateMySettings(payload) {
    const outlet = await this.ensureDefaultOutlet();
    return this.update(outlet._id, payload);
  }
}

export const restaurantOutletService = new RestaurantOutletService();
export default restaurantOutletService;
