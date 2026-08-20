/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Entity Detail Drawer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Business Interaction Patterns
 * Version: 1.0
 */

import React from 'react';
import { Edit, Trash2, Share2, Download, ShieldAlert } from 'lucide-react';
import { EnterpriseDetailDrawerProps } from '../../types/drawerBusinessFramework';
import { DrawerHeader } from './DrawerHeader';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';
import { EnterpriseDrawer } from './EnterpriseDrawer';
import { DrawerAction } from '../../types/drawerFramework';

export const EnterpriseDetailDrawer: React.FC<EnterpriseDetailDrawerProps> = ({
  id,
  isOpen,
  onClose,
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  entityId,
  statusBadge,
  icon,
  size = 'lg',
  position = 'right',
  density = 'comfortable',
  isLoading = false,
  error = null,
  summaryFields = [],
  onEdit,
  onDelete,
  onShare,
  onDownload,
  readOnly = false,
  children,
  isAr = false,
  customActions = [],
}) => {
  const footerActions: DrawerAction[] = [...customActions];

  if (onShare) {
    footerActions.push({
      id: 'share',
      labelEn: 'Share',
      labelAr: 'مشاركة',
      onClick: onShare,
      icon: <Share2 className="w-4 h-4" />,
    });
  }

  if (onDownload) {
    footerActions.push({
      id: 'download',
      labelEn: 'Download',
      labelAr: 'تنزيل',
      onClick: onDownload,
      icon: <Download className="w-4 h-4" />,
    });
  }

  if (onDelete && !readOnly) {
    footerActions.push({
      id: 'delete',
      labelEn: 'Delete',
      labelAr: 'حذف',
      onClick: onDelete,
      variant: 'danger',
      icon: <Trash2 className="w-4 h-4" />,
    });
  }

  if (onEdit && !readOnly) {
    footerActions.push({
      id: 'edit',
      labelEn: 'Edit Entity',
      labelAr: 'تعديل الكيان',
      onClick: onEdit,
      variant: 'primary',
      icon: <Edit className="w-4 h-4" />,
    });
  }

  return (
    <EnterpriseDrawer
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      position={position}
      density={density}
      isAr={isAr}
    >
      <DrawerHeader
        titleEn={titleEn}
        titleAr={titleAr}
        descriptionEn={descriptionEn}
        descriptionAr={descriptionAr}
        statusBadge={statusBadge}
        icon={icon}
        onClose={onClose}
        isAr={isAr}
        density={density}
      />

      <DrawerBody isLoading={isLoading} error={error} density={density} isAr={isAr}>
        {readOnly && (
          <div className="mb-4 p-2.5 rounded-xl bg-brand-navy/5 text-brand-navy dark:bg-brand-gold/10 dark:text-brand-gold border border-border-default flex items-center gap-2 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {isAr
                ? 'وضع العرض فقط — ليس لديك صلاحيات لتعديل هذا السجل'
                : 'Read-Only Mode — You do not have permission to edit this record'}
            </span>
          </div>
        )}

        {summaryFields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface-secondary/50 border border-border-default mb-4">
            {summaryFields.map((field) => (
              <div key={field.id} className={`space-y-0.5 ${field.span ? `col-span-${field.span}` : ''}`}>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  {isAr ? field.labelAr || field.labelEn : field.labelEn}
                </span>
                <div className="text-xs sm:text-sm font-bold text-text-primary">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {children}
      </DrawerBody>

      {footerActions.length > 0 && (
        <DrawerFooter actions={footerActions} isAr={isAr} density={density} />
      )}
    </EnterpriseDrawer>
  );
};
