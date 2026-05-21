# Golden Fisheries — Inventory Architecture (v3)

## Summary

Three **isolated** inventory domains. The **only automated cross-domain stock bridge** in production is:

**Fish Mall → Restaurant** via **Internal Supply Bill** (`InternalSupplyBill`).

Procurement inventory is **never** reduced when Restaurant or Fish Mall sell stock.

| Domain | Model | Scope constant |
|--------|--------|----------------|
| **Procurement** | `Product` + `InventoryTransaction` | `PROCUREMENT` |
| **Fish Mall** | `FishMallInventoryItem` + `FishMallInventoryLog` | `FISHMALL` |
| **Restaurant** | `RestaurantInventoryItem` + `RestaurantInventoryLog` | `RESTAURANT` |

---

## Business chain (client view)

```
Procurement Inventory  (warehouse / ERP — manual ops only)
        ↓  (no auto-sync — separate books)
Fish Mall Inventory    (retail counter + internal supplier)
        ↓  Internal Supply Bill (INT-####)
Restaurant Inventory   (kitchen / POS stock)
        ↓  POS settle
Restaurant Sales       (customer orders)
```

**Procurement → Fish Mall** is a future **admin transfer** (`StockTransfer` placeholder). It is not auto-linked today.

---

## Procurement flow (unchanged)

Harvest → Confirmation → Net Rate → Tapal → Driver → Buyer Billing.

Ledger types: `PROCUREMENT_IN`, `SALES_OUT`, `RETURN_IN`, `MANUAL_ADJUSTMENT`.

Blocked on central ledger: `RESTAURANT_CONSUMPTION`, `FISHMALL_SALE`.

API: `/api/v1/inventory/*`

---

## Fish Mall flow

- Retail POS → `fishMallInventoryService.deductForSale()` (`SALE_OUT`)
- **Internal bill to Restaurant** → `internalSupplyService.createFishMallToRestaurantBill()`
  - Fish Mall: `INTERNAL_TRANSFER_OUT` log, qty −
  - Restaurant: `INTERNAL_TRANSFER_IN` log, qty + (creates kitchen SKU by name if missing)
- Daily P&L includes `internalSupplyTotal` (internal revenue to restaurant)

APIs:

| Method | Path | Role |
|--------|------|------|
| POST | `/fishmall/internal-bill/restaurant` | Fish Mall Manager |
| GET | `/fishmall/internal-bill` | Fish Mall Manager |
| GET | `/fishmall/internal-bill/:id` | Fish Mall Manager |

---

## Restaurant flow

- POS settle → `restaurantInventoryService.deductForOrder()` (`SALE_OUT`)
- Incoming stock only via internal bills (or manual `ADJUSTMENT` / `OPENING`)
- View bills: `GET /restaurant/internal-supplies`

---

## Internal supply bill (data model)

**Collection:** `internalsupplybills`

| Field | Description |
|-------|-------------|
| `invoiceNumber` | Auto `INT-0001` |
| `fromScope` | `FISHMALL` |
| `toScope` | `RESTAURANT` |
| `lines[]` | `fishMallItemId`, `restaurantItemId`, `itemName`, `quantity`, `rate`, `amount` |
| `totalAmount` | Sum of lines |
| `createdBy` | User ref |

**Transaction safety:** MongoDB session + transaction in `internalSupply.service.js`; rollback on any line failure or negative Fish Mall stock.

---

## DB relationships (ER sketch)

```mermaid
erDiagram
  Product ||--o{ InventoryTransaction : procurement_ledger
  FishMallInventoryItem ||--o{ FishMallInventoryLog : fishmall_ledger
  RestaurantInventoryItem ||--o{ RestaurantInventoryLog : restaurant_ledger
  InternalSupplyBill ||--o{ FishMallInventoryLog : INTERNAL_TRANSFER_OUT
  InternalSupplyBill ||--o{ RestaurantInventoryLog : INTERNAL_TRANSFER_IN
  FishMallInventoryItem ||--o{ InternalSupplyBill : line_fishMallItemId
  RestaurantInventoryItem ||--o{ InternalSupplyBill : line_restaurantItemId
```

---

## Affected modules / files (v3)

### Backend (new)

- `modules/internal-supply/internalSupplyBill.model.js`
- `modules/internal-supply/internalSupply.service.js`
- `modules/internal-supply/internalSupply.controller.js`

### Backend (updated)

- `modules/fishmall/fishMallInventory.model.js` — log enums
- `modules/fishmall/fishMallInventory.service.js` — `transferOutForInternal`, P&L
- `modules/fishmall/fishmall.routes.js` — internal bill routes
- `modules/restaurant/restaurantInventory.model.js` — log enums
- `modules/restaurant/restaurantInventory.service.js` — `receiveInternalTransfer`
- `modules/restaurant/restaurant.routes.js` — internal supplies read routes

### Frontend (new)

- `panels/fishmall/FishMallInternalSupply.jsx`

### Frontend (updated)

- `services/fishmallService.js`, `services/restaurantService.js`
- `router/index.jsx` — nav + route
- `store/adminStore.js` — deprecated client-side cross-transfer

---

## Safe implementation sequence

1. Deploy schema + enums (backward compatible — new log types only).
2. Deploy internal supply API (no procurement changes).
3. Deploy Fish Mall UI “Bill Restaurant”.
4. Train ops: restaurant kitchen stock comes from internal bills, not procurement.
5. (Optional) Admin `StockTransfer` procurement → fish mall later.

---

## Edge cases

| Case | Behavior |
|------|----------|
| Fish Mall qty &lt; bill qty | 400 error, full transaction rollback |
| Restaurant SKU missing | Auto-create `RestaurantInventoryItem` on receive |
| Duplicate fish names | Match by uppercase `name` |
| Cancelled bill | `status: CANCELLED` reserved — not implemented in v3 (issue-only) |
| Negative restaurant stock on POS | Blocked on settle (unchanged) |

---

## Rollback plan

1. Hide Fish Mall nav route `/fishmall/internal-supply`.
2. Revert routes registering `internalSupplyController` (procurement/restaurant POS unchanged).
3. Data: `InternalSupplyBill` + logs remain for audit; no need to delete.
4. Re-enable old client transfers **not recommended** — use manual `adjust` on each inventory if emergency.

---

## Client one-liner

> “Procurement, Fish Mall shop, and Restaurant kitchen are three separate stock books. When the restaurant needs fish, Fish Mall issues an internal bill — Fish Mall stock goes down and restaurant kitchen stock goes up automatically. Procurement stock is never touched by restaurant sales.”
