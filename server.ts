import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './src/server/routes/authRoutes';
import quoteRoutes from './src/server/routes/quoteRoutes';
import shipmentRoutes from './src/server/routes/shipmentRoutes';
import serviceRoutes from './src/server/routes/serviceRoutes';
import auditRoutes from './src/server/routes/auditRoutes';
import customerRoutes from './src/server/routes/customerRoutes';
import adminRoutes from './src/server/routes/adminRoutes';
import documentRoutes from './src/server/routes/documentRoutes';
import aiAssistantRoutes from './src/server/routes/aiAssistantRoutes';
import adyenRoutes from './src/server/routes/adyenRoutes';
import organizationRoutes from './src/server/routes/organizationRoutes';
import eventRoutes from './src/server/routes/eventRoutes';
import workflowRoutes from './src/server/routes/workflowRoutes';
import configRoutes from './src/server/routes/configRoutes';
import identityRoutes from './src/server/routes/identityRoutes';
import ssoRoutes from './src/server/routes/ssoRoutes';
import governanceRoutes from './src/server/routes/governanceRoutes';
import corporateGovernanceRoutes from './src/server/routes/corporateGovernanceRoutes';
import corporateRecordsRoutes from './src/server/routes/corporateRecordsRoutes';
import regulatoryIntelligenceRoutes from './src/server/routes/regulatoryIntelligenceRoutes';
import regulatoryCaseRoutes from './src/server/routes/regulatoryCaseRoutes';
import complianceCertificationRoutes from './src/server/routes/complianceCertificationRoutes';
import corporateAuthorityRoutes from './src/server/routes/corporateAuthorityRoutes';
import mdmRoutes from './src/server/routes/mdmRoutes';
import businessPartnerRoutes from './src/server/routes/businessPartnerRoutes';
import locationMasterRoutes from './src/server/routes/locationMasterRoutes';
import productResourceRoutes from './src/server/routes/productResourceRoutes';
import customer360Routes from './src/server/routes/customer360Routes';
import salesRoutes from './src/server/routes/salesRoutes';
import omnichannelRoutes from './src/server/routes/omnichannelRoutes';
import contractRoutes from './src/server/routes/contractRoutes';
import customerServiceRoutes from './src/server/routes/customerServiceRoutes';
import transportationRoutes from './src/server/routes/transportationRoutes';
import fleetRoutes from './src/server/routes/fleetRoutes';
import carrier3plRoutes from './src/server/routes/carrier3plRoutes';
import controlTowerRoutes from './src/server/routes/controlTowerRoutes';
import freightFinanceRoutes from './src/server/routes/freightFinanceRoutes';
import generalLedgerRoutes from './src/server/routes/generalLedgerRoutes';
import accountsReceivableRoutes from './src/server/routes/accountsReceivableRoutes';
import treasuryRoutes from './src/server/routes/treasuryRoutes';
import fpaRoutes from './src/server/routes/fpaRoutes';
import fixedAssetsReportingRoutes from './src/server/routes/fixedAssetsReportingRoutes';
import warehouseRoutes from './src/server/routes/warehouseRoutes';
import inboundWarehouseRoutes from './src/server/routes/inboundWarehouseRoutes';
import inventoryControlRoutes from './src/server/routes/inventoryControlRoutes';
import outboundLogisticsRoutes from './src/server/routes/outboundLogisticsRoutes';
import smartWarehouseRoutes from './src/server/routes/smartWarehouseRoutes';
import procurementRoutes from './src/server/routes/procurementRoutes';
import warehouseExecutionRoutes from './src/server/routes/warehouseExecutionRoutes';
import inventoryOperationsRoutes from './src/server/routes/inventoryOperationsRoutes';
import aiPlatformRoutes from './src/server/routes/aiPlatformRoutes';
import dataPlatformRoutes from './src/server/routes/dataPlatformRoutes';
import integrationRoutes from './src/server/routes/integrationRoutes';
import securityPlatformRoutes from './src/server/routes/securityPlatformRoutes';
import platformRoutes from './src/server/routes/platformRoutes';
import commandRoutes from './src/server/routes/commandRoutes';
import readinessRoutes from './src/server/routes/readinessRoutes';
import dataViewRoutes from './src/server/routes/dataViewRoutes';
import bulkRoutes from './src/server/routes/bulkRoutes';
import dataExchangeRoutes from './src/server/routes/dataExchangeRoutes';
import analyticsRoutes from './src/server/routes/analyticsRoutes';
import { reportRouter } from './src/server/routes/reportRoutes';
import { notificationRoutes } from './src/server/routes/notificationRoutes';
import { seedFirebaseDatabase } from './src/db/seedFirebase';
import { securityHeadersMiddleware, inputSanitizerMiddleware, createRateLimiter } from './src/server/middleware/securityMiddleware';
import { enterpriseApiResponseMiddleware } from './src/server/middleware/apiResponseMiddleware';
import { expressErrorMiddleware, expressNotFoundMiddleware } from './src/server/middleware/expressErrorMiddleware';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Security Headers, Enterprise API Response Standard & Input Sanitization Middleware
  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(inputSanitizerMiddleware);
  app.use(enterpriseApiResponseMiddleware);

  // Rate Limiting for Public & Sensitive Routes
  const globalApiLimiter = createRateLimiter(15 * 60 * 1000, 300); // 300 requests per 15 min
  const authLimiter = createRateLimiter(15 * 60 * 1000, 20, 'تم تجاوز عدد محاولات تسجيل الدخول/إعادة التعيين. يرجى الانتظار 15 دقيقة.');
  const aiLimiter = createRateLimiter(5 * 60 * 1000, 30, 'تم تجاوز حد محادثات الذكاء الاصطناعي المسموح بها مؤقتاً.');

  app.use('/api/', globalApiLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/ai/chat', aiLimiter);

  // Seed Firebase Firestore in the background so offline Firebase never blocks local startup.
  if (process.env.SKIP_FIREBASE_SEED === 'true') {
    console.log('[Firebase Seed] Skipped via SKIP_FIREBASE_SEED=true');
  } else {
    void seedFirebaseDatabase()
      .then(seedRes => {
        console.log('[Firebase Seed]', seedRes);
      })
      .catch(err => {
        console.error('[Firebase Seed Error]', err);
      });
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', name: 'Aja Logistics API', timestamp: new Date().toISOString() });
  });

  // Core API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/quotes', quoteRoutes);
  app.use('/api/shipments', shipmentRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/customer', customerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/ai', aiAssistantRoutes);
  app.use('/api/payments/adyen', adyenRoutes);
  app.use('/api/organization', organizationRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/workflow', workflowRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/identity', identityRoutes);
  app.use('/api/sso', ssoRoutes);
  app.use('/api/governance', governanceRoutes);
  app.use('/api/corporate-governance', corporateGovernanceRoutes);
  app.use('/api/corporate-records', corporateRecordsRoutes);
  app.use('/api/governance/regulatory', regulatoryIntelligenceRoutes);
  app.use('/api/governance/regulatory-cases', regulatoryCaseRoutes);
  app.use('/api/governance/compliance-certifications', complianceCertificationRoutes);
  app.use('/api/governance/authority', corporateAuthorityRoutes);
  app.use('/api/mdm', mdmRoutes);
  app.use('/api/business-partners', businessPartnerRoutes);
  app.use('/api/locations', locationMasterRoutes);
  app.use('/api/product-resources', productResourceRoutes);
  app.use('/api/crm/customer-360', customer360Routes);
  app.use('/api/crm/sales', salesRoutes);
  app.use('/api/crm/omnichannel', omnichannelRoutes);
  app.use('/api/crm/contracts', contractRoutes);
  app.use('/api/crm/service', customerServiceRoutes);
  app.use('/api/tms', transportationRoutes);
  app.use('/api/fleet', fleetRoutes);
  app.use('/api/carrier3pl', carrier3plRoutes);
  app.use('/api/control-tower', controlTowerRoutes);
  app.use('/api/freight-finance', freightFinanceRoutes);
  app.use('/api/general-ledger', generalLedgerRoutes);
  app.use('/api/accounts-receivable', accountsReceivableRoutes);
  app.use('/api/treasury', treasuryRoutes);
  app.use('/api/fpa', fpaRoutes);
  app.use('/api/fixed-assets-reporting', fixedAssetsReportingRoutes);
  app.use('/api/warehouse', warehouseRoutes);
  app.use('/api/inbound-warehouse', inboundWarehouseRoutes);
  app.use('/api/inventory-control', inventoryControlRoutes);
  app.use('/api/outbound-logistics', outboundLogisticsRoutes);
  app.use('/api/smart-warehouse', smartWarehouseRoutes);
  app.use('/api/procurement', procurementRoutes);
  app.use('/api/wes', warehouseExecutionRoutes);
  app.use('/api/inventory-ops', inventoryOperationsRoutes);
  app.use('/api/ai/platform', aiPlatformRoutes);
  app.use('/api/data-platform', dataPlatformRoutes);
  app.use('/api/integration', integrationRoutes);
  app.use('/api/security', securityPlatformRoutes);
  app.use('/api/platform', platformRoutes);
  app.use('/api/command', commandRoutes);
  app.use('/api/readiness', readinessRoutes);
  app.use('/api/data-views', dataViewRoutes);
  app.use('/api/bulk-operations', bulkRoutes);
  app.use('/api/data-exchange', dataExchangeRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/reports', reportRouter);
  app.use('/api/notifications', notificationRoutes);

  // Unhandled API route fallback
  app.use('/api/*', expressNotFoundMiddleware);

  // Global Centralized Express Error Handler
  app.use(expressErrorMiddleware);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aja Logistics] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
