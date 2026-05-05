import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import mockData from '../data/mockData.json';

const generateId = (prefix, list) => {
  const next = (list.length + 1).toString().padStart(4, '0');
  return `${prefix}-${next}`;
};

export const useAdminStore = create(
  persist(
    (set) => ({
      // Data
      tapals: mockData.admin.tapals || [],
      inventory: [
        { id: 1, name: 'ROHU FISH', category: 'FRESHWATER', qty: 450, unit: 'KG', price: 85, status: 'in-stock' },
        { id: 2, name: 'CATLA FISH', category: 'FRESHWATER', qty: 320, unit: 'KG', price: 90, status: 'in-stock' },
        { id: 3, name: 'TIGER PRAWNS', category: 'SEAFOOD', qty: 15, unit: 'KG', price: 450, status: 'low-stock' },
        { id: 4, name: 'SQUID', category: 'SEAFOOD', qty: 0, unit: 'KG', price: 280, status: 'out-of-stock' },
        { id: 5, name: 'MRIGAL', category: 'FRESHWATER', qty: 180, unit: 'KG', price: 75, status: 'in-stock' },
      ],
      invoices: [
        { id: 'INV-1001', client: 'GOLDEN RESTAURANT', type: 'SALES', amount: '₹12,450', numericAmount: 12450, date: '30 APR 2026', status: 'paid' },
        { id: 'INV-1002', client: 'FISH MALL RETAIL', type: 'SALES', amount: '₹8,900', numericAmount: 8900, date: '30 APR 2026', status: 'pending' },
        { id: 'INV-1003', client: 'DEEP SEA FARMS', type: 'PROCUREMENT', amount: '₹45,000', numericAmount: 45000, date: '29 APR 2026', status: 'paid' },
        { id: 'INV-1004', client: 'BLUE WATER HOTEL', type: 'SALES', amount: '₹18,200', numericAmount: 18200, date: '29 APR 2026', status: 'overdue' },
        { id: 'INV-1005', client: 'COASTAL CUISINES', type: 'SALES', amount: '₹6,750', numericAmount: 6750, date: '28 APR 2026', status: 'paid' },
      ],
      drivers: [
        { id: 1, name: 'Suresh Kumar', phone: '+91 98765 43210', vehicle: 'MH-12-AS-4567', status: 'active', rating: 4.8, trips: 142 },
        { id: 2, name: 'Ramesh Singh', phone: '+91 98765 43211', vehicle: 'MH-12-BT-8890', status: 'on-trip', rating: 4.5, trips: 98 },
        { id: 3, name: 'Abdul Khan', phone: '+91 98765 43212', vehicle: 'MH-12-CQ-1122', status: 'inactive', rating: 4.2, trips: 215 },
      ],
      users: [
        { id: 1, name: 'MAHESH KUMAR', email: 'mahesh@mke.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '10 MINS AGO' },
        { id: 2, name: 'CHANNAPPA S.', email: 'channappa@mke.com', role: 'MANAGER', status: 'ACTIVE', lastLogin: '2 HRS AGO' },
        { id: 3, name: 'LOKESH B.', email: 'lokesh@mke.com', role: 'BILLING', status: 'ACTIVE', lastLogin: 'YESTERDAY' },
        { id: 4, name: 'RAMU K.', email: 'ramu@mke.com', role: 'DRIVER', status: 'INACTIVE', lastLogin: '3 DAYS AGO' },
      ],
      transactions: [
        { date: '30/04/26', desc: 'Diesel KA-01-AX-1234', method: 'Cash', type: 'expense', amount: 1200 },
        { date: '29/04/26', desc: 'Payment - Golden Rest.', method: 'UPI', type: 'income', amount: 12500 },
        { date: '29/04/26', desc: 'Ramu Fisheries Purchase', method: 'Bank Transfer', type: 'expense', amount: 40000 },
        { date: '28/04/26', desc: 'Fish Mall Daily Sales', method: 'Cash', type: 'income', amount: 18400 },
      ],

      trips: [],
      incomingStock: [],

      // Actions - Tapals
      addTapal: (tapal) => set((state) => ({ 
        tapals: [tapal, ...state.tapals] 
      })),
      
      updateTapalStatus: (id, status) => set((state) => ({
        tapals: state.tapals.map(t => t.id === id ? { ...t, status } : t)
      })),

      editTapal: (id, updates) => set((state) => ({
        tapals: state.tapals.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteTapal: (id) => set((state) => ({
        tapals: state.tapals.filter(t => t.id !== id)
      })),

      assignDriver: (tapalId, driverId) => set((state) => {
        const tapal = state.tapals.find(t => t.id === tapalId);
        const driver = state.drivers.find(d => d.id === driverId);
        if (!tapal || !driver) return {};

        const newTrip = {
          id: generateId('TRP', state.trips),
          tapalId,
          driverId,
          driverName: driver.name,
          vehicle: driver.vehicle,
          status: 'assigned',
          pickupLocation: tapal.pickupLocation || 'FARM SITE',
          pickupDate: tapal.date,
          createdAt: new Date().toLocaleTimeString(),
          expenses: []
        };

        const newIncoming = tapal.type === 'Purchase' ? [{
          id: generateId('INC', state.incomingStock),
          tapalId,
          tripId: newTrip.id,
          productName: tapal.products?.[0]?.name || 'GENERAL FISH',
          expectedQty: tapal.qty,
          actualQty: null,
          status: 'in-transit'
        }] : [];

        return {
          trips: [newTrip, ...state.trips],
          incomingStock: [...state.incomingStock, ...newIncoming],
          tapals: state.tapals.map(t => t.id === tapalId ? { ...t, status: 'Driver Assigned', driver: driver.name } : t),
          drivers: state.drivers.map(d => d.id === driverId ? { ...d, status: 'on-trip' } : d)
        };
      }),

      driverAcceptTrip: (tripId) => set((state) => {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return {};
        return {
          trips: state.trips.map(t => t.id === tripId ? { ...t, status: 'accepted', acceptedAt: new Date().toLocaleTimeString() } : t),
          tapals: state.tapals.map(t => t.id === trip.tapalId ? { ...t, status: 'In Transit' } : t)
        };
      }),

      driverRejectTrip: (tripId) => set((state) => {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return {};
        return {
          trips: state.trips.filter(t => t.id !== tripId),
          tapals: state.tapals.map(t => t.id === trip.tapalId ? { ...t, status: 'Confirmed', driver: 'Unassigned' } : t),
          drivers: state.drivers.map(d => d.id === trip.driverId ? { ...d, status: 'active' } : d),
          incomingStock: state.incomingStock.filter(i => i.tripId !== tripId)
        };
      }),

      markStockReceived: (tapalId, actualQty) => set((state) => {
        const tapal = state.tapals.find(t => t.id === tapalId);
        if (!tapal) return {};

        const qtyVal = parseFloat(actualQty);
        const amountVal = parseFloat(tapal.amount.replace(/[₹,]/g, '')) || 0;

        const newInventory = state.inventory.map(item => {
          if (tapal.products && tapal.products.some(p => p.name.toUpperCase() === item.name.toUpperCase())) {
            const addedQty = tapal.type === 'Purchase' ? qtyVal : -qtyVal;
            const nextQty = Math.max(0, item.qty + addedQty);
            return { ...item, qty: nextQty, status: nextQty === 0 ? 'out-of-stock' : nextQty < 50 ? 'low-stock' : 'in-stock' };
          }
          return item;
        });

        const newTransactions = [{
          date: new Date().toLocaleDateString('en-GB'),
          desc: `${tapal.type.toUpperCase()} RECEIVED: ${tapal.id}`,
          method: 'AUTO',
          type: tapal.type === 'Purchase' ? 'expense' : 'income',
          amount: amountVal
        }, ...state.transactions];

        return {
          tapals: state.tapals.map(t => t.id === tapalId ? { ...t, status: 'Delivered', actualQty: `${actualQty} KG` } : t),
          inventory: newInventory,
          transactions: newTransactions,
          incomingStock: state.incomingStock.map(i => i.tapalId === tapalId ? { ...i, status: 'received', actualQty: `${actualQty} KG` } : i),
          trips: state.trips.map(t => t.tapalId === tapalId ? { ...t, status: 'completed', completedAt: new Date().toLocaleTimeString() } : t)
        };
      }),

      addTripExpense: (tripId, expense) => set((state) => {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return {};

        const updatedTrip = {
          ...trip,
          expenses: [...(trip.expenses || []), expense]
        };

        return {
          trips: state.trips.map(t => t.id === tripId ? updatedTrip : t),
          transactions: [{
            date: new Date().toLocaleDateString('en-GB'),
            desc: `TRIP EXPENSE (${expense.type}): ${tripId}`,
            method: expense.method || 'CASH',
            type: 'expense',
            amount: Number(expense.amount)
          }, ...state.transactions]
        };
      }),

      updateInventoryQty: (id, amount) => set((state) => ({
        inventory: state.inventory.map(item => {
          if (item.id === id) {
            const newQty = Math.max(0, item.qty + amount);
            let newStatus = 'in-stock';
            if (newQty === 0) newStatus = 'out-of-stock';
            else if (newQty < 50) newStatus = 'low-stock';
            return { ...item, qty: newQty, status: newStatus };
          }
          return item;
        })
      })),
      addInventoryItem: (item) => set((state) => ({
        inventory: [...state.inventory, { ...item, id: state.inventory.length + 1 }]
      })),

      updateDriverStatus: (id, status) => set((state) => ({
        drivers: state.drivers.map(d => d.id === id ? { ...d, status } : d)
      })),
      addDriver: (driver) => set((state) => ({
        drivers: [...state.drivers, { ...driver, id: state.drivers.length + 1 }]
      })),
      deleteDriver: (id) => set((state) => ({
        drivers: state.drivers.filter(d => d.id !== id)
      })),

      addInvoice: (invoice) => set((state) => ({
        invoices: [invoice, ...state.invoices]
      })),

      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: state.users.length + 1 }]
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      addTransaction: (tx) => set((state) => ({
        transactions: [tx, ...state.transactions]
      })),

      farmers: [
        { id: 'FRM-001', name: 'RAMU FISHERIES', mobile: '+91 98765 43210', location: 'HASSAN', village: 'Hemavathi', whatsapp: true, active: true, totalSlips: 12 },
        { id: 'FRM-002', name: 'DEEP SEA FARMS', mobile: '+91 98765 43211', location: 'MANGALORE', village: 'Ullal', whatsapp: true, active: true, totalSlips: 8 },
        { id: 'FRM-003', name: 'COASTAL HARVEST', mobile: '+91 98765 43212', location: 'UDUPI', village: 'Malpe', whatsapp: false, active: false, totalSlips: 5 },
      ],

      harvestSlips: [
        {
          id: 'HSL-0001', slipNo: 1, status: 'confirmed', createdBy: 'Mahesh', createdAt: '2026-04-29',
          farmer: { id: 'FRM-001', name: 'RAMU FISHERIES', mobile: '+91 98765 43210', location: 'HASSAN', village: 'Hemavathi' },
          products: [{ id: 1, fishName: 'Rohu', category: 'Freshwater', quantity: 500, unit: 'KG', qualityType: 'A', estimatedWeight: 510, rate: 85, confirmedQty: 500 }],
          harvestDate: '2026-05-01', pickupDate: '2026-05-02', pickupTime: '06:00 AM',
          pickupLocation: 'Hemavathi Pond, Hassan', logisticsNotes: 'Ice required',
          remarks: '', attachmentUrl: null, rejectedReason: null, convertedToTapalId: 'PUR-1001',
        },
        {
          id: 'HSL-0002', slipNo: 2, status: 'sent', createdBy: 'Mahesh', createdAt: '2026-04-30',
          farmer: { id: 'FRM-002', name: 'DEEP SEA FARMS', mobile: '+91 98765 43211', location: 'MANGALORE', village: 'Ullal' },
          products: [
            { id: 1, fishName: 'Tiger Prawns', category: 'Seafood', quantity: 200, unit: 'KG', qualityType: 'A', estimatedWeight: null, rate: null, confirmedQty: null },
            { id: 2, fishName: 'Squid', category: 'Seafood', quantity: 100, unit: 'KG', qualityType: 'B', estimatedWeight: null, rate: null, confirmedQty: null },
          ],
          harvestDate: '2026-05-03', pickupDate: '2026-05-04', pickupTime: '07:00 AM',
          pickupLocation: 'Ullal Jetty, Mangalore', logisticsNotes: '',
          remarks: 'Call before pickup', attachmentUrl: null, rejectedReason: null, convertedToTapalId: null,
        },
        {
          id: 'HSL-0003', slipNo: 3, status: 'pending', createdBy: 'Mahesh', createdAt: '2026-05-01',
          farmer: { id: 'FRM-001', name: 'RAMU FISHERIES', mobile: '+91 98765 43210', location: 'HASSAN', village: 'Hemavathi' },
          products: [{ id: 1, fishName: 'Catla', category: 'Freshwater', quantity: 300, unit: 'KG', qualityType: 'Mix', estimatedWeight: null, rate: 90, confirmedQty: null }],
          harvestDate: '2026-05-06', pickupDate: '2026-05-07', pickupTime: '05:30 AM',
          pickupLocation: 'Hemavathi Pond, Hassan', logisticsNotes: 'Narrow road — small truck only',
          remarks: '', attachmentUrl: null, rejectedReason: null, convertedToTapalId: null,
        },
      ],

      addHarvestSlip: (slip) => set((state) => ({
        harvestSlips: [slip, ...state.harvestSlips],
        farmers: state.farmers.map(f =>
          f.id === slip.farmer.id ? { ...f, totalSlips: f.totalSlips + 1 } : f
        ),
      })),

      updateSlipStatus: (id, status, extra = {}) => set((state) => ({
        harvestSlips: state.harvestSlips.map(s =>
          s.id === id ? { ...s, status, ...extra } : s
        ),
      })),

      addFarmer: (farmer) => set((state) => ({
        farmers: [...state.farmers, { ...farmer, id: generateId('FRM', state.farmers), totalSlips: 0, active: true }],
      })),

      convertSlipToTapal: (slipId) => set((state) => {
        const slip = state.harvestSlips.find(s => s.id === slipId);
        if (!slip) return {};

        const totalQty = slip.products.reduce((a, p) => a + (p.confirmedQty ?? p.quantity), 0);
        const totalAmt = slip.products.reduce((a, p) => {
          const qty = p.confirmedQty ?? p.quantity;
          const rate = p.rate ?? 0;
          return a + qty * rate;
        }, 0);

        const newTapal = {
          id: generateId('PUR', state.tapals),
          type: 'Purchase',
          party: slip.farmer.name,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
          qty: `${totalQty} KG`,
          amount: totalAmt > 0 ? `₹${totalAmt.toLocaleString()}` : 'RATE TBD',
          driver: 'Unassigned',
          status: 'Confirmed',
          products: slip.products.map(p => ({
            name: p.fishName.toUpperCase(),
            qty: `${p.confirmedQty ?? p.quantity} ${p.unit}`,
            rate: p.rate ? `₹${p.rate}` : 'TBD',
            total: p.rate ? `₹${((p.confirmedQty ?? p.quantity) * p.rate).toLocaleString()}` : 'TBD'
          })),
          farmer: slip.farmer,
          timeline: [
            { status: 'SLIP CREATED', time: slip.createdAt, user: slip.createdBy },
            { status: 'CONVERTED TO TAPAL', time: new Date().toLocaleTimeString(), user: 'Admin' }
          ]
        };

        return {
          tapals: [newTapal, ...state.tapals],
          harvestSlips: state.harvestSlips.map(s =>
            s.id === slipId
              ? { ...s, status: 'converted', convertedToTapalId: newTapal.id }
              : s
          ),
        };
      }),
    }),
    {
      name: 'golden-fisheries-admin',
    }
  )
);
