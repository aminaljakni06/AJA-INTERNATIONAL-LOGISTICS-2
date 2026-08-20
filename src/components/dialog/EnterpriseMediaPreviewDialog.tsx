/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Media Preview Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  Eye,
  X,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  Tag,
  Lock,
} from 'lucide-react';
import { FileMetadata } from '../../types/fileManagementFramework';
import { ViewerPermissions } from '../../types/mediaViewerFramework';
import { EnterpriseDialog } from './EnterpriseDialog';
import { EnterpriseImageViewer } from '../viewer/EnterpriseImageViewer';
import { EnterprisePdfViewer } from '../viewer/EnterprisePdfViewer';
import { EnterpriseVideoViewer } from '../viewer/EnterpriseVideoViewer';
import { EnterpriseAudioViewer } from '../viewer/EnterpriseAudioViewer';
import { EnterpriseDocumentViewer } from '../viewer/EnterpriseDocumentViewer';

export interface EnterpriseMediaPreviewDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  files: FileMetadata[];
  currentIndex?: number;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onIndexChange?: (newIndex: number) => void;
  onDownload?: (file: FileMetadata) => void | Promise<void>;
  onDelete?: (file: FileMetadata) => void | Promise<void>;
  onShare?: (file: FileMetadata) => void;
}

export const EnterpriseMediaPreviewDialog: React.FC<EnterpriseMediaPreviewDialogProps> = ({
  id = 'enterprise_media_preview_dialog',
  isOpen,
  onClose,
  files,
  currentIndex: externalIndex = 0,
  permissions = {
    canView: true,
    canDownload: true,
    canShare: true,
    canDelete: false,
  },
  isAr = false,
  onIndexChange,
  onDownload,
  onDelete,
  onShare,
}) => {
  const [internalIndex, setInternalIndex] = useState<number>(externalIndex);
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeIndex = onIndexChange ? externalIndex : internalIndex;
  const currentFile = files[activeIndex];

  if (!isOpen || !currentFile) return null;

  const totalFiles = files.length;
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex < totalFiles - 1;

  const handleNavigatePrevious = () => {
    if (hasPrevious) {
      const nextIdx = activeIndex - 1;
      if (onIndexChange) onIndexChange(nextIdx);
      else setInternalIndex(nextIdx);
    }
  };

  const handleNavigateNext = () => {
    if (hasNext) {
      const nextIdx = activeIndex + 1;
      if (onIndexChange) onIndexChange(nextIdx);
      else setInternalIndex(nextIdx);
    }
  };

  const handleDownload = () => {
    if (onDownload && currentFile) {
      onDownload(currentFile);
    } else if (currentFile) {
      window.open(currentFile.previewUrl || currentFile.url, '_blank');
    }
  };

  // Determine file category/type
  const category = currentFile.category;
  const ext = (currentFile.extension || '').toLowerCase();
  const isImage = category === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext);
  const isPdf = category === 'pdf' || ext === 'pdf';
  const isVideo = category === 'video' || ['mp4', 'webm', 'mov', 'mkv'].includes(ext);
  const isAudio = category === 'audio' || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);

  return (
    <EnterpriseDialog
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      titleEn={currentFile.name}
      titleAr={currentFile.name}
      subtitleEn={`${(currentFile.sizeBytes / (1024 * 1024)).toFixed(2)} MB • ${currentFile.mimeType}`}
      subtitleAr={`${(currentFile.sizeBytes / (1024 * 1024)).toFixed(2)} MB • ${currentFile.mimeType}`}
      icon={<Eye className="w-5 h-5 text-amber-600" />}
      isAr={isAr}
      statusBadge={{
        labelEn: `FILE ${activeIndex + 1} OF ${totalFiles}`,
        labelAr: `ملف ${activeIndex + 1} من ${totalFiles}`,
        variant: 'info',
      }}
      config={{
        size: isFullscreen ? 'fullscreen' : 'fullWidth',
        variant: 'media',
        closeOnBackdropClick: false,
      }}
      actions={[
        {
          id: 'info_toggle',
          labelEn: showInfoPanel ? 'Hide Details' : 'File Details',
          labelAr: showInfoPanel ? 'إخفاء التفاصيل' : 'تفاصيل الملف',
          variant: 'outline' as const,
          icon: <Info className="w-4 h-4" />,
          onClick: () => setShowInfoPanel((prev) => !prev),
        },
        ...(permissions.canDownload
          ? [
              {
                id: 'download',
                labelEn: 'Download',
                labelAr: 'تنزيل',
                variant: 'primary' as const,
                icon: <Download className="w-4 h-4" />,
                onClick: handleDownload,
              },
            ]
          : []),
      ]}
    >
      <div className="relative w-full h-[72vh] flex gap-4 overflow-hidden">
        {/* Main Viewer Area */}
        <div className="flex-1 min-w-0 h-full flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800">
          {isImage ? (
            <EnterpriseImageViewer
              file={currentFile}
              permissions={permissions}
              isAr={isAr}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onNavigatePrevious={handleNavigatePrevious}
              onNavigateNext={handleNavigateNext}
              onDownload={handleDownload}
            />
          ) : isPdf ? (
            <EnterprisePdfViewer
              file={currentFile}
              permissions={permissions}
              isAr={isAr}
              onDownload={handleDownload}
            />
          ) : isVideo ? (
            <EnterpriseVideoViewer
              file={currentFile}
              permissions={permissions}
              isAr={isAr}
              onDownload={handleDownload}
            />
          ) : isAudio ? (
            <EnterpriseAudioViewer
              file={currentFile}
              permissions={permissions}
              isAr={isAr}
              onDownload={handleDownload}
            />
          ) : (
            <EnterpriseDocumentViewer
              file={currentFile}
              permissions={permissions}
              isAr={isAr}
              onDownload={handleDownload}
            />
          )}
        </div>

        {/* Retractable File Information Sidebar */}
        {showInfoPanel && (
          <div className="w-80 shrink-0 h-full p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-right duration-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-white">
              <span>{isAr ? 'معلومات المستند' : 'File Metadata'}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded">
                {currentFile.securityClassification}
              </span>
            </div>

            <div className="flex flex-col gap-3 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'المُنشئ:' : 'Uploaded By:'}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">
                  {currentFile.uploaderEmail}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'تاريخ الرفع:' : 'Upload Date:'}</span>
                <span className="font-bold text-slate-900 dark:text-white ml-auto">
                  {new Date(currentFile.uploadDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'التصنيف:' : 'Category:'}</span>
                <span className="font-bold uppercase text-slate-900 dark:text-white ml-auto">
                  {currentFile.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'التدقيق الأمني:' : 'Security Scan:'}</span>
                <span className="font-bold text-emerald-600 ml-auto">
                  {isAr ? 'موثوق ومعتمد' : 'VERIFIED'}
                </span>
              </div>
            </div>

            {currentFile.description && (
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-slate-400">{isAr ? 'الوصف:' : 'Description:'}</span>
                <p className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed text-slate-700 dark:text-slate-200">
                  {currentFile.description}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="font-semibold text-slate-400">{isAr ? 'الوسوم:' : 'Tags:'}</span>
              <div className="flex flex-wrap gap-1.5">
                {currentFile.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded border border-amber-200 dark:border-amber-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </EnterpriseDialog>
  );
};
