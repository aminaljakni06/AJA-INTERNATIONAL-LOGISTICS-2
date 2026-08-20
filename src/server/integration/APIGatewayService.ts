import { EnterpriseAPIEndpoint, ServiceMeshTelemetry, DeveloperPortalMetrics } from './types';

export class APIGatewayService {
  private static readonly ENDPOINTS: EnterpriseAPIEndpoint[] = [
    {
      id: 'API-SHIP-01',
      nameEn: 'Shipment Tracking & Booking API',
      nameAr: 'واجهة تتبع وحجز الشحنات',
      path: '/api/v1/shipments/book',
      type: 'REST',
      method: 'POST',
      authMethod: 'OAUTH2',
      rateLimitPerMinute: 1200,
      avgLatencyMs: 24,
      successRatePct: 99.94,
      circuitBreaker: 'CLOSED',
      version: 'v1.4',
      tags: ['Shipment', 'Logistics', 'Public-Partner'],
      openApiSpecUrl: '/docs/openapi/shipments.json',
    },
    {
      id: 'API-FASAH-02',
      nameEn: 'Saudi Fasah Customs Integration API',
      nameAr: 'واجهة الربط الموحد لمنصة فسح الجمركية',
      path: '/api/v1/customs/fasah/declarations',
      type: 'REST',
      method: 'POST',
      authMethod: 'HMAC',
      rateLimitPerMinute: 300,
      avgLatencyMs: 85,
      successRatePct: 99.8,
      circuitBreaker: 'CLOSED',
      version: 'v2.0',
      tags: ['Customs', 'Fasah', 'Compliance'],
      openApiSpecUrl: '/docs/openapi/fasah.json',
    },
    {
      id: 'API-ZATCA-03',
      nameEn: 'ZATCA E-Invoicing Phase 2 Integration',
      nameAr: 'واجهة الربط المباشر مع هيئة الزكاة والضريبة (الفاتورة الإلكترونية)',
      path: '/api/v2/finance/zatca/clearance',
      type: 'REST',
      method: 'POST',
      authMethod: 'MTLS',
      rateLimitPerMinute: 600,
      avgLatencyMs: 42,
      successRatePct: 100.0,
      circuitBreaker: 'CLOSED',
      version: 'v2.1',
      tags: ['ZATCA', 'Finance', 'Tax'],
    },
    {
      id: 'API-[#0F4C75]-GQL',
      nameEn: 'Unified Enterprise GraphQL Federation',
      nameAr: 'مخطط GraphQL الموحد لكافة خدمات AJA',
      path: '/graphql',
      type: 'GRAPHQL',
      method: 'POST',
      authMethod: 'JWT',
      rateLimitPerMinute: 5000,
      avgLatencyMs: 18,
      successRatePct: 99.98,
      circuitBreaker: 'CLOSED',
      version: 'v3.0',
      tags: ['GraphQL', 'Federation', 'Core'],
    },
    {
      id: 'API-FLEET-ASYNC',
      nameEn: 'Fleet Telemetry AsyncAPI Stream',
      nameAr: 'بث بيانات أسطول الشاحنات بالربط غير المتزامن AsyncAPI',
      path: 'ws://stream.aja.sa/v1/fleet/gps',
      type: 'ASYNC_API',
      method: 'SUBSCRIBE',
      authMethod: 'API_KEY',
      rateLimitPerMinute: 10000,
      avgLatencyMs: 5,
      successRatePct: 99.99,
      circuitBreaker: 'CLOSED',
      version: 'v1.0',
      tags: ['Streaming', 'Fleet', 'IoT'],
    },
  ];

  public static getEndpoints(): EnterpriseAPIEndpoint[] {
    return this.ENDPOINTS;
  }

  public static testInvokeEndpoint(endpointId: string, _payload?: any) {
    const ep = this.ENDPOINTS.find((e) => e.id === endpointId) || this.ENDPOINTS[0];
    const simulatedLatency = ep.avgLatencyMs + Math.floor(Math.random() * 15) - 5;
    return {
      status: 200,
      message: `Successfully invoked gateway route: ${ep.path}`,
      endpointId: ep.id,
      path: ep.path,
      method: ep.method,
      authValidated: ep.authMethod,
      rateLimitRemaining: ep.rateLimitPerMinute - 1,
      latencyMs: simulatedLatency,
      circuitBreakerState: ep.circuitBreaker,
      timestamp: new Date().toISOString(),
      responsePayload: {
        success: true,
        traceId: `TRACE-GATEWAY-${Date.now()}`,
        data: {
          invokedPath: ep.path,
          processedByGateway: 'AJA-Envoy-API-Gateway-Node-01',
          mTLSSecure: true,
        },
      },
    };
  }

  public static getServiceMeshTelemetry(): ServiceMeshTelemetry[] {
    return [
      {
        serviceId: 'MESH-SHIPMENT-SVC',
        serviceName: 'shipment-execution-microservice',
        instanceCount: 6,
        mTLSEnforced: true,
        canaryTrafficPct: 10,
        avgLatencyMs: 14,
        cpuUsagePct: 28,
        memoryUsageMB: 512,
        circuitBreakerTripped: false,
      },
      {
        serviceId: 'MESH-WMS-SVC',
        serviceName: 'warehouse-execution-wes-microservice',
        instanceCount: 4,
        mTLSEnforced: true,
        canaryTrafficPct: 0,
        avgLatencyMs: 12,
        cpuUsagePct: 35,
        memoryUsageMB: 768,
        circuitBreakerTripped: false,
      },
      {
        serviceId: 'MESH-FIN-SVC',
        serviceName: 'finance-zatca-ledger-microservice',
        instanceCount: 5,
        mTLSEnforced: true,
        canaryTrafficPct: 0,
        avgLatencyMs: 22,
        cpuUsagePct: 42,
        memoryUsageMB: 1024,
        circuitBreakerTripped: false,
      },
      {
        serviceId: 'MESH-AI-SVC',
        serviceName: 'ai-optimization-agent-microservice',
        instanceCount: 8,
        mTLSEnforced: true,
        canaryTrafficPct: 20,
        avgLatencyMs: 45,
        cpuUsagePct: 65,
        memoryUsageMB: 2048,
        circuitBreakerTripped: false,
      },
    ];
  }

  public static getDeveloperPortalMetrics(): DeveloperPortalMetrics {
    return {
      totalRegisteredDevs: 148,
      activeApiKeys: 320,
      totalRequestsToday: 4892000,
      rateLimitExceededCount: 14,
      topConsumedApis: [
        { apiName: 'Shipment Tracking API', requests: 1840000 },
        { apiName: 'ZATCA Clearance API', requests: 890000 },
        { apiName: 'Customs Fasah API', requests: 420000 },
        { apiName: 'Fleet Telemetry Stream', requests: 1240000 },
      ],
      openApiDocCount: 18,
      asyncApiDocCount: 6,
    };
  }
}
