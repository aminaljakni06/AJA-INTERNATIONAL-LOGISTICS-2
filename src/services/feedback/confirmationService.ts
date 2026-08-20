/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Confirmation Modal Service
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { ConfirmationConfig } from '../../types/feedbackFramework';

type ConfirmationSubscriber = (config: ConfirmationConfig | null) => void;

class EnterpriseConfirmationService {
  private activeConfig: ConfirmationConfig | null = null;
  private subscribers: Set<ConfirmationSubscriber> = new Set();

  public subscribe(subscriber: ConfirmationSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.activeConfig);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(): void {
    this.subscribers.forEach((fn) => fn(this.activeConfig));
  }

  public confirm(config: Omit<ConfirmationConfig, 'id'>): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const id = `conf_${Date.now()}`;
      this.activeConfig = {
        ...config,
        id,
        onConfirm: async () => {
          try {
            await config.onConfirm();
            resolve(true);
          } catch (err) {
            resolve(false);
          } finally {
            this.close();
          }
        },
        onCancel: () => {
          if (config.onCancel) config.onCancel();
          resolve(false);
          this.close();
        },
      };

      this.notify();
    });
  }

  public close(): void {
    this.activeConfig = null;
    this.notify();
  }

  public get currentConfig(): ConfirmationConfig | null {
    return this.activeConfig;
  }
}

export const enterpriseConfirmationService = new EnterpriseConfirmationService();
