import React from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Wifi, 
  Battery,
  ChevronLeft,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import driverMockData from '../../data/driverMockData.json';

const DriverLiveTracking = () => {
  const navigate = useNavigate();
  const { currentMission } = driverMockData.liveTracking;

  return (
    <div className="relative h-screen w-full bg-slate-900 overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Dark Tactical Map */}
      <div className="absolute inset-0 z-0">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.6) contrast(1.2)' }}
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15551.4682052163!2d74.8427776!3d12.8701056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1714811800000!5m2!1sen!2sin"
          allowFullScreen
        ></iframe>
      </div>

      {/* Top Tactical Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 safe-top flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-black/80 backdrop-blur-md rounded-2xl text-white border border-white/10 active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="glass px-4 py-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">{currentMission.status}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
           <div className="glass px-4 py-2 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Wifi size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-white uppercase">{currentMission.signal}</span>
              </div>
              <div className="w-[1px] h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <Battery size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-white uppercase">{currentMission.battery}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Centered Tactical Stats - Compact Cockpit View */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
        <div className="glass-card bg-black/90 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden group">
          {/* Background Pulse Effect */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-1 italic">Mission Telemetry</p>
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">{currentMission.id}</h3>
              </div>
              <div className="flex flex-col items-end">
                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Estimated Arrival</p>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xl font-black text-emerald-500 italic leading-none">{currentMission.eta.split(' ')[0]}</span>
                   <span className="text-[9px] font-black text-emerald-500/50 uppercase italic tracking-widest">{currentMission.eta.split(' ')[1]}</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center space-y-1">
                <Navigation size={14} className="text-emerald-500 mb-1" />
                <p className="text-[14px] font-black text-white italic leading-none">{currentMission.speed.split(' ')[0]}</p>
                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none">Speed</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center space-y-1">
                <MapPin size={14} className="text-emerald-500 mb-1" />
                <p className="text-[14px] font-black text-white italic leading-none">4.2 <span className="text-[8px]">KM</span></p>
                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none">Remaining</p>
              </div>
              <div className={`bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center space-y-1`}>
                <Clock size={14} className="text-emerald-500 mb-1" />
                <p className="text-[14px] font-black text-white italic leading-none">12:45</p>
                <p className="text-[7px] font-black text-gray-500 uppercase tracking-widest leading-none">Target</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/driver/active-trip')}
              className="w-full py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.5em] shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all hover:bg-emerald-400 flex items-center justify-center gap-3"
            >
              <Zap size={16} /> Command Console
            </button>
          </div>
        </div>
      </div>

      {/* Floating Tactical Overlay Elements */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-10 space-y-3 opacity-40">
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
        <div className="text-[7px] font-black text-emerald-500 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">GPS_LOCKED</div>
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
      </div>
    </div>
  );
};

export default DriverLiveTracking;
