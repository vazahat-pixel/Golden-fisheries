# Golden Fisheries — Inventory Architecture (v2)

## Summary

Three **isolated** inventory domains. No automatic sync between them.

| Domain | Collection / Model | Used by |
|--------|-------------------|---------|
| **Procurement** | `Product` + `InventoryTransaction` (`inventoryScope: PROCUREMENT`) | Admin ERP, buyer billing, procurement invoices |
| **Restaurant** | `RestaurantInventoryItem` + `RestaurantInventoryLog` | Restaurant POS, kitchen stock |
| **Fish Mall** | `FishMallInventoryItem` + `FishMallInventoryLog` + `FishMallDailyClosing` | Fish Mall retail billing, rates, closing |

**Future (not enabled):** `StockTransfer` — Admin → Restaurant / Fish Mall manual transfers.

---

## Procurement flow (unchanged)

Harvest → Net Rate → Tapal → Driver → Buyer Bill → optional Admin billing.

Stock changes via:

- `PROCUREMENT_IN` — admin billing (procurement invoice)
- `SALES_OUT` — buyer bill
- `RETURN_IN` — approved sales return
- `MANUAL_ADJUSTMENT` — admin inventory adjust

**Removed from procurement ledger:**

- `RESTAURANT_CONSUMPTION` (blocked on `adjustStock`)
- `FISHMALL_SALE` (blocked on `adjustStock`)

---

## Restaurant flow

- Menu & kitchen stock = `RestaurantInventoryItem` (`item`, `quantity`, `date`, `rate`, `category`).
- POS settle → `restaurantInventoryService.deductForOrder()` only.
- Cash / UPI / SPLIT payment unchanged on `RestaurantOrder`.
- APIs: `/api/v1/restaurant/inventory`, `/restaurant/menu` (reads restaurant inventory).

---

## Fish Mall flow

- Retail stock = `FishMallInventoryItem` (`openingStock`, `quantity`, `rate`).
- POS sale → `fishMallInventoryService.deductForSale()` only.
- Daily P&L: `/fishmall/inventory/daily-pnl`, closing: `/fishmall/inventory/closing`.
- Rates updated via `PATCH /fishmall/inventory/:id` (not central `Product`).

---

## Affected backend files

| File | Change |
|------|--------|
| `constants/inventoryScopes.js` | New |
| `modules/restaurant/restaurantInventory.model.js` | New |
| `modules/restaurant/restaurantInventory.service.js` | New |
| `modules/fishmall/fishMallInventory.model.js` | New |
| `modules/fishmall/fishMallInventory.service.js` | New |
| `modules/stock-transfer/stockTransfer.model.js` | New (placeholder) |
| `modules/restaurant/restaurant.service.js` | No central inventory on settle |
| `modules/fishmall/fishmall.service.js` | No central inventory on sale |
| `modules/inventory/inventory.service.js` | Procurement-only tx types |
| `modules/inventory/inventoryTransaction.model.js` | `inventoryScope` field |
| `modules/restaurant/restaurant.controller.js` | Menu from restaurant inventory |
| `modules/restaurant/restaurant.routes.js` | Inventory routes |
| `modules/fishmall/fishmall.routes.js` | Inventory routes |
| `modules/reports/reports.service.js` | `inventoryScope: PROCUREMENT` on summary |

## Affected frontend files

| File | Change |
|------|--------|
| `services/restaurantService.js` | Restaurant inventory APIs |
| `services/fishmallService.js` | Fish Mall inventory APIs |
| `store/fishMallStore.js` | Stock from `/fishmall/inventory` |
| `panels/fishmall/FishMallBilling.jsx` | `inventoryItemId` on sale |
| `panels/restaurant/RestaurantPOS.jsx` | `inventoryItemId` on order |
| `panels/admin/inventory/InventoryOverview.jsx` | Labelled procurement-only |
| `services/socketService.js` | Socket sync procurement scope only |

---

## Safe implementation sequence (completed)

1. Add models + constants (no breaking changes).
2. Add restaurant/fishmall inventory services + routes.
3. Switch restaurant settle + fishmall sale to isolated deduction.
4. Block deprecated tx types on procurement `adjustStock`.
5. Point menu/stock UIs to new APIs.
6. Update labels and socket scope.

---

## Migration notes

- Existing `InventoryTransaction` rows with `RESTAURANT_CONSUMPTION` / `FISHMALL_SALE` remain in DB for audit; new rows use scope `PROCUREMENT` only.
- Seed **restaurant** items: `POST /restaurant/menu` or manager UI.
- Seed **fish mall** items: `POST /fishmall/inventory` with `openingStock` + `rate`.
- Procurement `Product` records are independent; do not use `category: RESTAURANT` on Product for menu anymore.

---

## Client explanation (one line)

> “Procurement warehouse stock, restaurant kitchen stock, and Fish Mall shop stock are three separate books — sales in one never reduce another unless we later add an explicit transfer from admin.”
