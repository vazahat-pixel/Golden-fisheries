/**
 * E2E — Inventory Phases 1, 2, 3
 *
 * Phase 1: Procurement → Fish Mall (stock transfer)
 * Phase 2: Fish Mall → Restaurant (internal bill)
 * Phase 3: Restaurant KOT + POS settle (recipe consumption)
 *
 * Prerequisites:
 *   cd backend && npm run dev
 *   npm run seed:admin && npm run seed:e2e
 *
 * Run: node scripts/e2e_inventory_phases.js
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || '5000';
const BASE = process.env.E2E_API_BASE || `http://127.0.0.1:${PORT}/api/v1`;
const HEALTH_URL = process.env.E2E_HEALTH_URL || `http://127.0.0.1:${PORT}/health`;
const E2E_PASS = process.env.E2E_PASSWORD || 'e2e_test_123';

const USERS = {
  superAdmin: { phone: '9076062592', password: 'admin_password_123', label: 'Super Admin' },
  procurement: { phone: '9000000001', password: E2E_PASS, label: 'Procurement' },
  fishmall: { phone: '9000000007', password: E2E_PASS, label: 'Fish Mall Mgr' },
  restaurant: { phone: '9000000005', password: E2E_PASS, label: 'Restaurant Mgr' },
};

const STATE = {
  tokens: {},
  productId: null,
  productName: 'PRAWNS',
  procurementQtyBefore: null,
  fishMallItemId: null,
  fishMallQtyBefore: null,
  transferId: null,
  fishMallOutletId: null,
  internalBillId: null,
  restaurantItemId: null,
  restaurantQtyBefore: null,
  menuItemId: null,
  kitchenTicketId: null,
  orderId: null,
};

let PASS = 0;
let FAIL = 0;

function log(msg, color = 'reset') {
  const C = { reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m' };
  process.stdout.write((C[color] || '') + msg + C.reset + '\n');
}

function header(title) {
  log(`\n${'═'.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bold');
  log('═'.repeat(60), 'cyan');
}

function unwrap(json) {
  return json?.data ?? json;
}

async function request(method, urlPath, body = null, token = null, platform = 'WEB') {
  const headers = { 'Content-Type': 'application/json', 'X-Client-Platform': platform };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${urlPath}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return { status: res.status, data, ok: res.ok };
  } catch (err) {
    return { status: 0, data: { message: err.message }, ok: false };
  }
}

function assert(name, condition, detail = '') {
  if (condition) {
    PASS++;
    log(`  ✓ PASS  ${name}${detail ? ` → ${detail}` : ''}`, 'green');
    return true;
  }
  FAIL++;
  log(`  ✗ FAIL  ${name}${detail ? ` → ${detail}` : ''}`, 'red');
  return false;
}

function idOf(obj) {
  return obj?._id || obj?.id || null;
}

async function login(key, platform = 'WEB') {
  const u = USERS[key];
  const res = await request('POST', '/auth/login', { phone: u.phone, password: u.password }, null, platform);
  const token = res.data?.data?.accessToken || res.data?.accessToken;
  if (assert(`Login ${u.label}`, res.status === 200 && !!token, res.data?.message || `HTTP ${res.status}`)) {
    STATE.tokens[key] = token;
  }
  return token;
}

async function getProcurementProduct(token) {
  const products = await request('GET', '/products/all?limit=50', null, token, 'WEB');
  const list = unwrap(products.data);
  const arr = Array.isArray(list) ? list : list?.docs || [];
  let p = arr.find((x) => (x.name || '').toUpperCase() === STATE.productName) || arr[0];
  if (!p) {
    const created = await request(
      'POST',
      '/products/create',
      {
        name: STATE.productName,
        category: 'Seafood',
        baseUnit: 'KG',
        basePrice: 500,
        quantity: 0,
        minStockLimit: 10,
      },
      token,
      'WEB'
    );
    p = unwrap(created.data)?.product || unwrap(created.data);
  }
  STATE.productId = idOf(p);
  STATE.productName = p?.name || STATE.productName;
  return p;
}

async function getProcurementQty(token) {
  const res = await request('GET', `/inventory?limit=200`, null, token, 'WEB');
  const list = unwrap(res.data);
  const arr = Array.isArray(list) ? list : [];
  const p = arr.find((x) => idOf(x) === STATE.productId || (x.name || '').toUpperCase() === STATE.productName);
  return p?.quantity ?? 0;
}

async function getFishMallItem(token) {
  const res = await request('GET', '/fishmall/inventory?limit=200', null, token, 'WEB');
  const list = unwrap(res.data);
  const arr = Array.isArray(list) ? list : [];
  let item = arr.find((x) => (x.name || '').toUpperCase() === STATE.productName);
  if (!item) {
    const created = await request(
      'POST',
      '/fishmall/inventory',
      { name: STATE.productName, quantity: 0, rate: 500, openingStock: 0 },
      token,
      'WEB'
    );
    item = unwrap(created.data) || unwrap(created.data)?.item;
  }
  STATE.fishMallItemId = idOf(item);
  return item?.quantity ?? 0;
}

async function getRestaurantKitchenQty(token) {
  const res = await request('GET', '/restaurant/inventory?limit=200', null, token, 'WEB');
  const list = unwrap(res.data);
  const arr = Array.isArray(list) ? list : [];
  const matchName = STATE.productName.toUpperCase();
  let item = arr.find((x) => (x.name || '').toUpperCase() === matchName);
  if (!item) {
    item = arr.find((x) => (x.name || '').toUpperCase().includes(matchName));
  }
  STATE.restaurantItemId = idOf(item);
  return item?.quantity ?? 0;
}

async function ensureRestaurantKitchenStock(token, minKg = 5) {
  let qty = await getRestaurantKitchenQty(token);
  if (qty >= minKg && STATE.restaurantItemId) return qty;
  const fm = STATE.tokens.fishmall;
  if (STATE.fishMallItemId && fm) {
    const fmQty = await getFishMallItem(fm);
    if (fmQty >= minKg) {
      await request(
        'POST',
        '/fishmall/internal-bill/restaurant',
        {
          items: [{ fishMallItemId: STATE.fishMallItemId, quantity: minKg, rate: 500 }],
          remarks: 'E2E seed restaurant kitchen',
        },
        fm,
        'WEB'
      );
      qty = await getRestaurantKitchenQty(token);
      if (qty >= minKg) return qty;
    }
  }
  if (STATE.restaurantItemId) {
    await request(
      'PATCH',
      `/restaurant/inventory/${STATE.restaurantItemId}/adjust`,
      { quantityChange: minKg, remarks: 'E2E seed kitchen stock for phase 3' },
      token,
      'WEB'
    );
    return await getRestaurantKitchenQty(token);
  }
  return qty;
}

async function ensureMenuItem(token, name, payload) {
  const menuRes = await request('POST', '/restaurant/menu', payload, token, 'WEB');
  if (menuRes.status === 201 || menuRes.status === 200) {
    const menu = unwrap(menuRes.data);
    return { id: idOf(menu), name: menu?.name || name, detail: 'created' };
  }
  if (menuRes.status === 409) {
    const listRes = await request('GET', '/restaurant/menu?limit=200', null, token, 'WEB');
    const list = unwrap(listRes.data);
    const arr = Array.isArray(list) ? list : list?.docs || [];
    const found = arr.find((x) => (x.name || '').toUpperCase() === name.toUpperCase());
    if (found) {
      return { id: idOf(found), name: found.name, detail: 'reused existing' };
    }
  }
  return { id: null, name, detail: menuRes.data?.message || `HTTP ${menuRes.status}` };
}

function errDetail(res) {
  const errs = res?.data?.errors;
  if (Array.isArray(errs) && errs.length) {
    return errs.map((e) => `${e.field}: ${e.message}`).join('; ');
  }
  return res?.data?.message || '';
}

// ─── SETUP ───────────────────────────────────────────────
async function setup() {
  header('SETUP — Health & Auth');
  let healthOk = false;
  for (let i = 0; i < 5; i++) {
    const health = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(8000) }).catch(() => null);
    if (health?.ok) {
      healthOk = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  if (!assert('Backend /health', healthOk, HEALTH_URL)) {
    throw new Error('Start backend: cd backend && npm run dev');
  }

  await login('superAdmin');
  await login('procurement');
  await login('fishmall');
  await login('restaurant');

  const admin = STATE.tokens.superAdmin;
  await getProcurementProduct(admin);
  assert('Product id resolved', !!STATE.productId, STATE.productId);
}

async function resolveFishMallOutletId(token) {
  const res = await request('GET', '/fishmall-outlets?limit=20', null, token, 'WEB');
  const list = unwrap(res.data);
  const arr = Array.isArray(list) ? list : list?.docs || [];
  const o = arr.find((x) => x.isDefault) || arr[0];
  return idOf(o);
}

// ─── PHASE 1 ─────────────────────────────────────────────
async function phase1() {
  header('PHASE 1 — Procurement → Fish Mall Transfer');
  const admin = STATE.tokens.superAdmin;
  const proc = STATE.tokens.procurement;

  STATE.procurementQtyBefore = await getProcurementQty(admin);
  log(`  Procurement stock before: ${STATE.procurementQtyBefore} KG`, 'yellow');

  const transferQty = 5;
  if (STATE.procurementQtyBefore < transferQty) {
    const adj = await request(
      'POST',
      '/inventory/adjust',
      {
        productId: STATE.productId,
        quantityChange: 20,
        remarks: 'E2E phase1 seed procurement stock',
      },
      admin,
      'WEB'
    );
    assert('Seed procurement stock (adjust)', adj.status === 200, adj.data?.message);
    STATE.procurementQtyBefore = await getProcurementQty(admin);
  }

  STATE.fishMallOutletId = await resolveFishMallOutletId(admin);
  assert('Fish Mall outlet resolved', !!STATE.fishMallOutletId, STATE.fishMallOutletId);

  STATE.fishMallQtyBefore = await getFishMallItem(STATE.tokens.fishmall);
  log(`  Fish Mall stock before: ${STATE.fishMallQtyBefore} KG`, 'yellow');

  const create = await request(
    'POST',
    '/stock-transfers',
    {
      destinationOutletId: STATE.fishMallOutletId,
      lines: [{ productId: STATE.productId, quantity: transferQty, rate: 500 }],
      notes: 'E2E Phase 1 transfer',
      status: 'PENDING_APPROVAL',
    },
    admin,
    'WEB'
  );
  const transfer = unwrap(create.data)?.transfer || unwrap(create.data);
  STATE.transferId = idOf(transfer);
  assert(
    'Create stock transfer (PT)',
    (create.status === 200 || create.status === 201) && !!STATE.transferId,
    transfer?.transferNumber || create.data?.message
  );

  const approve = await request(
    'PATCH',
    `/stock-transfers/${STATE.transferId}/approve`,
    { notes: 'E2E approved' },
    admin,
    'WEB'
  );
  assert('Approve transfer (admin)', approve.status === 200, approve.data?.message);

  const procAfter = await getProcurementQty(admin);
  const fmAfter = await getFishMallItem(STATE.tokens.fishmall);

  assert(
    'Procurement stock reduced',
    procAfter <= STATE.procurementQtyBefore - transferQty + 0.01,
    `before=${STATE.procurementQtyBefore} after=${procAfter}`
  );
  assert(
    'Fish Mall stock increased',
    fmAfter >= STATE.fishMallQtyBefore + transferQty - 0.01,
    `before=${STATE.fishMallQtyBefore} after=${fmAfter}`
  );

  const tx = await request('GET', '/inventory/transactions?limit=10&type=TRANSFER_OUT', null, admin, 'WEB');
  const txList = unwrap(tx.data);
  const txs = Array.isArray(txList) ? txList : txList?.docs || [];
  assert('Procurement TRANSFER_OUT logged', txs.some((t) => t.type === 'TRANSFER_OUT'), `count=${txs.length}`);
}

// ─── PHASE 2 ─────────────────────────────────────────────
async function phase2() {
  header('PHASE 2 — Fish Mall → Restaurant Internal Bill');
  const fm = STATE.tokens.fishmall;
  const rest = STATE.tokens.restaurant;

  if (!STATE.fishMallItemId) await getFishMallItem(fm);
  STATE.fishMallQtyBefore = await getFishMallItem(fm);
  STATE.restaurantQtyBefore = await getRestaurantKitchenQty(rest);

  const billQty = 3;
  if (STATE.fishMallQtyBefore < billQty) {
    assert('Fish Mall has enough stock for internal bill', false, `have ${STATE.fishMallQtyBefore}`);
    return;
  }

  const bill = await request(
    'POST',
    '/fishmall/internal-bill/restaurant',
    {
      items: [{ fishMallItemId: STATE.fishMallItemId, quantity: billQty, rate: 500 }],
      destinationName: 'GF Restaurant Kitchen',
      remarks: 'E2E Phase 2 internal bill',
    },
    fm,
    'WEB'
  );
  const billDoc = unwrap(bill.data)?.bill || unwrap(bill.data);
  STATE.internalBillId = idOf(billDoc);
  assert(
    'Issue internal bill (INT)',
    (bill.status === 200 || bill.status === 201) && !!STATE.internalBillId,
    billDoc?.invoiceNumber || bill.data?.message
  );

  const fmAfter = await getFishMallItem(fm);
  const restAfter = await getRestaurantKitchenQty(rest);

  assert(
    'Fish Mall stock reduced',
    fmAfter <= STATE.fishMallQtyBefore - billQty + 0.01,
    `before=${STATE.fishMallQtyBefore} after=${fmAfter}`
  );
  assert(
    'Restaurant stock increased',
    restAfter >= STATE.restaurantQtyBefore + billQty - 0.01,
    `before=${STATE.restaurantQtyBefore} after=${restAfter}`
  );

  const receives = await request(
    'GET',
    '/restaurant/internal-supplies/reports/receives?limit=5',
    null,
    rest,
    'WEB'
  );
  assert('Restaurant receive report', receives.status === 200, receives.data?.message);
}

// ─── PHASE 3 ─────────────────────────────────────────────
async function phase3() {
  header('PHASE 3 — Restaurant KOT + POS + Recipe Consumption');
  const rest = STATE.tokens.restaurant;
  const admin = STATE.tokens.superAdmin;

  const kitchenBefore = await ensureRestaurantKitchenStock(rest, 5);
  assert('Restaurant kitchen stock ready', kitchenBefore >= 1 && !!STATE.restaurantItemId, `qty=${kitchenBefore} item=${STATE.restaurantItemId}`);

  const menuName = 'E2E FISH CURRY';
  const menuPayload = {
    name: menuName,
    category: 'Main Course',
    sellingPrice: 350,
    gstRate: 5,
    recipe: [
      {
        inventoryItemId: STATE.restaurantItemId,
        quantityPerServe: 0.5,
      },
    ],
  };
  const menuEnsured = await ensureMenuItem(rest, menuName, menuPayload);
  STATE.menuItemId = menuEnsured.id;
  assert(
    'Create menu item with recipe',
    !!STATE.menuItemId,
    menuEnsured.detail
  );

  const kotLine = { name: menuName, quantity: 1, notes: 'E2E' };
  if (STATE.menuItemId) kotLine.menuItemId = STATE.menuItemId;

  const kot = await request(
    'POST',
    '/restaurant/kitchen-tickets',
    {
      tableNumber: 'T01',
      orderType: 'DINE_IN',
      items: [kotLine],
    },
    rest,
    'WEB'
  );
  const ticket = unwrap(kot.data)?.ticket || unwrap(kot.data);
  STATE.kitchenTicketId = idOf(ticket);
  assert(
    'Create kitchen ticket (KOT)',
    (kot.status === 200 || kot.status === 201) && !!STATE.kitchenTicketId,
    ticket?.ticketNumber || errDetail(kot)
  );

  const kotList = await request('GET', '/restaurant/kitchen-tickets?active=true', null, rest, 'WEB');
  const kots = unwrap(kotList.data);
  const kotArr = Array.isArray(kots) ? kots : [];
  assert('Kitchen active queue has ticket', kotArr.length >= 1, `count=${kotArr.length}`);

  const lineId = ticket?.items?.[0]?._id;
  if (lineId) {
    const adv = await request(
      'PATCH',
      `/restaurant/kitchen-tickets/${STATE.kitchenTicketId}/lines/${lineId}/advance`,
      null,
      rest,
      'WEB'
    );
    assert('Advance kitchen line status', adv.status === 200, adv.data?.message);
  }

  const orderLine = { name: menuName, quantity: 1, rate: 350 };
  if (STATE.menuItemId) orderLine.menuItemId = STATE.menuItemId;

  const orderBody = {
    orderType: 'DINE_IN',
    tableNumber: 'T01',
    items: [orderLine],
    discountAmount: 0,
  };
  if (STATE.kitchenTicketId) orderBody.kitchenTicketId = STATE.kitchenTicketId;

  const order = await request('POST', '/restaurant/create', orderBody, rest, 'WEB');
  const orderDoc = unwrap(order.data)?.order || unwrap(order.data);
  STATE.orderId = idOf(orderDoc);
  assert(
    'Create restaurant order (RST)',
    (order.status === 200 || order.status === 201) && !!STATE.orderId,
    orderDoc?.orderNumber || errDetail(order)
  );

  const settle = await request(
    'PATCH',
    `/restaurant/settle/${STATE.orderId}`,
    { paymentMethod: 'CASH' },
    rest,
    'WEB'
  );
  assert('Settle order (CASH)', settle.status === 200, settle.data?.message);

  const kitchenAfter = await getRestaurantKitchenQty(rest);
  assert(
    'Kitchen stock consumed (recipe 0.5 KG)',
    kitchenAfter <= kitchenBefore - 0.5 + 0.01,
    `before=${kitchenBefore} after=${kitchenAfter}`
  );

  const logs = await request(
    'GET',
    '/restaurant/inventory/logs?type=RECIPE_CONSUMPTION&limit=10',
    null,
    rest,
    'WEB'
  );
  const logList = unwrap(logs.data);
  const logsArr = Array.isArray(logList) ? logList : [];
  assert(
    'RECIPE_CONSUMPTION ledger entry',
    logsArr.some((l) => l.type === 'RECIPE_CONSUMPTION'),
    `entries=${logsArr.length}`
  );

  const dupSettle = await request(
    'PATCH',
    `/restaurant/settle/${STATE.orderId}`,
    { paymentMethod: 'CASH' },
    rest,
    'WEB'
  );
  assert('Duplicate settle blocked', dupSettle.status === 400 || dupSettle.status === 409, dupSettle.data?.message);

  const daily = await request('GET', '/restaurant/reports/daily-sales', null, rest, 'WEB');
  assert('Daily sales report', daily.status === 200, daily.data?.message);

  const invReport = await request('GET', '/internal-supply/reports/movements', null, admin, 'WEB');
  assert('Admin internal movement report', invReport.status === 200, invReport.data?.message);
}

function printSummary() {
  log(`\n${'═'.repeat(60)}`, 'cyan');
  log('  INVENTORY PHASES 1–3 SUMMARY', 'bold');
  log('═'.repeat(60), 'cyan');
  log(`  PASS: ${PASS}`, 'green');
  log(`  FAIL: ${FAIL}`, FAIL > 0 ? 'red' : 'green');
  log('═'.repeat(60), 'cyan');
  if (FAIL > 0) process.exit(1);
}

async function main() {
  log('\n█ Golden Fisheries — Inventory Phases 1–3 E2E', 'cyan');
  log(`  ${BASE}\n`, 'yellow');
  try {
    await setup();
    await phase1();
    await phase2();
    await phase3();
  } catch (e) {
    log(`\nFATAL: ${e.message}`, 'red');
    console.error(e);
    process.exit(1);
  }
  printSummary();
}

main();
