import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Store, 
  Clock, 
  Shield, 
  CreditCard,
  ChefHat,
  IndianRupee,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RestaurantSettings = () => {
  const [activeTab, setActiveTab] = React.useState('GENERAL');

  const renderContent = () => {
    switch (activeTab) {
      case 'TERMINAL':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="none" className="border border-black/5 shadow-sm bg-white overflow-hidden">
              <div className="p-5 border-b border-black/5 bg-gray-50/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0 shadow-lg">
                  <CreditCard size={24} className="text-[#6B7550]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">Terminal Hardware Architecture</h3>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Peripheral Interface & Port Configuration</p>
                </div>
              </div>
              <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">Primary Thermal Hub</label>
                    <div className="relative">
                       <select className="w-full bg-white border border-black/5 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-black outline-none focus:border-black appearance-none cursor-pointer">
                         <option>USB-BUS-01 (Generic)</option>
                         <option>NET-VLAN-12 (Network)</option>
                         <option>SERIAL-COM3 (Legacy)</option>
                       </select>
                       <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20"><Settings size={12} /></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">Display Matrix Sync</label>
                    <input type="text" defaultValue="KDS-ALPHA-01" className="w-full bg-white border border-black/5 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-black outline-none focus:border-black" />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em] mb-4">Device Status Matrix</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                    {[
                      { name: 'Receipt Printer', status: 'Online', color: '#6B7550' },
                      { name: 'Barcode Scanner', status: 'Standby', color: '#000' },
                      { name: 'Digital Scale', status: 'Offline', color: '#EF4444' }
                    ].map((dev, i) => (
                      <div key={i} className="bg-gray-50 border border-black/5 p-4 flex items-center justify-between group hover:bg-black transition-all">
                        <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{dev.name}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dev.color }} />
                           <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover:text-white transition-colors">{dev.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-black text-white flex items-center justify-between relative overflow-hidden group">
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-10 h-10 border border-white/20 flex items-center justify-center">
                       <div className="w-2 h-2 bg-[#6B7550] animate-ping" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em]">Hardware Handshake Active</p>
                       <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#6B7550]">Latency: 12ms / Stable</p>
                    </div>
                  </div>
                  <Button className="bg-white text-black text-[8px] font-black uppercase tracking-widest py-3 px-8 border-none relative z-10 active:scale-95">Flash Diagnostics</Button>
                  <div className="absolute inset-0 bg-[#6B7550]/5 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                </div>
              </div>
            </Card>
          </div>
        );
      case 'BILLING':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="none" className="border border-black/5 shadow-sm bg-white overflow-hidden">
               <div className="p-5 border-b border-black/5 bg-gray-50/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0 shadow-lg">
                  <IndianRupee size={24} className="text-[#6B7550]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">Billing Protocols & Taxes</h3>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Fiscal Rules & Transaction Manifest</p>
                </div>
              </div>
              <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">Default Tax Structure (GST)</label>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-gray-50 p-4 border border-black/5 text-[10px] font-black">CGST 2.5%</div>
                      <div className="flex-1 bg-gray-50 p-4 border border-black/5 text-[10px] font-black">SGST 2.5%</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">Service Charge Protocol</label>
                    <div className="relative">
                       <select className="w-full bg-white border border-black/5 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-black outline-none focus:border-black appearance-none cursor-pointer">
                         <option>5.0% Mandatory</option>
                         <option>Optional / Discretionary</option>
                         <option>None (Direct Billing)</option>
                       </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em] mb-4">Functional Overrides</p>
                  {[
                    { label: 'Apply Rounded Totals', desc: 'Auto-round final bill to nearest whole currency unit.', active: true },
                    { label: 'Manual Price Override', desc: 'Allow managers to adjust line-item pricing at checkout.', active: false },
                    { label: 'Force Digital Receipts', desc: 'SMS/Email receipt dispatch is mandatory before exit.', active: true }
                  ].map((opt, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white border border-black/5 hover:border-black transition-all">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-black uppercase tracking-widest">{opt.label}</p>
                          <p className="text-[8px] text-text-muted font-black uppercase tracking-widest">{opt.desc}</p>
                       </div>
                       <div className={`w-12 h-6 border ${opt.active ? 'bg-black border-black' : 'bg-gray-100 border-black/5'} p-1 transition-all flex items-center`}>
                          <div className={`w-4 h-4 shadow-sm transition-all ${opt.active ? 'bg-[#6B7550] translate-x-6' : 'bg-white translate-x-0'}`}></div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        );
      case 'STAFF':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="none" className="border border-black/5 shadow-sm bg-white overflow-hidden">
              <div className="p-5 border-b border-black/5 bg-gray-50/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0 shadow-lg">
                    <ChefHat size={24} className="text-[#6B7550]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">Operational Roster & Clearances</h3>
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Personnel Registry & Access Hierarchies</p>
                  </div>
                </div>
                <Button className="bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] px-8 py-4 border-none shadow-xl active:scale-95">Initiate Onboarding</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100/50 border-b-2 border-black">
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.4em] text-black">Operator Profile</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.4em] text-black text-center">Clearance Level</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.4em] text-black text-right">Mission Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {[
                      { name: 'Suresh Kumar', role: 'BILLING COMMAND', status: 'Stationed' },
                      { name: 'Anil Verma', role: 'KITCHEN LEAD', status: 'Live Shift' },
                      { name: 'Meena Raj', role: 'TERMINAL OPS', status: 'Inactive' }
                    ].map((staff, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-black text-black uppercase tracking-tight group-hover:translate-x-1 transition-transform">{staff.name}</p>
                          <p className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em] mt-2">ID: REG-00{i+1}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <Badge className="bg-black text-white border-none px-4 py-2 font-black text-[8px] uppercase tracking-[0.3em] group-hover:bg-[#6B7550] transition-colors">{staff.role}</Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${staff.status === 'Inactive' ? 'text-black/20' : 'text-[#6B7550]'}`}>{staff.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      case 'NOTIFICATIONS':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="none" className="border border-black/5 shadow-sm bg-white overflow-hidden">
               <div className="p-5 border-b border-black/5 bg-gray-50/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0 shadow-lg">
                  <Bell size={24} className="text-[#6B7550]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">Telemetry & Alert Broadcasts</h3>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Centralized Notification Distribution Pipeline</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                {[
                  { label: 'Critical Inventory Telemetry', desc: 'Dispatch alerts when product levels hit lower bounds.', active: true },
                  { label: 'System Transaction Echo', desc: 'Real-time SMS broadcast for every financial event.', active: false },
                  { label: 'End-of-Shift Manifest', desc: 'Automated email summary generation for administration.', active: true }
                ].map((opt, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white border border-black/5 hover:border-[#6B7550] transition-all cursor-pointer group">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-black uppercase tracking-widest group-hover:text-[#6B7550] transition-colors">{opt.label}</p>
                      <p className="text-[8px] text-text-muted font-black uppercase tracking-widest leading-relaxed">{opt.desc}</p>
                    </div>
                    <div className={`w-14 h-7 border-2 ${opt.active ? 'bg-black border-black' : 'bg-gray-50 border-black/10'} p-1 transition-all flex items-center`}>
                      <div className={`w-4 h-4 shadow-xl transition-all ${opt.active ? 'bg-[#6B7550] translate-x-7' : 'bg-white translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      case 'SECURITY':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="none" className="border border-black/5 shadow-sm bg-white overflow-hidden">
               <div className="p-5 border-b border-black/5 bg-gray-50/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0 shadow-lg">
                  <Lock size={24} className="text-[#6B7550]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">Protocol Security & Encryption</h3>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Credential Shielding & Terminal Guarding</p>
                </div>
              </div>
              <div className="p-10 space-y-12">
                <div className="space-y-6 max-w-md mx-auto text-center">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.5em]">Terminal Access Key</label>
                    <div className="flex justify-center gap-4">
                       {[1,2,3,4].map(i => <div key={i} className="w-12 h-16 bg-gray-50 border-2 border-black flex items-center justify-center text-xl font-black italic">●</div>)}
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white py-6 text-[11px] font-black uppercase tracking-[0.4em] border-none shadow-2xl hover:bg-red-600 active:scale-95 transition-all">Rotate Security Core</Button>
                </div>
                
                <div className="pt-10 border-t-2 border-black/5">
                   <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em] mb-8 text-center">Terminal Event Stream</p>
                   <div className="space-y-1">
                     {[
                       { event: 'SECURITY_HANDSHAKE_SUCCESS', time: '2026-05-05 17:15:30', terminal: 'GF-RE-01' },
                       { event: 'CREDENTIAL_ROTATION_EVENT', time: '2026-05-04 09:20:12', terminal: 'GF-ADMIN' },
                       { event: 'VULNERABILITY_SCAN_COMPLETE', time: '2026-05-04 03:00:00', terminal: 'GF-SYSTEM' }
                     ].map((log, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-gray-50/30 border border-black/5 text-[8px] font-black uppercase tracking-[0.2em] text-text-muted group hover:bg-black hover:text-white transition-all">
                         <span className="group-hover:text-[#6B7550]">{log.event}</span>
                         <div className="flex gap-6">
                            <span>{log.terminal}</span>
                            <span className="opacity-40">{log.time}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <Card padding="none" className="border border-black/5 shadow-sm bg-white overflow-hidden">
              <div className="p-5 border-b border-black/5 bg-gray-50/30 flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center shrink-0 shadow-lg">
                  <Store size={24} className="text-[#6B7550]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">Core Institution Profile</h3>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Operational Identity & Master Metadata</p>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                  {[
                    { label: 'Institutional Designation', value: 'MKE GOLDEN SEAFOOD RESTAURANT', type: 'text' },
                    { label: 'Registry Master ID', value: 'REG-RE-5501', type: 'text', disabled: true },
                    { label: 'Communication Hub (Primary)', value: '+91 98765 43210', type: 'text' },
                    { label: 'Physical Coordinate (Hub)', value: 'Bay View Road, Sector 4, Mangaluru', type: 'text' }
                  ].map((field, i) => (
                    <div key={i} className="space-y-3 group">
                      <label className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em] group-focus-within:text-black transition-colors">{field.label}</label>
                      <input 
                        type={field.type} 
                        defaultValue={field.value}
                        disabled={field.disabled}
                        className={`w-full bg-white border border-black/5 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-black outline-none focus:border-black transition-all ${field.disabled ? 'bg-gray-100/50 opacity-30 cursor-not-allowed border-dashed' : 'hover:border-black/20 focus:shadow-xl'}`}
                      />
                    </div>
                  ))}
                  
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-[0.4em]">Operational Duty Window</label>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-gray-50 p-6 border border-black/5 flex items-center justify-between group hover:bg-black transition-all">
                        <div className="space-y-1">
                           <p className="text-[7px] font-black text-text-muted uppercase tracking-widest group-hover:text-[#6B7550]">Station Open</p>
                           <p className="text-xl font-black text-black group-hover:text-white italic">10:00 AM</p>
                        </div>
                        <Clock size={24} className="text-black/5 group-hover:text-[#6B7550]" />
                      </div>
                      <div className="w-10 h-0.5 bg-black/10 mx-4" />
                      <div className="flex-1 bg-gray-50 p-6 border border-black/5 flex items-center justify-between group hover:bg-black transition-all">
                        <div className="space-y-1">
                           <p className="text-[7px] font-black text-text-muted uppercase tracking-widest group-hover:text-[#6B7550]">Station Close</p>
                           <p className="text-xl font-black text-black group-hover:text-white italic">11:00 PM</p>
                        </div>
                        <Clock size={24} className="text-black/5 group-hover:text-[#6B7550]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-1 pt-10 border-t-2 border-black">
                  <Button 
                    variant="outline" 
                    className="py-6 px-12 text-[10px] font-black uppercase tracking-[0.4em] border-black/10 hover:bg-red-600 hover:text-white transition-all border-none"
                    onClick={() => toast('Registry discard initiated')}
                  >
                    Abort Changes
                  </Button>
                  <Button 
                    className="py-6 px-12 text-[10px] font-black uppercase tracking-[0.4em] bg-black text-white hover:bg-[#6B7550] border-none shadow-2xl active:scale-95 transition-all"
                    onClick={() => toast.success('Central Registry Synchronized')}
                  >
                    Commit To Master
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 selection:bg-black selection:text-white max-w-7xl mx-auto">
      {/* High-Altitude Control Header */}
      <div className="bg-black text-white p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10 shadow-3xl relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-serif italic font-black text-white tracking-tighter uppercase leading-none">
            Registry <span className="text-[#6B7550]">Control.</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-[#6B7550] text-[9px] font-black uppercase tracking-[0.5em]">Central Operational Node</p>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Terminal: GF-MKE-01</p>
          </div>
        </div>
        <div className="flex gap-1 relative z-10 w-full md:w-auto">
          <Button 
            className="flex-1 md:flex-none bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] px-10 py-6 border-none shadow-2xl hover:bg-[#6B7550] hover:text-white transition-all active:scale-95"
            onClick={() => toast.success('Protocol Sync Complete')}
          >
            <Settings size={18} className="mr-4" /> Global Sync
          </Button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/5 skew-x-12 translate-x-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Matrix */}
        <div className="lg:col-span-1 space-y-1">
          {[
            { id: 'GENERAL', label: 'Core Profile', icon: Store, sub: 'Identity Matrix' },
            { id: 'TERMINAL', label: 'Hardware Hub', icon: CreditCard, sub: 'Device Architecture' },
            { id: 'BILLING', label: 'Fiscal Logic', icon: IndianRupee, sub: 'Tax Protocols' },
            { id: 'STAFF', label: 'Personnel', icon: ChefHat, sub: 'Roster Control' },
            { id: 'NOTIFICATIONS', label: 'Telemetry', icon: Bell, sub: 'Alert Streams' },
            { id: 'SECURITY', label: 'Guard Unit', icon: Lock, sub: 'Protocol Shield' },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-6 transition-all group border-l-4 ${
                activeTab === item.id 
                  ? 'bg-black text-white border-[#6B7550] shadow-2xl scale-[1.05] z-10' 
                  : 'bg-white text-black border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-5">
                <item.icon size={20} className={activeTab === item.id ? "text-[#6B7550]" : "text-black/10 group-hover:text-black transition-colors"} />
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">{item.label}</p>
                  <p className={`text-[8px] font-black uppercase tracking-[0.1em] mt-2 ${activeTab === item.id ? 'text-[#6B7550]' : 'text-text-muted'}`}>{item.sub}</p>
                </div>
              </div>
              <ChevronRight size={16} className={activeTab === item.id ? "text-white" : "text-black/5 group-hover:text-black"} />
            </button>
          ))}
        </div>

        {/* Action Surface */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};


export default RestaurantSettings;
