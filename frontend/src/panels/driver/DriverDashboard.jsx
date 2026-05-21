import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Truck, ClipboardList, ShieldAlert, Award, FileText, 
  MapPin, PlusCircle, CheckCircle2, Navigation, DollarSign, LogOut, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { 
    myTrips, myExpenses, fetchMyTrips, fetchMyExpenses, loading 
  } = useDriverStore();

  const [activeTab, setActiveTab] = useState('TRIPS'); // TRIPS, EXPENSES

  useEffect(() => {
    fetchMyTrips();
    fetchMyExpenses();
  }, [fetchMyTrips, fetchMyExpenses]);

  const tripsList = myTrips || [];
  const activeTrip = tripsList.find(t => ['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED'].includes(t.status));
  const pastTrips = tripsList.filter(t => !['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED'].includes(t.status));

  // Compute driver specific KPI stats
  const totalTripsCompleted = pastTrips.length + (activeTrip ? 0 : 1);
  const totalExpensesLogged = myExpenses?.length || 0;
  const driverName = user?.fullName || user?.name || 'Driver Executive';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth/driver');
  };

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'ASSIGNED' || s === 'STARTED') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (s === 'PICKED' || s === 'IN TRANSIT') return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (s === 'DELIVERED' || s === 'CLOSED') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    return 'bg-slate-100 text-slate-800 border border-slate-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 animate-in fade-in duration-500 max-w-md mx-auto relative shadow-2xl border-x border-slate-200">
      
      {/* Dynamic Top App Banner */}
      <div className="bg-[#6A7051] text-white p-5 rounded-b-[2rem] shadow-lg relative overflow-hidden">
        {/* Background micro grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5]/10 border border-white/20 flex items-center justify-center font-black text-sm uppercase">
              {driverName.slice(0, 2)}
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-[#FAF8F5]/60 tracking-widest">Active Executive</p>
              <h2 className="text-sm font-extrabold uppercase tracking-wide">{driverName}</h2>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white/90"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>

        {/* Dynamic Executive Stats */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/10 text-center relative z-10">
          <div>
            <span className="text-[9px] font-black uppercase text-[#FAF8F5]/60 block tracking-wider">Trips</span>
            <span className="text-lg font-black text-white">{totalTripsCompleted}</span>
          </div>
          <div className="border-x border-white/10">
            <span className="text-[9px] font-black uppercase text-[#FAF8F5]/60 block tracking-wider">Claims</span>
            <span className="text-lg font-black text-white">{totalExpensesLogged}</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-[#FAF8F5]/60 block tracking-wider">License</span>
            <span className="text-[10px] font-black text-brand-yellow uppercase block mt-1">Class HGV</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 space-y-5">
        
        {/* Active Assignment Callout */}
        {activeTrip ? (
          <div className="bg-white border-2 border-[#6A7051] p-4 rounded-xl shadow-md space-y-3 relative overflow-hidden">
            {/* Pulsing indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[9px] uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Active Duty
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6A7051]/10 text-[#6A7051] flex items-center justify-center">
                <Truck size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block">Active Assignment</span>
                <span className="text-xs font-black text-brand-olive uppercase">Trip #{activeTrip.tripNumber || activeTrip.id}</span>
              </div>
            </div>

            {/* Path Coordinates */}
            <div className="bg-slate-50 p-2.5 rounded-lg space-y-2.5 text-[11px] text-text-secondary border border-card-border">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#6A7051]" />
                <div>
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-widest block">From (Pickup)</span>
                  <span className="font-extrabold uppercase text-brand-olive">{activeTrip.pickupLocation}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-dashed border-card-border pt-2">
                <Navigation size={14} className="text-brand-yellow" />
                <div>
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-widest block">To (Delivery)</span>
                  <span className="font-extrabold uppercase text-brand-olive">{activeTrip.deliveryLocation}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/driver/active-trip')}
              className="w-full bg-[#6A7051] hover:bg-[#5F6846] text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:translate-y-0.5 transition-all"
            >
              Open Trip execution Console
            </button>
          </div>
        ) : (
          <div className="bg-white border border-card-border p-5 rounded-xl text-center space-y-2.5 shadow-sm">
            <CheckCircle2 size={36} className="text-slate-300 mx-auto" />
            <h3 className="text-xs font-black uppercase text-brand-olive tracking-wider">All Clear! No Active Duties</h3>
            <p className="text-[10px] text-text-secondary max-w-[250px] mx-auto leading-relaxed">
              You do not have any assigned cargo loads. Refresh or check back when notified by dispatch.
            </p>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border border-card-border bg-white rounded-lg p-1">
          <button
            onClick={() => setActiveTab('TRIPS')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-md flex items-center justify-center gap-1.5 ${
              activeTab === 'TRIPS' 
                ? 'bg-[#6A7051] text-white' 
                : 'text-text-secondary hover:bg-slate-50'
            }`}
          >
            <ClipboardList size={14} /> Trips History
          </button>
          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-md flex items-center justify-center gap-1.5 ${
              activeTab === 'EXPENSES' 
                ? 'bg-[#6A7051] text-white' 
                : 'text-text-secondary hover:bg-slate-50'
            }`}
          >
            <DollarSign size={14} /> Expense Claims
          </button>
        </div>

        {/* Tab Ingestion */}
        <div className="space-y-3">
          
          {activeTab === 'TRIPS' && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-olive pl-1">Past completed trips</h3>
              {pastTrips.length === 0 ? (
                <p className="text-[10px] text-text-secondary text-center py-6">No past trips recorded.</p>
              ) : (
                pastTrips.map((trip) => (
                  <div key={trip._id || trip.id} className="bg-white border border-card-border p-3.5 rounded-lg shadow-sm space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-brand-olive">#{trip.tripNumber || trip.id}</span>
                      <span className={`px-2 py-0.5 rounded-sm font-black text-[9px] uppercase tracking-wider ${getStatusClass(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-card-border pt-2 text-text-secondary uppercase">
                      <div>
                        <span className="font-bold text-text-muted">Expected Load:</span>
                        <p className="font-extrabold text-brand-olive mt-0.5">{trip.expectedQty || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-bold text-text-muted">Delivered:</span>
                        <p className="font-extrabold text-emerald-700 mt-0.5">{trip.actualQty || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="text-[9px] text-text-muted border-t border-dashed border-card-border pt-2 flex justify-between">
                      <span>Cargo: <strong className="text-brand-olive uppercase">{trip.product}</strong></span>
                      <span>Logged: {trip.createdAt || 'N/A'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'EXPENSES' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-brand-olive pl-1">Logged Expenses</h3>
                <button
                  onClick={() => navigate('/driver/expenses/new')}
                  className="text-[9px] font-black uppercase tracking-widest text-[#6A7051] hover:text-[#5F6846] flex items-center gap-1"
                >
                  <PlusCircle size={12} /> Claim Expense
                </button>
              </div>

              {myExpenses?.length === 0 ? (
                <div className="bg-white border border-card-border p-5 rounded-lg text-center text-text-secondary text-[10px] space-y-1">
                  <p>No expense claims logged in this session.</p>
                  <button 
                    onClick={() => navigate('/driver/expenses/new')} 
                    className="text-[#6A7051] font-black uppercase tracking-widest mt-1 text-[9px]"
                  >
                    Log fuel or toll cash now
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {(myExpenses || [
                    { _id: '1', expenseType: 'Fuel Charge', amount: 1500, status: 'Approved', createdAt: '2026-05-18' },
                    { _id: '2', expenseType: 'National Toll Cash', amount: 350, status: 'Pending', createdAt: '2026-05-19' }
                  ]).map((exp) => (
                    <div key={exp._id} className="bg-white border border-card-border p-3 rounded-lg shadow-sm flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-brand-olive uppercase">{exp.expenseType || exp.type}</p>
                        <p className="text-[9px] text-text-muted mt-0.5">
                          {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-brand-olive">₹{exp.amount}</p>
                        <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-wider ${
                          exp.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          exp.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {exp.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      
      {/* Bottom Nav Mock Tabbar (Mobile app feel) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-card-border grid grid-cols-3 py-2 text-center text-text-muted z-50">
        <button 
          onClick={() => navigate('/driver/dashboard')} 
          className="flex flex-col items-center justify-center text-[#6A7051] gap-0.5"
        >
          <Truck size={20} />
          <span className="text-[8px] font-black uppercase tracking-wider">Trips</span>
        </button>
        <button 
          onClick={() => navigate('/driver/expenses')} 
          className="flex flex-col items-center justify-center hover:text-[#6A7051] gap-0.5"
        >
          <DollarSign size={20} />
          <span className="text-[8px] font-black uppercase tracking-wider">Claims</span>
        </button>
        <button 
          onClick={() => navigate('/driver/profile')} 
          className="flex flex-col items-center justify-center hover:text-[#6A7051] gap-0.5"
        >
          <Award size={20} />
          <span className="text-[8px] font-black uppercase tracking-wider">ID Card</span>
        </button>
      </div>

    </div>
  );
};

export default DriverDashboard;
