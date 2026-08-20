# AJA INTERNATIONAL LOGISTICS — Enterprise Data Fetching & Cache Layer Documentation
**Phase:** Enterprise Shared Infrastructure Foundation  
**Module:** Enterprise Data Fetching & Cache Layer  
**Version:** 1.0  

---

## 1. Executive Summary & Philosophy
The **Enterprise Data Fetching & Cache Layer** provides a single, unified client-side gateway (`enterpriseDataGateway`) for all communication with Express backend endpoints, repositories, AI services, and external integrations.

### Architecture Overview
```
[ React Pages & Components ]
             ↓
 [ Shared Hooks (e.g. useEnterpriseQuery) ]
             ↓
[ Enterprise Central Data Gateway ]
             ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA GATEWAY                           │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ Cache Policy Engine   │   │ Offline Queue Engine      │  │
│  │ (Memory / Local / TTL)│   │ (Sync on Reconnect)       │  │
│  └───────────────────────┘   └───────────────────────────┘  │
│  ┌───────────────────────┐   ┌───────────────────────────┐  │
│  │ Standard API Client   │   │ Metrics Tracker           │  │
│  │ (Dedupe/Retry/Headers)│   │ (Latency/Hits/Failures)   │  │
│  └───────────────────────┘   └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
             ↓
    [ Express Backend APIs ]
```

---

## 2. Core Components & Responsibilities

| Sub-System | File Location | Responsibilities |
| :--- | :--- | :--- |
| **`enterpriseDataGateway`** | `/src/services/dataFetching/enterpriseDataGateway.ts` | Central execution engine for queries, mutations, search, and integration calls. |
| **`enterpriseApiClient`** | `/src/services/dataFetching/enterpriseApiClient.ts` | HTTP client with automatic `X-Request-ID`, `X-Correlation-ID`, tenant headers, backoff retries, and deduplication. |
| **`cachePolicyEngine`** | `/src/services/dataFetching/cachePolicyEngine.ts` | Handles 6 cache policies (`cache-first`, `stale-while-revalidate`, `network-first`, etc.), tag/module/tenant invalidation, and offline storage persistence. |
| **`offlineQueueEngine`** | `/src/services/dataFetching/offlineQueueEngine.ts` | Queues mutations offline, detects network reconnection, and auto-flushes pending requests with backoff retry logic. |
| **`enterpriseMetricsTracker`** | `/src/services/dataFetching/metricsTracker.ts` | Real-time performance tracking: average latency, cache hit/miss ratio, retry count, failure rates, and slow query logs (>1000ms). |

---

## 3. Supported Cache Policies

| Policy | Behavior | Best Used For |
| :--- | :--- | :--- |
| **`cache-first`** (Default) | Check cache first. Return cache if valid; fetch network on miss or expiration. | Static master data, location codes, settings. |
| **`stale-while-revalidate`** | Return cached data immediately (even if stale), revalidate network in background, update cache silently. | Dashboards, shipment lists, analytics widgets. |
| **`network-first`** | Always fetch network first. On network error/offline, fallback to cached data. | Live tracking, financial ledgers, active quotes. |
| **`network-only`** | Always fetch network. Bypass cache entirely and do not store response. | Sensitive payments, authentication, token refresh. |
| **`cache-only`** | Read strictly from cache. Fail if missing or expired. | Offline read modes, local drafts. |
| **`no-cache`** | Bypass cache reads and writes. | Mutation triggers, file uploads. |

---

## 4. Usage Examples

### 4.1 Executing a Gateway Query in React
```tsx
import { useEnterpriseQuery } from '../hooks/useEnterpriseQuery';

function DashboardShipments() {
  const { data, isLoading, isError, refetch } = useEnterpriseQuery({
    queryKey: 'dashboard_shipments',
    endpoint: '/api/shipments?limit=10',
    cachePolicy: 'stale-while-revalidate',
    ttlMs: 2 * 60 * 1000, // 2 minutes
    tags: ['shipments'],
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching shipments</div>;

  return <ShipmentList items={data?.items || []} onRefresh={refetch} />;
}
```

### 4.2 Executing a Gateway Mutation with Tag Invalidation
```tsx
import { useEnterpriseMutationGateway } from '../hooks/useEnterpriseMutationGateway';

function CreateShipmentForm() {
  const { mutate, isPending } = useEnterpriseMutationGateway({
    mutationKey: 'create_shipment',
    endpoint: '/api/shipments',
    method: 'POST',
    invalidatesTags: ['shipments', 'dashboard'],
    supportsOfflineQueue: true, // Queue if offline!
  });

  const handleSubmit = (formData) => {
    mutate(formData, { context: { companyId: 'COMP_01' } });
  };
}
```

### 4.3 Tracking Performance Metrics
```tsx
import { useEnterprisePerformanceMetrics } from '../hooks/useEnterprisePerformanceMetrics';

function SystemHealthWidget() {
  const { metrics, logs } = useEnterprisePerformanceMetrics();

  return (
    <div>
      <p>Requests: {metrics.totalRequests}</p>
      <p>Cache Hit Ratio: {Math.round((metrics.cacheHits / Math.max(1, metrics.totalRequests)) * 100)}%</p>
      <p>Average Latency: {metrics.averageLatencyMs} ms</p>
    </div>
  );
}
```

---

## 5. Security & Isolation
- **Tenant Isolation:** All API requests inject `X-Company-ID` and `X-Branch-ID` headers based on request context. Cache invalidation can clear memory specifically by tenant ID.
- **Sensitive Data:** Confidential tokens or auth keys are never cached in unencrypted `localStorage`.
