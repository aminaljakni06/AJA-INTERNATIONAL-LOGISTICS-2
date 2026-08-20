/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Quick View Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System
 * Version: 1.0
 */

import React from 'react';
import { Eye, ExternalLink, Edit, Printer, Share2 } from 'lucide-react';
import { EntityMetadata } from '../../types/wizardFramework';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseQuickViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: EntityMetadata;
  isAr?: boolean;
  onOpenFullRecord?: () => void;
  onEdit?: () => void;
  children: React.ReactNode;
}

export const EnterpriseQuickViewDialog: React.FC<EnterpriseQuickViewDialogProps> = ({
  isOpen,
  onClose,
  metadata,
  isAr = false,
  onOpenFullRecord,
  onEdit,
  children,
}) => {
  return (
    <EnterpriseDialog
      id={`quickview_${metadata.entityId}`}
      isOpen={isOpen}
      onClose={onClose}
      titleEn={`Quick Inspect: ${metadata.entityType}`}
      titleAr={`معاينة سريعة: ${metadata.entityType}`}
      subtitleEn={metadata.recordTitle}
      subtitleAr={metadata.recordTitle}
      icon={<Eye className="w-5 h-5 text-blue-600" />}
      isAr={isAr}
      statusBadge={metadata.statusBadge}
      config={{
        size: 'md',
        variant: 'lookup',
        closeOnBackdropClick: true,
      }}
      actions={[
        {
          id: 'close',
          labelEn: 'Close',
          labelAr: 'إغلاق',
          variant: 'ghost',
          onClick: onClose,
        },
        ...(onEdit
          ? [
              {
                id: 'edit',
                labelEn: 'Edit',
                labelAr: 'تعديل',
                variant: 'outline' as const,
                icon: <Edit className="w-4 h-4" />,
                onClick: onEdit,
              },
            ]
          : []),
        ...(onOpenFullRecord
          ? [
              {
                id: 'full_record',
                labelEn: 'Open Full Record',
                labelAr: 'فتح السجل الكامل',
                variant: 'primary' as const,
                icon: <ExternalLink className="w-4 h-4" />,
                onClick: onOpenFullRecord,
              },
            ]
          : []),
      ]}
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Quick Header Summary */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 dark:text-white">
              {metadata.recordTitle}
            </span>
            <span className="font-mono text-slate-400">ID: #{metadata.entityId}</span>
          </div>
          {metadata.createdAt && (
            <span className="text-[10px] text-slate-400">{metadata.createdAt}</span>
          )}
        </div>

        {/* Inspection Details */}
        <div className="min-h-40">{children}</div>
      </div>
    </EnterpriseDialog>
  );
};
