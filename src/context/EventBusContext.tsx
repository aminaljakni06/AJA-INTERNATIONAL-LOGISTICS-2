import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DomainEvent,
  CreateDomainEventInput,
  DomainEventName,
  EventHandler,
  SubscriptionOptions,
  EventReplayOptions,
  DeadLetterEntry,
} from '../types/events';
import { useAuth } from './AuthContext';

interface EventBusContextType {
  lastEvent: DomainEvent | null;
  history: DomainEvent[];
  deadLetterQueue: DeadLetterEntry[];
  publishEvent: <T = any>(input: CreateDomainEventInput<T>) => Promise<DomainEvent<T>>;
  subscribeToEvent: <T = any>(
    eventName: DomainEventName | '*',
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ) => string;
  unsubscribeFromEvent: (subscriptionId: string) => boolean;
  replayEvents: (options?: EventReplayOptions) => Promise<number>;
  refreshHistory: () => void;
}

const EventBusContext = createContext<EventBusContextType | undefined>(undefined);

async function fetchEventResource<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload?.error || payload?.messageEn || 'Failed to fetch event data');
  }

  return (payload?.data ?? payload) as T;
}

export const EventBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [lastEvent, setLastEvent] = useState<DomainEvent | null>(null);
  const [history, setHistory] = useState<DomainEvent[]>([]);
  const [deadLetterQueue, setDeadLetterQueue] = useState<DeadLetterEntry[]>([]);
  const [subscriptions] = useState(
    () => new Map<string, { eventName: DomainEventName | '*'; handler: EventHandler<any>; options?: SubscriptionOptions }>()
  );

  const refreshHistory = useCallback(() => {
    if (!token) {
      setHistory([]);
      setDeadLetterQueue([]);
      return;
    }

    void Promise.all([
      fetchEventResource<{ history: DomainEvent[] }>('/api/events/history', token),
      fetchEventResource<{ deadLetterQueue: DeadLetterEntry[] }>('/api/events/dlq', token).catch(() => ({ deadLetterQueue: [] })),
    ])
      .then(([historyPayload, dlqPayload]) => {
        setHistory(historyPayload.history);
        setDeadLetterQueue(dlqPayload.deadLetterQueue);
      })
      .catch((err) => {
        console.error('[EventBusProvider] Failed to refresh event history:', err);
      });
  }, [token]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const publishEvent = useCallback(
    async <T = any>(input: CreateDomainEventInput<T>): Promise<DomainEvent<T>> => {
      if (!token) throw new Error('Authentication token is required to publish events.');
      const { event: evt } = await fetchEventResource<{ event: DomainEvent<T> }>('/api/events/publish', token, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setLastEvent(evt);
      for (const { eventName, handler, options } of subscriptions.values()) {
        if (eventName !== '*' && eventName !== evt.name) continue;
        if (options?.moduleFilter && options.moduleFilter !== evt.module) continue;
        await handler(evt);
      }
      refreshHistory();
      return evt;
    },
    [refreshHistory, subscriptions, token]
  );

  const subscribeToEvent = useCallback(
    <T = any>(
      eventName: DomainEventName | '*',
      handler: EventHandler<T>,
      options?: SubscriptionOptions
    ): string => {
      const subscriptionId = `client_sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      subscriptions.set(subscriptionId, { eventName, handler, options });
      return subscriptionId;
    },
    [subscriptions]
  );

  const unsubscribeFromEvent = useCallback((subscriptionId: string): boolean => {
    return subscriptions.delete(subscriptionId);
  }, [subscriptions]);

  const replayEvents = useCallback(
    async (options?: EventReplayOptions): Promise<number> => {
      if (!token) throw new Error('Authentication token is required to replay events.');
      const { replayedCount } = await fetchEventResource<{ replayedCount: number }>('/api/events/replay', token, {
        method: 'POST',
        body: JSON.stringify(options || {}),
      });
      refreshHistory();
      return replayedCount;
    },
    [refreshHistory, token]
  );

  return (
    <EventBusContext.Provider
      value={{
        lastEvent,
        history,
        deadLetterQueue,
        publishEvent,
        subscribeToEvent,
        unsubscribeFromEvent,
        replayEvents,
        refreshHistory,
      }}
    >
      {children}
    </EventBusContext.Provider>
  );
};

export function useEventBus() {
  const context = useContext(EventBusContext);
  if (!context) {
    throw new Error('useEventBus must be used within an EventBusProvider');
  }
  return context;
}
