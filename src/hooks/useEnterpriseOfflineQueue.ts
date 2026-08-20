/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Offline Queue Hook
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Data Fetching & Cache Layer
 * Version: 1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineMutationQueueItem } from '../types/dataFetchingFramework';
import { offlineQueueEngine } from '../services/dataFetching/offlineQueueEngine';

export function useEnterpriseOfflineQueue() {
  const [queuedItems, setQueuedItems] = useState<OfflineMutationQueueItem[]>(
    offlineQueueEngine.queuedItems
  );
  const [isOnline, setIsOnline] = useState<boolean>(offlineQueueEngine.isOnline);

  useEffect(() => {
    const unsubscribe = offlineQueueEngine.subscribe((updatedItems) => {
      setQueuedItems(updatedItems);
      setIsOnline(offlineQueueEngine.isOnline);
    });

    const handleOnlineStatus = () => setIsOnline(true);
    const handleOfflineStatus = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOfflineStatus);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOfflineStatus);
      }
    };
  }, []);

  const flushQueue = useCallback(async () => {
    return offlineQueueEngine.flushQueue();
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueueEngine.clearQueue();
  }, []);

  return {
    isOnline,
    queuedItems,
    pendingCount: queuedItems.length,
    flushQueue,
    clearQueue,
  };
}
