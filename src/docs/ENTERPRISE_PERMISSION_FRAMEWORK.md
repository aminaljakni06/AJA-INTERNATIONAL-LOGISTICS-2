# AJA INTERNATIONAL LOGISTICS — Enterprise Permission Framework Documentation
**Phase:** Enterprise Shared Infrastructure Foundation  
**Module:** Enterprise Permission & Authorization Framework  
**Version:** 1.0  

---

## 1. Executive Summary & Authorization Philosophy
The **Enterprise Permission Framework** provides a centralized, hierarchical, and multi-tenant-aware Role-Based and Attribute-Based Access Control (RBAC/ABAC) engine for the AJA International Logistics platform.

### Core Architectural Principles
1. **Separation of Concerns:** Authentication answers *"Who is the user?"*, while Authorization answers *"What is the user allowed to do?"*.
2. **Never Trust the Client:** All UI permission logic is purely for user experience (hiding/disabling controls). Every sensitive operation is authoritatively validated server-side via API middleware.
3. **Hierarchical Inheritance:** Permissions flow downward through a structured hierarchy:
   $$\text{Platform} \rightarrow \text{Tenant} \rightarrow \text{Company} \rightarrow \text{Branch} \rightarrow \text{Department} \rightarrow \text{Role} \rightarrow \text{Module} \rightarrow \text{Resource} \rightarrow \text{Action}$$
4. **Bilingual Accessibility:** All permission-denied states, tooltips, and empty states support native English and Arabic strings.

---

## 2. Permission & Role Hierarchy

### 2.1 Role Hierarchy Numerical Weights
| Role Category | Roles | Weight Level |
| :--- | :--- | :--- |
| **System Admin** | `SYSTEM_ADMIN`, `PLATFORM_ADMIN`, `ERP_ADMIN` | 90 – 100 |
| **Executive C-Suite** | `CEO`, `COO`, `CFO`, `COMPANY_ADMIN` | 80 – 85 |
| **Department Managers**| `BRANCH_MANAGER`, `FINANCE_MANAGER`, `WAREHOUSE_MANAGER`, `FLEET_MANAGER`, `OPERATIONS_MANAGER` | 65 – 70 |
| **Operations Staff** | `DISPATCHER`, `FINANCE_OFFICER`, `TEAM_LEADER`, `EMPLOYEE`, `CUSTOMS_OFFICER` | 35 – 50 |
| **External Portals** | `CUSTOMER`, `AGENT`, `PARTNER` | 20 – 30 |
| **Read-Only / Guest** | `GUEST`, `READ_ONLY` | 5 – 10 |

---

## 3. Shared Helper Library (`/src/utils/permissionHelpers.ts`)

```typescript
import { hasPermission, canView, canEdit, canDelete, canApprove } from './utils/permissionHelpers';

// Check specific permission ID
if (hasPermission(user, 'shipping:shipment:create', { companyId: 'AJA_HQ' })) {
  // Execute creation logic
}

// Resource-level convenience helpers
if (canEdit(user, 'shipments')) {
  // Allow shipment edits
}
```

---

## 4. Feature Flag Evaluator (`/src/utils/featureFlags.ts`)

Centralized feature flag registry supporting status modes (`ENABLED`, `DISABLED`, `BETA`, `EXPERIMENTAL`, `TENANT_RESTRICTED`):

```typescript
import { isFeatureEnabled } from './utils/featureFlags';

if (isFeatureEnabled('ai_analytics', user)) {
  // Render AI Logistics Copilot
}
```

---

## 5. React Permission Context (`PermissionProvider`)

Wrap application modules with `PermissionProvider`:

```tsx
import { PermissionProvider, useEnterprisePermissions } from './context/PermissionContext';

function DashboardHeader() {
  const { hasPermission, canCreate, isFeatureEnabled } = useEnterprisePermissions();

  return (
    <div>
      {canCreate('shipments') && <CreateShipmentButton />}
      {isFeatureEnabled('ai_analytics') && <AIBadge />}
    </div>
  );
}
```

---

## 6. UI Permission Guards (`/src/components/common/EnterprisePermissionGuards.tsx`)

| Guard Component | Purpose | Key Props |
| :--- | :--- | :--- |
| **`PermissionGuard`** | Conditional rendering by permission ID | `permission`, `permissions`, `fallback` |
| **`RoleGuard`** | Conditional rendering by user role | `allowedRoles`, `minRole` |
| **`FeatureGuard`** | Conditional rendering by feature flag | `featureKey` |
| **`ProtectedButton`** | Auto-disables button with lock tooltip | `permission`, `mode="disable"|"hide"` |
| **`ProtectedFormSlot`**| Switches to read-only container when unpermitted | `editPermission` |
| **`ProtectedCard`** | Card wrapper showing lock indicator | `permission` |

---

## 7. Route Protection (`EnterpriseProtectedRoute`)

```tsx
<EnterpriseProtectedRoute
  requiredPermission="finance:general_ledger:view"
  requiredRole="FINANCE_MANAGER"
  isAr={false}
>
  <GeneralLedgerView />
</EnterpriseProtectedRoute>
```

---

## 8. Server API Authorization Middleware (`/src/server/middleware/enterpriseAuthMiddleware.ts`)

```typescript
import { requirePermission, requireEnterpriseRoles, requireFeatureFlag } from './middleware/enterpriseAuthMiddleware';

// Protect API endpoint
app.post('/api/shipments', requirePermission('shipping:shipment:create'), async (req, res) => {
  // Safe creation logic
});
```
