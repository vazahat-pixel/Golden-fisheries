import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { masterService } from '../../../services/masterService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';
import { AlertTriangle } from 'lucide-react';

const docKeys = ['rc', 'insurance', 'permit', 'fitness', 'pollution'];

function daysToExpiry(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

const VehicleDocuments = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    masterService.vehicles
      .getAll({ limit: 100 })
      .then((res) => {
        const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
        setVehicles(list);
      })
      .catch(() => setVehicles([]));
  }, []);

  return (
    <div className="pb-12">
      <AdminPageHeader title="Vehicle documents" subtitle="RC, insurance, permit, fitness, pollution" badge="Fleet" />
      <div className="space-y-3">
        {vehicles.length === 0 ? (
          <p className="text-sm text-gray-500">No vehicles registered</p>
        ) : (
          vehicles.map((v) => {
            const docs = v.documents || {};
            const alerts = docKeys.filter((k) => {
              const d = daysToExpiry(docs[k]?.expiry);
              return d !== null && d >= 0 && d < 30;
            });
            return (
              <AdminCard key={v._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/admin/vehicles/${v._id}`} className="font-black text-sm hover:underline">
                      {v.vehicleNumber}
                    </Link>
                    <p className="text-[10px] text-gray-500 uppercase">{v.status}</p>
                  </div>
                  {alerts.length > 0 && (
                    <span className="flex items-center gap-1 text-amber-700 text-[9px] font-bold uppercase">
                      <AlertTriangle size={14} /> {alerts.join(', ')} expiring
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 text-[10px]">
                  {docKeys.map((k) => (
                    <div key={k} className="border rounded p-2">
                      <p className="font-black uppercase">{k}</p>
                      <p>{docs[k]?.url ? 'Uploaded' : 'Missing'}</p>
                      {docs[k]?.expiry && (
                        <p className="text-gray-500">{new Date(docs[k].expiry).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </AdminCard>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VehicleDocuments;
