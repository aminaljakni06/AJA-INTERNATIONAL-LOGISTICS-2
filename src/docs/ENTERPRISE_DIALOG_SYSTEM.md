# AJA INTERNATIONAL LOGISTICS — Enterprise Dialog System Foundation Documentation
**Phase:** Enterprise UI System  
**Module:** Enterprise Dialog System Foundation  
**Version:** 1.0  

---

## 1. Executive Summary & Philosophy

The **Enterprise Dialog System** serves as the single official modal, overlay, and popup infrastructure for every module across the AJA INTERNATIONAL LOGISTICS platform.

No business module may implement custom dialog or modal popups. All modal interactions—including operational form dialogs, clearance workflow wizards, confirmation alerts, image previewers, and AI decision overlays—must utilize this standardized framework.

### Architectural Blueprint
```
┌────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE DIALOG USER INTERFACES                    │
│                                                                        │
│  ┌────────────────────┐  ┌──────────────────────┐  ┌─────────────────┐ │
│  │ EnterpriseDialog   │  │ EnterpriseFormDialog │  │ WorkflowDialog  │ │
│  │ (Universal Shell)  │  │ (Dirty Detection)    │  │ (Wizard/Steps)  │ │
│  └────────────────────┘  └──────────────────────┘  └─────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ EnterpriseConfirmationDialog (Sensitive Actions, Keyword Locks)   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DIALOG MANAGER SERVICE                          │
│  - Programmatic Open/Close Stack Management                            │
│  - Unsaved Dirty State Guards                                          │
│  - Event Analytics Emission & Duration Tracker                         │
│  - Global Event Host Portal Mounting                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components & Service Index

| Component / Service | File Path | Description |
| :--- | :--- | :--- |
| **`DialogManagerService`** | `/src/services/dialog/dialogManager.ts` | Global programmatic dialog stack manager and analytics emitter. |
| **`useEnterpriseDialog`** | `/src/hooks/useEnterpriseDialog.ts` | React custom hook managing dialog state, dirty detection, and confirmations. |
| **`EnterpriseDialog`** | `/src/components/dialog/EnterpriseDialog.tsx` | Universal modal overlay container with header, sticky footer, and portal rendering. |
| **`EnterpriseConfirmationDialog`** | `/src/components/dialog/EnterpriseConfirmationDialog.tsx` | Specialized alert and decision modal with keyword confirmation locks. |
| **`EnterpriseFormDialog`** | `/src/components/dialog/EnterpriseFormDialog.tsx` | Form modal wrapper with unsaved draft checks and validation summaries. |
| **`EnterpriseWorkflowDialog`** | `/src/components/dialog/EnterpriseWorkflowDialog.tsx` | Step-by-step wizard dialog with progress bar and approval buttons. |
| **`EnterpriseDialogHost`** | `/src/components/dialog/EnterpriseDialogHost.tsx` | Global top-level portal mounting host for programmatic dialog calls. |

---

## 3. Supported Sizes & Functional Variants

### Sizes
- **`xs`** (320px): Compact alerts & quick confirmations.
- **`sm`** (440px): Standard confirmation prompts & single-field lookups.
- **`md`** (560px): Standard form dialogs & info cards.
- **`lg`** (720px): Multi-column operational forms & document summaries.
- **`xl`** (960px): Large workflow wizards & data comparison modals.
- **`fullWidth`** (1200px): Analytics dashboards & comprehensive inspect views.
- **`fullscreen`**: 100vw x 100vh overlay for media viewers and complex canvas operations.

### Variants
- `standard`, `confirmation`, `alert`, `info`, `warning`, `error`, `success`, `fullscreen`, `wizard`, `form`, `lookup`, `media`, `ai`, `workflow`

---

## 4. Accessibility & Localization Standards

- **Focus Trap & Focus Restoration:** Automatically traps keyboard focus inside active dialogs and restores focus to previous elements on close.
- **Keyboard Handling:** Standard `Escape` key listeners with dirty-state safety checks.
- **ARIA Roles:** Includes `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`.
- **RTL & Bilingual Support:** Seamless English/Arabic title, message, badge, and button rendering.

---

## 5. Usage Example

```tsx
import { useEnterpriseDialog } from '../hooks/useEnterpriseDialog';
import { EnterpriseFormDialog } from '../components/dialog';

export function ExampleModuleComponent() {
  const { isOpen, openDialog, closeDialog, isDirty, setDirty } = useEnterpriseDialog();

  return (
    <>
      <button onClick={openDialog}>Edit Shipment Details</button>

      <EnterpriseFormDialog
        isOpen={isOpen}
        onClose={closeDialog}
        titleEn="Update Shipment Declaration"
        titleAr="تحديث بيان الشحنة"
        isDirty={isDirty}
        onSubmit={async () => {
          // Submit logic
          closeDialog(true);
        }}
      >
        <input onChange={() => setDirty(true)} placeholder="Container Seal Number" />
      </EnterpriseFormDialog>
    </>
  );
}
```
