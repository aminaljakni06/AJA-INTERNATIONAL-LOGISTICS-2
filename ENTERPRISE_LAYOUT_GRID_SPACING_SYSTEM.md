# AJA INTERNATIONAL LOGISTICS — STEP 04: ENTERPRISE LAYOUT, GRID & SPACING SYSTEM REFERENCE

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL FOUNDATION

The **AJA Enterprise Layout, Grid & Spacing System** establishes a mathematical, highly predictable layout architecture based on an **8-Point Grid System** with 4pt micro-steps. Designed specifically for high-density enterprise supply chain interfaces, telemetry dashboards, multi-step freight forms, and bilingual Arabic (RTL) / English (LTR) pages, this system guarantees visual rhythm, predictable spacing, and zero layout shift across all viewport dimensions.

---

## 2. RESPONSIVE GRID MATRIX & BREAKPOINT GOVERNANCE

The grid adapts dynamically to six standardized device tiers. Every tier specifies column counts, gutters, margins, and container constraints.

| Breakpoint Tier | Min Viewport Width | Columns | Column Gutter | Outer Margin | Max Container Width | Target Device Class |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `0px` | 4 Columns | 16px (`1rem`) | 16px (`1rem`) | `100%` | Compact Phones (Portrait) |
| **`sm`** | `640px` | 8 Columns | 20px (`1.25rem`) | 24px (`1.5rem`) | `600px` | Large Phones / Small Tablets |
| **`md`** | `768px` | 12 Columns | 24px (`1.5rem`) | 32px (`2rem`) | `720px` | Tablets (Portrait / Landscape) |
| **`lg`** | `1024px` | 12 Columns | 24px (`1.5rem`) | 32px (`2rem`) | `960px` | Laptops / Small Workstations |
| **`xl`** | `1280px` | 12 Columns | 32px (`2rem`) | 40px (`2.5rem`) | `1200px` | Standard Enterprise Workstations |
| **`2xl`** | `1536px` | 12 Columns | 32px (`2rem`) | 48px (`3rem`) | `1440px` | Ultra-wide Workstations & Monitors |

---

## 3. CONTAINER CLASSIFICATION SYSTEM

Containers anchor page content and enforce horizontal alignment bounds depending on content density.

| Container Token | Max Width Value | Tailwind Class Equivalent | Strategic Operational Context |
| :--- | :--- | :--- | :--- |
| **`fullWidth`** | `100%` | `w-full` | Navigation headers, full-width dark heroes, global maps, footer backdrops |
| **`wide`** | `1536px` | `max-w-screen-2xl mx-auto` | Multi-panel telemetry dashboards, global network interactive charts |
| **`standard`** | `1280px` | `max-w-7xl mx-auto` | **Default layout container** for all primary page sections and feature grids |
| **`reading`** | `768px` | `max-w-3xl mx-auto` | Single-column documentation, customs guide articles, privacy policies |
| **`narrow`** | `640px` | `max-w-xl mx-auto` | Instant Rate Calculator, Shipment Tracking search modal, login forms |

---

## 4. MATHEMATICAL SPACING SCALE (8-POINT GRID)

All spacing values derive strictly from the 8pt Grid scale, with 4pt micro-steps reserved for fine control in dense controls (badges, inline tag margins).

| Token Step | Rem Value | Pixel Value | Standard Usage & Component Context |
| :--- | :--- | :--- | :--- |
| `spacing[0.5]` | `0.125rem` | **2px** | Micro border offsets, subtle badge padding |
| `spacing[1]` | `0.25rem` | **4px** | Micro icon gaps, badge vertical padding |
| `spacing[1.5]` | `0.375rem` | **6px** | Button vertical padding (compact), input icon offset |
| `spacing[2]` | `0.5rem` | **8px** | Gap between label and input, button icon gap |
| `spacing[3]` | `0.75rem` | **12px** | Input vertical padding, list item padding |
| `spacing[4]` | `1rem` | **16px** | **Base spacing unit**: Card internal padding (mobile), input horizontal padding |
| `spacing[5]` | `1.25rem` | **20px** | Table cell horizontal padding, form field gap |
| `spacing[6]` | `1.5rem` | **24px** | Card internal padding (desktop), grid gap (standard) |
| `spacing[8]` | `2rem` | **32px** | Card padding (large), gap between form field groups |
| `spacing[10]` | `2.5rem` | **40px** | Section header bottom margin, modal internal padding |
| `spacing[12]` | `3rem` | **48px** | Mobile section vertical padding, hero gap |
| `spacing[16]` | `4rem` | **64px** | Desktop section gap, main container top margin |
| `spacing[20]` | `5rem` | **80px** | Major landing section vertical padding |
| `spacing[24]` | `96px` | **96px** | Desktop hero vertical padding |
| `spacing[30]` | `7.5rem` | **120px** | Ultra-wide section vertical padding |

*Rule: Raw pixel values outside this scale (e.g. `margin-top: 17px`) are strictly forbidden.*

---

## 5. COMPONENT PADDING & MARGIN GOVERNANCE

### A. Section Padding & Margins
- **Page Top Padding**: `pt-20 lg:pt-28` (Accounts for fixed floating header).
- **Section Vertical Padding**:
  - Mobile (`<768px`): `py-12` (48px)
  - Tablet (`768px–1023px`): `py-16` (64px)
  - Desktop (`≥1024px`): `py-24` (96px)
- **Section Element Margins**:
  - Overline Kicker to Heading: `mb-2` (8px)
  - Heading to Supporting Description: `mb-4` (16px)
  - Header Block to Content Grid: `mb-12 lg:mb-16` (48px / 64px)

### B. Card Padding & Nested Radii Math
- **Card Padding Tiers**:
  - Compact Card: `p-4` (16px)
  - Standard Service Card: `p-6` (24px)
  - Hero Feature Card / Container: `p-8 lg:p-10` (32px / 40px)
- **Nested Border Radius Formula**:
  - `Inner Radius = Outer Radius - Padding`
  - *Example*: An outer card with `radii.xl` (16px) and `p-4` (16px padding) MUST use `radii.sm` (6px) or `radii.xs` (4px) for inner elements.

---

## 6. ELEVATION & SHADOW SYSTEM MATRIX

| Elevation Tier | Shadow Value | Border Specification | Strategic Application |
| :--- | :--- | :--- | :--- |
| **Level 0** | `none` | `1px solid #E2E8F0` | Base input fields, inline code boxes, data tables |
| **Level 1** | `0 1px 2px 0 rgba(15, 23, 42, 0.05)` | `1px solid #E2E8F0` | Secondary list items, subtle feature pills |
| **Level 2** | `0 4px 6px -1px rgba(15, 23, 42, 0.08)` | `1px solid #E2E8F0` | **Default content cards**, service grid cards, quote forms |
| **Level 3** | `0 10px 15px -3px rgba(15, 23, 42, 0.10)` | `1px solid #CBD5E1` | Navigation bar sticky state, floating search popovers |
| **Level 4** | `0 20px 25px -5px rgba(15, 23, 42, 0.12)` | `1px solid #CBD5E1` | Modal dialog windows, drawer sidebars, mobile nav drawers |
| **Hover Lift** | `0 12px 20px -5px rgba(31, 78, 121, 0.15)` | `1px solid #1F4E79` | Active hover state on interactive service & pricing cards |

---

## 7. LAYOUT PATTERN SPECIFICATIONS

### A. Hero Layout Architecture
- **Structure**: 2-Column Split (`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`)
- **Left Column (Text Content)**: Spans 7 columns on desktop (`lg:col-span-7`).
- **Right Column (3D Scene / Interactive Widget)**: Spans 5 columns on desktop (`lg:col-span-5`).
- **Hero Height**: Min height `520px` on desktop, auto on mobile.

### B. Form Layout Architecture
- **Form Field Gap**: `space-y-5` (20px between stacked form controls).
- **Label to Input Gap**: `mb-2` (8px).
- **Multi-column Form Rows**: `grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6` (16px / 24px gap).
- **Action Buttons Area**: `pt-6 mt-6 border-t border-slate-200 flex items-center justify-end gap-3`.

### C. Data Table Layout Architecture
- **Header Row Height**: `h-12` (48px) with `bg-slate-50 border-b border-slate-200`.
- **Body Row Height**: `h-14` (56px) with `border-b border-slate-100 hover:bg-slate-50/80`.
- **Cell Padding**: `px-5 py-3.5` (20px horizontal, 14px vertical).

### D. Dashboard Layout Architecture
- **Sidebar Navigation**: Fixed width `w-70` (280px) expanded, `w-20` (80px) collapsed.
- **Header Bar**: Height `h-16` (64px) sticky top.
- **Main Content Area**: `p-6 lg:p-8 space-y-6 lg:space-y-8`.

---

## 8. RTL / LTR SPACING & LAYOUT HARMONY

- **Logical Utilities**:
  - `ms-*` (margin-inline-start) and `me-*` (margin-inline-end) replace `ml-*` / `mr-*`.
  - `ps-*` (padding-inline-start) and `pe-*` (padding-inline-end) replace `pl-*` / `pr-*`.
  - `start-0` and `end-0` replace `left-0` / `right-0`.
- **Flexbox Direction**: `flex-row` automatically mirrors in Arabic (RTL) mode without requiring conditional logic.
- **Icon Margins**: Use `me-2` or `ms-2` to maintain proper spacing from text in both languages.

---

## 9. ACCESSIBILITY & TOUCH TARGET GOVERNANCE

- **Touch Target Minimum Size**: Every interactive element (buttons, tabs, inputs, checkboxes) MUST have an explicit click target area of at least **44×44px**.
- **Keyboard Focus Ring**: Focus states use `focus:outline-none focus:ring-2 focus:ring-[#1F4E79] focus:ring-offset-2`.
- **Content Clutter Prevention**: Minimum 16px gap maintained between clickable siblings on mobile viewports.

---

## 10. CENTRALIZED DESIGN TOKENS EXPORT

All layout, grid, spacing, and elevation tokens are centralized in `/src/design-system/tokens.ts` and re-exported via `/src/design-system/index.ts`:

```typescript
import { tokens } from '@/design-system/tokens';

// Example layout token usage
const containerClass = tokens.containers.standard;
const baseGap = tokens.spacing[4];
```
