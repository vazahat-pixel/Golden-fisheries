import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { AdminPageHeader } from '../shared/adminUi';
import AssignDriverPanel from '../shared/AssignDriverPanel';
import { Package, ChevronRight } from 'lucide-react';

const ASSIGNABLE = ['CREATED', 'ASSIGNED', 'CONFIRMED'];

/** Pick a tapal waiting for driver, then assign from detail or inline */
const TapalAssignDriver = () => {
  const { tapals, fetchTapals } = useAdminStore();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTapals();
  }, [fetchTapals]);

  const waiting = (tapals || []).filter((t) =>
    ASSIGNABLE.includes((t.status || '').toUpperCase())
  );

  const filtered = waiting.filter(
    (t) =>
      !search ||
      t.tapalNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.partyName?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = filtered.find((t) => (t.id || t._id) === selectedId) || filtered[0];

  useEffect(() => {
    if (filtered.length && !selectedId) {
      setSelectedId(filtered[0].id || filtered[0]._id);
    }
  }, [filtered, selectedId]);

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Assign driver to tapal"
        subtitle="After tapal is created, assign a driver here. Driver sees the trip on Driver Login → Active Trip."
        badge="Logistics"
      />

      <input
        type="text"
        placeholder="Search tapal number or party…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md border border-card-border px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#6A7051]"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-2 max-h-[480px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-text-secondary p-6 bg-white border border-card-border">
              No tapals waiting for driver (status CREATED, ASSIGNED, or CONFIRMED).
            </p>
          ) : (
            filtered.map((t) => {
              const id = t.id || t._id;
              const active = (selected?.id || selected?._id) === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setSelectedId(id)}
                  className={`w-full text-left p-4 border flex items-center justify-between gap-2 transition-all ${
                    active ? 'border-[#6A7051] bg-[#6A7051]/5 border-l-4 border-l-brand-yellow' : 'border-card-border bg-white'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-black uppercase text-text-muted">{t.tapalNumber}</span>
                    <p className="text-sm font-black text-brand-olive">{t.partyName}</p>
                    <p className="text-[10px] text-text-secondary">{t.status} · {t.qty || t.numericQty}</p>
                  </div>
                  <Package size={18} className="text-[#6A7051] shrink-0" />
                </button>
              );
            })
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          {selected ? (
            <>
              <AssignDriverPanel tapal={selected} onAssigned={() => fetchTapals()} />
              <Link
                to={`/admin/tapals/${selected.id || selected._id}`}
                className="text-[10px] font-black uppercase text-[#6A7051] flex items-center gap-1 hover:underline"
              >
                Open full tapal record <ChevronRight size={12} />
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TapalAssignDriver;
