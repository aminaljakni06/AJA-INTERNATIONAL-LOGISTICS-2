import { EventBus } from '../lib/events/EventBus';
import {
  DomainEvent,
  CreateDomainEventInput,
  DomainEventName,
  EventHandler,
  SubscriptionOptions,
  EventReplayOptions,
  DeadLetterEntry,
} from '../types/events';
import { getAdminFirestore } from '../server/firebaseAdmin';

export class EventBusService {
  private static eventBus = EventBus.getInstance();

  /**
   * Publish a domain event to the bus and persist to Firestore async
   */
  public static async publish<T = any>(input: CreateDomainEventInput<T>): Promise<DomainEvent<T>> {
    const event = await this.eventBus.publish(input);

    // Persist event log to Firestore asynchronously
    this.persistEventToFirestore(event).catch((err) =>
      console.warn('[EventBusService] Firestore event log warning:', err.message)
    );

    return event;
  }

  /**
   * Subscribe to a domain event or '*' for all
   */
  public static subscribe<T = any>(
    eventName: DomainEventName | '*',
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): string {
    return this.eventBus.subscribe(eventName, handler, options);
  }

  /**
   * Unsubscribe by ID
   */
  public static unsubscribe(subscriptionId: string): boolean {
    return this.eventBus.unsubscribe(subscriptionId);
  }

  /**
   * Broadcast multiple events
   */
  public static async broadcast(inputs: CreateDomainEventInput[]): Promise<DomainEvent[]> {
    return this.eventBus.broadcast(inputs);
  }

  /**
   * Replay historical events
   */
  public static async replay(options?: EventReplayOptions, targetHandler?: EventHandler): Promise<number> {
    return this.eventBus.replay(options, targetHandler);
  }

  /**
   * Query event history
   */
  public static getHistory(options?: EventReplayOptions): DomainEvent[] {
    return this.eventBus.getHistory(options);
  }

  /**
   * Get Dead Letter Queue
   */
  public static getDeadLetterQueue(): DeadLetterEntry[] {
    return this.eventBus.getDeadLetterQueue();
  }

  /**
   * Retry DLQ item
   */
  public static async retryDeadLetter(dlqId: string): Promise<boolean> {
    return this.eventBus.retryDeadLetter(dlqId);
  }

  /**
   * Helper: Publish Shipment Created
   */
  public static async publishShipmentCreated(trackingNumber: string, details: Record<string, any>, user?: any) {
    return this.publish({
      name: 'ShipmentCreated',
      aggregateId: trackingNumber,
      aggregateType: 'Shipment',
      module: 'SHIPPING',
      priority: 'HIGH',
      payload: { trackingNumber, ...details },
      triggeredBy: user ? { userId: user.id, email: user.email, role: user.role } : undefined,
    });
  }

  /**
   * Helper: Publish Shipment Status Updated
   */
  public static async publishShipmentUpdated(
    trackingNumber: string,
    status: string,
    location?: string,
    user?: any
  ) {
    return this.publish({
      name: 'ShipmentUpdated',
      aggregateId: trackingNumber,
      aggregateType: 'Shipment',
      module: 'SHIPPING',
      priority: 'NORMAL',
      payload: { trackingNumber, status, location },
      triggeredBy: user ? { userId: user.id, email: user.email, role: user.role } : undefined,
    });
  }

  /**
   * Helper: Publish Payment Completed
   */
  public static async publishPaymentCompleted(
    transactionId: string,
    amount: number,
    currency: string,
    user?: any
  ) {
    return this.publish({
      name: 'PaymentCompleted',
      aggregateId: transactionId,
      aggregateType: 'Payment',
      module: 'FINANCE',
      priority: 'CRITICAL',
      payload: { transactionId, amount, currency },
      triggeredBy: user ? { userId: user.id, email: user.email, role: user.role } : undefined,
    });
  }

  /**
   * Helper: Publish Notification Dispatch
   */
  public static async publishNotificationSent(recipient: string, type: string, payloadDetails?: any) {
    return this.publish({
      name: 'NotificationSent',
      aggregateId: recipient,
      aggregateType: 'Notification',
      module: 'SYSTEM',
      priority: 'LOW',
      payload: { recipient, type, details: payloadDetails },
    });
  }

  /**
   * Persist event asynchronously to Firestore
   */
  private static async persistEventToFirestore(event: DomainEvent): Promise<void> {
    try {
      await getAdminFirestore().collection('event_logs').add({
        ...event,
        persistedAt: new Date().toISOString(),
      });
    } catch (e) {
      // Quiet fail if offline or database rules restrict
    }
  }
}
