import React from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { KpiHarvestSvg, KpiDispatchSvg, KpiFleetSvg, KpiAuditSvg } from './DashboardSvgs';
import { ChevronRight } from 'lucide-react';

const KPI_CONFIG = [
  { key: 'harvest', label: 'Harvest GRN', suffix: ' kg', decimals: 0, sub: 'Live slips', icon: KpiHarvestSvg, warn: false },
  { key: 'dispatch', label: 'Dispatches', suffix: '', decimals: 0, sub: 'Sales tapals', icon: KpiDispatchSvg, warn: false, displaySuffix: ' trips' },
  { key: 'fleet', label: 'In Transit', suffix: '', decimals: 0, sub: 'Active fleet', icon: KpiFleetSvg, warn: false, displaySuffix: ' active' },
  { key: 'audit', label: 'Pending Audit', suffix: '', decimals: 0, sub: 'Needs approval', icon: KpiAuditSvg, warn: true, displaySuffix: ' slips' },
];

const DashboardKpiGrid = ({ metrics, onNavigate }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 dash-stagger">
    {KPI_CONFIG.map((cfg) => {
      const Icon = cfg.icon;
      const value = metrics[cfg.key] ?? 0;
      const suffix = cfg.displaySuffix ?? cfg.suffix;
      return (
        <div
          key={cfg.key}
          role="button"
          tabIndex={0}
          onClick={() => onNavigate(cfg.key)}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate(cfg.key)}
          className={`dash-kpi dash-kpi--compact group ${cfg.warn ? 'dash-kpi--warn' : ''}`}
        >
          <div className="dash-kpi-icon">
            <Icon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-wider text-text-muted truncate">{cfg.label}</p>
            <p className={`text-lg font-black ${cfg.warn ? 'text-warning' : 'text-brand-olive'}`}>
              <AnimatedNumber value={value} suffix={suffix} decimals={cfg.decimals} />
            </p>
            <span className="text-[9px] font-semibold text-text-muted truncate block">{cfg.sub}</span>
          </div>
          <ChevronRight
            size={14}
            className="text-brand-yellow shrink-0 opacity-0 group-hover:opacity-100 transition-all"
          />
        </div>
      );
    })}
  </div>
);

export default DashboardKpiGrid;
