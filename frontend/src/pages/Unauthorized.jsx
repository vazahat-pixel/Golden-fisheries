import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 bg-red-50 border border-red-100 flex items-center justify-center mb-6">
        <ShieldOff size={28} className="text-red-400" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Access Denied</h1>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 max-w-xs leading-relaxed">
        You do not have permission to access this page. Contact your administrator to request access.
      </p>
      <button
        onClick={() => navigate('/launchpad')}
        className="flex items-center gap-2 bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#6B7550] transition-all"
      >
        <ArrowLeft size={14} /> Return to Launchpad
      </button>
    </div>
  );
};

export default Unauthorized;
