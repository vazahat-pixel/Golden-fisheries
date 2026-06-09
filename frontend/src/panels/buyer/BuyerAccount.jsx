import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  LogOut,
  ChevronRight,
  RotateCcw,
  BarChart3,
  Package,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { FieldPageWrap } from '../../design-system/field-app';
import { useBuyerPaths } from './buyerPaths';
import { toast } from 'react-hot-toast';

const BuyerAccount = () => {
  const navigate = useNavigate();
  const paths = useBuyerPaths();
  const { user, logout } = useAuthStore();

  const displayName = user?.fullName || user?.name || 'Buyer';
  const phone = user?.phone || '—';
  const initials = displayName.slice(0, 2).toUpperCase();

  const menuLinks = [
    { icon: Package, label: 'Verify tapals', sub: 'Incoming loads', path: paths.tapals },
    { icon: FileText, label: 'Bills', sub: 'Invoice history', path: paths.invoices },
    { icon: RotateCcw, label: 'Returns', sub: 'Sales returns', path: paths.returns },
    { icon: BarChart3, label: 'Settlement', sub: 'Reconciliation', path: paths.reconciliation },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/auth/admin');
  };

  return (
    <FieldPageWrap subtitle="Account">
      <div className="fa-hero-card p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--fa-accent-dim)] border border-[var(--fa-accent-soft)] flex items-center justify-center text-lg font-bold text-[var(--fa-accent)]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold truncate">{displayName}</p>
            <p className="text-xs fa-muted flex items-center gap-1 mt-0.5">
              <Phone size={12} /> {phone}
            </p>
            <p className="text-[10px] fa-muted uppercase tracking-wider mt-1">Buyer portal</p>
          </div>
        </div>
      </div>

      <div className="fa-surface divide-y divide-[var(--fa-border)] overflow-hidden mb-4">
        {menuLinks.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left fa-tap hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--fa-surface-elevated)] flex items-center justify-center text-[var(--fa-accent)] shrink-0">
              <item.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-[10px] fa-muted">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="fa-muted shrink-0" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3.5 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 fa-tap"
      >
        <LogOut size={16} /> Sign out
      </button>
    </FieldPageWrap>
  );
};

export default BuyerAccount;
