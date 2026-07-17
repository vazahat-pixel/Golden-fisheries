import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function FieldHeader({ userName, subtitle, notifyHref, avatarUrl }) {
  const initials = (userName || 'U').slice(0, 2).toUpperCase();
  const displayName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : 'Driver';

  return (
    <header className="fa-header flex items-center justify-between gap-3 py-1 mb-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="fa-avatar-ring shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-10 h-10 object-cover bg-[var(--fa-surface-elevated)]"
            />
          ) : (
            <div className="w-10 h-10 bg-[var(--fa-surface-elevated)] flex items-center justify-center text-xs font-extrabold fa-text-gradient">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="fa-eyebrow">{greeting()}</p>
          <p className="text-base font-bold truncate tracking-tight mt-0.5">
            <span className="fa-text-gradient">{displayName}</span>
          </p>
          {subtitle && (
            <p className="text-[10px] fa-muted uppercase tracking-widest truncate mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {notifyHref && (
        <Link
          to={notifyHref}
          className="fa-tap w-10 h-10 rounded-xl fa-glass-card flex items-center justify-center relative shrink-0 !p-0"
        >
          <Bell size={18} strokeWidth={1.75} className="text-[var(--fa-accent)]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--fa-danger)] rounded-full border-2 border-[var(--fa-bg)] shadow-[0_0_8px_rgba(255,123,130,0.6)]" />
        </Link>
      )}
    </header>
  );
}
