import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Trash2,
  ChevronRight,
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  Truck,
  Search,
} from 'lucide-react';
import { useRbacStore, ROLE_TEMPLATES } from '../../../store/rbacStore';
import { toast } from 'react-hot-toast';
import UserCreationForm from './UserCreationForm';

const ROLE_COLORS = {
  RESTAURANT_STAFF: 'bg-green-50 text-green-700 border-green-100',
  FISHMALL_BILLING: 'bg-blue-50 text-blue-700 border-blue-100',
  DRIVER: 'bg-amber-50 text-amber-700 border-amber-100',
  ACCOUNTANT: 'bg-purple-50 text-purple-700 border-purple-100',
  MANAGER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  ADMIN: 'bg-red-50 text-red-700 border-red-100',
  PROCUREMENT_MANAGER: 'bg-olive-50 text-olive-700 border-olive-100',
  BUYER: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  VEHICLE_MANAGER: 'bg-orange-50 text-orange-700 border-orange-100',
  CUSTOM: 'bg-gray-50 text-gray-700 border-gray-100',
};

const PANEL_ICONS = {
  restaurant: Utensils,
  fishmall: ShoppingCart,
  driver: Truck,
  admin: LayoutDashboard,
};

const StatusBadge = ({ status }) => {
  const map = {
    active: { cls: 'bg-green-50 text-green-600 border-green-100', dot: 'bg-green-400', label: 'Active' },
    paused: { cls: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-400', label: 'Paused' },
    revoked: { cls: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-400', label: 'Revoked' },
  };
  const s = map[status] || map.revoked;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const AccessControl = () => {
  const { users, revokeUser, togglePauseUser, deleteUser, fetchUsers, loading } = useRbacStore();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const name = u.fullName || u.name || '';
    const phone = u.phone || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search);
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const activeCount = users.filter((u) => u.status === 'active').length;

  // Role summary cards
  const roleSummary = Object.values(ROLE_TEMPLATES).map((t) => ({
    ...t,
    count: users.filter((u) => u.role === t.id).length,
  }));

  const activePanels = (user) =>
    Object.entries(user.permissions?.panels || {})
      .filter(([, v]) => v)
      .map(([k]) => k);

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase flex items-center gap-3">
              <Shield size={20} className="text-[#6B7550]" />
              Access Control
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Role-Based Access Management • {activeCount} Active Users
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#6B7550] transition-all shadow-sm"
          >
            <UserPlus size={14} /> Create User
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">

        {/* Role Template Summary Cards */}
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Role Templates</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {roleSummary.map((role) => (
              <button
                key={role.id}
                onClick={() => setFilterRole(filterRole === role.id ? 'ALL' : role.id)}
                className={`p-4 bg-white border text-left transition-all hover:border-[#6B7550] ${
                  filterRole === role.id ? 'border-[#6B7550] ring-1 ring-[#6B7550]/20' : 'border-gray-200'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full mb-3 flex items-center justify-center text-white text-[8px] font-black"
                  style={{ backgroundColor: role.color }}
                >
                  {role.label.charAt(0)}
                </div>
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{role.label}</p>
                <p className="text-[8px] text-gray-400 font-bold mt-0.5">{role.count} users</p>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 group">
            <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 py-3 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#6B7550] outline-none transition-all shadow-sm"
            />
          </div>
          {filterRole !== 'ALL' && (
            <button
              onClick={() => setFilterRole('ALL')}
              className="text-[9px] font-bold text-gray-400 hover:text-black uppercase tracking-widest flex items-center gap-2"
            >
              <XCircle size={12} /> Clear Filter
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-[#6B7550]" /> User Registry
            </h3>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{filtered.length} records</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Users size={40} className="mx-auto text-gray-100 mb-4" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Users Found</p>
              <p className="text-[9px] text-gray-300 mt-1 uppercase tracking-widest">Create your first user to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">User</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Phone</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Role</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Panel Access</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 border border-gray-200">
                            {(user.fullName || user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{user.fullName || user.name}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-700">{user.phone}</span>
                          {user.phoneVerified ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : (
                            <XCircle size={12} className="text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border ${ROLE_COLORS[user.role] || ROLE_COLORS.CUSTOM}`}>
                          {ROLE_TEMPLATES[user.role]?.label || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {activePanels(user).map((panel) => {
                            const Icon = PANEL_ICONS[panel];
                            return Icon ? (
                              <div key={panel} title={panel} className="w-6 h-6 bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Icon size={10} className="text-gray-500" />
                              </div>
                            ) : null;
                          })}
                          {activePanels(user).length === 0 && (
                            <span className="text-[8px] text-gray-300 font-bold uppercase">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={async () => {
                              try {
                                await togglePauseUser(user.id || user._id);
                                toast.success(user.status === 'paused' ? `${user.fullName || user.name} reactivated` : `${user.fullName || user.name} paused`);
                              } catch (err) {
                                toast.error('Failed to update status');
                              }
                            }}
                            title={user.status === 'paused' ? 'Reactivate' : 'Pause'}
                            className="w-8 h-8 flex items-center justify-center bg-amber-50 text-amber-500 hover:bg-amber-100 border border-amber-100 transition-all"
                          >
                            <PauseCircle size={13} />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Revoke access for ${user.fullName || user.name}?`)) {
                                try {
                                  await revokeUser(user.id || user._id);
                                  toast.error(`${user.fullName || user.name}'s access revoked`);
                                } catch (err) {
                                  toast.error('Failed to revoke access');
                                }
                              }
                            }}
                            title="Revoke"
                            className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all"
                          >
                            <XCircle size={13} />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Permanently delete ${user.fullName || user.name}?`)) {
                                try {
                                  await deleteUser(user.id || user._id);
                                  toast.error(`${user.fullName || user.name} deleted`);
                                } catch (err) {
                                  toast.error('Failed to delete user');
                                }
                              }
                            }}
                            title="Delete"
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-100 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Active Now', value: users.filter((u) => u.status === 'active').length },
            { label: 'Paused', value: users.filter((u) => u.status === 'paused').length },
            { label: 'Revoked', value: users.filter((u) => u.status === 'revoked').length },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 p-4 shadow-sm">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Creation Form Modal */}
      {showForm && <UserCreationForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default AccessControl;
