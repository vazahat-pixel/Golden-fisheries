import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { useAdminStore } from '../../../store/adminStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  FileText, 
  UserPlus, 
  CheckCircle2, 
  Upload, 
  Calendar,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { masterService } from '../../../services/masterService';

const AddVehicle = () => {
  const navigate = useNavigate();
  const { addVehicleAsync, drivers } = useAdminStore();
  
  const [step, setStep] = useState(1);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: '',
    capacity: '',
    fuelType: 'Diesel',
    gpsId: '',
    status: 'Active',
    assignedDriverId: '',
    assignedDriverName: '',
    documents: {
      rc: { status: 'VALID', expiry: '', url: '' },
      insurance: { status: 'VALID', expiry: '', url: '' },
      permit: { status: 'VALID', expiry: '', url: '' },
      fitness: { status: 'VALID', expiry: '', url: '' },
      pollution: { status: 'VALID', expiry: '', url: '' }
    }
  });

  const handleNext = () => {
    if (step === 1 && (!formData.vehicleNumber || !formData.type)) {
      return toast.error('Please enter vehicle number and type');
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addVehicleAsync(formData);
      toast.success('Vehicle added to fleet successfully!');
      navigate('/admin/vehicles');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDoc = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [type]: { ...prev.documents[type], [field]: value }
      }
    }));
  };

  const handleFileUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return toast.error('Only JPG, PNG, WebP, and PDF files are allowed');
    }

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File size exceeds 10MB limit');
    }

    setUploadingDoc(type);
    try {
      const { url } = await masterService.vehicles.uploadDocument(file);
      updateDoc(type, 'url', url);
      toast.success(`${type.toUpperCase()} document uploaded successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
      e.target.value = ''; // Reset input
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vehicle Plate Number</label>
          <input 
            type="text" 
            placeholder="E.G. KA-01-AX-1234" 
            className="w-full bg-white border border-card-border p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive shadow-sm"
            value={formData.vehicleNumber}
            onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vehicle Type</label>
          <select 
            className="w-full bg-white border border-card-border p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive shadow-sm appearance-none"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="">SELECT TYPE</option>
            <option value="TATA ACE">TATA ACE (CHOTA HATHI)</option>
            <option value="BOLERO PICKUP">MAHINDRA BOLERO PICKUP</option>
            <option value="MINI TRUCK">EICHER MINI TRUCK</option>
            <option value="TEMPO TRAVELER">FORCE TEMPO</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payload Capacity</label>
          <input 
            type="text" 
            placeholder="E.G. 750 KG" 
            className="w-full bg-white border border-card-border p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive shadow-sm"
            value={formData.capacity}
            onChange={e => setFormData({ ...formData, capacity: e.target.value.toUpperCase() })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fuel Protocol</label>
          <select 
            className="w-full bg-white border border-card-border p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive shadow-sm appearance-none"
            value={formData.fuelType}
            onChange={e => setFormData({ ...formData, fuelType: e.target.value })}
          >
            <option value="Diesel">DIESEL</option>
            <option value="Petrol">PETROL</option>
            <option value="CNG">CNG</option>
            <option value="Electric">ELECTRIC</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">GPS Device ID</label>
          <input 
            type="text" 
            placeholder="E.G. GPS-ACE-101" 
            className="w-full bg-white border border-card-border p-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive shadow-sm"
            value={formData.gpsId}
            onChange={e => setFormData({ ...formData, gpsId: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {['rc', 'insurance', 'permit', 'fitness', 'pollution'].map(docType => (
          <div key={docType} className="p-5 border border-card-border bg-slate-50/50 space-y-4">
             <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} className="text-accent-olive" /> {docType} Document
                </h4>
                <Badge variant="info" className="text-[7px] font-bold uppercase border border-card-border">Awaiting Verification</Badge>
             </div>
             <div className="space-y-3">
                <div className="relative">
                   <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    type="date" 
                    className="w-full bg-white border border-card-border py-3 pl-12 pr-4 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-accent-olive"
                    value={formData.documents[docType].expiry}
                    onChange={e => updateDoc(docType, 'expiry', e.target.value)}
                   />
                </div>
                {formData.documents[docType].url ? (
                  <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-[9px] font-black uppercase tracking-widest text-emerald-700 flex items-center justify-center gap-2 relative group cursor-pointer" onClick={() => window.open(formData.documents[docType].url, '_blank')}>
                    <CheckCircle2 size={14} /> Document Uploaded
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-black font-bold">View Document</span>
                    </div>
                  </div>
                ) : (
                  <label className={`w-full py-3 border border-card-border border-dashed text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${uploadingDoc === docType ? 'bg-slate-100 text-slate-500 cursor-wait' : 'bg-white text-slate-400 hover:bg-slate-50 cursor-pointer'}`}>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={(e) => handleFileUpload(docType, e)}
                      disabled={uploadingDoc === docType}
                    />
                    {uploadingDoc === docType ? (
                      <Loader className="animate-spin" size={14} />
                    ) : (
                      <Upload size={14} />
                    )}
                    {uploadingDoc === docType ? 'Uploading...' : 'Upload Scan'}
                  </label>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
             <UserPlus size={24} className="text-emerald-600" />
           </div>
           <h3 className="text-[12px] font-black uppercase tracking-[0.2em] italic">Assign Primary Pilot</h3>
           <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Select a verified driver for this vehicle</p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Available Drivers</label>
          <div className="grid grid-cols-1 gap-3">
             {drivers.map(driver => (
               <button 
                key={driver.id}
                onClick={() => setFormData({ ...formData, assignedDriverId: driver.id, assignedDriverName: driver.name || driver.fullName })}
                className={`p-4 border flex items-center justify-between transition-all group ${
                  formData.assignedDriverId === driver.id ? 'bg-black border-black text-white' : 'bg-white border-card-border hover:border-accent-olive'
                }`}
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center text-xs font-bold border ${formData.assignedDriverId === driver.id ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-card-border'}`}>
                      {driver.name?.substring(0, 1) || 'D'}
                    </div>
                    <div className="text-left">
                       <p className="text-[11px] font-black uppercase tracking-tight">{driver.name || driver.fullName}</p>
                       <p className={`text-[8px] font-bold uppercase tracking-widest ${formData.assignedDriverId === driver.id ? 'text-white/60' : 'text-text-muted'}`}>P: {driver.phone || driver.mobile}</p>
                    </div>
                 </div>
                 {formData.assignedDriverId === driver.id && <CheckCircle2 size={20} className="text-emerald-400" />}
               </button>
             ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 flex items-start gap-3">
           <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
           <p className="text-[8px] font-bold text-amber-900 uppercase tracking-widest leading-relaxed">
             Assigning a driver will automatically update their status to "On-Trip" or "Assigned" in the fleet records.
           </p>
        </div>
      </div>
    </div>
  );

  const steps = [
    { id: 1, label: 'Identity', icon: Truck },
    { id: 2, label: 'Compliance', icon: FileText },
    { id: 3, label: 'Pilot', icon: UserPlus }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-card-border rounded-none hover:bg-slate-50 shadow-sm transition-all">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-black tracking-tight">New <span className="text-accent-olive">Commission.</span></h1>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] mt-1">FLEET EXPANSION • VEHICLE ONBOARDING</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-card-border p-6 shadow-subtle flex justify-between relative overflow-hidden">
         <div className="absolute top-0 left-0 h-[2px] bg-accent-olive transition-all duration-500" style={{ width: `${(step/3)*100}%` }} />
         {steps.map(s => (
           <div key={s.id} className="flex flex-col items-center gap-2 relative z-10 px-8">
              <div className={`w-10 h-10 flex items-center justify-center border-2 transition-all ${
                step >= s.id ? 'bg-black border-black text-white shadow-lg' : 'bg-white border-slate-200 text-slate-300'
              }`}>
                {step > s.id ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s.id ? 'text-black' : 'text-slate-300'}`}>{s.label}</span>
           </div>
         ))}
      </div>

      <Card className="bg-white border border-card-border shadow-md min-h-[400px] flex flex-col">
        <div className="flex-1 p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="p-8 border-t border-card-border bg-slate-50/30 flex justify-between items-center">
          <Button 
            variant="outline" 
            className={`h-12 px-8 text-[10px] font-black uppercase tracking-[0.2em] border-card-border gap-3 ${step === 1 ? 'invisible' : ''}`}
            onClick={handleBack}
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          
          {step < 3 ? (
            <Button 
              className="h-12 px-10 text-[10px] font-black uppercase tracking-[0.2em] gap-3 bg-black text-white border-none shadow-lg active:scale-95 transition-all"
              onClick={handleNext}
            >
              Next Strategy <ChevronRight size={16} />
            </Button>
          ) : (
            <Button 
              className="h-12 px-12 text-[10px] font-black uppercase tracking-[0.3em] gap-3 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader className="animate-spin" size={16} /> : 'COMMISSION VEHICLE'}
            </Button>
          )}
        </div>
      </Card>

      <div className="text-center opacity-30 italic">
         <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.4em]">GF Fleet Onboarding Protocol // System-Secure</p>
      </div>
    </div>
  );
};

export default AddVehicle;
