import mongoose from 'mongoose';

const recipeIngredientSchema = new mongoose.Schema(
  {
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RestaurantInventoryItem',
      required: true,
    },
    itemName: { type: String, required: true, uppercase: true, trim: true },
    quantityPerServe: { type: Number, required: true, min: 0.001 },
    unit: { type: String, default: 'KG' },
  },
  { _id: false }
);

const restaurantMenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      default: 'Main Course',
      trim: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    gstRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    image: { type: String, default: '🍱' },
    description: { type: String, default: '' },
    recipe: {
      type: [recipeIngredientSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const RestaurantMenuItem = mongoose.model('RestaurantMenuItem', restaurantMenuItemSchema);
export default RestaurantMenuItem;
