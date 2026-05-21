import React from 'react';
import { useAuthStore } from '../../store/authStore';

const DriverDocuments = () => {
  const { user } = useAuthStore();
  return (
    <div className="p-4">
      <h1 className="text-lg font-black uppercase mb-2">Documents</h1>
      <p className="text-sm text-gray-600">
        Upload driving licence & ID at registration. Contact office for document updates.
      </p>
      <p className="text-xs mt-4 text-gray-500">Driver: {user?.fullName}</p>
    </div>
  );
};

export default DriverDocuments;
