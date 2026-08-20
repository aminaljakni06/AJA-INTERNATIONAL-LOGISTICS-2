import React from 'react';
import {
  ShieldAlert,
  Trophy,
  XCircle,
  Building2,
  PieChart,
  ThumbsUp,
  ThumbsDown,
  Percent,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { Card } from '../common/Card';
import { Competitor, WinLossRecord } from '../../types/sales';

interface CompetitorWinLossCenterProps {
  competitors: Competitor[];
  winLossRecords: WinLossRecord[];
  loading: boolean;
}

export const CompetitorWinLossCenter: React.FC<CompetitorWinLossCenterProps> = ({
  competitors,
  winLossRecords,
  loading,
}) => {
  const wonCount = winLossRecords.filter(w => w.status === 'WON').length;
  const lostCount = winLossRecords.filter(w => w.status === 'LOST').length;
  const total = winLossRecords.length;
  const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 65;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>معدل إغلاق الصفحات (Win Rate)</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{winRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            تم الفوز بـ {wonCount} صفقات من إجمالي {total} مناقصات مغلقة
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>عدد المنافسين المصنفين</span>
            <ShieldAlert className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2 font-mono">{competitors.length} شركات</div>
          <div className="text-[11px] text-slate-400 mt-1">تحليل الحصة السوقية والنقاط القوية</div>
        </Card>

        <Card className="p-4 bg-slate-900/90 border border-slate-700/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>الصفقات الضائعة للمنافسين</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">{lostCount} صفقات</div>
          <div className="text-[11px] text-slate-400 mt-1">أسباب رئيسية: الفارق السعري وائتمان الدفع</div>
        </Card>
      </div>

      {/* Competitors Registry */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#EA580C]" />
          <span>سجل المنافسين الإقليمي والاستخبارات البيعية (Competitor Intelligence)</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {competitors.map(comp => (
            <Card key={comp.id} className="p-4 bg-slate-900/90 border border-slate-700/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-100">{comp.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {comp.country} • {comp.marketSegment}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">الحصة السوقية</span>
                  <span className="font-bold font-mono text-sm text-[#EA580C]">{comp.estimatedMarketSharePct}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
                <div className="bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20">
                  <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                    <ThumbsUp className="w-3.5 h-3.5" /> نقاط القوة الرئيسية
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {comp.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                  <span className="font-bold text-rose-400 flex items-center gap-1 mb-1">
                    <ThumbsDown className="w-3.5 h-3.5" /> ثغرات ونقاط الضعف
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {comp.weaknesses.map((wk, i) => (
                      <li key={i}>{wk}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <strong className="text-slate-200">ملاحظات التسعير:</strong> {comp.pricingNotes}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Win / Loss Audit Trail */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>سجل تحليل أسباب الفوز والخسارة في المناقصات (Win/Loss Audit Log)</span>
        </h3>

        <Card className="p-0 overflow-hidden border border-slate-700/80 bg-slate-900/90">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3.5">الفرصة / العميل</th>
                  <th className="p-3.5">قيمة الصفقة</th>
                  <th className="p-3.5">النتيجة</th>
                  <th className="p-3.5">المنافس الرئيسي</th>
                  <th className="p-3.5">السبب الرئيسي والتغذية الراجعة</th>
                  <th className="p-3.5">تاريخ الإغلاق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {winLossRecords.map(wl => (
                  <tr key={wl.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100">{wl.opportunityName}</div>
                      <div className="text-xs text-slate-400">{wl.customerName}</div>
                    </td>
                    <td className="p-3.5 font-bold font-mono text-slate-200">
                      {wl.dealValue.toLocaleString()} SAR
                    </td>
                    <td className="p-3.5">
                      {wl.status === 'WON' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> تم الفوز
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" /> لم تتم الصفقة
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-slate-300">{wl.primaryCompetitorName || 'غير محدد'}</td>
                    <td className="p-3.5 text-xs text-slate-300 max-w-xs">
                      <div>{wl.detailedReason}</div>
                      {wl.customerFeedback && (
                        <div className="text-[11px] text-sky-400 mt-0.5 font-semibold">
                          رأي العميل: "{wl.customerFeedback}"
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-xs font-mono text-slate-400">{wl.closedAt.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
