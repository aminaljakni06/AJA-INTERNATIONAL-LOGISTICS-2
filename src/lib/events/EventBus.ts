import {
  DomainEvent,
  CreateDomainEventInput,
  EventSubscription,
  EventHandler,
  SubscriptionOptions,
  EventReplayOptions,
  DeadLetterEntry,
  EventPriority,
  DomainEventName,
} from '../../types/events';
import { EventRegistry } from './EventRegistry';

const PRIORITY_ORDER: Record<EventPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

export class EventBus {
  private static instance: EventBus;

  private subscriptions: Map<string, EventSubscription> = new Map();
  private history: DomainEvent[] = [];
  private deadLetterQueue: DeadLetterEntry[] = [];
  private maxHistorySize = 1000;
  private maxRetries = 3;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe a handler to a specific domain event or '*' for all events
   */
  public subscribe<T = any>(
    eventName: DomainEventName | '*',
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): string {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const subscription: EventSubscription = {
      id,
      eventName,
      handler,
      priority: options?.priority || 'NORMAL',
      async: options?.async ?? true,
      moduleFilter: options?.moduleFilter,
      createdAt: new Date().toISOString(),
    };

    this.subscriptions.set(id, subscription);
    return id;
  }

  /**
   * Unsubscribe a handler by ID
   */
  public unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Publish a new domain event
   */
  public async publish<T = any>(input: CreateDomainEventInput<T>): Promise<DomainEvent<T>> {
    // 1. Validate Payload against Registry
    const valResult = EventRegistry.validatePayload(input.name, input.payload);
    if (!valResult.valid) {
      throw new Error(
        `[EventBus] Invalid event payload for ${input.name}. Missing fields: ${valResult.missingFields.join(', ')}`
      );
    }

    // 2. Build Event Object
    const definition = EventRegistry.getDefinition(input.name);
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const correlationId = input.correlationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const event: DomainEvent<T> = {
      id: eventId,
      name: input.name,
      aggregateId: input.aggregateId,
      aggregateType: input.aggregateType,
      module: input.module || definition?.module || 'SYSTEM',
      version: input.version || definition?.version || '1.0',
      timestamp: new Date().toISOString(),
      triggeredBy: input.triggeredBy,
      companyId: input.companyId || 'aja-holding',
      branchId: input.branchId,
      correlationId,
      payload: input.payload,
      metadata: input.metadata || {},
      status: 'PENDING',
      priority: input.priority || definition?.defaultPriority || 'NORMAL',
      retryCount: 0,
    };

    // 3. Save to History Buffer
    this.recordHistory(event);

    // 4. Find Matching Subscriptions
    const matchingSubs = this.getMatchingSubscriptions(event);

    // Sort by priority descending
    matchingSubs.sort(
      (a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]
    );

    // Separate Sync and Async Subscriptions
    const syncSubs = matchingSubs.filter((s) => !s.async);
    const asyncSubs = matchingSubs.filter((s) => s.async);

    // Update status to processing
    event.status = 'PROCESSING';

    // 5. Execute Sync Subscriptions Sequentially
    for (const sub of syncSubs) {
      await this.executeHandlerWithRetry(sub, event);
    }

    // 6. Execute Async Subscriptions non-blockingly
    if (asyncSubs.length > 0) {
      setTimeout(() => {
        Promise.allSettled(
          asyncSubs.map((sub) => this.executeHandlerWithRetry(sub, event))
        );
      }, 0);
    }

    event.status = 'PROCESSED';
    return event;
  }

  /**
   * Broadcast multiple events in batch
   */
  public async broadcast(inputs: CreateDomainEventInput[]): Promise<DomainEvent[]> {
    const publishedEvents: DomainEvent[] = [];
    for (const input of inputs) {
      const evt = await this.publish(input);
      publishedEvents.push(evt);
    }
    return publishedEvents;
  }

  /**
   * Execute subscriber handler with automatic retry and DLQ routing
   */
  private async executeHandlerWithRetry(sub: EventSubscription, event: DomainEvent): Promise<void> {
    let attempts = 0;
    let success = false;
    let lastError: any = null;

    while (attempts < this.maxRetries && !success) {
      try {
        attempts++;
        await sub.handler(event);
        success = true;
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[EventBus] Handler failed for event ${event.name} (Sub: ${sub.id}), Attempt ${attempts}/${this.maxRetries}:`,
          err.message
        );
        if (attempts < this.maxRetries) {
          // Exponential backoff delay
          await new Promise((res) => setTimeout(res, 100 * Math.pow(2, attempts)));
        }
      }
    }

    if (!success) {
      event.status = 'FAILED';
      event.errorMessage = lastError?.message || 'Unknown handler failure';
      this.routeToDeadLetterQueue(event, lastError?.message || 'Max retries exceeded', attempts);
    }
  }

  /**
   * Route failed event to Dead Letter Queue
   */
  private routeToDeadLetterQueue(event: DomainEvent, reason: string, attempts: number): void {
    event.status = 'DEAD_LETTER';
    const dlqEntry: DeadLetterEntry = {
      id: `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event,
      failedAt: new Date().toISOString(),
      reason,
      attempts,
    };
    this.deadLetterQueue.push(dlqEntry);
    console.error(`[EventBus DLQ] Event ${event.name} (${event.id}) routed to Dead Letter Queue: ${reason}`);
  }

  /**
   * Match subscriptions by Event Name and Module Filter
   */
  private getMatchingSubscriptions(event: DomainEvent): EventSubscription[] {
    const matches: EventSubscription[] = [];
    for (const sub of this.subscriptions.values()) {
      const isNameMatch = sub.eventName === '*' || sub.eventName === event.name;
      const isModuleMatch = !sub.moduleFilter || sub.moduleFilter === event.module;
      if (isNameMatch && isModuleMatch) {
        matches.push(sub);
      }
    }
    return matches;
  }

  /**
   * Store event in memory history buffer
   */
  private recordHistory(event: DomainEvent): void {
    this.history.unshift(event);
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }
  }

  /**
   * Get filtered history logs
   */
  public getHistory(options?: EventReplayOptions): DomainEvent[] {
    let result = [...this.history];

    if (options?.eventName) {
      result = result.filter((e) => e.name === options.eventName);
    }
    if (options?.module) {
      result = result.filter((e) => e.module === options.module);
    }
    if (options?.correlationId) {
      result = result.filter((e) => e.correlationId === options.correlationId);
    }
    if (options?.aggregateId) {
      result = result.filter((e) => e.aggregateId === options.aggregateId);
    }
    if (options?.fromDate) {
      result = result.filter((e) => new Date(e.timestamp) >= new Date(options.fromDate!));
    }
    if (options?.toDate) {
      result = result.filter((e) => new Date(e.timestamp) <= new Date(options.toDate!));
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  /**
   * Replay historical events to current or specific subscribers
   */
  public async replay(options?: EventReplayOptions, targetHandler?: EventHandler): Promise<number> {
    const eventsToReplay = this.getHistory(options);
    let replayedCount = 0;

    for (const event of eventsToReplay.reverse()) {
      if (targetHandler) {
        await targetHandler(event);
        replayedCount++;
      } else {
        const subs = this.getMatchingSubscriptions(event);
        for (const sub of subs) {
          await this.executeHandlerWithRetry(sub, event);
        }
        replayedCount++;
      }
    }

    return replayedCount;
  }

  /**
   * Get Dead Letter Queue entries
   */
  public getDeadLetterQueue(): DeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Retry an item from Dead Letter Queue
   */
  public async retryDeadLetter(dlqId: string): Promise<boolean> {
    const index = this.deadLetterQueue.findIndex((entry) => entry.id === dlqId);
    if (index === -1) return false;

    const [entry] = this.deadLetterQueue.splice(index, 1);
    entry.event.status = 'RETRIED';

    const subs = this.getMatchingSubscriptions(entry.event);
    for (const sub of subs) {
      await this.executeHandlerWithRetry(sub, entry.event);
    }
    return true;
  }

  /**
   * Clear in-memory history & subscriptions (primarily for tests)
   */
  public reset(): void {
    this.subscriptions.clear();
    this.history = [];
    this.deadLetterQueue = [];
  }
}

export const eventBus = EventBus.getInstance();
