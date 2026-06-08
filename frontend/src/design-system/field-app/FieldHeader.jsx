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
    <header className="flex items-center justify-between gap-2 py-0.5">
      <div className="flex items-center gap-2 min-w-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--fa-border)]"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--fa-surface-elevated)] ring-2 ring-[var(--fa-border)] flex items-center justify-center text-xs font-bold text-[var(--fa-accent)]">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] fa-muted">{greeting()}</p>
          <p className="text-sm font-semibold truncate tracking-tight">{userName}</p>
          {subtitle && (
            <p className="text-[10px] fa-muted uppercase tracking-wider truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {notifyHref && (
        <Link
          to={notifyHref}
          className="fa-tap w-9 h-9 rounded-full bg-[var(--fa-surface)] border border-[var(--fa-border)] flex items-center justify-center relative shrink-0"
        >
          <Bell size={17} strokeWidth={1.75} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--fa-danger)] rounded-full border-2 border-[var(--fa-surface)]" />
        </Link>
      )}
    </header>
  );
}
