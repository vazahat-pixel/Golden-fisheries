import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Plus,
  ArrowRight,
  ShieldCheck,
  Search,
  Truck,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const mockVehicles = [
  { 
    id: 1, 
    plate: 'KA-01-AX-1234', 
    model: 'TATA ACE (CHOTA HATHI)', 
    docs: [
      { type: 'RC', status: 'VALID', expiry: '12/10/2030' },
      { type: 'INSURANCE', status: 'EXPIRING', expiry: '15/05/2026' },
      { type: 'PERMIT', status: 'VALID', expiry: '20/12/2027' },
    ]
  },
  { 
    id: 2, 
    plate: 'KA-01-AX-5678', 
    model: 'MAHINDRA BOLERO PICKUP', 
    docs: [
      { type: 'RC', status: 'VALID', expiry: '05/08/2032' },
      { type: 'INSURANCE', status: 'VALID', expiry: '30/11/2026' },
      { type: 'PERMIT', status: 'EXPIRED', expiry: '25/04/2026' },
    ]
  },
];

const VehicleDocuments = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif italic font-black text-black tracking-tight">Vehicle <span className="text-accent-olive">Documents.</span></h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-3">FLEET COMPLIANCE • RC & INSURANCE TRACKING • PERMIT LOGS</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="gap-4 text-[10px] font-black border-card-border uppercase tracking-widest px-6 shadow-subtle transition-all active:scale-95"
            onClick={() => toast.success('Viewing renewal history...')}
          >
            <History size={14} /> HISTORY
          </Button>
          <Button 
            className="gap-4 text-[10px] font-black uppercase tracking-widest px-6 shadow-md transition-all active:scale-95"
            onClick={() => toast.success('Add Vehicle Modal')}
          >
            <Plus size={14} /> ADD VEHICLE
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {mockVehicles.map((vehicle) => (
          <Card key={vehicle.id} padding="none" className="border border-card-border shadow-subtle overflow-hidden bg-white hover:shadow-wapixo transition-all duration-300">
            <div className="p-4 border-b border-card-border bg-olive-100/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-card-border flex items-center justify-center shadow-md">
                  <Truck size={24} className="text-accent-olive" />
                </div>
                <div>
                  <h3 className="font-serif italic font-black text-black tracking-tight text-2xl">{vehicle.plate}</h3>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{vehicle.model}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-12 h-12 bg-white border-card-border shadow-subtle hover:bg-black hover:text-white"
                onClick={() => toast.success(`Viewing details for ${vehicle.plate}`)}
              >
                <ArrowRight size={24} />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              {vehicle.docs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-card-border hover:bg-olive-50/50 transition-all shadow-subtle group">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      'w-12 h-12 flex items-center justify-center shadow-sm border transition-all group-hover:scale-105',
                      doc.status === 'VALID' ? 'bg-black text-white border-black' : 
                      doc.status === 'EXPIRING' ? 'bg-olive-100 text-black border-card-border' : 'bg-red-600 text-white border-red-600'
                    )}>
                      {doc.status === 'VALID' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-black uppercase tracking-widest">{doc.type}</p>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest flex items-center gap-4 mt-1">
                        <Calendar size={12} className="text-accent-olive" /> EXP: {doc.expiry}
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'VALID' ? 'success' : doc.status === 'EXPIRING' ? 'warning' : 'danger'} className="uppercase text-[9px] font-black border border-card-border shadow-sm px-4 py-3">
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-black border-t border-black text-center">
              <button 
                className="text-[11px] text-white/70 hover:text-white font-black uppercase tracking-[0.3em] transition-colors"
                onClick={() => toast.success(`Updating documents for ${vehicle.plate}...`)}
              >
                UPDATE ALL DOCUMENTS
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleDocuments;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
