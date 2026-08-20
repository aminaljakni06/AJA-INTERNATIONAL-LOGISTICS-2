import React, { useState } from 'react';
import { Settings, Shield, Globe, Users, Database, Server, Key, Bell, Save, CheckCircle2, AlertCircle, Ship, Anchor, ShieldCheck, MapPin, ArrowRight, ArrowLeft, Activity, Cpu, Zap } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminSettings: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { isAr } = useLanguage();
  const [activeTab, setActiveTab] = useState<'general' | 'pipeline' | 'integrations' | 'database'>('pipeline');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // General Settings State
  const [companySettings, setCompanySettings] = useState({
    companyNameAr: 'شركة أجا اللوجستية ش.م.م',
    companyNameEn: 'AJA LOGISTICS LLC',
    crNumber: '1010889900',
    vatNumber: '310998877600003',
    supportEmail: 'london-support@ajalogistics.com',
    supportPhone: '+44 20 7946 0000',
    defaultCurrency: 'SAR',
    vatRate: 15,
  });

  // Integration Settings State
  const [integrations, setIntegrations] = useState({
    customsPortApi: true,
    trackingCarrierApi: true,
    smsGateway: true,
    emailServer: true,
    googleMapsApi: true,
  });

  // 6-Stage Operational Integration Pipeline State
  const [pipelineNodes, setPipelineNodes] = useState([
    {
      id: 'node-1',
      stage: 1,
      titleAr: 'خطوط الناقلين الشحن (Carriers)',
      titleEn: 'Shipping Carriers',
      iconName: 'Ship',
      status: 'ACTIVE',
      latency: '120ms',
      descriptionAr: 'الربط المباشر مع Maersk, MSC, COSCO, Saudia Cargo لتحديث التكاليف وحالات الشحنات',
      descriptionEn: 'Live EDI/REST API feed with Maersk, MSC, COSCO, Saudia Cargo & Overland fleets',
      details: ['Maersk API v2', 'MSC Direct Webhooks', 'COSCO Cargo Tracking', 'DHL Air API'],
    },
    {
      id: 'node-2',
      stage: 2,
      titleAr: 'الموانئ والمراكز اللوجستية (Ports)',
      titleEn: 'Ports & Terminals',
      iconName: 'Anchor',
      status: 'ACTIVE',
      latency: '85ms',
      descriptionAr: 'مزامنة مواعيد الرسو والتفريغ بميناء جدة الإسلامي، ميناء الدمام، والموانئ الجافة',
      descriptionEn: 'Terminal Operating System (TOS) sync for Jeddah, Dammam & Dry Ports',
      details: ['SAJED Terminal API', 'SADMM Berth Schedule', 'SAJEC Dry Port Feed', 'UN/LOCODE Validator'],
    },
    {
      id: 'node-3',
      stage: 3,
      titleAr: 'الأنظمة الجمركية (Customs)',
      titleEn: 'Customs Systems',
      iconName: 'ShieldCheck',
      status: 'ACTIVE',
      latency: '210ms',
      descriptionAr: 'الربط مع منصة فسح (FASAH) وهيئة الزكاة والضريبة والجمارك إصدار البيان والتخليص الآلي',
      descriptionEn: 'Automated FASAH platform & ZATCA clearance, duty calculation & Bayan sync',
      details: ['FASAH Clearance API', 'ZATCA E-Invoicing', 'Bayan Auto-Generator', 'HS Code Lookup'],
    },
    {
      id: 'node-4',
      stage: 4,
      titleAr: 'الخرائط والملاحة (Maps & Fleet GPS)',
      titleEn: 'Maps & Telematics',
      iconName: 'MapPin',
      status: 'ACTIVE',
      latency: '45ms',
      descriptionAr: 'تتبع السفن عبر AIS وتحديد مسارات الشاحنات وحساب الأوقات المتوقعة للوصول (ETA)',
      descriptionEn: 'Google Maps Geocoding & AIS Live Vessel location tracking engine',
      details: ['Google Maps Routes', 'MarineTraffic AIS Stream', 'Geofencing Alerts', 'Route Optimization'],
    },
    {
      id: 'node-5',
      stage: 5,
      titleAr: 'التنبيهات والإشعارات (Notifications)',
      titleEn: 'Notifications Engine',
      iconName: 'Bell',
      status: 'ACTIVE',
      latency: '60ms',
      descriptionAr: 'إرسال الرسائل القصيرة SMS، التنبيهات الفورية عبر الواتساب والبريد الإلكتروني للعميل',
      descriptionEn: 'Automated multi-channel alerts (SMS, WhatsApp, SMTP Email & Push)',
      details: ['Twilio SMS Gateway', 'WhatsApp Business API', 'SMTP Email Router', 'In-App Webhooks'],
    },
    {
      id: 'node-6',
      stage: 6,
      titleAr: 'إدارة العملاء والبوابة (CRM)',
      titleEn: 'CRM & Customer Portal',
      iconName: 'Users',
      status: 'ACTIVE',
      latency: '15ms',
      descriptionAr: 'تحديث بيانات الحسابات، طلبات الأسعار، وفتح التذاكر المباشرة بدقة متناهية',
      descriptionEn: 'Real-time multi-tenant Firestore sync for quotes, portal dashboards & tickets',
      details: ['Firestore Realtime DB', 'Customer RBAC Engine', 'Quote Request Pipeline', 'Audit Trail'],
    },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            {isAr ? 'إعدادات المنصة والأنظمة (System Settings)' : 'Platform & System Settings'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isAr
              ? 'تكوين بيانات الشركة الأساسية، خوادم الربط والتكامل اللوجستي، وإسناد الصلاحيات'
              : 'Configure company profile, API carrier integrations, VAT settings, and system rules'}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            {isAr ? 'تم حفظ التغييرات بنجاح' : 'Settings saved successfully'}
          </div>
        )}
      </div>

      {/* Quick Links Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate && onNavigate('admin-users')}
          className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400/50 rounded-xl cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{isAr ? 'إدارة المستخدمين والصلاحيات' : 'Users & Access Control'}</p>
              <p className="text-[11px] text-slate-400">{isAr ? 'إدراج موظفين، وتحديد الأدوار (RBAC)' : 'User accounts and RBAC permissions'}</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('admin-cms')}
          className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400/50 rounded-xl cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{isAr ? 'محتوى البوابة (CMS)' : 'Website Content (CMS)'}</p>
              <p className="text-[11px] text-slate-400">{isAr ? 'تعديل نصوص الصفحة والأسئلة الشائعة' : 'Edit public portal content and FAQs'}</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('admin-audit')}
          className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400/50 rounded-xl cursor-pointer transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{isAr ? 'سجل الأمان والتدقيق' : 'Security Audit Logs'}</p>
              <p className="text-[11px] text-slate-400">{isAr ? 'متابعة العمليات والحركات بالنظام' : 'Track all system changes & actions'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-900/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'pipeline' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            {isAr ? 'مسار التكامل اللوجستي (Integration Pipeline)' : 'Logistics Integration Pipeline'}
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'general' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            {isAr ? 'بيانات المؤسسة والضرائب' : 'Company & Fiscal Settings'}
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'integrations' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            {isAr ? 'الربط والتكامل اللوجستي (APIs)' : 'Carrier & Customs APIs'}
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'database' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            {isAr ? 'حالة قاعدة البيانات (Firestore)' : 'Database & Cloud Health'}
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'pipeline' && (
            <div className="space-y-6 text-xs text-white">
              {/* Pipeline Overview Banner */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-amber-400 animate-pulse" />
                      {isAr ? 'مسار أتمتة وتكامل بيانات العمليات الشامل' : 'End-to-End Enterprise Operations Integration Pipeline'}
                    </h3>
                    <p className="text-slate-300 text-xs mt-1">
                      {isAr
                        ? 'ربط مباشر وموحد بين خطوط الناقلين، الموانئ، الجمارك، الخرائط والملاحة، التنبيهات ونظام CRM'
                        : 'Real-time automated data streaming across Carriers, Ports, Customs, Maps, Notifications & CRM'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl shrink-0">
                    <Activity className="w-4 h-4" />
                    <span>{isAr ? 'حالة السلسلة: نشطة ومترابطة 100%' : 'Pipeline Status: 100% Operational'}</span>
                  </div>
                </div>

                {/* Horizontal Visual Pipeline Sequence Flow */}
                <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 overflow-x-auto">
                  <div className="flex items-center min-w-[750px] justify-between text-xs font-bold">
                    {pipelineNodes.map((node, index) => (
                      <React.Fragment key={node.id}>
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                            node.status === 'ACTIVE'
                              ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                              : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                            {node.stage}
                          </span>
                          <span>{isAr ? node.titleAr.split(' ')[0] : node.titleEn}</span>
                        </div>

                        {index < pipelineNodes.length - 1 && (
                          <div className="text-slate-600 px-1">
                            {isAr ? <ArrowLeft className="w-4 h-4 text-amber-400/60" /> : <ArrowRight className="w-4 h-4 text-amber-400/60" />}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Stage Cards in Sequence */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pipelineNodes.map((node) => (
                  <Card key={node.id} className="bg-slate-800 border-slate-700 hover:border-amber-400/50 transition flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                            {node.stage}
                          </span>
                          <h4 className="font-bold text-white text-sm">
                            {isAr ? node.titleAr : node.titleEn}
                          </h4>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            node.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-700 text-slate-400 border-slate-600'
                          }`}
                        >
                          {node.status} • {node.latency}
                        </span>
                      </div>

                      <p className="text-slate-300 text-xs leading-relaxed">
                        {isAr ? node.descriptionAr : node.descriptionEn}
                      </p>

                      <div className="pt-2 border-t border-slate-700/80">
                        <p className="text-[10px] font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
                          {isAr ? 'الأنظمة والخدمات المرتبطة' : 'Connected Integrations'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {node.details.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono text-slate-300">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {isAr ? 'حالة المزامنة المباشرة' : 'Real-time Streaming'}
                      </span>
                      <button
                        onClick={() => {
                          setPipelineNodes((prev) =>
                            prev.map((n) =>
                              n.id === node.id
                                ? { ...n, status: n.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
                                : n
                            )
                          );
                        }}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          node.status === 'ACTIVE' ? 'bg-amber-400' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`block w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                            node.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="space-y-6 text-xs text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}</label>
                  <input
                    type="text"
                    value={companySettings.companyNameAr}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyNameAr: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}</label>
                  <input
                    type="text"
                    value={companySettings.companyNameEn}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyNameEn: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'رقم السجل التجاري (CR)' : 'Commercial Register (CR)'}</label>
                  <input
                    type="text"
                    value={companySettings.crNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, crNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'الرقم الضريبي (VAT Number)' : 'VAT Registration Number'}</label>
                  <input
                    type="text"
                    value={companySettings.vatNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, vatNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'بريد الدعم والعمليات' : 'Operations Support Email'}</label>
                  <input
                    type="email"
                    value={companySettings.supportEmail}
                    onChange={(e) => setCompanySettings({ ...companySettings, supportEmail: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'رقم هاتف الدعم والواتساب' : 'Support Phone / WhatsApp'}</label>
                  <input
                    type="text"
                    value={companySettings.supportPhone}
                    onChange={(e) => setCompanySettings({ ...companySettings, supportPhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'نسبة الضريبة المضافة (%)' : 'VAT Percentage (%)'}</label>
                  <input
                    type="number"
                    value={companySettings.vatRate}
                    onChange={(e) => setCompanySettings({ ...companySettings, vatRate: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">{isAr ? 'العملة المعتمدة' : 'Default Currency'}</label>
                  <input
                    type="text"
                    value={companySettings.defaultCurrency}
                    disabled
                    className="w-full bg-slate-900 border border-slate-700 text-slate-400 rounded-xl p-3 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <Button type="submit" className="bg-amber-400 text-slate-950 font-bold flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isAr ? 'حفظ إعدادات المنصة' : 'Save Platform Settings'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6 text-xs text-white">
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {isAr ? 'بوابات الربط البرمجي للتتبع والجمارك (Future API Integrations)' : 'External Carrier & Customs API Gateway'}
                </h3>
                <p className="text-slate-300">
                  {isAr
                    ? 'الربط التلقائي مع هيئة الزكاة والضريبة والجمارك (زاتكا)، وخطوط الشحن البحري والناقلين الدوليين'
                    : 'Configure automated webhook updates and API key synchronization for carriers & customs ports'}
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(integrations).map(([key, val]) => (
                  <div key={key} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">
                        {key === 'customsPortApi' && (isAr ? 'بوابة هيئة الجمارك والموانئ' : 'Customs & Port Authority API')}
                        {key === 'trackingCarrierApi' && (isAr ? 'مستقبل تتبع الناقلين المباشر (MarineTraffic / Carriers)' : 'Live Carrier Tracking API')}
                        {key === 'smsGateway' && (isAr ? 'بوابة إرسال الرسائل القصيرة (SMS Notifications)' : 'SMS Notification Gateway')}
                        {key === 'emailServer' && (isAr ? 'خادم البريد الإلكتروني للتقارير (SMTP)' : 'Transactional Email Server (SMTP)')}
                        {key === 'googleMapsApi' && (isAr ? 'خدمة الخرائط المباشرة وتتبع المسارات (Google Maps API)' : 'Google Maps Geocoding & Routing')}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {val ? (isAr ? 'الخدمة متصلة وتعمل تلقائياً' : 'Connected & Active') : (isAr ? 'معطلة' : 'Disabled')}
                      </p>
                    </div>

                    <button
                      onClick={() => setIntegrations({ ...integrations, [key]: !val })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${val ? 'bg-amber-400' : 'bg-slate-700'}`}
                    >
                      <span className={`block w-5 h-5 rounded-full bg-slate-950 transition-transform ${val ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4 text-xs text-white">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-300 text-sm">{isAr ? 'قاعدة البيانات متصلة وتعمل بصحة ممتازة (Firestore DB)' : 'Firestore Database Healthy & Synced'}</p>
                  <p className="text-slate-300 mt-0.5">{isAr ? 'مشروع الفايربيس: ai-studio-ajalogistics' : 'Firebase Project: ai-studio-ajalogistics'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Card className="bg-slate-800 border-slate-700">
                  <p className="text-slate-400 text-[11px]">{isAr ? 'حالة الأمان والـ Security Rules' : 'Firestore Security Rules'}</p>
                  <p className="text-base font-bold text-white mt-1">{isAr ? 'مؤمنة بالكامل (RBAC System Enforcement)' : 'Enforced via auth.uid & role'}</p>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <p className="text-slate-400 text-[11px]">{isAr ? 'النسخ الاحتياطي التلقائي' : 'Automated Backups'}</p>
                  <p className="text-base font-bold text-white mt-1">{isAr ? 'نشط يومياً الساعة 02:00 صباحاً' : 'Daily Active at 02:00 AM UTC'}</p>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
