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
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-black text-gray-900">Assigned Tasks</h2>
      
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} padding="none" className="overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    task.type === 'Pick-up' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {task.type === 'Pick-up' ? '📥' : '📤'}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{task.type}</p>
                    <h3 className="font-bold text-gray-900">{task.id}</h3>
                  </div>
                </div>
                <Badge variant={task.status === 'new' ? 'primary' : 'info'}>{task.status}</Badge>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-gray-700">{task.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-500 font-bold">{task.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-500 font-bold">{task.weight}</p>
                </div>
              </div>

              {task.status === 'new' ? (
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <CheckCircle2 size={18} /> Accept
                  </button>
                  <button className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-100">
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              ) : (
                <Button className="w-full gap-2">
                  Start Task <ArrowRight size={18} />
                </Button>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button className="text-xs text-primary font-bold flex items-center gap-2 hover:underline">
                <Phone size={12} /> Contact Coordinator
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DriverTasks;
