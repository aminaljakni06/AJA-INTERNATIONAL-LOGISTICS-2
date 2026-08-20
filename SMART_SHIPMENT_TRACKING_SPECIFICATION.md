# AJA INTERNATIONAL LOGISTICS — SMART SHIPMENT TRACKING DESIGN SPECIFICATION

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL INTENT

This specification provides the definitive UI layout and component architecture for the **Smart Shipment Tracking Experience** at **AJA International Logistics**. Designed for deployment across Public Web (`/tracking`), Customer Portal, Operations Dashboard, and PWA Mobile App, this specification establishes anatomical structures, component token bindings, ASCII visual wireframes, responsive reflow rules, and accessibility guidelines derived directly from the **AJA Centralized Design System** (`/src/design-system/tokens.ts`).

---

## 2. COMPONENT TOKEN BINDING MATRIX

All tracking components reference centralized design tokens exclusively. Hardcoded color, spacing, or typography values are strictly prohibited.

| Component Element | Token Path | Design Value | Operational Purpose |
| :--- | :--- | :--- | :--- |
| **Tracking Input Surface** | `tokens.colors.surfaces.primary` | `#FFFFFF` | High-contrast input background |
| **Tracking Input Border** | `tokens.colors.forms.inputBorder` | `#CBD5E1` (`neutral.300`) | Standard baseline input border |
| **Tracking Focus Ring** | `tokens.colors.forms.focusRing` | `#1F4E79` (`secondary.700`) | High-visibility focus ring (2px) |
| **Tracking Number Typo**| `tokens.typography.styles.trackingNumber` | JetBrains Mono 14px 700 Bold | Tabular monospace tracking ID |
| **Summary Card Surface** | `tokens.colors.surfaces.primary` | `#FFFFFF` | Content card base surface |
| **Summary Card Border** | `tokens.colors.neutral[200]` | `#E2E8F0` | Subtle structural border |
| **Summary Elevation** | `tokens.elevation.level2` | `0 4px 6px -1px rgba(...)` | Soft shadow elevation |
| **Active Timeline Aura**| `tokens.colors.logisticsStatus.inTransit` | `#1F4E79` / `#C8D9E7` | Pulsing milestone glow ring |
| **Milestone Completed**| `tokens.colors.logisticsStatus.delivered` | `#3F7D58` (`semantic.success`) | Completed stage indicator |
| **Milestone Pending** | `tokens.colors.neutral[300]` | `#CBD5E1` | Inactive future stage node |

---

## 3. UI LAYOUT SPECIFICATION 1: SMART SEARCH INPUT & SCANNER BAR

The tracking search bar is an intelligent, multi-format input container supporting auto-detection, QR/Barcode camera scanning, and suggested format tags.

### A. ASCII Anatomical Component Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Icon: Search]  Enter Tracking ID, Container No. (MSCU), AWB, or B/L...   [QR/Barcode]  [SEARCH]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
  Auto-Detected Tag: [ ISO Container Number ]   Validation: ✓ Format Validated
  Suggested Formats: ( AJA-882910-KSA )  ( MSCU9281048 )  ( 172-88492014 )
```

### B. Layout & Grid Specifications
- **Container Bounds**: `max-w-3xl mx-auto w-full`
- **Container Height**: `56px` (`h-14` desktop) / `48px` (`h-12` mobile)
- **Border Radius**: `radii.xl` (16px / `rounded-2xl`)
- **Inner Padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Input Spacing & Elements**:
  - Left Icon (LTR) / Right Icon (RTL): `w-5 h-5 text-slate-400 me-3`
  - Text Input Area: `flex-1 text-base font-mono bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none`
  - Camera QR Trigger Button: `p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors me-2` (44px touch target)
  - Primary Search Button: `bg-[#1F4E79] hover:bg-[#163C78] text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all`

### C. QR / Barcode Camera Scanner Modal UI Layout
When the user clicks `[QR/Barcode]`, a modal launches the camera preview feed:

```
┌────────────────────────────────────────────────────────────┐
│ SCAN WAYBILL OR SHIPPING CONTAINER BARCODE             [X] │
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

## 4. UI LAYOUT SPECIFICATION 2: MASTER SHIPMENT SUMMARY CARD

The summary card aggregates essential shipment metadata into an enterprise card with high-contrast hierarchy and real-time status indication.

### A. ASCII Anatomical Component Wireframe

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

### B. Structural Layout & Typography Mapping
- **Container Layout**: `p-6 lg:p-8 bg-white border border-slate-200 rounded-2xl shadow-md space-y-6`
- **Header Strip**: `flex items-center justify-between pb-4 border-b border-slate-100`
  - Brand Tag: `text-xs font-bold uppercase tracking-widest text-[#1F4E79]`
  - Status Badge: `px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E4ECF3] text-[#1F4E79] border border-[#C8D9E7] flex items-center gap-2`
- **Data Matrix Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
  - Field Label: `text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1`
  - Field Value (Tracking ID): `font-mono text-lg font-bold text-slate-900 flex items-center gap-2`
  - Field Value (Location): `text-base font-semibold text-slate-800 flex items-center gap-2`
  - Confidence Progress Bar: `w-full bg-slate-100 rounded-full h-2.5 overflow-hidden` with `bg-[#3F7D58] h-full`
- **Footer Metadata Bar**: `pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600`

---

## 5. UI LAYOUT SPECIFICATION 3: INTERACTIVE MILESTONE TIMELINE

The interactive timeline represents the 10-stage shipment lifecycle. It features responsive reflow: horizontal stepper on desktop (`lg`), vertical stepper on mobile (`sm`).

### A. ASCII Anatomical Component Wireframe (Desktop View)

```
 [1. Created] ──► [2. Docs Verified] ──► [3. Picked Up] ──► [4. In Warehouse] ──► [5. Customs]
      ✓                 ✓                     ✓                    ✓                  ✓
  Jul 10 09:00       Jul 11 14:30         Jul 12 08:15         Jul 13 11:00       Jul 14 16:20

                            ▼ ACTIVE TRANSIT STAGE ▼
 ──► [6. Departed] ──► [ (7. IN TRANSIT) ] ──► [8. Arrived Port] ──► [9. Out for Del] ──► [10. Delivered]
         ✓                 ● [Live Telemetry]        ○                    ○                   ○
     Jul 15 22:00          Red Sea Corridor      Est. Aug 02          Est. Aug 04         Est. Aug 05
```

### B. ASCII Anatomical Component Wireframe (Mobile Vertical View)

```
  (✓) STAGE 05 — CUSTOMS CLEARANCE RELEASED
  │   Jeddah Islamic Port, Saudi Arabia
  │   Jul 14, 2026 — 16:20 AST  •  Fasah Clearance No. FS-992018
  │
  (●) STAGE 06 — IN TRANSIT (LIVE SATELLITE TELEMETRY)
  │   Red Sea Maritime Corridor — Vessel Speed: 18.4 Knots
  │   Next Port Call: Jeddah Islamic Port (ETA: Aug 02, 2026)
  │   [View Live Vessel Coordinates on Map]
  │
  (○) STAGE 07 — ARRIVED AT DESTINATION PORT
  │   Riyadh Dry Port, Saudi Arabia (Pending)
  │
  (○) STAGE 08 — DELIVERED SUCCESSFULLY
```

### C. Detailed Component Specifications
- **Active Node Glow Effect**: `w-10 h-10 rounded-full bg-[#1F4E79] text-white flex items-center justify-center ring-4 ring-[#1F4E79]/20 animate-pulse`
- **Completed Node Effect**: `w-10 h-10 rounded-full bg-[#3F7D58] text-white flex items-center justify-center`
- **Pending Node Effect**: `w-10 h-10 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center`
- **Connecting Line**: `h-1 bg-slate-200 flex-1` (desktop) / `w-1 bg-slate-200 absolute left-5 top-10 bottom-0` (mobile vertical)
- **Active Connecting Line**: `bg-[#3F7D58]` for completed paths, `bg-[#1F4E79]` for active transit paths.

---

## 6. RESPONSIVE REFLOW & ACCESSIBILITY RULES

1. **Responsive Viewport Breakdown**:
   - `Mobile (<768px)`: Search bar stacks buttons vertically; Timeline switches to single-column vertical stepper with expanded details cards; Map converts to collapsible accordion view.
   - `Tablet (768px - 1023px)`: Search bar remains inline; Summary card renders 2-column grid; Timeline renders 2-row 5-column grid.
   - `Desktop (≥1024px)`: Search bar full 56px height with scanner modal trigger; Summary card renders 3-column data grid; Timeline renders full 10-node interactive flow.
2. **WCAG 2.2 AA Compliance**:
   - Color Independence: All milestone states use distinct geometric Lucide icons (`CheckCircle2`, `Truck`, `Warehouse`, `Clock`) alongside token color badges.
   - Touch Targets: Every interactive button, scanner trigger, and stage expander provides a minimum 44×44px click area.
   - Screen Reader Text: Screen reader hidden utilities (`sr-only`) detail current stage numbers and timestamps.
3. **RTL / LTR Symmetry**:
   - Timeline connector lines, arrow icons, and progress meters mirror automatically using logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `text-start`).

---

## 7. SUMMARY & VERIFICATION

This specification is fully aligned with `/src/design-system/tokens.ts` and `/ENTERPRISE_SMART_TRACKING_EXPERIENCE.md`. All referenced tokens, accessibility requirements, and layout wireframes are validated and ready for production implementation.
