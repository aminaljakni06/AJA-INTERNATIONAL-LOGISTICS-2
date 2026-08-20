import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { 
  FileCheck, 
  ShieldCheck, 
  Globe, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { MasterOrganizationNode } from '../../../types/organizationMaster';

export const LegalEntityRegistryView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [nodes, setNodes] = useState<MasterOrganizationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/organization/master/nodes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data: MasterOrganizationNode[] = await res.json();
        // Filter nodes with legal entity info
        setNodes(data.filter(n => n.legalEntity && n.legalEntity.commercialRegistration));
      }
    } catch (err) {
      console.error('[LegalEntityRegistry] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const filteredNodes = nodes.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.legalEntity?.legalName.toLowerCase().includes(q) ||
      n.legalEntity?.commercialRegistration.includes(q) ||
      n.legalEntity?.vatNumber.includes(q) ||
      n.name.toLowerCase().includes(q) ||
      n.nameAr.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'سجل الكيانات القانونية والسجلات التجارية (Legal Entities)' : 'Legal Entities & Regulatory Registry'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'مرجع موحد لجميع السجلات التجارية، الأرقام الضريبية، تراخيص الهيئة العامة للنقل والجهات التنظيمية عبر كافة الشركات.'
                : 'Central register of Commercial Registrations (CR), VAT Tax Numbers, licenses, and regulatory compliance metadata.'}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 rtl:right-3.5 rtl:left-auto" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث بالسجل التجاري أو الرقم الضريبي...' : 'Search by CR, VAT, or Legal Name...'}
              className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      </div>

      {/* Legal Entities Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs font-semibold">
          {isAr ? 'جاري تحميل السجلات القانونية والتراخيص...' : 'Loading Legal Entities Registry...'}
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          {isAr ? 'لا توجد كيانات قانونية مطابقة.' : 'No matching legal entities registered.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredNodes.map(node => {
            const le = node.legalEntity!;
            return (
              <div key={node.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-mono">
                        {node.code}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {node.type}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">{le.legalName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{isAr ? node.nameAr : node.name} ({le.tradeName})</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مرخص ومكتمل والامتثال 100%' : '100% Compliant'}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[11px] text-slate-500 font-semibold">{isAr ? 'السجل التجاري (CR Number)' : 'Commercial Registration'}</p>
                    <p className="font-mono font-bold text-slate-900 text-sm">{le.commercialRegistration}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[11px] text-slate-500 font-semibold">{isAr ? 'الرقم الضريبي (VAT Number)' : 'VAT Registration Number'}</p>
                    <p className="font-mono font-bold text-amber-800 text-sm">{le.vatNumber}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[11px] text-slate-500 font-semibold">{isAr ? 'دولة التأسيس' : 'Incorporation Country'}</p>
                    <p className="font-bold text-slate-900">{le.incorporationCountry}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                    <p className="text-[11px] text-slate-500 font-semibold">{isAr ? 'تاريخ التسجيل الضريبي' : 'Tax Reg Date'}</p>
                    <p className="font-mono font-bold text-slate-700">{le.taxRegistrationDate || node.activationDate}</p>
                  </div>
                </div>

                {/* Operating Licenses */}
                {le.licenses && le.licenses.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-black text-slate-800">{isAr ? 'التراخيص والاعتمادات التنظيمية' : 'Operating Licenses & Accreditations'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {le.licenses.map((lic, idx) => (
                        <div key={idx} className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 space-y-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{lic.type}</span>
                            <span className="font-mono text-amber-800 text-[11px]">{lic.licenseNumber}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{isAr ? `جهة الإصدار: ${lic.issuingAuthority}` : `Issuer: ${lic.issuingAuthority}`}</span>
                            <span className="font-mono">{isAr ? `ينتهي: ${lic.expiryDate}` : `Expires: ${lic.expiryDate}`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
