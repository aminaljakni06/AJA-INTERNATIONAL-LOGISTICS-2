/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise File Upload Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise File Upload, Media & Attachment System
 * Version: 1.0
 */

import { useState, useCallback } from 'react';
import {
  UploadProgress,
  UploadValidationConfig,
  UploadRequest,
  FileMetadata,
  FileCategory,
  SecurityClassification,
} from '../types/fileManagementFramework';
import { StorageManagerService } from '../services/storage/storageManagerService';

export interface UseEnterpriseUploadOptions {
  validationConfig?: UploadValidationConfig;
  entityType?: string;
  entityId?: string;
  securityClassification?: SecurityClassification;
  onUploadSuccess?: (metadata: FileMetadata) => void;
  onUploadError?: (error: string, fileName: string) => void;
}

export function useEnterpriseUpload(options: UseEnterpriseUploadOptions = {}) {
  const {
    validationConfig,
    entityType,
    entityId,
    securityClassification = 'INTERNAL',
    onUploadSuccess,
    onUploadError,
  } = options;

  const [queue, setQueue] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Handle Drag Events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Upload Batch of Files
  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      setIsUploading(true);

      for (const file of files) {
        // Validate prior to queueing
        const valRes = StorageManagerService.validateFile(file, validationConfig);
        if (!valRes.valid) {
          if (onUploadError) onUploadError(valRes.error || 'Validation failed', file.name);
          continue;
        }

        const req: UploadRequest = {
          file,
          validationConfig,
          entityType,
          entityId,
          securityClassification,
        };

        const result = await StorageManagerService.uploadFile(req, (prog) => {
          setQueue((prev) => {
            const index = prev.findIndex((q) => q.fileId === prog.fileId);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = prog;
              return copy;
            } else {
              return [prog, ...prev];
            }
          });
        });

        if (result.success && result.fileMetadata) {
          setUploadedFiles((prev) => [result.fileMetadata!, ...prev]);
          if (onUploadSuccess) onUploadSuccess(result.fileMetadata);
        } else {
          if (onUploadError)
            onUploadError(result.error || 'Upload failed', file.name);
        }
      }

      setIsUploading(false);
    },
    [validationConfig, entityType, entityId, securityClassification, onUploadSuccess, onUploadError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queue,
    isUploading,
    uploadedFiles,
    dragActive,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    processFiles,
    clearQueue,
  };
}
