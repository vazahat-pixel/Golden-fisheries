import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  LogOut,
  Camera,
  IndianRupee
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { getDriverByMobile } = useDriverStore();
  const realDriver = getDriverByMobile(user?.phone);

  const dummyDriver = {
    id: 'FLEET-ID-1002',
    fullName: 'RAJESH KUMAR',
    mobile: '9876543210',
    currentAddress: 'FLAT 402, ROYAL PLAZA, MANGALORE, KARNATAKA - 575001',
    aadhaarNumber: 'XXXX-XXXX-9021',
    licenseNumber: 'KA-19-20220011223',
    licenseExpiry: '2028-12-31',
    status: 'active'
  };

  const driver = realDriver || dummyDriver;

  const getStatusBanner = () => {
    switch (driver.status) {
      case 'active':
        return (
          <div className="bg-[#6B7550]/5 border border-[#6B7550]/20 p-6 flex items-center gap-4 group hover:bg-[#6B7550] transition-all">
            <CheckCircle2 className="text-[#6B7550] group-hover:text-white" size={24} />
            <div>
              <p className="text-[10px] font-black text-[#6B7550] uppercase tracking-[0.4em] group-hover:text-white">Profile Validated</p>
              <p className="text-[8px] text-black/40 font-black uppercase tracking-[0.1em] group-hover:text-white/60">Fleet credentials verified and active</p>
            </div>
          </div>
        );
      case 'pending_verification':
        return (
          <div className="bg-black/5 border border-black/10 p-6 flex items-center gap-4 animate-pulse">
            <Clock className="text-black" size={24} />
            <div>
              <p className="text-[10px] font-black text-black uppercase tracking-[0.4em]">Protocol Pending</p>
              <p className="text-[8px] text-black/40 font-black uppercase tracking-[0.1em]">Awaiting central administration audit</p>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-600/5 border border-red-600/20 p-6 flex items-center gap-4">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Profile Terminated</p>
              <p className="text-[8px] text-red-600/60 font-black uppercase tracking-[0.1em]">Reason: {driver.rejectionReason}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20 selection:bg-black selection:text-white animate-in fade-in duration-500">
      {/* Profile Header (Aggressive Black) */}
      <div className="bg-black text-white p-10 flex flex-col items-center text-center relative overflow-hidden">
        <div className="w-32 h-32 bg-black border-2 border-[#6B7550] shadow-2xl relative group mb-6">
          <img src={`https://ui-avatars.com/api/?name=${driver.fullName}&background=0A0B09&color=6B7550&size=256&bold=true`} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <Camera size={24} className="text-white" />
          </div>
        </div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-serif italic font-black text-white uppercase tracking-tight leading-none">{driver.fullName}.</h2>
          <p className="text-[9px] text-[#6B7550] font-black tracking-[0.4em] uppercase">{driver.id}</p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rotate-12" />
      </div>

      <div className="p-6 space-y-8">
        {/* Status Verification Registry */}
        <div className="group">
          {getStatusBanner()}
        </div>

        {/* High-Density Info Matrices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-black pb-2">
              <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Personal Manifest</h3>
              <User size={12} className="text-[#6B7550]" />
            </div>
            <Card className="border border-black/5 bg-gray-50/30 space-y-6 p-6">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center shadow-lg"><Phone size={18} className="text-[#6B7550]" /></div>
                <div>
                  <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Communication Channel</p>
                  <p className="text-[11px] font-black text-black tracking-widest">{driver.mobile}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center shadow-lg"><MapPin size={18} className="text-[#6B7550]" /></div>
                <div>
                  <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Stationed Address</p>
                  <p className="text-[10px] font-black text-black uppercase leading-tight line-clamp-2">{driver.currentAddress}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-black pb-2">
              <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Identity Protocol</h3>
              <ShieldCheck size={12} className="text-[#6B7550]" />
            </div>
            <Card className="border border-black/5 bg-gray-50/30 space-y-6 p-6">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center shadow-lg"><CreditCard size={18} className="text-[#6B7550]" /></div>
                  <div>
                    <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Aadhaar Card (UID)</p>
                    <p className="text-[11px] font-black text-black tracking-widest">{driver.aadhaarNumber}</p>
                  </div>
                </div>
                <Badge className="text-[7px] font-black border-none bg-[#6B7550] text-white uppercase px-3 py-1">Verified</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-black/5 pt-6 group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center shadow-lg"><FileText size={18} className="text-[#6B7550]" /></div>
                  <div>
                    <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Commercial License</p>
                    <p className="text-[11px] font-black text-black tracking-widest">{driver.licenseNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="text-[7px] font-black border-none bg-[#6B7550] text-white uppercase px-3 py-1 block mb-1">Active</Badge>
                  <p className="text-[7px] font-black text-red-600 uppercase">Exp: {driver.licenseExpiry}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Action Matrix */}
        <div className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-1">Terminal Commands</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Financials', icon: IndianRupee, path: '/driver/expenses' },
              { label: 'History', icon: Clock, path: '/driver/history' },
              { label: 'Archive', icon: FileText, path: '/driver/documents' },
              { label: 'Banking', icon: CreditCard, path: '/driver/profile' },
            ].map((item, idx) => (
              <button 
                key={idx}
                onClick={() => navigate(item.path)}
                className="bg-white border border-black/5 p-6 flex flex-col items-center gap-4 hover:bg-black hover:text-white hover:border-black transition-all group shadow-sm active:scale-95"
              >
                <item.icon size={24} className="text-[#6B7550] group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-10">
          <Button 
            className="w-full bg-black text-white h-16 text-[11px] font-black uppercase tracking-[0.5em] gap-4 border-none shadow-2xl hover:bg-red-600 transition-all active:scale-[0.98]"
            onClick={logout}
          >
            <LogOut size={20} /> Terminate Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
