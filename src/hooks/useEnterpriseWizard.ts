/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Multi-Step Wizard Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System
 * Version: 1.0
 */

import { useState, useCallback, useMemo } from 'react';
import { WizardStep, WizardConfiguration, WizardState } from '../types/wizardFramework';
import { useEnterpriseDraft } from './useEnterpriseDraft';

export function useEnterpriseWizard<T = any>(
  steps: WizardStep<T>[],
  initialData: T,
  config: WizardConfiguration = {}
) {
  const {
    mode = 'linear',
    allowSkip = false,
    autoSaveDraft = true,
    enableStepJump = true,
  } = config;

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [stepData, setStepData] = useState<T>(initialData);
  const [stepValidities, setStepValidities] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { draft, hasDraft, lastSavedTime, saveDraft, clearDraft } = useEnterpriseDraft<T>(
    'WIZARD_FORM',
    undefined,
    config.autoSaveIntervalMs
  );

  const currentStep = steps[activeStepIndex];
  const totalSteps = steps.length;
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === totalSteps - 1;

  // Partial data updater
  const updateData = useCallback((partial: Partial<T>) => {
    setStepData((prev) => {
      const next = { ...prev, ...partial };
      if (autoSaveDraft) {
        saveDraft(next, activeStepIndex);
      }
      return next;
    });
  }, [autoSaveDraft, activeStepIndex, saveDraft]);

  // Set validity for step
  const setStepValidity = useCallback((stepId: string, isValid: boolean) => {
    setStepValidities((prev) => ({ ...prev, [stepId]: isValid }));
  }, []);

  // Step Navigation Handlers
  const goToNextStep = useCallback(() => {
    if (isLastStep) return;

    // Mark current step as completed
    if (currentStep && !completedStepIds.includes(currentStep.id)) {
      setCompletedStepIds((prev) => [...prev, currentStep.id]);
    }

    setActiveStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [isLastStep, currentStep, completedStepIds, totalSteps]);

  const goToPreviousStep = useCallback(() => {
    if (isFirstStep) return;
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
  }, [isFirstStep]);

  const jumpToStep = useCallback(
    (targetIndex: number) => {
      if (!enableStepJump) return;
      if (targetIndex < 0 || targetIndex >= totalSteps) return;

      // In linear mode, ensure prior steps are completed
      if (mode === 'linear' && targetIndex > activeStepIndex) {
        const canJump = steps
          .slice(0, targetIndex)
          .every((s) => completedStepIds.includes(s.id) || s.isOptional);
        if (!canJump && !allowSkip) return;
      }

      setActiveStepIndex(targetIndex);
    },
    [enableStepJump, totalSteps, mode, activeStepIndex, steps, completedStepIds, allowSkip]
  );

  const restoreDraftData = useCallback(() => {
    if (draft && draft.data) {
      setStepData(draft.data);
      if (typeof draft.activeStepIndex === 'number') {
        setActiveStepIndex(draft.activeStepIndex);
      }
    }
  }, [draft]);

  return {
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
  };
}
