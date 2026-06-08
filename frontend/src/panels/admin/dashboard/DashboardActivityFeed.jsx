import React from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TYPE_STYLES = {
  HARVEST: 'bg-[#6A7051]/15 text-[#4a5038] border-[#6A7051]/30',
  DISPATCH: 'bg-amber-100 text-amber-900 border-amber-300',
  APPROVAL: 'bg-emerald-100 text-emerald-900 border-emerald-300',
};

const DashboardActivityFeed = ({ activities, onRefresh }) => {
  const handleRefresh = () => {
    onRefresh?.();
    toast.success('Activity feed synced');
  };

  return (
    <section className="dash-chart-panel dash-stagger">
      <div className="dash-chart-panel__head flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
            <Activity size={14} className="text-[#C5A021]" /> Recent Activity Log
          </h3>
          <p className="text-[10px] font-medium text-text-secondary mt-0.5">
            Latest procurement and dispatch events across modules
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-[10px] font-black uppercase tracking-widest text-[#6A7051] hover:text-[#5F6846] transition-all flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#6A7051]/25 hover:bg-[#6A7051]/5"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="divide-y divide-card-border">
        {activities.length === 0 ? (
          <p className="p-6 text-center text-xs font-semibold text-text-secondary">
            No recent activity. Operations will appear here in real time.
          </p>
        ) : (
          activities.map((act, idx) => (
            <div
              key={act.id}
              className={`dash-activity-item py-3.5 px-5 flex items-start justify-between gap-4 ${
                act.highlight ? 'bg-[#6A7051]/8 border-l-[3px] border-l-[#6A7051]' : ''
              }`}
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border shrink-0 ${
                    TYPE_STYLES[act.type] || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {act.type}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-brand-olive uppercase">{act.title}</h4>
                  <p className="text-[11px] font-semibold text-text-secondary mt-0.5 truncate">{act.desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-text-muted whitespace-nowrap shrink-0 tabular-nums">
                {act.time}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default DashboardActivityFeed;
