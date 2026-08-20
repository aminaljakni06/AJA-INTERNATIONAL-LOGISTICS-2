import { EventBusTopic, SagaWorkflowInstance } from './types';

export class EventBusBrokerService {
  private static readonly TOPICS: EventBusTopic[] = [
    {
      topicId: 'TOPIC-SHIPMENT-EVENTS',
      topicName: 'aja.logistics.shipment.lifecycle',
      category: 'SHIPMENT',
      messagesPerSecond: 184,
      totalMessagesToday: 5890200,
      deadLetterCount: 0,
      partitionCount: 12,
      retentionHours: 168,
      brokerType: 'KAFKA',
      subscribersCount: 18,
    },
    {
      topicId: 'TOPIC-PAYMENT-EVENTS',
      topicName: 'aja.finance.adyen.payment.settlement',
      category: 'PAYMENT',
      messagesPerSecond: 42,
      totalMessagesToday: 1240000,
      deadLetterCount: 2,
      partitionCount: 6,
      retentionHours: 720,
      brokerType: 'KAFKA',
      subscribersCount: 12,
    },
    {
      topicId: 'TOPIC-CUSTOMS-EVENTS',
      topicName: 'aja.customs.fasah.status.stream',
      category: 'CUSTOMS',
      messagesPerSecond: 18,
      totalMessagesToday: 480000,
      deadLetterCount: 0,
      partitionCount: 4,
      retentionHours: 168,
      brokerType: 'RABBITMQ',
      subscribersCount: 8,
    },
    {
      topicId: 'TOPIC-FLEET-TELEMETRY',
      topicName: 'aja.fleet.iot.telemetry.gps',
      category: 'FLEET',
      messagesPerSecond: 920,
      totalMessagesToday: 28900000,
      deadLetterCount: 0,
      partitionCount: 24,
      retentionHours: 72,
      brokerType: 'KAFKA',
      subscribersCount: 14,
    },
    {
      topicId: 'TOPIC-AI-RECOMMENDATIONS',
      topicName: 'aja.ai.decision.dispatch.stream',
      category: 'AI',
      messagesPerSecond: 65,
      totalMessagesToday: 1890000,
      deadLetterCount: 0,
      partitionCount: 8,
      retentionHours: 168,
      brokerType: 'KAFKA',
      subscribersCount: 10,
    },
  ];

  private static readonly SAGA_INSTANCES: SagaWorkflowInstance[] = [
    {
      sagaId: 'SAGA-ORD-88201',
      workflowName: 'Order-to-Cash & Automatic Dispatch Saga',
      triggerEvent: 'ShipmentBookingCreatedEvent',
      currentStep: 'ZatcaInvoiceGeneration',
      totalSteps: 5,
      status: 'IN_PROGRESS',
      startedAt: new Date(Date.now() - 1000 * 45).toISOString(),
      stepsDetail: [
        { stepName: 'CreditCheckAndHold', service: 'FinanceService', status: 'SUCCESS', durationMs: 45 },
        { stepName: 'FasahCustomsDeclaration', service: 'CustomsService', status: 'SUCCESS', durationMs: 180 },
        { stepName: 'WarehousePalletAllocation', service: 'WESService', status: 'SUCCESS', durationMs: 90 },
        { stepName: 'ZatcaInvoiceGeneration', service: 'BillingService', status: 'PENDING', durationMs: 0 },
        { stepName: 'CarrierAssignmentNotify', service: 'FleetService', status: 'PENDING', durationMs: 0 },
      ],
    },
    {
      sagaId: 'SAGA-ORD-88198',
      workflowName: 'Cross-Border Customs & Port Release Saga',
      triggerEvent: 'VesselDockedJeddahPortEvent',
      currentStep: 'Completed',
      totalSteps: 4,
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      stepsDetail: [
        { stepName: 'ManifestIngestion', service: 'OceanCarrierService', status: 'SUCCESS', durationMs: 65 },
        { stepName: 'FasahClearanceAutoSubmission', service: 'CustomsService', status: 'SUCCESS', durationMs: 240 },
        { stepName: 'DutyFeeSettlement', service: 'TreasuryService', status: 'SUCCESS', durationMs: 110 },
        { stepName: 'GatePassIssuance', service: 'PortAuthorityService', status: 'SUCCESS', durationMs: 85 },
      ],
    },
  ];

  public static getTopics(): EventBusTopic[] {
    return this.TOPICS;
  }

  public static getSagaInstances(): SagaWorkflowInstance[] {
    return this.SAGA_INSTANCES;
  }

  public static publishEvent(topicName: string, eventType: string, eventPayload: any) {
    const topic = this.TOPICS.find((t) => t.topicName === topicName) || this.TOPICS[0];
    topic.totalMessagesToday += 1;

    return {
      success: true,
      publishedMessageId: `MSG-KAFKA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topicName: topic.topicName,
      eventType,
      partitionAssigned: Math.floor(Math.random() * topic.partitionCount),
      offset: Math.floor(Math.random() * 500000) + 100000,
      publishedAt: new Date().toISOString(),
      payloadAck: eventPayload,
    };
  }
}
