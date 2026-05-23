import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { ArrowLeft, CheckCircle, PackageOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BuyerTapalVerify = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tapals, fetchTapals, completeTrip } = useAdminStore();
  const [tapal, setTapal] = useState(null);
  
  // Buyer-specific verification state
  const [verifiedQty, setVerifiedQty] = useState('');
  const [rates, setRates] = useState({});

  useEffect(() => {
    fetchTapals();
  }, [fetchTapals]);

  useEffect(() => {
    const found = tapals.find(t => t.id === id || t._id === id);
    if (found) {
      setTapal(found);
      setVerifiedQty(found.actualQty || found.qty || found.totalWeight || '');
      
      // Initialize rates for items
      if (found.items) {
        const initialRates = {};
        found.items.forEach(item => {
          initialRates[item.id] = item.rate || '';
        });
        setRates(initialRates);
      }
    }
  }, [id, tapals]);

  if (!tapal) return <div className="p-8 text-center text-text-muted">Loading Tapal...</div>;

  const handleRateChange = (itemId, value) => {
    setRates(prev => ({ ...prev, [itemId]: value }));
  };

  const handleVerify = async () => {
    if (!verifiedQty) {
      toast.error('Please enter the verified quantity');
      return;
    }
    const loadToast = toast.loading('Verifying load and submitting prices...');
    try {
      // In a real app we'd submit rates to the backend to generate the sales invoice.
      // Here we just use the mocked completeTrip which finalizes the logistics side.
      await completeTrip(tapal.id || tapal._id);
      toast.success('Load verified and invoice generated!', { id: loadToast });
      navigate('/mobile/buyer/invoices');
    } catch (err) {
      toast.error('Verification failed', { id: loadToast });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-[#6A7051] transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <PackageOpen className="text-brand-yellow" size={24} /> Verify Delivery #{tapal.tpNo || tapal.tapalNumber}
          </h1>
          <p className="text-text-secondary text-sm mt-1">Verify received quantities and enter agreed rates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-card-border p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
              Cargo Rate Assignment
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive">Item</th>
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-center">Boxes</th>
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-right">Weight (KG)</th>
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-right">Rate (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-xs">
                  {tapal.items?.length > 0 ? tapal.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-black uppercase">{item.particulars || item.name}</td>
                      <td className="py-3 px-3 text-center font-bold">{item.noOfBoxes || item.boxes || '-'}</td>
                      <td className="py-3 px-3 text-right font-bold">{item.totalWeight || item.weight}</td>
                      <td className="py-3 px-3 text-right">
                        <input
                          type="number"
                          value={rates[item.id] || ''}
                          onChange={(e) => handleRateChange(item.id, e.target.value)}
                          className="w-24 border border-card-border px-2 py-1.5 text-right font-bold focus:ring-1 focus:ring-brand-olive outline-none"
                          placeholder="0.00"
                        />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-text-muted italic">No items available to rate.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-card-border p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
              Final Verification
            </h3>
            
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Total Verified Weight (KG)</label>
                <input 
                  type="number" 
                  value={verifiedQty}
                  onChange={e => setVerifiedQty(e.target.value)}
                  className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-xl focus:ring-1 focus:ring-brand-olive outline-none font-bold"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-sm flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-700 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider leading-relaxed">
                  Submitting this verification will generate a final sales invoice based on the agreed rates. This action cannot be undone.
                </p>
              </div>

              <button
                onClick={handleVerify}
                className="w-full bg-emerald-700 text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} /> Confirm & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerTapalVerify;
