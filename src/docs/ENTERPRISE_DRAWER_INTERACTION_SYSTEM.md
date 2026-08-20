# AJA INTERNATIONAL LOGISTICS — Enterprise Drawer Interaction System
**Phase:** Enterprise UI System  
**Module:** Enterprise Drawer Interaction System  
**Version:** 1.0  

---

## 1. Architectural Summary & Purpose

The **Enterprise Drawer Interaction System** standardizes content navigation, search, filter management, related record traversal, chronological timelines, sticky section organization, and contextual breadcrumbs across all drawers and side panels in the AJA INTERNATIONAL LOGISTICS platform.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ENTERPRISE DRAWER                             │
│                      (Drawer Interaction Layer)                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      │                              │                              │
      ▼                              ▼                              ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│ DrawerTabs   │              │ DrawerSearch │              │DrawerFilters │
│ - Horizontal │              │ - Debounced  │              │ - Draft/Apply│
│ - Badges     │              │ - Auto-clear │              │ - Reset      │
│ - Lazy render│              │ - Loader     │              │ - Groups     │
└──────────────┘              └──────────────┘              └──────────────┘
      │                              │                              │
      ▼                              ▼                              ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│DrawerRelated │              │DrawerTimeline│              │DrawerSection │
│  Records     │              │ - Milestones │              │ - Sticky Hdr │
│ - Quick Act. │              │ - Status     │              │ - Actions    │
└──────────────┘              └──────────────┘              └──────────────┘
```

---

## 2. Component Directory & Export Reference

| Component | File Path | Functional Role |
| :--- | :--- | :--- |
| **`DrawerTabs`** | `/src/components/drawer/DrawerTabs.tsx` | Standardized horizontal tab bar with badge count indicators, icon support, LTR/RTL layout, and lazy content switching. |
| **`DrawerBreadcrumbs`** | `/src/components/drawer/DrawerBreadcrumbs.tsx` | Contextual breadcrumb path for navigating nested records (e.g., Customer > Shipment > Customs Document). |
| **`DrawerSearch`** | `/src/components/drawer/DrawerSearch.tsx` | Debounced search bar with clear button, loading spinner, and keyboard shortcuts. |
| **`DrawerFilters`** | `/src/components/drawer/DrawerFilters.tsx` | Structured filter panel with draft vs. applied state, reset functionality, active count badge, and field validation. |
| **`DrawerRelatedRecords`** | `/src/components/drawer/DrawerRelatedRecords.tsx` | Related entity cards/list with quick inline actions, status badges, and empty/loading states. |
| **`DrawerTimeline`** | `/src/components/drawer/DrawerTimeline.tsx` | Chronological activity & milestone timeline with status nodes, actor metadata, and timestamps. |
| **`DrawerSection`** | `/src/components/drawer/DrawerSection.tsx` | Collapsible or sticky section container ensuring correct scrolling stacking context. |

---

## 3. Interaction Code Pattern Example

```tsx
import React, { useState } from 'react';
import {
  EnterpriseDrawer,
  DrawerHeader,
  DrawerBody,
  DrawerTabs,
  DrawerSearch,
  DrawerRelatedRecords,
  DrawerTimeline
} from '@/components/drawer';

export function ShipmentInspectorDrawer({ isOpen, onClose, shipmentId }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <EnterpriseDrawer id="shipment-inspector" isOpen={isOpen} onClose={onClose} size="lg">
      <DrawerHeader
        titleEn={`Shipment #${shipmentId}`}
        titleAr={`شحنة رقم #${shipmentId}`}
        descriptionEn="Detailed cargo manifest, timeline, and associated documents"
        descriptionAr="بيان الشحنة التفصيلي والجدول الزمني والمستندات المرتبطة"
        statusBadge={{ labelEn: 'In Transit', labelAr: 'قيد النقل', variant: 'info' }}
        onClose={onClose}
      />

      <DrawerTabs
        activeTabId={activeTab}
        onChangeTab={setActiveTab}
        tabs={[
          { id: 'overview', labelEn: 'Overview', labelAr: 'نظرة عامة' },
          { id: 'timeline', labelEn: 'Timeline', labelAr: 'الجدول الزمني', badge: 4 },
          { id: 'documents', labelEn: 'Documents', labelAr: 'المستندات', badge: 2 },
        ]}
      />

      <DrawerBody>
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <DrawerSearch
              value={searchQuery}
              onSearch={setSearchQuery}
              placeholderEn="Search shipment cargo items..."
              placeholderAr="البحث في عناصر الشحنة..."
            />
            <p className="text-sm text-text-primary">Overview content...</p>
          </div>
        )}

        {activeTab === 'timeline' && (
          <DrawerTimeline
            events={[
              {
                id: '1',
                titleEn: 'Customs Cleared',
                titleAr: 'تم التخليص الجمركي',
                timestamp: '2026-08-07 10:30 AM',
                status: 'completed',
                actor: { name: 'Ahmed Hassan', role: 'Customs Agent' },
              },
              {
                id: '2',
                titleEn: 'Departed Port of Dammam',
                titleAr: 'غادرت ميناء الدمام',
                timestamp: '2026-08-07 02:15 PM',
                status: 'in_progress',
              },
            ]}
          />
        )}

        {activeTab === 'documents' && (
          <DrawerRelatedRecords
            records={[
              {
                id: 'doc-1',
                titleEn: 'Bill of Lading (BOL)',
                titleAr: 'بوليصة الشحن (BOL)',
                subtitleEn: 'PDF • 2.4 MB',
                statusBadge: { labelEn: 'Verified', labelAr: 'متحقق', variant: 'approved' },
              },
            ]}
          />
        )}
      </DrawerBody>
    </EnterpriseDrawer>
  );
}
```

---

## 4. Non-Regression & Verification

1. **Type Safety & Build**: Executed `compile_applet` — build succeeded with 0 errors.
2. **Bilingual & RTL/LTR**: Verified logical CSS properties, flex alignment, and icon mirroring for Arabic and English layouts.
3. **Drawer Manager Compatibility**: Fully integrates with `useDrawerManager` and `EnterpriseDrawerProvider`.
