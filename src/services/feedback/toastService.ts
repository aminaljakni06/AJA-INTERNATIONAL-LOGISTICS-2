/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Toast Management Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { ToastItem, ToastType, ToastPosition } from '../../types/feedbackFramework';

type ToastSubscriber = (toasts: ToastItem[]) => void;

class EnterpriseToastService {
  private toasts: ToastItem[] = [];
  private subscribers: Set<ToastSubscriber> = new Set();
  private maxToasts: number = 5;
  private defaultDurationMs: number = 5000;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  public subscribe(subscriber: ToastSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber([...this.toasts]);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(): void {
    this.subscribers.forEach((fn) => fn([...this.toasts]));
  }

  public show(item: Omit<ToastItem, 'id'>): string {
    // Deduplication check: if a toast with same titleEn and type already exists, update or skip
    const existingIndex = this.toasts.findIndex(
      (t) => t.type === item.type && t.titleEn === item.titleEn && t.messageEn === item.messageEn
    );

    if (existingIndex !== -1) {
      const existing = this.toasts[existingIndex];
      // Reset timer if durationMs > 0
      if (this.timers.has(existing.id)) {
        clearTimeout(this.timers.get(existing.id)!);
        this.timers.delete(existing.id);
      }
      const updatedDuration = item.durationMs ?? existing.durationMs;
      if (updatedDuration && updatedDuration > 0) {
        const timer = setTimeout(() => {
          this.dismiss(existing.id);
        }, updatedDuration);
        this.timers.set(existing.id, timer);
      }
      this.notify();
      return existing.id;
    }

    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const toast: ToastItem = {
      ...item,
      id,
      position: item.position || 'top-right',
      dismissible: item.dismissible ?? true,
      durationMs: item.durationMs ?? (item.type === 'loading' || item.type === 'progress' ? 0 : this.defaultDurationMs),
    };

    // Enforce max stack size
    if (this.toasts.length >= this.maxToasts) {
      const oldest = this.toasts[0];
      this.dismiss(oldest.id);
    }

    this.toasts.push(toast);
    this.notify();

    // Auto dismiss if durationMs > 0
    if (toast.durationMs && toast.durationMs > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, toast.durationMs);
      this.timers.set(id, timer);
    }

    return id;
  }

  public success(titleEn: string, titleAr: string, messageEn?: string, messageAr?: string): string {
    return this.show({ type: 'success', titleEn, titleAr, messageEn, messageAr });
  }

  public error(titleEn: string, titleAr: string, messageEn?: string, messageAr?: string): string {
    return this.show({ type: 'error', titleEn, titleAr, messageEn, messageAr, durationMs: 7000 });
  }

  public warning(titleEn: string, titleAr: string, messageEn?: string, messageAr?: string): string {
    return this.show({ type: 'warning', titleEn, titleAr, messageEn, messageAr });
  }

  public info(titleEn: string, titleAr: string, messageEn?: string, messageAr?: string): string {
    return this.show({ type: 'info', titleEn, titleAr, messageEn, messageAr });
  }

  public loading(titleEn: string, titleAr: string, messageEn?: string, messageAr?: string): string {
    return this.show({ type: 'loading', titleEn, titleAr, messageEn, messageAr, durationMs: 0 });
  }

  public progress(
    titleEn: string,
    titleAr: string,
    percent: number,
    messageEn?: string,
    messageAr?: string
  ): string {
    return this.show({
      type: 'progress',
      titleEn,
      titleAr,
      messageEn,
      messageAr,
      progressPercent: percent,
      durationMs: 0,
    });
  }

  public undo(
    titleEn: string,
    titleAr: string,
    onUndo: () => void | Promise<void>,
    durationMs: number = 8000
  ): string {
    return this.show({
      type: 'undo',
      titleEn,
      titleAr,
      undoCallback: onUndo,
      durationMs,
      actions: [
        {
          id: 'undo_act',
          labelEn: 'Undo',
          labelAr: 'تراجع',
          onClick: onUndo,
          variant: 'primary',
        },
      ],
    });
  }

  public updateProgress(id: string, percent: number): void {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast) {
      toast.progressPercent = percent;
      this.notify();
    }
  }

  public dismiss(id: string): void {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id)!);
      this.timers.delete(id);
    }
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clearAll(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this.toasts = [];
    this.notify();
  }

  public get activeToasts(): ToastItem[] {
    return [...this.toasts];
  }
}

export const enterpriseToastService = new EnterpriseToastService();
