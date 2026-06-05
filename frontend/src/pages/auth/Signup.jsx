import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthButton from '../../components/auth/AuthButton';
import { ArrowLeft } from 'lucide-react';

/** Public driver self-registration is disabled — admin creates drivers. */
const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Registration disabled';
  }, []);

  return (
    <AuthLayout title="Registration closed" subtitle="Driver onboarding is managed by Admin">
      <button
        type="button"
        onClick={() => navigate('/auth/home')}
        className="text-white flex items-center gap-2 mb-6 hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <p className="text-white/80 text-sm mb-6 leading-relaxed">
        New drivers are added by Admin in <strong>Logistics → Drivers</strong>. After approval,
        sign in with <strong>Driver Login (OTP)</strong> using your registered mobile number.
      </p>
      <AuthButton onClick={() => navigate('/auth/driver')} variant="primary">
        Go to Driver Login
      </AuthButton>
    </AuthLayout>
  );
};

export default Signup;
