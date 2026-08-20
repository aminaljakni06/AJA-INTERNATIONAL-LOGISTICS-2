import React from 'react';
import { 
  PackageSearch, 
  AlertCircle, 
  RefreshCw, 
  Compass, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getSampleTrackingNumbers } from '../../services/trackingService';

interface StateProps {
  onSelectSample?: (code: string) => void;
  errorMessage?: string | null;
  onRetry?: () => void;
}

/**
 * EMPTY STATE
 * Displayed when user visits tracking page before submitting a search query
 */
export const TrackingEmptyState: React.FC<StateProps> = ({ onSelectSample }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const sampleNumbers = getSampleTrackingNumbers();

  return (
    <div className="bg-[#082F49]/90 border border-[#0F4C75] rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl">
      <div className="w-20 h-20 rounded-3xl bg-[#0F4C75] border border-[#0F4C75] text-white flex items-center justify-center mx-auto shadow-xl">
        <PackageSearch className="w-10 h-10 animate-bounce text-white" style={{ animationDuration: '3s' }} />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-2xl font-black text-white">
          {isAr ? 'تتبع شحنتك لحظة بلحظة' : 'Track Your Shipment Real-time'}
        </h3>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          {isAr
            ? 'أدخل رقم بوليصة الشحن الخاصة بشركة أجا في الحقل أعلاه لعرض مسار الحركة، الحالة الحالية، الجدول الزمني، وسجل الفعاليات المباشر.'
            : 'Enter your waybill or tracking number above to inspect route progression, active status, timeline, and audit logs.'}
        </p>
      </div>

      {/* Quick sample buttons inside empty state */}
      <div className="pt-4 border-t border-[#0F4C75] max-w-lg mx-auto space-y-3">
        <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
          {isAr ? 'أو يمكنك تجربة أحد أرقام التتبع التوضيحية:' : 'Or try one of our sample tracking numbers:'}
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {sampleNumbers.filter(s => s.status !== 'ERROR').map((sample) => (
            <button
              key={sample.code}
              onClick={() => onSelectSample?.(sample.code)}
              className="px-4 py-2 rounded-xl bg-[#0F4C75] hover:bg-[#082F49] text-white border border-[#0F4C75] text-xs font-mono font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-md"
            >
              <span>{sample.code}</span>
              <span className="text-[10px] text-slate-300 group-hover:text-white">({isAr ? sample.labelAr : sample.labelEn})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * LOADING STATE
 * Displayed while querying the tracking service
 */
export const TrackingLoadingState: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="bg-[#082F49] border border-[#0F4C75] rounded-3xl p-12 text-center space-y-6 shadow-2xl animate-pulse">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-[#0F4C75]/20 border-t-[#FFFFFF] animate-spin" />
        <Compass className="w-8 h-8 text-white absolute inset-0 m-auto" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">
          {isAr ? 'جاري الاستعلام عن بيانات الشحنة...' : 'Querying Shipment Tracking Data...'}
        </h3>
        <p className="text-xs text-slate-300">
          {isAr ? 'جاري الاتصال بنظام تتبع أجا وجلب خط السير والأحداث الزمانية...' : 'Connecting to AJA Logistics telemetry engine...'}
        </p>
      </div>
    </div>
  );
};

/**
 * ERROR STATE
 * Displayed when tracking number is invalid or not found
 */
export const TrackingErrorState: React.FC<StateProps> = ({ errorMessage, onSelectSample, onRetry }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const sampleNumbers = getSampleTrackingNumbers();

  return (
    <div className="bg-[#082F49] border border-rose-500/40 rounded-3xl p-8 md:p-10 space-y-6 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2 text-center md:text-start flex-1">
          <h3 className="text-xl font-black text-white">
            {isAr ? 'لم يتم العثور على أي شحنة لهذا الرقم' : 'No Shipment Found for this Tracking Code'}
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {errorMessage || (isAr
              ? 'تأكد من صحة الرقم المدخل أو حاول البحث عن أحد أرقام التتبع المتاحة بالنظام.'
              : 'Please check your tracking code for typos or select a working sample below.')}
          </p>
        </div>

        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl bg-[#0F4C75] hover:bg-[#0F4C75]/80 text-white text-xs font-bold flex items-center gap-2 border border-slate-600 shrink-0 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isAr ? 'إعادة المحاولة' : 'Try Again'}</span>
        </button>
      </div>

      {/* Suggested Valid Sample Numbers */}
      <div className="pt-4 border-t border-[#0F4C75] space-y-3">
        <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
          {isAr ? 'يمكنك تجربة أحد أرقام التتبع الصحيحة التالية:' : 'Try searching with one of these valid codes:'}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {sampleNumbers.filter(s => s.status !== 'ERROR').map((sample) => (
            <button
              key={sample.code}
              onClick={() => onSelectSample?.(sample.code)}
              className="px-3.5 py-2 rounded-xl bg-[#0F4C75] hover:bg-[#082F49] text-white border border-[#0F4C75] font-mono text-xs font-bold transition-all"
            >
              <span>{sample.code}</span>
              <span className="text-[10px] text-slate-300 mr-1.5 rtl:mr-1.5 ltr:ml-1.5">({isAr ? sample.labelAr : sample.labelEn})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
