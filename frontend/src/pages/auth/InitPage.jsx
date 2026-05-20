import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthButton from '../../components/auth/AuthButton';

const InitPage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Logistics Portal" subtitle="Fleet Management System">
      <div className="flex flex-col gap-4 mt-4">
        <AuthButton onClick={() => navigate('/auth/admin')} variant="primary">
          Admin Login
        </AuthButton>
        <AuthButton onClick={() => navigate('/auth/driver')} variant="secondary">
          Driver Login
        </AuthButton>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-white text-sm">
          NEW DRIVER?{' '}
          <button 
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
