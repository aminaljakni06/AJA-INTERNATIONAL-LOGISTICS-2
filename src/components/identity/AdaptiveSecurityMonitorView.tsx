import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Activity, 
  ShieldAlert, 
  MapPin, 
  Globe, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Zap,
  Lock,
  Sliders
} from 'lucide-react';
import { AdaptiveAuthRiskAssessment } from '../../types/identity';

export const AdaptiveSecurityMonitorView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [assessment, setAssessment] = useState<AdaptiveAuthRiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  const runAssessment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('aja_auth_token');
      const res = await fetch('/api/sso/adaptive/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          location: { country: 'SA', city: 'Riyadh' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (err) {
      console.error('[AdaptiveSecurityMonitor] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAssessment();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500 text-white';
      case 'HIGH': return 'bg-amber-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      default: return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-medium text-xs tracking-wider uppercase mb-1">
            <Activity className="w-4 h-4" />
            <span>{isAr ? 'محرك المصادقة التكيفية وتقييم المخاطر (Adaptive & Risk Auth)' : 'Adaptive Authentication Engine'}</span>
          </div>
          <h2 className="text-xl font-bold">{isAr ? 'مراقب خطورة الجلسات والسلوك التكيفي' : 'Session Risk & Adaptive Security Monitor'}</h2>
          <p className="text-slate-300 text-sm max-w-2xl mt-1">
            {isAr 
              ? 'تحليل مستمر لمؤشرات الخطورة (السفر غير الممكن Impossible Travel، تغير الموقع، سمعة الجهاز، وساعات العمل).'
              : 'Real-time security risk scoring evaluating device reputation, impossible travel detection, and location shifts.'}
          </p>
        </div>

        <button 
          onClick={runAssessment}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'إعادة التقييم' : 'Re-evaluate Risk'}</span>
        </button>
      </div>

      {assessment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">{isAr ? 'درجة الخطورة الحالية' : 'Current Risk Score'}</h3>

            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="relative w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900">{assessment.riskScore}</span>
                <span className="text-xs text-slate-400 absolute bottom-4 font-medium">/ 100</span>
              </div>

              <span className={`px-4 py-1 rounded-full text-xs font-bold ${getRiskColor(assessment.riskLevel)}`}>
                {assessment.riskLevel} {isAr ? 'مستوى الخطورة' : 'RISK'}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>{isAr ? 'يتطلب التحقق الثنائي (MFA):' : 'Requires MFA:'}</span>
                <span className={`font-semibold ${assessment.requiresMFA ? 'text-amber-600' : 'text-slate-400'}`}>
                  {assessment.requiresMFA ? (isAr ? 'نعم' : 'YES') : (isAr ? 'لا' : 'NO')}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{isAr ? 'حالة الحظر التكيفي:' : 'Adaptive Block Status:'}</span>
                <span className={`font-semibold ${assessment.blocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {assessment.blocked ? (isAr ? 'محظور' : 'BLOCKED') : (isAr ? 'مسموح' : 'ALLOWED')}
                </span>
              </div>
            </div>
          </div>

          {/* Location & Device Context */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-900 text-base">{isAr ? 'سياق الجلسة والمؤشرات البايومترية' : 'Session Context & Telemetry'}</h3>

            {assessment.locationDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>{isAr ? 'موقع الجلسة' : 'Session Location'}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{assessment.locationDetails.city}, {assessment.locationDetails.country}</p>
                  <p className="text-xs font-mono text-slate-400">IP: {assessment.locationDetails.ip}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>{isAr ? 'السفر غير الممكن (Impossible Travel)' : 'Impossible Travel Check'}</span>
                  </div>
                  <p className={`font-bold text-sm ${assessment.locationDetails.isImpossibleTravel ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {assessment.locationDetails.isImpossibleTravel ? (isAr ? 'تم رصد شذوذ' : 'Anomaly Detected') : (isAr ? 'طبيعي' : 'Normal')}
                  </p>
                </div>
              </div>
            )}

            {/* Risk Reasons Breakdown */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">{isAr ? 'ملاحظات وتوصيات المحرك التكيفي' : 'Engine Observations'}</h4>
              <ul className="space-y-2">
                {assessment.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
