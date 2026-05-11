import React, { useState, useEffect } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Modal } from '../../../design-system/components/Modal';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Package,
  User,
  Truck,
  IndianRupee,
  ShieldCheck,
  Pencil
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const SalesApprovalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { tapals, inventory, approveSalesTapal, rejectSalesTapal, suggestChangeSalesTapal } = useAdminStore();
  
  const tapal = tapals.find(t => t.id === id);
  const [editedProducts, setEditedProducts] = useState([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    if (tapal && tapal.products) {
      setEditedProducts(tapal.products.map(p => ({
        ...p,
        qtyVal: parseFloat(p.qty),
        rateVal: parseFloat(p.rate.replace('₹', ''))
      })));
    }
  }, [tapal]);

  if (!tapal) return <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Record not found.</div>;

  const handleProductChange = (idx, field, value) => {
    const newProducts = [...editedProducts];
    newProducts[idx][field] = value;
    
    // Recalculate totals
    const qty = parseFloat(newProducts[idx].qtyVal) || 0;
    const rate = parseFloat(newProducts[idx].rateVal) || 0;
    newProducts[idx].qty = `${qty} KG`;
    newProducts[idx].rate = `₹${rate}`;
    newProducts[idx].total = `₹${(qty * rate).toLocaleString()}`;
    
    setEditedProducts(newProducts);
  };

  const calculateTotal = () => {
    return editedProducts.reduce((acc, p) => acc + (parseFloat(p.qtyVal) * parseFloat(p.rateVal) || 0), 0);
  };

  const handleApprove = () => {
    const totalQty = editedProducts.reduce((acc, p) => acc + (parseFloat(p.qtyVal) || 0), 0);
    const editedData = {
      products: editedProducts,
      qty: `${totalQty} KG`,
      amount: `₹${calculateTotal().toLocaleString()}`
    };
    approveSalesTapal(tapal.id, editedData, user?.name || 'ADMIN');
    toast.success('Sales Tapal Approved & Invoice Generated');
    navigate('/admin/sales-approval');
  };

  const handleReject = () => {
    if (!rejectionReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectSalesTapal(tapal.id, rejectionReason, user?.name || 'ADMIN');
    toast.error('Sales Tapal Rejected');
    setIsRejectModalOpen(false);
    navigate('/admin/sales-approval');
  };

  const handleSuggest = () => {
    if (!suggestion) {
      toast.error('Please provide suggested changes');
      return;
    }
    suggestChangeSalesTapal(tapal.id, suggestion, user?.name || 'ADMIN');
    toast.info('Changes Suggested to Mahesh');
    setIsSuggestModalOpen(false);
    navigate('/admin/sales-approval');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={() => navigate('/admin/sales-approval')} className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest group">
        <ArrowLeft size={14} /> BACK TO QUEUE
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
            <div className="p-6 border-b border-card-border flex justify-between items-start">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-serif italic font-bold text-black uppercase">{tapal.id}</h2>
                    <Badge variant="warning" className="text-[8px] px-2 py-0.5">{tapal.status}</Badge>
                  </div>
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em]">CREATED BY: {tapal.createdBy || 'ADMIN'}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.2em]">DATE</p>
                  <p className="text-[11px] font-bold text-black">{tapal.date}</p>
               </div>
            </div>

            <div className="p-6 space-y-6">
               {/* Buyer Info */}
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-text-muted">
                        <User size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Buyer Details</span>
                     </div>
                     <div className="bg-olive-50/30 p-3 border border-card-border/50">
                        <p className="text-[12px] font-bold text-black uppercase">{tapal.party}</p>
                        <p className="text-[10px] text-text-muted font-medium mt-1 leading-relaxed uppercase">{tapal.deliveryAddress || 'No Address Provided'}</p>
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-text-muted">
                        <Truck size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Logistics Status</span>
                     </div>
                     <div className="bg-olive-50/30 p-3 border border-card-border/50 flex flex-col justify-center h-[72px]">
                        <p className="text-[11px] font-bold text-black uppercase">{tapal.driver || 'UNASSIGNED'}</p>
                        <p className="text-[9px] text-text-muted font-bold mt-1 uppercase">Next: Assign Driver after approval</p>
                     </div>
                  </div>
               </div>

               {/* Products Table */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-text-muted">
                        <Package size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Line Items Review</span>
                     </div>
                     <p className="text-[8px] text-amber-600 font-bold uppercase italic">* Edit values below if needed</p>
                  </div>
                  <div className="border border-card-border overflow-hidden">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-olive-100/20 border-b border-card-border">
                              <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest">Item Name</th>
                              <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest">Qty (KG)</th>
                              <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest">Rate (₹)</th>
                              <th className="px-4 py-2 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-card-border">
                           {editedProducts.map((p, idx) => (
                              <tr key={idx} className="hover:bg-olive-50/30 transition-colors">
                                 <td className="px-4 py-3 text-[10px] font-bold text-black uppercase">{p.name}</td>
                                 <td className="px-4 py-3">
                                    <input 
                                       type="number" 
                                       value={p.qtyVal} 
                                       onChange={(e) => handleProductChange(idx, 'qtyVal', e.target.value)}
                                       className="w-20 bg-amber-50/50 border border-amber-200 px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                 </td>
                                 <td className="px-4 py-3">
                                    <input 
                                       type="number" 
                                       value={p.rateVal} 
                                       onChange={(e) => handleProductChange(idx, 'rateVal', e.target.value)}
                                       className="w-20 bg-amber-50/50 border border-amber-200 px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                 </td>
                                 <td className="px-4 py-3 text-[10px] font-bold text-black text-right">{p.total}</td>
                              </tr>
                           ))}
                        </tbody>
                        <tfoot>
                           <tr className="bg-black text-white">
                              <td colSpan="3" className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest">Final Sales Value</td>
                              <td className="px-4 py-3 text-right text-lg font-serif italic font-bold">₹{calculateTotal().toLocaleString()}</td>
                           </tr>
                        </tfoot>
                     </table>
                  </div>
               </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 bg-olive-50/50 border-t border-card-border flex justify-between gap-3">
               <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="bg-white text-red-600 border-red-200 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest px-6 h-10 gap-2" onClick={() => setIsRejectModalOpen(true)}>
                     <XCircle size={16} /> REJECT
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 text-[10px] font-black uppercase tracking-widest px-6 h-10 gap-2" onClick={() => setIsSuggestModalOpen(true)}>
                     <Pencil size={16} /> SUGGEST CHANGE
                  </Button>
               </div>
               <Button size="sm" className="bg-black text-white hover:bg-accent-olive text-[11px] font-black uppercase tracking-[0.2em] px-10 h-10 gap-2 shadow-lg" onClick={handleApprove}>
                  <CheckCircle2 size={18} /> APPROVE & BILL
               </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
           <Card className="bg-black text-white border-none p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4 flex items-center gap-2">
                 <ShieldCheck size={14} className="text-accent-olive" /> Verification Checklist
              </h3>
              <ul className="space-y-3">
                 {[
                   'Inventory Availability checked',
                   'Buyer pricing is correct',
                   'Delivery address verified',
                   'Mahesh notified of approval'
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                      <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                         <div className="w-1.5 h-1.5 bg-accent-olive rounded-full"></div>
                      </div>
                      {item}
                   </li>
                 ))}
              </ul>
           </Card>

           <Card className="bg-white border border-card-border p-5 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-1 flex items-center gap-2">
                 <Package size={14} className="text-accent-olive" /> Stock Verification
              </h3>
              <div className="space-y-2">
                 {editedProducts.map((p, idx) => {
                    const stock = inventory.find(i => i.name.toUpperCase() === p.name.toUpperCase());
                    const isLow = stock ? stock.qty < parseFloat(p.qtyVal) : true;
                    return (
                       <div key={idx} className="p-3 bg-olive-50/50 border border-card-border/50">
                          <div className="flex justify-between items-center mb-1">
                             <p className="text-[9px] font-bold text-black uppercase">{p.name}</p>
                             <Badge variant={isLow ? 'danger' : 'success'} className="text-[7px] border-none px-1 h-3.5">
                                {isLow ? 'INSUFFICIENT' : 'AVAILABLE'}
                             </Badge>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                             <span className="text-text-muted">Available Stock:</span>
                             <span className={clsx("text-black", isLow && "text-red-600")}>{stock ? `${stock.qty} KG` : '0 KG'}</span>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Reject Sales Tapal">
         <div className="space-y-4 p-2">
            <div className="space-y-1.5">
               <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Reason for Rejection</label>
               <textarea 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-card-border px-3 py-2 text-[10px] font-bold uppercase outline-none min-h-[100px] focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. PRICING TOO LOW / STOCK ALREADY RESERVED"
               />
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="flex-1 text-[9px] font-bold h-9" onClick={() => setIsRejectModalOpen(false)}>CANCEL</Button>
               <Button className="flex-1 bg-red-600 text-white h-9 text-[9px] font-bold gap-2 uppercase tracking-widest" onClick={handleReject}>CONFIRM REJECTION</Button>
            </div>
         </div>
      </Modal>

      {/* Suggest Modal */}
      <Modal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} title="Suggest Changes">
         <div className="space-y-4 p-2">
            <div className="space-y-1.5">
               <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Suggested Changes / Notes</label>
               <textarea 
                  value={suggestion} 
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="w-full border border-card-border px-3 py-2 text-[10px] font-bold uppercase outline-none min-h-[100px] focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. PLEASE INCREASE RATE TO ₹95 FOR THIS BUYER"
               />
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="flex-1 text-[9px] font-bold h-9" onClick={() => setIsSuggestModalOpen(false)}>CANCEL</Button>
               <Button className="flex-1 bg-blue-600 text-white h-9 text-[9px] font-bold gap-2 uppercase tracking-widest" onClick={handleSuggest}>SEND SUGGESTION</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default SalesApprovalDetail;
