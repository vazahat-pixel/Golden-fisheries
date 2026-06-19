import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../design-system';
import { masterService } from '../../../services/masterService';
import { emptyBuyerForm, buyerToForm, toBuyerPayload } from '../../../utils/buyerHelpers';

export function BuyerFormModal({
  isOpen,
  onClose,
  onSuccess,
  buyerId = null,
  initialBuyer = null,
  title,
}) {
  const isEdit = Boolean(buyerId);
  const [form, setForm] = useState(emptyBuyerForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialBuyer ? buyerToForm(initialBuyer) : emptyBuyerForm());
  }, [isOpen, initialBuyer, buyerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.phone.trim() || !form.deliveryAddress.trim()) {
      toast.error('Name, phone, and delivery address are required');
      return;
    }
    setSaving(true);
    try {
      const payload = toBuyerPayload(form);
      let saved;
      if (isEdit) {
        const res = await masterService.buyers.update(buyerId, payload);
        saved = res?.buyer || res?.data?.buyer || res;
        toast.success('Buyer updated');
      } else {
        const res = await masterService.buyers.create(payload);
        saved = res?.buyer || res?.data?.buyer || res;
        toast.success('Buyer created');
      }
      onSuccess?.(saved);
      onClose?.();
    } catch (err) {
      toast.error(err?.message || 'Could not save buyer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (isEdit ? 'Edit Buyer' : 'Add New Buyer')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-olive mb-1 block">
            Buyer / Firm Name *
          </label>
          <input
            type="text"
            required
            value={form.buyerName}
            onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
            placeholder="e.g. CHANNAPPA S. & CO"
            className="w-full border border-card-border px-3 py-2 uppercase focus:ring-1 focus:ring-accent outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-olive mb-1 block">
            Phone *
          </label>
          <input
            type="tel"
            required
            maxLength={10}
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))
            }
            placeholder="10-digit mobile"
            className="w-full border border-card-border px-3 py-2 focus:ring-1 focus:ring-accent outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-olive mb-1 block">
            Buyer Type *
          </label>
          <select
            value={form.buyerType}
            onChange={(e) => setForm((f) => ({ ...f, buyerType: e.target.value }))}
            className="w-full border border-card-border px-3 py-2 focus:ring-1 focus:ring-accent outline-none"
          >
            <option value="EXTERNAL">External buyer</option>
            <option value="INTERNAL">Internal outlet</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-olive mb-1 block">
            Delivery Address *
          </label>
          <textarea
            required
            rows={2}
            value={form.deliveryAddress}
            onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
            placeholder="e.g. Mangalore Wharf"
            className="w-full border border-card-border px-3 py-2 uppercase focus:ring-1 focus:ring-accent outline-none resize-y"
          />
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed border-t border-card-border pt-3">
          For mobile app login, create a <strong>BUYER</strong> user in{' '}
          <Link to="/admin/access" className="text-accent font-bold hover:underline" onClick={onClose}>
            Access Control
          </Link>{' '}
          with the <strong>same phone number</strong>.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-card-border px-4 py-2 text-xs font-bold uppercase"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-olive text-white px-4 py-2 text-xs font-bold uppercase disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Update' : 'Save Buyer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default BuyerFormModal;
