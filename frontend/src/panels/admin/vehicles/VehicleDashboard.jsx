import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masterService } from '../../../services/masterService';
import { AlertTriangle, Plus, Truck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VehicleDashboard = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await masterService.vehicles.getAll();
        const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
        setVehicles(list);
      } catch (err) {
        toast.error(err?.message || 'Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const expiringSoon = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const days = (d - new Date()) / (86400000);
    return days >= 0 && days < 30;
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold uppercase text-brand-olive flex items-center gap-2">
          <Truck size={22} /> Vehicles
        </h1>
        <button
          type="button"
          onClick={() => navigate('/admin/vehicles/new')}
          className="flex items-center gap-1 bg-brand-olive text-white px-3 py-2 text-xs font-bold uppercase"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-2">
          {vehicles.map((v) => {
            const docs = v.documents || {};
            const alerts = ['rc', 'insurance', 'permit', 'fitness', 'pollution'].filter((k) =>
              expiringSoon(docs[k]?.expiry)
            );
            return (
              <button
                key={v._id || v.id}
                type="button"
                onClick={() => navigate(`/admin/vehicles/${v._id || v.id}`)}
                className="w-full text-left border border-gray-300 bg-white p-3 flex justify-between items-start"
              >
                <div>
                  <p className="font-bold font-mono">{v.vehicleNumber}</p>
                  <p className="text-xs text-gray-600">{v.type} · {v.status}</p>
                  {v.assignedDriverName && (
                    <p className="text-xs mt-1">Driver: {v.assignedDriverName}</p>
                  )}
                </div>
                {alerts.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-700 text-xs">
                    <AlertTriangle size={14} /> {alerts.length} expiry
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleDashboard;
