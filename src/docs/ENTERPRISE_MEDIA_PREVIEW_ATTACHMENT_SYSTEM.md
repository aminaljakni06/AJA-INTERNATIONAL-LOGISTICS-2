# AJA INTERNATIONAL LOGISTICS — Enterprise Media Preview, Document Viewer & Attachment Dialog System
**Phase:** Enterprise UI System  
**Module:** Enterprise Media Preview, Document Viewer & Attachment Dialog System  
**Version:** 1.0  

---

## 1. Architectural Philosophy

The **Enterprise Media Preview, Document Viewer & Attachment Dialog Framework** standardizes viewing, previewing, uploading, managing, and inspecting files and media assets across all AJA INTERNATIONAL LOGISTICS enterprise modules (Customs Clearance, Warehousing, Freight Management, Fleet, Finance, and HR).

```
┌────────────────────────────────────────────────────────────────────────┐
│             ENTERPRISE MEDIA PREVIEW & ATTACHMENT SYSTEM              │
│                                                                        │
│  ┌───────────────────────────┐  ┌───────────────────────────────────┐  │
│  │ EnterpriseMediaPreview    │  │ EnterpriseAttachmentDialog        │  │
│  │ Dialog (Playlist, Info)   │  │ (Upload, List, Grid, Search)     │  │
│  └─────────────┬─────────────┘  └─────────────────┬─────────────────┘  │
│                │                                  │                    │
│                ▼                                  ▼                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     ENTERPRISE MEDIA VIEWERS                     │  │
│  │  - EnterpriseImageViewer    (Zoom, Pan, Rotate, Keyboard)        │  │
│  │  - EnterprisePdfViewer      (Page, Zoom, Print, Render)          │  │
│  │  - EnterpriseVideoViewer    (Play, Seek, Speed, Fullscreen)      │  │
│  │  - EnterpriseAudioViewer    (Play, Seek, Speed, Wave Visualizer) │  │
│  │  - EnterpriseDocumentViewer (CSV Table, JSON Syntax, Office)     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     STORAGE & PERMISSIONS CONTRACT                     │
│  - Storage Manager & Download Url Generator (`StorageManagerService`)  │
│  - Permission Checkers (`canView`, `canDownload`, `canDelete`)         │
│  - Audit Logger Integration (`File Viewed`, `File Downloaded`)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Component Index

| Component / Hook / Contract | Path | Description |
| :--- | :--- | :--- |
| **`PreviewCapability` & `MediaViewerState`** | `/src/types/mediaViewerFramework.ts` | Shared TypeScript contracts for preview capabilities, viewer props, and permissions. |
| **`useEnterpriseMediaViewer`** | `/src/hooks/useEnterpriseMediaViewer.ts` | React hook managing media playlist state, active asset index, zoom, rotation, and navigation. |
| **`EnterpriseImageViewer`** | `/src/components/viewer/EnterpriseImageViewer.tsx` | High-performance image canvas viewer supporting zoom (25%-400%), pan, 90° rotation, and keyboard navigation. |
| **`EnterprisePdfViewer`** | `/src/components/viewer/EnterprisePdfViewer.tsx` | Secure PDF viewer with page controls, zoom, print integration, and download triggers. |
| **`EnterpriseVideoViewer`** | `/src/components/viewer/EnterpriseVideoViewer.tsx` | HTML5 video player with custom seek trackbar, volume, playback speed (0.75x–2x), and fullscreen mode. |
| **`EnterpriseAudioViewer`** | `/src/components/viewer/EnterpriseAudioViewer.tsx` | Audio player featuring animated wave visualizer, seek bar, time duration, volume, and playback controls. |
| **`EnterpriseDocumentViewer`** | `/src/components/viewer/EnterpriseDocumentViewer.tsx` | Multi-format document viewer handling CSV table rendering, JSON syntax, monospaced text, and Office fallback. |
| **`EnterpriseMediaPreviewDialog`** | `/src/components/dialog/EnterpriseMediaPreviewDialog.tsx` | Centralized preview dialog integrating `EnterpriseDialog`, playlist navigation, retractable file metadata drawer, and action toolbar. |
| **`EnterpriseAttachmentDialog`** | `/src/components/dialog/EnterpriseAttachmentDialog.tsx` | Comprehensive attachment manager with list/grid view modes, search, filtering, inline upload, rename, and permission controls. |

---

## 3. Security, Tenant Isolation & Permission Model

Before rendering or serving file content:
1. **Permission Validation**:
   - `canView`: Validated before displaying preview canvas.
   - `canDownload`: Guarded behind signed URL expiration.
   - `canDelete`: Requires elevated entity permissions and triggers confirmation dialogs.
2. **Tenant Context**:
   - All file metadata and signed download requests are scoped to the authenticated tenant context. Cross-tenant document access is strictly rejected by server-side authorization.

---

## 4. Verification & Compilation Status

Verified via `compile_applet`. The applet builds successfully with zero syntax, type, or lint errors.
