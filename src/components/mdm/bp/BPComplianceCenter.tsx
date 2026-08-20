import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, Clock, Ban } from 'lucide-react';
import { BusinessPartner } from '../../../types/businessPartner';

export const BPComplianceCenter: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const token = localStorage.getItem('aja_auth_token');
        const res = await fetch('/api/business-partners', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setPartners(await res.json());
        }
      } catch (err) {
        console.error('Failed to load compliance partners', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const verifiedKyc = partners.filter(p => p.compliance?.kycStatus === 'VERIFIED');
  const pendingKyc = partners.filter(p => p.compliance?.kycStatus === 'PENDING' || !p.compliance?.kycStatus);
  const clearAml = partners.filter(p => p.compliance?.amlCheckStatus === 'CLEAR');

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isAr ? 'إجمالي الشركاء المسجلين' : 'Total Partners'}</span>
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{partners.length}</p>
          <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'خاضعون لرقابة الحوكمة والامتثال' : 'Governed under Enterprise MDM'}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isAr ? 'تحقق اعرف عميلك (KYC Verified)' : 'KYC Verified'}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">{verifiedKyc.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold block">
            {partners.length > 0 ? Math.round((verifiedKyc.length / partners.length) * 100) : 0}% {isAr ? 'مكتمل الحوكمة' : 'Compliance Rate'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isAr ? 'بانتظار التحقق (KYC Pending)' : 'KYC Pending'}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono">{pendingKyc.length}</p>
          <span className="text-[10px] text-amber-600 font-bold block">{isAr ? 'يتطلب مراجعة المستندات' : 'Requires doc audit'}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold">{isAr ? 'فحص غسيل الأموال (AML Clear)' : 'AML Check Status'}</span>
            <ShieldCheck className="w-5 h-5 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{clearAml.length}</p>
          <span className="text-[10px] text-sky-600 font-bold block">{isAr ? 'سجلات نظيفة بدون مخاطر' : 'Clean AML & Sanctions'}</span>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>{isAr ? 'سجل الامتثال والترخيص لشركاء الأعمال' : 'Business Partner Compliance Registry'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-black">
                <th className="pb-3">{isAr ? 'الشريك' : 'Partner Name'}</th>
                <th className="pb-3">{isAr ? 'السجل التجاري' : 'CR Number'}</th>
                <th className="pb-3">{isAr ? 'الرقم الضريبي' : 'VAT Number'}</th>
                <th className="pb-3">{isAr ? 'حالة KYC' : 'KYC Status'}</th>
                <th className="pb-3">{isAr ? 'فحص العقوبات AML' : 'AML Check'}</th>
                <th className="pb-3">{isAr ? 'التراخيص المسجلة' : 'Registered Licenses'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-bold text-slate-900">
                    <div>{isAr ? p.arabicName || p.legalName : p.englishName || p.legalName}</div>
                    <span className="text-[10px] font-mono text-slate-400">{p.bpNumber}</span>
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-700">{p.commercialRegistration || 'N/A'}</td>
                  <td className="py-3 font-mono font-bold text-slate-700">{p.vatNumber || 'N/A'}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800">
                      {p.compliance?.kycStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-sky-100 text-sky-800">
                      {p.compliance?.amlCheckStatus || 'CLEAR'}
                    </span>
                  </td>
                  <td className="py-3">
                    {p.compliance?.licenses?.length ? (
                      <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {p.compliance.licenses.length} License(s)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
