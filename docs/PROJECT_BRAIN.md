# AJA LOGISTICS ERP — PROJECT BRAIN & ARCHITECTURE REGISTRY

## VERSION: 1.0 Enterprise
## MODULE: STEP ALBP-002.001 — Enterprise Identity Platform

### 1. REGISTERED ENGINES & SUBSYSTEMS
- **Permission Engine (ALBP-001.005)**: RBAC + ABAC + Policy Engine (`src/lib/permissions/*`)
- **Organization Engine (ALBP-001.006)**: Multi-Company, Multi-Branch, Departments, Teams, Cost Centers, Reporting Hierarchy (`src/services/organizationService.ts`, `src/context/OrganizationContext.tsx`)
- **Event Bus Engine (ALBP-001.007)**: Decoupled Enterprise Event Bus, Event Publisher, Subscriber, Dispatcher, Registry, Dead Letter Queue (`src/lib/events/*`, `src/services/eventBusService.ts`, `src/context/EventBusContext.tsx`)
- **Workflow Engine (ALBP-001.008)**: Business Process Automation, Approval Chains (Sequential, Parallel, Majority, Role/Dept/Branch-based), Task Engine, SLA & Escalation Engine, AI Recommendation Hooks (`src/lib/workflow/*`, `src/services/workflowService.ts`, `src/context/WorkflowContext.tsx`)
- **Audit & Observability Engine (ALBP-001.009)**: Immutable Audit Trail with Checksum Verification, Activity Log, User Session Tracking, Entity History Versioning, Error Tracking, Performance Metrics (APM), Health Diagnostics, Telemetry Hooks (`src/lib/observability/*`, `src/services/auditService.ts`, `src/context/AuditContext.tsx`)
- **Configuration & Feature Flag Engine (ALBP-001.010)**: Hierarchical Setting Inheritance (User -> Team -> Department -> Branch -> Company -> Global), Dynamic Feature Flag Engine with Kill Switches, Percentage Canary Rollouts & Schedules, Module Status Control, User Preferences Engine, Integrity Diagnostic Engine (`src/lib/config/*`, `src/services/configService.ts`, `src/context/ConfigContext.tsx`)
- **Enterprise Identity & Access Engine (ALBP-002.001)**: Identity Registry, 11 Identity Types, 9 Account Lifecycle Statuses, Session Manager, Hardware/Browser Device Registry with Digital Fingerprinting, MFA Infrastructure (TOTP, SMS, Email, Backup Codes), Password Policy Enforcer, Login Policy Enforcer (`src/lib/identity/*`, `src/services/identityService.ts`, `src/context/IdentityContext.tsx`)

### 2. CORE MODELS & DOMAIN SCHEMAS
- **Company Model**: (`src/types/organization.ts`)
  - Multi-company data isolation with legal name, trade name, CR number, VAT registration, default currency, fiscal year, and time zone.
- **Branch Model**: (`src/types/organization.ts`)
  - Multi-branch isolation support with branch codes (e.g., RUH-HQ, JED-PORT, DMM-HUB), warehouse assignment, operational status, and localized timezones.
- **Department Model**: (`src/types/organization.ts`)
  - Hierarchical unit types: OPERATIONS, FINANCE, HR, CRM, SALES, MARKETING, CUSTOMER_SERVICE, WAREHOUSE, FLEET, CUSTOMS, PROCUREMENT, IT, COMPLIANCE, EXECUTIVE, and CUSTOM.
- **Team Model**: (`src/types/organization.ts`)
  - Sub-unit assignments with leader linkage, member lists, KPI metrics, and operational rules.
- **Cost Center Model**: (`src/types/organization.ts`)
  - Financial allocation tracking (Department, Branch, Project, Operational, Corporate) with budget limits and spent tracking.
- **Hierarchy Model**: (`src/types/organization.ts`)
  - Executive to employee reporting tree structure (CEO -> COO/CFO -> Managers -> Supervisors -> Employees).
- **Domain Event Schema**: (`src/types/events.ts`)
  - Decoupled enterprise event model containing ID, Name, Aggregate ID, Aggregate Type, Module, Version, Timestamp, Triggered By, Company ID, Branch ID, Correlation ID, Payload, Metadata, Status, Priority, Retry Count.
- **Workflow Instance & Task Schema**: (`src/types/workflow.ts`)
  - Supports 18 Workflow Templates (Shipment, Quote, Expense, Invoice, Purchase, General Business), Multi-Policy Approval Engine, Human & System Task Engine, SLA & Escalation Rules, and AI Decision & Risk Recommendations.
- **Audit Record & Observability Schema**: (`src/types/audit.ts`)
  - Immutable audit trail with SHA256 checksum tamper verification, state diffing, sensitive field masking, activity tracking, session duration, entity history versions, exception stack traces, APM latency metrics, component health checks, and AI telemetry hooks.
- **Enterprise Identity & Access Schema**: (`src/types/identity.ts`)
  - Supports 11 Identity Types, 9 Account Lifecycle Statuses, Identity Profile (IDs, Organizational Linkage, Security Clearance Level), Password Policies (Live Verification, Expiry, Fail Counter), Login Policies (Allowed Devices, Countries, Hours, Concurrent Sessions), Registered Hardware Devices (Digital Fingerprinting, Trust Level), Session Records, and MFA Configurations (TOTP, SMS, Email, Backup Codes).

### 3. FIRESTORE EXTENSION POINTS
- `companies` collection
- `branches` collection
- `departments` collection
- `teams` collection
- `cost_centers` collection
- `organization_settings` collection
- `event_logs` collection
- `workflow_templates` collection
- `workflow_instances` collection
- `workflow_tasks` collection
- `audit_logs` collection
- `activity_logs` collection
- `user_sessions` collection
- `error_logs` collection
- `entity_history` collection
- `performance_metrics` collection
- `system_settings` collection
- `feature_flags` collection
- `user_preferences` collection
- `module_configs` collection
- `identity_profiles` collection
- `registered_devices` collection
- `identity_policies` collection
- `mfa_configs` collection

### 4. API LAYER EXTENSIONS
- `GET /api/organization/company`
- `GET /api/organization/branches`
- `GET /api/organization/departments`
- `GET /api/organization/teams`
- `GET /api/organization/cost-centers`
- `GET /api/organization/hierarchy`
- `GET /api/organization/settings`
- `GET /api/events/definitions`
- `GET /api/events/history`
- `GET /api/events/dlq`
- `POST /api/events/publish`
- `POST /api/events/replay`
- `POST /api/events/dlq/:id/retry`
- `GET /api/workflow/templates`
- `GET /api/workflow/tasks`
- `GET /api/workflow/instances/:id`
- `POST /api/workflow/start`
- `POST /api/workflow/transition`
- `POST /api/workflow/sla/check`
- `GET /api/audit-logs`
- `GET /api/audit-logs/activity`
- `GET /api/audit-logs/health`
- `GET /api/audit-logs/metrics`
- `GET /api/audit-logs/errors`
- `GET /api/audit-logs/entity-history/:entityType/:entityId`
- `POST /api/audit-logs/log`
- `GET /api/config/settings`
- `GET /api/config/settings/:key`
- `POST /api/config/settings`
- `GET /api/config/feature-flags`
- `POST /api/config/feature-flags/:key/toggle`
- `GET /api/config/user-preferences`
- `PUT /api/config/user-preferences`
- `GET /api/config/modules`
- `PUT /api/config/modules/:key`
- `GET /api/config/validate`
- `GET /api/identity/profile`
- `PUT /api/identity/profile`
- `GET /api/identity/sessions`
- `POST /api/identity/sessions/revoke`
- `GET /api/identity/devices`
- `POST /api/identity/devices/trust`
- `GET /api/identity/password-policy`
- `POST /api/identity/validate-password`
- `GET /api/identity/mfa`
- `POST /api/identity/mfa/setup`
- `POST /api/identity/mfa/disable`
- `GET /api/identity/admin/users`
- `PATCH /api/identity/admin/status`
- `PUT /api/identity/admin/password-policy`

### 5. EXTENSION POINTS & REUSABILITY
- `useOrganization()` hook provides instant access to current company, current branch, branch filter utility, and structural data.
- `<CompanyBranchSelector />` provides clean UI for switching active branches and observing company identity.
- `<OrganizationHierarchyTree />` visually renders reporting nodes dynamically.
- `<OrganizationUnitCard />` renders structural details for branches, departments, and cost centers.
- `<OrganizationSettingsForm />` manages working days, weekend rules, business hours, and holiday calendars.
- `useEventBus()` hook & `EventBusService` provide publish/subscribe, event replay, history lookup, and DLQ management across all frontend and backend ERP modules.
- `useWorkflow()` hook & `WorkflowService` provide workflow template instantiation, multi-policy approval evaluation, task delegation/completion, SLA check, and AI recommendation suggestions.
- `useAudit()` hook & `AuditService` provide audit logging with checksum tamper verification, activity logging, session tracking, entity history snapshots, exception tracking, health monitoring, and APM metrics.
- `<AuditTrailViewer />`, `<ActivityTimelineViewer />`, `<SystemHealthCards />`, and `<PerformanceMetricsCard />` offer enterprise audit and observability views across the ERP.
- `useConfig()` hook & `ConfigService` provide hierarchical setting resolution (User -> Team -> Dept -> Branch -> Company -> Global), canary feature flag evaluation with percentage rollouts, kill switches, module operational status management, user preferences, and configuration integrity diagnostics.
- `<FeatureFlagManager />`, `<SystemSettingsForm />`, `<ModuleConfigStatusCard />`, `<UserPreferencesPanel />`, and `<ConfigValidationViewer />` provide centralized administration across all ERP modules.
- `useIdentity()` hook & `IdentityService` provide identity lifecycle management, session revocation, device fingerprinting & trust, password policy enforcement, MFA setup, and audit integration.
- `<IdentityProfileView />`, `<SessionManagerView />`, `<DeviceManagerView />`, `<SecuritySettingsView />`, and `<AdminIdentityManagement />` provide complete identity & access control UI components across the ERP.
