import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { DollarSign, AlertTriangle, ShieldCheck, CreditCard, Ban, CheckCircle2 } from 'lucide-react';
import { BusinessPartner } from '../../../types/businessPartner';

export const BPCreditRiskManager: React.FC = () => {
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
        console.error('Failed to load partners for credit risk', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const totalCreditLimit = partners.reduce((sum, p) => sum + (p.credit?.creditLimit || 0), 0);
  const totalExposure = partners.reduce((sum, p) => sum + (p.credit?.creditExposure || 0), 0);
  const creditHoldCount = partners.filter(p => p.credit?.isOnCreditHold).length;

  return (
    <div className="space-y-6">
      {/* Credit Overview Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold block">{isAr ? 'إجمالي الحدود الائتمانية الممنوحة' : 'Total Portfolio Credit Limit'}</span>
          <p className="text-2xl font-black text-slate-900 font-mono">
            SAR {totalCreditLimit.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-bold block">{isAr ? 'حد التسهيلات المجمعة لجميع الشركاء' : 'Combined credit capacity across portfolio'}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold block">{isAr ? 'إجمالي التعرض الائتماني القائم' : 'Total Active Credit Exposure'}</span>
          <p className="text-2xl font-black text-amber-600 font-mono">
            SAR {totalExposure.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-700 font-bold block">
            {totalCreditLimit > 0 ? Math.round((totalExposure / totalCreditLimit) * 100) : 0}% {isAr ? 'نسبة الاستغلال الائتماني' : 'Credit Utilization'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <span className="text-xs text-slate-500 font-bold block">{isAr ? 'الشركاء تحت الإيقاف الائتماني' : 'Credit Hold Entities'}</span>
          <p className="text-2xl font-black text-rose-600 font-mono">{creditHoldCount}</p>
          <span className="text-[10px] text-rose-500 font-bold block">{isAr ? 'إيقاف إصدار البولايت مؤقتاً' : 'Shipments auto-blocked'}</span>
        </div>
      </div>

      {/* Credit & Exposure Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <span>{isAr ? 'إدارة التعرض الائتماني وتقييم المخاطر' : 'Partner Credit Risk & Exposure Matrix'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-black">
                <th className="pb-3">{isAr ? 'الشريك' : 'Partner Name'}</th>
                <th className="pb-3">{isAr ? 'التصنيف الائتماني' : 'Credit Rating'}</th>
                <th className="pb-3">{isAr ? 'الحد الائتماني' : 'Credit Limit'}</th>
                <th className="pb-3">{isAr ? 'التعرض الحالي' : 'Exposure'}</th>
                <th className="pb-3">{isAr ? 'شروط الدفع' : 'Terms'}</th>
                <th className="pb-3">{isAr ? 'حالة الإيقاف' : 'Credit Hold'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map(p => {
                const exposure = p.credit?.creditExposure || 0;
                const limit = p.credit?.creditLimit || 1;
                const percent = Math.min(Math.round((exposure / limit) * 100), 100);

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{isAr ? p.arabicName || p.legalName : p.englishName || p.legalName}</div>
                      <span className="text-[10px] font-mono text-slate-400">{p.bpNumber}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        {p.credit?.creditRating || 'A'}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900">
                      SAR {(p.credit?.creditLimit || 0).toLocaleString()}
                    </td>
                    <td className="py-3 font-mono font-bold text-amber-800">
                      <div>SAR {exposure.toLocaleString()} ({percent}%)</div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full ${percent > 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 font-mono text-slate-700 font-bold">{p.paymentTerms}</td>
                    <td className="py-3">
                      {p.credit?.isOnCreditHold ? (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" />
                          <span>ON HOLD</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CLEAR</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
