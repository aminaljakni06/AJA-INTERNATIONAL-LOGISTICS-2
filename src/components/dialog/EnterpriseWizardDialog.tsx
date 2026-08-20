/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Multi-Step Wizard Dialog Component
 * Phase: Enterprise UI System
 * Module: Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System
 * Version: 1.0
 */

import React from 'react';
import {
  GitMerge,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Save,
  AlertCircle,
  Sparkles,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { WizardStep, WizardConfiguration } from '../../types/wizardFramework';
import { useEnterpriseWizard } from '../../hooks/useEnterpriseWizard';
import { EnterpriseDialog } from './EnterpriseDialog';

export interface EnterpriseWizardDialogProps<T = any> {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  steps: WizardStep<T>[];
  initialData: T;
  config?: WizardConfiguration;
  isAr?: boolean;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
}

export function EnterpriseWizardDialog<T = any>({
  id = 'enterprise_wizard_dialog',
  isOpen,
  onClose,
  titleEn,
  titleAr,
  subtitleEn,
  subtitleAr,
  steps,
  initialData,
  config = {},
  isAr = false,
  onSubmit,
  onCancel,
}: EnterpriseWizardDialogProps<T>) {
  const {
    activeStepIndex,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    completedStepIds,
    stepData,
    isSubmitting,
    hasDraft,
    lastSavedTime,
    updateData,
    setStepValidity,
    goToNextStep,
    goToPreviousStep,
    jumpToStep,
    restoreDraftData,
    clearDraft,
    setIsSubmitting,
  } = useEnterpriseWizard<T>(steps, initialData, config);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(stepData);
      clearDraft();
      onClose();
    } catch (err) {
      console.error('[WIZARD SUBMISSION ERROR]', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepComponent = currentStep?.component;

  return (
    <EnterpriseDialog
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      titleEn={titleEn}
      titleAr={titleAr}
      subtitleEn={subtitleEn}
      subtitleAr={subtitleAr}
      icon={<GitMerge className="w-5 h-5 text-amber-600" />}
      isAr={isAr}
      statusBadge={{
        labelEn: `STEP ${activeStepIndex + 1} OF ${totalSteps}`,
        labelAr: `الخطوة ${activeStepIndex + 1} من ${totalSteps}`,
        variant: 'info',
      }}
      config={{
        size: config.size || 'xl',
        variant: 'wizard',
        closeOnBackdropClick: false,
      }}
      state={{
        isLoading: isSubmitting,
        activeStep: activeStepIndex + 1,
        totalSteps,
      }}
      actions={[
        {
          id: 'cancel',
          labelEn: 'Cancel',
          labelAr: 'إلغاء',
          variant: 'ghost',
          onClick: onCancel || onClose,
        },
        ...(!isFirstStep
          ? [
              {
                id: 'prev',
                labelEn: 'Previous Step',
                labelAr: 'الخطوة السابقة',
                variant: 'outline' as const,
                disabled: isSubmitting,
                icon: isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />,
                onClick: goToPreviousStep,
              },
            ]
          : []),
        ...(!isLastStep
          ? [
              {
                id: 'next',
                labelEn: 'Next Step',
                labelAr: 'الخطوة التالية',
                variant: 'primary' as const,
                disabled: isSubmitting,
                icon: isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />,
                onClick: goToNextStep,
              },
            ]
          : []),
        ...(isLastStep
          ? [
              {
                id: 'submit',
                labelEn: 'Finalize & Submit',
                labelAr: 'إنهاء واعتماد',
                variant: 'primary' as const,
                isLoading: isSubmitting,
                icon: <Check className="w-4 h-4" />,
                onClick: handleFinalSubmit,
              },
            ]
          : []),
      ]}
    >
      <div className="flex flex-col gap-5">
        {/* Draft Recovery Alert */}
        {hasDraft && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">
                {isAr
                  ? `توجد مسودة محفوظة تلقائياً ${
                      lastSavedTime ? `(${new Date(lastSavedTime).toLocaleTimeString()})` : ''
                    }`
                  : `An auto-saved draft is available ${
                      lastSavedTime ? `(${new Date(lastSavedTime).toLocaleTimeString()})` : ''
                    }`}
              </span>
            </div>
            <button
              type="button"
              onClick={restoreDraftData}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'استعادة المسودة' : 'Restore Draft'}</span>
            </button>
          </div>
        )}

        {/* Wizard Progression Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          {steps.map((st, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = completedStepIds.includes(st.id) || idx < activeStepIndex;

            return (
              <React.Fragment key={st.id}>
                <button
                  type="button"
                  onClick={() => jumpToStep(idx)}
                  className={`flex items-center gap-2 text-left shrink-0 transition-all ${
                    config.enableStepJump !== false ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive
                          ? 'text-amber-600 dark:text-amber-400'
                          : isCompleted
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {isAr ? st.titleAr : st.titleEn}
                    </span>
                    {st.subtitleEn && (
                      <span className="text-[10px] text-slate-400 truncate">
                        {isAr ? st.subtitleAr : st.subtitleEn}
                      </span>
                    )}
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700 min-w-6">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-600' : 'bg-transparent'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Body Component / Content */}
        <div className="min-h-64 py-2 flex flex-col">
          {StepComponent ? (
            <StepComponent
              data={stepData}
              onChange={updateData}
              setValid={(isValid) => setStepValidity(currentStep.id, isValid)}
              isAr={isAr}
            />
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Step content placeholder for {isAr ? currentStep?.titleAr : currentStep?.titleEn}
            </div>
          )}
        </div>
      </div>
    </EnterpriseDialog>
  );
}
