# Aja Logistics - System Architecture

## Overview
Aja Logistics is an enterprise-grade full-stack logistics and freight management system designed with an Arabic-first (RTL) user experience and extensible localization capabilities.

## Architecture Layers

```
+-------------------------------------------------------------+
|                      CLIENT LAYER                           |
|  React 19 + TypeScript + Tailwind CSS (Vite SPA)            |
|  - RTL Layout System (Tajawal Display & Cairo Body Fonts)  |
|  - Auth Context & Language i18n Context                      |
|  - Modular Component Design System                          |
+-------------------------------------------------------------+
                               |
                        HTTP / REST API
                               v
+-------------------------------------------------------------+
|                      SERVER LAYER                           |
|  Node.js + Express + TypeScript                             |
|  - JWT Authentication Middleware & Role Guarding            |
|  - Input Validation & Controller Handlers                   |
|  - Audit Log Interceptors                                   |
+-------------------------------------------------------------+
                               |
                        Persistent Store
                               v
+-------------------------------------------------------------+
|                      DATABASE LAYER                         |
|  Server-side JSON File Store with Atomic Writes & Indexing |
|  - /data/db.json with persistent disk storage               |
|  - Schema definitions & relationships                       |
|  - Initial seed data (Default Admin, System Services)       |
+-------------------------------------------------------------+
```

## User Roles
1. **CUSTOMER**: Can request quotes, track assigned shipments, upload documents, and send support messages.
2. **STAFF**: Operations team managing shipments, updating shipment statuses, and reviewing quote requests.
3. **ADMIN**: Full system administrator managing users, companies, services, CMS content, and reviewing audit logs.

## Design System & Arabic RTL
- **Direction**: `dir="rtl"` applied globally to document body.
- **Typography**: Google Fonts Tajawal (Headings) and Cairo (Body).
- **Primary Color Palette**:
  - Deep Sea Navy (`#0F2C59` / `bg-navy-900`)
  - Warm Cargo Gold (`#E5A93C` / `bg-amber-500`)
  - Logistics Crimson (`#D80032`)
  - Modern Slate Neutrals (`#F8FAFC`, `#E2E8F0`, `#1E293B`)
