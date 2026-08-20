import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  Lead,
  Opportunity,
  SalesActivity,
  Proposal,
  Competitor,
  WinLossRecord,
  SalesTerritory,
  SalesTarget,
  CommissionRule,
  SalesKpiSummary
} from '../../types/sales';

const LEADS_COLLECTION = 'crm_leads';
const OPPORTUNITIES_COLLECTION = 'crm_opportunities';
const ACTIVITIES_COLLECTION = 'crm_activities';
const PROPOSALS_COLLECTION = 'crm_proposals';
const COMPETITORS_COLLECTION = 'crm_competitors';
const WIN_LOSS_COLLECTION = 'crm_win_loss';
const TERRITORIES_COLLECTION = 'crm_territories';
const TARGETS_COLLECTION = 'crm_targets';
const COMMISSION_RULES_COLLECTION = 'crm_commission_rules';

// Pre-seeded Enterprise Logistics Leads
let MEMORY_LEADS: Lead[] = [
  {
    id: 'LEAD-1001',
    leadNumber: 'LD-2026-0010',
    companyName: 'مجموعة الماركات الخليجية للأغذية والمشروبات',
    contactName: 'م. فهد السليمان',
    jobTitle: 'مدير سلاسل الإمداد والتبريد',
    email: 'f.sulaiman@gulfbrands-food.com',
    phone: '+966 50 123 4567',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    source: 'WEBSITE',
    campaign: 'Q1 Cold Chain Summit Riyadh',
    industry: 'الأغذية والمشروبات والتبريد',
    businessSize: 'ENTERPRISE',
    assignedSalespersonId: 'USR-8801',
    assignedSalespersonName: 'عبدالرحمن العتيبي (مدير مبيعات كبار العملاء)',
    priority: 'HIGH',
    leadScore: 88,
    scoreReasoning: 'شركة كبرى لديها متطلبات شحن وتبريد ضخمة بعقود سنوية مستدامة.',
    qualificationStatus: 'QUALIFIED',
    expectedRevenue: 1250000,
    currency: 'SAR',
    expectedCloseDate: '2026-04-15',
    customerInterest: 'COLD_CHAIN',
    tags: ['سلسلة التبريد', 'عقد سنوي', 'أغذية ومشروبات'],
    notes: 'تم عقد اجتماع تمهيدي لمناقشة تخزين وتوزيع المواد الغذائية المبردة بين الرياض وجدة والدمام.',
    timeline: [
      {
        id: 'EVT-01',
        type: 'CREATED',
        title: 'تسجيل العميل المحتمل',
        description: 'تم تسجيل العميل عبر موقع الشركة بعد استفسار عن خدمات التبريد.',
        timestamp: '2026-02-01T09:00:00Z',
        actorName: 'نظام المبيعات الأوتوماتيكي',
      },
      {
        id: 'EVT-02',
        type: 'AI_SCORED',
        title: 'تقييم الذكاء الاصطناعي',
        description: 'تم منح العميل درجة 88/100 بناءً على حجم الأسطول المطلوب وحاجة التبريد المستمرة.',
        timestamp: '2026-02-01T09:05:00Z',
        actorName: 'مساعد الذكاء الاصطناعي أجا',
      },
    ],
    statusHistory: [
      { status: 'NEW', timestamp: '2026-02-01T09:00:00Z', user: 'System' },
      { status: 'CONTACTED', timestamp: '2026-02-02T10:30:00Z', user: 'عبدالرحمن العتيبي' },
      { status: 'QUALIFIED', timestamp: '2026-02-05T14:15:00Z', user: 'عبدالرحمن العتيبي' },
    ],
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-05T14:15:00Z',
  },
  {
    id: 'LEAD-1002',
    leadNumber: 'LD-2026-0011',
    companyName: 'مصنع التقنية السعودية للإلكترونيات الدقيقة',
    contactName: 'مهندس طارق الشمري',
    jobTitle: 'مدير المشتريات واللوجستيات',
    email: 't.alshammari@saudi-microtech.sa',
    phone: '+966 55 987 6543',
    city: 'الدمام',
    country: 'المملكة العربية السعودية',
    source: 'TRADE_SHOW',
    campaign: 'معرض الصناعة واللوجستيات - جدة',
    industry: 'الإلكترونيات والتصنيع التقني',
    businessSize: 'MID_MARKET',
    assignedSalespersonId: 'USR-8802',
    assignedSalespersonName: 'سارة آل سعود (أخصائي مبيعات الشحن الجوي)',
    priority: 'URGENT',
    leadScore: 92,
    scoreReasoning: 'استيراد جوي سريع أسبوعي من الصين وكوريا الجنوبية مع التخليص الجمركي.',
    qualificationStatus: 'QUALIFIED',
    expectedRevenue: 850000,
    currency: 'SAR',
    expectedCloseDate: '2026-03-30',
    customerInterest: 'AIR_FREIGHT',
    tags: ['شحن جوي سريع', 'تخليص جمركي', 'إلكترونيات'],
    notes: 'يحتاجون لعرض سعر عاجل للشحن الجوي المباشر من شنغهاي إلى مطار الملك فهد بالدمام.',
    timeline: [
      {
        id: 'EVT-03',
        type: 'CREATED',
        title: 'تسجيل في المعرض اللوجستي',
        description: 'التقى العميل بالفريق في جناح الشركة بالمعرض.',
        timestamp: '2026-02-10T11:00:00Z',
        actorName: 'سارة آل سعود',
      },
    ],
    statusHistory: [
      { status: 'NEW', timestamp: '2026-02-10T11:00:00Z', user: 'سارة آل سعود' },
      { status: 'QUALIFIED', timestamp: '2026-02-12T16:00:00Z', user: 'سارة آل سعود' },
    ],
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-12T16:00:00Z',
  },
  {
    id: 'LEAD-1003',
    leadNumber: 'LD-2026-0012',
    companyName: 'شركة النماء للمقاولات والمشاريع الكبرى',
    contactName: 'أ. خالد المطيري',
    jobTitle: 'نائب الرئيس للشؤون اللوجستية',
    email: 'k.almutairi@alnamaa-const.sa',
    phone: '+966 54 321 0987',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    source: 'REFERRAL',
    industry: 'المقاولات والإنشاءات',
    businessSize: 'ENTERPRISE',
    assignedSalespersonId: 'USR-8801',
    assignedSalespersonName: 'عبدالرحمن العتيبي',
    priority: 'MEDIUM',
    leadScore: 74,
    scoreReasoning: 'مشروع بنية تحتية كبير يتطلب شحن بحري للمعدات الثقيلة.',
    qualificationStatus: 'CONTACTED',
    expectedRevenue: 3400000,
    currency: 'SAR',
    expectedCloseDate: '2026-05-20',
    customerInterest: 'SEA_FREIGHT',
    tags: ['شحن بحري', 'معدات ثقيلة', 'نيوم'],
    notes: 'مناقشة نقل 120 حاوية معدات ومواد بناء من ميناء جبل علي إلى ميناء نيوم.',
    timeline: [],
    statusHistory: [
      { status: 'NEW', timestamp: '2026-02-15T08:30:00Z', user: 'System' },
      { status: 'CONTACTED', timestamp: '2026-02-16T12:00:00Z', user: 'عبدالرحمن العتيبي' },
    ],
    createdAt: '2026-02-15T08:30:00Z',
    updatedAt: '2026-02-16T12:00:00Z',
  }
];

// Pre-seeded Opportunities
let MEMORY_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'OPP-2001',
    opportunityNumber: 'OP-2026-0101',
    name: 'عقد توريد وشحن خطوط إنتاج السيارات الكهربائية - نيوم',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    bpId: 'BP-10029',
    expectedRevenue: 4800000,
    probability: 75,
    weightedRevenue: 3600000,
    currency: 'SAR',
    expectedCloseDate: '2026-04-30',
    stage: 'NEGOTIATION',
    ownerId: 'USR-8801',
    ownerName: 'عبدالرحمن العتيبي',
    competitorNames: ['شركة أجيليتي اللوجستية', 'شركة DHL العالمية'],
    productsServices: [
      {
        id: 'PS-01',
        serviceCode: 'SEA-FCL-40',
        serviceName: 'شحن بحري حاويات 40 قدم مرتفعة',
        quantity: 150,
        unitPrice: 18000,
        totalPrice: 2700000,
        marginPct: 22,
      },
      {
        id: 'PS-02',
        serviceCode: 'CUST-CLR-NEOM',
        serviceName: 'التخليص الجمركي والإفساد السريع نيوم',
        quantity: 150,
        unitPrice: 14000,
        totalPrice: 2100000,
        marginPct: 35,
      },
    ],
    pipelineId: 'PIPE-ENTERPRISE-2026',
    riskLevel: 'LOW',
    forecastCategory: 'COMMIT',
    quoteId: 'Q-2026-8891',
    quoteNumber: 'Q-2026-8891',
    proposalId: 'PROP-2026-001',
    proposalNumber: 'PROP-2026-001',
    aiWinProbabilityPct: 82,
    aiNextBestAction: 'تقديم خصم 3% على التخليص الجمركي لإغلاق العقد النهائي هذا الأسبوع.',
    timeline: [
      {
        id: 'OT-01',
        type: 'CREATED',
        title: 'إنشاء الفرصة البيعية',
        description: 'تحويل العميل المحتمل إلى فرصة بيعية بقيمة 4.8 مليون ريال.',
        timestamp: '2026-02-10T10:00:00Z',
        actorName: 'عبدالرحمن العتيبي',
      },
      {
        id: 'OT-02',
        type: 'PROPOSAL_SENT',
        title: 'إرسال العرض الفني والمالي',
        description: 'تم تقديم العرض رقم PROP-2026-001 شاملاً التخليص والتأمين.',
        timestamp: '2026-02-18T14:30:00Z',
        actorName: 'عبدالرحمن العتيبي',
      },
    ],
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-18T14:30:00Z',
  },
  {
    id: 'OPP-2002',
    opportunityNumber: 'OP-2026-0102',
    name: 'شحن جوي سريع لقطع غيار طائرات - الخطوط الوطنية',
    customerId: 'CUST-360-1002',
    customerName: 'مؤسسة الأفق للخدمات الجوية',
    bpId: 'BP-10034',
    expectedRevenue: 1850000,
    probability: 60,
    weightedRevenue: 1110000,
    currency: 'SAR',
    expectedCloseDate: '2026-03-25',
    stage: 'PROPOSAL',
    ownerId: 'USR-8802',
    ownerName: 'سارة آل سعود',
    competitorNames: ['شركة أرامكس البريد السريع'],
    productsServices: [
      {
        id: 'PS-03',
        serviceCode: 'AIR-EXP-CHARTER',
        serviceName: 'شحن جوي سريع مستعجل (AOG)',
        quantity: 10,
        unitPrice: 185000,
        totalPrice: 1850000,
        marginPct: 28,
      },
    ],
    pipelineId: 'PIPE-ENTERPRISE-2026',
    riskLevel: 'MEDIUM',
    forecastCategory: 'BEST_CASE',
    aiWinProbabilityPct: 65,
    aiNextBestAction: 'تحديد موعد مع مدير العمليات لتأكيد جدول الرحلات المباشرة من فرانكفورت.',
    timeline: [],
    createdAt: '2026-02-12T09:00:00Z',
    updatedAt: '2026-02-14T11:20:00Z',
  },
  {
    id: 'OPP-2003',
    opportunityNumber: 'OP-2026-0103',
    name: 'عقد النقل البري وتوزيع المنتجات الطبية والمصلية بالحرارة المحددة',
    customerName: 'شركة فارما ميد للخدمات الطبية',
    expectedRevenue: 2900000,
    probability: 90,
    weightedRevenue: 2610000,
    currency: 'SAR',
    expectedCloseDate: '2026-03-15',
    stage: 'APPROVAL',
    ownerId: 'USR-8801',
    ownerName: 'عبدالرحمن العتيبي',
    competitorNames: ['شركة ناقل السريعة'],
    productsServices: [],
    pipelineId: 'PIPE-ENTERPRISE-2026',
    riskLevel: 'LOW',
    forecastCategory: 'COMMIT',
    aiWinProbabilityPct: 94,
    aiNextBestAction: 'متابعة توقيع الإدارة التنفيذية لاعتماد العقد بشكل رسمي.',
    timeline: [],
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-20T16:00:00Z',
  }
];

// Pre-seeded Activities
let MEMORY_ACTIVITIES: SalesActivity[] = [
  {
    id: 'ACT-3001',
    entityType: 'LEAD',
    entityId: 'LEAD-1001',
    entityName: 'مجموعة الماركات الخليجية للأغذية والمشروبات',
    type: 'MEETING',
    title: 'اجتماع استعراض المتطلبات اللوجستية وتوزيع التبريد',
    description: 'مناقشة خطة التبريد لمستودعات جدة والرياض مع مدير سلاسل الإمداد.',
    dueDate: '2026-03-01T10:00:00Z',
    priority: 'HIGH',
    status: 'OPEN',
    assignedToId: 'USR-8801',
    assignedToName: 'عبدالرحمن العتيبي',
    createdAt: '2026-02-20T08:00:00Z',
    updatedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'ACT-3002',
    entityType: 'OPPORTUNITY',
    entityId: 'OPP-2001',
    entityName: 'عقد توريد وشحن خطوط إنتاج السيارات الكهربائية - نيوم',
    type: 'CALL',
    title: 'مكالمة متابعة المفاوضات النهائية',
    description: 'الاتصال بالعميل لتأكيد نسبة الخصم النهائية وجدول وصول الحاويات.',
    dueDate: '2026-02-28T14:00:00Z',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assignedToId: 'USR-8801',
    assignedToName: 'عبدالرحمن العتيبي',
    createdAt: '2026-02-22T09:00:00Z',
    updatedAt: '2026-02-22T09:00:00Z',
  }
];

// Pre-seeded Proposals
let MEMORY_PROPOSALS: Proposal[] = [
  {
    id: 'PROP-2026-001',
    proposalNumber: 'PROP-2026-001',
    opportunityId: 'OPP-2001',
    opportunityName: 'عقد توريد وشحن خطوط إنتاج السيارات الكهربائية - نيوم',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    title: 'عرض الخدمات اللوجستية المتكاملة والتخليص المينائي لنيوم',
    version: 1.2,
    templateName: 'Enterprise Mega Logistics Proposal Template v4',
    executiveSummary: 'يتضمن هذا العرض حلول الشحن البحري، التخليص الجمركي، والنقل البري الثقيل لمعدات مشروع نيوم مع توفير تتبع لحظي بالذكاء الاصطناعي.',
    scopeOfWork: 'نقل 150 حاوية 40 قدم من ميناء شنغهاي إلى ميناء نيوم، التخليص الجمركي خلال 24 ساعة، النقل للموقع النهائي مع التأمين الشامل.',
    pricingSchedule: [
      { description: 'نقل بحري بحاويات 40 قدم (150 حاوية)', amount: 2700000, isTaxInclusive: false },
      { description: 'خدمات التخليص الجمركي السريع والإفساد', amount: 2100000, isTaxInclusive: false },
    ],
    totalAmount: 4800000,
    currency: 'SAR',
    validUntil: '2026-04-15',
    digitalApprovalStatus: 'PENDING_APPROVAL',
    attachments: [
      { fileName: 'Technical_Specification_Neom_Logistics.pdf', fileUrl: '#', sizeKb: 2450 },
      { fileName: 'Insurance_Coverage_Certificate.pdf', fileUrl: '#', sizeKb: 1200 },
    ],
    revisionHistory: [
      { version: 1.0, changesSummary: 'مسودة اولية للمراجعة', updatedBy: 'عبدالرحمن العتيبي', timestamp: '2026-02-12T10:00:00Z' },
      { version: 1.2, changesSummary: 'إضافة جدول أسعار التخليص الجمركي لميناء نيوم', updatedBy: 'عبدالرحمن العتيبي', timestamp: '2026-02-18T14:30:00Z' },
    ],
    createdAt: '2026-02-12T10:00:00Z',
    updatedAt: '2026-02-18T14:30:00Z',
  }
];

// Pre-seeded Competitors
let MEMORY_COMPETITORS: Competitor[] = [
  {
    id: 'COMP-01',
    name: 'شركة أجيليتي اللوجستية العالمية',
    country: 'الكويت / الإمارات',
    marketSegment: 'الشحن البحري والخدمات اللوجستية الضخمة',
    strengths: ['شبكة مستودعات واسعة بالخليج', 'خبرة طويلة في عقود النفط والغاز'],
    weaknesses: ['أسعار مرتفعة مقارنة بالمنافسين', 'بطء التحديثات اللحظية عبر البوابة'],
    estimatedMarketSharePct: 28,
    winRateAgainstUsPct: 42,
    pricingNotes: 'تعتمد جدول أسعار مرتفع بنسبة 10-15% مقارنة بسعر السوق مع مرونة في الائتمان.',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'COMP-02',
    name: 'شركة DHL العالمية السعودية',
    country: 'ألمانيا / السعودية',
    marketSegment: 'الشحن الجوي السريع والبريد الدولي',
    strengths: ['أسطول جوي عالمي موثوق', 'تتبع دقيق جداً للشحنات'],
    weaknesses: ['رسوم جمركية وإدارية إضافية مرتفعة', 'حدود أوزان الشحنات الكبيرة'],
    estimatedMarketSharePct: 35,
    winRateAgainstUsPct: 38,
    pricingNotes: 'أسعارها ممتازة للقطع الصغيرة ولكن غالية جداً للشحن الجوي الثقيل فوق 5 طن.',
    createdAt: '2026-01-01T00:00:00Z',
  }
];

// Pre-seeded Win/Loss Records
let MEMORY_WIN_LOSS: WinLossRecord[] = [
  {
    id: 'WL-01',
    opportunityId: 'OPP-1099',
    opportunityName: 'عقد الشحن الجوي السريع للأدوية واللقاحات',
    customerName: 'شركة الحياة للأدوية',
    dealValue: 1400000,
    status: 'WON',
    primaryCompetitorId: 'COMP-02',
    primaryCompetitorName: 'DHL Global',
    reasonCategory: 'SERVICE_SCOPE',
    detailedReason: 'تم الفوز بسبب توفير أجهزة تتبع درجة حرارة بالإنترنت عبر الأقمار الصناعية وحل الشحن الجوي المباشر.',
    customerFeedback: 'مستوى الشفافية والدعم الفني اللحظي كان الفارق الرئيسي.',
    salesOwnerName: 'سارة آل سعود',
    closedAt: '2026-01-25T15:00:00Z',
  },
  {
    id: 'WL-02',
    opportunityId: 'OPP-1088',
    opportunityName: 'مناقصة نقل الحاويات الجافة من ميناء الملك عبد الله',
    customerName: 'شركة الخزف السعودية',
    dealValue: 950000,
    status: 'LOST',
    primaryCompetitorId: 'COMP-01',
    primaryCompetitorName: 'أجيليتي',
    reasonCategory: 'PRICING',
    detailedReason: 'قدم المنافس خصماً بنسبة 12% على أجور الشاحنات وتأجيل سداد لمدة 90 يوماً.',
    customerFeedback: 'العرض الفني كان متكافئاً ولكن شروط الدفع رجحت كفة المنافس.',
    salesOwnerName: 'عبدالرحمن العتيبي',
    closedAt: '2026-02-02T11:00:00Z',
  }
];

// Pre-seeded Territories
let MEMORY_TERRITORIES: SalesTerritory[] = [
  {
    id: 'TERR-01',
    territoryName: 'قطاع الرياض والمنطقة الوسطى',
    code: 'RUH-CENTRAL',
    countries: ['المملكة العربية السعودية'],
    regions: ['منطقة الرياض', 'منطقة القصيم'],
    cities: ['الرياض', 'الخرج', 'بريدة', 'عنيزة'],
    industries: ['المقاولات', 'التجزئة والسلع الاستهلاكية', 'التصنيع الغذائي'],
    businessSegments: ['ENTERPRISE', 'SME'],
    teamLeadId: 'USR-8801',
    teamLeadName: 'عبدالرحمن العتيبي',
    accountManagerIds: ['USR-8801', 'USR-8803'],
    activeLeadsCount: 18,
    activeOpportunitiesCount: 12,
    totalPipelineValue: 14500000,
  },
  {
    id: 'TERR-02',
    territoryName: 'قطاع الشحن الجوي والدولي - جدة والمنطقة الغربية',
    code: 'JED-WESTERN',
    countries: ['المملكة العربية السعودية', 'دول مجلس التعاون'],
    regions: ['منطقة مكة المكرمة', 'منطقة المدينة المنورة'],
    cities: ['جدة', 'مكة المكرمة', 'المدينة المنورة', 'ينبع'],
    industries: ['الطيران', 'الصيدلة والأدوية', 'المشروبات والأغذية'],
    businessSegments: ['ENTERPRISE', 'GOVERNMENT'],
    teamLeadId: 'USR-8802',
    teamLeadName: 'سارة آل سعود',
    accountManagerIds: ['USR-8802'],
    activeLeadsCount: 14,
    activeOpportunitiesCount: 9,
    totalPipelineValue: 9800000,
  }
];

// Pre-seeded Targets
let MEMORY_TARGETS: SalesTarget[] = [
  {
    id: 'TGT-01',
    salespersonId: 'USR-8801',
    salespersonName: 'عبدالرحمن العتيبي',
    territoryName: 'قطاع الرياض والمنطقة الوسطى',
    period: 'QUARTERLY',
    periodLabel: 'Q1 2026',
    revenueTarget: 10000000,
    shipmentTarget: 450,
    quoteTarget: 120,
    newCustomerTarget: 8,
    achievedRevenue: 7400000,
    achievedShipments: 320,
    achievedQuotes: 98,
    achievedNewCustomers: 6,
    achievementPct: 74,
  },
  {
    id: 'TGT-02',
    salespersonId: 'USR-8802',
    salespersonName: 'سارة آل سعود',
    territoryName: 'قطاع الشحن الجوي والدولي - جدة',
    period: 'QUARTERLY',
    periodLabel: 'Q1 2026',
    revenueTarget: 6000000,
    shipmentTarget: 250,
    quoteTarget: 80,
    newCustomerTarget: 5,
    achievedRevenue: 4900000,
    achievedShipments: 210,
    achievedQuotes: 72,
    achievedNewCustomers: 5,
    achievementPct: 81.6,
  }
];

// Pre-seeded Commission Rules
let MEMORY_COMMISSION_RULES: CommissionRule[] = [
  {
    id: 'COMM-01',
    ruleName: 'قاعدة عمولات كبار العملاء والعقود الاستراتيجية',
    description: 'عمولة 1.5% على إجمالي قيمة الإيرادات المحققة مع مكافأة 0.5% إضافية عند تجاوز الهدف بنسبة 100%.',
    baseRatePct: 1.5,
    bonusTierThresholdPct: 100,
    bonusTierRatePct: 0.5,
    minMarginPct: 15,
    isActive: true,
  },
  {
    id: 'COMM-02',
    ruleName: 'قاعدة عمولات الشحن الجوي السريع والخدمات المستعجلة',
    description: 'عمولة 2.5% لصفقات الشحن الجوي عالي الهامش الربحي.',
    baseRatePct: 2.5,
    bonusTierThresholdPct: 110,
    bonusTierRatePct: 1.0,
    minMarginPct: 20,
    isActive: true,
  }
];

export class SalesRepository {
  // LEADS
  static async listLeads(): Promise<Lead[]> {
    try {
      const snap = await getAdminFirestore().collection(LEADS_COLLECTION).get();
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as Lead);
      }
    } catch (e) {
      console.warn('[SalesRepository] Firestore read failed, using memory store:', e);
    }
    return MEMORY_LEADS;
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    const list = await this.listLeads();
    return list.find(l => l.id === id || l.leadNumber === id) || null;
  }

  static async saveLead(lead: Lead): Promise<Lead> {
    const now = new Date().toISOString();
    const updated = { ...lead, updatedAt: now };
    const idx = MEMORY_LEADS.findIndex(l => l.id === lead.id);
    if (idx >= 0) {
      MEMORY_LEADS[idx] = updated;
    } else {
      MEMORY_LEADS.unshift(updated);
    }

    try {
      await getAdminFirestore().collection(LEADS_COLLECTION).doc(updated.id).set(updated, { merge: true });
    } catch (e) {
      console.warn('[SalesRepository] Firestore write lead failed:', e);
    }
    return updated;
  }

  // OPPORTUNITIES
  static async listOpportunities(): Promise<Opportunity[]> {
    try {
      const snap = await getAdminFirestore().collection(OPPORTUNITIES_COLLECTION).get();
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as Opportunity);
      }
    } catch (e) {
      console.warn('[SalesRepository] Firestore read opportunities failed, using memory store:', e);
    }
    return MEMORY_OPPORTUNITIES;
  }

  static async getOpportunityById(id: string): Promise<Opportunity | null> {
    const list = await this.listOpportunities();
    return list.find(o => o.id === id || o.opportunityNumber === id) || null;
  }

  static async saveOpportunity(opportunity: Opportunity): Promise<Opportunity> {
    const now = new Date().toISOString();
    const updated = { ...opportunity, updatedAt: now };
    const idx = MEMORY_OPPORTUNITIES.findIndex(o => o.id === opportunity.id);
    if (idx >= 0) {
      MEMORY_OPPORTUNITIES[idx] = updated;
    } else {
      MEMORY_OPPORTUNITIES.unshift(updated);
    }

    try {
      await getAdminFirestore().collection(OPPORTUNITIES_COLLECTION).doc(updated.id).set(updated, { merge: true });
    } catch (e) {
      console.warn('[SalesRepository] Firestore write opportunity failed:', e);
    }
    return updated;
  }

  // ACTIVITIES
  static async listActivities(): Promise<SalesActivity[]> {
    try {
      const snap = await getAdminFirestore().collection(ACTIVITIES_COLLECTION).get();
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as SalesActivity);
      }
    } catch (e) {
      console.warn('[SalesRepository] Firestore read activities failed:', e);
    }
    return MEMORY_ACTIVITIES;
  }

  static async saveActivity(activity: SalesActivity): Promise<SalesActivity> {
    const now = new Date().toISOString();
    const updated = { ...activity, updatedAt: now };
    const idx = MEMORY_ACTIVITIES.findIndex(a => a.id === activity.id);
    if (idx >= 0) {
      MEMORY_ACTIVITIES[idx] = updated;
    } else {
      MEMORY_ACTIVITIES.unshift(updated);
    }

    try {
      await getAdminFirestore().collection(ACTIVITIES_COLLECTION).doc(updated.id).set(updated, { merge: true });
    } catch (e) {
      console.warn('[SalesRepository] Firestore write activity failed:', e);
    }
    return updated;
  }

  // PROPOSALS
  static async listProposals(): Promise<Proposal[]> {
    try {
      const snap = await getAdminFirestore().collection(PROPOSALS_COLLECTION).get();
      if (!snap.empty) {
        return snap.docs.map(d => d.data() as Proposal);
      }
    } catch (e) {
      console.warn('[SalesRepository] Firestore read proposals failed:', e);
    }
    return MEMORY_PROPOSALS;
  }

  static async saveProposal(proposal: Proposal): Promise<Proposal> {
    const now = new Date().toISOString();
    const updated = { ...proposal, updatedAt: now };
    const idx = MEMORY_PROPOSALS.findIndex(p => p.id === proposal.id);
    if (idx >= 0) {
      MEMORY_PROPOSALS[idx] = updated;
    } else {
      MEMORY_PROPOSALS.unshift(updated);
    }

    try {
      await getAdminFirestore().collection(PROPOSALS_COLLECTION).doc(updated.id).set(updated, { merge: true });
    } catch (e) {
      console.warn('[SalesRepository] Firestore write proposal failed:', e);
    }
    return updated;
  }

  // COMPETITORS
  static async listCompetitors(): Promise<Competitor[]> {
    return MEMORY_COMPETITORS;
  }

  static async saveCompetitor(competitor: Competitor): Promise<Competitor> {
    const idx = MEMORY_COMPETITORS.findIndex(c => c.id === competitor.id);
    if (idx >= 0) {
      MEMORY_COMPETITORS[idx] = competitor;
    } else {
      MEMORY_COMPETITORS.push(competitor);
    }
    return competitor;
  }

  // WIN / LOSS
  static async listWinLoss(): Promise<WinLossRecord[]> {
    return MEMORY_WIN_LOSS;
  }

  static async addWinLossRecord(record: WinLossRecord): Promise<WinLossRecord> {
    MEMORY_WIN_LOSS.unshift(record);
    return record;
  }

  // TERRITORIES
  static async listTerritories(): Promise<SalesTerritory[]> {
    return MEMORY_TERRITORIES;
  }

  // TARGETS
  static async listTargets(): Promise<SalesTarget[]> {
    return MEMORY_TARGETS;
  }

  // COMMISSION RULES
  static async listCommissionRules(): Promise<CommissionRule[]> {
    return MEMORY_COMMISSION_RULES;
  }

  // KPI SUMMARY
  static async getKpiSummary(): Promise<SalesKpiSummary> {
    const leads = await this.listLeads();
    const opps = await this.listOpportunities();
    const winLoss = await this.listWinLoss();

    const totalActiveLeads = leads.filter(l => l.qualificationStatus !== 'UNQUALIFIED' && l.qualificationStatus !== 'CONVERTED').length;
    const qualifiedLeads = leads.filter(l => l.qualificationStatus === 'QUALIFIED').length;
    const qualifiedLeadsPct = leads.length > 0 ? Math.round((qualifiedLeads / leads.length) * 100) : 0;

    const activeOpps = opps.filter(o => o.stage !== 'WON' && o.stage !== 'LOST' && o.stage !== 'CANCELLED');
    const totalPipelineValue = activeOpps.reduce((acc, o) => acc + o.expectedRevenue, 0);
    const weightedPipelineValue = activeOpps.reduce((acc, o) => acc + (o.expectedRevenue * (o.probability / 100)), 0);

    const wonOpps = opps.filter(o => o.stage === 'WON');
    const totalWonThisQuarter = wonOpps.reduce((acc, o) => acc + o.expectedRevenue, 0);

    const quarterlyTarget = 16000000; // 16 Million SAR combined team target
    const targetAchievementPct = Math.round((totalWonThisQuarter / quarterlyTarget) * 100);

    const wonCount = winLoss.filter(w => w.status === 'WON').length;
    const totalClosed = winLoss.length;
    const overallWinRatePct = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 65;

    return {
      totalActiveLeads,
      qualifiedLeadsPct,
      totalPipelineValue,
      weightedPipelineValue: Math.round(weightedPipelineValue),
      totalWonThisQuarter,
      quarterlyTarget,
      targetAchievementPct,
      avgDealCycleDays: 34,
      overallWinRatePct,
    };
  }
}
