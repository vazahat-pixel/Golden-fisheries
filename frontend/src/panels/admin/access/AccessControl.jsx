import React, { useState, useEffect, useMemo } from 'react';
import {
  useRbacStore,
  ROLE_TEMPLATES,
  ERP_MANAGEABLE_ROLES,
  isAdminErpTemplateRole,
  modulesForRole,
} from '../../../store/rbacStore';
import PermissionToggle from '../../../components/rbac/PermissionToggle';
import { generatePassword } from '../../../utils/generatePassword';
import {
  Shield,
  Users,
  Save,
  Info,
  Key,
  UserPlus,
  RefreshCw,
  Copy,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const emptyPerms = () => ({ panels: { admin: true }, modules: {} });

/** What admin should share after creating a user (OTP vs password). */
const ROLE_LOGIN_GUIDE = {
  BUYER: {
    loginType: 'Phone + password (Admin Login)',
    loginPath: '/auth/admin',
    adminPath: '/auth/admin',
    createHint:
      'Share phone + password (Gen). Buyer opens Admin Login on phone or laptop — same as other field staff.',
    shareOtp: false,
  },
  DRIVER: {
    loginType: 'OTP only (mobile)',
    loginPath: '/auth/driver',
    adminPath: null,
    createHint:
      'Share mobile after you approve driver in Logistics → Drivers. User opens Driver Login → SMS OTP. No public signup.',
    shareOtp: true,
  },
  PROCUREMENT_MANAGER: {
    loginType: 'Phone + password',
    loginPath: '/auth/admin',
    adminPath: '/auth/admin',
    createHint: 'Share phone + password (Gen). User signs in at Admin Login — mobile procurement menus.',
    shareOtp: false,
  },
  VEHICLE_MANAGER: {
    loginType: 'Phone + password',
    loginPath: '/auth/admin',
    adminPath: '/auth/admin',
    createHint: 'Share phone + password (Gen). Admin Login on phone or desktop.',
    shareOtp: false,
  },
  SUPER_ADMIN: {
    loginType: 'Phone + password',
    loginPath: '/auth/admin',
    adminPath: '/auth/admin',
    createHint: 'Full ERP access. Share phone + password securely.',
    shareOtp: false,
  },
};

function getRoleLoginGuide(role) {
  return (
    ROLE_LOGIN_GUIDE[role] || {
      loginType: 'Phone + password',
      loginPath: '/auth/admin',
      adminPath: '/auth/admin',
      createHint: 'Share phone + password. User signs in at Admin Login.',
      shareOtp: false,
    }
  );
}

const togglePermission = (prev, moduleKey, action) => {
  const copy = JSON.parse(JSON.stringify(prev || emptyPerms()));
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
  if (copy.panels.admin !== false) copy.panels.admin = true;
  return copy;
};

const AccessControl = () => {
  const { users, fetchUsers, createUser, updateUser, loading } = useRbacStore();
  const [mainTab, setMainTab] = useState('users');

  // --- User account state ---
  const [mode, setMode] = useState('edit');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('PROCUREMENT_MANAGER');
  const [formPassword, setFormPassword] = useState('');
  const [userPermissions, setUserPermissions] = useState(emptyPerms());
  const [searchQuery, setSearchQuery] = useState('');
  const [lastCredentials, setLastCredentials] = useState(null);

  // --- Role template state ---
  const [selectedRole, setSelectedRole] = useState('VEHICLE_MANAGER');
  const [rolePermissions, setRolePermissions] = useState({});

  const adminRoleKeys = useMemo(
    () => Object.keys(ROLE_TEMPLATES).filter(isAdminErpTemplateRole),
    []
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (ROLE_TEMPLATES[selectedRole]) {
      setRolePermissions(JSON.parse(JSON.stringify(ROLE_TEMPLATES[selectedRole].permissions)));
    }
  }, [selectedRole]);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId && mode === 'edit') {
      setSelectedUserId(users[0].id || users[0]._id);
    }
  }, [users, selectedUserId, mode]);

  useEffect(() => {
    if (mode !== 'edit' || !selectedUserId) return;
    const userObj = users.find((u) => (u.id || u._id) === selectedUserId);
    if (!userObj) return;
    setFormName(userObj.name || userObj.fullName || '');
    setFormPhone(userObj.phone || '');
    setFormRole(userObj.role || 'PROCUREMENT_MANAGER');
    setFormPassword('');
    setUserPermissions(JSON.parse(JSON.stringify(userObj.permissions || emptyPerms())));
  }, [selectedUserId, users, mode]);

  const applyRoleTemplateToUser = () => {
    const t = ROLE_TEMPLATES[formRole];
    if (!t) return;
    setUserPermissions(JSON.parse(JSON.stringify(t.permissions)));
    toast.success(`Applied ${t.label} default screens`);
  };

  const resetNewUserForm = () => {
    setMode('create');
    setSelectedUserId('');
    setFormName('');
    setFormPhone('');
    setFormRole('PROCUREMENT_MANAGER');
    setFormPassword(generatePassword());
    setUserPermissions(JSON.parse(JSON.stringify(ROLE_TEMPLATES.PROCUREMENT_MANAGER?.permissions || emptyPerms())));
  };

  const handleCreateUser = async () => {
    const phone = formPhone.replace(/\D/g, '').slice(-10);
    if (!formName.trim() || phone.length !== 10) {
      toast.error('Name and valid 10-digit phone required');
      return;
    }
    if (!formPassword || formPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await createUser({
        name: formName.trim(),
        phone,
        role: formRole,
        password: formPassword,
        permissions: userPermissions,
      });
      setLastCredentials({ phone, password: formPassword, name: formName.trim(), role: formRole });
      toast.success('Account created — share login ID & password with user');
      setMode('edit');
      await fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'Create failed');
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUserId) return;
    const payload = { permissions: userPermissions, role: formRole, name: formName.trim() };
    if (formPassword && formPassword.length >= 6) {
      payload.password = formPassword;
    }
    try {
      await updateUser(selectedUserId, payload);
      toast.success('User updated');
      if (formPassword) setFormPassword('');
    } catch (err) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const saveRoleTemplate = () => {
    if (!ROLE_TEMPLATES[selectedRole]) return;
    ROLE_TEMPLATES[selectedRole].permissions = JSON.parse(JSON.stringify(rolePermissions));
    const matching = users.filter((u) => u.role === selectedRole);
    toast.promise(
      Promise.all(matching.map((u) => updateUser(u.id || u._id, { permissions: rolePermissions }))),
      {
        loading: `Updating ${ROLE_TEMPLATES[selectedRole].label} users…`,
        success: 'Role template saved for all users with this role',
        error: 'Some users failed to update',
      }
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      ERP_MANAGEABLE_ROLES.includes(u.role) &&
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const userModules = modulesForRole(formRole);
  const templateModules = modulesForRole(selectedRole);

  const loginGuide = useMemo(() => getRoleLoginGuide(formRole), [formRole]);

  const copyCredentials = () => {
    if (!lastCredentials) return;
    const guide = getRoleLoginGuide(lastCredentials.role);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const roleLabel = ROLE_TEMPLATES[lastCredentials.role]?.label || lastCredentials.role;
    let text = `Golden Fisheries — ${roleLabel}\nMobile (login ID): ${lastCredentials.phone}\n`;

    if (guide.shareOtp) {
      text += `Login URL: ${origin}${guide.loginPath}\n`;
      text += `Steps: Open link → Send OTP → enter code from SMS.\n`;
      if (guide.adminPath) {
        text += `Laptop (optional): ${origin}${guide.adminPath} — password: ${lastCredentials.password}\n`;
      }
    } else {
      text += `Login URL: ${origin}${guide.loginPath}\n`;
      text += `Password: ${lastCredentials.password}\n`;
    }

    navigator.clipboard?.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Shield className="text-brand-yellow" size={26} /> Access &amp; users
          </h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            <strong>Step 1 — User accounts:</strong> phone = login ID; Buyer/Driver get OTP links; office roles get phone + password (Gen).
            <br />
            <strong>Step 2 — Role templates (optional):</strong> default permissions for each job title — applied when you click &quot;Use role defaults&quot;.
          </p>
        </div>
        <div className="flex bg-[#F5F5EC] p-1 border border-card-border shrink-0">
          <button
            type="button"
            onClick={() => setMainTab('users')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
              mainTab === 'users' ? 'bg-[#6A7051] text-white' : 'text-text-secondary'
            }`}
          >
            <Users size={14} /> 1. User accounts
          </button>
          <button
            type="button"
            onClick={() => setMainTab('templates')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
              mainTab === 'templates' ? 'bg-[#6A7051] text-white' : 'text-text-secondary'
            }`}
          >
            <Key size={14} /> 2. Role templates
          </button>
        </div>
      </div>

      {mainTab === 'users' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#6A7051]">Staff list</h3>
              <button
                type="button"
                onClick={resetNewUserForm}
                className="text-[10px] font-black uppercase bg-[#C5A021] text-brand-dark px-3 py-1.5 flex items-center gap-1 hover:bg-yellow-500"
              >
                <UserPlus size={12} /> New account
              </button>
            </div>
            <input
              type="text"
              placeholder="Search name, phone, role…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border px-4 py-2.5 text-xs focus:ring-1 focus:ring-[#6A7051] outline-none"
            />
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredUsers.map((u) => {
                const id = u.id || u._id;
                const isSelected = mode === 'edit' && selectedUserId === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => {
                      setMode('edit');
                      setSelectedUserId(id);
                    }}
                    className={`w-full text-left p-3.5 border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#6A7051] bg-[#6A7051]/5 border-l-4 border-l-brand-yellow'
                        : 'border-card-border bg-white hover:border-[#6A7051]/40'
                    }`}
                  >
                    <div className="w-8 h-8 bg-brand-olive/10 text-brand-olive flex items-center justify-center font-black text-xs shrink-0">
                      {(u.name || 'US').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase truncate">{u.name}</p>
                      <p className="text-[9px] text-text-muted font-bold">{u.phone}</p>
                      <p className="text-[9px] text-[#6A7051] font-black uppercase">
                        {ROLE_TEMPLATES[u.role]?.label || u.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-8 space-y-5">
            <div className="bg-white border border-card-border p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase text-brand-olive tracking-tight mb-1">
                {mode === 'create' ? 'Create new login' : 'Edit account'}
              </h3>
              <p className="text-[11px] text-text-secondary mb-3">
                Login ID = <strong>10-digit phone</strong>. Sign-in method depends on role (see box below).
              </p>

              <div className="mb-4 p-3 rounded-lg border border-[#6A7051]/20 bg-[#F5F5EC] flex gap-2">
                <Info size={16} className="text-[#6A7051] shrink-0 mt-0.5" />
                <div className="text-[11px] text-text-secondary leading-relaxed">
                  <p className="font-black uppercase text-[10px] text-brand-olive mb-1">
                    {ROLE_TEMPLATES[formRole]?.label || formRole} — {loginGuide.loginType}
                  </p>
                  <p>{loginGuide.createHint}</p>
                  {loginGuide.loginPath && (
                    <p className="mt-1 font-mono text-[10px] text-[#6A7051]">
                      App link: {loginGuide.loginPath}
                      {loginGuide.adminPath && loginGuide.adminPath !== loginGuide.loginPath
                        ? ` · Admin ERP: ${loginGuide.adminPath}`
                        : ''}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted">Full name</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full mt-1 border border-card-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#6A7051]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted">Phone (login ID)</label>
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    disabled={mode === 'edit'}
                    className="w-full mt-1 border border-card-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#6A7051] disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      setFormRole(e.target.value);
                      const t = ROLE_TEMPLATES[e.target.value];
                      if (t && mode === 'create') {
                        setUserPermissions(JSON.parse(JSON.stringify(t.permissions)));
                      }
                    }}
                    className="w-full mt-1 border border-card-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#6A7051]"
                  >
                    {ERP_MANAGEABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_TEMPLATES[r]?.label || r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted">
                    {loginGuide.shareOtp
                      ? `Password (Admin ERP backup) ${mode === 'edit' ? '— blank to keep' : ''}`
                      : `Password ${mode === 'edit' ? '(leave blank to keep)' : ''}`}
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={mode === 'edit' ? 'New password…' : 'Min 6 characters'}
                      className="flex-1 border border-card-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#6A7051]"
                    />
                    <button
                      type="button"
                      onClick={() => setFormPassword(generatePassword())}
                      className="px-3 border border-card-border bg-[#F5F5EC] text-[10px] font-black uppercase hover:bg-[#6A7051]/10 flex items-center gap-1"
                      title="Generate password"
                    >
                      <Sparkles size={14} /> Gen
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={applyRoleTemplateToUser}
                  className="text-[10px] font-black uppercase border border-[#6A7051] text-[#6A7051] px-3 py-2 hover:bg-[#6A7051]/5 flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Use role defaults
                </button>
                {mode === 'create' ? (
                  <button
                    type="button"
                    onClick={handleCreateUser}
                    disabled={loading}
                    className="bg-[#C5A021] text-brand-dark px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-yellow-500 disabled:opacity-50"
                  >
                    <UserPlus size={14} /> Create account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveUser}
                    disabled={loading || !selectedUserId}
                    className="bg-[#6A7051] text-white px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-[#5a6044] disabled:opacity-50"
                  >
                    <Save size={14} /> Save account &amp; access
                  </button>
                )}
              </div>

              {lastCredentials && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                  <p>
                    Created <strong>{ROLE_TEMPLATES[lastCredentials.role]?.label}</strong> — mobile{' '}
                    <strong>{lastCredentials.phone}</strong>
                    {getRoleLoginGuide(lastCredentials.role).shareOtp ? (
                      <span className="text-emerald-900"> (OTP login — use Copy for WhatsApp)</span>
                    ) : (
                      <span>
                        {' '}
                        / password <strong>{lastCredentials.password}</strong>
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={copyCredentials}
                    className="font-black uppercase text-[10px] flex items-center gap-1 text-emerald-800 hover:underline"
                  >
                    <Copy size={12} /> Copy login instructions for WhatsApp
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-card-border p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase text-brand-olive mb-1">Menus &amp; actions for this user</h3>
              <p className="text-[11px] text-text-secondary mb-4">
                Tick what this person can see (Read) and change (Write). Delete is rarely needed.
              </p>
              <PermissionsTable
                modules={userModules}
                permissions={userPermissions}
                onToggle={(key, action) => setUserPermissions((p) => togglePermission(p, key, action))}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#6A7051]">Job titles (defaults only)</h3>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              These are <strong>starting templates</strong>, not individual logins. When you create a user, click &quot;Use role defaults&quot; on the Users tab.
            </p>
            <div className="space-y-2.5">
              {adminRoleKeys.map((key) => {
                const role = ROLE_TEMPLATES[key];
                const isSelected = selectedRole === key;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`w-full text-left p-4 border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#6A7051] bg-[#6A7051]/5 border-l-4 border-l-brand-yellow'
                        : 'border-card-border bg-white hover:border-[#6A7051]/40'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black uppercase text-[#6A7051]">{role.label}</p>
                      <p className="text-[10px] text-text-muted mt-1">{role.description}</p>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                  </button>
                );
              })}
            </div>
            <div className="bg-[#F9FAFB] p-4 border border-card-border flex items-start gap-3">
              <Info size={16} className="text-brand-olive shrink-0 mt-0.5" />
              <p className="text-[10px] text-text-secondary leading-normal">
                Saving a template updates every existing user who already has that role. New users still need to be created under User accounts.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-card-border p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-card-border pb-4 mb-6 gap-4">
              <div>
                <h3 className="text-base font-black text-brand-olive uppercase">
                  Default access: {ROLE_TEMPLATES[selectedRole]?.label}
                </h3>
                <p className="text-[11px] text-text-secondary">Click squares to toggle — green check = allowed.</p>
              </div>
              <button
                type="button"
                onClick={saveRoleTemplate}
                disabled={loading}
                className="bg-[#C5A021] text-brand-dark px-4 py-2.5 text-[10px] font-black uppercase flex items-center gap-2 hover:bg-yellow-500"
              >
                <Save size={14} /> Save template for role
              </button>
            </div>
            <PermissionsTable
              modules={templateModules}
              permissions={rolePermissions}
              onToggle={(key, action) =>
                setRolePermissions((p) => togglePermission(p, key, action))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

function PermissionsTable({ modules, permissions, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-card-border bg-[#F5F5EC]/50">
            <th className="py-3 px-4 text-xs font-black uppercase">Module / screen</th>
            <th className="py-3 px-4 text-center text-xs font-black uppercase">Read</th>
            <th className="py-3 px-4 text-center text-xs font-black uppercase">Write</th>
            <th className="py-3 px-4 text-center text-xs font-black uppercase">Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {modules.map((m) => {
            const modPerms = permissions?.modules?.[m.key] || {
              read: false,
              write: false,
              delete: false,
            };
            return (
              <tr key={m.key} className="hover:bg-slate-50/50">
                <td className="py-3 px-4">
                  <p className="text-xs font-black text-brand-olive uppercase">{m.label}</p>
                </td>
                {['read', 'write', 'delete'].map((action) => (
                  <td key={action} className="py-3 px-4 text-center">
                    <PermissionToggle
                      checked={!!modPerms[action]}
                      onChange={() => onToggle(m.key, action)}
                      title={`${action} — ${m.label}`}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AccessControl;
