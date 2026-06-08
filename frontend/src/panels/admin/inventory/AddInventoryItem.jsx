import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterService } from '../../../services/masterService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { value: 'SEAFOOD', label: 'Seafood' },
  { value: 'FRESHWATER', label: 'Freshwater' },
  { value: 'PRAWNS', label: 'Prawns' },
  { value: 'CRAB', label: 'Crab' },
  { value: 'OTHER', label: 'Other' },
];

const formatApiError = (err) => {
  const errors = err?.errors;
  if (Array.isArray(errors) && errors.length) {
    return errors.map((e) => `${e.field}: ${e.message}`).join(' · ');
  }
  return err?.message || 'Failed to save product';
};

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    category: 'SEAFOOD',
    baseUnit: 'KG',
    basePrice: '',
    quantity: '',
    minStockLimit: '50',
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const basePrice = parseFloat(form.basePrice);
    if (Number.isNaN(basePrice) || basePrice < 0) {
      toast.error('Enter a valid base price (₹ per KG)');
      return;
    }

    setSaving(true);
    try {
      await masterService.products.create({
        name: form.name.trim(),
        category: form.category,
        baseUnit: form.baseUnit,
        basePrice,
        quantity: parseFloat(form.quantity) || 0,
        minStockLimit: parseFloat(form.minStockLimit) || 50,
      });
      toast.success('Product created');
      navigate('/admin/inventory');
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-12">
      <PaperFormFrame title="Add product / SKU" subtitle="Inventory master">
        <form onSubmit={submit} className="space-y-0">
          <PaperFieldRow label="Name">
            <input
              required
              className={paperInputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rohu Carp"
            />
          </PaperFieldRow>
          <PaperFieldRow label="Category">
            <select
              className={paperInputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </PaperFieldRow>
          <PaperFieldRow label="Base price (₹ / unit)">
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className={paperInputClass}
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              placeholder="e.g. 180"
            />
          </PaperFieldRow>
          <PaperFieldRow label="Opening qty">
            <input
              type="number"
              min="0"
              step="0.01"
              className={paperInputClass}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g. 500"
            />
          </PaperFieldRow>
          <PaperFieldRow label="Unit">
            <select
              className={paperInputClass}
              value={form.baseUnit}
              onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
            >
              <option value="KG">KG</option>
              <option value="BOX">BOX</option>
              <option value="PIECE">PIECE</option>
            </select>
          </PaperFieldRow>
          <PaperFieldRow label="Low stock alert at">
            <input
              type="number"
              min="0"
              className={paperInputClass}
              value={form.minStockLimit}
              onChange={(e) => setForm({ ...form, minStockLimit: e.target.value })}
            />
          </PaperFieldRow>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full py-3 bg-accent text-white font-bold text-xs uppercase rounded disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save product'}
          </button>
        </form>
      </PaperFormFrame>
    </div>
  );
};

export default AddInventoryItem;
