import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Search, 
  Bell, 
  Globe, 
  Sun, 
  Moon, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Plus, 
  HelpCircle, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  SlidersHorizontal, 
  Download, 
  Sparkles,
  Command,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Radio,
  Sliders,
  LogOut,
  User,
  Menu,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationsMenu } from './NotificationsMenu';
import { UserMenu } from './UserMenu';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// Tab metadata map for dynamic workspace header titling
const TAB_METADATA: Record<string, { titleEn: string; titleAr: string; subEn: string; subAr: string; categoryEn: string; categoryAr: string }> = {
  'admin-dashboard': {
    titleEn: 'Executive Logistics & Operations Dashboard',
    titleAr: 'لوحة التحكم التنفيذية والعمليات اللوجستية',
    subEn: 'Real-time monitoring of global shipments, fleet telematics, revenue, and core KPI metrics.',
    subAr: 'مراقبة حية وتفصيلية للشحنات العالمية وتتبع الأسطول والإيرادات والمؤشرات الرئيسية.',
    categoryEn: 'Core Operations',
    categoryAr: 'العمليات الرئيسية',
  },
  'admin-readiness': {
    titleEn: 'Enterprise Go-Live & ISO Certification Framework',
    titleAr: 'إطار الجهوزية للإطلاق وشهادات ISO والامتثال',
    subEn: 'Audit readiness, ISO 9001/27001 compliance checklists, and production go-live verification.',
    subAr: 'جاهزية التدقيق ومراجعة الامتثال للمعايير الدولية وإتاحة الإنتاج المؤسسي.',
    categoryEn: 'Governance & Security',
    categoryAr: 'الحوكمة والأمن',
  },
  'admin-command': {
    titleEn: 'C4I Command Center & Logistics Digital Twin',
    titleAr: 'مركز القيادة والسيطرة والتوأم الرقمي (C4I)',
    subEn: 'Autonomous operations tower, live spatial tracking, and digital twin node simulation.',
    subAr: 'برج المراقبة المستقل والتتبع المكاني والمحاكاة الرقمية للشبكة اللوجستية.',
    categoryEn: 'Command & Control',
    categoryAr: 'القيادة والسيطرة',
  },
  'admin-platform': {
    titleEn: 'Enterprise Cloud Infrastructure & SRE Platform',
    titleAr: 'منصة البنية التحتية السحابية وتنسيق SRE',
    subEn: 'Kubernetes cluster health, microservice latency, CI/CD pipelines, and cloud resource usage.',
    subAr: 'صحة المجموعات والميكروسيرفيس ومتابعة خطوط التوزيع واستهلاك الموارد السحابية.',
    categoryEn: 'Platform & Infrastructure',
    categoryAr: 'المنصة والبنية التحتية',
  },
  'admin-security': {
    titleEn: 'IAM & Zero-Trust SOC Security Operations',
    titleAr: 'منصة إدارة الهوية والأمن والسيطرة السيبرانية',
    subEn: 'Threat intelligence, role-based access control, active session audits, and security policies.',
    subAr: 'استخبارات التهديدات، التحكم في الوصول، تدقيق الجلسات النشطة، وسياسات الأمان.',
    categoryEn: 'Security & Compliance',
    categoryAr: 'الأمن والامتثال',
  },
  'admin-integration': {
    titleEn: 'Enterprise Integration Platform (iPaaS & APIs)',
    titleAr: 'منصة التكامل المؤسسي وإدارة واجهات البرمجة (iPaaS)',
    subEn: 'Custom API gateways, webhook listeners, EDI transformers, and partner integration hub.',
    subAr: 'بوابات API المخصصة، مستمعات Webhook، ومحولات البيانات ومركز الشركاء.',
    categoryEn: 'Integration Platform',
    categoryAr: 'منصة التكامل',
  },
  'admin-data-platform': {
    titleEn: 'Enterprise Data Lake & Business Intelligence',
    titleAr: 'بحيرة البيانات المؤسسية وتحليلات الذكاء التجاري',
    subEn: 'OLAP query engines, data pipeline ETL telemetry, data quality metrics, and BI reporting.',
    subAr: 'محركات الاستعلام التحليلي، خطوط معالجة البيانات، ومؤشرات الجودة والتقارير.',
    categoryEn: 'Data & Analytics',
    categoryAr: 'البيانات والتحليلات',
  },
  'admin-ai-platform': {
    titleEn: 'Enterprise AI & Machine Learning Operations Hub',
    titleAr: 'منصة الذكاء الاصطناعي المؤسسي والعمليات المتقدمة',
    subEn: 'Predictive ETAs, automated tariff classification, document OCR, and LLM agent orchestration.',
    subAr: 'التنبؤ بمواعيد الوصول، تصنيف التعريفات الجمركية، الاستخراج الذكي وتنسيق الوكلاء.',
    categoryEn: 'AI & Innovation',
    categoryAr: 'الذكاء الاصطناعي',
  },
  'admin-payments': {
    titleEn: 'Adyen Payment Insights & Financial Settlement',
    titleAr: 'تحليلات المدفوعات والتسوية المالية (Adyen)',
    subEn: 'Transaction success rates, payment gateway authorization analytics, and settlement audits.',
    subAr: 'معدلات نجاح المعاملات، تحليلات بوابات الدفع، وتدقيق التسويات المالية.',
    categoryEn: 'Finance & Payments',
    categoryAr: 'المالية والمدفوعات',
  },
  'admin-quotes': {
    titleEn: 'Freight Quotation & Tariff Calculation Desk',
    titleAr: 'مركز التسعير وحساب تعرفة الشحن اللوجستي',
    subEn: 'Instant rate engine, multimodal freight quotes, and custom margin configuration.',
    subAr: 'محرك الأسعار الفوري، عروض الشحن متعدد الوسائط، وتهيئة هامش الربح.',
    categoryEn: 'Commercial Services',
    categoryAr: 'الخدمات التجارية',
  },
  'admin-shipments': {
    titleEn: 'Global Shipment Lifecycle & Tracking Management',
    titleAr: 'إدارة دورة حياة الشحنات العالمية والتتبع',
    subEn: 'Air, Sea, Land shipment orchestration, milestone tracking, and customs clearance status.',
    subAr: 'إدارة شحنات الجو والبحر والبر، متابعة المراحل، وحالة التخليص الجمركي.',
    categoryEn: 'Logistics Operations',
    categoryAr: 'العمليات اللوجستية',
  },
  'admin-tms': {
    titleEn: 'Transportation Management System (TMS Core)',
    titleAr: 'نظام إدارة النقل والرحلات البرية (TMS)',
    subEn: 'Route optimization, vehicle dispatch, driver assignments, and trip execution tracking.',
    subAr: 'تحسين المسارات، توزيع المركبات، تعيين السائقين، ومتابعة تنفيذ الرحلات.',
    categoryEn: 'Logistics Operations',
    categoryAr: 'العمليات اللوجستية',
  },
  'admin-warehouse': {
    titleEn: 'Enterprise Warehouse Management System (WMS)',
    titleAr: 'نظام إدارة المستودعات والعمليات والمخزون (WMS)',
    subEn: 'Zone capacity, SKU inventory tracking, pick & pack efficiency, and receiving docks.',
    subAr: 'سعة المناطق، تتبع المخزون بالقطع، كفاءة التجهيز، وأرصفة الاستلام.',
    categoryEn: 'Logistics Operations',
    categoryAr: 'العمليات اللوجستية',
  },
  'admin-freightfinance': {
    titleEn: 'Freight Audit, Billing & Profitability Control',
    titleAr: 'تدقيق نفقات الشحن والفوترة ومراقبة الربحية',
    subEn: 'Carrier invoice reconciliation, fuel surcharge validation, and container margin audit.',
    subAr: 'مطابقة فواتير الناقلين، التحقق من رسوم الوقود، وتدقيق هومش الربح.',
    categoryEn: 'Finance & Payments',
    categoryAr: 'المالية والمدفوعات',
  },
  'admin-generalledger': {
    titleEn: 'General Ledger & Financial ERP Integration',
    titleAr: 'المالية العامة والحسابات الختامية (General Ledger)',
    subEn: 'Multi-currency ledger entries, ZATCA e-invoicing audit, and balance sheet reporting.',
    subAr: 'قيد الحسابات متعددة العملات، تدقيق الفوترة الإلكترونية، والتقارير المالية.',
    categoryEn: 'Finance & Payments',
    categoryAr: 'المالية والمدفوعات',
  },
  'admin-controltower': {
    titleEn: 'Global Logistics Control Tower & Exception Radar',
    titleAr: 'برج المراقبة والتحكم اللوجستي ورادار الاستثناءات',
    subEn: 'SLA breach alerts, weather/delay risk monitor, and critical escalation workflow.',
    subAr: 'تنبيهات تجاوز اتفاقيات الخدمة، رادار الطقس والتأخير، وسير عمل التصعيد.',
    categoryEn: 'Command & Control',
    categoryAr: 'القيادة والسيطرة',
  },
  'admin-fleet': {
    titleEn: 'Fleet Telematics & Sensor Intelligence Radar',
    titleAr: 'منصة تتبع الأسطول والمستشعرات والمراقبة الحية',
    subEn: 'GPS telematics, cold-chain temperature sensors, fuel consumption, and driver scorecards.',
    subAr: 'تتبع GPS، مستشعرات درجة حرارة السلسلة الباردة، استهلاك الوقود وتقييم السائقين.',
    categoryEn: 'Logistics Operations',
    categoryAr: 'العمليات اللوجستية',
  },
  'admin-carrier3pl': {
    titleEn: 'Carrier & 3PL/4PL Partner Network Hub',
    titleAr: 'منصة إدارة الناقلين والشركاء (3PL / 4PL)',
    subEn: 'Partner SLA scorecards, API carrier integration, capacity allocation, and contract rates.',
    subAr: 'بطاقات تقييم الشركاء، ربط API الناقلين، توزيع السعات، وأسعار العقود.',
    categoryEn: 'Partner Ecosystem',
    categoryAr: 'منظومة الشركاء',
  },
  'admin-procurement': {
    titleEn: 'Procurement & Supplier Management (P2P)',
    titleAr: 'إدارة المشتريات والموردين (Procure-to-Pay)',
    subEn: 'Purchase orders, vendor evaluation, RFP management, and contract lifecycle.',
    subAr: 'أوامر الشراء، تقييم الموردين، طلبات العروض، ودورة حياة العقود.',
    categoryEn: 'Commercial Services',
    categoryAr: 'الخدمات التجارية',
  },
  'admin-customers': {
    titleEn: 'Enterprise Account Management & Directory',
    titleAr: 'إدارة حسابات العملاء ودليل المؤسسات',
    subEn: 'B2B client profiles, credit limits, account managers, and SLA agreements.',
    subAr: 'ملفات العملاء التجارية، حدود الائتمان، مدراء الحسابات، واتفاقيات الخدمة.',
    categoryEn: 'Customer Relations',
    categoryAr: 'علاقات العملاء',
  },
  'admin-sales': {
    titleEn: 'Sales Pipeline & Commercial Opportunity Center',
    titleAr: 'منصة المبيعات والفرص التجارية والأنبوب',
    subEn: 'Lead scoring, CRM deal pipeline, revenue forecasting, and account growth.',
    subAr: 'تقييم الفرص، أنبوب الصفقات اللوجستية، التنبؤ بالإيرادات، وتنمية الحسابات.',
    categoryEn: 'Commercial Services',
    categoryAr: 'الخدمات التجارية',
  },
  'admin-contracts': {
    titleEn: 'Sales Orders & Service Contract Registry',
    titleAr: 'منصة العقود والاتفاقيات اللوجستية وأوامر البيع',
    subEn: 'Contract terms, volume tier commitments, amendment history, and digital signing.',
    subAr: 'بنود العقود، التزامات الأحجام، تاريخ التعديلات، والتوقيع الرقمي.',
    categoryEn: 'Commercial Services',
    categoryAr: 'الخدمات التجارية',
  },
  'admin-customer-service': {
    titleEn: 'Customer Support 360 & Ticket Resolution Desk',
    titleAr: 'مركز خدمة العملاء وإدارة التذاكر والدعم 360',
    subEn: 'Omnichannel support tickets, SLA timer escalation, AI sentiment analysis, and resolution history.',
    subAr: 'تذاكر الدعم متعددة القنوات، مؤقت التصعيد، تحليل المشاعر، وسجل الحلول.',
    categoryEn: 'Customer Relations',
    categoryAr: 'علاقات العملاء',
  },
  'admin-omnichannel': {
    titleEn: 'Omnichannel Customer Engagement & Activity Logs',
    titleAr: 'منصة التواصل الموحد وإدارات الأنشطة والاتصالات',
    subEn: 'WhatsApp Business API, SMS updates, automated email dispatches, and audit trail.',
    subAr: 'واتساب الأعمال، رسائل SMS، التنبيهات البريدية التلقائية، وسجل التدقيق.',
    categoryEn: 'Customer Relations',
    categoryAr: 'علاقات العملاء',
  },
  'admin-services': {
    titleEn: 'Logistics Service Catalog & Freight Tariff Engine',
    titleAr: 'دليل الخدمات اللوجستية وتعريفات الشحن',
    subEn: 'Freight service offerings, customs brokerage tariffs, and add-on service pricing.',
    subAr: 'عروض خدمات الشحن، تعرفة التخليص الجمركي، وأسعار الخدمات الإضافية.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-locations': {
    titleEn: 'Global Ports, Hubs & Transit Locations Registry',
    titleAr: 'دليل الموانئ العالمية والمطارات والمراكز اللوجستية',
    subEn: 'Port codes (UN/LOCODE), customs zone boundaries, and warehouse geo-fences.',
    subAr: 'أكواد الموانئ الدولية، حدود المناطق الجمركية، والسياج الجغرافي للمستودعات.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-settings': {
    titleEn: 'Enterprise Operations System Settings',
    titleAr: 'إعدادات النظام والتهيئة المؤسسية الشاملة',
    subEn: 'Global currency parameters, VAT rates, default units, and company profile info.',
    subAr: 'إعدادات العملة، نسبة ضريبة القيمة المضافة، الوحدات الافتراضية، وملف الشركة.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-config': {
    titleEn: 'System Configuration & Feature Flags Control',
    titleAr: 'منصة التهيئة والتحكم بالرايات المتقدمة',
    subEn: 'Dynamic feature toggles, environment variables, rate limit configurations, and system parameters.',
    subAr: 'تبديل الميزات الديناميكية، متغيرة البيئة، تهيئة حدود الاستخدام، ومعايير النظام.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-identity': {
    titleEn: 'Identity & Access Policy Management Center',
    titleAr: 'منصة إدارات الهويات والصلاحيات المتقدمة',
    subEn: 'SSO integrations (SAML/OAuth2), MFA enforcing, session duration policies, and role matrix.',
    subAr: 'التكامل مع SSO، فرض المصادقة الثنائية، سياسات طول الجلسة، ومصفوفة الصلاحيات.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-mdm': {
    titleEn: 'Master Data Management (MDM) Governance',
    titleAr: 'منصة إدارة البيانات الرئيسية والحوكمة (MDM)',
    subEn: 'Single source of truth for carriers, locations, commodity HS codes, and tariff rules.',
    subAr: 'مصدر الحقيقة الموحد للناقلين، المواقع، أكواد النظام المنسق الجمركي، والقواعد.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-audit': {
    titleEn: 'Enterprise System Audit Logs & Observability',
    titleAr: 'منصة التدقيق والرقابة والتتبع الأمني',
    subEn: 'User action telemetry, system event logs, security audit trail, and compliance exports.',
    subAr: 'تتبع إجراءات المستخدمين، سجلات أحداث النظام، التتبع الأمني، وتصدير التقارير.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-notifications': {
    titleEn: 'Enterprise Notification Dispatch & Rules Engine',
    titleAr: 'مركز التنبيهات وإرسال الإشعارات وقواعد النظام',
    subEn: 'System alert broadcast, email templates, push notifications, and webhook subscriptions.',
    subAr: 'بث تنبيهات النظام، قوالب البريد، الإشعارات الفورية، والاشتراكات البرمجية.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
  'admin-messages': {
    titleEn: 'Internal Staff Operations Communication Desk',
    titleAr: 'مركز المراسلات والاتصالات الداخلية لطاقم العمليات',
    subEn: 'Team announcements, shift handovers, critical operational chats, and broadcast notes.',
    subAr: 'إعلانات الفريق، التسليم بين الورديات، المحادثات التشغيلية الحساسة، والملاحظات.',
    categoryEn: 'System Administration',
    categoryAr: 'إدارة النظام',
  },
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab,
  title,
  subtitle,
  actions
}) => {
  const { user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeHub, setActiveHub] = useState('Riyadh Central HQ (CR-101)');
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);

  const isAr = language === 'ar';

  // Keyboard shortcut for Global Search (Ctrl + K / Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const meta = TAB_METADATA[activeTab] || {
    titleEn: title || 'Admin Operations Console',
    titleAr: title || 'لوحة العمليات الإدارية',
    subEn: subtitle || 'Manage enterprise logistics resources, system parameters, and operational data.',
    subAr: subtitle || 'إدارة الموارد اللوجستية المؤسسية ومتغيرات النظام والبيانات التشغيلية.',
    categoryEn: 'Operations',
    categoryAr: 'العمليات',
  };

  const currentTitle = isAr ? meta.titleAr : meta.titleEn;
  const currentSub = isAr ? meta.subAr : meta.subEn;
  const currentCategory = isAr ? meta.categoryAr : meta.categoryEn;

  // Generate breadcrumb items dynamically
  const breadcrumbItems = [
    { label: isAr ? 'لوحة الإدارة' : 'Admin Operations', tab: 'admin-dashboard' },
    { label: currentCategory },
    { label: currentTitle }
  ];

  const triggerToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-[#07131F] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col ${isAr ? 'rtl' : 'ltr'}`}>
      
      {/* Search Modal Container */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setSearchModalOpen(false);
        }}
      />

      {/* 1. STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#082F49]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#0B3D5C] shadow-sm transition-colors">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left section: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('admin-dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B5FFF] to-[#00F0FF] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Ship className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-start">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    AJA <span className="text-[#0B5FFF] dark:text-[#00F0FF]">LOGISTICS</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded border border-amber-500/30">
                    OPS PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isAr ? 'مركز العمليات المؤسسي' : 'Enterprise Operations Center'}
                </p>
              </div>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700/80 hidden md:block mx-1" />

            {/* Hub / Facility Selector */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
              <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <select
                value={activeHub}
                onChange={(e) => {
                  setActiveHub(e.target.value);
                  triggerToast(`${isAr ? 'تم التبديل إلى' : 'Switched operational hub to'}: ${e.target.value}`, 'success');
                }}
                className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="Riyadh Central HQ (CR-101)" className="dark:bg-slate-900">Riyadh Central HQ (CR-101)</option>
                <option value="Jeddah Islamic Port Logistics Hub" className="dark:bg-slate-900">Jeddah Islamic Port Hub</option>
                <option value="Dammam King Abdulaziz Port Hub" className="dark:bg-slate-900">Dammam Free Zone Hub</option>
                <option value="NEOM Supply Chain Gate Terminal" className="dark:bg-slate-900">NEOM Gateway Terminal</option>
              </select>
            </div>
          </div>

          {/* Center: Global Search Bar Trigger */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span>{isAr ? 'البحث السريع في الشحنات، النظام والمستخدمين...' : 'Global Admin Search (Shipments, System, Users)...'}</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded border border-slate-300 dark:border-slate-700 shadow-2xs">
                <Command className="w-3 h-3" /> K
              </kbd>
            </button>
          </div>

          {/* Right Section: System Actions, Lang, Theme, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Operational Status Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SLA 99.98% • Live</span>
            </div>

            {/* Quick Create Button */}
            <div className="relative">
              <button
                onClick={() => setShowQuickCreate(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B5FFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'إنشاء جديد' : 'New Action'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showQuickCreate && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs text-slate-700 dark:text-slate-200">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
                  </div>
                  <button
                    onClick={() => { setActiveTab('admin-shipments'); setShowQuickCreate(false); }}
                    className="w-full text-start px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{isAr ? 'شحنة جديدة' : 'New Shipment'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => { setActiveTab('admin-quotes'); setShowQuickCreate(false); }}
                    className="w-full text-start px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{isAr ? 'عرض سعر جديد' : 'Create Quotation'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => { setActiveTab('admin-customers'); setShowQuickCreate(false); }}
                    className="w-full text-start px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{isAr ? 'إضافة عميل مؤسسي' : 'Add B2B Customer'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => { setActiveTab('admin-tms'); setShowQuickCreate(false); }}
                    className="w-full text-start px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>{isAr ? 'إنشاء رحلة نقل TMS' : 'Create TMS Trip'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Menu */}
            <NotificationsMenu onNavigate={setActiveTab} />

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title={isAr ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile Menu */}
            <UserMenu onNavigate={setActiveTab} />
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE BODY LAYOUT */}
      <div className="flex-1 flex w-full max-w-[1920px] mx-auto overflow-hidden">
        
        {/* Desktop Collapsible Enterprise Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar 
            currentTab={activeTab} 
            onSelectTab={setActiveTab} 
            onOpenSearch={() => setSearchModalOpen(true)}
          />
        </div>

        {/* Mobile Responsive Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#082F49] shadow-2xl z-[101] flex flex-col">
              <div className="p-4 flex items-center justify-between border-b border-[#0B3D5C]">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-[#00F0FF]" />
                  <span className="font-bold text-white text-sm">AJA Operations</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:bg-[#0B3D5C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Sidebar 
                  currentTab={activeTab} 
                  onSelectTab={(tab) => {
                    setActiveTab(tab);
                    setMobileSidebarOpen(false);
                  }}
                  onOpenSearch={() => {
                    setMobileSidebarOpen(false);
                    setSearchModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. MAIN WORKSPACE CONTAINER */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          
          {/* Workspace Header Section */}
          <div className="bg-white dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-5 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left Column: Breadcrumbs + Title + Subtitle */}
              <div className="space-y-1.5">
                <Breadcrumb items={breadcrumbItems} onNavigate={setActiveTab} />
                <div className="flex items-center gap-3 pt-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {currentTitle}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
                    <Activity className="w-3 h-3" />
                    {currentCategory}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                  {currentSub}
                </p>
              </div>

              {/* Right Column: Page Level Quick Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0 self-start lg:self-center pt-2 lg:pt-0">
                {actions}
                
                <button
                  onClick={() => triggerToast(isAr ? 'تم تحديث البيانات بنجاح' : 'Workspace data refreshed', 'success')}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title={isAr ? 'تحديث البيانات' : 'Refresh Data'}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => triggerToast(isAr ? 'جاري تجهيز تقرير التصدير...' : 'Generating enterprise report PDF...', 'info')}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">{isAr ? 'تصدير PDF' : 'Export PDF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Workspace Container (32px Desktop Padding / 20px Mobile Padding / 24px Gap) */}
          <div className="flex-1 p-5 sm:p-6 lg:p-8 space-y-6">
            {children}
          </div>

          {/* 4. RESPONSIVE ENTERPRISE FOOTER */}
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  AJA International Logistics Operations Console
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                  v4.2.0-PROD
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>ISO 27001 & 9001 Certified</span>
                <span>•</span>
                <span>ZATCA Phase 2 E-Invoicing Ready</span>
                <span>•</span>
                <span>© {new Date().getFullYear()} AJA Logistics Inc.</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Help / Assistant Widget Button */}
      <button
        onClick={() => setActiveTab('admin-ai-platform')}
        className="fixed bottom-6 right-6 z-30 p-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        title={isAr ? 'المساعد الذكي للعمليات' : 'AI Operations Assistant'}
      >
        <Sparkles className="w-5 h-5 animate-spin-slow" />
        <span className="hidden sm:inline font-bold text-xs">{isAr ? 'مساعد العمليات' : 'AI Co-Pilot'}</span>
      </button>

      {/* Floating Toast Notification Infrastructure Stack */}
      {toastMessage && (
        <div className={`fixed bottom-6 ${isAr ? 'left-6' : 'right-6'} z-[1300] max-w-md w-full animate-slide-up`}>
          <div className="p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-start gap-3">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toastMessage.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-medium text-slate-200">{toastMessage.text}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

