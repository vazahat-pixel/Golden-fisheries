import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowUpRight, Zap } from 'lucide-react';
import { SupplyChainHeroSvg } from './DashboardSvgs';

const DashboardHero = () => {
  const navigate = useNavigate();

  return (
    <section className="dash-hero p-4 md:p-5">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="dash-live-dot" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-success">
              Live ERP Sync
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-black tracking-tight text-text-primary leading-tight">
            Admin ERP Control Console
          </h1>
          <p className="text-xs font-medium text-text-secondary mt-1 max-w-xl">
            Procurement · dispatch · logistics — unified command center
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/procurement/harvest/new')}
              className="dash-btn-primary px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg"
            >
              <PlusCircle size={13} /> New Harvest Slip
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/tapals/sales/new')}
              className="dash-btn-ghost px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-lg"
            >
              <ArrowUpRight size={13} /> New Sales Tapal
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold text-text-muted uppercase tracking-wider">
              <Zap size={11} className="text-brand-yellow" /> Auto-sync
            </span>
          </div>
        </div>

        <div className="hidden md:block w-full max-w-[260px] shrink-0 opacity-90">
          <SupplyChainHeroSvg className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
};

export default DashboardHero;
