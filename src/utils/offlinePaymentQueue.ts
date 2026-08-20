export interface QueuedPaymentTransaction {
  id: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cardDetails?: {
    holderName: string;
    number: string;
    expiry: string;
    cvv?: string;
  };
  installments?: {
    value: number;
  };
  entityType?: 'QUOTE' | 'SHIPMENT' | 'INVOICE';
  entityId?: string;
  description?: string;
  createdAt: string;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastErrorMessage?: string;
  pspReference?: string;
}

const STORAGE_KEY = 'aja_offline_payment_queue_v1';

class OfflinePaymentQueueManager {
  private queue: QueuedPaymentTransaction[] = [];
  private listeners: Array<(queue: QueuedPaymentTransaction[]) => void> = [];
  private isSyncing = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.autoSyncQueue());
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.loadQueue();
        }
      });
    }
  }

  private loadQueue(): void {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      } else {
        this.queue = [];
      }
    } catch (e) {
      console.error('Failed to load offline payment queue:', e);
      this.queue = [];
    }
    this.notifyListeners();
  }

  private saveQueue(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline payment queue:', e);
    }
    this.notifyListeners();
  }

  public subscribe(listener: (queue: QueuedPaymentTransaction[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getQueue());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    const copy = [...this.queue];
    this.listeners.forEach((l) => l(copy));
  }

  public getQueue(): QueuedPaymentTransaction[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter((item) => item.status === 'QUEUED' || item.status === 'SYNCING').length;
  }

  public enqueueTransaction(
    tx: Omit<QueuedPaymentTransaction, 'id' | 'createdAt' | 'status' | 'retryCount'>
  ): QueuedPaymentTransaction {
    const newTx: QueuedPaymentTransaction = {
      ...tx,
      id: `OFFLINE-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'QUEUED',
      retryCount: 0,
    };

    this.queue.unshift(newTx);
    this.saveQueue();

    // If online right now, attempt immediate background sync
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      setTimeout(() => this.autoSyncQueue(), 500);
    }

    return newTx;
  }

  public removeTransaction(id: string): void {
    this.queue = this.queue.filter((tx) => tx.id !== id);
    this.saveQueue();
  }

  public clearSynced(): void {
    this.queue = this.queue.filter((tx) => tx.status !== 'SYNCED');
    this.saveQueue();
  }

  public async autoSyncQueue(token?: string): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    const pending = this.queue.filter((tx) => tx.status === 'QUEUED' || tx.status === 'FAILED');
    if (pending.length === 0) return { synced: 0, failed: 0 };

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('aja_auth_token') : null);

    for (const tx of pending) {
      tx.status = 'SYNCING';
      this.saveQueue();

      try {
        const response = await fetch('/api/adyen/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            amount: tx.amount,
            currency: tx.currency,
            referenceNumber: tx.referenceNumber,
            paymentMethod: { type: tx.paymentMethod },
            cardDetails: tx.cardDetails,
            installments: tx.installments,
            entityType: tx.entityType,
            entityId: tx.entityId,
            description: tx.description ? `${tx.description} (Offline Queued Sync)` : 'Offline Queued Payment',
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          tx.status = 'SYNCED';
          tx.pspReference = data.pspReference;
          synced++;
        } else {
          tx.status = 'FAILED';
          tx.retryCount += 1;
          tx.lastErrorMessage = data.message || data.error || 'Gateway returned non-success code';
          failed++;
        }
      } catch (err: any) {
        tx.status = 'FAILED';
        tx.retryCount += 1;
        tx.lastErrorMessage = err.message || 'Network connectivity failed during sync';
        failed++;
      }

      this.saveQueue();
    }

    this.isSyncing = false;
    return { synced, failed };
  }
}

export const offlinePaymentQueue = new OfflinePaymentQueueManager();
