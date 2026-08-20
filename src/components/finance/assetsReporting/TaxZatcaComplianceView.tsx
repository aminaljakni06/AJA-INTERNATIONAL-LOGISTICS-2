import React, { useEffect, useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Building2,
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { FixedAssetsReportingClient } from '../../../services/fixedAssetsReportingClient';
import { ZATCAInvoiceRecord } from '../../../types/fixedAssetsReporting';

export const TaxZatcaComplianceView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [records, setRecords] = useState<ZATCAInvoiceRecord[]>([]);

  useEffect(() => {
    FixedAssetsReportingClient.getSnapshot().then(snapshot => setRecords(snapshot.zatcaInvoices));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <QrCode className="w-4 h-4" />
            <span>{isAr ? 'منظومة الامتثال للربط الإلكتروني والضريبة (ZATCA Phase 2 Fatoora Integration Engine)' : 'ZATCA Phase 2 Fatoora Clearance & Cryptographic Stamp Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'الفاتورة الإلكترونية الشفافة والربط المباشر مع هيئة الزكاة والضريبة والجمارك' : 'ZATCA Clearance, Cryptographic Seals, QR Generation & KSA VAT Compliance'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'الاعتماد التلقائي لفواتير الشحن والخدمات اللوجستية وتوليد الأختام المشفرة وطباعة رمز الـ QR' : 'Real-time B2B clearance with ZATCA Phase 2 API, ECDSA signatures, and audit-ready XML archives.'}
          </p>
        </div>
      </div>

      {/* ZATCA Clearance Invoices */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase">{isAr ? 'سجل الفواتير المشفرة والمزكونة (Clearance Log)' : 'ZATCA Electronic Invoice Clearance Ledger'}</h3>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {records.map(rec => (
            <div key={rec.id} className="p-5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                <div>
                  <span className="text-sky-400 font-bold">{rec.invoiceNumber}</span>
                  <div className="text-white font-bold text-sm">{isAr ? rec.buyerNameAr : rec.buyerNameEn}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{rec.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
                <div>{isAr ? 'الرقم الضريبي للمشتري:' : 'Buyer VAT No:'} <span className="text-white font-bold">{rec.vatRegistrationNumber}</span></div>
                <div>{isAr ? 'الضريبة (15%):' : 'VAT Amount (15%):'} <span className="text-amber-400 font-bold">SAR {rec.vatAmountSAR.toLocaleString()}</span></div>
                <div>{isAr ? 'الإجمالي مع الضريبة:' : 'Total Payable:'} <span className="text-emerald-400 font-bold">SAR {rec.totalWithVATSAR.toLocaleString()}</span></div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-700/80 text-[10px] text-slate-400 break-all space-y-1">
                <div className="flex items-center gap-1 text-sky-400 font-bold">
                  <Lock className="w-3 h-3" />
                  <span>{isAr ? 'الختم المشفر المعتمد من زاتكا (ZATCA Cryptographic Stamp):' : 'ECDSA Cryptographic Signature:'}</span>
                </div>
                <div>{rec.cryptographicStamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
