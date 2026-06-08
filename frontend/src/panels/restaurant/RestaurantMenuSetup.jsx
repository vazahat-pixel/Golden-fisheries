import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, ChefHat, Package, RefreshCw } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { useRestaurantStore } from '../../store/restaurantStore';
import { Button } from '../../design-system/components/Button';

const emptyIngredient = () => ({ inventoryItemId: '', itemName: '', quantityPerServe: '' });

const invId = (item) => String(item?._id || item?.id || '');

const RestaurantMenuSetup = () => {
  const navigate = useNavigate();
  const { kitchenStock, fetchKitchenStock } = useRestaurantStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [price, setPrice] = useState('');
  const [recipe, setRecipe] = useState([emptyIngredient()]);
  const [saving, setSaving] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);

  const loadStock = async () => {
    setLoadingStock(true);
    try {
      await fetchKitchenStock();
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const inventory = (kitchenStock || []).filter((item) => invId(item));

  const pickIngredient = (idx, selectedId) => {
    const inv = inventory.find((i) => invId(i) === selectedId);
    setRecipe((prev) =>
      prev.map((line, i) =>
        i === idx
          ? {
              ...line,
              inventoryItemId: selectedId,
              itemName: inv?.name || '',
              quantityPerServe:
                line.quantityPerServe || (selectedId && inv ? '0.15' : ''),
            }
          : line
      )
    );
  };

  const updateRecipeLine = (idx, field, value) => {
    setRecipe((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Dish name likhein');
      return;
    }
    if (inventory.length === 0) {
      toast.error('Pehle Fish Mall se stock accept karein (Received Stock)');
      return;
    }

    const missingIngredient = recipe.some((l) => !l.inventoryItemId);
    const missingQty = recipe.some(
      (l) => l.inventoryItemId && !(parseFloat(l.quantityPerServe) > 0)
    );

    if (missingIngredient) {
      toast.error('Recipe mein kitchen ingredient select karein (dropdown)');
      return;
    }
    if (missingQty) {
      toast.error('Har ingredient ke liye qty per serve likhein (e.g. 0.15 KG)');
      return;
    }

    const lines = recipe
      .filter((l) => l.inventoryItemId && parseFloat(l.quantityPerServe) > 0)
      .map((l) => ({
        inventoryItemId: l.inventoryItemId,
        itemName: l.itemName,
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
      toast.success(`Menu "${name}" saved — POS par dish dikhegi`);
      setName('');
      setPrice('');
      setRecipe([emptyIngredient()]);
      await loadStock();
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || 'Failed to save menu item');
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
        POS dish ko kitchen stock se link karein. Bill settle par recipe ke hisaab se stock minus hoga
        (e.g. Fish Curry → ROHU 0.15 KG per plate).
      </p>

      {inventory.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 p-6 space-y-4 mb-6">
          <p className="text-sm font-bold text-amber-900">
            Kitchen stock khali hai — recipe ke liye pehle ingredient chahiye.
          </p>
          <ol className="text-[11px] text-amber-800 space-y-1 list-decimal list-inside">
            <li>Fish Mall se internal bill bhejwayein</li>
            <li>Received Stock par jaake Accept karein</li>
            <li>Yahan wapas aake ROHU select karein</li>
          </ol>
          <div className="flex gap-2 flex-wrap">
            <Link to="/restaurant/received-stock">
              <Button type="button" className="text-[10px] font-black uppercase gap-2">
                <Package size={14} /> Received Stock
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={loadStock}
              disabled={loadingStock}
              className="text-[10px] font-black uppercase gap-2"
            >
              <RefreshCw size={14} className={loadingStock ? 'animate-spin' : ''} /> Refresh stock
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4 text-[10px] font-bold uppercase text-slate-500">
          <span>{inventory.length} kitchen ingredient(s) available</span>
          <button
            type="button"
            onClick={loadStock}
            className="flex items-center gap-1 text-accent-olive hover:underline"
          >
            <RefreshCw size={12} className={loadingStock ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      )}

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
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Recipe per serving</p>
          <p className="text-[9px] text-slate-400 mb-3">
            Ingredient select karein + qty per plate (KG). Dono required hain.
          </p>
          {recipe.map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <select
                className="col-span-7 border px-2 py-2 text-sm"
                value={line.inventoryItemId || ''}
                disabled={inventory.length === 0}
                onChange={(e) => pickIngredient(idx, e.target.value)}
              >
                <option value="">— Kitchen ingredient —</option>
                {inventory.map((inv) => {
                  const id = invId(inv);
                  return (
                    <option key={id} value={id}>
                      {inv.name} ({inv.quantity ?? 0} {inv.unit || 'KG'})
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Qty / serve"
                title="Quantity per one plate (KG)"
                className="col-span-4 border px-2 py-2 font-mono text-sm"
                value={line.quantityPerServe}
                onChange={(e) => updateRecipeLine(idx, 'quantityPerServe', e.target.value)}
              />
              <span className="col-span-1 text-[8px] font-bold text-slate-400 uppercase">KG</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRecipe((p) => [...p, emptyIngredient()])}
            className="text-[10px] font-black uppercase text-accent-olive flex items-center gap-1 mt-2"
            disabled={inventory.length === 0}
          >
            <Plus size={12} /> Add ingredient line
          </button>
        </div>

        <Button type="submit" disabled={saving || inventory.length === 0}>
          {saving ? 'Saving…' : 'Save menu item'}
        </Button>
      </form>
    </div>
  );
};

export default RestaurantMenuSetup;
