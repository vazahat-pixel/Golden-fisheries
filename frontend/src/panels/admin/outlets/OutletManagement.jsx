import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Utensils,
  ShoppingBag,
  Plus,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  Star,
  Power,
  Search,
  Store,
} from 'lucide-react';
import {
  AdminPageHeader,
  AdminCard,
  AdminBtn,
  AdminDataTable,
  StatusBadge,
} from '../shared/adminUi';
import { fishMallOutletService, unwrapOutletList } from '../../../services/fishMallOutletService';
import { restaurantOutletService } from '../../../services/restaurantOutletService';

const emptyForm = () => ({
  name: '',
  location: '',
  phone: '',
  email: '',
  kitchenLabel: 'Kitchen',
});

const apiMessage = (err) => err?.message || err?.response?.data?.message || 'Request failed';

const OutletManagement = () => {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [fishMalls, setFishMalls] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fishForm, setFishForm] = useState(emptyForm());
  const [restForm, setRestForm] = useState(emptyForm());

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fmRes, restRes] = await Promise.all([
        fishMallOutletService.list({ limit: 200, activeOnly: 'false' }),
        restaurantOutletService.list({ limit: 200, activeOnly: 'false' }),
      ]);
      setFishMalls(unwrapOutletList(fmRes));
      setRestaurants(unwrapOutletList(restRes));
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filterList = (list) => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) =>
        (o.name || '').toLowerCase().includes(q) ||
        (o.outletCode || '').toLowerCase().includes(q) ||
        (o.location || '').toLowerCase().includes(q)
    );
  };

  const visibleFish = useMemo(() => filterList(fishMalls), [fishMalls, search]);
  const visibleRest = useMemo(() => filterList(restaurants), [restaurants, search]);

  const stats = useMemo(
    () => ({
      fishTotal: fishMalls.length,
      fishActive: fishMalls.filter((o) => o.isActive !== false).length,
      restTotal: restaurants.length,
      restActive: restaurants.filter((o) => o.isActive !== false).length,
    }),
    [fishMalls, restaurants]
  );

  const handleRegisterFish = async (e) => {
    e.preventDefault();
    if (!fishForm.name.trim()) {
      toast.error('Fish Mall name is required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await fishMallOutletService.create({
        name: fishForm.name.trim(),
        location: fishForm.location.trim(),
        phone: fishForm.phone.trim(),
        email: fishForm.email.trim(),
      });
      const outlet = created?.data?.outlet ?? created?.outlet ?? created?.data;
      toast.success(outlet?.outletCode ? `Fish Mall ${outlet.outletCode} registered` : 'Fish Mall registered');
      setFishForm(emptyForm());
      loadAll();
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterRest = async (e) => {
    e.preventDefault();
    if (!restForm.name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await restaurantOutletService.create({
        name: restForm.name.trim(),
        location: restForm.location.trim(),
        phone: restForm.phone.trim(),
        email: restForm.email.trim(),
        kitchenLabel: restForm.kitchenLabel.trim() || 'Kitchen',
      });
      const outlet = created?.data?.outlet ?? created?.outlet ?? created?.data;
      toast.success(outlet?.outletCode ? `Restaurant ${outlet.outletCode} registered` : 'Restaurant registered');
      setRestForm(emptyForm());
      loadAll();
    } catch (err) {
      toast.error(apiMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const patchFish = async (id, payload) => {
    try {
      await fishMallOutletService.update(id, payload);
      toast.success('Fish Mall updated');
      loadAll();
    } catch (err) {
      toast.error(apiMessage(err));
    }
  };

  const patchRest = async (id, payload) => {
    try {
      await restaurantOutletService.update(id, payload);
      toast.success('Restaurant updated');
      loadAll();
    } catch (err) {
      toast.error(apiMessage(err));
    }
  };

  const outletColumns = (type) => [
    { key: 'outletCode', label: 'Code', render: (r) => <span className="font-mono text-[10px] font-bold">{r.outletCode}</span> },
    { key: 'name', label: 'Name', render: (r) => <span className="font-black text-[10px] uppercase">{r.name}</span> },
    {
      key: 'location',
      label: 'Location',
      render: (r) => (
        <span className="text-[10px] text-text-muted flex items-center gap-1">
          {r.location ? (
            <>
              <MapPin className="w-3 h-3 shrink-0" /> {r.location}
            </>
          ) : (
            '—'
          )}
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (r) => (
        <div className="text-[9px] font-bold text-text-muted space-y-0.5">
          {r.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {r.phone}
            </span>
          )}
          {r.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {r.email}
            </span>
          )}
          {!r.phone && !r.email && '—'}
        </div>
      ),
    },
    type === 'restaurant'
      ? {
          key: 'kitchen',
          label: 'Kitchen',
          render: (r) => <span className="text-[10px] font-bold">{r.kitchenLabel || 'Kitchen'}</span>,
        }
      : null,
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge status={r.isActive === false ? 'REJECTED' : 'ACTIVE'} />
          {r.isDefault && (
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200">
              Default
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (r) => {
        const id = r._id || r.id;
        const patch = type === 'fishmall' ? patchFish : patchRest;
        return (
          <div className="flex flex-wrap gap-1 justify-end">
            {!r.isDefault && r.isActive !== false && (
              <button
                type="button"
                title="Set as default"
                onClick={() => patch(id, { isDefault: true })}
                className="p-1.5 border border-card-border hover:bg-amber-50 text-amber-700"
              >
                <Star className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              title={r.isActive === false ? 'Activate' : 'Deactivate'}
              onClick={() => patch(id, { isActive: r.isActive === false })}
              className="p-1.5 border border-card-border hover:bg-slate-50"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ].filter(Boolean);

  const tabs = [
    { id: 'all', label: 'All outlets' },
    { id: 'fishmall', label: 'Fish Mall', icon: ShoppingBag },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  ];

  const showFish = tab === 'all' || tab === 'fishmall';
  const showRest = tab === 'all' || tab === 'restaurant';

  return (
    <div className="pb-12 p-6 md:p-8 max-w-6xl mx-auto">
      <AdminPageHeader
        badge="Master registry"
        title="Outlets"
        subtitle="Register Fish Mall & Restaurant locations — used for stock transfers and panel access"
        actions={
          <AdminBtn variant="ghost" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </AdminBtn>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Fish Malls', value: stats.fishTotal, sub: `${stats.fishActive} active`, icon: ShoppingBag, tone: 'text-[#6B7550]' },
          { label: 'Restaurants', value: stats.restTotal, sub: `${stats.restActive} active`, icon: Utensils, tone: 'text-[#6B7550]' },
          {
            label: 'Transfer target',
            value: stats.fishActive,
            sub: 'Fish Mall dropdown',
            icon: Store,
            tone: 'text-emerald-700',
          },
          {
            label: 'Kitchen supply',
            value: stats.restActive,
            sub: 'Internal bills',
            icon: Utensils,
            tone: 'text-emerald-700',
          },
        ].map((s) => (
          <AdminCard key={s.label} className="p-4 flex items-start gap-3">
            <div className="p-2 bg-[#F8F7F2] border border-card-border">
              <s.icon className={`w-4 h-4 ${s.tone}`} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-text-muted tracking-widest">{s.label}</p>
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[9px] font-bold text-text-muted">{s.sub}</p>
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex flex-wrap gap-1 border border-card-border p-1 bg-white">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${
                tab === id ? 'bg-[#6B7550] text-white' : 'text-text-muted hover:bg-[#F8F7F2]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            className="w-full border border-card-border pl-10 pr-3 py-2.5 text-sm font-bold"
            placeholder="Search by name, code, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <AdminCard className="p-6 border-l-4 border-l-[#6B7550]">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#6B7550] mb-1 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Register Fish Mall
          </h3>
          <p className="text-[10px] text-text-muted font-bold mb-4">
            Appears in Admin → Transfer to Fish Mall destination dropdown
          </p>
          <form onSubmit={handleRegisterFish} className="space-y-3">
            <FormField label="Name *" value={fishForm.name} onChange={(v) => setFishForm({ ...fishForm, name: v })} placeholder="Karwar Fish Mall" />
            <FormField label="Location" value={fishForm.location} onChange={(v) => setFishForm({ ...fishForm, location: v })} placeholder="City / area" />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone" value={fishForm.phone} onChange={(v) => setFishForm({ ...fishForm, phone: v })} />
              <FormField label="Email" value={fishForm.email} onChange={(v) => setFishForm({ ...fishForm, email: v })} />
            </div>
            <AdminBtn type="submit" variant="primary" disabled={submitting} className="w-full">
              <Plus className="w-4 h-4" /> {submitting ? 'Saving…' : 'Add Fish Mall'}
            </AdminBtn>
          </form>
        </AdminCard>

        <AdminCard className="p-6 border-l-4 border-l-black">
          <h3 className="text-sm font-black uppercase tracking-widest mb-1 flex items-center gap-2">
            <Utensils className="w-4 h-4" /> Register Restaurant
          </h3>
          <p className="text-[10px] text-text-muted font-bold mb-4">
            Kitchen destination for Fish Mall internal bills & POS operations
          </p>
          <form onSubmit={handleRegisterRest} className="space-y-3">
            <FormField label="Name *" value={restForm.name} onChange={(v) => setRestForm({ ...restForm, name: v })} placeholder="GF Restaurant — Main" />
            <FormField label="Location" value={restForm.location} onChange={(v) => setRestForm({ ...restForm, location: v })} />
            <FormField
              label="Kitchen label"
              value={restForm.kitchenLabel}
              onChange={(v) => setRestForm({ ...restForm, kitchenLabel: v })}
              placeholder="GF Restaurant Kitchen"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Phone" value={restForm.phone} onChange={(v) => setRestForm({ ...restForm, phone: v })} />
              <FormField label="Email" value={restForm.email} onChange={(v) => setRestForm({ ...restForm, email: v })} />
            </div>
            <AdminBtn type="submit" variant="primary" disabled={submitting} className="w-full !bg-black">
              <Plus className="w-4 h-4" /> {submitting ? 'Saving…' : 'Add Restaurant'}
            </AdminBtn>
          </form>
        </AdminCard>
      </div>

      {showFish && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#6B7550]" /> Fish Mall outlets ({visibleFish.length})
            </h3>
            <Link to="/admin/inventory/transfer-fishmall" className="text-[10px] font-black uppercase text-[#6B7550] hover:underline flex items-center gap-1">
              Stock transfer <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <AdminDataTable
            columns={outletColumns('fishmall')}
            rows={visibleFish}
            loading={loading}
            emptyMessage="No Fish Malls — register above"
          />
        </section>
      )}

      {showRest && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Utensils className="w-4 h-4" /> Restaurant outlets ({visibleRest.length})
            </h3>
            <Link to="/fishmall/internal-supply" className="text-[10px] font-black uppercase text-black hover:underline flex items-center gap-1">
              Internal supply <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <AdminDataTable
            columns={outletColumns('restaurant')}
            rows={visibleRest}
            loading={loading}
            emptyMessage="No restaurants — register above"
          />
        </section>
      )}

      <AdminCard className="p-6">
        <h3 className="text-sm font-black uppercase tracking-widest mb-4">Open operational panels</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              name: 'Fish Mall Retail',
              path: '/fishmall/billing',
              icon: ShoppingBag,
              desc: 'Weight billing, stock, internal bills to restaurant',
              color: 'border-[#6B7550]/30 hover:border-[#6B7550]',
            },
            {
              name: 'Restaurant POS',
              path: '/restaurant/pos',
              icon: Utensils,
              desc: 'POS, kitchen, settlement, received stock',
              color: 'border-black/20 hover:border-black',
            },
          ].map((o) => (
            <Link key={o.path} to={o.path} target="_blank" rel="noreferrer">
              <div className={`p-5 border-2 ${o.color} transition-colors h-full flex flex-col`}>
                <o.icon size={26} className="mb-3 text-[#6A7051]" />
                <h4 className="font-black text-sm uppercase">{o.name}</h4>
                <p className="text-[10px] text-text-muted font-bold mt-1 flex-1">{o.desc}</p>
                <span className="text-[9px] font-black uppercase text-[#6B7550] mt-3 flex items-center gap-1">
                  Open panel <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </AdminCard>
    </div>
  );
};

function FormField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase text-text-muted block mb-1">{label}</label>
      <input
        className="w-full border border-card-border px-3 py-2 text-sm font-bold"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default OutletManagement;
