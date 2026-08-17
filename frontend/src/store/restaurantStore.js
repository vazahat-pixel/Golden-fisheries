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

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));

const ORDER_TYPE_TO_API = {
  'Dine In': 'DINE_IN',
  Takeaway: 'TAKEAWAY',
  Parcel: 'TAKEAWAY',
  'Online Order': 'DELIVERY',
  'Bulk Order': 'TAKEAWAY',
};

const mapOrderFromApi = (order) => {
  const id = order._id || order.id;
  const ts = order.createdAt || order.timestamp;
  return {
    ...order,
    id,
    _id: id,
    orderNumber: order.orderNumber,
    total: order.totalAmount ?? order.total ?? 0,
    timestamp: ts ? (typeof ts === 'string' ? ts : new Date(ts).toISOString()) : new Date().toISOString(),
    items: Array.isArray(order.items) ? order.items : [],
    status: order.status,
  };
};

const mapTicketToKot = (ticket) => ({
  id: ticket._id,
  _id: ticket._id,
  ticketNumber: ticket.ticketNumber,
  tableId: ticket.tableNumber,
  tableLabel: ticket.tableNumber,
  orderType: ticket.orderType,
  items: (ticket.items || []).map((line) => ({
    id: line._id,
    _id: line._id,
    menuItemId: line.menuItemId,
    name: line.name,
    qty: line.quantity,
    quantity: line.quantity,
    notes: line.notes,
    kotStatus: (line.lineStatus || 'PENDING').toLowerCase(),
    voidReason: line.voidReason || '',
  })),
  staffName: ticket.createdBy?.fullName || 'Staff',
  notes: ticket.remarks || '',
  createdAt: ticket.createdAt,
  status: ticket.status === 'ACTIVE' ? 'active' : ticket.status?.toLowerCase(),
});

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
      alerts: [],
      kitchenStock: [],
      coupons: COUPONS,
      activeSession: null,
      currentTableOrder: null, // the selected dine-in table's open running tab, if any
      accountingSummary: null,
      cashbook: [],
      expenses: [],
      loading: false,
      error: null,

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
        get().createKOTAsync({ tableId, tableLabel, orderType, items, staffName, notes });
        return null;
      },

      createKOTAsync: async ({ tableId, tableLabel, orderType, items, staffName, notes }) => {
        const res = await restaurantService.createKitchenTicket({
          tableNumber: tableLabel || tableId || 'COUNTER',
          orderType: ORDER_TYPE_TO_API[orderType] || orderType,
          items: items.map((item) => ({
            menuItemId: item.menuItemId || null,
            name: item.name,
            quantity: item.qty || item.quantity || 1,
            notes: item.notes || '',
          })),
          remarks: notes || '',
        });
        const ticket = res?.data?.ticket ?? res?.data?.data?.ticket;
        if (ticket) {
          const kot = mapTicketToKot(ticket);
          set((state) => ({ kots: [kot, ...state.kots] }));
          return kot;
        }
        await get().fetchKitchenTickets();
        return null;
      },

      fetchKitchenTickets: async () => {
        try {
          const res = await restaurantService.listKitchenTickets({ active: 'true' });
          const list = res?.data ?? res;
          const docs = Array.isArray(list) ? list : [];
          set({ kots: docs.map(mapTicketToKot) });
        } catch (err) {
          console.error('Failed to fetch kitchen tickets', err);
        }
      },

      advanceKitchenLineAsync: async (kotId, lineId) => {
        const res = await restaurantService.advanceKitchenLine(kotId, lineId);
        const ticket = res?.data?.ticket ?? res?.data?.data?.ticket;
        if (ticket) {
          const kot = mapTicketToKot(ticket);
          set((state) => ({
            kots: state.kots.map((k) => (k.id === kotId ? kot : k)),
          }));
        } else {
          await get().fetchKitchenTickets();
        }
      },

      updateKOTItemStatus: (kotId, itemId) => {
        get().advanceKitchenLineAsync(kotId, itemId);
      },

      voidKitchenLineAsync: async (kotId, lineId, reason) => {
        const res = await restaurantService.voidKitchenLine(kotId, lineId, reason);
        const ticket = res?.data?.ticket ?? res?.data?.data?.ticket;
        if (ticket) {
          const kot = mapTicketToKot(ticket);
          set((state) => ({
            kots: kot.status === 'active'
              ? state.kots.map((k) => (k.id === kotId ? kot : k))
              : state.kots.filter((k) => k.id !== kotId),
          }));
        } else {
          await get().fetchKitchenTickets();
        }
      },

      cancelKitchenTicketAsync: async (kotId) => {
        const res = await restaurantService.cancelKitchenTicket(kotId);
        const ticket = res?.data?.ticket ?? res?.data?.data?.ticket;
        set((state) => ({
          kots: state.kots.filter((k) => k.id !== kotId),
        }));
        return ticket;
      },

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

      addInternalSupplyAlert: (payload) => {
        const lines = payload?.lines || [];
        const itemsSummary = lines
          .map((l) => `${l.itemName} (${l.quantity} ${l.unit || 'KG'})`)
          .join(', ');
        const alert = {
          id: `INT-${payload.invoiceNumber}-${Date.now()}`,
          type: 'INTERNAL_SUPPLY',
          title: `Stock received — ${payload.invoiceNumber || 'INT'}`,
          message: itemsSummary
            ? `Fish Mall sent: ${itemsSummary}. Total ₹${payload.totalAmount ?? 0}.`
            : `New internal supply from Fish Mall (₹${payload.totalAmount ?? 0}).`,
          severity: 'info',
          timestamp: new Date().toISOString(),
          read: false,
          invoiceNumber: payload.invoiceNumber,
        };
        set((state) => ({
          alerts: [alert, ...state.alerts.filter((a) => a.invoiceNumber !== payload.invoiceNumber)].slice(0, 50),
        }));
        return alert;
      },

      dismissAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),

      markAlertsRead: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, read: true })),
        })),

      fetchKitchenStock: async () => {
        try {
          const res = await restaurantService.getInventory({ limit: 500 });
          const list = res?.data || (Array.isArray(res) ? res : []);
          set({ kitchenStock: Array.isArray(list) ? list : [] });
        } catch (err) {
          console.error('Failed to fetch kitchen stock', err);
        }
      },

      // Async Actions
      fetchOrders: async () => {
        set({ loading: true });
        try {
          const res = await restaurantService.all();
          const raw = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const list = (Array.isArray(raw) ? raw : []).map(mapOrderFromApi);
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
          const mapped = list
            .filter((item) => Boolean(item && (item._id || item.id)))
            .map((item) => {
              const rowId = String(item._id || item.id);
              const menuItemId = item.menuItemId != null ? String(item.menuItemId) : null;
              const inventoryItemId = item.inventoryItemId != null ? String(item.inventoryItemId) : null;
              const isKitchenSku = !menuItemId && !!inventoryItemId;
              return {
                ...item,
                id: rowId,
                menuItemId,
                inventoryItemId,
                price: item.price ?? item.sellingPrice ?? item.rate ?? 0,
                stock: item.stock ?? item.quantity ?? 0,
                isKitchenSku,
                hasRecipe: Array.isArray(item.recipe) && item.recipe.length > 0,
              };
            });
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

      // Fetches the currently open (unpaid) running tab for a dine-in table, if any —
      // lets the POS resume a table that already had a "starters" round sent earlier.
      fetchTableOrderAsync: async (tableNumber) => {
        if (!tableNumber || tableNumber === 'COUNTER') {
          set({ currentTableOrder: null });
          return null;
        }
        try {
          const res = await restaurantService.getTableOrder(tableNumber);
          const order = res?.data?.order ?? res?.order ?? null;
          set({ currentTableOrder: order });
          return order;
        } catch (err) {
          console.error('Failed to fetch table running tab', err);
          set({ currentTableOrder: null });
          return null;
        }
      },

      // Sends one round of items to the kitchen/bill. If the table already has an
      // open tab, the backend appends to it instead of starting a second bill —
      // this is what lets "starters now, mains later" become ONE final bill.
      appendOrderRoundAsync: async (roundData) => {
        const payload = {
          orderType: ORDER_TYPE_TO_API[roundData.orderType] || roundData.orderType || 'DINE_IN',
          tableNumber: roundData.tableLabel || roundData.tableId || 'COUNTER',
          items: (roundData.items || []).map((item) => {
            const line = {
              name: item.name,
              quantity: item.qty ?? item.quantity,
              rate: item.rate ?? item.price,
            };
            if (isValidObjectId(item.menuItemId)) {
              line.menuItemId = item.menuItemId;
            } else if (isValidObjectId(item.inventoryItemId)) {
              line.inventoryItemId = item.inventoryItemId;
            } else if (item.isKitchenSku && isValidObjectId(item.id)) {
              line.inventoryItemId = item.id;
            }
            return line;
          }),
          discountAmount: roundData.discount ?? roundData.discountAmount ?? 0,
          coupon: roundData.coupon ? String(roundData.coupon) : '',
        };
        if (isValidObjectId(roundData.kitchenTicketId)) {
          payload.kitchenTicketId = roundData.kitchenTicketId;
        }

        const res = await restaurantService.create(payload);
        const order = res?.data?.order ?? res?.order;
        if (!order?._id && !order?.id) {
          throw new Error('Order was not saved on the server — please try again');
        }
        set({ currentTableOrder: order });
        return order;
      },

      // Settles payment for an existing order (a table's fully accumulated running tab,
      // or a fresh quick-sale order) and closes out every kitchen round tied to it.
      settleOrderAsync: async (settleData) => {
        set({ loading: true });
        try {
          const breakdown = settleData.paymentBreakdown || {};
          const cash = parseFloat(breakdown.cash ?? settleData.mixedPayment?.cash) || 0;
          const upi = parseFloat(breakdown.upi ?? settleData.mixedPayment?.upi) || 0;
          const pm = (settleData.paymentMethod || 'CASH').toUpperCase();
          const isSplit = pm === 'SPLIT' || (cash > 0 && upi > 0);

          let order = settleData.existingOrder || null;
          if ((settleData.items || []).length > 0) {
            order = await get().appendOrderRoundAsync(settleData);
          }
          const orderId = order?._id || order?.id;
          if (!orderId) {
            throw new Error('No order to settle — add items to the bill first');
          }

          await restaurantService.settle(orderId, {
            paymentMethod: isSplit ? 'SPLIT' : pm,
            cashAmount: isSplit ? cash : undefined,
            upiAmount: isSplit ? upi : undefined,
          });

          useAdminStore.getState().addTransaction({
            date: new Date().toLocaleDateString('en-GB'),
            desc: `RESTAURANT POS: #${order?.orderNumber || 'ORD'}`,
            method: isSplit ? 'SPLIT' : pm,
            type: 'income',
            amount: order?.totalAmount ?? settleData.total,
            source: 'RESTAURANT',
          });

          await get().fetchOrders();
          await get().fetchMenu();
          await get().fetchKitchenTickets();
          await get().fetchTables();
          set({ loading: false, currentTableOrder: null });
          return { data: { order }, order };
        } catch (err) {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to settle order';
          set({ error: msg, loading: false });
          const wrapped = new Error(msg);
          wrapped.cause = err;
          throw wrapped;
        }
      },

      // Removes one dish from a table's still-open bill before it's paid — the
      // "I want to void this before we settle" case.
      removeOrderItemAsync: async (orderId, itemId) => {
        const res = await restaurantService.removeOrderItem(orderId, itemId);
        const order = res?.data?.order ?? res?.order ?? null;
        set({ currentTableOrder: order && order.status === 'PENDING' ? order : null });
        await get().fetchTables();
        return order;
      },

      // Merges two dine-in table running tabs into one
      mergeTablesAsync: async (sourceTable, targetTable) => {
        set({ loading: true });
        try {
          const res = await restaurantService.mergeTables({ sourceTable, targetTable });
          const result = res?.data ?? res;
          await get().fetchTables();
          await get().fetchKitchenTickets();
          await get().fetchOrders();
          if (result.targetOrder) {
            set({ currentTableOrder: result.targetOrder, loading: false });
          } else {
            set({ loading: false });
          }
          return result;
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to merge tables';
          set({ loading: false });
          throw new Error(msg);
        }
      },

      // Fetches dish history analytics (portions per day, revenue, etc.)
      fetchDishHistoryAsync: async (params = {}) => {
        try {
          const res = await restaurantService.getReportDishHistory(params);
          return res?.data ?? res;
        } catch (err) {
          console.error('Failed to fetch dish history', err);
          return null;
        }
      },

      // Reverses an already-paid bill: restores kitchen stock, reverses the
      // cashbook entry, and adjusts the open shift's totals.
      voidOrderAsync: async (orderId, reason) => {
        set({ loading: true });
        try {
          const res = await restaurantService.voidOrder(orderId, reason);
          const order = res?.data?.order ?? res?.order;
          await get().fetchOrders();
          await get().fetchAccountingSummaryAsync();
          set({ loading: false });
          return order;
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to void the bill';
          set({ loading: false });
          throw new Error(msg);
        }
      },

      // ── Restaurant identity / bill header settings ──────────────────────────
      outletSettings: null,
      fetchOutletSettingsAsync: async () => {
        try {
          const res = await restaurantService.getOutletSettings();
          const outlet = res?.data?.outlet ?? res?.outlet ?? null;
          set({ outletSettings: outlet });
          return outlet;
        } catch (err) {
          console.error('Failed to fetch restaurant bill settings', err);
          return null;
        }
      },
      updateOutletSettingsAsync: async (payload) => {
        const res = await restaurantService.updateOutletSettings(payload);
        const outlet = res?.data?.outlet ?? res?.outlet;
        set({ outletSettings: outlet });
        return outlet;
      },

      fetchActiveSessionAsync: async () => {
        try {
          const res = await restaurantService.getActiveSession();
          const session = res?.data?.activeSession ?? res?.activeSession;
          set({ activeSession: session || null });
          if (session) {
            await get().fetchAccountingSummaryAsync();
          }
          return session;
        } catch (err) {
          console.error('Failed to fetch active session', err);
          return null;
        }
      },

      openSessionAsync: async (openingCash, openingNotes) => {
        set({ loading: true, error: null });
        try {
          const res = await restaurantService.openSession({ openingCash, openingNotes });
          const session = res?.data?.session ?? res?.session;
          set({ activeSession: session, loading: false });
          await get().fetchAccountingSummaryAsync();
          return session;
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to open shift session';
          set({ error: msg, loading: false });
          throw new Error(msg);
        }
      },

      closeSessionAsync: async (closingData) => {
        set({ loading: true, error: null });
        try {
          const res = await restaurantService.closeSession(closingData);
          const session = res?.data?.session ?? res?.session;
          set({ activeSession: null, accountingSummary: null, cashbook: [], expenses: [], loading: false });
          return session;
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to close shift session';
          set({ error: msg, loading: false });
          throw new Error(msg);
        }
      },

      fetchAccountingSummaryAsync: async () => {
        try {
          const res = await restaurantService.getSessionSummary();
          const summary = res?.data ?? res;
          if (summary) {
            set({
              activeSession: summary.session,
              accountingSummary: summary.session,
              cashbook: summary.cashbook || [],
              expenses: summary.expenses || [],
            });
          }
        } catch (err) {
          console.error('Failed to fetch accounting summary', err);
        }
      },

      submitExpenseAsync: async (expenseData) => {
        set({ loading: true, error: null });
        try {
          const res = await restaurantService.recordExpense(expenseData);
          const expense = res?.data?.expense ?? res?.expense;
          set({ loading: false });
          await get().fetchAccountingSummaryAsync();
          return expense;
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || 'Failed to submit kitchen expense';
          set({ error: msg, loading: false });
          throw new Error(msg);
        }
      },

      fetchExpensesAsync: async () => {
        try {
          const res = await restaurantService.listExpenses();
          const list = res?.data ?? res;
          set({ expenses: Array.isArray(list) ? list : [] });
        } catch (err) {
          console.error('Failed to fetch expenses', err);
        }
      },
    }),
    {
      name: 'golden-fisheries-restaurant-v2',
      partialize: () => ({}),
    }
  )
);
