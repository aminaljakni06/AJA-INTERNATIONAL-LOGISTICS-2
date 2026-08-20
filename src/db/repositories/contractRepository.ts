import {
  CommercialContract,
  SalesOrder,
  RateCardItem,
  SlaRule
} from '../../types/contract';
import { getAdminFirestore } from '../../server/firebaseAdmin';

const CONTRACTS_COLLECTION = 'commercial_contracts';
const SALES_ORDERS_COLLECTION = 'sales_orders';

// Initial Mock Seed Data
const SEED_CONTRACTS: CommercialContract[] = [
  {
    id: 'CTR-2026-8801',
    contractNumber: 'AJA-CTR-2026-001',
    title: 'عقد الخدمات اللوجستية والتخزين المبرد الشامل - شركة السيف',
    contractType: 'MASTER_SERVICE_AGREEMENT',
    version: 1,
    revision: 2,
    status: 'ACTIVE',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    effectiveDate: '2026-01-01T00:00:00Z',
    expirationDate: '2027-12-31T23:59:59Z',
    renewalDate: '2027-11-01T00:00:00Z',
    autoRenewal: true,
    businessOwner: 'م. خالد السيف',
    legalOwner: 'د. طارق الزهراني',
    commercialOwner: 'عبدالرحمن العتيبي',
    currency: 'SAR',
    contractValue: 4500000,
    jurisdiction: 'المملكة العربية السعودية - المحكمة التجارية بالرياض',
    governingLaw: 'أنظمة ولوائح الهيئة العامة للنقل والجمارك السعودية',
    languages: ['ar', 'en'],
    clauses: [
      {
        id: 'CLS-1',
        title: 'بند التعرفة الحصرية والتخفيض الكمي',
        content: 'يحصل الطرف الثاني على نسبة خصم 12% لجميع شحنات الحاويات 40 قدم الجافة والقادمة عبر ميناء جدة الإسلامي بشرط عدم تجاوز 500 حاوية شهرياً.',
        category: 'PRICING',
        isMandatory: true,
      },
      {
        id: 'CLS-2',
        title: 'بند السلامة المبردة وضمان جودة الدواء والغذاء',
        content: 'تلتزم شركة أجا بالحفاظ على درجة حرارة المستودع بين +2 إلى +8 درجات مئوية لشحنات الأدوية مع تقديم سجل حراري آلي كل 6 ساعات.',
        category: 'SLA',
        isMandatory: true,
      },
    ],
    slaRules: [
      {
        id: 'SLA-1',
        metricName: 'زمن الفسح والشحن من الميناء',
        targetValue: 'خلال 24 ساعة من تفريغ السفينة',
        penaltyRule: 'خصم 2% من قيمة الشحن عن كل 6 ساعات تأخير',
        escalationContact: 'ops-sla@aja-logistics.sa',
      },
      {
        id: 'SLA-2',
        metricName: 'دقة التسليم النهائي للمستودعات',
        targetValue: '99.2% التسليم في الموعد المعتمد',
        penaltyRule: 'إعفاء العميل من رسوم التفريغ لشحنة التأخير',
        escalationContact: 'quality@aja-logistics.sa',
      },
    ],
    rateCards: [
      {
        id: 'RC-101',
        category: 'SEA_FREIGHT',
        origin: 'شنغهاي (China)',
        destination: 'جدة الإسلامي (KSA)',
        unitOfMeasure: 'CONTAINER_40',
        baseRate: 8500,
        currency: 'SAR',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
      },
      {
        id: 'RC-102',
        category: 'WAREHOUSING',
        origin: 'مستودعات الرياض المبردة',
        destination: 'المستودع الرئيسي',
        unitOfMeasure: 'PALLET',
        baseRate: 45,
        currency: 'SAR',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
      },
    ],
    signatures: [
      {
        id: 'SIG-01',
        signerName: 'م. خالد السيف',
        signerEmail: 'k.alseef@alseef-logistics.sa',
        signerRole: 'CUSTOMER_REP',
        signedAt: '2025-12-28T14:30:00Z',
        ipAddress: '185.220.101.5',
        verificationHash: 'SHA256-AJA-CONTRACT-992011',
        certificateRef: 'DIGICERT-KSA-2025-881',
      },
      {
        id: 'SIG-02',
        signerName: 'عبدالرحمن العتيبي',
        signerEmail: 'a.otaibi@aja-logistics.sa',
        signerRole: 'COMMERCIAL',
        signedAt: '2025-12-28T15:10:00Z',
        ipAddress: '213.166.130.2',
        verificationHash: 'SHA256-AJA-CONTRACT-992012',
        certificateRef: 'DIGICERT-AJA-2025-994',
      },
    ],
    versionHistory: [
      {
        versionNumber: 1,
        revisedAt: '2025-12-20T10:00:00Z',
        revisedBy: 'فريق الشؤون القانونية',
        changeSummary: 'الإصدار المبدئي وتضمين الشروط المبردة',
      },
    ],
    riskFlags: [
      {
        id: 'RF-01',
        riskType: 'تذبذب أسعار الوقود (Fuel Surcharge Risk)',
        description: 'عدم تضمين شرط تعديل الوقود ربع السنوي قد يرفع التكاليف التشغيلية بنسبة 4%.',
        severity: 'MEDIUM',
      },
    ],
    complianceCheck: {
      insuranceValid: true,
      taxValid: true,
      licenseValid: true,
      auditPassed: true,
    },
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2025-12-28T15:10:00Z',
  },
];

const SEED_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO-2026-9001',
    orderNumber: 'AJA-SO-9001',
    customerId: 'CUST-360-1001',
    customerName: 'شركة السيف اللوجستية للصناعة والتجارة',
    quotationRef: 'Q-2026-8802',
    contractRef: 'AJA-CTR-2026-001',
    items: [
      {
        id: 'SOI-1',
        itemType: 'SHIPMENT_REQUEST',
        description: 'شحن 10 حاويات مبردة 40 قدم من ميناء جدة إلى الرياض',
        quantity: 10,
        unitPrice: 4200,
        discountPercent: 5,
        taxPercent: 15,
        totalAmount: 45885,
      },
      {
        id: 'SOI-2',
        itemType: 'WAREHOUSE_REQUEST',
        description: 'تخزين مبرد 200 طبلية دواء بمستودعات السلي - شهري',
        quantity: 200,
        unitPrice: 50,
        taxPercent: 15,
        totalAmount: 11500,
      },
    ],
    subtotal: 52000,
    totalDiscount: 2100,
    totalTax: 7485,
    grandTotal: 57385,
    currency: 'SAR',
    billingSchedule: 'MONTHLY',
    approvalStatus: 'APPROVED',
    orderStatus: 'IN_PROGRESS',
    expectedDelivery: '2026-08-15T18:00:00Z',
    completionPercentage: 65,
    createdById: 'USR-8801',
    createdByName: 'عبدالرحمن العتيبي',
    createdAt: '2026-08-01T09:00:00Z',
  },
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[ContractRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

// CONTRACTS REPOSITORY
export async function getContracts(customerId?: string): Promise<CommercialContract[]> {
  const items = await safeFetchCollection<CommercialContract>(CONTRACTS_COLLECTION, SEED_CONTRACTS);
  if (customerId) {
    return items.filter(c => c.customerId === customerId);
  }
  return items;
}

export async function createContract(contractData: Omit<CommercialContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommercialContract> {
  const id = `CTR-${Date.now()}`;
  const now = new Date().toISOString();
  const contract: CommercialContract = {
    ...contractData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await getAdminFirestore().collection(CONTRACTS_COLLECTION).doc(id).set(contract);
  } catch (err) {
    console.warn('[ContractRepo] setDoc error:', err);
  }

  SEED_CONTRACTS.unshift(contract);
  return contract;
}

export async function updateContractStatus(id: string, status: CommercialContract['status']): Promise<void> {
  const contracts = await getContracts();
  const contract = contracts.find(c => c.id === id);
  if (contract) {
    contract.status = status;
    contract.updatedAt = new Date().toISOString();
    try {
      await getAdminFirestore().collection(CONTRACTS_COLLECTION).doc(id).update({ status, updatedAt: contract.updatedAt });
    } catch (err) {
      console.warn('[ContractRepo] updateDoc error:', err);
    }
  }
}

// SALES ORDERS REPOSITORY
export async function getSalesOrders(customerId?: string): Promise<SalesOrder[]> {
  const items = await safeFetchCollection<SalesOrder>(SALES_ORDERS_COLLECTION, SEED_SALES_ORDERS);
  if (customerId) {
    return items.filter(s => s.customerId === customerId);
  }
  return items;
}

export async function createSalesOrder(orderData: Omit<SalesOrder, 'id' | 'createdAt'>): Promise<SalesOrder> {
  const id = `SO-${Date.now()}`;
  const salesOrder: SalesOrder = {
    ...orderData,
    id,
    createdAt: new Date().toISOString(),
  };

  try {
    await getAdminFirestore().collection(SALES_ORDERS_COLLECTION).doc(id).set(salesOrder);
  } catch (err) {
    console.warn('[SalesOrderRepo] setDoc error:', err);
  }

  SEED_SALES_ORDERS.unshift(salesOrder);
  return salesOrder;
}
