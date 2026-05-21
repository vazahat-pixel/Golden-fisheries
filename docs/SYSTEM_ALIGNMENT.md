# System Alignment & Database Integration (v1)

## Root cause analysis

| Symptom | Root cause |
|---------|------------|
| API success but DB unchanged | Frontend used **local Zustand** (persisted) instead of API; or wrong response path (`res.data._id` vs `res.data.order._id`) |
| Orders stay PENDING | `settleOrderAsync` never called settle — **wrong orderId** after create |
| Expense approve broken | UI called `approveExpenseAsync` — **not defined** on store |
| Harvest reject 404 | Frontend `PATCH /harvests/reject/:id` — **route missing** |
| Harvest status jumps | `patchStatus` allowed `CONVERTED_TO_TAPAL` without `convertToTapal` |
| Restaurant stock not moving | `deductForOrder` **silently skipped** unknown SKUs |
| Buyer sees admin data | Buyer routes allowed `WEB_ERP_ROLES`; assign driver used `fetchTapals()` (all tapals) |
| Password updates weak | `findByIdAndUpdate` skipped User `pre('save')` hash |

## Fixes applied (this pass)

### Persistence / CRUD
- `restaurantStore.settleOrderAsync` — correct `order._id`, fail if missing
- `fishMallStore.createSaleAsync` — correct `sale.saleNumber` path
- `PATCH /harvests/reject/:id` + controller
- Harvest `patchStatus` — block `CONVERTED_TO_TAPAL` / `COMPLETED`
- Restaurant `deductForOrder` — throw on missing stock line
- `ExpenseReviewPage` → `reviewExpenseAsync(id, 'APPROVED')`
- `adminStore.approveExpenseAsync` alias
- `FishMallStock` → `adjustInventory` / `createInventoryItem` API
- `FishMallExpenses` → `submitExpenseAsync` + `fetchExpensesAsync`
- `RestaurantInventory` → `createInventoryItem` / `adjustInventory` + `fetchMenu`
- `userService.updateUserSecure` — `save()` for password hashing

### RBAC / Buyer
- Buyer routes: **`BUYER` role only** (removed ERP roles from buyer panel)
- `BuyerLayout` nav — verification-focused; no ledger dead link; ops nav only for non-buyer roles
- `BuyerAssignDriver` — error message uses `err.message`

### Unchanged (by design)
- Three isolated inventories (procurement / fish mall / restaurant)
- Internal supply bill Fish Mall → Restaurant
- Procurement harvest → tapal → driver flow

## Broken API list (pre-fix → status)

| API | Issue | Status |
|-----|-------|--------|
| `PATCH /harvests/reject/:id` | Missing | **Fixed** |
| `POST /restaurant/create` + settle | Wrong client orderId | **Fixed** |
| Expense approve from admin UI | Wrong store method | **Fixed** |
| Fish mall stock inflow UI | Local only | **Fixed** |
| Fish mall expenses UI | Local only | **Fixed** |
| Restaurant menu CRUD UI | Local only | **Fixed** |
| `PATCH /tapals/assign-driver` | Buyer role blocked (web ERP only) | **By design** — hidden from buyer nav |

## Remaining gaps (follow-up)

| Item | Recommendation |
|------|----------------|
| `CreateTapalWizard` offline fallback | Remove `addTapal` mock on API failure; show error |
| `adminStore` driver trip actions | Wire to `tapalService` trip APIs |
| `FishMallClosing` | Wire to `recordClosing` API |
| `restaurant/tables` | Ephemeral — document or persist |
| `convertToTapal` | MongoDB transaction wrapper |
| `masterService.getById` | Normalize return shape |
| Buyer assign driver | Procurement/admin only; or new buyer-portal endpoint |

## Testing checklist

### Procurement
- [ ] Create harvest slip → appears in `GET /harvests/all`
- [ ] Reject harvest → status `REJECTED` in DB
- [ ] Confirm → convert to tapal → tapal record exists
- [ ] Cannot PATCH status to `CONVERTED_TO_TAPAL` directly

### Buyer
- [ ] Login as BUYER — nav shows Verify / Bills / Returns only
- [ ] Submit verification on delivered tapal → `buyerVerification` on tapal
- [ ] Create bill → `GET /buyer-portal/bills` lists it

### Restaurant
- [ ] POS settle → order `PAID` in DB
- [ ] Kitchen stock decreases for linked `inventoryItemId`
- [ ] Add menu item in inventory → `GET /restaurant/menu` shows it

### Fish Mall
- [ ] Stock inflow → `GET /fishmall/inventory` qty increased
- [ ] Expense submit → `GET /expenses?source=FISHMALL`
- [ ] Internal bill → fish mall ↓ restaurant ↑

### Admin
- [ ] Approve expense → status `APPROVED` in DB
- [ ] Procurement inventory unchanged after restaurant/fish mall sales

## End-to-end validation flow

```
Harvest (mobile) → CONFIRMED (web approve)
  → convert-to-tapal → assign driver (admin web)
  → driver trip → end trip → buyer verify (mobile)
  → buyer bill → admin billing (procurement stock)
Restaurant: menu from API → POS → settle → stock deduct
Fish Mall: inventory API → sale → stock deduct
Fish Mall → internal bill → restaurant stock +
```

## Affected files (this pass)

**Backend:** `harvest.routes.js`, `harvest.controller.js`, `harvest.validator.js`, `restaurantInventory.service.js`, `user.service.js`

**Frontend:** `restaurantStore.js`, `fishMallStore.js`, `adminStore.js`, `ExpenseReviewPage.jsx`, `FishMallStock.jsx`, `FishMallExpenses.jsx`, `RestaurantInventory.jsx`, `router/index.jsx`, `BuyerLayout.jsx`, `BuyerAssignDriver.jsx`, `BuyerSalesReturn.jsx`
