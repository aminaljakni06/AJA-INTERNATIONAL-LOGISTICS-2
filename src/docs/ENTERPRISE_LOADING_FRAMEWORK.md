# AJA INTERNATIONAL LOGISTICS — Enterprise Loading Experience Framework Documentation
**Phase:** Enterprise Shared Infrastructure Foundation  
**Module:** Global Loading Experience Framework  
**Version:** 1.0  

---

## 1. Executive Summary & Architecture Philosophy
The **Enterprise Loading Experience Framework** provides a standardized, predictable, and high-performance loading infrastructure across the entire AJA International Logistics platform.

Every asynchronous operation follows a unified lifecycle:

`IDLE` ➔ `PREPARING` ➔ `LOADING` ➔ `REFRESHING` ➔ `PARTIAL` ➔ `COMPLETED` / `FAILED` ➔ `RETRYING`

### Key Principles
1. **Zero Cumulative Layout Shift (CLS):** Skeleton components precisely mimic target layouts to eliminate page jitter.
2. **Context-Aware Request Tracking:** Centralized state tracking for global, module, route, and component loading states.
3. **Responsive UI:** Non-blocking background operations (auto-sync, AI streaming, exports) keep the interface interactive.
4. **Bilingual Accessibility:** Native support for English and Arabic screen-reader labels with ARIA busy attributes (`aria-busy="true"`, `role="status"`).

---

## 2. Shared Types & Interfaces (`/src/types/loading.ts`)

```typescript
export type AsyncOperationStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'LOADING'
  | 'REFRESHING'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export type LoadingType =
  | 'PAGE' | 'ROUTE' | 'COMPONENT' | 'FORM' | 'TABLE' | 'SEARCH'
  | 'FILTER' | 'PAGINATION' | 'UPLOAD' | 'DOWNLOAD' | 'EXPORT'
  | 'IMPORT' | 'AI' | 'BACKGROUND' | 'SYNC' | 'REFRESH';
```

---

## 3. Global Loading Manager (`EnterpriseLoadingContext`)

Wrap the application or specific layout modules with `EnterpriseLoadingProvider`:

```tsx
import { EnterpriseLoadingProvider, useEnterpriseLoading } from './context/EnterpriseLoadingContext';

function ShipmentTableComponent() {
  const { startLoading, stopLoading, isKeyLoading } = useEnterpriseLoading();

  const handleFetchData = async () => {
    const reqId = startLoading('shipments_table', 'Transportation', 'TABLE', 'Fetching shipments...');
    try {
      await fetchShipments();
      stopLoading('shipments_table', 'COMPLETED');
    } catch (err) {
      stopLoading('shipments_table', 'FAILED');
    }
  };
}
```

---

## 4. Enterprise Skeleton Suite (`/src/components/common/EnterpriseSkeletons.tsx`)

| Skeleton Component | Targeted Layout Use Case |
| :--- | :--- |
| `DashboardSkeleton` | Executive dashboards, KPI grid + analytics charts + side drawer |
| `TableSkeleton` | `EnterpriseDataTable`, data grids, pagination headers |
| `FormSkeleton` | Complex multi-column inputs, textareas, action buttons |
| `CardSkeleton` | Grid cards, service cards, shipment summaries |
| `DetailsSkeleton` | Item drawer details, shipment tracking, party profiles |
| `TimelineSkeleton` | Audit logs, milestone timelines, lifecycle steppers |

---

## 5. Enterprise Spinners & Overlays (`/src/components/common/EnterpriseSpinners.tsx`)

- **`EnterpriseSpinner`**: Flexible size (`sm`, `md`, `lg`, `xl`) and theme color variants (`cyan`, `emerald`, `amber`, `rose`, `indigo`).
- **`ButtonLoadingSpinner`**: Compact spinner embedded directly inside buttons with disable locks.
- **`AILoadingIndicator`**: AI agent stage animation (`THINKING`, `PROCESSING`, `STREAMING`, `GENERATING`).
- **`FullScreenLoadingOverlay`**: Page transition backdrop with enterprise branding.
- **`SectionLoadingOverlay`**: Non-blocking blurred overlay for table refresh or partial section updates.

---

## 6. Performance Telemetry & Metrics (`/src/utils/loadingTracker.ts`)
The `requestTrackerService` collects telemetry metrics on execution duration, slow requests (>3s), and failure rates without blocking the main render thread.
