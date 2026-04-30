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
  Search
} from 'lucide-react';

const mockVehicles = [
  { 
    id: 1, 
    plate: 'KA-01-AX-1234', 
    model: 'Tata Ace (Chota Hathi)', 
    docs: [
      { type: 'RC', status: 'valid', expiry: '12/10/2030' },
      { type: 'Insurance', status: 'expiring', expiry: '15/05/2026' },
      { type: 'Permit', status: 'valid', expiry: '20/12/2027' },
    ]
  },
  { 
    id: 2, 
    plate: 'KA-01-AX-5678', 
    model: 'Mahindra Bolero Pickup', 
    docs: [
      { type: 'RC', status: 'valid', expiry: '05/08/2032' },
      { type: 'Insurance', status: 'valid', expiry: '30/11/2026' },
      { type: 'Permit', status: 'expired', expiry: '25/04/2026' },
    ]
  },
];

const VehicleDocuments = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Documents</h1>
          <p className="text-gray-500 font-medium">Track RC, Insurance, and Permits for your fleet.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockVehicles.map((vehicle) => (
          <Card key={vehicle.id} padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-primary shadow-sm font-bold">
                  🚛
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-none mb-1">{vehicle.plate}</h3>
                  <p className="text-xs text-gray-500 font-medium">{vehicle.model}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm"><ArrowRight size={16} /></Button>
            </div>
            
            <div className="p-6 space-y-4">
              {vehicle.docs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      doc.status === 'valid' ? 'bg-green-50 text-green-600' : 
                      doc.status === 'expiring' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    )}>
                      {doc.status === 'valid' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{doc.type}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} /> Exp: {doc.expiry}
                      </p>
                    </div>
                  </div>
                  <Badge variant={doc.status === 'valid' ? 'success' : doc.status === 'expiring' ? 'warning' : 'danger'}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button className="text-xs text-primary font-bold hover:underline">Update all documents</button>
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
