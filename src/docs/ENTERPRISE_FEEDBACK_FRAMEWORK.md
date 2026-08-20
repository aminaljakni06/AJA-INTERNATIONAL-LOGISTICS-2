# AJA INTERNATIONAL LOGISTICS — Enterprise User Feedback Framework Documentation
**Phase:** Enterprise Shared Infrastructure Foundation  
**Module:** Enterprise User Feedback Framework  
**Version:** 1.0  

---

## 1. Executive Summary & Core Philosophy
The **Enterprise User Feedback Framework** serves as the single source of truth for all user-facing feedback mechanisms across the AJA INTERNATIONAL LOGISTICS platform. It standardizes toasts, inline/sticky alerts, confirmation modals, progress feedback, AI stream state indicators, integration status updates, and notification center contracts.

### Feedback Architecture Flow
```
[ User Interaction / API / Workflow Event ]
                     ↓
[ Enterprise Feedback Hooks (e.g. useEnterpriseToast) ]
                     ↓
[ Enterprise Feedback Services ]
  ├─ enterpriseToastService
  ├─ enterpriseAlertService
  ├─ enterpriseConfirmationService
  ├─ enterpriseAIFeedbackService
  ├─ enterpriseIntegrationFeedbackService
  └─ enterpriseNotificationCenterService
                     ↓
[ EnterpriseFeedbackProvider (React Container) ]
  ├─ EnterpriseToastContainer
  ├─ EnterpriseAlertBanner
  └─ EnterpriseConfirmationModal
```

---

## 2. Core Modules & Services

| Sub-System | File Location | Purpose |
| :--- | :--- | :--- |
| **`enterpriseToastService`** | `/src/services/feedback/toastService.ts` | Queue & stack management for success, error, warning, info, loading, progress, and undo toasts with auto-dismiss timers. |
| **`enterpriseAlertService`** | `/src/services/feedback/alertService.ts` | Global, section, sticky, maintenance, and emergency banner alerts. |
| **`enterpriseConfirmationService`** | `/src/services/feedback/confirmationService.ts` | Accessible confirmation modals supporting typed validation (e.g. 'DELETE') and dangerous action confirmation. |
| **`enterpriseAIFeedbackService`** | `/src/services/feedback/aiFeedbackService.ts` | Standardization for AI thinking, streaming, completion, rate-limiting, and provider failover feedback. |
| **`enterpriseIntegrationFeedbackService`** | `/src/services/feedback/integrationFeedbackService.ts` | Standard feedback for carrier APIs (DHL, Maersk), customs sync, and payment integration events. |
| **`enterpriseNotificationCenterService`** | `/src/services/feedback/notificationCenterService.ts` | Notification center state management (unread, pinned, priority, categories, and local persistence). |

---

## 3. Key Usage Patterns

### 3.1 Showing Toasts
```tsx
import { useEnterpriseToast } from '../hooks/useEnterpriseToast';

function ShipmentActions() {
  const { toastSuccess, toastError, toastUndo } = useEnterpriseToast();

  const handleApprove = async () => {
    try {
      await approveShipment();
      toastSuccess('Shipment Approved', 'تمت الموافقة على الشحنة');
    } catch (err) {
      toastError('Approval Failed', 'فشلت الموافقة على الشحنة');
    }
  };

  const handleDelete = () => {
    toastUndo(
      'Shipment moved to archive',
      'تم نقل الشحنة إلى الأرشيف',
      async () => {
        await restoreShipment();
      }
    );
  };
}
```

### 3.2 Requesting Confirmation Modals
```tsx
import { useEnterpriseConfirmation } from '../hooks/useEnterpriseConfirmation';

function DeleteShipmentButton() {
  const { confirmAction } = useEnterpriseConfirmation();

  const onClickDelete = async () => {
    const confirmed = await confirmAction({
      category: 'delete',
      titleEn: 'Delete Shipment Record',
      titleAr: 'حذف سجل الشحنة',
      messageEn: 'Are you sure you want to permanently remove shipment SHP-2026-88? This action cannot be undone.',
      messageAr: 'هل أنت تأكد من رغبتك في حذف الشحنة SHP-2026-88 نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
      isDangerous: true,
      requireTypedText: 'DELETE',
      onConfirm: async () => {
        await deleteShipmentApi();
      },
    });
  };
}
```

### 3.3 Root Provider Setup
```tsx
import { EnterpriseFeedbackProvider } from './components/feedback/EnterpriseFeedbackProvider';

export function App() {
  const [isAr] = useState(false);

  return (
    <EnterpriseFeedbackProvider isAr={isAr}>
      <MainDashboardShell />
    </EnterpriseFeedbackProvider>
  );
}
```

---

## 4. Accessibility & Localization Compliance
- **ARIA Live Regions:** Toasts use `role="status"` or `role="alert"` with `aria-live="polite"` / `assertive`.
- **Keyboard Navigation:** Modals capture focus and support `Escape` cancel and `Tab` traversal.
- **Bi-directional Support:** All components support English (`ltr`) and Arabic (`rtl`) seamless rendering without hardcoded UI text.
