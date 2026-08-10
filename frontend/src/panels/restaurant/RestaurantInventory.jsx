import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, AlertTriangle, ArrowLeft, Edit2, Trash2, X, Package, Utensils } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';
import { restaurantService } from '../../services/restaurantService';

const LOW_STOCK_KG = 5;

const RestaurantInventory = () => {
  const navigate = useNavigate();
  const { kitchenStock, fetchKitchenStock } = useRestaurantStore();
  const [saving, setSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [menuCatalog, setMenuCatalog] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'raw' | 'dishes'

  const loadData = async () => {
    fetchKitchenStock();
    restaurantService
      .listInternalSupplies({ status: 'PENDING_ACCEPTANCE', limit: 20 })
      .then((res) => {
        const docs = Array.isArray(res?.data) ? res.data : res?.data?.docs ?? res?.docs ?? [];
        setPendingCount(docs.filter((b) => b.status === 'PENDING_ACCEPTANCE').length);
      })
      .catch(() => setPendingCount(0));

    restaurantService
      .getMenu()
      .then((res) => {
        const docs = Array.isArray(res?.data) ? res.data : res?.docs ?? res ?? [];
        setMenuCatalog(docs);
      })
      .catch(() => setMenuCatalog([]));
  };

  useEffect(() => {
    loadData();
  }, [fetchKitchenStock]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', rate: '', category: 'RAW_MATERIAL', stock: '' });

  const rawInventory = (kitchenStock || []).map((item) => ({
    id: item._id || item.id,
    name: item.name,
    category: item.category || 'RAW_MATERIAL',
    stock: item.quantity ?? 0,
    unit: item.unit || 'KG',
    rate: item.rate ?? 0,
    image: '🐟',
    type: 'raw',
  }));

  const posDishes = (menuCatalog || []).map((item) => ({
    id: item._id || item.id,
    name: item.name,
    category: item.category || 'Main Course',
    stock: 'ALWAYS AVAILABLE',
    unit: '',
    rate: item.sellingPrice ?? item.price ?? 0,
    image: item.image || '🍱',
    type: 'dish',
    recipe: item.recipe || [],
    rawDoc: item,
  }));

  let combinedInventory = [];
  if (activeTab === 'raw') {
    combinedInventory = rawInventory;
  } else if (activeTab === 'dishes') {
    combinedInventory = posDishes;
  } else {
    combinedInventory = [...rawInventory, ...posDishes];
  }

  const filteredInventory = combinedInventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = rawInventory.filter((i) => i.stock < LOW_STOCK_KG);

  const handleDeleteDish = async (dish) => {
    if (!window.confirm(`Delete "${dish.name}" from POS Menu & Inventory?`)) return;
    try {
      await restaurantService.deleteMenuItem(dish.id);
      toast.success(`Dish "${dish.name}" deleted`);
      loadData();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete dish');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const itemId = editingItem.id;
      const prevQty = editingItem.stock ?? 0;
      const nextQty = parseFloat(formData.stock);
      if (Number.isNaN(nextQty) || nextQty < 0) {
        toast.error('Enter valid stock quantity');
        return;
      }
      const delta = nextQty - prevQty;
      if (delta !== 0) {
        await restaurantService.adjustInventory(itemId, {
          quantityChange: delta,
          remarks: 'Kitchen stock correction',
        });
      }
      toast.success('Stock updated');
      await fetchKitchenStock();
      setEditingItem(null);
      setFormData({ name: '', rate: '', category: 'RAW_MATERIAL', stock: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 font-sans p-4 md:p-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-white p-6 border border-card-border shadow-sm">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 bg-white border border-card-border hover:bg-slate-50 rounded-none flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
                Stock & Menu <span className="text-accent-olive">Manifest.</span>
              </h1>
              <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black">
                {combinedInventory.length} ITEMS
              </Badge>
            </div>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">
              Kitchen raw stock & POS menu catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/restaurant/menu-setup">
            <Button
              className="h-11 px-6 text-[10px] font-black uppercase tracking-widest bg-accent-olive text-white border-none shadow-sm gap-2"
            >
              <Utensils size={14} /> Add Menu Dish
            </Button>
          </Link>
          <Link to="/restaurant/received-stock">
            <Button
              variant="outline"
              className="h-11 px-6 text-[10px] font-black uppercase tracking-widest border-card-border shadow-sm gap-2"
            >
              <Package size={14} />
              {pendingCount > 0 ? `Accept incoming (${pendingCount})` : 'Received stock'}
            </Button>
          </Link>
        </div>
      </header>

      {pendingCount > 0 && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
            {pendingCount} Fish Mall bill(s) waiting — Accept karein taaki ROHU / stock badhe
          </p>
          <Link to="/restaurant/received-stock">
            <Button size="sm" className="text-[9px] font-black uppercase bg-emerald-700 border-none">
              Go to Received Stock
            </Button>
          </Link>
        </div>
      )}

      {/* --- TAB SELECTOR --- */}
      <div className="flex items-center gap-2 mb-6 border-b border-card-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all border ${
            activeTab === 'all'
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-white text-slate-600 border-card-border hover:bg-slate-50'
          }`}
        >
          All Asset Registry ({rawInventory.length + posDishes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dishes')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'dishes'
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-white text-slate-600 border-card-border hover:bg-slate-50'
          }`}
        >
          <Utensils size={12} /> POS Menu Dishes ({posDishes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
            activeTab === 'raw'
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-white text-slate-600 border-card-border hover:bg-slate-50'
          }`}
        >
          <Package size={12} /> Kitchen Raw Stock ({rawInventory.length})
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="SEARCH ASSET REGISTRY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none transition-all shadow-sm"
            />
          </div>
          <div className="bg-white border border-card-border p-4 px-6 flex items-center justify-between min-w-[240px] shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${lowStockItems.length > 0 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-50 text-slate-300'}`}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">LOW STOCK (RAW)</p>
                <p
                  className={`text-lg font-black font-serif italic ${lowStockItems.length > 0 ? 'text-red-600' : 'text-black'}`}
                >
                  {lowStockItems.length}{' '}
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 italic">Items</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <Package size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">No items found</p>
            <p className="text-[10px] text-slate-400 mt-2 max-w-md mx-auto">
              Fish Mall se internal bill accept karein ya <strong>Add Menu Dish</strong> par click karke POS dish banayein.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredInventory.map((item) => {
              const isDish = item.type === 'dish';

              return (
                <Card
                  key={`${item.type}-${item.id}`}
                  padding="none"
                  className="bg-white border border-card-border shadow-sm flex flex-col hover:border-accent-olive transition-all group overflow-hidden"
                >
                  <div className="aspect-[16/9] bg-slate-50 flex items-center justify-center text-4xl relative group-hover:bg-slate-100 transition-colors">
                    {item.image}
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`text-[7px] font-black border-none px-2 h-4 ${
                          isDish
                            ? 'bg-blue-600 text-white'
                            : item.stock < LOW_STOCK_KG
                              ? 'bg-red-600 text-white'
                              : 'bg-black text-white'
                        }`}
                      >
                        {isDish ? 'POS DISH' : item.stock < LOW_STOCK_KG ? 'CRITICAL' : 'RAW STOCK'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 flex-1">
                    <div>
                      <p className="text-[8px] text-accent-olive font-black uppercase tracking-widest mb-1">
                        {item.category}
                      </p>
                      <h3 className="text-xs font-black text-black uppercase tracking-tight line-clamp-1 italic font-serif">
                        {item.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 border border-card-border divide-x divide-card-border">
                      <div className="p-2.5 text-center bg-slate-50/50">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          {isDish ? 'STATUS' : 'INVENTORY'}
                        </p>
                        <p className="text-xs font-serif italic font-black text-black truncate">
                          {isDish ? 'ACTIVE' : `${item.stock} ${item.unit}`}
                        </p>
                      </div>
                      <div className="p-2.5 text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">RATE (₹)</p>
                        <p className="text-sm font-serif italic font-black text-accent-olive">₹{item.rate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center gap-2">
                    {isDish ? (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate('/restaurant/menu-setup')}
                          className="flex-1 py-2 bg-slate-50 border border-card-border text-[8px] font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all flex items-center justify-center gap-1"
                        >
                          <Edit2 size={12} /> EDIT DISH
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDish(item)}
                          className="p-2 bg-red-50 text-red-600 border border-red-200 text-[8px] font-black hover:bg-red-600 hover:text-white transition-all"
                          title="Delete dish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setFormData({
                            name: item.name,
                            rate: String(item.rate),
                            category: item.category,
                            stock: String(item.stock),
                          });
                        }}
                        className="w-full py-2 bg-slate-50 border border-card-border text-[8px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        ADJUST QTY
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {lowStockItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-500">
          <Card padding="none" className="bg-black text-white p-4 flex items-center gap-6 shadow-2xl border-l-4 border-red-600">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-600/20 text-red-500 flex items-center justify-center animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest">STOCK LOW</p>
                <p className="text-[7px] text-white/40 font-bold uppercase tracking-widest">
                  {lowStockItems.map((i) => i.name).join(', ')} — Fish Mall se receive karein
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => navigate('/restaurant/received-stock')}
              className="h-9 px-6 bg-white text-black text-[8px] font-black uppercase tracking-widest border-none hover:bg-accent-olive hover:text-white transition-all"
            >
              RECEIVE STOCK
            </Button>
          </Card>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white border border-card-border shadow-2xl">
            <div className="p-6 border-b border-card-border flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[8px] font-black text-accent-olive uppercase tracking-[0.3em]">STOCK ADJUST</p>
                <h2 className="text-xl font-serif italic font-black text-black uppercase tracking-tight">
                  {editingItem.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-10 h-10 border border-card-border flex items-center justify-center hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                Normal flow: Fish Mall bill accept. Yahan sirf correction (wastage count etc.).
              </p>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  Current stock ({editingItem.unit})
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-slate-50 border border-card-border p-3 text-sm font-black font-serif italic outline-none focus:ring-1 focus:ring-accent-olive transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] bg-black text-white hover:bg-accent-olive border-none shadow-xl"
              >
                {saving ? 'Saving…' : 'Save correction'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantInventory;
