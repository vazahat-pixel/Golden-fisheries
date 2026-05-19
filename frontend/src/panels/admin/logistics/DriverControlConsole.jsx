import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { useAdminStore } from '../../../store/adminStore';
import { useDriverStore } from '../../../store/driverStore';
import { useRbacStore } from '../../../store/rbacStore';
import { 
  Truck, 
  MapPin, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ArrowRight,
  Navigation,
  Check,
  X,
  Map as MapIcon,
  Phone,
  Camera,
  Signature,
  FileText,
  Layers,
  Send,
  Droplet,
  Coffee,
  Wrench,
  AlignLeft,
  User,
  ShieldCheck,
  BellRing,
  Settings,
  Mail,
  AlertTriangle,
  FileSpreadsheet,
  Zap,
  Search,
  Upload,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverControlConsole = () => {
  // Store selections
  const { 
    trips, 
    fetchTrips, 
    reviewExpenseAsync, 
    expenses,
    fetchExpenses,
    vehicles,
    submitExpense
  } = useAdminStore();

  const {
    startTripAsync,
    pickupAsync,
    deliverAsync
  } = useDriverStore();

  const { 
    users, 
    fetchUsers,
    updateUser,
    togglePauseUser
  } = useRbacStore();

  // Component States
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'expenses' | 'profiles' | 'documents' | 'alerts'
  
  // Roster/Active trip simulation states
  const [pickupWeight, setPickupWeight] = useState('');
  const [deliveryWeight, setDeliveryWeight] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');

  // Manual Expense form states
  const [manualExpense, setManualExpense] = useState({
    driverId: '',
    type: 'FUEL',
    amount: '',
    tripId: '',
    description: '',
    receiptPhoto: null
  });

  // Profile Edit / Stats state
  const [selectedDriverProfile, setSelectedDriverProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: ''
  });

  // Documents review states
  const [selectedDocDriver, setSelectedDocDriver] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  // Load backend dispatches, expenses, and driver profiles
  useEffect(() => {
    fetchTrips();
    fetchExpenses();
    fetchUsers();
  }, [fetchTrips, fetchExpenses, fetchUsers]);

  // Synchronize active selections with store updates
  useEffect(() => {
    if (selectedTrip) {
      const updated = trips.find(t => t.id === selectedTrip.id);
      if (updated) setSelectedTrip(updated);
    } else if (trips.length > 0) {
      setSelectedTrip(trips[0]);
    }
  }, [trips, selectedTrip]);

  const driversList = users.filter(u => u.role?.toUpperCase() === 'DRIVER');

  // Triggered when selected driver changes in profiles or document vault
  useEffect(() => {
    if (driversList.length > 0 && !selectedDriverProfile) {
      setSelectedDriverProfile(driversList[0]);
      setSelectedDocDriver(driversList[0]);
    }
  }, [driversList, selectedDriverProfile]);

  // Operational Simulation controls (Act on behalf of a driver)
  const handleStartTrip = async (tripId, tapalId) => {
    try {
      await startTripAsync(tapalId || tripId);
      toast.success('Trip started successfully via Command Center!');
      fetchTrips();
    } catch (err) {
      toast.error(err?.message || 'Failed to start trip');
    }
  };

  const handlePickup = async (tripId, tapalId) => {
    if (!pickupWeight) return toast.error('Please enter pickup weight');
    try {
      await pickupAsync(tapalId || tripId, parseFloat(pickupWeight));
      toast.success(`Scale reading of ${pickupWeight} KG logged securely!`);
      setPickupWeight('');
      fetchTrips();
    } catch (err) {
      toast.error(err?.message || 'Failed to log pickup');
    }
  };

  const handleDeliver = async (tripId, tapalId) => {
    if (!deliveryWeight) return toast.error('Please enter delivered weight');
    try {
      await deliverAsync(
        tapalId || tripId, 
        parseFloat(deliveryWeight), 
        'CC_OVERRIDE_PROOF_IMG', 
        'CC_ADMIN_VERIFIED_SIGNATURE'
      );
      toast.success(`Delivery logged: ${deliveryWeight} KG completed successfully!`);
      setDeliveryWeight('');
      setDeliveryOtp('');
      fetchTrips();
    } catch (err) {
      toast.error(err?.message || 'Failed to log delivery');
    }
  };

  // Expense Claims ledger approvals
  const handleApproveExpense = async (expId) => {
    try {
      await reviewExpenseAsync(expId, 'Approved');
      toast.success('Expense claim approved and settled in general accounts!');
      fetchExpenses();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (expId) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      await reviewExpenseAsync(expId, 'Rejected');
      toast.error('Expense claim rejected.');
      fetchExpenses();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject expense');
    }
  };

  // Manual Expense Logging on behalf of driver
  const handleManualExpenseSubmit = async () => {
    if (!manualExpense.driverId) return toast.error('Please select a driver');
    if (!manualExpense.amount) return toast.error('Please enter expense amount');
    if (!manualExpense.description.trim()) return toast.error('Please enter a description');

    const drv = driversList.find(d => d._id === manualExpense.driverId || d.id === manualExpense.driverId);
    
    try {
      await submitExpense({
        expenseType: manualExpense.type,
        amount: Number(manualExpense.amount),
        payee: drv?.fullName || drv?.name || 'Driver Override',
        linkedTripId: manualExpense.tripId || null,
        invoicePhotoUrl: manualExpense.receiptPhoto || 'CC_OVERRIDE_RECEIPT',
        remarks: `[Admin Manual Override] ${manualExpense.description.trim()}`
      });
      toast.success('Expense logged and sent for review!');
      setManualExpense({
        driverId: '',
        type: 'FUEL',
        amount: '',
        tripId: '',
        description: '',
        receiptPhoto: null
      });
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to submit manual expense');
    }
  };

  // Profile management updates
  const handleStartEditProfile = (drv) => {
    setSelectedDriverProfile(drv);
    setProfileFormData({
      fullName: drv.fullName || drv.name || '',
      phone: drv.phone || drv.mobile || '',
      email: drv.email || '',
      location: drv.location || 'Mangalore Sea Node'
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!profileFormData.fullName) return toast.error('Please enter full name');
    try {
      const driverId = selectedDriverProfile._id || selectedDriverProfile.id;
      await updateUser(driverId, profileFormData);
      toast.success('Driver profile details updated successfully!');
      setIsEditingProfile(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const handleToggleDriverStatus = async (drv) => {
    try {
      const driverId = drv._id || drv.id;
      await togglePauseUser(driverId);
      toast.success(`Driver status toggled successfully.`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  // Expose documents verify triggers
  const handleVerifyDocument = (docId) => {
    toast.success(`Document marked as Verified and locked!`);
  };

  const handleRejectDocument = (docId) => {
    toast.error(`Document marked as Rejected. Resubmission notification dispatched.`);
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toUpperCase();
    if (['DELIVERED', 'COMPLETED', 'CLOSED'].includes(s)) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    if (['STARTED', 'PICKED', 'IN TRANSIT', 'ACCEPTED'].includes(s)) {
      return 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse';
    }
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  const expenseCategories = [
    { id: 'FUEL',        icon: Droplet,        label: 'Fuel',        color: 'bg-blue-500' },
    { id: 'TOLL',        icon: Navigation,     label: 'Toll',        color: 'bg-emerald-500' },
    { id: 'FOOD',        icon: Coffee,         label: 'Food',        color: 'bg-amber-500' },
    { id: 'REPAIR',      icon: Wrench,         label: 'Repair',      color: 'bg-rose-500' },
    { id: 'OTHER',       icon: FileText,       label: 'Other',       color: 'bg-slate-500' },
  ];

  const complianceAlerts = [
    { id: 1, title: 'RC Expiry Monitor', level: 'CRITICAL', limit: 'May 24, 2026', details: 'Vehicle KA-19-M-2234 Registration Certificate requires verification.', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    { id: 2, title: 'Insurance Policy Renew', level: 'WARNING', limit: 'June 09, 2026', details: 'Comprehensive logistics policy renewal window is currently active.', color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { id: 3, title: 'Scheduled Engine Tuning', level: 'STABLE', limit: 'Next 500 KM', details: 'Odometer maintenance recommended for vehicle fleet assets.', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
  ];

  const totalActive = trips.filter(t => ['ASSIGNED', 'STARTED', 'PICKED', 'In Transit', 'accepted'].includes(t.status)).length;
  const totalClaims = expenses.filter(e => e.status === 'Pending').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4 lg:p-6 bg-slate-50 min-h-screen">
      
      {/* Dynamic Dispatch Dashboard Control HUD */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-black text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <Truck size={200} className="text-white" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[9px] font-black tracking-[0.3em] text-emerald-400 uppercase">Unified Fleet Control Suite</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif italic font-black">Fleet Command <span className="text-emerald-400">Hub.</span></h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ALL DRIVER PORTALS MERGED • CENTRAL DEPLOYMENTS • FULL ADMIN INTERVENTIONS</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Dispatches</p>
            <p className="text-lg font-black text-emerald-400 mt-1">{totalActive} Active</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-md">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Pending Expenses</p>
            <p className="text-lg font-black text-amber-400 mt-1">{totalClaims} Claims</p>
          </div>
        </div>
      </div>

      {/* Modern High-End Tabbed Panel Selection */}
      <div className="flex overflow-x-auto no-scrollbar bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200 gap-1">
        <button 
          onClick={() => setActiveTab('roster')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'roster' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
        >
          <Layers size={11} /> Control Room
        </button>
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'expenses' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
        >
          <IndianRupee size={11} /> Reimbursables & Claims
        </button>
        <button 
          onClick={() => setActiveTab('profiles')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'profiles' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
        >
          <User size={11} /> Pilot Profiles & Safety
        </button>
        <button 
          onClick={() => setActiveTab('documents')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'documents' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
        >
          <FileText size={11} /> Vault Credentials
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'alerts' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
        >
          <BellRing size={11} /> Incidents & SOS
        </button>
      </div>

      {/* ==================== TAB 1: CONTROL ROOM (ROSTER & DEPLOYMENT OVERRIDES) ==================== */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Tactical Google Map Iframe Card & Active trip override */}
          <div className="lg:col-span-7 space-y-5">
            <Card padding="none" className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm h-[320px] relative">
              <div className="absolute top-4 left-4 z-10 bg-black/85 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <MapIcon size={10} className="text-emerald-400 animate-pulse" />
                Mangalore Sea Node Sector Alpha
              </div>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0, filter: 'grayscale(0.6) contrast(1.1) brightness(1.02)' }}
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15551.4682052163!2d74.8427776!3d12.8701056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1714811800000!5m2!1sen!2sin"
                allowFullScreen
              ></iframe>
            </Card>

            {/* Simulated Driver Console active controls */}
            <Card className="border border-slate-200 bg-white rounded-3xl shadow-sm p-6">
              {selectedTrip ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Selected Deployment Dashboard</span>
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mt-1">
                        {selectedTrip.tripNumber || selectedTrip.id}
                      </h2>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        Pilot: {selectedTrip.driverName} • Vehicle: {selectedTrip.vehicle}
                      </p>
                    </div>
                    <Badge className={`uppercase text-[8px] font-black px-3 py-1 border border-transparent ${getStatusBadgeClass(selectedTrip.status)}`}>
                      {selectedTrip.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Pickup origin</p>
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="text-[10px] font-bold uppercase truncate">{selectedTrip.pickupLocation}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery destination</p>
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <Navigation size={12} className="text-emerald-500 shrink-0" />
                        <span className="text-[10px] font-bold uppercase truncate">{selectedTrip.deliveryLocation || 'GF Warehouse'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated step-by-step overrides */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                      <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Administrative Override Controls</h3>
                    </div>

                    {selectedTrip.status === 'ASSIGNED' && (
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3">
                        <p className="text-[9px] text-slate-500 font-bold leading-normal">
                          This trip is dispatched but awaits driver start signal. Click below to bypass or simulate trip initiation.
                        </p>
                        <Button 
                          onClick={() => handleStartTrip(selectedTrip.id, selectedTrip.tapalId)}
                          className="w-full bg-black text-white hover:bg-slate-900 font-black text-[9px] uppercase tracking-[0.2em] py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2"
                        >
                          <Navigation size={12} /> Launch Dispatch Mission
                        </Button>
                      </div>
                    )}

                    {['STARTED', 'accepted'].includes(selectedTrip.status) && (
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3">
                        <p className="text-[9px] text-slate-500 font-bold leading-normal">
                          Trip in transit. Record farm scale reading to complete pickup override.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Actual scale weight (KG)"
                            value={pickupWeight}
                            onChange={(e) => setPickupWeight(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none text-center"
                          />
                          <Button 
                            onClick={() => handlePickup(selectedTrip.id, selectedTrip.tapalId)}
                            className="bg-black text-white font-black text-[9px] uppercase tracking-widest px-6 rounded-xl hover:bg-slate-900"
                          >
                            Log Pickup Weight
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedTrip.status === 'PICKED' && (
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-4">
                        <p className="text-[9px] text-slate-500 font-bold leading-normal">
                          Dispatched cargo is en route. Enter final scale receipt weight to confirm delivery.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Delivered Weight (KG)"
                            value={deliveryWeight}
                            onChange={(e) => setDeliveryWeight(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none text-center"
                          />
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Security OTP Code"
                            value={deliveryOtp}
                            onChange={(e) => setDeliveryOtp(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none text-center tracking-widest"
                          />
                        </div>
                        <Button 
                          onClick={() => handleDeliver(selectedTrip.id, selectedTrip.tapalId)}
                          className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[9px] uppercase tracking-[0.2em] py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={12} /> Confirm Delivery & Record Proof
                        </Button>
                      </div>
                    )}

                    {['DELIVERED', 'COMPLETED', 'CLOSED'].includes(selectedTrip.status) && (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl text-center space-y-2">
                        <CheckCircle2 size={24} className="text-emerald-500 mx-auto animate-bounce" />
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Deployment Completed</p>
                        <p className="text-[8px] text-emerald-600/70 font-bold uppercase tracking-wider">
                          Delivered Weight: {selectedTrip.actualQty || selectedTrip.expectedQty} KG • All telemetry closed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-300">
                  <AlertCircle size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No active deployments selected</p>
                </div>
              )}
            </Card>
          </div>

          {/* Active dispatches queue */}
          <div className="lg:col-span-5">
            <Card padding="none" className="border border-slate-200 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[640px]">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ACTIVE DISPATCHES</span>
                <Badge className="bg-black text-white text-[8px] font-bold px-2 py-0.5">{trips.length} Active</Badge>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {trips.length === 0 ? (
                  <div className="py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active dispatches in queue.</div>
                ) : (
                  trips.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => setSelectedTrip(t)}
                      className={`p-4 flex justify-between items-start hover:bg-slate-50/50 transition-all cursor-pointer group ${selectedTrip?.id === t.id ? 'bg-emerald-50/20 border-l-4 border-black' : ''}`}
                    >
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{t.tripNumber || t.id}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Pilot: {t.driverName}</p>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 font-bold uppercase truncate max-w-[200px]">
                          <MapPin size={8} /> {t.pickupLocation} <ArrowRight size={8} /> {t.deliveryLocation}
                        </div>
                      </div>
                      <div className="text-right space-y-1.5">
                        <Badge className={`uppercase text-[6px] font-black tracking-widest ${getStatusBadgeClass(t.status)}`}>
                          {t.status}
                        </Badge>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{t.createdAt}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: EXPENSES (CLAIMS & MANUAL ENTRY) ==================== */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left panel: Log manual expense on behalf of driver */}
          <div className="lg:col-span-6">
            <Card className="border border-slate-200 bg-white rounded-3xl shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase italic">Log Driver Expense</h2>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Act on behalf of a pilot</p>
              </div>

              <div className="space-y-4">
                {/* Select Driver */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver Callsign</label>
                  <select 
                    value={manualExpense.driverId}
                    onChange={(e) => setManualExpense({ ...manualExpense, driverId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black text-slate-900 outline-none uppercase appearance-none"
                  >
                    <option value="">SELECT FLEET DRIVER</option>
                    {driversList.map(d => (
                      <option key={d._id || d.id} value={d._id || d.id}>{d.fullName || d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Expense Type selectors */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Type</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {expenseCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setManualExpense({ ...manualExpense, type: cat.id })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all shrink-0 ${
                          manualExpense.type === cat.id
                            ? 'bg-black border-black text-white shadow-md'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <cat.icon size={11} />
                        <span className="text-[9px] font-black uppercase tracking-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="₹ 0.00"
                    value={manualExpense.amount}
                    onChange={(e) => setManualExpense({ ...manualExpense, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[14px] font-black text-slate-900 outline-none placeholder:text-slate-300"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Remarks</label>
                  <textarea 
                    placeholder="Log details e.g. Diesel fuel toll payments at toll plaza..."
                    rows={2}
                    value={manualExpense.description}
                    onChange={(e) => setManualExpense({ ...manualExpense, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-700 outline-none resize-none placeholder:text-slate-300"
                  />
                </div>

                <Button 
                  onClick={handleManualExpenseSubmit}
                  className="w-full bg-black text-white py-4 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2"
                >
                  <Zap size={12} className="text-amber-400" /> Log and Submit Expense
                </Button>
              </div>
            </Card>
          </div>

          {/* Right panel: Reimbursable claims list */}
          <div className="lg:col-span-6">
            <Card padding="none" className="border border-slate-200 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">REIMBURSABLE CLAIMS</span>
                <Badge className="bg-black text-white text-[8px] font-bold px-2 py-0.5">{expenses.length} Logged</Badge>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <div className="py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">No expense claims logged.</div>
                ) : (
                  expenses.map((e) => (
                    <div key={e.id || e._id} className="p-4 space-y-2 hover:bg-slate-50/30 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{e.expenseType || 'FUEL'}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">Pilot: {e.driverName || 'Verified Pilot'}</p>
                        </div>
                        <p className="text-xs font-black text-emerald-600 font-serif italic">₹{e.amount}</p>
                      </div>
                      <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase">
                        <span>METHOD: {e.paymentMethod || 'CASH'}</span>
                        <Badge className={`uppercase text-[6px] font-black ${e.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : e.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {e.status}
                        </Badge>
                      </div>
                      {e.linkedTripId && (
                        <div className="pt-1">
                          <a
                            href={`/driver/trip-expense/${e.linkedTripId}/bill`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-center block py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-black rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                          >
                            View Post-Trip Statement
                          </a>
                        </div>
                      )}
                      {e.status === 'Pending' && (
                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => handleApproveExpense(e._id || e.id)}
                            className="flex-1 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectExpense(e._id || e.id)}
                            className="flex-1 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: PROFILES & STATS ==================== */}
      {activeTab === 'profiles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Driver Selection List */}
          <div className="lg:col-span-4">
            <Card padding="none" className="border border-slate-200 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ACTIVE PILOTS</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {driversList.map((drv) => (
                  <div 
                    key={drv._id || drv.id} 
                    onClick={() => { setSelectedDriverProfile(drv); setIsEditingProfile(false); }}
                    className={`p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer ${selectedDriverProfile?._id === drv._id ? 'bg-emerald-50/20 border-l-4 border-black' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-accent-olive flex items-center justify-center text-white text-xs font-black">
                        {drv.fullName?.charAt(0) || drv.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{drv.fullName || drv.name}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{drv.phone || drv.mobile || 'No comms line'}</p>
                      </div>
                    </div>
                    <Badge className={`uppercase text-[6px] font-black ${drv.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {drv.status || 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Driver detail profile view */}
          <div className="lg:col-span-8">
            <Card className="border border-slate-200 bg-white rounded-3xl shadow-sm p-6 space-y-6">
              {selectedDriverProfile ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-black p-1 flex items-center justify-center overflow-hidden">
                        <User size={32} className="text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase italic leading-none">{selectedDriverProfile.fullName || selectedDriverProfile.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">Rank: Command Pilot</span>
                          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${selectedDriverProfile.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {selectedDriverProfile.status || 'active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleDriverStatus(selectedDriverProfile)}
                        className="text-[9px] font-black uppercase tracking-widest h-9"
                      >
                        {selectedDriverProfile.status === 'active' ? 'PAUSE DRIVER' : 'ACTIVATE DRIVER'}
                      </Button>
                      {!isEditingProfile ? (
                        <Button 
                          size="sm"
                          onClick={() => handleStartEditProfile(selectedDriverProfile)}
                          className="bg-black text-white text-[9px] font-black uppercase tracking-widest h-9"
                        >
                          EDIT PROFILE
                        </Button>
                      ) : (
                        <div className="flex gap-1.5">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingProfile(false)}
                            className="text-[9px] font-black uppercase border-rose-200 text-rose-600 hover:bg-rose-50 h-9"
                          >
                            CANCEL
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleSaveProfile}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase h-9"
                          >
                            SAVE CHANGES
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Edit / Display Credentials */}
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tactical Credentials</h3>
                    
                    {isEditingProfile ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Driver callsign</label>
                          <input 
                            type="text"
                            value={profileFormData.fullName}
                            onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Comms line</label>
                          <input 
                            type="text"
                            value={profileFormData.phone}
                            onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital ID (Email)</label>
                          <input 
                            type="email"
                            value={profileFormData.email}
                            onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Region</label>
                          <input 
                            type="text"
                            value={profileFormData.location}
                            onChange={(e) => setProfileFormData({ ...profileFormData, location: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-sm"><Phone size={14} /></div>
                          <div>
                            <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-none">Comms Line</p>
                            <p className="text-[11px] font-bold text-slate-950 mt-1">{selectedDriverProfile.phone || selectedDriverProfile.mobile || 'Not available'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-sm"><Mail size={14} /></div>
                          <div>
                            <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-none">Digital ID</p>
                            <p className="text-[11px] font-bold text-slate-950 mt-1">{selectedDriverProfile.email || 'Verified G-Fisheries pilot'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Safety Scores & Asset details */}
                  <div className="border-t border-slate-100 pt-5 grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[18px] font-black text-black italic">4.2K</p>
                      <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Total KM</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[18px] font-black text-emerald-600 italic">98%</p>
                      <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Safety Score</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                      <p className="text-[18px] font-black text-slate-900 italic">Active</p>
                      <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Asset compliance</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-300">
                  <AlertCircle size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Select a pilot from the left list to review</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: DOCUMENTS VAULT ==================== */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Driver List Selection */}
          <div className="lg:col-span-4">
            <Card padding="none" className="border border-slate-200 bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[500px]">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">COMPLIANCE LEDGER</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {driversList.map((drv) => (
                  <div 
                    key={drv._id || drv.id} 
                    onClick={() => { setSelectedDocDriver(drv); }}
                    className={`p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer ${selectedDocDriver?._id === drv._id ? 'bg-emerald-50/20 border-l-4 border-black' : ''}`}
                  >
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{drv.fullName || drv.name}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">Region: Mangalore Sea Node</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 uppercase font-bold text-[6px] tracking-widest border border-emerald-100">Verified</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Vault cards details */}
          <div className="lg:col-span-8">
            <Card className="border border-slate-200 bg-white rounded-3xl shadow-sm p-6 space-y-6">
              {selectedDocDriver ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase italic">Document Vault / Credentials</h2>
                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Pilot: {selectedDocDriver.fullName || selectedDocDriver.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Aadhaar card */}
                    <div className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm"><FileText size={14} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Aadhaar Card</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Verified</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 text-[6px] font-black border-none px-2 h-4">VALID</Badge>
                      </div>
                      <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-100/50">
                        <Button size="sm" variant="outline" onClick={() => handleVerifyDocument('aadhaar')} className="h-7 text-[8px] font-black uppercase">Verify</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectDocument('aadhaar')} className="h-7 text-[8px] font-black text-rose-600 hover:bg-rose-50 border-rose-100 uppercase">Revoke</Button>
                      </div>
                    </div>

                    {/* Driving license */}
                    <div className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm"><FileText size={14} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Driving License</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Expires: Dec 2031</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 text-[6px] font-black border-none px-2 h-4">VALID</Badge>
                      </div>
                      <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-100/50">
                        <Button size="sm" variant="outline" onClick={() => handleVerifyDocument('license')} className="h-7 text-[8px] font-black uppercase">Verify</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectDocument('license')} className="h-7 text-[8px] font-black text-rose-600 hover:bg-rose-50 border-rose-100 uppercase">Revoke</Button>
                      </div>
                    </div>

                    {/* RC Book */}
                    <div className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm"><Truck size={14} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Vehicle RC</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Verified</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 text-[6px] font-black border-none px-2 h-4">VALID</Badge>
                      </div>
                      <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-100/50">
                        <Button size="sm" variant="outline" onClick={() => handleVerifyDocument('rc')} className="h-7 text-[8px] font-black uppercase">Verify</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectDocument('rc')} className="h-7 text-[8px] font-black text-rose-600 hover:bg-rose-50 border-rose-100 uppercase">Revoke</Button>
                      </div>
                    </div>

                    {/* Insurance Policy */}
                    <div className="border border-slate-100 bg-slate-50/40 p-4 rounded-2xl flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm"><ShieldCheck size={14} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Insurance Policy</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Expires: Jun 2026</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 text-[6px] font-black border-none px-2 h-4">VALID</Badge>
                      </div>
                      <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-slate-100/50">
                        <Button size="sm" variant="outline" onClick={() => handleVerifyDocument('insurance')} className="h-7 text-[8px] font-black uppercase">Verify</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectDocument('insurance')} className="h-7 text-[8px] font-black text-rose-600 hover:bg-rose-50 border-rose-100 uppercase">Revoke</Button>
                      </div>
                    </div>
                  </div>

                  {/* Warning Compliance Banner notice */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5"><AlertTriangle size={60} /></div>
                    <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg"><Info size={18} /></div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-0.5">Compliance Vault Audit</p>
                      <p className="text-[8px] font-medium text-slate-400 leading-normal uppercase tracking-wider">
                        Document expiry results in immediate dispatch logs locking. Admins can verify all overrides.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-300">
                  <AlertCircle size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Select a driver from the compliance list to review vault docs</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: ALERTS & INCIDENTS (SOS PANIC LOGS) ==================== */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Active compliance alert monitors */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border border-slate-200 bg-white rounded-3xl shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase italic">Compliance Telemetry Alerts</h2>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Real-time alerts & vehicle monitoring</p>
              </div>

              <div className="space-y-3.5">
                {complianceAlerts.map((al) => (
                  <div key={al.id} className="border border-slate-100 p-4 rounded-2xl space-y-2.5 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} className="text-slate-400 shrink-0" />
                        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{al.title}</h3>
                      </div>
                      <Badge className={`uppercase text-[6px] font-black ${al.level === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : al.level === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {al.level}
                      </Badge>
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed pl-5">{al.details}</p>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Limit Check: {al.limit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* SOS Dispatch Log & Resolution center */}
          <div className="lg:col-span-6">
            <Card className="border border-slate-200 bg-white rounded-3xl shadow-sm p-6 space-y-5">
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-black text-slate-900 uppercase italic">Emergency Dispatch SOS Center</h2>
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                </div>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Tactical distress triggers & resolution console</p>
              </div>

              {/* Mock SOS triggers list */}
              <div className="space-y-3.5">
                <div className="bg-rose-500/5 border border-rose-200/50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600"><AlertTriangle size={16} /></div>
                      <div>
                        <p className="text-[10px] font-black text-rose-700 uppercase tracking-tight">SOS Triggered</p>
                        <p className="text-[8px] text-rose-500 font-bold uppercase">Trip: TRP-0012 • Pilot: Rajesh Kumar</p>
                      </div>
                    </div>
                    <Badge className="bg-rose-500 text-white border-none animate-pulse text-[6px] font-black px-2 h-4 shadow-sm">PANIC TRIGGERED</Badge>
                  </div>
                  <p className="text-[9px] text-rose-600 font-bold pl-1 border-l-2 border-rose-300 italic">
                    "Vehicle breakdown near NH-48 toll plaza. Clutch cable failure. Cargo (GENERAL FISH - 500 KG) loaded."
                  </p>
                  <div className="flex gap-2 pt-2 border-t border-rose-100/30">
                    <button 
                      onClick={() => toast.success('Support fleet dispatched!')}
                      className="flex-1 py-2.5 bg-black hover:bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg"
                    >
                      DISPATCH SUPPORT FLEET
                    </button>
                    <button 
                      onClick={() => toast.success('SOS marked Resolved')}
                      className="flex-1 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm"
                    >
                      RESOLVE TRIGGER
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm"><CheckCircle2 size={16} /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-950 uppercase tracking-tight">SOS Resolved</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">Trip: TRP-0008 • Pilot: Mahesh Gowda</p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 text-slate-500 border-none text-[6px] font-black px-2 h-4">RESOLVED</Badge>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium italic pl-1 border-l-2 border-slate-200">
                    "Flat tire incident resolved. Support fleet completed replacement. Trip resume time logged."
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverControlConsole;
