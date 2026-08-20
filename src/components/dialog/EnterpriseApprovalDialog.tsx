/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Approval & Rejection Workflow Dialog
 * Phase: Enterprise UI System
 * Module: Enterprise Confirmation, Alert & Decision Dialogs
 * Version: 1.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  RotateCcw,
  ShieldCheck,
  Building,
  UserCheck,
  FileCheck2,
} from 'lucide-react';
import { RiskLevel } from '../../types/decisionFramework';
import { DecisionService } from '../../services/dialog/decisionService';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  workflowModule: string;
  recordId: string;
  recordTitle: string;
  riskLevel?: RiskLevel;
  amountFormatted?: string;
  isAr?: boolean;
  onApprove: (comment: string) => void | Promise<void>;
  onReject: (reason: string, comment: string) => void | Promise<void>;
  onEscalate?: (department: string, comment: string) => void | Promise<void>;
  onReturnForRevision?: (comment: string) => void | Promise<void>;
}

export const EnterpriseApprovalDialog: React.FC<EnterpriseApprovalDialogProps> = ({
  isOpen,
  onClose,
  titleEn,
  titleAr,
  workflowModule,
  recordId,
  recordTitle,
  riskLevel = 'NORMAL',
  amountFormatted,
  isAr = false,
  onApprove,
  onReject,
  onEscalate,
  onReturnForRevision,
}) => {
  const [decisionMode, setDecisionMode] = useState<'APPROVE' | 'REJECT' | 'ESCALATE' | 'RETURN'>('APPROVE');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleDecisionSubmit = async () => {
    setErrorText(null);

    if (decisionMode === 'REJECT' && (!rejectionReason || comment.trim().length < 5)) {
      setErrorText(
        isAr
          ? 'يرجى تحديد سبب الرفض وإدخال تفاصيل الملاحظة (5 حروف على الأقل).'
          : 'Please select a rejection reason and enter detailed comments (at least 5 characters).'
      );
      return;
    }

    if (decisionMode === 'RETURN' && comment.trim().length < 5) {
      setErrorText(
        isAr
          ? 'يرجى إدخال ملاحظات المراجعة المطلوبة (5 حروف على الأقل).'
          : 'Please enter details for the required revision (at least 5 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const auditMeta = DecisionService.createAuditMetadata(
        decisionMode,
        workflowModule,
        recordId,
        riskLevel
      );
      DecisionService.recordAuditLog(auditMeta);

      if (decisionMode === 'APPROVE') {
        await onApprove(comment);
      } else if (decisionMode === 'REJECT') {
        await onReject(rejectionReason, comment);
      } else if (decisionMode === 'ESCALATE' && onEscalate) {
        await onEscalate('COMPLIANCE_HEAD_OFFICE', comment);
      } else if (decisionMode === 'RETURN' && onReturnForRevision) {
        await onReturnForRevision(comment);
      }

      onClose();
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to submit workflow decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EnterpriseDialog
      id="enterprise_approval_dialog"
      isOpen={isOpen}
      onClose={onClose}
      titleEn={titleEn}
      titleAr={titleAr}
      subtitleEn={`Workflow Approval for ${workflowModule} #${recordId}`}
      subtitleAr={`اعتماد سير العمل لـ ${workflowModule} رقم #${recordId}`}
      icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
      isAr={isAr}
      metadata={{
        moduleName: workflowModule,
        recordId,
      }}
      statusBadge={{
        labelEn: `RISK: ${riskLevel}`,
        labelAr: `مستوى الخطورة: ${riskLevel}`,
        variant: riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'danger' : 'success',
      }}
      config={{
        size: 'lg',
        variant: 'workflow',
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
          id: 'submit_decision',
          labelEn:
            decisionMode === 'APPROVE'
              ? 'Approve & Release'
              : decisionMode === 'REJECT'
              ? 'Confirm Rejection'
              : decisionMode === 'ESCALATE'
              ? 'Escalate Request'
              : 'Return for Revision',
          labelAr:
            decisionMode === 'APPROVE'
              ? 'اعتماد وإفراج'
              : decisionMode === 'REJECT'
              ? 'تأكيد الرفض'
              : decisionMode === 'ESCALATE'
              ? 'تصعيد الطلب'
              : 'إعادة للمراجعة',
          variant: decisionMode === 'REJECT' ? 'danger' : 'primary',
          isLoading: isSubmitting,
          onClick: handleDecisionSubmit,
        },
      ]}
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Context Summary Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {recordTitle}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Module: {workflowModule} | ID: #{recordId}
            </span>
          </div>

          {amountFormatted && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Value</span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">
                {amountFormatted}
              </span>
            </div>
          )}
        </div>

        {/* Action Decision Selector */}
        <div className="flex flex-col gap-1.5 text-xs">
          <label className="font-bold text-slate-800 dark:text-slate-200">
            {isAr ? 'اختر القرار النهائي:' : 'Select Decision Outcome:'}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setDecisionMode('APPROVE')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                decisionMode === 'APPROVE'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? 'اعتماد وإفراج' : 'Approve'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDecisionMode('REJECT')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                decisionMode === 'REJECT'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>{isAr ? 'رفض الطلب' : 'Reject'}</span>
            </button>

            {onReturnForRevision && (
              <button
                type="button"
                onClick={() => setDecisionMode('RETURN')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                  decisionMode === 'RETURN'
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <span>{isAr ? 'إعادة للمراجعة' : 'Return'}</span>
              </button>
            )}

            {onEscalate && (
              <button
                type="button"
                onClick={() => setDecisionMode('ESCALATE')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${
                  decisionMode === 'ESCALATE'
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Send className="w-5 h-5 text-blue-600" />
                <span>{isAr ? 'تصعيد الطلب' : 'Escalate'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Validation Error Notice */}
        {errorText && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-semibold">
            {errorText}
          </div>
        )}

        {/* Mandatory Rejection Reason Code */}
        {decisionMode === 'REJECT' && (
          <div className="flex flex-col gap-1.5 text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'سبب الرفض (مطلوب):' : 'Rejection Category (Required):'}
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-rose-500 font-semibold"
            >
              <option value="">{isAr ? '-- اختر سبب الرفض --' : '-- Select Rejection Reason --'}</option>
              <option value="MISSING_DOCUMENTS">
                {isAr ? 'وثائق أو مستندات جمركية مفقودة' : 'Missing Official Customs Documents'}
              </option>
              <option value="VALUATION_DISCREPANCY">
                {isAr ? 'فروقات في التقييم الجمركي أو الفواتير' : 'Customs Valuation Discrepancy'}
              </option>
              <option value="NON_COMPLIANT_ITEM">
                {isAr ? 'بضائع أو شحنات غير مطابقة للمواصفات' : 'Non-compliant Goods / Restricted Manifest'}
              </option>
              <option value="CREDIT_LIMIT_EXCEEDED">
                {isAr ? 'تجاوز الحد الائتماني للعميل' : 'Customer Credit Limit Exceeded'}
              </option>
              <option value="OTHER_CUSTOM">
                {isAr ? 'سبب تنظيم/إداري آخر' : 'Other Regulatory/Administrative Reason'}
              </option>
            </select>
          </div>
        )}

        {/* Comments Box */}
        <div className="flex flex-col gap-1.5 text-xs">
          <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>
              {decisionMode === 'APPROVE'
                ? isAr
                  ? 'ملاحظات الاعتماد (اختياري):'
                  : 'Approval Comments (Optional):'
                : isAr
                ? 'تفاصيل ومبررات القرار (مطلوب):'
                : 'Decision Details & Justification (Required):'}
            </span>
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isAr
                ? 'أدخل الملاحظات التنفيذية التي سيتم تسجيلها في سجل التدقيق...'
                : 'Enter detailed notes to be logged in the audit trail...'
            }
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 text-xs"
          />
        </div>
      </div>
    </EnterpriseDialog>
  );
};
