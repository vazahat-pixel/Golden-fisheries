import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Modal } from '../../../design-system/components/Modal';
import {
  ArrowLeft,
  Printer,
  Trash2,
  Clock,
  User,
  Truck,
  CheckCircle2,
  FileText,
  MessageCircle,
  AlertTriangle,
  Pencil,
  Check,
  UserPlus,
  Navigation,
  IndianRupee,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { useDriverStore } from '../../../store/driverStore';
import { PrintableTapal } from './PrintableTapal';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const TapalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    tapals,
    deleteTapal,
    updateTapalStatus,
    editTapal,
    drivers,
    assignDriver,
    trips,
    markStockReceived,
    addTripExpense
  } = useAdminStore();

  const { drivers: verifiedDrivers } = useDriverStore();

  const [dbDrivers, setDbDrivers] = useState([]);
  const availableDrivers = dbDrivers;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({ party: '', qty: '', amount: '', type: 'Purchase', driver: '', date: '' });
  const [receiveQty, setReceiveQty] = useState('');
  const [expenseData, setExpenseData] = useState({ type: 'FUEL', amount: '', method: 'CASH' });

  const tapal = tapals.find(t => t.id === id);
  const trip = trips.find(t => t.tapalId === id);

  if (!tapal) return <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Tapal record not found.</div>;

  const displayProducts = tapal.products || [
    { name: 'GENERAL FISH STOCK', qty: tapal.qty || '0 KG', rate: '—', total: tapal.amount || '—' }
  ];

  const openEditModal = () => {
    setEditFormData({
      party: tapal.party,
      qty: tapal.qty.replace(' KG', ''),
      amount: tapal.amount.replace('₹', '').replace(/,/g, ''),
      type: tapal.type,
      driver: tapal.driver || 'Unassigned',
      date: tapal.date
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    editTapal(tapal.id, {
      party: editFormData.party.toUpperCase(),
      qty: `${editFormData.qty} KG`,
      amount: `₹${Number(editFormData.amount).toLocaleString()}`,
      type: editFormData.type,
      driver: editFormData.driver,
      date: editFormData.date
    });
    setIsEditModalOpen(false);
    toast.success('Tapal information updated');
  };

  const handleAssignDriver = async (driverId) => {
    try {
      const { apiClient } = await import('../../../services/apiClient');
      const tapalMongoId = tapal._id || tapal.id; // use mongo ID if present
      await apiClient.patch('/tapals/assign-driver', {
        tapalId: tapalMongoId,
        driverId: driverId
      });
      // also update locally for UI
      assignDriver(tapal.id, driverId);
      setIsDriverModalOpen(false);
      toast.success('Driver assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign driver');
    }
  };

  React.useEffect(() => {
    const fetchDbDrivers = async () => {
      try {
        const { masterService } = await import('../../../services/masterService');
        const activeDrivers = await masterService.drivers.getActive();
        // The API returns { success: true, data: [...] } from ApiResponse
        if (activeDrivers.data) {
          setDbDrivers(activeDrivers.data);
        } else if (Array.isArray(activeDrivers)) {
          setDbDrivers(activeDrivers);
        }
      } catch (err) {
        console.error('Failed to fetch active drivers', err);
      }
    };
    fetchDbDrivers();
  }, []);

  const handleConfirmReceipt = () => {
    if (!receiveQty) return toast.error('Please enter received quantity');
    markStockReceived(tapal.id, receiveQty);
    setIsReceiveModalOpen(false);
    toast.success('Stock updated and record finalized!');
  };

  const handleAddExpense = () => {
    if (!expenseData.amount) return toast.error('Amount is required');
    addTripExpense(trip.id, expenseData);
    setIsExpenseModalOpen(false);
    setExpenseData({ type: 'FUEL', amount: '', method: 'CASH' });
    toast.success('Expense recorded');
  };

  const isLocked = !['Confirmed', 'Assigned'].includes(tapal.status);

  const handleCloseTrip = () => {
    closeTrip(tapal.id);
    toast.success('Trip Closed and Record Finalized');
  };

  const getStepStatus = (step) => {
    const statusOrder = ['Confirmed', 'Assigned', 'Accepted', 'In Transit', 'Picked', 'Delivered', 'Closed'];
    const currentIndex = statusOrder.indexOf(tapal.status);
    const stepIndex = statusOrder.indexOf(step);

    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex === stepIndex - 1) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3">
      {/* Header */}
      <button onClick={() => navigate('/admin/tapals')} className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest group">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> BACK TO RECORDS
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">{tapal.id}</h1>
          <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">
            {tapal.type} TAPAL · {tapal.date}
          </p>
        </div>
        <div className="flex gap-2">
          {!isLocked && (
            <Button variant="outline" size="sm" className="h-8 px-4 text-[9px] font-bold border-card-border" onClick={openEditModal}><Pencil size={12} className="mr-1" /> EDIT</Button>
          )}
          {isLocked && (
            <Badge variant="secondary" className="bg-olive-50 text-[8px] font-bold border-card-border px-3 flex items-center gap-1.5 opacity-60 cursor-not-allowed">
              <Check size={10} /> EDIT LOCKED
            </Badge>
          )}
          <Badge variant={tapal.status === 'Delivered' || tapal.status === 'Closed' ? 'success' : 'warning'} className="uppercase text-[9px] font-bold border border-card-border px-4 py-1 shadow-none">
            {tapal.status}
          </Badge>
          <Button variant="outline" size="sm" className="h-8 px-4 text-[9px] font-bold border-card-border" onClick={() => window.print()}><Printer size={12} className="mr-1" /> PRINT</Button>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card className="border border-card-border bg-white p-6 shadow-subtle overflow-x-auto no-scrollbar">
        <div className="flex justify-between items-center min-w-[800px] relative">
          <div className="absolute left-0 right-0 h-0.5 bg-olive-100 -z-0"></div>
          {['Confirmed', 'Assigned', 'In Transit', 'Picked', 'Delivered', 'Closed'].map((step, i) => {
            const status = getStepStatus(step);
            return (
              <div key={i} className="flex flex-col items-center gap-2 relative z-10 bg-white px-4">
                <div className={clsx(
                  "w-8 h-8 flex items-center justify-center border-2 font-bold text-[10px]",
                  status === 'completed' ? "bg-black border-black text-white" :
                    status === 'current' ? "border-black text-black animate-pulse shadow-glow" : "border-olive-100 text-olive-200"
                )}>
                  {status === 'completed' ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className={clsx(
                  "text-[8px] font-bold uppercase tracking-widest whitespace-nowrap",
                  status === 'completed' || status === 'current' ? "text-black" : "text-text-muted"
                )}>{step}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-3">
          {/* Party Card */}
          <Card className="border border-card-border shadow-subtle bg-white p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-3 text-center md:text-left">PARTY DETAILS</h3>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0"><User size={16} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-black uppercase tracking-tight">{tapal.party}</p>
                <div className="flex gap-4 mt-1">
                  <p className="text-[9px] text-text-muted font-bold flex items-center gap-1.5"><MessageCircle size={10} className="text-accent-olive" /> {tapal.phone || 'NO CONTACT'}</p>
                  <Badge variant="secondary" className="bg-olive-50/50 text-[7px] border-none px-1.5">{tapal.type === 'Purchase' ? 'SUPPLIER' : 'CLIENT'}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Manager Suggestions / Feedback Section */}
          {tapal.suggestedChanges && (
            <Card className="border-2 border-accent-olive bg-olive-50/20 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-olive rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
                  <MessageCircle size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[10px] font-black text-black uppercase tracking-widest">Feedback from Channappa</h4>
                    <Badge variant="warning" className="text-[7px] bg-black text-white border-none px-2 py-0.5">ACTION REQUIRED</Badge>
                  </div>
                  <p className="text-xs font-bold text-black leading-relaxed italic">
                    "{tapal.suggestedChanges}"
                  </p>
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mt-2">
                    SENT AT: {new Date(tapal.suggestedAt).toLocaleTimeString()} · PLEASE UPDATE TAPAL AS PER SUGGESTIONS
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Product List */}
          <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden">
            <div className="px-4 py-2 border-b border-card-border bg-olive-50/20 flex items-center gap-2">
              <FileText size={12} className="text-accent-olive" />
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted">LINE ITEMS</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-olive-100/10">
                  <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest">Description</th>
                  <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Qty</th>
                  <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Rate</th>
                  <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-100/30">
                {displayProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-olive-50/30 transition-colors">
                    <td className="px-4 py-3 text-[10px] font-bold text-black uppercase">{p.name}</td>
                    <td className="px-4 py-3 text-[10px] font-bold text-black text-right">{p.qty}</td>
                    <td className="px-4 py-3 text-[10px] font-bold text-text-muted text-right">{p.rate}</td>
                    <td className="px-4 py-3 text-[11px] font-serif italic font-bold text-black text-right">{p.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-black text-white">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest">GRAND TOTAL</td>
                  <td className="px-4 py-2 text-[11px] font-serif italic font-bold text-right">{tapal.amount}</td>
                </tr>
              </tfoot>
            </table>
          </Card>

          {/* Trip Details & Expenses (If assigned) */}
          {trip && (
            <Card className="border border-card-border shadow-subtle bg-white overflow-hidden" padding="none">
              <div className="px-4 py-2 border-b border-card-border bg-olive-50/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Navigation size={12} className="text-accent-olive" />
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted">TRIP LOGISTICS: {trip.id}</h3>
                </div>
                <Badge className={clsx("text-[7px] font-bold uppercase", trip.status === 'Delivered' || trip.status === 'Closed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>{trip.status}</Badge>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><p className="text-[8px] text-text-muted font-bold uppercase mb-1">PICKUP SITE</p><p className="text-[10px] font-bold text-black uppercase">{trip.pickupLocation}</p></div>
                <div><p className="text-[8px] text-text-muted font-bold uppercase mb-1">ACTUAL QTY</p><p className="text-[10px] font-bold text-accent-olive uppercase">{trip.actualQty || 'AWAITING PICKUP'} {trip.actualQty ? 'KG' : ''}</p></div>
                <div><p className="text-[8px] text-text-muted font-bold uppercase mb-1">COMPLETED AT</p><p className="text-[10px] font-bold text-black">{trip.completedAt || '—'}</p></div>
                <div><p className="text-[8px] text-text-muted font-bold uppercase mb-1">TOTAL EXPENSES</p><p className="text-[10px] font-bold text-accent-olive">₹{trip.expenses?.reduce((a, e) => a + Number(e.amount), 0).toLocaleString() || '0'}</p></div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Action Control Panel */}
          <Card className="border border-black bg-black p-4 text-white shadow-lg">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] mb-4 text-white/60 text-center md:text-left">WORKFLOW ACTION</h3>

            {tapal.status === 'Confirmed' && (
              <Button className="w-full bg-white text-black hover:bg-olive-50 text-[10px] font-bold uppercase gap-2 h-11" onClick={() => setIsDriverModalOpen(true)}>
                <UserPlus size={16} /> ASSIGN DRIVER
              </Button>
            )}

            {tapal.status === 'Expense Submitted' && (
              <div className="space-y-2">
                <Button className="w-full bg-green-600 text-white hover:bg-green-700 text-[10px] font-bold uppercase gap-2 h-11" onClick={handleCloseTrip}>
                  <CheckCircle2 size={16} /> APPROVE & CLOSE
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 text-[9px] font-bold h-10 uppercase">
                  REJECT EXPENSES
                </Button>
              </div>
            )}

            {tapal.status === 'Closed' && (
              <div className="text-center py-2">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-glow"><CheckCircle2 size={24} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-400">TRIP CLOSED</p>
                <p className="text-[8px] font-bold text-white/50 uppercase mt-1">LOGISTICS COMPLETE</p>
              </div>
            )}

            {['Assigned', 'Accepted', 'In Transit', 'Picked', 'Delivered'].includes(tapal.status) && (
              <div className="text-center py-4 border border-white/10 bg-white/5">
                <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full mx-auto mb-3"></div>
                <p className="text-[9px] font-bold uppercase tracking-widest">Waiting for Driver Action</p>
                <p className="text-[7px] text-white/50 uppercase mt-1">Status: {tapal.status}</p>
              </div>
            )}
          </Card>

          {/* Logistics Card (Static Info) */}
          <Card className="border border-card-border shadow-subtle bg-white p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-4">LOGISTICS INFO</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-olive-50 border border-card-border flex items-center justify-center text-accent-olive shadow-sm"><Truck size={18} /></div>
              <div>
                <p className="text-[10px] font-bold text-black uppercase tracking-tight">{tapal.driver || 'UNASSIGNED'}</p>
                {tapal.driverPhone && <p className="text-[9px] text-accent-olive font-bold uppercase tracking-tight">{tapal.driverPhone}</p>}
                <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">{tapal.vehicleNumber || 'ASSIGNED AGENT'}</p>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="border border-card-border shadow-subtle bg-white p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-4">TIMELINE</h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-px before:bg-olive-100">
              {[{ s: 'DRAFTED', t: tapal.date }, { s: tapal.status.toUpperCase(), t: 'LATEST UPDATE' }].map((ev, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className="w-6 h-6 bg-white border border-card-border flex items-center justify-center shadow-sm">
                    <div className="w-1.5 h-1.5 bg-black"></div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-black uppercase tracking-tight">{ev.s}</p>
                    <p className="text-[8px] text-text-muted font-bold">{ev.t}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Tapal: ${tapal.id}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">TYPE</label>
              <select value={editFormData.type} onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none bg-white">
                <option value="Purchase">PURCHASE</option>
                <option value="Sale">SALE</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">DATE</label>
              <input type="text" value={editFormData.date} onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none uppercase" />
            </div>
          </div>
          <div className="space-y-1.5"><label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">PARTY NAME</label><input type="text" value={editFormData.party} onChange={(e) => setEditFormData({ ...editFormData, party: e.target.value })} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none uppercase" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">QTY (KG)</label><input type="number" value={editFormData.qty} onChange={(e) => setEditFormData({ ...editFormData, qty: e.target.value })} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none" /></div>
            <div className="space-y-1.5"><label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">AMOUNT (₹)</label><input type="number" value={editFormData.amount} onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none" /></div>
          </div>
          <div className="flex gap-2 pt-2"><Button variant="outline" className="flex-1 text-[9px] font-bold h-9" onClick={() => setIsEditModalOpen(false)}>CANCEL</Button><Button className="flex-1 text-[9px] font-bold h-9 gap-2" onClick={handleSaveEdit}><Check size={14} /> UPDATE</Button></div>
        </div>
      </Modal>

      {/* Driver Assignment Modal */}
      <Modal isOpen={isDriverModalOpen} onClose={() => setIsDriverModalOpen(false)} title="Select Driver from Verified Fleet">
        <div className="space-y-2">
          {availableDrivers.length === 0 ? (
            <div className="py-8 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">No verified drivers currently available.</div>
          ) : (
            availableDrivers.map(driver => (
              <div key={driver.id} className="p-3 border border-card-border hover:bg-olive-50 cursor-pointer flex justify-between items-center transition-all group" onClick={() => handleAssignDriver(driver.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-[#C5A021] flex items-center justify-center font-bold text-[10px] border border-black shadow-sm">
                    <img src={`https://ui-avatars.com/api/?name=${driver.fullName}&background=0A0B09&color=C5A021&size=64&bold=true`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-black uppercase tracking-tight">{driver.fullName}</p>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">
                      {driver.vehicleNumber || 'No Vehicle'} · {driver.mobile || driver.phone || 'No Phone'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="success" className="text-[7px] uppercase px-2 py-0.5 border border-card-border shadow-none">VERIFIED</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Receive Stock Modal */}
      <Modal isOpen={isReceiveModalOpen} onClose={() => setIsReceiveModalOpen(false)} title="Final Stock Confirmation">
        <div className="space-y-4 text-center">
          <AlertCircle size={40} className="text-accent-olive mx-auto mb-2" />
          <div><p className="text-[11px] font-bold text-black uppercase tracking-tight">Enter Actual Quantity Received</p><p className="text-[9px] text-text-muted font-bold uppercase mt-1">Expected: {tapal.qty}</p></div>
          <input type="number" placeholder="Actual Weight (KG)" value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)} className="w-full border border-card-border px-4 py-3 text-lg font-serif italic text-center outline-none focus:ring-1 focus:ring-accent-olive" />
          <div className="flex gap-2"><Button variant="outline" className="flex-1 text-[9px] font-bold h-10" onClick={() => setIsReceiveModalOpen(false)}>CANCEL</Button><Button className="flex-1 text-[9px] font-bold h-10" onClick={handleConfirmReceipt}>CONFIRM & ADD STOCK</Button></div>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log Trip Expense">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">EXPENSE TYPE</label>
              <select value={expenseData.type} onChange={(e) => setExpenseData({ ...expenseData, type: e.target.value })} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold bg-white">
                <option value="FUEL">FUEL</option><option value="TOLL">TOLL</option><option value="FOOD">FOOD</option><option value="REPAIR">REPAIR</option><option value="OTHER">OTHER</option>
              </select>
            </div>
            <div className="space-y-1.5"><label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">AMOUNT (₹)</label><input type="number" value={expenseData.amount} onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold" /></div>
          </div>
          <div className="flex gap-2"><Button variant="outline" className="flex-1 text-[9px] font-bold h-10" onClick={() => setIsExpenseModalOpen(false)}>CANCEL</Button><Button className="flex-1 text-[9px] font-bold h-10" onClick={handleAddExpense}>LOG EXPENSE</Button></div>
        </div>
      </Modal>
      {/* Hidden Printable Component */}
      <div className="hidden print:block">
        <div className="printable-content">
          <PrintableTapal tapal={tapal} />
        </div>
      </div>
    </div>
  );
};

export default TapalDetail;
