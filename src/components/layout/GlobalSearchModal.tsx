import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Plane, 
  Ship, 
  Truck, 
  Boxes, 
  ShieldCheck, 
  Package, 
  FileText, 
  HelpCircle, 
  LayoutDashboard, 
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

interface SearchResult {
  id: string;
  titleEn: string;
  titleAr: string;
  category: 'services' | 'pages' | 'tracking' | 'support' | 'dashboard';
  tab: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: React.ReactNode;
}

const SEARCH_DATABASE: SearchResult[] = [
  {
    id: 'air-freight',
    titleEn: 'Air Freight Services',
    titleAr: 'خدمات الشحن الجوي',
    category: 'services',
    tab: 'air-freight',
    descriptionEn: 'Express global air cargo, chartering & temperature-controlled solutions',
    descriptionAr: 'شحن جوي عالمي سريع، طائرات خاصة وحلول مبردة',
    icon: <Plane className="w-4 h-4 text-[#0B5FFF] dark:text-[#00F0FF]" />,
  },
  {
    id: 'sea-freight',
    titleEn: 'Ocean & Sea Freight',
    titleAr: 'الشحن البحري والجاف',
    category: 'services',
    tab: 'sea-freight',
    descriptionEn: 'FCL, LCL, breakbulk, and global port-to-port ocean shipping',
    descriptionAr: 'شحن الحاويات الكلية والجزئية والبضائع السائبة عبر الموانئ العالمية',
    icon: <Ship className="w-4 h-4 text-[#0B5FFF] dark:text-[#00F0FF]" />,
  },
  {
    id: 'land-transport',
    titleEn: 'Land & Road Transport',
    titleAr: 'النقل البري والشاحنات',
    category: 'services',
    tab: 'land-transport',
    descriptionEn: 'Cross-border trucking, reefer fleets, and heavy equipment transport',
    descriptionAr: 'شاحنات عابرة للحدود، أسطول مبرد ونقل المعدات الثقيلة',
    icon: <Truck className="w-4 h-4 text-emerald-500" />,
  },
  {
    id: 'warehousing',
    titleEn: 'Smart Warehousing & 3PL',
    titleAr: 'المستودعات الذكية والخدمات اللوجستية',
    category: 'services',
    tab: 'warehousing',
    descriptionEn: 'Automated fulfillment, temperature-zoned storage & inventory control',
    descriptionAr: 'إدارة المخزون الآلية، مستودعات مبردة وحرة',
    icon: <Boxes className="w-4 h-4 text-amber-500" />,
  },
  {
    id: 'customs',
    titleEn: 'Customs Clearance Brokerage',
    titleAr: 'التخليص الجمركي المعتمد',
    category: 'services',
    tab: 'customs',
    descriptionEn: 'ZATCA & Fasah integrated sea, air, and land customs brokerage',
    descriptionAr: 'تخليص موانئ ومنافذ برية وجوية معتمد عبر هيئة الجمارك',
    icon: <ShieldCheck className="w-4 h-4 text-sky-500" />,
  },
  {
    id: 'tracking',
    titleEn: 'Live Shipment Tracking System',
    titleAr: 'نظام تتبع الشحنات الحي',
    category: 'tracking',
    tab: 'tracking',
    descriptionEn: 'Track waybills, container status, and live GPS positions in real-time',
    descriptionAr: 'تتبع البوليسة والحاويات والموقع الجغرافي الحي مباشرة',
    icon: <Package className="w-4 h-4 text-[#0B5FFF] dark:text-[#00F0FF]" />,
  },
  {
    id: 'quote-request',
    titleEn: 'Instant Freight Rate Calculator & Quote',
    titleAr: 'حاسبة أسعار الشحن والطلبات',
    category: 'pages',
    tab: 'quote-request',
    descriptionEn: 'Calculate instant air, sea, and land logistics costs online',
    descriptionAr: 'احسب تكاليف الشحن الجوي والبحري والبري فورياً عبر الإنترنت',
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'customer-dashboard',
    titleEn: 'Client Logistics Dashboard',
    titleAr: 'بوابة العملاء واللوحة اللوجستية',
    category: 'dashboard',
    tab: 'customer-dashboard',
    descriptionEn: 'View active shipments, invoices, documents, and analytics',
    descriptionAr: 'استعراض الشحنات النشطة، الفواتير، المستندات والتحليلات',
    icon: <LayoutDashboard className="w-4 h-4 text-[#0B5FFF] dark:text-[#00F0FF]" />,
  },
  {
    id: 'contact',
    titleEn: 'Customer Support & Help Center',
    titleAr: 'مركز الدعم والتواصل',
    category: 'support',
    tab: 'contact',
    descriptionEn: '24/7 logistics emergency response, phone, and ticket helpdesk',
    descriptionAr: 'دعم لوجستي مباشر على مدار الساعة، هاتف وتذاكر المساعدة',
    icon: <HelpCircle className="w-4 h-4 text-[#0B5FFF] dark:text-[#00F0FF]" />,
  },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aja_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Keyboard shortcut handler (CTRL/CMD + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via key
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredResults = query.trim()
    ? SEARCH_DATABASE.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.titleEn.toLowerCase().includes(q) ||
          item.titleAr.includes(q) ||
          item.descriptionEn.toLowerCase().includes(q) ||
          item.descriptionAr.includes(q)
        );
      })
    : SEARCH_DATABASE.slice(0, 5);

  const handleSelectResult = (tab: string, title: string) => {
    // Add to recent searches
    const updated = [title, ...recentSearches.filter((s) => s !== title)].slice(0, 4);
    setRecentSearches(updated);
    try {
      localStorage.setItem('aja_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    if (onNavigate) {
      onNavigate(tab);
    }
    onClose();
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('aja_recent_searches');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#0B5FFF] dark:text-[#00F0FF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث عن خدمات الشحن، تتبع البوليسة، أو المساعدة... (CTRL + K)'
                : 'Search services, tracking waybill, pages... (CTRL + K)'
            }
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {isAr ? 'البحوث الأخيرة' : 'Recent Searches'}
                </span>
                <button
                  onClick={handleClearRecent}
                  className="hover:text-red-400 text-[11px] transition-colors"
                >
                  {isAr ? 'مسح' : 'Clear'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-[#0B5FFF]/10 hover:text-[#0B5FFF] dark:hover:text-[#00F0FF] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider mb-2">
              {query ? (isAr ? 'نتائج البحث' : 'Search Results') : (isAr ? 'مقترحات سريعة' : 'Top Suggestions')}
            </div>

            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() =>
                    handleSelectResult(result.tab, isAr ? result.titleAr : result.titleEn)
                  }
                  className="w-full text-start p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-start gap-3.5 group cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-[#0B5FFF]/10 dark:group-hover:bg-[#00F0FF]/10 shrink-0 transition-colors">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0B5FFF] dark:group-hover:text-[#00F0FF] transition-colors truncate">
                        {isAr ? result.titleAr : result.titleEn}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {isAr ? result.descriptionAr : result.descriptionEn}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B5FFF] dark:group-hover:text-[#00F0FF] self-center shrink-0 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold">
                  {isAr ? 'لم نجد نتائج مطابقة لبحثك' : 'No matching logistics records found'}
                </p>
                <p className="text-xs text-slate-400">
                  {isAr ? 'جرب البحث برقم البوليسة أو اسم الخدمة' : 'Try searching by waybill number or service name'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{isAr ? 'انقر على النتيجة للانتقال المباشر' : 'Press Enter or click result to navigate'}</span>
          <span className="font-mono" dir="ltr">AJA ENTERPRISE SEARCH</span>
        </div>
      </div>
    </div>
  );
};
