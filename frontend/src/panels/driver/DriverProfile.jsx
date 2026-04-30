import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  User, 
  Settings, 
  Shield, 
  Truck, 
  LogOut, 
  ChevronRight, 
  Phone, 
  Mail,
  Award,
  Calendar,
  History,
  HelpCircle
} from 'lucide-react';

const DriverProfile = () => {
  const driverInfo = {
    name: 'Ramu K.S.',
    role: 'Senior Fleet Driver',
    id: 'MKE-DRV-102',
    phone: '+91 98765 43210',
    email: 'ramu.mke@fisheries.com',
    licenseNo: 'KA-01-2023-000456',
    joinedDate: 'Jan 2024',
    rating: '4.8',
    totalTrips: '142',
    totalKM: '4,250 KM'
  };

  const menuItems = [
    { icon: History, label: 'Trip History', desc: 'View all completed journeys', path: '/driver/history' },
    { icon: Shield, label: 'Insurance & Documents', desc: 'Vehicle and personal papers', path: '/driver/docs' },
    { icon: Settings, label: 'App Settings', desc: 'Notifications and preferences', path: '/driver/settings' },
    { icon: HelpCircle, label: 'Help & Support', desc: 'Contact fleet manager', path: '/driver/support' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100 p-8 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-primary border-4 border-white shadow-xl">
            <User size={48} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-xl border-4 border-white flex items-center justify-center text-white">
            <Shield size={14} fill="currentColor" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 leading-tight">{driverInfo.name}</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-2">{driverInfo.role}</p>
        <Badge variant="primary" className="text-[10px] py-1 px-3">
          ID: {driverInfo.id}
        </Badge>
      </div>

      <div className="px-6 pb-24 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Rating</p>
            <p className="text-lg font-black text-gray-900 flex items-center justify-center gap-1">
              <Award size={14} className="text-amber-500" /> {driverInfo.rating}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Trips</p>
            <p className="text-lg font-black text-gray-900">{driverInfo.totalTrips}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center shadow-sm">
            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Distance</p>
            <p className="text-lg font-black text-gray-900">{driverInfo.totalKM.split(' ')[0]}</p>
          </div>
        </div>

        {/* Contact Info Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Phone Number</p>
              <p className="text-sm font-bold text-gray-900">{driverInfo.phone}</p>
            </div>
          </div>
          <div className="h-[1px] bg-gray-100 mx-[-24px]"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Email Address</p>
              <p className="text-sm font-bold text-gray-900">{driverInfo.email}</p>
            </div>
          </div>
          <div className="h-[1px] bg-gray-100 mx-[-24px]"></div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">License Details</p>
              <p className="text-sm font-bold text-gray-900">{driverInfo.licenseNo}</p>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <button 
              key={i} 
              className="w-full bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 active:scale-95 transition-all shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                <item.icon size={20} />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-black text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <Button variant="secondary" className="w-full py-4 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 border-red-100 gap-2 font-black mt-4">
          <LogOut size={20} /> Logout Driver
        </Button>

        <div className="text-center pt-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            MKE Fisheries v1.2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
