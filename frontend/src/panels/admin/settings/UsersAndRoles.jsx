import React, { useEffect, useState } from 'react';
import { userService } from '../../../services/userService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';

const UsersAndRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .all({ limit: 100 })
      .then((res) => {
        const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12">
      <AdminPageHeader title="Users & roles" subtitle="Operational access matrix" badge="Settings" />
      {loading ? (
        <p className="text-sm">Loading...</p>
      ) : (
        <AdminCard className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Phone</th>
                <th className="py-2 px-2">Role</th>
                <th className="py-2 px-2">Unit</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium">{u.fullName}</td>
                  <td className="py-2 px-2 font-mono">{u.phone}</td>
                  <td className="py-2 px-2">{u.role}</td>
                  <td className="py-2 px-2">{u.businessUnit || 'MKE'}</td>
                  <td className="py-2 px-2">{u.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}
    </div>
  );
};

export default UsersAndRoles;
