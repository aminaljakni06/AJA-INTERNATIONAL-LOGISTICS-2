# AJA INTERNATIONAL LOGISTICS — Enterprise Shared Hooks & Services Documentation
**Phase:** Enterprise Shared Infrastructure Foundation  
**Module:** Enterprise Shared Hooks & Services  
**Version:** 1.0  

---

## 1. Executive Summary & Architecture Philosophy
The **Enterprise Shared Hooks & Services** layer isolates UI presentation components from business orchestration and data access. 

### Layered Dependency Architecture
```
[ UI Presentation Components ]
             ↓
     [ Shared React Hooks ]
             ↓
[ Application Services & Cache ]
             ↓
      [ Base API Client ]
             ↓
[ Express Backend & Repositories ]
```

### Core Principles
1. **Presentation Separation:** Pages render UI components and consume hooks. No page directly issues raw `fetch` requests or handles raw data cache logic.
2. **Standardized State & Lifecycle:** `useEnterpriseDataQuery` and `useEnterpriseMutation` provide identical loading, refetching, caching, optimistic update, and error handling behaviors across all ERP modules.
3. **Pluggable Cache Engine:** `enterpriseCache` manages in-memory caching with TTL expiration, tag-based bulk invalidation, and LRU size limits.
4. **Bilingual Messages:** All service responses return normalized English (`error`) and Arabic (`errorAr`) messages.

---

## 2. Shared Services Architecture

### 2.1 Cache Abstraction Engine (`/src/services/enterpriseCache.ts`)
```typescript
import { enterpriseCache } from './services/enterpriseCache';

// Set cache entry with 5-minute TTL and tags
enterpriseCache.set('shipments_page_1', shipmentsData, { ttlMs: 300000, tags: ['shipments'] });

// Retrieve valid cached item
const data = enterpriseCache.get('shipments_page_1');

// Invalidate all shipment queries on mutation
enterpriseCache.invalidateTag('shipments');
```

### 2.2 Base API Service (`/src/services/baseService.ts`)
- Automatically attaches tenant headers (`X-Company-ID`, `X-Branch-ID`, `Accept-Language`, `X-Correlation-ID`).
- Performs in-flight request deduplication for concurrent identical GET requests.
- Transforms server HTTP errors into unified `ServiceResult<T>` shapes.

---

## 3. Domain Application Services

| Service Module | Responsibilities | Key Methods |
| :--- | :--- | :--- |
| **`enterpriseShipmentService`** | Shipment tracking, creation, quote management | `getShipments`, `getShipmentByTrackingNumber`, `createShipment`, `requestQuote` |
| **`enterpriseFinanceService`** | Chart of accounts, journal entries | `getChartOfAccounts`, `postJournalEntry` |
| **`enterpriseAIService`** | AI text generation, document summarization, customs risk AI | `generateText`, `summarizeDocument`, `analyzeCustomsRisk` |
| **`enterpriseFileService`** | File uploads, deletion, checksum handling | `uploadFile`, `deleteFile` |
| **`enterpriseNotificationService`** | Pub/Sub notification state engine | `dispatch`, `subscribe`, `markAsRead`, `clearAll` |
| **`enterpriseSearchService`** | Cross-module global search | `globalSearch` |

---

## 4. Shared React Hooks

### 4.1 Data Query Hook (`useEnterpriseDataQuery`)
```tsx
import { useEnterpriseDataQuery } from './hooks/useEnterpriseDataQuery';
import { enterpriseShipmentService } from './services/shipmentService';

function ShipmentList() {
  const { data, isLoading, isError, error, refetch } = useEnterpriseDataQuery({
    queryKey: 'shipments',
    queryFn: (context) => enterpriseShipmentService.getShipments({ page: 1 }, context),
    refetchIntervalMs: 30000, // 30 sec auto-polling
  });

  if (isLoading) return <EnterpriseSpinner />;
  if (isError) return <ErrorState message={error} />;

  return <ShipmentTable items={data.items} />;
}
```

### 4.2 Data Mutation Hook (`useEnterpriseMutation`)
```tsx
import { useEnterpriseMutation } from './hooks/useEnterpriseMutation';
import { enterpriseShipmentService } from './services/shipmentService';

function CreateShipmentModal() {
  const { mutate, isPending, isError } = useEnterpriseMutation({
    mutationFn: (newShipment, context) => enterpriseShipmentService.createShipment(newShipment, context),
    onSuccess: () => console.log('Shipment Created!'),
  });

  const handleSubmit = (formData) => {
    mutate(formData);
  };
}
```

### 4.3 Enterprise Table Hook (`useEnterpriseTable`)
```tsx
import { useEnterpriseTable } from './hooks/useEnterpriseTable';

function DataGrid({ rawShipments }) {
  const {
    data,
    tableState,
    setSearchQuery,
    handleSort,
    setPage,
    toggleSelectRow,
  } = useEnterpriseTable({
    initialData: rawShipments,
    pageSize: 15,
    searchFields: ['trackingNumber', 'origin', 'destination'],
  });

  return (
    <div>
      <input onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
      <table>
        <thead>
          <tr onClick={() => handleSort('trackingNumber')}>
            <th>Tracking #</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.trackingNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```
