import React, { useState } from 'react';
import {
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Info,
  BadgePercent,
  Receipt,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface InstallmentScheduleItem {
  installmentNumber: number;
  dueDate: string;
  isToday: boolean;
  principalAmount: number;
  feeAmount: number;
  totalMonthlyAmount: number;
  cumulativePaid: number;
  remainingBalance: number;
}

export interface InstallmentCalculatorProps {
  amount: number;
  currency?: string;
  selectedPlanMonths?: 1 | 3 | 6;
  onSelectPlan?: (months: 1 | 3 | 6, monthlyAmount: number, termsAccepted?: boolean) => void;
  onTermsChange?: (accepted: boolean) => void;
  className?: string;
  showCustomAmountInput?: boolean;
}

export const InstallmentCalculator: React.FC<InstallmentCalculatorProps> = ({
  amount: initialAmount,
  currency = 'SAR',
  selectedPlanMonths = 3,
  onSelectPlan,
  onTermsChange,
  className = '',
  showCustomAmountInput = false,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [calcAmount, setCalcAmount] = useState<number>(initialAmount || 15000);
  const [activePlanMonths, setActivePlanMonths] = useState<1 | 3 | 6>(selectedPlanMonths);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  const effectiveAmount = showCustomAmountInput ? calcAmount : initialAmount;

  // Calculate schedule for a given number of months
  const generateSchedule = (months: number): InstallmentScheduleItem[] => {
    if (months <= 1) {
      return [
        {
          installmentNumber: 1,
          dueDate: new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          isToday: true,
          principalAmount: effectiveAmount,
          feeAmount: 0,
          totalMonthlyAmount: effectiveAmount,
          cumulativePaid: effectiveAmount,
          remainingBalance: 0,
        },
      ];
    }

    const monthlyBase = Math.floor((effectiveAmount / months) * 100) / 100;
    const remainder = Math.round((effectiveAmount - monthlyBase * months) * 100) / 100;

    const schedule: InstallmentScheduleItem[] = [];
    let cumulative = 0;

    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + (i - 1));

      // Add remainder to 1st installment so sum matches exactly
      const monthlyTotal = i === 1 ? Math.round((monthlyBase + remainder) * 100) / 100 : monthlyBase;
      cumulative = Math.round((cumulative + monthlyTotal) * 100) / 100;
      const remaining = Math.max(0, Math.round((effectiveAmount - cumulative) * 100) / 100);

      schedule.push({
        installmentNumber: i,
        dueDate: date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        isToday: i === 1,
        principalAmount: monthlyTotal,
        feeAmount: 0,
        totalMonthlyAmount: monthlyTotal,
        cumulativePaid: cumulative,
        remainingBalance: remaining,
      });
    }

    return schedule;
  };

  const schedule3 = generateSchedule(3);
  const schedule6 = generateSchedule(6);
  const activeSchedule = generateSchedule(activePlanMonths);

  const monthly3 = schedule3[0]?.totalMonthlyAmount || 0;
  const monthly6 = schedule6[0]?.totalMonthlyAmount || 0;
  const currentMonthly = activeSchedule[0]?.totalMonthlyAmount || effectiveAmount;

  const handleApply = (months: 1 | 3 | 6, isAccepted = termsAccepted) => {
    setActivePlanMonths(months);
    const sched = generateSchedule(months);
    const mAmount = sched[0]?.totalMonthlyAmount || effectiveAmount;
    if (onSelectPlan) {
      onSelectPlan(months, mAmount, isAccepted);
    }
  };

  const handleCheckboxToggle = (checked: boolean) => {
    setTermsAccepted(checked);
    if (onTermsChange) {
      onTermsChange(checked);
    }
    const sched = generateSchedule(activePlanMonths);
    const mAmount = sched[0]?.totalMonthlyAmount || effectiveAmount;
    if (onSelectPlan) {
      onSelectPlan(activePlanMonths, mAmount, checked);
    }
  };

  return (
    <div
      className={`bg-slate-950 border border-sky-500/30 rounded-3xl p-5 text-white space-y-5 shadow-2xl ${className}`}
    >
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-[#00F0FF]">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <span>{isAr ? 'حاسبة تقسيط الفواتير (Adyen Installment Calculator)' : 'Adyen Invoice Installment Calculator'}</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] font-mono font-bold">
                0% Interest
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'احسب الأقساط الشهرية وجدول الدفعات التفصيلي قبل اعتماد عملية السداد'
                : 'Calculate monthly payments and schedule breakdown before confirming payment'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl font-mono shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
          <span>{isAr ? 'مُعتمد إسلامياً وبرمجياً' : 'Sharia & API Compliant'}</span>
        </div>
      </div>

      {/* Custom Amount Input if enabled */}
      {showCustomAmountInput && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            {isAr ? 'مبلغ الفاتورة المراد تقسيطه:' : 'Invoice Amount to Split:'}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="100"
                step="100"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-white font-mono font-bold text-base outline-none"
              />
            </div>
            <span className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-[#00F0FF]">
              {currency}
            </span>
          </div>
        </div>
      )}

      {/* Plans Comparison Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Full Payment Card */}
        <button
          type="button"
          onClick={() => handleApply(1)}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activePlanMonths === 1
              ? 'bg-gradient-to-br from-sky-950/90 to-slate-900 border-[#00F0FF] text-white shadow-xl ring-2 ring-[#00F0FF]/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          {activePlanMonths === 1 && (
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#00F0FF] text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-white block">{isAr ? 'دفعة واحدة' : 'Full Payment'}</span>
            <span className="text-[10px] text-slate-400 block">{isAr ? 'سداد المتبقي فوراً' : '100% upfront'}</span>
          </div>
          <div className="mt-3">
            <div className="text-base font-black font-mono text-[#00F0FF]">
              {effectiveAmount.toLocaleString()} <span className="text-xs">{currency}</span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">{isAr ? 'بدون تقسيط' : 'No installments'}</div>
          </div>
        </button>

        {/* 3 Months Plan Card */}
        <button
          type="button"
          onClick={() => handleApply(3)}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activePlanMonths === 3
              ? 'bg-gradient-to-br from-sky-950/90 to-slate-900 border-[#00F0FF] text-white shadow-xl ring-2 ring-[#00F0FF]/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          {activePlanMonths === 3 && (
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#00F0FF] text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-white">{isAr ? 'خطة 3 أشهر' : '3-Month Plan'}</span>
              <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 rounded text-[9px] font-mono">Popular</span>
            </div>
            <span className="text-[10px] text-slate-400 block">{isAr ? '3 أقساط متساوية' : '3 equal payments'}</span>
          </div>
          <div className="mt-3">
            <div className="text-base font-black font-mono text-[#00F0FF]">
              {monthly3.toLocaleString()} <span className="text-xs">{currency} / {isAr ? 'شهر' : 'mo'}</span>
            </div>
            <div className="text-[9px] text-emerald-400 font-mono mt-0.5">{isAr ? '0% رسوم إضافية' : '0% admin fee'}</div>
          </div>
        </button>

        {/* 6 Months Plan Card */}
        <button
          type="button"
          onClick={() => handleApply(6)}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
            activePlanMonths === 6
              ? 'bg-gradient-to-br from-sky-950/90 to-slate-900 border-[#00F0FF] text-white shadow-xl ring-2 ring-[#00F0FF]/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          {activePlanMonths === 6 && (
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#00F0FF] text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-white">{isAr ? 'خطة 6 أشهر' : '6-Month Plan'}</span>
              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[9px] font-mono">Enterprise</span>
            </div>
            <span className="text-[10px] text-slate-400 block">{isAr ? '6 أقساط متساوية' : '6 equal payments'}</span>
          </div>
          <div className="mt-3">
            <div className="text-base font-black font-mono text-[#00F0FF]">
              {monthly6.toLocaleString()} <span className="text-xs">{currency} / {isAr ? 'شهر' : 'mo'}</span>
            </div>
            <div className="text-[9px] text-emerald-400 font-mono mt-0.5">{isAr ? '0% رسوم إضافية' : '0% admin fee'}</div>
          </div>
        </button>
      </div>

      {/* Dynamic Detailed Schedule Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00F0FF]" />
            <h5 className="text-xs font-bold text-white">
              {isAr
                ? `جدول استحقاق الأقساط المالي (${activePlanMonths === 1 ? 'دفعة واحدة' : `${activePlanMonths} أشهر`})`
                : `Payment Schedule Breakdown (${activePlanMonths === 1 ? 'Full' : `${activePlanMonths} Months`})`}
            </h5>
          </div>

          <div className="text-xs font-mono font-bold text-sky-300">
            {isAr ? 'القسط الشهر المتوقع:' : 'Monthly Cost:'}{' '}
            <span className="text-[#00F0FF] font-black text-sm">
              {currentMonthly.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {activeSchedule.map((item) => (
            <div
              key={item.installmentNumber}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono ${
                item.isToday
                  ? 'bg-gradient-to-r from-sky-950/80 to-slate-900 border-sky-500/50 text-white shadow-md'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                    item.isToday ? 'bg-[#00F0FF] text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.installmentNumber}
                </div>

                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>
                      {item.isToday
                        ? isAr
                          ? 'الدفعة الأولى (اليوم)'
                          : '1st Installment (Today)'
                        : isAr
                        ? `القسط رقم ${item.installmentNumber}`
                        : `Installment #${item.installmentNumber}`}
                    </span>
                    {item.isToday && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-mono">
                        Due Now
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{item.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="text-left">
                <div className="font-extrabold text-[#00F0FF] text-xs">
                  {item.totalMonthlyAmount.toLocaleString()} {currency}
                </div>
                <div className="text-[9px] text-slate-400">
                  {isAr ? 'المتبقي بعد الدفع:' : 'Remaining:'} {item.remainingBalance.toLocaleString()} {currency}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Summary Footer Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">{isAr ? 'إجمالي الفاتورة:' : 'Total Invoice:'}</span>
            <span className="font-bold text-white">{effectiveAmount.toLocaleString()} {currency}</span>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">{isAr ? 'معدل الفائدة (APR):' : 'Annual Percentage Rate:'}</span>
            <span className="font-bold text-emerald-400">0.00% APR (0.00 {currency})</span>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">{isAr ? 'عدد الأقساط:' : 'Installment Count:'}</span>
            <span className="font-bold text-sky-300">{activePlanMonths} {isAr ? 'دفعات' : 'Payments'}</span>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">{isAr ? 'بوابة التقسيط:' : 'Gateway Engine:'}</span>
            <span className="font-bold text-[#00F0FF]">Adyen N.V. API</span>
          </div>
        </div>
      </div>

      {/* Enterprise Compliance & Regulatory Financial Disclosure Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-sky-500/40 rounded-2xl p-4 space-y-3 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs font-black text-white">
              {isAr ? 'إفصاح الامتثال المالي والنسبة السنوية (APR Disclosure)' : 'Enterprise Financial & APR Compliance Disclosure'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[9px] font-mono">
            Enterprise ISO-27001
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'معدل النسبة السنوية (APR):' : 'Annual Percentage Rate (APR):'}</span>
            <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">0.00% APR</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">{isAr ? 'سعر ثابت بدون تكلفة إضافية' : 'Fixed zero-cost rate'}</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي الفوائد والرسوم:' : 'Total Interest & Fees:'}</span>
            <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">0.00 {currency}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">{isAr ? 'خالي من الفوائد الربوية' : '0% Interest financing'}</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'إجمالي المبلغ المستحق:' : 'Total Repayment Amount:'}</span>
            <span className="text-[#00F0FF] font-extrabold text-sm block mt-0.5">{effectiveAmount.toLocaleString()} {currency}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">{isAr ? `${activePlanMonths} أقساط شهرياً` : `${activePlanMonths} monthly payments`}</span>
          </div>
        </div>

        {/* Accept Terms Checkbox */}
        <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 hover:border-sky-500/50 rounded-xl cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => handleCheckboxToggle(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#00F0FF] focus:ring-[#00F0FF] focus:ring-offset-slate-950 cursor-pointer accent-[#00F0FF]"
          />
          <div className="text-xs space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <span>
                {isAr
                  ? 'أوافق على شروط وأحكام تقسيط الفاتورة وإفصاحات معدل النسبة السنوية (0.00% APR)'
                  : 'I accept the Enterprise Installment Financing Terms & APR Disclosure (0.00% APR)'}
              </span>
              {termsAccepted && (
                <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] rounded-full font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {isAr ? 'تم الموافقة' : 'Accepted'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {isAr
                ? `بالموافقة على هذه الشروط، فإنك تقر بالاطلاع على الجدول المالي المكون من (${activePlanMonths} دفعات) بقيمة (${currentMonthly.toLocaleString()} ${currency}/شهر) ومعدل فائدة 0.00% APR وتفوض بوابة Adyen بخصم الأقساط بمواعيدها.`
                : `By checking this box, you confirm review of the ${activePlanMonths}-month payment schedule (${currentMonthly.toLocaleString()} ${currency}/mo) at 0.00% APR with total interest of 0.00 ${currency}, and authorize Adyen to debit scheduled payments.`}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
