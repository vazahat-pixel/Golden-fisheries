import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, ShoppingCart, Trash2, X, Utensils, 
  Minus, Plus, Banknote, CreditCard, Printer, CheckCircle2, 
  Clock, User, Hash, Info, Percent, Tag, QrCode, SplitSquareVertical,
  ChevronRight, ChefHat, Receipt, AlertCircle, LayoutGrid, Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../design-system/components/Button';

const RestaurantPOS = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    menuItems, tables, kots, coupons,
    createKOT, settleOrder, updateTableStatus 
  } = useRestaurantStore();

  const [orderType, setOrderType] = useState('Dine In');
  const [tableLabel, setTableLabel] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState({ type: 'flat', value: 0 });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [splitCount, setSplitCount] = useState(1);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isMixedPayment, setIsMixedPayment] = useState(false);
  const [mixedPayment, setMixedPayment] = useState({ cash: 0, upi: 0 });
  const [billingView, setBillingView] = useState(false);

  const categories = ["All Items", ...new Set(menuItems.map(item => item.category))];
  const orderTypes = ['Dine In', 'Parcel', 'Takeaway', 'Online Order', 'Bulk Order'];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1, notes: '' }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const updateItemNotes = (id, notes) => {
    setCart(cart.map(i => i.id === id ? { ...i, notes } : i));
  };

  const calculateSubtotal = () => cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  
  const calculateTax = () => {
    return cart.reduce((acc, i) => acc + (i.price * i.qty * (i.gstRate / 100)), 0);
  };

  const calculateDiscount = () => {
    let amt = 0;
    const sub = calculateSubtotal();
    if (discount.type === 'flat') amt = Number(discount.value);
    else amt = sub * (Number(discount.value) / 100);
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'flat') amt += appliedCoupon.value;
      else amt += sub * (appliedCoupon.value / 100);
    }
    return amt;
  };

  const calculateTotal = () => {
    const total = calculateSubtotal() + calculateTax() - calculateDiscount();
    return Math.round(total);
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    if (orderType === 'Dine In' && !tableLabel) {
      toast.error('Please select or enter a Table Number');
      return;
    }
    createKOT({
      tableId: tableLabel || 'COUNTER',
      tableLabel: tableLabel || 'COUNTER',
      orderType,
      items: cart,
      staffName: user?.name || 'Staff',
      notes: ''
    });
    toast.success(`KOT Generated for ${tableLabel || 'COUNTER'}`);
  };

  const handleApplyCoupon = () => {
    const coupon = coupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success('Coupon Applied: ' + coupon.description);
    } else {
      toast.error('Invalid Coupon Code');
    }
  };

  const handleSettle = () => {
    if (orderType === 'Dine In' && !tableLabel) {
      toast.error('Please select or enter a Table Number');
      return;
    }
    const total = calculateTotal();
    const orderData = {
      tableId: tableLabel || 'COUNTER',
      tableLabel: tableLabel || 'COUNTER',
      orderType,
      items: cart,
      subtotal: calculateSubtotal(),
      gstAmount: calculateTax(),
      discount: calculateDiscount(),
      coupon: appliedCoupon,
      total,
      paymentBreakdown: isMixedPayment ? mixedPayment : { [paymentMode.toLowerCase()]: total },
      staffName: user?.name || 'Staff'
    };

    const order = settleOrder(orderData);
    setLastOrder(order);
    setShowInvoice(true);
    toast.success('Order Settled Successfully!');
  };

  const resetPOS = () => {
    setCart([]);
    setDiscount({ type: 'flat', value: 0 });
    setCouponCode('');
    setAppliedCoupon(null);
    setShowInvoice(false);
    setTableLabel('');
    setBillingView(false);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden animate-in fade-in duration-300">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-gray-200">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => navigate('/restaurant/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="hidden xl:block">
              <h1 className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">Terminal POS</h1>
              <p className="text-[9px] text-[#6B7550] font-bold uppercase tracking-widest mt-1">Op: {user?.name}</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center gap-3 max-w-2xl">
            {/* Order Type Datalist */}
            <div className="flex-1 relative group">
              <span className="absolute -top-2 left-3 px-1 bg-white text-[8px] font-black text-gray-400 uppercase tracking-widest z-10">Order Type</span>
              <input 
                list="orderTypes" 
                value={orderType} 
                onChange={(e) => setOrderType(e.target.value)}
                placeholder="Select Type"
                className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl focus:bg-white focus:border-[#6B7550] outline-none transition-all"
              />
              <datalist id="orderTypes">
                {orderTypes.map(type => <option key={type} value={type} />)}
              </datalist>
            </div>

            {/* Table Datalist */}
            <div className={`flex-1 relative group transition-opacity ${orderType !== 'Dine In' ? 'opacity-30' : ''}`}>
              <span className="absolute -top-2 left-3 px-1 bg-white text-[8px] font-black text-gray-400 uppercase tracking-widest z-10">Table / Counter</span>
              <input 
                list="tables" 
                value={tableLabel} 
                onChange={(e) => setTableLabel(e.target.value)}
                placeholder={orderType === 'Dine In' ? "Select Table" : "Counter"}
                disabled={orderType !== 'Dine In'}
                className="w-full bg-gray-50 border border-gray-200 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl focus:bg-white focus:border-[#6B7550] outline-none transition-all"
              />
              <datalist id="tables">
                {tables.map(table => <option key={table.id} value={table.label} />)}
              </datalist>
            </div>

            <div className="relative w-48 hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search Menu..." 
                className="w-full bg-gray-50 border border-gray-200 py-3 pl-10 pr-4 text-[10px] font-bold uppercase tracking-widest rounded-xl focus:bg-white focus:border-[#6B7550] outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="bg-white border-b border-gray-100 px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeCategory === cat ? 'bg-[#6B7550] text-white' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {menuItems.filter(item => 
            (activeCategory === 'All Items' || item.category === activeCategory) &&
            item.name.toLowerCase().includes(search.toLowerCase())
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="group bg-white border border-gray-200 p-4 rounded-2xl hover:border-[#6B7550] hover:shadow-xl transition-all text-left flex flex-col"
            >
              <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                {item.image}
              </div>
              <h3 className="font-black text-gray-900 text-xs uppercase tracking-tight mb-1 line-clamp-1">{item.name}</h3>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-black text-[#6B7550]">₹{item.price}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">{item.stock} LEFT</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-[400px] bg-white flex flex-col border-l border-gray-200">
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart size={18} className="text-[#6B7550]" />
            <h2 className="font-black text-gray-900 uppercase tracking-widest text-xs">Order Manifest</h2>
          </div>
          <span className="bg-[#6B7550]/10 text-[#6B7550] px-2 py-1 rounded-md text-[10px] font-black">{cart.length} ITEMS</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
              <Utensils size={48} className="mb-4 text-gray-200" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cart Empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl border border-gray-100">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-900 uppercase truncate">{item.name}</p>
                    <p className="text-xs font-black text-[#6B7550]">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:bg-gray-50"><Minus size={10} /></button>
                    <span className="w-8 text-center text-[10px] font-black">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:bg-gray-50"><Plus size={10} /></button>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Cooking instructions..." 
                  className="w-full bg-transparent border-none p-0 text-[10px] italic text-gray-500 focus:ring-0"
                  value={item.notes}
                  onChange={(e) => updateItemNotes(item.id, e.target.value)}
                />
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-200 space-y-4 shrink-0">
          <div className="flex gap-2">
            <Button onClick={handleSendToKitchen} disabled={cart.length === 0} className="flex-1 bg-amber-500 hover:bg-amber-600 border-none text-[10px] font-black uppercase tracking-widest py-3 rounded-xl">
              <ChefHat size={14} className="mr-2" /> KOT
            </Button>
            <Button onClick={() => setBillingView(true)} disabled={cart.length === 0} className="flex-1 bg-[#6B7550] hover:bg-black border-none text-[10px] font-black uppercase tracking-widest py-3 rounded-xl">
              <Receipt size={14} className="mr-2" /> Billing
            </Button>
          </div>
        </div>
      </div>

      {/* Billing Modal Overlay */}
      {billingView && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[32px] overflow-hidden flex h-[600px] shadow-2xl">
            {/* Payment Details */}
            <div className="flex-1 p-10 flex flex-col overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Checkout</h2>
                <button onClick={() => setBillingView(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Payment Method</p>
                  <div className="grid grid-cols-3 gap-4">
                    {['Cash', 'UPI', 'Card', 'Credit'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setPaymentMode(mode); setIsMixedPayment(false); }}
                        className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                          paymentMode === mode && !isMixedPayment ? 'border-[#6B7550] bg-[#6B7550]/5 text-[#6B7550]' : 'border-gray-100 text-gray-400'
                        }`}
                      >
                        {mode === 'Cash' && <Banknote size={24} />}
                        {mode === 'UPI' && <QrCode size={24} />}
                        {mode === 'Card' && <CreditCard size={24} />}
                        {mode === 'Credit' && <AlertCircle size={24} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{mode}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setIsMixedPayment(true)}
                      className={`p-6 border-2 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                        isMixedPayment ? 'border-[#6B7550] bg-[#6B7550]/5 text-[#6B7550]' : 'border-gray-100 text-gray-400'
                      }`}
                    >
                      <SplitSquareVertical size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Mixed</span>
                    </button>
                  </div>
                </div>

                {isMixedPayment && (
                  <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cash Amount</label>
                      <input type="number" value={mixedPayment.cash} onChange={e => setMixedPayment({...mixedPayment, cash: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 font-black text-lg focus:border-[#6B7550] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">UPI Amount</label>
                      <input type="number" value={mixedPayment.upi} onChange={e => setMixedPayment({...mixedPayment, upi: Number(e.target.value)})} className="w-full bg-white border border-gray-200 rounded-xl p-3 font-black text-lg focus:border-[#6B7550] outline-none transition-all" />
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Discounts & Coupons</p>
                  <div className="flex gap-4">
                    <div className="flex-1 flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#6B7550] transition-all bg-gray-50">
                      <input 
                        type="text" 
                        placeholder="COUPON CODE" 
                        className="flex-1 bg-transparent border-none p-4 text-[10px] font-black uppercase tracking-widest outline-none"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button onClick={handleApplyCoupon} className="px-6 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Apply</button>
                    </div>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 bg-gray-50 focus-within:border-[#6B7550] transition-all">
                      <Tag size={14} className="text-gray-400" />
                      <input 
                        type="number" 
                        placeholder="FLAT OFF" 
                        className="w-24 bg-transparent border-none p-4 text-[10px] font-black outline-none"
                        value={discount.value}
                        onChange={(e) => setDiscount({...discount, value: e.target.value})}
                      />
                    </div>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-3 flex items-center justify-between bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-100 animate-in fade-in duration-300">
                      <span className="text-[10px] font-bold uppercase">{appliedCoupon.description}</span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-rose-500 font-black hover:scale-110 transition-transform"><X size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="w-[340px] bg-gray-50 p-10 flex flex-col border-l border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Order Summary</h3>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Tax (GST 5%)</span>
                  <span>₹{calculateTax().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                  <span>Discount</span>
                  <span>-₹{calculateDiscount().toLocaleString()}</span>
                </div>
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Grand Total</span>
                  <p className="text-3xl font-black text-gray-900">₹{calculateTotal().toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 pt-10">
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <SplitSquareVertical size={16} className="text-gray-400" />
                    <span className="text-[10px] font-black uppercase text-gray-400">Split Bill</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} className="text-gray-400 hover:text-gray-900"><Minus size={14} /></button>
                    <span className="text-xs font-black">{splitCount}</span>
                    <button onClick={() => setSplitCount(splitCount + 1)} className="text-gray-400 hover:text-gray-900"><Plus size={14} /></button>
                  </div>
                </div>
                {splitCount > 1 && (
                   <p className="text-[10px] font-bold text-[#6B7550] text-center uppercase tracking-widest bg-[#6B7550]/5 py-2 rounded-lg">₹{(calculateTotal() / splitCount).toFixed(0)} per person</p>
                )}
                <Button onClick={handleSettle} className="w-full py-5 bg-[#6B7550] hover:bg-black border-none text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#6B7550]/20 transition-all active:scale-95">
                  Settle & Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && lastOrder && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
          <div className="max-w-md mx-auto w-full p-8 space-y-8 print:p-0">
            <div className="flex justify-between items-center print:hidden">
              <button onClick={resetPOS} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-[10px] transition-colors">
                <X size={16} /> Close Terminal
              </button>
              <button onClick={() => window.print()} className="bg-[#6B7550] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-[#6B7550]/20 hover:scale-105 transition-all active:scale-95">
                <Printer size={16} /> Print Invoice
              </button>
            </div>

            <div className="text-center space-y-2">
              <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-24 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">GOLDEN FISHERIES</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fresh Seafood Restaurant & Fish Mall</p>
              <p className="text-[8px] text-gray-400">GSTIN: 27AAGFG1234F1Z1 • PH: +91 98765 43210</p>
            </div>

            <div className="border-t-2 border-b-2 border-gray-100 py-6 grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice No</p>
                <p className="text-xs font-black">{lastOrder.invoiceNo}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date/Time</p>
                <p className="text-xs font-black">{new Date(lastOrder.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Type</p>
                <p className="text-xs font-black uppercase">{lastOrder.orderType}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Table/Counter</p>
                <p className="text-xs font-black uppercase tracking-tighter">{lastOrder.tableLabel}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lastOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-gray-400">@ ₹{item.price.toLocaleString()}</p>
                    </td>
                    <td className="py-4 text-center text-xs font-black">{item.qty}</td>
                    <td className="py-4 text-right text-xs font-black">₹{(item.price * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-2 pt-6 border-t-2 border-gray-100">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Gross Amount</span>
                <span>₹{lastOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Tax (GST 5%)</span>
                <span>₹{lastOrder.gstAmount.toLocaleString()}</span>
              </div>
              {lastOrder.discount > 0 && (
                <div className="flex justify-between text-xs font-bold text-rose-500 uppercase tracking-widest">
                  <span>Total Discount</span>
                  <span>-₹{lastOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                <span className="text-lg font-black text-gray-900 uppercase tracking-[0.2em]">Net Payable</span>
                <p className="text-4xl font-black text-gray-900">₹{lastOrder.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 pt-12 border-t-2 border-dashed border-gray-200">
              <div className="bg-white p-4 border-4 border-gray-50 rounded-[32px] shadow-sm">
                 <QrCode size={120} className="text-gray-900" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Scan to Pay via UPI</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Your visit made our day!<br/>Please come again soon.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPOS;
