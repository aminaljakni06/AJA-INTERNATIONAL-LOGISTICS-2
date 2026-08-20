# AJA INTERNATIONAL LOGISTICS — Enterprise Form, Entity & Multi-Step Wizard System
**Phase:** Enterprise UI System  
**Module:** Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System  
**Version:** 1.0  

---

## 1. Architectural Philosophy

The **Enterprise Form, Entity & Multi-Step Wizard Framework** establishes the single official modal, drawer, and multi-step workflow infrastructure across all AJA INTERNATIONAL LOGISTICS modules (CRM, Customs Clearance, Warehousing, Fleet Management, Finance, and HR).

All record management operations (Create, Edit, View, Details, Quick Inspect, Duplicate, Audit Trail) and multi-step wizards MUST consume this standardized framework to maintain interaction consistency, accessibility compliance, keyboard focus traps, and automatic draft recovery.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE ENTITY & WIZARD DIALOGS                   │
│                                                                        │
│  ┌───────────────────────────┐  ┌───────────────────────────────────┐  │
│  │ EnterpriseEntityDialog    │  │ EnterpriseWizardDialog            │  │
│  │ (Tabs, Navigation, Banner)│  │ (Progress Bar, Steps, Validation) │  │
│  └───────────────────────────┘  └───────────────────────────────────┘  │
│  ┌───────────────────────────┐  ┌───────────────────────────────────┐  │
│  │ EnterpriseFormDialog      │  │ EnterpriseQuickViewDialog         │  │
│  │ (Dirty Checks, Drafts)    │  │ (Fast Inspect, Slide-over)        │  │
│  └───────────────────────────┘  └───────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         ENTERPRISE DRAFT SERVICE                       │
│  - Local Storage & In-Memory Draft Persistence (`DraftService`)        │
│  - Auto-Save Interval & Draft Restore Triggers                         │
│  - Sequential Record Index Navigation (`EntityRecordNavigation`)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Component Index

| Component / Hook / Service | Path | Description |
| :--- | :--- | :--- |
| **`WizardStep` & `EntityMetadata`** | `/src/types/wizardFramework.ts` | Shared TypeScript contracts for step definitions, draft models, and entity headers. |
| **`DraftService`** | `/src/services/dialog/draftService.ts` | Form draft persistence engine handling localStorage auto-save, draft retrieval, and clearing. |
| **`useEnterpriseDraft`** | `/src/hooks/useEnterpriseDraft.ts` | React hook managing draft recovery, last saved timestamps, and draft restoration. |
| **`useEnterpriseWizard`** | `/src/hooks/useEnterpriseWizard.ts` | React hook handling wizard step navigation, jump permissions, step data, and completion state. |
| **`EnterpriseEntityDialog`** | `/src/components/dialog/EnterpriseEntityDialog.tsx` | Standardized entity modal featuring entity avatar, status badges, record navigation, and tab strips. |
| **`EnterpriseWizardDialog`** | `/src/components/dialog/EnterpriseWizardDialog.tsx` | Multi-step wizard dialog with progress indicator, breadcrumbs, step-by-step validation, and draft restoration. |
| **`EnterpriseQuickViewDialog`** | `/src/components/dialog/EnterpriseQuickViewDialog.tsx` | Slide-over/inspect modal for fast record preview without losing page context. |

---

## 3. Supported Modes & Navigation

### Entity Dialog Modes
- **`CREATE`**: Form wrapper for creating new business records with unsaved draft detection.
- **`EDIT`**: Form wrapper for updating existing records with dirty checks.
- **`VIEW` / `DETAILS`**: Read-only entity inspector with action buttons (Print, Duplicate, Edit).
- **`QUICK_VIEW` / `PREVIEW`**: Lightweight inspection overlay.
- **`CLONE` / `DUPLICATE`**: Pre-filled record duplication workflow.
- **`AUDIT` / `HISTORY`**: Version comparison and audit trail tab views.

### Sequential Record Navigation
Users can step through datasets without closing the dialog:
```tsx
const navigation = {
  currentRecordIndex: 2,
  totalRecords: 15,
  hasNextRecord: true,
  hasPreviousRecord: true,
  onNavigateNext: () => fetchRecord(3),
  onNavigatePrevious: () => fetchRecord(1),
};
```

---

## 4. Multi-Step Wizard Workflow

The `EnterpriseWizardDialog` supports both **linear** (step 1 → 2 → 3) and **non-linear / jump** modes.

### Usage Example
```tsx
import { EnterpriseWizardDialog } from '../components/dialog';

const wizardSteps = [
  {
    id: 'step_1',
    titleEn: 'Shipment Basics',
    titleAr: 'أساسيات الشحنة',
    component: Step1Form,
  },
  {
    id: 'step_2',
    titleEn: 'Customs Declaration',
    titleAr: 'البيان الجمركي',
    component: Step2Form,
  },
  {
    id: 'step_3',
    titleEn: 'Review & Finalize',
    titleAr: 'المراجعة والاعتماد',
    component: Step3Review,
  },
];

export function CreateShipmentWizard() {
  return (
    <EnterpriseWizardDialog
      isOpen={true}
      onClose={() => {}}
      titleEn="Create International Shipment"
      titleAr="إنشاء شحنة دولية جديدة"
      steps={wizardSteps}
      initialData={{ containerNumber: '', originPort: '' }}
      onSubmit={async (data) => {
        // Submit logic
      }}
    />
  );
}
```

---

## 5. Verification & Compilation Status

Verified via `compile_applet`. The codebase compiled successfully with zero syntax, type, or lint errors.
