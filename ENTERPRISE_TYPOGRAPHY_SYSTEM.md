# AJA INTERNATIONAL LOGISTICS — STEP 03: ENTERPRISE TYPOGRAPHY SYSTEM REFERENCE

## 1. EXECUTIVE SUMMARY & TYPOGRAPHIC STRATEGY

The **AJA Enterprise Typography System** is engineered to deliver absolute clarity, high legibility, and modern corporate authority across international logistics operations. Designed specifically to support high-density telemetry, bilingual Arabic (RTL) & English (LTR) interfaces, and complex supply chain data tables, the system achieves visual balance without distraction.

---

## 2. FONT PAIRING & BRAND RATIONALE

### Primary Bilingual Pairing

| Role / Culture | Font Family | Characteristics & Strategic Rationale |
| :--- | :--- | :--- |
| **English (LTR)** | **Plus Jakarta Sans** *(Fallback: Inter)* | Modern geometric grotesque with clean aperture and high x-height. Conveys speed, technical precision, and corporate authority. |
| **Arabic (RTL)** | **IBM Plex Sans Arabic** *(Fallback: Cairo)* | Engineered grotesque Arabic typeface designed specifically for screens. Provides clean horizontal baseline alignment matching Plus Jakarta Sans in stroke weight and density. |
| **Monospace (Telemetry & Data)** | **JetBrains Mono** *(Fallback: Fira Code)* | Fixed-width tabular typeface for tracking numbers, container IDs, BOL/AWBs, timestamps, coordinates, and monetary figures. |

---

## 3. MASTER TYPOGRAPHIC SCALE MATRIX

All font size levels adhere to a mathematical hierarchy designed for multi-device scalability.

| Level / Token | Desktop Size | Mobile Size | Line Height | Weight | Letter Spacing | Operational Context & Application |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display XL** | 64px (`4rem`) | 40px (`2.5rem`) | 1.10 | 800 (ExtraBold) | `-0.025em` | Main Homepage Hero Title, Global Campaign Headers |
| **Display L** | 48px (`3rem`) | 32px (`2rem`) | 1.15 | 800 (ExtraBold) | `-0.020em` | Major Service Page Banner Headlines |
| **Display M** | 36px (`2.25rem`) | 28px (`1.75rem`) | 1.20 | 700 (Bold) | `-0.015em` | High-impact Landing Sub-hero & Metric Headers |
| **H1** | 30px (`1.875rem`) | 24px (`1.5rem`) | 1.25 | 700 (Bold) | `-0.010em` | Primary Section Headlines, Portal Section Titles |
| **H2** | 24px (`1.5rem`) | 20px (`1.25rem`) | 1.30 | 700 (Bold) | `0em` | Major Card Category Headings, Form Block Headers |
| **H3** | 20px (`1.25rem`) | 18px (`1.125rem`) | 1.35 | 600 (SemiBold) | `0em` | Sub-section Headers, Modal Titles |
| **H4** | 18px (`1.125rem`) | 16px (`1rem`) | 1.40 | 600 (SemiBold) | `0em` | Feature Card Titles, Service Name Headers |
| **H5** | 16px (`1rem`) | 15px (`0.9375rem`)| 1.45 | 600 (SemiBold) | `0em` | Small Card Headers, Widget Section Labels |
| **H6** | 14px (`0.875rem`) | 14px (`0.875rem`)| 1.50 | 600 (SemiBold) | `0em` | Table Column Titles, Compact Card Titles |
| **Subtitle** | 18px (`1.125rem`) | 16px (`1rem`) | 1.50 | 500 (Medium) | `0em` | Hero Subtitles, Lead Intro Paragraphs |
| **Body Large** | 18px (`1.125rem`) | 16px (`1rem`) | 1.60 | 400 (Regular) | `0em` | Prominent Article Intro, Editorial Text |
| **Body Medium** | 16px (`1rem`) | 15px (`0.9375rem`)| 1.625 | 400 (Regular) | `0em` | Primary Body Copy, Form Instructions, Descriptions |
| **Body Small** | 14px (`0.875rem`) | 13px (`0.8125rem`)| 1.50 | 400 (Regular) | `0em` | Secondary Descriptions, Compact Lists, Tooltips |
| **Caption** | 12px (`0.75rem`) | 12px (`0.75rem`) | 1.40 | 500 (Medium) | `0em` | Timestamps, Footnotes, Secondary Status Labels |
| **Overline** | 12px (`0.75rem`) | 11px (`0.6875rem`)| 1.40 | 700 (Bold) | `0.08em` (UPPER) | Eyebrow Section Category Tags, Kicker Labels |
| **Label** | 14px (`0.875rem`) | 14px (`0.875rem`) | 1.40 | 600 (SemiBold) | `0em` | Form Field Labels, Filter Dropdown Labels |
| **Button Text**| 14px (`0.875rem`) | 14px (`0.875rem`) | 1.00 | 700 (Bold) | `0.01em` | Primary, Secondary & Ghost Button Labels |

---

## 4. RESPONSIVE TYPOGRAPHY SCALING GOVERNANCE

Typography automatically scales smoothly across breakpoints without layout shift:

- **Desktop (`xl`: ≥1280px / `2xl`: ≥1536px)**: Full scale (Display XL = 64px, H1 = 30px).
- **Laptop (`lg`: 1024px – 1279px)**: 90% scale adjustment on Display headings (Display XL = 56px).
- **Tablet (`md`: 768px – 1023px)**: 80% scale adjustment on Display headings (Display XL = 48px).
- **Mobile (`sm`: <768px)**: 65% scale adjustment on Display headings (Display XL = 40px, H1 = 24px) for optimized mobile reading.

---

## 5. FONT WEIGHT DEFINITIONS & USAGE RULES

| Weight Token | Numeric Value | Approved Applications | Prohibited Usages |
| :--- | :--- | :--- | :--- |
| **Regular** | `400` | Paragraph body copy, form help text, table row text | Headings, buttons, badge status labels |
| **Medium** | `500` | Subtitles, captions, metadata tags, navigation items | Main section headlines |
| **SemiBold** | `600` | Card titles, H3-H6 headings, form labels, table headers | Long multi-paragraph body text |
| **Bold** | `700` | Display headings, H1-H2 titles, button text, KPI figures | Body copy paragraphs |
| **ExtraBold** | `800` | Display XL & Display L hero headlines | Subheadings, card titles |

---

## 6. STRUCTURAL TEXT HIERARCHY PATTERNS

### A. Hero Section Hierarchy
1. **Overline Kicker**: `text-xs font-bold uppercase tracking-wider text-sky-400`
2. **Hero Headline**: `text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight`
3. **Hero Subtitle**: `text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl`
4. **CTA Button**: `text-sm font-bold tracking-wide py-3.5 px-6 rounded-xl`

### B. Standard Content Section Hierarchy
1. **Section Overline**: `text-xs font-bold uppercase tracking-widest text-[#1F4E79]`
2. **Section Title (H2)**: `text-2xl sm:text-3xl font-bold text-[#0F172A]`
3. **Section Lead Copy**: `text-base text-[#475569] leading-relaxed max-w-3xl`

### C. Content Card Hierarchy
1. **Card Title (H4)**: `text-lg font-semibold text-[#0F172A]`
2. **Card Subtext**: `text-sm text-[#475569] leading-normal`
3. **Meta / Timestamp**: `text-xs font-medium text-[#64748B]`

---

## 7. NUMERIC & DATA TYPOGRAPHY SYSTEM

Logistics operations rely on precise numerical telemetry. The following rules govern all numbers:

- **Shipment Tracking IDs & AWBs**: MUST use `font-mono uppercase tracking-wider text-sm font-bold` (e.g. `AJA-88492-KSA`).
- **Timestamps & Dates**: MUST use `font-mono text-xs text-slate-600` with tabular figures (`font-variant-numeric: tabular-nums`).
- **Executive KPIs**: MUST use `text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-[#0F172A]`.
- **Financial Figures**: Currency code preceding tabular figures (e.g. `SAR 12,450.00`).

---

## 8. TABLES & DATA MATRIX TYPOGRAPHY

- **Header Cells**: `text-xs font-semibold text-[#475569] uppercase tracking-wider bg-[#F8FAFC]`
- **Body Cells**: `text-sm font-normal text-[#0F172A] align-middle`
- **Numeric Columns**: Right-aligned (LTR) or Left-aligned (RTL) using `font-mono tabular-nums`.
- **Status Cells**: Compact badge pill with `text-xs font-bold flex items-center gap-1.5`.

---

## 9. BUTTON & INTERACTIVE CONTROL TYPOGRAPHY

- **Text Size**: `14px` (`0.875rem`)
- **Weight**: `700` (Bold)
- **Casing**: Title Case in English / Standard Arabic
- **Rule**: Single-line text strictly enforced (`white-space: nowrap`). Never allow button text to wrap.

---

## 10. ACCESSIBILITY & RTL / LTR RULES

- **Line Length**: Paragraphs constrained to 60–75 characters (`max-w-2xl` or `max-w-3xl`).
- **Line Height**: Minimum 1.5x font size for body copy to pass WCAG 2.2 AA.
- **Contrast**: Text contrast strictly verified against background surfaces (min 4.5:1 for body, 3.0:1 for headings).
- **Arabic Typography Alignment**: Baseline offset balanced with English text; no text clipping on top/bottom diacritics.
- **RTL Text Direction**: Logical utilities (`text-start`, `text-end`) used exclusively instead of hardcoded `text-left` or `text-right`.

---

## 11. CENTRALIZED TOKENS INTEGRATION

All typography specifications are exported directly from `/src/design-system/tokens.ts`:

```typescript
import { tokens } from '@/design-system/tokens';

// Example token usage in components
const headingStyle = tokens.typography.styles.h2;
const fontFamilyAr = tokens.typography.fonts.arabic;
```
