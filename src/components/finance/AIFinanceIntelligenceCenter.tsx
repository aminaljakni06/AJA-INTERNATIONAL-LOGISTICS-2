import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const AIFinanceIntelligenceCenter: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(true);

  const handleRunAIAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisDone(true);
    }, 1200);
  };

  const anomalies = [
    {
      id: 'ano-1',
      severity: 'LOW',
      journalNo: 'JV-2026-003',
      titleEn: 'Off-Hours Weekend Journal Posting Detected',
      titleAr: 'تم رصد إدخال قيد محاسبي خارج أوقات العمل الرسمية في العطلة الأسبوعية',
      descriptionEn: 'Journal JV-2026-003 was posted at 02:14 AM on Saturday. Threshold flag triggered.',
      descriptionAr: 'تم ترحيل القيد رقم JV-2026-003 الساعة 2:14 صباحاً يوم السبت. تم إرسال تنبيه تدقيق إلكتروني.',
      confidence: '98%'
    },
    {
      id: 'ano-2',
      severity: 'MEDIUM',
      journalNo: 'JV-2026-001',
      titleEn: 'Large Amount Outlier in Fleet Expense Account (502000)',
      titleAr: 'انحراف نسبي في حجم مصروفات الوقود والأسطول (حساب 502000)',
      descriptionEn: 'Debit amount SAR 50,000 exceeds 3-month moving average for single line entries by +34%.',
      descriptionAr: 'مبلغ المدين 50,000 ريال يتجاوز المتوسط المتحرك لـ 3 أشهر بمقدار +34%.',
      confidence: '92%'
    }
  ];

  const aiSuggestions = [
    {
      type: 'TAX_ADVICE',
      titleEn: 'ZATCA Phase 2 E-Invoicing Reconciliation Advisory',
      titleAr: 'توصية الذكاء الاصطناعي لمطابقة الفواتير الإلكترونية المرحلة الثانية (زكاة وضريبة)',
      detailEn: 'All 1,240 VAT sales transactions in 2026 Q1 match the 15% Standard Rate output ledger with 0.00 SAR variance.',
      detailAr: 'جميع معاملات مبيعات ضريبة القيمة المضافة لـ Q1 2026 متطابقة بصرامة مع مخرجات الزكاة والضريبة بنسبة 15% دون أي فارق.'
    },
    {
      type: 'FX_HEDGING',
      titleEn: 'USD Purchase Commitment FX Hedging Opportunity',
      titleAr: 'فرصة تحوط سعر الصرف لالتزامات الشراء الآجلة بالدولار الأمريكي',
      detailEn: 'Upcoming USD 500,000 logistics equipment settlement in Q2. SAR/USD peg is stable, zero currency risk detected.',
      detailAr: 'دفعة مستحقة بقيمة 500,000 دولار لمعدات لوجستية في Q2. ربط الريال بالدولار ثابت ولا توجد مخاطر عملة غير مقبولة.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 p-5 rounded-2xl border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <span>{isAr ? 'مركز الذكاء الاصطناعي المالي (AI Finance Intelligence)' : 'Enterprise AI Finance & Governance Center'}</span>
          </h2>
          <p className="text-xs text-purple-200/80 mt-1">
            {isAr ? 'كشف الشذوذ في القيود المحاسبية، التصنيف الآلي للحسابات وتدقيق الامتثال للأنظمة' : 'AI anomaly detection in journal entries, automated account mapping & regulatory compliance audits'}
          </p>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={analyzing}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0 border border-purple-400/30"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? (isAr ? 'جاري الفحص بالذكاء الاصطناعي...' : 'AI Analyzing Ledger...') : (isAr ? 'إعادة الفحص والتحليل الذكي' : 'Run Full AI Audit')}</span>
        </button>
      </div>

      {/* Anomaly Detection Section */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'رادار كشف الشذوذ والأخطاء في القيود (AI Anomaly Detector)' : 'AI Ledger Anomaly Detection'}</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            2 {isAr ? 'تنبيهات مكتشفة' : 'Anomalies Detected'}
          </span>
        </div>

        <div className="space-y-3">
          {anomalies.map(ano => (
            <div
              key={ano.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {ano.journalNo}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {isAr ? ano.titleAr : ano.titleEn}
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  {isAr ? ano.descriptionAr : ano.descriptionEn}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-purple-300 font-mono font-semibold">
                  {isAr ? 'دقة النموذج: ' : 'Confidence: '}{ano.confidence}
                </span>
                <button
                  onClick={() => alert(isAr ? 'تم تعليم التنبيه كمراجَع ومقبول' : 'Flag marked as reviewed')}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  {isAr ? 'تأكيد المراجعة' : 'Dismiss / Mark Reviewed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Strategic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiSuggestions.map((sug, idx) => (
          <div key={idx} className="bg-slate-900/80 p-5 rounded-2xl border border-purple-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">
                {isAr ? sug.titleAr : sug.titleEn}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? sug.detailAr : sug.detailEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
