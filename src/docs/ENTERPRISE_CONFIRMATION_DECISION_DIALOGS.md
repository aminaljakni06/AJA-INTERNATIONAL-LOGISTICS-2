# AJA INTERNATIONAL LOGISTICS — Enterprise Confirmation, Alert & Decision Dialogs Documentation
**Phase:** Enterprise UI System  
**Module:** Enterprise Confirmation, Alert & Decision Dialogs  
**Version:** 1.0  

---

## 1. Overview & Architecture

The **Enterprise Confirmation, Alert & Decision Dialog Framework** extends the core Enterprise Dialog System to standardize every operational confirmation, system alert, protected action, and approval decision workflow across the AJA INTERNATIONAL LOGISTICS platform.

### Standardized Decision Flow Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│               CONFIRMATION & DECISION USER INTERFACES                   │
│                                                                        │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ EnterpriseAlertDialog  │  │ EnterpriseDecisionDialog             │ │
│  │ (Alerts & Severities)  │  │ (Reasons, Hold, Keyword Verification)│ │
│  └────────────────────────┘  └──────────────────────────────────────┘ │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ ApprovalDialog         │  │ ProtectedActionDialog                │ │
│  │ (Workflow & Rejection) │  │ (Permission & Risk-Level Verification│ │
│  └────────────────────────┘  └──────────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DECISION SERVICE ENGINE                         │
│  - Standardized Audit Trail Telemetry Generation (AuditMetadata)       │
│  - Correlation ID & Request ID Traceability                           │
│  - Protected Action Risk-Level Validation                              │
│  - Dynamic Hold-to-Confirm & Countdown State Engines                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component & Service Directory

| Component / Service | File Location | Purpose & Function |
| :--- | :--- | :--- |
| **`RiskLevel` & `DecisionRequest`** | `/src/types/decisionFramework.ts` | Shared TypeScript contracts defining risk levels (`LOW` to `CRITICAL`), reasons, and audit telemetry. |
| **`DecisionService`** | `/src/services/dialog/decisionService.ts` | Central execution engine creating correlation IDs, generating audit logs, and managing decisions. |
| **`useEnterpriseDecision`** | `/src/hooks/useEnterpriseDecision.ts` | React custom hook providing simple procedural triggers for confirmations, decisions, and protected actions. |
| **`EnterpriseAlertDialog`** | `/src/components/dialog/EnterpriseAlertDialog.tsx` | Auto-dismissing or explicit alert modal supporting 6 severity levels and system warning types. |
| **`EnterpriseDecisionDialog`** | `/src/components/dialog/EnterpriseDecisionDialog.tsx` | Feature-rich decision modal with business summary cards, reason dropdowns, comments, and hold-to-confirm progress. |
| **`EnterpriseApprovalDialog`** | `/src/components/dialog/EnterpriseApprovalDialog.tsx` | Specialized logistics approval/rejection modal requiring mandatory reasons and audit notes. |
| **`EnterpriseProtectedActionDialog`** | `/src/components/dialog/EnterpriseProtectedActionDialog.tsx` | High-security modal enforcing permission checks, risk badges, and keyword locking. |

---

## 3. Supported Risk Levels & Safety Controls

### Risk Levels
- **`LOW` / `NORMAL`**: Standard business updates (e.g. updating container seal note).
- **`MEDIUM`**: Operational modifications with financial or schedule implications (e.g. reassigning driver).
- **`HIGH`**: Significant actions affecting customs or compliance (e.g. modifying tariff valuation).
- **`CRITICAL` / `EMERGENCY`**: Irreversible or severe operations (e.g. deleting shipment manifest, canceling bill of lading).
- **`SECURITY` / `COMPLIANCE`**: Restricted actions requiring explicit administrative confirmation and keyword unlocking.

### Safety Controls
1. **Explicit Keyword Lock:** Requires user to type a specific word (e.g., `"RELEASE"`, `"DELETE"`) to unlock the submit button.
2. **Hold-To-Confirm Button:** User must press and hold the action button for a set duration (e.g., 2000ms) with a visual progress bar fill.
3. **Delayed Activation Countdown:** Disables confirmation for N seconds to force reading warnings before action is unlocked.
4. **Mandatory Justification Notes:** Requires selecting a predefined reason code and typing at least 5 characters of comment text.

---

## 4. Usage Examples

### Executing a High-Risk Decision Request
```tsx
import { useEnterpriseDecision } from '../hooks/useEnterpriseDecision';

export function ShipmentReleaseComponent() {
  const { requestDecision } = useEnterpriseDecision();

  const handleReleaseClick = async () => {
    const result = await requestDecision({
      titleEn: 'Confirm Customs Clearance Release',
      titleAr: 'تأكيد الإفراج عن البيان الجمركي',
      descriptionEn: 'Are you sure you want to release Shipment #SH-90821?',
      descriptionAr: 'هل أنت أصلًا من تأكيد الإفراج عن الشحنة رقم SH-90821؟',
      actionType: 'APPROVE',
      riskLevel: 'HIGH',
      moduleName: 'CUSTOMS_CLEARANCE',
      recordSummary: {
        recordId: 'SH-90821',
        title: 'Container 40ft High Cube — Medical Supplies',
        attributes: [
          { labelEn: 'Port of Entry', labelAr: 'ميناء الدخول', value: 'Jeddah Islamic Port' },
          { labelEn: 'Declaration Value', labelAr: 'قيمة البيان', value: 'SAR 450,000' },
        ],
      },
      requireReason: true,
      predefinedReasons: [
        { code: 'DOCS_VERIFIED', labelEn: 'All Customs Documents Verified', labelAr: 'تم التثبت من كافة الوثائق' },
        { code: 'DUTY_PAID', labelEn: 'Customs Duty Paid in Full', labelAr: 'سداد الرسوم الجمركية بالكامل' },
      ],
      requireExplicitPhrase: 'RELEASE',
    });

    if (result.confirmed) {
      console.log('Shipment released with audit metadata:', result.auditMetadata);
    }
  };

  return <button onClick={handleReleaseClick}>Release Shipment</button>;
}
```

---

## 5. Audit Metadata Capture

Every decision recorded by the framework automatically captures an immutable audit record:
- **`userId`**: Current authenticated user ID.
- **`action`**: Business action category (e.g. `APPROVE`, `DELETE`).
- **`moduleName`**: Originating module (e.g. `CUSTOMS_CLEARANCE`).
- **`recordId`**: ID of affected business record.
- **`riskLevel`**: Classification severity.
- **`correlationId`**: Unique request correlation ID for cross-service tracing.
- **`timestamp`**: Exact UTC epoch milliseconds.

---

## 6. Verification Status

This phase has been verified with `compile_applet` and confirmed free of compilation and type errors.
