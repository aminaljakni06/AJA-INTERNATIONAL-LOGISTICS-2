import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { 
  Database, 
  ShieldCheck, 
  GitMerge, 
  Network, 
  Layers, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  Plus, 
  Clock,
  Building2,
  FolderTree,
  DollarSign,
  MapPin,
  Anchor,
  Compass
} from 'lucide-react';
import { MasterDataExplorer } from '../../components/mdm/MasterDataExplorer';
import { MasterDataEditorModal } from '../../components/mdm/MasterDataEditorModal';
import { DuplicateViewerMergeWizard } from '../../components/mdm/DuplicateViewerMergeWizard';
import { DataQualityValidationView } from '../../components/mdm/DataQualityValidationView';
import { ReferenceRelationshipGraphView } from '../../components/mdm/ReferenceRelationshipGraphView';

import { EnterpriseOrganizationExplorer } from '../../components/mdm/org/EnterpriseOrganizationExplorer';
import { HierarchyTreeVisualizer } from '../../components/mdm/org/HierarchyTreeVisualizer';
import { LegalEntityRegistryView } from '../../components/mdm/org/LegalEntityRegistryView';
import { CostProfitCenterManager } from '../../components/mdm/org/CostProfitCenterManager';
import { OrganizationRelationshipViewer } from '../../components/mdm/org/OrganizationRelationshipViewer';
import { OrganizationNodeEditorModal } from '../../components/mdm/org/OrganizationNodeEditorModal';

import { BusinessPartnerExplorer } from '../../components/mdm/bp/BusinessPartnerExplorer';
import { PartnerProfileView } from '../../components/mdm/bp/PartnerProfileView';
import { PartnerEditorModal } from '../../components/mdm/bp/PartnerEditorModal';
import { BPComplianceCenter } from '../../components/mdm/bp/BPComplianceCenter';
import { BPCreditRiskManager } from '../../components/mdm/bp/BPCreditRiskManager';
import { BPRelationshipManager } from '../../components/mdm/bp/BPRelationshipManager';
import { BPDuplicateResolutionWizard } from '../../components/mdm/bp/BPDuplicateResolutionWizard';

import { LocationExplorer } from '../../components/mdm/location/LocationExplorer';
import { CountryManager } from '../../components/mdm/location/CountryManager';
import { PortAirportRegistry } from '../../components/mdm/location/PortAirportRegistry';
import { WarehouseRegistry } from '../../components/mdm/location/WarehouseRegistry';
import { TradeLaneManager } from '../../components/mdm/location/TradeLaneManager';
import { GeofenceManager } from '../../components/mdm/location/GeofenceManager';

import { ProductExplorer } from '../../components/mdm/resource/ProductExplorer';
import { ServiceCatalogManager } from '../../components/mdm/resource/ServiceCatalogManager';
import { AssetManager } from '../../components/mdm/resource/AssetManager';
import { FleetVehicleRegistry } from '../../components/mdm/resource/FleetVehicleRegistry';
import { EquipmentManager } from '../../components/mdm/resource/EquipmentManager';
import { CommodityUomRegistry } from '../../components/mdm/resource/CommodityUomRegistry';

import { MasterDataRecord, MDMAnalytics } from '../../types/mdm';
import { MasterOrganizationNode } from '../../types/organizationMaster';
import { BusinessPartner } from '../../types/businessPartner';

type MDMTab = 'EXPLORER' | 'BUSINESS_PARTNERS' | 'ORGANIZATION' | 'LOCATION' | 'RESOURCE' | 'QUALITY' | 'DUPLICATES' | 'RELATIONSHIPS';
type OrgSubTab = 'NODES' | 'HIERARCHY' | 'LEGAL' | 'FINANCIAL' | 'RELATIONSHIPS';
type BPSubTab = 'BP_EXPLORER' | 'BP_COMPLIANCE' | 'BP_CREDIT' | 'BP_RELATIONSHIPS' | 'BP_DUPLICATES';
type LocationSubTab = 'LOC_EXPLORER' | 'COUNTRIES' | 'PORTS_AIRPORTS' | 'WAREHOUSES' | 'TRADE_LANES' | 'GEOFENCES';
type ResourceSubTab = 'PRODUCTS' | 'SERVICES' | 'ASSETS' | 'FLEET' | 'EQUIPMENT' | 'COMMODITIES';

export const AdminMasterDataManagement: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({
  activeTab,
  setActiveTab
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [currentTab, setCurrentTab] = useState<MDMTab>('EXPLORER');
  const [orgSubTab, setOrgSubTab] = useState<OrgSubTab>('NODES');
  const [bpSubTab, setBpSubTab] = useState<BPSubTab>('BP_EXPLORER');
  const [locSubTab, setLocSubTab] = useState<LocationSubTab>('LOC_EXPLORER');
  const [resSubTab, setResSubTab] = useState<ResourceSubTab>('PRODUCTS');
  const [analytics, setAnalytics] = useState<MDMAnalytics | null>(null);
  
  // Master record editor
  const [editingRecord, setEditingRecord] = useState<MasterDataRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Org Node editor
  const [editingOrgNode, setEditingOrgNode] = useState<MasterOrganizationNode | null>(null);
  const [isOrgNodeEditorOpen, setIsOrgNodeEditorOpen] = useState(false);

  // Business Partner state
  const [editingPartner, setEditingPartner] = useState<BusinessPartner | null>(null);
  const [selectedPartnerForView, setSelectedPartnerForView] = useState<BusinessPartner | null>(null);
  const [isBpEditorOpen, setIsBpEditorOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/mdm/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch (err) {
      console.error('[MDMAnalytics] Fetch Error:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (record: MasterDataRecord) => {
    setEditingRecord(record);
    setIsEditorOpen(true);
  };

  const handleSaved = () => {
    setIsEditorOpen(false);
    setEditingRecord(null);
    fetchAnalytics();
  };

  // Org Node Modal
  const handleOpenCreateOrgNode = () => {
    setEditingOrgNode(null);
    setIsOrgNodeEditorOpen(true);
  };

  const handleOpenEditOrgNode = (node: MasterOrganizationNode) => {
    setEditingOrgNode(node);
    setIsOrgNodeEditorOpen(true);
  };

  const handleOrgNodeSaved = () => {
    setIsOrgNodeEditorOpen(false);
    setEditingOrgNode(null);
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        {/* Executive Header Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs tracking-wider uppercase">
              <Database className="w-5 h-5" />
              <span>{isAr ? 'منصة إدارة البيانات الرئيسية للشركة' : 'Enterprise Master Data Management (MDM) Platform'}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{isAr ? 'المصدر الموحد والموثوق للبيانات اللوجستية والهياكل' : 'Single Source of Truth & Master Data Foundation'}</h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isAr
                ? 'إدارة وحوكمة كافة الكيانات الرئيسية والهيكل التنظيمي (الشركات، الفروع، المراكز، العملاء، الموردين، الناقلين، المستودعات والعملات) مع ضمان جودة البيانات والتكامل الموحد.'
                : 'Central registry governing master domains & organization structure (Holding, Subsidiaries, Branches, Warehouses, Customers, Carriers, Currencies) with quality enforcement.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentTab === 'ORGANIZATION' ? (
              <button
                onClick={handleOpenCreateOrgNode}
                className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition text-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'كيان تنظيمي جديد' : 'New Org Node'}</span>
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition text-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'سجل رئيسي جديد' : 'New Master Record'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Executive KPI Stats Bar */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'إجمالي السجلات' : 'Master Records'}</p>
              <h3 className="text-2xl font-black text-slate-900">{analytics.totalRecords}</h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'المجالات النشطة' : 'Active Domains'}</p>
              <h3 className="text-2xl font-black text-sky-600">{analytics.activeDomainsCount}</h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'مؤشر جودة البيانات' : 'Quality Index'}</p>
              <h3 className="text-2xl font-black text-emerald-600">{analytics.averageQualityScore}%</h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'تكرارات معلقة' : 'Open Duplicates'}</p>
              <h3 className="text-2xl font-black text-amber-600">{analytics.openDuplicatesCount}</h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-1">
              <p className="text-[11px] font-semibold text-slate-500">{isAr ? 'اعتمادات قيد الانتظار' : 'Pending Approvals'}</p>
              <h3 className="text-2xl font-black text-purple-600">{analytics.pendingApprovalsCount}</h3>
            </div>
          </div>
        )}

        {/* MDM Main Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('EXPLORER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'EXPLORER'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'دليل البيانات الرئيسية (Master Registry)' : 'Master Registry & Explorer'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('BUSINESS_PARTNERS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'BUSINESS_PARTNERS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'شركاء الأعمال (Business Partner Master)' : 'Business Partner Master'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('ORGANIZATION')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'ORGANIZATION'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'الهيكل التنظيمي للمؤسسة (Org Master)' : 'Enterprise Organization Master'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('LOCATION')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'LOCATION'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'المواقع الجغرافية واللوجستيات (Location Master)' : 'Location & Logistics Master'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('RESOURCE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'RESOURCE'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{isAr ? 'المنتجات، الأصول والكوادر (Product & Resource Master)' : 'Product, Asset & Resource Master'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('QUALITY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'QUALITY'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'جودة البيانات والقواعد (Data Quality)' : 'Data Quality & Governance'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('DUPLICATES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'DUPLICATES'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitMerge className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'دمج التكرارات (Deduplication & Merge)' : 'Deduplication & Merge Wizard'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('RELATIONSHIPS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap ${
              currentTab === 'RELATIONSHIPS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Network className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'شبكة العلاقات (Entity Relationships)' : 'Cross-Entity Relationships'}</span>
          </button>
        </div>

        {/* Business Partner Sub-Navigation Bar if BUSINESS_PARTNERS tab is selected */}
        {currentTab === 'BUSINESS_PARTNERS' && !selectedPartnerForView && (
          <div className="bg-slate-100/80 rounded-2xl p-1.5 flex items-center gap-2 overflow-x-auto text-xs font-bold border border-slate-200">
            <button
              onClick={() => setBpSubTab('BP_EXPLORER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                bpSubTab === 'BP_EXPLORER' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{isAr ? 'سجل شركاء الأعمال' : 'BP Registry'}</span>
            </button>

            <button
              onClick={() => setBpSubTab('BP_COMPLIANCE')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                bpSubTab === 'BP_COMPLIANCE' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'الامتثال و KYC' : 'Compliance & KYC'}</span>
            </button>

            <button
              onClick={() => setBpSubTab('BP_CREDIT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                bpSubTab === 'BP_CREDIT' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{isAr ? 'المخاطر والائتمان' : 'Credit Risk & Limits'}</span>
            </button>

            <button
              onClick={() => setBpSubTab('BP_RELATIONSHIPS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                bpSubTab === 'BP_RELATIONSHIPS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>{isAr ? 'شبكة العلاقات' : 'Partner Network'}</span>
            </button>

            <button
              onClick={() => setBpSubTab('BP_DUPLICATES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                bpSubTab === 'BP_DUPLICATES' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GitMerge className="w-4 h-4" />
              <span>{isAr ? 'معالج التكرارات' : 'Deduplication Wizard'}</span>
            </button>
          </div>
        )}

        {/* Location Sub-Navigation Bar if LOCATION tab is selected */}
        {currentTab === 'LOCATION' && (
          <div className="bg-slate-100/80 rounded-2xl p-1.5 flex items-center gap-2 overflow-x-auto text-xs font-bold border border-slate-200">
            <button
              onClick={() => setLocSubTab('LOC_EXPLORER')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                locSubTab === 'LOC_EXPLORER' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{isAr ? 'مستكشف شبكة المواقع' : 'Location Explorer'}</span>
            </button>

            <button
              onClick={() => setLocSubTab('COUNTRIES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                locSubTab === 'COUNTRIES' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{isAr ? 'الدول والمدن' : 'Countries & Cities'}</span>
            </button>

            <button
              onClick={() => setLocSubTab('PORTS_AIRPORTS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                locSubTab === 'PORTS_AIRPORTS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Anchor className="w-4 h-4" />
              <span>{isAr ? 'الموانئ والمطارات (UN/LOCODE)' : 'Ports & Airports'}</span>
            </button>

            <button
              onClick={() => setLocSubTab('WAREHOUSES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                locSubTab === 'WAREHOUSES' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isAr ? 'المستودعات ومراكز التوزيع' : 'Warehouse Hubs'}</span>
            </button>

            <button
              onClick={() => setLocSubTab('TRADE_LANES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                locSubTab === 'TRADE_LANES' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{isAr ? 'الممرات التجارية وشبكة الطرق' : 'Trade Lanes'}</span>
            </button>

            <button
              onClick={() => setLocSubTab('GEOFENCES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                locSubTab === 'GEOFENCES' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'التسيير الجغرافي (Geofencing)' : 'Geofence Zones'}</span>
            </button>
          </div>
        )}

        {/* Resource Sub-Navigation Bar if RESOURCE tab is selected */}
        {currentTab === 'RESOURCE' && (
          <div className="bg-slate-100/80 rounded-2xl p-1.5 flex items-center gap-2 overflow-x-auto text-xs font-bold border border-slate-200">
            <button
              onClick={() => setResSubTab('PRODUCTS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                resSubTab === 'PRODUCTS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{isAr ? 'المنتجات والوحدات (Products/SKUs)' : 'Products & SKUs'}</span>
            </button>

            <button
              onClick={() => setResSubTab('SERVICES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                resSubTab === 'SERVICES' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{isAr ? 'دليل الخدمات والأسعار' : 'Services & Packages'}</span>
            </button>

            <button
              onClick={() => setResSubTab('ASSETS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                resSubTab === 'ASSETS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{isAr ? 'الأصول والملفات الرقمية' : 'Assets & CADs'}</span>
            </button>

            <button
              onClick={() => setResSubTab('FLEET')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                resSubTab === 'FLEET' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{isAr ? 'الأسطول والحاويات (ISO 6346)' : 'Fleet & Containers'}</span>
            </button>

            <button
              onClick={() => setResSubTab('EQUIPMENT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                resSubTab === 'EQUIPMENT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{isAr ? 'معدات المستودع والسائقين' : 'Equipment & Drivers'}</span>
            </button>

            <button
              onClick={() => setResSubTab('COMMODITIES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                resSubTab === 'COMMODITIES' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{isAr ? 'تصنيفات HS وحاسبة UOM' : 'Commodity & UOM Matrix'}</span>
            </button>
          </div>
        )}

        {/* Organization Sub-Navigation Bar if Organization tab is selected */}
        {currentTab === 'ORGANIZATION' && (
          <div className="bg-slate-100/80 rounded-2xl p-1.5 flex items-center gap-2 overflow-x-auto text-xs font-bold border border-slate-200">
            <button
              onClick={() => setOrgSubTab('NODES')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                orgSubTab === 'NODES' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{isAr ? 'دليل الكيانات التنظيمية' : 'Organization Nodes'}</span>
            </button>

            <button
              onClick={() => setOrgSubTab('HIERARCHY')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                orgSubTab === 'HIERARCHY' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>{isAr ? 'شجرة الهيكل التنظيمي' : 'Hierarchy Tree'}</span>
            </button>

            <button
              onClick={() => setOrgSubTab('LEGAL')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                orgSubTab === 'LEGAL' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{isAr ? 'الكيانات والسجلات القانونية' : 'Legal Entities & CR'}</span>
            </button>

            <button
              onClick={() => setOrgSubTab('FINANCIAL')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                orgSubTab === 'FINANCIAL' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{isAr ? 'مراكز التكلفة والربحية' : 'Cost & Profit Centers'}</span>
            </button>

            <button
              onClick={() => setOrgSubTab('RELATIONSHIPS')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                orgSubTab === 'RELATIONSHIPS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>{isAr ? 'الخدمات والعلاقات المشتركة' : 'Cross-Entity Services'}</span>
            </button>
          </div>
        )}

        {/* Tab View Render */}
        {currentTab === 'EXPLORER' && (
          <MasterDataExplorer
            onCreateRecord={handleOpenCreate}
            onEditRecord={handleOpenEdit}
          />
        )}

        {currentTab === 'BUSINESS_PARTNERS' && (
          <>
            {selectedPartnerForView ? (
              <PartnerProfileView
                partner={selectedPartnerForView}
                onBack={() => setSelectedPartnerForView(null)}
                onEdit={() => {
                  setEditingPartner(selectedPartnerForView);
                  setIsBpEditorOpen(true);
                }}
              />
            ) : (
              <>
                {bpSubTab === 'BP_EXPLORER' && (
                  <BusinessPartnerExplorer
                    onCreatePartner={() => {
                      setEditingPartner(null);
                      setIsBpEditorOpen(true);
                    }}
                    onEditPartner={p => {
                      setEditingPartner(p);
                      setIsBpEditorOpen(true);
                    }}
                    onSelectPartner={p => setSelectedPartnerForView(p)}
                  />
                )}
                {bpSubTab === 'BP_COMPLIANCE' && <BPComplianceCenter />}
                {bpSubTab === 'BP_CREDIT' && <BPCreditRiskManager />}
                {bpSubTab === 'BP_RELATIONSHIPS' && <BPRelationshipManager />}
                {bpSubTab === 'BP_DUPLICATES' && <BPDuplicateResolutionWizard />}
              </>
            )}
          </>
        )}

        {currentTab === 'LOCATION' && (
          <>
            {locSubTab === 'LOC_EXPLORER' && (
              <LocationExplorer
                onOpenCountryManager={() => setLocSubTab('COUNTRIES')}
                onOpenPortRegistry={() => setLocSubTab('PORTS_AIRPORTS')}
                onOpenWarehouseRegistry={() => setLocSubTab('WAREHOUSES')}
                onOpenTradeLaneManager={() => setLocSubTab('TRADE_LANES')}
              />
            )}
            {locSubTab === 'COUNTRIES' && <CountryManager />}
            {locSubTab === 'PORTS_AIRPORTS' && <PortAirportRegistry />}
            {locSubTab === 'WAREHOUSES' && <WarehouseRegistry />}
            {locSubTab === 'TRADE_LANES' && <TradeLaneManager />}
            {locSubTab === 'GEOFENCES' && <GeofenceManager />}
          </>
        )}

        {currentTab === 'RESOURCE' && (
          <>
            {resSubTab === 'PRODUCTS' && <ProductExplorer />}
            {resSubTab === 'SERVICES' && <ServiceCatalogManager />}
            {resSubTab === 'ASSETS' && <AssetManager />}
            {resSubTab === 'FLEET' && <FleetVehicleRegistry />}
            {resSubTab === 'EQUIPMENT' && <EquipmentManager />}
            {resSubTab === 'COMMODITIES' && <CommodityUomRegistry />}
          </>
        )}

        {currentTab === 'ORGANIZATION' && (
          <>
            {orgSubTab === 'NODES' && (
              <EnterpriseOrganizationExplorer
                onCreateNode={handleOpenCreateOrgNode}
                onEditNode={handleOpenEditOrgNode}
              />
            )}
            {orgSubTab === 'HIERARCHY' && (
              <HierarchyTreeVisualizer onEditNode={handleOpenEditOrgNode} />
            )}
            {orgSubTab === 'LEGAL' && <LegalEntityRegistryView />}
            {orgSubTab === 'FINANCIAL' && <CostProfitCenterManager />}
            {orgSubTab === 'RELATIONSHIPS' && <OrganizationRelationshipViewer />}
          </>
        )}

        {currentTab === 'QUALITY' && <DataQualityValidationView />}

        {currentTab === 'DUPLICATES' && <DuplicateViewerMergeWizard />}

        {currentTab === 'RELATIONSHIPS' && <ReferenceRelationshipGraphView />}

        {/* Master Record Editor Modal */}
        {isEditorOpen && (
          <MasterDataEditorModal
            record={editingRecord}
            onClose={() => setIsEditorOpen(false)}
            onSaved={handleSaved}
          />
        )}

        {/* Org Node Editor Modal */}
        {isOrgNodeEditorOpen && (
          <OrganizationNodeEditorModal
            node={editingOrgNode}
            onClose={() => setIsOrgNodeEditorOpen(false)}
            onSaved={handleOrgNodeSaved}
          />
        )}

        {/* Business Partner Editor Modal */}
        {isBpEditorOpen && (
          <PartnerEditorModal
            partner={editingPartner}
            onClose={() => setIsBpEditorOpen(false)}
            onSaved={() => {
              setIsBpEditorOpen(false);
              setEditingPartner(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

