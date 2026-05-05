import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Globe,
  Truck,
  UserPlus,
  Camera,
  FileText,
  CreditCard,
  MapPin,
  Check,
  User,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { registerDriver, getDriverByMobile } = useDriverStore();
  
  const [view, setView] = useState('login'); // login, signup, otp, pending
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);

  const [loginPhone, setLoginPhone] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    alternateMobile: '',
    currentAddress: '',
    permanentAddress: '',
    profilePhoto: null,
    aadhaarNumber: '',
    aadhaarFrontImage: null,
    aadhaarBackImage: null,
    panNumber: '',
    panImage: null,
    licenseNumber: '',
    licenseExpiry: '',
    licenseFrontImage: null,
    licenseBackImage: null,
    hasOwnVehicle: false,
    vehicleType: 'Mini Truck',
    vehicleNumber: '',
    rcImage: null,
    rcExpiry: '',
    insuranceImage: null,
    insuranceExpiry: '',
    permitImage: null,
    permitExpiry: '',
    pucImage: null,
    pucExpiry: ''
  });

  // OTP Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      // In a real app, this would be an upload. Here we just store the name for UI
      setFormData(prev => ({ ...prev, [field]: file.name }));
      toast.success(`${field.replace(/([A-Z])/g, ' $1').trim()} selected`);
    }
  };

  const handleAction = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (view === 'login') {
        // MOCK LOGIN WITH OTP
        setView('otp');
        setTimer(60);
        toast.success('Login OTP sent to ' + loginPhone);
      } else if (view === 'otp') {
        if (otp.join('') === '123456') {
          // Check if driver exists
          const existingDriver = getDriverByMobile(loginPhone || formData.mobile);
          
          if (existingDriver) {
            if (existingDriver.status === 'active' || existingDriver.status === 'approved') {
              login({ name: existingDriver.fullName, role: 'DRIVER', phone: existingDriver.mobile, id: existingDriver.id }, 'mock-jwt-token');
              toast.success('Welcome back, ' + existingDriver.fullName);
              navigate('/driver/dashboard');
            } else {
              setView('pending');
              toast.error('Account pending verification');
            }
          } else {
            // New registration flow
            setFormData(prev => ({ ...prev, mobile: loginPhone }));
            setView('signup');
            setStep(1);
          }
        } else {
          toast.error('Invalid verification code.');
        }
      } else if (view === 'signup' && step === 5) {
        // Finalize registration
        registerDriver(formData);
        setView('pending');
        toast.success('Registration complete! Pending admin approval.');
      }
      setLoading(false);
    }, 1000);
  };

  const renderView = () => {
    switch(view) {
      case 'login':
        return (
          <form onSubmit={handleAction} className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-4">
               <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6A7051]/60" size={18} />
                  <input 
                    type="tel" 
                    placeholder="Mobile Number"
                    value={loginPhone}
                    onChange={e => setLoginPhone(e.target.value)}
                    className="w-full bg-[#E6E3C8] border-none rounded-2xl px-12 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] transition-all font-bold"
                    required
                  />
               </div>
            </div>
            
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl shadow-black/40 active:scale-[0.98] uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3">
              {loading ? "SENDING..." : "Login / Signup"}
            </button>

            <p className="text-[10px] text-center text-[#E6E3C8]/40 uppercase tracking-[0.2em] font-bold">
              ONE-TIME PASSWORD WILL BE SENT
            </p>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleAction} className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="space-y-2">
               <p className="text-xs text-[#E6E3C8] uppercase tracking-[0.2em] font-black">Verification</p>
               <p className="text-[10px] text-[#E6E3C8]/60">Enter the 6-digit code sent to your mobile</p>
            </div>
            <div className="flex justify-center gap-3">
              {otp.map((digit, idx) => (
                <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(idx, e.target.value)} className="w-12 h-14 bg-[#E6E3C8] border-none rounded-xl text-center text-xl font-black text-[#6A7051] focus:ring-2 focus:ring-[#C5A021] outline-none shadow-lg" />
              ))}
            </div>
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em]">{loading ? "VERIFYING..." : "Verify & Continue"}</button>
            {timer > 0 ? (
               <p className="text-[10px] text-[#E6E3C8]/40 font-bold uppercase tracking-widest">Resend in {timer}s</p>
            ) : (
               <button type="button" onClick={() => setTimer(60)} className="text-[10px] text-[#C5A021] font-black uppercase tracking-widest hover:underline">Resend OTP</button>
            )}
          </form>
        );

      case 'signup':
        return (
          <div className="w-full max-w-lg bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 animate-in slide-in-from-bottom-10 duration-500">
             {/* Progress Bar */}
             <div className="flex justify-between mb-8 relative before:absolute before:top-4 before:left-0 before:right-0 before:h-[1px] before:bg-white/10">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step >= s ? 'bg-[#C5A021] text-black shadow-lg shadow-[#C5A021]/20' : 'bg-[#E6E3C8]/10 text-white/40'}`}>
                       {step > s ? <Check size={14} /> : s}
                    </div>
                  </div>
                ))}
             </div>

             <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                {step === 1 && <><User size={20} className="text-[#C5A021]" /> Basic Details</>}
                {step === 2 && <><CreditCard size={20} className="text-[#C5A021]" /> ID Proof</>}
                {step === 3 && <><FileText size={20} className="text-[#C5A021]" /> Driving License</>}
                {step === 4 && <><Truck size={20} className="text-[#C5A021]" /> Vehicle Info</>}
                {step === 5 && <><CheckCircle2 size={20} className="text-[#C5A021]" /> Final Review</>}
             </h2>

             <form className="space-y-4">
                {step === 1 && (
                  <div className="space-y-4">
                    <input placeholder="FULL NAME" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value.toUpperCase()})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#C5A021]" />
                    <input placeholder="ALTERNATE MOBILE (OPTIONAL)" value={formData.alternateMobile} onChange={e => setFormData({...formData, alternateMobile: e.target.value})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#C5A021]" />
                    <textarea placeholder="CURRENT ADDRESS" rows={2} value={formData.currentAddress} onChange={e => setFormData({...formData, currentAddress: e.target.value})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#C5A021]" />
                    <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold">
                       <input type="checkbox" onChange={e => e.target.checked && setFormData({...formData, permanentAddress: formData.currentAddress})} />
                       <span>PERMANENT ADDRESS SAME AS CURRENT</span>
                    </div>
                    <textarea placeholder="PERMANENT ADDRESS" rows={2} value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#C5A021]" />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <input placeholder="AADHAAR NUMBER (12 DIGITS)" maxLength={14} value={formData.aadhaarNumber} onChange={e => setFormData({...formData, aadhaarNumber: e.target.value})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" />
                    <div className="grid grid-cols-2 gap-3">
                       <div className="border border-dashed border-white/20 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden">
                          <Camera size={20} className="text-[#C5A021]" />
                          <p className="text-[8px] font-black text-white/40 uppercase">Aadhaar Front</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('aadhaarFrontImage', e.target.files[0])} />
                          {formData.aadhaarFrontImage && <p className="text-[7px] text-[#C5A021] font-bold truncate w-full text-center">{formData.aadhaarFrontImage}</p>}
                       </div>
                       <div className="border border-dashed border-white/20 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden">
                          <Camera size={20} className="text-[#C5A021]" />
                          <p className="text-[8px] font-black text-white/40 uppercase">Aadhaar Back</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('aadhaarBackImage', e.target.files[0])} />
                          {formData.aadhaarBackImage && <p className="text-[7px] text-[#C5A021] font-bold truncate w-full text-center">{formData.aadhaarBackImage}</p>}
                       </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <input placeholder="LICENSE NUMBER" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value.toUpperCase()})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" />
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-white/40 uppercase ml-2">License Expiry Date</label>
                       <input type="date" value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="border border-dashed border-white/20 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 relative overflow-hidden">
                          <Camera size={20} className="text-[#C5A021]" />
                          <p className="text-[8px] font-black text-white/40 uppercase">License Front</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('licenseFrontImage', e.target.files[0])} />
                          {formData.licenseFrontImage && <p className="text-[7px] text-[#C5A021] font-bold truncate w-full text-center">{formData.licenseFrontImage}</p>}
                       </div>
                       <div className="border border-dashed border-white/20 p-4 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 relative overflow-hidden">
                          <Camera size={20} className="text-[#C5A021]" />
                          <p className="text-[8px] font-black text-white/40 uppercase">License Back</p>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('licenseBackImage', e.target.files[0])} />
                          {formData.licenseBackImage && <p className="text-[7px] text-[#C5A021] font-bold truncate w-full text-center">{formData.licenseBackImage}</p>}
                       </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                       <span className="text-xs font-bold text-white uppercase tracking-tight">Do you own a vehicle?</span>
                       <button type="button" onClick={() => setFormData({...formData, hasOwnVehicle: !formData.hasOwnVehicle})} className={`w-12 h-6 rounded-full p-1 transition-all ${formData.hasOwnVehicle ? 'bg-[#C5A021]' : 'bg-white/20'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.hasOwnVehicle ? 'translate-x-6' : 'translate-x-0'}`} />
                       </button>
                    </div>
                    
                    {formData.hasOwnVehicle && (
                      <div className="space-y-3 animate-in fade-in zoom-in-95">
                         <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none">
                            <option value="Mini Truck">MINI TRUCK</option>
                            <option value="Pickup">PICKUP</option>
                            <option value="Tempo">TEMPO</option>
                         </select>
                         <input placeholder="VEHICLE NUMBER" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})} className="w-full bg-[#E6E3C8]/10 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none" />
                         <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 border border-dashed border-white/20 rounded-xl flex items-center gap-2 relative overflow-hidden">
                               <FileText size={16} className="text-[#C5A021]" />
                               <span className="text-[8px] font-black text-white/40">RC UPLOAD</span>
                               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('rcImage', e.target.files[0])} />
                            </div>
                            <div className="p-3 border border-dashed border-white/20 rounded-xl flex items-center gap-2 relative overflow-hidden">
                               <FileText size={16} className="text-[#C5A021]" />
                               <span className="text-[8px] font-black text-white/40">INSURANCE</span>
                               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleFileUpload('insuranceImage', e.target.files[0])} />
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-3">
                     <div className="bg-white/5 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">NAME</span><span className="text-[10px] font-black text-white">{formData.fullName}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">MOBILE</span><span className="text-[10px] font-black text-white">{formData.mobile}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">AADHAAR</span><span className="text-[10px] font-black text-[#C5A021]">{formData.aadhaarNumber}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">LICENSE</span><span className="text-[10px] font-black text-[#C5A021]">{formData.licenseNumber}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-white/40 uppercase">VEHICLE</span><span className="text-[10px] font-black text-white">{formData.hasOwnVehicle ? formData.vehicleNumber : 'COMPANY ASSIGNED'}</span></div>
                     </div>
                     <p className="text-[8px] text-center text-white/30 uppercase font-bold leading-relaxed px-4">By submitting, you confirm that all documents provided are original and valid. Fraudulent submissions will lead to immediate ban.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                   {step > 1 && (
                     <button type="button" onClick={() => setStep(step - 1)} className="w-12 h-12 flex items-center justify-center border border-white/20 text-white rounded-xl hover:bg-white/5">
                        <ArrowLeft size={20} />
                     </button>
                   )}
                   <button type="button" onClick={() => step < 5 ? setStep(step + 1) : handleAction()} className="flex-1 bg-[#C5A021] text-black h-12 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                      {step === 5 ? 'Submit Application' : 'Next Step'} <ArrowRight size={16} />
                   </button>
                </div>
             </form>
          </div>
        );

      case 'pending':
        return (
          <div className="w-full max-w-sm text-center space-y-6 animate-in zoom-in-95 duration-500">
             <div className="w-24 h-24 bg-[#C5A021]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C5A021]/20">
                <Clock className="text-[#C5A021] animate-pulse" size={40} />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Verification Pending</h2>
                <p className="text-[10px] text-[#E6E3C8]/60 font-bold uppercase tracking-widest leading-loose">
                   Your profile is currently being reviewed by the administration.<br/>
                   This usually takes <span className="text-[#C5A021]">12-24 hours</span>.
                </p>
             </div>
             <button onClick={() => setView('login')} className="text-[10px] text-white/40 font-black uppercase tracking-widest hover:text-[#C5A021] underline underline-offset-8">Logout Session</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#6A7051] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#C5A021]/30">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      {/* Connection Indicator */}
      <div className="absolute top-8 right-12 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#C5A021] rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E3C8]">GATEWAY ACTIVE</span>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
           <div className="w-24 h-24 mb-4 relative group active:scale-95 transition-transform duration-300">
              <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-full h-full object-contain drop-shadow-2xl" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight mb-1 uppercase">Logistics Portal</h1>
           <p className="text-[9px] text-[#E6E3C8]/60 font-bold tracking-[0.3em] uppercase">Fleet Management System</p>
        </div>

        {/* Dynamic Form Area */}
        {renderView()}

        {/* Footer Branding */}
        <div className="mt-12 opacity-20">
           <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[#E6E3C8]"></div>
              <span className="text-[9px] font-black text-[#E6E3C8] uppercase tracking-[0.5em]">GF INTERNAL</span>
              <div className="w-12 h-[1px] bg-[#E6E3C8]"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DriverAuth;
