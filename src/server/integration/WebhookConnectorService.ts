import { WebhookSubscription, EnterpriseConnector } from './types';

export class WebhookConnectorService {
  private static readonly WEBHOOKS: WebhookSubscription[] = [
    {
      subscriptionId: 'WH-MAERSK-01',
      partnerName: 'MAERSK Ocean Logistics Partner',
      targetUrl: 'https://api.maersk.com/aja/webhooks/shipment-status',
      subscribedEvents: ['shipment.created', 'shipment.delivered', 'customs.cleared'],
      secretKeyHmac: 'hmac_sha256_sec_a89f921bc',
      deliverySuccessRatePct: 99.9,
      activeStatus: true,
      retryAttempts: 3,
      lastDeliveredAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    {
      subscriptionId: 'WH-ARAMEX-02',
      partnerName: 'Aramex Last-Mile Gateway',
      targetUrl: 'https://ws.aramex.net/api/aja/shipment-events',
      subscribedEvents: ['lastmile.out_for_delivery', 'lastmile.delivered'],
      secretKeyHmac: 'hmac_sha256_sec_77b310e9',
      deliverySuccessRatePct: 99.4,
      activeStatus: true,
      retryAttempts: 5,
      lastDeliveredAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      subscriptionId: 'WH-SAP-ERP-03',
      partnerName: 'SAP S/4HANA Cloud ERP Integration',
      targetUrl: 'https://sap-erp.aja.internal/api/webhooks/journal-entry',
      subscribedEvents: ['finance.invoice_settled', 'inventory.stock_reconciled'],
      secretKeyHmac: 'hmac_sha256_sec_9941a88b',
      deliverySuccessRatePct: 100.0,
      activeStatus: true,
      retryAttempts: 3,
      lastDeliveredAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    },
  ];

  private static readonly CONNECTORS: EnterpriseConnector[] = [
    {
      connectorId: 'CONN-SAP-ERP',
      nameEn: 'SAP S/4HANA Enterprise ERP Connector',
      nameAr: 'موصل نظام SAP S/4HANA المالي والإداري',
      category: 'ERP',
      provider: 'SAP',
      protocol: 'REST',
      healthStatus: 'HEALTHY',
      syncMode: 'REALTIME',
      totalTransactionsToday: 142000,
    },
    {
      connectorId: 'CONN-FASAH-CUSTOMS',
      nameEn: 'Saudi Fasah Customs B2B SOAP Connector',
      nameAr: 'موصل B2B لمنصة فسح الجمركية السعودية',
      category: 'CUSTOMS',
      provider: 'Fasah Saudi Arabia',
      protocol: 'SOAP',
      healthStatus: 'HEALTHY',
      syncMode: 'REALTIME',
      totalTransactionsToday: 18400,
    },
    {
      connectorId: 'CONN-ZATCA-TAX',
      nameEn: 'ZATCA Phase 2 E-Invoicing mTLS Connector',
      nameAr: 'موصل هيئة الزكاة والضريبة والجمارك (الفاتورة الإلكترونية)',
      category: 'PAYMENTS',
      provider: 'ZATCA KSA',
      protocol: 'REST',
      healthStatus: 'HEALTHY',
      syncMode: 'REALTIME',
      totalTransactionsToday: 89000,
    },
    {
      connectorId: 'CONN-ADYEN-PAY',
      nameEn: 'Adyen Global Payment Gateway Connector',
      nameAr: 'موصل بوابات المدفوعات العالمية Adyen',
      category: 'PAYMENTS',
      provider: 'Adyen N.V.',
      protocol: 'REST',
      healthStatus: 'HEALTHY',
      syncMode: 'REALTIME',
      totalTransactionsToday: 42000,
    },
    {
      connectorId: 'CONN-WHATSAPP-BIZ',
      nameEn: 'WhatsApp Business API Notification Connector',
      nameAr: 'موصل إشعارات الواتساب للأعمال B2B/B2C',
      category: 'MESSAGING',
      provider: 'Meta Business Cloud API',
      protocol: 'REST',
      healthStatus: 'HEALTHY',
      syncMode: 'REALTIME',
      totalTransactionsToday: 68000,
    },
  ];

  public static getWebhooks(): WebhookSubscription[] {
    return this.WEBHOOKS;
  }

  public static getConnectors(): EnterpriseConnector[] {
    return this.CONNECTORS;
  }
}
