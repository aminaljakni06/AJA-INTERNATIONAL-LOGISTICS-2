import { DomainEventName, DomainModule, EventPriority } from '../../types/events';

export interface EventDefinition {
  name: DomainEventName;
  module: DomainModule;
  defaultPriority: EventPriority;
  version: string;
  description: string;
  requiredPayloadFields: string[];
}

export class EventRegistry {
  private static definitions: Map<string, EventDefinition> = new Map([
    [
      'ShipmentCreated',
      {
        name: 'ShipmentCreated',
        module: 'SHIPPING',
        defaultPriority: 'HIGH',
        version: '1.0',
        description: 'Emitted when a new shipment tracking order or booking is registered',
        requiredPayloadFields: ['trackingNumber'],
      },
    ],
    [
      'ShipmentUpdated',
      {
        name: 'ShipmentUpdated',
        module: 'SHIPPING',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when a shipment status, location, or ETA updates',
        requiredPayloadFields: ['trackingNumber', 'status'],
      },
    ],
    [
      'ShipmentAssigned',
      {
        name: 'ShipmentAssigned',
        module: 'FLEET',
        defaultPriority: 'HIGH',
        version: '1.0',
        description: 'Emitted when a shipment is assigned to a driver or fleet vehicle',
        requiredPayloadFields: ['trackingNumber', 'driverId'],
      },
    ],
    [
      'ShipmentDelivered',
      {
        name: 'ShipmentDelivered',
        module: 'SHIPPING',
        defaultPriority: 'CRITICAL',
        version: '1.0',
        description: 'Emitted when final delivery confirmation occurs',
        requiredPayloadFields: ['trackingNumber', 'deliveredAt'],
      },
    ],
    [
      'QuoteCreated',
      {
        name: 'QuoteCreated',
        module: 'SALES',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when a customer requests a shipping rate quotation',
        requiredPayloadFields: ['quoteId'],
      },
    ],
    [
      'QuoteApproved',
      {
        name: 'QuoteApproved',
        module: 'SALES',
        defaultPriority: 'HIGH',
        version: '1.0',
        description: 'Emitted when a freight quotation is accepted/approved',
        requiredPayloadFields: ['quoteId'],
      },
    ],
    [
      'InvoiceCreated',
      {
        name: 'InvoiceCreated',
        module: 'FINANCE',
        defaultPriority: 'HIGH',
        version: '1.0',
        description: 'Emitted when an invoice is generated for freight services',
        requiredPayloadFields: ['invoiceId', 'amount'],
      },
    ],
    [
      'PaymentCompleted',
      {
        name: 'PaymentCompleted',
        module: 'FINANCE',
        defaultPriority: 'CRITICAL',
        version: '1.0',
        description: 'Emitted when payment process succeeds (Adyen / Gateway)',
        requiredPayloadFields: ['transactionId', 'amount'],
      },
    ],
    [
      'CustomerCreated',
      {
        name: 'CustomerCreated',
        module: 'CRM',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when a new enterprise customer or account is registered',
        requiredPayloadFields: ['customerId'],
      },
    ],
    [
      'EmployeeCreated',
      {
        name: 'EmployeeCreated',
        module: 'HR',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when an employee account or assignment is created',
        requiredPayloadFields: ['employeeId'],
      },
    ],
    [
      'VehicleAssigned',
      {
        name: 'VehicleAssigned',
        module: 'FLEET',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when a vehicle is assigned to a route or branch',
        requiredPayloadFields: ['vehicleId'],
      },
    ],
    [
      'WarehouseUpdated',
      {
        name: 'WarehouseUpdated',
        module: 'WAREHOUSE',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when warehouse capacity, inventory, or status changes',
        requiredPayloadFields: ['warehouseId'],
      },
    ],
    [
      'TicketCreated',
      {
        name: 'TicketCreated',
        module: 'CUSTOMER_SERVICE',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when a support ticket or claim is logged',
        requiredPayloadFields: ['ticketId'],
      },
    ],
    [
      'NotificationSent',
      {
        name: 'NotificationSent',
        module: 'SYSTEM',
        defaultPriority: 'LOW',
        version: '1.0',
        description: 'Emitted when SMS, Email, or WhatsApp dispatch succeeds',
        requiredPayloadFields: ['recipient'],
      },
    ],
    [
      'UserLoggedIn',
      {
        name: 'UserLoggedIn',
        module: 'AUTH',
        defaultPriority: 'LOW',
        version: '1.0',
        description: 'Emitted on successful authentication',
        requiredPayloadFields: ['userId'],
      },
    ],
    [
      'RoleChanged',
      {
        name: 'RoleChanged',
        module: 'AUTH',
        defaultPriority: 'HIGH',
        version: '1.0',
        description: 'Emitted when user permissions or RBAC roles update',
        requiredPayloadFields: ['userId', 'newRole'],
      },
    ],
    [
      'BranchCreated',
      {
        name: 'BranchCreated',
        module: 'ORGANIZATION',
        defaultPriority: 'NORMAL',
        version: '1.0',
        description: 'Emitted when a new logistics branch hub is established',
        requiredPayloadFields: ['branchId'],
      },
    ],
    [
      'CompanyCreated',
      {
        name: 'CompanyCreated',
        module: 'ORGANIZATION',
        defaultPriority: 'HIGH',
        version: '1.0',
        description: 'Emitted when enterprise holding entity is provisioned',
        requiredPayloadFields: ['companyId'],
      },
    ],
    [
      'AuditRecorded',
      {
        name: 'AuditRecorded',
        module: 'COMPLIANCE',
        defaultPriority: 'LOW',
        version: '1.0',
        description: 'Emitted when an audit trail log is captured',
        requiredPayloadFields: ['action', 'entityType'],
      },
    ],
    [
      'AIRequestCompleted',
      {
        name: 'AIRequestCompleted',
        module: 'AI',
        defaultPriority: 'LOW',
        version: '1.0',
        description: 'Emitted when AI Orchestration or Gemini completes an action',
        requiredPayloadFields: ['promptType'],
      },
    ],
  ]);

  /**
   * Retrieves definition for event
   */
  public static getDefinition(eventName: string): EventDefinition | undefined {
    return this.definitions.get(eventName);
  }

  /**
   * Register or override event definition
   */
  public static registerDefinition(def: EventDefinition): void {
    this.definitions.set(def.name, def);
  }

  /**
   * Validate input payload against required fields
   */
  public static validatePayload(eventName: string, payload: any): { valid: boolean; missingFields: string[] } {
    const def = this.definitions.get(eventName);
    if (!def) {
      // Unregistered dynamic events are allowed with payload validation warning
      return { valid: true, missingFields: [] };
    }

    if (!payload || typeof payload !== 'object') {
      return { valid: false, missingFields: def.requiredPayloadFields };
    }

    const missingFields: string[] = [];
    for (const field of def.requiredPayloadFields) {
      if (payload[field] === undefined || payload[field] === null) {
        missingFields.push(field);
      }
    }

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Get all registered definitions
   */
  public static getAllDefinitions(): EventDefinition[] {
    return Array.from(this.definitions.values());
  }
}
