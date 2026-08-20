/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Lookup Engine Service
 * Phase: Enterprise UI System
 * Module: Enterprise Selection, Lookup & Autocomplete System
 * Version: 1.0
 */

import {
  LookupType,
  LookupItem,
  LookupFilter,
  LookupRequest,
  LookupResponse,
  EntityPreview,
  SearchMetadata,
} from '../../types/selectionLookupFramework';

// --- MOCK ENTERPRISE REGISTRY DATASET ---
const MOCK_DATASET: Record<LookupType, LookupItem[]> = {
  customer: [
    {
      id: 'cust-101',
      code: 'CUST-SAUDI-ARAMCO',
      nameEn: 'Saudi Aramco Logistics Division',
      nameAr: 'شركة أرامكو السعودية - قطاع اللوجستيات',
      category: 'Energy & Oil',
      subtitleEn: 'Dhahran Head Office • Enterprise Key Account',
      subtitleAr: 'المقر الرئيسي بالظهران • حساب رئيسي للمؤسسات',
      status: 'ACTIVE',
      tags: ['VIP', 'Oil & Gas', 'Key Account'],
      metadata: { taxId: '300018920100003', creditLimitSAR: 5000000, branch: 'Eastern Province' },
    },
    {
      id: 'cust-102',
      code: 'CUST-SABIC-GLOBAL',
      nameEn: 'SABIC Petrochemicals Global',
      nameAr: 'سابيك للصناعات البتروكيماوية العالمية',
      category: 'Chemicals',
      subtitleEn: 'Jubail Industrial City • Platinum Partner',
      subtitleAr: 'مدينة الجبيل الصناعية • شريك بلاتيني',
      status: 'ACTIVE',
      tags: ['Chemicals', 'Global', 'Hazmat'],
      metadata: { taxId: '300029810200003', creditLimitSAR: 10000000, branch: 'Jubail' },
    },
    {
      id: 'cust-103',
      code: 'CUST-ALMARAI-DIST',
      nameEn: 'Almarai Food Distribution Logistics',
      nameAr: 'شركة المراعي لتوزيع الأغذية واللوجستيات',
      category: 'FMCG & Cold Chain',
      subtitleEn: 'Riyadh Logistics Park • Cold Storage',
      subtitleAr: 'مجمع الرياض اللوجستي • التبريد والتجميد',
      status: 'ACTIVE',
      tags: ['Cold Chain', 'Food', 'FMCG'],
      metadata: { taxId: '300038201900003', creditLimitSAR: 3500000, branch: 'Riyadh' },
    },
  ],
  warehouse: [
    {
      id: 'wh-01',
      code: 'W01-RUH-HUB',
      nameEn: 'Riyadh Central Distribution Hub',
      nameAr: 'مركز توزيع الرياض المركزي',
      category: 'Distribution Center',
      subtitleEn: 'Al-Sulay Logistics Zone • 45,000 sqm',
      subtitleAr: 'منطقة السلي اللوجستية • 45,000 متر مربع',
      status: 'ACTIVE',
      tags: ['Automated', 'Cold Storage', 'Bonded'],
      metadata: { manager: 'Eng. Fahad Al-Otaibi', totalCapacityBins: 120000 },
    },
    {
      id: 'wh-02',
      code: 'W02-JED-PORT',
      nameEn: 'Jeddah Sea Port Logistics Yard',
      nameAr: 'ساحة مصفاة ساحل جدة البحرية',
      category: 'Port Yard',
      subtitleEn: 'Jeddah Islamic Port Area • Bonded Warehouse',
      subtitleAr: 'منطقة ميناء جدة الإسلامي • مستودع جمركي',
      status: 'ACTIVE',
      tags: ['Sea Port', 'Customs Bonded', 'Cross-Dock'],
      metadata: { manager: 'Sultan Al-Ghamdi', totalCapacityBins: 85000 },
    },
    {
      id: 'wh-03',
      code: 'W03-DMM-IND',
      nameEn: 'Dammam 2nd Industrial Depot',
      nameAr: 'مستودع المدينة الصناعية الثانية بالدمام',
      category: 'Industrial Park',
      subtitleEn: 'Dammam Industrial City • Heavy Freight',
      subtitleAr: 'المدينة الصناعية بالدمام • الشحن الثقيل',
      status: 'ACTIVE',
      tags: ['Hazmat', 'Heavy Freight'],
      metadata: { manager: 'Yasser Al-Qahtani', totalCapacityBins: 60000 },
    },
  ],
  port: [
    {
      id: 'port-01',
      code: 'SAJED',
      nameEn: 'Jeddah Islamic Port',
      nameAr: 'ميناء جدة الإسلامي',
      category: 'Sea Port',
      subtitleEn: 'Red Sea Gateway • UN/LOCODE: SAJED',
      subtitleAr: 'بوابة البحر الأحمر • رمز الأُمم المتحدة: SAJED',
      status: 'ACTIVE',
      tags: ['Major Hub', 'Red Sea'],
      metadata: { coordinates: '21.4858° N, 39.1925° E', country: 'Saudi Arabia' },
    },
    {
      id: 'port-02',
      code: 'SADMM',
      nameEn: 'King Abdulaziz Port Dammam',
      nameAr: 'ميناء الملك عبد العزيز بالدمام',
      category: 'Sea Port',
      subtitleEn: 'Arabian Gulf Gateway • UN/LOCODE: SADMM',
      subtitleAr: 'بوابة الخليج العربي • رمز الأُمم المتحدة: SADMM',
      status: 'ACTIVE',
      tags: ['Arabian Gulf', 'Bulk Terminal'],
      metadata: { coordinates: '26.4340° N, 50.1033° E', country: 'Saudi Arabia' },
    },
    {
      id: 'port-03',
      code: 'AEDXB',
      nameEn: 'Jebel Ali Port Dubai',
      nameAr: 'ميناء جبل علي دبي',
      category: 'Sea Port',
      subtitleEn: 'DP World Flagship Terminal • UN/LOCODE: AEDXB',
      subtitleAr: 'المحطة الرئيسية لموانئ دبي • رمز الأُمم المتحدة: AEDXB',
      status: 'ACTIVE',
      tags: ['Transshipment', 'Regional Hub'],
      metadata: { coordinates: '24.9857° N, 55.0657° E', country: 'UAE' },
    },
  ],
  carrier: [
    {
      id: 'car-01',
      code: 'CAR-MAERSK',
      nameEn: 'Maersk Line Shipping',
      nameAr: 'ميرسك لاين لخطوط الملاحة البحرية',
      category: 'Ocean Carrier',
      subtitleEn: 'Global Container Carrier • Tier 1 Vendor',
      subtitleAr: 'ناقل حاويات عالمي • مورد المستوى الأول',
      status: 'ACTIVE',
      tags: ['Ocean', 'Global', 'Contracted'],
      metadata: { scac: 'MAEU', rating: 4.9 },
    },
    {
      id: 'car-02',
      code: 'CAR-DHL-FREIGHT',
      nameEn: 'DHL Global Forwarding',
      nameAr: 'دي إتش إلم الشحن العالمي',
      category: 'Air & Land Freight',
      subtitleEn: 'Air Cargo & Land Logistics Partner',
      subtitleAr: 'شريك الشحن الجوي واللوجستيات البرية',
      status: 'ACTIVE',
      tags: ['Air Freight', 'Express', 'Cold Chain'],
      metadata: { scac: 'DHLF', rating: 4.8 },
    },
    {
      id: 'car-03',
      code: 'CAR-BAHRI',
      nameEn: 'Bahri National Shipping Company',
      nameAr: 'شركة البحري الوطنية للنقل البحري',
      category: 'National Maritime Carrier',
      subtitleEn: 'Saudi National Shipping Line • Bulk & RoRo',
      subtitleAr: 'الناقل البحري الوطني السعودي • الشحن السائب والسيارات',
      status: 'ACTIVE',
      tags: ['National Carrier', 'RoRo', 'Bulk'],
      metadata: { scac: 'NSCSA', rating: 5.0 },
    },
  ],
  driver: [
    {
      id: 'drv-01',
      code: 'DRV-9901',
      nameEn: 'Tariq Al-Mansoor',
      nameAr: 'طارق المنصور',
      category: 'Heavy Truck Driver',
      subtitleEn: 'License Heavy Rig • Riyadh Fleet Base',
      subtitleAr: 'رخصة شاحنات ثقيلة • أسطول الرياض',
      status: 'ACTIVE',
      tags: ['Heavy License', 'Hazmat Certified'],
      metadata: { iqamaNumber: '2489018201', phone: '+966 50 123 4567' },
    },
    {
      id: 'drv-02',
      code: 'DRV-9902',
      nameEn: 'Khalid Ahmed Al-Ghamdi',
      nameAr: 'خالد أحمد الغامدي',
      category: 'Refrigerated Truck Specialist',
      subtitleEn: 'Cold Chain Driver • Western Province',
      subtitleAr: 'سائق شاحنات التبريد • المنطقة الغربية',
      status: 'ACTIVE',
      tags: ['Cold Chain', 'Intercity'],
      metadata: { iqamaNumber: '2398102910', phone: '+966 55 987 6543' },
    },
  ],
  shipment: [
    {
      id: 'shp-8801',
      code: 'SHP-2026-8801',
      nameEn: 'Petrochemical Equipment Cargo - Jubail to Dammam',
      nameAr: 'شحنة معدات بتروكيماوية - من الجبيل إلى الدمام',
      category: 'Land Freight',
      subtitleEn: 'Consignment #8801 • 3 x 40ft Flatbed Trailers',
      subtitleAr: 'الشحنة #8801 • 3 مقطورات مسطحة 40 قدم',
      status: 'IN_TRANSIT',
      tags: ['Priority', 'Flatbed', 'Intercity'],
      metadata: { origin: 'Jubail Industrial', destination: 'Dammam Seaport', weightKg: 42000 },
    },
    {
      id: 'shp-9402',
      code: 'SHP-2026-9402',
      nameEn: 'Pharmaceutical Cold Chain Import - FRA to RUH',
      nameAr: 'استيراد أدوية مبردة - من فرانکفورت إلى الرياض',
      category: 'Air Freight',
      subtitleEn: 'Temperature Controlled (+2°C to +8°C)',
      subtitleAr: 'شحنة مبردة مضبوطة الحرارة (+2° إلى +8° مئوية)',
      status: 'IN_TRANSIT',
      tags: ['Air Freight', 'Cold Chain', 'Customs Cleared'],
      metadata: { origin: 'Frankfurt Airport', destination: 'Riyadh Air Cargo', weightKg: 3500 },
    },
  ],
  container: [
    {
      id: 'cnt-4081',
      code: 'TGHU-4081920',
      nameEn: '40ft High Cube Dry Container',
      nameAr: 'حاوية جافة 40 قدم مرتفعة',
      category: 'Container 40HC',
      subtitleEn: 'Seal #SA-990182 • Inspected & Cleared',
      subtitleAr: 'الختم #SA-990182 • مفحوصة ومفسحة',
      status: 'ACTIVE',
      tags: ['40HC', 'Dry Cargo'],
      metadata: { tareKg: 3800, maxPayloadKg: 28200 },
    },
  ],
  country: [
    {
      id: 'cntry-sa',
      code: 'SA',
      nameEn: 'Saudi Arabia',
      nameAr: 'المملكة العربية السعودية',
      category: 'GCC Region',
      subtitleEn: 'Dial Code: +966 • Currency: SAR',
      subtitleAr: 'مفتاح الاتصال: +966 • العملة: ريال سعودي',
      status: 'ACTIVE',
      tags: ['GCC', 'Home Region'],
      metadata: { iso3: 'SAU', continent: 'Asia' },
    },
    {
      id: 'cntry-ae',
      code: 'AE',
      nameEn: 'United Arab Emirates',
      nameAr: 'الإمارات العربية المتحدة',
      category: 'GCC Region',
      subtitleEn: 'Dial Code: +971 • Currency: AED',
      subtitleAr: 'مفتاح الاتصال: +971 • العملة: درهم إماراتي',
      status: 'ACTIVE',
      tags: ['GCC'],
      metadata: { iso3: 'ARE', continent: 'Asia' },
    },
  ],
  currency: [
    {
      id: 'cur-sar',
      code: 'SAR',
      nameEn: 'Saudi Riyal (SAR)',
      nameAr: 'الريال السعودي (SAR)',
      category: 'Base Currency',
      subtitleEn: 'Pegged: 1 USD = 3.75 SAR',
      subtitleAr: 'سعر الصرف الثابت: 1 دولار = 3.75 ريال',
      status: 'ACTIVE',
      tags: ['Primary', 'GCC'],
      metadata: { symbol: 'ر.س', precision: 2 },
    },
    {
      id: 'cur-usd',
      code: 'USD',
      nameEn: 'United States Dollar ($)',
      nameAr: 'الدولار الأمريكي ($)',
      category: 'Global Freight Currency',
      subtitleEn: 'International Freight Standard',
      subtitleAr: 'معيار الشحن الدولي',
      status: 'ACTIVE',
      tags: ['International', 'USD'],
      metadata: { symbol: '$', precision: 2 },
    },
  ],
  company: [],
  branch: [],
  department: [],
  user: [],
  employee: [],
  role: [],
  quote: [],
  booking: [],
  inventory_item: [],
  product: [],
  supplier: [],
  vendor: [],
  vehicle: [],
  route: [],
  airport: [],
  city: [],
  language: [],
  document: [],
  ai_template: [],
};

// In-Memory Search Cache Store
const SEARCH_CACHE = new Map<string, LookupResponse>();

// Recents & Favorites Local Persistence Keys
const RECENT_SEARCHES_KEY = 'aja_enterprise_recent_searches';
const FAVORITES_KEY = 'aja_enterprise_lookup_favorites';

export class EnterpriseLookupEngine {
  /**
   * Execute an asynchronous lookup query with debouncing, caching, and filtering
   */
  public static async executeLookup(request: LookupRequest): Promise<LookupResponse> {
    const startTime = performance.now();
    const { lookupType, filter } = request;

    const cacheKey = `${lookupType}_${JSON.stringify(filter)}`;
    if (SEARCH_CACHE.has(cacheKey)) {
      return SEARCH_CACHE.get(cacheKey)!;
    }

    // Simulate async network latency for realistic Enterprise behavior
    await new Promise((res) => setTimeout(res, 120));

    const sourceData = MOCK_DATASET[lookupType] || [];
    const keyword = (filter.searchKeyword || '').trim().toLowerCase();

    // 1. Filter dataset by search keyword (Code, NameEn, NameAr, Category, Subtitle)
    let filtered = sourceData.filter((item) => {
      if (!keyword) return true;
      const matchCode = item.code.toLowerCase().includes(keyword);
      const matchEn = item.nameEn.toLowerCase().includes(keyword);
      const matchAr = item.nameAr.toLowerCase().includes(keyword);
      const matchCat = item.category?.toLowerCase().includes(keyword) || false;
      const matchSubEn = item.subtitleEn?.toLowerCase().includes(keyword) || false;
      const matchSubAr = item.subtitleAr?.toLowerCase().includes(keyword) || false;
      const matchTag = item.tags?.some((t) => t.toLowerCase().includes(keyword)) || false;

      return matchCode || matchEn || matchAr || matchCat || matchSubEn || matchSubAr || matchTag;
    });

    // 2. Filter by status if requested
    if (filter.status) {
      filtered = filtered.filter((item) => item.status === filter.status);
    }

    // 3. Filter by Category if requested
    if (filter.category) {
      filtered = filtered.filter((item) => item.category === filter.category);
    }

    // 4. Attach Favorites & Recents metadata state
    const favorites = this.getFavoriteIds();
    const recents = this.getRecentSearches();

    filtered = filtered.map((item) => ({
      ...item,
      isFavorite: favorites.includes(item.id),
      isRecent: recents.includes(item.id),
    }));

    // 5. Pagination
    const limit = filter.limit || 20;
    const page = filter.page || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    const endTime = performance.now();
    const searchDurationMs = Math.round(endTime - startTime);

    const response: LookupResponse = {
      items: paginatedItems,
      totalCount: filtered.length,
      page,
      limit,
      hasMore: startIndex + limit < filtered.length,
      searchDurationMs,
    };

    // Store in cache
    SEARCH_CACHE.set(cacheKey, response);

    return response;
  }

  /**
   * Get entity preview model for sidebars, drawers, and inspect cards
   */
  public static getEntityPreview(item: LookupItem, lookupType: LookupType): EntityPreview {
    let badgeColor: 'emerald' | 'amber' | 'sky' | 'rose' | 'slate' = 'emerald';
    if (item.status === 'IN_TRANSIT') badgeColor = 'sky';
    if (item.status === 'PENDING') badgeColor = 'amber';
    if (item.status === 'SUSPENDED') badgeColor = 'rose';

    const metadataMap: { labelEn: string; labelAr: string; value: string }[] = [];

    if (item.metadata) {
      Object.entries(item.metadata).forEach(([key, val]) => {
        metadataMap.push({
          labelEn: key.replace(/([A-Z])/g, ' $1').toUpperCase(),
          labelAr: key,
          value: String(val),
        });
      });
    }

    return {
      id: item.id,
      lookupType,
      primaryTitleEn: item.nameEn,
      primaryTitleAr: item.nameAr,
      secondarySubtitleEn: item.subtitleEn || item.code,
      secondarySubtitleAr: item.subtitleAr || item.code,
      badgeStatus: item.status || 'ACTIVE',
      badgeColor,
      metadataMap,
      avatarUrl: item.avatarUrl,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Favorites Management
   */
  public static getFavoriteIds(): string[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : ['cust-101', 'port-01', 'wh-01'];
    } catch {
      return ['cust-101', 'port-01', 'wh-01'];
    }
  }

  public static toggleFavorite(itemId: string): string[] {
    const current = this.getFavoriteIds();
    let updated: string[];
    if (current.includes(itemId)) {
      updated = current.filter((id) => id !== itemId);
    } else {
      updated = [...current, itemId];
    }

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage unavailable for lookup favorites', e);
    }
    SEARCH_CACHE.clear(); // Clear cache to refresh favorite badges
    return updated;
  }

  /**
   * Recent Searches Management
   */
  public static getRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public static addRecentSearch(itemIdOrKeyword: string): string[] {
    const current = this.getRecentSearches().filter((x) => x !== itemIdOrKeyword);
    const updated = [itemIdOrKeyword, ...current].slice(0, 10); // Keep top 10
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage unavailable for recent searches', e);
    }
    return updated;
  }
}
