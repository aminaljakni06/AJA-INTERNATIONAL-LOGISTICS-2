# AJA INTERNATIONAL LOGISTICS — Enterprise File Upload, Media & Attachment System Documentation
**Phase:** Enterprise UI System  
**Module:** Enterprise File Upload, Media & Attachment System  
**Version:** 1.0  

---

## 1. Executive Summary & Philosophy
The **Enterprise File Upload, Media & Attachment System** standardizes every document and file interaction across the entire AJA INTERNATIONAL LOGISTICS platform.

Whether uploading **ZATCA Customs Declarations, Port Clearance Certificates, Container Inspection Photos, Air Freight AWBs, or Driver Licenses**, all business modules utilize a single unified file management pipeline.

### System Architecture Overview
```
┌────────────────────────────────────────────────────────────────────────┐
│             ENTERPRISE FILE & ATTACHMENT USER INTERFACES               │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────┐  ┌───────────────┐ │
│  │FileUploadZone        │  │AttachmentManager   │  │MediaLibrary   │ │
│  │(Drag&Drop, Queue,    │  │(Pinning, Actions,  │  │(Asset Grid,   │ │
│  │ Progress, Chunked)   │  │ Categories, Sync)  │  │ OCR Filters)  │ │
│  └──────────────────────┘  └────────────────────┘  └───────────────┘ │
│                            └───────────────────┬───────────────────┘ │
│                                                ▼                     │
│                            ┌───────────────────────────────────────┐ │
│                            │ EnterpriseFilePreviewModal            │ │
│                            │ (PDF / Image / OCR / Revision History)│ │
│                            └───────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                        STORAGE MANAGER SERVICE                         │
│  - Validation Rules (MIME, Max Size, Virus Scan Simulation)            │
│  - Storage Provider Abstraction (Firebase Storage, GCS, S3, Azure)     │
│  - AI Contracts Hook (OCR Text Extraction, Document Summarization)     │
│  - Revision History & Version Control Manager                          │
│  - Signed URL Security & Download Link Generator                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components & Service Index

| Component / Service | File Path | Description |
| :--- | :--- | :--- |
| **`StorageManagerService`** | `/src/services/storage/storageManagerService.ts` | Multi-provider storage engine with validation, chunking, and AI metadata extraction. |
| **`useEnterpriseUpload`** | `/src/hooks/useEnterpriseUpload.ts` | Custom hook for managing active upload queues, drag states, and progress calculations. |
| **`EnterpriseFileUploadZone`** | `/src/components/file/EnterpriseFileUploadZone.tsx` | Drag and drop zone with chunked upload progress, remaining time, and virus scan indicators. |
| **`EnterpriseFilePreviewModal`** | `/src/components/file/EnterpriseFilePreviewModal.tsx` | High-fidelity preview modal for PDFs, images, OCR text, and version history. |
| **`EnterpriseAttachmentManager`** | `/src/components/file/EnterpriseAttachmentManager.tsx` | Record attachment list with pin badges, category filters, and preview modals. |
| **`EnterpriseMediaLibrary`** | `/src/components/file/EnterpriseMediaLibrary.tsx` | Media asset grid/list browser with security tags and AI search filters. |

---

## 3. Supported File Categories & Validation Rules

1. **Images:** `jpg`, `png`, `webp`, `svg`
2. **Documents:** `pdf`, `doc`, `docx`, `txt`
3. **Spreadsheets:** `xlsx`, `xls`, `csv`
4. **Archives & CAD:** `zip`, `rar`, `dwg`, `dxf`
5. **Certificates:** `pem`, `crt`, `cer`

### Default Security Classifications
- `PUBLIC`: Public marketing assets and unclassified brochures.
- `INTERNAL`: Operational photos, driver logs, standard transport notes.
- `CONFIDENTIAL`: Customer contracts, tariff agreements, finance records.
- `RESTRICTED`: ZATCA customs seals, tax audit credentials, hazardous material certificates.

---

## 4. Usage Example

```tsx
import { EnterpriseFileUploadZone, EnterpriseAttachmentManager } from '../components/file';

// 1. File Upload Zone Component
<EnterpriseFileUploadZone
  entityType="shipment"
  entityId="SHP-2026-8801"
  securityClassification="RESTRICTED"
  onUploadSuccess={(meta) => console.log('File uploaded:', meta)}
/>

// 2. Attachment Manager Component
<EnterpriseAttachmentManager
  entityType="shipment"
  entityId="SHP-2026-8801"
  isAr={isArabic}
/>
```
