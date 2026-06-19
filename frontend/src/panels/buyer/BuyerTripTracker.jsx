import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin, Clock, CheckCircle2, Package, ArrowRight, Phone, RefreshCw } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { socketService } from '../../services/socketService';
import { mapsService } from '../../services/mapsService';

const STATUS_STEPS = ['ASSIGNED', 'ACCEPTED', 'STARTED', 'PICKED', 'DELIVERED', 'CLOSED'];

const STATUS_COLORS = {
  ASSIGNED: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  STARTED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  PICKED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  CLOSED: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
};

const BuyerTripTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { buyerTrips, fetchBuyerTrips, loading } = useAdminStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBuyerTrips();
  }, [fetchBuyerTrips]);

  // Auto-refresh on socket events
  useEffect(() => {
    const handleTripChange = () => fetchBuyerTrips();
    if (socketService.socket) {
      socketService.socket.on('trip:status_change', handleTripChange);
    }
    return () => {
      if (socketService.socket) {
        socketService.socket.off('trip:status_change', handleTripChange);
      }
    };
  }, [fetchBuyerTrips]);

  const filteredTrips = buyerTrips.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['DELIVERED', 'CLOSED'].includes(t.status);
    if (filter === 'completed') return ['DELIVERED', 'CLOSED'].includes(t.status);
    return true;
  });

  const activeCount = buyerTrips.filter((t) => !['DELIVERED', 'CLOSED'].includes(t.status)).length;
  const completedCount = buyerTrips.filter(t => ['DELIVERED', 'CLOSED'].includes(t.status)).length;

  const TripTimeline = ({ trip }) => {
    const currentIdx = STATUS_STEPS.indexOf(trip.status);
    return (
      <div className="flex items-center gap-1 mt-3">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const colors = STATUS_COLORS[step];
          return (
            <React.Fragment key={step}>
              <div className={`w-2 h-2 rounded-full transition-all ${
                isCompleted ? colors.dot : 'bg-slate-200'
              } ${isCurrent ? 'ring-2 ring-offset-1 ring-' + step.toLowerCase() + '-400 animate-pulse' : ''}`}></div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif italic font-black text-slate-900">Trip Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBuyerTrips()}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/mobile/buyer/assign-driver')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all"
          >
            + New Trip
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-2xl border-2 transition-all ${filter === 'all' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}
        >
          <p className="text-2xl font-black text-slate-900">{buyerTrips.length}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`p-4 rounded-2xl border-2 transition-all ${filter === 'active' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}
        >
          <p className="text-2xl font-black text-blue-600">{activeCount}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`p-4 rounded-2xl border-2 transition-all ${filter === 'completed' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}
        >
          <p className="text-2xl font-black text-emerald-600">{completedCount}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Done</p>
        </button>
      </div>

      {/* Trip Cards */}
      <div className="grid gap-4">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <Truck size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No trips</p>
            <button
              onClick={() => navigate('/mobile/buyer/assign-driver')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Assign driver
            </button>
          </div>
        ) : filteredTrips.map(trip => {
          const colors = STATUS_COLORS[trip.status] || STATUS_COLORS.ASSIGNED;
          return (
            <div key={trip.id} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                      {trip.tripNumber}
                    </span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {trip.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-1.5">{trip.product}</h3>
                </div>
                <span className="text-[9px] text-slate-400 font-bold">{trip.createdAt}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center">
                    <MapPin size={12} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">From</p>
                    <p className="text-[10px] font-bold text-slate-900 truncate">{trip.pickupLocation || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center">
                    <MapPin size={12} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">To</p>
                    <p className="text-[10px] font-bold text-slate-900 truncate">{trip.deliveryLocation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><Truck size={12} /> {trip.driverName}</span>
                <span className="flex items-center gap-1"><Package size={12} /> {trip.expectedQty} KG</span>
                {trip.actualQty && <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 size={12} /> {trip.actualQty} KG</span>}
              </div>

              <TripTimeline trip={trip} />

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await mapsService.getTripTrack(trip.id);
                    const url = res?.data?.navigationUrl;
                    if (url) window.open(url, '_blank');
                  } catch {
                    /* ignore */
                  }
                }}
                className="w-full py-2 border border-blue-200 text-blue-700 rounded-xl text-[10px] font-bold uppercase"
              >
                Open route in Maps
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuyerTripTracker;
