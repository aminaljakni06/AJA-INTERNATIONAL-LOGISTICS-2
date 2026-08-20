/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Workflow / Action Drawer Component
 * Phase: Enterprise UI System
 * Module: Enterprise Drawer Business Interaction Patterns
 * Version: 1.0
 */

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import { EnterpriseWorkflowDrawerProps } from '../../types/drawerBusinessFramework';
import { DrawerHeader } from './DrawerHeader';
import { DrawerBody } from './DrawerBody';
import { DrawerFooter } from './DrawerFooter';
import { EnterpriseDrawer } from './EnterpriseDrawer';

export const EnterpriseWorkflowDrawer: React.FC<EnterpriseWorkflowDrawerProps> = ({
  id,
  isOpen,
  onClose,
  titleEn,
  titleAr,
  steps,
  currentStepIndex = 0,
  onStepChange,
  onComplete,
  isSubmitting = false,
  size = 'lg',
  position = 'right',
  isAr = false,
}) => {
  const [activeStep, setActiveStep] = useState(currentStepIndex);

  const currentStep = steps[activeStep] || steps[0];
  const isFirstStep = activeStep === 0;
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    if (currentStep && currentStep.isValid === false) return;
    const nextIdx = Math.min(activeStep + 1, steps.length - 1);
    setActiveStep(nextIdx);
    if (onStepChange) onStepChange(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = Math.max(activeStep - 1, 0);
    setActiveStep(prevIdx);
    if (onStepChange) onStepChange(prevIdx);
  };

  const handleComplete = async () => {
    await onComplete();
  };

  return (
    <EnterpriseDrawer
      id={id}
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      position={position}
      isAr={isAr}
    >
      <DrawerHeader
        titleEn={titleEn}
        titleAr={titleAr}
        descriptionEn={currentStep ? (isAr ? currentStep.descriptionAr : currentStep.descriptionEn) : undefined}
        icon={<Layers className="w-5 h-5 text-brand-navy dark:text-brand-gold" />}
        onClose={onClose}
        isAr={isAr}
      />

      {/* Step Stepper Header */}
      <div dir={isAr ? 'rtl' : 'ltr'} className="bg-surface-secondary/40 border-b border-border-default px-6 py-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {steps.map((st, idx) => {
            const isCurrent = idx === activeStep;
            const isDone = idx < activeStep;
            const label = isAr ? st.titleAr || st.titleEn : st.titleEn;

            return (
              <div key={st.id} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-status-success text-white'
                      : isCurrent
                      ? 'bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy ring-2 ring-brand-navy/30'
                      : 'bg-surface-secondary text-text-muted border border-border-default'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isCurrent ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
                {idx < steps.length - 1 && (
                  <div className="w-6 h-0.5 bg-border-default mx-1 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <DrawerBody isAr={isAr}>{currentStep ? currentStep.content : null}</DrawerBody>

      <DrawerFooter
        isAr={isAr}
        actions={[
          {
            id: 'prev',
            labelEn: 'Previous Step',
            labelAr: 'الخطوة السابقة',
            onClick: handlePrev,
            disabled: isFirstStep || isSubmitting,
            icon: isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />,
          },
          ...(isLastStep
            ? [
                {
                  id: 'complete',
                  labelEn: 'Complete Workflow',
                  labelAr: 'إكمال سير العمل',
                  onClick: handleComplete,
                  variant: 'primary' as const,
                  loading: isSubmitting,
                  disabled: currentStep?.isValid === false,
                },
              ]
            : [
                {
                  id: 'next',
                  labelEn: 'Next Step',
                  labelAr: 'الخطوة التالية',
                  onClick: handleNext,
                  variant: 'primary' as const,
                  disabled: currentStep?.isValid === false,
                  icon: isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />,
                },
              ]),
        ]}
      />
    </EnterpriseDrawer>
  );
};
