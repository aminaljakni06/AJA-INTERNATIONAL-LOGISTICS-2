import {
  ServiceCase,
  KnowledgeArticle,
  DepartmentQueue,
  ServiceMetricsSummary,
  CaseNote
} from '../../types/customerService';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const CASES_COLLECTION = 'service_cases';
const ARTICLES_COLLECTION = 'knowledge_articles';

// Mock Seed Data for Service Cases
const SEED_CASES: ServiceCase[] = [
  {
    id: 'CASE-2026-1001',
    caseNumber: 'AJA-CS-9001',
    title: 'تأخير فسح شحنة أدوية مبردة في ميناء جاف بالرياض',
    description: 'تم حجز الحاوية المبردة AJAU-88201 في الجمارك لطلب شهادة إعادة فحص درجات الحرارة من هيئة الغذاء والدواء.',
    caseType: 'SHIPMENT_ISSUE',
    serviceRequestType: 'DOCUMENT_REQUEST',
    priority: 'CRITICAL',
    severity: 'S1_CRITICAL_OUTAGE',
    status: 'ESCALATED',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    shipmentRef: 'SHP-2026-8801',
    contractRef: 'AJA-CTR-2026-001',
    department: 'CUSTOMS_CLEARANCE',
    assignedAgentId: 'AGENT-101',
    assignedAgentName: 'م. فهد الزهراني',
    firstResponseTimeMinutes: 12,
    resolutionTimeHours: 4.5,
    slaBreached: false,
    slaDeadline: '2026-08-04T18:00:00Z',
    escalationLevel: 2,
    sentimentScore: 'URGENT',
    notes: [
      {
        id: 'NOTE-1',
        authorId: 'AGENT-101',
        authorName: 'م. فهد الزهراني',
        authorRole: 'AGENT',
        content: 'تم التواصل مع المخلص الجمركي في المنفذ لإرسال السجل الحراري الرقمي فوراً.',
        isInternal: false,
        createdAt: '2026-08-04T09:30:00Z',
      },
      {
        id: 'NOTE-2',
        authorId: 'AI-BOT',
        authorName: 'مساعد أجا الذكي',
        authorRole: 'AI_ASSISTANT',
        content: 'توصية الذكاء الاصطناعي: الشحنة تحتوي أدوية حساسة للحرارة، يوصى برفع التذكرة لمدير الجمارك الإقليمي لتفادي فساد المخزون.',
        isInternal: true,
        createdAt: '2026-08-04T09:32:00Z',
      },
    ],
    timeline: [
      {
        id: 'TL-1',
        timestamp: '2026-08-04T09:00:00Z',
        eventType: 'CASE_CREATED',
        description: 'تم إنشاء التذكرة بواسطة البوابة الإلكترونية للعميل',
        actorName: 'م. خالد السيف (عميل)',
      },
      {
        id: 'TL-2',
        timestamp: '2026-08-04T09:30:00Z',
        eventType: 'CASE_ESCALATED',
        description: 'تصعيد التذكرة إلى المستوى 2 بناءً على قواعد SLA للشحنات المبردة',
        actorName: 'نظام محرك التصعيد الآلي',
      },
    ],
    csatRating: 5,
    csatFeedback: 'استجابة سريعة جداً وحرص على سلامة شحنة الأدوية.',
    createdAt: '2026-08-04T09:00:00Z',
    updatedAt: '2026-08-04T10:15:00Z',
  },
  {
    id: 'CASE-2026-1002',
    caseNumber: 'AJA-CS-9002',
    title: 'استفسار عن مطابقة فاتورة التخزين المبرد لشهر يوليو',
    description: 'طلب مراجعة احتساب خصم التخزين الكمي بنسبة 12% المذكورة في عقد خدمات السيف اللوجستية.',
    caseType: 'BILLING_ISSUE',
    serviceRequestType: 'REFUND_REQUEST',
    priority: 'MEDIUM',
    severity: 'S3_MINOR_IMPACT',
    status: 'IN_PROGRESS',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    invoiceRef: 'INV-2026-7701',
    contractRef: 'AJA-CTR-2026-001',
    department: 'FINANCE_BILLING',
    assignedAgentId: 'AGENT-202',
    assignedAgentName: 'سارة الشمري',
    firstResponseTimeMinutes: 25,
    resolutionTimeHours: 12,
    slaBreached: false,
    slaDeadline: '2026-08-05T12:00:00Z',
    escalationLevel: 0,
    sentimentScore: 'NEUTRAL',
    notes: [
      {
        id: 'NOTE-201',
        authorId: 'AGENT-202',
        authorName: 'سارة الشمري',
        authorRole: 'AGENT',
        content: 'جاري مطابقة الفاتورة مع جدول السعات الواردة من إدارة المستودعات.',
        isInternal: false,
        createdAt: '2026-08-04T10:00:00Z',
      },
    ],
    timeline: [
      {
        id: 'TL-201',
        timestamp: '2026-08-04T09:45:00Z',
        eventType: 'CASE_CREATED',
        description: 'تم إنشاء التذكرة عبر البريد الإلكتروني الموحد',
        actorName: 'قسم المالية - شركة السيف',
      },
    ],
    createdAt: '2026-08-04T09:45:00Z',
    updatedAt: '2026-08-04T10:00:00Z',
  },
];

const SEED_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'KB-101',
    articleNumber: 'AJA-KB-001',
    title: 'متطلبات وإجراءات الفسح الجمركي للشحنات المبردة والطبية',
    summary: 'دليل خطوة بخطوة للوثائق المطلوبة من هيئة الغذاء والدواء (SFDA) والجمارك السعودية لتفادي تأخير الشحنات.',
    content: 'يتطلب الفسح الجمركي للمنتجات الطبية والمبردة: 1. شهادة مطابقة الجودة 2. السجل الحراري المتصل 3. ترخيص استيراد الفئة ب...',
    category: 'CUSTOMS',
    tags: ['جمارك', 'أدوية', 'تبريد', 'SFDA'],
    authorName: 'د. طارق الزهراني',
    viewsCount: 342,
    helpfulCount: 88,
    unhelpfulCount: 2,
    status: 'PUBLISHED',
    updatedAt: '2026-07-15T10:00:00Z',
  },
  {
    id: 'KB-102',
    articleNumber: 'AJA-KB-002',
    title: 'سياسة التعويض والجزاءات في اتفاقيات مستوى الخدمة (SLA)',
    summary: 'شرح آلية احتساب التعويض الآلي في حالات تأخير الشحن أو أخطاء التفريغ بالمستودعات.',
    content: 'يتم احتساب الخصم التعويضي تلقائياً في فاتورة الدورة التالية بنسبة 2% عن كل 6 ساعات تأخير مع إشعار العميل...',
    category: 'SLA_POLICIES',
    tags: ['SLA', 'تعويضات', 'عقود', 'فوترة'],
    authorName: 'عبدالرحمن العتيبي',
    viewsCount: 215,
    helpfulCount: 54,
    unhelpfulCount: 1,
    status: 'PUBLISHED',
    updatedAt: '2026-07-20T12:00:00Z',
  },
];

export const SEED_QUEUES: DepartmentQueue[] = [
  { id: 'Q-1', departmentName: 'الجمارك والفسح الجمركي', activeAgentsCount: 8, openCasesCount: 5, avgResolutionTimeHours: 3.2, slaComplianceRatePercentage: 98.4 },
  { id: 'Q-2', departmentName: 'العمليات وشحن الطرق', activeAgentsCount: 14, openCasesCount: 9, avgResolutionTimeHours: 2.1, slaComplianceRatePercentage: 99.1 },
  { id: 'Q-3', departmentName: 'إدارة المستودعات المبردة', activeAgentsCount: 6, openCasesCount: 3, avgResolutionTimeHours: 1.8, slaComplianceRatePercentage: 100.0 },
  { id: 'Q-4', departmentName: 'المالية والفوترة اللوجستية', activeAgentsCount: 5, openCasesCount: 4, avgResolutionTimeHours: 5.5, slaComplianceRatePercentage: 96.2 },
];

export const SEED_METRICS: ServiceMetricsSummary = {
  totalCases: 1248,
  openCases: 21,
  resolvedCases: 1227,
  avgResponseTimeMinutes: 14.2,
  slaCompliancePercentage: 98.6,
  csatScore: 4.85,
  npsScore: 68,
  cesScore: 4.7,
};

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[CustomerServiceRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

// SERVICE CASES REPOSITORY
export async function getServiceCases(customerId?: string): Promise<ServiceCase[]> {
  const items = await safeFetchCollection<ServiceCase>(CASES_COLLECTION, SEED_CASES);
  if (customerId) {
    return items.filter(c => c.customerId === customerId);
  }
  return items;
}

export async function createServiceCase(caseData: Omit<ServiceCase, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCase> {
  const id = `CASE-${Date.now()}`;
  const now = new Date().toISOString();
  const serviceCase: ServiceCase = {
    ...caseData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await getAdminFirestore().collection(CASES_COLLECTION).doc(id).set(serviceCase);
  } catch (err) {
    console.warn('[CustomerServiceRepo] setDoc error:', err);
  }

  SEED_CASES.unshift(serviceCase);
  return serviceCase;
}

export async function addCaseNote(caseId: string, noteData: Omit<CaseNote, 'id' | 'createdAt'>): Promise<ServiceCase | null> {
  const cases = await getServiceCases();
  const c = cases.find(item => item.id === caseId);
  if (c) {
    const note: CaseNote = {
      ...noteData,
      id: `NOTE-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    c.notes.push(note);
    c.updatedAt = note.createdAt;

    try {
      await getAdminFirestore().collection(CASES_COLLECTION).doc(caseId).update({
        notes: c.notes,
        updatedAt: c.updatedAt,
      });
    } catch (err) {
      console.warn('[CustomerServiceRepo] updateDoc error:', err);
    }
    return c;
  }
  return null;
}

export async function updateCaseStatus(caseId: string, status: ServiceCase['status'], escalationLevel?: number): Promise<ServiceCase | null> {
  const cases = await getServiceCases();
  const c = cases.find(item => item.id === caseId);
  if (c) {
    c.status = status;
    if (escalationLevel !== undefined) {
      c.escalationLevel = escalationLevel;
    }
    if (status === 'RESOLVED' || status === 'CLOSED') {
      c.resolvedAt = new Date().toISOString();
    }
    c.updatedAt = new Date().toISOString();

    try {
      await getAdminFirestore().collection(CASES_COLLECTION).doc(caseId).update({
        status: c.status,
        escalationLevel: c.escalationLevel,
        resolvedAt: c.resolvedAt || null,
        updatedAt: c.updatedAt,
      });
    } catch (err) {
      console.warn('[CustomerServiceRepo] updateDoc error:', err);
    }
    return c;
  }
  return null;
}

// KNOWLEDGE BASE REPOSITORY
export async function getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  return safeFetchCollection<KnowledgeArticle>(ARTICLES_COLLECTION, SEED_ARTICLES);
}

export async function createKnowledgeArticle(artData: Omit<KnowledgeArticle, 'id' | 'updatedAt'>): Promise<KnowledgeArticle> {
  const id = `KB-${Date.now()}`;
  const article: KnowledgeArticle = {
    ...artData,
    id,
    updatedAt: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(ARTICLES_COLLECTION).doc(id).set(article);
  } catch (err) {
    console.warn('[CustomerServiceRepo] setDoc article error:', err);
  }

  SEED_ARTICLES.unshift(article);
  return article;
}
