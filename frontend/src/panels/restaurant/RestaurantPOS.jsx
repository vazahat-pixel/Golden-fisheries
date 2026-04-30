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
  Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const categories = ['All Items', 'Starters', 'Main Course', 'Sea Food', 'Drinks', 'Desserts'];

const menuItems = [
  { id: 1, name: 'Fish Thali', price: 180, category: 'Main Course', image: '🐟' },
  { id: 2, name: 'Prawn Ghee Roast', price: 350, category: 'Sea Food', image: '🍤' },
  { id: 3, name: 'King Fish Fry', price: 420, category: 'Sea Food', image: '🐟' },
  { id: 4, name: 'Pomfret Masala', price: 550, category: 'Sea Food', image: '🐠' },
  { id: 5, name: 'Steam Rice', price: 60, category: 'Main Course', image: '🍚' },
  { id: 6, name: 'Chicken 65', price: 220, category: 'Starters', image: '🍗' },
  { id: 7, name: 'Lime Juice', price: 40, category: 'Drinks', image: '🥤' },
  { id: 8, name: 'Caramel Custard', price: 120, category: 'Desserts', image: '🍮' },
];

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
      <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/restaurant/dashboard')}
              className="p-2 bg-white rounded-xl border border-blue-100 text-gray-500 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 truncate">MKE Restaurant POS</h1>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              className="w-full bg-white border border-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary shadow-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2',
                activeCategory === cat 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white border-blue-50 text-gray-500 hover:border-blue-100'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-20 lg:pb-6">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white p-4 rounded-[20px] border border-blue-50 hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl md:text-4xl mb-4 group-hover:scale-110 transition-transform">
                {item.image}
              </div>
              <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-1 line-clamp-1">{item.name}</h3>
              <p className="text-primary font-black text-base md:text-lg">₹{item.price}</p>
              <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase mt-2">{item.category}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Overlay for Mobile */}
      {showCart && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setShowCart(false)}
        />
      )}

      {/* Cart Section */}
      <div className={clsx(
        "fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto w-full sm:w-[400px] bg-white border-l border-blue-100 flex flex-col shadow-2xl transition-transform duration-300 transform",
        showCart ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 md:p-6 border-b border-blue-50 flex justify-between items-center bg-blue-50/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-lg">
              <ShoppingCart size={20} />
            </div>
            <h2 className="font-black text-gray-900">Current Order</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCart([])}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => setShowCart(false)}
              className="p-2 text-gray-400 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <Utensils size={64} className="mb-4" />
              <p className="font-bold text-gray-500 text-sm">Cart is empty<br/>Select items to start</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-blue-50/50 border border-blue-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-primary font-black">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-blue-100">
                  <button 
                    onClick={() => updateQty(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-primary hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-black w-4 text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-primary hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 md:p-6 bg-blue-50/30 border-t border-blue-100 space-y-4 shrink-0">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-blue-100">
              <span>Total</span>
              <span className="text-primary">₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {['Cash', 'Online'].map(method => (
              <button 
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={clsx(
                  'flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all',
                  paymentMethod === method ? 'border-primary text-primary bg-primary/5' : 'border-blue-50 text-gray-400 bg-white'
                )}
              >
                {method === 'Cash' ? <Banknote size={16} /> : <CreditCard size={16} />}
                <span className="text-xs font-bold">{method}</span>
              </button>
            ))}
          </div>

          <Button 
            onClick={handleSettle}
            className="w-full py-5 md:py-6 rounded-2xl text-base md:text-lg font-black gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
            disabled={cart.length === 0}
          >
            <Printer size={20} /> Settle Order
          </Button>
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      {!showCart && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-2xl shadow-2xl z-40 flex items-center gap-3 animate-bounce-subtle"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cart.reduce((acc, i) => acc + i.qty, 0)}
            </span>
          </div>
          <span className="font-bold">View Cart</span>
        </button>
      )}
    </div>
  );
};

export default RestaurantPOS;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
