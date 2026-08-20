import { useState } from 'react';
import {
  DollarSign,
  Calendar,
  AlertTriangle,
  Plus,
  Sparkles,
  Search,
  Building2,
  FileText,
  User,
  ShieldAlert,
  Edit2,
  Trophy,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Opportunity, SalesStage, ForecastCategory, OpportunityRiskLevel } from '../../types/sales';

interface OpportunityPipelineBoardProps {
  opportunities: Opportunity[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStage: (
    id: string,
    stage: SalesStage,
    wonLostReason?: { wonReason?: string; lostReason?: string; competitorLostTo?: string }
  ) => Promise<void>;
  onSaveOpportunity: (opp: Partial<Opportunity>) => Promise<void>;
}

export const OpportunityPipelineBoard: React.FC<OpportunityPipelineBoardProps> = ({
  opportunities,
  loading,
  onRefresh,
  onUpdateStage,
  onSaveOpportunity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [forecastFilter, setForecastFilter] = useState<string>('ALL');

  // Stage Change Modal
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [targetStage, setTargetStage] = useState<SalesStage>('PROPOSAL');
  const [wonReason, setWonReason] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [competitorLostTo, setCompetitorLostTo] = useState('');
  const [updating, setUpdating] = useState(false);

  // New Opportunity Modal
  const [newOppModalOpen, setNewOppModalOpen] = useState(false);
  const [oppName, setOppName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [expectedRevenue, setExpectedRevenue] = useState(500000);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]
  );
  const [riskLevel, setRiskLevel] = useState<OpportunityRiskLevel>('LOW');
  const [savingNew, setSavingNew] = useState(false);

  const STAGES: { key: SalesStage; label: string; prob: number; color: string }[] = [
    { key: 'PROSPECTING', label: 'استكشاف (10%)', prob: 10, color: 'border-slate-600' },
    { key: 'QUALIFICATION', label: 'تأهيل (20%)', prob: 20, color: 'border-sky-600' },
    { key: 'NEEDS_ANALYSIS', label: 'تحليل المتطلبات (40%)', prob: 40, color: 'border-cyan-600' },
    { key: 'PROPOSAL', label: 'العرض الفني والمالي (60%)', prob: 60, color: 'border-blue-600' },
    { key: 'NEGOTIATION', label: 'المفاوضات (80%)', prob: 80, color: 'border-amber-600' },
    { key: 'APPROVAL', label: 'الموافقة والاعتماد (90%)', prob: 90, color: 'border-purple-600' },
    { key: 'WON', label: 'تم الفوز (100%)', prob: 100, color: 'border-emerald-600' },
    { key: 'LOST', label: 'خسارة الصفقة (0%)', prob: 0, color: 'border-rose-600' },
  ];

  const openStageChangeModal = (opp: Opportunity, newStage: SalesStage) => {
    setSelectedOpp(opp);
    setTargetStage(newStage);
    setWonReason('');
    setLostReason('');
    setCompetitorLostTo('');
    setStageModalOpen(true);
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setUpdating(true);
    try {
      await onUpdateStage(selectedOpp.id, targetStage, {
        wonReason,
        lostReason,
        competitorLostTo,
      });
      setStageModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNewOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNew(true);
    try {
      await onSaveOpportunity({
        name: oppName,
        customerName,
        expectedRevenue: Number(expectedRevenue),
        expectedCloseDate,
        riskLevel,
        stage: 'PROSPECTING',
        probability: 10,
      });
      setNewOppModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNew(false);
    }
  };

  const filteredOpps = opportunities.filter(o => {
    const matchSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.opportunityNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRisk = riskFilter === 'ALL' || o.riskLevel === riskFilter;
    const matchForecast = forecastFilter === 'ALL' || o.forecastCategory === forecastFilter;

    return matchSearch && matchRisk && matchForecast;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="البحث بالفرصة البيعية أو العميل..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">جميع مستويات المخاطر</option>
            <option value="LOW">منخفض (LOW)</option>
            <option value="MEDIUM">متوسط (MEDIUM)</option>
            <option value="HIGH">مرتفع (HIGH)</option>
          </select>

          <select
            value={forecastFilter}
            onChange={e => setForecastFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none hidden md:block"
          >
            <option value="ALL">جميع فئات التنبؤ</option>
            <option value="COMMIT">مؤكد (COMMIT)</option>
            <option value="BEST_CASE">أفضل حالة (BEST_CASE)</option>
            <option value="PIPELINE">في الأنبوب (PIPELINE)</option>
          </select>
        </div>

        <Button
          onClick={() => {
            setOppName('');
            setCustomerName('');
            setExpectedRevenue(750000);
            setNewOppModalOpen(true);
          }}
          className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>فرصة بيعية جديدة</span>
        </Button>
      </div>

      {/* Horizontal Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {STAGES.map(stg => {
          const stageOpps = filteredOpps.filter(o => o.stage === stg.key);
          const totalVal = stageOpps.reduce((acc, curr) => acc + curr.expectedRevenue, 0);

          return (
            <div
              key={stg.key}
              className={`w-80 shrink-0 bg-slate-900/90 rounded-xl p-3 border-t-4 ${stg.color} border-x border-b border-slate-800 flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-xs text-slate-100">{stg.label}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {totalVal.toLocaleString()} SAR
                  </p>
                </div>
                <span className="bg-slate-800 text-slate-300 font-bold text-xs px-2 py-0.5 rounded-full border border-slate-700">
                  {stageOpps.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[450px]">
                {stageOpps.map(opp => (
                  <Card
                    key={opp.id}
                    className="p-3 bg-slate-800 hover:border-[#EA580C]/80 transition-all shadow-sm border border-slate-700/80 flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono text-[#EA580C] bg-[#EA580C]/10 px-1.5 py-0.5 rounded border border-[#EA580C]/20">
                          {opp.opportunityNumber}
                        </span>
                        <h4 className="font-bold text-xs text-slate-100 mt-1 truncate">{opp.name}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span className="truncate">{opp.customerName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">القيمة المالية:</span>
                        <span className="font-bold text-slate-100">{opp.expectedRevenue.toLocaleString()} SAR</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">الموزون (Prob):</span>
                        <span className="font-bold text-emerald-400">
                          {opp.weightedRevenue.toLocaleString()} SAR ({opp.probability}%)
                        </span>
                      </div>
                    </div>

                    {opp.aiWinProbabilityPct && (
                      <div className="flex items-center gap-1 text-[11px] text-sky-300 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">فرصة النجاح الذكية: {opp.aiWinProbabilityPct}%</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {opp.expectedCloseDate}
                      </span>

                      {/* Quick Stage Progression */}
                      <select
                        value={opp.stage}
                        onChange={e => openStageChangeModal(opp, e.target.value as SalesStage)}
                        className="bg-slate-900 text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-700 cursor-pointer"
                      >
                        {STAGES.map(s => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Card>
                ))}

                {stageOpps.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    لا توجد فرص في هذه المرحلة
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* STAGE CHANGE MODAL */}
      <Modal
        isOpen={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        title={`تحديث مرحلة الفرصة: ${selectedOpp?.name}`}
      >
        <form onSubmit={handleStageSubmit} className="space-y-4 text-right">
          <p className="text-xs text-slate-300">
            أنت على وشك تعديل مرحلة الفرصة البيعية إلى: <strong className="text-[#EA580C]">{targetStage}</strong>.
          </p>

          {targetStage === 'WON' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">سبب الفوز بالصفقة الرئيسي *</label>
              <textarea
                rows={3}
                value={wonReason}
                onChange={e => setWonReason(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
                placeholder="مثال: تم التميز في سرعة التخليص الجمركي والسعر التنافسي للشحن البحري..."
              />
            </div>
          )}

          {targetStage === 'LOST' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم المنافس الفائز (إن وجد)</label>
                <input
                  type="text"
                  value={competitorLostTo}
                  onChange={e => setCompetitorLostTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
                  placeholder="مثال: شركة أجيليتي / DHL..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">سبب الخسارة الرئيسي *</label>
                <textarea
                  rows={3}
                  value={lostReason}
                  onChange={e => setLostReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
                  placeholder="مثال: فرق الأسعار أو التأخر في تقديم الاعتماد البنكي..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => setStageModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={updating} className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold">
              {updating ? 'جاري التحديث...' : 'تأكيد تغيير المرحلة'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* NEW OPPORTUNITY MODAL */}
      <Modal
        isOpen={newOppModalOpen}
        onClose={() => setNewOppModalOpen(false)}
        title="إنشاء فرصة بيعية جديدة"
      >
        <form onSubmit={handleSaveNewOpp} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان الفرصة البيعية *</label>
            <input
              type="text"
              value={oppName}
              onChange={e => setOppName(e.target.value)}
              required
              placeholder="مثال: عقد نقل وتوزيع المواد الطبية بأسطول مبرد"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">اسم العميل / الشركة *</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
              placeholder="شركة فارما ميد للخدمات الطبية"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">القيمة المالية المتوقعة (SAR) *</label>
              <input
                type="number"
                value={expectedRevenue}
                onChange={e => setExpectedRevenue(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ الإغلاق المتوقع *</label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={e => setExpectedCloseDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">مستوى المخاطر التقديري</label>
            <select
              value={riskLevel}
              onChange={e => setRiskLevel(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100"
            >
              <option value="LOW">منخفض (LOW)</option>
              <option value="MEDIUM">متوسط (MEDIUM)</option>
              <option value="HIGH">مرتفع (HIGH)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => setNewOppModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={savingNew} className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold">
              {savingNew ? 'جاري الإنشاء...' : 'إنشاء الفرصة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
