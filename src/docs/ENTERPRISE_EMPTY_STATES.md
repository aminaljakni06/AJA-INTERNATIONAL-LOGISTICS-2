# AJA INTERNATIONAL LOGISTICS — Enterprise Empty States System Documentation
**Phase:** Enterprise Shared Infrastructure Foundation  
**Module:** Global Empty, Zero & Placeholder States Framework  
**Version:** 1.0  

---

## 1. Executive Summary & Architecture Philosophy
The **Enterprise Empty States System** standardizes every empty, initial, unavailable, zero-data, and permission-restricted experience across the AJA International Logistics platform.

A core principle of enterprise UX is that **the user must never see a blank or ambiguous container**. Every empty experience must clearly explain:
1. **Context:** Why no content is displayed.
2. **State Meaning:** What the current condition implies (e.g., initial creation vs. filter restriction vs. security restriction).
3. **Actionable Recovery:** Clear Call-to-Action (CTA) options to create data, reset filters, reconnect, or request permissions.

---

## 2. Shared Types & Interfaces (`/src/types/emptyStates.ts`)

```typescript
export type EmptyStateType =
  | 'INITIAL' | 'NO_DATA' | 'NO_RESULTS' | 'NO_SEARCH_MATCHES'
  | 'NO_FILTERS_MATCH' | 'NO_NOTIFICATIONS' | 'NO_MESSAGES' | 'NO_DOCUMENTS'
  | 'NO_SHIPMENTS' | 'NO_QUOTES' | 'NO_CUSTOMERS' | 'NO_WAREHOUSES'
  | 'NO_INVENTORY' | 'NO_REPORTS' | 'NO_ANALYTICS' | 'NO_CALENDAR_EVENTS'
  | 'NO_TASKS' | 'NO_ACTIVITY' | 'NO_AI_HISTORY' | 'NO_INTEGRATIONS'
  | 'ZERO_STATE' | 'PERMISSION_RESTRICTED' | 'OFFLINE' | 'ARCHIVE';

export interface EmptyStateCTA {
  labelEn: string;
  labelAr: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ElementType;
  disabled?: boolean;
  loading?: boolean;
}
```

---

## 3. Core Component Suite (`/src/components/common/EnterpriseEmptyStates.tsx`)

### 3.1 Master Component (`EnterpriseEmptyState`)
The master container providing styled glows, localized text, icon or illustration rendering, and action buttons:

```tsx
import { EnterpriseEmptyState } from './components/common/EnterpriseEmptyStates';
import { Package } from 'lucide-react';

<EnterpriseEmptyState
  type="NO_SHIPMENTS"
  titleEn="No Shipments Registered"
  titleAr="لا توجد شحنات مسجلة"
  descriptionEn="There are currently no active ocean or air freight shipments."
  descriptionAr="لا توجد شحنات بحرية أو جوية نشطة حالياً."
  icon={Package}
  contextBadgeEn="Transportation Logistics"
  contextBadgeAr="لوجستيات النقل"
  primaryAction={{
    labelEn: "Create Shipment",
    labelAr: "إنشاء شحنة جديدة",
    onClick: () => handleCreate(),
    variant: "primary"
  }}
  isAr={false}
/>
```

---

### 3.2 Specialized Preset Components

| Component | Category / Purpose | Key Props |
| :--- | :--- | :--- |
| **`ZeroState`** | First-time record creation onboarding | `entityNameEn`, `entityNameAr`, `onCreate` |
| **`SearchEmptyState`** | Unmatched search query | `searchQuery`, `onClearSearch` |
| **`FilterEmptyState`** | Restrictive filter combinations | `onResetFilters` |
| **`PermissionEmptyState`** | RBAC permission restriction | `moduleNameEn`, `moduleNameAr`, `onRequestAccess` |
| **`OfflineEmptyState`** | Network disconnected | `onRetryConnection` |
| **`AIEmptyState`** | No AI history or standby mode | `onGenerateAI` |
| **`IntegrationEmptyState`** | Unconnected third-party provider | `providerNameEn`, `providerNameAr`, `onConnect` |

---

## 4. Accessibility & Localization Guidelines
- **RTL Support:** Full support for Arabic right-to-left layout via `dir={isAr ? 'rtl' : 'ltr'}`.
- **Accessibility:** Containers render with `role="status"` and `aria-label` attributes.
- **Zero Hardcoded Strings:** All text inputs mandate bilingual properties (`labelEn`/`labelAr`, `titleEn`/`titleAr`).
- **Theme Support:** Fully dark/light responsive using Tailwind color classes and backdrop-blur gradients.
