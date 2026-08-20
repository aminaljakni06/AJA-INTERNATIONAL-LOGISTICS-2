# AJA INTERNATIONAL LOGISTICS — STEP 09: ENTERPRISE CUSTOMER PORTAL SPECIFICATION

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL SCOPE

The **AJA Enterprise Customer Portal** is a multi-tenant, cloud-native SaaS supply chain management platform designed for self-service freight management at **AJA International Logistics**. Engineed to support diverse client profiles — ranging from individual shippers and regional SMEs to multi-branch corporate enterprises — the portal provides end-to-end visibility, automated spot and contract quoting, digital document vaulting, electronic invoicing, support ticketing, and supply chain analytics.

The platform is strictly bound to the **AJA Centralized Design System** (`/src/design-system/tokens.ts`), maintaining complete compliance with WCAG 2.2 Level AA accessibility, mobile-first responsive reflow, and full bilingual support for Arabic (RTL) and English (LTR).

---

## 2. INFORMATION ARCHITECTURE (IA) & USER ROLES / RBAC

### A. Comprehensive Navigation Site Map

```
CLIENT PORTAL ROOT (/customer)
 ├── 1. Authentication & Security Gate (/login, /sso, /mfa, /forgot-password, /reset-password)
 ├── 2. Dashboard Home (/customer/dashboard)
 │     ├── Executive KPI Cards
 │     ├── Active Shipment Summary List
 │     └── Activity Feed & Critical Alerts
 ├── 3. My Shipments Engine (/customer/shipments)
 │     ├── Advanced Filter & Data Table View
 │     ├── Card Grid View
 │     └── Detailed 360° Inspection View (/customer/shipments/:id)
 │           ├── Summary & Overview
 │           ├── Interactive 10-Stage Milestone Timeline
 │           ├── Live GIS Satellite Map
 │           ├── Cargo & Reefer Telemetry
 │           ├── Document Vault Links
 │           └── Financial & Customs Status
 ├── 4. Rate Calculator & Quote Engine (/customer/quotes)
 │     ├── Multi-Step Freight Request Form (/customer/quotes/new)
 │     └── Quote History & Approval Center (/customer/quotes/history)
 ├── 5. Enterprise Document Vault (/customer/documents)
 │     ├── Commercial Invoices
 │     ├── Packing Lists
 │     ├── Bills of Lading / Air Waybills
 │     ├── Customs Clearance Certificates (Fasah)
 │     └── Proof of Delivery (POD)
 ├── 6. Financial Center & Billing (/customer/invoices)
 │     ├── Outstanding Balance Ledger
 │     ├── Tax Invoices & Download
 │     └── Payment Transaction History
 ├── 7. Unified Notification Center (/customer/notifications)
 ├── 8. Support & Knowledge Center (/customer/support)
 │     ├── Ticket System (/customer/support/tickets)
 │     └── Customs & Shipping Knowledge Base (/customer/support/kb)
 ├── 9. Supply Chain Analytics (/customer/analytics)
 │     ├── On-Time Delivery Metrics
 │     ├── Volume Trends & Route Distribution
 │     └── Freight Expenditure & Dwell Time Analysis
 ├── 10. Company Profile & Team Management (/customer/settings/company)
 │     ├── Corporate Credentials & Tax Info
 │     └── User & RBAC Permission Management
 └── 11. Account & Security Settings (/customer/settings/account)
       ├── Language & Timezone Preferences
       ├── Security & Trusted Devices
       └── Enterprise API Keys & Webhooks
```

### B. Role-Based Access Control (RBAC) Permission Matrix

| User Persona Tier | Target User Profile | System Capabilities & Permissions | Data Access Bounds |
| :--- | :--- | :--- | :--- |
| **Corporate Admin** | Supply Chain Director, Executive Admin | Full organizational access: user management, billing, credit lines, global analytics, API key generation | Entire Organization |
| **Logistics Manager**| Senior Dispatcher, Import/Export Manager | Create/manage shipments, request quotes, approve quotes, access document vault, raise support tickets | Assigned Branch / Division |
| **Finance Officer** | Accounts Payable, CFO | View and pay invoices, download official tax receipts, review payment transaction audit history | Financial & Billing Module |
| **View-Only Operator**| Field Operator, Warehouse Recipient | Track active shipments, view milestone timelines, download ePODs, export tracking PDF reports | Read-Only Access |
| **Individual / SME** | Single Business Owner | Full individual account management, instant rate requesting, credit card / SADAD checkout | Individual Account |

---

## 3. CORE USER FLOWS & JOURNEYS

### Flow 1: Authentication & MFA Entry
```
[User Arrives at /login]
         ↓
[Inputs Email & Password OR Clicks Enterprise SSO (SAML/Okta)]
         ↓
[Server Validates Credentials & RBAC Profile]
         ↓
[Prompt MFA Verification (TOTP Authenticator or SMS OTP)]
         ↓
[Issue Encrypted Session Cookie & Redirect to /customer/dashboard]
```

### Flow 2: Spot Rate Request & Approval
```
[Navigate to /customer/quotes/new]
         ↓
[Step 1: Select Service Mode (Ocean FCL/LCL, Air, Overland, Customs)]
         ↓
[Step 2: Enter Origin/Destination Ports, Ready Date & Incoterms]
         ↓
[Step 3: Enter Cargo Dimensions, CBM, Gross Weight & Reefer/Hazmat]
         ↓
[Step 4: Upload Packing List / Invoice]
         ↓
[Submit Request ➔ System Generates Request ID (e.g., REQ-2026-8819)]
         ↓
[Receive Instant Auto-Quote OR AJA Pricing Team Notification]
         ↓
[Customer Approves Quote ➔ Auto-Converts to Active Shipment AJA-XXXXXX]
```

### Flow 3: Shipment Exception Handling & Document Retrieval
```
[Customer Receives Critical Push/Email Notification: "Customs Hold at Port"]
         ↓
[Clicks Notification ➔ Direct Deep-Link to /customer/shipments/:id]
         ↓
[Inspects Live Status Badge & Fasah Inspection Note]
         ↓
[Accesses Document Vault ➔ Downloads Missing Customs Certificate]
         ↓
[Uploads Corrected Document ➔ Auto-Notifies AJA Customs Broker]
```

---

## 4. DASHBOARD HOME & EXECUTIVE KPI METRICS

Upon authentication, the user lands on the executive operational dashboard.

### A. Key Performance Indicator (KPI) Cards Layout (ASCII)

```
┌───────────────────────────┬───────────────────────────┬───────────────────────────┬───────────────────────────┐
│ ACTIVE SHIPMENTS          │ DELIVERED (THIS MONTH)    │ PENDING QUOTES            │ OUTSTANDING INVOICES      │
│ 14 Active Units           │ 42 Completed Units        │ 3 Quotes Under Review     │ SAR 18,450.00             │
│ [9 Sea • 3 Land • 2 Air]  │ ↑ +12% vs last month      │ Est. Value: SAR 45,000    │ 2 Invoices Pending        │
└───────────────────────────┴───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

### B. Recent Activity Stream
- Real-time audit log of active shipment updates, customs releases, quote issuances, and invoice payments.

---

## 5. DETAILED PAGE SPECIFICATIONS

### 1. Authentication Pages (`/login`, `/sso`, `/mfa`, `/forgot-password`)
- **Login Card**: High-contrast card with AJA brand emblem, email/password fields, SSO button, "Remember Browser" checkbox, and password reset link.
- **MFA Challenge**: 6-digit passcode input with auto-tabbing and resend OTP cooldown timer (60s).

### 2. Dashboard Home (`/customer/dashboard`)
- **Welcome Bar**: User name, company title, last login timestamp, and urgent alert badges.
- **KPI Row**: 4 primary data cards bound to design tokens (`tokens.colors.surfaces.primary`, `tokens.elevation.level2`).
- **Active Shipments Preview**: Compact top-5 active shipments table with quick tracking CTA.

### 3. My Shipments Page (`/customer/shipments`)
- **Controls**: Search bar (Tracking ID, Container No., B/L), mode tabs (All, Ocean, Air, Land, Customs), status filters.
- **Data Table Layout**: Tabular view displaying Tracking ID, Service Mode, Route (Origin ➔ Destination), Carrier, Live Status Badge, ETA, and Actions (`View`, `Download B/L`).

### 4. Shipment Inspection View (`/customer/shipments/:id`)
- **Overview Header**: Master shipment summary card displaying tracking number, carrier, vessel voyage, and ETA countdown.
- **Interactive 10-Stage Milestone Timeline**: Real-time progress node indicator with timestamps and operator notes.
- **Live GIS Satellite Map**: Geodesic route visualization with vessel GPS coordinates and port hubs.
- **Cargo Telemetry**: Reefer temperature (-18°C), weight (24,500 kg), container seal numbers, and gross volume (CBM).
- **Document Links**: Instant download buttons for Invoice, Packing List, MBL/AWB, Fasah Clearance, and ePOD.

### 5. Request a Quote Page (`/customer/quotes/new`)
- **Multi-Step Form**: Step 1 Service Selection ➔ Step 2 Route & Dates ➔ Step 3 Cargo Details ➔ Step 4 Document Upload ➔ Step 5 Review & Submit.
- **Real-Time Validation**: Zod schema validation checking positive weights, valid UN/LOCODE ports, and valid file types (`.pdf`, `.png`, `.xlsx`).

### 6. Document Center (`/customer/documents`)
- **Tab Categories**: Commercial Invoices, Packing Lists, Bills of Lading, Air Waybills, Customs Certificates (Fasah), Proof of Delivery (POD).
- **Features**: Multi-select batch export as `.zip`, instant PDF preview modal, and QR verification code check.

### 7. Invoices & Payments Page (`/customer/invoices`)
- **Financial Ledger**: Account balance summary, credit line utilization gauge (e.g., "SAR 18,450 / SAR 100,000 Used").
- **Invoice Table**: Invoice ID, Shipment Reference, Issue Date, Due Date, Tax Amount (VAT 15%), Status Badge (`PAID`, `UNPAID`, `OVERDUE`), and "Pay Now" CTA.

### 8. Notification Center (`/customer/notifications`)
- **Categorized Feed**: Shipment Updates, Customs Alerts, Financial Alerts, System Notices.
- **Filters**: Unread only, Priority level (Info, Success, Warning, Critical), Mark all as read.

### 9. Support Center (`/customer/support`)
- **Ticket Submission**: Issue category (Delay, Customs Hold, Billing, Damage), priority level, description, and file attachment.
- **Ticket History**: Status timeline showing assigned AJA support manager responses.

### 10. Supply Chain Analytics (`/customer/analytics`)
- **Visual Charts**: Monthly shipment volume bar charts, mode distribution pie charts, on-time delivery percentage gauges (96.4%), and average customs dwell time trends.

### 11. Company Profile & Users (`/customer/settings/company`)
- **Corporate Profile**: Commercial Register (CR) Number, VAT Identification, Corporate HQ address, official contact details.
- **User Management Table**: Team member list, assigned RBAC roles, status (`Active`, `Invited`), and permission edit controls.

### 12. Account Settings (`/customer/settings`)
- **Preferences**: Language toggle (Arabic / English), Timezone selection (AST UTC+3 default), notification channels (Email, SMS, WhatsApp).
- **Developer Settings**: Enterprise API key generator, webhook endpoint manager for SAP/Oracle ERP integration.

---

## 6. CUSTOM PORTAL COMPONENTS & UI PATTERNS

1. **`StatusBadge` Component**: Bound to `tokens.colors.logisticsStatus`. Renders text label + status icon + color badge.
2. **`DataTable` Component**: Supports virtualized scrolling, column sorting, search filtering, and skeleton loading states.
3. **`MetricCard` Component**: Displays KPI figure, trend percentage badge, sub-label, and secondary metric.
4. **`FileUploadZone` Component**: Drag-and-drop file upload with progress bar, file type icon, and format validation.

---

## 7. SECURITY & PERFORMANCE SPECIFICATIONS

### Security Architecture
- **Encryption**: TLS 1.3 in transit; AES-256 for document vault files.
- **RBAC Verification**: Enforced on server-side API routes and Firestore security rules.
- **Audit Logging**: Immutable logging of all user logins, document downloads, and permission updates in `auditLogs` collection.

### Performance Standards
- **Initial Load**: First Contentful Paint (FCP) < 1.2s; Skeleton loading states for all async queries.
- **Table Virtualization**: TanStack Table virtualization handling 10,000+ shipment rows smoothly.
- **Offline & PWA Capability**: Service worker caching of portal shell and cached offline tracking state.

---

## 8. PORTAL DESIGN TOKENS MATRIX

The Customer Portal utilizes dedicated tokens defined in `/src/design-system/tokens.ts`:

```typescript
export const portalTokens = {
  surfaces: {
    dashboardBg: '#F8FAFC',
    cardBase: '#FFFFFF',
    sidebarBg: '#0F172A',
  },
  table: {
    headerBg: '#F1F5F9',
    rowHover: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  kpi: {
    activeShipmentsBg: '#E4ECF3',
    deliveredBg: '#F2F8F4',
    pendingQuotesBg: '#FAF3EA',
    invoicesBg: '#FAF0F0',
  }
};
```

---

## 9. SUMMARY & IMPLEMENTATION BLUEPRINT

This specification serves as the formal design and engineering blueprint for the **AJA Enterprise Customer Portal**. All layout rules, user flows, page specifications, security standards, and design tokens are validated and ready for production execution.
