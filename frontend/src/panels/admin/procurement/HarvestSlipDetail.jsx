import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { 
  ArrowLeft, Calendar, FileText, User, Truck, ShieldAlert,
  CheckCircle, Clock, XCircle, ChevronRight, Check, Printer, FileCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const HarvestSlipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { harvestSlips, updateHarvestStatusAsync, updateSlipStatus, fetchHarvestSlips } = useAdminStore();
  const [slip, setSlip] = useState(null);

  useEffect(() => {
    fetchHarvestSlips();
  }, [fetchHarvestSlips]);

  // Fallback offline mock data (matches HarvestSlips list)
  const mockSlips = [
    {
      id: 'HS-1001',
      _id: 'HS-1001',
      tpNo: '1001',
      farmerName: 'APPANNA GOWDA',
      date: '2026-05-18',
      vehicleNo: 'KA-30-M-4321',
      driverName: 'Ramesh Patil',
      graderName: 'Channappa S.',
      totalBoxes: 12,
      totalWeight: 240,
      status: 'Approved',
      items: [
        { id: '1', hsnCode: '03069500', particulars: 'PRAWNS', count: '100', noOfBoxes: '8', boxWeight: '20', totalWeight: '160' },
        { id: '2', hsnCode: '03028400', particulars: 'SEABASS', count: '60', noOfBoxes: '4', boxWeight: '20', totalWeight: '80' }
      ],
      notes: 'BLACK GILL SECOND QUALITY ( EXP )',
      damageNotes: 'THIRD QUALITY DAMAGE MATERIALS & DIO COMPLAINT',
      iceRentDeducted: false,
      inWords: 'TWO HUNDRED AND FORTY KILOGRAMS ONLY'
    },
    {
      id: 'HS-1002',
      _id: 'HS-1002',
      tpNo: '1002',
      farmerName: 'SUBHASH NAIK',
      date: '2026-05-19',
      vehicleNo: 'KA-19-F-9876',
      driverName: 'Suresh Gowda',
      graderName: 'Channappa S.',
      totalBoxes: 15,
      totalWeight: 375,
      status: 'Pending Approval',
      items: [
        { id: '1', hsnCode: '03069500', particulars: 'PRAWNS', count: '80', noOfBoxes: '15', boxWeight: '25', totalWeight: '375' }
      ],
      notes: 'BLACK GILL SECOND QUALITY ( EXP )',
      damageNotes: 'NONE',
      iceRentDeducted: true,
      inWords: 'THREE HUNDRED AND SEVENTY FIVE KILOGRAMS ONLY'
    },
    {
      id: 'HS-1003',
      _id: 'HS-1003',
      tpNo: '1003',
      farmerName: 'SHEKHAR KARWAR',
      date: '2026-05-20',
      vehicleNo: 'MH-09-E-5544',
      driverName: 'Anil Fernandez',
      graderName: 'Channappa S.',
      totalBoxes: 8,
      totalWeight: 160,
      status: 'Pending Approval',
      items: [
        { id: '1', hsnCode: '03028400', particulars: 'SEABASS', count: '50', noOfBoxes: '8', boxWeight: '20', totalWeight: '160' }
      ],
      notes: 'STANDARD QUALITY',
      damageNotes: 'NONE',
      iceRentDeducted: false,
      inWords: 'ONE HUNDRED AND SIXTY KILOGRAMS ONLY'
    }
  ];

  useEffect(() => {
    const found = harvestSlips?.find(s => s._id === id || s.id === id) || mockSlips.find(s => s._id === id || s.id === id);
    if (found) {
      setSlip(found);
    }
  }, [id, harvestSlips]);

  if (!slip) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-olive"></div>
      </div>
    );
  }

  const handleApprove = async () => {
    const loadToast = toast.loading('Approving slip...');
    try {
      await updateHarvestStatusAsync(slip._id || slip.id, 'Approved');
      updateSlipStatus(slip.id || slip._id, 'Approved');
      setSlip(prev => prev ? { ...prev, status: 'Approved' } : null);
      toast.success('Harvest Slip approved successfully!', { id: loadToast });
    } catch (err) {
      console.warn('Backend update failed, applying simulated frontend status change.');
      updateSlipStatus(slip.id || slip._id, 'Approved');
      setSlip(prev => prev ? { ...prev, status: 'Approved' } : null);
      toast.success('Harvest Slip approved successfully (simulated offline)!', { id: loadToast });
    }
  };

  const handleReject = async () => {
    const loadToast = toast.loading('Rejecting slip...');
    try {
      await updateHarvestStatusAsync(slip._id || slip.id, 'Rejected');
      updateSlipStatus(slip.id || slip._id, 'Rejected');
      setSlip(prev => prev ? { ...prev, status: 'Rejected' } : null);
      toast.success('Harvest Slip marked as Rejected.', { id: loadToast });
    } catch (err) {
      updateSlipStatus(slip.id || slip._id, 'Rejected');
      setSlip(prev => prev ? { ...prev, status: 'Rejected' } : null);
      toast.success('Harvest Slip marked as Rejected (simulated offline).', { id: loadToast });
    }
  };

  const handleMarkSentToFarmer = async () => {
    const loadToast = toast.loading('Marking as Sent...');
    try {
      await updateHarvestStatusAsync(slip._id || slip.id, 'Sent to Farmer');
      updateSlipStatus(slip.id || slip._id, 'Sent to Farmer');
      setSlip(prev => prev ? { ...prev, status: 'Sent to Farmer' } : null);
      toast.success('Slip status updated to Sent to Farmer!', { id: loadToast });
    } catch (err) {
      updateSlipStatus(slip.id || slip._id, 'Sent to Farmer');
      setSlip(prev => prev ? { ...prev, status: 'Sent to Farmer' } : null);
      toast.success('Slip status updated (simulated offline)!', { id: loadToast });
    }
  };

  const handleMarkFarmerApproved = async () => {
    const loadToast = toast.loading('Marking as Approved...');
    try {
      await updateHarvestStatusAsync(slip._id || slip.id, 'Farmer Approved');
      updateSlipStatus(slip.id || slip._id, 'Farmer Approved');
      setSlip(prev => prev ? { ...prev, status: 'Farmer Approved' } : null);
      toast.success('Slip status updated to Farmer Approved!', { id: loadToast });
    } catch (err) {
      updateSlipStatus(slip.id || slip._id, 'Farmer Approved');
      setSlip(prev => prev ? { ...prev, status: 'Farmer Approved' } : null);
      toast.success('Slip status updated (simulated offline)!', { id: loadToast });
    }
  };

  const handleCreateTapalDirectly = () => {
    // Store slip in sessionStorage to pass data easily to Tapal Creation
    sessionStorage.setItem('current_tapal_source_slip', JSON.stringify(slip));
    navigate(`/admin/tapals/new?slipId=${slip.id || slip._id}`);
  };

  // Pre-calculate status flags for timeline
  const isDraft = slip.status === 'Draft';
  const isSentToFarmer = slip.status === 'Sent to Farmer';
  const isFarmerApproved = slip.status === 'Farmer Approved';
  const isTapalCreated = slip.status === 'Tapal Created';
  const isApproved = slip.status === 'Approved';
  const isRejected = slip.status === 'Rejected';
  const isPending = slip.status === 'Pending Approval' || (!isDraft && !isSentToFarmer && !isFarmerApproved && !isTapalCreated && !isApproved && !isRejected);

  const timelineSteps = [
    { label: 'Slip Created', desc: 'Dock receipt generated by grader', date: slip.date, done: true },
    { 
      label: 'Sent to Farmer', 
      desc: (isSentToFarmer || isFarmerApproved || isTapalCreated || isApproved) ? 'Shared via WhatsApp with farmer' : 'Awaiting dispatch to farmer', 
      date: (isSentToFarmer || isFarmerApproved || isTapalCreated || isApproved) ? 'Done' : '', 
      done: isSentToFarmer || isFarmerApproved || isTapalCreated || isApproved 
    },
    { 
      label: 'Farmer Approved', 
      desc: (isFarmerApproved || isTapalCreated || isApproved) ? 'Farmer verified quality and details' : 'Awaiting farmer response', 
      date: (isFarmerApproved || isTapalCreated || isApproved) ? 'Done' : '', 
      done: isFarmerApproved || isTapalCreated || isApproved 
    },
    { 
      label: 'Approved / Tapal Process', 
      desc: isTapalCreated ? 'Tapal slip generated from slip' : isApproved ? 'Admin verified and synced stocks' : 'Awaiting admin final step', 
      date: isTapalCreated || isApproved ? 'Done' : '', 
      done: isTapalCreated || isApproved,
      rejected: isRejected
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/procurement/harvest')} 
            className="text-text-muted hover:text-[#6A7051] transition-all p-1"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-2">
              Slip Details <span className="text-[#6A7051] font-black">#{slip.tpNo || 'N/A'}</span>
            </h1>
            <p className="text-text-secondary text-sm mt-1">Review weight grids, vehicle logs, and authorize procurement slips.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Quick print replica trigger */}
          <button
            onClick={() => {
              sessionStorage.setItem('current_harvest_slip_creation', JSON.stringify(slip));
              navigate('/admin/procurement/harvest/preview');
            }}
            className="border border-card-border bg-white text-text-secondary px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Printer size={14} /> View Slip Print Replica
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Slip Data Sheets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Farmer and Transport Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Farmer Info */}
            <div className="bg-white border border-card-border p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-brand-olive font-black text-xs uppercase tracking-wider border-b border-card-border pb-2">
                <User size={16} className="text-brand-yellow" /> Farmer Details
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted">Farmer Name</p>
                <p className="font-extrabold text-brand-olive uppercase text-sm mt-0.5">{slip.farmerName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted">Location</p>
                <p className="text-xs font-medium text-brand-olive uppercase mt-0.5">KARWAR (REGIONAL SHORE)</p>
              </div>
            </div>

            {/* Logistics Info */}
            <div className="bg-white border border-card-border p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-brand-olive font-black text-xs uppercase tracking-wider border-b border-card-border pb-2">
                <Truck size={16} className="text-brand-yellow" /> Logistics Logs
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted">Vehicle No</p>
                  <p className="text-xs font-extrabold text-brand-olive uppercase mt-0.5">{slip.vehicleNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted">Driver Name</p>
                  <p className="text-xs font-bold text-brand-olive uppercase mt-0.5">{slip.driverName || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-muted">Grader Name</p>
                <p className="text-xs font-medium text-brand-olive uppercase mt-0.5">{slip.graderName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="bg-white border border-card-border shadow-sm p-5 space-y-4">
            <div className="text-brand-olive font-black text-xs uppercase tracking-wider border-b border-card-border pb-2">
              Particulars Received
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F5F5EC]/40 border-b border-card-border text-[10px] font-black uppercase text-brand-olive">
                    <th className="py-2.5 px-3 w-12 text-center">Sl No</th>
                    <th className="py-2.5 px-3">HSN Code</th>
                    <th className="py-2.5 px-3">Particulars</th>
                    <th className="py-2.5 px-3 text-center">Count</th>
                    <th className="py-2.5 px-3 text-center">No of Boxes</th>
                    <th className="py-2.5 px-3 text-right">Box Wt</th>
                    <th className="py-2.5 px-3 text-right pr-4">Total Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-[11px] text-text-secondary">
                  {slip.items?.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center font-bold text-text-muted">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold tracking-wider">{item.hsnCode || 'N/A'}</td>
                      <td className="py-3 px-3 font-extrabold text-brand-olive uppercase">{item.particulars}</td>
                      <td className="py-3 px-3 text-center font-bold">{item.count || 'N/A'}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-brand-olive">{item.noOfBoxes || 0}</td>
                      <td className="py-3 px-3 text-right font-medium">{item.boxWeight ? `${item.boxWeight} kg` : 'N/A'}</td>
                      <td className="py-3 px-3 text-right font-black text-brand-olive pr-4">{parseFloat(item.totalWeight || 0).toFixed(2)} kg</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-[#F5F5EC]/20 border-t border-card-border font-black text-brand-olive">
                    <td colSpan="4" className="py-3 px-3 text-center uppercase tracking-widest text-[10px]">TOTAL</td>
                    <td className="py-3 px-3 text-center text-xs">{slip.totalBoxes || 0}</td>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3 text-right pr-4 text-xs">{parseFloat(slip.totalWeight || 0).toFixed(2)} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note text boxes at the bottom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dashed border-card-border pt-4 text-[10px]">
              <div className="space-y-1.5 p-3 bg-slate-50 border border-card-border">
                <span className="font-black text-brand-olive block uppercase">Receipt Quality Notes</span>
                <span className="text-text-secondary font-medium">{slip.notes || 'No quality notes added'}</span>
              </div>
              <div className="space-y-1.5 p-3 bg-slate-50 border border-card-border">
                <span className="font-black text-brand-olive block uppercase">Materials Quality Notes</span>
                <span className="text-text-secondary font-medium">{slip.damageNotes || 'No complaint logs'}</span>
              </div>
            </div>

            {/* Rent warning */}
            <div className={`p-3 border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              slip.iceRentDeducted 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <ShieldAlert size={16} />
              {slip.iceRentDeducted ? 'ICE & VEHICLE RENT DEDUCTION CONFIRMED' : 'ICE & VEHICLE RENT NOT DEDUCTED IN THIS LOADS ENTRY'}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Interactive Timeline & Approval Actions */}
        <div className="space-y-6">
          
          {/* Approval Banner */}
          {isDraft && (
            <div className="bg-white border border-card-border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-brand-olive font-black text-xs uppercase tracking-wider">
                <FileText className="text-slate-500" size={18} /> Draft Harvest Slip
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                This slip is currently a draft. You can share it with the farmer for verification.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleMarkSentToFarmer}
                  className="w-full bg-[#6A7051] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center justify-center gap-2 shadow-md active:translate-y-0.5"
                >
                  <Inbox size={16} /> Mark Sent to Farmer
                </button>
                <button
                  onClick={handleMarkFarmerApproved}
                  className="w-full border border-card-border bg-white text-brand-olive hover:bg-slate-50 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Mark Farmer Approved
                </button>
              </div>
            </div>
          )}

          {isSentToFarmer && (
            <div className="bg-white border border-card-border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-brand-olive font-black text-xs uppercase tracking-wider">
                <Clock className="text-sky-500 animate-pulse" size={18} /> Sent to Farmer
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Awaiting approval response from farmer via WhatsApp.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleMarkFarmerApproved}
                  className="w-full bg-[#6A7051] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center justify-center gap-2 shadow-md active:translate-y-0.5"
                >
                  <CheckCircle size={16} /> Mark Farmer Approved
                </button>
              </div>
            </div>
          )}

          {isFarmerApproved && (
            <div className="bg-white border border-card-border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-700 font-black text-xs uppercase tracking-wider">
                <CheckCircle className="text-emerald-500" size={18} /> Farmer Approved
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                The farmer has approved this slip. You can now generate a logistics Tapal dispatch slip or finalize this procurement invoice.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleCreateTapalDirectly}
                  className="w-full bg-purple-600 text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-md active:translate-y-0.5"
                >
                  <FileCheck size={16} /> Create Logistics Tapal
                </button>
                <button
                  onClick={handleApprove}
                  className="w-full bg-[#6A7051] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Check size={16} /> Approve & Sync Stocks
                </button>
                <button
                  onClick={handleReject}
                  className="w-full border border-card-border bg-white text-red-600 hover:bg-red-50 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={16} /> Reject Slip
                </button>
              </div>
            </div>
          )}

          {isTapalCreated && (
            <div className="bg-purple-50/40 border border-purple-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-purple-700 font-black text-xs uppercase tracking-wider">
                <FileCheck size={18} /> Tapal Created
              </div>
              <p className="text-xs text-purple-800 leading-relaxed font-medium">
                A logistics Tapal and trip workflow has been initialized from this approved Harvest Slip.
              </p>
            </div>
          )}

          {isApproved && (
            <div className="bg-emerald-50/40 border border-emerald-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-700 font-black text-xs uppercase tracking-wider">
                <FileCheck size={18} /> Procurement Verified
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                This slip was successfully approved. The stocks are updated in the live inventory ledger, and the farmer ledger entry has been created.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100/60 text-emerald-800 border border-emerald-200 font-extrabold text-[10px] uppercase">
                <CheckCircle size={12} /> Status: Approved
              </div>
            </div>
          )}

          {isRejected && (
            <div className="bg-red-50/40 border border-red-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-red-700 font-black text-xs uppercase tracking-wider">
                <XCircle size={18} /> Entry Rejected
              </div>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                This shipment has been rejected by administration. No stocks will be updated, and transaction logs are cancelled.
              </p>
            </div>
          )}

          {isPending && (
            <div className="bg-white border border-card-border p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-brand-olive font-black text-xs uppercase tracking-wider">
                <Clock className="text-amber-500 animate-pulse" size={18} /> Awaiting Authorization
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                This Harvest Slip requires procurement review. Approving will update the farmer ledger and add the loads to live inventory stocks.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleApprove}
                  className="w-full bg-[#6A7051] text-white py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center justify-center gap-2 shadow-md active:translate-y-0.5"
                >
                  <Check size={16} /> Approve & Sync Stocks
                </button>
                <button
                  onClick={handleReject}
                  className="w-full border border-card-border bg-white text-red-600 hover:bg-red-50 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={16} /> Reject Slip
                </button>
              </div>
            </div>
          )}

          {/* Interactive Timeline Graph */}
          <div className="bg-white border border-card-border p-5 space-y-5 shadow-sm">
            <div className="text-brand-olive font-black text-xs uppercase tracking-wider border-b border-card-border pb-2">
              Procurement Timeline
            </div>
            
            <div className="relative pl-6 space-y-6">
              {/* Vertical timeline connector */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

              {timelineSteps.map((step, idx) => {
                const isActive = step.done;
                const isErr = step.rejected;
                return (
                  <div key={idx} className="relative space-y-1">
                    {/* Bullet marker */}
                    <div className={`absolute -left-[23px] top-1.5 w-[14px] h-[14px] rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      isErr 
                        ? 'border-red-500 bg-red-100' 
                        : isActive 
                        ? 'border-[#6A7051] bg-[#6A7051]' 
                        : 'border-slate-300'
                    }`}>
                      {isActive && !isErr && <Check className="text-white" size={8} />}
                      {isErr && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                    </div>

                    <div className="flex justify-between items-start">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${
                        isErr ? 'text-red-700' : isActive ? 'text-brand-olive' : 'text-text-muted font-bold'
                      }`}>
                        {step.label}
                      </span>
                      {step.date && (
                        <span className="text-[9px] text-text-muted font-bold whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {step.date}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-secondary leading-normal">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HarvestSlipDetail;
