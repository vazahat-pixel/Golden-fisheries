import React, { useEffect } from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle2, ShieldAlert, Settings, Zap, Package } from 'lucide-react';
import { useFishMallStore } from '../../store/fishMallStore';
import { Button } from '../../design-system/components/Button';

const FishMallAlerts = () => {
  const { alerts, dismissAlert, generateAlerts, markAlertsRead } = useFishMallStore();

  useEffect(() => {
    markAlertsRead?.();
  }, [markAlertsRead]);

  const getSeverityStyles = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-50 text-red-600 border-red-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'LOW_STOCK': return AlertTriangle;
      case 'RATE_CHANGE': return Zap;
      case 'DEAD_STOCK': return ShieldAlert;
      case 'PROCUREMENT_TRANSFER': return Package;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black text-white rounded-2xl shadow-lg shadow-black/20"><Bell size={24} /></div>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest">Alert Central</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Smart notifications & system anomalies</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateAlerts} variant="outline" className="text-[9px] font-black uppercase tracking-widest h-12 px-6 rounded-xl border-gray-200">
            Scan System Now
          </Button>
          <Button variant="outline" className="p-3 border-gray-200 rounded-xl">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <CheckCircle2 size={48} className="text-emerald-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">System Clear</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">All parameters within normal range</p>
              </div>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = getIcon(alert.type);
              return (
                <div 
                  key={alert.id}
                  className={`group relative p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 flex items-start gap-5`}
                >
                  <div className={`p-4 rounded-2xl ${getSeverityStyles(alert.severity)} shrink-0`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${getSeverityStyles(alert.severity)}`}>
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1">{alert.title}</h3>
                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{alert.message}</p>
                    <div className="mt-4 flex items-center gap-2">
                       <Button size="sm" className="h-8 text-[8px] font-black uppercase tracking-widest rounded-lg bg-black">Resolution Flow</Button>
                       <Button onClick={() => dismissAlert(alert.id)} variant="ghost" size="sm" className="h-8 text-[8px] font-black uppercase tracking-widest rounded-lg text-gray-400 hover:text-red-500">Dismiss</Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-sm space-y-6">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-3">Alert Distribution</h4>
             <div className="space-y-4">
                {[
                  { label: 'Procurement In', count: alerts.filter(a => a.type === 'PROCUREMENT_TRANSFER').length, color: 'bg-emerald-500' },
                  { label: 'Low Stock', count: alerts.filter(a => a.type === 'LOW_STOCK').length, color: 'bg-amber-500' },
                  { label: 'Rate Changes', count: alerts.filter(a => a.type === 'RATE_CHANGE').length, color: 'bg-blue-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                      <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{stat.label}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-900">{stat.count}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-[#6B7550] p-8 rounded-3xl text-white space-y-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
               <ShieldAlert size={120} />
             </div>
             <h4 className="text-lg font-black uppercase tracking-tighter leading-none">Smart Shield<br/>Enabled</h4>
             <p className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">Automated monitoring active across 6 species and 2 terminals.</p>
             <div className="pt-4">
                <Button className="w-full bg-white text-black hover:bg-[#E6E2C8] text-[9px] font-black uppercase tracking-widest h-10 border-none">Security Log</Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishMallAlerts;
