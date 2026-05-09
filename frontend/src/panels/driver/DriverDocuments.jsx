import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { 
  FileText, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  Download,
  Eye
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { useNavigate } from 'react-router-dom';

const DriverDocuments = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getDriverByMobile } = useDriverStore();
  const realDriver = getDriverByMobile(user?.phone);

  const dummyDriver = {
    fullName: 'RAJESH KUMAR',
    aadhaarNumber: 'XXXX-XXXX-9021',
    licenseNumber: 'KA-19-20220011223',
    licenseExpiry: '2028-12-31',
    vehicleNumber: 'KA-19-GF-001',
  };

  const driver = realDriver || dummyDriver;

  const docs = [
    { id: 'aadhaar', label: 'Aadhaar Card', value: driver.aadhaarNumber, icon: CreditCard },
    { id: 'license', label: 'Driving License', value: driver.licenseNumber, expiry: driver.licenseExpiry, icon: FileText },
    { id: 'rc', label: 'Vehicle RC', value: driver.vehicleNumber, icon: Truck },
    { id: 'insurance', label: 'Insurance Policy', icon: ShieldCheck },
  ];

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 bg-gray-50 hover:bg-gray-100 text-gray-900 transition-all flex items-center justify-center border border-gray-200">
            <ChevronLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight uppercase">Document Vault</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Verified Logistics Credentials</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
          <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Manifest</h4>
          <ShieldCheck size={12} className="text-[#6B7550]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 shadow-sm group hover:border-[#6B7550] transition-all overflow-hidden p-6">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-[#6B7550]/10 group-hover:text-[#6B7550] transition-all">
                      <doc.icon size={18} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{doc.label}</h3>
                      <p className="text-[9px] font-bold text-[#6B7550] uppercase tracking-widest mt-0.5">{doc.value || 'Verified'}</p>
                      {doc.expiry && (
                        <p className="text-[7px] font-bold text-red-500 uppercase mt-1">Expires: {doc.expiry}</p>
                      )}
                    </div>
                 </div>
                 <Badge className="text-[7px] font-bold border-none bg-[#6B7550]/10 text-[#6B7550] uppercase px-2 py-0.5">Valid</Badge>
              </div>
              
              <div className="flex gap-1">
                 <button className="flex-1 py-2 bg-gray-900 text-white text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#6B7550] transition-all">
                    <Eye size={12} /> View
                 </button>
                 <button className="flex-1 py-2 bg-gray-50 text-gray-400 text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-all border border-gray-100">
                    <Download size={12} /> Save
                 </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 text-white p-6 shadow-sm flex gap-4 items-start border-l-4 border-[#6B7550]">
          <AlertCircle size={20} className="text-[#6B7550] shrink-0" />
          <div className="space-y-1">
             <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B7550]">Compliance Policy</p>
             <p className="text-[9px] font-medium text-gray-400 leading-relaxed uppercase tracking-widest">
                Document expiry results in immediate operational suspension. Ensure all records are updated before expiration.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDocuments;
