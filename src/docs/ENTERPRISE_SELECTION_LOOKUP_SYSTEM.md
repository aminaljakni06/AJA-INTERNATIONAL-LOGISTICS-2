# AJA INTERNATIONAL LOGISTICS — Enterprise Selection, Lookup & Autocomplete System Documentation
**Phase:** Enterprise UI System  
**Module:** Enterprise Selection, Lookup & Autocomplete System  
**Version:** 1.0  

---

## 1. Executive Summary & Architecture Philosophy
The **Enterprise Selection, Lookup & Autocomplete System** establishes a unified selection experience across every business module in AJA INTERNATIONAL LOGISTICS.

Whether searching for **Customers, Warehouses, Carriers, Drivers, Shipments, Ports, Containers, Countries, or Currencies**, all form controls leverage a single async query engine with debouncing, caching, favorite pins, recent search memory, and entity preview inspection.

### Selection Architecture Overview
```
┌────────────────────────────────────────────────────────────────────────┐
│               ENTERPRISE SELECTION & LOOKUP COMPONENTS                 │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ EnterpriseAutocomplete │   │ EnterpriseEntityPicker               │  │
│  │ (Debounced Inline     │   │ (Chip badges + Browse button +       │  │
│  │  Suggestions)         │   │  Remove actions)                     │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ EnterpriseLookupDialog (Full Modal / Drawer Lookup with Filters, │  │
│  │ View Switcher, Pagination, Pinning, and Side Entity Preview)     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                        ENTERPRISE LOOKUP ENGINE                        │
│  - Debounced Async Query Engine (`useEnterpriseLookup`)                │
│  - In-Memory Query Caching (`SEARCH_CACHE`)                            │
│  - Favorites & Recents Local Persistence (`localStorage`)              │
│  - Entity Metadata Preview Generator (`getEntityPreview`)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components & Service Index

| Component / Service | File Path | Description |
| :--- | :--- | :--- |
| **`useEnterpriseLookup`** | `/src/hooks/useEnterpriseLookup.ts` | React hook managing debounced queries, loading state, pagination, and favorites. |
| **`EnterpriseLookupEngine`** | `/src/services/selection/lookupEngine.ts` | Unified async registry data engine with fuzzy search, filters, and caching. |
| **`EnterpriseAutocompleteInput`** | `/src/components/selection/EnterpriseAutocompleteInput.tsx` | Inline debounced text search with real-time popup suggestions and favorite pins. |
| **`EnterpriseLookupDialog`** | `/src/components/selection/EnterpriseLookupDialog.tsx` | Full-screen modal / drawer lookup with advanced filters, grid/list mode, and preview panel. |
| **`EnterpriseEntityPicker`** | `/src/components/selection/EnterpriseEntityPicker.tsx` | Form-field reference selector displaying chip badges and opening the lookup dialog. |

---

## 3. Supported Lookup Entity Types

1. **Customers & Companies:** `customer`, `company`
2. **Facilities & Warehouses:** `warehouse`, `branch`, `department`
3. **Personnel:** `user`, `employee`, `driver`, `role`
4. **Operations & Freight:** `shipment`, `quote`, `booking`, `container`
5. **Logistics Master:** `carrier`, `supplier`, `vendor`, `product`, `inventory_item`
6. **Locations & Ports:** `port`, `airport`, `country`, `city`, `route`, `vehicle`
7. **Currencies & Docs:** `currency`, `language`, `document`, `ai_template`

---

## 4. Usage Examples

### 4.1 Enterprise Autocomplete Input
```tsx
import { EnterpriseAutocompleteInput } from '../components/selection';

<EnterpriseAutocompleteInput
  fieldId="customer_id"
  lookupType="customer"
  labelEn="Customer Account"
  labelAr="حساب العميل"
  isAr={isArabic}
  onChange={(customerItem) => console.log('Selected customer:', customerItem)}
/>
```

### 4.2 Entity Reference Picker with Dialog
```tsx
import { EnterpriseEntityPicker } from '../components/selection';

<EnterpriseEntityPicker
  fieldId="carrier_reference"
  lookupType="carrier"
  labelEn="Assigned Logistics Carriers"
  labelAr="شركات الناقل المعتمدة"
  allowMultiple
  isAr={isArabic}
  onChange={(selectedCarriers) => setCarriers(selectedCarriers)}
/>
```

---

## 5. Caching, Performance & Accessibility Standards
- **Debounced Fetching:** Standard 200–250ms debouncing prevents redundant API requests while typing.
- **Query Deduplication & Caching:** Requests with identical filter parameters reuse `SEARCH_CACHE` results.
- **RTL & ARIA Compliance:** Inputs automatically adjust text direction for Arabic (`isAr={true}`) and emit proper `aria-invalid` and `aria-expanded` attributes.
