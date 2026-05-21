import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterService } from '../../../services/masterService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', unit: 'KG', quantity: '', category: 'SEAFOOD' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await masterService.products.create({
        name: form.name,
        unit: form.unit,
        quantity: parseFloat(form.quantity) || 0,
        category: form.category,
      });
      toast.success('Product created');
      navigate('/admin/inventory');
    } catch (err) {
      toast.error(err?.message || 'Failed');
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
            />
          </PaperFieldRow>
          <PaperFieldRow label="Opening qty (KG)">
            <input
              type="number"
              className={paperInputClass}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </PaperFieldRow>
          <PaperFieldRow label="Unit">
            <input className={paperInputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </PaperFieldRow>
          <button type="submit" className="mt-4 w-full py-3 bg-slate-900 text-white font-bold text-xs uppercase rounded">
            Save
          </button>
        </form>
      </PaperFormFrame>
    </div>
  );
};

export default AddInventoryItem;
