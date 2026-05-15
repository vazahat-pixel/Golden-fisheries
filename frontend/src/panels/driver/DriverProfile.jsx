import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
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
  Settings,
  ChevronRight,
  Info,
  AlertTriangle,
  Edit3,
  Check,
  X,
  Mail,
  Save,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import driverMockData from '../../data/driverMockData.json';

const DriverProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { vehicles } = useAdminStore();
  const fileInputRef = useRef(null);

  const assignedVehicle = vehicles.find(v => v.assignedDriverId === user?.id || v.assignedDriverName === user?.name);
  
  const pilotData = driverMockData.profile;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || pilotData.name,
    phone: user?.phone || pilotData.phone,
    email: user?.email || pilotData.email,
    location: user?.location || pilotData.location
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateUser({ profilePhoto: event.target.result });
        toast.success('Pilot ID Photo Updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
    toast.success('Profile Credentials Updated');
  };

  const menuItems = [
    { icon: FileText, label: 'Vehicle Documents', path: '/driver/documents', color: 'bg-blue-500' },
    { icon: AlertTriangle, label: 'Vehicle Alerts', path: '/driver/alerts', color: 'bg-red-500' },
    { icon: Settings, label: 'App Settings', path: '/driver/settings', color: 'bg-slate-500' },
    { icon: Info, label: 'Support Center', path: '/driver/support', color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm active:scale-95 transition-all">
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Command Pilot Profile</h2>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(false)} className="p-2 bg-red-50 text-red-500 rounded-full active:scale-90 transition-all">
              <X size={18} />
            </button>
            <button onClick={handleSave} className="p-2 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20 active:scale-90 transition-all">
              <Check size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-2 bg-black text-white rounded-full shadow-lg active:scale-90 transition-all">
            <Edit3 size={18} />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4 pt-2">
        <div className="relative group">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          <div className="w-28 h-28 rounded-[2.5rem] bg-black p-1 shadow-2xl relative overflow-hidden transition-all duration-500">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} className="w-full h-full object-cover rounded-[2.4rem]" alt="Pilot" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-400">
                <User size={48} />
              </div>
            )}
          </div>
          <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 text-white rounded-[1rem] flex items-center justify-center shadow-lg border-2 border-slate-50 hover:scale-110 active:scale-95 transition-all">
             <Camera size={16} />
          </button>
        </div>

        {!isEditing ? (
          <div className="text-center">
            <h2 className="text-2xl font-black text-black tracking-tighter uppercase italic leading-none">{user?.name || pilotData.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{pilotData.status}</span>
              </div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full">Rank: {pilotData.rank}</span>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3 px-4">
            <div className="relative group">
              <label className="absolute left-4 -top-2 px-1 bg-slate-50 text-[8px] font-black text-emerald-600 uppercase tracking-widest z-10">Pilot Callsign</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xs font-black text-black outline-none focus:border-black transition-all uppercase italic"
              />
            </div>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="grid grid-cols-2 gap-3 px-1">
          <div className="bg-white p-4 rounded-[1.8rem] text-center space-y-1 shadow-sm border border-slate-100">
            <p className="text-xl font-black text-black italic leading-none">{pilotData.stats.totalKm}K</p>
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Total KM</p>
          </div>
          <div className="bg-white p-4 rounded-[1.8rem] text-center space-y-1 shadow-sm border border-slate-100">
            <p className="text-xl font-black text-black italic leading-none">{pilotData.stats.safetyScore}</p>
            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Safety Score</p>
          </div>
        </div>
      )}

      {/* Info Sections */}
      <div className="space-y-4">
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tactical Credentials</h3>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-5 py-4 text-xs font-bold text-slate-700 outline-none" />
                </div>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-5 py-4 text-xs font-bold text-slate-700 outline-none lowercase" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 group">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Phone size={16} /></div>
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Comms Line</p>
                    <p className="text-sm font-bold text-slate-900">{user?.phone || pilotData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Mail size={16} /></div>
                  <div>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Digital ID</p>
                    <p className="text-sm font-bold text-slate-900">{user?.email || pilotData.email}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {assignedVehicle && (
          <div className="bg-black rounded-[2rem] p-5 border border-black shadow-lg space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Truck size={64} className="text-white" />
            </div>
            <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1 relative z-10 italic">Assigned Fleet Asset</h3>
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-12 h-12 bg-accent-olive rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Truck size={20} />
               </div>
               <div>
                  <p className="text-xl font-serif italic font-black text-white tracking-tight">{assignedVehicle.vehicleNumber}</p>
                  <div className="flex gap-2 mt-1">
                     <span className="text-[7px] font-black text-accent-olive uppercase tracking-[0.2em] border border-accent-olive/30 px-2 py-0.5">{assignedVehicle.type}</span>
                     <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.2em]">{assignedVehicle.capacity}</span>
                  </div>
               </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
               <div className="flex gap-1">
                  {Object.entries(assignedVehicle?.documents || {}).map(([key, doc]) => (
                    <div key={key} className={`w-1.5 h-1.5 rounded-full ${doc?.status === 'VALID' ? 'bg-emerald-500' : 'bg-red-500'}`} title={key.toUpperCase()} />
                  ))}
               </div>
               <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Compliance Active</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Console Hub</h3>
          <div className="space-y-2 px-1">
            {menuItems.map((item, idx) => (
              <div key={idx} onClick={() => navigate(item.path)} className="bg-white p-4 rounded-[1.5rem] flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center text-white shadow-md group-hover:rotate-6 transition-transform`}><item.icon size={16} /></div>
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isEditing && (
        <button onClick={logout} className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-sm border border-red-100/50">
          <LogOut size={16} /> Terminate Session
        </button>
      )}

      <div className="flex flex-col items-center gap-2 pt-4 opacity-20 italic">
        <img src="/logo.PNG" className="w-5 h-5 object-contain grayscale" alt="" />
        <p className="text-[8px] font-medium text-slate-400 uppercase tracking-[0.2em]">GF FLEET_CONSOLE // GOLD_VERIFIED</p>
      </div>
    </div>
  );
};

export default DriverProfile;
