import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Search, 
  ShoppingCart, 
  Trash2, 
  X, 
  Utensils, 
  Minus, 
  Plus, 
  Banknote, 
  CreditCard, 
  Printer 
} from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { useRestaurantStore } from '../../store/restaurantStore';

const categories = ["All Items", "Starters", "Main Course", "Sea Food", "Drinks", "Desserts"];

const RestaurantPOS = () => {
  const navigate = useNavigate();
  const { menuItems, addOrder, updateStock } = useRestaurantStore();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showCart, setShowCart] = useState(false);

  const addToCart = (item) => {
    if (item.stock <= 0) {
      toast.error('Item out of stock!');
      return;
    }
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.qty >= item.stock) {
        toast.error('Maximum available stock reached');
        return;
      }
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    toast.success(`${item.name} added`, { duration: 800 });
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const item = menuItems.find(mi => mi.id === id);
        const newQty = Math.max(0, i.qty + delta);
        if (newQty > item.stock) {
          toast.error('Limit exceeded');
          return i;
        }
        return { ...i, qty: newQty };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const calculateSubtotal = () => cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const tax = calculateSubtotal() * 0.05;
  const total = calculateSubtotal() + tax;

  const filteredItems = menuItems.filter(item => 
    (activeCategory === 'All Items' || item.category === activeCategory) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSettle = () => {
    if (cart.length === 0) return;
    
    const orderData = {
      items: cart,
      subtotal: calculateSubtotal(),
      tax,
      total,
      paymentMethod,
    };

    addOrder(orderData);
    
    // Update stock levels
    cart.forEach(item => {
      updateStock(item.id, -item.qty);
    });

    toast.success(`Order settled via ${paymentMethod}!`);
    setTimeout(() => {
      setCart([]);
      setShowCart(false);
      toast('Invoice printed.', { icon: '🖨️' });
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300">
      {/* Primary Terminal Interface */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Simple Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/restaurant/dashboard')}
              className="w-8 h-8 bg-gray-50 hover:bg-gray-100 text-gray-900 transition-all flex items-center justify-center border border-gray-200"
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Terminal POS</h1>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Station: MKE-TERMINAL-01 • Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative w-64 hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input 
                type="text" 
                placeholder="Search menu..." 
                className="w-full bg-gray-50 border border-gray-200 py-2 pl-10 pr-4 text-[9px] font-bold uppercase tracking-widest text-gray-900 focus:bg-white focus:border-[#6B7550] outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase text-gray-900 leading-none">Admin Control</p>
              </div>
              <div className="w-8 h-8 bg-gray-50 flex items-center justify-center border border-gray-200 text-gray-400">
                <Utensils size={14} />
              </div>
            </div>
          </div>
        </header>

        {/* Category Matrix */}
        <div className="bg-white border-b border-gray-100 px-6 py-2 flex gap-1 overflow-x-auto scrollbar-hide shrink-0 z-10">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 text-[8px] font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-black text-white' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Matrix */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={item.stock <= 0}
                className={`group relative border border-gray-200 p-4 transition-all hover:border-[#6B7550] text-left bg-white ${item.stock <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center text-4xl mb-4 group-hover:scale-105 transition-transform">
                  {item.image}
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 text-[10px] uppercase tracking-tight leading-tight line-clamp-1">
                    {item.name}
                  </h3>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[7px] font-bold uppercase text-[#6B7550]">Rate</p>
                      <p className="text-sm font-black text-gray-900">₹{item.price}</p>
                    </div>
                    <p className={`text-[8px] font-bold uppercase ${item.stock < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                      {item.stock} Units
                    </p>
                  </div>
                </div>

                <div className="absolute top-2 right-2 w-6 h-6 bg-[#6B7550]/10 text-[#6B7550] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-[#6B7550]/20">
                   <Plus size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Manifest Control (Right Sidebar) */}
      <div className={`fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto w-full sm:w-[380px] bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 transform ${
        showCart ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart size={14} className="text-[#6B7550]" />
            <h2 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Order Manifest</h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => cart.length > 0 && window.confirm('Discard order?') && setCart([])}
              className="p-2 text-gray-300 hover:text-red-500 transition-all"
            >
              <Trash2 size={16} />
            </button>
            <button onClick={() => setShowCart(false)} className="p-2 text-gray-900 lg:hidden"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
              <Utensils size={48} className="mb-4 text-gray-200" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Cart Empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-100 hover:border-[#6B7550]/30 transition-all group">
                <div className="w-10 h-10 bg-white flex items-center justify-center text-xl shrink-0 border border-gray-100">
                  {item.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-gray-900 uppercase truncate">{item.name}</p>
                  <p className="text-xs font-black text-[#6B7550]">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
                <div className="flex items-center border border-gray-200 bg-white">
                  <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><Minus size={10} /></button>
                  <span className="text-[10px] font-black text-gray-900 w-6 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"><Plus size={10} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-200 space-y-6 shrink-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Tax (5%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Total</span>
              <p className="text-2xl font-black text-gray-900">₹{total.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {['Cash', 'Online'].map(method => (
              <button 
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${
                  paymentMethod === method 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-400 border-gray-200 hover:border-black'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <Button 
            onClick={handleSettle}
            className="w-full py-4 text-[10px] font-bold uppercase tracking-widest bg-[#6B7550] text-white hover:bg-black border-none shadow-sm transition-all"
            disabled={cart.length === 0}
          >
            Settle Transaction
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPOS;
