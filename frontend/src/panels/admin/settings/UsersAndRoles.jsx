import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { 
  UserPlus, 
  Shield, 
  Key, 
  Mail, 
  MoreVertical,
  UserCheck,
  Lock,
  Settings
} from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Mahesh Kumar', email: 'mahesh@mke.com', role: 'admin', status: 'active', lastLogin: '10 mins ago' },
  { id: 2, name: 'Channappa S.', email: 'channappa@mke.com', role: 'manager', status: 'active', lastLogin: '2 hrs ago' },
  { id: 3, name: 'Lokesh B.', email: 'lokesh@mke.com', role: 'billing', status: 'active', lastLogin: 'Yesterday' },
  { id: 4, name: 'Ramu K.', email: 'ramu@mke.com', role: 'driver', status: 'inactive', lastLogin: '3 days ago' },
];

const UsersAndRoles = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-500 font-medium">Manage team access and permission levels.</p>
        </div>
        <Button className="gap-2">
          <UserPlus size={18} /> Invite User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-blue-50/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase">Last Activity</th>
                    <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-primary">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-primary" />
                          <span className="capitalize font-medium">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.status === 'active' ? 'success' : 'gray'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 px-1">Role Permissions</h2>
          {[
            { role: 'Administrator', access: 'Full Access', color: 'bg-primary' },
            { role: 'Manager', access: 'Verify & Manage', color: 'bg-blue-600' },
            { role: 'Billing', access: 'Sales & Invoices', color: 'bg-blue-400' },
            { role: 'Driver', access: 'Trips & Expenses', color: 'bg-blue-200 text-blue-700' },
          ].map((role, i) => (
            <Card key={i} className="hover:border-primary/30 cursor-pointer transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${role.color} flex items-center justify-center text-white`}>
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{role.role}</h3>
                  <p className="text-xs text-gray-500 font-medium">{role.access}</p>
                </div>
              </div>
            </Card>
          ))}
          <Button variant="outline" className="w-full gap-2 text-sm">
            <Settings size={16} /> Advanced Permissions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsersAndRoles;
