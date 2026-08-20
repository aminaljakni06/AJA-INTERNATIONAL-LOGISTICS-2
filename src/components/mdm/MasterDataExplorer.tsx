import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Database, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Tag, 
  Filter, 
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { MasterDataRecord, MasterDataDomain } from '../../types/mdm';

interface MasterDataExplorerProps {
  onSelectRecord?: (record: MasterDataRecord) => void;
  onEditRecord?: (record: MasterDataRecord) => void;
  onCreateRecord?: () => void;
  onViewHistory?: (record: MasterDataRecord) => void;
}

const ALL_DOMAINS: { key: MasterDataDomain; labelEn: string; labelAr: string }[] = [
  { key: 'CUSTOMER', labelEn: 'Customer Master', labelAr: 'سجل العملاء' },
  { key: 'VENDOR', labelEn: 'Vendor Master', labelAr: 'سجل الموردين' },
  { key: 'CARRIER', labelEn: 'Carrier Master', labelAr: 'سجل الناقلين' },
  { key: 'WAREHOUSE', labelEn: 'Warehouse Master', labelAr: 'سجل المستودعات' },
  { key: 'FLEET', labelEn: 'Fleet Master', labelAr: 'سجل الأسطول' },
  { key: 'VEHICLE', labelEn: 'Vehicle Master', labelAr: 'سجل المركبات' },
  { key: 'DRIVER', labelEn: 'Driver Master', labelAr: 'سجل السائقين' },
  { key: 'EMPLOYEE', labelEn: 'Employee Master', labelAr: 'سجل الموظفين' },
  { key: 'COMPANY', labelEn: 'Company Master', labelAr: 'سجل الشركات' },
  { key: 'BRANCH', labelEn: 'Branch Master', labelAr: 'سجل الفروع' },
  { key: 'DEPARTMENT', labelEn: 'Department Master', labelAr: 'سجل الأقسام' },
  { key: 'COUNTRY', labelEn: 'Country Master', labelAr: 'سجل الدول' },
  { key: 'CITY', labelEn: 'City Master', labelAr: 'سجل المدن' },
  { key: 'REGION', labelEn: 'Region Master', labelAr: 'سجل المناطق' },
  { key: 'PORT', labelEn: 'Port Master', labelAr: 'سجل الموانئ' },
  { key: 'AIRPORT', labelEn: 'Airport Master', labelAr: 'سجل المطارات' },
  { key: 'CURRENCY', labelEn: 'Currency Master', labelAr: 'سجل العملات' },
  { key: 'EXCHANGE_RATE', labelEn: 'Exchange Rate Master', labelAr: 'سجل أسعار الصرف' },
  { key: 'LANGUAGE', labelEn: 'Language Master', labelAr: 'سجل اللغات' },
  { key: 'UOM', labelEn: 'Unit of Measure (UOM)', labelAr: 'وحدات القياس' },
  { key: 'PACKAGING_TYPE', labelEn: 'Packaging Types', labelAr: 'أنواع التغليف' },
  { key: 'INCOTERM', labelEn: 'Incoterms Master', labelAr: 'شروط الشحن الدولية (Incoterms)' },
  { key: 'PAYMENT_TERM', labelEn: 'Payment Terms', labelAr: 'شروط الدفع' },
  { key: 'TAX_CODE', labelEn: 'Tax & VAT Codes', labelAr: 'رموز الضرائب والضريبة المضافة' },
  { key: 'COMMODITY_CATEGORY', labelEn: 'Commodity Categories', labelAr: 'تصنيفات البضائع' },
  { key: 'HAZMAT', labelEn: 'Hazardous Materials', labelAr: 'المواد الخطرة (Hazmat)' },
  { key: 'CONTAINER_TYPE', labelEn: 'Container Types', labelAr: 'أنواع الحاويات' },
  { key: 'SERVICE_CATALOG', labelEn: 'Service Catalog', labelAr: 'دليل الخدمات' },
  { key: 'PRODUCT_CATALOG', labelEn: 'Product Catalog', labelAr: 'دليل المنتجات' },
  { key: 'DOCUMENT_TYPE', labelEn: 'Document Types', labelAr: 'أنواع المستندات' },
  { key: 'STATUS_CODE', labelEn: 'Status Codes', labelAr: 'رموز الحالات' },
  { key: 'REASON_CODE', labelEn: 'Reason Codes', labelAr: 'رموز الأسباب' },
  { key: 'BUSINESS_CALENDAR', labelEn: 'Business Calendar', labelAr: 'التقويم التشغيلي' },
  { key: 'HOLIDAY_CALENDAR', labelEn: 'Holiday Calendar', labelAr: 'تقويم العطلات' }
];

export const MasterDataExplorer: React.FC<MasterDataExplorerProps> = ({
  onEditRecord,
  onCreateRecord,
  onViewHistory
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<MasterDataRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const params = new URLSearchParams();
      if (selectedDomain !== 'ALL') params.append('domain', selectedDomain);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/mdm/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setRecords(await res.json());
      }
    } catch (err) {
      console.error('[MasterDataExplorer] Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedDomain, selectedStatus, searchQuery]);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/mdm/records/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      console.error('[ApproveRecord] Error:', err);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch(`/api/mdm/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      console.error('[ArchiveRecord] Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Domain Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute top-3 text-slate-400 ${isAr ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'البحث بالكود، الاسم بالعربية أو الإنجليزية...' : 'Search by code, Arabic, or English name...'}
              className={`w-full text-sm py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                isAr ? 'pr-9 pl-4' : 'pl-9 pr-4'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-sm px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
              <option value="ACTIVE">ACTIVE (نشط)</option>
              <option value="DRAFT">DRAFT (مسودة)</option>
              <option value="INACTIVE">INACTIVE (غير نشط)</option>
              <option value="SUSPENDED">SUSPENDED (موقوف)</option>
              <option value="ARCHIVED">ARCHIVED (مؤرشف)</option>
            </select>

            <button
              onClick={() => fetchRecords()}
              className="p-2.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition"
              title={isAr ? 'تحديث البيانات' : 'Refresh Data'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {onCreateRecord && (
              <button
                onClick={onCreateRecord}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة سجل رئيسي جديد' : 'New Master Record'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Domain Chips Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar border-t border-slate-100">
          <button
            onClick={() => setSelectedDomain('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedDomain === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ? 'جميع المجالات (All Domains)' : 'All Master Domains'}
          </button>

          {ALL_DOMAINS.map(d => (
            <button
              key={d.key}
              onClick={() => setSelectedDomain(d.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedDomain === d.key
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isAr ? d.labelAr : d.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Master Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map(r => (
          <div 
            key={r.id} 
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-amber-400 transition space-y-3 relative flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                  {r.code}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    r.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                    r.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' :
                    r.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {r.status}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase">
                    {r.domain}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{isAr ? r.nameAr : r.nameEn}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? r.nameEn : r.nameAr}</p>
                {r.description && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{r.description}</p>
                )}
              </div>

              {/* Metadata Key-Value Highlights */}
              {r.metadata && Object.keys(r.metadata).length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs font-mono">
                  {Object.entries(r.metadata).slice(0, 3).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[150px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges: Quality Score & Scope */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                  r.qualityScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  r.qualityScore >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  <span>Quality: {r.qualityScore}%</span>
                </span>

                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                  <Globe className="w-3 h-3" />
                  <span>v{r.version}</span>
                </span>

                {r.steward && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[120px]">
                    Steward: {r.steward}
                  </span>
                )}
              </div>
            </div>

            {/* Footer Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                {onEditRecord && (
                  <button
                    onClick={() => onEditRecord(r)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
                    title={isAr ? 'تعديل السجل' : 'Edit Record'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {onViewHistory && (
                  <button
                    onClick={() => onViewHistory(r)}
                    className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
                    title={isAr ? 'سجل النسخ والتدقيق' : 'Version History'}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleArchive(r.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                  title={isAr ? 'أرشفة السجل' : 'Archive Record'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {r.approvalStatus === 'PENDING' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleApprove(r.id, true)}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition text-[11px]"
                  >
                    {isAr ? 'اعتماد' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleApprove(r.id, false)}
                    className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg font-semibold hover:bg-rose-200 transition text-[11px]"
                  >
                    {isAr ? 'رفض' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {records.length === 0 && !loading && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <Database className="w-10 h-10 mx-auto opacity-50 text-slate-300" />
            <p className="text-sm font-medium">{isAr ? 'لا توجد سجلات رئيسية مطابقة لشروط البحث' : 'No master data records found matching your filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
