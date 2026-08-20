/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Form Draft Management Service
 * Phase: Enterprise UI System
 * Module: Enterprise Form Dialogs, Entity Dialogs & Multi-Step Wizard Dialog System
 * Version: 1.0
 */

import { DraftState } from '../../types/wizardFramework';

const DRAFT_PREFIX = 'aja_form_draft_';

class DraftServiceClass {
  /**
   * Generates key for draft storage
   */
  private getStorageKey(entityType: string, entityId?: string, userId: string = 'DEFAULT_USER'): string {
    return `${DRAFT_PREFIX}${userId}_${entityType}_${entityId || 'new'}`;
  }

  /**
   * Save a draft to storage
   */
  public saveDraft<T = any>(
    entityType: string,
    data: T,
    entityId?: string,
    activeStepIndex?: number,
    userId: string = 'DEFAULT_USER'
  ): DraftState<T> {
    const draftId = `draft_${Date.now()}`;
    const draft: DraftState<T> = {
      draftId,
      entityType,
      entityId,
      data,
      activeStepIndex,
      userId,
      lastSavedAt: Date.now(),
    };

    try {
      const key = this.getStorageKey(entityType, entityId, userId);
      localStorage.setItem(key, JSON.stringify(draft));
      console.log('[ENTERPRISE DRAFT SAVED]', key, draft);
    } catch (e) {
      console.warn('[DRAFT STORAGE WARN]', e);
    }

    return draft;
  }

  /**
   * Retrieve an existing draft if present
   */
  public getDraft<T = any>(
    entityType: string,
    entityId?: string,
    userId: string = 'DEFAULT_USER'
  ): DraftState<T> | null {
    try {
      const key = this.getStorageKey(entityType, entityId, userId);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as DraftState<T>;
    } catch (e) {
      return null;
    }
  }

  /**
   * Discard/Clear a draft
   */
  public clearDraft(
    entityType: string,
    entityId?: string,
    userId: string = 'DEFAULT_USER'
  ): void {
    try {
      const key = this.getStorageKey(entityType, entityId, userId);
      localStorage.removeItem(key);
      console.log('[ENTERPRISE DRAFT CLEARED]', key);
    } catch (e) {
      console.warn('[DRAFT STORAGE CLEAR WARN]', e);
    }
  }

  /**
   * List all stored drafts for current user
   */
  public listDrafts(userId: string = 'DEFAULT_USER'): DraftState[] {
    const drafts: DraftState[] = [];
    try {
      const userPrefix = `${DRAFT_PREFIX}${userId}_`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(userPrefix)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            drafts.push(JSON.parse(raw));
          }
        }
      }
    } catch (e) {
      console.warn('[LIST DRAFTS WARN]', e);
    }
    return drafts.sort((a, b) => b.lastSavedAt - a.lastSavedAt);
  }
}

export const DraftService = new DraftServiceClass();
