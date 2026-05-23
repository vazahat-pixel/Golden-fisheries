# RBAC Architecture (Admin ERP Unified)

## Panel structure

| Entry | URL | Who |
|-------|-----|-----|
| **Home** | `/auth/home` | Two buttons only: Admin Login + Driver Login |
| **Admin ERP** | `/auth/admin` | Super Admin, Procurement, Buyer, Vehicle Manager (RBAC) |
| **Restaurant** | `/restaurant/auth` | Rest Manager / Cashier |
| **Fish Mall** | `/fishmall/auth` | Fish Mall Manager / Cashier |
| **Mobile field** | `/auth/mobile` | Procurement (mobile), Driver, Vehicle Mgr |
| **Driver** | `/auth/driver` | Driver |

**Buyer no longer has a separate panel.** Legacy `/buyer/*` redirects to `/admin/buyer/*`.

## Permission model (database)

Stored on `User.permissions`:

```json
{
  "panels": { "admin": true, "restaurant": false, "fishmall": false, "driver": false },
  "modules": {
    "buyerVerify": { "read": true, "write": true, "delete": false },
    "procurement": { "read": false, "write": false, "delete": false }
  }
}
```

- **Sidebar** (`adminNavigation.js`): each item has `module` key; shown only if `modules[module].read === true` (or Super Admin).
- **Routes** (`ProtectedRoute` + `module` prop): same check.
- **Buyer route guard**: BUYER role cannot open `/admin/procurement`, `/admin/finance`, etc.

Templates: `ROLE_TEMPLATES` in `rbacStore.js` — merged when DB permissions are empty.

## Buyer modules (Admin ERP)

| Module | Screen |
|--------|--------|
| `buyerDashboard` | `/admin/buyer/dashboard` |
| `buyerVerify` | `/admin/buyer/tapals` |
| `buyerBills` | `/admin/buyer/invoices` |
| `buyerReturns` | `/admin/buyer/returns` |
| `buyerSettlement` | `/admin/buyer/reconciliation` |

APIs: `/api/v1/buyer-portal/*` (web + mobile client allowed for BUYER).

## Access Control page

`/admin/access` — Super Admin saves per-user `permissions` to MongoDB. After save, logged-in user session updates if editing self.

## E2E buyer login

1. Init → **Admin Web ERP** → `/auth/erp`
2. Phone `9000000003` / `e2e_test_123` (seed)
3. Lands on `/admin/buyer/dashboard` with buyer-only sidebar

To reset permissions: Access Control → select user → enable buyer modules → Save.
