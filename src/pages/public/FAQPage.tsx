import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  X,
  Sparkles,
  Tag,
  CheckCircle2,
  FileText,
  Ship,
  Truck,
  ShieldCheck,
  Package,
  Layers
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SEO } from '../../components/common/SEO';
import { useLanguage } from '../../i18n/LanguageContext';

export interface FAQItem {
  id: string;
  category: 'general' | 'sea' | 'land' | 'customs' | 'tracking';
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  tags?: string[];
}

const PRESET_FAQS: FAQItem[] = [
  {
    id: '1',
    category: 'general',
    questionAr: 'كيف يمكنني الحصول على عرض سعر فوري لشحنتي؟',
    questionEn: 'How can I get an instant quote for my shipment?',
    answerAr: 'يمكنك طلب عرض سعر مخصص من خلال الضغط على زر "طلب عرض سعر" في أعلى الصفحة وتعبئة بيانات الشحنة (نوع الشحن، بلد المنشأ والوصول، والوزن/الحجم)، وسيقوم فريق أجا اللوجستية بالرد عليك بعرض سعر خلال أقل من ساعتي عمل.',
    answerEn: 'You can request a custom quote by clicking the "Get Quote" button in the header and providing your shipment details (freight type, origin/destination, weight/volume). Our logistics team will respond within 2 working hours.',
    tags: ['عرض سعر', 'أسعار', 'تكلفة', 'quote', 'cost']
  },
  {
    id: '2',
    category: 'tracking',
    questionAr: 'كيف يمكنني تتبع الشحنة الخاصة بي في شركة أجا اللوجستية؟',
    questionEn: 'How do I track my shipment with AJA Logistics?',
    answerAr: 'يمكنك إدخال رقم التتبع الخاص بشحنتك (مثل AJA-882910-KSA أو رقم البوليسة) في شريط التتبع بالصفحة الرئيسية أو صفحة تتبع الشحنات. ستحصل على تحديث مباشر لحالة الحاوية أو الشاحنة، والموقع الحالي على الخريطة والوقت المتوقع للوصول ETA.',
    answerEn: 'Enter your tracking number (e.g. AJA-882910-KSA or B/L number) into the tracking bar on the home or tracking page. You will get live status updates, container map coordinates, and estimated time of arrival (ETA).',
    tags: ['تتبع', 'موقع الشحنة', 'حاوية', 'tracking', 'status', 'ETA']
  },
  {
    id: '3',
    category: 'customs',
    questionAr: 'ما هي المستندات المطلوبة للتخليص الجمركي في الموانئ والمنافذ السعودية؟',
    questionEn: 'What documents are required for customs clearance in Saudi ports?',
    answerAr: 'تشمل المستندات الأساسية: الفاتورة التجارية المصدقة، بوليسة الشحن (Bill of Lading)، شهادة المنشأ الأصيلة، شهادة مطابقة الجودة عبر منصة سابر (Saber)، وبيان التعبئة (Packing List). يتولى مخلصو أجا المعتمدون مراجعة أوراقك قبل وصول الشحنة.',
    answerEn: 'Basic documents include: Certified Commercial Invoice, Bill of Lading (B/L), Certificate of Origin, Saber Certificate of Conformity, and Packing List. AJA’s certified customs brokers review your documents prior to arrival.',
    tags: ['تخليص', 'مستندات', 'سابر', 'Saber', 'فسح', 'customs', 'documents']
  },
  {
    id: '4',
    category: 'sea',
    questionAr: 'ما هو الفرق بين الشحن البحري بالحاويات الكاملة (FCL) والشحن الجزئي (LCL)؟',
    questionEn: 'What is the difference between FCL and LCL ocean freight?',
    answerAr: 'الشحن الكلي (FCL) يعني حجز حاوية بالكامل لشحنتك دون مشاركتها مع أي عميل آخر، وهو الخيار الأمثل للشحنات ذات الأحجام الكبيرة. أما الشحن الجزئي (LCL) فهو تجميع شحنتك مع شحنات عملاء آخرين في حاوية واحدة مشتركة، مما يقلل التكلفة للشحنات الصغير والمتوسطة.',
    answerEn: 'Full Container Load (FCL) reserves an entire container exclusively for your goods. Less than Container Load (LCL) consolidates your cargo with other shipments in a shared container, reducing costs for smaller volumes.',
    tags: ['شحن بحري', 'FCL', 'LCL', 'حاويات', 'ocean', 'container']
  },
  {
    id: '5',
    category: 'land',
    questionAr: 'هل توفرون خدمة الشحن البري المحلي والدولي داخل دول مجلس التعاون الخليجي؟',
    questionEn: 'Do you offer GCC cross-border and local land transport?',
    answerAr: 'نعم، تمتلك شركة أجا أسطولاً حديثاً من الشاحنات المبردة، والجافة، والمقطورات المسطحة والنقل الثقيل لنقل البضائع والمعدات إلى كافة مناطق المملكة والدول المجاورة (الإمارات، الكويت، قطر، عمان، البحرين، والأردن) مع تتبع GPS مباشر.',
    answerEn: 'Yes, AJA operates a fleet of refrigerated, dry van, flatbed, and heavy-haul trucks covering all Saudi regions and GCC neighbors (UAE, Kuwait, Qatar, Oman, Bahrain, Jordan) with live GPS monitoring.',
    tags: ['شحن بري', 'شاحنات', 'الخليج', 'GCC', 'trucking', 'land']
  },
  {
    id: '6',
    category: 'customs',
    questionAr: 'هل شركة أجا للخدمات اللوجستية معتمدة على منصة فسح الجمركية؟',
    questionEn: 'Is AJA Logistics integrated with the FASAH customs portal?',
    answerAr: 'نعم، شركة أجا للخدمات اللوجستية تمتلك رخصة تخليص جمركي معتمدة وربط تقني مباشر مع منصة "فسح" (FASAH) وهيئة الزكاة والضريبة والجمارك (ZATCA)، مما يضمن الفسح السريع للحاويات خلال 24 إلى 48 ساعة.',
    answerEn: 'Yes, AJA is a licensed customs broker directly integrated with the FASAH portal and ZATCA. This ensures accelerated container clearance within 24 to 48 hours.',
    tags: ['فسح', 'FASAH', 'زكاة وجمرك', 'ZATCA', 'customs']
  },
  {
    id: '7',
    category: 'general',
    questionAr: 'كيف يمكنني إنشاء حساب عميل لمتابعة الفواتير وبوالص الشحن؟',
    questionEn: 'How can I create a customer portal account to manage invoices and B/Ls?',
    answerAr: 'يمكنك التسجيل مجاناً عبر رابط "بوابة العملاء" أو زر "تسجيل الدخول". ستتاح لك لوحة تحكم فورية لعرض شحناتك النشطة، تحميل الفواتير الالكترونية، استخراج بوالص الشحن، والتواصل المباشر مع مدير حسابك.',
    answerEn: 'You can register for free via the "Client Portal" or "Sign In" link. You will gain immediate access to view active shipments, download e-invoices, retrieve Bills of Lading, and chat directly with your account manager.',
    tags: ['حساب', 'بوابة العملاء', 'فواتير', 'portal', 'account']
  },
  {
    id: '8',
    category: 'general',
    questionAr: 'ما هي أنواع البضائع التي تقوم شركة أجا بنقلها وتخزينها؟',
    questionEn: 'What types of cargo does AJA Logistics transport and warehouse?',
    answerAr: 'نقوم بنقل وتخزين المواد الغذائية والمبردة، الأجهزة الإلكترونية، المواد الكيميائية المرخصة، قطع الغيار، خطوط الإنتاج والآلات الثقيلة، والمنتجات الاستهلاكية، مع توفير مستودعات مغلقة ومكيفة بحسب معايير الجودة.',
    answerEn: 'We transport and store refrigerated perishables, electronics, licensed chemical products, machinery, spare parts, and FMCG, supported by climate-controlled and secure warehousing facilities.',
    tags: ['بضائع', 'تخزين', 'تبريد', 'مستودعات', 'cargo', 'warehousing']
  }
];

const SUGGESTED_TAGS = [
  { labelAr: 'عرض سعر', labelEn: 'Get Quote', query: 'عرض سعر' },
  { labelAr: 'تتبع الشحنة', labelEn: 'Shipment Tracking', query: 'تتبع' },
  { labelAr: 'شهادة سابر Saber', labelEn: 'Saber Certificate', query: 'سابر' },
  { labelAr: 'منصة فسح', labelEn: 'FASAH Portal', query: 'فسح' },
  { labelAr: 'FCL / LCL', labelEn: 'FCL / LCL', query: 'FCL' },
  { labelAr: 'دول الخليج', labelEn: 'GCC Transport', query: 'الخليج' },
  { labelAr: 'مستندات الجمرك', labelEn: 'Customs Docs', query: 'مستندات' },
];

// Helper to normalize Arabic text for accurate search matching
const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '') // Remove Arabic short vowels / tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
};

// Component to render text with highlighted search keywords
const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !query.trim()) return <>{text}</>;

  const normalizedQuery = normalizeArabic(query);
  if (!normalizedQuery) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = normalizeArabic(part).includes(normalizedQuery);
        return isMatch ? (
          <mark
            key={index}
            className="bg-[#00F0FF]/30 dark:bg-[#00F0FF]/25 text-slate-900 dark:text-[#00F0FF] font-extrabold px-1 py-0.5 rounded border-b-2 border-[#00F0FF]"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </>
  );
};

export const FAQPage: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [faqs, setFaqs] = useState<FAQItem[]>(PRESET_FAQS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1']));

  // Fetch dynamic FAQs from server if available
  useEffect(() => {
    fetch('/api/services/faqs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.faqs) && data.faqs.length > 0) {
          const apiFaqs: FAQItem[] = data.faqs.map((f: any) => ({
            id: f.id || Math.random().toString(),
            category: f.category || 'general',
            questionAr: f.questionAr || f.question || '',
            questionEn: f.questionEn || f.question || '',
            answerAr: f.answerAr || f.answer || '',
            answerEn: f.answerEn || f.answer || '',
            tags: f.tags || []
          }));

          // Merge without duplicates
          const merged = [...PRESET_FAQS];
          apiFaqs.forEach((item) => {
            if (!merged.some((p) => p.id === item.id)) {
              merged.push(item);
            }
          });
          setFaqs(merged);
        }
      })
      .catch(() => {
        // Fallback to preset
      });
  }, []);

  // Filter FAQs based on real-time normalized search query and category
  const filteredFaqs = useMemo(() => {
    const normSearch = normalizeArabic(searchTerm);

    return faqs.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      if (!normSearch) return true;

      // Text search across Arabic & English fields and tags
      const qAr = normalizeArabic(item.questionAr);
      const qEn = normalizeArabic(item.questionEn);
      const aAr = normalizeArabic(item.answerAr);
      const aEn = normalizeArabic(item.answerEn);
      const tagsStr = (item.tags || []).map(normalizeArabic).join(' ');

      return (
        qAr.includes(normSearch) ||
        qEn.includes(normSearch) ||
        aAr.includes(normSearch) ||
        aEn.includes(normSearch) ||
        tagsStr.includes(normSearch)
      );
    });
  }, [faqs, searchTerm, selectedCategory]);

  // Auto-expand matching questions when user types a search query
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const matchIds = new Set(filteredFaqs.map((f) => f.id));
      setExpandedIds(matchIds);
    }
  }, [searchTerm, filteredFaqs]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: isAr ? item.questionAr : item.questionEn,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isAr ? item.answerAr : item.answerEn,
      },
    })),
  };

  const categoryOptions = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All', icon: Layers },
    { id: 'general', labelAr: 'عام وتكاليف', labelEn: 'General & Costs', icon: Sparkles },
    { id: 'tracking', labelAr: 'التتبع والوصول', labelEn: 'Tracking & ETA', icon: Package },
    { id: 'sea', labelAr: 'الشحن البحري', labelEn: 'Sea Freight', icon: Ship },
    { id: 'land', labelAr: 'الشحن البري', labelEn: 'Land Transport', icon: Truck },
    { id: 'customs', labelAr: 'التخليص الجمركي', labelEn: 'Customs Clearance', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 dir-rtl">
      <SEO title={isAr ? 'الأسئلة الشائعة | أجا اللوجستية' : 'FAQ | AJA Logistics'} schema={faqSchema} />

      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0F4C75]/10 dark:bg-[#00F0FF]/15 border border-[#00F0FF]/30 text-[#0F4C75] dark:text-[#00F0FF] text-xs font-black">
          <HelpCircle className="w-4 h-4 text-[#00F0FF]" />
          <span>{isAr ? 'مركز الأسئلة الشائعة والبحث الفوري' : 'Real-time FAQ Search Hub'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {isAr ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {isAr
            ? 'محرك بحث فوري وتفاعلي لإجابات أسئلة الشحن البحري والبري والتخليص الجمركي ومنصة فسح.'
            : 'Interactive real-time search engine for ocean, air, road freight, and customs clearance inquiries.'}
        </p>
      </div>

      {/* Real-time Search Box Card */}
      <Card className="p-4 sm:p-6 shadow-xl border-[#0F4C75]/30 bg-gradient-to-br from-white via-slate-50 to-sky-50/50 dark:from-[#0B172A] dark:to-[#030712] space-y-4 rounded-3xl relative overflow-hidden">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-[#0F4C75] dark:text-[#00F0FF]" />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث فوراً بكلمات رئيسية (مثال: فسح، سابر، FCL، تتبع، شاحنات، أسعار)...'
                : 'Search instantly by keywords (e.g., FASAH, Saber, FCL, tracking, GCC)...'
            }
            className="w-full ps-11 pe-11 py-3.5 text-sm sm:text-base font-medium rounded-2xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#030712] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00F0FF] shadow-inner transition-all min-h-[48px]"
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 end-0 pe-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              title={isAr ? 'مسح البحث' : 'Clear search'}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggested Quick Tag Chips */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
            <Tag className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>{isAr ? 'كلمات بحث مقترحة:' : 'Popular searches:'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TAGS.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSearchTerm(tag.query)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  searchTerm === tag.query
                    ? 'bg-[#00F0FF] text-[#030712] border-[#00F0FF] shadow-md font-extrabold'
                    : 'bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/10'
                }`}
              >
                {isAr ? tag.labelAr : tag.labelEn}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Categories & Actions Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto">
          {categoryOptions.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#0F4C75] text-white border-[#0F4C75] dark:bg-[#00F0FF] dark:text-[#030712] dark:border-[#00F0FF] shadow-md'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time Match Counter & Collapse Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-xs text-slate-600 dark:text-slate-300 font-bold border-t sm:border-t-0 pt-2 sm:pt-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-[#0F4C75] dark:text-[#00F0FF]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isAr
                ? `تم العثور على (${filteredFaqs.length}) إجابة`
                : `Found (${filteredFaqs.length}) answers`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? 'توسيع الكل' : 'Expand All'}
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isAr ? 'طَي الكل' : 'Collapse All'}
            </button>
          </div>
        </div>
      </div>

      {/* Accordion FAQ Items List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <Card className="text-center py-12 px-4 space-y-4 border-dashed border-2 border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'لم يتم العثور على سؤال يطابق البحث' : 'No matching question found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                {isAr
                  ? `جرب تفتيش كلمات مثل "تخليص"، "سابر"، "تتبع"، "فسح" أو تواصل مع مستشاري أجا المباشرين.`
                  : 'Try searching with simpler keywords or contact our logistics experts directly.'}
              </p>
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="font-bold cursor-pointer"
              >
                {isAr ? 'إعادة ضبط البحث' : 'Clear search query'}
              </Button>
            )}
          </Card>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = expandedIds.has(faq.id);
            const questionText = isAr ? faq.questionAr : faq.questionEn;
            const answerText = isAr ? faq.answerAr : faq.answerEn;

            return (
              <Card
                key={faq.id}
                className={`transition-all duration-200 rounded-2xl overflow-hidden ${
                  isOpen
                    ? 'border-[#0F4C75] dark:border-[#00F0FF] ring-2 ring-[#00F0FF]/20 bg-white dark:bg-[#0B172A]'
                    : 'border-slate-200 dark:border-white/10 hover:border-[#0F4C75]/40 dark:hover:border-white/20 bg-white dark:bg-[#030712]'
                }`}
              >
                <div
                  onClick={() => toggleExpand(faq.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-colors ${
                        isOpen
                          ? 'bg-[#00F0FF] text-[#030712]'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug pt-1">
                      <HighlightText text={questionText} query={searchTerm} />
                    </h3>
                  </div>

                  <div className="shrink-0 text-slate-400 hover:text-[#00F0FF]">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#00F0FF]" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-black/20">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      <HighlightText text={answerText} query={searchTerm} />
                    </p>

                    {faq.tags && faq.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold">{isAr ? 'العلامات:' : 'Tags:'}</span>
                        {faq.tags.map((t, idx) => (
                          <span
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm(t);
                            }}
                            className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold cursor-pointer hover:bg-[#00F0FF]/20 hover:text-[#00F0FF]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Contact Support Banner */}
      <Card className="bg-gradient-to-br from-[#0B172A] via-[#030712] to-[#082F49] text-white p-6 sm:p-8 rounded-3xl text-center space-y-4 border border-[#00F0FF]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <MessageSquare className="w-7 h-7" />
        </div>

        <div className="space-y-1 relative z-10">
          <h3 className="text-xl font-black text-white">
            {isAr ? 'هل لديك سؤال خاص بمنتجك أو شحنتك؟' : 'Have a specific question about your cargo?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {isAr
              ? 'فريق التخليص والعمليات بالشركة جاهز للإجابة وتزويدك بالتفاصيل الجمركية والحلول اللوجستية المناسبة.'
              : 'Our operations and customs team is standing by 24/7 to answer your logistics queries.'}
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 relative z-10">
          <Button
            variant="primary"
            onClick={() => onNavigate('quote-request')}
            className="bg-[#00F0FF] text-[#030712] hover:bg-[#38BDF8] font-black text-xs px-6 py-3 shadow-lg"
          >
            <span>{isAr ? 'طلب استشارة أو عرض سعر' : 'Get Consultation / Quote'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onNavigate('contact')}
            className="border-white/20 text-white hover:bg-white/10 font-bold text-xs px-5 py-3"
          >
            <span>{isAr ? 'التواصل مع الدعم المباشر' : 'Contact Live Support'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

