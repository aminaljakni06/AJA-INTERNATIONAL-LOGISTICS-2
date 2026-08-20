/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Attachment Manager Component
 * Phase: Enterprise UI System
 * Module: Enterprise File Upload, Media & Attachment System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  Paperclip,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Pin,
  Eye,
  FileText,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Attachment, FileMetadata } from '../../types/fileManagementFramework';
import { StorageManagerService } from '../../services/storage/storageManagerService';
import { EnterpriseFileUploadZone } from './EnterpriseFileUploadZone';
import { EnterpriseFilePreviewModal } from './EnterpriseFilePreviewModal';

export interface EnterpriseAttachmentManagerProps {
  entityType?: string; // e.g. 'shipment', 'customer', 'quote'
  entityId?: string;
  isAr?: boolean;
  className?: string;
}

export const EnterpriseAttachmentManager: React.FC<EnterpriseAttachmentManagerProps> = ({
  entityType = 'shipment',
  entityId = 'SHP-2026-8801',
  isAr = false,
  className = '',
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>(
    StorageManagerService.getAttachmentsForEntity(entityType, entityId)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUploadZone, setShowUploadZone] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);

  const handleTogglePin = (attId: string) => {
    const updated = StorageManagerService.togglePinAttachment(attId);
    setAttachments(updated.filter((a) => a.entityType === entityType && a.entityId === entityId));
  };

  const handleDelete = (attId: string) => {
    const updated = StorageManagerService.deleteAttachment(attId);
    setAttachments(updated.filter((a) => a.entityType === entityType && a.entityId === entityId));
  };

  const handleUploadSuccess = (metadata: FileMetadata) => {
    const fresh = StorageManagerService.getAttachmentsForEntity(entityType, entityId);
    setAttachments(fresh);
  };

  const filteredAttachments = attachments.filter((att) => {
    if (!searchQuery) return true;
    const nameMatch = att.fileMetadata.name.toLowerCase().includes(searchQuery.toLowerCase());
    const tagMatch = att.fileMetadata.tags.some((t) =>
      t.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return nameMatch || tagMatch;
  });

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className={`w-full flex flex-col gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}
    >
      {/* Top Title & Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl">
            <Paperclip className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr ? 'مرفقات السجل والوثائق' : 'Attachments & Operational Documents'}
            </h3>
            <span className="text-xs text-slate-400">
              {isAr ? `إجمالي المرفقات المعتمدة: ${attachments.length}` : `Total verified files: ${attachments.length}`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadZone(!showUploadZone)}
          className="px-3.5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة مرفق جديد' : 'Attach File'}</span>
          {showUploadZone ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible File Upload Dropzone */}
      {showUploadZone && (
        <div className="animate-in fade-in duration-200">
          <EnterpriseFileUploadZone
            entityType={entityType}
            entityId={entityId}
            onUploadSuccess={handleUploadSuccess}
            isAr={isAr}
          />
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="relative w-full">
        <Search
          className={`w-4 h-4 absolute ${isAr ? 'right-3' : 'left-3'} top-2.5 text-slate-400`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isAr ? 'ابحث في المرفقات والوسوم...' : 'Search attachments and tags...'}
          className={`w-full py-2 ${
            isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'
          } text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500`}
        />
      </div>

      {/* Attachments Data Grid / List */}
      <div className="flex flex-col gap-2">
        {filteredAttachments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {isAr ? 'لا توجد مرفقات مطابقة' : 'No attachments found for this entity'}
          </div>
        ) : (
          filteredAttachments.map((att) => {
            const meta = att.fileMetadata;
            const isImage = meta.category === 'image';

            return (
              <div
                key={att.id}
                onClick={() => setPreviewFile(meta)}
                className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  att.isPinned
                    ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-amber-600 shrink-0">
                    {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {meta.name}
                      </span>
                      {att.categoryLabel && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded shrink-0">
                          {att.categoryLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 truncate">
                      {(meta.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {att.attachedBy} •{' '}
                      {new Date(att.attachedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleTogglePin(att.id)}
                    className="p-1.5 hover:text-amber-500 text-slate-400 transition-colors"
                  >
                    <Pin
                      className={`w-4 h-4 ${
                        att.isPinned ? 'fill-amber-500 text-amber-500' : ''
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewFile(meta)}
                    className="p-1.5 hover:text-amber-600 text-slate-400 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(att.id)}
                    className="p-1.5 hover:text-rose-600 text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* File Preview Modal */}
      <EnterpriseFilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileMetadata={previewFile}
        isAr={isAr}
      />
    </div>
  );
};
