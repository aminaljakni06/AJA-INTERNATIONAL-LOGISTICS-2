export type DomainEventName =
  | 'ShipmentCreated'
  | 'ShipmentUpdated'
  | 'ShipmentAssigned'
  | 'ShipmentDelivered'
  | 'QuoteCreated'
  | 'QuoteApproved'
  | 'InvoiceCreated'
  | 'PaymentCompleted'
  | 'CustomerCreated'
  | 'EmployeeCreated'
  | 'VehicleAssigned'
  | 'WarehouseUpdated'
  | 'TicketCreated'
  | 'NotificationSent'
  | 'UserLoggedIn'
  | 'RoleChanged'
  | 'BranchCreated'
  | 'CompanyCreated'
  | 'AuditRecorded'
  | 'AIRequestCompleted'
  | string;

export type DomainModule =
  | 'CRM'
  | 'SHIPPING'
  | 'FINANCE'
  | 'WAREHOUSE'
  | 'FLEET'
  | 'HR'
  | 'SALES'
  | 'CUSTOMER_SERVICE'
  | 'AI'
  | 'REPORTS'
  | 'COMPLIANCE'
  | 'AUTH'
  | 'ORGANIZATION'
  | 'CONFIGURATION'
  | 'GOVERNANCE'
  | 'MDM'
  | 'SYSTEM';

export type EventPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type DomainEventStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | 'RETRIED'
  | 'DEAD_LETTER';

export interface EventUserContext {
  userId?: string;
  email?: string;
  role?: string;
}

export interface DomainEvent<T = any> {
  id: string;
  name: DomainEventName;
  aggregateId: string;
  aggregateType: string;
  module: DomainModule;
  version: string;
  timestamp: string;
  triggeredBy?: EventUserContext;
  companyId?: string;
  branchId?: string;
  correlationId: string;
  payload: T;
  metadata?: Record<string, any>;
  status: DomainEventStatus;
  priority?: EventPriority;
  retryCount?: number;
  errorMessage?: string;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>;

export interface SubscriptionOptions {
  priority?: EventPriority;
  async?: boolean;
  moduleFilter?: DomainModule;
}

export interface EventSubscription {
  id: string;
  eventName: DomainEventName | '*';
  handler: EventHandler;
  priority: EventPriority;
  async: boolean;
  moduleFilter?: DomainModule;
  createdAt: string;
}

export interface CreateDomainEventInput<T = any> {
  name: DomainEventName;
  aggregateId: string;
  aggregateType: string;
  module: DomainModule;
  version?: string;
  triggeredBy?: EventUserContext;
  companyId?: string;
  branchId?: string;
  correlationId?: string;
  payload: T;
  metadata?: Record<string, any>;
  priority?: EventPriority;
}

export interface EventReplayOptions {
  eventName?: DomainEventName;
  module?: DomainModule;
  fromDate?: string;
  toDate?: string;
  correlationId?: string;
  aggregateId?: string;
  limit?: number;
}

export interface DeadLetterEntry {
  id: string;
  event: DomainEvent;
  failedAt: string;
  reason: string;
  attempts: number;
}
