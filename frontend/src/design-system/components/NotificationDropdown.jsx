import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, MailOpen, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-[#2D3748] hover:bg-[#F5F5EC] border border-transparent hover:border-card-border transition-all flex items-center justify-center rounded-none"
        title="In-App Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-600 text-white text-[9px] font-black rounded-full border border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white border border-card-border shadow-2xl z-[999] rounded-none overflow-hidden animate-in fade-in slide-in-from-top-3 duration-250">
          {/* Header */}
          <div className="bg-[#5F6846] text-white px-4 py-3 flex items-center justify-between border-b border-black/10">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <Bell size={12} className="text-[#FAF8F5]" /> Notifications ({unreadCount})
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[9px] font-black uppercase tracking-wider text-emerald-200 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Check size={10} /> Mark all read
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-text-muted">
                <MailOpen size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id || n._id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id || n._id);
                  }}
                  className={`p-4 transition-all cursor-pointer text-left ${
                    n.read ? 'bg-white hover:bg-slate-50/50' : 'bg-amber-50/40 hover:bg-amber-50/80 border-l-[3px] border-[#EAB308]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <p className={`text-[11px] font-black uppercase tracking-tight ${n.read ? 'text-[#2D3748]' : 'text-[#6A7051]'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-secondary mt-1 leading-normal font-medium">
                    {n.message}
                  </p>
                  <span className="text-[8px] font-black text-text-muted block mt-2 uppercase tracking-wide">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#FAF8F5] border-t border-card-border p-2 text-center">
            <span className="text-[8px] font-black text-text-muted uppercase tracking-wider block">
              Golden Fisheries ERP Broadcast System
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
