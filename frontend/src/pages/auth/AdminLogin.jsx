import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRbacStore } from '../../store/rbacStore';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { login } = useAuthStore.getState();
    const { users } = useRbacStore.getState();
    
    // Simulate successful login as ADMIN
    const mockUser = {
      id: 'mock-admin-123',
      name: 'System Admin',
      role: 'ADMIN',
      email: email,
      phone: '9999999999',
      status: 'active'
    };
    
    // Inject mock user into rbacStore so permissions work
    if (!users.find(u => u.id === mockUser.id)) {
      useRbacStore.setState({ users: [...users, mockUser] });
    }
    
    login(mockUser, 'mock-jwt-token');
    navigate('/admin/dashboard');
  };

  return (
    <AuthLayout title="Admin Login" subtitle="Fleet Management System">
      <button 
        onClick={() => navigate('/auth/init')}
        className="text-white flex items-center gap-2 mb-6 hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <form onSubmit={handleLogin} className="flex flex-col w-full">
        <AuthInput 
          type="email" 
          placeholder="Email Address" 
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthInput 
          type="password" 
          placeholder="Password" 
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="flex justify-end mb-6">
          <button 
            type="button"
            onClick={() => navigate('/auth/forgot-password')}
            className="text-sm text-brand-yellow hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <AuthButton type="submit">
          Login
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
