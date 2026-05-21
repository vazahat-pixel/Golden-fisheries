import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Truck,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Bell,
  Settings,
  History,
  Wallet,
  Headphones,
  MapPin,
  CreditCard,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { driverService } from '../../services/driverService';
import { toast } from 'react-hot-toast';

const STATUS_STYLES = {
  active: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30',
  pending_verification: 'bg-amber-500/20 text-amber-100 border-amber-400/30',
  rejected: 'bg-red-500/20 text-red-100 border-red-400/30',
};

const STATUS_LABELS = {
  active: 'Verified & Active',
  pending_verification: 'Pending Verification',
  rejected: 'Registration Rejected',
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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

  const regStatus = profile?.registrationStatus || 'pending_verification';
  const vehicleNo =
    profile?.vehicleId?.vehicleNumber ||
    profile?.vehicleNumber ||
    'Not assigned';
  const vehicleType =
    profile?.vehicleId?.vehicleType || profile?.vehicleType || '—';

  const quickLinks = [
    { icon: History, label: 'Trip History', path: '/driver/history', sub: 'Past deliveries' },
    { icon: Wallet, label: 'Expenses', path: '/driver/expenses', sub: 'Claims & ledger' },
    { icon: FileText, label: 'Documents', path: '/driver/documents', sub: 'Licence & ID' },
    { icon: Bell, label: 'Notifications', path: '/driver/notifications', sub: 'Alerts & updates' },
    { icon: Settings, label: 'Settings', path: '/driver/settings', sub: 'Account preferences' },
    { icon: Headphones, label: 'Support', path: '/driver/support', sub: 'Help desk' },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/auth/driver');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-[#6A7051]">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-[10px] font-black uppercase tracking-widest">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="pb-28 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="bg-[#6A7051] text-white px-5 pt-6 pb-8 rounded-b-[2rem] shadow-lg relative overflow-hidden -mx-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#FAF8F5]/15 border-2 border-white/25 flex items-center justify-center text-2xl font-black shadow-xl mb-3">
            {profile?.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt={driverName}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              initials
            )}
          </div>
          <h1 className="text-base font-extrabold uppercase tracking-wide">{driverName}</h1>
          <p className="text-[10px] font-bold text-[#FAF8F5]/70 uppercase tracking-widest mt-0.5">
            Fleet Driver · Golden Fisheries
          </p>
          <span
            className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${STATUS_STYLES[regStatus] || STATUS_STYLES.pending_verification}`}
          >
            {regStatus === 'active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
            {STATUS_LABELS[regStatus] || regStatus}
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/10 text-center">
          <div>
            <span className="text-[9px] font-black uppercase text-[#FAF8F5]/60 tracking-wider block">
              Completed
            </span>
            <span className="text-xl font-black">{completedTrips}</span>
          </div>
          <div className="border-x border-white/10">
            <span className="text-[9px] font-black uppercase text-[#FAF8F5]/60 tracking-wider block">
              Active
            </span>
            <span className="text-xl font-black">{activeTrips}</span>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-[#FAF8F5]/60 tracking-wider block">
              Expenses
            </span>
            <span className="text-xl font-black">{myExpenses?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 relative z-10">
        {/* Contact card */}
        <div className="bg-white border border-card-border rounded-2xl shadow-md p-4 space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-olive border-b border-card-border pb-2">
            Contact & Identity
          </h2>
          <ProfileRow icon={Phone} label="Mobile" value={`+91 ${phone}`} />
          <ProfileRow icon={User} label="Role" value="Driver" />
          {profile?.alternateMobile && (
            <ProfileRow icon={Phone} label="Alternate" value={profile.alternateMobile} />
          )}
          {profile?.currentAddress && (
            <ProfileRow icon={MapPin} label="Current address" value={profile.currentAddress} />
          )}
        </div>

        {/* Licence & vehicle */}
        <div className="bg-white border border-card-border rounded-2xl shadow-md p-4 space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-olive border-b border-card-border pb-2">
            Licence & Vehicle
          </h2>
          {profile ? (
            <>
              <ProfileRow
                icon={CreditCard}
                label="Licence no."
                value={profile.licenseNumber || '—'}
              />
              <ProfileRow
                icon={Shield}
                label="Licence expiry"
                value={formatDate(profile.licenseExpiry)}
              />
              <ProfileRow icon={Truck} label="Assigned vehicle" value={vehicleNo} />
              <ProfileRow icon={Truck} label="Vehicle type" value={vehicleType} />
              {profile.hasOwnVehicle && (
                <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-lg inline-block">
                  Own vehicle registered
                </p>
              )}
            </>
          ) : (
            <div className="flex gap-2 items-start text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold leading-relaxed">
                Driver profile not linked yet. Complete registration or contact the office to activate
                your fleet account.
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-card-border rounded-2xl shadow-md overflow-hidden">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-olive px-4 pt-4 pb-2">
            Quick Actions
          </h2>
          {quickLinks.map((item, i) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${
                i < quickLinks.length - 1 ? 'border-b border-card-border' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#6A7051]/10 flex items-center justify-center text-[#6A7051]">
                <item.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black uppercase text-slate-900">{item.label}</p>
                <p className="text-[9px] text-slate-500 font-bold">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border-2 border-red-200 bg-red-50 text-red-700 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-[#6A7051]">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-[11px] font-bold text-slate-900 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default DriverProfile;
