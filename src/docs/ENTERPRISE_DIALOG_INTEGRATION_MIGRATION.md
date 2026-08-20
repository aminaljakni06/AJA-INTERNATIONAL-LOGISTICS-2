# AJA INTERNATIONAL LOGISTICS — Enterprise Dialog Integration, Migration & Global Adoption
**Phase:** Enterprise UI System  
**Module:** Enterprise Dialog Integration, Migration & Global Adoption  
**Version:** 1.0  

---

## 1. Executive Summary & Migration Objectives

The **Enterprise Dialog Integration, Migration & Global Adoption** phase brings all dialog, modal, confirmation, preview, and overlay interactions across the AJA INTERNATIONAL LOGISTICS platform into a single, standardized, enterprise-grade orchestration system.

### Key Accomplishments
1. **Global Provider Integration**: Integrated `EnterpriseDialogProvider` at the top of the application hierarchy inside `App.tsx`, providing instant access to the dialog stack, keyboard focus trapping, dirty state guards, and z-index orchestration across all Admin, Customer, and Public routes.
2. **Backward-Compatible Adapters**: Created seamless legacy adapters (e.g., `<Modal>` wrapper) that transparently upgrade existing modal implementations to use the Enterprise Dialog System without breaking existing page components or forcing disruptive rewrites.
3. **Unified Dialog Registry**: Centralized all 12 enterprise dialog categories (`confirmation`, `decision`, `alert`, `form`, `entity`, `wizard`, `lookup`, `media`, `document`, `attachment`, `workflow`, `approval`, `protectedAction`, `quickView`) into the global `DialogRegistry`.
4. **Hook Suite Consolidation**: Unified custom hooks (`useEnterpriseDialog`, `useEnterpriseDialogManager`, `useDialogStack`, `useDialogActions`, `useEnterpriseConfirmation`, etc.) and exported them cleanly through `/src/hooks/index.ts`.
5. **Security & Audit Preservation**: Integrated tenant-isolation cleanup (`clearTenantDialogs`), role permission constraints, and security audit event logging into all programmatic dialog invocations.

---

## 2. System Architecture & Provider Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              APP ROOT                                   │
│  ThemeProvider > LanguageProvider > AuthProvider > OrganizationProvider │
│  > EventBusProvider > WorkflowProvider > AuditProvider > ConfigProvider │
│  > IdentityProvider                                                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE DIALOG PROVIDER                         │
│  - Mounts `EnterpriseDialogHost`                                        │
│  - Binds Global Escape Key Listener & Unsaved Changes Guard             │
│  - Manages Stacking, Focus Trapping & Computed Z-Indexes                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             MAIN ROUTER                                 │
│  - Admin Operations Dashboard (`/pages/admin/*`)                        │
│  - Customer Logistics Portal (`/pages/customer/*`)                      │
│  - Public & Authentication Pages (`/pages/public/*`, `/pages/auth/*`)   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Migration Priority & Categorization

| Priority | Category | Component | Usage Scope |
| :--- | :--- | :--- | :--- |
| **P1** | Global Confirmations & Destructive Alerts | `EnterpriseConfirmationDialog`, `EnterpriseAlertDialog` | Delete confirmations, cancellation prompts, critical security alerts, session expiry. |
| **P2** | Admin & Customer Forms & Entities | `EnterpriseFormDialog`, `EnterpriseEntityDialog` | Shipment creation/edits, customer profile updates, user/role management, invoice actions. |
| **P3** | Workflow & Wizard Dialogs | `EnterpriseWizardDialog`, `EnterpriseWorkflowDialog`, `EnterpriseApprovalDialog` | Multi-step booking wizards, customs approvals, quote requests, workflow status transitions. |
| **P4** | Media, Document & Attachment Viewers | `EnterpriseMediaPreviewDialog`, `EnterpriseAttachmentDialog` | Shipping document previews, bill of lading inspection, customs document uploads. |
| **P5** | Legacy Custom Modals | `<Modal>` Adapter Wrapper | General overlays, quick-view cards, legacy form modals. |

---

## 4. Legacy Compatibility & Adapter Strategy

To ensure zero regression and avoid disruptive codebase refactoring:
- The legacy `<Modal>` component in `/src/components/common/Modal.tsx` was converted into an adapter that delegates directly to `<EnterpriseDialog>`.
- Any component in the app using standard modal props (`isOpen`, `onClose`, `title`, `children`) automatically inherits:
  - Enterprise design tokens & dark/light surface styling
  - Backdrop blur effects (`backdrop-blur-sm`)
  - Accessible focus trapping & Escape key handling
  - Bilingual title rendering (EN / AR RTL support)

---

## 5. Verification & Quality Assurance

1. **Production Build Verification**: Verified via `compile_applet`. The full production build compiles with zero errors, broken imports, or missing dependencies.
2. **RTL / LTR Verification**: All dialog layouts dynamically adapt to Arabic (`dir="rtl"`) and English (`dir="ltr"`) reading directions.
3. **Responsive Testing**: Modal dimensions dynamically adjust across Mobile (< 640px), Tablet, Laptop, and Ultra-wide Desktop displays.
4. **Accessibility Compliance**: Focus trapping, keyboard navigation, screen reader labels (`aria-labelledby`, `aria-describedby`), and role definitions (`dialog`) are enforced globally.
