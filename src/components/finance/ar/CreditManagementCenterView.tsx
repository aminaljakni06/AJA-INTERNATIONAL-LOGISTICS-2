import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  UserCheck,
  Award,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { AccountsReceivableClient } from '../../../services/accountsReceivableClient';
import { CustomerCreditProfile } from '../../../types/accountsReceivable';

export const CreditManagementCenterView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [creditProfiles, setCreditProfiles] = useState<CustomerCreditProfile[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-103');
  const [newLimitSAR, setNewLimitSAR] = useState<number>(1500000);

  const selectedProfile = creditProfiles.find(c => c.customerId === selectedCustomerId) || creditProfiles[0];

  useEffect(() => {
    void AccountsReceivableClient.getSnapshot().then(snapshot => setCreditProfiles(snapshot.creditProfiles));
  }, []);

  const handleToggleHold = async (holdStatus: boolean) => {
    if (!selectedProfile) return;
    const { snapshot } = await AccountsReceivableClient.toggleCreditHold(
      selectedProfile.customerId,
      holdStatus,
      'Manual credit decision updated by Risk Controller',
      'تحديث القرار الائتماني من مسؤول تقييم المخاطر'
    );
    setCreditProfiles(snapshot.creditProfiles);
  };

  const handleUpdateLimit = async () => {
    if (!selectedProfile) return;
    const { snapshot } = await AccountsReceivableClient.updateCreditLimit(selectedProfile.customerId, newLimitSAR, 'CFO Approval Committee');
    setCreditProfiles(snapshot.creditProfiles);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider pb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'منظومة إدارة المخاطر والحدود الائتمانية' : 'Customer Credit Risk & Limits Engine'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'التقييم الائتماني، حظر الشحنات ومصفوفة الموافقات' : 'Customer Credit Profiles, Credit Holds & Exposure Control'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr ? 'مراقبة الانكشاف الائتماني للعملاء، تصنيف المخاطر، فك الحظر الائتماني وتعديل الحدود' : 'Monitor exposure vs credit limit, manage automated shipment holds, risk levels & CFO approvals.'}
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profiles List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono border-b border-slate-800 pb-3">
            {isAr ? 'قائمة حسابات العملاء الائتمانية' : 'Credit Customer Accounts'}
          </h3>

          <div className="space-y-3">
            {creditProfiles.map(prof => {
              const utilPercent = Math.round((prof.currentExposureSAR / (prof.creditLimitSAR || 1)) * 100);

              return (
                <div
                  key={prof.id}
                  onClick={() => {
                    setSelectedCustomerId(prof.customerId);
                    setNewLimitSAR(prof.creditLimitSAR);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    selectedProfile && selectedProfile.customerId === prof.customerId
                      ? 'bg-sky-500/10 border-sky-500/40 shadow-lg'
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{isAr ? prof.customerNameAr : prof.customerNameEn}</span>
                    {prof.creditHold ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {isAr ? 'إيقاف الائتمان' : 'HOLD'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ {isAr ? 'نشط' : 'OK'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">{isAr ? 'الانكشاف الائتماني:' : 'Exposure:'}</span>
                      <span className="text-slate-200 font-bold">
                        SAR {(prof.currentExposureSAR / 1000).toFixed(0)}k / {(prof.creditLimitSAR / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${utilPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, utilPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Credit Inspector Details */}
        {selectedProfile && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs font-mono text-sky-400 font-bold">RISK RATING: {selectedProfile.riskRating}</div>
                  <h3 className="text-xl font-extrabold text-white">{isAr ? selectedProfile.customerNameAr : selectedProfile.customerNameEn}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedProfile.creditHold ? (
                    <button
                      onClick={() => handleToggleHold(false)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>{isAr ? 'فك الحظر الائتماني' : 'Release Credit Hold'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleHold(true)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isAr ? 'تطبيق الحظر الائتماني' : 'Impose Credit Hold'}</span>
                    </button>
                  )}
                </div>
              </div>

              {selectedProfile.creditHold && selectedProfile.holdReasonEn && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold">{isAr ? 'سبب الحظر الائتماني:' : 'Hold Reason:'} </span>
                    <span>{isAr ? selectedProfile.holdReasonAr : selectedProfile.holdReasonEn}</span>
                  </div>
                </div>
              )}

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'الحد الائتماني الحالي' : 'Credit Limit'}</div>
                  <div className="text-lg font-bold text-white">SAR {selectedProfile.creditLimitSAR.toLocaleString()}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'الانكشاف المستغل' : 'Current Exposure'}</div>
                  <div className="text-lg font-bold text-amber-400">SAR {selectedProfile.currentExposureSAR.toLocaleString()}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'الائتمان المتاح' : 'Available Credit'}</div>
                  <div className="text-lg font-bold text-emerald-400">SAR {selectedProfile.availableCreditSAR.toLocaleString()}</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <div className="text-slate-400">{isAr ? 'مؤشر سلوك السداد' : 'Behavior Score'}</div>
                  <div className="text-lg font-bold text-sky-400">{selectedProfile.paymentBehaviorScore} / 100</div>
                </div>
              </div>

              {/* Modify Credit Limit Box */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-400" />
                  <span>{isAr ? 'تعديل وتحديث الحد الائتماني المعين' : 'Modify & Revise Credit Limit'}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="number"
                    value={newLimitSAR}
                    onChange={e => setNewLimitSAR(Number(e.target.value))}
                    className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleUpdateLimit}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md shrink-0"
                  >
                    {isAr ? 'تعتمد لجنة الائتمان الحد الجديد' : 'Submit for Credit Limit Revision'}
                  </button>
                </div>
              </div>

              {/* Approval History */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 font-mono uppercase">{isAr ? 'سجل موافقات الائتمان' : 'Credit Approval History'}</h4>
                <div className="bg-slate-800/50 rounded-xl p-3 divide-y divide-slate-700/60 text-xs font-mono">
                  {selectedProfile.approvalMatrix.map((app, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-slate-300">
                      <div>
                        <div className="font-bold text-white">{app.level}</div>
                        <div className="text-[10px] text-slate-400">Approved by: {app.approverName} ({app.approvedAt})</div>
                      </div>
                      <div className="text-emerald-400 font-bold">
                        SAR {app.limitApprovedSAR.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
