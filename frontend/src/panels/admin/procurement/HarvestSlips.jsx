import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { 
  Plus, 
  Search, 
  Sprout, 
  CheckCircle, 
  Clock, 
  MessageCircle,
  MoreVertical
} from 'lucide-react';

const mockSlips = [
  { id: 'HSL-001', farmer: 'Ramu Fisheries', product: 'Rohu', qty: '500 KG', status: 'confirmed', date: '30/04/26' },
  { id: 'HSL-002', farmer: 'Deep Sea Farms', product: 'Prawns', qty: '200 KG', status: 'pending', date: '30/04/26' },
  { id: 'HSL-003', farmer: 'Coastal Harvest', product: 'Catla', qty: '450 KG', status: 'confirmed', date: '29/04/26' },
];

const HarvestSlips = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harvest Slips</h1>
          <p className="text-gray-500 font-medium">Digital slips sent to farmers via WhatsApp.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} /> New Harvest Slip
        </Button>
      </div>

      <Card className="mb-8" padding="none">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search slips, farmers..." 
              className="w-full bg-blue-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50/50">
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Slip ID</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Farmer</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Quantity</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockSlips.map((slip) => (
                <tr key={slip.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-primary">{slip.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{slip.farmer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{slip.product}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{slip.qty}</td>
                  <td className="px-6 py-4">
                    <Badge variant={slip.status === 'confirmed' ? 'success' : 'warning'}>
                      {slip.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <MessageCircle size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Sprout className="text-primary" size={24} /> Farmer Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Ramu Fisheries', location: 'Hassan', phone: '+91 98765 43210', active: true },
          { name: 'Deep Sea Farms', location: 'Mangalore', phone: '+91 98765 43211', active: true },
          { name: 'Coastal Harvest', location: 'Udupi', phone: '+91 98765 43212', active: false },
        ].map((farmer, i) => (
          <Card key={i} className="hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-xl">
                🌾
              </div>
              <Badge variant={farmer.active ? 'success' : 'gray'}>
                {farmer.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{farmer.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{farmer.location}</p>
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-6">
              <MessageCircle size={14} className="text-green-500" /> {farmer.phone}
            </div>
            <Button variant="outline" size="sm" className="w-full">View History</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HarvestSlips;
