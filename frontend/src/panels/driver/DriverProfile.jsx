import React from 'react';
import { useAuthStore } from '../../store/authStore';

const DriverProfile = () => {
  const { user } = useAuthStore();
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-black uppercase">Profile</h1>
      <div className="bg-white border p-4 text-sm space-y-2">
        <p>
          <span className="text-gray-500">Name:</span> {user?.fullName || user?.name}
        </p>
        <p>
          <span className="text-gray-500">Phone:</span> {user?.phone}
        </p>
        <p>
          <span className="text-gray-500">Role:</span> DRIVER
        </p>
      </div>
    </div>
  );
};

export default DriverProfile;
