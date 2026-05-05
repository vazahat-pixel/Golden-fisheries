import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Card } from '../../design-system/components/Card';
import { clsx } from 'clsx';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  Scale, 
  Search, 
  Trash2, 
  Printer, 
  Plus, 
  Minus,
  Calculator,
  ChevronRight,
  X
} from 'lucide-react';

const FishMallBilling = () => {
  const [cart, setCart] = useState([]);
  const [currentWeight, setCurrentWeight] = useState('0.00');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  
  const fishRates = [
    { id: 1, name: 'Rohu (Large)', rate: 140, image: '🐟' },
    { id: 2, name: 'Catla', rate: 130, image: '🐟' },
    { id: 3, name: 'Sea Bass', rate: 450, image: '🐠' },
    { id: 4, name: 'Tiger Prawns', rate: 650, image: '🍤' },
    { id: 5, name: 'Pomfret', rate: 550, image: '🐟' },
    { id: 6, name: 'Crab', rate: 400, image: '🦀' },
  ];

  const filteredProducts = fishRates.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (fish) => {
    const weight = parseFloat(currentWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }
    
    setCart([...cart, { 
      ...fish, 
      weight, 
      total: weight * fish.rate,
      id: Date.now() 
    }]);
    setCurrentWeight('0.00');
    toast.success(`${fish.name} added to cart`);
  };

  const calculateTotal = () => cart.reduce((acc, i) => acc + i.total, 0);

  const handlePrint = () => {
    if (cart.length === 0) return;
    toast.success('Generating Invoice...');
    setTimeout(() => {
      setShowCart(false);
      window.print();
    }, 500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-4 max-w-[1400px] mx-auto pb-20 lg:pb-10">
      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end px-4 md:px-0">
          <div className="flex-1 w-full max-w-md">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Quick Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search fish variety..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-olive-100 rounded-none outline-none focus:ring-2 focus:ring-primary shadow-sm font-medium text-sm md:text-base"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="outline" className="flex-1 sm:flex-none py-3 rounded-none border-olive-200" onClick={() => setCart([])}>Clear</Button>
             <Button variant="secondary" className="flex-1 sm:flex-none sm:hidden py-3 rounded-none" onClick={() => setShowCart(true)}>Cart ({cart.length})</Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-900 via-olive-900 to-indigo-950 text-white p-4 md:p-12 overflow-hidden relative shadow-2xl border-none mx-4 md:mx-0 rounded-[32px]">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-300">Live Scale Connected</p>
            </div>
            <div className="flex items-baseline gap-4">
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">{currentWeight || '0.00'}</h2>
              <span className="text-xl md:text-xl font-black text-olive-400/80 uppercase">KG</span>
            </div>
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 items-stretch">
              <div className="relative flex-1 group">
                <input 
                  type="number" 
                  step="0.01"
                  value={currentWeight === '0.00' ? '' : currentWeight}
                  className="bg-white/10 border-2 border-white/10 rounded-none px-6 py-2.5 text-white w-full outline-none focus:ring-4 focus:ring-primary/30 focus:border-white/30 text-xl font-black transition-all placeholder:text-white/20"
                  placeholder="Enter Weight Manually..."
                  onChange={(e) => setCurrentWeight(e.target.value)}
                />
                <Scale className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-white/30 transition-colors" size={24} />
              </div>
              <Button onClick={() => setCurrentWeight('0.00')} className="bg-white text-gray-900 hover:bg-olive-50 shadow-2xl shadow-white/10 border-none font-black py-2.5 px-10 rounded-none transition-all active:scale-95 text-sm uppercase tracking-widest">
                Reset Scale
              </Button>
            </div>
          </div>
          <Scale className="absolute -right-10 -bottom-10 text-white/5 rotate-12" size={320} />
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 px-4 md:px-0">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((fish) => (
              <button
                key={fish.id}
                onClick={() => addToCart(fish)}
                className="bg-white p-5 md:p-4 rounded-[28px] border-2 border-transparent hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all group text-center active:scale-95 shadow-sm relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-olive-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-none bg-olive-50 flex items-center justify-center text-xl md:text-xl mb-4 mx-auto group-hover:scale-110 group-hover:bg-olive-50 transition-all duration-500 shadow-inner">
                    {fish.image}
                  </div>
                  <h3 className="font-black text-gray-900 text-xs md:text-sm mb-1 line-clamp-1 uppercase tracking-tight">{fish.name}</h3>
                  <p className="text-primary font-black text-base md:text-xl tracking-tighter">₹{fish.rate}/<span className="text-[10px] text-gray-400">KG</span></p>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-olive-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-olive-200" />
              </div>
              <p className="font-black text-gray-400 uppercase tracking-widest text-sm">No variety found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Overlay for Mobile */}
      {showCart && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setShowCart(false)}
        />
      )}

      <div className={clsx(
        "fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto w-full sm:w-[450px] bg-white lg:bg-transparent flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 transform",
        showCart ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <Card padding="none" className="flex flex-col h-full lg:h-[650px] lg:shadow-2xl lg:sticky lg:top-4 border-none lg:border">
          <div className="p-4 md:p-4 border-b border-olive-100 bg-olive-50/30 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calculator size={18} className="text-primary" /> Billing Cart
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{cart.length} Items</Badge>
              <button onClick={() => setShowCart(false)} className="p-1 lg:hidden text-gray-400">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-5 bg-white">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-40">
                <div className="w-24 h-24 bg-olive-50 rounded-[32px] flex items-center justify-center mb-3 shadow-inner">
                  <Scale size={48} />
                </div>
                <p className="font-black text-center text-xs uppercase tracking-[0.2em] leading-relaxed">Select variety & weight<br/>to generate invoice</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 md:p-5 rounded-none bg-olive-50 border border-olive-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm md:text-base font-black text-gray-900 truncate leading-tight">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-widest">{item.weight} KG</p>
                      <span className="text-gray-300 font-bold">•</span>
                      <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">₹{item.rate}/KG</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-base md:text-lg tracking-tighter">₹{item.total.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setCart(cart.filter(i => i.id !== item.id));
                        toast.error(`${item.name} removed`);
                      }} 
                      className="w-10 h-10 flex items-center justify-center bg-white border border-olive-100 rounded-none text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 md:p-4 bg-olive-50/30 border-t border-olive-100 space-y-4 shrink-0">
            <div className="flex justify-between items-center bg-white p-4 rounded-[28px] border border-olive-100 shadow-sm">
              <div>
                <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] block mb-1">Final Amount</span>
                <span className="text-xl md:text-xl font-black text-gray-900 tracking-tighter">₹{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center text-primary">
                <Calculator size={32} />
              </div>
            </div>
            <Button 
              onClick={handlePrint}
              disabled={cart.length === 0}
              className="w-full py-5 md:py-6 rounded-none text-lg font-black gap-3 shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all bg-primary hover:bg-primary-dark border-none group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Printer size={24} className="group-hover:scale-110 transition-transform" />
              <span className="relative z-10 uppercase tracking-widest">Print & Finalize</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Floating Cart Button for Mobile */}
      {!showCart && cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-primary text-white p-4 rounded-none shadow-2xl z-40 flex items-center gap-3"
        >
          <div className="relative">
            <Calculator size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cart.length}
            </span>
          </div>
          <span className="font-bold">Checkout</span>
        </button>
      )}
    </div>
  );
};

export default FishMallBilling;

