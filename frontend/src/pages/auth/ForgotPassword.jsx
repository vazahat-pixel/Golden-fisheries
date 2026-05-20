import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    // Implementation for password reset goes here
    console.log('Password reset requested for', email);
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Fleet Management System">
      <button 
        onClick={() => navigate('/auth/admin')}
        className="text-white flex items-center gap-2 mb-6 hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={16} /> Back to Login
      </button>

      <div className="mb-6 text-center text-white/80 text-sm">
        Enter your email address and we'll send you instructions to reset your password.
      </div>

      <form onSubmit={handleReset} className="flex flex-col w-full">
        <AuthInput 
          type="email" 
          placeholder="Email Address" 
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div className="mt-4">
          <AuthButton type="submit">
            Send Reset Link
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
