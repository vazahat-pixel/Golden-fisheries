import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Search, Bell, Menu, X, Truck, MapPin, Navigation, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { useNavigate } from 'react-router-dom';
import { LoadingFallback } from '../components/LoadingFallback';
import { IS_DEV } from '../../constants/rbac';
import { NotificationDropdown } from '../components/NotificationDropdown';


// Context for mobile detection — child components can use this to hide action buttons
const AdminLayoutContext = createContext({ isMobile: false });
export const useAdminLayout = () => useContext(AdminLayoutContext);

const TripEndedPopupModal = ({ data, onClose }) => {
  const navigate = useNavigate();
  
  const handleReview = () => {
    navigate('/admin/expenses');
    onClose();
  };

  const balanceColorClass = data.balancePayable >= 0 
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
    : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#FAF8F5] border-[3px] border-[#6A7051] text-text-primary w-full max-w-xl shadow-2xl relative animate-in zoom-in-95 duration-300 rounded-lg overflow-hidden">
        
        {/* Accent Top Bar */}
        <div className="absolute top-0 right-0 bg-[#EAB308] text-black text-[9px] font-black uppercase px-6 py-1 rotate-45 translate-x-8 translate-y-3 tracking-widest border border-black/10">
          LOGISTICS SYNC
        </div>

        {/* Modal Header */}
        <div className="bg-[#6A7051] text-[#FAF8F5] p-5 flex items-center gap-4 border-b-2 border-black/20">
          <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center rounded-sm text-[#FAF8F5]">
            <Truck size={28} className="animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-[#FAF8F5]/60 tracking-wider block">REAL-TIME BROADCAST</span>
            <h2 className="text-lg font-black uppercase tracking-wide leading-tight">Trip Completed & Submitted</h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Telemetry Header */}
          <div className="grid grid-cols-3 gap-3 border-b border-card-border pb-4 uppercase">
            <div>
              <span className="text-[8px] font-black text-text-muted tracking-widest block">Trip Number</span>
              <span className="text-xs font-black text-[#6A7051]">{data.tripNumber}</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-text-muted tracking-widest block">Driver Executive</span>
              <span className="text-xs font-black text-[#6A7051] truncate block">{data.driverName}</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-text-muted tracking-widest block">Vehicle Number</span>
              <span className="text-xs font-black text-[#6A7051]">{data.vehicleNumber}</span>
            </div>
          </div>

          {/* Odometer Stats */}
          <div className="bg-[#F5F5EC] border border-[#C0C4AB]/50 p-4 rounded-sm flex items-center justify-between uppercase">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#6A7051]" />
              <div>
                <span className="text-[8px] font-black text-text-muted tracking-wider block">Starting KM</span>
                <span className="text-xs font-extrabold text-[#6A7051]">{data.startingKms?.toLocaleString()} KM</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#C0C4AB]"></div>
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-[#6A7051]" />
              <div>
                <span className="text-[8px] font-black text-text-muted tracking-wider block">Ending KM</span>
                <span className="text-xs font-extrabold text-[#6A7051]">{data.endingKms?.toLocaleString()} KM</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#C0C4AB]"></div>
            <div>
              <span className="text-[8px] font-black text-text-muted tracking-wider block">Total distance</span>
              <span className="text-xs font-black text-[#6A7051]">{data.totalKms} KM</span>
            </div>
          </div>

          {/* Expense Table */}
          <div className="space-y-2 uppercase">
            <h3 className="text-[10px] font-black text-[#6A7051] tracking-wider border-b border-card-border pb-1">Expense Claim Breakdown</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[10px] text-text-secondary font-extrabold">Driver Batta</span>
                <span className="font-bold text-[#6A7051]">₹{data.driverBatta?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[10px] text-text-secondary font-extrabold">Toll / Fastag</span>
                <span className="font-bold text-[#6A7051]">₹{data.tollFastag?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[10px] text-text-secondary font-extrabold">Diesel Fuel</span>
                <span className="font-bold text-[#6A7051]">₹{data.diesel?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[10px] text-text-secondary font-extrabold">Pump Total</span>
                <span className="font-bold text-[#6A7051]">₹{data.pumpTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[10px] text-text-secondary font-extrabold">Maintenance / Repair</span>
                <span className="font-bold text-[#6A7051]">₹{data.maintenance?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[10px] text-text-secondary font-extrabold">Halting</span>
                <span className="font-bold text-[#6A7051]">₹{data.halting?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-3 gap-2 uppercase">
            <div className="border border-card-border p-2.5 text-center">
              <span className="text-[8px] font-black text-text-muted tracking-wider block">Gross Expenses</span>
              <span className="text-xs font-black text-[#6A7051]">₹{data.totalExpenses?.toFixed(2)}</span>
            </div>
            <div className="border border-card-border p-2.5 text-center">
              <span className="text-[8px] font-black text-text-muted tracking-wider block">Less Advance</span>
              <span className="text-xs font-black text-[#D97706]">-₹{data.lessAdvance?.toFixed(2)}</span>
            </div>
            <div className={`border p-2.5 text-center ${balanceColorClass}`}>
              <span className="text-[8px] font-black tracking-wider block">Net Payable</span>
              <span className="text-xs font-black">₹{data.balancePayable?.toFixed(2)}</span>
            </div>
          </div>

          {/* Remarks */}
          {data.remarks && (
            <div className="bg-[#F5F5EC] border border-card-border p-3 text-xs">
              <span className="text-[8px] font-black text-text-muted uppercase tracking-wider block mb-1">Driver Remarks</span>
              <p className="italic text-text-secondary">"{data.remarks}"</p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-[#F5F5EC] p-4 flex gap-3 border-t border-card-border justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-card-border bg-white text-text-secondary text-xs font-black uppercase tracking-wider hover:bg-slate-50 shadow-sm transition-all rounded-none"
          >
            Acknowledge & Close
          </button>
          <button
            type="button"
            onClick={handleReview}
            className="px-5 py-2.5 bg-[#6A7051] text-[#FAF8F5] text-xs font-black uppercase tracking-wider hover:bg-[#5F6846] shadow-md hover:shadow-lg transition-all flex items-center gap-1 rounded-none"
          >
            Review Claims Panel <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore();
  const { activeTripNotification, clearActiveTripNotification } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AdminLayoutContext.Provider value={{ isMobile }}>
    <div className="flex min-h-screen bg-page-bg">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto bg-transparent lg:h-screen lg:sticky lg:top-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-11 shrink-0 flex items-center justify-between px-3 md:px-4 bg-card-bg border-b border-card-border shadow-erp-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-text-secondary hover:bg-surface-hover rounded-erp lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={14} />
              <input
                type="search"
                placeholder="Search…"
                className="w-full h-8 bg-white border border-border-strong rounded-erp pl-8 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent/25"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isMobile && !IS_DEV && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-erp border border-amber-300">
                Read only
              </span>
            )}
            {IS_DEV && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-erp border border-emerald-300">
                Dev
              </span>
            )}
            <NotificationDropdown />
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-text-primary leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] font-semibold text-text-secondary">{user?.role || 'ADMIN'}</p>
            </div>
            <div className="w-8 h-8 rounded-erp bg-accent flex items-center justify-center text-xs font-semibold text-white">
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-page-bg">
          <div className="max-w-[1600px] mx-auto erp-page">
            <React.Suspense fallback={<LoadingFallback type="content" />}>
              {children}
            </React.Suspense>
          </div>
        </div>

        {/* Real-time Trip End Sheet Popup notification */}
        {activeTripNotification && (
          <TripEndedPopupModal
            data={activeTripNotification}
            onClose={clearActiveTripNotification}
          />
        )}
      </main>
    </div>
    </AdminLayoutContext.Provider>
  );
};
