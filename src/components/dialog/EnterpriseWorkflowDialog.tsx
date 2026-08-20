/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Workflow Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Dialog System Foundation
 * Version: 1.0
 */

import React from 'react';
import {
  GitMerge,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Check,
  XCircle,
} from 'lucide-react';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface WorkflowStep {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isCompleted?: boolean;
}

export interface EnterpriseWorkflowDialogProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  steps: WorkflowStep[];
  activeStepIndex: number;
  workflowStatus?: string;
  isProcessing?: boolean;
  isAr?: boolean;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onApprove?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
  onComplete?: () => void | Promise<void>;
}

export const EnterpriseWorkflowDialog: React.FC<EnterpriseWorkflowDialogProps> = ({
  id = 'workflow_dialog',
  isOpen,
  onClose,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  steps = [],
  activeStepIndex = 0,
  workflowStatus = 'IN_PROGRESS',
  isProcessing = false,
  isAr = false,
  children,
  onNext,
  onPrevious,
  onApprove,
  onReject,
  onComplete,
}) => {
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === steps.length - 1;

  const activeStep = steps[activeStepIndex];

  return (
    <EnterpriseDialog
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      titleEn={titleEn}
      titleAr={titleAr}
      subtitleEn={subtitleEn}
      subtitleAr={subtitleAr}
      icon={<GitMerge className="w-5 h-5" />}
      isAr={isAr}
      metadata={{
        workflowStatus,
      }}
      statusBadge={{
        labelEn: `STEP ${activeStepIndex + 1} OF ${steps.length}`,
        labelAr: `الخطوة ${activeStepIndex + 1} من ${steps.length}`,
        variant: 'info',
      }}
      config={{
        size: 'lg',
        variant: 'workflow',
        closeOnBackdropClick: false,
      }}
      state={{
        isLoading: isProcessing,
        activeStep: activeStepIndex + 1,
        totalSteps: steps.length,
      }}
      actions={[
        ...(onReject
          ? [
              {
                id: 'reject',
                labelEn: 'Reject Workflow',
                labelAr: 'رفض المعاملة',
                variant: 'danger' as const,
                isLoading: isProcessing,
                onClick: onReject,
              },
            ]
          : []),
        ...(!isFirstStep && onPrevious
          ? [
              {
                id: 'prev',
                labelEn: 'Previous Step',
                labelAr: 'الخطوة السابقة',
                variant: 'outline' as const,
                disabled: isProcessing,
                icon: isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />,
                onClick: onPrevious,
              },
            ]
          : []),
        ...(!isLastStep && onNext
          ? [
              {
                id: 'next',
                labelEn: 'Next Step',
                labelAr: 'الخطوة التالية',
                variant: 'primary' as const,
                disabled: isProcessing,
                icon: isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />,
                onClick: onNext,
              },
            ]
          : []),
        ...(isLastStep && onComplete
          ? [
              {
                id: 'complete',
                labelEn: 'Finalize & Submit',
                labelAr: 'اعتماد وإنهاء',
                variant: 'primary' as const,
                isLoading: isProcessing,
                icon: <Check className="w-4 h-4" />,
                onClick: onComplete,
              },
            ]
          : []),
        ...(onApprove
          ? [
              {
                id: 'approve',
                labelEn: 'Approve & Release',
                labelAr: 'اعتماد وإفراج',
                variant: 'primary' as const,
                isLoading: isProcessing,
                icon: <CheckCircle2 className="w-4 h-4" />,
                onClick: onApprove,
              },
            ]
          : []),
      ]}
    >
      <div className="flex flex-col gap-5">
        {/* Step Progression Bar */}
        {steps.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            {steps.map((st, idx) => {
              const isActive = idx === activeStepIndex;
              const isPast = idx < activeStepIndex || st.isCompleted;

              return (
                <React.Fragment key={st.id}>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                        isPast
                          ? 'bg-emerald-600 text-white'
                          : isActive
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs font-bold truncate ${
                          isActive
                            ? 'text-amber-600 dark:text-amber-400'
                            : isPast
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {isAr ? st.titleAr : st.titleEn}
                      </span>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700 min-w-8">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isPast ? 'bg-emerald-600' : 'bg-transparent'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-48 flex flex-col">{children}</div>
      </div>
    </EnterpriseDialog>
  );
};
