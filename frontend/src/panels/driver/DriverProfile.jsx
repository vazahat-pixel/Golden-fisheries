import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, FileText, Shield, LogOut, ChevronRight,
  Bell, Settings, History, Wallet, Headphones, CreditCard,
  CheckCircle2, AlertCircle, Clock,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { driverService } from '../../services/driverService';
import { FieldPageWrap, FieldInlineLoader } from '../../design-system/field-app';
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
      <FieldPageWrap subtitle="Account">
        <FieldInlineLoader label="Loading profile" />
      </FieldPageWrap>
    );
  }

  return (
    <FieldPageWrap subtitle="Account & settings">
      <div className="fa-profile-hero flex items-center gap-4 mb-4">
        <div className="fa-avatar-ring shrink-0">
          <div className="w-16 h-16 bg-[var(--fa-surface-elevated)] flex items-center justify-center text-xl font-extrabold fa-text-gradient overflow-hidden">
            {profile?.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt={driverName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold truncate tracking-tight">{driverName}</h1>
          <p className="text-xs fa-muted mt-1 font-medium">{phone}</p>
          <div className="flex items-center gap-1.5 mt-2.5">
            {regStatus === 'active' ? (
              <span className="fa-badge fa-badge--success">
                <CheckCircle2 size={10} /> Active Driver
              </span>
            ) : (
              <span className="fa-badge fa-badge--warn">
                <Clock size={10} /> Pending
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="fa-stat-grid mb-5">
        <StatCell label="Completed" value={completedTrips} />
        <StatCell label="Active" value={activeTrips} />
        <StatCell label="Expenses" value={myExpenses?.length || 0} />
      </div>

      <section className="space-y-2 mb-4">
        <h2 className="fa-eyebrow px-1">Details</h2>
        <div className="fa-glass-card overflow-hidden">
          <InfoRow icon={Truck} label="Vehicle" value={`${vehicleNo}${vehicleType !== '—' ? ` (${vehicleType})` : ''}`} />
          {profile ? (
            <>
              <InfoRow icon={CreditCard} label="Licence" value={profile.licenseNumber || '—'} />
              <InfoRow icon={Shield} label="Expiry" value={formatDate(profile.licenseExpiry)} isLast />
            </>
          ) : (
            <div className="px-4 py-3.5 flex items-start gap-3 bg-amber-500/10 border-t border-[var(--fa-border)]">
              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Licence and vehicle documents are missing. Contact admin to update your fleet profile.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2 mb-4">
        <h2 className="fa-eyebrow px-1">Menu</h2>
        <div className="fa-glass-card overflow-hidden">
          {quickLinks.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="fa-menu-row fa-tap"
            >
              <div className="flex items-center gap-3">
                <div className="fa-menu-icon">
                  <item.icon size={15} strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={16} className="fa-muted" />
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="fa-tap w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-400/30 text-red-300 text-sm font-bold hover:bg-red-500/10 transition-colors"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </FieldPageWrap>
  );
};

function StatCell({ label, value }) {
  return (
    <div className="fa-stat-cell">
      <p className="fa-label-xs">{label}</p>
      <p className="fa-stat-value fa-text-gradient mt-1">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isLast }) {
  return (
    <div className={`fa-menu-row !justify-start gap-3 ${!isLast ? '!border-b !border-[var(--fa-border)]' : ''}`}>
      <Icon size={16} className="fa-muted shrink-0" />
      <span className="text-sm fa-muted w-20 font-medium">{label}</span>
      <span className="text-sm font-semibold flex-1 truncate text-right tracking-tight">{value}</span>
    </div>
  );
}

export default DriverProfile;
