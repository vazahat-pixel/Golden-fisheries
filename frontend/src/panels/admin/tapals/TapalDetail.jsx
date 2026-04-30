import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { 
  ArrowLeft, 
  Printer, 
  Share2, 
  Trash2, 
  Clock, 
  User, 
  Truck, 
  CheckCircle2,
  FileText,
  MessageCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const TapalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data for a purchase tapal
  const tapal = {
    id: id || 'TRP-2026-001',
    type: 'Purchase',
    status: 'pending',
    date: '30 Apr, 2026',
    time: '10:45 AM',
    party: {
      name: 'Ramu Fisheries',
      phone: '+91 98765 43210',
      address: 'Hassan, Karnataka',
      role: 'Farmer'
    },
    products: [
      { name: 'Rohu Fish', qty: '500 KG', rate: '₹80', total: '₹40,000' },
    ],
    logistics: {
      driver: 'Unassigned',
      vehicle: 'N/A',
      tripStatus: 'pending'
    },
    timeline: [
      { status: 'Drafted', time: '10:30 AM', user: 'Mahesh (Admin)' },
      { status: 'Harvest Slip Sent', time: '10:35 AM', user: 'System' },
      { status: 'Farmer Confirmed', time: '10:42 AM', user: 'Farmer' },
    ]
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/tapals')}
            className="p-2 bg-white border border-blue-100 rounded-xl text-gray-500 hover:text-primary transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900">{tapal.id}</h1>
              <Badge variant="warning">{tapal.status}</Badge>
            </div>
            <p className="text-sm text-gray-500 font-medium">{tapal.type} Tapal • {tapal.date} at {tapal.time}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-red-500 hover:bg-red-50 hover:border-red-100">
            <Trash2 size={16} /> Delete
          </Button>
          <Button className="gap-2">
            <Printer size={16} /> Print Slip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Party Info */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <User size={20} />
                </div>
                <h3 className="font-bold text-gray-900">Party Details</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">Edit Details</Button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Name</p>
                <p className="text-base font-bold text-gray-900">{tapal.party.name}</p>
                <Badge variant="info" className="mt-1">{tapal.party.role}</Badge>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Phone</p>
                <p className="text-base font-bold text-gray-900">{tapal.party.phone}</p>
                <button className="text-xs text-primary font-bold flex items-center gap-1 mt-1 hover:underline">
                  <MessageCircle size={12} /> Send WhatsApp
                </button>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Address</p>
                <p className="text-sm font-medium text-gray-700">{tapal.party.address}</p>
              </div>
            </div>
          </Card>

          {/* Products Info */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Product Summary</h3>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase">Product</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase text-right">Qty</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase text-right">Rate</th>
                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tapal.products.map((p, i) => (
                    <tr key={i}>
                      <td className="py-4 text-sm font-bold text-gray-900">{p.name}</td>
                      <td className="py-4 text-sm font-medium text-gray-700 text-right">{p.qty}</td>
                      <td className="py-4 text-sm font-medium text-gray-700 text-right">{p.rate}</td>
                      <td className="py-4 text-sm font-black text-primary text-right">{p.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary/10">
                    <td colSpan={3} className="pt-6 text-base font-bold text-gray-900">Grand Total</td>
                    <td className="pt-6 text-xl font-black text-primary text-right">{tapal.products[0].total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Logistics Tracking */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Logistics</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4 border-2 border-dashed border-gray-200">
                  <Truck size={32} />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">No driver assigned</p>
                <p className="text-xs text-gray-500 mb-4 px-8 leading-relaxed">Assign a driver to start tracking the trip and fuel expenses.</p>
                <Button variant="primary" size="sm" className="w-full">Assign Driver Now</Button>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card padding="none" className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-50">
                {tapal.timeline.map((event, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none mb-1">{event.status}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{event.time} • {event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-between p-6 bg-white border border-blue-100 rounded-[20px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Ready for Stocking?</p>
            <p className="text-xs text-gray-500">Confirming will automatically add items to inventory.</p>
          </div>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">Approve & Add to Stock</Button>
      </div>
    </div>
  );
};

export default TapalDetail;
