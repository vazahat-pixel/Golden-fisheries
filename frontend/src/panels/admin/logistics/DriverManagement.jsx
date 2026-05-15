import React, { useState, useEffect } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { Modal } from '../../../design-system/components/Modal';
import { useAdminStore } from '../../../store/adminStore';
import { useDriverStore } from '../../../store/driverStore';
import { 
  Phone, 
  Truck, 
  MapPin, 
  UserPlus, 
  MoreVertical,
  Activity,
  FileCheck,
  Star,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Check,
  CheckCircle2,
  User,
  ShieldCheck,
  Eye,
  X,
  CreditCard,
  FileText,
  AlertCircle,
  Maximize,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverManagement = () => {
  const { drivers: legacyDrivers, fetchDrivers, loading } = useAdminStore();
  const { drivers: registeredDrivers, approveDriver, rejectDriver } = useDriverStore();
  
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ title: '', url: '' });

  // Debounced Search on real backend API
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDrivers(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery, fetchDrivers]);

  // Combine or filter drivers
  const allDrivers = legacyDrivers.length > 0 ? legacyDrivers : [...registeredDrivers];
  
  const handlePreview = (title, url) => {
    // For demo purposes, we use a generic high-quality document placeholder
    // In production, this would be the actual document URL from the store
    const demoImg = title.includes('AADHAAR') 
      ? 'https://images.unsplash.com/photo-1633158829585-23bb8f628932?q=80&w=1600&auto=format&fit=crop' 
      : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop';
    
    setPreviewData({ title, url: url || demoImg });
    setIsPreviewOpen(true);
  };
  
  const filteredDrivers = allDrivers.filter(d => {
    const driverName = (d.fullName || d.name || '').toLowerCase();
    const driverVehicle = (d.vehicleNumber || d.vehicle || '').toLowerCase();
    
    const matchesSearch = driverName.includes(searchQuery.toLowerCase()) || 
                          driverVehicle.includes(searchQuery.toLowerCase());
    
    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'PENDING') return matchesSearch && d.status === 'pending_verification';
    if (activeTab === 'APPROVED') return matchesSearch && d.status === 'active';
    if (activeTab === 'REJECTED') return matchesSearch && d.status === 'rejected';
    return matchesSearch;
  });

  const handleApprove = (id) => {
    approveDriver(id, 'Mahesh Admin');
    toast.success('Driver Approved & Activated');
    setSelectedDriver(null);
  };

  const handleReject = () => {
    if (!rejectionReason) return toast.error('Please provide a reason');
    rejectDriver(selectedDriver.id, rejectionReason);
    toast.success('Driver Registration Rejected');
    setShowRejectModal(false);
    setSelectedDriver(null);
    setRejectionReason('');
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'on-trip': return 'warning';
      case 'inactive': return 'danger';
      case 'pending_verification': return 'warning';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-black tracking-tight">Logistics <span className="text-accent-olive">Fleet.</span></h1>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Personnel Management & Onboarding Control</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="TOTAL FLEET" value={allDrivers.length.toString()} icon={Truck} trend="REGISTERED" trendType="up" />
        <StatCard title="PENDING REVIEW" value={allDrivers.filter(d => d.status === 'pending_verification').length.toString()} icon={AlertCircle} trend="ACTION REQUIRED" trendType="warning" />
        <StatCard title="ACTIVE DRIVERS" value={allDrivers.filter(d => d.status === 'active').length.toString()} icon={Activity} trend="OPERATIONAL" trendType="up" />
        <StatCard title="REJECTED" value={allDrivers.filter(d => d.status === 'rejected').length.toString()} icon={X} trend="INELIGIBLE" trendType="down" />
      </div>

      {/* Tabs & Search */}
      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        <div className="border-b border-card-border">
           <div className="flex gap-8 px-6">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-black' : 'text-text-muted hover:text-black'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" />}
                  {tab === 'PENDING' && allDrivers.filter(d => d.status === 'pending_verification').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{allDrivers.filter(d => d.status === 'pending_verification').length}</span>
                  )}
                </button>
              ))}
           </div>
        </div>

        <div className="px-6 py-4 flex flex-col md:flex-row justify-between gap-4 border-b border-card-border bg-olive-50/10">
          <div className="relative flex-1 md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME, MOBILE, OR VEHICLE ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border rounded-none py-3 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Driver List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/10">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Personnel</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Documents</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Vehicle</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Reg. Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/50">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-olive-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xs border border-black shadow-md overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=${driver.fullName || driver.name}&background=0A0B09&color=C5A021&size=128&bold=true`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black uppercase tracking-tight">{driver.fullName || driver.name}</p>
                        <p className="text-[10px] text-text-muted font-bold tracking-widest">{driver.mobile || driver.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex gap-2">
                        <div className={`p-1 rounded ${driver.aadhaarNumber ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} title="AADHAAR"><CreditCard size={14} /></div>
                        <div className={`p-1 rounded ${driver.licenseNumber ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} title="LICENSE"><FileText size={14} /></div>
                        {driver.hasOwnVehicle && <div className="p-1 rounded bg-blue-100 text-blue-700" title="VEHICLE DOCS"><Truck size={14} /></div>}
                     </div>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-[11px] font-bold text-black uppercase">{driver.vehicleNumber || driver.vehicle || 'COMPANY ASSIGNED'}</p>
                     <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">{driver.vehicleType || '---'}</p>
                  </td>
                  <td className="px-6 py-5 text-[11px] font-bold text-black">{driver.registeredAt}</td>
                  <td className="px-6 py-5">
                    <Badge variant={getStatusVariant(driver.status)} className="px-4 py-1 text-[9px] font-bold border border-card-border shadow-none whitespace-nowrap uppercase tracking-widest">
                      {driver.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 px-3 border-card-border text-[9px] font-bold gap-2"
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <Eye size={14} /> VIEW DETAILS
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <Modal 
          isOpen={!!selectedDriver} 
          onClose={() => setSelectedDriver(null)} 
          title={`DRIVER VERIFICATION: ${selectedDriver.fullName || selectedDriver.name}`}
          maxWidth="max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
             {/* Left Column: Personal Info */}
             <div className="space-y-6">
                <div className="flex flex-col items-center p-6 bg-olive-50/50 border border-card-border">
                   <div className="w-24 h-24 bg-black border-2 border-accent-olive shadow-xl mb-4 overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${selectedDriver.fullName}&background=0A0B09&color=C5A021&size=256&bold=true`} alt="" className="w-full h-full object-cover" />
                   </div>
                   <h3 className="text-sm font-black text-black uppercase">{selectedDriver.fullName}</h3>
                   <p className="text-[10px] font-bold text-text-muted tracking-widest">{selectedDriver.id}</p>
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Contact Details</label>
                      <div className="p-3 bg-white border border-card-border space-y-1">
                         <p className="text-[10px] font-black text-black">P: {selectedDriver.mobile || selectedDriver.phone}</p>
                         {selectedDriver.alternateMobile && <p className="text-[10px] font-bold text-text-muted">A: {selectedDriver.alternateMobile}</p>}
                      </div>
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Address Info</label>
                      <div className="p-3 bg-white border border-card-border space-y-2">
                         <p className="text-[9px] font-black text-black uppercase leading-relaxed">Current: {selectedDriver.currentAddress}</p>
                         <p className="text-[9px] font-bold text-text-muted uppercase leading-relaxed border-t border-olive-50 pt-1">Perm: {selectedDriver.permanentAddress}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Right Columns: Documents */}
             <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {/* Aadhaar Card */}
                   <Card className="border border-card-border">
                      <div className="flex items-center justify-between mb-3">
                         <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> Aadhaar Card</h4>
                         <Badge variant="success" className="text-[8px] font-bold">READY</Badge>
                      </div>
                      <p className="text-[11px] font-bold text-black mb-3">{selectedDriver.aadhaarNumber}</p>
                      <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => handlePreview('AADHAAR FRONT', selectedDriver.aadhaarFrontImage)} className="aspect-video bg-olive-50 rounded border border-card-border flex flex-col items-center justify-center gap-1 hover:bg-olive-100/50 transition-all group relative overflow-hidden">
                            <Maximize size={12} className="text-accent-olive opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1" />
                            <span className="text-[8px] font-black text-text-muted uppercase">Front Image</span>
                         </button>
                         <button onClick={() => handlePreview('AADHAAR BACK', selectedDriver.aadhaarBackImage)} className="aspect-video bg-olive-50 rounded border border-card-border flex flex-col items-center justify-center gap-1 hover:bg-olive-100/50 transition-all group relative overflow-hidden">
                            <Maximize size={12} className="text-accent-olive opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1" />
                            <span className="text-[8px] font-black text-text-muted uppercase">Back Image</span>
                         </button>
                      </div>
                   </Card>

                   {/* Driving License */}
                   <Card className="border border-card-border">
                      <div className="flex items-center justify-between mb-3">
                         <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> License</h4>
                         <Badge variant="success" className="text-[8px] font-bold">READY</Badge>
                      </div>
                      <p className="text-[11px] font-bold text-black mb-1">{selectedDriver.licenseNumber}</p>
                      <p className="text-[9px] font-bold text-red-500 mb-2 uppercase">EXP: {selectedDriver.licenseExpiry}</p>
                      <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => handlePreview('LICENSE FRONT', selectedDriver.licenseFrontImage)} className="aspect-video bg-olive-50 rounded border border-card-border flex flex-col items-center justify-center gap-1 hover:bg-olive-100/50 transition-all group relative overflow-hidden">
                            <Maximize size={12} className="text-accent-olive opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1" />
                            <span className="text-[8px] font-black text-text-muted uppercase">Front Image</span>
                         </button>
                         <button onClick={() => handlePreview('LICENSE BACK', selectedDriver.licenseBackImage)} className="aspect-video bg-olive-50 rounded border border-card-border flex flex-col items-center justify-center gap-1 hover:bg-olive-100/50 transition-all group relative overflow-hidden">
                            <Maximize size={12} className="text-accent-olive opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1" />
                            <span className="text-[8px] font-black text-text-muted uppercase">Back Image</span>
                         </button>
                      </div>
                   </Card>
                </div>

                {/* Vehicle Section */}
                {selectedDriver.hasOwnVehicle && (
                  <Card className="border border-card-border bg-olive-50/20">
                    <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-4"><Truck size={14} /> Own Vehicle Documents</h4>
                    <div className="grid grid-cols-4 gap-3">
                       {[
                         { label: 'RC', expiry: selectedDriver.rcExpiry },
                         { label: 'Insurance', expiry: selectedDriver.insuranceExpiry },
                         { label: 'Permit', expiry: selectedDriver.permitExpiry },
                         { label: 'PUC', expiry: selectedDriver.pucExpiry }
                       ].map(doc => (
                         <button key={doc.label} onClick={() => handlePreview(`${doc.label.toUpperCase()} DOCUMENT`, null)} className="flex flex-col items-center group">
                            <div className="w-full aspect-square bg-white border border-card-border flex items-center justify-center mb-1 group-hover:bg-olive-50 transition-all relative">
                               <FileText size={16} className="text-accent-olive" />
                               <Maximize size={10} className="text-accent-olive opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1" />
                            </div>
                            <span className="text-[8px] font-black text-black uppercase">{doc.label}</span>
                            <span className="text-[7px] font-bold text-red-500 uppercase tracking-tighter">EXP: {doc.expiry || 'TBD'}</span>
                         </button>
                       ))}
                    </div>
                  </Card>
                )}

                {/* Status-Based Actions */}
                <div className="pt-6 border-t border-card-border flex gap-4">
                   {selectedDriver.status === 'pending_verification' ? (
                     <>
                        <Button 
                          className="flex-1 h-12 text-[10px] font-black tracking-widest gap-2 shadow-lg"
                          onClick={() => handleApprove(selectedDriver.id)}
                        >
                          <Check size={16} /> APPROVE & ACTIVATE
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 h-12 text-[10px] font-black tracking-widest gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => setShowRejectModal(true)}
                        >
                          <X size={16} /> REJECT APPLICATION
                        </Button>
                     </>
                   ) : selectedDriver.status === 'active' ? (
                     <div className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200">
                        <div className="flex items-center gap-3 text-green-700">
                           <CheckCircle2 size={24} />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest">VERIFIED & ACTIVE</p>
                              <p className="text-[8px] font-bold">BY {selectedDriver.verifiedBy} ON {selectedDriver.verifiedAt}</p>
                           </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-red-500 text-red-500 h-8 text-[8px] font-black">DEACTIVATE</Button>
                     </div>
                   ) : selectedDriver.status === 'rejected' && (
                     <div className="w-full p-4 bg-red-50 border border-red-200">
                        <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">APPLICATION REJECTED</p>
                        <p className="text-[9px] font-bold text-red-600">REASON: {selectedDriver.rejectionReason}</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </Modal>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <Modal 
          isOpen={showRejectModal} 
          onClose={() => setShowRejectModal(false)} 
          title="REJECT DRIVER APPLICATION"
          maxWidth="max-w-md"
        >
           <div className="space-y-4 py-4">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
                 Please provide a clear reason for rejection. This will be shown to the driver.
              </p>
              <textarea 
                placeholder="E.G. INCOMPLETE LICENSE IMAGES / EXPIRED INSURANCE..." 
                className="w-full border border-card-border p-4 text-xs font-bold outline-none focus:ring-1 focus:ring-red-500 h-32"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3">
                 <Button variant="outline" className="flex-1 h-11 text-[10px] font-black border-card-border" onClick={() => setShowRejectModal(false)}>CANCEL</Button>
                 <Button className="flex-1 h-11 text-[10px] font-black bg-red-600 hover:bg-red-700 text-white border-none" onClick={handleReject}>CONFIRM REJECTION</Button>
              </div>
           </div>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {isPreviewOpen && (
        <Modal 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          title={`DOCUMENT PREVIEW: ${previewData.title}`}
          maxWidth="max-w-5xl"
        >
           <div className="p-2 space-y-4">
              <div className="aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden border border-card-border shadow-2xl relative group">
                 <img 
                   src={previewData.url} 
                   alt={previewData.title} 
                   className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                 />
                 <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 text-white text-[8px] font-black uppercase tracking-widest border border-white/20">
                    High Resolution Verification Mode
                 </div>
              </div>
              <div className="flex justify-between items-center bg-olive-50/50 p-4 border border-card-border">
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-green-600" />
                       <span className="text-[9px] font-black text-black uppercase tracking-widest">Digitally Signed</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-card-border pl-4">
                       <Clock size={16} className="text-accent-olive" />
                       <span className="text-[9px] font-black text-black uppercase tracking-widest">Uploaded: {new Date().toLocaleDateString()}</span>
                    </div>
                 </div>
                 <Button className="h-9 px-6 text-[9px] font-black tracking-widest" onClick={() => setIsPreviewOpen(false)}>CLOSE PREVIEW</Button>
              </div>
           </div>
        </Modal>
      )}
    </div>
  );
};

export default DriverManagement;
