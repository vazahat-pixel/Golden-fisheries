import React, { useState, useRef } from 'react';
import {
  X,
  Phone,
  CheckCircle2,
  Shield,
  User,
  Mail,
  ChevronRight,
  Loader,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { useRbacStore, ROLE_TEMPLATES, MODULE_META } from '../../../store/rbacStore';
import { toast } from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Phone Entry & OTP
// ─────────────────────────────────────────────────────────────────────────────
const StepPhone = ({ form, setForm, onVerified }) => {
  const { sendOtp, verifyOtp, clearOtpSession } = useRbacStore();
  const [phase, setPhase] = useState('input'); // input | otp | verified
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleSendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const generated = sendOtp(form.phone);
      setDevOtp(generated);
      setPhase('otp');
      setLoading(false);
      toast.success('OTP sent! (Dev mode: check console)');
    }, 800);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKey = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    const entered = otp.join('');
    if (entered.length !== 6) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    const result = verifyOtp(form.phone, entered);
    if (result.success) {
      setPhase('verified');
      setForm((f) => ({ ...f, phoneVerified: true }));
      clearOtpSession(form.phone);
      toast.success('Phone number verified!');
    } else {
      toast.error(result.message);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    const generated = sendOtp(form.phone);
    setDevOtp(generated);
    toast.success('OTP resent');
  };

  if (phase === 'verified') {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">Verified</h3>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">{form.phone}</p>
        <button
          onClick={onVerified}
          className="mt-6 w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#6B7550] transition-all flex items-center justify-center gap-2"
        >
          Continue <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  if (phase === 'otp') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">OTP sent to</p>
          <p className="text-lg font-black text-gray-900 mt-1">+91 {form.phone}</p>
          {devOtp && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 text-center">
              <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">Dev Mode OTP</p>
              <p className="text-2xl font-black text-amber-700 tracking-widest mt-1">{devOtp}</p>
            </div>
          )}
        </div>

        <div>
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-3 text-center">
            Enter 6-Digit OTP
          </label>
          <div className="flex items-center justify-center gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKey(i, e)}
                className="w-14 h-14 border-2 border-gray-200 text-center text-2xl font-black text-gray-900 focus:border-[#6B7550] outline-none transition-all bg-gray-50"
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#6B7550] transition-all"
        >
          Verify OTP
        </button>

        <button
          onClick={handleResend}
          className="w-full py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-black flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw size={11} /> Resend OTP
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name *</label>
        <div className="relative">
          <User size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Channapa Shetty"
            className="w-full bg-gray-50 border border-gray-200 py-3 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest focus:border-[#6B7550] outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">+91</span>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/, '').slice(0, 10) }))}
            placeholder="9876543210"
            className="w-full bg-gray-50 border border-gray-200 py-3 pl-12 pr-4 text-[10px] font-bold tracking-widest focus:border-[#6B7550] outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email (Optional)</label>
        <div className="relative">
          <Mail size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="channapa@gf.com"
            className="w-full bg-gray-50 border border-gray-200 py-3 pl-10 pr-4 text-[10px] font-bold tracking-widest focus:border-[#6B7550] outline-none transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleSendOtp}
        disabled={loading}
        className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#6B7550] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader size={14} className="animate-spin" /> : <Phone size={14} />}
        {loading ? 'Sending OTP...' : 'Send OTP to Verify'}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Role Selection
// ─────────────────────────────────────────────────────────────────────────────
const StepRole = ({ form, setForm, onNext }) => {
  const ROLE_LIST = Object.values(ROLE_TEMPLATES);

  const handleSelect = (roleId) => {
    const template = ROLE_TEMPLATES[roleId];
    setForm((f) => ({
      ...f,
      role: roleId,
      loginPortal: template.loginPortal,
      permissions: JSON.parse(JSON.stringify(template.permissions)),
    }));
  };

  const ROLE_COLOR_MAP = {
    RESTAURANT_STAFF: '#6B7550',
    FISHMALL_BILLING: '#2563EB',
    DRIVER: '#D97706',
    ACCOUNTANT: '#7C3AED',
    MANAGER: '#059669',
    ADMIN: '#EF4444',
    PROCUREMENT_MANAGER: '#6B7550',
    BUYER: '#4F46E5',
    VEHICLE_MANAGER: '#EA580C',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-2">
        {ROLE_LIST.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelect(role.id)}
            className={`p-4 text-left border transition-all flex items-center gap-4 ${
              form.role === role.id
                ? 'border-[#6B7550] bg-[#6B7550]/5 ring-1 ring-[#6B7550]/20'
                : 'border-gray-100 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className="w-10 h-10 flex items-center justify-center text-white text-sm font-black shrink-0"
              style={{ backgroundColor: ROLE_COLOR_MAP[role.id] || '#6B7550' }}
            >
              {role.label.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{role.label}</p>
              <p className="text-[8px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">{role.description}</p>
              <p className="text-[8px] text-[#6B7550] font-bold mt-1 uppercase tracking-widest">Login → {role.loginPortal}</p>
            </div>
            {form.role === role.id && (
              <CheckCircle2 size={16} className="text-[#6B7550] shrink-0" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!form.role}
        className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#6B7550] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Configure Permissions <ChevronRight size={14} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Permission Matrix
// ─────────────────────────────────────────────────────────────────────────────
const StepPermissions = ({ form, setForm, onSubmit }) => {
  const togglePanel = (panel) => {
    setForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        panels: {
          ...f.permissions.panels,
          [panel]: !f.permissions.panels[panel],
        },
      },
    }));
  };

  const toggleModule = (moduleKey, action) => {
    setForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        modules: {
          ...f.permissions.modules,
          [moduleKey]: {
            ...f.permissions.modules[moduleKey],
            [action]: !f.permissions.modules[moduleKey]?.[action],
          },
        },
      },
    }));
  };

  const PANELS = ['restaurant', 'fishmall', 'driver', 'admin'];
  const PANEL_LABELS = {
    restaurant: 'Restaurant Panel',
    fishmall: 'Fish Mall Panel',
    driver: 'Driver App',
    admin: 'Admin Panel',
  };

  // Group modules by panel
  const groupedModules = MODULE_META.reduce((acc, m) => {
    if (!acc[m.panel]) acc[m.panel] = [];
    acc[m.panel].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Panel Access Toggles */}
      <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Panel Access</p>
        <div className="grid grid-cols-2 gap-2">
          {PANELS.map((panel) => (
            <button
              key={panel}
              onClick={() => togglePanel(panel)}
              className={`p-3 border text-left transition-all ${
                form.permissions?.panels?.[panel]
                  ? 'border-[#6B7550] bg-[#6B7550]/5 text-[#6B7550]'
                  : 'border-gray-100 bg-gray-50 text-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-widest">{PANEL_LABELS[panel]}</p>
                <div className={`w-4 h-4 border flex items-center justify-center ${form.permissions?.panels?.[panel] ? 'border-[#6B7550] bg-[#6B7550]' : 'border-gray-200 bg-white'}`}>
                  {form.permissions?.panels?.[panel] && <CheckCircle2 size={10} className="text-white" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Module Permission Matrix */}
      <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Module Permissions</p>
        <div className="border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400">Module</th>
                <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center">Read</th>
                <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center">Write</th>
                <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MODULE_META.map((mod) => (
                <tr key={mod.key} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2">
                    <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tight">{mod.label}</p>
                    <p className="text-[7px] text-gray-400 font-bold">{mod.panel}</p>
                  </td>
                  {['read', 'write', 'delete'].map((action) => (
                    <td key={action} className="px-3 py-2 text-center">
                      <button
                        onClick={() => toggleModule(mod.key, action)}
                        className={`w-5 h-5 border flex items-center justify-center mx-auto transition-all ${
                          form.permissions?.modules?.[mod.key]?.[action]
                            ? 'border-[#6B7550] bg-[#6B7550]'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        {form.permissions?.modules?.[mod.key]?.[action] && (
                          <CheckCircle2 size={10} className="text-white" />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={onSubmit}
        className="w-full py-4 bg-[#6B7550] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
      >
        <Lock size={14} /> Save User Access
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Wrapper Modal
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = ['Verify Identity', 'Assign Role', 'Set Permissions'];

const UserCreationForm = ({ onClose, editingUser = null }) => {
  const { createUser, updateUser } = useRbacStore();
  const [step, setStep] = useState(editingUser ? 1 : 0);
  const [form, setForm] = useState(editingUser ? {
    id: editingUser.id || editingUser._id,
    name: editingUser.fullName || editingUser.name,
    phone: editingUser.phone,
    email: editingUser.email || '',
    phoneVerified: true,
    role: editingUser.role,
    loginPortal: editingUser.loginPortal || ROLE_TEMPLATES[editingUser.role]?.loginPortal || '',
    permissions: editingUser.permissions || ROLE_TEMPLATES[editingUser.role]?.permissions || {},
  } : {
    name: '',
    phone: '',
    email: '',
    phoneVerified: false,
    role: '',
    loginPortal: '',
    permissions: {},
  });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.role) {
      toast.error('Complete all required fields');
      return;
    }
    try {
      if (editingUser) {
        await updateUser(form.id, form);
        toast.success(`${form.name} updated successfully!`);
      } else {
        await createUser(form);
        toast.success(`${form.name} created successfully!`);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to process user');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md shadow-2xl border-t-4 border-[#6B7550] overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[9px] font-bold text-[#6B7550] uppercase tracking-widest">Step {step + 1} of {STEPS.length}</p>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight mt-0.5">
                {editingUser && step === 1 ? 'Edit Role' : STEPS[step]}
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`h-1 flex-1 transition-all ${i <= step ? 'bg-[#6B7550]' : 'bg-gray-100'}`} />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 max-h-[65vh] overflow-y-auto">
          {step === 0 && (
            <StepPhone
              form={form}
              setForm={setForm}
              onVerified={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <StepRole
              form={form}
              setForm={setForm}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepPermissions
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Back nav */}
        {step > 0 && (
          <div className="px-8 pb-6">
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCreationForm;
