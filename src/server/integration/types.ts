export type APIType = 'REST' | 'GRAPHQL' | 'GRPC' | 'ASYNC_API' | 'WEBHOOK';

export type APIAuthMethod = 'OAUTH2' | 'JWT' | 'API_KEY' | 'MTLS' | 'HMAC';

export type CircuitBreakerStatus = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface EnterpriseAPIEndpoint {
  id: string;
  nameEn: string;
  nameAr: string;
  path: string;
  type: APIType;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'SUBSCRIBE';
  authMethod: APIAuthMethod;
  rateLimitPerMinute: number;
  avgLatencyMs: number;
  successRatePct: number;
  circuitBreaker: CircuitBreakerStatus;
  version: string;
  tags: string[];
  openApiSpecUrl?: string;
}

export interface EventBusTopic {
  topicId: string;
  topicName: string;
  category: 'SHIPMENT' | 'PAYMENT' | 'CUSTOMS' | 'INVENTORY' | 'FLEET' | 'SYSTEM' | 'AI';
  messagesPerSecond: number;
  totalMessagesToday: number;
  deadLetterCount: number;
  partitionCount: number;
  retentionHours: number;
  brokerType: 'KAFKA' | 'RABBITMQ' | 'PUBSUB';
  subscribersCount: number;
}

export interface SagaWorkflowInstance {
  sagaId: string;
  workflowName: string; // e.g., Order-to-Cash, Customs Clearance, Payment Settlement
  triggerEvent: string;
  currentStep: string;
  totalSteps: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'COMPENSATING' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  stepsDetail: Array<{
    stepName: string;
    service: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'ROLLED_BACK';
    durationMs: number;
  }>;
}

export interface WebhookSubscription {
  subscriptionId: string;
  partnerName: string;
  targetUrl: string;
  subscribedEvents: string[];
  secretKeyHmac: string;
  deliverySuccessRatePct: number;
  activeStatus: boolean;
  retryAttempts: number;
  lastDeliveredAt: string;
}

export interface EnterpriseConnector {
  connectorId: string;
  nameEn: string;
  nameAr: string;
  category: 'ERP' | 'CRM' | 'CUSTOMS' | 'PAYMENTS' | 'CARRIERS' | 'WMS' | 'MESSAGING';
  provider: string; // SAP, Salesforce, ZATCA, Fasah, Adyen, Maersk, WhatsApp, Twilio
  protocol: 'REST' | 'SOAP' | 'EDI_X12' | 'GRAPHQL' | 'WEBHOOK' | 'AS2';
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';
  syncMode: 'REALTIME' | 'BATCH_5MIN' | 'HOURLY';
  totalTransactionsToday: number;
}

export interface ServiceMeshTelemetry {
  serviceId: string;
  serviceName: string;
  instanceCount: number;
  mTLSEnforced: boolean;
  canaryTrafficPct: number;
  avgLatencyMs: number;
  cpuUsagePct: number;
  memoryUsageMB: number;
  circuitBreakerTripped: boolean;
}

export interface DeveloperPortalMetrics {
  totalRegisteredDevs: number;
  activeApiKeys: number;
  totalRequestsToday: number;
  rateLimitExceededCount: number;
  topConsumedApis: Array<{ apiName: string; requests: number }>;
  openApiDocCount: number;
  asyncApiDocCount: number;
}
