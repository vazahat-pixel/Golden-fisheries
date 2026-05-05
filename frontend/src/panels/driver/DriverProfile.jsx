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
  Camera
} from 'lucide-react';

const DriverProfile = () => {
  const { user, logout } = useAuthStore();
  const { getDriverByMobile } = useDriverStore();
  const driver = getDriverByMobile(user?.phone);

  if (!driver) return null;

  const getStatusBanner = () => {
    switch (driver.status) {
      case 'active':
        return (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="text-green-500" size={20} />
            <div>
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Profile Verified</p>
              <p className="text-[8px] text-green-500/60 font-bold uppercase">Account is active and ready for trips</p>
            </div>
          </div>
        );
      case 'pending_verification':
        return (
          <div className="bg-[#C5A021]/10 border border-[#C5A021]/20 p-4 rounded-2xl flex items-center gap-3">
            <Clock className="text-[#C5A021] animate-pulse" size={20} />
            <div>
              <p className="text-[10px] font-black text-[#C5A021] uppercase tracking-widest">Verification Pending</p>
              <p className="text-[8px] text-[#C5A021]/60 font-bold uppercase">Admin is reviewing your documents</p>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Profile Rejected</p>
              <p className="text-[8px] text-red-500/60 font-bold uppercase">Reason: {driver.rejectionReason}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Header */}
      <div className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-black border-2 border-[#C5A021] rounded-full mb-4 overflow-hidden shadow-2xl relative group">
          <img src={`https://ui-avatars.com/api/?name=${driver.fullName}&background=0A0B09&color=C5A021&size=256&bold=true`} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <Camera size={20} className="text-white" />
          </div>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">{driver.fullName}</h2>
        <p className="text-[10px] text-[#E6E3C8]/60 font-bold tracking-[0.3em] uppercase mt-1">{driver.id}</p>
      </div>

      {getStatusBanner()}

      {/* Info Sections */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Personal Details</h3>
        <Card className="bg-black/10 border-white/5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-[#C5A021]"><Phone size={16} /></div>
            <div>
              <p className="text-[8px] font-black text-white/40 uppercase">Mobile Number</p>
              <p className="text-[11px] font-bold text-white tracking-widest">{driver.mobile}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-[#C5A021]"><MapPin size={16} /></div>
            <div>
              <p className="text-[8px] font-black text-white/40 uppercase">Current Address</p>
              <p className="text-[10px] font-bold text-white uppercase leading-relaxed">{driver.currentAddress}</p>
            </div>
          </div>
        </Card>

        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2 pt-2">Identification</h3>
        <Card className="bg-black/10 border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-[#C5A021]"><CreditCard size={16} /></div>
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase">Aadhaar Card</p>
                <p className="text-[11px] font-bold text-white tracking-widest">{driver.aadhaarNumber}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[7px] border-none bg-green-500/20 text-green-500 uppercase">Uploaded</Badge>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-[#C5A021]"><FileText size={16} /></div>
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase">Driving License</p>
                <p className="text-[11px] font-bold text-white tracking-widest">{driver.licenseNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success" className="text-[7px] border-none bg-green-500/20 text-green-500 uppercase block mb-1">Uploaded</Badge>
              <p className="text-[7px] font-bold text-red-500 uppercase">Exp: {driver.licenseExpiry}</p>
            </div>
          </div>
        </Card>

        {driver.hasOwnVehicle && (
          <>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2 pt-2">Vehicle Details</h3>
            <Card className="bg-black/10 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-[#C5A021]"><Truck size={16} /></div>
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase">{driver.vehicleType}</p>
                    <p className="text-[11px] font-bold text-white tracking-widest">{driver.vehicleNumber}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                   {['RC', 'INS', 'PER', 'PUC'].map(d => (
                     <div key={d} className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center text-[7px] font-black text-green-500" title={d}>{d[0]}</div>
                   ))}
                </div>
              </div>
            </Card>
          </>
        )}

        <div className="pt-6">
           <Button 
            variant="outline" 
            className="w-full border-red-500/30 text-red-500 bg-red-500/5 h-12 text-[10px] font-black uppercase tracking-widest gap-2"
            onClick={logout}
          >
             <LogOut size={16} /> Secure Logout
           </Button>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
