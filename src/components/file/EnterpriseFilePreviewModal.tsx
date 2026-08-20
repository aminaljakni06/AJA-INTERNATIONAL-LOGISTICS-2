/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise File Preview Modal Component
 * Phase: Enterprise UI System
 * Module: Enterprise File Upload, Media & Attachment System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Link2,
  Lock,
  Eye,
  FileText,
  Image as ImageIcon,
  History,
  Sparkles,
  ShieldCheck,
  Check,
  Calendar,
  User,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { FileMetadata, FileVersion } from '../../types/fileManagementFramework';
import { StorageManagerService } from '../../services/storage/storageManagerService';

export interface EnterpriseFilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileMetadata: FileMetadata | null;
  isAr?: boolean;
}

export const EnterpriseFilePreviewModal: React.FC<EnterpriseFilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileMetadata,
  isAr = false,
}) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'versions' | 'ai'>('preview');

  if (!isOpen || !fileMetadata) return null;

  const handleCopyLink = () => {
    const url = StorageManagerService.generateDownloadUrl(fileMetadata.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    const downloadUrl = StorageManagerService.generateDownloadUrl(fileMetadata.id);
    window.open(downloadUrl, '_blank');
  };

  const isImage = fileMetadata.category === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(fileMetadata.extension);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl shrink-0">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {fileMetadata.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 font-bold uppercase rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {fileMetadata.extension}
                </span>
                <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200">
                  {fileMetadata.securityClassification}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {(fileMetadata.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {fileMetadata.mimeType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
              <span>{copiedLink ? (isAr ? 'تم النسخ' : 'Copied Link') : (isAr ? 'نسخ الرابط' : 'Copy Signed Link')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تنزيل' : 'Download'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs Navigation */}
        <div className="px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isAr ? 'المعاينة المباشرة' : 'Document Preview'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'versions'
                ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <History className="w-4 h-4" />
            <span>
              {isAr
                ? `سجل الإصدارات (${fileMetadata.versionsCount})`
                : `Version History (${fileMetadata.versionsCount})`}
            </span>
          </button>

          {fileMetadata.aiMetadata && (
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'الذكاء الاصطناعي وOCR' : 'AI Analysis & OCR'}</span>
            </button>
          )}
        </div>

        {/* Modal Main Body (Preview Canvas + Sidebar Metadata) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-auto">
            {activeTab === 'preview' && (
              isImage ? (
                <img
                  src={fileMetadata.previewUrl || fileMetadata.url}
                  alt={fileMetadata.name}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
                />
              ) : (
                /* Non-Image Document Viewer Placeholder */
                <div className="w-full h-full max-w-2xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between overflow-y-auto">
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
                      <FileText className="w-8 h-8 text-amber-600" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {fileMetadata.name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {fileMetadata.checksumHash}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                      {fileMetadata.aiMetadata?.ocrText ||
                        'PREVIEW ENGINE ACTIVE: Document verified and sealed for AJA International Logistics Enterprise operations.'}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{isAr ? 'مزود التخزين: FIREBASE_STORAGE' : 'Storage Provider: FIREBASE_STORAGE'}</span>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="text-amber-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{isAr ? 'فتح النافذة الأصلية' : 'Open Full Window'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Versions History Timeline Tab */}
            {activeTab === 'versions' && (
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? 'جدول المراجعات والتاريخ' : 'Revision History & Timeline'}
                </h3>
                <div className="flex flex-col gap-3">
                  {(fileMetadata.versions || []).map((ver) => (
                    <div
                      key={ver.versionNumber}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded">
                            v{ver.versionNumber}
                          </span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {ver.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {ver.uploadedBy} • {new Date(ver.uploadDate).toLocaleString()}
                        </span>
                        {ver.changeNotes && (
                          <span className="text-xs text-slate-600 dark:text-slate-300 italic">
                            "{ver.changeNotes}"
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleDownload}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-amber-600 hover:text-white rounded-lg transition-colors"
                      >
                        {isAr ? 'تحميل هذا الاصدار' : 'Fetch Revision'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI OCR & Analysis Tab */}
            {activeTab === 'ai' && fileMetadata.aiMetadata && (
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                  <Sparkles className="w-5 h-5" />
                  <span>{isAr ? 'التحليل الذكي واستخراج النصوص' : 'AI Analysis & Extraction'}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-500">{isAr ? 'الملخص' : 'Summary'}</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    {fileMetadata.aiMetadata.summary}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-500">{isAr ? 'النص المستخرج (OCR)' : 'Extracted Text (OCR)'}</span>
                  <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 p-3 bg-slate-900 text-amber-300 rounded-xl overflow-x-auto whitespace-pre-wrap">
                    {fileMetadata.aiMetadata.ocrText}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Right Metadata Drawer Panel */}
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-5 overflow-y-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'بيانات المستند التفصيلية' : 'File Metadata'}
            </span>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <User className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'المُنشئ:' : 'Uploader:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">
                  {fileMetadata.uploaderEmail}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'تاريخ الرفع:' : 'Upload Date:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white ml-auto">
                  {new Date(fileMetadata.uploadDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Hash className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'التصنيف:' : 'Category:'}</span>
                <span className="font-semibold uppercase text-slate-900 dark:text-white ml-auto">
                  {fileMetadata.category}
                </span>
              </div>
            </div>

            {/* Description */}
            {fileMetadata.description && (
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-semibold text-slate-500">{isAr ? 'الوصف:' : 'Description:'}</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  {fileMetadata.description}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-500">{isAr ? 'الوسوم:' : 'Tags:'}</span>
              <div className="flex flex-wrap gap-1.5">
                {fileMetadata.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
