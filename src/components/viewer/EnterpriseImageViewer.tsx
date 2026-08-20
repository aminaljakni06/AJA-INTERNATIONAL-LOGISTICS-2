/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Image Viewer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { FileMetadata } from '../../types/fileManagementFramework';
import { MediaViewerState, ViewerPermissions } from '../../types/mediaViewerFramework';

export interface EnterpriseImageViewerProps {
  file: FileMetadata;
  imageUrl?: string;
  permissions?: Partial<ViewerPermissions>;
  isAr?: boolean;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onDownload?: () => void;
}

export const EnterpriseImageViewer: React.FC<EnterpriseImageViewerProps> = ({
  file,
  imageUrl,
  permissions = { canDownload: true },
  isAr = false,
  onNavigatePrevious,
  onNavigateNext,
  hasPrevious = false,
  hasNext = false,
  onDownload,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFitToScreen, setIsFitToScreen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeUrl = imageUrl || file.previewUrl || file.url;

  // Zoom Controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 4));
    setIsFitToScreen(false);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
    setIsFitToScreen(false);
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
    setIsFitToScreen(true);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious && onNavigatePrevious) {
        onNavigatePrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNavigateNext) {
        onNavigateNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotate();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevious, hasNext, onNavigatePrevious, onNavigateNext]);

  // Pan Image Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanPosition({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between bg-slate-950 text-white rounded-xl overflow-hidden select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl text-xs font-semibold">
        <button
          type="button"
          onClick={handleZoomIn}
          title={isAr ? 'تكبير (+)' : 'Zoom In (+)'}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title={isAr ? 'تصغير (-)' : 'Zoom Out (-)'}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="px-2 font-mono text-[11px] text-amber-400 font-extrabold">
          {Math.round(zoomLevel * 100)}%
        </span>

        <div className="w-px h-4 bg-slate-800 my-auto" />

        <button
          type="button"
          onClick={handleRotate}
          title={isAr ? 'تدوير (R)' : 'Rotate (R)'}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetZoom}
          title={isAr ? 'إعادة ضبط (0)' : 'Reset Zoom (0)'}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {permissions.canDownload && onDownload && (
          <>
            <div className="w-px h-4 bg-slate-800 my-auto" />
            <button
              type="button"
              onClick={onDownload}
              title={isAr ? 'تنزيل الصورة' : 'Download Image'}
              className="p-1.5 hover:bg-amber-600 rounded-lg text-amber-400 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Main Canvas Area */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/60 z-10">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-semibold">
              {isAr ? 'جاري تحميل الصورة...' : 'Loading image preview...'}
            </span>
          </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center max-w-sm bg-slate-900 border border-slate-800 rounded-2xl">
            <AlertCircle className="w-10 h-10 text-rose-500" />
            <span className="text-sm font-bold text-white">
              {isAr ? 'تعذر تحميل الصورة' : 'Failed to Load Image'}
            </span>
            <span className="text-xs text-slate-400">
              {isAr
                ? 'يرجى التأكد من وجود أذونات العرض أو تحميل الملف مباشرة.'
                : 'Please verify file permissions or download the image directly.'}
            </span>
          </div>
        ) : (
          <img
            src={activeUrl}
            alt={file.name}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${panPosition.x}px, ${panPosition.y}px)`,
              transition: isPanning ? 'none' : 'transform 0.2s ease-out',
            }}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl pointer-events-auto"
          />
        )}
      </div>

      {/* Navigation Buttons Overlay */}
      {hasPrevious && onNavigatePrevious && (
        <button
          type="button"
          onClick={onNavigatePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-amber-600 text-white rounded-full border border-slate-700 shadow-xl transition-all"
        >
          {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}

      {hasNext && onNavigateNext && (
        <button
          type="button"
          onClick={onNavigateNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-900/80 hover:bg-amber-600 text-white rounded-full border border-slate-700 shadow-xl transition-all"
        >
          {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};
