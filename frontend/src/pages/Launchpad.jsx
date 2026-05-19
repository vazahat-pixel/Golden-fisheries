import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Utensils, Fish, Truck, ShoppingCart, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Launchpad = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'BUYER') {
        navigate('/buyer/dashboard');
      } else if (user.role === 'DRIVER') {
        navigate('/driver/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const panels = [
    {
      title: 'Strategic Admin',
      desc: 'CENTRAL ERP · LOGISTICS · FINANCE · PROCUREMENT MGR · VEHICLE MGR',
      path: '/admin/auth',
      dashboardPath: '/admin/dashboard',
      icon: ShieldCheck,
      tag: 'MASTER',
      note: 'Admin · Manager · Mahesh · Vehicle Manager',
      roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'PROCUREMENT_MANAGER', 'VEHICLE_MANAGER'],
    },
    {
      title: 'Kitchen Ops',
      desc: 'POS TERMINAL & LIVE MANIFEST MANAGEMENT',
      path: '/restaurant/auth',
      dashboardPath: '/restaurant/dashboard',
      icon: Utensils,
      tag: 'STATION',
      note: 'Restaurant Staff',
      roles: ['ADMIN', 'MANAGER', 'BILLING', 'RESTAURANT_STAFF', 'RESTAURANT'],
    },
    {
      title: 'Retail Matrix',
      desc: 'FISH MALL BILLING & WEIGHT-BASED REGISTRY',
      path: '/fishmall/auth',
      dashboardPath: '/fishmall/dashboard',
      icon: Fish,
      tag: 'TERMINAL',
      note: 'Fish Mall Billing',
      roles: ['ADMIN', 'MANAGER', 'BILLING', 'FISHMALL_BILLING', 'FISHMALL'],
    },
  ];

  // Filter panels based on authenticated user's role
  const filteredPanels = isAuthenticated && user
    ? panels.filter(panel => panel.roles.includes(user.role))
    : panels;

  const getPanelPath = (panel) => {
    if (isAuthenticated && user && panel.roles.includes(user.role)) {
      if (panel.title === 'Strategic Admin') {
        if (user.role === 'PROCUREMENT_MANAGER') return '/admin/procurement/harvest';
        if (user.role === 'VEHICLE_MANAGER') return '/admin/vehicles';
      }
      return panel.dashboardPath;
    }
    return panel.path;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-500">
      <div className="w-full max-w-6xl">
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-14">
          <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-24 h-24 object-contain mb-6 grayscale hover:grayscale-0 transition-all duration-500" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Control Center</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2">Role-Based Unified Enterprise Portal</p>
          <div className="h-0.5 w-12 bg-[#6B7550] mt-4" />
        </div>

        {/* User Session Info */}
        {isAuthenticated && user && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-gray-200 p-4 mb-8 gap-4 animate-in fade-in slide-in-from-top-4 duration-300 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6B7550]/10 flex items-center justify-center text-[#6B7550] font-black text-sm">
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-wider">{user.fullName || 'User'}</p>
                <p className="text-[8px] font-bold text-[#6B7550] uppercase tracking-widest">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full sm:w-auto text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors border border-red-200 hover:border-red-500 px-4 py-2 hover:bg-red-50"
            >
              Sign Out Session
            </button>
          </div>
        )}

        {/* Portal Grid */}
        <div className={`grid gap-4 justify-center ${
          filteredPanels.length === 1
            ? 'grid-cols-1 max-w-md mx-auto w-full'
            : filteredPanels.length === 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto w-full'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto w-full'
        }`}>
          {filteredPanels.map((panel, idx) => (
            <Link key={idx} to={getPanelPath(panel)} className="group">
              <div className={`bg-white border p-6 flex flex-col h-full hover:shadow-lg transition-all duration-300 ${
                panel.accent ? 'border-blue-200 hover:border-blue-500' : 'border-gray-200 hover:border-[#6B7550]'
              }`}>
                <div className={`w-12 h-12 flex items-center justify-center mb-5 transition-colors ${
                  panel.accent
                    ? 'bg-blue-50 group-hover:bg-blue-600'
                    : 'bg-gray-50 group-hover:bg-[#6B7550]'
                }`}>
                  <panel.icon size={20} className={`transition-colors ${
                    panel.accent ? 'text-blue-500 group-hover:text-white' : 'text-gray-400 group-hover:text-white'
                  }`} />
                </div>

                <div className={`text-[7px] font-black uppercase tracking-[0.3em] mb-1 ${
                  panel.accent ? 'text-blue-500' : 'text-gray-300'
                }`}>{panel.tag}</div>

                <h3 className={`text-sm font-bold uppercase tracking-tight mb-2 transition-colors ${
                  panel.accent ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-900 group-hover:text-[#6B7550]'
                }`}>{panel.title}</h3>

                <p className="text-[9px] text-gray-400 font-medium leading-relaxed mb-4 uppercase tracking-wider">{panel.desc}</p>

                {panel.note && (
                  <p className={`text-[8px] font-black uppercase tracking-widest mb-3 ${
                    panel.accent ? 'text-blue-400' : 'text-[#6B7550]'
                  }`}>{panel.note}</p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Authorize</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">© 2026 Golden Fisheries Infra</p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> RBAC Secure · V.3.0
            </span>
            <span className="text-[9px] font-bold text-[#6B7550] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#6B7550] rounded-full animate-pulse" /> {filteredPanels.length} {filteredPanels.length === 1 ? 'Portal' : 'Portals'} Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Launchpad;
