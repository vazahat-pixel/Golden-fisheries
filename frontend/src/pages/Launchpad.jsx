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
      title: 'Strategic Admin',
      desc: 'CENTRAL ERP CONTROL, LOGISTICS & FINANCE HUB',
      path: '/admin/auth',
      icon: ShieldCheck,
      color: 'bg-black',
      tag: 'MASTER'
    },
    {
      title: 'Kitchen Ops',
      desc: 'POS TERMINAL & LIVE MANIFEST MANAGEMENT',
      path: '/restaurant/auth',
      icon: Utensils,
      color: 'bg-black',
      tag: 'STATION'
    },
    {
      title: 'Retail Matrix',
      desc: 'FISH MALL BILLING & WEIGHT-BASED REGISTRY',
      path: '/fishmall/auth',
      icon: Fish,
      color: 'bg-black',
      tag: 'TERMINAL'
    },
    {
      title: 'Fleet Pilot',
      desc: 'MOBILE LOGISTICS CONSOLE & FIELD OPERATIONS',
      path: '/driver/auth',
      icon: Truck,
      color: 'bg-black',
      tag: 'MOBILE'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-500">
      <div className="w-full max-w-6xl">
        {/* Compact Branding */}
        <div className="flex flex-col items-center text-center mb-16">
          <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-24 h-24 object-contain mb-6 grayscale hover:grayscale-0 transition-all duration-500" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Control Center</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em] mt-2">Unified Enterprise Management Portal</p>
          <div className="h-0.5 w-12 bg-[#6B7550] mt-4" />
        </div>

        {/* Dense Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {panels.map((panel, idx) => (
            <Link key={idx} to={panel.path} className="group">
              <div className="bg-white border border-gray-200 p-8 flex flex-col h-full hover:border-[#6B7550] hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[#6B7550] transition-colors">
                  <panel.icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight mb-2 group-hover:text-[#6B7550] transition-colors">{panel.title}</h3>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-8 uppercase tracking-wider">
                  {panel.desc}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Authorize</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Audit Info */}
        <div className="mt-20 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">© 2026 Golden Fisheries Infra</p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} /> Secure Protocol V.2.06
            </span>
            <span className="text-[9px] font-bold text-[#6B7550] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#6B7550] rounded-full animate-pulse" /> Nodes Nominal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Launchpad;
