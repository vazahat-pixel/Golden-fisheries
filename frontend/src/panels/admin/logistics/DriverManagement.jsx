import React, { useEffect, useState } from 'react';
import { masterService } from '../../../services/masterService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';
import { toast } from 'react-hot-toast';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    masterService.drivers
      .getAll({ limit: 100 })
      .then((res) => {
        const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
        setDrivers(list);
      })
      .catch(() => setDrivers([]));
  }, []);

  const approve = async (id) => {
    try {
      await masterService.drivers.approve(id);
      toast.success('Driver approved');
      const res = await masterService.drivers.getAll({ limit: 100 });
      setDrivers(res?.data || res?.docs || []);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <div className="pb-12">
      <AdminPageHeader title="Driver management" subtitle="Approve pending driver registrations" />
      {drivers.length === 0 ? (
        <p className="text-sm text-gray-500">No drivers</p>
      ) : (
        <div className="space-y-2">
          {drivers.map((d) => (
            <AdminCard key={d._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{d.fullName || d.name}</p>
                <p className="text-[10px] text-gray-500">{d.phone} · {d.status || '—'}</p>
              </div>
              {d.status === 'pending_verification' && (
                <button
                  type="button"
                  onClick={() => approve(d._id)}
                  className="px-3 py-2 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase"
                >
                  Approve
                </button>
              )}
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
