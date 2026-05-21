import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAdminStore } from './adminStore';
import { restaurantService } from '../services/restaurantService';

// ─── Menu Data ────────────────────────────────────────────────────────────────
const INITIAL_MENU = [];
const INITIAL_TABLES = [];

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

      // Async Actions
      fetchOrders: async () => {
        set({ loading: true });
        try {
          const res = await restaurantService.all();
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ orders: list, loading: false });
        } catch (err) {
          console.error('Failed to fetch orders', err);
          set({ loading: false });
        }
      },

      fetchMenu: async () => {
        set({ loading: true });
        try {
          const res = await restaurantService.getMenu();
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(item => ({
            ...item,
            id: item._id || item.id
          }));
          set({ menuItems: mapped, loading: false });
        } catch (err) {
          console.error('Failed to fetch menu', err);
          set({ menuItems: [], loading: false });
        }
      },

      fetchTables: async () => {
        set({ loading: true });
        try {
          const res = await restaurantService.getTables();
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(item => ({
            ...item,
            id: item._id || item.id
          }));
          set({ tables: mapped, loading: false });
        } catch (err) {
          console.error('Failed to fetch tables', err);
          set({ tables: [], loading: false });
        }
      },

      settleOrderAsync: async (settleData) => {
        set({ loading: true });
        try {
          // 1. Create the order document on backend
          const res = await restaurantService.create(settleData);
          const orderId = res?.data?._id || res?._id;

          // 2. Settle the order (payment)
          if (orderId) {
            const breakdown = settleData.paymentBreakdown || {};
            const cash = parseFloat(breakdown.cash) || 0;
            const upi = parseFloat(breakdown.upi) || 0;
            const isSplit = settleData.paymentMethod?.toUpperCase() === 'SPLIT' || (cash > 0 && upi > 0);
            await restaurantService.settle(orderId, {
              paymentMethod: isSplit ? 'SPLIT' : (settleData.paymentMethod || 'CASH').toUpperCase(),
              cashAmount: isSplit ? cash : undefined,
              upiAmount: isSplit ? upi : undefined,
            });
          }

          // Cross-post to Admin Finance
          useAdminStore.getState().addTransaction({
            date: new Date().toLocaleDateString('en-GB'),
            desc: `RESTAURANT POS: #${res?.data?.orderNumber || res?.orderNumber || 'ORD'}`,
            method: settleData.paymentMethod || 'CASH',
            type: 'income',
            amount: settleData.total,
            source: 'RESTAURANT'
          });

          // 3. Refresh local state
          await get().fetchOrders();
          await get().fetchMenu();
          set({ loading: false });
          return res;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },
    }),
    { name: 'golden-fisheries-restaurant' }
  )
);
