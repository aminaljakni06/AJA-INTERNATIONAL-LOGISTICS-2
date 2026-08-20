/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Media Library Component
 * Phase: Enterprise UI System
 * Module: Enterprise File Upload, Media & Attachment System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  Grid,
  List,
  Search,
  Filter,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  Eye,
  Download,
  Sparkles,
  Tag,
  Clock,
  FolderOpen,
} from 'lucide-react';
import { FileMetadata, FileCategory } from '../../types/fileManagementFramework';
import { StorageManagerService } from '../../services/storage/storageManagerService';
import { EnterpriseFilePreviewModal } from './EnterpriseFilePreviewModal';

export interface EnterpriseMediaLibraryProps {
  isAr?: boolean;
  className?: string;
}

export const EnterpriseMediaLibrary: React.FC<EnterpriseMediaLibraryProps> = ({
  isAr = false,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);

  // Fetch all media assets
  const allAttachments = StorageManagerService.getAttachmentsForEntity();
  const fileMetadatas = allAttachments.map((a) => a.fileMetadata);

  const filteredFiles = fileMetadatas.filter((file) => {
    if (selectedCategory !== 'ALL' && file.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const nameMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const tagMatch = file.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const ocrMatch = file.aiMetadata?.ocrText?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return nameMatch || tagMatch || ocrMatch;
  });

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`w-full flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {isAr ? 'مكتبة الوسائط والملفات المؤسسية' : 'Enterprise Media & Asset Library'}
            </h2>
            <span className="text-xs text-slate-400">
              {isAr ? 'المستندات، الصور، الشهادات ومستندات الجمارك' : 'Central repository for operational documents, images & certificates'}
            </span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <div className="relative flex-1 w-full">
          <Search
            className={`w-4 h-4 absolute ${isAr ? 'right-3.5' : 'left-3.5'} top-3 text-slate-400`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr ? 'ابحث باسم الملف، الوسوم أو نصوص OCR...' : 'Search file name, tags or OCR text...'
            }
            className={`w-full py-2.5 ${
              isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'
            } text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500`}
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'pdf', 'image', 'document', 'spreadsheet'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl uppercase transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or List Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {filteredFiles.map((file) => {
            const isImg = file.category === 'image';

            return (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className="group relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Thumbnail Header */}
                <div className="h-36 bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  {isImg && file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl">
                      <FileText className="w-10 h-10 stroke-1" />
                    </div>
                  )}

                  {/* Security Classification Badge */}
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-sm">
                    {file.securityClassification}
                  </span>
                </div>

                {/* Info Footer */}
                <div className="p-3.5 flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    <span className="uppercase">{file.extension}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-2 mt-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl flex items-center justify-between hover:border-amber-500 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-amber-600 shrink-0">
                  {file.category === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {file.uploaderEmail} • {new Date(file.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <EnterpriseFilePreviewModal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        fileMetadata={selectedFile}
        isAr={isAr}
      />
    </div>
  );
};
