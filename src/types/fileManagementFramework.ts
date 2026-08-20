/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise File Upload, Media & Attachment System Types
 * Phase: Enterprise UI System
 * Module: Enterprise File Upload, Media & Attachment System
 * Version: 1.0
 */

export type StorageProvider =
  | 'FIREBASE_STORAGE'
  | 'GCS'
  | 'AWS_S3'
  | 'AZURE_BLOB'
  | 'LOCAL';

export type SecurityClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED';

export type FileCategory =
  | 'image'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'archive'
  | 'audio'
  | 'video'
  | 'cad'
  | 'certificate'
  | 'other';

export type UploadStatus =
  | 'QUEUED'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PAUSED'
  | 'CANCELLED';

export interface FileVersion {
  versionNumber: number;
  fileId: string;
  name: string;
  sizeBytes: number;
  uploadDate: string;
  uploadedBy: string;
  checksumHash: string;
  changeNotes?: string;
  downloadUrl: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  checksumHash: string;
  storageProvider: StorageProvider;
  ownerId: string;
  uploaderEmail: string;
  uploadDate: string;
  lastModified: string;
  tags: string[];
  category: FileCategory;
  description?: string;
  securityClassification: SecurityClassification;
  retentionPolicy?: string;
  url: string;
  previewUrl?: string;
  versionsCount: number;
  versions?: FileVersion[];
  aiMetadata?: {
    ocrText?: string;
    summary?: string;
    autoTags?: string[];
    classifiedCategory?: string;
    confidenceScore?: number;
  };
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  bytesTransferred: number;
  totalBytes: number;
  progressPercentage: number;
  status: UploadStatus;
  speedBytesPerSec: number;
  remainingSeconds: number;
  errorMessage?: string;
}

export interface UploadValidationConfig {
  maxSizeBytes?: number; // e.g. 50MB
  minSizeBytes?: number;
  allowedExtensions?: string[]; // e.g. ['pdf', 'png', 'jpg', 'xlsx']
  allowedMimeTypes?: string[];
  maxFileCount?: number;
  imageDimensions?: {
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
  };
  enableVirusScan?: boolean;
}

export interface UploadRequest {
  file: File;
  category?: FileCategory;
  securityClassification?: SecurityClassification;
  tags?: string[];
  ownerId?: string;
  entityType?: string; // e.g. 'shipment', 'customer', 'customs_doc'
  entityId?: string;
  validationConfig?: UploadValidationConfig;
}

export interface UploadResponse {
  success: boolean;
  fileMetadata?: FileMetadata;
  error?: string;
}

export interface DownloadRequest {
  fileId: string;
  versionNumber?: number;
  expiresInSeconds?: number; // Signed URL expiry
}

export interface MediaAsset extends FileMetadata {
  dimensions?: { width: number; height: number };
  durationSeconds?: number;
  aspectRatio?: string;
  thumbnailUrl?: string;
}

export interface Attachment {
  id: string;
  entityType: string;
  entityId: string;
  fileMetadata: FileMetadata;
  attachedBy: string;
  attachedAt: string;
  isPinned?: boolean;
  categoryLabel?: string;
}
