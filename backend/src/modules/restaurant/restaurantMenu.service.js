import { RestaurantMenuItem } from './restaurantMenu.model.js';
import { RestaurantInventoryItem } from './restaurantInventory.model.js';
import { AppError } from '../../utils/appError.js';

class RestaurantMenuService {
  async list(query = {}) {
    const { search, category, page = 1, limit = 200 } = query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = new RegExp(search, 'i');
    const skip = (page - 1) * limit;
    const docs = await RestaurantMenuItem.find(filter)
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    return {
      docs: docs.map((m) => this._toPosShape(m)),
      meta: { totalDocs: await RestaurantMenuItem.countDocuments(filter) },
    };
  }

  _toPosShape(menu) {
    return {
      _id: menu._id,
      id: menu._id,
      menuItemId: menu._id,
      name: menu.name,
      category: menu.category,
      price: menu.sellingPrice,
      sellingPrice: menu.sellingPrice,
      rate: menu.sellingPrice,
      gstRate: menu.gstRate ?? 5,
      image: menu.image || '🍱',
      description: menu.description,
      recipe: menu.recipe,
      stock: null,
    };
  }

  async getById(id) {
    const menu = await RestaurantMenuItem.findById(id);
    if (!menu) throw new AppError('Menu item not found', 404);
    return menu;
  }

  async create(payload, userId) {
    const name = payload.name?.trim().toUpperCase();
    const existing = await RestaurantMenuItem.findOne({ name });
    if (existing) throw new AppError('Menu item with this name already exists', 409);

    const recipe = await this._normalizeRecipe(payload.recipe || []);
    const item = await RestaurantMenuItem.create({
      name,
      category: payload.category || 'Main Course',
      sellingPrice: parseFloat(payload.sellingPrice ?? payload.price) || 0,
      gstRate: parseFloat(payload.gstRate) || 5,
      image: payload.image || '🍱',
      description: payload.description || '',
      recipe,
    });
    return item;
  }

  async update(id, payload) {
    const item = await RestaurantMenuItem.findById(id);
    if (!item) throw new AppError('Menu item not found', 404);
    if (payload.name) item.name = payload.name.trim().toUpperCase();
    if (payload.category != null) item.category = payload.category;
    if (payload.sellingPrice != null) item.sellingPrice = parseFloat(payload.sellingPrice);
    if (payload.price != null) item.sellingPrice = parseFloat(payload.price);
    if (payload.gstRate != null) item.gstRate = parseFloat(payload.gstRate);
    if (payload.image != null) item.image = payload.image;
    if (payload.description != null) item.description = payload.description;
    if (payload.isActive != null) item.isActive = payload.isActive;
    if (payload.recipe) item.recipe = await this._normalizeRecipe(payload.recipe);
    await item.save();
    return item;
  }

  async delete(id) {
    const item = await RestaurantMenuItem.findByIdAndDelete(id);
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
  }

  async _normalizeRecipe(recipeLines) {
    const normalized = [];
    for (const line of recipeLines) {
      const qty = parseFloat(line.quantityPerServe ?? line.quantity);
      if (!qty || qty <= 0) continue;

      let inv = null;
      if (line.inventoryItemId) {
        inv = await RestaurantInventoryItem.findById(line.inventoryItemId);
      }
      if (!inv && line.itemName) {
        inv = await RestaurantInventoryItem.findOne({
          name: line.itemName.trim().toUpperCase(),
          isActive: true,
        });
      }
      if (!inv) {
        throw new AppError(`Recipe ingredient not in kitchen stock: ${line.itemName || line.inventoryItemId}`, 404);
      }

      normalized.push({
        inventoryItemId: inv._id,
        itemName: inv.name,
        quantityPerServe: qty,
        unit: line.unit || inv.unit || 'KG',
      });
    }
    return normalized;
  }

  /** Attach available stock hint per menu item (min ingredient coverage) */
  async listWithStockHints(query = {}) {
    const { docs } = await this.list(query);
    const inventory = await RestaurantInventoryItem.find({ isActive: true });
    const invMap = new Map(inventory.map((i) => [i._id.toString(), i.quantity || 0]));

    return docs.map((menu) => {
      let maxServings = 9999;
      if (menu.recipe?.length) {
        for (const r of menu.recipe) {
          const avail = invMap.get(r.inventoryItemId?.toString()) ?? 0;
          const perServe = r.quantityPerServe || 0.001;
          maxServings = Math.min(maxServings, Math.floor(avail / perServe));
        }
      } else {
        maxServings = 999;
      }
      return { ...menu, stock: Number.isFinite(maxServings) ? maxServings : 0 };
    });
  }
}

export const restaurantMenuService = new RestaurantMenuService();
export default restaurantMenuService;
