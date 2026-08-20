/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Offline Mutation Queue Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { OfflineMutationQueueItem, HttpMethod } from '../../types/dataFetchingFramework';

type QueueListener = (items: OfflineMutationQueueItem[]) => void;

class EnterpriseOfflineQueueEngine {
  private queue: OfflineMutationQueueItem[] = [];
  private listeners: Set<QueueListener> = new Set();
  private storageKey: string = 'aja_offline_mutations';
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch (err) {
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    } catch (err) {
      // Safe fallback
    }
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.queue]));
    this.saveToStorage();
  }

  private async handleOnline(): Promise<void> {
    this.isOnlineStatus = true;
    await this.flushQueue();
  }

  private handleOffline(): void {
    this.isOnlineStatus = false;
  }

  public subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    listener(this.queue);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public enqueue<TVariables = any>(
    mutationKey: string,
    endpoint: string,
    method: HttpMethod,
    variables: TVariables,
    module?: string
  ): OfflineMutationQueueItem<TVariables> {
    const item: OfflineMutationQueueItem<TVariables> = {
      id: `off_mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      mutationKey,
      endpoint,
      method,
      variables,
      queuedAt: Date.now(),
      attempts: 0,
      module,
    };

    this.queue.push(item);
    this.notify();
    return item;
  }

  public async flushQueue(
    executor?: (item: OfflineMutationQueueItem) => Promise<boolean>
  ): Promise<{ processed: number; failed: number }> {
    if (!this.isOnline || this.queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    const itemsToProcess = [...this.queue];
    let processed = 0;
    let failed = 0;

    for (const item of itemsToProcess) {
      try {
        let success = false;
        if (executor) {
          success = await executor(item);
        } else {
          // Default fetch executor
          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              'X-Offline-Sync': 'true',
            },
            body: JSON.stringify(item.variables),
          });
          success = response.ok;
        }

        if (success) {
          this.queue = this.queue.filter((q) => q.id !== item.id);
          processed++;
        } else {
          item.attempts++;
          failed++;
          if (item.attempts >= 5) {
            // Drop after 5 persistent failures
            this.queue = this.queue.filter((q) => q.id !== item.id);
          }
        }
      } catch (err) {
        item.attempts++;
        failed++;
      }
    }

    this.notify();
    return { processed, failed };
  }

  public get isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public get queuedItems(): OfflineMutationQueueItem[] {
    return [...this.queue];
  }

  public clearQueue(): void {
    this.queue = [];
    this.notify();
  }
}

export const offlineQueueEngine = new EnterpriseOfflineQueueEngine();
