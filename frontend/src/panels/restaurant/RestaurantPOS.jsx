import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  Search, 
  ShoppingCart, 
  Utensils, 
  ArrowLeft, 
  X, 
  Plus, 
  Minus,
  CreditCard,
  Banknote,
  Trash2,
  Printer,
  History,
  Trash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import mockData from '../../data/mockData.json';

const { categories, menuItems } = mockData.restaurant;

const RestaurantPOS = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [showCart, setShowCart] = useState(false);

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    toast.success(`${item.name} added`);
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.qty + delta);
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
    toast.success(`Order settled via ${paymentMethod}!`);
    setTimeout(() => {
      setCart([]);
      setShowCart(false);
      toast('Invoice printed.', { icon: '🖨️' });
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-page-bg overflow-hidden relative">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col min-w-0 p-4 md:p-4 overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/restaurant/dashboard')}
              className="p-3 bg-white border border-card-border rounded-none text-black hover:bg-black hover:text-white transition-all shadow-subtle active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-serif italic font-black text-black tracking-tight">Restaurant <span className="text-accent-olive">POS.</span></h1>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-3">POINT OF SALE • LIVE ORDERING • BILLING TERMINAL</p>
            </div>
          </div>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH MENU ITEMS..." 
              className="w-full bg-white border border-card-border rounded-none py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide shrink-0 px-2">
          {['All Items', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-6 py-3 rounded-none text-[10px] uppercase tracking-[0.2em] font-black whitespace-nowrap transition-all border shadow-subtle active:scale-95',
                activeCategory === cat 
                  ? 'bg-black border-black text-white shadow-lg' 
                  : 'bg-white border-card-border text-text-muted hover:border-black hover:text-black'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-24 lg:pb-8">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white p-4 rounded-none border border-card-border hover:shadow-wapixo hover:-translate-y-1 transition-all flex flex-col items-center text-center group shadow-subtle relative overflow-hidden"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-olive-100/50 border border-card-border flex items-center justify-center text-xl md:text-xl mb-3 group-hover:scale-110 transition-transform shadow-inner">
                {item.image}
              </div>
              <h3 className="font-black text-black text-[11px] md:text-[12px] uppercase tracking-widest mb-3 line-clamp-1">{item.name}</h3>
              <p className="text-xl font-serif italic font-black text-black tracking-tight">₹{item.price}</p>
              <div className="mt-6 w-full pt-4 border-t border-olive-50">
                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">{item.category}</p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={14} className="text-accent-olive" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Overlay for Mobile */}
      {showCart && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-md"
          onClick={() => setShowCart(false)}
        />
      )}

      {/* Cart Section */}
      <div className={clsx(
        "fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto w-full sm:w-[450px] bg-white border-l border-card-border flex flex-col shadow-2xl transition-transform duration-500 ease-in-out transform",
        showCart ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-card-border flex justify-between items-center bg-olive-100/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border border-black shadow-lg">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h2 className="font-serif italic font-black text-xl text-black uppercase tracking-tight">Current Cart.</h2>
              <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1">ORDER ID: GF-{Date.now().toString().slice(-4)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setCart([]);
                toast.error('Cart cleared');
              }}
              className="p-3 text-black hover:bg-black hover:text-white transition-all border border-card-border shadow-subtle bg-white"
              title="Clear Cart"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={() => setShowCart(false)}
              className="p-3 text-black lg:hidden hover:bg-black hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
              <div className="w-24 h-24 bg-olive-100/50 border border-dashed border-card-border flex items-center justify-center">
                <Utensils size={48} className="text-accent-olive" />
              </div>
              <div>
                <p className="text-[11px] font-black text-black uppercase tracking-[0.3em]">CART IS EMPTY</p>
                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-2">SELECT ITEMS TO BEGIN ORDER</p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-4 bg-white border border-card-border shadow-subtle group hover:bg-olive-50 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">{item.name}</p>
                  <p className="text-lg font-serif italic font-black text-accent-olive">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 bg-white border border-card-border p-2 shadow-inner">
                  <button 
                    onClick={() => updateQty(item.id, -1)}
                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-xs font-black w-6 text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    className="w-10 h-10 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-10 bg-white border-t border-card-border space-y-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
              <span>SUBTOTAL</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
              <span>TAX (GST 5%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-olive-100">
              <span className="text-[12px] font-black text-black uppercase tracking-[0.4em]">TOTAL PAYABLE</span>
              <span className="text-xl font-serif italic font-black text-black">₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {['Cash', 'Online'].map(method => (
              <button 
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={clsx(
                  'flex items-center justify-center gap-4 py-5 border transition-all shadow-subtle group active:scale-95',
                  paymentMethod === method ? 'border-black bg-black text-white shadow-xl' : 'border-card-border text-text-muted bg-white hover:border-black hover:text-black'
                )}
              >
                {method === 'Cash' ? <Banknote size={18} /> : <CreditCard size={18} />}
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{method}</span>
              </button>
            ))}
          </div>

          <Button 
            onClick={handleSettle}
            className="w-full py-8 text-[11px] font-black uppercase tracking-[0.4em] gap-4 shadow-2xl active:scale-95 transition-all border border-black"
            disabled={cart.length === 0}
          >
            <Printer size={20} /> SETTLE ORDER
          </Button>
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      {!showCart && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-8 right-8 bg-black text-white p-5 shadow-2xl z-40 flex items-center gap-4 transition-transform active:scale-90 animate-bounce-subtle border border-black"
        >
          <div className="relative">
            <ShoppingCart size={28} />
            <span className="absolute -top-3 -right-3 bg-accent-olive text-white text-[11px] font-black w-7 h-7 flex items-center justify-center border-2 border-white shadow-md">
              {cart.reduce((acc, i) => acc + i.qty, 0)}
            </span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">VIEW CART</span>
        </button>
      )}
    </div>
  );
};

export default RestaurantPOS;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
