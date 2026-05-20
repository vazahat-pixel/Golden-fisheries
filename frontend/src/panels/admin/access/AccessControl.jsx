import React, { useState, useEffect } from 'react';
import { useRbacStore, ROLE_TEMPLATES, MODULE_META } from '../../../store/rbacStore';
import { Shield, Users, Save, CheckCircle, XCircle, Info, UserCheck, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AccessControl = () => {
  const { users, fetchUsers, updateUser, loading } = useRbacStore();
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'users'
  
  // Role permissions editing state
  const [selectedRole, setSelectedRole] = useState('MANAGER');
  const [rolePermissions, setRolePermissions] = useState({});

  // User permissions editing state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userPermissions, setUserPermissions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load active template permissions when selected role changes
  useEffect(() => {
    if (ROLE_TEMPLATES[selectedRole]) {
      // Create a deep copy of permissions
      setRolePermissions(JSON.parse(JSON.stringify(ROLE_TEMPLATES[selectedRole].permissions)));
    }
  }, [selectedRole]);

  // Load active user permissions when selected user changes
  useEffect(() => {
    const userObj = users.find(u => u.id === selectedUserId || u._id === selectedUserId);
    if (userObj) {
      setUserPermissions(JSON.parse(JSON.stringify(userObj.permissions || { panels: {}, modules: {} })));
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sync selected user when users load if none is selected
  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id || users[0]._id);
    }
  }, [users, selectedUserId]);

  const handleRolePermissionToggle = (moduleKey, action) => {
    setRolePermissions(prev => {
      const copy = { ...prev };
      if (!copy.modules) copy.modules = {};
      if (!copy.modules[moduleKey]) {
        copy.modules[moduleKey] = { read: false, write: false, delete: false };
      }
      
      // Toggle
      const val = !copy.modules[moduleKey][action];
      copy.modules[moduleKey][action] = val;
      
      // Auto-toggle read if write or delete is toggled
      if ((action === 'write' || action === 'delete') && val) {
        copy.modules[moduleKey].read = true;
      }
      
      // Auto-enable panel access
      if (!copy.panels) copy.panels = {};
      copy.panels.admin = true;

      return copy;
    });
  };

  const handleUserPermissionToggle = (moduleKey, action) => {
    setUserPermissions(prev => {
      const copy = { ...prev };
      if (!copy.modules) copy.modules = {};
      if (!copy.modules[moduleKey]) {
        copy.modules[moduleKey] = { read: false, write: false, delete: false };
      }
      
      const val = !copy.modules[moduleKey][action];
      copy.modules[moduleKey][action] = val;
      
      if ((action === 'write' || action === 'delete') && val) {
        copy.modules[moduleKey].read = true;
      }
      
      if (!copy.panels) copy.panels = {};
      copy.panels.admin = true;
      
      return copy;
    });
  };

  const saveRolePermissions = () => {
    // Save to the in-memory static template object
    if (ROLE_TEMPLATES[selectedRole]) {
      ROLE_TEMPLATES[selectedRole].permissions = JSON.parse(JSON.stringify(rolePermissions));
      
      // Update all users who have this role to inherit new permissions immediately
      const matchingUsers = users.filter(u => u.role === selectedRole);
      
      toast.promise(
        Promise.all(matchingUsers.map(u => 
          updateUser(u.id || u._id, { permissions: rolePermissions })
        )),
        {
          loading: `Updating all ${ROLE_TEMPLATES[selectedRole].label} accounts...`,
          success: `Successfully updated permissions for all ${ROLE_TEMPLATES[selectedRole].label}s!`,
          error: 'Failed to update some user accounts.'
        }
      );
    }
  };

  const saveUserPermissions = () => {
    const userObj = users.find(u => u.id === selectedUserId || u._id === selectedUserId);
    if (!userObj) return;

    toast.promise(
      updateUser(selectedUserId, { permissions: userPermissions }),
      {
        loading: `Updating permissions for ${userObj.name}...`,
        success: `Successfully saved custom permissions for ${userObj.name}!`,
        error: 'Failed to update user permissions.'
      }
    );
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleLabel = (roleId) => {
    return ROLE_TEMPLATES[roleId]?.label || roleId;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Shield className="text-brand-yellow" size={26} /> Access Control Dashboard
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Configure dynamic Role-Based Access Control (RBAC) permissions across administrative departments.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#F5F5EC] p-1 border border-card-border">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-[#6A7051] text-white'
                : 'text-text-secondary hover:text-brand-olive'
            }`}
          >
            <Key size={14} /> Role Templates
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#6A7051] text-white'
                : 'text-text-secondary hover:text-brand-olive'
            }`}
          >
            <Users size={14} /> User Accounts
          </button>
        </div>
      </div>

      {activeTab === 'roles' ? (
        /* ROLE TEMPLATES TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Role list */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#6A7051] mb-2">Administrative Roles</h3>
            <div className="space-y-2.5">
              {Object.keys(ROLE_TEMPLATES)
                .filter(key => ROLE_TEMPLATES[key].permissions.panels.admin) // Only show admin panel roles
                .map(key => {
                  const role = ROLE_TEMPLATES[key];
                  const isSelected = selectedRole === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedRole(key)}
                      className={`p-4 border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected 
                          ? 'border-[#6A7051] bg-[#6A7051]/5 border-l-4 border-l-brand-yellow' 
                          : 'border-card-border bg-white hover:border-[#6A7051]/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`text-xs font-black uppercase tracking-wider transition-colors ${
                          isSelected ? 'text-[#6A7051]' : 'text-text-primary group-hover:text-[#6A7051]'
                        }`}>
                          {role.label}
                        </p>
                        <p className="text-[10px] text-text-muted mt-1 truncate max-w-xs">{role.description}</p>
                      </div>
                      <div className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.color }}></div>
                    </div>
                  );
                })}
            </div>
            
            <div className="bg-[#F9FAFB] p-4 border border-card-border flex items-start gap-3">
              <Info size={16} className="text-brand-olive shrink-0 mt-0.5" />
              <p className="text-[10px] text-text-secondary leading-normal">
                Modifying role templates instantly propagates to all users assigned to that role. Users inherit updated layouts upon saving.
              </p>
            </div>
          </div>

          {/* Right panel: Module checklist */}
          <div className="lg:col-span-8 bg-white border border-card-border p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-card-border pb-4 mb-6 gap-4">
              <div>
                <h3 className="text-base font-black text-brand-olive uppercase tracking-tight">
                  Permissions Grid: {ROLE_TEMPLATES[selectedRole]?.label}
                </h3>
                <p className="text-[11px] text-text-secondary">Toggle read, write, and delete rights per functional ERP module.</p>
              </div>
              <button
                onClick={saveRolePermissions}
                disabled={loading}
                className="bg-[#C5A021] text-brand-dark px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-[0.98] transition-all flex items-center gap-2 self-start sm:self-center"
              >
                <Save size={14} /> Save Template
              </button>
            </div>

            {/* Grid checklist */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-card-border bg-[#F5F5EC]/50">
                    <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-text-primary">Module</th>
                    <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-wider text-text-primary">Read</th>
                    <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-wider text-text-primary">Write</th>
                    <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-wider text-text-primary">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-sm">
                  {MODULE_META
                    .filter(m => m.panel === 'Admin') // Show admin modules
                    .map(m => {
                      const modPerms = rolePermissions.modules?.[m.key] || { read: false, write: false, delete: false };
                      return (
                        <tr key={m.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <p className="text-xs font-black text-brand-olive uppercase tracking-wider">{m.label}</p>
                            <p className="text-[9px] text-text-muted mt-0.5">Key ID: {m.key}</p>
                          </td>
                          {/* Read Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={modPerms.read}
                                onChange={() => handleRolePermissionToggle(m.key, 'read')}
                                className="w-4 h-4 text-brand-olive bg-gray-100 border-gray-300 rounded focus:ring-brand-yellow focus:ring-2"
                              />
                            </label>
                          </td>
                          {/* Write Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={modPerms.write}
                                onChange={() => handleRolePermissionToggle(m.key, 'write')}
                                className="w-4 h-4 text-brand-olive bg-gray-100 border-gray-300 rounded focus:ring-brand-yellow focus:ring-2"
                              />
                            </label>
                          </td>
                          {/* Delete Checkbox */}
                          <td className="py-4 px-4 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={modPerms.delete}
                                onChange={() => handleRolePermissionToggle(m.key, 'delete')}
                                className="w-4 h-4 text-brand-olive bg-gray-100 border-gray-300 rounded focus:ring-brand-yellow focus:ring-2"
                              />
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* USER ACCOUNTS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: User List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#6A7051]">Admin Users</h3>
              
              {/* Search user */}
              <input
                type="text"
                placeholder="Search name, phone or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-card-border px-4 py-2.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const isSelected = selectedUserId === u.id || selectedUserId === u._id;
                  const isSuspended = u.status === 'revoked' || u.status === 'paused';
                  return (
                    <div
                      key={u.id || u._id}
                      onClick={() => setSelectedUserId(u.id || u._id)}
                      className={`p-3.5 border transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden ${
                        isSelected 
                          ? 'border-[#6A7051] bg-[#6A7051]/5 border-l-4 border-l-brand-yellow' 
                          : 'border-card-border bg-white hover:border-[#6A7051]/40'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-none bg-brand-olive/10 text-brand-olive flex items-center justify-center font-black text-xs shrink-0">
                        {u.name?.substring(0, 2).toUpperCase() || 'US'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black uppercase tracking-tight leading-tight truncate ${
                          isSelected ? 'text-[#6A7051]' : 'text-text-primary'
                        }`}>
                          {u.name}
                        </p>
                        <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold mt-0.5">{getRoleLabel(u.role)}</p>
                      </div>
                      
                      {/* Suspended/Active indicator */}
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0 ${
                        isSuspended ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {u.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-text-muted bg-white border border-card-border">
                  No admin users found matching your search.
                </div>
              )}
            </div>
          </div>

          {/* Right panel: User permissions customize */}
          <div className="lg:col-span-8 bg-white border border-card-border p-6 shadow-sm">
            {selectedUserId && users.find(u => u.id === selectedUserId || u._id === selectedUserId) ? (
              (() => {
                const userObj = users.find(u => u.id === selectedUserId || u._id === selectedUserId);
                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-card-border pb-4 mb-6 gap-4">
                      <div>
                        <h3 className="text-base font-black text-brand-olive uppercase tracking-tight flex items-center gap-2">
                          <UserCheck size={18} className="text-brand-yellow" /> Customize Permissions: {userObj.name}
                        </h3>
                        <p className="text-[11px] text-text-secondary">
                          Customize access specifically for this account. Inherits default role values if unchanged.
                        </p>
                      </div>
                      <button
                        onClick={saveUserPermissions}
                        disabled={loading}
                        className="bg-[#C5A021] text-brand-dark px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 active:scale-[0.98] transition-all flex items-center gap-2 self-start sm:self-center"
                      >
                        <Save size={14} /> Save User Access
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-card-border bg-[#F5F5EC]/50">
                            <th className="py-3 px-4 text-xs font-black uppercase tracking-wider text-text-primary">Module</th>
                            <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-wider text-text-primary">Read</th>
                            <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-wider text-text-primary">Write</th>
                            <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-wider text-text-primary">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border text-sm">
                          {MODULE_META
                            .filter(m => m.panel === 'Admin')
                            .map(m => {
                              const modPerms = userPermissions.modules?.[m.key] || { read: false, write: false, delete: false };
                              return (
                                <tr key={m.key} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4 px-4">
                                    <p className="text-xs font-black text-brand-olive uppercase tracking-wider">{m.label}</p>
                                    <p className="text-[9px] text-text-muted mt-0.5">Key ID: {m.key}</p>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={modPerms.read}
                                        onChange={() => handleUserPermissionToggle(m.key, 'read')}
                                        className="w-4 h-4 text-brand-olive bg-gray-100 border-gray-300 rounded focus:ring-brand-yellow focus:ring-2"
                                      />
                                    </label>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={modPerms.write}
                                        onChange={() => handleUserPermissionToggle(m.key, 'write')}
                                        className="w-4 h-4 text-brand-olive bg-gray-100 border-gray-300 rounded focus:ring-brand-yellow focus:ring-2"
                                      />
                                    </label>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={modPerms.delete}
                                        onChange={() => handleUserPermissionToggle(m.key, 'delete')}
                                        className="w-4 h-4 text-brand-olive bg-gray-100 border-gray-300 rounded focus:ring-brand-yellow focus:ring-2"
                                      />
                                    </label>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="p-12 text-center text-xs text-text-muted">
                Select a user from the list to manage custom permissions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
