import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { 
  Package, 
  MapPin, 
  Clock, 
  ArrowRight,
  Phone,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const DriverTasks = () => {
  const tasks = [
    { id: 'TSK-901', type: 'Pick-up', location: 'Deep Sea Farms, Hassan', time: 'Today, 2:00 PM', status: 'new', weight: '200 KG' },
    { id: 'TSK-882', type: 'Delivery', location: 'MKE Fish Mall, City', time: 'Today, 5:30 PM', status: 'assigned', weight: '150 KG' },
  ];

  return (
    <div className="p-4 space-y-6 bg-page-bg min-h-screen">
      <h2 className="text-xl font-serif italic font-black text-black tracking-tight">Assigned <span className="text-[#6B7550]">Tasks</span></h2>
      
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} padding="none" className="overflow-hidden border border-[#E6E2C8] bg-white rounded-none shadow-subtle hover:shadow-wapixo transition-all">
            <div className="p-4">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center border border-[#E6E2C8] ${
                    task.type === 'Pick-up' ? 'bg-[#E6E2C8]/50 text-black' : 'bg-[#E6E2C8]/30 text-[#6B7550]'
                  }`}>
                    {task.type === 'Pick-up' ? '📥' : '📤'}
                  </div>
                  <div>
                    <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">{task.type}</p>
                    <h3 className="font-black text-black text-base uppercase tracking-tight">{task.id}</h3>
                  </div>
                </div>
                <Badge className={`font-black uppercase tracking-widest text-[9px] px-3 py-1 border border-[#E6E2C8] ${task.status === 'new' ? 'bg-[#6B7550] text-white' : 'bg-[#E6E2C8]/50 text-black'}`}>{task.status}</Badge>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-[#6B7550] shrink-0 mt-0.5" />
                  <p className="text-xs font-black text-black uppercase tracking-tight">{task.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-text-muted shrink-0" />
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{task.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Package size={14} className="text-text-muted shrink-0" />
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{task.weight}</p>
                </div>
              </div>

              {task.status === 'new' ? (
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-[#6B7550] text-white rounded-none font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                    <CheckCircle2 size={16} /> ACCEPT
                  </button>
                  <button className="flex-1 py-4 bg-white text-black border border-[#E6E2C8] rounded-none font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#E6E2C8]/30 transition-all">
                    <XCircle size={16} /> REJECT
                  </button>
                </div>
              ) : (
                <Button className="w-full gap-3 py-4 bg-[#E6E2C8] text-black hover:bg-black hover:text-white border-none font-black text-[10px] uppercase tracking-widest transition-all">
                  START TASK <ArrowRight size={16} />
                </Button>
              )}
            </div>
            
            <div className="p-3 bg-[#E6E2C8]/10 border-t border-[#E6E2C8] flex justify-center hover:bg-[#E6E2C8]/20 transition-all cursor-pointer">
              <button className="text-[9px] text-[#6B7550] font-black uppercase tracking-widest flex items-center gap-2">
                <Phone size={12} /> CONTACT COORDINATOR
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DriverTasks;


