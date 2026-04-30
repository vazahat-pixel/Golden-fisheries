import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { 
  Truck, 
  MapPin, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const mockTrips = [
  { id: 'TRP-101', driver: 'Ramu K.', vehicle: 'KA-01-AX-1234', route: 'Hassan &rarr; Mall', status: 'in-progress', expense: '₹1,200', start: '10:00 AM' },
  { id: 'TRP-102', driver: 'Vicky P.', vehicle: 'KA-01-AX-9012', route: 'Farm A &rarr; Admin', status: 'completed', expense: '₹850', start: '08:30 AM' },
];

const pendingExpenses = [
  { id: 'EXP-501', driver: 'Ramu K.', trip: 'TRP-101', type: 'Fuel', amount: '₹1,200', date: 'Today', proof: true },
  { id: 'EXP-502', driver: 'Suresh M.', trip: 'TRP-098', type: 'Toll', amount: '₹150', date: 'Yesterday', proof: true },
  { id: 'EXP-503', driver: 'Vicky P.', trip: 'TRP-102', type: 'RTO', amount: '₹500', date: 'Today', proof: false },
];

const TripsAndExpenses = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Trips & Expense Review</h1>
        <p className="text-gray-500 font-medium">Monitor active trips and approve driver expenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Active Trips" value="4" icon={Truck} trend="2 arriving soon" />
        <StatCard title="Pending Expenses" value="₹3,450" icon={IndianRupee} trend="7 requests" trendType="down" />
        <StatCard title="Fuel Efficiency" value="12.5 km/L" icon={AlertCircle} trend="+0.5 this week" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Trips Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="text-primary" size={20} /> Active Trips
            </h2>
            <Button variant="ghost" size="sm" className="text-primary font-bold">View History</Button>
          </div>
          
          {mockTrips.map((trip) => (
            <Card key={trip.id} className="border-l-4 border-l-primary" padding="none">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                      <Truck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{trip.id}</p>
                      <p className="text-xs text-gray-500 font-medium">{trip.driver} • {trip.vehicle}</p>
                    </div>
                  </div>
                  <Badge variant={trip.status === 'completed' ? 'success' : 'primary'}>
                    {trip.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl mb-4 border border-blue-50">
                  <MapPin size={14} className="text-primary" />
                  <span className="text-sm font-bold text-gray-700">{trip.route}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase">
                  <div className="flex items-center gap-1">
                    <Clock size={12} /> Started {trip.start}
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    Current Expense: {trip.expense}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="outline" size="sm">Track GPS</Button>
                <Button size="sm">Manage Trip</Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Expense Review Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <IndianRupee className="text-amber-600" size={20} /> Expense Review
            </h2>
            <Button variant="ghost" size="sm" className="text-primary font-bold">All Requests</Button>
          </div>

          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-blue-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-blue-900 uppercase">Driver / Trip</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-blue-900 uppercase">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-blue-900 uppercase">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-blue-900 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{exp.driver}</p>
                        <p className="text-[10px] text-primary font-bold">{exp.trip}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="gray">{exp.type}</Badge>
                        {exp.proof && <span className="ml-2 text-[10px] text-green-500 font-bold">✓ PDF</span>}
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">{exp.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all">
                            <CheckCircle2 size={16} />
                          </button>
                          <button className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 font-medium">Total pending for today: ₹1,850</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripsAndExpenses;
