/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Protected Action Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Confirmation, Alert & Decision Dialogs
 * Version: 1.0
 */

import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ProtectedActionConfig } from '../../types/decisionFramework';
import { DecisionService } from '../../services/dialog/decisionService';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseProtectedActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProtectedActionConfig;
  moduleName: string;
  recordId: string;
  isAr?: boolean;
  onExecute: () => void | Promise<void>;
}

export const EnterpriseProtectedActionDialog: React.FC<EnterpriseProtectedActionDialogProps> = ({
  isOpen,
  onClose,
  config,
  moduleName,
  recordId,
  isAr = false,
  onExecute,
}) => {
  const [typedPhrase, setTypedPhrase] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isPhraseValid = !config.requirePhrase || typedPhrase.trim().toUpperCase() === config.requirePhrase.trim().toUpperCase();
  const isReasonValid = !config.requireReason || reason.trim().length >= 5;

  const canExecute = isPhraseValid && isReasonValid;

  const handleConfirm = async () => {
    if (!canExecute) return;
    setIsSubmitting(true);

    try {
      const auditMeta = DecisionService.createAuditMetadata(
        config.actionId,
        moduleName,
        recordId,
        config.riskLevel
      );
      DecisionService.recordAuditLog(auditMeta);

      await onExecute();
      onClose();
    } catch (error) {
      console.error('[PROTECTED ACTION FAILURE]', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EnterpriseDialog
      id={`protected_${config.actionId}`}
      isOpen={isOpen}
      onClose={onClose}
      titleEn={`Protected Action: ${config.actionNameEn}`}
      titleAr={`إجراء محمي: ${config.actionNameAr}`}
      subtitleEn={`Security level: ${config.riskLevel}. Permission: ${config.requiredPermission || 'RESTRICTED'}`}
      subtitleAr={`مستوى الأمان: ${config.riskLevel}. التصريح: ${config.requiredPermission || 'مُقيد'}`}
      icon={<Lock className="w-6 h-6 text-rose-600" />}
      isAr={isAr}
      metadata={{
        moduleName,
        recordId,
      }}
      statusBadge={{
        labelEn: `RISK: ${config.riskLevel}`,
        labelAr: `مستوى الخطورة: ${config.riskLevel}`,
        variant: 'danger',
      }}
      config={{
        size: 'sm',
        variant: 'confirmation',
        closeOnBackdropClick: false,
      }}
      actions={[
        {
          id: 'cancel',
          labelEn: 'Cancel',
          labelAr: 'إلغاء',
          variant: 'ghost',
          onClick: onClose,
        },
        {
          id: 'confirm',
          labelEn: 'Authorize & Execute',
          labelAr: 'تفويض وتنفيذ',
          variant: 'danger',
          disabled: !canExecute || isSubmitting,
          isLoading: isSubmitting,
          onClick: handleConfirm,
        },
      ]}
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Warning Box */}
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex gap-2.5 text-xs text-rose-900 dark:text-rose-200">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {isAr ? 'تحذير أمان عالي الخطورة:' : 'High Risk Security Warning:'}
            </span>
            <p className="leading-relaxed">
              {isAr
                ? `هذا الإجراء محمي ويتطلب صلاحيات خاصة. سيتم تسجيل جميع التفاصيل مع معرف المستخدم وتوقيت التنفيذ رقمياً في سجلات التدقيق.`
                : `This operation is protected and requires authorization. All actions are digitally recorded with your User ID and IP address in the immutable audit log.`}
            </p>
          </div>
        </div>

        {/* Reason Requirement */}
        {config.requireReason && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'تبرير الإجراء (مطلوب):' : 'Action Justification (Required):'}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isAr ? 'أدخل السبب الإداري لتنفيذ هذا الإجراء...' : 'Enter administrative justification...'}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 text-xs"
            />
          </div>
        )}

        {/* Phrase Verification Keyword */}
        {config.requirePhrase && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr
                ? `اكتب كلمة التأكيد "${config.requirePhrase}" للتفعيل:`
                : `Type keyword "${config.requirePhrase}" to unlock:`}
            </span>
            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={config.requirePhrase}
              className="w-full px-3 py-2 font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg uppercase outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        )}
      </div>
    </EnterpriseDialog>
  );
};
