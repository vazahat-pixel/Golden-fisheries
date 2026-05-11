import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Share2, Clock, Map as MapIcon, ChevronLeft, Phone, Info, Signal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DriverLiveTracking = () => {
  const navigate = useNavigate();
  const [distance, setDistance] = useState(12.4);
  const [eta, setEta] = useState(25);

  useEffect(() => {
    const timer = setInterval(() => {
      setDistance(prev => Math.max(0, +(prev - 0.1).toFixed(1)));
      setEta(prev => Math.max(0, prev - 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText("12.8701056, 74.8427776");
    toast.success("Location Copied!");
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900 font-sans">
      {/* Dynamic Map Background with Enhanced Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(90%) contrast(100%)' }}
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15551.4682052163!2d74.8427776!3d12.8701056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1714811800000!5m2!1sen!2sin"
          allowFullScreen
        ></iframe>
      </div>

      {/* Ultra-Compact Floating Header */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 pointer-events-none safe-top">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 glass rounded-xl flex items-center justify-center text-black pointer-events-auto shadow-xl active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="glass px-4 py-2 rounded-xl shadow-xl border border-white/40 pointer-events-auto flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
            <h1 className="text-[9px] font-black text-black uppercase tracking-[0.2em]">Live Telemetry</h1>
          </div>
          <button 
            onClick={handleShare}
            className="w-10 h-10 glass rounded-xl flex items-center justify-center text-black pointer-events-auto shadow-xl active:scale-95 transition-all"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Signal Status - Center Top */}
      <div className="absolute top-20 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="glass-dark px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl border border-white/5 backdrop-blur-xl">
           <Signal size={10} className="text-emerald-400" />
           <p className="text-[7px] font-black text-white uppercase tracking-[0.3em]">GPS Signal: Optimized</p>
        </div>
      </div>

      {/* Ultra-Compact Bottom Tracking Card */}
      <div className="absolute bottom-6 left-0 right-0 z-30 px-4 animate-in slide-in-from-bottom-8 duration-700">
        <div className="glass-card rounded-[1.8rem] p-3.5 shadow-2xl border-none relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Arrival</span>
                <p className="text-xl font-black text-black tracking-tighter italic leading-none">{eta}<span className="text-[8px] ml-0.5 not-italic text-gray-400">M</span></p>
              </div>
              <div className="w-[1px] h-6 bg-black/5 self-center" />
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Range</span>
                <p className="text-xl font-black text-black tracking-tighter italic leading-none">{distance}<span className="text-[8px] ml-0.5 not-italic text-gray-400">K</span></p>
              </div>
            </div>
            
            <button 
              onClick={() => window.open('tel:9876543210')}
              className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm active:scale-95 transition-all"
            >
              <Phone size={14} />
            </button>
          </div>

          <div className="bg-slate-50/50 rounded-xl p-2.5 flex items-center gap-3 border border-black/5 mb-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-lg">
              <MapPin size={12} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Target Hub</p>
              <p className="text-[9px] font-bold text-black uppercase truncate italic">Cold Storage - Sec 4</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/driver/active-trip')}
            className="w-full py-3 bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all group-hover:bg-emerald-600"
          >
            <Navigation size={12} className="group-hover:rotate-12 transition-transform" /> 
            Back to Console
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverLiveTracking;
