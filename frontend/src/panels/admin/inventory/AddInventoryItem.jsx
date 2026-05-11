import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { useAdminStore } from '../../../store/adminStore';
import { ArrowLeft, Check, Package, Layers, Info, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const CATEGORIES = ['FRESHWATER', 'SEAFOOD', 'PRAWNS', 'CRAB', 'FROZEN', 'OTHER'];
const UNITS = ['KG', 'PCS', 'BOX', 'PACKET'];

export default function AddInventoryItem() {
  const navigate = useNavigate();
  const { inventory, addInventoryItem } = useAdminStore();
  const [formData, setFormData] = useState({
    name: '',
    category: 'FRESHWATER',
    qty: '',
    unit: 'KG',
    price: '',
    minStock: '50'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const trimmedName = formData.name.trim().toUpperCase();

    if (!trimmedName || trimmedName.length < 2) {
      newErrors.name = 'Product name is too short';
    } else if (inventory.some(item => item.name.toUpperCase() === trimmedName)) {
      newErrors.name = 'This product already exists in inventory';
    }

    if (formData.qty === '' || isNaN(formData.qty) || Number(formData.qty) < 0) {
      newErrors.qty = 'Enter 0 or a positive number';
    }

    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.minStock === '' || isNaN(formData.minStock) || Number(formData.minStock) < 0) {
      newErrors.minStock = 'Alert level must be 0 or more';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const qty = Number(formData.qty);
    const minStock = Number(formData.minStock);

    addInventoryItem({
      ...formData,
      name: formData.name.toUpperCase(),
      qty: qty,
      price: Number(formData.price),
      minStock: minStock,
      status: qty === 0 ? 'out-of-stock' : qty <= minStock ? 'low-stock' : 'in-stock'
    });

    toast.success(`${formData.name.toUpperCase()} added to inventory`);
    navigate('/admin/inventory');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin/inventory')} 
        className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest transition-all"
      >
        <ArrowLeft size={14} /> BACK TO INVENTORY
      </button>

      {/* Header */}
      <div className="flex justify-between items-end pb-2 border-b border-card-border">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">New <span className="text-accent-olive">Product.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-widest">Register a new item in the warehouse</p>
        </div>
        <Package size={24} className="text-accent-olive opacity-20" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border border-card-border shadow-subtle bg-white p-6 space-y-6">
          
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-accent-olive"></div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Primary Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Product Name</label>
                <input 
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={clsx(
                    "w-full border px-3 py-2.5 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-black",
                    errors.name ? "border-red-500 bg-red-50" : "border-card-border"
                  )}
                  placeholder="e.g. SILVER POMFRET"
                />
                {errors.name && <p className="text-[7px] font-bold text-red-500 uppercase">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-card-border px-3 py-2.5 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Stock & Price Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-accent-olive"></div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Inventory & Pricing</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Initial Qty</label>
                <input 
                  type="number"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className={clsx(
                    "w-full border px-3 py-2.5 text-[11px] font-black outline-none focus:ring-1 focus:ring-black",
                    errors.qty ? "border-red-500 bg-red-50" : "border-card-border"
                  )}
                  placeholder="0"
                />
                {errors.qty && <p className="text-[7px] font-bold text-red-500 uppercase">{errors.qty}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Unit</label>
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-card-border px-3 py-2.5 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-black bg-white"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Price / Unit (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-text-muted">₹</span>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={clsx(
                      "w-full border pl-7 pr-3 py-2.5 text-[11px] font-black outline-none focus:ring-1 focus:ring-black",
                      errors.price ? "border-red-500 bg-red-50" : "border-card-border"
                    )}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="text-[7px] font-bold text-red-500 uppercase">{errors.price}</p>}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="p-4 bg-olive-50/50 border border-card-border/50 space-y-3">
             <div className="flex items-center gap-2">
                <Info size={14} className="text-accent-olive" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-black">Alert Settings</span>
             </div>
             <div className="flex items-center justify-between gap-4">
                <p className="text-[9px] text-text-muted font-bold leading-relaxed max-w-[250px]">
                  System will trigger a "LOW STOCK" alert when quantity falls below this level.
                </p>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      className={clsx("w-20 border px-2 py-1.5 text-[10px] font-black outline-none text-center", errors.minStock ? "border-red-500 bg-red-50" : "border-card-border")}
                    />
                    <span className="text-[8px] font-bold text-text-muted uppercase">KG</span>
                  </div>
                  {errors.minStock && <p className="text-[7px] font-bold text-red-500 uppercase">{errors.minStock}</p>}
                </div>
             </div>
          </div>

        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
           <Button 
            type="button"
            variant="outline" 
            onClick={() => navigate('/admin/inventory')}
            className="text-[9px] font-bold border-card-border px-8 h-10 uppercase tracking-widest"
           >
             DISCARD
           </Button>
           <Button 
            type="submit"
            className="text-[9px] font-bold px-12 h-10 shadow-lg gap-2 uppercase tracking-widest"
           >
             <Check size={14} /> REGISTER ITEM
           </Button>
        </div>
      </form>
    </div>
  );
}
