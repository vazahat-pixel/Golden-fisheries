import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAdminStore } from './adminStore';

// ─── Menu Data ────────────────────────────────────────────────────────────────
const INITIAL_MENU = [
  // Fish Curry
  { id: 1,  name: 'Fish Curry',        price: 160, category: 'Fish Curry',     image: '🍛', stock: 50, gstRate: 5 },
  { id: 2,  name: 'Pomfret Curry',     price: 220, category: 'Fish Curry',     image: '🐠', stock: 30, gstRate: 5 },
  { id: 3,  name: 'Surmai Curry',      price: 280, category: 'Fish Curry',     image: '🐟', stock: 25, gstRate: 5 },
  // Fry Items
  { id: 4,  name: 'King Fish Fry',     price: 420, category: 'Fry Items',      image: '🍳', stock: 15, gstRate: 5 },
  { id: 5,  name: 'Pomfret Fry',       price: 380, category: 'Fry Items',      image: '🐡', stock: 20, gstRate: 5 },
  { id: 6,  name: 'Bangda Fry',        price: 180, category: 'Fry Items',      image: '🐟', stock: 40, gstRate: 5 },
  // Seafood Meals
  { id: 7,  name: 'Fish Thali',        price: 200, category: 'Seafood Meals',  image: '🍱', stock: 50, gstRate: 5 },
  { id: 8,  name: 'Prawn Thali',       price: 280, category: 'Seafood Meals',  image: '🦐', stock: 30, gstRate: 5 },
  { id: 9,  name: 'Crab Thali',        price: 350, category: 'Seafood Meals',  image: '🦀', stock: 20, gstRate: 5 },
  // Prawns
  { id: 10, name: 'Prawn Ghee Roast',  price: 380, category: 'Prawns',        image: '🍤', stock: 20, gstRate: 5 },
  { id: 11, name: 'Butter Prawn',      price: 420, category: 'Prawns',        image: '🦐', stock: 15, gstRate: 5 },
  { id: 12, name: 'Prawn Masala',      price: 340, category: 'Prawns',        image: '🍲', stock: 18, gstRate: 5 },
  // Crab
  { id: 13, name: 'Crab Masala',       price: 480, category: 'Crab',          image: '🦀', stock: 10, gstRate: 5 },
  { id: 14, name: 'Butter Crab',       price: 520, category: 'Crab',          image: '🦀', stock: 8,  gstRate: 5 },
  { id: 15, name: 'Pepper Crab',       price: 500, category: 'Crab',          image: '🦀', stock: 10, gstRate: 5 },
  // Beverages
  { id: 16, name: 'Lime Juice',        price: 60,  category: 'Beverages',     image: '🥤', stock: 100, gstRate: 12 },
  { id: 17, name: 'Coconut Water',     price: 80,  category: 'Beverages',     image: '🥥', stock: 60,  gstRate: 12 },
  { id: 18, name: 'Lassi',             price: 90,  category: 'Beverages',     image: '🥛', stock: 50,  gstRate: 12 },
  // Rice Items
  { id: 19, name: 'Steam Rice',        price: 60,  category: 'Rice Items',    image: '🍚', stock: 100, gstRate: 5 },
  { id: 20, name: 'Fish Biryani',      price: 240, category: 'Rice Items',    image: '🍛', stock: 30,  gstRate: 5 },
  { id: 21, name: 'Prawn Biryani',     price: 300, category: 'Rice Items',    image: '🦐', stock: 25,  gstRate: 5 },
  // Combos
  { id: 22, name: 'Fish Fry Combo',    price: 320, category: 'Combos',        image: '🍱', stock: 25, gstRate: 5 },
  { id: 23, name: 'Prawn Combo',       price: 420, category: 'Combos',        image: '🍱', stock: 15, gstRate: 5 },
  { id: 24, name: 'Family Feast',      price: 1200, category: 'Combos',       image: '🎉', stock: 10, gstRate: 5 },
];

// ─── Tables ───────────────────────────────────────────────────────────────────
const INITIAL_TABLES = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  label: `T${String(i + 1).padStart(2, '0')}`,
  status: 'available', // available | occupied | reserved | cleaning
  capacity: i < 4 ? 2 : i < 14 ? 4 : 6,
  currentOrderId: null,
}));

// ─── Coupons ──────────────────────────────────────────────────────────────────
const COUPONS = {
  'GOLDEN10': { type: 'percent', value: 10, description: '10% off on total bill' },
  'FLAT50':   { type: 'flat',    value: 50, description: '₹50 flat discount' },
  'FEAST20':  { type: 'percent', value: 20, description: '20% off — Family Feast Special' },
};

let invoiceCounter = 1;
const getInvoiceNo = () => {
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `INV-${yyyymmdd}-${String(invoiceCounter++).padStart(3, '0')}`;
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useRestaurantStore = create(
  persist(
    (set, get) => ({
      menuItems: INITIAL_MENU,
      tables: INITIAL_TABLES,
      kots: [],       // Kitchen Order Tickets
      orders: [],     // Settled orders / invoices
      coupons: COUPONS,

      // ── Menu Actions ────────────────────────────────────────────────────────
      updateMenuItem: (updatedItem) => set((state) => ({
        menuItems: state.menuItems.map(item => item.id === updatedItem.id ? updatedItem : item)
      })),
      addMenuItem: (newItem) => set((state) => ({
        menuItems: [...state.menuItems, { ...newItem, id: Date.now() }]
      })),
      deleteMenuItem: (id) => set((state) => ({
        menuItems: state.menuItems.filter(item => item.id !== id)
      })),
      updateStock: (id, amount) => set((state) => ({
        menuItems: state.menuItems.map(item =>
          item.id === id ? { ...item, stock: Math.max(0, item.stock + amount) } : item
        )
      })),

      receiveStock: (items) => set((state) => ({
        menuItems: state.menuItems.map(menuItem => {
          const matchingItem = items.find(i => i.name.toUpperCase() === menuItem.name.toUpperCase());
          if (matchingItem) {
            return { ...menuItem, stock: menuItem.stock + (matchingItem.qty || matchingItem.quantity || 0) };
          }
          return menuItem;
        })
      })),

      // ── Table Actions ────────────────────────────────────────────────────────
      updateTableStatus: (tableId, status, orderId = null) => set((state) => ({
        tables: state.tables.map(t =>
          t.id === tableId ? { ...t, status, currentOrderId: orderId } : t
        )
      })),

      // ── KOT Actions ──────────────────────────────────────────────────────────
      createKOT: ({ tableId, tableLabel, orderType, items, staffName, notes }) => {
        const kot = {
          id: `KOT-${Date.now()}`,
          tableId,
          tableLabel,
          orderType,
          items: items.map(item => ({ ...item, kotStatus: 'preparing' })),
          staffName,
          notes: notes || '',
          createdAt: new Date().toISOString(),
          status: 'active', // active | completed | cancelled
        };
        set((state) => ({ kots: [kot, ...state.kots] }));
        return kot;
      },

      updateKOTItemStatus: (kotId, itemId, status) => set((state) => ({
        kots: state.kots.map(kot => {
          if (kot.id !== kotId) return kot;
          const updatedItems = kot.items.map(item =>
            item.id === itemId ? { ...item, kotStatus: status } : item
          );
          const allDelivered = updatedItems.every(i => i.kotStatus === 'delivered');
          return { ...kot, items: updatedItems, status: allDelivered ? 'completed' : 'active' };
        })
      })),

      updateKOTStatus: (kotId, status) => set((state) => ({
        kots: state.kots.map(kot => kot.id === kotId ? { ...kot, status } : kot)
      })),

      // ── Coupon Validation ────────────────────────────────────────────────────
      validateCoupon: (code) => {
        const coupon = COUPONS[code?.toUpperCase()];
        if (!coupon) return { valid: false, message: 'Invalid coupon code' };
        return { valid: true, coupon };
      },

      // ── Settle Order ─────────────────────────────────────────────────────────
      settleOrder: ({ tableId, orderType, tableLabel, items, subtotal, gstAmount, discount, coupon, total, paymentBreakdown, staffName }) => {
        const invoiceNo = getInvoiceNo();
        const order = {
          id: `ORD-${Date.now()}`,
          invoiceNo,
          tableId,
          tableLabel,
          orderType,
          items,
          subtotal,
          gstAmount,
          discount,
          coupon,
          total,
          paymentBreakdown,
          staffName,
          timestamp: new Date().toISOString(),
          status: 'COMPLETED',
        };

        set((state) => {
          // Deduct stock
          const updatedMenu = state.menuItems.map(menuItem => {
            const cartItem = items.find(i => i.id === menuItem.id);
            if (cartItem) return { ...menuItem, stock: Math.max(0, menuItem.stock - cartItem.qty) };
            return menuItem;
          });
          // Free up table
          const updatedTables = state.tables.map(t =>
            t.id === tableId ? { ...t, status: 'cleaning', currentOrderId: null } : t
          );
          return {
            orders: [order, ...state.orders],
            menuItems: updatedMenu,
            tables: updatedTables,
            kots: state.kots.map(k => k.tableId === tableId ? { ...k, status: 'completed' } : k),
          };
        });

        // Cross-post to Admin Finance
        useAdminStore.getState().addTransaction({
          date: new Date().toLocaleDateString('en-GB'),
          desc: `RESTAURANT POS: #${invoiceNo}`,
          method: Object.keys(paymentBreakdown || {})[0]?.toUpperCase() || 'CASH',
          type: 'income',
          amount: total,
          source: 'RESTAURANT'
        });

        return order;
      },

      // legacy alias
      addOrder: (order) => set((state) => ({
        orders: [{ ...order, id: `ORD-${Date.now()}`, timestamp: new Date().toISOString(), status: 'COMPLETED' }, ...state.orders]
      })),
    }),
    { name: 'golden-fisheries-restaurant' }
  )
);
