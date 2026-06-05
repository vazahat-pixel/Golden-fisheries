import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthButton from '../../components/auth/AuthButton';

const InitPage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Golden Fisheries ERP" subtitle="Select your access point">
      <div className="flex flex-col gap-3 mt-4">
        <AuthButton onClick={() => navigate('/auth/admin')} variant="primary">
          Admin Login
        </AuthButton>
        <AuthButton onClick={() => navigate('/auth/driver')} variant="secondary">
          Driver Login
        </AuthButton>
        <AuthButton onClick={() => navigate('/restaurant/auth')} variant="secondary">
          Restaurant Web
        </AuthButton>
        <AuthButton onClick={() => navigate('/fishmall/auth')} variant="secondary">
          Fish Mall Web
        </AuthButton>
      </div>

      <p className="mt-6 text-center text-white/50 text-xs">
        New driver accounts are created by Admin in Logistics.
      </p>
    </AuthLayout>
  );
};

export default InitPage;
