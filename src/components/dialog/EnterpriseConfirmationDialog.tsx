/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Confirmation Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog System Foundation
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type?: 'confirm' | 'danger' | 'warning' | 'info' | 'success';
  confirmLabelEn?: string;
  confirmLabelAr?: string;
  cancelLabelEn?: string;
  cancelLabelAr?: string;
  requireExplicitWord?: string; // Requires user to type a keyword to confirm
  isAr?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export const EnterpriseConfirmationDialog: React.FC<EnterpriseConfirmationDialogProps> = ({
  isOpen,
  onClose,
  titleEn,
  titleAr,
  messageEn,
  messageAr,
  type = 'confirm',
  confirmLabelEn,
  confirmLabelAr,
  cancelLabelEn,
  cancelLabelAr,
  requireExplicitWord,
  isAr = false,
  isLoading = false,
  onConfirm,
}) => {
  const [typedWord, setTypedWord] = useState<string>('');

  const isWordMatching = !requireExplicitWord || typedWord.trim().toUpperCase() === requireExplicitWord.trim().toUpperCase();

  const handleConfirmClick = async () => {
    if (!isWordMatching) return;
    await onConfirm();
  };

  const getHeaderIcon = () => {
    switch (type) {
      case 'danger':
        return <ShieldAlert className="w-6 h-6 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'confirm':
      default:
        return <HelpCircle className="w-6 h-6 text-amber-600" />;
    }
  };

  const getBadgeVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <EnterpriseDialog
      id="enterprise_confirm_dialog"
      isOpen={isOpen}
      onClose={onClose}
      titleEn={titleEn}
      titleAr={titleAr}
      icon={getHeaderIcon()}
      isAr={isAr}
      statusBadge={{
        labelEn: type.toUpperCase(),
        labelAr: type === 'danger' ? 'خطورة عالية' : type === 'warning' ? 'تحذير' : 'تأكيد',
        variant: getBadgeVariant(),
      }}
      config={{
        size: 'sm',
        variant: 'confirmation',
        closeOnBackdropClick: type !== 'danger',
        closeOnEscape: true,
      }}
      state={{ isLoading }}
      actions={[
        {
          id: 'cancel',
          labelEn: cancelLabelEn || 'Cancel',
          labelAr: cancelLabelAr || 'إلغاء',
          variant: 'ghost',
          onClick: onClose,
        },
        {
          id: 'confirm',
          labelEn: confirmLabelEn || (type === 'danger' ? 'Confirm Action' : 'Confirm'),
          labelAr: confirmLabelAr || (type === 'danger' ? 'تأكيد الإجراء' : 'تأكيد'),
          variant: type === 'danger' ? 'danger' : 'primary',
          disabled: !isWordMatching,
          isLoading,
          onClick: handleConfirmClick,
        },
      ]}
    >
      <div className="flex flex-col gap-4 py-2">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {isAr ? messageAr : messageEn}
        </p>

        {/* Sensitive action word requirement */}
        {requireExplicitWord && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col gap-2">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-200">
              {isAr
                ? `للتأكيد، يرجى كتابة الكلمة "${requireExplicitWord}" أدناه:`
                : `To confirm this sensitive action, please type "${requireExplicitWord}" below:`}
            </span>
            <input
              type="text"
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              placeholder={requireExplicitWord}
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 uppercase"
            />
          </div>
        )}
      </div>
    </EnterpriseDialog>
  );
};
