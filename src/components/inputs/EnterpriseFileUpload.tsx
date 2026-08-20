/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise File Upload Component
 * Phase: Enterprise UI System
 * Module: Enterprise Input Components System
 * Version: 1.0
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, FileSpreadsheet, Image as ImageIcon, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UploadInputProps } from '../../types/inputComponentsFramework';
import { EnterpriseInputWrapper } from './EnterpriseInputWrapper';

export const EnterpriseFileUpload: React.FC<UploadInputProps> = (props) => {
  const {
    fieldId,
    acceptTypes = ['.pdf', '.xlsx', '.csv', '.doc', '.docx', 'image/*'],
    maxSizeBytes = 10 * 1024 * 1024, // 10MB
    maxFiles = 5,
    uploadCategory = 'document',
    dragDrop = true,
    onUpload,
    existingFiles = [],
    onRemoveFile,
    disabled = false,
    readOnly = false,
    isAr = false,
    isDisabled,
    isReadOnly,
  } = props;

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileList, setFileList] = useState<{ name: string; size: number; error?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveDisabled = disabled || isDisabled;
  const effectiveReadOnly = readOnly || isReadOnly;

  const handleFiles = (files: FileList | File[]) => {
    if (effectiveDisabled || effectiveReadOnly) return;
    const arrayFiles = Array.from(files);
    const validFiles: File[] = [];
    const newFileEntries: { name: string; size: number; error?: string }[] = [];

    for (const f of arrayFiles) {
      if (f.size > maxSizeBytes) {
        newFileEntries.push({
          name: f.name,
          size: f.size,
          error: isAr ? 'يتجاوز الحجم المسموح' : 'Exceeds maximum allowed size',
        });
      } else {
        validFiles.push(f);
        newFileEntries.push({ name: f.name, size: f.size });
      }
    }

    setFileList((prev) => [...prev, ...newFileEntries]);
    if (validFiles.length > 0 && onUpload) {
      onUpload(validFiles);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!effectiveDisabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
      return <ImageIcon className="w-5 h-5 text-sky-500 shrink-0" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />;
    }
    return <FileText className="w-5 h-5 text-amber-500 shrink-0" />;
  };

  return (
    <EnterpriseInputWrapper {...props}>
      <div className="flex flex-col gap-3 w-full">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !effectiveDisabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer ${
            isDragging
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80'
          } ${effectiveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={acceptTypes.join(',')}
            onChange={handleInputChange}
            disabled={effectiveDisabled}
            className="hidden"
          />

          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-2xl">
            <Upload className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isAr ? 'انقر أو اسحب الملفات هنا للرفع' : 'Click or drag files here to upload'}
            </span>
            <span className="text-xs text-slate-400">
              {isAr
                ? `الأنواع المدعومة: ${acceptTypes.join(', ')} (الحد الأقصى ${formatFileSize(maxSizeBytes)})`
                : `Supported: ${acceptTypes.join(', ')} (Max ${formatFileSize(maxSizeBytes)})`}
            </span>
          </div>
        </div>

        {/* Uploaded Files Preview List */}
        {(existingFiles.length > 0 || fileList.length > 0) && (
          <div className="flex flex-col gap-2">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-2.5 truncate">
                  {getCategoryIcon(file.name)}
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatFileSize(file.sizeBytes)}</span>
                  </div>
                </div>

                {onRemoveFile && !effectiveReadOnly && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {fileList.map((file, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border rounded-xl ${
                  file.error ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {getCategoryIcon(file.name)}
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </span>
                    <span className={`text-[10px] ${file.error ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                      {file.error || formatFileSize(file.size)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFileList((prev) => prev.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </EnterpriseInputWrapper>
  );
};
