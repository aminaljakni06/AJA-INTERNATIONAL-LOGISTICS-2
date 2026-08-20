import {
  ChartOfAccount,
  FinancialDimensionValue,
  FiscalYear,
  FiscalPeriod,
  CurrencyRate,
  JournalEntry,
  IntercompanyTransaction,
  TrialBalanceRow,
  FinancialControlRule,
  ExecutiveFinanceSummary,
  AIFinanceInsight
} from '../../types/generalLedger';

// Initial Mock Seed Data
const MOCK_ACCOUNTS: ChartOfAccount[] = [
  // 100000 - ASSETS
  { id: 'acc-1', accountCode: '100000', accountNameEn: 'ASSETS', accountNameAr: 'الأصول', category: 'ASSETS', hierarchyLevel: 1, isHeader: true, isPosting: false, allowDirectPosting: false, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '100000', companyId: 'comp-101', currentBalanceSAR: 48500000, ytdDebitSAR: 12500000, ytdCreditSAR: 2100000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-2', accountCode: '101000', accountNameEn: 'Cash & Cash Equivalents', accountNameAr: 'النقد وما في حكمه', category: 'ASSETS', parentAccountCode: '100000', hierarchyLevel: 2, isHeader: true, isPosting: false, allowDirectPosting: false, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '101000', companyId: 'comp-101', currentBalanceSAR: 18200000, ytdDebitSAR: 8500000, ytdCreditSAR: 1200000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-3', accountCode: '101100', accountNameEn: 'Al Rajhi Bank - Main Operating SAR', accountNameAr: 'مصرف الراجحي - الحساب التشغيلي الرئيسي (SAR)', category: 'ASSETS', parentAccountCode: '101000', hierarchyLevel: 3, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '101100', companyId: 'comp-101', currentBalanceSAR: 12450000, ytdDebitSAR: 6200000, ytdCreditSAR: 950000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-4', accountCode: '101200', accountNameEn: 'SNB Bank - USD Trade Account', accountNameAr: 'البنك الأهلي - حساب التجارة (USD)', category: 'ASSETS', parentAccountCode: '101000', hierarchyLevel: 3, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'USD', status: 'ACTIVE', naturalAccountCode: '101200', companyId: 'comp-101', currentBalanceSAR: 5750000, ytdDebitSAR: 2300000, ytdCreditSAR: 250000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-5', accountCode: '102000', accountNameEn: 'Trade Accounts Receivable', accountNameAr: 'ذمم عملاء التجارة واللوجستيات', category: 'ASSETS', parentAccountCode: '100000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '102000', companyId: 'comp-101', currentBalanceSAR: 14300000, ytdDebitSAR: 3200000, ytdCreditSAR: 800000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-6', accountCode: '103000', accountNameEn: 'Inventory & Spare Parts', accountNameAr: 'المخزون وقطع الغيار', category: 'ASSETS', parentAccountCode: '100000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '103000', companyId: 'comp-101', currentBalanceSAR: 6200000, ytdDebitSAR: 800000, ytdCreditSAR: 150000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-7', accountCode: '104000', accountNameEn: 'Fleet Vehicles & Property Plant Equipment', accountNameAr: 'الأسطول، المركبات والمعدات', category: 'ASSETS', parentAccountCode: '100000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '104000', companyId: 'comp-101', currentBalanceSAR: 9800000, ytdDebitSAR: 0, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },

  // 200000 - LIABILITIES
  { id: 'acc-8', accountCode: '200000', accountNameEn: 'LIABILITIES', accountNameAr: 'الالتزامات', category: 'LIABILITIES', hierarchyLevel: 1, isHeader: true, isPosting: false, allowDirectPosting: false, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '200000', companyId: 'comp-101', currentBalanceSAR: 18400000, ytdDebitSAR: 1500000, ytdCreditSAR: 4200000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-9', accountCode: '201000', accountNameEn: 'Accounts Payable - Vendors', accountNameAr: 'ذمم الموردين والشركاء', category: 'LIABILITIES', parentAccountCode: '200000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '201000', companyId: 'comp-101', currentBalanceSAR: 8900000, ytdDebitSAR: 900000, ytdCreditSAR: 2100000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-10', accountCode: '202000', accountNameEn: 'VAT Payable (ZATCA 15%)', accountNameAr: 'ضريبة القيمة المضافة المستحقة (زكاة وضريبة)', category: 'LIABILITIES', parentAccountCode: '200000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '202000', companyId: 'comp-101', currentBalanceSAR: 2350000, ytdDebitSAR: 400000, ytdCreditSAR: 1100000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-11', accountCode: '203000', accountNameEn: 'Accrued Payroll & EOSB', accountNameAr: 'مستحقات ورواتب ومكافأة نهاية الخدمة', category: 'LIABILITIES', parentAccountCode: '200000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '203000', companyId: 'comp-101', currentBalanceSAR: 7150000, ytdDebitSAR: 200000, ytdCreditSAR: 1000000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },

  // 300000 - EQUITY
  { id: 'acc-12', accountCode: '300000', accountNameEn: 'EQUITY', accountNameAr: 'حقوق الملكية', category: 'EQUITY', hierarchyLevel: 1, isHeader: true, isPosting: false, allowDirectPosting: false, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '300000', companyId: 'comp-101', currentBalanceSAR: 19500000, ytdDebitSAR: 0, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-13', accountCode: '301000', accountNameEn: 'Paid-in Share Capital', accountNameAr: 'رأس المال المدفوع', category: 'EQUITY', parentAccountCode: '300000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '301000', companyId: 'comp-101', currentBalanceSAR: 15000000, ytdDebitSAR: 0, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-14', accountCode: '302000', accountNameEn: 'Retained Earnings', accountNameAr: 'الأرباح المبقاة', category: 'EQUITY', parentAccountCode: '300000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '302000', companyId: 'comp-101', currentBalanceSAR: 4500000, ytdDebitSAR: 0, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },

  // 400000 - REVENUE
  { id: 'acc-15', accountCode: '400000', accountNameEn: 'OPERATING REVENUE', accountNameAr: 'الإيرادات التشغيلية', category: 'REVENUE', hierarchyLevel: 1, isHeader: true, isPosting: false, allowDirectPosting: false, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '400000', companyId: 'comp-101', currentBalanceSAR: 22800000, ytdDebitSAR: 0, ytdCreditSAR: 22800000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-16', accountCode: '401000', accountNameEn: 'Freight & Transportation Revenue', accountNameAr: 'إيرادات الشحن والنقل البري', category: 'REVENUE', parentAccountCode: '400000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '401000', companyId: 'comp-101', currentBalanceSAR: 14500000, ytdDebitSAR: 0, ytdCreditSAR: 14500000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-17', accountCode: '402000', accountNameEn: 'Warehousing & 3PL Logistics Revenue', accountNameAr: 'إيرادات التخزين والخدمات اللوجستية', category: 'REVENUE', parentAccountCode: '400000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '402000', companyId: 'comp-101', currentBalanceSAR: 8300000, ytdDebitSAR: 0, ytdCreditSAR: 8300000, createdAt: '2026-01-01', updatedAt: '2026-02-01' },

  // 500000 - COST OF SALES
  { id: 'acc-18', accountCode: '500000', accountNameEn: 'COST OF LOGISTICS SERVICES', accountNameAr: 'تكلفة الخدمات اللوجستية', category: 'COST_OF_SALES', hierarchyLevel: 1, isHeader: true, isPosting: false, allowDirectPosting: false, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '500000', companyId: 'comp-101', currentBalanceSAR: 12200000, ytdDebitSAR: 12200000, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-19', accountCode: '501000', accountNameEn: 'Carrier Subcontracting & Tolls', accountNameAr: 'تكاليف الناقلين من الفرع ورسوم الطرق', category: 'COST_OF_SALES', parentAccountCode: '500000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '501000', companyId: 'comp-101', currentBalanceSAR: 7800000, ytdDebitSAR: 7800000, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-20', accountCode: '502000', accountNameEn: 'Fuel & Fleet Operations Expense', accountNameAr: 'مصاريف الوقود وتشغيل الأسطول', category: 'COST_OF_SALES', parentAccountCode: '500000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '502000', companyId: 'comp-101', currentBalanceSAR: 4400000, ytdDebitSAR: 4400000, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },

  // 600000 - OPERATING EXPENSES
  { id: 'acc-21', accountCode: '600000', accountNameEn: 'GENERAL & ADMIN EXPENSES', accountNameAr: 'المصاريف العمومية والإدارية', category: 'OPERATING_EXPENSES', hierarchyLevel: 1, isHeader: true, isPosting: false, allowDirectPosting: false, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '600000', companyId: 'comp-101', currentBalanceSAR: 3800000, ytdDebitSAR: 3800000, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-22', accountCode: '601000', accountNameEn: 'Salaries & Employee Benefits', accountNameAr: 'الرواتب ومزايا الموظفين', category: 'OPERATING_EXPENSES', parentAccountCode: '600000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '601000', companyId: 'comp-101', currentBalanceSAR: 2600000, ytdDebitSAR: 2600000, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'acc-23', accountCode: '602000', accountNameEn: 'IT Infrastructure & Software Subscriptions', accountNameAr: 'مصاريف تقنية المعلومات والبرمجيات', category: 'OPERATING_EXPENSES', parentAccountCode: '600000', hierarchyLevel: 2, isHeader: false, isPosting: true, allowDirectPosting: true, currency: 'SAR', status: 'ACTIVE', naturalAccountCode: '602000', companyId: 'comp-101', currentBalanceSAR: 1200000, ytdDebitSAR: 1200000, ytdCreditSAR: 0, createdAt: '2026-01-01', updatedAt: '2026-02-01' }
];

const MOCK_DIMENSIONS: FinancialDimensionValue[] = [
  { id: 'dim-1', dimensionType: 'COMPANY', code: 'AJA-SA', nameEn: 'AJA Logistics Saudi Arabia Co.', nameAr: 'شركة عجاء للوجستيات السعودية', isActive: true, companyId: 'comp-101' },
  { id: 'dim-2', dimensionType: 'COMPANY', code: 'AJA-UAE', nameEn: 'AJA Express UAE FZCO', nameAr: 'شركة عجاء اكسبرس الإمارات', isActive: true, companyId: 'comp-102' },
  { id: 'dim-3', dimensionType: 'BRANCH', code: 'BR-RUH', nameEn: 'Riyadh Central Branch', nameAr: 'فرع الرياض المركزي', isActive: true, companyId: 'comp-101' },
  { id: 'dim-4', dimensionType: 'BRANCH', code: 'BR-JED', nameEn: 'Jeddah Port Branch', nameAr: 'فرع ميناء جدة', isActive: true, companyId: 'comp-101' },
  { id: 'dim-5', dimensionType: 'BRANCH', code: 'BR-DMM', nameEn: 'Dammam Logistics Hub', nameAr: 'مركز الدمام اللوجستي', isActive: true, companyId: 'comp-101' },
  { id: 'dim-6', dimensionType: 'COST_CENTER', code: 'CC-FLEET', nameEn: 'Heavy Fleet Transport Division', nameAr: 'قسم شحن الأسطول الثقيل', isActive: true, companyId: 'comp-101' },
  { id: 'dim-7', dimensionType: 'COST_CENTER', code: 'CC-WH-RUH', nameEn: 'Riyadh Mega Warehouse', nameAr: 'مستودع الرياض العملاق', isActive: true, companyId: 'comp-101' },
  { id: 'dim-8', dimensionType: 'PROJECT', code: 'PRJ-NEOM-2026', nameEn: 'NEOM Line Freight Logistics', nameAr: 'مشروع شحن مشروع نيوم', isActive: true, companyId: 'comp-101' },
  { id: 'dim-9', dimensionType: 'VEHICLE', code: 'VEH-TRK-8812', nameEn: 'Volvo FH16 Semi-Trailer #8812', nameAr: 'شاحنة فولفو FH16 رقم 8812', isActive: true, companyId: 'comp-101' }
];

const MOCK_CURRENCIES: CurrencyRate[] = [
  { id: 'cur-1', currencyCode: 'SAR', currencyNameEn: 'Saudi Riyal', currencyNameAr: 'ريال سعودي', rateToBaseSAR: 1.0, effectiveDate: '2026-02-05', isBaseCurrency: true, isFunctionalCurrency: true, isReportingCurrency: true },
  { id: 'cur-2', currencyCode: 'USD', currencyNameEn: 'US Dollar', currencyNameAr: 'دولار أمريكي', rateToBaseSAR: 3.75, effectiveDate: '2026-02-05', isBaseCurrency: false, isFunctionalCurrency: false, isReportingCurrency: true },
  { id: 'cur-3', currencyCode: 'AED', currencyNameEn: 'UAE Dirham', currencyNameAr: 'درهم إماراتي', rateToBaseSAR: 1.021, effectiveDate: '2026-02-05', isBaseCurrency: false, isFunctionalCurrency: false, isReportingCurrency: false },
  { id: 'cur-4', currencyCode: 'EUR', currencyNameEn: 'Euro', currencyNameAr: 'يورو', rateToBaseSAR: 4.08, effectiveDate: '2026-02-05', isBaseCurrency: false, isFunctionalCurrency: false, isReportingCurrency: false },
  { id: 'cur-5', currencyCode: 'GBP', currencyNameEn: 'British Pound', currencyNameAr: 'جنيه إسترليني', rateToBaseSAR: 4.78, effectiveDate: '2026-02-05', isBaseCurrency: false, isFunctionalCurrency: false, isReportingCurrency: false }
];

const MOCK_FISCAL_YEAR: FiscalYear = {
  id: 'fy-2026',
  year: 2026,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  isYearEndClosed: false,
  periods: [
    { id: 'fp-2026-01', year: 2026, periodNumber: 1, periodNameEn: 'January 2026', periodNameAr: 'يناير 2026', startDate: '2026-01-01', endDate: '2026-01-31', status: 'HARD_CLOSE', closedBy: 'Financial Controller', closedAt: '2026-02-01T18:00:00Z' },
    { id: 'fp-2026-02', year: 2026, periodNumber: 2, periodNameEn: 'February 2026', periodNameAr: 'فبراير 2026', startDate: '2026-02-01', endDate: '2026-02-28', status: 'OPEN' },
    { id: 'fp-2026-03', year: 2026, periodNumber: 3, periodNameEn: 'March 2026', periodNameAr: 'مارس 2026', startDate: '2026-03-01', endDate: '2026-03-31', status: 'FUTURE_ENTRY' },
    { id: 'fp-2026-04', year: 2026, periodNumber: 4, periodNameEn: 'April 2026', periodNameAr: 'أبريل 2026', startDate: '2026-04-01', endDate: '2026-04-30', status: 'FUTURE_ENTRY' }
  ]
};

const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: 'jv-1',
    journalNumber: 'JV-2026-00810',
    journalType: 'MANUAL',
    postingDate: '2026-02-02',
    fiscalPeriodId: 'fp-2026-02',
    companyId: 'comp-101',
    companyName: 'AJA Logistics Saudi Arabia Co.',
    referenceNumber: 'PO-REF-9921',
    sourceModule: 'GENERAL_LEDGER',
    narrationEn: 'Monthly Fleet Maintenance & Fuel Allocation Adjustment',
    narrationAr: 'تسوية مخصص صيانة الأسطول ومصاريف الوقود الشهرية',
    totalDebitSAR: 145000,
    totalCreditSAR: 145000,
    status: 'POSTED',
    preparedBy: 'Chief Accountant',
    preparedAt: '2026-02-02T09:30:00Z',
    approvedBy: 'Finance Director',
    approvedAt: '2026-02-02T10:15:00Z',
    postedBy: 'System Auto Post Engine',
    postedAt: '2026-02-02T10:15:05Z',
    lines: [
      { id: 'jl-1', lineNumber: 1, accountCode: '502000', accountNameEn: 'Fuel & Fleet Operations Expense', accountNameAr: 'مصاريف الوقود وتشغيل الأسطول', debitSAR: 145000, creditSAR: 0, descriptionEn: 'Diesel Fuel Refill - Fleet Riyadh Central', descriptionAr: 'تعبئة ديزل لأسطول الرياض المركزي', companyId: 'comp-101', branchId: 'BR-RUH', costCenterCode: 'CC-FLEET', vehicleCode: 'VEH-TRK-8812' },
      { id: 'jl-2', lineNumber: 2, accountCode: '101100', accountNameEn: 'Al Rajhi Bank - Main Operating SAR', accountNameAr: 'مصرف الراجحي - الحساب التشغيلي الرئيسي (SAR)', debitSAR: 0, creditSAR: 145000, descriptionEn: 'Direct Electronic Payment to SASCO Fuel', descriptionAr: 'دفع إلكتروني مباشر لشركة ساسكو للوقود', companyId: 'comp-101', branchId: 'BR-RUH' }
    ]
  },
  {
    id: 'jv-2',
    journalNumber: 'JV-2026-00811',
    journalType: 'INTERCOMPANY',
    postingDate: '2026-02-04',
    fiscalPeriodId: 'fp-2026-02',
    companyId: 'comp-101',
    companyName: 'AJA Logistics Saudi Arabia Co.',
    referenceNumber: 'IC-TX-0041',
    sourceModule: 'INTERCOMPANY',
    narrationEn: 'Cross-Border Freight Clearance Settlement - UAE Branch',
    narrationAr: 'تسوية التخليص الجمركي والشحن بين الشركات - فرع الإمارات',
    totalDebitSAR: 88000,
    totalCreditSAR: 88000,
    status: 'SUBMITTED',
    preparedBy: 'Intercompany Accountant',
    preparedAt: '2026-02-04T14:20:00Z',
    lines: [
      { id: 'jl-3', lineNumber: 1, accountCode: '102000', accountNameEn: 'Trade Accounts Receivable', accountNameAr: 'ذمم عملاء التجارة واللوجستيات', debitSAR: 88000, creditSAR: 0, descriptionEn: 'Cross-border clearance fee receivable from UAE FZCO', descriptionAr: 'رسوم تخليص حدودي مستحقة من فرع الإمارات', companyId: 'comp-101', branchId: 'BR-DMM' },
      { id: 'jl-4', lineNumber: 2, accountCode: '401000', accountNameEn: 'Freight & Transportation Revenue', accountNameAr: 'إيرادات الشحن والنقل البري', debitSAR: 0, creditSAR: 88000, descriptionEn: 'Intercompany land freight haulage revenue', descriptionAr: 'إيرادات نقل بري بين الشركات', companyId: 'comp-101', branchId: 'BR-DMM' }
    ]
  }
];

const MOCK_INTERCOMPANY_TX: IntercompanyTransaction[] = [
  {
    id: 'ic-1',
    transactionNumber: 'ICT-2026-0012',
    sendingCompanyId: 'comp-101',
    sendingCompanyName: 'AJA Logistics Saudi Arabia Co.',
    receivingCompanyId: 'comp-102',
    receivingCompanyName: 'AJA Express UAE FZCO',
    dueToAccountCode: '201000',
    dueFromAccountCode: '102000',
    amountSAR: 125000,
    descriptionEn: 'Cross-border transport allocation for Dubai-Riyadh express lane',
    descriptionAr: 'توزيع تكاليف النقل عبر الحدود لمسار دبي-الرياض السريع',
    status: 'PENDING_MATCH',
    journalEntryNumber: 'JV-2026-00811',
    createdAt: '2026-02-04'
  }
];

const MOCK_CONTROL_RULES: FinancialControlRule[] = [
  { id: 'fcr-1', ruleCode: 'SOD-GL-01', ruleNameEn: 'Segregation of Duties: Creator cannot approve Journal', ruleNameAr: 'فصل المهام: لا يمكن لمعد القيد اعتماده بنفسه', ruleType: 'SEGREGATION_OF_DUTIES', descriptionAr: 'يمنع النظام بصرامة المحاسب الذي قام بإنشاء قيد اليومية من اعتماده أو ترحيله', isActive: true },
  { id: 'fcr-2', ruleCode: 'THR-GL-02', ruleNameEn: 'High-Value Journal Approval (> 100k SAR)', ruleNameAr: 'اعتماد القيود عالية القيمة (أكبر من 100 ألف ريال)', ruleType: 'THRESHOLD_APPROVAL', descriptionAr: 'يتطلب القيد الذي تتجاوز قيمته 100,000 ريال موافقة مدير المالية أو المدير التنفيذي', isActive: true, thresholdSAR: 100000 },
  { id: 'fcr-3', ruleCode: 'PRD-GL-03', ruleNameEn: 'Period Lock Restriction for Closed Months', ruleNameAr: 'حظر الترحيل للفترات المالية المغلقة', ruleType: 'PERIOD_LOCK', descriptionAr: 'يمنع بصرامة كتابة أو ترحيل أي قيود في الأشهر ذات الحالة المغلقة HARD_CLOSE', isActive: true }
];

const MOCK_EXECUTIVE_SUMMARY: ExecutiveFinanceSummary = {
  totalAssetsSAR: 48500000,
  totalLiabilitiesSAR: 18400000,
  totalEquitySAR: 19500000,
  ytdRevenueSAR: 22800000,
  ytdCostOfSalesSAR: 12200000,
  ytdOperatingExpensesSAR: 3800000,
  netProfitSAR: 6800000,
  netMarginPercent: 29.8,
  cashPositionSAR: 18200000,
  workingCapitalSAR: 21600000,
  currentRatio: 2.18,
  quickRatio: 1.84,
  debtToEquityRatio: 0.94,
  ledgerHealthScore: 98.4,
  unpostedJournalsCount: 3,
  openFiscalPeriod: 'February 2026 (M02)',
  currencyExposureSAR: [
    { currency: 'USD', exposureAmount: 5750000 },
    { currency: 'AED', exposureAmount: 1850000 },
    { currency: 'EUR', exposureAmount: 920000 }
  ]
};

const MOCK_AI_INSIGHTS: AIFinanceInsight[] = [
  {
    id: 'ai-ins-1',
    type: 'JOURNAL_VALIDATION',
    severity: 'MEDIUM',
    titleEn: 'Potential Duplicate Entry Pattern Detected',
    titleAr: 'تم اكتشاف نمط قيد مكرر محتمل',
    descriptionEn: 'Journal JV-2026-00811 matches 94% with JV-2026-00792 posted 3 days ago.',
    descriptionAr: 'قيد اليومية JV-2026-00811 يتطابق بنسبة 94% مع القيد المرحل سابقاً JV-2026-00792.',
    confidencePercent: 94,
    recommendedActionAr: 'تحقق من المرجع المعزز وفواتير المورد لتفادي دبلجة القيد',
    journalNumber: 'JV-2026-00811',
    createdAt: '2026-02-04T14:25:00Z'
  },
  {
    id: 'ai-ins-2',
    type: 'CURRENCY_FORECAST',
    severity: 'INFO',
    titleEn: 'USD/SAR Hedging Opportunity & Exposure Advisory',
    titleAr: 'توصية التحوط والتعرض للعملات الأجنبية (USD/SAR)',
    descriptionEn: 'Stable 3.75 peg expected. USD reserves account for 31.5% of total liquid cash.',
    descriptionAr: 'ربط مستقر للريال والدولار (3.75). تشكل احتياطيات الدولار 31.5% من النقد السائل.',
    confidencePercent: 99,
    recommendedActionAr: 'الاحتفاظ بفرص تحويل العملات الأجنبية للطلبات اللوجستية الدولية دون مخاطر تذبذب',
    createdAt: '2026-02-05T08:00:00Z'
  },
  {
    id: 'ai-ins-3',
    type: 'LEDGER_HEALTH',
    severity: 'LOW',
    titleEn: 'Chart of Accounts Optimization Recommendation',
    titleAr: 'توصية تحسين شجرة الحسابات والهيكلية',
    descriptionEn: 'Account 602000 has high debit velocity. Consider splitting into Sub-Accounts for Cloud vs On-Prem.',
    descriptionAr: 'الحساب 602000 يتلقى حركات سريعة. يوصى بإنشاء فرع تفصيلي للخدمات السحابية والتراخيص.',
    confidencePercent: 88,
    recommendedActionAr: 'إضافة حسابات فرعية للبرمجيات والسحابة لزيادة شفافية الميزانية',
    accountCode: '602000',
    createdAt: '2026-02-05T08:30:00Z'
  }
];

export class GeneralLedgerRepository {
  private static instance: GeneralLedgerRepository;

  private accounts: ChartOfAccount[] = [...MOCK_ACCOUNTS];
  private dimensions: FinancialDimensionValue[] = [...MOCK_DIMENSIONS];
  private currencies: CurrencyRate[] = [...MOCK_CURRENCIES];
  private fiscalYear: FiscalYear = { ...MOCK_FISCAL_YEAR };
  private journals: JournalEntry[] = [...MOCK_JOURNALS];
  private intercompanyTxs: IntercompanyTransaction[] = [...MOCK_INTERCOMPANY_TX];
  private controlRules: FinancialControlRule[] = [...MOCK_CONTROL_RULES];
  private summary: ExecutiveFinanceSummary = { ...MOCK_EXECUTIVE_SUMMARY };
  private aiInsights: AIFinanceInsight[] = [...MOCK_AI_INSIGHTS];

  private constructor() {}

  public static getInstance(): GeneralLedgerRepository {
    if (!GeneralLedgerRepository.instance) {
      GeneralLedgerRepository.instance = new GeneralLedgerRepository();
    }
    return GeneralLedgerRepository.instance;
  }

  // --- Synchronous Getters & Setters for React Component State ---
  public getExecutiveSummary(): ExecutiveFinanceSummary {
    return { ...this.summary };
  }

  public getAccounts(): ChartOfAccount[] {
    return [...this.accounts];
  }

  public getDimensionValues(): FinancialDimensionValue[] {
    return [...this.dimensions];
  }

  public addDimensionValue(dim: Omit<FinancialDimensionValue, 'id'>): FinancialDimensionValue {
    const newDim: FinancialDimensionValue = {
      ...dim,
      id: `dim-${Date.now()}`
    };
    this.dimensions.push(newDim);
    return newDim;
  }

  public getFiscalYear2026(): FiscalYear {
    return { ...this.fiscalYear };
  }

  public updatePeriodStatus(periodId: string, status: FiscalPeriod['status'], userName: string): boolean {
    const period = this.fiscalYear.periods.find(p => p.id === periodId);
    if (period) {
      period.status = status;
      if (status === 'HARD_CLOSE' || status === 'SOFT_CLOSE') {
        period.closedBy = userName;
        period.closedAt = new Date().toISOString();
      }
      return true;
    }
    return false;
  }

  public getJournals(): JournalEntry[] {
    return [...this.journals];
  }

  public getCurrencies(): CurrencyRate[] {
    return [...this.currencies];
  }

  public updateCurrencyRate(currencyCode: string, newRate: number): boolean {
    const cur = this.currencies.find(c => c.currencyCode === currencyCode);
    if (cur) {
      cur.rateToBaseSAR = newRate;
      cur.effectiveDate = new Date().toISOString().split('T')[0];
      return true;
    }
    return false;
  }

  public getIntercompanyAccounts(): any[] {
    return [
      {
        id: 'ic-acc-1',
        accountCode: '102000-IC-UAE',
        fromCompanyId: 'comp-101',
        fromCompanyName: 'AJA Logistics Saudi Arabia Co.',
        toCompanyId: 'comp-102',
        toCompanyName: 'AJA Express UAE FZCO',
        dueFromBalanceSAR: 125000,
        dueToBalanceSAR: 125000,
        autoEliminationEnabled: true,
        status: 'BALANCED'
      }
    ];
  }

  public eliminateIntercompanyAccount(id: string) {
    // Generate elimination journal
    const eliminationJv: JournalEntry = {
      id: `jv-elim-${Date.now()}`,
      journalNumber: `JV-ELIM-2026-${Math.floor(Math.random() * 900 + 100)}`,
      journalType: 'INTERCOMPANY',
      postingDate: new Date().toISOString().split('T')[0],
      fiscalPeriodId: 'fp-2026-02',
      companyId: 'comp-101',
      companyName: 'Consolidated AJA Group',
      referenceNumber: 'ELIM-REF-001',
      sourceModule: 'INTERCOMPANY',
      narrationEn: 'Automated Intercompany Clearance & Elimination Journal',
      narrationAr: 'قيد تسوية واستبعاد الحسابات المتبادلة تلقائياً للتجميع المالي',
      totalDebitSAR: 125000,
      totalCreditSAR: 125000,
      status: 'POSTED',
      preparedBy: 'Intercompany Engine',
      preparedAt: new Date().toISOString(),
      lines: []
    };
    this.journals.unshift(eliminationJv);
  }

  public getTrialBalance(): TrialBalanceRow[] {
    return this.accounts.map(acc => {
      const openingDebit = acc.hierarchyLevel === 1 ? acc.ytdDebitSAR * 0.8 : acc.ytdDebitSAR * 0.5;
      const openingCredit = acc.hierarchyLevel === 1 ? acc.ytdCreditSAR * 0.8 : acc.ytdCreditSAR * 0.5;
      const periodDebit = acc.ytdDebitSAR - openingDebit;
      const periodCredit = acc.ytdCreditSAR - openingCredit;

      const closingDebit = openingDebit + periodDebit;
      const closingCredit = openingCredit + periodCredit;
      const netBalanceSAR = acc.currentBalanceSAR;

      return {
        accountCode: acc.accountCode,
        accountNameEn: acc.accountNameEn,
        accountNameAr: acc.accountNameAr,
        category: acc.category,
        hierarchyLevel: acc.hierarchyLevel,
        openingDebitSAR: Math.round(openingDebit),
        openingCreditSAR: Math.round(openingCredit),
        periodDebitSAR: Math.round(periodDebit),
        periodCreditSAR: Math.round(periodCredit),
        closingDebitSAR: Math.round(closingDebit),
        closingCreditSAR: Math.round(closingCredit),
        netBalanceSAR: Math.round(netBalanceSAR),
        isHeader: acc.isHeader
      };
    });
  }

  public addAccount(account: Omit<ChartOfAccount, 'id' | 'createdAt' | 'updatedAt' | 'currentBalanceSAR' | 'ytdDebitSAR' | 'ytdCreditSAR'>): ChartOfAccount {
    const newAcc: ChartOfAccount = {
      ...account,
      id: `acc-${Date.now()}`,
      currentBalanceSAR: 0,
      ytdDebitSAR: 0,
      ytdCreditSAR: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.accounts.push(newAcc);
    return newAcc;
  }

  public updateAccountStatus(accountCode: string, status: ChartOfAccount['status']): boolean {
    const acc = this.accounts.find(a => a.accountCode === accountCode);
    if (acc) {
      acc.status = status;
      acc.updatedAt = new Date().toISOString().split('T')[0];
      return true;
    }
    return false;
  }

  public createJournalEntry(journalData: Omit<JournalEntry, 'id' | 'journalNumber' | 'preparedAt' | 'status'>): JournalEntry {
    const nextSeq = this.journals.length + 812;
    const journalNumber = `JV-2026-0${nextSeq}`;
    
    // Validate trial balance (Debit === Credit check)
    const totalDebit = journalData.lines.reduce((sum, line) => sum + (line.debitSAR || 0), 0);
    const totalCredit = journalData.lines.reduce((sum, line) => sum + (line.creditSAR || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error(`Unbalanced Journal Entry! Total Debit (${totalDebit} SAR) does not equal Total Credit (${totalCredit} SAR).`);
    }

    const newJournal: JournalEntry = {
      ...journalData,
      id: `jv-${Date.now()}`,
      journalNumber,
      totalDebitSAR: totalDebit,
      totalCreditSAR: totalCredit,
      status: 'SUBMITTED',
      preparedAt: new Date().toISOString()
    };

    this.journals.unshift(newJournal);
    return newJournal;
  }

  public postJournalEntry(journalId: string, postedByUserName: string): JournalEntry {
    const journal = this.journals.find(j => j.id === journalId);
    if (!journal) {
      throw new Error('Journal Entry not found');
    }

    if (journal.status === 'POSTED') {
      throw new Error('Journal Entry is already posted');
    }

    // Check fiscal period status
    const period = this.fiscalYear.periods.find(p => p.id === journal.fiscalPeriodId);
    if (period && period.status === 'HARD_CLOSE') {
      throw new Error(`Cannot post into a Hard-Closed Fiscal Period (${period.periodNameAr}).`);
    }

    journal.status = 'POSTED';
    journal.approvedBy = postedByUserName;
    journal.approvedAt = new Date().toISOString();
    journal.postedBy = postedByUserName;
    journal.postedAt = new Date().toISOString();

    // Update Chart of Account balances
    journal.lines.forEach(line => {
      const acc = this.accounts.find(a => a.accountCode === line.accountCode);
      if (acc) {
        acc.ytdDebitSAR += line.debitSAR || 0;
        acc.ytdCreditSAR += line.creditSAR || 0;
        if (acc.category === 'ASSETS' || acc.category === 'COST_OF_SALES' || acc.category === 'OPERATING_EXPENSES') {
          acc.currentBalanceSAR += (line.debitSAR - line.creditSAR);
        } else {
          acc.currentBalanceSAR += (line.creditSAR - line.debitSAR);
        }
      }
    });

    return journal;
  }

  // --- INTERCOMPANY ---
  public async getIntercompanyTransactions(): Promise<IntercompanyTransaction[]> {
    return [...this.intercompanyTxs];
  }

  // --- FINANCIAL CONTROLS ---
  public async getFinancialControls(): Promise<FinancialControlRule[]> {
    return [...this.controlRules];
  }

  // --- AI INSIGHTS ---
  public async getAIFinanceInsights(): Promise<AIFinanceInsight[]> {
    return [...this.aiInsights];
  }
}

export const generalLedgerRepository = GeneralLedgerRepository.getInstance();
export const generalLedgerRepo = generalLedgerRepository;
