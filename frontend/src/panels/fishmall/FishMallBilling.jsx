import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Scale, Search, Calculator, X, Trash2, Printer, ChevronRight, QrCode, Receipt } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { useFishMallStore } from '../../store/fishMallStore';

const FishMallBilling = () => {
  const { stock, createSaleAsync, fetchStock, loading } = useFishMallStore();
  const [cart, setCart] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('0.00');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  React.useEffect(() => {
    fetchStock();
  }, [fetchStock]);
  const [additionalCharges, setAdditionalCharges] = useState({
    cleaning: { active: false, amount: 20 },
    cutting: { active: false, amount: 10 },
    packing: { active: false, amount: 15 },
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastBill, setLastBill] = useState(null);

  const filteredProducts = stock.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (fish) => {
    const weight = parseFloat(currentWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Invalid weight');
      return;
    }
    if (weight > fish.qty) {
      toast.error(`Only ${fish.qty}kg available`);
      return;
    }
    
    setCart([...cart, { 
      ...fish, 
      weight, 
      total: weight * fish.rate,
      cartId: Date.now() 
    }]);
    setCurrentWeight('0.00');
    toast.success(`${fish.name} added`, { duration: 800 });
  };

  const calculateSubtotal = () => cart.reduce((acc, i) => acc + i.total, 0);
  
  const calculateAdditionalTotal = () => {
    let total = 0;
    const netWeight = cart.reduce((acc, i) => acc + i.weight, 0);
    if (additionalCharges.cleaning.active) total += additionalCharges.cleaning.amount * netWeight;
    if (additionalCharges.cutting.active) total += additionalCharges.cutting.amount * netWeight;
    if (additionalCharges.packing.active) total += additionalCharges.packing.amount; // Flat packing
    return total;
  };

  const calculateTotal = () => calculateSubtotal() + calculateAdditionalTotal();

  const handleFinish = async () => {
    if (cart.length === 0) return;
    
    const billData = {
      items: cart.map(item => ({
        inventoryItemId: item.id,
        fishName: item.name,
        scaleWeight: item.weight,
        rate: item.rate,
        total: item.total
      })),
      subtotal: calculateSubtotal(),
      additional: calculateAdditionalTotal(),
      total: calculateTotal(),
      paymentMethod: paymentMethod === 'Cash' ? 'CASH' : 'UPI',
      charges: additionalCharges
    };

    try {
      const res = await createSaleAsync(billData);
      setLastBill({ 
        ...billData, 
        id: res?.data?.saleNumber || res?.saleNumber || `FM-${Date.now()}`, 
        timestamp: new Date().toISOString() 
      });
      setShowInvoice(true);
      toast.success('Bill finalized & Stock Adjusted!');
    } catch (err) {
      toast.error('Failed to process sale');
    }
  };

  const resetBilling = () => {
    setCart([]);
    setShowCart(false);
    setShowInvoice(false);
    setAdditionalCharges({
      cleaning: { active: false, amount: 20 },
      cutting: { active: false, amount: 10 },
      packing: { active: false, amount: 15 },
    });
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden selection:bg-[#6B7550] selection:text-white font-sans">
      {/* Product Selection Section */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-gray-200">
        {/* Compact Terminal Header */}
        <div className="p-3 bg-white border-b border-gray-200 flex items-stretch gap-3 shrink-0 z-10">
          {/* Digital Scale Display - Compact */}
          <div className="bg-black text-white px-4 py-2 flex items-center gap-4 rounded-xl shadow-lg border border-white/10 group">
             <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[7px] font-black uppercase tracking-widest text-white/40">Scale Sync</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-black tracking-tighter text-[#E6E2C8] leading-none">{currentWeight || '0.00'}</h2>
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">KG</span>
                </div>
             </div>
             <Scale className="text-white/5 group-hover:text-white/10 transition-colors" size={24} />
          </div>

          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative group">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" size={12} />
              <input 
                type="number" 
                step="0.01"
                value={currentWeight === '0.00' ? '' : currentWeight}
                placeholder="ENTER WEIGHT..."
                className="w-full h-full bg-gray-50 border border-gray-200 pl-9 pr-3 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-[#6B7550] outline-none transition-all rounded-xl"
                onChange={(e) => setCurrentWeight(e.target.value)}
              />
            </div>
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" size={12} />
              <input 
                type="text" 
                placeholder="SEARCH MENU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-gray-50 border border-gray-200 pl-9 pr-3 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-[#6B7550] outline-none transition-all rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Product Grid - High Density */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 pb-20 lg:pb-0">
            {filteredProducts.map((fish) => (
              <button
                key={fish.id}
                onClick={() => addToCart(fish)}
                disabled={fish.qty <= 0}
                className={`bg-white border border-gray-200 group relative overflow-hidden transition-all hover:border-[#6B7550] hover:shadow-xl text-left rounded-xl p-2 ${fish.qty <= 0 ? 'opacity-40 grayscale' : ''}`}
              >
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                  🐟
                </div>
                
                <div className="mt-3 px-1">
                  <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-tight truncate leading-none mb-1">
                    {fish.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#6B7550]">₹{fish.rate}</span>
                    <span className={`text-[8px] font-bold uppercase ${fish.qty < 50 ? 'text-rose-500' : 'text-gray-400'}`}>
                      {fish.qty} KG
                    </span>
                  </div>
                </div>

                {fish.qty <= 0 && (
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10">
                     <span className="bg-black text-white text-[7px] font-black px-2 py-1 uppercase tracking-widest -rotate-12 border border-white">SOLD OUT</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Sidebar - Compact */}
      <div className={`fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto w-full sm:w-[360px] bg-white border-l border-gray-200 flex flex-col shadow-2xl transition-transform duration-300 transform ${
        showCart ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <Receipt className="text-[#6B7550]" size={18} />
            <h2 className="font-black text-xs uppercase tracking-widest">Bill Statement</h2>
          </div>
          <button onClick={() => setShowCart(false)} className="p-2 text-gray-400 lg:hidden"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
              <Scale size={40} className="mb-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Terminal Standby</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-100 rounded-xl group relative">
                <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex flex-col items-center justify-center shrink-0">
                   <span className="text-[10px] font-black text-gray-900">{item.weight}</span>
                   <span className="text-[6px] font-black text-gray-400 uppercase">KG</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-gray-900 uppercase truncate tracking-tight">{item.name}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">₹{item.rate}/KG</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-black text-[#6B7550]">₹{item.total.toLocaleString()}</p>
                   <button 
                    onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))} 
                    className="absolute -top-1 -right-1 p-1 bg-white border border-gray-200 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-200 space-y-4 shrink-0">
          {/* Additional Charges Section */}
          <div className="space-y-2 border-b border-gray-100 pb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Additional Services (Optional)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cleaning', label: 'Cleaning', amount: additionalCharges.cleaning.amount },
                { id: 'cutting', label: 'Cutting', amount: additionalCharges.cutting.amount },
                { id: 'packing', label: 'Packing', amount: additionalCharges.packing.amount }
              ].map(charge => (
                <button
                  key={charge.id}
                  onClick={() => setAdditionalCharges({
                    ...additionalCharges,
                    [charge.id]: { ...additionalCharges[charge.id], active: !additionalCharges[charge.id].active }
                  })}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    additionalCharges[charge.id].active 
                      ? 'bg-[#6B7550] text-white border-[#6B7550]' 
                      : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <p className="text-[7px] font-black uppercase mb-0.5">{charge.label}</p>
                  <p className="text-[8px] font-bold">₹{charge.amount}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>Items Total</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>Addl. Charges</span>
              <span>₹{calculateAdditionalTotal().toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between items-end">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{calculateTotal().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {['Cash', 'Online'].map(method => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-3 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                    paymentMethod === method 
                      ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                      : 'border-gray-200 text-gray-400 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <Button 
              onClick={handleFinish}
              className="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] gap-3 bg-[#6B7550] text-white hover:bg-black border-none shadow-xl shadow-[#6B7550]/20 active:scale-[0.98] transition-all rounded-xl"
              disabled={cart.length === 0 || loading}
            >
              <Printer size={16} /> Finish & Print
            </Button>
          </div>
        </div>
      </div>

      {/* Step 5: Invoice Modal */}
      {showInvoice && lastBill && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto font-sans">
          <div className="max-w-md mx-auto w-full p-8 space-y-8 print:p-0">
            <div className="flex justify-between items-center print:hidden">
              <button onClick={resetBilling} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-[10px]">
                <X size={16} /> Close Terminal
              </button>
              <button onClick={() => window.print()} className="bg-[#6B7550] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-[#6B7550]/20 active:scale-95 transition-all">
                <Printer size={16} /> Print Receipt
              </button>
            </div>

            <div className="text-center space-y-2">
              <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-20 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">GOLDEN FISH MALL</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fresh Seafood Terminal #FM-02</p>
              <p className="text-[8px] text-gray-400">GSTIN: 27AAGFG1234F1Z1 • PH: +91 98765 43210</p>
            </div>

            <div className="border-t-2 border-b-2 border-gray-100 py-6 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt No</p>
                <p className="text-xs font-black">{lastBill.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date/Time</p>
                <p className="text-xs font-black">{new Date(lastBill.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fish Description</th>
                  <th className="py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Weight</th>
                  <th className="py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lastBill.items.map((item) => (
                  <tr key={item.cartId}>
                    <td className="py-4">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Rate: ₹{item.rate}/KG</p>
                    </td>
                    <td className="py-4 text-center text-xs font-black">{item.weight} KG</td>
                    <td className="py-4 text-right text-xs font-black">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Additional Charges breakdown */}
            {(lastBill.additional > 0) && (
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Additional Services</p>
                {Object.entries(lastBill.charges).map(([key, charge]) => charge.active && (
                  <div key={key} className="flex justify-between text-[9px] font-bold uppercase text-gray-600">
                    <span>{key} Service</span>
                    <span>₹{key === 'packing' ? charge.amount : (charge.amount * lastBill.items.reduce((a,b)=>a+b.weight,0)).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-6 border-t-2 border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Items Subtotal</span>
                <span>₹{lastBill.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Addl. Services Total</span>
                <span>₹{lastBill.additional.toLocaleString()}</span>
              </div>
              <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                <span className="text-lg font-black text-gray-900 uppercase tracking-[0.2em]">Total Paid</span>
                <p className="text-4xl font-black text-gray-900">₹{lastBill.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 pt-12 border-t-2 border-dashed border-gray-200">
              <div className="bg-white p-4 border-2 border-gray-50 rounded-[32px] shadow-sm">
                 <QrCode size={100} className="text-gray-900" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Thank you for your purchase!</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Freshness Guaranteed • Golden Fish Mall</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishMallBilling;
