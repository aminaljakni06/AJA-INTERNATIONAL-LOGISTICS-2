/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Form Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog System Foundation
 * Version: 1.0
 */

import React, { useState } from 'react';
import { FileEdit, Save, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseFormDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  moduleName?: string;
  recordId?: string;
  isDirty?: boolean;
  isSubmitting?: boolean;
  validationErrors?: string[];
  hasDraft?: boolean;
  isAr?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullWidth';
  children: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  onRestoreDraft?: () => void;
}

export const EnterpriseFormDialog: React.FC<EnterpriseFormDialogProps> = ({
  id = 'form_dialog',
  isOpen,
  onClose,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  moduleName = 'LOGISTICS_FORM',
  recordId,
  isDirty = false,
  isSubmitting = false,
  validationErrors = [],
  hasDraft = false,
  isAr = false,
  size = 'lg',
  children,
  onSubmit,
  onRestoreDraft,
}) => {
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState<boolean>(false);

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  return (
    <EnterpriseDialog
      id={id}
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      titleEn={titleEn}
      titleAr={titleAr}
      subtitleEn={subtitleEn}
      subtitleAr={subtitleAr}
      icon={<FileEdit className="w-5 h-5" />}
      isAr={isAr}
      metadata={{
        moduleName,
        recordId,
      }}
      statusBadge={
        isDirty
          ? { labelEn: 'UNSAVED DRAFT', labelAr: 'مسودة غير محفوظة', variant: 'amber' }
          : undefined
      }
      config={{
        size,
        variant: 'form',
        closeOnBackdropClick: false,
        closeOnEscape: !isDirty,
      }}
      state={{
        isLoading: isSubmitting,
        isDirty,
      }}
      actions={[
        {
          id: 'cancel',
          labelEn: 'Cancel',
          labelAr: 'إلغاء',
          variant: 'ghost',
          onClick: handleCloseAttempt,
        },
        {
          id: 'submit',
          labelEn: 'Save Changes',
          labelAr: 'حفظ التغييرات',
          variant: 'primary',
          isLoading: isSubmitting,
          icon: <Save className="w-4 h-4" />,
          onClick: onSubmit,
        },
      ]}
    >
      <div className="flex flex-col gap-4">
        {/* Draft Recovery Alert */}
        {hasDraft && onRestoreDraft && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-200">
            <span className="font-semibold">
              {isAr
                ? 'توجد مسودة محفوظة سابقاً لهذا النموذج'
                : 'A previously saved draft is available for this form.'}
            </span>
            <button
              type="button"
              onClick={onRestoreDraft}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعادة المسودة' : 'Restore Draft'}</span>
            </button>
          </div>
        )}

        {/* Validation Error Summary */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col gap-1 text-xs text-rose-800 dark:text-rose-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {isAr
                  ? `يرجى تصحيح الأخطاء التالية (${validationErrors.length}):`
                  : `Please correct the following errors (${validationErrors.length}):`}
              </span>
            </div>
            <ul className="list-disc pl-5 rtl:pr-5 flex flex-col gap-0.5 mt-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Body Fields */}
        {children}
      </div>
    </EnterpriseDialog>
  );
};
