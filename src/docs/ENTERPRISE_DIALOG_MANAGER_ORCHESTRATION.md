# AJA INTERNATIONAL LOGISTICS — Enterprise Dialog Manager, Stacking & Global Orchestration
**Phase:** Enterprise UI System  
**Module:** Enterprise Dialog Manager & Global Dialog Orchestration  
**Version:** 1.0  

---

## 1. Architectural Philosophy & Layering

The **Enterprise Dialog Manager** provides a unified UI orchestration layer responsible for controlling the lifecycle, priority stacking, nesting, backdrop ownership, focus trapping, queueing, and result resolution of all dialogs across the AJA INTERNATIONAL LOGISTICS platform.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     APPLICATION PAGE / COMPONENT                       │
│      (Calls `openDialog()`, `openDialogPromise()`, `showConfirmation`) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE DIALOG MANAGER SERVICE                    │
│  - Stacking Engine (Max Depth Guard: 5)                                │
│  - Priority Order (System > Critical > High > Normal)                 │
│  - Dialog Queue (Non-coexisting popups)                                │
│  - Parent-Child Instance Tracking (`parentId`)                        │
│  - Dirty State Protection & Escape Handler                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   GLOBAL DIALOG REGISTRY & HOST                        │
│  - Maps `DialogType` to standard or custom components                  │
│  - Computed z-index mapping (`1000 + stackIndex * 20`)                 │
│  - Backdrop isolation and top-most focus trapping                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Architecture Index

| Component / Service / Type | Path | Description |
| :--- | :--- | :--- |
| **`DialogOrchestrationFramework` Types** | `/src/types/dialogOrchestrationFramework.ts` | TypeScript interfaces for `DialogInstance`, `DialogStack`, `DialogQueueItem`, `DialogRegistryEntry`, and `OpenDialogOptions`. |
| **`DialogRegistry`** | `/src/services/dialog/dialogRegistry.ts` | Centralized registry for standard dialog types (`confirmation`, `alert`, `form`, `entity`, `wizard`, `media`, `attachment`, `approval`, etc.). |
| **`DialogManagerService`** | `/src/services/dialog/dialogManager.ts` | Singleton orchestrator managing dialog stacking, queueing, promise resolution, audit logging, and tenant isolation. |
| **`useEnterpriseDialogManager`** | `/src/hooks/useEnterpriseDialogManager.ts` | Custom React hook providing open, close, replace, and query controls. |
| **`useDialogStack`** | `/src/hooks/useDialogStack.ts` | Custom React hook for stack inspection, top-most dialog detection, and depth tracking. |
| **`useDialogActions`** | `/src/hooks/useDialogActions.ts` | Concise action triggers (`confirm`, `open`, `openPromise`, `closeAll`). |
| **`EnterpriseDialogProvider`** | `/src/components/dialog/EnterpriseDialogProvider.tsx` | React Context Provider binding keyboard events, dirty state confirmation guards, and dialog host rendering. |
| **`EnterpriseDialogHost`** | `/src/components/dialog/EnterpriseDialogHost.tsx` | Host component rendering stacked dialog instances with dynamic z-indexes and component resolution. |

---

## 3. Core Capabilities & Architectural Guarantees

### 3.1 Stack Management & Max Depth Guard
- **Deterministic Stack Order**: Dialog instances are sorted into an explicit stack array (`stackOrder`). Top-most items always receive active user focus and backdrop ownership.
- **Max Depth Limit**: Configured with a default limit of `5` stacked dialogs to prevent infinite dialog recursion and memory degradation. Excess requests are queued or safely rejected.
- **Z-Index Isolation**: Dynamic z-indexes calculated using `1000 + (stackIndex * 20)` prevent z-index clashes across deeply nested dialogs.

### 3.2 Parent-Child Nesting
- Child dialogs record their `parentId`. When a parent dialog is closed or dismissed, all child dialog instances originating from that parent are automatically cleaned up to prevent orphaned overlays.

### 3.3 Priority Hierarchy & Queueing
- **Priorities**: `system` (4) > `critical` (3) > `high` (2) > `normal` (1).
- **Dialog Queue**: When non-coexisting dialogs (such as Session Expiration -> Security Confirmation -> Workflow Approval) are triggered in rapid succession, they enter an ordered priority queue (`DialogQueue`) and pop sequentially as earlier dialogs resolve.

### 3.4 Dirty State Protection
- When an open form or wizard dialog has unsaved edits (`isDirty: true`), press of the Escape key or close trigger opens a non-destructive confirmation dialog (`Discard Unsaved Changes?`) before dismissing the form.

### 3.5 Tenant Context Isolation
- `DialogManagerService.clearTenantDialogs(tenantId)` purges open dialogs belonging to a former tenant context whenever an organization or tenant context switch occurs.

---

## 4. Usage Examples

### 4.1 Promise-based Confirmation
```typescript
const confirmed = await DialogManagerService.showConfirmation({
  titleEn: 'Delete Customs Declaration',
  titleAr: 'حذف بيان جمركي',
  messageEn: 'Are you sure you want to permanently delete declaration #DEC-88219?',
  messageAr: 'هل أنت تأكد من حذف البيان الجمركي #DEC-88219 بشكل دائم؟',
  type: 'danger',
});

if (confirmed) {
  // Execute deletion...
}
```

### 4.2 Programmatic Result Resolution (`openDialogPromise`)
```typescript
const result = await DialogManagerService.openDialogPromise({
  type: 'form',
  titleEn: 'Create New Shipment',
  titleAr: 'إنشاء شحنة جديدة',
  props: {
    shipmentType: 'air_freight',
  },
});

if (result.status === 'completed') {
  console.log('Shipment Created:', result.data);
}
```

---

## 5. Verification & Non-Regression

Verified using `compile_applet`. The codebase builds with zero TypeScript errors or broken imports, maintaining full backward compatibility with existing platform dialog components.
