/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise PDF Viewer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Printer,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { FileMetadata } from '../../types/fileManagementFramework';
import { ViewerPermissions } from '../../types/mediaViewerFramework';

export interface EnterprisePdfViewerProps {
  file: FileMetadata;
  pdfUrl?: string;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const EnterprisePdfViewer: React.FC<EnterprisePdfViewerProps> = ({
  file,
  pdfUrl,
  permissions = { canDownload: true },
  isAr = false,
  onDownload,
  onPrint,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const activeUrl = pdfUrl || file.previewUrl || file.url;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      const win = window.open(activeUrl, '_blank');
      if (win) win.print();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* PDF Controls Header Toolbar */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-bold truncate max-w-xs">{file.name}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-bold">
            PDF
          </span>
        </div>

        {/* Center Page & Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(prev - 10, 50))}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title={isAr ? 'تصغير' : 'Zoom Out'}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-amber-400 font-extrabold text-[11px] min-w-10 text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(prev + 10, 200))}
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
            title={isAr ? 'تكبير' : 'Zoom In'}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-semibold"
            title={isAr ? 'طباعة المستند' : 'Print PDF'}
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{isAr ? 'طباعة' : 'Print'}</span>
          </button>

          {permissions.canDownload && onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تنزيل PDF' : 'Download PDF'}</span>
            </button>
          )}
        </div>
      </div>

      {/* PDF Rendering Canvas Frame */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950 z-10">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-semibold">
              {isAr ? 'جاري تجهيز وعرض مستند PDF...' : 'Rendering PDF document...'}
            </span>
          </div>
        )}

        {hasError ? (
          <div className="p-8 text-center max-w-md bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <span className="text-sm font-bold text-white">
              {isAr ? 'تعذر إظهار المستند في المتصفح' : 'Unable to Preview PDF Browser Directly'}
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'يمكنك تنزيل المستند وفتحه باستخدام العارض المعتمد لشركتك.'
                : 'You can download the PDF file to inspect using your system PDF reader.'}
            </p>
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                {isAr ? 'تحميل المستند الآن' : 'Download Document Now'}
              </button>
            )}
          </div>
        ) : (
          <iframe
            src={`${activeUrl}#toolbar=1&navpanes=1`}
            title={file.name}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{ zoom: `${zoomLevel}%` }}
            className="w-full h-full border-none rounded-lg bg-white shadow-inner"
          />
        )}
      </div>
    </div>
  );
};
