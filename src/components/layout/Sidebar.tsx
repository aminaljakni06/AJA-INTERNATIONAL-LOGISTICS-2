import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  History, 
  MessageSquare, 
  LogOut, 
  Users, 
  Bell, 
  Globe, 
  UserCheck, 
  User, 
  Folder, 
  Bot, 
  Search, 
  Layers, 
  MapPin, 
  Settings, 
  Sun, 
  Moon, 
  CreditCard, 
  DollarSign, 
  Sliders, 
  Fingerprint, 
  Database, 
  TrendingUp, 
  Share2, 
  LifeBuoy, 
  Truck, 
  Navigation, 
  Building2, 
  Radio, 
  Boxes, 
  ShoppingBag, 
  ShieldCheck, 
  Cloud, 
  Award,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Star,
  Pin,
  Clock,
  Command,
  Ship,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Activity,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pinnedTabs, setPinnedTabs] = useState<string[]>(['admin-dashboard', 'admin-shipments', 'admin-controltower']);
  const [recentTabs, setRecentTabs] = useState<{ id: string; label: string; time: string }[]>([
    { id: 'admin-controltower', label: 'Control Tower', time: '2m ago' },
    { id: 'admin-shipments', label: 'Shipments', time: '10m ago' },
    { id: 'admin-ai-platform', label: 'Enterprise AI', time: '1h ago' }
  ]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Operations & Logistics': true,
    'Platform & Security': true,
    'Data & AI Platform': true,
    'Commercial & Finance': false,
    'Customer Relations': false,
    'Administration & System': false,
    'العمليات واللوجستيات': true,
    'المنصة والأمن': true,
    'البيانات والذكاء الاصطناعي': true
  });

  const [environment, setEnvironment] = useState<'PROD' | 'STAGING' | 'DEV'>('PROD');
  const [selectedWorkspace, setSelectedWorkspace] = useState('Riyadh HQ (CR-101)');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  if (!user) return null;

  const isCustomer = user.role === 'CUSTOMER';
  const isAr = language === 'ar';

  // Track recent tab visits
  useEffect(() => {
    if (currentTab) {
      setRecentTabs(prev => {
        const filtered = prev.filter(item => item.id !== currentTab);
        const tabLabel = getTabLabel(currentTab);
        return [{ id: currentTab, label: tabLabel, time: 'Just now' }, ...filtered].slice(0, 4);
      });
    }
  }, [currentTab]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  const togglePin = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedTabs(prev => 
      prev.includes(tabId) ? prev.filter(id => id !== tabId) : [...prev, tabId]
    );
  };

  const getTabLabel = (id: string) => {
    const allItems = [...customerNavItems, ...adminGroups.flatMap(g => g.items)];
    const match = allItems.find(i => i.id === id);
    return match ? match.label : id;
  };

  const customerNavItems = [
    { id: 'customer-dashboard', label: t.sidebar.customerDashboard, icon: LayoutDashboard },
    { id: 'customer-shipments', label: t.sidebar.customerShipments, icon: Package, badge: '12', badgeType: 'info' },
    { id: 'customer-track', label: (t.sidebar as any).customerTrack || (isAr ? 'تتبع الشحنة' : 'Track Shipment'), icon: Search },
    { id: 'customer-quotes', label: t.sidebar.customerQuotes, icon: FileText, badge: '3', badgeType: 'warning' },
    { id: 'customer-payments', label: isAr ? 'المدفوعات والفواتير' : 'Payments & Portal', icon: CreditCard },
    { id: 'customer-documents', label: t.sidebar.customerDocuments, icon: Folder },
    { id: 'customer-profile', label: t.sidebar.customerProfile, icon: User },
    { id: 'customer-ai', label: t.sidebar.customerAI, icon: Bot, isNew: true },
    { id: 'customer-notifications', label: t.sidebar.customerNotifications, icon: Bell, badge: '5', badgeType: 'alert' },
    { id: 'customer-messages', label: t.sidebar.customerMessages, icon: MessageSquare },
  ];

  // Enterprise Admin Navigation Structure
  const adminGroups = [
    {
      groupEn: 'Operations & Logistics',
      groupAr: 'العمليات واللوجستيات',
      items: [
        { id: 'admin-dashboard', label: t.sidebar.adminDashboard, icon: LayoutDashboard },
        { id: 'admin-shipments', label: t.sidebar.adminShipments, icon: Package, badge: '28', badgeType: 'info' },
        { id: 'admin-controltower', label: isAr ? 'برج المراقبة والتحكم' : 'Logistics Control Tower', icon: Radio, badge: 'LIVE', badgeType: 'live' },
        { id: 'admin-tms', label: isAr ? 'إدارة النقل (TMS)' : 'Transportation (TMS)', icon: Truck },
        { id: 'admin-warehouse', label: isAr ? 'إدارة المستودعات (WMS)' : 'Enterprise Warehouse (WMS)', icon: Boxes },
        { id: 'admin-fleet', label: isAr ? 'تتبع الأسطول' : 'Fleet Telematics', icon: Navigation },
      ]
    },
    {
      groupEn: 'Platform & Security',
      groupAr: 'المنصة والأمن',
      items: [
        { id: 'admin-readiness', label: isAr ? 'الجهوزية والإطلاق' : 'Go-Live & ISO Framework', icon: Award, badge: 'ISO', badgeType: 'iso' },
        { id: 'admin-command', label: isAr ? 'مركز القيادة (C4I)' : 'Enterprise Command (C4I)', icon: Globe },
        { id: 'admin-platform', label: isAr ? 'منصة السحابة و SRE' : 'Cloud & SRE Platform', icon: Cloud },
        { id: 'admin-security', label: isAr ? 'أمن المعلومات (IAM)' : 'IAM & Zero Trust SOC', icon: ShieldCheck },
        { id: 'admin-identity', label: isAr ? 'إدارة الهوية' : 'Identity & Access Platform', icon: Fingerprint },
        { id: 'admin-audit', label: isAr ? 'سجلات التدقيق' : 'Audit & Observability', icon: History },
      ]
    },
    {
      groupEn: 'Data & AI Platform',
      groupAr: 'البيانات والذكاء الاصطناعي',
      items: [
        { id: 'admin-ai-platform', label: isAr ? 'منصة الذكاء الاصطناعي' : 'Enterprise AI Hub', icon: Bot, isNew: true },
        { id: 'admin-data-platform', label: isAr ? 'منصة البيانات المؤسسية' : 'Data Platform & BI', icon: Database },
        { id: 'admin-integration', label: isAr ? 'منصة التكامل (iPaaS)' : 'Integration Hub (iPaaS)', icon: Share2 },
      ]
    },
    {
      groupEn: 'Commercial & Finance',
      groupAr: 'التجارة والمالية',
      items: [
        { id: 'admin-quotes', label: t.sidebar.adminQuotes, icon: FileText, badge: '4', badgeType: 'warning' },
        { id: 'admin-payments', label: isAr ? 'تحليلات المدفوعات' : 'Adyen Payment Insights', icon: DollarSign },
        { id: 'admin-freightfinance', label: isAr ? 'تدقيق نفقات الشحن' : 'Freight Audit & Billing', icon: DollarSign },
        { id: 'admin-generalledger', label: isAr ? 'المالية العامة (GL)' : 'General Ledger ERP', icon: DollarSign },
        { id: 'admin-procurement', label: isAr ? 'المشتريات (P2P)' : 'Procurement (P2P)', icon: ShoppingBag },
        { id: 'admin-carrier3pl', label: isAr ? 'شبكة الناقلين' : 'Carrier & 3PL Network', icon: Building2 },
        { id: 'admin-sales', label: isAr ? 'أنبوب المبيعات' : 'Sales Pipeline', icon: TrendingUp },
        { id: 'admin-contracts', label: isAr ? 'عقود المبيعات' : 'Sales Contracts', icon: FileText },
      ]
    },
    {
      groupEn: 'Customer Relations',
      groupAr: 'علاقات العملاء',
      items: [
        { id: 'admin-customers', label: t.sidebar.adminCustomers, icon: UserCheck },
        { id: 'admin-customer-service', label: isAr ? 'دعم العملاء 360' : 'Support 360 Cases', icon: LifeBuoy, badge: '9', badgeType: 'alert' },
        { id: 'admin-omnichannel', label: isAr ? 'التواصل الموحد' : 'Omnichannel Engagement', icon: Share2 },
      ]
    },
    {
      groupEn: 'Administration & System',
      groupAr: 'الإدارة والنظام',
      items: [
        { id: 'admin-services', label: (t.sidebar as any).adminServices || (isAr ? 'دليل الخدمات' : 'Services Catalog'), icon: Layers },
        { id: 'admin-locations', label: (t.sidebar as any).adminLocations || (isAr ? 'دليل الموانئ' : 'Locations & Ports'), icon: MapPin },
        { id: 'admin-settings', label: (t.sidebar as any).adminSettings || (isAr ? 'إعدادات النظام' : 'System Settings'), icon: Settings },
        { id: 'admin-config', label: isAr ? 'رايات التهيئة' : 'Config & Feature Flags', icon: Sliders },
        { id: 'admin-mdm', label: isAr ? 'البيانات الرئيسية' : 'Master Data (MDM)', icon: Database },
        { id: 'admin-notifications', label: t.sidebar.adminNotifications, icon: Bell, badge: '3', badgeType: 'info' },
        { id: 'admin-messages', label: t.sidebar.adminMessages, icon: MessageSquare },
      ]
    }
  ];

  // Helper for rendering badges
  const renderBadge = (badge?: string, type?: string, isNew?: boolean) => {
    if (isNew) {
      return (
        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
          NEW
        </span>
      );
    }
    if (!badge) return null;

    let badgeStyle = 'bg-[#EA580C]/20 text-[#FB923C] border-[#EA580C]/30';
    if (type === 'live') badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse';
    if (type === 'iso') badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (type === 'alert') badgeStyle = 'bg-red-500/20 text-red-300 border-red-500/30';
    if (type === 'warning') badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

    return (
      <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border ${badgeStyle}`}>
        {badge}
      </span>
    );
  };

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-[88px]' : 'w-[280px]'
      } bg-[#082F49] text-white min-h-[calc(100vh-64px)] p-3 sm:p-4 flex flex-col justify-between border-r border-[#0B3D5C] shrink-0 transition-all duration-200 shadow-xl relative z-20 select-none`}
      aria-label="Sidebar Navigation"
    >
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1 custom-scrollbar">
        
        {/* 1. SIDEBAR HEADER: BRAND & ENVIRONMENT BADGE */}
        <div className="pb-3 border-b border-[#0B3D5C] space-y-2">
          <div className="flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B5FFF] to-[#00F0FF] flex items-center justify-center text-white shadow-md shrink-0">
                  <Ship className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs tracking-tight text-white truncate">
                      AJA LOGISTICS
                    </span>
                    <span className={`px-1 py-0.2 text-[8px] font-mono font-bold rounded border ${
                      environment === 'PROD' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {environment}
                    </span>
                  </div>
                  <p className="text-[10px] text-sky-200/60 truncate">
                    {isCustomer ? 'Customer Portal' : 'Enterprise Admin'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0B5FFF] to-[#00F0FF] flex items-center justify-center text-white shadow-md mx-auto">
                <Ship className="w-5 h-5" />
              </div>
            )}

            {/* Collapse / Expand Control Button */}
            <button
              onClick={() => setIsCollapsed(prev => !prev)}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-[#0B3D5C] hover:text-white transition-colors cursor-pointer shrink-0 hidden lg:block"
              title={isCollapsed ? 'Expand Sidebar (280px)' : 'Collapse Sidebar (88px)'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* WORKSPACE SWITCHER */}
          {!isCollapsed && (
            <div className="relative">
              <button
                onClick={() => setShowWorkspaceMenu(prev => !prev)}
                className="w-full p-2 bg-[#0B3D5C]/80 hover:bg-[#0B3D5C] rounded-lg border border-[#135D8D]/50 flex items-center justify-between text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate font-semibold">{selectedWorkspace}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {showWorkspaceMenu && (
                <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-[#0B3D5C] border border-[#135D8D] rounded-xl shadow-2xl z-50 text-xs space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-sky-300/60 uppercase">
                    {isAr ? 'اختر موقع العمل' : 'Select Facility Hub'}
                  </div>
                  {[
                    'Riyadh HQ (CR-101)',
                    'Jeddah Islamic Port Hub',
                    'Dammam Free Zone Hub',
                    'NEOM Gateway Terminal'
                  ].map(ws => (
                    <button
                      key={ws}
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setShowWorkspaceMenu(false);
                      }}
                      className={`w-full text-start px-2 py-1.5 rounded-md hover:bg-[#0F4C75] flex items-center justify-between transition-colors ${
                        selectedWorkspace === ws ? 'text-cyan-300 font-bold bg-[#0F4C75]/60' : 'text-slate-200'
                      }`}
                    >
                      <span className="truncate">{ws}</span>
                      {selectedWorkspace === ws && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. GLOBAL NAVIGATION SEARCH TRIGGER */}
        {!isCollapsed ? (
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#0B3D5C]/60 hover:bg-[#0B3D5C] border border-[#135D8D]/40 text-slate-300 text-xs transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>{isAr ? 'البحث السريع...' : 'Quick Nav Search...'}</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-[#0F4C75] text-sky-200 rounded border border-[#135D8D]">
              CTRL K
            </kbd>
          </button>
        ) : (
          <button
            onClick={onOpenSearch}
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg bg-[#0B3D5C]/60 hover:bg-[#0B3D5C] border border-[#135D8D]/40 text-sky-400 transition-colors cursor-pointer"
            title="Global Navigation Search (CTRL + K)"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* 3. USER PROFILE SUMMARY CARD */}
        {!isCollapsed ? (
          <div className="p-2.5 bg-[#0B3D5C]/90 rounded-xl border border-[#135D8D]/50 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F4C75] text-white flex items-center justify-center font-bold text-xs border border-[#2A85C8]/30 shrink-0">
              {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">{user.fullName || user.email || 'User'}</p>
              <span className="inline-block px-1.5 py-0.2 text-[9px] font-semibold bg-[#EA580C]/20 text-[#FB923C] rounded-full border border-[#EA580C]/40">
                {t.roles[user.role as keyof typeof t.roles] || user.role}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-0.5">
            <div className="w-9 h-9 rounded-lg bg-[#0F4C75] text-white flex items-center justify-center font-bold text-xs border border-[#2A85C8]/30 shadow-xs" title={user.fullName || user.email}>
              {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* 4. PINNED FAVORITES SECTION */}
        {pinnedTabs.length > 0 && (
          <div className="space-y-1 pb-2 border-b border-[#0B3D5C]">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold text-amber-300/80 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{isAr ? 'المفضلة المثبتة' : 'Pinned Favorites'}</span>
              </div>
            )}
            <div className="space-y-0.5">
              {pinnedTabs.map(pinId => {
                const isActive = currentTab === pinId;
                return (
                  <button
                    key={pinId}
                    onClick={() => onSelectTab(pinId)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0F4C75] text-amber-300 font-bold shadow-xs border-l-2 border-amber-400'
                        : 'text-slate-300 hover:bg-[#0B3D5C] hover:text-white'
                    }`}
                    title={isCollapsed ? getTabLabel(pinId) : undefined}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      {!isCollapsed && <span className="truncate">{getTabLabel(pinId)}</span>}
                    </div>
                    {!isCollapsed && (
                      <span 
                        onClick={(e) => togglePin(pinId, e)}
                        className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                        title="Unpin from Favorites"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. PRIMARY NAVIGATION GROUPS */}
        {isCustomer ? (
          <nav className="space-y-1">
            {customerNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              const isPinned = pinnedTabs.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer group/item ${
                    isActive
                      ? `bg-[#0F4C75] text-white font-bold shadow-sm ${isAr ? 'border-r-4' : 'border-l-4'} border-[#EA580C]`
                      : 'text-slate-200 hover:bg-[#0B3D5C] hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-sky-300/80'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-1">
                      {renderBadge(item.badge, item.badgeType, item.isNew)}
                      <span 
                        onClick={(e) => togglePin(item.id, e)}
                        className={`p-1 opacity-0 group-hover/item:opacity-100 transition-opacity ${isPinned ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'}`}
                      >
                        <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-400' : ''}`} />
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        ) : (
          /* Enterprise Admin Accordion Navigation Groups */
          <div className="space-y-3">
            {adminGroups.map((group, gIdx) => {
              const groupTitle = isAr ? group.groupAr : group.groupEn;
              const isExpanded = expandedGroups[groupTitle] ?? true;

              return (
                <div key={gIdx} className="space-y-1">
                  {!isCollapsed ? (
                    <button
                      onClick={() => toggleGroup(groupTitle)}
                      className="w-full px-2 pt-2 pb-1 text-[10px] font-bold text-sky-200/70 uppercase tracking-wider flex items-center justify-between hover:text-white transition-colors cursor-pointer"
                    >
                      <span>{groupTitle}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-sky-300/60" /> : <ChevronRight className="w-3 h-3 text-sky-300/60" />}
                    </button>
                  ) : (
                    <div className="h-px bg-[#0B3D5C] my-1.5" />
                  )}

                  {(isCollapsed || isExpanded) && (
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        const isPinned = pinnedTabs.includes(item.id);

                        return (
                          <button
                            key={item.id}
                            onClick={() => onSelectTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer group/item ${
                              isActive
                                ? `bg-[#0F4C75] text-white font-bold shadow-sm ${isAr ? 'border-r-4' : 'border-l-4'} border-[#EA580C]`
                                : 'text-slate-200 hover:bg-[#0B3D5C] hover:text-white'
                            }`}
                            title={isCollapsed ? item.label : undefined}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#EA580C]' : 'text-sky-300/80'}`} />
                              {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </div>
                            {!isCollapsed && (
                              <div className="flex items-center gap-1">
                                {renderBadge(item.badge, item.badgeType, item.isNew)}
                                <span 
                                  onClick={(e) => togglePin(item.id, e)}
                                  className={`p-1 opacity-0 group-hover/item:opacity-100 transition-opacity ${isPinned ? 'text-amber-400' : 'text-slate-400 hover:text-amber-300'}`}
                                  title={isPinned ? 'Unpin' : 'Pin to Favorites'}
                                >
                                  <Star className={`w-3 h-3 ${isPinned ? 'fill-amber-400' : ''}`} />
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 6. RECENT PAGES SECTION */}
        {!isCollapsed && recentTabs.length > 0 && (
          <div className="pt-2 border-t border-[#0B3D5C] space-y-1">
            <div className="px-3 text-[10px] font-bold text-sky-200/50 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{isAr ? 'المصفحة مؤخراً' : 'Recently Visited'}</span>
              </span>
              <button
                onClick={() => setRecentTabs([])}
                className="text-[9px] hover:text-sky-300 transition-colors"
              >
                {isAr ? 'مسح' : 'Clear'}
              </button>
            </div>
            {recentTabs.map(rec => (
              <button
                key={rec.id}
                onClick={() => onSelectTab(rec.id)}
                className="w-full px-3 py-1 text-[11px] text-slate-400 hover:text-white hover:bg-[#0B3D5C]/50 rounded flex items-center justify-between transition-colors text-start"
              >
                <span className="truncate">{rec.label}</span>
                <span className="text-[9px] font-mono text-slate-500">{rec.time}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 7. ENTERPRISE SIDEBAR FOOTER */}
      <div className="pt-3 border-t border-[#0B3D5C] space-y-2 mt-auto">
        
        {/* System Health SLA Status */}
        {!isCollapsed && (
          <div className="p-2 rounded-lg bg-[#0B3D5C]/60 border border-[#135D8D]/30 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SLA 99.98%</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">OPERATIONAL</span>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-[#0B3D5C] rounded-lg transition-colors font-semibold border border-[#135D8D]/40 cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-300" />}
            {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </span>
          {!isCollapsed && (
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#0B3D5C] text-[#FB923C] font-mono font-semibold">
              {theme.toUpperCase()}
            </span>
          )}
        </button>

        {/* Logout Action */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 rounded-lg transition-colors font-semibold cursor-pointer"
          title={isCollapsed ? t.nav.logout : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{t.nav.logout}</span>}
        </button>

        {/* Footer Version Tag */}
        {!isCollapsed && (
          <div className="text-center pt-1 text-[10px] font-mono text-sky-200/40">
            AJA LOGISTICS • v4.2.0-PROD
          </div>
        )}
      </div>
    </aside>
  );
};


