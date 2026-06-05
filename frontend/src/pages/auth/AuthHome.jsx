import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { Shield, Truck, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getDefaultHomePath } from '../../utils/permissions';

const AuthHome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultHomePath(user)} replace />;
  }

  return (
    <AuthLayout title="Golden Fisheries" subtitle="Enterprise operations platform">
      <div className="flex flex-col gap-4 -mt-2">
        <button
          type="button"
          onClick={() => navigate('/auth/admin')}
          className="group w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-yellow/30 transition-all duration-200 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-yellow/20 flex items-center justify-center shrink-0 group-hover:bg-brand-yellow/30 transition-colors">
              <Shield className="text-brand-yellow" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm uppercase tracking-wide">Admin Login</p>
              <p className="text-white/55 text-xs mt-1 leading-relaxed">
                Super Admin, Buyer, Procurement &amp; Vehicle Manager — phone + password.
              </p>
            </div>
            <ChevronRight className="text-white/30 group-hover:text-brand-yellow shrink-0 mt-1" size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/auth/driver')}
          className="group w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all duration-200 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Truck className="text-white/90" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm uppercase tracking-wide">Driver Login</p>
              <p className="text-white/55 text-xs mt-1 leading-relaxed">
                Trips, pickup &amp; delivery — SMS OTP on registered mobile.
              </p>
            </div>
            <ChevronRight className="text-white/30 group-hover:text-white/70 shrink-0 mt-1" size={20} />
          </div>
        </button>
      </div>
    </AuthLayout>
  );
};

export default AuthHome;
