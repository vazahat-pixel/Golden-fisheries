import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const DriverSettings = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-black uppercase">Settings</h1>
      <button
        type="button"
        onClick={async () => {
          await logout();
          navigate('/auth/home');
        }}
        className="w-full py-3 border-2 border-red-600 text-red-700 font-bold text-xs uppercase"
      >
        Logout
      </button>
    </div>
  );
};

export default DriverSettings;
