import React from 'react';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';
import { 
  ShieldCheck, 
  Utensils, 
  Fish, 
  Truck, 
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Launchpad = () => {
  const panels = [
    {
      title: 'MKE Admin',
      desc: 'Central ERP Control, Logistics & Finance',
      path: '/admin/dashboard',
      icon: ShieldCheck,
      color: 'bg-blue-600',
      shadow: 'shadow-blue-500/20'
    },
    {
      title: 'Restaurant Panel',
      desc: 'POS Billing & Live Order Management',
      path: '/restaurant/dashboard',
      icon: Utensils,
      color: 'bg-orange-500',
      shadow: 'shadow-orange-500/20'
    },
    {
      title: 'Fish Mall',
      desc: 'Weight-based Billing & Rate Cards',
      path: '/fishmall/dashboard',
      icon: Fish,
      color: 'bg-cyan-500',
      shadow: 'shadow-cyan-500/20'
    },
    {
      title: 'Driver App',
      desc: 'Mobile PWA for Field Operations',
      path: '/driver/dashboard',
      icon: Truck,
      color: 'bg-indigo-600',
      shadow: 'shadow-indigo-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-[#001433] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-xl mb-6 border border-white/20">
            <LayoutGrid size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">
            MKE <span className="text-blue-500">Launchpad</span>
          </h1>
          <p className="text-blue-200/60 text-lg font-medium max-w-lg mx-auto">
            Select a specialized panel to manage your seafood ecosystem operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {panels.map((panel, idx) => (
            <Link key={idx} to={panel.path} className="group">
              <Card className="h-full bg-white/5 border-white/10 backdrop-blur-lg hover:bg-white/10 hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2 p-8 flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${panel.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl ${panel.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  <panel.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{panel.title}</h3>
                <p className="text-blue-200/50 text-sm font-medium mb-8 leading-relaxed">
                  {panel.desc}
                </p>
                <div className="mt-auto flex items-center gap-2 text-blue-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Panel <ArrowRight size={16} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-blue-200/30 text-xs font-bold uppercase tracking-[0.2em]">
            MKE Seafood ERP &bull; Internal Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Launchpad;
