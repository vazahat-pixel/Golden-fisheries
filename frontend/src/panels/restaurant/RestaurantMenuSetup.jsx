import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, ChefHat, Package, RefreshCw, Edit2, Trash2, X, Check } from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { useRestaurantStore } from '../../store/restaurantStore';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';

const emptyIngredient = () => ({ inventoryItemId: '', itemName: '', quantityPerServe: '' });

const invId = (item) => String(item?._id || item?.id || '');

const RestaurantMenuSetup = () => {
  const navigate = useNavigate();
  const { kitchenStock, fetchKitchenStock } = useRestaurantStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [price, setPrice] = useState('');
  const [recipe, setRecipe] = useState([emptyIngredient()]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const loadStock = async () => {
    setLoadingStock(true);
    try {
      await fetchKitchenStock();
    } finally {
      setLoadingStock(false);
    }
  };

  const loadMenuItems = async () => {
    setLoadingMenu(true);
    try {
      const res = await restaurantService.getMenu();
      const docs = Array.isArray(res?.data) ? res.data : res?.docs ?? res ?? [];
      setMenuItems(docs);
    } catch (err) {
      console.warn('Failed to fetch menu items:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    loadStock();
    loadMenuItems();
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

  const startEdit = (item) => {
    setEditingId(item._id || item.id);
    setName(item.name || '');
    setCategory(item.category || 'Main Course');
    setPrice(String(item.sellingPrice ?? item.price ?? ''));
    if (item.recipe && item.recipe.length > 0) {
      setRecipe(
        item.recipe.map((r) => ({
          inventoryItemId: String(r.inventoryItemId || ''),
          itemName: r.itemName || '',
          quantityPerServe: String(r.quantityPerServe || ''),
        }))
      );
    } else {
      setRecipe([emptyIngredient()]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setCategory('Main Course');
    setPrice('');
    setRecipe([emptyIngredient()]);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from the menu? It will no longer be sellable on POS.`)) return;
    try {
      await restaurantService.deleteMenuItem(item._id || item.id);
      toast.success(`"${item.name}" removed from the menu.`);
      if (editingId === (item._id || item.id)) cancelEdit();
      await loadMenuItems();
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || "Couldn't delete this dish — please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a dish name.');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a selling price greater than ₹0.');
      return;
    }

    const invalidLine = recipe.find(
      (l) => l.inventoryItemId && !(parseFloat(l.quantityPerServe) > 0)
    );
    if (invalidLine) {
      toast.error('Please enter a quantity-per-serve for the selected ingredient (e.g. 0.15 KG).');
      return;
    }

    const lines = recipe
      .filter((l) => l.inventoryItemId && parseFloat(l.quantityPerServe) > 0)
      .map((l) => ({
        inventoryItemId: l.inventoryItemId,
        itemName: l.itemName,
        quantityPerServe: parseFloat(l.quantityPerServe),
      }));

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        sellingPrice: parseFloat(price) || 0,
        gstRate: 5,
        recipe: lines,
      };

      if (editingId) {
        await restaurantService.updateMenuItem(editingId, payload);
        toast.success(`"${name}" updated.`);
      } else {
        await restaurantService.createMenuItem(payload);
        if (lines.length > 0) {
          toast.success(`"${name}" added — now live on POS and its stock will be tracked.`);
        } else {
          toast.success(`"${name}" added and live on POS. Note: no recipe set, so selling it won't reduce kitchen stock.`, { duration: 5000 });
        }
      }

      cancelEdit();
      await loadStock();
      await loadMenuItems();
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || "Couldn't save this dish — please check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        type="button"
        onClick={() => navigate('/restaurant/inventory')}
        className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 mb-6 hover:text-black transition-colors"
      >
        <ArrowLeft size={14} /> Back to inventory
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black uppercase flex items-center gap-2 mb-1">
            <ChefHat className="text-accent-olive" /> Menu & Recipes Setup
          </h1>
          <p className="text-xs text-slate-500">
            POS dish add / edit / delete karein. Recipe optional hai — bina recipe ke bhi POS billing chalegi.
          </p>
        </div>
        <Link to="/restaurant/pos">
          <Button variant="outline" size="sm" className="text-[10px] font-black uppercase">
            Open POS Terminal
          </Button>
        </Link>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6">
          <p className="text-xs font-bold text-amber-900">
            Note: Kitchen stock khali hai. Aap bina recipe ke dish create/edit kar sakte hain, billing chalegi.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4 text-[10px] font-bold uppercase text-slate-500">
          <span>{inventory.length} kitchen ingredient(s) available for recipe linking</span>
          <button
            type="button"
            onClick={loadStock}
            className="flex items-center gap-1 text-accent-olive hover:underline"
          >
            <RefreshCw size={12} className={loadingStock ? 'animate-spin' : ''} /> Refresh stock
          </button>
        </div>
      )}

      {/* --- FORM SECTION --- */}
      <form onSubmit={handleSubmit} className="bg-white border border-card-border p-6 space-y-4 mb-10 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 mb-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-black">
            {editingId ? 'Edit Dish / Menu Item' : 'Add New Menu Dish'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-[10px] font-black uppercase text-red-600 flex items-center gap-1 hover:underline"
            >
              <X size={14} /> Cancel edit
            </button>
          )}
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-500">Dish name *</label>
          <input
            className="w-full border px-3 py-2 mt-1 font-bold uppercase text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="JEERA RICE"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Category</label>
            <input
              className="w-full border px-3 py-2 mt-1 text-sm font-semibold"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Main Course"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">Selling price (₹) *</label>
            <input
              type="number"
              min="0"
              step="1"
              className="w-full border px-3 py-2 mt-1 font-mono text-sm font-bold"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150"
              required
            />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Recipe per serving (Optional)</p>
          <p className="text-[9px] text-slate-400 mb-3">
            Kitchen ingredient select karein (Optional) + qty per plate (KG).
          </p>
          {recipe.map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <select
                className="col-span-7 border px-2 py-2 text-xs"
                value={line.inventoryItemId || ''}
                onChange={(e) => pickIngredient(idx, e.target.value)}
              >
                <option value="">— Kitchen ingredient (Optional) —</option>
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
                className="col-span-4 border px-2 py-2 font-mono text-xs"
                value={line.quantityPerServe}
                onChange={(e) => updateRecipeLine(idx, 'quantityPerServe', e.target.value)}
              />
              <span className="col-span-1 text-[8px] font-bold text-slate-400 uppercase">KG</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRecipe((p) => [...p, emptyIngredient()])}
            className="text-[10px] font-black uppercase text-accent-olive flex items-center gap-1 mt-2 hover:underline"
          >
            <Plus size={12} /> Add ingredient line
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving} className="px-6 py-3 text-[10px] font-black uppercase tracking-wider">
            {saving ? (editingId ? 'Updating…' : 'Saving…') : editingId ? 'Update Dish' : 'Save Menu Item'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={cancelEdit} className="text-[10px] font-black uppercase">
              Cancel
            </Button>
          )}
        </div>
      </form>

      {/* --- MENU CATALOG LIST WITH EDIT & DELETE --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
            Active POS Menu Items ({menuItems.length})
          </h2>
          <button
            type="button"
            onClick={loadMenuItems}
            className="text-[10px] font-bold uppercase text-slate-500 hover:text-black flex items-center gap-1"
          >
            <RefreshCw size={12} className={loadingMenu ? 'animate-spin' : ''} /> Refresh list
          </button>
        </div>

        {menuItems.length === 0 ? (
          <div className="bg-white border border-card-border p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No menu items created yet</p>
          </div>
        ) : (
          <div className="bg-white border border-card-border divide-y divide-card-border shadow-sm">
            {menuItems.map((item) => {
              const id = item._id || item.id;
              const isEditingThis = editingId === id;
              const recipeCount = item.recipe?.length || 0;

              return (
                <div
                  key={id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isEditingThis ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black uppercase text-black font-serif italic">{item.name}</span>
                      <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase">
                        {item.category || 'Main Course'}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-3">
                      <span>Price: <strong className="text-black font-mono">₹{item.sellingPrice ?? item.price}</strong></span>
                      <span>•</span>
                      {recipeCount > 0 ? (
                        <span>Recipe: {recipeCount} ingredient(s) linked</span>
                      ) : (
                        <span
                          title="Selling this dish won't reduce kitchen stock — add a recipe so it does."
                          className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 font-bold uppercase text-[9px] rounded"
                        >
                          ⚠ No recipe — stock not tracked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-black hover:text-white hover:border-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenuSetup;
