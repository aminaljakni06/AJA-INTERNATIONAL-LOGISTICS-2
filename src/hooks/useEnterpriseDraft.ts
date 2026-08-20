/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Form Draft Custom Hook
 * Phase: Enterprise UI System
 * Module: Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { DraftState } from '../types/wizardFramework';
import { DraftService } from '../services/dialog/draftService';

export function useEnterpriseDraft<T = any>(
  entityType: string,
  entityId?: string,
  autoSaveIntervalMs: number = 0
) {
  const [draft, setDraft] = useState<DraftState<T> | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    const existing = DraftService.getDraft<T>(entityType, entityId);
    if (existing) {
      setDraft(existing);
      setHasDraft(true);
      setLastSavedTime(existing.lastSavedAt);
    }
  }, [entityType, entityId]);

  const saveDraft = useCallback(
    (data: T, activeStepIndex?: number) => {
      const saved = DraftService.saveDraft<T>(
        entityType,
        data,
        entityId,
        activeStepIndex
      );
      setDraft(saved);
      setHasDraft(true);
      setLastSavedTime(saved.lastSavedAt);
      return saved;
    },
    [entityType, entityId]
  );

  const clearDraft = useCallback(() => {
    DraftService.clearDraft(entityType, entityId);
    setDraft(null);
    setHasDraft(false);
    setLastSavedTime(null);
  }, [entityType, entityId]);

  return {
    draft,
    hasDraft,
    lastSavedTime,
    saveDraft,
    clearDraft,
  };
}
