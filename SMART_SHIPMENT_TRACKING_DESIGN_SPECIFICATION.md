# AJA INTERNATIONAL LOGISTICS — SMART SHIPMENT TRACKING DESIGN SPECIFICATION

## 1. EXECUTIVE SUMMARY & DESIGN PHILOSOPHY

The **Smart Shipment Tracking Feature** is the core operational visibility module for **AJA International Logistics**. Designed for multi-channel deployment across the Public Portal (`/tracking`), Enterprise Customer Portal, Operations Control Center, and PWA Mobile App, this feature delivers real-time telemetry, automated document retrieval, and milestone tracking across global multimodal freight operations (Ocean FCL/LCL, Air Express, Overland GCC Trucking, and Customs Clearance).

This formal design specification details:
1. **Multi-Format Search Bar UI Layout**: Supporting text inputs (AJA ID, ISO Container, AWB, B/L) and live camera QR/barcode scanning.
2. **Shipment Summary Card Structure**: Bound strictly to the **AJA Design System Tokens** (`/src/design-system/tokens.ts`).
3. **Interactive Timeline Component**: Detailing visual states (Pending, Active, Customs, Delivered, Exception), state logic, responsive reflow, and WCAG 2.2 AA accessibility screen reader labeling.

---

## 2. MULTI-FORMAT SEARCH INPUT SPECIFICATION

The search interface provides multi-format input auto-detection, real-time client-side regex validation, camera-based QR/barcode scanning, and recent query caching.

### A. Supported Formats & Regex Validation Rules

| Identifier Format Type | Syntax Pattern Example | Validation Regex Pattern | Context & Carrier Application |
| :--- | :--- | :--- | :--- |
| **AJA Tracking ID** | `AJA-882910-KSA` | `/^AJA-\d{6}-(KSA\|GCC\|INT)$/i` | Native AJA multi-modal master tracking code |
| **ISO Container Number**| `MSCU9281048` | `/^[A-Z]{4}\d{7}$/` | ISO 6346 standard ocean shipping container ID |
| **Air Waybill (AWB)** | `172-88492014` | `/^\d{3}-\d{8}$/` | IATA 11-digit airline cargo air waybill number |
| **Bill of Lading (B/L)**| `MAEU982104851` | `/^[A-Z0-9]{8,16}$/` | Ocean carrier master / house bill of lading |

### B. Search Input UI Layout & Token Bindings

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Icon: Search]  Enter Tracking ID, Container No. (MSCU), AWB, or B/L...   [QR/Barcode]  [SEARCH]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
  Auto-Detected Tag: [ ISO Container Number ]   Validation: ✓ Format Validated
  Suggested Formats: ( AJA-882910-KSA )  ( MSCU9281048 )  ( 172-88492014 )
```

#### Token Binding & Dimensions:
- **Surface**: `tokens.colors.surfaces.primary` (`#FFFFFF`)
- **Container Height**: `56px` (`h-14` on desktop) / `48px` (`h-12` on mobile)
- **Border**: 1px solid `tokens.colors.forms.inputBorder` (`#CBD5E1`)
- **Focus State**: 2px ring `tokens.colors.forms.focusRing` (`#1F4E79`)
- **Border Radius**: `tokens.radii.xl` (16px / `rounded-2xl`)
- **Typography**: Tabular Monospace (`tokens.typography.styles.trackingNumber`)
- **QR/Barcode Scanner Button**: `44×44px` minimum touch bounding box, `bg-slate-100 hover:bg-slate-200` with Lucide `QrCode` / `Scan` icon.
- **Search CTA Button**: `bg-[#1F4E79] hover:bg-[#163C78] text-white font-bold px-6 py-2.5 rounded-xl shadow-md`.

### C. Live Camera QR / Barcode Scanner Modal UI Layout

```
┌────────────────────────────────────────────────────────────┐
│ SCAN WAYBILL OR CONTAINER BARCODE                      [X] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│       ┌────────────────────────────────────────────┐       │
│       │ ┌─                                      ─┐ │       │
│       │                                            │       │
│       │            [ LIVE CAMERA FEED ]            │       │
│       │                                            │       │
│       │ └─                                      ─┘ │       │
│       └────────────────────────────────────────────┘       │
│            Position barcode inside the viewfinder          │
│                                                            │
│  [ Upload Image File ]                    [ Cancel ]       │
└────────────────────────────────────────────────────────────┘
```

---

## 3. SHIPMENT SUMMARY CARD STRUCTURE & TOKEN BINDINGS

The summary card aggregates top-level shipment telemetry into a high-contrast enterprise card structure.

### A. Summary Card ASCII Wireframe Layout

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  AJA LOGISTICS  │  OCEAN FREIGHT (FCL)                      [ ● IN TRANSIT — LIVE ]  [Copy Link]  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                  │
│  TRACKING NUMBER                                CARRIER & VESSEL                                 │
│  AJA-882910-KSA [Icon: Copy]                    Maersk Line — Maersk Mc-Kinney Møller (2608E)    │
│                                                                                                  │
│  ORIGIN                                         DESTINATION                                      │
│  🇨🇳 Shanghai Port, China (CNSHA)                 🇸🇦 Riyadh Dry Port, Saudi Arabia (SARIY)          │
│                                                                                                  │
│  ESTIMATED ARRIVAL (ETA)                        CONFIDENCE INDEX                                 │
│  Aug 05, 2026 (7 Days Remaining)                [██████████████████░░] 94% High Confidence      │
│                                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Service Level: Express Priority  │  Last Telemetry Update: 12 mins ago  │  Container: MSCU9281048  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### B. Summary Card Token Binding Matrix

| Visual Element | Token Path | Applied Value / CSS | Purpose |
| :--- | :--- | :--- | :--- |
| **Card Surface** | `tokens.colors.surfaces.primary` | `#FFFFFF` | Base clean card surface |
| **Card Border** | `tokens.colors.neutral[200]` | `#E2E8F0` | Structural card outline |
| **Elevation Shadow**| `tokens.elevation.level2` | `0 4px 6px -1px rgba(...)` | Gentle depth separation |
| **Tracking ID Font**| `tokens.typography.styles.trackingNumber` | JetBrains Mono 18px 700 | Monospace data clarity |
| **In Transit Badge**| `tokens.colors.logisticsStatus.inTransit` | `#1F4E79` / `#E4ECF3` | Active status tag |
| **Delivered Badge** | `tokens.colors.logisticsStatus.delivered` | `#3F7D58` / `#F2F8F4` | Completed status tag |
| **Customs Badge** | `tokens.colors.logisticsStatus.customs` | `#A66A22` / `#FAF3EA` | Border clearance tag |
| **Delayed Badge** | `tokens.colors.logisticsStatus.delayed` | `#B84040` / `#FAF0F0` | Delay exception tag |

---

## 4. INTERACTIVE TIMELINE COMPONENT SPECIFICATION

The interactive timeline represents the 10-stage lifecycle of multimodal shipments.

### A. Lifecycle Stages & Milestone Matrix

| Stage # | Lifecycle Milestone Name | Lucide Icon | Milestone Description (Bilingual) |
| :---: | :--- | :--- | :--- |
| **1** | **Order Created** | `FilePlus` | تم إنشاء أمر الشحن وتأكيد الحجز / Cargo order registered & booking confirmed. |
| **2** | **Documents Verified** | `FileCheck` | تم فحص وتدقيق الوثائق الجمركية / Commercial and customs documents verified. |
| **3** | **Picked Up** | `PackageCheck` | تم استلام الشحنة من المصنع / Cargo picked up from shipper facility. |
| **4** | **Arrived at Warehouse** | `Warehouse` | وصلت الشحنة إلى مركز التجميع / Arrived at AJA consolidation hub. |
| **5** | **Customs Clearance** | `ShieldCheck` | جاري الفسح الجمركي عبر فسح / Customs clearance under Fasah portal. |
| **6** | **Departed Origin** | `Ship` / `Plane` | غادرت السفينة ميناء المغادرة / Departure from origin terminal confirmed. |
| **7** | **In Transit (Live)** | `Navigation` | الشحنة في الإبحار والترانزيت / Active transit along maritime corridor. |
| **8** | **Arrived at Destination**| `Anchor` / `Building`| وصلت الشحنة إلى ميناء الوصول / Arrived at destination port of entry. |
| **9** | **Out for Delivery** | `Truck` | الشحنة على متن شاحنة التوصيل / Dispatched on local fleet for delivery. |
| **10** | **Delivered (POD)** | `CheckCircle2` | تم التسليم النهائي وتوقيع POD / Delivered successfully; POD signed. |

### B. Visual Breakdown for Status Steps

1. **Pending / Upcoming Step**:
   - Node: 40×40px circle, `#F1F5F9` background, 1.5px `#CBD5E1` border.
   - Icon: `Circle` or `Clock` in muted slate (`#94A3B8`).
   - Connecting Line: 1.5px light gray line (`#E2E8F0`).
2. **Active / In Transit Step**:
   - Node: 44×44px circle, solid `#1F4E79` background, white transport icon (`Truck`, `Ship`, `Plane`).
   - Glow Effect: Pulsing aura (`ring-4 ring-[#1F4E79]/25 animate-pulse`).
   - Connecting Line: Active blue gradient or solid `#1F4E79`.
   - Data Sub-Card: Live satellite GPS coordinates, vessel/truck speed, current maritime corridor.
3. **Customs Processing Step**:
   - Node: 44×44px circle, `#A66A22` gold background, white `ShieldCheck` icon.
   - Tag: `#FAF3EA` background with Fasah declaration ID (`Fasah Declaration #FS-991024`).
4. **Delivered / Completed Step**:
   - Node: 40×40px circle, solid `#3F7D58` green background, white `CheckCircle2` icon.
   - Connecting Line: Solid `#3F7D58` line.
   - Action: Clickable link to verified Electronic Proof of Delivery (ePOD).
5. **Exception / Delayed Step**:
   - Node: 44×44px circle, solid `#B84040` red background, white `AlertTriangle` icon.
   - Glow Effect: Red pinging aura (`ring-4 ring-[#B84040]/30 animate-ping`).

### C. Milestone State Determination Logic

```typescript
export type MilestoneState = 'completed' | 'active' | 'pending' | 'exception';

export function calculateMilestoneState(
  stepIndex: number,
  currentStageIndex: number,
  hasException: boolean
): MilestoneState {
  if (hasException && stepIndex === currentStageIndex) {
    return 'exception';
  }
  if (stepIndex < currentStageIndex) {
    return 'completed';
  }
  if (stepIndex === currentStageIndex) {
    return 'active';
  }
  return 'pending';
}
```

---

## 5. ACCESSIBILITY (WCAG 2.2 AA) & SCREEN READER LABELING

To guarantee complete accessibility for keyboard users and screen readers (NVDA, VoiceOver, JAWS):

### A. Semantic DOM & ARIA Labeling Matrix

```html
<nav aria-label="Shipment Progress Timeline" role="region">
  <!-- ARIA Live Region for Real-Time Status Announcements -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    Shipment AJA-882910-KSA status update: Currently In Transit at Red Sea Corridor. Estimated arrival August 05, 2026.
  </div>

  <ol role="list" class="flex flex-col md:flex-row items-center w-full">
    <!-- Completed Milestone -->
    <li role="listitem" class="relative flex-1">
      <button 
        type="button"
        aria-expanded="false" 
        aria-controls="milestone-details-1"
        aria-label="Step 1 of 10: Order Created. Status: Completed on July 10, 2026 at 09:00 AM."
        class="focus:outline-none focus:ring-2 focus:ring-[#1F4E79] focus:ring-offset-2 rounded-full"
      >
        <span class="sr-only">Stage 1: Completed</span>
        <div class="w-10 h-10 rounded-full bg-[#3F7D58] text-white flex items-center justify-center">
          <svg class="w-5 h-5" aria-hidden="true"><!-- CheckCircle2 Icon --></svg>
        </div>
      </button>
      <div id="milestone-details-1" hidden class="mt-2 text-xs text-slate-600">
        Booking confirmed — Shanghai Port Terminal
      </div>
    </li>

    <!-- Active Milestone -->
    <li role="listitem" class="relative flex-1" aria-current="step">
      <button 
        type="button"
        aria-expanded="true" 
        aria-controls="milestone-details-7"
        aria-label="Step 7 of 10: Current Active Stage — In Transit. Location: Red Sea Maritime Corridor. Vessel: Maersk Mc-Kinney Møller."
        class="focus:outline-none focus:ring-2 focus:ring-[#1F4E79] focus:ring-offset-2 rounded-full"
      >
        <span class="sr-only">Current Active Stage</span>
        <div class="w-11 h-11 rounded-full bg-[#1F4E79] text-white flex items-center justify-center ring-4 ring-[#1F4E79]/25 animate-pulse">
          <svg class="w-6 h-6" aria-hidden="true"><!-- Navigation Icon --></svg>
        </div>
      </button>
      <div id="milestone-details-7" class="mt-2 text-xs font-bold text-[#1F4E79]">
        Active Transit — Red Sea Corridor (Vessel Speed: 18.4 Knots)
      </div>
    </li>
  </ol>
</nav>
```

### B. Keyboard Navigation Rules
- **Tab Sequence**: `Tab` key moves focus directly to the current active step node (`aria-current="step"`).
- **Arrow Navigation**: `ArrowRight` / `ArrowDown` moves focus to the next milestone node; `ArrowLeft` / `ArrowUp` moves focus to the previous node.
- **Activation**: `Space` or `Enter` toggles disclosure of expanded stage notes (Fasah ID, vessel coordinates, ePOD download).

---

## 6. RESPONSIVE REFLOW SPECIFICATION

- **Desktop View (`≥1024px`)**: Renders horizontal 10-node stepper layout. Connected by horizontal step lines with hover tooltips and active telemetry card below.
- **Mobile & Tablet View (`<1024px`)**: Reflows into a vertical linear timeline with left-aligned (LTR) or right-aligned (RTL) vertical connector lines. Each step acts as an expandable accordion button with a minimum touch bounding box of 44×44px.

---

## 7. ARCHITECTURAL COMPLIANCE VERIFICATION

This specification document is fully aligned with `/src/design-system/tokens.ts`, `/ENTERPRISE_SMART_TRACKING_EXPERIENCE.md`, `/SMART_SHIPMENT_TRACKING_SPECIFICATION.md`, and `/TRACKING_TIMELINE_COMPONENT_SPECIFICATION.md`. All tokens, wireframes, state logic, and accessibility standards are verified and ready for production execution.
