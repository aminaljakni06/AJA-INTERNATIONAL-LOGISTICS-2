import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  FileText, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Phone, 
  Mail, 
  Layers, 
  Plus,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { MasterOrganizationNode, OrganizationType, OrganizationStatus } from '../../../types/organizationMaster';

interface EnterpriseOrganizationExplorerProps {
  onCreateNode: () => void;
  onEditNode: (node: MasterOrganizationNode) => void;
}

export const EnterpriseOrganizationExplorer: React.FC<EnterpriseOrganizationExplorerProps> = ({
  onCreateNode,
  onEditNode
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [nodes, setNodes] = useState<MasterOrganizationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedCountry !== 'ALL') params.append('country', selectedCountry);

      const res = await fetch(`/api/organization/master/nodes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNodes(await res.json());
      }
    } catch (err) {
      console.error('[OrganizationExplorer] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, [search, selectedType, selectedStatus, selectedCountry]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(isAr ? `هل أنت تأكد من حذف الكيان التنظيمي: ${name}؟` : `Are you sure you want to delete ${name}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/organization/master/nodes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNodes();
      }
    } catch (err) {
      console.error('[OrganizationExplorer] Delete error:', err);
    }
  };

  const getTypeBadge = (type: OrganizationType) => {
    const config: Record<string, { bg: string; text: string; labelEn: string; labelAr: string }> = {
      HOLDING_COMPANY: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', labelEn: 'Holding Company', labelAr: 'شركة قابضة' },
      COMPANY: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800', labelEn: 'Company', labelAr: 'شركة' },
      SUBSIDIARY: { bg: 'bg-indigo-100 border-indigo-300', text: 'text-indigo-800', labelEn: 'Subsidiary', labelAr: 'شركة تابعة' },
      REGIONAL_OFFICE: { bg: 'bg-sky-100 border-sky-300', text: 'text-sky-800', labelEn: 'Regional Office', labelAr: 'مكتب إقليمي' },
      BRANCH: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', labelEn: 'Branch', labelAr: 'فرع' },
      DISTRIBUTION_CENTER: { bg: 'bg-purple-100 border-purple-300', text: 'text-purple-800', labelEn: 'Distribution Center', labelAr: 'مركز توزيع' },
      WAREHOUSE: { bg: 'bg-teal-100 border-teal-300', text: 'text-teal-800', labelEn: 'Warehouse', labelAr: 'مستودع' },
      TERMINAL: { bg: 'bg-cyan-100 border-cyan-300', text: 'text-cyan-800', labelEn: 'Terminal', labelAr: 'محطة شحن' },
      PORT_OFFICE: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-800', labelEn: 'Port Office', labelAr: 'مكتب ميناء' },
      DEPARTMENT: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800', labelEn: 'Department', labelAr: 'إدارة / قسم' },
      BUSINESS_UNIT: { bg: 'bg-violet-100 border-violet-300', text: 'text-violet-800', labelEn: 'Business Unit', labelAr: 'وحدة أعمال' },
    };

    const cfg = config[type] || { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', labelEn: type, labelAr: type };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${cfg.bg} ${cfg.text}`}>
        {isAr ? cfg.labelAr : cfg.labelEn}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 rtl:right-3.5 rtl:left-auto" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث بالرمز، الاسم بالعربية أو الإنجليزية...' : 'Search by code, English name, or Arabic name...'}
              className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{isAr ? 'جميع أنواع الكيانات' : 'All Entity Types'}</option>
              <option value="HOLDING_COMPANY">{isAr ? 'شركة قابضة' : 'Holding Company'}</option>
              <option value="SUBSIDIARY">{isAr ? 'شركة تابعة' : 'Subsidiary'}</option>
              <option value="REGIONAL_OFFICE">{isAr ? 'مكتب إقليمي' : 'Regional Office'}</option>
              <option value="BRANCH">{isAr ? 'فرع' : 'Branch'}</option>
              <option value="WAREHOUSE">{isAr ? 'مستودع' : 'Warehouse'}</option>
              <option value="DEPARTMENT">{isAr ? 'إدارة' : 'Department'}</option>
              <option value="BUSINESS_UNIT">{isAr ? 'وحدة أعمال' : 'Business Unit'}</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="ACTIVE">{isAr ? 'نشط' : 'Active'}</option>
              <option value="INACTIVE">{isAr ? 'غير نشط' : 'Inactive'}</option>
              <option value="SUSPENDED">{isAr ? 'معلق' : 'Suspended'}</option>
            </select>

            <button
              onClick={onCreateNode}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm text-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة كيان جديد' : 'Add Org Node'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nodes Explorer Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
          {isAr ? 'جاري تحميل الهيكل التنظيمي للمؤسسة...' : 'Loading Enterprise Organization Registry...'}
        </div>
      ) : nodes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">{isAr ? 'لا توجد كيانات تنظيمية مطابقة' : 'No Organization Nodes Found'}</h3>
          <p className="text-xs text-slate-500">{isAr ? 'قم بتعديل معايير البحث أو إضافة كيان جديد للهيكل التنظيمي.' : 'Try adjusting search query or add a new master organization node.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nodes.map(node => (
            <div
              key={node.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        {node.code}
                      </span>
                      {getTypeBadge(node.type)}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {isAr ? node.nameAr : node.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{isAr ? node.name : node.nameAr}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      node.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {node.status}
                  </span>
                </div>

                {/* Lineage path & depth indicator */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[11px] text-slate-600 font-mono space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                    <span>{isAr ? 'المسار الهيكلي' : 'Lineage Path'}</span>
                    <span className="font-bold text-slate-700">{isAr ? `العمق: ${node.depth}` : `Depth: ${node.depth}`}</span>
                  </div>
                  <p className="truncate font-medium text-slate-800">{node.lineagePath}</p>
                </div>

                {/* Key metadata list */}
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{node.geographic.city}, {node.geographic.country}</span>
                  </div>

                  {node.legalEntity?.commercialRegistration && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate font-mono text-[11px]">CR: {node.legalEntity.commercialRegistration} | VAT: {node.legalEntity.vatNumber}</span>
                    </div>
                  )}

                  {node.financial?.costCenterCode && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate text-[11px] font-semibold text-emerald-800">
                        {node.financial.costCenterCode} ({node.financial.currency} {(node.financial.budgetAllocated / 1000000).toFixed(1)}M)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{isAr ? `المشرف: ${node.dataSteward}` : `Steward: ${node.dataSteward}`}</span>
                  </div>
                </div>

                {/* Tags */}
                {node.tags && node.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {node.tags.map(t => (
                      <span key={t} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">v{node.version} | {node.effectiveDate}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditNode(node)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition"
                    title={isAr ? 'تعديل البيانات' : 'Edit Details'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(node.id, isAr ? node.nameAr : node.name)}
                    className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition"
                    title={isAr ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
