import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthButton from '../../components/auth/AuthButton';

const InitPage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Golden Fisheries ERP" subtitle="Select your access point">
      <div className="flex flex-col gap-3 mt-4">
        <AuthButton onClick={() => navigate('/auth/erp')} variant="primary">
          Admin Web ERP
        </AuthButton>
        <AuthButton onClick={() => navigate('/auth/mobile')} variant="secondary">
          Mobile App (Field Roles)
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

      <div className="mt-8 text-center">
        <p className="text-white text-sm">
          NEW DRIVER?{' '}
          <button
            type="button"
            onClick={() => navigate('/auth/signup')}
            className="text-brand-yellow hover:underline font-bold"
          >
            Register Here
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default InitPage;
