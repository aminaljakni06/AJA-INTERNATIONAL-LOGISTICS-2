# AJA INTERNATIONAL LOGISTICS — STEP 08: SMART SHIPMENT TRACKING EXPERIENCE SPECIFICATION

## 1. EXECUTIVE SUMMARY & STRATEGIC VISION

The **AJA Smart Shipment Tracking Experience** is the core operational feature of AJA International Logistics. Engineered as a multi-channel digital experience (supporting Public Web, Customer Portal, Operations Dashboard, and PWA Mobile App), it delivers real-time visibility across global multimodal freight operations — Ocean (FCL/LCL), Air Freight, Overland GCC Trucking, and Customs Clearance.

The tracking ecosystem strictly adheres to the **AJA Design System** (Color System, Typography System, 8pt Grid & Layout System, Component Library, 3D Experience, and Design Tokens), guaranteeing WCAG 2.2 AA accessibility, high performance, and seamless bilingual Arabic (RTL) & English (LTR) UX.

---

## 2. END-TO-END USER JOURNEY (رحلة المستخدم)

```
[1. Access Tracking Page / Search Widget]
            ↓
[2. Input Tracking ID / Container / AWB / B/L or Scan QR / Barcode]
            ↓
[3. Real-Time Client Validation & Format Autocorrect]
            ↓
[4. Skeleton Loader & Optimistic Data Fetch (<400ms)]
            ↓
[5. Master Shipment Summary Dashboard]
            ↓ 
┌───────────────────────┬───────────────────────┬───────────────────────┐
│ Interactive Timeline  │ Live GIS Route Map    │ Document Center       │
│ & Status Milestones   │ & Node Telemetry      │ & Verified Downloads  │
└───────────────────────┴───────────────────────┴───────────────────────┘
            ↓
[6. Export Options: PDF Report / WhatsApp Share / Print / Copy Link]
```

---

## 3. MULTI-FORMAT TRACKING SEARCH INTERFACE (واجهة البحث الذكية)

### Supported Identifiers & Format Regex Validation

| Identifier Type | Standard Code Syntax Example | Validation Regex Pattern | Context & Carrier Application |
| :--- | :--- | :--- | :--- |
| **AJA Tracking ID** | `AJA-882910-KSA` | `/^AJA-\d{6}-(KSA\|GCC\|INT)$/i` | Native AJA multi-modal master tracking number |
| **Container Number** | `MSCU9281048` | `/^[A-Z]{4}\d{7}$/` | ISO 6346 Standard Ocean Shipping Container ID |
| **Air Waybill (AWB)**| `172-88492014` | `/^\d{3}-\d{8}$/` | IATA 11-digit Airline Cargo Air Waybill |
| **Bill of Lading** | `MAEU982104851` | `/^[A-Z0-9]{8,16}$/` | Ocean Carrier Master / House Bill of Lading (B/L) |

### Search Component Features & Capabilities
1. **Multi-Tab / Auto-Detect Search Bar**: Input auto-detects identifier type based on characters entered and provides visual helper tags (e.g. "Detected: ISO Container Number").
2. **Camera QR / Barcode Scanner**: One-tap trigger launching device camera for scanning physical Waybills, Shipping Labels, and Gate Passes.
3. **Recent Searches Engine**: Stores last 5 searches in secure local storage with status indicators (e.g. `AJA-882910-KSA — In Transit`).
4. **Suggested Format Chips**: Clickable format helpers below the input field for instant test queries.
5. **Real-time Input Validation & Error Feedback**:
   - *Invalid Character Error*: "Format unrecognised. Please enter a valid AJA ID (e.g. AJA-882910-KSA) or Container ID."
   - *Checksum Error*: "Container ID failed ISO 6346 validation check. Please verify digit sequence."

---

## 4. MASTER SHIPMENT OVERVIEW DASHBOARD (ملخص الشحنة)

Upon successful search resolution, the top summary card displays real-time operational state:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AJA LOGISTICS │ OCEAN FREIGHT (FCL)               [IN TRANSIT - LIVE]   │
├─────────────────────────────────────────────────────────────────────────┤
│ Tracking ID: AJA-882910-KSA              Carrier: Maersk Line (MSCU)   │
│ Origin: Shanghai Port, China (CNSHA)    Destination: Riyadh Dry Port    │
│ Estimated Delivery: Aug 05, 2026        Confidence Index: 94% (High)    │
│ Last Updated: 12 minutes ago            Service Level: Express Priority │
└─────────────────────────────────────────────────────────────────────────┘
```

### Overview Data Fields & Specs
- **Tracking ID**: Monospace font (`tokens.typography.styles.trackingNumber`), copy-to-clipboard button with toast feedback.
- **Shipment Mode**: Badge with icon (`Ship` for Sea, `Plane` for Air, `Truck` for Overland, `FileCheck` for Customs).
- **Current Status Badge**: Design-token styled badge (e.g., `In Transit` using `logisticsStatus.inTransit`).
- **Origin & Destination**: Country flags, UN/LOCODE codes (`CNSHA`, `SAJED`, `SARIY`), and port names.
- **Carrier & Vessel Name**: e.g., "Maersk Mc-Kinney Møller (Voyage 2608E)".
- **Estimated Arrival Date (ETA)**: Dynamic ETA with countdown timer (e.g., "7 days remaining").

---

## 5. INTERACTIVE SHIPMENT TIMELINE (الجدول الزمني التفاعلي)

The tracking timeline presents a 10-stage operational lifecycle. Active stages feature pulsing indicators using `tokens.logisticsStatus`.

```
[1. Order Created] ──► [2. Docs Verified] ──► [3. Picked Up] ──► [4. In Warehouse]
                                                                        │
[8. Arrived Port] ◄── [7. In Transit (Active)] ◄── [6. Departed] ◄── [5. Customs]
       │
[9. Out for Delivery] ──► [10. Delivered Successfully (POD)]
```

### Detailed Stage Matrix

| Stage # | Lifecycle Milestone Name | Lucide Icon | Default Status Description (Ar / En) |
| :---: | :--- | :--- | :--- |
| **1** | **Order Created** | `FilePlus` | تم إنشاء أمر الشحن وتأكيد الحجز / Booking confirmed and cargo order registered. |
| **2** | **Documents Verified** | `FileCheck` | تم فحص وتدقيق الوثائق التجارية والجمركية / Commercial and customs documents verified. |
| **3** | **Picked Up** | `PackageCheck` | تم استلام الشحنة من مستودع المصدر / Cargo picked up from shipper facility. |
| **4** | **Arrived at Warehouse** | `Warehouse` | وصلت الشحنة إلى مركز التجميع والمناولة / Arrived at AJA consolidation terminal. |
| **5** | **Customs Clearance** | `ShieldCheck` | جاري إنهاء إجراءات الفسح الجمركي / Customs clearance processing under Fasah portal. |
| **6** | **Departed Origin** | `Ship` / `Plane` | غادرت السفينة/الطائرة ميناء المغادرة / Departure from origin terminal confirmed. |
| **7** | **In Transit (Live)** | `Navigation` | الشحنة الإبحار/الترانزيت نحو ميناء الوصول / Active transit along international maritime corridor. |
| **8** | **Arrived at Destination**| `Anchor` / `Building`| وصلت الشحنة إلى ميناء/مطار الوصول / Arrived at destination port of entry. |
| **9** | **Out for Delivery** | `Truck` | الشحنة على متن شاحنة التوصيل النهائي / Dispatched on local transport fleet for final delivery. |
| **10** | **Delivered (POD)** | `CheckCircle2` | تم التسليم النهائي واستلام إثبات التوصيل / Delivered successfully; POD signed. |

*Active Stage Styling*: Glowing pulse aura (`ring-4 ring-[#1F4E79]/20 animate-pulse`), bold typography, full address, timestamp, and operator notes.

---

## 6. LIVE GIS MAP EXPERIENCE (الخريطة التفاعلية الحية)

The interactive route map renders maritime vessel position, overland highway corridors, and logistics hubs.

### Map Features & Layers
1. **Path Visualization**: Curved geodesic line connecting Origin Terminal ➔ Transshipment Hubs ➔ Destination Dry Port.
2. **Current Position Marker**: Pulsing vehicle/vessel icon positioned at exact GPS coordinates, updated via satellite telemetry.
3. **Interactive Hub Nodes**: Clickable markers for ports, airports, border checkposts, and warehouses with telemetry popovers:
   - *Hub Popover Content*: Terminal Name, Departure/Arrival Timestamp, Port Clearance Status, Storage Conditions.
4. **Accessible Map Fallback**: Fully operable textual list of all route coordinates and waypoints for screen readers (`aria-label` / WCAG compliance).

---

## 7. DEEP SHIPMENT DETAILS MATRIX (تفاصيل الشحنة)

| Specification Category | Data Attributes Displayed | Token & Format Rules |
| :--- | :--- | :--- |
| **Cargo Dimensions** | Gross Weight (24,500 kg), Net Weight, Total Volume (68.5 CBM), Package Count (2x 40ft HC) | Monospace tabular figures |
| **Equipment & Container**| Container No. `MSCU-9281048`, Seal No. `SL-994821`, Container Type (`40' High Cube Reefer`) | High-contrast code badge |
| **Cold Chain / Telemetry**| Set Temperature (`-18.0°C`), Actual Temp (`-17.8°C`), Relative Humidity (`85%`) | Live status badge (`Success`) |
| **Special Handling** | Hazmat Class (Class 9 - Non-flammable), Fragile Cargo, Stack Limit (`2 High Max`) | Warning / Danger badges |
| **Insurance & Valuation**| Insured Cargo Value (`SAR 450,000.00`), Policy No. `AJA-INS-2026-99` | Tabular monetary format |

---

## 8. DOCUMENT CENTER & VERIFIED DOWNLOADS (مركز المستندات)

A secure document vault allowing authenticated users and public tracking holders to access verified shipment documentation:

| Document Type | Format | Security Level | Permitted Actions |
| :--- | :--- | :--- | :--- |
| **Commercial Invoice** | PDF | Protected | Preview, Download, Print |
| **Packing List** | PDF | Public | Preview, Download |
| **Master Bill of Lading (MBL)** | PDF | Masked / Authenticated | Preview (Masked PII), Official Download |
| **Air Waybill (AWB)** | PDF | Public | Preview, Download, Print |
| **Customs Clearance Certificate (Fasah)** | PDF / QR | Public | Verify QR, Download |
| **Proof of Delivery (POD)** | PDF + Digital Signature | Public | View Signature, Download PDF |

---

## 9. UNIFIED STATUS BADGES & DESIGN TOKENS (نظام الحالات الموحد)

Status badges derive strictly from `tokens.logisticsStatus` and `tokens.semantic`:

```typescript
// Token Specification for Tracking Badges
export const trackingStatusTokens = {
  PENDING:          { bg: '#E2E8F0', text: '#334155', border: '#CBD5E1', icon: 'Clock' },
  CONFIRMED:        { bg: '#E4ECF3', text: '#1F4E79', border: '#C8D9E7', icon: 'CheckCircle' },
  PROCESSING:       { bg: '#FAF3EA', text: '#A66A22', border: '#F2D7B5', icon: 'RefreshCw' },
  IN_TRANSIT:       { bg: '#E4ECF3', text: '#1F4E79', border: '#C8D9E7', icon: 'Truck' },
  CUSTOMS:          { bg: '#FAF3EA', text: '#A66A22', border: '#F2D7B5', icon: 'ShieldCheck' },
  OUT_FOR_DELIVERY: { bg: '#E4ECF3', text: '#1F4E79', border: '#C8D9E7', icon: 'Navigation' },
  DELIVERED:        { bg: '#F2F8F4', text: '#3F7D58', border: '#C3E6D0', icon: 'CheckCircle2' },
  DELAYED:          { bg: '#FAF0F0', text: '#B84040', border: '#F3C5C5', icon: 'AlertTriangle' },
  EXCEPTION:        { bg: '#FAF0F0', text: '#B84040', border: '#F3C5C5', icon: 'AlertCircle' },
  CANCELLED:        { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0', icon: 'XCircle' },
};
```

---

## 10. SMART NOTIFICATIONS & PREDICTIVE ESTIMATION ENGINE

### Notification Alert Matrix

| Priority Tier | Trigger Event | Color Token | Delivery Channels |
| :--- | :--- | :--- | :--- |
| **Info** | Arrival at transshipment port / Milestone milestone | `semantic.info` | In-app, Email |
| **Success** | Customs clearance released / Delivered POD signed | `semantic.success` | In-app, SMS, WhatsApp, Email |
| **Warning** | Minor port congestion / Weather delay alert (+24h) | `semantic.warning` | In-app, SMS |
| **Critical** | Customs hold / Damaged cargo inspection / Cancellation | `semantic.danger` | Instant Push, SMS, Urgent Call |

### AI Delivery Estimation Algorithm Factors
- **Vessel AIS Telemetry**: Live maritime speed, nautical distance to destination port.
- **Port Congestion Index (PCI)**: Real-time queue metrics at Jeddah Islamic Port & Dammam Port.
- **Customs Throughput Velocity**: Fasah clearance processing duration statistics.
- **Confidence Metric Output**: Rendered as a visual meter (e.g. `94% High Confidence`).

---

## 11. SHARING & EXPORT CAPABILITIES (المشاركة والتصدير)

1. **Direct Link Copy**: One-click URL generation with tracking token parameter (`/tracking?id=AJA-882910-KSA`).
2. **WhatsApp Broadcast Link**: Pre-formatted message template in Arabic and English containing tracking number, current status, and direct link.
3. **Instant PDF Shipment Report**: Generates an enterprise-branded AJA PDF report complete with timeline, carrier details, and QR code using `pdfExport.ts`.
4. **Print Optimization Styles**: Custom `@media print` stylesheet removing headers, navbars, and interactive buttons for clean physical paper printing.

---

## 12. EMPTY, ERROR & OFFLINE STATES (حالات الخطأ والفراغ)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ [Icon: AlertCircle]                                                     │
│                                                                         │
│ لم يتم العثور على شحنة بهاتين البيانات                                     │
│ No Shipment Found for Identifier "AJA-000000-XXX"                      │
│                                                                         │
│ يرجى التحقق من صحة الرقم وإعادة المحاولة، أو التواصل مع فريق الدعم الفني.  │
│ Please check the tracking number syntax or contact AJA 24/7 Support.   │
│                                                                         │
│ [ Button: Try Another Search ]    [ Button: Contact Support ]           │
└─────────────────────────────────────────────────────────────────────────┘
```

| State Scenario | Context & Trigger | Recommended Recovery Action |
| :--- | :--- | :--- |
| **No Search Results** | Identifier valid syntactically but not in DB | "Verify number with invoice or contact support" CTA |
| **Syntax Format Error** | User types invalid sequence (e.g. `123`) | Inline helper suggesting standard formats |
| **Network Disconnection**| Lost internet connectivity | Offline cache banner showing last synced data |
| **Server Maintenance** | Backend API under maintenance | Graceful service notice with support phone number |

---

## 13. ACCESSIBILITY, PERFORMANCE & SECURITY SPECIFICATIONS

### Accessibility (WCAG 2.2 AA)
- **Keyboard Navigation**: Complete focus flow through tracking inputs, timeline tabs, map points, and document buttons.
- **Screen Reader Support**: All status icons paired with `sr-only` text; timeline stages wrapped in `<ol>` with step counters.
- **Touch Targets**: Minimum `44×44px` touch bounding boxes on mobile screens.

### Performance & Security
- **Optimistic Loading**: Skeleton placeholders render instantly before API data arrives (<400ms).
- **Map Lazy Loading**: GIS Map module dynamically loaded only when visible in viewport (`IntersectionObserver`).
- **PII Data Masking**: Personal customer details (consignee phone/address) masked for public non-authenticated tracking searches.
- **Audit Logging**: Every tracking query and document download recorded in Firestore `auditLogs` collection.

---

## 14. MULTI-CHANNEL IMPLEMENTATION GUIDE

The Smart Tracking Experience component architecture is designed for direct integration across all 4 digital touchpoints:

1. **Public Website (`/tracking`)**: Full public search interface, 3D/2D live map, instant tracking result card.
2. **Customer Portal (`/customer/shipments/:id`)**: Authenticated tracking view with unmasked commercial documents, POD download, and notification preferences.
3. **Admin Operations Dashboard (`/admin/shipments/:id`)**: Operations view with internal notes, manual event override controls, and carrier API sync status.
4. **PWA Mobile Application**: Touch-optimized tracking card with camera QR scanner, offline cached timeline, and push alerts.

---

## 15. CENTRALIZED DESIGN TOKENS INTEGRATION

All tracking styles, timeline colors, status badges, and map tokens are centralized in `/src/design-system/tokens.ts`:

```typescript
import { tokens } from '@/design-system/tokens';

// Access tracking tokens
const inTransitColor = tokens.logisticsStatus.inTransit;
const trackingFont = tokens.typography.styles.trackingNumber;
```
