/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise File Upload Zone Component
 * Phase: Enterprise UI System
 * Module: Enterprise File Upload, Media & Attachment System
 * Version: 1.0
 */

import React, { useRef } from 'react';
import {
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';
import {
  UploadValidationConfig,
  FileMetadata,
  SecurityClassification,
} from '../../types/fileManagementFramework';
import { useEnterpriseUpload } from '../../hooks/useEnterpriseUpload';

export interface EnterpriseFileUploadZoneProps {
  validationConfig?: UploadValidationConfig;
  entityType?: string;
  entityId?: string;
  securityClassification?: SecurityClassification;
  onUploadSuccess?: (metadata: FileMetadata) => void;
  onUploadError?: (error: string, fileName: string) => void;
  labelEn?: string;
  labelAr?: string;
  isAr?: boolean;
  className?: string;
}

export const EnterpriseFileUploadZone: React.FC<EnterpriseFileUploadZoneProps> = ({
  validationConfig = {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'xlsx', 'csv', 'docx', 'zip'],
  },
  entityType,
  entityId,
  securityClassification = 'INTERNAL',
  onUploadSuccess,
  onUploadError,
  labelEn = 'Upload Business Documents & Media',
  labelAr = 'رفع المستندات والوسائط التشغيلية',
  isAr = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    queue,
    isUploading,
    dragActive,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    processFiles,
    clearQueue,
  } = useEnterpriseUpload({
    validationConfig,
    entityType,
    entityId,
    securityClassification,
    onUploadSuccess,
    onUploadError,
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const maxMb = ((validationConfig.maxSizeBytes || 50 * 1024 * 1024) / (1024 * 1024)).toFixed(0);
  const extensionsText = (validationConfig.allowedExtensions || []).map((x) => `.${x}`).join(', ');

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`w-full flex flex-col gap-3 ${className}`}
    >
      {/* Primary Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-4 ring-amber-500/10'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-amber-500 hover:bg-slate-100/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-600 rounded-2xl mb-3 shadow-sm">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {isAr ? labelAr : labelEn}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isAr
            ? 'اسحب وأسقط الملفات هنا، أو انقر لاستعراض الجهاز'
            : 'Drag and drop files here, or click to browse from device'}
        </p>

        {/* Format Rules & Security Note */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
          <span className="font-mono">{isAr ? `الحد الأقصى: ${maxMb} ميجابايت` : `Max size: ${maxMb}MB`}</span>
          <span>•</span>
          <span className="font-mono">{extensionsText}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAr ? 'فحص الأمان مشفر' : 'Encrypted Virus Scanning'}
          </span>
        </div>
      </div>

      {/* Active Upload Queue List */}
      {queue.length > 0 && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? `قائمة الرفع النشطة (${queue.length})` : `Upload Queue (${queue.length})`}
            </span>
            <button
              type="button"
              onClick={clearQueue}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {isAr ? 'مسح السجل' : 'Clear List'}
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {queue.map((item) => {
              const isDone = item.status === 'COMPLETED';
              const isFailed = item.status === 'FAILED';

              return (
                <div
                  key={item.fileId}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate text-slate-800 dark:text-slate-200">
                        {item.fileName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDone && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          {isAr ? 'تم الرفع' : 'Uploaded'}
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <AlertCircle className="w-4 h-4" />
                          {isAr ? 'فشل' : 'Failed'}
                        </span>
                      )}
                      {!isDone && !isFailed && (
                        <span className="text-amber-600 font-mono font-bold">
                          {item.progressPercentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!isDone && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full transition-all duration-150"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                  )}

                  {!isDone && !isFailed && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>
                        {(item.bytesTransferred / 1024 / 1024).toFixed(1)} MB /{' '}
                        {(item.totalBytes / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <span>
                        {item.remainingSeconds}s {isAr ? 'متبقي' : 'remaining'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
