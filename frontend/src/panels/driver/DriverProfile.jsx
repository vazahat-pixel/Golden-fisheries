import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Phone, Truck, FileText, Shield, LogOut, ChevronRight,
  Bell, Settings, History, Wallet, Headphones, MapPin, CreditCard,
  Loader2, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { driverService } from '../../services/driverService';
import { toast } from 'react-hot-toast';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const DriverProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { myTrips, myExpenses, fetchMyTrips, fetchMyExpenses } = useDriverStore();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const driverName = user?.fullName || user?.name || profile?.userId?.fullName || 'Driver';
  const phone = user?.phone || profile?.userId?.phone || '—';
  const initials = driverName.slice(0, 2).toUpperCase();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [profRes] = await Promise.all([
          driverService.getMyProfile().catch(() => null),
          fetchMyTrips(),
          fetchMyExpenses(),
        ]);
        setProfile(profRes?.data ?? profRes ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchMyTrips, fetchMyExpenses]);

  const completedTrips = (myTrips || []).filter((t) =>
    ['DELIVERED', 'CLOSED', 'COMPLETED', 'Delivered'].includes(t.status)
  ).length;

  const activeTrips = (myTrips || []).filter((t) =>
    ['ASSIGNED', 'STARTED', 'PICKED', 'Assigned', 'In Transit', 'Picked'].includes(t.status)
  ).length;

  const regStatus = profile?.registrationStatus || (user?.isActive ? 'active' : 'pending_verification');
  const vehicleNo = profile?.vehicleId?.vehicleNumber || profile?.vehicleNumber || 'Not assigned';
  const vehicleType = profile?.vehicleId?.vehicleType || profile?.vehicleType || '—';

  const quickLinks = [
    { icon: History, label: 'Trip History', path: '/driver/history' },
    { icon: Wallet, label: 'Expenses', path: '/driver/expenses' },
    { icon: FileText, label: 'Documents', path: '/driver/documents' },
    { icon: Bell, label: 'Notifications', path: '/driver/notifications' },
    { icon: Settings, label: 'Settings', path: '/driver/settings' },
    { icon: Headphones, label: 'Support', path: '/driver/support' },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/auth/driver');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="animate-spin" size={24} />
        <p className="text-xs font-semibold">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in duration-300">
      {/* Compact Header */}
      <div className="bg-[#121212] px-5 py-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-lg font-bold text-slate-200 shrink-0 overflow-hidden">
          {profile?.profilePhotoUrl ? (
            <img src={profile.profilePhotoUrl} alt={driverName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{driverName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{phone}</p>
          <div className="flex items-center gap-1.5 mt-2">
            {regStatus === 'active' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300">
                <CheckCircle2 size={10} /> Active Driver
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300">
                <Clock size={10} /> Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 bg-[#1A1A1A] border-b border-slate-800 py-3">
        <div className="text-center border-r border-slate-800">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Completed</p>
          <p className="text-base font-semibold text-white mt-0.5">{completedTrips}</p>
        </div>
        <div className="text-center border-r border-slate-800">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Active</p>
          <p className="text-base font-semibold text-white mt-0.5">{activeTrips}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Expenses</p>
          <p className="text-base font-semibold text-white mt-0.5">{myExpenses?.length || 0}</p>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-5">
        {/* Info Section */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Details</h2>
          <div className="bg-[#1C1C1E] rounded-xl border border-[#2C2C2E] overflow-hidden">
            <InfoRow icon={Truck} label="Vehicle" value={`${vehicleNo} ${vehicleType !== '—' ? `(${vehicleType})` : ''}`} />
            {profile ? (
              <>
                <InfoRow icon={CreditCard} label="Licence" value={profile.licenseNumber || '—'} />
                <InfoRow icon={Shield} label="Expiry" value={formatDate(profile.licenseExpiry)} isLast />
              </>
            ) : (
              <div className="px-4 py-3 flex items-start gap-3 bg-amber-500/10 border-t border-[#2C2C2E]">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Licence and vehicle documents are missing. Please contact admin to update your fleet profile.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Links Section */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Actions</h2>
          <div className="bg-[#1C1C1E] rounded-xl border border-[#2C2C2E] overflow-hidden">
            {quickLinks.map((item, idx) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#2C2C2E] transition-colors ${
                  idx < quickLinks.length - 1 ? 'border-b border-[#2C2C2E]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-200">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            ))}
          </div>
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

function InfoRow({ icon: Icon, label, value, isLast }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!isLast ? 'border-b border-[#2C2C2E]' : ''}`}>
      <Icon size={16} className="text-slate-500 shrink-0" />
      <span className="text-sm text-slate-400 w-20">{label}</span>
      <span className="text-sm font-medium text-slate-200 flex-1 truncate text-right">{value}</span>
    </div>
  );
}

export default DriverProfile;
