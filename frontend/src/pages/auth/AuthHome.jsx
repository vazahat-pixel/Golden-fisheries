import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthButton from '../../components/auth/AuthButton';
import { Shield, Truck } from 'lucide-react';

/**
 * Single entry screen: Admin ERP login + Driver login only.
 * Restaurant & Fish Mall are separate URLs (not listed here).
 */
const AuthHome = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Golden Fisheries ERP" subtitle="Choose how you want to sign in">
      <div className="flex flex-col gap-6 mt-2 w-full max-w-md mx-auto">
        <section className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center">
              <Shield className="text-brand-yellow" size={22} />
            </div>
            <div>
              <h2 className="text-white font-black text-sm uppercase tracking-widest">Admin Login</h2>
              <p className="text-white/60 text-[10px] mt-0.5 leading-relaxed">
                Super Admin, Procurement, Buyer, Vehicle Manager — same login. Modules & fields are
                assigned by Admin in Access Control.
              </p>
            </div>
          </div>
          <AuthButton onClick={() => navigate('/auth/admin')} variant="primary">
            Admin Login
          </AuthButton>
        </section>

        <section className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Truck className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-white font-black text-sm uppercase tracking-widest">Driver Login</h2>
              <p className="text-white/60 text-[10px] mt-0.5 leading-relaxed">
                Trips, pickup, delivery & expenses. Credentials are created by Admin.
              </p>
            </div>
          </div>
          <AuthButton onClick={() => navigate('/auth/driver')} variant="secondary">
            Driver Login
          </AuthButton>
          <p className="text-center text-white/50 text-[10px]">
            New driver?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/signup')}
              className="text-brand-yellow hover:underline font-bold"
            >
              Register here
            </button>
          </p>
        </section>
      </div>
    </AuthLayout>
  );
};

export default AuthHome;
