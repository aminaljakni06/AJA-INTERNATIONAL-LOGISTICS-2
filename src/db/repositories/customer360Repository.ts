import { getAdminFirestore } from '../../server/firebaseAdmin';
import { db as localDb } from '../database';
import {
  Customer360Profile,
  CustomerTimelineEntry,
  CustomerCommunicationEntry,
  CustomerActivityTask,
  CustomerDocument360,
  CustomerAIInsights,
  Customer360KpiSummary
} from '../../types/customer360';

const CUSTOMER_360_COLLECTION = 'customers_360';
const CUSTOMER_TIMELINE_COLLECTION = 'customer_timelines';
const CUSTOMER_COMMUNICATIONS_COLLECTION = 'customer_communications';
const CUSTOMER_ACTIVITIES_COLLECTION = 'customer_activities';
const CUSTOMER_DOCUMENTS_COLLECTION = 'customer_documents_360';

function useLocalCustomer360Store(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DISABLE_LOCAL_DATA_FALLBACK !== 'true';
}

// Default seed data for immediate demonstration and offline resilience
const SEED_CUSTOMERS_360: Customer360Profile[] = [
  {
    id: 'CUST-360-1001',
    bpId: 'BP-10029',
    organizationId: 'ORG-SA-001',
    companyName: 'شركة السيف اللوجستية للصناعة والتجارة',
    arabicName: 'شركة السيف اللوجستية للصناعة والتجارة',
    englishName: 'Al-Seef Logistics Industry & Trade Co.',
    branches: ['فرع الرياض الرئيسي', 'فرع جدة ميناء الإسلامي', 'فرع الدمام الميناء الجاف'],
    legalInformation: {
      commercialRegistration: '1010489201',
      crExpiryDate: '2028-11-15',
      taxNumber: '300192849100003',
      vatNumber: '300192849100003',
      legalEntity: 'شركة ذات مسؤولية محدودة (LLC)',
    },
    industry: 'التصنيع والتوزيع اللوجستي',
    customerType: 'ENTERPRISE',
    customerStatus: 'ACTIVE',
    segment: 'ENTERPRISE',
    language: 'ar',
    currency: 'SAR',
    timeZone: 'Asia/Riyadh',
    addresses: [
      {
        id: 'ADDR-01',
        type: 'HEAD_OFFICE',
        addressName: 'المقر الرئيسي - الرياض',
        street: 'طريق الملك فهد، حي الصحافة',
        district: 'الصحافة',
        city: 'الرياض',
        stateRegion: 'منطقة الرياض',
        postalCode: '13315',
        country: 'المملكة العربية السعودية',
        isPrimary: true,
      },
      {
        id: 'ADDR-02',
        type: 'WAREHOUSE',
        addressName: 'مستودعات السيف المركزية',
        street: 'المنطقة الصناعية الثانية',
        city: 'الرياض',
        country: 'المملكة العربية السعودية',
        isPrimary: false,
      },
    ],
    contacts: [
      {
        id: 'CONT-01',
        name: 'م. خالد السيف',
        jobTitle: 'مدير سلاسل الإمداد والتوريد',
        department: 'العمليات والتوريد',
        email: 'k.alseef@alseef-logistics.sa',
        phone: '+966114920192',
        mobile: '+966501234567',
        whatsapp: '+966501234567',
        preferredLanguage: 'ar',
        role: 'Primary Customer Manager',
        permissions: ['CREATE_QUOTES', 'APPROVE_SHIPMENTS', 'VIEW_FINANCE'],
        isPrimary: true,
        isEmergency: false,
        status: 'ACTIVE',
      },
      {
        id: 'CONT-02',
        name: 'أستاذة سارة الغامدي',
        jobTitle: 'مدير الحسابات والمالية',
        department: 'الإدارة المالية',
        email: 's.ghamdi@alseef-logistics.sa',
        phone: '+966114920193',
        mobile: '+966559876543',
        preferredLanguage: 'ar',
        role: 'Billing Lead',
        permissions: ['VIEW_INVOICES', 'MAKE_PAYMENTS'],
        isPrimary: false,
        isEmergency: true,
        status: 'ACTIVE',
      },
    ],
    accountStructure: {
      parentAccountId: 'PAR-AL-SEEF-GROUP',
      parentAccountName: 'مجموعة السيف القابضة',
      childAccountIds: ['CUST-360-1002', 'CUST-360-1005'],
      branchesCount: 3,
      businessUnits: ['قطاع النقل البحري', 'قطاع التخليص الجمركي', 'التخزين المبرد'],
      assignedAccountManager: 'م. عمر الفارسي',
      salesTerritory: 'المنطقة الوسطى والغربية',
      ownership: 'حساب استراتيجي خاص',
    },
    billingDetails: {
      paymentTerms: 'NET_60',
      incoterms: 'DDP',
      creditLimit: 1500000,
      creditExposure: 420000,
      isOnCreditHold: false,
      taxNumber: '300192849100003',
      vatNumber: '300192849100003',
      iban: 'SA4480000101048920100003',
      bankName: 'مصرف الراجحي',
    },
    shippingPreferences: {
      preferredMode: 'MULTIMODAL',
      defaultOrigin: 'ميناء شنغهاي، الصين',
      defaultDestination: 'ميناء جدة الإسلامي / مستودع الرياض',
      specialHandling: ['تخليص سريع', 'تأمين شامل', 'تتبع حي بمستشعرات الحرارة'],
      requiresTemperatureControl: true,
      requiresDangerousGoods: false,
    },
    complianceStatus: {
      kycStatus: 'VERIFIED',
      kycVerificationDate: '2026-01-10',
      amlCheckStatus: 'CLEAR',
      sanctionsStatus: 'CLEAR',
      commercialRegistration: '1010489201',
      crExpiryDate: '2028-11-15',
      vatCertificateNumber: 'VAT-9201-SA',
    },
    healthScore: {
      overallScore: 94,
      status: 'EXCELLENT',
      breakdown: {
        revenueContribution: 96,
        paymentPunctuality: 92,
        shipmentVolumeTrend: 95,
        supportTicketFrequency: 88,
        complaintRate: 98,
        contractValidity: 90,
        engagementScore: 94,
        npsSatisfaction: 95,
      },
      manualAdjustment: 0,
      aiRecommendation: 'عميل ممتاز ذو نمو مستمر. ينصح بتقديم خدمات التخزين المبرد الذكي لزيادة حصة المحفظة بنسبة 18%.',
      lastCalculatedAt: new Date().toISOString(),
    },
    riskScore: {
      overallRisk: 'LOW',
      riskScore: 12,
      financialRisk: 'LOW',
      operationalRisk: 'LOW',
      complianceRisk: 'LOW',
      creditRisk: 'LOW',
      fraudRisk: 'LOW',
      historicalTrend: 'IMPROVING',
      notes: 'التزامات مالية منتظمة وسجل ائتماني ممتاز.',
      lastEvaluatedAt: new Date().toISOString(),
    },
    clv: {
      totalRevenue: 3840000,
      grossProfit: 845000,
      profitMarginPct: 22.0,
      totalOrders: 142,
      totalShipments: 128,
      retentionMonths: 36,
      yearOverYearGrowthPct: 24.5,
      forecastedLtv1Yr: 1650000,
      forecastedLtv3Yr: 5200000,
    },
    tags: ['VIP', 'ENTERPRISE', 'MULTIMODAL', 'TEMPERATURE_CONTROLLED', 'STRATEGIC_PARTNER'],
    metadata: {
      crmOwner: 'م. عمر الفارسي',
      tierLevel: 'PLATINUM',
      lastInteractionDate: '2026-08-01',
    },
    createdAt: '2023-05-12T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CUST-360-1002',
    bpId: 'BP-10034',
    organizationId: 'ORG-SA-002',
    companyName: 'مؤسسة الأفق للتجارة والاستيراد',
    arabicName: 'مؤسسة الأفق للتجارة والاستيراد',
    englishName: 'Al-Ofoq Trading & Import Est.',
    branches: ['فرع جدة الرئيسي'],
    legalInformation: {
      commercialRegistration: '4030192841',
      crExpiryDate: '2027-06-20',
      taxNumber: '310294810200003',
      vatNumber: '310294810200003',
      legalEntity: 'مؤسسة فردية',
    },
    industry: 'التجارة والتجزئة',
    customerType: 'SME',
    customerStatus: 'ACTIVE',
    segment: 'SME',
    language: 'ar',
    currency: 'SAR',
    timeZone: 'Asia/Riyadh',
    addresses: [
      {
        id: 'ADDR-OFOQ-1',
        type: 'HEAD_OFFICE',
        addressName: 'مكتب جدة',
        street: 'شارع حراء، حي الزهراء',
        city: 'جدة',
        country: 'المملكة العربية السعودية',
        isPrimary: true,
      },
    ],
    contacts: [
      {
        id: 'CONT-OFOQ-1',
        name: 'أحمد التميمي',
        jobTitle: 'المدير العام',
        department: 'الإدارة العليا',
        email: 'ahmed@alofoq-trade.sa',
        phone: '+966126543210',
        mobile: '+966541122334',
        preferredLanguage: 'ar',
        role: 'Owner',
        permissions: ['ALL'],
        isPrimary: true,
        isEmergency: true,
        status: 'ACTIVE',
      },
    ],
    accountStructure: {
      assignedAccountManager: 'فهد العتيبي',
      salesTerritory: 'المنطقة الغربية',
      ownership: 'حساب تجاري',
    },
    billingDetails: {
      paymentTerms: 'NET_30',
      incoterms: 'FOB',
      creditLimit: 300000,
      creditExposure: 180000,
      isOnCreditHold: false,
      taxNumber: '310294810200003',
      vatNumber: '310294810200003',
    },
    shippingPreferences: {
      preferredMode: 'SEA',
      defaultOrigin: 'ميناء نينغبو، الصين',
      defaultDestination: 'ميناء جدة الإسلامي',
      specialHandling: ['تخليص جمركي عادي'],
      requiresTemperatureControl: false,
      requiresDangerousGoods: false,
    },
    complianceStatus: {
      kycStatus: 'VERIFIED',
      kycVerificationDate: '2026-02-14',
      amlCheckStatus: 'CLEAR',
      sanctionsStatus: 'CLEAR',
      commercialRegistration: '4030192841',
    },
    healthScore: {
      overallScore: 78,
      status: 'GOOD',
      breakdown: {
        revenueContribution: 75,
        paymentPunctuality: 80,
        shipmentVolumeTrend: 82,
        supportTicketFrequency: 70,
        complaintRate: 85,
        contractValidity: 75,
        engagementScore: 76,
        npsSatisfaction: 80,
      },
      manualAdjustment: 0,
      aiRecommendation: 'عميل مستقر مع إمكانية تحويل عقوده للنقل المتعدد الوسائط.',
      lastCalculatedAt: new Date().toISOString(),
    },
    riskScore: {
      overallRisk: 'MEDIUM',
      riskScore: 35,
      financialRisk: 'MEDIUM',
      operationalRisk: 'LOW',
      complianceRisk: 'LOW',
      creditRisk: 'MEDIUM',
      fraudRisk: 'LOW',
      historicalTrend: 'STABLE',
      lastEvaluatedAt: new Date().toISOString(),
    },
    clv: {
      totalRevenue: 920000,
      grossProfit: 198000,
      profitMarginPct: 21.5,
      totalOrders: 38,
      totalShipments: 35,
      retentionMonths: 18,
      yearOverYearGrowthPct: 12.0,
      forecastedLtv1Yr: 450000,
      forecastedLtv3Yr: 1400000,
    },
    tags: ['SME', 'SEA_FREIGHT', 'REGULAR'],
    metadata: {
      crmOwner: 'فهد العتيبي',
      tierLevel: 'GOLD',
    },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const SEED_TIMELINE_ENTRIES: CustomerTimelineEntry[] = [
  {
    id: 'TL-001',
    customerId: 'CUST-360-1001',
    type: 'SHIPMENT_UPDATE',
    title: 'تحديث حالة الشحنة AJA-2026-8812',
    description: 'تمت مغادرة السفينة لميناء الشحن ووصول البيان الجمركي إلى هيئة الزكاة والضريبة والجمارك.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actorId: 'system',
    actorName: 'نظام أجا اللوجستي الذكي',
    actorRole: 'SYSTEM',
    category: 'OPERATIONS',
    metadata: { trackingNumber: 'AJA-2026-8812', origin: 'شنغهاي', destination: 'جدة' },
    status: 'IN_TRANSIT',
  },
  {
    id: 'TL-002',
    customerId: 'CUST-360-1001',
    type: 'INVOICE_ISSUED',
    title: 'إصدار فاتورة خدمات النقل #INV-2026-4402',
    description: 'تم إصدار الفاتورة بقيمة 125,000 ر.س بتسهيلات سداد NET_60.',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    actorId: 'staff_finance_01',
    actorName: 'نوف الشهري',
    actorRole: 'STAFF',
    category: 'FINANCE',
    metadata: { invoiceNumber: 'INV-2026-4402', amount: 125000, currency: 'SAR' },
    status: 'ISSUED',
  },
  {
    id: 'TL-003',
    customerId: 'CUST-360-1001',
    type: 'QUOTE_REQUEST',
    title: 'طلب عرض سعر شحن جوي سريع',
    description: 'تم تقديم طلب عرض سعر لنقل شحنة قطع غيار بدقة تبريد عالية من ألمانيا إلى الرياض.',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    actorId: 'CONT-01',
    actorName: 'م. خالد السيف',
    actorRole: 'CUSTOMER',
    category: 'SALES',
    metadata: { quoteId: 'REQ-2026-9011', mode: 'AIR' },
    status: 'UNDER_REVIEW',
  },
  {
    id: 'TL-004',
    customerId: 'CUST-360-1001',
    type: 'CONTRACT_SIGN',
    title: 'تجديد الاتفاقية السنوية للخدمات اللوجستية',
    description: 'تم توقيع وتوثيق عقد الخدمات الشامل لسنة 2026 مع رفع حد الائتمان إلى 1.5 مليون ر.س.',
    timestamp: '2026-01-10T11:00:00Z',
    actorId: 'admin_1',
    actorName: 'م. عمر الفارسي',
    actorRole: 'ADMIN',
    category: 'COMPLIANCE',
    metadata: { contractRef: 'CTR-SA-2026-009' },
    status: 'ACTIVE',
  },
];

const SEED_COMMUNICATIONS: CustomerCommunicationEntry[] = [
  {
    id: 'COMM-01',
    customerId: 'CUST-360-1001',
    type: 'MEETING',
    subject: 'اجتماع مراجعة الأداء الأرباعي وزيادة سعة المستودعات',
    content: 'تمت مناقشة توسعة خطوط التوزيع الجوي واشتراطات مستشعرات الحرارة الحية للشحنات الدوائية.',
    agentName: 'م. عمر الفارسي',
    agentId: 'staff_agent_omar',
    channel: 'IN_PERSON',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    direction: 'OUTBOUND',
  },
  {
    id: 'COMM-02',
    customerId: 'CUST-360-1001',
    type: 'SUPPORT_TICKET',
    subject: 'استفسار عن التخليص الجمركي في ميناء الملك عبد الله',
    content: 'تم إفادة العميل بصدور إذن التسليم وتسهيل إجراءات الفسح السريع.',
    agentName: 'أحمد القحطاني',
    agentId: 'staff_agent_ahmed',
    channel: 'CUSTOMER_PORTAL',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    direction: 'INBOUND',
  },
];

const SEED_ACTIVITIES: CustomerActivityTask[] = [
  {
    id: 'ACT-01',
    customerId: 'CUST-360-1001',
    type: 'CALL',
    title: 'متابعة سداد فاتورة مارس وتأكيد تمديد NET_60',
    description: 'الاتصال بالأستاذة سارة الغامدي لتأكيد الحوالة البنكية وتصفية المستحقات القديمة.',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    priority: 'HIGH',
    status: 'OPEN',
    assignedTo: 'نوف الشهري',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ACT-02',
    customerId: 'CUST-360-1001',
    type: 'MEETING',
    title: 'عرض خدمة التخزين المبرد الذكي',
    description: 'تقديم عرض توضيحي لحلول IoT المبردة في مستودعات أجا اللوجستية.',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedTo: 'م. عمر الفارسي',
    createdAt: new Date().toISOString(),
  },
];

const SEED_DOCUMENTS: CustomerDocument360[] = [
  {
    id: 'DOC-360-01',
    customerId: 'CUST-360-1001',
    documentType: 'TRADE_LICENSE',
    title: 'السجل التجاري المعتمد - شركة السيف',
    fileName: 'CR_1010489201_2026.pdf',
    fileUrl: '#',
    version: 2,
    expiryDate: '2028-11-15',
    uploadedAt: '2026-01-10T00:00:00Z',
    uploadedBy: 'م. خالد السيف',
  },
  {
    id: 'DOC-360-02',
    customerId: 'CUST-360-1001',
    documentType: 'CONTRACT',
    title: 'عقد الخدمات اللوجستية الموحد 2026',
    fileName: 'AJA_Contract_AlSeef_2026.pdf',
    fileUrl: '#',
    version: 1,
    uploadedAt: '2026-01-10T00:00:00Z',
    uploadedBy: 'م. عمر الفارسي',
  },
];

function ensureLocalCustomer360Store() {
  const data = localDb.getRaw();
  data.customer_360 ||= {};
  const store = data.customer_360;
  store.profiles ||= SEED_CUSTOMERS_360;
  store.timelines ||= SEED_TIMELINE_ENTRIES;
  store.communications ||= SEED_COMMUNICATIONS;
  store.activities ||= SEED_ACTIVITIES;
  store.documents ||= SEED_DOCUMENTS;
  return store;
}

export class Customer360Repository {
  // Get all Customer 360 profiles
  static async listProfiles(): Promise<Customer360Profile[]> {
    if (useLocalCustomer360Store()) {
      return ensureLocalCustomer360Store().profiles || [];
    }

    try {
      const snap = await getAdminFirestore().collection(CUSTOMER_360_COLLECTION).get();
      if (!snap.empty) {
        return snap.docs.map((docSnap) => docSnap.data() as Customer360Profile);
      }
    } catch (err) {
      console.warn('[Customer360Repository] Firestore list fallback to seed:', err);
    }
    return SEED_CUSTOMERS_360;
  }

  // Get single Customer 360 Profile by ID or BP ID
  static async getProfileById(id: string): Promise<Customer360Profile | null> {
    if (useLocalCustomer360Store()) {
      const profiles = ensureLocalCustomer360Store().profiles || [];
      return profiles.find((c) => c.id === id || c.bpId === id) || profiles[0] || null;
    }

    try {
      const snap = await getAdminFirestore().collection(CUSTOMER_360_COLLECTION).doc(id).get();
      if (snap.exists) {
        return snap.data() as Customer360Profile;
      }

      // Check query by bpId or customerId
      const qSnap = await getAdminFirestore()
        .collection(CUSTOMER_360_COLLECTION)
        .where('bpId', '==', id)
        .get();
      if (!qSnap.empty) {
        return qSnap.docs[0].data() as Customer360Profile;
      }
    } catch (err) {
      console.warn('[Customer360Repository] Firestore getProfileById fallback:', err);
    }

    const foundSeed = SEED_CUSTOMERS_360.find((c) => c.id === id || c.bpId === id);
    return foundSeed || SEED_CUSTOMERS_360[0];
  }

  // Upsert Profile
  static async saveProfile(profile: Customer360Profile): Promise<Customer360Profile> {
    const now = new Date().toISOString();
    const updated: Customer360Profile = {
      ...profile,
      updatedAt: now,
    };

    if (useLocalCustomer360Store()) {
      const store = ensureLocalCustomer360Store();
      const profiles = store.profiles || [];
      const idx = profiles.findIndex((c) => c.id === updated.id);
      if (idx >= 0) profiles[idx] = updated;
      else profiles.push(updated);
      store.profiles = profiles;
      localDb.save();
      return updated;
    }

    try {
      await getAdminFirestore().collection(CUSTOMER_360_COLLECTION).doc(updated.id).set(updated);
    } catch (err) {
      console.warn('[Customer360Repository] Firestore save error (offline mode):', err);
    }

    // Update in seed cache as fallback
    const idx = SEED_CUSTOMERS_360.findIndex((c) => c.id === updated.id);
    if (idx >= 0) {
      SEED_CUSTOMERS_360[idx] = updated;
    } else {
      SEED_CUSTOMERS_360.push(updated);
    }

    return updated;
  }

  // Fetch Timeline Entries
  static async getTimeline(customerId: string): Promise<CustomerTimelineEntry[]> {
    if (useLocalCustomer360Store()) {
      const timelines = ensureLocalCustomer360Store().timelines || [];
      return timelines
        .filter((t) => t.customerId === customerId || customerId === 'CUST-360-1001')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    try {
      const snap = await getAdminFirestore()
        .collection(CUSTOMER_TIMELINE_COLLECTION)
        .where('customerId', '==', customerId)
        .get();
      if (!snap.empty) {
        return snap.docs
          .map((d) => d.data() as CustomerTimelineEntry)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    } catch (err) {
      console.warn('[Customer360Repository] Firestore timeline fallback:', err);
    }

    return SEED_TIMELINE_ENTRIES.filter((t) => t.customerId === customerId || customerId === 'CUST-360-1001');
  }

  // Add Timeline Entry
  static async addTimelineEntry(entry: Omit<CustomerTimelineEntry, 'id'>): Promise<CustomerTimelineEntry> {
    const newEntry: CustomerTimelineEntry = {
      ...entry,
      id: `TL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    if (useLocalCustomer360Store()) {
      const store = ensureLocalCustomer360Store();
      store.timelines = [newEntry, ...(store.timelines || [])];
      localDb.save();
      return newEntry;
    }

    try {
      await getAdminFirestore().collection(CUSTOMER_TIMELINE_COLLECTION).doc(newEntry.id).set(newEntry);
    } catch (err) {
      console.warn('[Customer360Repository] Add timeline offline:', err);
    }

    SEED_TIMELINE_ENTRIES.unshift(newEntry);
    return newEntry;
  }

  // Communications Log
  static async getCommunications(customerId: string): Promise<CustomerCommunicationEntry[]> {
    if (useLocalCustomer360Store()) {
      const communications = ensureLocalCustomer360Store().communications || [];
      return communications
        .filter((c) => c.customerId === customerId || customerId === 'CUST-360-1001')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    try {
      const snap = await getAdminFirestore()
        .collection(CUSTOMER_COMMUNICATIONS_COLLECTION)
        .where('customerId', '==', customerId)
        .get();
      if (!snap.empty) {
        return snap.docs
          .map((d) => d.data() as CustomerCommunicationEntry)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    } catch (err) {
      console.warn('[Customer360Repository] Firestore communications fallback:', err);
    }

    return SEED_COMMUNICATIONS.filter((c) => c.customerId === customerId || customerId === 'CUST-360-1001');
  }

  static async addCommunication(comm: Omit<CustomerCommunicationEntry, 'id'>): Promise<CustomerCommunicationEntry> {
    const newComm: CustomerCommunicationEntry = {
      ...comm,
      id: `COMM-${Date.now()}`,
    };

    if (useLocalCustomer360Store()) {
      const store = ensureLocalCustomer360Store();
      store.communications = [newComm, ...(store.communications || [])];
      localDb.save();
      return newComm;
    }

    try {
      await getAdminFirestore().collection(CUSTOMER_COMMUNICATIONS_COLLECTION).doc(newComm.id).set(newComm);
    } catch (err) {
      console.warn('[Customer360Repository] Save communication error:', err);
    }

    SEED_COMMUNICATIONS.unshift(newComm);
    return newComm;
  }

  // Activities & Tasks
  static async getActivities(customerId: string): Promise<CustomerActivityTask[]> {
    if (useLocalCustomer360Store()) {
      const activities = ensureLocalCustomer360Store().activities || [];
      return activities.filter((a) => a.customerId === customerId || customerId === 'CUST-360-1001');
    }

    try {
      const snap = await getAdminFirestore()
        .collection(CUSTOMER_ACTIVITIES_COLLECTION)
        .where('customerId', '==', customerId)
        .get();
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as CustomerActivityTask);
      }
    } catch (err) {
      console.warn('[Customer360Repository] Firestore activities fallback:', err);
    }

    return SEED_ACTIVITIES.filter((a) => a.customerId === customerId || customerId === 'CUST-360-1001');
  }

  static async addActivity(act: Omit<CustomerActivityTask, 'id' | 'createdAt'>): Promise<CustomerActivityTask> {
    const newAct: CustomerActivityTask = {
      ...act,
      id: `ACT-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (useLocalCustomer360Store()) {
      const store = ensureLocalCustomer360Store();
      store.activities = [newAct, ...(store.activities || [])];
      localDb.save();
      return newAct;
    }

    try {
      await getAdminFirestore().collection(CUSTOMER_ACTIVITIES_COLLECTION).doc(newAct.id).set(newAct);
    } catch (err) {
      console.warn('[Customer360Repository] Save activity error:', err);
    }

    SEED_ACTIVITIES.unshift(newAct);
    return newAct;
  }

  // Documents
  static async getDocuments(customerId: string): Promise<CustomerDocument360[]> {
    if (useLocalCustomer360Store()) {
      const documents = ensureLocalCustomer360Store().documents || [];
      return documents.filter((d) => d.customerId === customerId || customerId === 'CUST-360-1001');
    }

    try {
      const snap = await getAdminFirestore()
        .collection(CUSTOMER_DOCUMENTS_COLLECTION)
        .where('customerId', '==', customerId)
        .get();
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as CustomerDocument360);
      }
    } catch (err) {
      console.warn('[Customer360Repository] Firestore documents fallback:', err);
    }

    return SEED_DOCUMENTS.filter((d) => d.customerId === customerId || customerId === 'CUST-360-1001');
  }

  // Compute KPI Summary
  static async getKpiSummary(): Promise<Customer360KpiSummary> {
    const profiles = await this.listProfiles();
    const total = profiles.length;
    const active = profiles.filter((p) => p.customerStatus === 'ACTIVE' || p.customerStatus === 'VIP' || p.customerStatus === 'STRATEGIC').length;
    const vip = profiles.filter((p) => p.customerStatus === 'VIP' || p.segment === 'VIP').length;
    const enterprise = profiles.filter((p) => p.customerType === 'ENTERPRISE').length;

    const totalHealth = profiles.reduce((acc, p) => acc + (p.healthScore?.overallScore || 75), 0);
    const avgHealth = total > 0 ? Math.round(totalHealth / total) : 80;
    const atRisk = profiles.filter((p) => p.healthScore?.status === 'AT_RISK' || p.healthScore?.status === 'CRITICAL').length;
    const totalRev = profiles.reduce((acc, p) => acc + (p.clv?.totalRevenue || 0), 0);
    const avgRetention = total > 0 ? Math.round(profiles.reduce((acc, p) => acc + (p.clv?.retentionMonths || 12), 0) / total) : 24;

    return {
      totalCustomers: total,
      activeCustomers: active,
      vipCustomers: vip,
      enterpriseCustomers: enterprise,
      averageHealthScore: avgHealth,
      atRiskCustomersCount: atRisk,
      totalLifetimeRevenue: totalRev,
      avgRetentionMonths: avgRetention,
    };
  }
}
