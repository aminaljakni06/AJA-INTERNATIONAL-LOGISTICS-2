/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Confirmation Modal Component
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useEnterpriseConfirmation } from '../../hooks/useEnterpriseConfirmation';

interface EnterpriseConfirmationModalProps {
  isAr?: boolean;
}

export const EnterpriseConfirmationModal: React.FC<EnterpriseConfirmationModalProps> = ({ isAr = false }) => {
  const { confirmationConfig, closeConfirmation } = useEnterpriseConfirmation();
  const [typedInput, setTypedInput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  useEffect(() => {
    setTypedInput('');
    setIsExecuting(false);
  }, [confirmationConfig]);

  if (!confirmationConfig) return null;

  const {
    titleEn,
    titleAr,
    messageEn,
    messageAr,
    confirmLabelEn = 'Confirm',
    confirmLabelAr = 'تأكيد',
    cancelLabelEn = 'Cancel',
    cancelLabelAr = 'إلغاء',
    isDangerous = false,
    requireTypedText,
    onConfirm,
    onCancel,
  } = confirmationConfig;

  const title = isAr ? titleAr : titleEn;
  const message = isAr ? messageAr : messageEn;
  const confirmLabel = isAr ? confirmLabelAr : confirmLabelEn;
  const cancelLabel = isAr ? cancelLabelAr : cancelLabelEn;

  const isConfirmDisabled = requireTypedText
    ? typedInput.trim().toUpperCase() !== requireTypedText.trim().toUpperCase()
    : false;

  const handleConfirmClick = async () => {
    if (isConfirmDisabled || isExecuting) return;
    setIsExecuting(true);
    try {
      await onConfirm();
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    closeConfirmation();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDangerous
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
              }`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 id="confirmation-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>

          <button
            onClick={handleCancelClick}
            disabled={isExecuting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {message}
        </p>

        {requireTypedText && (
          <div className="flex flex-col gap-2 my-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isAr
                ? `للتأكيد، يرجى كتابة "${requireTypedText}" أدناه:`
                : `To confirm, please type "${requireTypedText}" below:`}
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={requireTypedText}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCancelClick}
            disabled={isExecuting}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            onClick={handleConfirmClick}
            disabled={isConfirmDisabled || isExecuting}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500'
                : 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500'
            }`}
          >
            {isExecuting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
