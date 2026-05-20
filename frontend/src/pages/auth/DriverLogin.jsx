import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { Smartphone, Lock, ArrowLeft } from 'lucide-react';

const DriverLogin = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Implementation for login goes here
    console.log('Driver login', { mobile, password });
  };

  return (
    <AuthLayout title="Driver Login" subtitle="Fleet Management System">
      <button 
        onClick={() => navigate('/auth/init')}
        className="text-white flex items-center gap-2 mb-6 hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <form onSubmit={handleLogin} className="flex flex-col w-full">
        <AuthInput 
          type="tel" 
          placeholder="Mobile Number" 
          icon={Smartphone}
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />
        <AuthInput 
          type="password" 
          placeholder="Password / OTP" 
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="mt-4 mb-2">
          <AuthButton type="submit">
            Login
          </AuthButton>
        </div>
        
        <p className="text-center text-[#a5aa98] text-xs mt-4 uppercase tracking-wider">
          One-time password will be sent
        </p>
      </form>
    </AuthLayout>
  );
};

export default DriverLogin;
