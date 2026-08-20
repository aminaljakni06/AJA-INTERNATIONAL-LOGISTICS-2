/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Entity Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Edit2,
  Eye,
  History,
  Paperclip,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
  Printer,
  Share2,
  Lock,
  Unlock,
  Archive,
  Trash2,
  Sparkles,
  Layers,
  UserCheck,
  Building,
} from 'lucide-react';
import {
  EntityDialogMode,
  EntityMetadata,
  EntityRecordNavigation,
} from '../../types/wizardFramework';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseEntityDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  mode?: EntityDialogMode;
  metadata: EntityMetadata;
  navigation?: EntityRecordNavigation;
  isAr?: boolean;
  isLoading?: boolean;
  isDirty?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onEdit?: () => void;
  onClone?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onSave?: () => void | Promise<void>;
  children: React.ReactNode;
}

export const EnterpriseEntityDialog: React.FC<EnterpriseEntityDialogProps> = ({
  id = 'entity_dialog',
  isOpen,
  onClose,
  mode = 'VIEW',
  metadata,
  navigation,
  isAr = false,
  isLoading = false,
  isDirty = false,
  activeTab: externalActiveTab,
  onTabChange,
  onEdit,
  onClone,
  onArchive,
  onDelete,
  onPrint,
  onExport,
  onSave,
  children,
}) => {
  const [internalTab, setInternalTab] = useState<string>('overview');
  const activeTab = externalActiveTab || internalTab;

  const handleTabClick = (tabId: string) => {
    setInternalTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'CREATE':
        return isAr ? `إنشاء ${metadata.entityType}` : `Create ${metadata.entityType}`;
      case 'EDIT':
        return isAr ? `تعديل ${metadata.entityType}` : `Edit ${metadata.entityType}`;
      case 'CLONE':
      case 'DUPLICATE':
        return isAr ? `نسخ ${metadata.entityType}` : `Duplicate ${metadata.entityType}`;
      case 'AUDIT':
        return isAr ? `سجل تدقيق ${metadata.entityType}` : `Audit Log - ${metadata.entityType}`;
      case 'HISTORY':
        return isAr ? `تاريخ التعديلات` : `Version History`;
      case 'QUICK_VIEW':
      case 'PREVIEW':
      case 'VIEW':
      case 'DETAILS':
      default:
        return isAr ? `تفاصيل ${metadata.entityType}` : `${metadata.entityType} Details`;
    }
  };

  const getHeaderIcon = () => {
    if (mode === 'CREATE' || mode === 'EDIT') return <Edit2 className="w-5 h-5" />;
    if (mode === 'AUDIT' || mode === 'HISTORY') return <History className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const tabs = [
    { id: 'overview', labelEn: 'Overview', labelAr: 'نظرة عامة' },
    {
      id: 'documents',
      labelEn: 'Documents',
      labelAr: 'المستندات',
      count: metadata.relatedCounts?.documentsCount,
    },
    {
      id: 'activities',
      labelEn: 'Activities',
      labelAr: 'الأنشطة',
      count: metadata.relatedCounts?.activitiesCount,
    },
    {
      id: 'audit',
      labelEn: 'Audit Trail',
      labelAr: 'سجل التدقيق',
      count: metadata.relatedCounts?.auditLogsCount,
    },
  ];

  return (
    <EnterpriseDialog
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      titleEn={getModeTitle()}
      titleAr={getModeTitle()}
      subtitleEn={metadata.recordTitle}
      subtitleAr={metadata.recordTitle}
      icon={getHeaderIcon()}
      isAr={isAr}
      metadata={{
        moduleName: metadata.entityType,
        recordId: metadata.entityId,
      }}
      statusBadge={metadata.statusBadge}
      config={{
        size: 'xl',
        variant: mode === 'CREATE' || mode === 'EDIT' ? 'form' : 'standard',
        closeOnBackdropClick: mode !== 'EDIT' && mode !== 'CREATE',
      }}
      state={{
        isLoading,
        isDirty,
      }}
      actions={[
        ...(mode === 'VIEW' || mode === 'DETAILS'
          ? [
              ...(onPrint
                ? [
                    {
                      id: 'print',
                      labelEn: 'Print',
                      labelAr: 'طباعة',
                      variant: 'ghost' as const,
                      icon: <Printer className="w-4 h-4" />,
                      onClick: onPrint,
                    },
                  ]
                : []),
              ...(onClone
                ? [
                    {
                      id: 'clone',
                      labelEn: 'Duplicate',
                      labelAr: 'نسخ',
                      variant: 'outline' as const,
                      icon: <Copy className="w-4 h-4" />,
                      onClick: onClone,
                    },
                  ]
                : []),
              ...(onEdit
                ? [
                    {
                      id: 'edit',
                      labelEn: 'Edit Record',
                      labelAr: 'تعديل السجل',
                      variant: 'primary' as const,
                      icon: <Edit2 className="w-4 h-4" />,
                      onClick: onEdit,
                    },
                  ]
                : []),
            ]
          : [
              {
                id: 'cancel',
                labelEn: 'Cancel',
                labelAr: 'إلغاء',
                variant: 'ghost' as const,
                onClick: onClose,
              },
              {
                id: 'save',
                labelEn: 'Save Entity',
                labelAr: 'حفظ السجل',
                variant: 'primary' as const,
                isLoading,
                onClick: onSave,
              },
            ]),
      ]}
    >
      <div className="flex flex-col gap-4">
        {/* Record Sequential Navigation Bar */}
        {navigation && (
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              {isAr
                ? `سجل ${navigation.currentRecordIndex + 1} من ${navigation.totalRecords}`
                : `Record ${navigation.currentRecordIndex + 1} of ${navigation.totalRecords}`}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!navigation.hasPreviousRecord}
                onClick={navigation.onNavigatePrevious}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1 font-bold"
              >
                {isAr ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                <span>{isAr ? 'السابق' : 'Prev'}</span>
              </button>

              <button
                type="button"
                disabled={!navigation.hasNextRecord}
                onClick={navigation.onNavigateNext}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1 font-bold"
              >
                <span>{isAr ? 'التالي' : 'Next'}</span>
                {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}

        {/* Entity Card Header Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-base">
              {metadata.entityType.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight">
                {metadata.recordTitle}
              </span>
              <span className="text-xs text-amber-300 font-mono">
                ID: #{metadata.entityId} {metadata.recordCode ? `| Code: ${metadata.recordCode}` : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end text-xs text-slate-300">
            {metadata.createdBy && (
              <span>Created by: {metadata.createdBy}</span>
            )}
            {metadata.createdAt && (
              <span className="text-[10px] text-slate-400">{metadata.createdAt}</span>
            )}
          </div>
        </div>

        {/* Tab Strip Header */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                {typeof tab.count === 'number' && (
                  <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-[10px] rounded-full text-slate-600 dark:text-slate-400 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Body Content */}
        <div className="min-h-64 py-2">{children}</div>
      </div>
    </EnterpriseDialog>
  );
};
