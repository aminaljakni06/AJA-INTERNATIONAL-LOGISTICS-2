import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Search, 
  PackageSearch,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { trackShipmentByNumber, TrackingResponse } from '../../services/trackingService';
import { DetailedShipment } from '../../data/shipmentsData';
import { TrackingSearchForm } from '../../components/tracking/TrackingSearchForm';
import { TrackingResult } from '../../components/tracking/TrackingResult';
import { 
  TrackingEmptyState, 
  TrackingLoadingState, 
  TrackingErrorState 
} from '../../components/tracking/TrackingStateViews';
import { sanitizeInput } from '../../utils/security';
import { SEO } from '../../components/common/SEO';

interface TrackingPageProps {
  initialTrackingNum?: string;
  onNavigateToQuote?: () => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ 
  initialTrackingNum = '',
  onNavigateToQuote
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [searchQuery, setSearchQuery] = useState<string>(initialTrackingNum || '');
  const [shipment, setShipment] = useState<DetailedShipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const executeSearch = async (trackingNum: string) => {
    const clean = trackingNum ? sanitizeInput(trackingNum.trim()) : '';
    if (!clean) {
      setShipment(null);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchQuery(clean);

    try {
      const response: TrackingResponse = await trackShipmentByNumber(clean);
      if (response.success && response.shipment) {
        setShipment(response.shipment);
        setError(null);
      } else {
        setShipment(null);
        setError(response.error || (isAr ? 'لم يتم العثور على شحنة بهذا الرقم' : 'No shipment found for this code'));
      }
    } catch (err: any) {
      setShipment(null);
      setError(err?.message || (isAr ? 'حدث خطأ في جلب بيانات التتبع' : 'Error fetching tracking data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingNum) {
      executeSearch(initialTrackingNum);
    } else {
      // Load default sample for quick preview
      executeSearch('AJA-2026-000001');
    }
  }, [initialTrackingNum]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SEO title={isAr ? "تتبع الشحنات" : "Track Shipment"} />
      {/* HEADER TITLE BANNER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F4C75]/20 text-[#0F4C75] dark:text-sky-300 border border-[#0F4C75]/40 text-xs font-bold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-[#EA580C]" />
          <span>{isAr ? 'نظام تتبع بوالص الشحن المباشر' : 'AJA REAL-TIME TRACKING SYSTEM'}</span>
        </span>

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {isAr ? 'تتبع مسار الشحنة بالكامل' : 'Track Your Shipment'}
        </h1>

        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
          {isAr
            ? 'تابع خط السير، الموقع الجغرافي المباشر، الجدول الزمني للمراحل الستة، وسجل الفعاليات التفصيلي بضغطة زر.'
            : 'Monitor location, 6-stage timeline progression, and timestamped event logs for your cargo.'}
        </p>
      </div>

      {/* TRACKING SEARCH INPUT FORM */}
      <TrackingSearchForm
        onSearch={executeSearch}
        isLoading={loading}
        initialValue={searchQuery}
      />

      {/* DYNAMIC VIEW CONTAINER DEPENDING ON STATE */}
      <div className="space-y-8">
        {/* 1. Loading State */}
        {loading && <TrackingLoadingState />}

        {/* 2. Error State */}
        {!loading && error && (
          <TrackingErrorState
            errorMessage={error}
            onSelectSample={(code) => executeSearch(code)}
            onRetry={() => executeSearch(searchQuery)}
          />
        )}

        {/* 3. Success State */}
        {!loading && !error && shipment && (
          <TrackingResult shipment={shipment} />
        )}

        {/* 4. Empty State (when searched parameter is cleared/empty) */}
        {!loading && !error && !shipment && !hasSearched && (
          <TrackingEmptyState onSelectSample={(code) => executeSearch(code)} />
        )}
      </div>

      {/* BOTTOM ACTION CTA BANNER */}
      <div className="relative rounded-3xl bg-[#082F49] text-white border border-[#0F4C75] p-8 md:p-10 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-start relative z-10">
          <h3 className="text-xl md:text-2xl font-black text-white">
            {isAr ? 'تريد حجز شحنة جديدة أو الحصول على استشارة جمركية؟' : 'Ready to Book a New Shipment?'}
          </h3>
          <p className="text-slate-300 text-xs md:text-sm">
            {isAr
              ? 'احسب التكلفة الفورية لشحنتك القادمة مع أجا واستفد من أسعارنا التنافسية.'
              : 'Calculate instant freight quotes with AJA and access competitive global rates.'}
          </p>
        </div>

        {onNavigateToQuote && (
          <button
            onClick={onNavigateToQuote}
            className="px-6 py-3.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 shrink-0 shadow-lg cursor-pointer"
          >
            <span>{isAr ? 'طلب تسعيرة شحن جديدة' : 'Get Instant Quote'}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};
