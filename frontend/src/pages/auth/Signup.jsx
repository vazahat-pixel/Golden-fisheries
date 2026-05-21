import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { User, Smartphone, Lock, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Implementation for signup goes here
    console.log('Driver signup', formData);
  };

  return (
    <AuthLayout title="Driver Signup" subtitle="Fleet Management System">
      <button 
        onClick={() => navigate('/auth/home')}
        className="text-white flex items-center gap-2 mb-6 hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <form onSubmit={handleSignup} className="flex flex-col w-full">
        <AuthInput 
          name="name"
          type="text" 
          placeholder="Full Name" 
          icon={User}
          value={formData.name}
          onChange={handleChange}
          required
        />
        <AuthInput 
          name="mobile"
          type="tel" 
          placeholder="Mobile Number" 
          icon={Smartphone}
          value={formData.mobile}
          onChange={handleChange}
          required
        />
        <AuthInput 
          name="password"
          type="password" 
          placeholder="Create Password" 
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <div className="mt-4 mb-2">
          <AuthButton type="submit">
            Register
          </AuthButton>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
