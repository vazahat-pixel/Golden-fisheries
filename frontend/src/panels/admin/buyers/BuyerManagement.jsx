import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, RefreshCw, Pencil, ExternalLink, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { masterService } from '../../../services/masterService';
import { unwrapBuyers } from '../../../utils/buyerHelpers';
import { BuyerFormModal } from './BuyerFormModal';
import {
  AdminPageHeader,
  AdminCard,
  AdminBtn,
  AdminDataTable,
  AdminSearchBar,
  StatusBadge,
} from '../shared/adminUi';

const BuyerManagement = () => {
  const navigate = useNavigate();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editBuyer, setEditBuyer] = useState(null);

  const loadBuyers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await masterService.buyers.getAll({ limit: 500 });
      setBuyers(unwrapBuyers(res).filter((b) => b.isActive !== false));
    } catch (err) {
      toast.error(err?.message || 'Could not load buyers');
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBuyers();
  }, [loadBuyers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return buyers;
    return buyers.filter(
      (b) =>
        (b.buyerName || b.name || '').toLowerCase().includes(q) ||
        (b.phone || '').includes(q) ||
        (b.buyerCode || '').toLowerCase().includes(q) ||
        (b.deliveryAddress || '').toLowerCase().includes(q)
    );
  }, [buyers, search]);

  const openCreate = () => {
    setEditBuyer(null);
    setModalOpen(true);
  };

  const openEdit = (buyer) => {
    setEditBuyer(buyer);
    setModalOpen(true);
  };

  const columns = [
    { key: 'buyerCode', label: 'Code', render: (row) => row.buyerCode || '—' },
    {
      key: 'buyerName',
      label: 'Buyer / Channapa',
      render: (row) => (
        <span className="font-bold uppercase text-brand-olive">{row.buyerName || row.name || '—'}</span>
      ),
    },
    { key: 'phone', label: 'Phone' },
    {
      key: 'buyerType',
      label: 'Type',
      render: (row) => (
        <span className="text-[10px] font-bold uppercase">{row.buyerType || 'EXTERNAL'}</span>
      ),
    },
    {
      key: 'deliveryAddress',
      label: 'Delivery',
      render: (row) => (
        <span className="text-[10px] line-clamp-2 max-w-[200px]">{row.deliveryAddress || '—'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.isActive === false ? 'INACTIVE' : 'ACTIVE'} />,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <AdminBtn variant="ghost" className="!py-1 !px-2" onClick={() => openEdit(row)}>
            <Pencil className="w-3 h-3 inline" /> Edit
          </AdminBtn>
          <AdminBtn
            variant="outline"
            className="!py-1 !px-2"
            onClick={() =>
              navigate('/admin/procurement/tapal/create', {
                state: { preselectBuyerId: row._id || row.id },
              })
            }
          >
            Tapal
          </AdminBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <AdminPageHeader
        badge="Master data"
        title="Buyers (Channapa)"
        subtitle="Register buyers for tapals · link phone to Access Control for buyer app login"
        actions={
          <>
            <AdminBtn variant="outline" onClick={() => navigate('/admin/access')}>
              <Shield className="w-4 h-4" /> Access Control
            </AdminBtn>
            <AdminBtn variant="ghost" onClick={loadBuyers}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </AdminBtn>
            <AdminBtn variant="primary" onClick={openCreate}>
              <Plus className="w-4 h-4" /> Add Buyer
            </AdminBtn>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminCard className="p-4">
          <p className="text-[10px] font-bold uppercase text-text-muted">Total buyers</p>
          <p className="text-2xl font-black text-brand-olive mt-1">{buyers.length}</p>
        </AdminCard>
        <AdminCard className="p-4 sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-text-muted">Quick links</p>
            <p className="text-xs text-text-secondary mt-1">
              Assign buyer when creating a tapal — tapals appear on buyer dashboard when phone matches.
            </p>
          </div>
          <AdminBtn variant="outline" onClick={() => navigate('/admin/procurement/tapal/create')}>
            <ExternalLink className="w-4 h-4" /> Create Tapal
          </AdminBtn>
        </AdminCard>
      </div>

      <AdminCard className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-brand-olive">
            <Users size={18} />
            <span className="text-sm font-bold uppercase tracking-wide">Buyer register</span>
          </div>
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search name, phone, code…"
            className="sm:max-w-xs w-full"
          />
        </div>
        {loading ? (
          <p className="text-sm text-text-muted py-8 text-center">Loading buyers…</p>
        ) : (
          <AdminDataTable columns={columns} rows={filtered} emptyLabel="No buyers yet — add your first Channapa" />
        )}
      </AdminCard>

      <p className="text-[11px] text-text-muted">
        Need buyer mobile login?{' '}
        <Link to="/admin/access" className="text-accent font-bold hover:underline">
          Access Control → Add user → Role BUYER
        </Link>{' '}
        (same phone as above).
      </p>

      <BuyerFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditBuyer(null);
        }}
        buyerId={editBuyer?._id || editBuyer?.id}
        initialBuyer={editBuyer}
        onSuccess={() => loadBuyers()}
      />
    </div>
  );
};

export default BuyerManagement;
