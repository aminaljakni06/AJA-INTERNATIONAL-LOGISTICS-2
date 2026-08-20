# AJA INTERNATIONAL LOGISTICS — STEP 02: ENTERPRISE COLOR SYSTEM REFERENCE

## 1. BRAND PALETTE & ARCHITECTURE

The AJA Enterprise Color System is constructed on a refined, high-contrast palette anchored by **Anthracite Gray**, **Gentian Blue**, and **Pure White**. Every shade is engineered for high legibility, professional authority, and WCAG 2.2 AA compliance.

### Core Brand Colors

| Token Name | Hex Code | OKLCH Equivalent | Brand Role & Strategic Function |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | `#2F3437` | `oklch(0.31 0.01 240)` | **Anthracite Gray**: Dominant corporate tone representing structural stability, heavy logistics infrastructure, and enterprise gravity. |
| **Secondary Brand** | `#1F4E79` | `oklch(0.42 0.09 248)` | **Gentian Blue**: Global maritime blue representing connectivity, trust, maritime routes, and primary actions. |
| **Brand Accent** | `#1F4E79` / `#FFFFFF` | `oklch(0.42 0.09 248)` | **Action Accent**: Strictly capped at ≤5% interface usage for primary focal points (e.g. Instant Quote button, Active Tracking badge). |
| **Pure White** | `#FFFFFF` | `oklch(1.00 0.00 0.00)` | **Pure White**: High-contrast canvas for content cards, data tables, and elevated components. |
| **Light BG** | `#F8FAFC` | `oklch(0.98 0.00 240)` | **Light Surface Background**: Clean neutral backdrop that prevents eye fatigue. |

---

## 2. NEUTRAL PALETTE SCALE

| Shade | Hex Code | WCAG Contrast on `#FFFFFF` | Recommended Usage |
| :--- | :--- | :--- | :--- |
| `neutral-50` | `#F8FAFC` | 1.05:1 | Main page background (Light Theme Surface) |
| `neutral-100` | `#F1F5F9` | 1.12:1 | Card backgrounds, table headers, hover backdrops |
| `neutral-200` | `#E2E8F0` | 1.30:1 | Light borders, subtle dividers, inactive tabs |
| `neutral-300` | `#CBD5E1` | 1.65:1 | Input default borders, secondary dividers |
| `neutral-400` | `#94A3B8` | 2.50:1 | Placeholders, disabled text, inactive icons |
| `neutral-500` | `#64748B` | 4.60:1 (AA) | Muted text, secondary metadata, caption labels |
| `neutral-600` | `#475569` | 7.10:1 (AAA) | Secondary body text, table data labels |
| `neutral-700` | `#334155` | 10.20:1 (AAA) | Subheadings, high-contrast labels, form labels |
| `neutral-800` | `#2F3437` | 12.80:1 (AAA) | Base Anthracite surface, dark cards, section headers |
| `neutral-900` | `#1E293B` | 16.10:1 (AAA) | Primary dark canvas, dark header background |
| `neutral-950` | `#0F172A` | 18.20:1 (AAA) | High-contrast dark typography, overlay backdrops |

---

## 3. SURFACE SYSTEM

| Surface Token | Hex / Value | Context & Application |
| :--- | :--- | :--- |
| `surfaces.primary` | `#FFFFFF` | Primary content cards, modal windows, search panels |
| `surfaces.secondary` | `#F8FAFC` | Main application backdrop, secondary sections |
| `surfaces.elevated` | `#FFFFFF` | Floating dropdowns, tooltips, sticky navigation bars |
| `surfaces.dark` | `#2F3437` | Dark feature sections, hero banners, footer containers |
| `surfaces.darkElevated` | `#3A4145` | Hover states on dark cards, elevated dark widgets |
| `surfaces.overlay` | `rgba(15, 23, 42, 0.6)` | Modal backdrops, drawer overlays |
| `surfaces.hero` | `#2F3437` | Top banner & interactive 3D logistics stage frame |

---

## 4. TEXT TYPOGRAPHY COLOR SYSTEM

| Text Token | Hex Code | Minimum Contrast | Rules & Guidelines |
| :--- | :--- | :--- | :--- |
| `text.primary` | `#0F172A` | 18.2:1 (AAA) | Main body copy, primary page titles, table data |
| `text.secondary` | `#475569` | 7.1:1 (AAA) | Supporting text, descriptions, field subtitles |
| `text.muted` | `#64748B` | 4.6:1 (AA) | Timestamps, metadata, micro-captions |
| `text.inverse` | `#FFFFFF` | 12.8:1 (AAA) | Text on Anthracite `#2F3437` and Gentian Blue `#1F4E79` |
| `text.disabled` | `#94A3B8` | 2.5:1 | Form disabled state text only |
| `text.link` | `#1F4E79` | 8.5:1 (AAA) | Interactive hyperlinks (with underline or arrow icon) |

*Rule: Never use `brand.primary` (`#2F3437`) or `brand.secondary` (`#1F4E79`) for long multi-paragraph body copy; reserve body copy for `text.primary` (`#0F172A`).*

---

## 5. ICONOGRAPHY COLOR SYSTEM

| Icon Category | Token Hex | Associated Purpose |
| :--- | :--- | :--- |
| `icons.navigation` | `#1F4E79` | Header & mobile nav icons |
| `icons.service` | `#1F4E79` | Maritime, Air Freight, Trucking, Customs icons |
| `icons.feature` | `#1F4E79` | Benefit items, process steps |
| `icons.dashboard` | `#2F3437` | Admin & customer portal navigation icons |
| `icons.tracking` | `#1F4E79` | Telemetry & route step icons |
| `icons.social` | `#64748B` | Footer social link vectors |

---

## 6. BUTTON STATES & SYSTEM

| Button Variant | Default State | Hover State | Active State | Focus Ring | Text Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | `#1F4E79` | `#163C78` | `#102E5C` | `#1F4E79` (2px) | `#FFFFFF` |
| **Secondary** | `#2F3437` | `#25292C` | `#1D2022` | `#2F3437` (2px) | `#FFFFFF` |
| **Outline** | `Transparent` / Border `#CBD5E1` | `#F8FAFC` | `#F1F5F9` | `#1F4E79` (2px) | `#2F3437` |
| **Ghost** | `Transparent` | `#F1F5F9` | `#E2E8F0` | `#1F4E79` (2px) | `#2F3437` |
| **Destructive** | `#B84040` | `#993333` | `#7D2929` | `#B84040` (2px) | `#FFFFFF` |

---

## 7. FORM & INPUT COLOR SYSTEM

| Form Element | Default State | Focus State | Error State | Success State |
| :--- | :--- | :--- | :--- | :--- |
| **Input Background** | `#FFFFFF` | `#FFFFFF` | `#FAF0F0` | `#F2F8F4` |
| **Input Border** | `#CBD5E1` | `#1F4E79` (2px ring) | `#B84040` | `#3F7D58` |
| **Input Text** | `#0F172A` | `#0F172A` | `#0F172A` | `#0F172A` |
| **Placeholder** | `#94A3B8` | `#94A3B8` | `#94A3B8` | `#94A3B8` |
| **Field Label** | `#334155` | `#1F4E79` | `#B84040` | `#3F7D58` |

---

## 8. SEMANTIC STATUS SYSTEM

| Status Level | Main Color | Background | Border | Text Label |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#3F7D58` | `#F2F8F4` | `#C3E6D0` | `#1E462E` |
| **Warning** | `#A66A22` | `#FAF3EA` | `#F2D7B5` | `#5C3A12` |
| **Danger** | `#B84040` | `#FAF0F0` | `#F3C5C5` | `#6B2222` |
| **Info** | `#1F4E79` | `#E4ECF3` | `#C8D9E7` | `#14334F` |

---

## 9. LOGISTICS OPERATIONS STATUS PALETTE

| Shipment Milestone State | Background | Border | Text Color | Icon Indicator |
| :--- | :--- | :--- | :--- | :--- |
| **Shipment Created** | `#E2E8F0` | `#CBD5E1` | `#334155` | `FilePlus` |
| **Picked Up** | `#E4ECF3` | `#C8D9E7` | `#1F4E79` | `PackageCheck` |
| **In Warehouse** | `#FAF3EA` | `#F2D7B5` | `#A66A22` | `Warehouse` |
| **In Transit** | `#E4ECF3` | `#C8D9E7` | `#1F4E79` | `Truck` / `Ship` / `Plane` |
| **Customs Clearance** | `#FAF3EA` | `#F2D7B5` | `#A66A22` | `FileCheck` |
| **Out for Delivery** | `#E4ECF3` | `#C8D9E7` | `#1F4E79` | `Navigation` |
| **Delivered** | `#F2F8F4` | `#C3E6D0` | `#3F7D58` | `CheckCircle2` |
| **Delayed** | `#FAF0F0` | `#F3C5C5` | `#B84040` | `Clock` |
| **Exception** | `#FAF0F0` | `#F3C5C5` | `#B84040` | `AlertTriangle` |
| **Cancelled** | `#F1F5F9` | `#E2E8F0` | `#64748B` | `XCircle` |

---

## 10. GLOBAL INTERACTIVE MAP COLOR MATRIX

| Map Component | Hex / RGBA Code | Function & Appearance |
| :--- | :--- | :--- |
| **Map Base Surface** | `#2F3437` | Tech dark map container |
| **Logistics Routes** | `#1F4E79` | Active maritime and air corridors |
| **Seaports** | `#FFFFFF` | Major ocean port nodes |
| **Airports** | `#38BDF8` | Global aviation hubs |
| **Inland Hubs** | `#E2E8F0` | Bonded logistics depots |
| **Active Telemetry Nodes** | `#1F4E79` | Live vessel and fleet coordinates |
| **Inactive Hubs** | `#64748B` | Planned or auxiliary routes |
| **Connecting Arcs** | `rgba(255, 255, 255, 0.4)` | Flight and shipping vector trajectories |

---

## 11. DATA VISUALIZATION & KPI CHART PALETTE

| Chart Series | Token | Purpose |
| :--- | :--- | :--- |
| **Series 1 (Primary)** | `#1F4E79` (Gentian Blue) | Main metric volume (e.g. Total TEUs shipped) |
| **Series 2 (Secondary)** | `#2F3437` (Anthracite) | Secondary benchmark (e.g. Projected volume) |
| **Series 3 (Aviation)** | `#38BDF8` (Sky Blue) | Air freight performance |
| **Series 4 (Compliance)** | `#3F7D58` (Forest Green) | On-time delivery % rate |
| **Chart Grid Lines** | `#E2E8F0` | Subtle background coordinate lines |
| **Tooltip Card** | `#2F3437` | High-contrast data popover background |

---

## 12. SHADOW ELEVATION SYSTEM

- **`shadow-sm`**: `0 1px 2px 0 rgba(15, 23, 42, 0.05)` — Form controls, badges
- **`shadow-md`**: `0 4px 6px -1px rgba(15, 23, 42, 0.08)` — Standard content cards
- **`shadow-lg`**: `0 10px 15px -3px rgba(15, 23, 42, 0.10)` — Hover states, sticky nav
- **`shadow-xl`**: `0 20px 25px -5px rgba(15, 23, 42, 0.12)` — Modals, hero widgets

---

## 13. GRADIENT RULES

1. **`brandHero`**: `linear-gradient(135deg, #2F3437 0%, #1F4E79 100%)` — Strictly for top hero banners and key brand headers.
2. **`subtleSurface`**: `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)` — For subtle card elevation.

*Rule: No decorative rainbow, neon cyan-purple, or multi-stop gradients are permitted.*

---

## 14. COLOR USAGE GOVERNANCE & BEST PRACTICES

### Do's ✅
- **Max 2 Prominent Colors**: Only `#2F3437` and `#1F4E79` may dominate any given view.
- **Controlled Accent Usage**: Accent highlights must never exceed 5% of total screen surface.
- **Pair with Icons**: Every logistics status tag MUST combine color background with text label and geometric icon.
- **Centrally Import Tokens**: All components must reference `/src/design-system/tokens.ts`.

### Don'ts ❌
- **No Gray Text on Dark Cards**: On dark cards (`#2F3437`), body text must be pure white `#FFFFFF` or slate `#E2E8F0`.
- **No Unlisted Hex Codes**: Raw hex codes outside the tokens configuration are strictly forbidden.
- **No Decorative Gradients**: Never apply gradients to body paragraphs or form inputs.
