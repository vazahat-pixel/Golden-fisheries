import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, ShoppingCart, Trash2, X, Utensils, 
  Minus, Plus, Banknote, CreditCard, Printer, CheckCircle2, 
  Clock, User, Hash, Info, Percent, Tag, QrCode, SplitSquareVertical,
  ChevronRight, ChefHat, Receipt, AlertCircle, LayoutGrid, Globe, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';

const RestaurantPOS = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    menuItems, tables, kots, coupons,
    createKOT, settleOrderAsync, fetchOrders, fetchMenu, fetchTables, updateTableStatus, loading 
  } = useRestaurantStore();

  React.useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchTables();
  }, [fetchOrders, fetchMenu, fetchTables]);

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

  const handleSettle = async () => {
    if (orderType === 'Dine In' && !tableLabel) {
      toast.error('Please select or enter a Table Number');
      return;
    }
    const total = calculateTotal();
    const orderData = {
      tableId: tableLabel || 'COUNTER',
      tableLabel: tableLabel || 'COUNTER',
      orderType,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.qty,
        rate: item.price,
        gstRate: item.gstRate,
        notes: item.notes
      })),
      subtotal: calculateSubtotal(),
      gstAmount: calculateTax(),
      discount: calculateDiscount(),
      coupon: appliedCoupon ? appliedCoupon.code : null,
      total,
      paymentMethod: paymentMode.toUpperCase(),
      paymentBreakdown: isMixedPayment ? mixedPayment : { [paymentMode.toLowerCase()]: total },
      staffName: user?.name || 'Staff'
    };

    try {
      const res = await settleOrderAsync(orderData);
      setLastOrder({ 
        ...orderData, 
        invoiceNo: res?.data?.orderNumber || res?.orderNumber || res?.invoiceNo || `ORD-${Date.now()}`, 
        timestamp: new Date().toISOString() 
      });
      setShowInvoice(true);
      toast.success('Order Settled Successfully!');
    } catch (err) {
      toast.error('Failed to settle order');
    }
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
    <div className="flex h-screen w-full bg-[#F9FAFB] text-slate-900 overflow-hidden font-sans">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-slate-50/30">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => navigate('/restaurant/dashboard')} className="w-8 h-8 flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
              <ArrowLeft size={16} />
            </button>
            <div className="hidden xl:block">
              <h1 className="text-lg font-serif italic font-black text-black tracking-tight uppercase leading-none">
                Terminal <span className="text-accent-olive">POS.</span>
              </h1>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">OPERATOR: {user?.name?.split(' ')[0] || 'GUEST'}</p>
            </div>
          </div>
          
          <div className="flex-1 flex items-center gap-2 max-w-xl">
            {/* Order Type */}
            <div className="flex-1 relative">
              <span className="absolute -top-1.5 left-2 px-1 bg-white text-[7px] font-black text-slate-400 uppercase tracking-widest z-10">Order Protocol</span>
              <select 
                value={orderType} 
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-2 px-3 text-[9px] font-black uppercase tracking-widest outline-none focus:bg-white focus:ring-1 focus:ring-accent-olive transition-all appearance-none cursor-pointer"
              >
                {orderTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            {/* Table Selection */}
            <div className={`flex-1 relative transition-all ${orderType !== 'Dine In' ? 'opacity-30' : ''}`}>
              <span className="absolute -top-1.5 left-2 px-1 bg-white text-[7px] font-black text-slate-400 uppercase tracking-widest z-10">Table Node</span>
              <select 
                value={tableLabel} 
                onChange={(e) => setTableLabel(e.target.value)}
                disabled={orderType !== 'Dine In'}
                className="w-full bg-slate-50 border border-slate-200 py-2 px-3 text-[9px] font-black uppercase tracking-widest outline-none focus:bg-white focus:ring-1 focus:ring-accent-olive transition-all appearance-none cursor-pointer"
              >
                <option value="">SELECT TABLE</option>
                {tables.map(table => <option key={table.id} value={table.label}>{table.label}</option>)}
              </select>
            </div>

            <div className="relative w-40 hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input 
                type="text" 
                placeholder="SCAN OR SEARCH..." 
                className="w-full bg-slate-50 border border-slate-200 py-2 pl-9 pr-3 text-[9px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:ring-1 focus:ring-accent-olive transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="bg-white border-b border-slate-200 px-6 py-1.5 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all border ${
                activeCategory === cat ? 'bg-black text-white border-black' : 'text-slate-400 border-transparent hover:border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {menuItems.filter(item => 
            (activeCategory === 'All Items' || item.category === activeCategory) &&
            (item.name || "").toLowerCase().includes(search.toLowerCase())
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="group bg-white border border-slate-200 p-4 hover:border-accent-olive hover:shadow-md transition-all text-left flex items-center gap-6 relative"
            >
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center text-3xl shrink-0 border border-slate-100">
                {item.image || "🍱"}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-accent-olive uppercase tracking-[0.2em] mb-1">{item.category}</p>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {item.name || "UNNAMED_PRODUCT"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">STOCK_LEVEL: {item.stock} UNITS</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">UNIT RATE</p>
                <p className="text-xl font-serif italic font-black text-slate-900">₹{item.price}</p>
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-1 bg-accent-olive opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-[340px] bg-white flex flex-col border-l border-slate-200 shadow-2xl relative z-10 h-full">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <ShoppingCart size={16} className="text-accent-olive" />
            <h2 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Order Manifest</h2>
          </div>
          <Badge className="bg-black text-white px-2 py-0.5 text-[8px] font-black border-none">{cart.length} SKU</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 grayscale opacity-30">
              <ChefHat size={48} className="mb-4 text-slate-300" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">System Idling</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="p-3 bg-white border border-slate-200 group hover:border-slate-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 flex items-center justify-center text-lg border border-slate-100">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-slate-900 uppercase truncate tracking-tight">{item.name}</p>
                    <p className="text-[11px] font-black text-accent-olive italic font-serif mt-0.5">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center border border-slate-200 bg-slate-50">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-slate-100 transition-colors"><Minus size={10} /></button>
                    <span className="w-6 text-center text-[10px] font-black font-serif italic">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-slate-100 transition-colors"><Plus size={10} /></button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                   <MessageSquare size={10} className="text-slate-300" />
                   <input 
                    type="text" 
                    placeholder="INSTRUCTIONS..." 
                    className="flex-1 bg-transparent border-none p-0 text-[8px] font-bold text-slate-400 uppercase tracking-widest focus:ring-0 placeholder:opacity-50"
                    value={item.notes}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col gap-1.5 mb-2">
             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Gross Payload</span>
                <span>₹{calculateSubtotal().toLocaleString()}</span>
             </div>
             <div className="flex justify-between text-lg font-serif italic font-black text-slate-900 tracking-tight border-t border-slate-200 pt-2">
                <span>TOTAL COST</span>
                <span className="text-accent-olive">₹{calculateTotal().toLocaleString()}</span>
             </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSendToKitchen} disabled={cart.length === 0} className="flex-1 h-11 bg-white border border-slate-200 hover:bg-slate-50 text-[9px] font-black uppercase tracking-widest shadow-sm">
              <ChefHat size={14} className="mr-2" /> KOT
            </Button>
            <Button onClick={() => setBillingView(true)} disabled={cart.length === 0} className="flex-1 h-11 bg-black text-white border-none text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              <Receipt size={14} className="mr-2" /> CHECKOUT
            </Button>
          </div>
        </div>
      </div>

      {/* Tactical Billing Modal */}
      {billingView && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl border border-slate-200 shadow-2xl flex h-[550px] overflow-hidden relative">
            {/* Payment Details */}
            <div className="flex-1 p-8 flex flex-col overflow-y-auto bg-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-serif italic font-black text-slate-900 uppercase tracking-tight">Final Settlement.</h2>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Select Payment Protocol</p>
                </div>
                <button onClick={() => setBillingView(false)} className="w-10 h-10 border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-90"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-2">
                  {['Cash', 'UPI', 'Card', 'Credit'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setPaymentMode(mode); setIsMixedPayment(false); }}
                      className={`p-4 border transition-all flex flex-col items-center gap-2 ${
                        paymentMode === mode && !isMixedPayment ? 'bg-black text-white border-black shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {mode === 'Cash' && <Banknote size={16} />}
                      {mode === 'UPI' && <QrCode size={16} />}
                      {mode === 'Card' && <CreditCard size={16} />}
                      {mode === 'Credit' && <AlertCircle size={16} />}
                      <span className="text-[8px] font-black uppercase tracking-widest">{mode}</span>
                    </button>
                  ))}
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 space-y-4">
                   <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Offers & Validation</p>
                      {appliedCoupon && <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[7px] font-black">VALIDATED</Badge>}
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1 bg-white border border-slate-200 px-3 py-2.5 flex items-center gap-2">
                         <Tag size={12} className="text-slate-300" />
                         <input 
                          type="text" 
                          placeholder="COUPON_CODE" 
                          className="flex-1 bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-0"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                      </div>
                      <button onClick={handleApplyCoupon} className="px-5 bg-black text-white text-[9px] font-black uppercase tracking-widest active:scale-95">Verify</button>
                   </div>
                </div>
              </div>
            </div>

            {/* Tactical Summary Panel */}
            <div className="w-[300px] bg-slate-50 p-8 flex flex-col border-l border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 italic">Manifest Summary</h3>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Tax (GST 5%)</span>
                  <span>₹{calculateTax().toLocaleString()}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between text-[10px] font-black text-red-600 uppercase tracking-widest">
                    <span>Deduction</span>
                    <span>-₹{calculateDiscount().toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-slate-200 flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payable Net</span>
                  <p className="text-4xl font-serif italic font-black text-slate-900">₹{calculateTotal().toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-10">
                <Button onClick={handleSettle} disabled={loading} className="w-full py-5 bg-black text-white border-none text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-black/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  AUTHORIZE & SETTLE
                </Button>
                <p className="text-[7px] text-center text-slate-400 font-black uppercase tracking-widest mt-4 opacity-50">GF_TERM_V4 // SECURE_TRANSACT</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tactical Invoice View */}
      {showInvoice && lastOrder && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
          <div className="max-w-md mx-auto w-full p-8 space-y-8 print:p-0">
            <div className="flex justify-between items-center print:hidden border-b border-slate-200 pb-6">
              <button onClick={resetPOS} className="flex items-center gap-2 text-slate-400 hover:text-black font-black uppercase tracking-widest text-[9px] transition-colors">
                <ArrowLeft size={14} /> NEW SESSION
              </button>
              <button onClick={() => window.print()} className="bg-black text-white px-6 py-2.5 font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-xl active:scale-95 transition-all">
                <Printer size={14} /> PRINT RECEIPT
              </button>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif italic font-black text-slate-900 uppercase tracking-tight">Golden <span className="text-accent-olive">Fisheries.</span></h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Fresh Seafood & Fish Mall HQ</p>
              <div className="pt-2 flex flex-col gap-0.5">
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">GSTIN: 27AAGFG1234F1Z1</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">TEL: +91 98765 43210</p>
              </div>
            </div>

            <div className="border-t border-b border-slate-200 py-5 grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Receipt Ref.</p>
                <p className="text-[10px] font-black uppercase tracking-tight italic font-serif">#{lastOrder.invoiceNo}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Time Log</p>
                <p className="text-[10px] font-black uppercase">{new Date(lastOrder.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Protocol</p>
                <p className="text-[10px] font-black uppercase tracking-widest">{lastOrder.orderType}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Station/Node</p>
                <p className="text-[10px] font-black uppercase tracking-tighter">{lastOrder.tableLabel}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Sum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lastOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic font-serif">{item.name}</p>
                      <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">UNIT: ₹{item.price.toLocaleString()}</p>
                    </td>
                    <td className="py-3 text-center text-[10px] font-black font-serif italic">{item.qty}</td>
                    <td className="py-3 text-right text-[10px] font-black italic font-serif text-accent-olive">₹{(item.price * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-2 pt-5 border-t border-slate-200">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{lastOrder.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Tax (GST 5%)</span>
                <span>₹{lastOrder.gstAmount.toLocaleString()}</span>
              </div>
              {lastOrder.discount > 0 && (
                <div className="flex justify-between text-[9px] font-black text-red-500 uppercase tracking-widest">
                  <span>Deductions</span>
                  <span>-₹{lastOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-5 flex flex-col gap-1 border-t border-slate-200">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total Settle</span>
                <p className="text-4xl font-serif italic font-black text-slate-900">₹{lastOrder.total.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 pt-10 border-t border-dashed border-slate-200 opacity-50">
              <div className="p-3 border border-slate-200 grayscale scale-75">
                 <QrCode size={100} className="text-black" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">Validated Transaction</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Thank you for your visit.<br/>Command Authorized.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPOS;
