import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { Modal } from '../../../design-system/components/Modal';
import { driverService } from '../../../services/driverService';
import {
  Phone, Truck, UserPlus, Activity, FileCheck, Search,
  Trash2, RefreshCw, Check, CheckCircle2, ShieldCheck, Eye,
  X, CreditCard, FileText, AlertCircle, Maximize, Clock, Loader
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Document Badge helper ─────────────────────────────────────────────
const DocBadge = ({ label, url, onClick }) => (
  <button
    onClick={() => url && onClick(label, url)}
    title={url ? label : `${label} — not uploaded`}
    className={`flex flex-col items-center gap-0.5 group`}
  >
    <div className={`w-8 h-8 flex items-center justify-center rounded border text-[9px] font-black transition-all
      ${url ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer' : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'}`}>
      {label.substring(0, 2).toUpperCase()}
    </div>
    {url && <Maximize size={8} className="text-accent-olive opacity-0 group-hover:opacity-100 transition-opacity" />}
  </button>
);

// ─── Main Component ─────────────────────────────────────────────────────
const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [preview, setPreview] = useState(null); // { title, url }

  // ── Fetch drivers from backend ───────────────────────────
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const statusMap = { PENDING: 'pending_verification', APPROVED: 'active', REJECTED: 'rejected' };
      const params = {};
      if (activeTab !== 'ALL') params.status = statusMap[activeTab];
      if (searchQuery) params.search = searchQuery;

      const res = await driverService.getAll(params);
      // Response is array of DriverProfile docs with userId populated
      const list = res?.data || (Array.isArray(res) ? res : []);
      setDrivers(list);
    } catch (err) {
      toast.error('Failed to load drivers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const handler = setTimeout(fetchDrivers, 300);
    return () => clearTimeout(handler);
  }, [fetchDrivers]);

  // ── Approve ──────────────────────────────────────────────
  const handleApprove = async (profileId) => {
    setActionLoading(true);
    try {
      await driverService.approve(profileId);
      toast.success('Driver Approved & Activated ✓');
      setSelectedDriver(null);
      fetchDrivers();
    } catch (err) {
      toast.error(err?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ───────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectionReason.trim()) return toast.error('Please enter a rejection reason');
    setActionLoading(true);
    try {
      await driverService.reject(selectedDriver._id, rejectionReason);
      toast.success('Driver registration rejected');
      setShowRejectModal(false);
      setSelectedDriver(null);
      setRejectionReason('');
      fetchDrivers();
    } catch (err) {
      toast.error(err?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────
  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending_verification': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status) => ({
    active: 'ACTIVE',
    pending_verification: 'PENDING REVIEW',
    rejected: 'REJECTED'
  }[status] || status?.toUpperCase() || '—');

  const counts = {
    all: drivers.length,
    pending: drivers.filter(d => d.registrationStatus === 'pending_verification').length,
    active: drivers.filter(d => d.registrationStatus === 'active').length,
    rejected: drivers.filter(d => d.registrationStatus === 'rejected').length
  };

  const tabMap = { ALL: 'all', PENDING: 'pending', APPROVED: 'active', REJECTED: 'rejected' };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-black tracking-tight">
            Logistics <span className="text-accent-olive">Fleet.</span>
          </h1>
          <p className="text-text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Personnel Management & Onboarding Control
          </p>
        </div>
        <Button
          onClick={fetchDrivers}
          variant="outline"
          className="h-9 px-4 gap-2 text-[9px] font-black border-card-border uppercase tracking-widest"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> REFRESH
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="TOTAL FLEET"     value={counts.all.toString()}      icon={Truck}        trend="REGISTERED"       trendType="up" />
        <StatCard title="PENDING REVIEW"  value={counts.pending.toString()}  icon={AlertCircle}  trend="ACTION REQUIRED"  trendType="warning" />
        <StatCard title="ACTIVE DRIVERS"  value={counts.active.toString()}   icon={Activity}     trend="OPERATIONAL"      trendType="up" />
        <StatCard title="REJECTED"        value={counts.rejected.toString()} icon={X}            trend="INELIGIBLE"       trendType="down" />
      </div>

      {/* Table Card */}
      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        {/* Tabs */}
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
                {tab === 'PENDING' && counts.pending > 0 && (
                  <span className="ml-2 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{counts.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-card-border bg-olive-50/10">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="SEARCH BY NAME, MOBILE, LICENSE..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border py-2.5 pl-10 pr-4 text-[9px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none"
            />
          </div>
        </div>

        {/* Driver Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-text-muted">
            <Loader className="animate-spin" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Loading Drivers...</span>
          </div>
        ) : drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
            <UserPlus size={32} className="opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest">No drivers found</p>
            <p className="text-[9px] font-bold opacity-50">Drivers register via the Driver Portal</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-olive-100/10">
                  {['Personnel', 'Documents', 'Vehicle', 'Registered', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-[9px] font-bold text-text-muted uppercase tracking-[0.15em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-100/40">
                {drivers.map(driver => {
                  const user = driver.userId || {};
                  const name = user.fullName || '—';
                  const phone = user.phone || '—';
                  return (
                    <tr key={driver._id} className="hover:bg-olive-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-black flex-shrink-0">
                            {driver.profilePhotoUrl
                              ? <img src={driver.profilePhotoUrl} alt={name} className="w-full h-full object-cover" />
                              : <img src={`https://ui-avatars.com/api/?name=${name}&background=0A0B09&color=C5A021&size=80&bold=true`} alt={name} className="w-full h-full object-cover" />
                            }
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-black uppercase tracking-tight leading-none">{name}</p>
                            <p className="text-[9px] text-text-muted font-bold tracking-widest mt-0.5">{phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap">
                          <DocBadge label="ADH" url={driver.aadhaarFrontUrl} onClick={(t, u) => setPreview({ title: t, url: u })} />
                          <DocBadge label="LIC" url={driver.licenseFrontUrl} onClick={(t, u) => setPreview({ title: t, url: u })} />
                          {driver.hasOwnVehicle && <DocBadge label="RC" url={driver.rcUrl} onClick={(t, u) => setPreview({ title: t, url: u })} />}
                          {driver.hasOwnVehicle && <DocBadge label="INS" url={driver.insuranceUrl} onClick={(t, u) => setPreview({ title: t, url: u })} />}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[11px] font-black text-black uppercase leading-none">{driver.vehicleNumber || 'COMPANY ASSIGNED'}</p>
                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{driver.vehicleType || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-[10px] font-bold text-text-muted">
                        {new Date(driver.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={getStatusVariant(driver.registrationStatus)} className="px-3 py-1 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                          {getStatusLabel(driver.registrationStatus)}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm" variant="outline"
                          className="h-8 px-3 border-card-border text-[9px] font-bold gap-1"
                          onClick={() => setSelectedDriver(driver)}
                        >
                          <Eye size={12} /> REVIEW
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Driver Detail Modal ──────────────────────────────── */}
      {selectedDriver && (
        <Modal
          isOpen={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          title={`DRIVER REVIEW: ${selectedDriver.userId?.fullName || 'Unknown'}`}
          maxWidth="max-w-4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-4">
            {/* Left — Personal Info */}
            <div className="space-y-4">
              <div className="flex flex-col items-center p-5 bg-olive-50/50 border border-card-border">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-black border-2 border-accent-olive mb-3">
                  {selectedDriver.profilePhotoUrl
                    ? <img src={selectedDriver.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                    : <img src={`https://ui-avatars.com/api/?name=${selectedDriver.userId?.fullName}&background=0A0B09&color=C5A021&size=200&bold=true`} alt="" className="w-full h-full object-cover" />
                  }
                </div>
                <h3 className="text-sm font-black text-black uppercase text-center">{selectedDriver.userId?.fullName}</h3>
                <p className="text-[9px] font-bold text-text-muted mt-0.5">{selectedDriver.userId?.phone}</p>
                <Badge variant={getStatusVariant(selectedDriver.registrationStatus)} className="mt-2 text-[8px] font-black">
                  {getStatusLabel(selectedDriver.registrationStatus)}
                </Badge>
              </div>

              <div className="space-y-3 text-[10px]">
                <div className="p-3 bg-white border border-card-border space-y-1">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Contact</p>
                  <p className="font-black text-black">📱 {selectedDriver.userId?.phone}</p>
                  {selectedDriver.alternateMobile && <p className="font-bold text-text-muted">Alt: {selectedDriver.alternateMobile}</p>}
                </div>
                <div className="p-3 bg-white border border-card-border space-y-1">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Address</p>
                  <p className="font-black text-black leading-relaxed">{selectedDriver.currentAddress || '—'}</p>
                  {selectedDriver.permanentAddress && selectedDriver.permanentAddress !== selectedDriver.currentAddress && (
                    <p className="font-bold text-text-muted leading-relaxed border-t pt-1">{selectedDriver.permanentAddress}</p>
                  )}
                </div>
                <div className="p-3 bg-white border border-card-border">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">License</p>
                  <p className="font-black text-black">{selectedDriver.licenseNumber}</p>
                  <p className="font-bold text-red-500 text-[9px]">
                    EXP: {selectedDriver.licenseExpiry ? new Date(selectedDriver.licenseExpiry).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
                {selectedDriver.hasOwnVehicle && (
                  <div className="p-3 bg-white border border-card-border">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Vehicle</p>
                    <p className="font-black text-black">{selectedDriver.vehicleNumber}</p>
                    <p className="font-bold text-text-muted text-[9px]">{selectedDriver.vehicleType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right — Documents */}
            <div className="md:col-span-2 space-y-4">
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Uploaded Documents</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Aadhaar Front', url: selectedDriver.aadhaarFrontUrl },
                  { label: 'Aadhaar Back',  url: selectedDriver.aadhaarBackUrl },
                  { label: 'PAN Card',       url: selectedDriver.panImageUrl },
                  { label: 'License Front',  url: selectedDriver.licenseFrontUrl },
                  { label: 'License Back',   url: selectedDriver.licenseBackUrl },
                  { label: 'RC Book',        url: selectedDriver.rcUrl },
                  { label: 'Insurance',      url: selectedDriver.insuranceUrl },
                  { label: 'Permit',         url: selectedDriver.permitUrl },
                  { label: 'PUC',            url: selectedDriver.pucUrl },
                ].map(doc => (
                  <button
                    key={doc.label}
                    onClick={() => doc.url && setPreview({ title: doc.label, url: doc.url })}
                    disabled={!doc.url}
                    className={`aspect-video rounded border flex flex-col items-center justify-center gap-1 text-[8px] font-black uppercase transition-all overflow-hidden relative group
                      ${doc.url
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                        : 'border-card-border bg-slate-50 text-text-muted cursor-not-allowed opacity-50'
                      }`}
                  >
                    {doc.url
                      ? <img src={doc.url} alt={doc.label} className="w-full h-full object-cover absolute inset-0" />
                      : <FileText size={20} className="opacity-30" />
                    }
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 text-white text-[7px] font-black text-center">
                      {doc.label}
                    </div>
                    {doc.url && <Maximize size={12} className="absolute top-1 right-1 text-white opacity-0 group-hover:opacity-100" />}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-card-border">
                {selectedDriver.registrationStatus === 'pending_verification' && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-11 text-[10px] font-black tracking-widest gap-2"
                      onClick={() => handleApprove(selectedDriver._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <Loader className="animate-spin" size={14} /> : <Check size={16} />}
                      APPROVE & ACTIVATE
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 text-[10px] font-black tracking-widest gap-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                    >
                      <X size={16} /> REJECT
                    </Button>
                  </div>
                )}
                {selectedDriver.registrationStatus === 'active' && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded">
                    <CheckCircle2 size={24} className="text-green-600" />
                    <div>
                      <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">VERIFIED & ACTIVE</p>
                      <p className="text-[9px] text-green-600 font-bold">
                        By {selectedDriver.verifiedBy} • {selectedDriver.verifiedAt ? new Date(selectedDriver.verifiedAt).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                  </div>
                )}
                {selectedDriver.registrationStatus === 'rejected' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">APPLICATION REJECTED</p>
                    <p className="text-[9px] font-bold text-red-600">REASON: {selectedDriver.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Reject Reason Modal ─────────────────────────────── */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="REJECT DRIVER APPLICATION"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 py-4">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
              Provide a clear reason — this will be shown to the driver.
            </p>
            <textarea
              placeholder="E.G. INCOMPLETE LICENSE IMAGES / EXPIRED INSURANCE..."
              className="w-full border border-card-border p-4 text-xs font-bold outline-none focus:ring-1 focus:ring-red-400 h-32"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11 text-[9px] font-black border-card-border" onClick={() => setShowRejectModal(false)}>CANCEL</Button>
              <Button
                className="flex-1 h-11 text-[9px] font-black bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader className="animate-spin" size={14} /> : 'CONFIRM REJECTION'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Image Preview Modal ─────────────────────────────── */}
      {preview && (
        <Modal
          isOpen={!!preview}
          onClose={() => setPreview(null)}
          title={`DOCUMENT PREVIEW: ${preview.title}`}
          maxWidth="max-w-4xl"
        >
          <div className="p-2 space-y-3">
            <div className="aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden border border-card-border shadow-2xl relative">
              <img src={preview.url} alt={preview.title} className="w-full h-full object-contain" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 text-white text-[8px] font-black uppercase tracking-widest border border-white/20">
                Cloudinary CDN • Secure
              </div>
            </div>
            <div className="flex justify-between items-center bg-olive-50/50 p-3 border border-card-border">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-green-600" />
                <span className="text-[9px] font-black text-black uppercase tracking-widest">Encrypted & Verified</span>
              </div>
              <div className="flex gap-2">
                <a href={preview.url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="h-8 px-4 text-[8px] font-black border-card-border uppercase">OPEN FULL</Button>
                </a>
                <Button size="sm" className="h-8 px-4 text-[8px] font-black" onClick={() => setPreview(null)}>CLOSE</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DriverManagement;
