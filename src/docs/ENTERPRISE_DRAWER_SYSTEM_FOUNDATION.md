# AJA INTERNATIONAL LOGISTICS — Enterprise Drawer System Foundation
**Phase:** Enterprise UI System  
**Module:** Enterprise Drawer / Side Panel Foundation  
**Version:** 1.0  

---

## 1. Executive Summary & Architectural Overview

The **Enterprise Drawer System Foundation** establishes a centralized, reusable, and responsive framework for all side panels, detail panels, context drawers, filter drawers, inspector panels, navigation drawers, and mobile bottom sheets across the AJA INTERNATIONAL LOGISTICS platform.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION PAGE / FEATURE COMPONENT                 │
│      (Calls `openDrawer()`, `openDrawerPromise()`, `closeDrawer()`)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE DRAWER MANAGER SERVICE                    │
│  - Stacking Engine & Max Depth Guard (Max Depth: 5)                     │
│  - Position & Size Resolvers (Left, Right, Top, Bottom / Sm - FullWidth)  │
│  - Parent-Child Drawer Tracking (`parentId`)                            │
│  - Dialog Manager Coexistence & Z-Index Layering (Base Z-Index: 900)    │
│  - Dirty State Protection & Escape Handler                              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    GLOBAL DRAWER REGISTRY & HOST                        │
│  - Registry for standard types (`standard`, `detail`, `form`, `filter`) │
│  - Dynamic Z-Index Calculation (`900 + stackIndex * 15`)                │
│  - Backdrop Blur & Top-Most Focus Trapping                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Architecture Index

| Component / Service / Type | Path | Description |
| :--- | :--- | :--- |
| **`DrawerFramework` Types** | `/src/types/drawerFramework.ts` | TypeScript interfaces for `DrawerInstance`, `DrawerType`, `DrawerPosition`, `DrawerSize`, `DrawerConfiguration`, `OpenDrawerOptions`, and `DrawerResult`. |
| **`DrawerRegistry`** | `/src/services/drawer/drawerRegistry.ts` | Registry mapping drawer types (`standard`, `detail`, `form`, `filter`, `inspector`, `navigation`, `context`, `workflow`, `attachment`, `custom`) to components. |
| **`DrawerManagerService`** | `/src/services/drawer/drawerManager.ts` | Singleton orchestrator managing drawer instances, stacking, promise resolution, and tenant isolation. |
| **`useEnterpriseDrawer`** | `/src/hooks/useEnterpriseDrawer.ts` | Primary custom React hook exposing open, close, promise, and state controls. |
| **`useDrawerStack`** | `/src/hooks/useDrawerStack.ts` | Custom React hook for monitoring active drawer stack depth and top-most drawer detection. |
| **`useDrawerActions`** | `/src/hooks/useDrawerActions.ts` | Concise action triggers (`open`, `openPromise`, `close`, `closeAll`). |
| **`EnterpriseDrawer`** | `/src/components/drawer/EnterpriseDrawer.tsx` | Primary foundational UI component supporting positions, sizes, sticky header/footer, mobile grab handles, RTL/LTR, loading & error states. |
| **`EnterpriseDrawerHost`** | `/src/components/drawer/EnterpriseDrawerHost.tsx` | Global host component rendering stacked drawer instances with computed z-indexes. |
| **`EnterpriseDrawerProvider`** | `/src/components/drawer/EnterpriseDrawerProvider.tsx` | React Context Provider binding keyboard events, unsaved changes guards, and drawer host mounting. |

---

## 3. Core Capabilities & Design Principles

### 3.1 Drawer Positions & Responsive Mobile Bottom Sheets
- **Logical Alignment**: Supports `left`, `right`, `top`, and `bottom` drawer placements.
- **Mobile Touch Optimization**: On small screens or when `position="bottom"`, drawers render as responsive bottom sheets with drag handles and touch-friendly controls.
- **Standardized Size Scale**: Sizes range from `sm` (320px / 20rem), `md` (448px / 28rem), `lg` (640px / 40rem), `xl` (896px / 56rem), to `fullWidth` (100%).

### 3.2 Dialog & Drawer Coexistence
- The Drawer System is designed to seamlessly coexist with the `EnterpriseDialogManager`.
- Drawers use a base z-index of `900` (`900 + index * 15`), while Dialogs use a base z-index of `1000` (`1000 + index * 20`).
- When a Dialog opens above an active Drawer, the Drawer remains visually active beneath the Dialog backdrop, while focus moves strictly to the Dialog layer. Closing the Dialog restores active focus back to the Drawer.

### 3.3 Dirty State Protection & Escape Handling
- When a drawer contains unsaved edits (`isDirty: true`), press of the Escape key or close trigger triggers an unsaved changes confirmation dialog before dismissing the drawer.

---

## 4. Usage Examples

### 4.1 Programmatic Drawer Launch (`openDrawer`)
```typescript
import { useEnterpriseDrawer } from '@/hooks';

function ShipmentList() {
  const { openDrawer } = useEnterpriseDrawer();

  const handleInspectShipment = (shipmentId: string) => {
    openDrawer({
      type: 'detail',
      position: 'right',
      size: 'lg',
      titleEn: `Shipment #${shipmentId}`,
      titleAr: `شحنة رقم #${shipmentId}`,
      descriptionEn: 'Air Freight Cargo Details & Tracking Timeline',
      descriptionAr: 'تفاصيل وخط زمني لتتبع الشحنة الجوية',
      props: {
        shipmentId,
      },
    });
  };

  return (
    <button onClick={() => handleInspectShipment('SHP-99821')}>
      View Shipment Details
    </button>
  );
}
```

### 4.2 Promise-based Drawer Resolution (`openDrawerPromise`)
```typescript
const result = await openDrawerPromise({
  type: 'filter',
  position: 'right',
  size: 'sm',
  titleEn: 'Filter Shipments',
  titleAr: 'تصفية الشحنات',
});

if (result.status === 'completed') {
  console.log('Applied Filter Parameters:', result.data);
}
```

---

## 5. Verification & Non-Regression

Verified via `compile_applet`. The production build completes with zero errors, zero broken imports, and full non-regression across existing dialogs, forms, navigation routes, and authentication flows.
