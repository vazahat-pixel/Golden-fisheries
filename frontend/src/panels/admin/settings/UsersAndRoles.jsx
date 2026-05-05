import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Modal } from '../../../design-system/components/Modal';
import { useAdminStore } from '../../../store/adminStore';
import { 
  UserPlus, 
  Shield, 
  Settings, 
  Trash2,
  Lock,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const UsersAndRoles = () => {
  const { users, addUser, deleteUser } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'MANAGER' });

  const handleInviteUser = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill required fields');
      return;
    }
    
    addUser({
      name: formData.name.toUpperCase(),
      email: formData.email.toLowerCase(),
      role: formData.role.toUpperCase(),
      status: 'ACTIVE',
      lastLogin: 'NEVER'
    });
    
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'MANAGER' });
    toast.success('Invitation dispatched');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Users & <span className="text-accent-olive">Roles.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">ACCESS CONTROL • SYSTEM PERMISSIONS</p>
        </div>
        <Button size="sm" className="gap-2 text-[9px] font-bold uppercase tracking-widest px-4 h-9 shadow-md" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={14} /> INVITE USER
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* User Table */}
        <div className="lg:col-span-3">
          <Card padding="none" className="border border-card-border shadow-subtle overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-olive-100/20">
                    <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">User Profile</th>
                    <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Role</th>
                    <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted text-center">Status</th>
                    <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted">Last Activity</th>
                    <th className="px-4 py-2.5 text-[8px] font-bold uppercase tracking-widest text-text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-olive-100/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-olive-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-black flex items-center justify-center font-bold text-white shadow-sm text-xs shrink-0">
                            {user.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-black uppercase truncate">{user.name}</p>
                            <p className="text-[8px] text-text-muted font-bold lowercase truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Shield size={10} className="text-accent-olive" />
                          <span className="text-[9px] font-bold uppercase text-black">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'} className="uppercase text-[7px] font-bold border border-card-border px-1.5 h-4">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[9px] text-text-muted font-bold uppercase tracking-widest">
                        {user.lastLogin}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1 transition-all">
                          <button onClick={() => toast.success('Settings')} className="p-1.5 text-black hover:bg-black hover:text-white border border-card-border/30 bg-white"><Settings size={13} /></button>
                          <button onClick={() => { if(confirm('Delete user?')) deleteUser(user.id); }} className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white border border-card-border/30 bg-white"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-3">
          <h2 className="text-[9px] font-bold text-black uppercase tracking-widest px-2">PERMISSIONS</h2>
          <div className="grid grid-cols-1 gap-2">
            {[
              { role: 'ADMIN', access: 'FULL ACCESS', color: 'bg-black' },
              { role: 'MANAGER', access: 'OPERATIONS', color: 'bg-black/90' },
              { role: 'BILLING', access: 'FINANCIALS', color: 'bg-black/70' },
              { role: 'DRIVER', access: 'LOGISTICS', color: 'bg-black/50' },
            ].map((role, i) => (
              <div key={i} className="p-3 flex items-center gap-3 bg-white border border-card-border hover:bg-olive-50 transition-all cursor-pointer group">
                  <div className={clsx('w-8 h-8 flex items-center justify-center text-white shrink-0', role.color)}><Lock size={14} /></div>
                  <div>
                    <h3 className="font-bold text-black text-[10px] uppercase">{role.role}</h3>
                    <p className="text-[8px] text-text-muted font-bold uppercase">{role.access}</p>
                  </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full text-[9px] font-bold border-card-border h-9" onClick={() => toast('Global settings system opening...')}>
            <Settings size={14} className="mr-2" /> ADVANCED CONFIG
          </Button>
        </div>
      </div>

      {/* Invite User Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Invite New User"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">FULL NAME</label>
            <input 
              type="text" 
              placeholder="E.G. MAHESH KUMAR"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">EMAIL ADDRESS</label>
            <input 
              type="email" 
              placeholder="user@goldenfisheries.com"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">ASSIGN ROLE</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none bg-white appearance-none"
            >
              <option value="ADMIN">ADMINISTRATOR</option>
              <option value="MANAGER">MANAGER</option>
              <option value="BILLING">BILLING</option>
              <option value="DRIVER">DRIVER</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 text-[9px] font-bold h-9" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button className="flex-1 text-[9px] font-bold h-9 gap-2" onClick={handleInviteUser}><Check size={14} /> DISPATCH INVITE</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersAndRoles;
