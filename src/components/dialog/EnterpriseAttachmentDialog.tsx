/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Attachment Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Media Preview, Document Viewer & Attachment Dialog System
 * Version: 1.0
 */

import React, { useState, useMemo } from 'react';
import {
  Paperclip,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Edit2,
  Eye,
  History,
  Shield,
  Upload,
  Check,
  X,
  FileSpreadsheet,
  FileCode,
  Music,
  Video,
} from 'lucide-react';
import { FileMetadata } from '../../types/fileManagementFramework';
import { AttachmentDialogProps, AttachmentViewLayout } from '../../types/mediaViewerFramework';
import { EnterpriseDialog } from './EnterpriseDialog';
import { EnterpriseMediaPreviewDialog } from './EnterpriseMediaPreviewDialog';

export const EnterpriseAttachmentDialog: React.FC<AttachmentDialogProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  attachments,
  permissions = {
    canView: true,
    canDownload: true,
    canDelete: true,
    canEdit: true,
  },
  isAr = false,
  onUpload,
  onDelete,
  onRename,
  onDownload,
  onRefresh,
}) => {
  const [layoutMode, setLayoutMode] = useState<AttachmentViewLayout>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Filter and Sort Attachments
  const filteredAttachments = useMemo(() => {
    return attachments
      .filter((file) => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'ALL' || file.category === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return b.sizeBytes - a.sizeBytes;
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      });
  }, [attachments, searchQuery, selectedCategory, sortBy]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onUpload) {
      setIsUploading(true);
      try {
        await onUpload(Array.from(e.target.files));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const startRename = (file: FileMetadata) => {
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const confirmRename = async (fileId: string) => {
    if (onRename && editingName.trim()) {
      await onRename(fileId, editingName.trim());
    }
    setEditingFileId(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <>
      <EnterpriseDialog
        id="attachment_dialog"
        isOpen={isOpen}
        onClose={onClose}
        titleEn={`Attachments: ${entityTitle || entityType}`}
        titleAr={`المرفقات: ${entityTitle || entityType}`}
        subtitleEn={`ID: #${entityId} • ${attachments.length} Total Files`}
        subtitleAr={`المعرف: #${entityId} • ${attachments.length} ملف إجمالي`}
        icon={<Paperclip className="w-5 h-5 text-amber-600" />}
        isAr={isAr}
        statusBadge={{
          labelEn: `${attachments.length} ATTACHMENTS`,
          labelAr: `${attachments.length} مرفقات`,
          variant: 'info',
        }}
        config={{
          size: 'xl',
          variant: 'standard',
        }}
        actions={[
          {
            id: 'close',
            labelEn: 'Done',
            labelAr: 'إغلاق',
            variant: 'primary',
            onClick: onClose,
          },
        ]}
      >
        <div className="flex flex-col gap-4 py-2">
          {/* Controls Bar: Search, Category, Layout Switcher & Upload Button */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'البحث في المرفقات...' : 'Search attachments...'}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Layout Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-900 rounded-xl">
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'list'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layoutMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            {onUpload && (
              <label className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>{isAr ? 'رفع مرفق جديد' : 'Upload Attachment'}</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          {/* Attachments Display Section */}
          {filteredAttachments.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-3">
              <Paperclip className="w-10 h-10 text-slate-400" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'لا توجد مرفقات مطابقة' : 'No Attachments Found'}
              </span>
              <span className="text-xs text-slate-400">
                {isAr
                  ? 'قم برفع مستندات جديدة أو تغيير مصطلحات البحث.'
                  : 'Upload documents or adjust your search filter.'}
              </span>
            </div>
          ) : layoutMode === 'list' ? (
            /* List Layout */
            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredAttachments.map((file, idx) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                      {getCategoryIcon(file.category)}
                    </div>

                    <div className="flex flex-col min-w-0">
                      {editingFileId === file.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-1 border border-amber-500 rounded bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => confirmRename(file.id)}
                            className="p-1 bg-emerald-600 text-white rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFileId(null)}
                            className="p-1 bg-slate-600 text-white rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {file.uploaderEmail} •{' '}
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 rounded-lg transition-colors"
                      title={isAr ? 'معاينة' : 'Preview'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {permissions.canDownload && (
                      <button
                        type="button"
                        onClick={() =>
                          onDownload
                            ? onDownload(file)
                            : window.open(file.previewUrl || file.url, '_blank')
                        }
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                        title={isAr ? 'تنزيل' : 'Download'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}

                    {permissions.canEdit && (
                      <button
                        type="button"
                        onClick={() => startRename(file)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                        title={isAr ? 'تسمية' : 'Rename'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {permissions.canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(file.id)}
                        className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 rounded-lg transition-colors"
                        title={isAr ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid Layout */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {filteredAttachments.map((file, idx) => (
                <div
                  key={file.id}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 rounded-2xl flex flex-col justify-between gap-3 text-xs transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {getCategoryIcon(file.category)}
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      {file.extension}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onDownload
                          ? onDownload(file)
                          : window.open(file.previewUrl || file.url, '_blank')
                      }
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </EnterpriseDialog>

      {/* Preview Dialog Modal Trigger */}
      {previewIndex !== null && (
        <EnterpriseMediaPreviewDialog
          isOpen={true}
          onClose={() => setPreviewIndex(null)}
          files={filteredAttachments}
          currentIndex={previewIndex}
          onIndexChange={setPreviewIndex}
          isAr={isAr}
          onDownload={onDownload}
          onDelete={
            onDelete
              ? async (file) => {
                  await onDelete(file.id);
                  setPreviewIndex(null);
                }
              : undefined
          }
        />
      )}
    </>
  );
};
