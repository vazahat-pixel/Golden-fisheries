import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { 
  Phone, 
  Truck, 
  MapPin, 
  Calendar, 
  UserPlus, 
  MoreVertical,
  Activity,
  FileCheck
} from 'lucide-react';

const mockDrivers = [
  { id: 1, name: 'Ramu K.', status: 'on-trip', vehicle: 'KA-01-AX-1234', phone: '+91 98765 43210', trips: 142, rating: 4.8 },
  { id: 2, name: 'Suresh M.', status: 'idle', vehicle: 'KA-01-AX-5678', phone: '+91 98765 43211', trips: 98, rating: 4.5 },
  { id: 3, name: 'Vicky P.', status: 'on-trip', vehicle: 'KA-01-AX-9012', phone: '+91 98765 43212', trips: 215, rating: 4.9 },
  { id: 4, name: 'Somanna G.', status: 'offline', vehicle: 'KA-01-AX-3456', phone: '+91 98765 43213', trips: 56, rating: 4.2 },
];

const DriverManagement = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver & Logistics</h1>
          <p className="text-gray-500 font-medium">Manage your delivery fleet and trip assignments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileCheck size={18} /> Vehicle Docs
          </Button>
          <Button className="gap-2">
            <UserPlus size={18} /> Add Driver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Drivers" value="12" icon={Activity} />
        <StatCard title="On Trip" value="4" icon={Truck} trend="Active now" />
        <StatCard title="Available" value="3" icon={Activity} variant="success" />
        <StatCard title="Vehicle Alerts" value="2" icon={Calendar} trend="Docs expiring" trendType="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockDrivers.map((driver) => (
          <Card key={driver.id} className="relative group hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center font-bold text-2xl text-primary overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${driver.name}&background=CCE0FF&color=0066FF`} alt={driver.name} />
                </div>
                <div className={clsx(
                  'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white',
                  driver.status === 'on-trip' ? 'bg-blue-500' : driver.status === 'idle' ? 'bg-green-500' : 'bg-gray-400'
                )}></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
                    <Badge variant={driver.status === 'on-trip' ? 'info' : driver.status === 'idle' ? 'success' : 'gray'} className="mt-1">
                      {driver.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-y-3 mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Truck size={14} className="text-primary" />
                    <span>{driver.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Phone size={14} className="text-primary" />
                    <span>{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <MapPin size={14} className="text-primary" />
                    <span>Hassan Route</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Activity size={14} className="text-primary" />
                    <span>{driver.trips} Trips</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button variant="secondary" size="sm" className="flex-1 font-bold">Assign Trip</Button>
              <Button variant="outline" size="sm" className="flex-1 font-bold">View Profile</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DriverManagement;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
