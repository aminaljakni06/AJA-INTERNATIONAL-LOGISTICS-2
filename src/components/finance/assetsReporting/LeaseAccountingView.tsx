import React, { useEffect, useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { IFRS16Lease } from '../../../types/fixedAssetsReporting';

export const LeaseAccountingView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [leases, setLeases] = useState<IFRS16Lease[]>([]);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => setLeases(snapshot.leaseContracts));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <FileText className="w-4 h-4" />
            <span>{isAr ? 'منظومة محاسبة عقود الإيجار المعيارية (IFRS 16 Lease Accounting Engine)' : 'IFRS 16 Lease Accounting & Right-of-Use Asset Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'أصول أصل حق الاستخدام (Right-of-Use Assets) والالتزامات التأجيرية' : 'Right-of-Use Asset Amortization & Lease Liability Interest Schedules'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'تطبيق المعيار الدولي IFRS 16 لحساب القيمة الحالية لالتزامات العقود التأجيرية للمستودعات والمقار' : 'Comply with IFRS 16 standards for warehouse leases, discount schedules, and liability recognition.'}
          </p>
        </div>
      </div>

      {/* Leases Grid */}
      <div className="space-y-6">
        {leases.map(lease => (
          <div key={lease.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{lease.leaseContractCode}</span>
                <h3 className="text-base font-bold text-white">{isAr ? lease.lessorNameAr : lease.lessorNameEn}</h3>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {lease.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono">{lease.underlyingAssetDescription}</p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'الدفع الشهري' : 'Monthly Payment'}</div>
                <div className="text-sm font-bold text-white">SAR {lease.monthlyPaymentSAR.toLocaleString()}</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'معدل الخصم الضمني' : 'Discount Rate'}</div>
                <div className="text-sm font-bold text-sky-400">{lease.discountRatePercent}%</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'أصل حق الاستخدام المبدئي' : 'Initial ROU Asset'}</div>
                <div className="text-sm font-bold text-emerald-400">SAR {(lease.initialRightOfUseAssetSAR / 1000000).toFixed(2)}M</div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400">{isAr ? 'التزام الإيجار الحالي' : 'Lease Liability'}</div>
                <div className="text-sm font-bold text-rose-400">SAR {(lease.currentLeaseLiabilitySAR / 1000000).toFixed(2)}M</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
