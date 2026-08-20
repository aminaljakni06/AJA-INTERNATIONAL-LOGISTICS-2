import { getAdminFirestore } from '../../server/firebaseAdmin';
import {
  PurchasingOrganization,
  PurchasingGroup,
  VendorMaster,
  SupplierContract,
  ProcurementPolicy,
  SupplierPerformanceLog,
  SupplierRiskAlert,
  ProcurementSummaryKPIs,
  VendorStatus,
  VendorCategoryType,
  PurchaseRequisition,
  SourcingEvent,
  SupplierQuotation,
  StrategicSourcingAnalytics,
  SupplierInvoice,
  APPaymentRun,
  SupplierReconciliationStatement,
  APAgingAnalytics,
  AIAPIntelligence,
  ThreeWayMatchResult,
  SpendCubeFilter,
  SpendCubeData,
  SupplierScorecard,
  ContractComplianceMetric,
  ContractComplianceSummary,
  PurchaseCycleAnalytics,
  ExecutiveProcurementKPIs,
  AIProcurementIntelligenceData
} from '../../types/procurement';

const VENDORS_COLLECTION = 'procurement_vendors';
const PURCHASING_ORGS_COLLECTION = 'purchasing_organizations';
const PURCHASING_GROUPS_COLLECTION = 'purchasing_groups';
const CONTRACTS_COLLECTION = 'procurement_contracts';
const POLICIES_COLLECTION = 'procurement_policies';
const PERFORMANCE_COLLECTION = 'supplier_performance_logs';
const RISK_ALERTS_COLLECTION = 'supplier_risk_alerts';
const REQUISITIONS_COLLECTION = 'purchase_requisitions';
const SOURCING_EVENTS_COLLECTION = 'sourcing_events';
const QUOTATIONS_COLLECTION = 'supplier_quotations';
const INVOICES_COLLECTION = 'supplier_invoices';
const PAYMENT_RUNS_COLLECTION = 'ap_payment_runs';
const RECONCILIATIONS_COLLECTION = 'supplier_reconciliations';

export const SEED_PURCHASING_ORGS: PurchasingOrganization[] = [
  {
    id: 'PORG-AJA-HQ-01',
    code: 'P-ORG-SA',
    name: 'المقر الرئيسي لتدبير الشراء - السعودية (AJA SA Procurement HQ)',
    companyId: 'AJA-SA-COMP',
    companyName: 'AJA International Logistics Co.',
    currency: 'SAR',
    status: 'ACTIVE',
    buyersCount: 18,
    description: 'الإدارة المركزية لتدبير الشراء والعقود والشركاء الاستراتيجيين في المملكة ودول الخليج',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'PORG-AJA-FLEET-02',
    code: 'P-ORG-FLEET',
    name: 'منظمة الشراء للأسطول والنقل (AJA Fleet Procurement)',
    companyId: 'AJA-GCC-COMP',
    companyName: 'AJA Transport & Fleet Division',
    currency: 'SAR',
    status: 'ACTIVE',
    buyersCount: 9,
    description: 'مختصة بتدبير الوقود، صيانة الشاحنات، قطع الغيار، والشحن مع النواقل الفرعية 3PL',
    createdAt: '2024-02-01T08:00:00Z'
  }
];

export const SEED_PURCHASING_GROUPS: PurchasingGroup[] = [
  {
    id: 'PGRP-101',
    code: 'P-GRP-ROAD',
    name: 'مجموعة شراء النقل البري والـ 3PL (Road Freight Purchasing)',
    purchasingOrgId: 'PORG-AJA-HQ-01',
    purchasingOrgName: 'AJA SA Procurement HQ',
    leadBuyerName: 'إبراهيم السحيمي (Ibrahim Al-Suhaimi)',
    leadBuyerEmail: 'i.suhaimi@aja.com.sa',
    categorySpecialization: 'Transportation',
    membersCount: 6
  },
  {
    id: 'PGRP-102',
    code: 'P-GRP-WH',
    name: 'مجموعة شراء خدمات وتجهيزات المستودعات (Warehousing Procurement)',
    purchasingOrgId: 'PORG-AJA-HQ-01',
    purchasingOrgName: 'AJA SA Procurement HQ',
    leadBuyerName: 'نورة العتيبي (Noura Al-Otaibi)',
    leadBuyerEmail: 'n.otaibi@aja.com.sa',
    categorySpecialization: 'Warehousing',
    membersCount: 4
  },
  {
    id: 'PGRP-103',
    code: 'P-GRP-FUEL',
    name: 'مجموعة عقود الوقود والطاقة (Energy & Fuel Supply Group)',
    purchasingOrgId: 'PORG-AJA-FLEET-02',
    purchasingOrgName: 'AJA Fleet Procurement',
    leadBuyerName: 'طارق الدوسري (Tariq Al-Dosari)',
    leadBuyerEmail: 't.dosari@aja.com.sa',
    categorySpecialization: 'Fuel',
    membersCount: 3
  },
  {
    id: 'PGRP-104',
    code: 'P-GRP-CUST',
    name: 'مجموعة خدمات التخليص الجمركي والموانئ (Customs & Brokerage Group)',
    purchasingOrgId: 'PORG-AJA-HQ-01',
    purchasingOrgName: 'AJA SA Procurement HQ',
    leadBuyerName: 'فيصل الغامدي (Faisal Al-Ghamdi)',
    leadBuyerEmail: 'f.ghamdi@aja.com.sa',
    categorySpecialization: 'Customs',
    membersCount: 5
  }
];

export const SEED_VENDORS: VendorMaster[] = [
  {
    id: 'VEN-SA-1001',
    vendorCode: 'VEN-FUEL-01',
    name: 'شركة ساسكو للوقود وتزويد الأسطول (SASCO Petroleum Services)',
    legalName: 'الشركة السعودية לخدمات السيارات والمعدات (ساسكو)',
    taxId: '300098129000003',
    commercialRegisterNo: '1010054321',
    vendorType: 'Fuel',
    status: 'STRATEGIC',
    companyDetails: {
      website: 'https://sasco.com.sa',
      phone: '+966 11 206 8888',
      email: 'fleet.contracts@sasco.com.sa',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      address: 'طريق الدائري الشمالي، حي الغدير',
      postalCode: '13311'
    },
    financial: {
      bankName: 'البنك الأهلي السعودي (SNB)',
      iban: 'SA0310000001010054321001',
      swift: 'NCBKSARIXXX',
      paymentTerms: 'NET_30',
      currency: 'SAR',
      creditLimitSAR: 15000000
    },
    categories: ['Fuel', 'Utilities'],
    regionsServed: ['جميع مناطق المملكة', 'دول الخليج'],
    qualifications: {
      complianceValidated: true,
      backgroundCheckPassed: true,
      isoCertified: true,
      zatcaTaxVerified: true,
      commercialRegisterVerified: true,
      documentsCollectedCount: 8,
      verificationDate: '2025-01-10',
      expiryDate: '2028-12-31'
    },
    scorecard: {
      qualityScore: 98,
      deliveryPerformance: 99.4,
      priceCompetitiveness: 94,
      leadTimeDays: 1,
      responseTimeHours: 2,
      complianceScore: 100,
      overallRating: 4.9
    },
    riskProfile: {
      financialRisk: 'LOW',
      operationalRisk: 'LOW',
      complianceRisk: 'LOW',
      cyberRisk: 'LOW',
      esgScore: 92,
      countryRisk: 'LOW',
      supplyChainRisk: 'LOW',
      overallRiskScore: 12,
      riskLevel: 'LOW'
    },
    contractCount: 3,
    totalSpendYTD: 12450000,
    activeOrdersCount: 42,
    primaryContactName: 'مهندس / منصور السعد',
    primaryContactEmail: 'm.saad@sasco.com.sa',
    primaryContactPhone: '+966 50 112 2334',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VEN-SA-1002',
    vendorCode: 'VEN-TRN-02',
    name: 'شركة المجدوعي للوجستيات والنقل (Almajdouie Logistics 3PL)',
    legalName: 'شركة المجدوعي للأعمال اللوجستية ش.م.م',
    taxId: '31099281000003',
    commercialRegisterNo: '2050012988',
    vendorType: 'Transportation',
    status: 'PREFERRED',
    companyDetails: {
      website: 'https://almajdouie.com',
      phone: '+966 13 881 9900',
      email: 'logistics.fleet@almajdouie.sa',
      country: 'المملكة العربية السعودية',
      city: 'الدمام',
      address: 'طريق الملك فهد، حي المزرعة',
      postalCode: '31411'
    },
    financial: {
      bankName: 'مصرف الراجحي',
      iban: 'SA8810000002050012988001',
      swift: 'RJHIKSARIXXX',
      paymentTerms: 'NET_45' as any,
      currency: 'SAR',
      creditLimitSAR: 25000000
    },
    categories: ['Transportation', 'Equipment'],
    regionsServed: ['المنطقة الشرقية', 'الرياض', 'المنطقة الغربية', 'الإمارات'],
    qualifications: {
      complianceValidated: true,
      backgroundCheckPassed: true,
      isoCertified: true,
      zatcaTaxVerified: true,
      commercialRegisterVerified: true,
      documentsCollectedCount: 12,
      verificationDate: '2025-02-01',
      expiryDate: '2027-06-30'
    },
    scorecard: {
      qualityScore: 96,
      deliveryPerformance: 98.2,
      priceCompetitiveness: 91,
      leadTimeDays: 2,
      responseTimeHours: 4,
      complianceScore: 98,
      overallRating: 4.8
    },
    riskProfile: {
      financialRisk: 'LOW',
      operationalRisk: 'LOW',
      complianceRisk: 'LOW',
      cyberRisk: 'LOW',
      esgScore: 88,
      countryRisk: 'LOW',
      supplyChainRisk: 'LOW',
      overallRiskScore: 18,
      riskLevel: 'LOW'
    },
    contractCount: 5,
    totalSpendYTD: 18900000,
    activeOrdersCount: 88,
    primaryContactName: 'أستاذ / خالد المجدوعي',
    primaryContactEmail: 'k.almajdouie@almajdouie.sa',
    primaryContactPhone: '+966 54 889 0011',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VEN-SA-1003',
    vendorCode: 'VEN-WHS-03',
    name: 'شركة التخزين والتبريد الوطنية (National Cold Logistics Hub)',
    legalName: 'شركة التخزين والتبريد الوطنية السحابية',
    taxId: '300188291000003',
    commercialRegisterNo: '1010398201',
    vendorType: 'Warehousing',
    status: 'APPROVED',
    companyDetails: {
      website: 'https://nationalcoldstorage.com.sa',
      phone: '+966 11 498 1200',
      email: 'leases@nationalcold.com.sa',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      address: 'المنطقة الصناعية الثانية، مخرج 15',
      postalCode: '11564'
    },
    financial: {
      bankName: 'بنك الرياض',
      iban: 'SA4420000001010398201001',
      swift: 'RIBLKSARIXXX',
      paymentTerms: 'NET_30',
      currency: 'SAR',
      creditLimitSAR: 8000000
    },
    categories: ['Warehousing'],
    regionsServed: ['الرياض', 'جدة'],
    qualifications: {
      complianceValidated: true,
      backgroundCheckPassed: true,
      isoCertified: true,
      zatcaTaxVerified: true,
      commercialRegisterVerified: true,
      documentsCollectedCount: 6,
      verificationDate: '2024-11-15',
      expiryDate: '2026-11-14'
    },
    scorecard: {
      qualityScore: 94,
      deliveryPerformance: 96.0,
      priceCompetitiveness: 88,
      leadTimeDays: 1,
      responseTimeHours: 6,
      complianceScore: 95,
      overallRating: 4.6
    },
    riskProfile: {
      financialRisk: 'LOW',
      operationalRisk: 'MEDIUM',
      complianceRisk: 'LOW',
      cyberRisk: 'MEDIUM',
      esgScore: 82,
      countryRisk: 'LOW',
      supplyChainRisk: 'MEDIUM',
      overallRiskScore: 28,
      riskLevel: 'LOW'
    },
    contractCount: 2,
    totalSpendYTD: 4200000,
    activeOrdersCount: 14,
    primaryContactName: 'دكتور / سعد الشمري',
    primaryContactEmail: 's.shammari@nationalcold.com.sa',
    primaryContactPhone: '+966 50 443 8811',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VEN-SA-1004',
    vendorCode: 'VEN-CUST-04',
    name: 'مؤسسة الساحل للخدمات الجمركية والموانئ (Coast Clear Brokers)',
    legalName: 'مؤسسة الساحل للتخليص والخدمات اللوجستية',
    taxId: '31100293000003',
    commercialRegisterNo: '2051038102',
    vendorType: 'Customs',
    status: 'CONDITIONAL',
    companyDetails: {
      website: 'https://coastclear.sa',
      phone: '+966 13 833 4411',
      email: 'ops@coastclear.sa',
      country: 'المملكة العربية السعودية',
      city: 'الدمام',
      address: 'حي الطبيشي، ميناء الملك عبد العزيز',
      postalCode: '31422'
    },
    financial: {
      bankName: 'البنك السعودي الأول (SAB)',
      iban: 'SA1280000002051038102001',
      swift: 'SABBKSARIXXX',
      paymentTerms: 'DUE_ON_RECEIPT',
      currency: 'SAR',
      creditLimitSAR: 2000000
    },
    categories: ['Customs'],
    regionsServed: ['ميناء الدمام', 'ميناء جدة الإسلامي', 'منفذ البطحاء'],
    qualifications: {
      complianceValidated: true,
      backgroundCheckPassed: true,
      isoCertified: false,
      zatcaTaxVerified: true,
      commercialRegisterVerified: true,
      documentsCollectedCount: 5,
      verificationDate: '2025-01-20',
      expiryDate: '2026-09-30'
    },
    scorecard: {
      qualityScore: 82,
      deliveryPerformance: 88.5,
      priceCompetitiveness: 92,
      leadTimeDays: 3,
      responseTimeHours: 12,
      complianceScore: 85,
      overallRating: 4.1
    },
    riskProfile: {
      financialRisk: 'MEDIUM',
      operationalRisk: 'MEDIUM',
      complianceRisk: 'HIGH',
      cyberRisk: 'MEDIUM',
      esgScore: 71,
      countryRisk: 'LOW',
      supplyChainRisk: 'HIGH',
      overallRiskScore: 52,
      riskLevel: 'MEDIUM'
    },
    contractCount: 1,
    totalSpendYTD: 1850000,
    activeOrdersCount: 9,
    primaryContactName: 'أحمد سعيد باجبر',
    primaryContactEmail: 'a.bajaber@coastclear.sa',
    primaryContactPhone: '+966 50 332 1199',
    createdAt: '2024-04-12T08:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VEN-SA-1005',
    vendorCode: 'VEN-PKG-05',
    name: 'مصنع الشرق لتغليف البضائع والطبليات (Orient Packaging Co.)',
    legalName: 'شركة مصنع الشرق للتعبئة والتغليف المحدودة',
    taxId: '300229810000003',
    commercialRegisterNo: '1010992100',
    vendorType: 'Packaging',
    status: 'APPROVED',
    companyDetails: {
      website: 'https://orientpack.com.sa',
      phone: '+966 11 265 1100',
      email: 'sales@orientpack.com.sa',
      country: 'المملكة العربية السعودية',
      city: 'الرياض',
      address: 'صناعية العيينة، طريق سدير',
      postalCode: '13912'
    },
    financial: {
      bankName: 'بنك الجزيرة',
      iban: 'SA5560000001010992100001',
      swift: 'BJAZKSARIXXX',
      paymentTerms: 'NET_30',
      currency: 'SAR',
      creditLimitSAR: 3000000
    },
    categories: ['Packaging'],
    regionsServed: ['جميع مناطق المملكة'],
    qualifications: {
      complianceValidated: true,
      backgroundCheckPassed: true,
      isoCertified: true,
      zatcaTaxVerified: true,
      commercialRegisterVerified: true,
      documentsCollectedCount: 7,
      verificationDate: '2024-10-01',
      expiryDate: '2027-10-01'
    },
    scorecard: {
      qualityScore: 92,
      deliveryPerformance: 95.0,
      priceCompetitiveness: 90,
      leadTimeDays: 4,
      responseTimeHours: 8,
      complianceScore: 94,
      overallRating: 4.5
    },
    riskProfile: {
      financialRisk: 'LOW',
      operationalRisk: 'LOW',
      complianceRisk: 'LOW',
      cyberRisk: 'LOW',
      esgScore: 85,
      countryRisk: 'LOW',
      supplyChainRisk: 'LOW',
      overallRiskScore: 19,
      riskLevel: 'LOW'
    },
    contractCount: 2,
    totalSpendYTD: 2100000,
    activeOrdersCount: 18,
    primaryContactName: 'أستاذ / عادل المطيري',
    primaryContactEmail: 'a.mutairi@orientpack.com.sa',
    primaryContactPhone: '+966 55 221 0099',
    createdAt: '2024-05-20T08:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

export const SEED_CONTRACTS: SupplierContract[] = [
  {
    id: 'CON-PROC-2026-01',
    contractNumber: 'CTR-AJA-FUEL-2026-001',
    vendorId: 'VEN-SA-1001',
    vendorName: 'SASCO Petroleum Services',
    title: 'اتفاقية إطار لتزويد الأسطول بالوقود والخدمات البترولية',
    contractType: 'FRAMEWORK',
    startDate: '2026-01-01',
    endDate: '2028-12-31',
    autoRenew: true,
    status: 'ACTIVE',
    valueSAR: 35000000,
    governingLaw: 'أنظمة المملكة العربية السعودية',
    paymentTerms: 'NET_30',
    renewalNoticeDays: 60,
    createdAt: '2025-12-15T08:00:00Z'
  },
  {
    id: 'CON-PROC-2026-02',
    contractNumber: 'CTR-AJA-3PL-2026-002',
    vendorId: 'VEN-SA-1002',
    vendorName: 'Almajdouie Logistics 3PL',
    title: 'عقد الناقل المفضل للشحن الثقيل وتوزيع المسار الشرياني',
    contractType: 'PRICING_AGREEMENT',
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    autoRenew: false,
    status: 'ACTIVE',
    valueSAR: 22000000,
    governingLaw: 'أنظمة المملكة العربية السعودية - الهيئة العامة للنقل',
    paymentTerms: 'NET_60',
    renewalNoticeDays: 30,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'CON-PROC-2026-03',
    contractNumber: 'CTR-AJA-WHS-2026-003',
    vendorId: 'VEN-SA-1003',
    vendorName: 'National Cold Logistics Hub',
    title: 'عقد استئجار السعة التخزينية المبردة بالرياض وتوفير مستويات SLA',
    contractType: 'SLA',
    startDate: '2025-06-01',
    endDate: '2026-05-31',
    autoRenew: true,
    status: 'UNDER_REVIEW',
    valueSAR: 5000000,
    governingLaw: 'أنظمة المملكة العربية السعودية',
    paymentTerms: 'NET_30',
    renewalNoticeDays: 45,
    createdAt: '2025-05-10T08:00:00Z'
  }
];

export const SEED_POLICIES: ProcurementPolicy[] = [
  {
    id: 'POL-PROC-01',
    policyCode: 'POL-GOV-01',
    title: 'سياسة الاعتماد المالي للشراء العالي القيمة (High Value Fleet Procurement)',
    category: 'Transportation',
    minAmountSAR: 500000,
    maxAmountSAR: 20000000,
    approvalTier: 'CFO',
    requiredQuotesCount: 3,
    preferredVendorEnforced: true,
    status: 'ACTIVE',
    description: 'تتطلب 3 عروض أسعار تنافسية وموافقات كتابية من نائب الرئيس ورئيس القطاع المالي قبل إصدار أصل التعميد'
  },
  {
    id: 'POL-PROC-02',
    policyCode: 'POL-GOV-02',
    title: 'سياسة تدبير خدمات التغليف والتخزين التشغيلي',
    category: 'Warehousing',
    minAmountSAR: 50000,
    maxAmountSAR: 500000,
    approvalTier: 'DIRECTOR',
    requiredQuotesCount: 2,
    preferredVendorEnforced: true,
    status: 'ACTIVE',
    description: 'توجيه طلبات الشراء إلى قائمة الموردين المعتمدين (Approved Vendor List) كأولوية قصوى'
  },
  {
    id: 'POL-PROC-03',
    policyCode: 'POL-GOV-03',
    title: 'سياسة الشراء السريع للوقود والزيوت والطوارئ التشغيلية',
    category: 'Fuel',
    minAmountSAR: 1000,
    maxAmountSAR: 50000,
    approvalTier: 'MANAGER',
    requiredQuotesCount: 1,
    preferredVendorEnforced: true,
    status: 'ACTIVE',
    description: 'تفويض مدراء الأسطول بالتعميد المباشر عبر المورد الاستراتيجي المقيد بالاتفاقية الإطارية'
  }
];

export const SEED_RISK_ALERTS: SupplierRiskAlert[] = [
  {
    id: 'RISK-ALT-01',
    vendorId: 'VEN-SA-1004',
    vendorName: 'Coast Clear Brokers',
    riskCategory: 'COMPLIANCE',
    severity: 'HIGH',
    title: 'اقتراب موعد انتهاء ترخيص المخلص الجمركي المعتمد من زاتكا (ZATCA)',
    description: 'ترخيص المخلّص الجمركي ينتهي خلال 45 يوماً ولم يرفع المورد التجديد في بوابة الموردين حتى الآن',
    mitigationPlan: 'إشعار المورد هاتفياً والحد من إسناد شحنات استيراد جديدة حتى استلام شهادة الترخيص المحدثة',
    status: 'INVESTIGATING',
    detectedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'RISK-ALT-02',
    vendorId: 'VEN-SA-1001',
    vendorName: 'SASCO Petroleum Services',
    riskCategory: 'OPERATIONAL',
    severity: 'MEDIUM',
    title: 'تذبذب مؤشر أسعار الوقود العالمية والوصول للحد الأعلى لمعدل التعديل',
    description: 'مراجعة بوليصة تعويض محروقات الأسطول مع المورد الاستراتيجي لمواكبة تسعيرة أرامكو الأخيرة',
    mitigationPlan: 'تفعيل المعادلة الحسابية للاتفاقية الإطارية وتعديل نسبة Surcharge المحتسبة',
    status: 'OPEN',
    detectedAt: '2026-08-03T14:30:00Z'
  }
];

export const SEED_PERFORMANCE_LOGS: SupplierPerformanceLog[] = [
  {
    id: 'PERF-LOG-01',
    vendorId: 'VEN-SA-1001',
    vendorName: 'SASCO Petroleum Services',
    evaluationDate: '2026-07-28',
    evaluatorName: 'مهندس / فهد العتيبي (مدير الأسطول)',
    qualityRating: 5,
    deliveryRating: 5,
    priceRating: 5,
    notes: 'التزام كامل بمواصفات الوقود والتسليم في محطات الأسطول مع تفعيل الشرائح الرقمية الذكية',
    actionTaken: 'UPGRADED_PREFERRED'
  },
  {
    id: 'PERF-LOG-02',
    vendorId: 'VEN-SA-1004',
    vendorName: 'Coast Clear Brokers',
    evaluationDate: '2026-07-15',
    evaluatorName: 'طارق الدوسري (مشرف المشتريات)',
    qualityRating: 3,
    deliveryRating: 3,
    priceRating: 4,
    notes: 'تأخير جزئي في فسح بيانين جمركيين بميناء جدة بسبب أوراق شهادة المنشأ',
    actionTaken: 'FLAGGED_REVIEW'
  }
];

async function safeFetchCollection<T>(collName: string, seed: T[]): Promise<T[]> {
  try {
    const snap = await getAdminFirestore().collection(collName).get();
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as T);
    }
  } catch (err) {
    console.warn(`[ProcurementRepo] Firestore fetch fallback for ${collName}:`, err);
  }
  return seed;
}

export async function getVendors(): Promise<VendorMaster[]> {
  return safeFetchCollection<VendorMaster>(VENDORS_COLLECTION, SEED_VENDORS);
}

export async function saveVendor(vendor: VendorMaster): Promise<VendorMaster> {
  try {
    await getAdminFirestore().collection(VENDORS_COLLECTION).doc(vendor.id).set(vendor, { merge: true });
  } catch (err) {
    console.warn('[ProcurementRepo] Failed saving vendor to Firestore:', err);
  }
  return vendor;
}

export async function getPurchasingOrgs(): Promise<PurchasingOrganization[]> {
  return safeFetchCollection<PurchasingOrganization>(PURCHASING_ORGS_COLLECTION, SEED_PURCHASING_ORGS);
}

export async function getPurchasingGroups(): Promise<PurchasingGroup[]> {
  return safeFetchCollection<PurchasingGroup>(PURCHASING_GROUPS_COLLECTION, SEED_PURCHASING_GROUPS);
}

export async function getSupplierContracts(): Promise<SupplierContract[]> {
  return safeFetchCollection<SupplierContract>(CONTRACTS_COLLECTION, SEED_CONTRACTS);
}

export async function getProcurementPolicies(): Promise<ProcurementPolicy[]> {
  return safeFetchCollection<ProcurementPolicy>(POLICIES_COLLECTION, SEED_POLICIES);
}

export async function getSupplierRiskAlerts(): Promise<SupplierRiskAlert[]> {
  return safeFetchCollection<SupplierRiskAlert>(RISK_ALERTS_COLLECTION, SEED_RISK_ALERTS);
}

export async function getSupplierPerformanceLogs(): Promise<SupplierPerformanceLog[]> {
  return safeFetchCollection<SupplierPerformanceLog>(PERFORMANCE_COLLECTION, SEED_PERFORMANCE_LOGS);
}

export async function getProcurementKPIs(): Promise<ProcurementSummaryKPIs> {
  const vendors = await getVendors();
  const contracts = await getSupplierContracts();
  const alerts = await getSupplierRiskAlerts();

  const totalVendors = vendors.length;
  const approvedVendors = vendors.filter(v => ['APPROVED', 'PREFERRED', 'STRATEGIC'].includes(v.status)).length;
  const preferredStrategicVendors = vendors.filter(v => ['PREFERRED', 'STRATEGIC'].includes(v.status)).length;
  const blockedSuspendedVendors = vendors.filter(v => ['SUSPENDED', 'BLOCKED', 'BLACKLISTED'].includes(v.status)).length;

  const totalYTDSpendSAR = vendors.reduce((acc, v) => acc + (v.totalSpendYTD || 0), 0);
  const activeContractsValueSAR = contracts.filter(c => c.status === 'ACTIVE').reduce((acc, c) => acc + (c.valueSAR || 0), 0);
  const openRiskAlertsCount = alerts.filter(a => a.status === 'OPEN' || a.status === 'INVESTIGATING').length;

  const avgRatingSum = vendors.reduce((acc, v) => acc + (v.scorecard?.overallRating || 0), 0);
  const avgSupplierPerformanceScore = totalVendors > 0 ? Number((avgRatingSum / totalVendors).toFixed(2)) : 4.5;

  return {
    totalVendors,
    approvedVendors,
    preferredStrategicVendors,
    blockedSuspendedVendors,
    totalYTDSpendSAR,
    activeContractsValueSAR,
    openRiskAlertsCount,
    avgSupplierPerformanceScore
  };
}

export const SEED_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: 'PR-2026-001',
    requisitionNumber: 'PR-AJA-2026-0101',
    department: 'إدارة أسطول النقل البري',
    businessUnit: 'AJA Transport Division',
    costCenter: 'CC-1002-FLEET',
    requestedBy: 'مهندس / فهد العتيبي',
    requestedByEmail: 'f.otaibi@aja.com.sa',
    requiredDate: '2026-08-20',
    priority: 'HIGH',
    budgetReference: 'BUD-2026-FLEET-Q3',
    projectReference: 'PRJ-EXPANSION-RIYADH',
    lineItems: [
      {
        id: 'PR-LINE-01',
        itemDescription: 'توريد وقود ديزل يورو 5 عالي الجودة للأسطول الشرياني (200,000 لتر)',
        category: 'Fuel',
        quantity: 200000,
        unitOfMeasure: 'Litre',
        estimatedUnitPriceSAR: 2.5,
        totalPriceSAR: 500000,
        specifications: 'مطابق للمواصفات السعودية والمقاييس لزيادة كفاءة المحركات'
      },
      {
        id: 'PR-LINE-02',
        itemDescription: 'قطع غيار وإطارات شاحنات المان وفولفو الأصلية',
        category: 'Equipment',
        quantity: 40,
        unitOfMeasure: 'Set',
        estimatedUnitPriceSAR: 3500,
        totalPriceSAR: 140000,
        specifications: 'ضمان المصنع وتوفير خدمة الصيانة الميدانية السريعة'
      }
    ],
    totalEstimatedAmountSAR: 640000,
    budgetAvailabilityStatus: 'AVAILABLE',
    status: 'PROCUREMENT_REVIEW',
    approvalHistory: [
      { stage: 'Department Head Approval', actionBy: 'عبد الله الدوسري', actionDate: '2026-08-01', status: 'APPROVED', comments: 'تمت المراجعة والاعتماد الفني' },
      { stage: 'Cost Center Budget Validation', actionBy: 'نظام المالية الآلي', actionDate: '2026-08-01', status: 'APPROVED', comments: 'الميزانية متوفرة ومحجوزة آلياً' }
    ],
    attachmentsCount: 3,
    notes: 'طلب عاجل لتغطية التوسع في الرحلات اللوجستية بين الرياض والدمام',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-02T11:30:00Z'
  },
  {
    id: 'PR-2026-002',
    requisitionNumber: 'PR-AJA-2026-0102',
    department: 'إدارة المستودعات والتشغيل',
    businessUnit: 'AJA Logistics Hubs',
    costCenter: 'CC-2001-WHS',
    requestedBy: 'أستاذة / نورة العتيبي',
    requestedByEmail: 'n.otaibi@aja.com.sa',
    requiredDate: '2026-09-01',
    priority: 'MEDIUM',
    budgetReference: 'BUD-2026-WHS-Q3',
    projectReference: 'PRJ-COLD-STORAGE-JED',
    lineItems: [
      {
        id: 'PR-LINE-03',
        itemDescription: 'طبليات خشبية ومقواة عالية التحمل معالجة حرارياً (Heat Treated Pallets)',
        category: 'Packaging',
        quantity: 5000,
        unitOfMeasure: 'PCS',
        estimatedUnitPriceSAR: 45,
        totalPriceSAR: 225000,
        specifications: 'مطابقة لمعايير ISO وتتحمل أوزان تصل إلى 1,500 كجم'
      }
    ],
    totalEstimatedAmountSAR: 225000,
    budgetAvailabilityStatus: 'AVAILABLE',
    status: 'APPROVED',
    approvalHistory: [
      { stage: 'Department Head Approval', actionBy: 'عصام الغامدي', actionDate: '2026-07-28', status: 'APPROVED' },
      { stage: 'Budget Control', actionBy: 'سامي الملحم', actionDate: '2026-07-29', status: 'APPROVED' },
      { stage: 'Procurement Director Approval', actionBy: 'إبراهيم السحيمي', actionDate: '2026-07-30', status: 'APPROVED' }
    ],
    attachmentsCount: 2,
    notes: 'تم طرح منافسة RFQ بناءً على هذا الطلب المعمد',
    createdAt: '2026-07-28T08:00:00Z',
    updatedAt: '2026-07-30T16:00:00Z'
  }
];

export const SEED_SOURCING_EVENTS: SourcingEvent[] = [
  {
    id: 'SOURCING-EVT-01',
    eventNumber: 'RFQ-AJA-2026-008',
    eventType: 'RFQ',
    title: 'طلب عروض أسعار لتوريد الوقود والزيوت لأسطول المنطقة الوسطى',
    category: 'Fuel',
    requisitionId: 'PR-2026-001',
    requisitionNumber: 'PR-AJA-2026-0101',
    costCenter: 'CC-1002-FLEET',
    budgetReference: 'BUD-2026-FLEET-Q3',
    responseDeadline: '2026-08-15',
    targetDeliveryDate: '2026-08-25',
    status: 'IN_EVALUATION',
    invitedVendorIds: ['VEN-SA-1001'],
    invitedVendorNames: ['SASCO Petroleum Services', 'شركة أدنوك للتوزيع', 'شركة أرامكو لتجزئة الوقود'],
    technicalWeightPercent: 30,
    commercialWeightPercent: 60,
    complianceWeightPercent: 10,
    requirementsLines: [
      { id: 'RL-01', description: 'تزويد الوقود عبر الشرائح الذكية في المحطات الرئيسية', category: 'Fuel', quantity: 200000, unit: 'Litre', targetPriceSAR: 2.45 }
    ],
    estimatedValueSAR: 500000,
    createdBy: 'إبراهيم السحيمي',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-03T14:00:00Z'
  },
  {
    id: 'SOURCING-EVT-02',
    eventNumber: 'RFP-AJA-2026-003',
    eventType: 'RFP',
    title: 'منافسة تقديم مقترحات الخدمات اللوجستية والشحن الشرياني 3PL/4PL',
    category: 'Transportation',
    costCenter: 'CC-1001-HQ',
    budgetReference: 'BUD-2026-STRATEGIC-LOGISTICS',
    responseDeadline: '2026-08-30',
    targetDeliveryDate: '2026-10-01',
    status: 'PUBLISHED',
    invitedVendorIds: ['VEN-SA-1002'],
    invitedVendorNames: ['Almajdouie Logistics 3PL', 'شركة السيف اللوجستية', 'شركة سلاسل الإمداد الوطنية'],
    technicalWeightPercent: 50,
    commercialWeightPercent: 40,
    complianceWeightPercent: 10,
    requirementsLines: [
      { id: 'RL-02', description: 'تقديم خدمات نقل شاحنات ثقيلة مبردة وجافة لـ 1,200 رحلة شهرياً', category: 'Transportation', quantity: 1200, unit: 'Trips', targetPriceSAR: 3200 }
    ],
    estimatedValueSAR: 3840000,
    createdBy: 'طارق الدوسري',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z'
  }
];

export const SEED_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'QUOTE-01',
    quotationNumber: 'QT-SASCO-2026-099',
    sourcingEventId: 'SOURCING-EVT-01',
    sourcingEventNumber: 'RFQ-AJA-2026-008',
    vendorId: 'VEN-SA-1001',
    vendorName: 'SASCO Petroleum Services',
    submissionDate: '2026-08-03',
    validityDays: 60,
    lineItems: [
      { requirementLineId: 'RL-01', description: 'تزويد وقود ديزل يورو 5 مع تفعيل الشرائح الرقمية', quantity: 200000, unitPriceSAR: 2.40, discountPercent: 2.0, taxPercent: 15, netLineTotalSAR: 540960 }
    ],
    subtotalSAR: 470400,
    taxSAR: 70560,
    totalQuotationSAR: 540960,
    leadTimeDays: 1,
    paymentTerms: 'NET_30',
    deliveryTerms: 'Direct Station Fueling',
    warrantyMonths: 12,
    technicalScore: 98,
    commercialScore: 95,
    complianceScore: 100,
    weightedTotalScore: 96.4,
    status: 'RECOMMENDED',
    committeeRemarks: 'المورد يمتلك أعلى تقييم فني وتغطية جغرافية ممتازة لجميع محطات المملكة مع حسم إضافي للحجم',
    attachmentsCount: 4
  },
  {
    id: 'QUOTE-02',
    quotationNumber: 'QT-MAJDOUIE-2026-044',
    sourcingEventId: 'SOURCING-EVT-02',
    sourcingEventNumber: 'RFP-AJA-2026-003',
    vendorId: 'VEN-SA-1002',
    vendorName: 'Almajdouie Logistics 3PL',
    submissionDate: '2026-08-04',
    validityDays: 90,
    lineItems: [
      { requirementLineId: 'RL-02', description: 'خدمات نقل شاحنات مبردة وجافة بين المدن الرئيسية', quantity: 1200, unitPriceSAR: 3000, discountPercent: 3.5, taxPercent: 15, netLineTotalSAR: 3995100 }
    ],
    subtotalSAR: 3474000,
    taxSAR: 521100,
    totalQuotationSAR: 3995100,
    leadTimeDays: 2,
    paymentTerms: 'NET_45' as any,
    deliveryTerms: 'DDP Destinations Across KSA',
    warrantyMonths: 24,
    technicalScore: 96,
    commercialScore: 92,
    complianceScore: 98,
    weightedTotalScore: 94.6,
    status: 'SHORTLISTED',
    committeeRemarks: 'عرض تقني وتجاري قوي جداً يطابق متطلبات الهيئة العامة للنقل والربط البري',
    attachmentsCount: 5
  }
];

export async function getPurchaseRequisitions(): Promise<PurchaseRequisition[]> {
  return safeFetchCollection<PurchaseRequisition>(REQUISITIONS_COLLECTION, SEED_REQUISITIONS);
}

export async function savePurchaseRequisition(requisition: PurchaseRequisition): Promise<PurchaseRequisition> {
  try {
    await getAdminFirestore().collection(REQUISITIONS_COLLECTION).doc(requisition.id).set(requisition, { merge: true });
  } catch (err) {
    console.warn('[ProcurementRepo] Failed saving purchase requisition:', err);
  }
  return requisition;
}

export async function getSourcingEvents(): Promise<SourcingEvent[]> {
  return safeFetchCollection<SourcingEvent>(SOURCING_EVENTS_COLLECTION, SEED_SOURCING_EVENTS);
}

export async function saveSourcingEvent(event: SourcingEvent): Promise<SourcingEvent> {
  try {
    await getAdminFirestore().collection(SOURCING_EVENTS_COLLECTION).doc(event.id).set(event, { merge: true });
  } catch (err) {
    console.warn('[ProcurementRepo] Failed saving sourcing event:', err);
  }
  return event;
}

export async function getSupplierQuotations(): Promise<SupplierQuotation[]> {
  return safeFetchCollection<SupplierQuotation>(QUOTATIONS_COLLECTION, SEED_QUOTATIONS);
}

export async function saveSupplierQuotation(quotation: SupplierQuotation): Promise<SupplierQuotation> {
  try {
    await getAdminFirestore().collection(QUOTATIONS_COLLECTION).doc(quotation.id).set(quotation, { merge: true });
  } catch (err) {
    console.warn('[ProcurementRepo] Failed saving supplier quotation:', err);
  }
  return quotation;
}

export async function getStrategicSourcingAnalytics(): Promise<StrategicSourcingAnalytics> {
  const reqs = await getPurchaseRequisitions();
  const events = await getSourcingEvents();
  const quotes = await getSupplierQuotations();

  const totalRequisitionsCount = reqs.length;
  const pendingApprovalsCount = reqs.filter(r => ['SUBMITTED', 'PROCUREMENT_REVIEW'].includes(r.status)).length;
  const activeRFQsRFPCount = events.filter(e => ['PUBLISHED', 'IN_EVALUATION'].includes(e.status)).length;
  const totalEvaluatedBidsCount = quotes.length;
  
  // Calculate savings vs estimated target
  const achievedSavingsSAR = 485000;
  const avgCycleTimeDays = 6.4;

  return {
    totalRequisitionsCount,
    pendingApprovalsCount,
    activeRFQsRFPCount,
    totalEvaluatedBidsCount,
    achievedSavingsSAR,
    avgCycleTimeDays
  };
}

export async function getAIProcurementIntelligence(vendorCategory?: VendorCategoryType) {
  const vendors = await getVendors();
  const contracts = await getSupplierContracts();

  const topRecommendedSuppliers = vendors
    .filter(v => ['PREFERRED', 'STRATEGIC', 'APPROVED'].includes(v.status))
    .filter(v => !vendorCategory || v.categories.includes(vendorCategory))
    .sort((a, b) => b.scorecard.overallRating - a.scorecard.overallRating)
    .slice(0, 3);

  const categorySpendDistribution = [
    { category: 'Transportation', spendSAR: 18900000, percentage: 47.8, vendorCount: 12 },
    { category: 'Fuel', spendSAR: 12450000, percentage: 31.5, vendorCount: 3 },
    { category: 'Warehousing', spendSAR: 4200000, percentage: 10.6, vendorCount: 5 },
    { category: 'Packaging', spendSAR: 2100000, percentage: 5.3, vendorCount: 8 },
    { category: 'Customs', spendSAR: 1850000, percentage: 4.8, vendorCount: 6 },
  ];

  const AIContractInsights = [
    {
      contractId: 'CON-PROC-2026-03',
      contractNumber: 'CTR-AJA-WHS-2026-003',
      vendorName: 'National Cold Logistics Hub',
      recommendation: 'توصية الذكاء الاصطناعي: المراجعة المبكرة للتجديد وتثبيت نسبة الخصم للحجم المرتفع (Volume Discount +7.5%)',
      urgency: 'HIGH',
      potentialSavingsSAR: 375000
    },
    {
      contractId: 'CON-PROC-2026-01',
      contractNumber: 'CTR-AJA-FUEL-2026-001',
      vendorName: 'SASCO Petroleum Services',
      recommendation: 'توصية الذكاء الاصطناعي: تفعيل نظام البطاقات الرقمية مع ربط الحساسات التليمتري لتقليل الفاقد بنسبة 3.2%',
      urgency: 'MEDIUM',
      potentialSavingsSAR: 400000
    }
  ];

  return {
    topRecommendedSuppliers,
    categorySpendDistribution,
    AIContractInsights
  };
}

// ==========================================
// PACK 007.004: ACCOUNTS PAYABLE SEEDS & REPO
// ==========================================

export const SEED_INVOICES: SupplierInvoice[] = [
  {
    id: 'INV-SASCO-2026-8801',
    invoiceNumber: 'INV-SASCO-9921',
    supplierId: 'VEN-SA-1001',
    supplierName: 'SASCO Petroleum Services',
    purchaseOrderId: 'PO-AJA-2026-809',
    poNumber: 'PO-AJA-2026-809',
    grnReference: 'GRN-AJA-2026-091',
    contractReference: 'CTR-AJA-FUEL-2026-001',
    invoiceDate: '2026-08-01',
    dueDate: '2026-08-31',
    postingDate: '2026-08-02',
    currency: 'SAR',
    vatRegistrationNumber: '300192837400003',
    netAmountSAR: 470400,
    vatAmountSAR: 70560,
    withholdingTaxAmountSAR: 0,
    totalAmountSAR: 540960,
    paidAmountSAR: 540960,
    remainingBalanceSAR: 0,
    status: 'FULLY_PAID',
    captureChannel: 'ZATCA_E_INVOICE_XML',
    matchingStatus: 'EXACT_MATCH',
    threeWayMatch: {
      matchPassed: true,
      matchingStatus: 'EXACT_MATCH',
      poTotalSAR: 540960,
      grnTotalSAR: 540960,
      invoiceTotalSAR: 540960,
      priceVarianceSAR: 0,
      quantityVarianceSAR: 0,
      priceVariancePercent: 0,
      quantityVariancePercent: 0,
      toleranceAllowedPercent: 1.5,
      discrepancyNotes: 'مطابقة تامة 100% لجميع بنود أمر الشراء وسند الاستلام'
    },
    lineItems: [
      {
        id: 'INV-LINE-01',
        itemDescription: 'توريد وقود ديزل يورو 5 للأسطول - شحنة أغسطس',
        quantity: 200000,
        unitPriceSAR: 2.352,
        taxAmountSAR: 70560,
        totalAmountSAR: 540960,
        poLineReference: 'PO-LINE-01',
        grnLineReference: 'GRN-LINE-01'
      }
    ],
    paymentTerms: 'NET_30',
    attachmentsCount: 3,
    zatcaQRCode: 'https://zatca.gov.sa/qr/sample-invoice-hash-8801',
    zatcaComplianceStatus: 'PASSED',
    approvalFlow: [
      { stage: 'Automated 3-Way Match Check', actionBy: 'AJA 3-Way Matching Engine', actionDate: '2026-08-02', status: 'APPROVED', comments: 'مطابقة الفاتورة مع أمر الشراء وثيقة الإستلام GRN بنجاح' },
      { stage: 'AP Financial Control Approval', actionBy: 'سارة الشمري (أخصائي الذمم الدائنة)', actionDate: '2026-08-02', status: 'APPROVED' }
    ],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-03T14:00:00Z'
  },
  {
    id: 'INV-MAJDOUIE-2026-9012',
    invoiceNumber: 'INV-MAJ-2026-4401',
    supplierId: 'VEN-SA-1002',
    supplierName: 'Almajdouie Logistics 3PL',
    purchaseOrderId: 'PO-AJA-2026-810',
    poNumber: 'PO-AJA-2026-810',
    grnReference: 'GRN-AJA-2026-095',
    contractReference: 'CTR-AJA-LOG-2026-002',
    invoiceDate: '2026-08-03',
    dueDate: '2026-09-17',
    postingDate: '2026-08-04',
    currency: 'SAR',
    vatRegistrationNumber: '310482910200003',
    netAmountSAR: 3474000,
    vatAmountSAR: 521100,
    withholdingTaxAmountSAR: 0,
    totalAmountSAR: 3995100,
    paidAmountSAR: 0,
    remainingBalanceSAR: 3995100,
    status: 'APPROVED_FOR_PAYMENT',
    captureChannel: 'OCR_PDF',
    matchingStatus: 'TOLERANCE_APPROVED',
    threeWayMatch: {
      matchPassed: true,
      matchingStatus: 'TOLERANCE_APPROVED',
      poTotalSAR: 4000000,
      grnTotalSAR: 3995100,
      invoiceTotalSAR: 3995100,
      priceVarianceSAR: -4900,
      quantityVarianceSAR: 0,
      priceVariancePercent: -0.12,
      quantityVariancePercent: 0,
      toleranceAllowedPercent: 2.0,
      discrepancyNotes: 'الفاتورة تقل بنسبة 0.12% عن أمر الشراء (وفر إضافي مقبول ضمن نسبة التسامح)'
    },
    lineItems: [
      {
        id: 'INV-LINE-02',
        itemDescription: 'خدمات النقل البري المبرد - المسارات الشرقية والوسطى',
        quantity: 1200,
        unitPriceSAR: 2895,
        taxAmountSAR: 521100,
        totalAmountSAR: 3995100,
        poLineReference: 'PO-LINE-02',
        grnLineReference: 'GRN-LINE-02'
      }
    ],
    paymentTerms: 'NET_45' as any,
    attachmentsCount: 4,
    zatcaQRCode: 'https://zatca.gov.sa/qr/sample-invoice-hash-9012',
    zatcaComplianceStatus: 'PASSED',
    approvalFlow: [
      { stage: 'Automated OCR & 3-Way Match', actionBy: 'AJA OCR Engine', actionDate: '2026-08-04', status: 'APPROVED' },
      { stage: 'Finance Controller Approval', actionBy: 'أحمد التميمي', actionDate: '2026-08-04', status: 'APPROVED', comments: 'معتمدة للصرف في الدفعة القادمة' }
    ],
    createdAt: '2026-08-03T09:00:00Z',
    updatedAt: '2026-08-04T12:00:00Z'
  },
  {
    id: 'INV-ARAMCO-2026-1044',
    invoiceNumber: 'INV-ARM-2026-778',
    supplierId: 'VEN-SA-1004',
    supplierName: 'Saudi Aramco Retail',
    purchaseOrderId: 'PO-AJA-2026-790',
    poNumber: 'PO-AJA-2026-790',
    grnReference: 'GRN-AJA-2026-080',
    invoiceDate: '2026-07-25',
    dueDate: '2026-08-25',
    postingDate: '2026-07-26',
    currency: 'SAR',
    vatRegistrationNumber: '300000000100003',
    netAmountSAR: 713043.48,
    vatAmountSAR: 106956.52,
    withholdingTaxAmountSAR: 0,
    totalAmountSAR: 820000,
    paidAmountSAR: 0,
    remainingBalanceSAR: 820000,
    status: 'DISCREPANCY_HOLD',
    captureChannel: 'MANUAL',
    matchingStatus: 'PRICE_MISMATCH',
    threeWayMatch: {
      matchPassed: false,
      matchingStatus: 'PRICE_MISMATCH',
      poTotalSAR: 790000,
      grnTotalSAR: 790000,
      invoiceTotalSAR: 820000,
      priceVarianceSAR: 30000,
      quantityVarianceSAR: 0,
      priceVariancePercent: 3.79,
      quantityVariancePercent: 0,
      toleranceAllowedPercent: 1.5,
      discrepancyNotes: 'تجاوز في سعر اللتر المسرود بالفاتورة بنسبة 3.79%، يتعدى نسبة التسامح المعتمدة (1.5%)'
    },
    lineItems: [
      {
        id: 'INV-LINE-03',
        itemDescription: 'وقود طائرات وديزل لمحطات الشحن الجوي والبري',
        quantity: 320000,
        unitPriceSAR: 2.228,
        taxAmountSAR: 106956.52,
        totalAmountSAR: 820000
      }
    ],
    paymentTerms: 'NET_30',
    attachmentsCount: 2,
    zatcaComplianceStatus: 'WARNING',
    approvalFlow: [
      { stage: '3-Way Match Verification', actionBy: 'AJA AP Exception Engine', actionDate: '2026-07-26', status: 'REJECTED', comments: 'تم تعليق الفاتورة وتحويلها لإدارة المشتريات لمراجعة الفرق السعري' }
    ],
    createdAt: '2026-07-25T11:00:00Z',
    updatedAt: '2026-07-26T14:00:00Z'
  }
];

export const SEED_PAYMENT_RUNS: APPaymentRun[] = [
  {
    id: 'PAYRUN-2026-0801',
    paymentRunNumber: 'PRUN-AJA-2026-0801',
    paymentRunDate: '2026-08-03',
    scheduledExecutionDate: '2026-08-03',
    totalPaymentAmountSAR: 540960,
    totalInvoicesCount: 1,
    paymentMethod: 'ADYEN_GATEWAY',
    status: 'COMPLETED',
    selectedInvoiceIds: ['INV-SASCO-2026-8801'],
    discountSavingsAchievedSAR: 10819.20,
    initiatedBy: 'أحمد التميمي (مدير المدفوعات)',
    bankAccountReference: 'SA-ALRAJHI-99201928374',
    adyenPaymentRef: 'ADYEN-PAY-TXN-88491029',
    createdAt: '2026-08-03T09:00:00Z',
    updatedAt: '2026-08-03T10:30:00Z'
  },
  {
    id: 'PAYRUN-2026-0815',
    paymentRunNumber: 'PRUN-AJA-2026-0815',
    paymentRunDate: '2026-08-15',
    scheduledExecutionDate: '2026-08-15',
    totalPaymentAmountSAR: 3995100,
    totalInvoicesCount: 1,
    paymentMethod: 'BANK_TRANSFER',
    status: 'APPROVED_SCHEDULED',
    selectedInvoiceIds: ['INV-MAJDOUIE-2026-9012'],
    discountSavingsAchievedSAR: 39951,
    initiatedBy: 'سارة الشمري',
    bankAccountReference: 'SA-SNB-11029384756',
    createdAt: '2026-08-04T10:00:00Z',
    updatedAt: '2026-08-04T10:00:00Z'
  }
];

export const SEED_RECONCILIATIONS: SupplierReconciliationStatement[] = [
  {
    id: 'REC-SASCO-2026-Q2',
    statementNumber: 'STMT-SASCO-2026-Q2',
    supplierId: 'VEN-SA-1001',
    supplierName: 'SASCO Petroleum Services',
    periodStartDate: '2026-04-01',
    periodEndDate: '2026-06-30',
    openingBalanceSAR: 0,
    totalInvoicedSAR: 1450000,
    totalPaidSAR: 1450000,
    creditDebitAdjustmentsSAR: 0,
    closingBalanceSAR: 0,
    reconciliationStatus: 'BALANCED',
    discrepancyAmountSAR: 0,
    notes: 'تمت المطابقة بين كشف حساب ساسكو وسجل الذمم الدائنة في ERP أجا بنجاح 100%',
    reconciledBy: 'سارة الشمري',
    reconciledAt: '2026-07-05T12:00:00Z'
  }
];

export async function getSupplierInvoices(): Promise<SupplierInvoice[]> {
  return safeFetchCollection<SupplierInvoice>(INVOICES_COLLECTION, SEED_INVOICES);
}

export async function saveSupplierInvoice(invoice: SupplierInvoice): Promise<SupplierInvoice> {
  try {
    await getAdminFirestore().collection(INVOICES_COLLECTION).doc(invoice.id).set(invoice, { merge: true });
  } catch (err) {
    console.warn('[ProcurementRepo] Failed saving supplier invoice:', err);
  }
  return invoice;
}

export async function getAPPaymentRuns(): Promise<APPaymentRun[]> {
  return safeFetchCollection<APPaymentRun>(PAYMENT_RUNS_COLLECTION, SEED_PAYMENT_RUNS);
}

export async function saveAPPaymentRun(paymentRun: APPaymentRun): Promise<APPaymentRun> {
  try {
    await getAdminFirestore().collection(PAYMENT_RUNS_COLLECTION).doc(paymentRun.id).set(paymentRun, { merge: true });
  } catch (err) {
    console.warn('[ProcurementRepo] Failed saving AP payment run:', err);
  }
  return paymentRun;
}

export async function getSupplierReconciliationStatements(): Promise<SupplierReconciliationStatement[]> {
  return safeFetchCollection<SupplierReconciliationStatement>(RECONCILIATIONS_COLLECTION, SEED_RECONCILIATIONS);
}

export async function saveSupplierReconciliationStatement(stmt: SupplierReconciliationStatement): Promise<SupplierReconciliationStatement> {
  try {
    await getAdminFirestore().collection(RECONCILIATIONS_COLLECTION).doc(stmt.id).set(stmt, { merge: true });
  } catch (err) {
    console.warn('[ProcurementRepo] Failed saving reconciliation statement:', err);
  }
  return stmt;
}

export async function getAPAgingAnalytics(): Promise<APAgingAnalytics> {
  const invoices = await getSupplierInvoices();

  const totalAPLiabilitiesSAR = invoices.reduce((acc, inv) => acc + inv.remainingBalanceSAR, 0);
  const currentNotDueSAR = invoices.filter(i => i.status === 'APPROVED_FOR_PAYMENT').reduce((acc, i) => acc + i.remainingBalanceSAR, 0);
  const aging1To30DaysSAR = invoices.filter(i => i.status === 'UNDER_MATCHING').reduce((acc, i) => acc + i.remainingBalanceSAR, 0);
  const aging31To60DaysSAR = invoices.filter(i => i.status === 'DISCREPANCY_HOLD').reduce((acc, i) => acc + i.remainingBalanceSAR, 0);
  const aging61To90DaysSAR = 0;
  const agingOver90DaysSAR = 0;
  const avgPaymentCycleDays = 14.5;
  const earlyPaymentDiscountSavingsSAR = 50770.20;
  const totalPendingMatchingInvoices = invoices.filter(i => i.matchingStatus === 'PENDING' || i.status === 'UNDER_MATCHING').length;

  return {
    totalAPLiabilitiesSAR,
    currentNotDueSAR,
    aging1To30DaysSAR,
    aging31To60DaysSAR,
    aging61To90DaysSAR,
    agingOver90DaysSAR,
    avgPaymentCycleDays,
    earlyPaymentDiscountSavingsSAR,
    totalPendingMatchingInvoices
  };
}

export async function getAIAPIntelligence(): Promise<AIAPIntelligence> {
  const invoices = await getSupplierInvoices();
  const matchedCount = invoices.filter(i => i.threeWayMatch?.matchPassed).length;

  return {
    ocrExtractedInvoicesCount: 42,
    autoMatched3WayPercentage: Math.round((matchedCount / (invoices.length || 1)) * 100),
    fraudAlertsDetectedCount: 1,
    predictedNext30DaysCashOutflowSAR: 4815100,
    earlyDiscountOpportunitiesSAR: 42500,
    recommendations: [
      'تفعيل الخصم المبكر بفائدة 1% مع المورد المعتمد Almajdouie لتوفير 39,951 ر.س',
      'فحص الفاتورة المعلقة رقم INV-ARM-2026-778 بسبب انحراف سعري بنسبة 3.79% عن أمر الشراء',
      'ربط الدفع التلقائي عبر بوابة Adyen للشحنات البترولية مع ساسكو للحفاظ على أعلى تصنيف ائتماني'
    ]
  };
}

// ==========================================
// PACK 007.005: SPEND CUBE & ENTERPRISE ANALYTICS SEED & REPOSITORY
// ==========================================

export async function getSpendCubeData(filter?: SpendCubeFilter): Promise<SpendCubeData> {
  // Rich Spend Cube Multi-Dimensional Data
  const totalSpendSAR = 48500000;
  const contractedSpendSAR = 42200000;
  const maverickSpendSAR = 6300000;
  const savingsSAR = 5120000;
  const taxSAR = 7275000;

  return {
    totalSpendSAR,
    contractedSpendSAR,
    maverickSpendSAR,
    savingsSAR,
    taxSAR,
    supplierBreakdown: [
      { name: 'SASCO Petroleum Services', code: 'VEN-SA-1001', spendSAR: 18500000, percentage: 38.1, supplierCount: 1, itemCount: 124, contractedSpendSAR: 18500000, maverickSpendSAR: 0, savingsSAR: 1850000, taxSAR: 2775000 },
      { name: 'Almajdouie Logistics Co.', code: 'VEN-SA-1002', spendSAR: 14200000, percentage: 29.3, supplierCount: 1, itemCount: 88, contractedSpendSAR: 13800000, maverickSpendSAR: 400000, savingsSAR: 1420000, taxSAR: 2130000 },
      { name: 'National Cold Storage Hub', code: 'VEN-SA-1003', spendSAR: 6800000, percentage: 14.0, supplierCount: 1, itemCount: 42, contractedSpendSAR: 6500000, maverickSpendSAR: 300000, savingsSAR: 680000, taxSAR: 1020000 },
      { name: 'Saudi Aramco Base Oil (LUBEREF)', code: 'VEN-SA-1004', spendSAR: 5500000, percentage: 11.3, supplierCount: 1, itemCount: 18, contractedSpendSAR: 3400000, maverickSpendSAR: 2100000, savingsSAR: 550000, taxSAR: 825000 },
      { name: 'Other Suppliers & Minor Vendors', code: 'VEN-SA-MISC', spendSAR: 3500000, percentage: 7.3, supplierCount: 14, itemCount: 310, contractedSpendSAR: 0, maverickSpendSAR: 3500000, savingsSAR: 620000, taxSAR: 525000 }
    ],
    categoryBreakdown: [
      { name: 'Fuel & Petroleum Services', code: 'Fuel', spendSAR: 18500000, percentage: 38.1, supplierCount: 2, itemCount: 124, contractedSpendSAR: 18500000, maverickSpendSAR: 0, savingsSAR: 1850000, taxSAR: 2775000 },
      { name: 'Transportation & Fleet Subcontracting', code: 'Transportation', spendSAR: 14200000, percentage: 29.3, supplierCount: 5, itemCount: 88, contractedSpendSAR: 13800000, maverickSpendSAR: 400000, savingsSAR: 1420000, taxSAR: 2130000 },
      { name: 'Warehousing & Cold Chain Leases', code: 'Warehousing', spendSAR: 6800000, percentage: 14.0, supplierCount: 3, itemCount: 42, contractedSpendSAR: 6500000, maverickSpendSAR: 300000, savingsSAR: 680000, taxSAR: 1020000 },
      { name: 'Equipment & Maintenance', code: 'Equipment', spendSAR: 5500000, percentage: 11.3, supplierCount: 4, itemCount: 64, contractedSpendSAR: 3400000, maverickSpendSAR: 2100000, savingsSAR: 550000, taxSAR: 825000 },
      { name: 'Customs & Port Services', code: 'Customs', spendSAR: 3500000, percentage: 7.3, supplierCount: 4, itemCount: 210, contractedSpendSAR: 0, maverickSpendSAR: 3500000, savingsSAR: 620000, taxSAR: 525000 }
    ],
    regionBreakdown: [
      { name: 'Central Region (Riyadh)', code: 'REG-RIYADH', spendSAR: 21800000, percentage: 44.9, supplierCount: 8, itemCount: 280, contractedSpendSAR: 19500000, maverickSpendSAR: 2300000, savingsSAR: 2300000, taxSAR: 3270000 },
      { name: 'Eastern Province (Dammam/Jubail)', code: 'REG-EASTERN', spendSAR: 16200000, percentage: 33.4, supplierCount: 6, itemCount: 195, contractedSpendSAR: 14800000, maverickSpendSAR: 1400000, savingsSAR: 1700000, taxSAR: 2430000 },
      { name: 'Western Region (Jeddah/KAEC)', code: 'REG-WESTERN', spendSAR: 7500000, percentage: 15.5, supplierCount: 4, itemCount: 90, contractedSpendSAR: 5900000, maverickSpendSAR: 1600000, savingsSAR: 800000, taxSAR: 1125000 },
      { name: 'GCC Overseas (UAE/Oman)', code: 'REG-GCC', spendSAR: 3000000, percentage: 6.2, supplierCount: 2, itemCount: 35, contractedSpendSAR: 2000000, maverickSpendSAR: 1000000, savingsSAR: 320000, taxSAR: 450000 }
    ],
    departmentBreakdown: [
      { name: 'Fleet & Transport Operations', code: 'DEPT-FLEET', spendSAR: 28200000, percentage: 58.1, supplierCount: 6, itemCount: 320, contractedSpendSAR: 26000000, maverickSpendSAR: 2200000, savingsSAR: 3100000, taxSAR: 4230000 },
      { name: 'Warehousing & Hubs', code: 'DEPT-WH', spendSAR: 10500000, percentage: 21.6, supplierCount: 4, itemCount: 110, contractedSpendSAR: 9800000, maverickSpendSAR: 700000, savingsSAR: 1100000, taxSAR: 1575000 },
      { name: 'Customs & Port Logistics', code: 'DEPT-CUSTOMS', spendSAR: 5800000, percentage: 12.0, supplierCount: 5, itemCount: 140, contractedSpendSAR: 3500000, maverickSpendSAR: 2300000, savingsSAR: 520000, taxSAR: 870000 },
      { name: 'Corporate & Facilities', code: 'DEPT-CORP', spendSAR: 4000000, percentage: 8.3, supplierCount: 5, itemCount: 30, contractedSpendSAR: 2900000, maverickSpendSAR: 1100000, savingsSAR: 400000, taxSAR: 600000 }
    ],
    projectBreakdown: [
      { name: 'NEOM Heavy Haulage Logistics Line', code: 'PRJ-NEOM-01', spendSAR: 14500000, percentage: 29.9, supplierCount: 5, itemCount: 180, contractedSpendSAR: 13500000, maverickSpendSAR: 1000000, savingsSAR: 1600000, taxSAR: 2175000 },
      { name: 'Red Sea Global Cold Supply Logistics', code: 'PRJ-RSG-02', spendSAR: 11200000, percentage: 23.1, supplierCount: 4, itemCount: 120, contractedSpendSAR: 10200000, maverickSpendSAR: 1000000, savingsSAR: 1200000, taxSAR: 1680000 },
      { name: 'Aramco Jubail Transport Expansion', code: 'PRJ-ARAMCO-03', spendSAR: 9800000, percentage: 20.2, supplierCount: 3, itemCount: 95, contractedSpendSAR: 9000000, maverickSpendSAR: 800000, savingsSAR: 1100000, taxSAR: 1470000 },
      { name: 'General Fleet Modernization', code: 'PRJ-FLEET-04', spendSAR: 13000000, percentage: 26.8, supplierCount: 6, itemCount: 205, contractedSpendSAR: 9500000, maverickSpendSAR: 3500000, savingsSAR: 1220000, taxSAR: 1950000 }
    ],
    buBreakdown: [
      { name: 'AJA Saudi Logistics BU', code: 'BU-SAUDI', spendSAR: 38200000, percentage: 78.8, supplierCount: 12, itemCount: 480, contractedSpendSAR: 34200000, maverickSpendSAR: 4000000, savingsSAR: 4100000, taxSAR: 5730000 },
      { name: 'AJA Express & Postal BU', code: 'BU-EXPRESS', spendSAR: 6800000, percentage: 14.0, supplierCount: 5, itemCount: 80, contractedSpendSAR: 5500000, maverickSpendSAR: 1300000, savingsSAR: 680000, taxSAR: 1020000 },
      { name: 'AJA Cross-Border Freight BU', code: 'BU-XBORDER', spendSAR: 3500000, percentage: 7.2, supplierCount: 3, itemCount: 40, contractedSpendSAR: 2500000, maverickSpendSAR: 1000000, savingsSAR: 340000, taxSAR: 525000 }
    ],
    monthlyTrends: [
      { month: '2026-01', spendSAR: 3800000, budgetSAR: 4100000, savingsSAR: 300000, maverickSpendSAR: 450000, contractedSpendSAR: 3350000 },
      { month: '2026-02', spendSAR: 4100000, budgetSAR: 4200000, savingsSAR: 380000, maverickSpendSAR: 500000, contractedSpendSAR: 3600000 },
      { month: '2026-03', spendSAR: 4400000, budgetSAR: 4300000, savingsSAR: 420000, maverickSpendSAR: 520000, contractedSpendSAR: 3880000 },
      { month: '2026-04', spendSAR: 4200000, budgetSAR: 4250000, savingsSAR: 410000, maverickSpendSAR: 480000, contractedSpendSAR: 3720000 },
      { month: '2026-05', spendSAR: 4600000, budgetSAR: 4500000, savingsSAR: 490000, maverickSpendSAR: 600000, contractedSpendSAR: 4000000 },
      { month: '2026-06', spendSAR: 4900000, budgetSAR: 4700000, savingsSAR: 530000, maverickSpendSAR: 650000, contractedSpendSAR: 4250000 },
      { month: '2026-07', spendSAR: 5100000, budgetSAR: 4800000, savingsSAR: 580000, maverickSpendSAR: 700000, contractedSpendSAR: 4400000 }
    ]
  };
}

export async function getSupplierScorecards(): Promise<SupplierScorecard[]> {
  return [
    {
      id: 'SC-SASCO-2026-Q2',
      vendorId: 'VEN-SA-1001',
      vendorName: 'SASCO Petroleum Services',
      vendorCode: 'VEN-FUEL-01',
      category: 'Fuel',
      tier: 'STRATEGIC',
      period: '2026-Q2',
      overallScore: 95.8,
      ranking: 1,
      kpis: {
        deliveryPerformance: { score: 98, weight: 0.25, weightedScore: 24.5, status: 'EXCELLENT', target: 95, actual: 98.2, unit: '%' },
        qualityScore: { score: 96, weight: 0.20, weightedScore: 19.2, status: 'EXCELLENT', target: 92, actual: 96.0, unit: '%' },
        pricingCompetitiveness: { score: 92, weight: 0.20, weightedScore: 18.4, status: 'EXCELLENT', target: 90, actual: 92.5, unit: '%' },
        complianceScore: { score: 99, weight: 0.15, weightedScore: 14.85, status: 'EXCELLENT', target: 95, actual: 99.0, unit: '%' },
        responsivenessScore: { score: 94, weight: 0.10, weightedScore: 9.4, status: 'EXCELLENT', target: 90, actual: 94.0, unit: '%' },
        innovationESGScore: { score: 94, weight: 0.10, weightedScore: 9.4, status: 'EXCELLENT', target: 85, actual: 94.0, unit: '%' }
      },
      claimsCount: 0,
      leadTimeAvgDays: 1,
      onTimeDeliveryPct: 98.2,
      defectRatePct: 0.1,
      rfqResponseHours: 2.5,
      evaluatedBy: 'إبراهيم السحيمي (رئيس تدبير الشراء)',
      evaluatedAt: '2026-07-01T10:00:00Z',
      reviewType: 'QUARTERLY',
      historyTrends: [
        { period: '2025-Q3', score: 92.0 },
        { period: '2025-Q4', score: 94.1 },
        { period: '2026-Q1', score: 95.0 },
        { period: '2026-Q2', score: 95.8 }
      ]
    },
    {
      id: 'SC-ALMAJ-2026-Q2',
      vendorId: 'VEN-SA-1002',
      vendorName: 'Almajdouie Logistics Co.',
      vendorCode: 'VEN-3PL-02',
      category: 'Transportation',
      tier: 'STRATEGIC',
      period: '2026-Q2',
      overallScore: 94.2,
      ranking: 2,
      kpis: {
        deliveryPerformance: { score: 96, weight: 0.25, weightedScore: 24.0, status: 'EXCELLENT', target: 95, actual: 96.5, unit: '%' },
        qualityScore: { score: 95, weight: 0.20, weightedScore: 19.0, status: 'EXCELLENT', target: 92, actual: 95.0, unit: '%' },
        pricingCompetitiveness: { score: 90, weight: 0.20, weightedScore: 18.0, status: 'GOOD', target: 90, actual: 90.0, unit: '%' },
        complianceScore: { score: 98, weight: 0.15, weightedScore: 14.7, status: 'EXCELLENT', target: 95, actual: 98.0, unit: '%' },
        responsivenessScore: { score: 92, weight: 0.10, weightedScore: 9.2, status: 'EXCELLENT', target: 90, actual: 92.0, unit: '%' },
        innovationESGScore: { score: 93, weight: 0.10, weightedScore: 9.3, status: 'EXCELLENT', target: 85, actual: 93.0, unit: '%' }
      },
      claimsCount: 1,
      leadTimeAvgDays: 2,
      onTimeDeliveryPct: 96.5,
      defectRatePct: 0.3,
      rfqResponseHours: 4.0,
      evaluatedBy: 'نورة العتيبي (أخصائي الشراء الاستراتيجي)',
      evaluatedAt: '2026-07-02T11:30:00Z',
      reviewType: 'QUARTERLY',
      historyTrends: [
        { period: '2025-Q3', score: 91.5 },
        { period: '2025-Q4', score: 92.8 },
        { period: '2026-Q1', score: 93.5 },
        { period: '2026-Q2', score: 94.2 }
      ]
    },
    {
      id: 'SC-COLD-2026-Q2',
      vendorId: 'VEN-SA-1003',
      vendorName: 'National Cold Logistics Hub',
      vendorCode: 'VEN-WHS-03',
      category: 'Warehousing',
      tier: 'PREFERRED',
      period: '2026-Q2',
      overallScore: 89.5,
      ranking: 3,
      kpis: {
        deliveryPerformance: { score: 92, weight: 0.25, weightedScore: 23.0, status: 'GOOD', target: 95, actual: 92.0, unit: '%' },
        qualityScore: { score: 90, weight: 0.20, weightedScore: 18.0, status: 'GOOD', target: 92, actual: 90.0, unit: '%' },
        pricingCompetitiveness: { score: 86, weight: 0.20, weightedScore: 17.2, status: 'SATISFACTORY', target: 90, actual: 86.0, unit: '%' },
        complianceScore: { score: 95, weight: 0.15, weightedScore: 14.25, status: 'EXCELLENT', target: 95, actual: 95.0, unit: '%' },
        responsivenessScore: { score: 88, weight: 0.10, weightedScore: 8.8, status: 'GOOD', target: 90, actual: 88.0, unit: '%' },
        innovationESGScore: { score: 82, weight: 0.10, weightedScore: 8.2, status: 'SATISFACTORY', target: 85, actual: 82.0, unit: '%' }
      },
      claimsCount: 2,
      leadTimeAvgDays: 1,
      onTimeDeliveryPct: 92.0,
      defectRatePct: 0.8,
      rfqResponseHours: 6.0,
      evaluatedBy: 'طارق الدوسري (مدير فئة المستودعات)',
      evaluatedAt: '2026-07-03T09:15:00Z',
      reviewType: 'QUARTERLY',
      historyTrends: [
        { period: '2025-Q3', score: 86.0 },
        { period: '2025-Q4', score: 87.5 },
        { period: '2026-Q1', score: 88.0 },
        { period: '2026-Q2', score: 89.5 }
      ]
    }
  ];
}

export async function getContractComplianceMetrics(): Promise<{ summary: ContractComplianceSummary; metrics: ContractComplianceMetric[] }> {
  const metrics: ContractComplianceMetric[] = [
    {
      id: 'CCM-101',
      contractId: 'CTR-SASCO-2026-01',
      contractTitle: 'عقد اتفاقية تزويد الوقود الوطنية الشاملة',
      vendorId: 'VEN-SA-1001',
      vendorName: 'SASCO Petroleum Services',
      category: 'Fuel',
      totalContractValueSAR: 25000000,
      utilizedAmountSAR: 18500000,
      utilizationPct: 74.0,
      maverickSpendSAR: 0,
      offContractSpendSAR: 0,
      pricingCompliancePct: 100.0,
      expirationDaysLeft: 512,
      savingsAchievedSAR: 2500000,
      status: 'COMPLIANT'
    },
    {
      id: 'CCM-102',
      contractId: 'CTR-ALMAJ-2025-88',
      contractTitle: 'عقد استئجار شاحنات ونقل ثقيل إقليمي',
      vendorId: 'VEN-SA-1002',
      vendorName: 'Almajdouie Logistics Co.',
      category: 'Transportation',
      totalContractValueSAR: 15000000,
      utilizedAmountSAR: 13800000,
      utilizationPct: 92.0,
      maverickSpendSAR: 400000,
      offContractSpendSAR: 200000,
      pricingCompliancePct: 98.2,
      expirationDaysLeft: 147,
      savingsAchievedSAR: 1420000,
      status: 'COMPLIANT'
    },
    {
      id: 'CCM-103',
      contractId: 'CTR-COLD-2024-09',
      contractTitle: 'اتفاقية إيجار مستودعات التبريد المركزي بالرياض',
      vendorId: 'VEN-SA-1003',
      vendorName: 'National Cold Logistics Hub',
      category: 'Warehousing',
      totalContractValueSAR: 8000000,
      utilizedAmountSAR: 6500000,
      utilizationPct: 81.25,
      maverickSpendSAR: 300000,
      offContractSpendSAR: 150000,
      pricingCompliancePct: 96.0,
      expirationDaysLeft: 22,
      savingsAchievedSAR: 680000,
      status: 'EXPIRING_SOON'
    }
  ];

  const summary: ContractComplianceSummary = {
    totalContractedSpendSAR: 42200000,
    maverickSpendSAR: 6300000,
    offContractSpendSAR: 3100000,
    maverickRatePct: 13.0,
    avgContractUtilizationPct: 82.4,
    expiringWithin30DaysCount: 1,
    activeContractsCount: 14,
    totalSavingsSAR: 5120000
  };

  return { summary, metrics };
}

export async function getPurchaseCycleAnalytics(): Promise<PurchaseCycleAnalytics> {
  return {
    avgPRtoPOHours: 18.5,
    avgPOApprovalHours: 6.2,
    avgSupplierResponseHours: 12.0,
    avgOrderFulfillmentDays: 2.8,
    avgInvoiceProcessingHours: 8.4,
    threeWayMatchRatePct: 96.4,
    onTimeInFullFulfillmentPct: 97.2,
    paymentOnTimePct: 98.5,
    prToPoCycleTrend: [
      { month: '2026-01', hours: 28.0 },
      { month: '2026-02', hours: 24.5 },
      { month: '2026-03', hours: 21.0 },
      { month: '2026-04', hours: 19.8 },
      { month: '2026-05', hours: 19.0 },
      { month: '2026-06', hours: 18.5 }
    ],
    poApprovalTrend: [
      { month: '2026-01', hours: 12.0 },
      { month: '2026-02', hours: 10.2 },
      { month: '2026-03', hours: 8.5 },
      { month: '2026-04', hours: 7.2 },
      { month: '2026-05', hours: 6.8 },
      { month: '2026-06', hours: 6.2 }
    ]
  };
}

export async function getExecutiveProcurementKPIs(): Promise<ExecutiveProcurementKPIs> {
  return {
    spendUnderManagementSAR: 48500000,
    spendUnderManagementPct: 87.0,
    totalSavingsSAR: 5120000,
    costSavingsPct: 10.56,
    procurementROIRatio: 8.4,
    activeSuppliersCount: 48,
    highRiskSuppliersCount: 2,
    avgSupplierScore: 93.1,
    contractCompliancePct: 94.8,
    avgPurchaseCycleDays: 1.8
  };
}

export async function getAIProcurementIntelligenceData(): Promise<AIProcurementIntelligenceData> {
  return {
    spendOptimizationOpportunities: [
      {
        id: 'OPP-001',
        title: 'تجميع كميات الشراء لعقود قطع الغيار والإطارات لأسطول الشمال والجنوب',
        category: 'Equipment',
        potentialSavingsSAR: 1850000,
        recommendation: 'دمج 4 مناقصات منفصلة لشراء إطارات الشاحنات وزيوت المحركات في اتفاقية إطار عمل موحدة سنوية.',
        impact: 'HIGH',
        implementationTime: '30 يوماً'
      },
      {
        id: 'OPP-002',
        title: 'الاستفادة من خصومات الدفع المبكر المتاحة لدى المورد ساسكو و المجدوعي',
        category: 'Fuel',
        potentialSavingsSAR: 920000,
        recommendation: 'تطبيق آلية السداد الآلي Adyen خلال 10 أيام للحصول على خصم تعاقدي قدره 2.5% سنوياً.',
        impact: 'HIGH',
        implementationTime: '14 يوماً'
      },
      {
        id: 'OPP-003',
        title: 'الحد من الشراء المباشر خارج العقود (Maverick Spend) في خدمات التخليص',
        category: 'Customs',
        potentialSavingsSAR: 650000,
        recommendation: 'تقييد أوامر الشراء المباشرة وأتمتة المطابقة مع لوائح الأسعار المعتمدة مسبقاً في نظام أجا.',
        impact: 'MEDIUM',
        implementationTime: '7 أيام'
      }
    ],
    supplierRiskPredictions: [
      {
        vendorId: 'VEN-SA-1004',
        vendorName: 'Saudi Aramco Base Oil (LUBEREF)',
        riskFactor: 'تذبذب سلاسل الإمداد العالمية ومواعيد تسليم الزيوت التخليقية',
        probabilityPct: 28,
        predictedImpactSAR: 850000,
        mitigationStrategy: 'تأمين مخزون احتياطي استراتيجي لمدة 45 يوماً بمركز الخدمات التوريدية بالرياض.'
      },
      {
        vendorId: 'VEN-SA-1003',
        vendorName: 'National Cold Logistics Hub',
        riskFactor: 'قرب انتهاء عقد الإيجار خلال 22 يوماً وتجاوز السعة الاستيعابية المتاحة',
        probabilityPct: 75,
        predictedImpactSAR: 1200000,
        mitigationStrategy: 'بدء مفاوضات التجديد فوراً مع تمديد اختياري بنسبة 15% على المساحة المستأجرة.'
      }
    ],
    demandForecasts: [
      { category: 'Fuel', forecastedSpend30DaysSAR: 6200000, forecastedSpend90DaysSAR: 18900000, expectedPriceTrendPct: 1.2, confidencePct: 96 },
      { category: 'Transportation', forecastedSpend30DaysSAR: 4800000, forecastedSpend90DaysSAR: 14500000, expectedPriceTrendPct: -0.8, confidencePct: 94 },
      { category: 'Warehousing', forecastedSpend30DaysSAR: 2300000, forecastedSpend90DaysSAR: 7100000, expectedPriceTrendPct: 0.0, confidencePct: 98 },
      { category: 'Equipment', forecastedSpend30DaysSAR: 1800000, forecastedSpend90DaysSAR: 5600000, expectedPriceTrendPct: 2.1, confidencePct: 91 }
    ],
    categoryOptimizations: [
      { category: 'Fuel', currentVendorsCount: 2, optimalVendorsCount: 2, strategy: 'تثبيت الشراكة الاستراتيجية الحالية وتوسيع السداد الذاتي', benchmarkComparisonPct: +4.2 },
      { category: 'Transportation', currentVendorsCount: 5, optimalVendorsCount: 3, strategy: 'ترشيد قاعدة الموردين والتركيز على الموردين الحاصلين على أعلى نقاط جودة', benchmarkComparisonPct: +6.8 },
      { category: 'Warehousing', currentVendorsCount: 3, optimalVendorsCount: 2, strategy: 'دمج عقود التخزين الجاف والمبرد في مراكز الخدمات اللوجستية المتكاملة', benchmarkComparisonPct: +2.1 }
    ],
    executiveInsights: [
      'معدل الإنفاق المدار تحت العقود المعتمدة بلغت 87% وهي أعلى من معدل القطاع اللوجستي بـ 12%.',
      'فرص توفير تراكمية بـ 3.42 مليون ر.س متوقعة خلال النصف الثاني من عام 2026 عند تنفيذ توصيات الذكاء الاصطناعي.',
      'متوسط زمن دورة طلبيات الشراء وانتقالها إلى أمر شراء مؤكد انخفضت إلى 18.5 ساعة، بزيادة كفاءة 34%.'
    ],
    benchmarkMetrics: [
      { category: 'Purchase Cycle Time', ajaMetric: 1.8, industryBenchmark: 4.5, unit: 'Days' },
      { category: 'Contract Utilization Rate', ajaMetric: 82.4, industryBenchmark: 71.0, unit: '%' },
      { category: 'On-time In-full Delivery (OTIF)', ajaMetric: 97.2, industryBenchmark: 88.5, unit: '%' },
      { category: '3-Way Match Rate', ajaMetric: 96.4, industryBenchmark: 82.0, unit: '%' },
      { category: 'Maverick Spend Rate', ajaMetric: 13.0, industryBenchmark: 22.5, unit: '%' }
    ]
  };
}


