import React from 'react';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';
import { 
  ShieldCheck, 
  Utensils, 
  Fish, 
  Truck, 
  LayoutGrid,
  ArrowRight,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Launchpad = () => {
  const panels = [
    {
      title: 'GF Admin',
      desc: 'Central ERP Control, Logistics & Finance',
      path: '/admin/auth',
      icon: ShieldCheck,
      color: 'bg-[#C5A021]',
      hoverBorder: 'hover:border-[#C5A021]'
    },
    {
      title: 'Restaurant Panel',
      desc: 'POS Billing & Live Order Management',
      path: '/restaurant/auth',
      icon: Utensils,
      color: 'bg-[#C5A021]',
      hoverBorder: 'hover:border-[#C5A021]'
    },
    {
      title: 'Fish Mall',
      desc: 'Weight-based Billing & Rate Cards',
      path: '/fishmall/auth',
      icon: Fish,
      color: 'bg-[#C5A021]',
      hoverBorder: 'hover:border-[#C5A021]'
    },
    {
      title: 'Driver App',
      desc: 'Mobile PWA for Field Operations',
      path: '/driver/auth',
      icon: Truck,
      color: 'bg-[#C5A021]',
      hoverBorder: 'hover:border-[#C5A021]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#6A7051] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-[#C5A021]/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-8 right-12 flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
        <Globe size={16} className="text-[#E6E3C8]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E3C8]">Identity Portal</span>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="text-center mb-20">
           <div className="w-40 h-40 mb-10 mx-auto relative group active:scale-95 transition-transform duration-300">
              <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-full h-full object-contain drop-shadow-2xl" />
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 uppercase">
             Identity <span className="text-[#E6E3C8]">Portal</span>
           </h1>
           <p className="text-[#E6E3C8]/60 text-xs md:text-sm font-black uppercase tracking-[0.5em] max-w-lg mx-auto leading-loose">
             Unified Control Systems &bull; Secure Gateway
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {panels.map((panel, idx) => (
            <Link key={idx} to={panel.path} className="group">
              <Card className="h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#C5A021] transition-all duration-500 group-hover:-translate-y-3 p-8 flex flex-col items-center text-center rounded-3xl shadow-2xl overflow-hidden relative">
                {/* Decorative background glow on hover */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C5A021]/10 rounded-full blur-3xl group-hover:bg-[#C5A021]/20 transition-all duration-700" />
                
                <div className="w-16 h-16 bg-[#E6E3C8] rounded-2xl flex items-center justify-center text-[#6A7051] mb-8 group-hover:bg-[#C5A021] group-hover:text-black transition-all duration-500 shadow-lg rotate-3 group-hover:rotate-0">
                  <panel.icon size={28} />
                </div>
                
                <h3 className="text-sm font-black text-white mb-3 tracking-[0.2em] uppercase">{panel.title}</h3>
                <p className="text-[#E6E3C8]/40 text-[10px] font-bold uppercase tracking-widest mb-10 leading-relaxed group-hover:text-[#E6E3C8]/70 transition-colors">
                  {panel.desc}
                </p>
                
                <div className="mt-auto flex items-center gap-3 bg-[#E6E3C8] text-[#6A7051] px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#C5A021] hover:text-black transition-all shadow-md group-hover:scale-105">
                  Secure Access <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-24 text-center">
           <div className="inline-flex items-center gap-4 py-2 px-6 bg-white/5 border border-white/10 rounded-full">
              <div className="w-2 h-2 bg-[#C5A021] rounded-full animate-pulse" />
              <p className="text-[#E6E3C8]/40 text-[9px] font-black uppercase tracking-[0.4em]">
                Internal Enterprise Access &bull; Golden Fisheries &bull; Est 2026
              </p>
           </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none opacity-5">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-32 fill-[#E6E3C8]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,14.29,1200,52.47V0Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Launchpad;
