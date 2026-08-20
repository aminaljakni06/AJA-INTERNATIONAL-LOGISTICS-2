import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Mic,
  QrCode,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Command,
  Package,
  Truck,
  Users,
  Boxes,
  FileText,
  DollarSign,
  LifeBuoy,
  Shield,
  Settings,
  CornerDownLeft,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Filter,
  Check
} from 'lucide-react';

export interface SearchResultCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: React.ElementType;
}

export interface SearchResultItem {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  categoryId: string;
  statusBadge?: {
    labelEn: string;
    labelAr: string;
    type: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  link?: string;
  actionEn?: string;
  actionAr?: string;
  onSelect?: () => void;
}

export interface EnterpriseSearchExperienceProps {
  placeholderEn?: string;
  placeholderAr?: string;
  moduleContext?: 'global' | 'shipments' | 'customers' | 'warehouses' | 'fleet' | 'invoices' | 'documents' | 'reports';
  onSearchChange?: (term: string) => void;
  onSelectResult?: (item: SearchResultItem) => void;
  initialRecentSearches?: string[];
  mockResults?: SearchResultItem[];
  isAr?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const EnterpriseSearchExperience: React.FC<EnterpriseSearchExperienceProps> = ({
  placeholderEn = 'Search shipments, customers, fleet, invoices... (Ctrl + K)',
  placeholderAr = 'ابحث في الشحنات، العملاء، الأسطول، الفواتير... (Ctrl + K)',
  moduleContext = 'global',
  onSearchChange,
  onSelectResult,
  initialRecentSearches = ['AJA-89211', 'Riyadh Cold Hub', 'Customs Clearance #402', 'Al-Marai Corp'],
  mockResults,
  isAr = false,
  className = '',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(initialRecentSearches);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
  const [isMac, setIsMac] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect OS for shortcut indicator
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }
  }, []);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category mapping
  const categories: SearchResultCategory[] = [
    { id: 'shipments', nameEn: 'Shipments & Logistics', nameAr: 'الشحنات واللوجستيات', icon: Package },
    { id: 'customers', nameEn: 'B2B Customers & Accounts', nameAr: 'العملاء والحسابات', icon: Users },
    { id: 'fleet', nameEn: 'Fleet & GPS Tracking', nameAr: 'الأسطول والتتبع', icon: Truck },
    { id: 'warehouses', nameEn: 'Warehouses & Inventory', nameAr: 'المستودعات والمخزون', icon: Boxes },
    { id: 'finance', nameEn: 'Finance & Invoices', nameAr: 'المالية والفواتير', icon: DollarSign },
    { id: 'documents', nameEn: 'Customs & Documents', nameAr: 'المستندات والجمارك', icon: FileText },
    { id: 'support', nameEn: 'Support Tickets', nameAr: 'تذاكر الدعم', icon: LifeBuoy },
    { id: 'settings', nameEn: 'Admin & Security', nameAr: 'الإدارة والأمان', icon: Settings },
  ];

  // Default sample search dataset if none provided
  const defaultResults: SearchResultItem[] = useMemo(() => [
    {
      id: 'res-1',
      titleEn: 'AJA-98421 - Container Freight Express',
      titleAr: 'AJA-98421 - شحن الحاويات السريع',
      subtitleEn: 'Jeddah Port → Riyadh Dry Port (In Transit)',
      subtitleAr: 'ميناء جدة → ميناء الرياض الجاف (قيد العبور)',
      categoryId: 'shipments',
      statusBadge: { labelEn: 'In Transit', labelAr: 'قيد الترانزيت', type: 'info' },
      actionEn: 'Track Cargo',
      actionAr: 'تتبع الشحنة',
    },
    {
      id: 'res-2',
      titleEn: 'AJA-89211 - Cold Chain Pharmaceutical',
      titleAr: 'AJA-89211 - الشحن الدوائي المبرد',
      subtitleEn: 'Dammam Hub → King Fahd Medical City',
      subtitleAr: 'مركز الدمام → مدينة الملك فهد الطبية',
      categoryId: 'shipments',
      statusBadge: { labelEn: 'Cleared Customs', labelAr: 'مكتمل جمركياً', type: 'success' },
      actionEn: 'View POD',
      actionAr: 'عرض التخليص',
    },
    {
      id: 'res-3',
      titleEn: 'Al-Marai Global Logistics Account',
      titleAr: 'حساب المراعي اللوجستي العالمي',
      subtitleEn: 'Key Account • Contract #AJA-2026-99',
      subtitleAr: 'حساب رئيسي • عقد رقم #AJA-2026-99',
      categoryId: 'customers',
      statusBadge: { labelEn: 'VIP Client', labelAr: 'عميل متميز', type: 'success' },
      actionEn: 'Customer 360',
      actionAr: 'ملف العميل',
    },
    {
      id: 'res-4',
      titleEn: 'Volvo FH16 Semi-Truck - Fleet #TRK-104',
      titleAr: 'شاحنة فولفو FH16 - أسطول #TRK-104',
      subtitleEn: 'GPS Signal Active • Speed 88 km/h • Driver: Ahmed Said',
      subtitleAr: 'إشارة GPS نشطة • السرعة 88 كم/س • السائق: أحمد سعيد',
      categoryId: 'fleet',
      statusBadge: { labelEn: 'Online GPS', labelAr: 'تتبع حي', type: 'success' },
      actionEn: 'Live Map',
      actionAr: 'الخريطة الحية',
    },
    {
      id: 'res-5',
      titleEn: 'Riyadh Central Automated Hub (RUH-01)',
      titleAr: 'مركز الرياض الآلي المركزي (RUH-01)',
      subtitleEn: 'Capacity: 88.4% Occupied • Cold Storage Available',
      subtitleAr: 'السعة: 88.4% مستغلة • التبريد متاح',
      categoryId: 'warehouses',
      statusBadge: { labelEn: 'High Capacity', labelAr: 'سعة مرتفعة', type: 'warning' },
      actionEn: 'Inspect Hub',
      actionAr: 'معاينة المستودع',
    },
    {
      id: 'res-6',
      titleEn: 'INV-2026-8801 - Customs Brokerage Fee',
      titleAr: 'INV-2026-8801 - رسوم التخليص الجمركي',
      subtitleEn: 'Amount: 142,500.00 SAR • Due in 5 Days',
      subtitleAr: 'المبلغ: 142,500.00 ريال • استحقاق خلال 5 أيام',
      categoryId: 'finance',
      statusBadge: { labelEn: 'Pending Settlement', labelAr: 'بانتظار السداد', type: 'warning' },
      actionEn: 'Pay Invoice',
      actionAr: 'سداد الفاتورة',
    },
  ], []);

  const searchDataset = mockResults || defaultResults;

  // Filtered Results
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchDataset.filter((item) => {
      const matchEn = item.titleEn.toLowerCase().includes(q) || (item.subtitleEn && item.subtitleEn.toLowerCase().includes(q));
      const matchAr = item.titleAr.toLowerCase().includes(q) || (item.subtitleAr && item.subtitleAr.toLowerCase().includes(q));
      return matchEn || matchAr;
    });
  }, [query, searchDataset]);

  // Handle Query Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setSelectedIndex(-1);
    if (onSearchChange) onSearchChange(val);

    // Simulate light search debounce loading if needed
    if (val.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 120);
      return () => clearTimeout(timer);
    }
  };

  // Keyboard Arrow Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredResults.length) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    }
  };

  // Select Item
  const handleSelectItem = (item: SearchResultItem) => {
    // Add query to recent searches
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }
    setIsOpen(false);
    if (item.onSelect) item.onSelect();
    if (onSelectResult) onSelectResult(item);
  };

  // Status badge styling helper
  const getBadgeClass = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'danger':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'info':
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div
        className={`relative flex items-center w-full bg-white dark:bg-[#0B172A] border transition-all duration-150 rounded-2xl shadow-xs overflow-hidden ${
          isOpen
            ? 'border-[#00F0FF] ring-2 ring-[#00F0FF]/20 shadow-lg'
            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
        }`}
      >
        {/* Search Icon */}
        <div className="ps-3.5 pe-2 text-slate-400 flex items-center">
          <Search className={`w-4 h-4 transition-colors ${isOpen ? 'text-[#00F0FF]' : ''}`} />
        </div>

        {/* Input Element */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={isAr ? placeholderAr : placeholderEn}
          className="w-full py-2.5 pe-12 bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />

        {/* Right Input Actions (Clear, Voice, Scanner, Shortcut badge) */}
        <div className="flex items-center gap-1 pe-2.5">
          {/* Clear Button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                if (onSearchChange) onSearchChange('');
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title={isAr ? 'مسح البحث' : 'Clear Search'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Barcode Scanner Placeholder Button */}
          <button
            type="button"
            onClick={() => setIsScannerActive(!isScannerActive)}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isScannerActive ? 'text-[#00F0FF] bg-cyan-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
            title={isAr ? 'ماسح البارکود جمركي' : 'Barcode/QR Scanner'}
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          {/* Voice Search Placeholder Button */}
          <button
            type="button"
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isVoiceActive ? 'text-[#00F0FF] bg-cyan-500/10 animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
            title={isAr ? 'البحث الصوتي' : 'Voice Search'}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Keyboard Shortcut Badge */}
          <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-[10px] font-mono text-slate-400 font-bold">
            <span>{isMac ? '⌘' : 'Ctrl'}</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Dropdown Results Overlay */}
      {isOpen && (
        <div className="absolute start-0 end-0 top-12 z-50 bg-white dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Active Voice/Scanner Indicator Banners if toggled */}
          {isVoiceActive && (
            <div className="p-2.5 bg-cyan-500/10 border-b border-cyan-500/20 text-xs text-[#00F0FF] font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mic className="w-4 h-4 animate-bounce" />
                <span>{isAr ? 'جاري استماع البحث الصوتي...' : 'Listening for voice query...'}</span>
              </span>
              <button onClick={() => setIsVoiceActive(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isScannerActive && (
            <div className="p-2.5 bg-purple-500/10 border-b border-purple-500/20 text-xs text-purple-400 font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <QrCode className="w-4 h-4 animate-pulse" />
                <span>{isAr ? 'كاميرا الباركود نشطة - قم بتوجيه الرمز' : 'QR/Barcode scanner ready - align camera'}</span>
              </span>
              <button onClick={() => setIsScannerActive(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-32" />
              <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl" />
              <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl" />
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="p-6 text-center text-rose-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p className="text-xs font-bold">{isAr ? 'فشل البحث الإشرافي' : 'Search query failed'}</p>
              <button
                onClick={() => setHasError(false)}
                className="px-3 py-1 bg-rose-500/20 rounded-lg text-xs font-bold hover:bg-rose-500/30 transition-colors"
              >
                {isAr ? 'إعادة التحديث' : 'Retry'}
              </button>
            </div>
          )}

          {/* Default Suggestions (When query is empty) */}
          {!query.trim() && !isLoading && (
            <div className="p-3 space-y-3">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#00F0FF]" />
                      <span>{isAr ? 'عمليات البحث الأخيرة' : 'Recent Searches'}</span>
                    </span>
                    <button
                      onClick={() => setRecentSearches([])}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {isAr ? 'مسح الكل' : 'Clear All'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(term);
                          if (onSearchChange) onSearchChange(term);
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/10 hover:text-[#00F0FF] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Quick Filters */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isAr ? 'تصفح حسب القسم' : 'Browse Modules'}</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {categories.map((cat) => {
                    const CatIcon = cat.icon as React.ComponentType<{ className?: string }>;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setQuery(isAr ? cat.nameAr : cat.nameEn);
                          if (onSearchChange) onSearchChange(isAr ? cat.nameAr : cat.nameEn);
                        }}
                        className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 rounded-xl text-start transition-all cursor-pointer flex items-center gap-2 group"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 group-hover:text-[#00F0FF] transition-colors">
                          <CatIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">
                          {isAr ? cat.nameAr : cat.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Filtered Search Results List */}
          {query.trim() && !isLoading && (
            <div>
              {filteredResults.length === 0 ? (
                // Empty Results State
                <div className="p-8 text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-slate-400 opacity-40 mx-auto" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? `لم نجد نتائج تطابق "${query}"` : `No matching results for "${query}"`}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    {isAr
                      ? 'تأكد من كتابة الرقم التسلسلي بشكل صحيح أو استخدم شفرة B/L'
                      : 'Check order number, tracking code, or B/L number format'}
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 p-1.5">
                  {filteredResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const catObj = categories.find((c) => c.id === item.categoryId) || categories[0];
                    const CatIcon = catObj.icon as React.ComponentType<{ className?: string }>;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-cyan-500/10 border border-cyan-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#00F0FF] flex items-center justify-center shrink-0">
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {isAr ? item.titleAr : item.titleEn}
                              </h4>
                              {item.statusBadge && (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${getBadgeClass(item.statusBadge.type)}`}>
                                  {isAr ? item.statusBadge.labelAr : item.statusBadge.labelEn}
                                </span>
                              )}
                            </div>
                            {(item.subtitleEn || item.subtitleAr) && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {isAr ? item.subtitleAr : item.subtitleEn}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick Action */}
                        <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#00F0FF]">
                          <span className="hidden sm:inline text-[10px] font-bold">
                            {isAr ? item.actionAr || 'فتح' : item.actionEn || 'Open'}
                          </span>
                          {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Bar */}
          <div className="p-2 bg-slate-50 dark:bg-[#080E1A] border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-400 px-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono">↑↓</kbd>
                <span>{isAr ? 'للتنقل' : 'Navigate'}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono">↵</kbd>
                <span>{isAr ? 'للاختيار' : 'Select'}</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono">ESC</kbd>
                <span>{isAr ? 'للإغلاق' : 'Close'}</span>
              </span>
            </div>

            <span className="font-mono text-[#00F0FF]">AJA Search Engine v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
};
