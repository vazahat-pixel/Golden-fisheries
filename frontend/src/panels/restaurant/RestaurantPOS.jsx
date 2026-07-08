import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, ShoppingCart, Trash2, X, Utensils, 
  Minus, Plus, Banknote, CreditCard, Printer, CheckCircle2, 
  Clock, User, Hash, Info, Percent, Tag, QrCode, SplitSquareVertical,
  ChevronRight, ChefHat, Receipt, AlertCircle, LayoutGrid, Globe, MessageSquare, Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { restaurantService } from '../../services/restaurantService';

const RestaurantPOS = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    menuItems, tables, coupons,
    createKOTAsync,
    settleOrderAsync,
    fetchOrders,
    fetchMenu,
    fetchTables,
    fetchKitchenTickets,
    loading,
    activeSession,
    fetchActiveSessionAsync,
  } = useRestaurantStore();

  React.useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchTables();
    fetchKitchenTickets();
    fetchActiveSessionAsync();
  }, [fetchOrders, fetchMenu, fetchTables, fetchKitchenTickets, fetchActiveSessionAsync]);

  const [orderType, setOrderType] = useState('Dine In');
  const [tableLabel, setTableLabel] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState({ type: 'flat', value: 0 });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isMixedPayment, setIsMixedPayment] = useState(false);
  const [mixedPayment, setMixedPayment] = useState({ cash: 0, upi: 0 });
  const [billingView, setBillingView] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const categories = ["All Items", ...new Set(menuItems.map(item => item.category))];
  const orderTypes = ['Dine In', 'Parcel', 'Takeaway', 'Online Order', 'Bulk Order'];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSeedSampleMenu = async () => {
    setSeeding(true);
    const samples = [
      { name: 'Tandoori Pomfret Spicy', category: 'Starters', price: 480, image: '🐟', description: 'Fresh local Pomfret fish marinated in signature tandoori spices.' },
      { name: 'Garlic Butter Prawns', category: 'Starters', price: 380, image: '🍤', description: 'Juicy jumbo prawns sauteed in rich garlic butter sauce.' },
      { name: 'Mangalorean Crab Curry', category: 'Main Course', price: 450, image: '🦀', description: 'Fresh crab cooked in spiced coconut gravy.' },
      { name: 'Mackerel Crispy Rava Fry', category: 'Starters', price: 220, image: '🐟', description: 'Crispy rava-coated pan-fried local mackerel.' },
      { name: 'Sardine Spicy Ghee Roast', category: 'Starters', price: 180, image: '🍲', description: 'Fiery roasted sardines with thick onion masala.' },
      { name: 'Steamed Basmati Rice', category: 'Rice & Breads', price: 90, image: '🍚', description: 'Fluffy steamed basmati rice.' },
      { name: 'Butter Tandoori Naan', category: 'Rice & Breads', price: 45, image: '🫓', description: 'Soft naan glazed with fresh butter.' },
      { name: 'Fresh Lime Mint Soda', category: 'Beverages', price: 70, image: '🥤', description: 'Chilled refreshing sweet and salty lime soda.' }
    ];
    
    const loadToast = toast.loading('Seeding sample coastal menu items...');
    try {
      for (const item of samples) {
        await restaurantService.createInventoryItem({
          name: item.name,
          category: item.category,
          sellingPrice: item.price,
          price: item.price,
          gstRate: 5,
          image: item.image,
          description: item.description,
          recipe: []
        });
      }
      toast.success('Coastal menu items seeded successfully!', { id: loadToast });
      fetchMenu();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to seed menu items', { id: loadToast });
    } finally {
      setSeeding(false);
    }
  };

  const addToCart = (item) => {
    const menuId = item.menuItemId || null;
    const invId = item.inventoryItemId || (item.isKitchenSku ? item.id : null);
    const cartKey = menuId || invId || item.name;
    const existing = cart.find(
      (i) => i.id === cartKey || (i.name === item.name && i.menuItemId === menuId)
    );
    if (existing) {
      setCart(cart.map((i) => (i.id === existing.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([
        ...cart,
        {
          ...item,
          id: cartKey,
          menuItemId: menuId,
          inventoryItemId: invId,
          isKitchenSku: item.isKitchenSku ?? (!menuId && !!invId),
          qty: 1,
          notes: '',
        },
      ]);
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
    return cart.reduce((acc, i) => acc + (i.price * i.qty * ((i.gstRate || 5) / 100)), 0);
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

  const fmtRupee = (n) => Number(n ?? 0).toLocaleString('en-IN');

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    if (orderType === 'Dine In' && !tableLabel) {
      toast.error('Please select a Table Number');
      return;
    }
    try {
      const kot = await createKOTAsync({
        tableId: tableLabel || 'COUNTER',
        tableLabel: tableLabel || 'COUNTER',
        orderType,
        items: cart,
        staffName: user?.fullName || user?.name || 'Staff',
        notes: '',
      });
      toast.success(
        kot?.ticketNumber
          ? `KOT ${kot.ticketNumber} sent to kitchen`
          : `KOT sent for ${tableLabel || 'COUNTER'}`
      );
    } catch {
      toast.error('Failed to send kitchen ticket');
    }
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
      toast.error('Please select a Table Number');
      return;
    }
    const total = calculateTotal();
    const orderData = {
      tableId: tableLabel || 'COUNTER',
      tableLabel: tableLabel || 'COUNTER',
      orderType,
      items: cart.map((item) => ({
        menuItemId: item.menuItemId || undefined,
        inventoryItemId: item.inventoryItemId || undefined,
        isKitchenSku: item.isKitchenSku,
        name: item.name,
        quantity: item.qty,
        rate: item.price,
        gstRate: item.gstRate ?? 5,
        notes: item.notes,
      })),
      discountAmount: calculateDiscount(),
      mixedPayment: isMixedPayment ? mixedPayment : undefined,
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
      const settled = res?.data?.order ?? res?.order;
      setLastOrder({
        ...orderData,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price ?? item.rate ?? 0,
          qty: item.qty ?? item.quantity ?? 1,
        })),
        invoiceNo: settled?.orderNumber || res?.orderNumber || `ORD-${Date.now()}`,
        total: settled?.totalAmount ?? orderData.total ?? 0,
        subtotal: settled?.subtotal ?? orderData.subtotal ?? 0,
        gstAmount: (settled?.cgst ?? 0) + (settled?.sgst ?? 0) || orderData.gstAmount ?? 0,
        discount: orderData.discount ?? orderData.discountAmount ?? 0,
        timestamp: new Date().toISOString(),
      });
      setShowInvoice(true);
      toast.success('Order Settled Successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to settle order', { duration: 6000 });
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

  const filteredMenuItems = menuItems.filter(item => 
    (activeCategory === 'All Items' || item.category === activeCategory) &&
    (item.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#F5F7F8] text-slate-800 overflow-hidden font-sans">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-[#F5F7F8]">
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0 z-20 gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => navigate('/restaurant/dashboard')} 
              className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl bg-white text-slate-600 hover:text-slate-900 hover:border-[#6A7051] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-black tracking-[0.05em] text-slate-800 uppercase flex items-center gap-2">
                GOLDEN <span className="text-[#6A7051]">TERMINAL POS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </h1>
              <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-[0.12em] mt-0.5">
                OPERATOR: {user?.name?.toUpperCase() || 'OFFICER'} · {activeSession ? 'SHIFT ACTIVE' : 'SHIFT LOCKED'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Order Type */}
            <div className="relative w-44">
              <span className="absolute -top-1.5 left-2 px-1 bg-white text-[7px] font-black text-slate-400 uppercase tracking-widest z-10">Order Protocol</span>
              <select 
                value={orderType} 
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-[#6A7051] outline-none focus:border-[#6A7051] focus:bg-white transition-all cursor-pointer shadow-sm"
              >
                {orderTypes.map(type => <option key={type} className="text-slate-800" value={type}>{type}</option>)}
              </select>
            </div>

            {/* Table Selection */}
            <div className={`relative w-44 transition-all ${orderType !== 'Dine In' ? 'opacity-30' : ''}`}>
              <span className="absolute -top-1.5 left-2 px-1 bg-white text-[7px] font-black text-slate-400 uppercase tracking-widest z-10">Table Node</span>
              <select 
                value={tableLabel} 
                onChange={(e) => setTableLabel(e.target.value)}
                disabled={orderType !== 'Dine In'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-[10px] font-black uppercase tracking-widest text-[#6A7051] outline-none focus:border-[#6A7051] focus:bg-white transition-all cursor-pointer shadow-sm"
              >
                <option className="text-slate-400" value="">SELECT TABLE</option>
                {tables.map(table => <option className="text-slate-800 font-bold" key={table.id} value={table.label}>{table.label}</option>)}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH DISHES..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-700 outline-none focus:border-[#6A7051] focus:bg-white transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Category Filter Bar */}
        {menuItems.length > 0 && (
          <div className="bg-white border-b border-slate-200/80 px-6 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-[#6A7051] text-white border-[#6A7051] shadow-md shadow-[#6A7051]/15 font-extrabold' 
                    : 'text-slate-500 border-slate-200 bg-white hover:border-[#6A7051]/50 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Main Grid View */}
        <div className="flex-1 overflow-y-auto p-6">
          {menuItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto space-y-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-20 h-20 bg-[#6A7051]/10 border border-[#6A7051]/20 rounded-full flex items-center justify-center text-[#6A7051] animate-pulse">
                <Utensils size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">POS Menu Catalog is Empty</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  The restaurant terminal currently has no menu items loaded in the database. You can add items manually in the admin control panel, or quickly populate a curated coastal seafood list below.
                </p>
              </div>
              <button
                onClick={handleSeedSampleMenu}
                disabled={seeding}
                className="px-6 py-3.5 bg-[#6A7051] text-white font-black uppercase tracking-widest text-[10px] rounded-lg shadow-xl shadow-[#6A7051]/15 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {seeding ? (
                  <>Seeding Catalog...</>
                ) : (
                  <>
                    <Database size={14} /> Auto-Seed Seafood Menu
                  </>
                )}
              </button>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-60">
              <ChefHat size={40} className="text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 uppercase tracking-wider">No matching items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => {
                const isOutOfStock = item.stock <= 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isOutOfStock) {
                        toast.error('Item is currently out of stock!');
                        return;
                      }
                      addToCart(item);
                    }}
                    className={`group bg-white border border-slate-200/80 p-4 rounded-xl hover:border-[#6A7051] hover:shadow-lg transition-all text-left flex flex-col gap-4 relative overflow-hidden cursor-pointer shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center text-2xl shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                        {item.image || "🍱"}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black text-[#6A7051] uppercase tracking-[0.2em]">{item.category}</p>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate mt-0.5 group-hover:text-[#6A7051] transition-colors">
                          {item.name || "UNNAMED_PRODUCT"}
                        </h3>
                        <p className="mt-1">
                          {isOutOfStock ? (
                            <span className="inline-block px-1.5 py-0.5 text-[7px] font-black tracking-wider uppercase text-rose-700 bg-rose-50 border border-rose-100 rounded-md">SOLD OUT</span>
                          ) : item.stock === 999 ? (
                            <span className="inline-block px-1.5 py-0.5 text-[7px] font-black tracking-wider uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md">Always Available</span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 text-[7px] font-black tracking-wider uppercase text-amber-700 bg-amber-50 border border-amber-100 rounded-md">{item.stock} portions left</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center w-full mt-2 pt-3 border-t border-slate-100">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rate</span>
                      <p className="text-lg font-serif italic font-black text-slate-800">₹{item.price}</p>
                    </div>

                    {/* Hover Gold Strip */}
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#6A7051] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Area */}
      <div className="w-[360px] bg-white flex flex-col border-l border-slate-200/80 shadow-2xl relative z-10 h-full shrink-0">
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/80 shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <ShoppingCart size={16} className="text-[#6A7051]" />
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Order Manifest</h2>
          </div>
          <Badge className="bg-slate-900 text-white px-2 py-0.5 text-[8px] font-black border-none">{cart.length} ITEMS</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
              <ChefHat size={44} className="mb-3 text-slate-400" />
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">System Idling</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all space-y-2 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-lg border border-slate-100">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-800 uppercase truncate tracking-tight">{item.name}</p>
                    <p className="text-[11px] font-black text-[#6A7051] italic font-serif mt-0.5">₹{item.price * item.qty}</p>
                  </div>
                  <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"><Minus size={10} /></button>
                    <span className="w-6 text-center text-[10px] font-black font-serif italic text-slate-800">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"><Plus size={10} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded-lg">
                   <MessageSquare size={10} className="text-slate-400" />
                   <input 
                    type="text" 
                    placeholder="COOKING INSTRUCTIONS..." 
                    className="flex-1 bg-transparent border-none p-0 text-[8px] font-black text-slate-500 uppercase tracking-widest focus:ring-0 outline-none placeholder:opacity-50"
                    value={item.notes}
                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200/80 space-y-4 shrink-0">
          <div className="space-y-2">
             <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Gross Payload</span>
                <span>₹{fmtRupee(calculateSubtotal())}</span>
             </div>
             <div className="flex justify-between text-base font-serif italic font-black text-slate-900 tracking-tight border-t border-slate-100 pt-3">
                <span>TOTAL COST</span>
                <span className="text-[#6A7051]">₹{fmtRupee(calculateTotal())}</span>
             </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (!activeSession) {
                  toast.error('Operations are locked! Shift is not open. Please open your shift first.');
                  navigate('/restaurant/dashboard');
                  return;
                }
                handleSendToKitchen();
              }} 
              disabled={cart.length === 0} 
              className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-700 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChefHat size={14} /> KOT
            </button>
            
            <button 
              onClick={() => {
                if (!activeSession) {
                  toast.error('Operations are locked! Shift is not open. Please open shift first in the dashboard.');
                  navigate('/restaurant/dashboard');
                  return;
                }
                setBillingView(true);
              }} 
              disabled={cart.length === 0} 
              className="flex-1 py-3 bg-[#6A7051] text-white hover:bg-[#5F6846] rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Receipt size={14} /> CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {/* Settlement Billing Modal */}
      {billingView && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl border border-slate-200/80 shadow-2xl flex h-[480px] rounded-2xl overflow-hidden relative">
            {/* Payment Details */}
            <div className="flex-1 p-6 flex flex-col overflow-y-auto bg-white">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-serif italic font-black text-slate-800 uppercase tracking-tight">Final Settlement.</h2>
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">Select Payment Protocol</p>
                </div>
                <button 
                  onClick={() => setBillingView(false)} 
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-2">
                  {['Cash', 'UPI', 'Card', 'Credit'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setPaymentMode(mode); setIsMixedPayment(false); }}
                      className={`p-3.5 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        paymentMode === mode && !isMixedPayment 
                          ? 'bg-[#6A7051] text-white border-[#6A7051] shadow-lg shadow-[#6A7051]/15 font-black' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'
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

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                   <div className="flex justify-between items-center mb-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Offers & Validation</p>
                      {appliedCoupon && <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[7px] font-black">VALIDATED</Badge>}
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center gap-2">
                         <Tag size={12} className="text-slate-400" />
                         <input 
                          type="text" 
                          placeholder="COUPON_CODE" 
                          className="flex-1 bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-widest text-slate-800 outline-none focus:ring-0"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                      </div>
                      <button onClick={handleApplyCoupon} className="px-4 py-2 bg-[#6A7051] text-white text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer">Verify</button>
                   </div>
                </div>
              </div>
            </div>

            {/* Tactical Summary Panel */}
            <div className="w-[280px] bg-slate-50 p-6 flex flex-col border-l border-slate-200/80">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 italic">Manifest Summary</h3>
              <div className="flex-1 space-y-3 text-xs">
                <div className="flex justify-between text-slate-500 uppercase tracking-widest text-[9px]">
                  <span>Subtotal</span>
                  <span className="text-slate-850 font-bold">₹{fmtRupee(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-500 uppercase tracking-widest text-[9px]">
                  <span>Tax (GST 5%)</span>
                  <span className="text-slate-850 font-bold">₹{fmtRupee(calculateTax())}</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between text-rose-600 font-black uppercase tracking-widest text-[9px]">
                    <span>Deduction</span>
                    <span className="font-bold">-₹{fmtRupee(calculateDiscount())}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-200 flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payable Net</span>
                  <p className="text-3xl font-serif italic font-black text-[#6A7051]">₹{fmtRupee(calculateTotal())}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 mt-4">
                <button 
                  onClick={handleSettle} 
                  disabled={loading} 
                  className="w-full py-3.5 bg-[#6A7051] text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-lg shadow-xl shadow-[#6A7051]/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  AUTHORIZE & SETTLE
                </button>
                <p className="text-[6px] text-center text-slate-400 font-black uppercase tracking-widest mt-3 opacity-50">GF_TERM_V4 // SECURE_TRANSACT</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Screen (Printable) */}
      {showInvoice && lastOrder && (
        <div className="fixed inset-0 z-[70] bg-slate-50 flex flex-col overflow-y-auto">
          <div className="max-w-md mx-auto w-full p-8 space-y-6">
            <div className="no-print flex justify-between items-center border-b border-slate-250 pb-4">
              <button 
                onClick={resetPOS} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-[9px] transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> NEW SESSION
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-[#6A7051] text-white px-5 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-xl hover:brightness-110 cursor-pointer"
              >
                <Printer size={14} /> PRINT RECEIPT
              </button>
            </div>

            <div className="print-root bg-white border border-slate-200 p-6 rounded-2xl space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-serif italic font-black text-slate-800 uppercase tracking-tight">
                  Golden <span className="text-[#6A7051]">Fisheries.</span>
                </h2>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Fresh Seafood & Fish Mall HQ</p>
                <div className="pt-2 flex flex-col gap-0.5 text-slate-500">
                  <p className="text-[7px] font-bold uppercase tracking-widest">GSTIN: 27AAGFG1234F1Z1</p>
                  <p className="text-[7px] font-bold uppercase tracking-widest">TEL: +91 98765 43210</p>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-4 grid grid-cols-2 gap-y-3 text-xs print:border-slate-350">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Receipt Ref.</p>
                  <p className="text-[10px] font-black uppercase tracking-tight italic font-serif text-slate-800">#{lastOrder.invoiceNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time Log</p>
                  <p className="text-[9px] font-bold text-slate-700 uppercase">{new Date(lastOrder.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Protocol</p>
                  <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">{lastOrder.orderType}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Station/Node</p>
                  <p className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">{lastOrder.tableLabel}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 print:border-slate-300">
                    <th className="py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                  {lastOrder.items.map((item) => {
                    const unit = item.price ?? item.rate ?? 0;
                    const qty = item.qty ?? item.quantity ?? 1;
                    return (
                    <tr key={item.id || item.name}>
                      <td className="py-2.5">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight italic font-serif">{item.name}</p>
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">UNIT: ₹{fmtRupee(unit)}</p>
                      </td>
                      <td className="py-2.5 text-center text-[10px] font-black font-serif italic text-slate-800">{qty}</td>
                      <td className="py-2.5 text-right text-[10px] font-black italic font-serif text-[#6A7051]">₹{fmtRupee(unit * qty)}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="space-y-1.5 pt-4 border-t border-slate-200 print:border-slate-300 text-xs">
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold">₹{fmtRupee(lastOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Tax (GST 5%)</span>
                  <span className="text-slate-800 font-bold">₹{fmtRupee(lastOrder.gstAmount)}</span>
                </div>
                {(lastOrder.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-[8px] font-black text-rose-600 uppercase tracking-widest">
                    <span>Deductions</span>
                    <span className="font-bold">-₹{fmtRupee(lastOrder.discount)}</span>
                  </div>
                )}
                <div className="pt-4 flex flex-col gap-1 border-t border-slate-200 print:border-slate-300">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Settle</span>
                  <p className="text-3xl font-serif italic font-black text-[#6A7051]">₹{fmtRupee(lastOrder.total)}</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 pt-6 border-t border-dashed border-slate-200 print:border-slate-300 opacity-65">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                   <QrCode size={80} className="text-slate-800" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.2em]">Transaction Verified</p>
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Thank you for your visit.<br/>Command Authorized.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPOS;
