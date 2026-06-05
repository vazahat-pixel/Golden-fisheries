import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function FieldHeader({ userName, subtitle, notifyHref, avatarUrl }) {
  const initials = (userName || 'U').slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-3 min-w-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--fa-border)]"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--fa-surface-elevated)] ring-2 ring-[var(--fa-border)] flex items-center justify-center text-sm font-bold text-[var(--fa-accent)]">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm fa-muted">{greeting()}</p>
          <p className="text-lg font-semibold truncate tracking-tight">{userName}</p>
          {subtitle && (
            <p className="text-[10px] fa-muted uppercase tracking-wider truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {notifyHref && (
        <Link
          to={notifyHref}
          className="fa-tap w-11 h-11 rounded-full bg-[var(--fa-surface)] border border-[var(--fa-border)] flex items-center justify-center relative shrink-0"
        >
          <Bell size={20} strokeWidth={1.75} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--fa-danger)] rounded-full border-2 border-[var(--fa-surface)]" />
        </Link>
      )}
    </header>
  );
}
