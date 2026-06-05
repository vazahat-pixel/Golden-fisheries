# Golden Fisheries ERP Design System

Production-grade UI primitives for compact, operator-focused screens.

## Import

```js
import { Button, DataTable, PageHeader, FormField, Input, StatCard } from '../design-system';
```

Admin panels may continue using `adminUi.jsx` (re-exports the same components).

## Tokens

Defined in `src/index.css` (`@theme`) and `src/styles/erp.css` (utility classes).

- **Spacing scale:** 4 / 8 / 12 / 16 / 24 px — use Tailwind `p-1` … `p-6` or `.erp-page` wrappers
- **Typography:** Inter only — `.erp-h1`, `.erp-h2`, `.erp-label`, `.erp-table-cell`
- **Radius:** `rounded-erp` (4px)
- **Colors:** `accent`, `text-muted`, `surface-muted`, `card-border`

## Components

| Component | Use for |
|-----------|---------|
| `PageHeader` | Screen title + actions |
| `DataTable` | All tabular data (sort, pagination, sticky header) |
| `Button` | Actions (`primary`, `secondary`, `accent`, `danger`, `success`) |
| `FormField` + `Input` | Forms |
| `StatCard` | Dashboard KPIs |
| `StatusBadge` | Row/status labels |
| `ShiftGate` | Fish Mall / Restaurant shift opening |
| `EmptyState` | Zero-data states |
| `ErrorBoundary` | Section crash recovery |
| `downloadCsv` | Table export |

## Migration checklist (per screen)

1. Replace custom tables with `<DataTable columns rows />`
2. Replace ad-hoc headers with `<PageHeader />`
3. Remove `rounded-3xl`, `font-serif`, extreme `tracking-widest`
4. Wrap page content in `className="erp-page"`
5. Use design-system `Button` variants instead of inline color classes
