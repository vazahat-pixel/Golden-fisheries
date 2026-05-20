import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { FileText, ArrowLeft, CheckCircle } from 'lucide-react';

const TripHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips().finally(() => setLoading(false));
  }, [fetchTrips]);

  const historyTrips = trips.filter(t => 
    (t.driverId === user?.id || t.driverName === user?.name) &&
    ['Delivered', 'Closed'].includes(t.status)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate('/driver')} className="text-text-muted hover:text-[#6A7051] transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <FileText className="text-brand-yellow" size={24} /> Trip History
          </h1>
          <p className="text-text-secondary text-sm mt-1">Past completed and closed trips.</p>
        </div>
      </div>

      <div className="bg-white border border-card-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Trip No</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Date</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Route</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Cargo Qty</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">Loading History...</td>
                </tr>
              ) : historyTrips.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted italic">No completed trips found.</td>
                </tr>
              ) : (
                historyTrips.map((trip) => (
                  <tr key={trip.id || trip._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-black text-brand-olive">#{trip.tripNumber || trip.id}</td>
                    <td className="py-4 px-4 font-medium text-text-secondary">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-bold text-text-secondary">
                      {trip.pickupLocation?.split(',')[0]} → {trip.deliveryLocation?.split(',')[0]}
                    </td>
                    <td className="py-4 px-4 font-extrabold">{trip.actualQty || trip.expectedQty || '0'} kg</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm ${
                        trip.status === 'Closed' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripHistory;
