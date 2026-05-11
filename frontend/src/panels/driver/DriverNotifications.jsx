import React from 'react';
import { Bell, Info, AlertTriangle, CheckCircle2, ChevronRight, Package, Truck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverNotifications = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'NEW_TAPAL',
      title: 'New Assignment',
      message: 'Tapal #8821 assigned for pickup from South Bay Farm.',
      time: '2 mins ago',
      unread: true,
      category: 'Task',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      id: 2,
      type: 'VEHICLE_ALERT',
      title: 'Insurance Expiry',
      message: 'Vehicle KA-19-M-2022 insurance expires in 5 days.',
      time: '1 hour ago',
      unread: true,
      category: 'Compliance',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      id: 3,
      type: 'TRIP_UPDATE',
      title: 'Delivery Reminder',
      message: 'You have a pending delivery for Cold Storage Hub.',
      time: '3 hours ago',
      unread: false,
      category: 'Operation',
      icon: Truck,
      color: 'bg-emerald-500',
    },
    {
      id: 4,
      type: 'SYSTEM_ALERT',
      title: 'Service Due',
      message: 'Routine maintenance scheduled for next Monday.',
      time: 'Yesterday',
      unread: false,
      category: 'Vehicle',
      icon: Clock,
      color: 'bg-amber-500',
    }
  ];

  return (
    <div className="p-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-black tracking-tight">Notifications</h2>
        <span className="bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded-lg uppercase tracking-tighter">
          {notifications.filter(n => n.unread).length} New
        </span>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div 
            key={n.id}
            onClick={() => n.type === 'NEW_TAPAL' ? navigate('/driver/tasks') : null}
            className={`glass-card p-4 rounded-[1.8rem] flex gap-3 items-start relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer ${n.unread ? 'border-l-4 border-l-black' : ''}`}
          >
            <div className={`w-10 h-10 ${n.color} rounded-xl flex items-center justify-center shrink-0 shadow-lg text-white`}>
              <n.icon size={18} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-0.5">
                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{n.category}</span>
                <span className="text-[8px] font-medium text-gray-400">{n.time}</span>
              </div>
              <h3 className="text-[13px] font-bold text-black mb-0.5 leading-tight">{n.title}</h3>
              <p className="text-[11px] text-gray-500 leading-snug line-clamp-1">{n.message}</p>
            </div>

            <div className="self-center text-gray-300">
              <ChevronRight size={16} />
            </div>

            {n.unread && (
              <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      <button className="w-full py-3.5 bg-black/5 text-gray-500 font-bold text-[9px] uppercase tracking-[0.2em] rounded-xl hover:bg-black/10 transition-colors">
        Mark all as read
      </button>
    </div>
  );
};

export default DriverNotifications;
