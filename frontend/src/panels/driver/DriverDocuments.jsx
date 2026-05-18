import React, { useState, useRef } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Modal } from '../../design-system/components/Modal';
import { 
  FileText, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  Download,
  Eye,
  Camera,
  Clock,
  Upload,
  Search
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { driverService } from '../../services/driverService';

const DriverDocuments = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  const [docs, setDocs] = useState([]);

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await driverService.getMyProfile();
        const profile = res?.data || res;
        if (profile) {
          setDocs([
            { id: 'aadhaar', label: 'Aadhaar Card', value: profile.aadhaarNumber || 'Not Provided', icon: CreditCard, status: profile.registrationStatus === 'active' ? 'Verified' : 'Pending', image: profile.aadhaarFrontUrl },
            { id: 'license', label: 'Driving License', value: profile.licenseNumber || 'Not Provided', expiry: profile.licenseExpiry ? new Date(profile.licenseExpiry).toLocaleDateString() : null, icon: FileText, status: profile.registrationStatus === 'active' ? 'Verified' : 'Pending', image: profile.licenseFrontUrl },
            { id: 'rc', label: 'Vehicle RC', value: profile.vehicleNumber || 'Not Provided', icon: Truck, status: profile.registrationStatus === 'active' ? 'Verified' : 'Pending', image: profile.rcUrl },
            { id: 'insurance', label: 'Insurance Policy', expiry: profile.insuranceExpiry ? new Date(profile.insuranceExpiry).toLocaleDateString() : null, icon: ShieldCheck, status: profile.registrationStatus === 'active' ? 'Active' : 'Pending', image: profile.insuranceUrl },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch driver profile', err);
        toast.error('Failed to load documents');
      }
    };
    fetchDocs();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedDoc) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocs(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, image: event.target.result, status: 'Pending Review' } : d));
        toast.success(`${selectedDoc.label} updated and sent for verification`);
        setSelectedDoc(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = (action) => {
    toast.success(`${action} initiated`);
  };

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-soft active:scale-95 transition-all">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Vault</h2>
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Verified Credentials</p>
          </div>
        </div>
        <button onClick={() => handleAction('Sync')} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
          <ShieldCheck size={18} />
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      <div className="grid grid-cols-1 gap-3">
        {docs.map((doc) => (
          <div key={doc.id} className="glass-card p-4 rounded-[1.8rem] space-y-4 border-none shadow-extra-soft relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black border border-black/5 group-hover:rotate-3 transition-transform">
                  <doc.icon size={18} />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-black uppercase tracking-tight">{doc.label}</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{doc.value || 'Encrypted'}</p>
                </div>
              </div>
              <Badge className={`text-[7px] font-black uppercase px-2 py-0.5 border-none ${doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {doc.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/5 relative z-10">
               {doc.expiry ? (
                 <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-amber-500" />
                    <span className="text-[8px] font-bold text-gray-500 uppercase">Expires: {doc.expiry}</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span className="text-[8px] font-bold text-gray-500 uppercase">Life Valid</span>
                 </div>
               )}
               
               <div className="flex gap-2">
                 <button 
                  onClick={() => setViewingDoc(doc)} 
                  className="p-2 bg-white border border-black/5 rounded-lg text-black active:scale-95 transition-all shadow-sm"
                 >
                    <Eye size={12} />
                 </button>
                 <button 
                  onClick={() => {
                    setSelectedDoc(doc);
                    fileInputRef.current.click();
                  }} 
                  className="p-2 bg-black text-white rounded-lg active:scale-95 transition-all shadow-md"
                 >
                    <Camera size={12} />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-dark p-5 rounded-[1.8rem] flex gap-4 items-center border-none shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-10">
          <AlertCircle size={40} className="text-white" />
        </div>
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-0.5">Compliance Notice</p>
          <p className="text-[8px] font-medium text-white/60 leading-tight uppercase tracking-widest">
            Document expiry results in immediate suspension. Update before expiration.
          </p>
        </div>
      </div>

      <Modal 
        isOpen={!!viewingDoc} 
        onClose={() => setViewingDoc(null)} 
        title={viewingDoc?.label.toUpperCase() || ''}
      >
        <div className="p-4 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-2 border border-black/5 shadow-inner min-h-[300px] flex items-center justify-center overflow-hidden">
            {viewingDoc?.image ? (
              <img src={viewingDoc.image} alt={viewingDoc.label} className="max-w-full h-auto rounded-xl shadow-lg" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-300">
                <FileText size={60} />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">No Preview Available<br/><span className="text-gray-400">Please re-upload</span></p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleAction('Download')}
              className="flex-1 py-4 bg-white border border-black text-black rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all"
            >
              <Download size={14} className="inline mr-2" /> Download
            </button>
            <button 
              onClick={() => {
                setSelectedDoc(viewingDoc);
                setViewingDoc(null);
                fileInputRef.current.click();
              }}
              className="flex-1 py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <Upload size={14} className="inline mr-2" /> Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DriverDocuments;
