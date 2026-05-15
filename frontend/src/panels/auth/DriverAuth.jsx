import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { driverService } from '../../services/driverService';
import {
  Smartphone, ArrowRight, ArrowLeft, Camera, FileText,
  CreditCard, Truck, UserPlus, CheckCircle2, Clock, User,
  Check, Loader, ShieldCheck, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── OTP Input Component ───────────────────────────────────────────────
const OtpInput = ({ otp, setOtp }) => {
  const refs = Array.from({ length: 6 }, () => useRef());
  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };
  return (
    <div className="flex justify-center gap-2">
      {otp.map((d, i) => (
        <input
          key={i} ref={refs[i]}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="w-11 h-13 bg-[#E6E3C8] text-center text-xl font-black text-[#6A7051] focus:ring-2 focus:ring-[#C5A021] outline-none rounded-xl"
        />
      ))}
    </div>
  );
};

// ─── File Upload Button ────────────────────────────────────────────────
const FileUploadBtn = ({ label, field, files, setFiles }) => {
  const ref = useRef();
  const file = files[field];
  return (
    <div
      className="border border-dashed border-white/20 p-3 rounded-xl flex flex-col items-center gap-1.5 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden"
      onClick={() => ref.current?.click()}
    >
      <Camera size={18} className="text-[#C5A021]" />
      <span className="text-[8px] font-black text-white/40 uppercase text-center leading-tight">{label}</span>
      {file && <span className="text-[7px] text-[#C5A021] font-bold truncate w-full text-center">{file.name}</span>}
      <input
        ref={ref} type="file" className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
        onChange={e => {
          const f = e.target.files[0];
          if (f) setFiles(prev => ({ ...prev, [field]: f }));
        }}
      />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Main Driver Auth Component
// ══════════════════════════════════════════════════════════════════════════
const DriverAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [view, setView] = useState('login'); // login | otp | signup | pending | rejected
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(null);
  const [rejectionMsg, setRejectionMsg] = useState('');

  // ── Registration form data ───────────────────────────────
  const [form, setForm] = useState({
    fullName: '', mobile: '', alternateMobile: '',
    currentAddress: '', permanentAddress: '',
    aadhaarNumber: '', panNumber: '',
    licenseNumber: '', licenseExpiry: '',
    hasOwnVehicle: false, vehicleType: 'Mini Truck',
    vehicleNumber: '', rcExpiry: '', insuranceExpiry: '',
    permitExpiry: '', pucExpiry: ''
  });

  // ── File blobs (actual File objects for FormData) ────────
  const [files, setFiles] = useState({
    profilePhoto: null,
    aadhaarFront: null, aadhaarBack: null,
    panImage: null,
    licenseFront: null, licenseBack: null,
    rcImage: null, insuranceImage: null,
    permitImage: null, pucImage: null
  });

  // OTP countdown timer
  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const upd = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // ── Step validation ──────────────────────────────────────
  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName || form.fullName.trim().length < 3) return toast.error('Enter full name (min 3 chars)'), false;
      if (!/^[6-9]\d{9}$/.test(form.mobile)) return toast.error('Enter valid 10-digit mobile number'), false;
      if (!form.currentAddress) return toast.error('Current address is required'), false;
    }
    if (step === 3) {
      if (!form.licenseNumber) return toast.error('License number is required'), false;
      if (!form.licenseExpiry) return toast.error('License expiry date is required'), false;
    }
    return true;
  };

  // ── OTP Login ────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(loginPhone)) return toast.error('Enter valid 10-digit mobile');
    setLoading(true);
    try {
      const res = await authService.requestOtp(loginPhone);
      if (res?.devOtp) setDevOtp(res.devOtp);
      setView('otp');
      setTimer(60);
      toast.success('OTP sent to your mobile');
    } catch (err) {
      // Show specific pending/rejected status message
      if (err?.status === 403) {
        toast.error(err.message || 'Account pending approval');
        setView('pending');
      } else {
        toast.error(err?.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await authService.verifyOtp(loginPhone, code);
      if (res?.user) {
        login(res.user, res.accessToken);
        toast.success(`Welcome, ${res.user.fullName || 'Driver'}!`);
        navigate('/driver/dashboard');
      }
    } catch (err) {
      toast.error(err?.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  // ── Driver Registration Submit ───────────────────────────
  const handleRegister = async () => {
    setLoading(true);
    try {
      const fd = new FormData();

      // Append text fields
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      // Append file blobs
      Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f, f.name); });

      await driverService.register(fd);

      toast.success('Registration submitted! Awaiting admin approval.');
      setView('pending');
    } catch (err) {
      toast.error(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────
  const inputCls = "w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#C5A021] transition-all";

  return (
    <div className="min-h-screen bg-[#6A7051] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      {/* Live indicator */}
      <div className="absolute top-8 right-12 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#C5A021] rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E3C8]">GATEWAY ACTIVE</span>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6 py-8">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-4">
            <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 uppercase">
            {view === 'signup' ? 'Driver Onboarding' : 'Logistics Portal'}
          </h1>
          <p className="text-[9px] text-[#E6E3C8]/60 font-bold tracking-[0.3em] uppercase">
            {view === 'signup' ? `Step ${step} of 5` : 'Fleet Management System'}
          </p>
        </div>

        {/* ── VIEW: Login ── */}
        {view === 'login' && (
          <form onSubmit={handleSendOtp} className="w-full max-w-sm space-y-5 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6A7051]/60" size={18} />
              <input
                type="tel" placeholder="Mobile Number" value={loginPhone}
                onChange={e => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-[#E6E3C8] border-none rounded-2xl px-12 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] transition-all font-bold"
                required
              />
            </div>
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" size={18} /> : 'Login with OTP'}
            </button>
            <div className="text-center pt-3 border-t border-white/10">
              <p className="text-[10px] text-[#E6E3C8]/60 uppercase tracking-widest font-bold">
                New Driver?{' '}
                <button type="button" onClick={() => { setView('signup'); setStep(1); }} className="text-[#C5A021] font-black hover:underline">
                  Register Here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ── VIEW: OTP Verification ── */}
        {view === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="space-y-2">
              <p className="text-xs text-[#E6E3C8] uppercase tracking-[0.2em] font-black">Verification</p>
              <p className="text-[10px] text-[#E6E3C8]/60">Enter the 6-digit code sent to +91 {loginPhone}</p>
            </div>
            {devOtp && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Dev OTP: {devOtp}</p>
              </div>
            )}
            <OtpInput otp={otp} setOtp={setOtp} />
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" size={18} /> : 'Verify & Enter'}
            </button>
            {timer > 0
              ? <p className="text-[10px] text-[#E6E3C8]/40 font-bold uppercase tracking-widest">Resend in {timer}s</p>
              : <button type="button" onClick={handleSendOtp} className="text-[10px] text-[#C5A021] font-black uppercase tracking-widest hover:underline">Resend OTP</button>
            }
            <button type="button" onClick={() => setView('login')} className="text-[9px] text-[#E6E3C8]/40 font-bold flex items-center justify-center gap-1 mx-auto">
              <ArrowLeft size={12} /> Use different number
            </button>
          </form>
        )}

        {/* ── VIEW: Signup (5-step form) ── */}
        {view === 'signup' && (
          <div className="w-full max-w-lg bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 animate-in slide-in-from-bottom-10 duration-500">
            {/* Progress dots */}
            <div className="flex justify-between mb-8 relative before:absolute before:top-4 before:left-0 before:right-0 before:h-[1px] before:bg-white/10">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step >= s ? 'bg-[#C5A021] text-black' : 'bg-[#E6E3C8]/10 text-white/40'}`}>
                    {step > s ? <Check size={14} /> : s}
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-5 flex items-center gap-2">
              {step === 1 && <><User size={18} className="text-[#C5A021]" /> Basic Details</>}
              {step === 2 && <><CreditCard size={18} className="text-[#C5A021]" /> ID Proof</>}
              {step === 3 && <><FileText size={18} className="text-[#C5A021]" /> Driving License</>}
              {step === 4 && <><Truck size={18} className="text-[#C5A021]" /> Vehicle Info</>}
              {step === 5 && <><CheckCircle2 size={18} className="text-[#C5A021]" /> Review & Submit</>}
            </h2>

            {/* Step 1 — Basic Details */}
            {step === 1 && (
              <div className="space-y-3">
                <input placeholder="FULL NAME *" value={form.fullName} onChange={e => upd('fullName', e.target.value.toUpperCase())} className={inputCls} />
                <input placeholder="MOBILE NUMBER *" value={form.mobile} onChange={e => upd('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputCls} />
                <input placeholder="ALTERNATE MOBILE (OPTIONAL)" value={form.alternateMobile} onChange={e => upd('alternateMobile', e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputCls} />
                <textarea placeholder="CURRENT ADDRESS *" rows={2} value={form.currentAddress} onChange={e => upd('currentAddress', e.target.value)} className={inputCls} />
                <label className="flex items-center gap-2 text-white/60 text-[10px] font-bold">
                  <input type="checkbox" onChange={e => e.target.checked && upd('permanentAddress', form.currentAddress)} />
                  PERMANENT ADDRESS SAME AS CURRENT
                </label>
                <textarea placeholder="PERMANENT ADDRESS" rows={2} value={form.permanentAddress} onChange={e => upd('permanentAddress', e.target.value)} className={inputCls} />
                <div className="grid grid-cols-2 gap-2">
                  <FileUploadBtn label="Profile Photo" field="profilePhoto" files={files} setFiles={setFiles} />
                </div>
              </div>
            )}

            {/* Step 2 — ID Proof */}
            {step === 2 && (
              <div className="space-y-4">
                <input placeholder="AADHAAR NUMBER (12 DIGITS)" maxLength={14} value={form.aadhaarNumber} onChange={e => upd('aadhaarNumber', e.target.value)} className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <FileUploadBtn label="Aadhaar Front" field="aadhaarFront" files={files} setFiles={setFiles} />
                  <FileUploadBtn label="Aadhaar Back" field="aadhaarBack" files={files} setFiles={setFiles} />
                </div>
                <input placeholder="PAN NUMBER (OPTIONAL)" maxLength={10} value={form.panNumber} onChange={e => upd('panNumber', e.target.value.toUpperCase())} className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <FileUploadBtn label="PAN Card Image" field="panImage" files={files} setFiles={setFiles} />
                </div>
              </div>
            )}

            {/* Step 3 — Driving License */}
            {step === 3 && (
              <div className="space-y-4">
                <input placeholder="LICENSE NUMBER *" value={form.licenseNumber} onChange={e => upd('licenseNumber', e.target.value.toUpperCase())} className={inputCls} />
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/40 uppercase ml-2">License Expiry Date *</label>
                  <input type="date" value={form.licenseExpiry} onChange={e => upd('licenseExpiry', e.target.value)} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FileUploadBtn label="License Front" field="licenseFront" files={files} setFiles={setFiles} />
                  <FileUploadBtn label="License Back" field="licenseBack" files={files} setFiles={setFiles} />
                </div>
              </div>
            )}

            {/* Step 4 — Vehicle Info */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                  <span className="text-xs font-bold text-white uppercase tracking-tight">Do you own a vehicle?</span>
                  <button type="button" onClick={() => upd('hasOwnVehicle', !form.hasOwnVehicle)}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${form.hasOwnVehicle ? 'bg-[#C5A021]' : 'bg-white/20'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${form.hasOwnVehicle ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                {form.hasOwnVehicle && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95">
                    <select value={form.vehicleType} onChange={e => upd('vehicleType', e.target.value)} className={inputCls}>
                      <option>Mini Truck</option>
                      <option>Pickup</option>
                      <option>Tempo</option>
                      <option>Big Truck</option>
                    </select>
                    <input placeholder="VEHICLE NUMBER *" value={form.vehicleNumber} onChange={e => upd('vehicleNumber', e.target.value.toUpperCase())} className={inputCls} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase ml-1">RC Expiry</label>
                        <input type="date" value={form.rcExpiry} onChange={e => upd('rcExpiry', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase ml-1">Insurance Expiry</label>
                        <input type="date" value={form.insuranceExpiry} onChange={e => upd('insuranceExpiry', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase ml-1">Permit Expiry</label>
                        <input type="date" value={form.permitExpiry} onChange={e => upd('permitExpiry', e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-white/40 uppercase ml-1">PUC Expiry</label>
                        <input type="date" value={form.pucExpiry} onChange={e => upd('pucExpiry', e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FileUploadBtn label="RC Book" field="rcImage" files={files} setFiles={setFiles} />
                      <FileUploadBtn label="Insurance" field="insuranceImage" files={files} setFiles={setFiles} />
                      <FileUploadBtn label="Permit" field="permitImage" files={files} setFiles={setFiles} />
                      <FileUploadBtn label="PUC" field="pucImage" files={files} setFiles={setFiles} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5 — Review */}
            {step === 5 && (
              <div className="space-y-3">
                <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                  {[
                    ['NAME', form.fullName],
                    ['MOBILE', form.mobile],
                    ['ADDRESS', form.currentAddress],
                    ['AADHAAR', form.aadhaarNumber || '—'],
                    ['LICENSE', form.licenseNumber],
                    ['VEHICLE', form.hasOwnVehicle ? form.vehicleNumber : 'COMPANY ASSIGNED'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span className="text-[9px] font-bold text-white/40 uppercase">{label}</span>
                      <span className="text-[10px] font-black text-white truncate max-w-[180px]">{val}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-center text-white/30 uppercase font-bold leading-relaxed px-4">
                  By submitting, you confirm all documents are original and valid.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-5">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="w-12 h-12 flex items-center justify-center border border-white/20 text-white rounded-xl hover:bg-white/5">
                  <ArrowLeft size={20} />
                </button>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  if (step < 5) {
                    if (validateStep()) setStep(s => s + 1);
                  } else {
                    handleRegister();
                  }
                }}
                className="flex-1 bg-[#C5A021] text-black h-12 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader className="animate-spin" size={18} /> : step === 5 ? 'Submit Application' : 'Next Step'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>

            <button type="button" onClick={() => setView('login')}
              className="w-full text-center mt-3 text-[9px] text-[#E6E3C8]/30 font-bold uppercase tracking-widest hover:text-white">
              Already registered? Login
            </button>
          </div>
        )}

        {/* ── VIEW: Pending Approval ── */}
        {view === 'pending' && (
          <div className="w-full max-w-sm text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-[#C5A021]/10 rounded-full flex items-center justify-center mx-auto border border-[#C5A021]/20">
              <Clock className="text-[#C5A021] animate-pulse" size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Verification Pending</h2>
              <p className="text-[10px] text-[#E6E3C8]/60 font-bold uppercase tracking-widest leading-loose">
                Your profile is under admin review.<br />
                This usually takes <span className="text-[#C5A021]">12–24 hours.</span>
              </p>
              <p className="text-[9px] text-[#E6E3C8]/40 font-bold">Once approved, you can login with your mobile OTP.</p>
            </div>
            <button onClick={() => { setView('login'); setLoginPhone(form.mobile || ''); }}
              className="text-[10px] text-white/40 font-black uppercase tracking-widest hover:text-[#C5A021] underline underline-offset-8">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverAuth;
