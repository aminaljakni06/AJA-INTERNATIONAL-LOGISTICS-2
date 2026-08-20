# AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Content Shell & Action System
**Phase:** Enterprise UI System  
**Module:** Enterprise Drawer Content Shell & Action System  
**Version:** 1.0  

---

## 1. Executive Summary & Architecture Overview

The **Enterprise Drawer Content Shell, Header, Body, Footer & Action System** defines the standardized, composable presentation structure for all drawers, side panels, detail panels, filter panels, and inspector panels across the AJA INTERNATIONAL LOGISTICS platform.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ENTERPRISE DRAWER                             │
│                  (Supports Shorthand & Compound Syntax)                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      │                              │                              │
      ▼                              ▼                              ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│ DRAWER HEADER│              │DRAWER TOOLBAR│              │ DRAWER BODY  │
│ - Title      │              │ - Search     │              │ - Scrollable │
│ - Description│              │ - Filters    │              │ - Density    │
│ - Icon       │              │ - Context    │              │ - Loading    │
│ - Status     │              │   Controls   │              │ - Empty      │
│ - Close Btn  │              └──────────────┘              │ - Error      │
└──────────────┘                                            └──────┬───────┘
                                                                   │
                                                                   ▼
                                                            ┌──────────────┐
                                                            │DRAWER FOOTER │
                                                            │ - Priority:  │
                                                            │   Destructive│
                                                            │   Cancel     │
                                                            │   Secondary  │
                                                            │   Primary    │
                                                            └──────────────┘
```

---

## 2. Component Directory Index

| Component | Path | Description |
| :--- | :--- | :--- |
| **`DrawerHeader`** | `/src/components/drawer/DrawerHeader.tsx` | Standardized header with leading icon/avatar, bilingual title & description, status badge indicator, header actions, and accessible close button. |
| **`DrawerToolbar`** | `/src/components/drawer/DrawerToolbar.tsx` | Optional toolbar region for search, filter toggles, view switches, and secondary context controls. |
| **`DrawerBody`** | `/src/components/drawer/DrawerBody.tsx` | Scrollable body container with density controls (`comfortable`, `compact`, `spacious`), built-in loading spinner, error banner with retry, and empty state handlers. |
| **`DrawerFooter`** | `/src/components/drawer/DrawerFooter.tsx` | Action footer enforcing action priority (Destructive, Cancel, Secondary, Primary), button loading states, sticky positioning, and touch-optimized mobile buttons. |
| **`EnterpriseDrawer`** | `/src/components/drawer/EnterpriseDrawer.tsx` | Master drawer container integrating shorthand property mode or compound sub-component composition. |

---

## 3. Structural Composition Usage Examples

### 3.1 Compound Subcomponent Composition
```tsx
import {
  EnterpriseDrawer,
  DrawerHeader,
  DrawerToolbar,
  DrawerBody,
  DrawerFooter,
} from '@/components/drawer';

function CustomsDeclarationDrawer({ isOpen, onClose }) {
  return (
    <EnterpriseDrawer id="customs-drawer" isOpen={isOpen} onClose={onClose} size="lg">
      <DrawerHeader
        titleEn="Customs Clearance Inspection"
        titleAr="فحص التخليص الجمركي"
        descriptionEn="Review bill of lading document verification and compliance status"
        descriptionAr="مراجعة تدقيق بوليصة الشحن وحالة الامتثال"
        statusBadge={{ labelEn: 'Under Review', labelAr: 'قيد المراجعة', variant: 'pending' }}
        onClose={onClose}
      />
      
      <DrawerToolbar>
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-semibold text-text-muted">Document Category: Import Air Freight</span>
          <button className="text-xs text-brand-navy dark:text-brand-gold font-medium">Download Pack</button>
        </div>
      </DrawerToolbar>

      <DrawerBody density="comfortable">
        <div className="space-y-4">
          {/* Custom Form or Detailed Inspection Content */}
          <p className="text-sm text-text-primary">Customs Inspection Log Content...</p>
        </div>
      </DrawerBody>

      <DrawerFooter
        primaryAction={{
          id: 'approve',
          labelEn: 'Approve Clearance',
          labelAr: 'الموافقة على التخليص',
          onClick: () => console.log('Approved'),
        }}
        cancelAction={{
          id: 'cancel',
          labelEn: 'Cancel',
          labelAr: 'إلغاء',
          onClick: onClose,
        }}
      />
    </EnterpriseDrawer>
  );
}
```

---

## 4. Verification & Non-Regression

1. **Compilation Check**: Verified via `compile_applet` — build succeeded with zero errors.
2. **Accessibility**: All header controls, body scroll regions, and footer buttons follow WCAG contrast rules and keyboard focus trap standards.
3. **Bilingual RTL/LTR**: Tested and verified for English LTR and Arabic RTL rendering.
