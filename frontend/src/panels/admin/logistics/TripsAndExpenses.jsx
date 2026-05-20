import React, { useEffect, useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { useAdminStore } from '../../../store/adminStore';
import { useAdminLayout } from '../../../design-system/layouts/AdminLayout';
import { socketService } from '../../../services/socketService';
import {
  Truck,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  History,
  FileText,
  Navigation,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_STEPS = ['ASSIGNED', 'ACCEPTED', 'STARTED', 'PICKED', 'DELIVERED', 'CLOSED'];

const STATUS_COLORS = {
  ASSIGNED: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  STARTED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  PICKED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CLOSED: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const TripsAndExpenses = () => {
  const navigate = useNavigate();
  const { trips, fetchTrips } = useAdminStore();
  const { isMobile } = useAdminLayout();
  const [liveUpdate, setLiveUpdate] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Real-time socket listener
  useEffect(() => {
    const handleTripChange = (data) => {
      setLiveUpdate(data);
      fetchTrips(); // Auto-refresh on any trip status change
      setTimeout(() => setLiveUpdate(null), 3000);
    };

    if (socketService.socket) {
      socketService.socket.on('trip:status_change', handleTripChange);
    }
    return () => {
      if (socketService.socket) {
        socketService.socket.off('trip:status_change', handleTripChange);
      }
    };
  }, [fetchTrips]);

  const activeTrips = trips.filter(t => !['DELIVERED', 'CLOSED', 'REJECTED'].includes(t.status));
  const completedTrips = trips.filter(t => ['DELIVERED', 'CLOSED'].includes(t.status));
  const totalExpenses = trips.reduce((acc, trip) => {
    return acc + (trip.expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0);
  }, 0);

  const TripTimeline = ({ trip }) => {
    const currentIdx = STATUS_STEPS.indexOf(trip.status);
    return (
      <div className="flex items-center gap-0.5">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <React.Fragment key={step}>
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                } ${isCurrent ? 'ring-1 ring-offset-0.5 ring-emerald-400 animate-pulse' : ''}`}
                title={step}
              ></div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`w-3 h-0.5 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-3 max-w-6xl mx-auto">
      {/* Live Update Banner */}
      {liveUpdate && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2 animate-in fade-in duration-300">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
            Live: {liveUpdate.tripNumber} — {liveUpdate.status}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Trips & <span className="text-accent-olive">Logistics.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            REAL-TIME MONITORING • {trips.length} TOTAL TRIPS
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchTrips()}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          {!isMobile && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[9px] font-bold border-accent-olive text-accent-olive hover:bg-accent-olive hover:text-white uppercase tracking-widest px-4 h-9 shadow-subtle"
                onClick={() => navigate('/admin/logistics/drivers')}
              >
                <UserPlus size={12} /> MANAGE FLEET
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[9px] font-bold border-card-border uppercase tracking-widest px-4 h-9 shadow-subtle"
                onClick={() => toast.success('Viewing trip history...')}
              >
                <History size={12} /> HISTORY
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard title="ACTIVE TRIPS" value={activeTrips.length.toString()} icon={Truck} trend="IN PROGRESS" trendType="up" />
        <StatCard title="COMPLETED" value={completedTrips.length.toString()} icon={CheckCircle2} trend="ALL TIME" trendType="up" />
        <StatCard title="TOTAL EXPENSES" value={`₹${totalExpenses.toLocaleString()}`} icon={IndianRupee} trend="REIMBURSABLE" trendType="down" />
      </div>

      {/* Trip Cards */}
      <div className="space-y-3">
        {trips.length === 0 ? (
          <Card padding="none" className="border border-card-border bg-white shadow-subtle">
            <div className="px-4 py-16 text-center">
              <Truck size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">No trips yet</p>
              <p className="text-xs text-slate-300 mt-1">Trips will appear here when drivers are assigned to tapals</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {trips.map((trip) => {
              const colors = STATUS_COLORS[trip.status] || STATUS_COLORS.ASSIGNED;
              return (
                <Card key={trip.id} padding="none" className="border border-card-border bg-white shadow-subtle overflow-hidden hover:shadow-md transition-all">
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                          {trip.tripNumber || trip.id}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {trip.status}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">{trip.createdAt}</span>
                    </div>

                    {/* Driver & Vehicle */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                          <Truck size={14} className="text-slate-600" />
                        </div>
                        <div>
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Driver</p>
                          <p className="text-[11px] font-black text-slate-900">{trip.driverName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                          <Navigation size={14} className="text-slate-600" />
                        </div>
                        <div>
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Vehicle</p>
                          <p className="text-[11px] font-black text-slate-900">{trip.vehicle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <MapPin size={12} className="text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-700 truncate">{trip.pickupLocation || 'N/A'}</span>
                      <ArrowRight size={12} className="text-slate-400 shrink-0" />
                      <MapPin size={12} className="text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-700 truncate">{trip.deliveryLocation || 'N/A'}</span>
                    </div>

                    {/* Quantities */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><Package size={12} /> Expected: {trip.expectedQty || 'N/A'} KG</span>
                      {trip.actualQty && <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 size={12} /> Actual: {trip.actualQty} KG</span>}
                    </div>

                    {/* Timeline */}
                    <TripTimeline trip={trip} />

                    {/* Expenses */}
                    {trip.expenses && trip.expenses.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expenses</p>
                        <div className="flex flex-wrap gap-1">
                          {trip.expenses.map((exp, idx) => (
                            <span key={idx} className="text-[8px] font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-lg">
                              {exp.type}: ₹{exp.amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsAndExpenses;
