import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, ChefHat } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { Button } from '../../design-system/components/Button';

const emptyIngredient = () => ({ inventoryItemId: '', itemName: '', quantityPerServe: '' });

const RestaurantMenuSetup = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [price, setPrice] = useState('');
  const [recipe, setRecipe] = useState([emptyIngredient()]);
  const [saving, setSaving] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      const res = await restaurantService.getInventory({ limit: 200 });
      const list = res?.data ?? res;
      setInventory(Array.isArray(list) ? list : []);
    } catch {
      setInventory([]);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const updateRecipeLine = (idx, field, value) => {
    setRecipe((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Menu name required');
      return;
    }
    const lines = recipe
      .filter((l) => l.inventoryItemId && parseFloat(l.quantityPerServe) > 0)
      .map((l) => ({
        inventoryItemId: l.inventoryItemId,
        quantityPerServe: parseFloat(l.quantityPerServe),
      }));
    if (!lines.length) {
      toast.error('Add at least one recipe ingredient from kitchen stock');
      return;
    }
    setSaving(true);
    try {
      await restaurantService.createMenuItem({
        name: name.trim(),
        category,
        sellingPrice: parseFloat(price) || 0,
        gstRate: 5,
        recipe: lines,
      });
      toast.success(`Menu item "${name}" created with recipe`);
      setName('');
      setPrice('');
      setRecipe([emptyIngredient()]);
      loadInventory();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/restaurant/inventory')}
        className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-6"
      >
        <ArrowLeft size={14} /> Back to inventory
      </button>
      <h1 className="text-xl font-black uppercase flex items-center gap-2 mb-2">
        <ChefHat className="text-accent-olive" /> Menu & recipes
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Link POS dishes to kitchen ingredients. On bill settlement, stock is deducted by recipe
        (e.g. Fish Curry → Rohu fish + oil + masala per serving).
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-card-border p-6 space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500">Dish name</label>
          <input
            className="w-full border px-3 py-2 mt-1 font-bold uppercase"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="FISH CURRY"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Category</label>
            <input
              className="w-full border px-3 py-2 mt-1"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Selling price (₹)</label>
            <input
              type="number"
              min="0"
              className="w-full border px-3 py-2 mt-1 font-mono"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Recipe per serving</p>
          {recipe.map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
              <select
                className="col-span-7 border px-2 py-2 text-sm"
                value={line.inventoryItemId}
                onChange={(e) => updateRecipeLine(idx, 'inventoryItemId', e.target.value)}
              >
                <option value="">Kitchen ingredient</option>
                {inventory.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.name} ({inv.quantity} {inv.unit || 'KG'})
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Qty/serve"
                className="col-span-4 border px-2 py-2 font-mono text-sm"
                value={line.quantityPerServe}
                onChange={(e) => updateRecipeLine(idx, 'quantityPerServe', e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRecipe((p) => [...p, emptyIngredient()])}
            className="text-[10px] font-black uppercase text-accent-olive flex items-center gap-1"
          >
            <Plus size={12} /> Add ingredient
          </button>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save menu item'}
        </Button>
      </form>
    </div>
  );
};

export default RestaurantMenuSetup;
