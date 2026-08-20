# AJA INTERNATIONAL LOGISTICS — TRACKING TIMELINE COMPONENT SPECIFICATION

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL SCOPE

This specification details the design, state logic, visual hierarchy, accessibility, and token bindings for the **Tracking Timeline Component** of **AJA International Logistics**. Serving as the visual heartbeat of the Smart Shipment Tracking experience, this component renders the 10-stage lifecycle of multimodal shipments (Ocean, Air, Overland GCC, Customs Brokerage) across all AJA digital channels: Public Web (`/tracking`), Customer Portal, Operations Dashboard, and PWA Mobile App.

The component is engineered in strict compliance with the **AJA Centralized Design System** (`/src/design-system/tokens.ts`) and meets WCAG 2.2 Level AA accessibility standards.

---

## 2. DESIGN SYSTEM TOKEN BINDING MATRIX

Every visual element of the Tracking Timeline is bound directly to predefined design tokens. Hardcoded hex colors, arbitrary spacing, or inline font overrides are strictly forbidden.

| Timeline Element | Token Path | Token Value | Operational & Design Purpose |
| :--- | :--- | :--- | :--- |
| **Completed Step Node (BG)** | `tokens.colors.semantic.success.main` | `#3F7D58` | Solid success fill for finished milestones |
| **Completed Step Node (Icon)**| `tokens.colors.surfaces.primary` | `#FFFFFF` | Crisp white checkmark/icon contrast |
| **Completed Connector Line**| `tokens.colors.semantic.success.main` | `#3F7D58` | Solid green connecting bar |
| **Active Step Node (BG)** | `tokens.colors.semantic.info.main` | `#1F4E79` (`secondary.700`) | Primary brand highlight for current status |
| **Active Step Glow Aura** | `tokens.colors.semantic.info.bg` | `#E4ECF3` / 20% opacity | Pulsing ring aura (`ring-4 ring-[#1F4E79]/20`) |
| **Active Connector Line** | `tokens.colors.semantic.info.main` | `#1F4E79` | Active transit path color |
| **Pending Step Node (BG)** | `tokens.colors.neutral[100]` | `#F1F5F9` | Neutral muted base for upcoming steps |
| **Pending Step Node (Border)**| `tokens.colors.neutral[300]` | `#CBD5E1` | 1.5px subtle outline for upcoming nodes |
| **Pending Step Node (Icon)**| `tokens.colors.neutral[400]` | `#94A3B8` | Muted icon indicator for unreached stages |
| **Pending Connector Line** | `tokens.colors.neutral[200]` | `#E2E8F0` | Light gray line representing future path |
| **Customs Step Node (BG)** | `tokens.colors.semantic.warning.main` | `#A66A22` | Warning gold for border inspection/hold |
| **Customs Badge BG** | `tokens.colors.semantic.warning.bg` | `#FAF3EA` | Soft background for Fasah customs tag |
| **Exception Step Node (BG)** | `tokens.colors.semantic.danger.main` | `#B84040` | High-contrast danger red for delays |
| **Stage Title Typography** | `tokens.typography.styles.heading4` | Plus Jakarta Sans 16px 700 | Primary stage title font |
| **Timestamp Typography** | `tokens.typography.styles.caption` | Monospace 12px 500 | Tabular date/time formatting |
| **Container Padding** | `tokens.spacing.lg` (24px) | `p-6 lg:p-8` | Outer bounding box padding |
| **Card Border Radius** | `tokens.radii.xl` (16px) | `rounded-2xl` | Smooth corner radius |

---

## 3. VISUAL BREAKDOWN OF PRIMARY STATUS STEPS

The timeline classifies every lifecycle event into 5 distinct visual states. Non-color visual indicators (icons, borders, badges, pulsing animations) are used alongside color tokens to guarantee readability for color-blind users.

### A. Pending / Upcoming State (مرحلة قادمة)
- **Node Styling**: 40×40px circle (`w-10 h-10`), background `#F1F5F9`, border 1.5px `#CBD5E1`.
- **Icon**: Inactive Lucide icon (e.g. `Circle` or `Clock`), tinted `#94A3B8`.
- **Connecting Line**: `#E2E8F0` (1.5px neutral track).
- **Typography**: Muted text (`#64748B`), caption reads "Scheduled" or "Estimated [Date]".
- **Interactivity**: Non-interactive or subtle hover opacity showing projected arrival window.

### B. In Transit / Active State (قيد النقل — المرحلة الحالية)
- **Node Styling**: 44×44px circle (`w-11 h-11`), solid background `#1F4E79`, white Lucide icon (`Truck`, `Ship`, or `Plane`).
- **Glow Aura**: Continuous pulsing animation (`animate-pulse ring-4 ring-[#1F4E79]/25`).
- **Connecting Line**: Transitioning gradient or solid `#1F4E79`.
- **Typography**: Bold primary text (`#0F172A`), active stage badge (`[ LIVE TELEMETRY ]` or `[ IN TRANSIT ]`).
- **Data Sub-Card**: Displays live GPS coordinates, vessel/truck speed, current corridor (e.g. "Red Sea Maritime Corridor"), and timestamp.

### C. Customs Processing State (التخليص الجمركي)
- **Node Styling**: 44×44px circle (`w-11 h-11`), background `#A66A22`, white `FileCheck` icon.
- **Customs Badge**: `#FAF3EA` background with `#5C3A12` text, displaying Fasah Declaration ID (e.g. `Fasah Declaration #FS-991024`).
- **Typography**: Amber highlight heading, status note: "Customs declaration submitted; inspection in progress at Jeddah Port".

### D. Delivered / Completed State (مكتملة — تم التسليم)
- **Node Styling**: 40×40px circle (`w-10 h-10`), background `#3F7D58`, white `CheckCircle2` icon.
- **Connecting Line**: Solid `#3F7D58` indicating verified completed transit.
- **Typography**: High-contrast text (`#1E462E`), displays actual completion timestamp and signed Electronic Proof of Delivery (ePOD) link.

### E. Exception / Delayed Override State (تأخير / حالة استثنائية)
- **Node Styling**: 44×44px circle (`w-11 h-11`), background `#B84040`, white `AlertTriangle` icon.
- **Glow Aura**: Red warning ring (`ring-4 ring-[#B84040]/30 animate-ping`).
- **Typography**: Red danger text (`#6B2222`), displays operational cause (e.g. "Port congestion delay: +24 hrs estimated") and recommended customer action.

---

## 4. MILESTONE STATE LOGIC MATRIX

The component dynamically calculates the state of each node in the 10-stage array (`stages[0...9]`) based on the master shipment's `currentStageIndex` and `exceptionFlag`.

```typescript
// Milestone State Determination Logic
export type StepState = 'completed' | 'active' | 'pending' | 'exception';

export function getStepState(
  stepIndex: number,
  currentStageIndex: number,
  isException: boolean
): StepState {
  if (isException && stepIndex === currentStageIndex) {
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

### Visual & Behavior State Matrix

| Step State | Node Background | Icon Name | Connector Line | Animation Class | Accessibility ARIA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Completed** | `tokens.semantic.success.main` (`#3F7D58`) | `CheckCircle2` | `bg-[#3F7D58]` | None | `aria-label="Completed step: [Stage Name]"` |
| **Active** | `tokens.semantic.info.main` (`#1F4E79`) | Stage Icon | `bg-[#1F4E79]` | `animate-pulse` | `aria-current="step" aria-label="Current active step: [Stage Name]"` |
| **Pending** | `tokens.neutral[100]` (`#F1F5F9`) | `Circle` | `bg-[#E2E8F0]` | None | `aria-label="Upcoming step: [Stage Name]"` |
| **Exception** | `tokens.semantic.danger.main` (`#B84040`) | `AlertTriangle`| `bg-[#B84040]` | `animate-ping` | `aria-invalid="true" aria-label="Delayed step: [Stage Name]"` |

---

## 5. ASCII ANATOMICAL WIREFRAMES

### A. Desktop Horizontal Stepper Wireframe (`lg` screens ≥1024px)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SHIPMENT TIMELINE — AJA-882910-KSA                                                       [ Mode: Ocean FCL ]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                │
│   (✓) ─────── (✓) ─────── (✓) ─────── (✓) ─────── (✓) ─────── (✓) ─────── (●) ─────── (○) ─────── (○) ─────── (○) │
│  Order      Docs        Picked      Warehouse   Customs     Departed   IN TRANSIT   Arrived    Out For    Delivered│
│  Created    Verified    Up          Arrival     Clearance   Origin     (Active)     Port       Delivery   (POD)    │
│  Jul 10     Jul 11      Jul 12      Jul 13      Jul 14      Jul 15     Jul 18       Est. Aug 2 Est. Aug 4 Est. Aug 5│
│                                                                            │                                   │
│                                                     ┌──────────────────────┴──────────────────────┐            │
│                                                     │ CURRENT ACTIVE LOCATION & TELEMETRY         │            │
│                                                     │ Position: Red Sea (Lat 21.54, Long 38.91)    │            │
│                                                     │ Vessel: Maersk Mc-Kinney Møller (18.4 knots) │            │
│                                                     │ Est. Port Arrival: Aug 02, 2026 (08:00 AST)   │            │
│                                                     └─────────────────────────────────────────────┘            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### B. Mobile Vertical Timeline Wireframe (`sm`/`md` screens <1024px)

```
┌────────────────────────────────────────────────────────────────────────┐
│ SHIPMENT TIMELINE                                  [ IN TRANSIT ]      │
├────────────────────────────────────────────────────────────────────────┤
│  (✓) STAGE 05 — CUSTOMS CLEARANCE RELEASED                             │
│   │   Location: Jeddah Islamic Port, Saudi Arabia                      │
│   │   Time: Jul 14, 2026 — 16:20 AST                                   │
│   │   Ref: Fasah Declaration #FS-991024                                │
│   │                                                                    │
│  (●) STAGE 06 — IN TRANSIT (LIVE SATELLITE TELEMETRY)                  │
│   │   Location: Red Sea Maritime Transit Corridor                      │
│   │   Speed: 18.4 Knots  •  Heading: 145° SSE                          │
│   │   Vessel: Maersk Mc-Kinney Møller (Voyage 2608E)                   │
│   │   [ View Live Coordinates on Map ]                                 │
│   │                                                                    │
│  (○) STAGE 07 — ARRIVED AT DESTINATION PORT                            │
│   │   Location: Riyadh Dry Port, Saudi Arabia                          │
│   │   Estimated Arrival: Aug 02, 2026 — 08:00 AST                      │
│   │                                                                    │
│  (○) STAGE 08 — DELIVERED SUCCESSFULLY (POD)                           │
│       Location: Consignee Warehouse — Riyadh                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. ACCESSIBILITY (WCAG 2.2 AA) & SCREEN READER SPECIFICATIONS

To ensure complete usability for users relying on screen readers, keyboard navigation, or high-contrast modes:

### A. Semantic DOM & ARIA Structure
```html
<nav aria-label="Shipment Progress Timeline" role="region">
  <!-- Live Region for Real-time Status Announcements -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    Shipment AJA-882910-KSA current status updated to In Transit at Red Sea Corridor. Estimated delivery August 05.
  </div>

  <ol role="list" class="timeline-container">
    <li role="listitem" class="timeline-step">
      <button 
        aria-expanded="false" 
        aria-controls="step-details-1"
        aria-label="Step 1 of 10: Order Created. Completed on July 10, 09:00 AM."
      >
        <span class="sr-only">Completed</span>
        <!-- Node Visual -->
      </button>
      <div id="step-details-1" hidden>...</div>
    </li>

    <li role="listitem" class="timeline-step" aria-current="step">
      <button 
        aria-expanded="true" 
        aria-controls="step-details-7"
        aria-label="Step 7 of 10: Current Active Step — In Transit. Location: Red Sea Maritime Corridor."
      >
        <span class="sr-only">Current Active Stage</span>
        <!-- Active Pulsing Node Visual -->
      </button>
      <div id="step-details-7">...</div>
    </li>
  </ol>
</nav>
```

### B. Keyboard Navigation Rules
- **Tab Flow**: User can `Tab` into the timeline container. Focus lands on the active stage node (`aria-current="step"`).
- **Arrow Keys (`ArrowRight` / `ArrowLeft` / `ArrowDown` / `ArrowUp`)**: Moves focus sequentially between milestone step nodes.
- **Enter / Space**: Toggles expand/collapse for extended milestone metadata (operator notes, Fasah declaration link, ePOD link).

### C. Color-Blindness & High Contrast Safety
- No state relies solely on hue. Completed stages feature checkmark icons (`CheckCircle2`), active stages feature pulsing transport icons (`Truck`/`Ship`), customs features document icons (`FileCheck`), and errors feature triangles (`AlertTriangle`).
- Contrast ratio between text and background exceeds 4.5:1 (WCAG AA) across both light and dark surface modes.

---

## 7. RESPONSIVE REFLOW & INTERACTION STATES

1. **Breakpoint Adaptation**:
   - `Desktop (≥1024px)`: Renders horizontal 10-node stepper layout. Active step details render in a floating telemetry card directly beneath the active node.
   - `Mobile & Tablet (<1024px)`: Automatically reflows into a vertical linear timeline with vertical connecting lines. Each step presents an expandable accordion row for touch interaction.
2. **Interactive Node States**:
   - `Default`: Standard node background and border based on step state.
   - `Hover`: Node expands slightly (`scale-105`), border highlights with `tokens.colors.forms.focusRing` (`#1F4E79`).
   - `Focus-Visible`: Displays crisp 2px focus outline (`ring-2 ring-[#1F4E79] ring-offset-2`).
   - `Active/Pressed`: Node depresses (`scale-95`).

---

## 8. SUMMARY & INTEGRATION READY

This specification completes the design, UI wireframes, token mapping, state logic, and accessibility rules for the **Tracking Timeline Component**. It is fully bound to `/src/design-system/tokens.ts` and ready for immediate frontend component rendering.
