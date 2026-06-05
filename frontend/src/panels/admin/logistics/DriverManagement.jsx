import React, { useEffect, useState, useCallback } from 'react';
import { masterService } from '../../../services/masterService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';
import { toast } from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

function normalizeDriverRow(d) {
  const user = d.userId && typeof d.userId === 'object' ? d.userId : null;
  return {
    id: d._id,
    name: d.fullName || user?.fullName || d.name || '—',
    phone: d.phone || user?.phone || d.mobile || '—',
    status: d.registrationStatus || d.status || (d.isActive || user?.isActive ? 'active' : 'pending_verification'),
    source: d.source || (user ? 'profile' : 'access_control'),
    vehicle: d.vehicleNumber || '—',
  };
}

const statusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'active') return 'bg-emerald-100 text-emerald-800';
  if (s === 'pending_verification' || s === 'pending') return 'bg-amber-100 text-amber-800';
  if (s === 'rejected') return 'bg-rose-100 text-rose-800';
  return 'bg-slate-100 text-slate-700';
};

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await masterService.drivers.getAll({ limit: 200 });
      const list = res?.data ?? res?.docs ?? (Array.isArray(res) ? res : []);
      setDrivers(list.map(normalizeDriverRow));
    } catch (e) {
      toast.error(e?.message || 'Failed to load drivers');
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const approve = async (id) => {
    try {
      await masterService.drivers.approve(id);
      toast.success('Driver approved');
      await loadDrivers();
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <div className="pb-12">
      <AdminPageHeader
        title="Driver management"
        subtitle="All drivers (Access Control + self-registration)"
        actions={
          <button
            type="button"
            onClick={loadDrivers}
            disabled={loading}
            className="px-3 py-2 border border-card-border text-[10px] font-black uppercase flex items-center gap-1 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading drivers…</p>
      ) : drivers.length === 0 ? (
        <p className="text-sm text-gray-500">No drivers found. Create one in Access Control (role: DRIVER).</p>
      ) : (
        <div className="space-y-2">
          {drivers.map((d) => (
            <AdminCard key={d.id} className="p-4 flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{d.name}</p>
                <p className="text-[10px] text-gray-500">
                  {d.phone} · {d.vehicle !== '—' ? d.vehicle : 'No vehicle on file'}
                </p>
                <p className="text-[9px] text-gray-400 uppercase mt-0.5">
                  {d.source === 'access_control' ? 'Created in Access Control' : 'Full registration'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${statusBadge(d.status)}`}
                >
                  {(d.status || 'unknown').replace(/_/g, ' ')}
                </span>
                {(d.status === 'pending_verification' || d.status === 'pending') && (
                  <button
                    type="button"
                    onClick={() => approve(d.id)}
                    className="px-3 py-2 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase"
                  >
                    Approve
                  </button>
                )}
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
