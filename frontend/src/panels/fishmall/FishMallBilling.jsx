import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Scale, Search, Calculator, X, Trash2, Printer } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { useFishMallStore } from '../../store/fishMallStore';

const FishMallBilling = () => {
  const { stock, addBill, updateStockQty } = useFishMallStore();
  const [cart, setCart] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('0.00');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

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

  const calculateTotal = () => cart.reduce((acc, i) => acc + i.total, 0);

  const handlePrint = () => {
    if (cart.length === 0) return;
    
    const billData = {
      items: cart,
      total: calculateTotal(),
      paymentMethod,
    };

    addBill(billData);
    
    // Update stock
    cart.forEach(item => {
      updateStockQty(item.id, -item.weight);
    });

    toast.success('Bill finalized & Stock synchronized!');
    setTimeout(() => {
      setCart([]);
      setShowCart(false);
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden selection:bg-black selection:text-white">
      {/* Product Selection Section */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scale & Search Header */}
        <div className="p-4 bg-white border-b border-black/5 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 shadow-sm z-10">
          {/* Digital Scale Display */}
          <div className="bg-black text-white p-5 relative overflow-hidden group border-none shadow-xl flex flex-col justify-center">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Scale Live Data</p>
              </div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-black tracking-tighter font-serif italic text-[#E6E2C8]">{currentWeight || '0.00'}</h2>
                <span className="text-xs font-black text-white/20 uppercase tracking-widest">Kilograms</span>
              </div>
            </div>
            <Scale className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-700" size={140} />
          </div>

          <div className="md:col-span-2 flex flex-col justify-between py-1 gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative group">
                <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={14} />
                <input 
                  type="number" 
                  step="0.01"
                  value={currentWeight === '0.00' ? '' : currentWeight}
                  placeholder="MANUAL WEIGHT ENTRY..."
                  className="w-full bg-gray-50 border border-black/5 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-black outline-none transition-all"
                  onChange={(e) => setCurrentWeight(e.target.value)}
                />
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="FILTER INVENTORY SKU..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-black/5 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-black outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-text-muted">Terminal #FM-02 • Operational</p>
              <div className="flex gap-4">
                <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7550]">Rates Updated: Today</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-black">Operator: Ramesh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-20 lg:pb-0">
            {filteredProducts.map((fish) => (
              <button
                key={fish.id}
                onClick={() => addToCart(fish)}
                disabled={fish.qty <= 0}
                className={`bg-white border border-black/5 group relative overflow-hidden transition-all hover:shadow-wapixo hover:border-black/20 text-left ${fish.qty <= 0 ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                  🐟
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-black text-black text-[10px] uppercase tracking-tight leading-tight flex-1 line-clamp-2">
                      {fish.name}
                    </h3>
                    <span className="text-xs font-serif italic font-black text-black shrink-0">
                      ₹{fish.rate}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-black/5">
                    <span className="text-[7px] text-text-muted font-black uppercase tracking-widest">Rate Per KG</span>
                    <span className={`text-[7px] font-black uppercase tracking-widest ${fish.qty < 50 ? 'text-red-500' : 'text-[#6B7550]'}`}>
                      Stock: {fish.qty} {fish.unit}
                    </span>
                  </div>
                </div>

                {fish.qty <= 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                     <span className="bg-black text-white text-[8px] font-black px-4 py-2 uppercase tracking-widest -rotate-12 border border-white shadow-2xl">
                       Depleted
                     </span>
                  </div>
                )}
                
                {/* Weigh-in Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest shadow-xl border border-white/20">
                    Sync Weight
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto w-full sm:w-[420px] bg-white border-l border-black/10 flex flex-col shadow-2xl transition-transform duration-300 transform ${
        showCart ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="h-14 flex items-center justify-between px-6 bg-black text-white shrink-0">
          <div className="flex items-center gap-3">
            <Calculator size={18} className="text-[#6B7550]" />
            <h2 className="font-serif italic font-black text-lg uppercase tracking-tight">Billing Statement.</h2>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setShowCart(false)} className="p-2 text-white lg:hidden"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-20">
              <Scale size={48} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Terminal Standby<br/>No Active Weight Sync
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="flex items-center gap-4 p-4 bg-gray-50 border border-black/5 hover:bg-white transition-all group relative overflow-hidden">
                <div className="w-12 h-12 bg-white border border-black/5 flex flex-col items-center justify-center shrink-0">
                   <span className="text-xs font-black text-black leading-none">{item.weight}</span>
                   <span className="text-[7px] font-black text-black/30 uppercase mt-1">KG</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-black uppercase tracking-tight truncate">{item.name}</p>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-1">₹{item.rate} / KG</p>
                </div>
                <div className="text-right flex items-center gap-4">
                   <p className="text-lg font-serif italic font-black text-[#6B7550]">₹{item.total.toLocaleString()}</p>
                   <button 
                    onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))} 
                    className="p-2 text-black/20 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-white border-t border-black space-y-8 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
          <div className="space-y-4">
             <div className="flex justify-between items-center text-[9px] font-black text-text-muted uppercase tracking-widest">
              <span>Gross Subtotal</span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-black text-text-muted uppercase tracking-widest">
              <span>Handling Fee</span>
              <span className="text-[#6B7550]">₹0.00</span>
            </div>
            <div className="pt-6 border-t border-black/10 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Total Payable</p>
                <p className="text-4xl font-serif italic font-black text-black tracking-tighter">₹{calculateTotal().toLocaleString()}</p>
              </div>
              <Calculator size={32} className="opacity-10 mb-2" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[8px] font-black uppercase tracking-[0.4em] text-text-muted block text-center">Settlement Protocol</label>
            <div className="grid grid-cols-2 gap-3">
              {['Cash', 'Online'].map(method => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-5 border transition-all text-[9px] font-black uppercase tracking-[0.2em] ${
                    paymentMethod === method 
                      ? 'bg-black text-white border-black shadow-xl' 
                      : 'border-black/10 text-text-muted bg-white hover:border-black hover:text-black shadow-sm'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handlePrint}
            className="w-full py-10 text-[12px] font-black uppercase tracking-[0.4em] gap-4 bg-black text-white hover:bg-[#6B7550] border-none shadow-wapixo active:scale-[0.98] transition-all"
            disabled={cart.length === 0}
          >
            <Printer size={20} /> Print Invoice
          </Button>
        </div>
      </div>

      {/* Floating Checkout for Mobile */}
      {!showCart && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-black text-white p-5 shadow-2xl z-40 flex items-center gap-5 border border-white/20 active:scale-95"
        >
          <div className="relative">
            <Scale size={24} />
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center border-2 border-black">
              {cart.length}
            </span>
          </div>
          <div className="text-left leading-none">
            <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">Statement Total</p>
            <p className="text-lg font-black uppercase tracking-tight">₹{calculateTotal().toLocaleString()}</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default FishMallBilling;

