/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Decision & Confirmation Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Confirmation, Alert & Decision Dialogs
 * Version: 1.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Lock,
  MessageSquare,
  Clock,
  Layers,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  DecisionRequest,
  DecisionResult,
  RiskLevel,
  DecisionReasonOption,
} from '../../types/decisionFramework';
import { DecisionService } from '../../services/dialog/decisionService';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseDecisionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: DecisionRequest;
  isAr?: boolean;
}

export const EnterpriseDecisionDialog: React.FC<EnterpriseDecisionDialogProps> = ({
  isOpen,
  onClose,
  request,
  isAr = false,
}) => {
  const {
    id = 'enterprise_decision_dialog',
    titleEn,
    titleAr,
    descriptionEn,
    descriptionAr,
    actionType,
    riskLevel = 'NORMAL',
    severity = 'info',
    moduleName,
    recordSummary,
    impactDescriptionEn,
    impactDescriptionAr,
    warningTextEn,
    warningTextAr,
    predefinedReasons = [],
    requireReason = false,
    requireComment = false,
    minCommentLength = 5,
    requireExplicitPhrase,
    requireConfirmationCheckbox = false,
    checkboxLabelEn,
    checkboxLabelAr,
    holdToConfirmMs = 0,
    countdownSeconds = 0,
    decisionOptions = [],
    onDecision,
  } = request;

  const [selectedReasonCode, setSelectedReasonCode] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [typedPhrase, setTypedPhrase] = useState<string>('');
  const [isCheckboxChecked, setIsCheckboxChecked] = useState<boolean>(!requireConfirmationCheckbox);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(countdownSeconds);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>('confirm');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown Timer Effect
  useEffect(() => {
    if (!isOpen || countdownSeconds <= 0) return;
    setCountdownRemaining(countdownSeconds);

    const interval = setInterval(() => {
      setCountdownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdownSeconds]);

  // Validation Checks
  const isPhraseValid = !requireExplicitPhrase || typedPhrase.trim().toUpperCase() === requireExplicitPhrase.trim().toUpperCase();
  const isReasonValid = !requireReason || selectedReasonCode.length > 0;
  const isCommentValid = !requireComment || comment.trim().length >= minCommentLength;
  const isCountdownFinished = countdownRemaining === 0;

  const isFormValid = isPhraseValid && isReasonValid && isCommentValid && isCheckboxChecked && isCountdownFinished;

  // Hold to confirm handlers
  const handleHoldStart = () => {
    if (!isFormValid || holdToConfirmMs <= 0) return;
    setIsHolding(true);
    const intervalTime = 50;
    let elapsed = 0;

    holdTimerRef.current = setInterval(() => {
      elapsed += intervalTime;
      const progress = Math.min((elapsed / holdToConfirmMs) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        executeSubmit(selectedDecisionId);
      }
    }, intervalTime);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setHoldProgress(0);
  };

  const executeSubmit = async (decisionId: string) => {
    setIsSubmitting(true);
    const startTime = Date.now();
    const auditMeta = DecisionService.createAuditMetadata(
      actionType,
      moduleName,
      recordSummary?.recordId,
      riskLevel
    );

    const result: DecisionResult = {
      requestId: id,
      decisionId,
      confirmed: decisionId !== 'cancel' && decisionId !== 'reject',
      selectedReasonCode,
      comment,
      typedPhrase,
      auditMetadata: auditMeta,
      durationMs: Date.now() - startTime,
    };

    DecisionService.recordAuditLog(auditMeta);

    if (onDecision) {
      await onDecision(result);
    }

    setIsSubmitting(false);
    onClose();
  };

  const getRiskBadgeColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
      case 'EMERGENCY':
      case 'SECURITY':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300';
      case 'HIGH':
      case 'COMPLIANCE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-300';
      case 'LOW':
      case 'NORMAL':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300';
    }
  };

  return (
    <EnterpriseDialog
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      titleEn={titleEn}
      titleAr={titleAr}
      subtitleEn={descriptionEn}
      subtitleAr={descriptionAr}
      icon={<ShieldAlert className="w-6 h-6 text-amber-600" />}
      isAr={isAr}
      metadata={{
        moduleName,
        recordId: recordSummary?.recordId,
      }}
      statusBadge={{
        labelEn: `RISK: ${riskLevel}`,
        labelAr: `مستوى الخطورة: ${riskLevel}`,
        variant: riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'danger' : 'amber',
      }}
      config={{
        size: 'md',
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
        ...(decisionOptions.length > 0
          ? decisionOptions.map((opt) => ({
              id: opt.id,
              labelEn: opt.labelEn,
              labelAr: opt.labelAr,
              variant: opt.variant || 'primary',
              disabled: !isFormValid || isSubmitting,
              onClick: () => executeSubmit(opt.id),
            }))
          : [
              {
                id: 'confirm',
                labelEn:
                  holdToConfirmMs > 0
                    ? isAr
                      ? 'اضغط واستمر للتأكيد'
                      : 'Hold to Confirm'
                    : isAr
                    ? 'تأكيد الإجراء'
                    : 'Confirm Action',
                labelAr:
                  holdToConfirmMs > 0
                    ? 'اضغط واستمر للتأكيد'
                    : 'تأكيد الإجراء',
                variant: severity === 'danger' || riskLevel === 'CRITICAL' ? ('danger' as const) : ('primary' as const),
                disabled: !isFormValid || isSubmitting,
                isLoading: isSubmitting,
                onClick:
                  holdToConfirmMs > 0
                    ? undefined
                    : () => executeSubmit('confirm'),
              },
            ]),
      ]}
    >
      <div className="flex flex-col gap-4">
        {/* Business Object Summary Card */}
        {recordSummary && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {recordSummary.title}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                #{recordSummary.recordId}
              </span>
            </div>

            {recordSummary.subtitle && (
              <span className="text-xs text-slate-500">{recordSummary.subtitle}</span>
            )}

            {/* Attributes Grid */}
            {recordSummary.attributes && recordSummary.attributes.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                {recordSummary.attributes.map((attr, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] text-slate-400">
                      {isAr ? attr.labelAr : attr.labelEn}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Impact Description & Warning Box */}
        {(impactDescriptionEn || warningTextEn) && (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex flex-col gap-1.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{isAr ? 'تنبيه التأثير والخطورة:' : 'Operational Impact Warning:'}</span>
            </div>
            <p className="leading-relaxed">
              {isAr ? impactDescriptionAr || warningTextAr : impactDescriptionEn || warningTextEn}
            </p>
          </div>
        )}

        {/* Predefined Decision Reason Dropdown */}
        {predefinedReasons.length > 0 && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{isAr ? 'سبب القرار (مطلوب):' : 'Select Decision Reason:'}</span>
              {requireReason && <span className="text-rose-500 font-bold">*</span>}
            </label>
            <select
              value={selectedReasonCode}
              onChange={(e) => setSelectedReasonCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 text-xs font-semibold"
            >
              <option value="">{isAr ? '-- اختر سبب القرار --' : '-- Select Decision Reason --'}</option>
              {predefinedReasons.map((r) => (
                <option key={r.code} value={r.code}>
                  {isAr ? r.labelAr : r.labelEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Optional or Required Comments */}
        {(requireComment || predefinedReasons.length > 0) && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>{isAr ? 'ملاحظات وتفاصيل القرار:' : 'Decision Notes & Justification:'}</span>
              {requireComment && <span className="text-rose-500 font-bold">*</span>}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isAr ? 'أدخل ملاحظات توضيحية لقرارك...' : 'Enter justification notes for audit log...'}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 text-xs"
            />
          </div>
        )}

        {/* Explicit Phrase Keyword Verification */}
        {requireExplicitPhrase && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col gap-2">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
              {isAr
                ? `يرجى كتابة العبارة "${requireExplicitPhrase}" لتأكيد القرار:`
                : `Please type "${requireExplicitPhrase}" to confirm decision:`}
            </span>
            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={requireExplicitPhrase}
              className="w-full px-3 py-2 font-mono font-bold text-xs bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 uppercase"
            />
          </div>
        )}

        {/* Checkbox Confirmation */}
        {requireConfirmationCheckbox && (
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isCheckboxChecked}
              onChange={(e) => setIsCheckboxChecked(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
            />
            <span className="font-semibold">
              {isAr
                ? checkboxLabelAr || 'أقر بتأثير هذا الإجراء وأتحمل مسؤولية الاعتماد.'
                : checkboxLabelEn || 'I acknowledge the operational impact and confirm authorization.'}
            </span>
          </label>
        )}

        {/* Hold to Confirm Visual Progress Bar */}
        {holdToConfirmMs > 0 && isFormValid && (
          <div className="flex flex-col gap-1 pt-2">
            <button
              type="button"
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all relative overflow-hidden select-none active:scale-[0.99]"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-amber-800/60 transition-all duration-75"
                style={{ width: `${holdProgress}%` }}
              />
              <span className="relative z-10">
                {isHolding
                  ? isAr
                    ? `جاري الضغط... ${holdProgress.toFixed(0)}%`
                    : `Holding... ${holdProgress.toFixed(0)}%`
                  : isAr
                  ? 'اضغط واستمر للعمق التوضيحي'
                  : 'Press & Hold to Execute'}
              </span>
            </button>
          </div>
        )}
      </div>
    </EnterpriseDialog>
  );
};
