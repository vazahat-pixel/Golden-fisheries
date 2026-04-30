import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Truck, 
  CheckCircle2,
  XCircle,
  FileText,
  Download
} from 'lucide-react';

const mockTapals = [
  { id: 'TRP-2026-001', type: 'Purchase', party: 'Ramu Fisheries', qty: '500 KG', amount: '₹40,000', status: 'pending', date: '30/04/2026', driver: 'Unassigned' },
  { id: 'TRP-2026-002', type: 'Sale', party: 'Golden Restaurant', qty: '120 KG', amount: '₹12,500', status: 'confirmed', date: '30/04/2026', driver: 'Suresh M.' },
  { id: 'TRP-2026-003', type: 'Purchase', party: 'Deep Sea Farms', qty: '800 KG', amount: '₹65,000', status: 'delivered', date: '29/04/2026', driver: 'Vicky P.' },
  { id: 'TRP-2026-004', type: 'Sale', party: 'Channappa Buyer', qty: '250 KG', amount: '₹22,000', status: 'in-transit', date: '30/04/2026', driver: 'Ramu K.' },
  { id: 'TRP-2026-005', type: 'Purchase', party: 'Coastal Harvest', qty: '450 KG', amount: '₹35,000', status: 'pending', date: '30/04/2026', driver: 'Unassigned' },
];

const TapalList = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'in-transit': return 'primary';
      case 'delivered': return 'success';
      case 'rejected': return 'danger';
      default: return 'gray';
    }
  };

  const filteredTapals = mockTapals.filter(tapal => {
    const matchesFilter = filter === 'all' || tapal.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      tapal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tapal.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tapal.driver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tapal System</h1>
          <p className="text-gray-500 font-medium">Manage all your purchase and sales slips in one place.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={18} /> Export
          </Button>
          <Link to="/admin/tapals/purchase/new">
            <Button className="gap-2">
              <Plus size={18} /> Create Tapal
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6" padding="none">
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex bg-blue-50 p-1 rounded-xl w-fit">
            {['all', 'purchase', 'sale'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={clsx(
                  'px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all',
                  filter === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by ID, Party or Driver..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-blue-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <Button variant="secondary" size="md" className="gap-2">
              <Filter size={18} /> Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50/50">
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Tapal Info</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Party / Client</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Qty / Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTapals.length > 0 ? (
                filteredTapals.map((tapal) => (
                  <tr key={tapal.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                          tapal.type === 'Purchase' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        )}>
                          {tapal.type === 'Purchase' ? '📥' : '📤'}
                        </div>
                        <div>
                          <Link to={`/admin/tapals/${tapal.id}`}>
                            <p className="text-sm font-bold text-primary hover:underline cursor-pointer">{tapal.id}</p>
                          </Link>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{tapal.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{tapal.party}</p>
                      <p className="text-xs text-gray-500 font-medium">{tapal.type} Tapal</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{tapal.qty}</p>
                      <p className="text-xs text-primary font-bold">{tapal.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className={tapal.driver === 'Unassigned' ? 'text-gray-300' : 'text-primary'} />
                        <span className={clsx(
                          'text-xs font-medium',
                          tapal.driver === 'Unassigned' ? 'text-gray-400 italic' : 'text-gray-700'
                        )}>
                          {tapal.driver}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(tapal.status)}>
                        {tapal.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Download Bill">
                          <FileText size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">
                    No tapals found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-b-[var(--radius-card)]">
          <p className="text-sm text-gray-500 font-medium">
            Showing {filteredTapals.length} of {mockTapals.length} tapals
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TapalList;

// Helper to use clsx in the same file since it was used in the component
function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
