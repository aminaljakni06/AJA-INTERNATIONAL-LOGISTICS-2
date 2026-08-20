/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Form Drawer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Business Interaction Patterns
 * Version: 1.0
 */

import React from 'react';
import { Save, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { EnterpriseFormDrawerProps } from '../../types/drawerBusinessFramework';
import { DrawerHeader } from './DrawerHeader';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';
import { EnterpriseDrawer } from './EnterpriseDrawer';
import { DialogManagerService } from '../../services/dialog/dialogManager';

export const EnterpriseFormDrawer: React.FC<EnterpriseFormDrawerProps> = ({
  id,
  isOpen,
  onClose,
  mode = 'create',
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  icon,
  size = 'lg',
  position = 'right',
  density = 'comfortable',
  isDirty = false,
  isLoading = false,
  isSubmitting = false,
  error = null,
  submitLabelEn,
  submitLabelAr,
  cancelLabelEn = 'Cancel',
  cancelLabelAr = 'إلغاء',
  onSubmit,
  onReset,
  children,
  isAr = false,
  customActions = [],
}) => {
  const handleSafeClose = () => {
    if (isDirty) {
      DialogManagerService.showConfirmation({
        titleEn: 'Discard Unsaved Changes?',
        titleAr: 'تجاهل التغييرات غير المحفوظة؟',
        messageEn: 'You have modified form fields that have not been saved yet. Are you sure you want to close this drawer?',
        messageAr: 'لقد قمت بتعديل حقول لم يتم حفظها بعد. هل أنت أصلًا متأكد من إغلاق هذا اللوح؟',
        type: 'warning',
        confirmLabelEn: 'Discard & Close',
        confirmLabelAr: 'تجاهل وإغلاق',
        cancelLabelEn: 'Keep Editing',
        cancelLabelAr: 'متابعة التعديل',
        onConfirm: onClose,
      });
    } else {
      onClose();
    }
  };

  const defaultSubmitEn = mode === 'create' ? 'Create Record' : 'Save Changes';
  const defaultSubmitAr = mode === 'create' ? 'إنشاء سجل' : 'حفظ التغييرات';

  const submitLabel = isAr
    ? submitLabelAr || defaultSubmitAr
    : submitLabelEn || defaultSubmitEn;

  const cancelLabel = isAr ? cancelLabelAr : cancelLabelEn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      onSubmit();
    }
  };

  return (
    <EnterpriseDrawer
      id={id}
      isOpen={isOpen}
      onClose={handleSafeClose}
      size={size}
      position={position}
      density={density}
      isAr={isAr}
      config={{
        id: `${id}-config`,
        closeOnEscape: !isDirty,
        closeOnOutsideClick: !isDirty,
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
        <DrawerHeader
          titleEn={titleEn}
          titleAr={titleAr}
          descriptionEn={descriptionEn}
          descriptionAr={descriptionAr}
          icon={icon}
          onClose={handleSafeClose}
          isAr={isAr}
          density={density}
          headerActions={
            onReset ? (
              <button
                type="button"
                onClick={onReset}
                disabled={!isDirty || isSubmitting}
                className="p-1.5 text-text-muted hover:text-brand-navy dark:hover:text-brand-gold rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title={isAr ? 'إعادة ضبط النموذج' : 'Reset Form'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            ) : null
          }
        />

        <DrawerBody
          isLoading={isLoading}
          error={error}
          density={density}
          isAr={isAr}
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-status-error-subtle/30 border border-status-error/30 text-status-error flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {children}
        </DrawerBody>

        <DrawerFooter
          isAr={isAr}
          density={density}
          actions={[
            ...customActions,
            {
              id: 'cancel',
              labelEn: cancelLabelEn,
              labelAr: cancelLabelAr,
              onClick: handleSafeClose,
              disabled: isSubmitting,
            },
            {
              id: 'submit',
              labelEn: submitLabel,
              labelAr: submitLabel,
              onClick: () => onSubmit(),
              variant: 'primary',
              loading: isSubmitting,
              disabled: isLoading,
              icon: <Save className="w-4 h-4" />,
            },
          ]}
        />
      </form>
    </EnterpriseDrawer>
  );
};
