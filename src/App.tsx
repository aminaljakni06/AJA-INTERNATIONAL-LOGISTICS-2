import React, { useState, lazy, Suspense, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { EventBusProvider } from './context/EventBusContext';
import { WorkflowProvider } from './context/WorkflowContext';
import { AuditProvider } from './context/AuditContext';
import { ConfigProvider } from './context/ConfigContext';
import { IdentityProvider } from './context/IdentityContext';
import { ThemeProvider } from './context/ThemeContext';
import { EnterpriseDialogProvider } from './components/dialog';
import { EnterpriseDrawerProvider } from './components/drawer';
import { EnterpriseFeedbackProvider } from './components/feedback';
import { PublicLayout } from './components/layout/PublicLayout';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Loader2, Ship } from 'lucide-react';

// Lazy-Loaded Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage').then(m => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage').then(m => ({ default: m.ServicesPage })));
const TrackingPage = lazy(() => import('./pages/public/TrackingPage').then(m => ({ default: m.TrackingPage })));
const QuoteRequestPage = lazy(() => import('./pages/public/QuoteRequestPage').then(m => ({ default: m.QuoteRequestPage })));
const ContactPage = lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import('./pages/public/AboutPage').then(m => ({ default: m.AboutPage })));
const FAQPage = lazy(() => import('./pages/public/FAQPage').then(m => ({ default: m.FAQPage })));
const DownloadAppPage = lazy(() => import('./pages/public/DownloadAppPage').then(m => ({ default: m.DownloadAppPage })));
const LegalPages = lazy(() => import('./pages/public/LegalPages').then(m => ({ default: m.LegalPages })));
const IndustriesPage = lazy(() => import('./pages/public/IndustriesPage').then(m => ({ default: m.IndustriesPage })));
const GlobalNetworkPage = lazy(() => import('./pages/public/GlobalNetworkPage').then(m => ({ default: m.GlobalNetworkPage })));

// Lazy-Loaded Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

// Lazy-Loaded Customer Pages
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const CustomerShipments = lazy(() => import('./pages/customer/CustomerShipments').then(m => ({ default: m.CustomerShipments })));
const CustomerQuotes = lazy(() => import('./pages/customer/CustomerQuotes').then(m => ({ default: m.CustomerQuotes })));
const CustomerDocuments = lazy(() => import('./pages/customer/CustomerDocuments').then(m => ({ default: m.CustomerDocuments })));
const CustomerAIAssistant = lazy(() => import('./pages/customer/CustomerAIAssistant').then(m => ({ default: m.CustomerAIAssistant })));
const CustomerNotifications = lazy(() => import('./pages/customer/CustomerNotifications').then(m => ({ default: m.CustomerNotifications })));
const CustomerMessages = lazy(() => import('./pages/customer/CustomerMessages').then(m => ({ default: m.CustomerMessages })));
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile').then(m => ({ default: m.CustomerProfile })));
const CustomerAnalytics = lazy(() => import('./pages/customer/CustomerAnalytics').then(m => ({ default: m.CustomerAnalytics })));
const CustomerCalendar = lazy(() => import('./pages/customer/CustomerCalendar').then(m => ({ default: m.CustomerCalendar })));

// Lazy-Loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const EnterpriseReadinessPanel = lazy(() => import('./components/readiness/EnterpriseReadinessPanel').then(m => ({ default: m.EnterpriseReadinessPanel })));
const EnterpriseCommandControlPanel = lazy(() => import('./components/command/EnterpriseCommandControlPanel').then(m => ({ default: m.EnterpriseCommandControlPanel })));
const EnterpriseCloudPlatformPanel = lazy(() => import('./components/platform/EnterpriseCloudPlatformPanel').then(m => ({ default: m.EnterpriseCloudPlatformPanel })));
const EnterpriseSecurityPanel = lazy(() => import('./components/security/EnterpriseSecurityPanel').then(m => ({ default: m.EnterpriseSecurityPanel })));
const EnterpriseIntegrationPanel = lazy(() => import('./components/integration/EnterpriseIntegrationPanel').then(m => ({ default: m.EnterpriseIntegrationPanel })));
const EnterpriseDataPlatformPanel = lazy(() => import('./components/dataPlatform/EnterpriseDataPlatformPanel').then(m => ({ default: m.EnterpriseDataPlatformPanel })));
const EnterpriseAIPanel = lazy(() => import('./components/ai/EnterpriseAIPanel').then(m => ({ default: m.EnterpriseAIPanel })));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const SalesPlatformMainView = lazy(() => import('./components/sales/SalesPlatformMainView').then(m => ({ default: m.SalesPlatformMainView })));
const ContractPlatformMainView = lazy(() => import('./components/contracts/ContractPlatformMainView').then(m => ({ default: m.ContractPlatformMainView })));
const CustomerServiceHub = lazy(() => import('./components/customerService/CustomerServiceHub').then(m => ({ default: m.CustomerServiceHub })));
const OmnichannelHub = lazy(() => import('./components/omnichannel/OmnichannelHub').then(m => ({ default: m.OmnichannelHub })));
const AdminQuotes = lazy(() => import('./pages/admin/AdminQuotes').then(m => ({ default: m.AdminQuotes })));
const AdminShipments = lazy(() => import('./pages/admin/AdminShipments').then(m => ({ default: m.AdminShipments })));
const TransportationCoreMainView = lazy(() => import('./components/transportation/TransportationCoreMainView').then(m => ({ default: m.TransportationCoreMainView })));
const WarehouseCoreMainView = lazy(() => import('./components/warehouse/WarehouseCoreMainView').then(m => ({ default: m.WarehouseCoreMainView })));
const FreightFinanceMainView = lazy(() => import('./components/freightFinance/FreightFinanceMainView').then(m => ({ default: m.FreightFinanceMainView })));
const ControlTowerMainView = lazy(() => import('./components/controlTower/ControlTowerMainView').then(m => ({ default: m.ControlTowerMainView })));
const FleetCoreMainView = lazy(() => import('./components/fleet/FleetCoreMainView').then(m => ({ default: m.FleetCoreMainView })));
const Carrier3PLMainView = lazy(() => import('./components/carrier3pl/Carrier3PLMainView').then(m => ({ default: m.Carrier3PLMainView })));
const ProcurementMainView = lazy(() => import('./components/procurement/ProcurementMainView').then(m => ({ default: m.ProcurementMainView })));
const GeneralLedgerFinanceMainView = lazy(() => import('./components/finance/GeneralLedgerFinanceMainView').then(m => ({ default: m.GeneralLedgerFinanceMainView })));
const AdminServices = lazy(() => import('./pages/admin/AdminServices').then(m => ({ default: m.AdminServices })));
const AdminLocations = lazy(() => import('./pages/admin/AdminLocations').then(m => ({ default: m.AdminLocations })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications').then(m => ({ default: m.AdminNotifications })));
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages').then(m => ({ default: m.AdminMessages })));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS').then(m => ({ default: m.AdminCMS })));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs').then(m => ({ default: m.AdminAuditLogs })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminConfigCenter = lazy(() => import('./pages/admin/AdminConfigCenter').then(m => ({ default: m.AdminConfigCenter })));
const AdminIdentityManagement = lazy(() => import('./pages/admin/AdminIdentityManagement').then(m => ({ default: m.AdminIdentityManagement })));
const AdminMasterDataManagement = lazy(() => import('./pages/admin/AdminMasterDataManagement').then(m => ({ default: m.AdminMasterDataManagement })));

// Lazy-Loaded Adyen Payment Components
const PaymentAnalytics = lazy(() => import('./components/payment/PaymentAnalytics').then(m => ({ default: m.PaymentAnalytics })));
const PaymentPortal = lazy(() => import('./components/payment/PaymentPortal').then(m => ({ default: m.PaymentPortal })));
const RecurringBillingManager = lazy(() => import('./components/payment/RecurringBillingManager').then(m => ({ default: m.RecurringBillingManager })));
const RefundRequest = lazy(() => import('./components/payment/RefundRequest').then(m => ({ default: m.RefundRequest })));
const EmailReceiptPreview = lazy(() => import('./components/payment/EmailReceiptPreview').then(m => ({ default: m.EmailReceiptPreview })));

// Premium Brand Loading Fallback
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4 py-16 text-[#082F49]">
    <div className="relative flex items-center justify-center w-16 h-16">
      <div className="absolute inset-0 rounded-2xl bg-[#0F4C75]/20 animate-ping" />
      <div className="relative w-14 h-14 rounded-2xl bg-[#082F49] border border-[#0F4C75] flex items-center justify-center text-white shadow-xl">
        <Ship className="w-7 h-7 animate-pulse text-[#EA580C]" />
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 tracking-wider uppercase">
      <Loader2 className="w-4 h-4 animate-spin text-[#0F4C75]" />
      <span>Loading Module...</span>
    </div>
  </div>
);

const normalizePath = (pathname: string) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
};

const pathToTab = (pathname: string) => {
  const path = normalizePath(pathname);

  const routes: Record<string, string> = {
    '/': 'home',
    '/about': 'about',
    '/services': 'services',
    '/industries': 'industries',
    '/network': 'global-network',
    '/global-network': 'global-network',
    '/tracking': 'tracking',
    '/track': 'tracking',
    '/quote': 'quote-request',
    '/quote-request': 'quote-request',
    '/faq': 'faq',
    '/contact': 'contact',
    '/privacy': 'privacy',
    '/terms': 'terms',
    '/cookies': 'cookies',
    '/download-app': 'download-app',
    '/login': 'login',
    '/admin/login': 'admin-login',
    '/register': 'register',
    '/portal': 'customer-dashboard',
    '/customer': 'customer-dashboard',
    '/admin': 'admin-dashboard',
  };

  if (routes[path]) return routes[path];
  if (path.startsWith('/services/')) return `service-${path.split('/').pop()}`;
  if (path.startsWith('/customer/')) return `customer-${path.split('/').pop() || 'dashboard'}`;
  if (path.startsWith('/portal/')) return `customer-${path.split('/').pop() || 'dashboard'}`;
  if (path.startsWith('/admin/')) return `admin-${path.split('/').pop() || 'dashboard'}`;

  return 'home';
};

const tabToPath = (tab: string) => {
  const routes: Record<string, string> = {
    home: '/',
    about: '/about',
    services: '/services',
    industries: '/industries',
    'global-network': '/global-network',
    tracking: '/tracking',
    'track-shipment': '/tracking',
    'quote-request': '/quote',
    faq: '/faq',
    contact: '/contact',
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
    'download-app': '/download-app',
    login: '/login',
    'admin-login': '/admin/login',
    register: '/register',
    portal: '/portal',
    admin: '/admin',
    'customer-dashboard': '/portal',
    'admin-dashboard': '/admin',
  };

  if (routes[tab]) return routes[tab];
  if (tab.startsWith('service-')) return `/services/${tab.replace('service-', '')}`;
  if (tab.startsWith('customer-')) return `/portal/${tab.replace('customer-', '')}`;
  if (tab.startsWith('admin-')) return `/admin/${tab.replace('admin-', '')}`;

  return '/';
};

function MainRouter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => pathToTab(window.location.pathname));
  const [trackingSearchNum, setTrackingSearchNum] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(pathToTab(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToTab = (tab: string) => {
    const nextPath = tabToPath(tab);
    if (normalizePath(window.location.pathname) !== normalizePath(nextPath)) {
      window.history.pushState(null, '', nextPath);
    }
    setActiveTab(tab);
  };

  const handleTrackShipment = (num: string) => {
    setTrackingSearchNum(num);
    if (user && user.role === 'CUSTOMER') {
      navigateToTab('customer-track');
    } else {
      navigateToTab('tracking');
    }
  };

  // Handle /portal and /admin aliases
  const currentTab =
    activeTab === 'portal'
      ? 'customer-dashboard'
      : activeTab === 'admin'
      ? 'admin-dashboard'
      : activeTab;

  // Render Customer Portal Views (Protected for CUSTOMER, STAFF, ADMIN)
  if (currentTab.startsWith('customer-')) {
    return (
      <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']} onNavigate={navigateToTab}>
        <CustomerLayout activeTab={currentTab} setActiveTab={navigateToTab}>
          <Suspense fallback={<PageLoader />}>
            {currentTab === 'customer-dashboard' && <CustomerDashboard onNavigate={navigateToTab} />}
            {currentTab === 'customer-ai' && <CustomerAIAssistant />}
            {currentTab === 'customer-shipments' && <CustomerShipments onTrack={handleTrackShipment} />}
            {currentTab === 'customer-track' && <TrackingPage initialTrackingNum={trackingSearchNum} />}
            {currentTab === 'customer-quotes' && <CustomerQuotes onNewQuote={() => navigateToTab('quote-request')} />}
            {currentTab === 'customer-payments' && (
              <div className="space-y-8">
                <PaymentPortal
                  amount={12500}
                  currency="SAR"
                  referenceNumber={`INV-${Date.now().toString().slice(-6)}`}
                  description="Logistics Freight & Customs Clearance Invoice"
                  entityType="INVOICE"
                  onViewShipment={() => navigateToTab('customer-shipments')}
                  onGoToDashboard={() => navigateToTab('customer-dashboard')}
                />
                <RecurringBillingManager />
                <RefundRequest />
                <EmailReceiptPreview />
              </div>
            )}
            {currentTab === 'customer-documents' && <CustomerDocuments />}
            {currentTab === 'customer-analytics' && <CustomerAnalytics />}
            {currentTab === 'customer-calendar' && <CustomerCalendar />}
            {currentTab === 'customer-notifications' && <CustomerNotifications onNavigate={navigateToTab} />}
            {currentTab === 'customer-messages' && <CustomerMessages onNavigate={navigateToTab} />}
            {currentTab === 'customer-profile' && <CustomerProfile />}
          </Suspense>
        </CustomerLayout>
      </ProtectedRoute>
    );
  }

  // Render Admin Operations Dashboard Views (Protected for STAFF, ADMIN)
  if (currentTab.startsWith('admin-') && currentTab !== 'admin-login') {
    const isAuditOrUsers = currentTab === 'admin-audit' || currentTab === 'admin-users';
    const allowedRoles = isAuditOrUsers ? (['ADMIN'] as const) : (['STAFF', 'ADMIN'] as const);

    return (
      <ProtectedRoute allowedRoles={allowedRoles as any} onNavigate={navigateToTab}>
        <AdminLayout activeTab={currentTab} setActiveTab={navigateToTab}>
          <Suspense fallback={<PageLoader />}>
            {currentTab === 'admin-dashboard' && <AdminDashboard onNavigate={navigateToTab} />}
            {currentTab === 'admin-readiness' && <EnterpriseReadinessPanel />}
            {currentTab === 'admin-command' && <EnterpriseCommandControlPanel />}
            {currentTab === 'admin-platform' && <EnterpriseCloudPlatformPanel />}
            {currentTab === 'admin-security' && <EnterpriseSecurityPanel />}
            {currentTab === 'admin-integration' && <EnterpriseIntegrationPanel />}
            {currentTab === 'admin-data-platform' && <EnterpriseDataPlatformPanel />}
            {currentTab === 'admin-ai-platform' && <EnterpriseAIPanel />}
            {currentTab === 'admin-payments' && (
              <div className="space-y-8">
                <PaymentAnalytics />
                <RecurringBillingManager />
                <RefundRequest />
                <EmailReceiptPreview />
              </div>
            )}
            {currentTab === 'admin-quotes' && <AdminQuotes />}
            {currentTab === 'admin-shipments' && <AdminShipments />}
            {currentTab === 'admin-tms' && <TransportationCoreMainView />}
            {currentTab === 'admin-warehouse' && <WarehouseCoreMainView />}
            {currentTab === 'admin-freightfinance' && <FreightFinanceMainView />}
            {currentTab === 'admin-generalledger' && <GeneralLedgerFinanceMainView />}
            {currentTab === 'admin-controltower' && <ControlTowerMainView />}
            {currentTab === 'admin-fleet' && <FleetCoreMainView />}
            {currentTab === 'admin-carrier3pl' && <Carrier3PLMainView />}
            {currentTab === 'admin-procurement' && <ProcurementMainView />}
            {currentTab === 'admin-customers' && <AdminCustomers onNavigate={navigateToTab} />}
            {currentTab === 'admin-sales' && <SalesPlatformMainView />}
            {currentTab === 'admin-contracts' && <ContractPlatformMainView />}
            {currentTab === 'admin-customer-service' && <CustomerServiceHub />}
            {currentTab === 'admin-omnichannel' && <OmnichannelHub />}
            {currentTab === 'admin-services' && <AdminServices />}
            {currentTab === 'admin-locations' && <AdminLocations />}
            {currentTab === 'admin-settings' && <AdminSettings onNavigate={navigateToTab} />}
            {currentTab === 'admin-notifications' && <AdminNotifications />}
            {currentTab === 'admin-messages' && <AdminMessages />}
            {currentTab === 'admin-cms' && <AdminCMS />}
            {currentTab === 'admin-audit' && <AdminAuditLogs />}
            {currentTab === 'admin-users' && <AdminUsers />}
            {currentTab === 'admin-config' && <AdminConfigCenter />}
            {currentTab === 'admin-identity' && <AdminIdentityManagement />}
            {currentTab === 'admin-mdm' && <AdminMasterDataManagement activeTab={currentTab} setActiveTab={navigateToTab} />}
          </Suspense>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // Render Public & Auth Views
  return (
    <PublicLayout activeTab={activeTab} setActiveTab={navigateToTab}>
      <Suspense fallback={<PageLoader />}>
        {activeTab === 'home' && <HomePage onNavigate={navigateToTab} onTrackShipment={handleTrackShipment} />}
        {activeTab === 'about' && <AboutPage onNavigate={navigateToTab} />}
        {activeTab === 'services' && <ServicesPage onNavigate={navigateToTab} initialFilter="all" />}
        {activeTab === 'air-freight' && <ServicesPage onNavigate={navigateToTab} slug="air-freight" />}
        {activeTab === 'sea-freight' && <ServicesPage onNavigate={navigateToTab} slug="sea-freight" />}
        {activeTab === 'land-transport' && <ServicesPage onNavigate={navigateToTab} slug="land-transport" />}
        {activeTab === 'land-freight' && <ServicesPage onNavigate={navigateToTab} slug="land-transport" />}
        {activeTab === 'container-management' && <ServicesPage onNavigate={navigateToTab} slug="container-management" />}
        {activeTab === 'customs' && <ServicesPage onNavigate={navigateToTab} slug="container-management" />}
        {activeTab === 'warehousing' && <ServicesPage onNavigate={navigateToTab} slug="warehousing" />}
        {activeTab === 'distribution' && <ServicesPage onNavigate={navigateToTab} slug="distribution" />}
        {activeTab === 'supply-chain-visibility' && <ServicesPage onNavigate={navigateToTab} slug="supply-chain-visibility" />}
        {activeTab.startsWith('service-') && <ServicesPage onNavigate={navigateToTab} slug={activeTab.replace('service-', '')} />}
        {activeTab === 'industries' && <IndustriesPage onNavigate={navigateToTab} />}
        {activeTab === 'global-network' && <GlobalNetworkPage onNavigate={navigateToTab} />}
        {(activeTab === 'tracking' || activeTab === 'track-shipment') && <TrackingPage initialTrackingNum={trackingSearchNum} />}
        {activeTab === 'quote-request' && <QuoteRequestPage onNavigate={navigateToTab} />}
        {activeTab === 'faq' && <FAQPage onNavigate={navigateToTab} />}
        {activeTab === 'contact' && <ContactPage />}
        {activeTab === 'privacy' && <LegalPages type="privacy" />}
        {activeTab === 'terms' && <LegalPages type="terms" />}
        {activeTab === 'cookies' && <LegalPages type="cookies" />}
        {activeTab === 'download-app' && <DownloadAppPage onNavigate={navigateToTab} />}
        {activeTab === 'login' && <LoginPage onNavigate={navigateToTab} />}
        {activeTab === 'admin-login' && <AdminLoginPage onNavigate={navigateToTab} />}
        {activeTab === 'register' && <RegisterPage onNavigate={navigateToTab} />}
      </Suspense>
    </PublicLayout>
  );
}

function AppFeedbackShell({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  return <EnterpriseFeedbackProvider isAr={language === 'ar'}>{children}</EnterpriseFeedbackProvider>;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <OrganizationProvider>
            <EventBusProvider>
              <WorkflowProvider>
                <AuditProvider>
                  <ConfigProvider>
                    <IdentityProvider>
                      <EnterpriseDialogProvider>
                        <EnterpriseDrawerProvider>
                          <AppFeedbackShell>
                            <MainRouter />
                          </AppFeedbackShell>
                        </EnterpriseDrawerProvider>
                      </EnterpriseDialogProvider>
                    </IdentityProvider>
                  </ConfigProvider>
                </AuditProvider>
              </WorkflowProvider>
            </EventBusProvider>
          </OrganizationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
