import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  MoreVertical, 
  FileText, 
  ExternalLink, 
  DollarSign,
  Phone,
  Mail,
  Tag
} from 'lucide-react';
import { BusinessPartner, BPRole, BPStatus, BPClassification } from '../../../types/businessPartner';

interface BusinessPartnerExplorerProps {
  onCreatePartner: () => void;
  onEditPartner: (partner: BusinessPartner) => void;
  onSelectPartner: (partner: BusinessPartner) => void;
}

export const BusinessPartnerExplorer: React.FC<BusinessPartnerExplorerProps> = ({
  onCreatePartner,
  onEditPartner,
  onSelectPartner
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedRole !== 'ALL') queryParams.append('role', selectedRole);
      if (selectedStatus !== 'ALL') queryParams.append('status', selectedStatus);
      if (selectedClassification !== 'ALL') queryParams.append('classification', selectedClassification);

      const res = await fetch(`/api/business-partners?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setPartners(await res.json());
      }
    } catch (err) {
      console.error('[BPExplorer] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [search, selectedRole, selectedStatus, selectedClassification]);

  const getStatusBadge = (status: BPStatus) => {
    const config: Record<BPStatus, { bg: string; text: string; labelEn: string; labelAr: string }> = {
      ACTIVE: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-800', labelEn: 'Active', labelAr: 'نشط' },
      DRAFT: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', labelEn: 'Draft', labelAr: 'مسودة' },
      ON_HOLD: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', labelEn: 'On Hold', labelAr: 'معلق' },
      SUSPENDED: { bg: 'bg-rose-100 border-rose-300', text: 'text-rose-800', labelEn: 'Suspended', labelAr: 'موقوف' },
      BLACK_LISTED: { bg: 'bg-slate-900 border-slate-700', text: 'text-rose-400', labelEn: 'Blacklisted', labelAr: 'قائمة سوداء' },
      ARCHIVED: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-500', labelEn: 'Archived', labelAr: 'مؤرشف' }
    };

    const cfg = config[status] || config.ACTIVE;
    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${cfg.bg} ${cfg.text}`}>
        {isAr ? cfg.labelAr : cfg.labelEn}
      </span>
    );
  };

  const getRoleBadge = (role: BPRole) => {
    const colors: Record<string, string> = {
      CUSTOMER: 'bg-sky-50 text-sky-700 border-sky-200',
      VENDOR: 'bg-purple-50 text-purple-700 border-purple-200',
      CARRIER: 'bg-amber-50 text-amber-700 border-amber-200',
      CUSTOMS_BROKER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      GOVERNMENT_AGENCY: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      '3PL': 'bg-teal-50 text-teal-700 border-teal-200'
    };
    const style = colors[role] || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span key={role} className={`px-2 py-0.5 text-[9px] font-black rounded-md border font-mono ${style}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'سجل شركاء الأعمال الموحد (Business Partners Master)' : 'Enterprise Business Partner Registry'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'مرجع شامل لجميع العملاء، الموردين، الناقلين، المخلصين الجمركيين، والجهات الحكومية مع متابعة الائتمان والامتثال.'
                : 'Central directory governing all Customers, Vendors, Carriers, Customs Brokers, and Government Agencies.'}
            </p>
          </div>

          <button
            onClick={onCreatePartner}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-sm text-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة شريك أعمال جديد' : 'New Business Partner'}</span>
          </button>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 rtl:right-3.5 rtl:left-auto" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث بالاسم، الرقم، السجل أو الضريبة...' : 'Search by BP Name, CR, VAT or Number...'}
              className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
          >
            <option value="ALL">{isAr ? 'جميع الأدوار (Roles: All)' : 'All Roles'}</option>
            <option value="CUSTOMER">Customer (عميل)</option>
            <option value="VENDOR">Vendor (مورد)</option>
            <option value="CARRIER">Carrier (ناقل)</option>
            <option value="CUSTOMS_BROKER">Customs Broker (مخلص جمركي)</option>
            <option value="FREIGHT_FORWARDER">Freight Forwarder (شاحن)</option>
            <option value="GOVERNMENT_AGENCY">Government Agency (جهة حكومية)</option>
            <option value="3PL">3PL Provider</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
          >
            <option value="ALL">{isAr ? 'جميع الحالات (Status: All)' : 'All Statuses'}</option>
            <option value="ACTIVE">{isAr ? 'نشط (ACTIVE)' : 'ACTIVE'}</option>
            <option value="ON_HOLD">{isAr ? 'معلق (ON_HOLD)' : 'ON_HOLD'}</option>
            <option value="SUSPENDED">{isAr ? 'موقوف (SUSPENDED)' : 'SUSPENDED'}</option>
          </select>

          <select
            value={selectedClassification}
            onChange={e => setSelectedClassification(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
          >
            <option value="ALL">{isAr ? 'جميع التصنيفات (Class: All)' : 'All Classifications'}</option>
            <option value="ENTERPRISE">ENTERPRISE</option>
            <option value="CORPORATE">CORPORATE</option>
            <option value="SME">SME</option>
            <option value="GOVERNMENT">GOVERNMENT</option>
          </select>
        </div>
      </div>

      {/* Partners List / Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
          {isAr ? 'جاري تحميل سجل شركاء الأعمال...' : 'Loading Business Partners Registry...'}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          {isAr ? 'لا يوجد شركاء أعمال مطابقون للبحث.' : 'No matching business partners found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {partners.map(bp => {
            const primaryContact = bp.contacts.find(c => c.isPrimary) || bp.contacts[0];
            const primaryAddr = bp.addresses.find(a => a.isPrimary) || bp.addresses[0];

            return (
              <div
                key={bp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-mono">
                        {bp.bpNumber}
                      </span>
                      {getStatusBadge(bp.status)}
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {bp.classification}
                      </span>
                      {bp.compliance?.kycStatus === 'VERIFIED' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>KYC Verified</span>
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectPartner(bp)}
                      className="text-base font-black text-slate-900 hover:text-amber-600 transition cursor-pointer flex items-center gap-2"
                    >
                      <span>{isAr ? bp.arabicName || bp.legalName : bp.englishName || bp.legalName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{bp.legalName} ({bp.tradingName})</p>
                  </div>

                  {/* Role badges & actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {bp.roles.map(r => getRoleBadge(r))}
                    <button
                      onClick={() => onEditPartner(bp)}
                      className="ml-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      {isAr ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => onSelectPartner(bp)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition"
                    >
                      {isAr ? 'الملف الكامل' : 'View Profile'}
                    </button>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">{isAr ? 'السجل والضريبة' : 'CR & VAT Number'}</span>
                    <p className="font-mono font-bold text-slate-800">CR: {bp.commercialRegistration || 'N/A'}</p>
                    <p className="font-mono text-slate-500 text-[11px]">VAT: {bp.vatNumber || 'N/A'}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">{isAr ? 'جهات الاتصال الرئيسية' : 'Primary Contact'}</span>
                    {primaryContact ? (
                      <div>
                        <p className="font-bold text-slate-900">{primaryContact.name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {primaryContact.email}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">{isAr ? 'لا يوجد جهة اتصال' : 'No contact specified'}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">{isAr ? 'العنوان والمقر' : 'Primary Location'}</span>
                    {primaryAddr ? (
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{primaryAddr.city}, {primaryAddr.country}</span>
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">{isAr ? 'لا يوجد عنوان' : 'No address specified'}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold">{isAr ? 'الحد الائتماني والتعرض' : 'Credit & Exposure'}</span>
                    <p className="font-bold text-slate-900">
                      SAR {(bp.credit?.creditExposure || 0).toLocaleString()} / {(bp.credit?.creditLimit || 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Terms: {bp.paymentTerms} | Rating: {bp.credit?.creditRating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
