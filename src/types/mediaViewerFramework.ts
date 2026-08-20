/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Media Preview & Document Viewer Framework Types
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import React from 'react';
import {
  FileMetadata,
  FileCategory,
  SecurityClassification,
  StorageProvider,
  FileVersion,
} from './fileManagementFramework';

export type PreviewCapability =
  | 'image'
  | 'pdf'
  | 'video'
  | 'audio'
  | 'text'
  | 'csv'
  | 'json'
  | 'markdown'
  | 'office'
  | 'generic'
  | 'unsupported';

export type ViewerMode = 'PREVIEW' | 'FULLSCREEN' | 'INSPECT' | 'ATTACHMENT_MANAGER';

export type AttachmentViewLayout = 'list' | 'grid' | 'compact' | 'thumbnail';

export interface FilePreviewMetadata extends FileMetadata {
  dimensions?: { width: number; height: number };
  durationSeconds?: number;
  thumbnailUrl?: string;
  isCorrupted?: boolean;
  pageCount?: number;
}

export interface SecureFileReference {
  fileId: string;
  tenantId: string;
  signedUrl: string;
  expiresAt: number;
  securityClassification: SecurityClassification;
  storageProvider: StorageProvider;
}

export interface ViewerPermissions {
  canView: boolean;
  canDownload: boolean;
  canShare: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canManageVersions: boolean;
}

export interface ViewerError {
  code: 'FILE_NOT_FOUND' | 'ACCESS_DENIED' | 'PREVIEW_FAILED' | 'EXPIRED_URL' | 'UNSUPPORTED_FORMAT' | 'CORRUPTED' | 'SERVER_ERROR';
  messageEn: string;
  messageAr: string;
  technicalDetails?: string;
}

export interface MediaViewerState {
  zoomLevel: number; // 1.0 = 100%
  rotationAngle: number; // 0, 90, 180, 270
  currentPage: number;
  totalPages: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  isFullscreen: boolean;
  showInfoPanel: boolean;
  isLoading: boolean;
  error: ViewerError | null;
}

export interface MediaViewerProps {
  file: FileMetadata | FilePreviewMetadata;
  playlist?: (FileMetadata | FilePreviewMetadata)[];
  currentIndex?: number;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onClose?: () => void;
  onDownload?: (file: FileMetadata) => void | Promise<void>;
  onDelete?: (file: FileMetadata) => void | Promise<void>;
  onShare?: (file: FileMetadata) => void;
}

export interface DocumentViewerProps {
  file: FileMetadata | FilePreviewMetadata;
  content?: string;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onDownload?: (file: FileMetadata) => void | Promise<void>;
  onPrint?: () => void;
}

export interface AttachmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
  entityTitle?: string;
  attachments: FileMetadata[];
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onUpload?: (files: File[]) => void | Promise<void>;
  onDelete?: (fileId: string) => void | Promise<void>;
  onRename?: (fileId: string, newName: string) => void | Promise<void>;
  onDownload?: (file: FileMetadata) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
}

export interface ViewerAuditEvent {
  action: 'PREVIEW_OPENED' | 'FILE_DOWNLOADED' | 'FILE_SHARED' | 'FILE_DELETED' | 'VERSION_VIEWED';
  fileId: string;
  fileName: string;
  userId: string;
  tenantId: string;
  timestamp: number;
  ipAddress?: string;
}
