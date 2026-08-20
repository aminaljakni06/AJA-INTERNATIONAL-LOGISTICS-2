# AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Business Interaction Patterns
**Phase:** Enterprise UI System  
**Module:** Enterprise Drawer Business Interaction Patterns  
**Version:** 1.0  

---

## 1. Executive Summary & Purpose

**STEP 05.10.05** establishes the standardized, reusable business-oriented drawer interaction patterns built directly on top of the Enterprise Drawer Shell (`STEP 05.10.03`) and Interaction System (`STEP 05.10.04`).

These high-level drawer templates provide out-of-the-box presentation and behavioral contracts for all major enterprise workflows without embedding feature-specific business logic:

1. **`EnterpriseFormDrawer`**: Handles Create, Edit, and Update forms with built-in dirty-state protection via `DialogManagerService`, reset capabilities, and field error presentation.
2. **`EnterpriseDetailDrawer`**: Standardized entity detail inspector and read-only drawer with summary field grids, badge indicators, and action triggers (Edit, Delete, Share, Download).
3. **`EnterpriseFilterDrawer`**: Dedicated filter drawer maintaining draft vs. applied filter states with reset and active count badges.
4. **`EnterpriseLookupDrawer`**: Single or multi-select lookup drawer for selecting entities from large datasets with debounced search and selection confirmation.
5. **`EnterpriseWorkflowDrawer`**: Multi-step action drawer providing stepper headers, step validation rules, and next/prev/complete navigation handlers.

---

## 2. Component Index & File Map

| Component | Path | Functional Role |
| :--- | :--- | :--- |
| **`EnterpriseFormDrawer`** | `/src/components/drawer/EnterpriseFormDrawer.tsx` | Standardized Form Drawer pattern with dirty-state confirmation guards and reset controls. |
| **`EnterpriseDetailDrawer`** | `/src/components/drawer/EnterpriseDetailDrawer.tsx` | Standardized Entity Detail View & Inspector pattern with summary field matrix and permission guards. |
| **`EnterpriseFilterDrawer`** | `/src/components/drawer/EnterpriseFilterDrawer.tsx` | Standalone Filter Drawer pattern wrapping group filter fields and draft state. |
| **`EnterpriseLookupDrawer`** | `/src/components/drawer/EnterpriseLookupDrawer.tsx` | Single/Multi-select record lookup drawer with debounced search. |
| **`EnterpriseWorkflowDrawer`** | `/src/components/drawer/EnterpriseWorkflowDrawer.tsx` | Multi-step workflow drawer with step indicators and validation. |
| **`Business Drawer Types`** | `/src/types/drawerBusinessFramework.ts` | Complete TypeScript type contracts for all 5 business drawer patterns. |

---

## 3. Pattern Usage & Code Examples

### 3.1 Form Drawer Example (Create / Edit)
```tsx
import React, { useState } from 'react';
import { EnterpriseFormDrawer } from '@/components/drawer';

export function CreateCarrierDrawer({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', code: '', mode: 'AIR' });
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Call feature application service here...
    setIsSubmitting(false);
    onClose();
  };

  return (
    <EnterpriseFormDrawer
      id="create-carrier-drawer"
      isOpen={isOpen}
      onClose={onClose}
      mode="create"
      titleEn="Create Logistics Carrier"
      titleAr="إنشاء ناقل لوجستي"
      descriptionEn="Enter carrier registration, code, and primary transport modes"
      descriptionAr="أدخل بيانات تسجيل الناقل والرمز ووسائل النقل الرئيسية"
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold">Carrier Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setIsDirty(true);
            }}
            className="w-full border rounded p-2 text-sm"
          />
        </div>
      </div>
    </EnterpriseFormDrawer>
  );
}
```

### 3.2 Workflow Drawer Example (Multi-Step Action)
```tsx
import React from 'react';
import { EnterpriseWorkflowDrawer } from '@/components/drawer';

export function ShipmentApprovalWorkflow({ isOpen, onClose }) {
  return (
    <EnterpriseWorkflowDrawer
      id="shipment-approval-workflow"
      isOpen={isOpen}
      onClose={onClose}
      titleEn="Shipment Clearance Approval Workflow"
      titleAr="سير عمل الموافقة على التخليص"
      steps={[
        {
          id: 'step-1',
          titleEn: 'Document Audit',
          titleAr: 'تدقيق المستندات',
          content: <div>Audit Bill of Lading & Commercial Invoice</div>,
        },
        {
          id: 'step-2',
          titleEn: 'Customs Duty Fee',
          titleAr: 'رسوم الجمارك',
          content: <div>Confirm paid tariff calculation</div>,
        },
      ]}
      onComplete={async () => {
        console.log('Workflow Completed');
        onClose();
      }}
    />
  );
}
```

---

## 4. Verification & Non-Regression Results

- **Build Verification**: `compile_applet` passed successfully.
- **Dirty State Integration**: Unsaved form drawer closes trigger `DialogManagerService` confirmation dialogs to prevent accidental data loss.
- **Accessibility & RTL/LTR**: All controls, field labels, and step navigation render seamlessly in English LTR and Arabic RTL modes.
