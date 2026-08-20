/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Storage Manager Service
 * Phase: Enterprise UI System
 * Module: Enterprise File Upload, Media & Attachment System
 * Version: 1.0
 */

import {
  FileMetadata,
  FileVersion,
  UploadProgress,
  UploadRequest,
  UploadResponse,
  UploadValidationConfig,
  FileCategory,
  SecurityClassification,
  Attachment,
} from '../../types/fileManagementFramework';

// Mock Initial Attachments Dataset
const INITIAL_ATTACHMENTS: Attachment[] = [
  {
    id: 'att-101',
    entityType: 'shipment',
    entityId: 'SHP-2026-8801',
    attachedBy: 'Eng. Tariq Al-Mansoor',
    attachedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    isPinned: true,
    categoryLabel: 'Customs Clearance',
    fileMetadata: {
      id: 'file-doc-01',
      name: 'Saudi_Customs_Declaration_Jubail.pdf',
      originalName: 'Saudi_Customs_Declaration_Jubail.pdf',
      extension: 'pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2450000,
      checksumHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      storageProvider: 'FIREBASE_STORAGE',
      ownerId: 'usr-901',
      uploaderEmail: 't.mansoor@aja-logistics.sa',
      uploadDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      lastModified: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      tags: ['Customs', 'Cleared', 'Jubail', 'Official'],
      category: 'pdf',
      description: 'Official ZATCA customs duty clearance certificate for chemical cargo.',
      securityClassification: 'RESTRICTED',
      url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80',
      versionsCount: 2,
      versions: [
        {
          versionNumber: 2,
          fileId: 'file-doc-01',
          name: 'Saudi_Customs_Declaration_Jubail_v2.pdf',
          sizeBytes: 2450000,
          uploadDate: new Date().toISOString(),
          uploadedBy: 't.mansoor@aja-logistics.sa',
          checksumHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          changeNotes: 'Re-stamped with final clearance seal.',
          downloadUrl: '#',
        },
        {
          versionNumber: 1,
          fileId: 'file-doc-01',
          name: 'Saudi_Customs_Declaration_Jubail_v1.pdf',
          sizeBytes: 2410000,
          uploadDate: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          uploadedBy: 't.mansoor@aja-logistics.sa',
          checksumHash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
          changeNotes: 'Initial draft submission.',
          downloadUrl: '#',
        },
      ],
      aiMetadata: {
        ocrText: 'ZAKAT, TAX AND CUSTOMS AUTHORITY - CLEARANCE #981029. CARGO: PETROCHEMICALS.',
        summary: 'Official customs tax release document for shipment #8801.',
        autoTags: ['ZATCA', 'Tax Exemption', 'Import Clearance'],
        classifiedCategory: 'Customs & Tax',
        confidenceScore: 0.98,
      },
    },
  },
  {
    id: 'att-102',
    entityType: 'shipment',
    entityId: 'SHP-2026-8801',
    attachedBy: 'Fahad Al-Ghamdi',
    attachedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isPinned: false,
    categoryLabel: 'Inspection Photo',
    fileMetadata: {
      id: 'file-img-02',
      name: 'Container_Seal_Inspection_Riyadh.jpg',
      originalName: 'Container_Seal_Inspection_Riyadh.jpg',
      extension: 'jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1850000,
      checksumHash: '8f4e2b1c9d3e5a7f6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
      storageProvider: 'GCS',
      ownerId: 'usr-902',
      uploaderEmail: 'f.ghamdi@aja-logistics.sa',
      uploadDate: new Date(Date.now() - 3600000 * 12).toISOString(),
      lastModified: new Date(Date.now() - 3600000 * 12).toISOString(),
      tags: ['Inspection', 'Seal Verified', 'Warehouse'],
      category: 'image',
      description: 'HD photograph of bolt seal #SA-990182 prior to departure.',
      securityClassification: 'INTERNAL',
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      previewUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      versionsCount: 1,
      aiMetadata: {
        ocrText: 'BOLT SEAL SA-990182 HIGH SECURITY',
        summary: 'Container bolt seal verification picture.',
        autoTags: ['High Security Seal', 'Verified Intact'],
        classifiedCategory: 'Quality Control',
        confidenceScore: 0.95,
      },
    },
  },
];

export class StorageManagerService {
  private static attachmentsStore: Attachment[] = [...INITIAL_ATTACHMENTS];

  /**
   * Validate file against configured validation rules
   */
  public static validateFile(
    file: File,
    config?: UploadValidationConfig
  ): { valid: boolean; error?: string } {
    if (!config) return { valid: true };

    const { maxSizeBytes, minSizeBytes, allowedExtensions, allowedMimeTypes } = config;

    // 1. Max Size Check
    if (maxSizeBytes && file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File size exceeds the maximum allowed limit of ${maxMb}MB`,
      };
    }

    // 2. Min Size Check
    if (minSizeBytes && file.size < minSizeBytes) {
      return {
        valid: false,
        error: `File size is smaller than the minimum required size`,
      };
    }

    // 3. Extension Check
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (allowedExtensions && allowedExtensions.length > 0) {
      const normalizedExts = allowedExtensions.map((e) => e.toLowerCase().replace('.', ''));
      if (!normalizedExts.includes(ext)) {
        return {
          valid: false,
          error: `File extension .${ext} is not allowed. Allowed: ${allowedExtensions.join(', ')}`,
        };
      }
    }

    // 4. Mime Type Check
    if (allowedMimeTypes && allowedMimeTypes.length > 0) {
      if (!allowedMimeTypes.includes(file.type)) {
        return {
          valid: false,
          error: `MIME type ${file.type} is not supported.`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Categorize file based on MIME type or Extension
   */
  public static detectFileCategory(file: File): FileCategory {
    const type = file.type.toLowerCase();
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (
      type.includes('spreadsheet') ||
      type.includes('excel') ||
      ['xlsx', 'xls', 'csv'].includes(ext)
    )
      return 'spreadsheet';
    if (
      type.includes('word') ||
      type.includes('document') ||
      ['doc', 'docx', 'txt', 'rtf'].includes(ext)
    )
      return 'document';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    if (['dwg', 'dxf'].includes(ext)) return 'cad';
    if (['pem', 'crt', 'cer'].includes(ext)) return 'certificate';

    return 'other';
  }

  /**
   * Upload file with chunked progress callbacks
   */
  public static async uploadFile(
    req: UploadRequest,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const { file, validationConfig, entityType, entityId, tags, securityClassification } = req;

    // Validate
    const valResult = this.validateFile(file, validationConfig);
    if (!valResult.valid) {
      return { success: false, error: valResult.error };
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const category = req.category || this.detectFileCategory(file);

    // Simulate Chunked Upload Progress over 1.5 seconds
    const totalBytes = file.size;
    const totalChunks = 10;
    const intervalMs = 150;

    for (let chunk = 1; chunk <= totalChunks; chunk++) {
      await new Promise((r) => setTimeout(r, intervalMs));

      const bytesTransferred = Math.round((chunk / totalChunks) * totalBytes);
      const progressPercentage = Math.round((chunk / totalChunks) * 100);

      if (onProgress) {
        onProgress({
          fileId,
          fileName: file.name,
          bytesTransferred,
          totalBytes,
          progressPercentage,
          status: chunk === totalChunks ? 'COMPLETED' : 'UPLOADING',
          speedBytesPerSec: Math.round(totalBytes / 1.5),
          remainingSeconds: Math.max(0, Math.round(((totalChunks - chunk) * intervalMs) / 1000)),
        });
      }
    }

    // Mock Metadata Result
    const metadata: FileMetadata = {
      id: fileId,
      name: file.name,
      originalName: file.name,
      extension: (file.name.split('.').pop() || '').toLowerCase(),
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      checksumHash: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
      storageProvider: 'FIREBASE_STORAGE',
      ownerId: req.ownerId || 'usr-current',
      uploaderEmail: 'operator@aja-logistics.sa',
      uploadDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: tags || ['Uploaded', 'Logistics'],
      category,
      securityClassification: securityClassification || 'INTERNAL',
      url: category === 'image'
        ? 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
        : '#',
      previewUrl: category === 'image'
        ? 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80'
        : undefined,
      versionsCount: 1,
      aiMetadata: {
        ocrText: 'EXTRACTED DOCUMENT DATA OK',
        summary: 'Uploaded file automatically ingested into AJA Object Store.',
        autoTags: ['Auto Ingested', 'Verified'],
        classifiedCategory: 'General Document',
        confidenceScore: 0.92,
      },
    };

    // Store in Attachments
    if (entityType && entityId) {
      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        entityType,
        entityId,
        attachedBy: 'Current Operator',
        attachedAt: new Date().toISOString(),
        isPinned: false,
        categoryLabel: 'General Attachment',
        fileMetadata: metadata,
      };
      this.attachmentsStore.unshift(newAttachment);
    }

    return {
      success: true,
      fileMetadata: metadata,
    };
  }

  /**
   * Get attachments for a specific entity (e.g. shipment, customer, etc.)
   */
  public static getAttachmentsForEntity(entityType?: string, entityId?: string): Attachment[] {
    if (!entityType || !entityId) return this.attachmentsStore;
    return this.attachmentsStore.filter(
      (att) => att.entityType === entityType && att.entityId === entityId
    );
  }

  /**
   * Toggle Pin Status on an attachment
   */
  public static togglePinAttachment(attachmentId: string): Attachment[] {
    this.attachmentsStore = this.attachmentsStore.map((att) =>
      att.id === attachmentId ? { ...att, isPinned: !att.isPinned } : att
    );
    return this.attachmentsStore;
  }

  /**
   * Delete attachment record
   */
  public static deleteAttachment(attachmentId: string): Attachment[] {
    this.attachmentsStore = this.attachmentsStore.filter((att) => att.id !== attachmentId);
    return this.attachmentsStore;
  }

  /**
   * Generate secure download link
   */
  public static generateDownloadUrl(fileId: string, expiresInSeconds = 3600): string {
    return `https://storage.aja-logistics.sa/download/${fileId}?token=jwt_signed_${Date.now()}&expires=${expiresInSeconds}`;
  }
}
