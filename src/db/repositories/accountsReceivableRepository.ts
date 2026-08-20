import {
  CustomerInvoice,
  RevenueSchedule,
  CustomerPayment,
  CustomerCreditProfile,
  CollectionCase,
  BadDebtProvision,
  ARAnalytics,
  AIReceivablesInsight,
  CustomerStatement,
  InvoiceStatus,
  DunningLevel
} from '../../types/accountsReceivable';

export class AccountsReceivableRepository {
  private static instance: AccountsReceivableRepository;

  private invoices: CustomerInvoice[] = [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-SA-2026-00412',
      series: 'INV-SA',
      customerId: 'cust-101',
      customerNameEn: 'SABIC Petrochemicals Co.',
      customerNameAr: 'شركة سابك للبتروكيماويات',
      customerTaxNumber: '300192847100003',
      billingType: 'SHIPMENT',
      currencyCode: 'SAR',
      exchangeRateToBaseSAR: 1.0,
      issueDate: '2026-01-15',
      dueDate: '2026-02-14',
      paymentTermsDays: 30,
      lines: [
        {
          id: 'line-1',
          descriptionEn: 'Inter-plant Heavy Logistics Transport - Jubail to Yanbu',
          descriptionAr: 'نقل لوجستي ثقيل بين المصانع - الجبيل إلى ينبع',
          quantity: 12,
          unitPriceSAR: 12500,
          lineTotalSAR: 150000,
          vatRatePercent: 15,
          vatAmountSAR: 22500,
          totalIncVatSAR: 172500,
          glAccountCode: '401000',
          costCenterCode: 'CC-EAST-01'
        },
        {
          id: 'line-2',
          descriptionEn: 'Hazmat Demurrage & Escort Escort Fees',
          descriptionAr: 'رسوم غرامات التراكض والمواكبة للمواد الخطرة',
          quantity: 1,
          unitPriceSAR: 15000,
          lineTotalSAR: 15000,
          vatRatePercent: 15,
          vatAmountSAR: 2250,
          totalIncVatSAR: 17250,
          glAccountCode: '403000',
          costCenterCode: 'CC-EAST-01'
        }
      ],
      subtotalSAR: 165000,
      totalVatSAR: 24750,
      totalAmountSAR: 189750,
      totalAmountInCurrency: 189750,
      paidAmountSAR: 189750,
      balanceDueSAR: 0,
      status: 'PAID',
      shipmentIds: ['SHP-2026-8812', 'SHP-2026-8813'],
      poNumber: 'PO-SABIC-9921',
      notesEn: 'Fully settled via Adyen Corporate Wire Transfer',
      notesAr: 'تمت التسوية بالكامل عبر تحويل أديين للشركات',
      attachmentsCount: 3,
      revisionNumber: 1,
      statusHistory: [
        { status: 'DRAFT', changedBy: 'Billing Officer', changedAt: '2026-01-15T08:00:00Z' },
        { status: 'ISSUED', changedBy: 'Finance Manager', changedAt: '2026-01-15T09:30:00Z' },
        { status: 'SENT', changedBy: 'System Auto-Email', changedAt: '2026-01-15T09:32:00Z' },
        { status: 'PAID', changedBy: 'Adyen Settlement Engine', changedAt: '2026-02-02T11:20:00Z' }
      ],
      createdAt: '2026-01-15',
      updatedAt: '2026-02-02'
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-SA-2026-00488',
      series: 'INV-SA',
      customerId: 'cust-102',
      customerNameEn: 'Panda Retail Group KSA',
      customerNameAr: 'مجموعة بنده للتجزئة السعودية',
      customerTaxNumber: '310022938400003',
      billingType: 'CONSOLIDATED',
      currencyCode: 'SAR',
      exchangeRateToBaseSAR: 1.0,
      issueDate: '2026-01-20',
      dueDate: '2026-02-19',
      paymentTermsDays: 30,
      lines: [
        {
          id: 'line-10',
          descriptionEn: 'Cold Chain Grocery DC Distribution (120 Drops)',
          descriptionAr: 'توزيع التبريد لمستودع المواد الغذائية (120 نقطة تسليم)',
          quantity: 120,
          unitPriceSAR: 1800,
          lineTotalSAR: 216000,
          vatRatePercent: 15,
          vatAmountSAR: 32400,
          totalIncVatSAR: 248400,
          glAccountCode: '401000',
          costCenterCode: 'CC-CENTRAL-02'
        }
      ],
      subtotalSAR: 216000,
      totalVatSAR: 32400,
      totalAmountSAR: 248400,
      totalAmountInCurrency: 248400,
      paidAmountSAR: 100000,
      balanceDueSAR: 148400,
      status: 'PARTIALLY_PAID',
      poNumber: 'PO-PANDA-88220',
      attachmentsCount: 5,
      revisionNumber: 1,
      statusHistory: [
        { status: 'DRAFT', changedBy: 'Billing Officer', changedAt: '2026-01-20T08:00:00Z' },
        { status: 'ISSUED', changedBy: 'Finance Manager', changedAt: '2026-01-20T10:00:00Z' },
        { status: 'SENT', changedBy: 'System Auto-Email', changedAt: '2026-01-20T10:05:00Z' },
        { status: 'PARTIALLY_PAID', changedBy: 'Bank Transfer Match', changedAt: '2026-02-01T14:00:00Z' }
      ],
      createdAt: '2026-01-20',
      updatedAt: '2026-02-01'
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-SA-2026-00512',
      series: 'INV-SA',
      customerId: 'cust-103',
      customerNameEn: 'Almarai Logistics Division',
      customerNameAr: 'شركة المراعي - قطاع اللوجستيات',
      customerTaxNumber: '300882192000003',
      billingType: 'CONTRACT',
      currencyCode: 'SAR',
      exchangeRateToBaseSAR: 1.0,
      issueDate: '2025-12-10',
      dueDate: '2026-01-09',
      paymentTermsDays: 30,
      lines: [
        {
          id: 'line-20',
          descriptionEn: 'Monthly Dedicated Fleet Operations - Q4 Retainer',
          descriptionAr: 'تشغيل الأسطول المخصص الشهري - استبقاء الربع الرابع',
          quantity: 1,
          unitPriceSAR: 320000,
          lineTotalSAR: 320000,
          vatRatePercent: 15,
          vatAmountSAR: 48000,
          totalIncVatSAR: 368000,
          glAccountCode: '402000',
          costCenterCode: 'CC-WEST-01'
        }
      ],
      subtotalSAR: 320000,
      totalVatSAR: 48000,
      totalAmountSAR: 368000,
      totalAmountInCurrency: 368000,
      paidAmountSAR: 0,
      balanceDueSAR: 368000,
      status: 'SENT',
      poNumber: 'PO-ALMARAI-2025-99',
      attachmentsCount: 2,
      revisionNumber: 2,
      statusHistory: [
        { status: 'DRAFT', changedBy: 'Billing Officer', changedAt: '2025-12-10T08:00:00Z' },
        { status: 'ISSUED', changedBy: 'Finance Manager', changedAt: '2025-12-10T10:00:00Z' },
        { status: 'SENT', changedBy: 'System Auto-Email', changedAt: '2025-12-10T10:05:00Z' }
      ],
      createdAt: '2025-12-10',
      updatedAt: '2025-12-10'
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-UAE-2026-00088',
      series: 'INV-UAE',
      customerId: 'cust-104',
      customerNameEn: 'Landmark Retail Dubai FZCO',
      customerNameAr: 'مجموعة لاندمارك للتجزئة دبي',
      customerTaxNumber: '100293847500003',
      billingType: 'MILESTONE',
      currencyCode: 'AED',
      exchangeRateToBaseSAR: 1.02,
      issueDate: '2026-01-25',
      dueDate: '2026-02-24',
      paymentTermsDays: 30,
      lines: [
        {
          id: 'line-30',
          descriptionEn: 'Cross-Border Freight Milestone 2: Jebel Ali to Riyadh',
          descriptionAr: 'المرحلة 2 لشحن عبر الحدود: جبل علي إلى الرياض',
          quantity: 1,
          unitPriceSAR: 145000,
          lineTotalSAR: 145000,
          vatRatePercent: 0, // Export zero-rated
          vatAmountSAR: 0,
          totalIncVatSAR: 145000,
          glAccountCode: '401000'
        }
      ],
      subtotalSAR: 145000,
      totalVatSAR: 0,
      totalAmountSAR: 145000,
      totalAmountInCurrency: 142156.86,
      paidAmountSAR: 0,
      balanceDueSAR: 145000,
      status: 'ISSUED',
      contractId: 'CONT-LMRK-2026',
      milestoneNameEn: 'Milestone 2 - Border Clearance Completed',
      milestoneNameAr: 'المرحلة 2 - اكتمال التخليص الجمركي الحدودي',
      attachmentsCount: 4,
      revisionNumber: 1,
      statusHistory: [
        { status: 'DRAFT', changedBy: 'Billing Officer', changedAt: '2026-01-25T08:00:00Z' },
        { status: 'ISSUED', changedBy: 'Finance Manager', changedAt: '2026-01-25T09:00:00Z' }
      ],
      createdAt: '2026-01-25',
      updatedAt: '2026-01-25'
    },
    {
      id: 'inv-005',
      invoiceNumber: 'INV-MIL-2026-00012',
      series: 'INV-MIL',
      customerId: 'cust-105',
      customerNameEn: 'Saudi Telecom Company (STC Logistics)',
      customerNameAr: 'شركة الاتصالات السعودية (لوجستيات إس تي سي)',
      customerTaxNumber: '300088219400003',
      billingType: 'RECURRING',
      currencyCode: 'SAR',
      exchangeRateToBaseSAR: 1.0,
      issueDate: '2026-02-01',
      dueDate: '2026-03-03',
      paymentTermsDays: 30,
      lines: [
        {
          id: 'line-40',
          descriptionEn: 'Telecom Warehouse Management & Storage - Feb 2026',
          descriptionAr: 'إدارة وتخزين مستودعات الاتصالات - فبراير 2026',
          quantity: 1,
          unitPriceSAR: 280000,
          lineTotalSAR: 280000,
          vatRatePercent: 15,
          vatAmountSAR: 42000,
          totalIncVatSAR: 322000,
          glAccountCode: '404000',
          costCenterCode: 'CC-CENTRAL-01'
        }
      ],
      subtotalSAR: 280000,
      totalVatSAR: 42000,
      totalAmountSAR: 322000,
      totalAmountInCurrency: 322000,
      paidAmountSAR: 0,
      balanceDueSAR: 322000,
      status: 'SENT',
      poNumber: 'PO-STC-2026-FEB',
      attachmentsCount: 1,
      revisionNumber: 1,
      statusHistory: [
        { status: 'DRAFT', changedBy: 'Billing Officer', changedAt: '2026-02-01T08:00:00Z' },
        { status: 'ISSUED', changedBy: 'Finance Manager', changedAt: '2026-02-01T09:00:00Z' },
        { status: 'SENT', changedBy: 'System Auto-Email', changedAt: '2026-02-01T09:05:00Z' }
      ],
      createdAt: '2026-02-01',
      updatedAt: '2026-02-01'
    }
  ];

  private revenueSchedules: RevenueSchedule[] = [
    {
      id: 'rev-001',
      invoiceId: 'inv-004',
      invoiceNumber: 'INV-UAE-2026-00088',
      customerId: 'cust-104',
      customerNameEn: 'Landmark Retail Dubai FZCO',
      performanceObligationDescriptionEn: 'Multi-Leg Regional Logistics & Distribution Contract',
      performanceObligationDescriptionAr: 'عقد اللوجستيات والتوزيع الإقليمي متعدد المناهج',
      totalContractValueSAR: 435000,
      deferredRevenueBalanceSAR: 290000,
      recognizedRevenueBalanceSAR: 145000,
      revRecRule: 'IFRS15_PERFORMANCE_OBLIGATION',
      recognitionPeriodStart: '2026-01-01',
      recognitionPeriodEnd: '2026-03-31',
      status: 'PARTIALLY_RECOGNIZED',
      lastPostingDate: '2026-01-25',
      milestones: [
        {
          milestoneId: 'ms-1',
          nameEn: 'Milestone 1 - Origin Departure',
          nameAr: 'المرحلة 1 - مغادرة بلد المنشأ',
          targetPercent: 33.33,
          amountSAR: 145000,
          status: 'RECOGNIZED',
          recognizedDate: '2026-01-25',
          glPostingJvRef: 'JV-2026-0881'
        },
        {
          milestoneId: 'ms-2',
          nameEn: 'Milestone 2 - Customs Clearance & Cross-Docking',
          nameAr: 'المرحلة 2 - التخليص الجمركي والعبور',
          targetPercent: 33.33,
          amountSAR: 145000,
          status: 'PENDING'
        },
        {
          milestoneId: 'ms-3',
          nameEn: 'Milestone 3 - Final Delivery & POD Confirmation',
          nameAr: 'المرحلة 3 - التسليم النهائي وتأكيد إثبات التسليم',
          targetPercent: 33.34,
          amountSAR: 145000,
          status: 'PENDING'
        }
      ]
    },
    {
      id: 'rev-002',
      invoiceId: 'inv-005',
      invoiceNumber: 'INV-MIL-2026-00012',
      customerId: 'cust-105',
      customerNameEn: 'Saudi Telecom Company (STC Logistics)',
      performanceObligationDescriptionEn: '12-Month Dedicated Warehouse Service Level Agreement',
      performanceObligationDescriptionAr: 'اتفاقية مستوى خدمة المستودع المخصص لمده 12 شهرًا',
      totalContractValueSAR: 3360000,
      deferredRevenueBalanceSAR: 3080000,
      recognizedRevenueBalanceSAR: 280000,
      revRecRule: 'TIME_STRAIGHT_LINE',
      recognitionPeriodStart: '2026-01-01',
      recognitionPeriodEnd: '2026-12-31',
      status: 'PARTIALLY_RECOGNIZED',
      lastPostingDate: '2026-01-31',
      milestones: [
        {
          milestoneId: 'm-jan-2026',
          nameEn: 'January 2026 Recognized Portion',
          nameAr: 'الحصة المعترف بها لشهر يناير 2026',
          targetPercent: 8.33,
          amountSAR: 280000,
          status: 'RECOGNIZED',
          recognizedDate: '2026-01-31',
          glPostingJvRef: 'JV-2026-0902'
        },
        {
          milestoneId: 'm-feb-2026',
          nameEn: 'February 2026 Recognized Portion',
          nameAr: 'الحصة المعترف بها لشهر فبراير 2026',
          targetPercent: 8.33,
          amountSAR: 280000,
          status: 'PENDING'
        }
      ]
    }
  ];

  private payments: CustomerPayment[] = [
    {
      id: 'pay-001',
      paymentNumber: 'PAY-2026-0812',
      customerId: 'cust-101',
      customerNameEn: 'SABIC Petrochemicals Co.',
      customerNameAr: 'شركة سابك للبتروكيماويات',
      paymentDate: '2026-02-02',
      paymentMethod: 'ADYEN_CARD',
      referenceTransactionId: 'ADY-TX-998218203',
      currencyCode: 'SAR',
      paymentAmountSAR: 189750,
      unallocatedAmountSAR: 0,
      status: 'ALLOCATED',
      bankAccountCode: '101100',
      notesEn: 'Processed through Adyen Enterprise Merchant Portal',
      allocations: [
        {
          id: 'alloc-1',
          paymentId: 'pay-001',
          invoiceId: 'inv-001',
          invoiceNumber: 'INV-SA-2026-00412',
          allocatedAmountSAR: 189750,
          allocationDate: '2026-02-02',
          allocationType: 'AUTOMATIC'
        }
      ]
    },
    {
      id: 'pay-002',
      paymentNumber: 'PAY-2026-0840',
      customerId: 'cust-102',
      customerNameEn: 'Panda Retail Group KSA',
      customerNameAr: 'مجموعة بنده للتجزئة السعودية',
      paymentDate: '2026-02-01',
      paymentMethod: 'BANK_TRANSFER',
      referenceTransactionId: 'NCB-WIRE-2026-1182',
      currencyCode: 'SAR',
      paymentAmountSAR: 100000,
      unallocatedAmountSAR: 0,
      status: 'ALLOCATED',
      bankAccountCode: '101100',
      notesEn: 'Partial remittance against consolidated cold chain invoice',
      allocations: [
        {
          id: 'alloc-2',
          paymentId: 'pay-002',
          invoiceId: 'inv-002',
          invoiceNumber: 'INV-SA-2026-00488',
          allocatedAmountSAR: 100000,
          allocationDate: '2026-02-01',
          allocationType: 'MANUAL'
        }
      ]
    }
  ];

  private creditProfiles: CustomerCreditProfile[] = [
    {
      id: 'cred-101',
      customerId: 'cust-101',
      customerNameEn: 'SABIC Petrochemicals Co.',
      customerNameAr: 'شركة سابك للبتروكيماويات',
      creditLimitSAR: 5000000,
      currentExposureSAR: 0,
      availableCreditSAR: 5000000,
      creditHold: false,
      riskRating: 'LOW',
      paymentBehaviorScore: 98,
      dsoDays: 18,
      totalOverdueSAR: 0,
      lastReviewedAt: '2026-01-01',
      approvalMatrix: [
        { level: 'Tier 1 CFO Approval', approverName: 'Mohammed Al-Ghamdi', approvedAt: '2026-01-01', limitApprovedSAR: 5000000 }
      ]
    },
    {
      id: 'cred-102',
      customerId: 'cust-102',
      customerNameEn: 'Panda Retail Group KSA',
      customerNameAr: 'مجموعة بنده للتجزئة السعودية',
      creditLimitSAR: 2500000,
      currentExposureSAR: 148400,
      availableCreditSAR: 2351600,
      creditHold: false,
      riskRating: 'LOW',
      paymentBehaviorScore: 92,
      dsoDays: 28,
      totalOverdueSAR: 0,
      lastReviewedAt: '2026-01-10',
      approvalMatrix: [
        { level: 'Finance Director', approverName: 'Sami Al-Otaibi', approvedAt: '2026-01-10', limitApprovedSAR: 2500000 }
      ]
    },
    {
      id: 'cred-103',
      customerId: 'cust-103',
      customerNameEn: 'Almarai Logistics Division',
      customerNameAr: 'شركة المراعي - قطاع اللوجستيات',
      creditLimitSAR: 1000000,
      currentExposureSAR: 368000,
      availableCreditSAR: 632000,
      creditHold: true,
      holdReasonEn: 'Invoice INV-SA-2026-00512 overdue > 25 days beyond 30-day grace',
      holdReasonAr: 'الفاتورة تجاوزت فترة السماح بأكثر من 25 يومًا',
      riskRating: 'HIGH',
      paymentBehaviorScore: 58,
      dsoDays: 57,
      totalOverdueSAR: 368000,
      lastReviewedAt: '2026-01-28',
      approvalMatrix: [
        { level: 'Credit Risk Committee', approverName: 'Fahad Al-Harbi', approvedAt: '2025-11-15', limitApprovedSAR: 1000000 }
      ]
    }
  ];

  private collectionCases: CollectionCase[] = [
    {
      id: 'case-001',
      caseNumber: 'DUN-2026-0091',
      customerId: 'cust-103',
      customerNameEn: 'Almarai Logistics Division',
      customerNameAr: 'شركة المراعي - قطاع اللوجستيات',
      outstandingAmountSAR: 368000,
      overdueDays: 27,
      dunningLevel: 'LEVEL_2_NOTICE',
      lastContactDate: '2026-02-03',
      nextFollowUpDate: '2026-02-08',
      promisedPaymentDate: '2026-02-12',
      promisedAmountSAR: 368000,
      legalStatus: 'ESCALATED',
      assignedAgent: 'Tariq Al-Mansoor (Senior Collections Specialist)',
      notes: [
        {
          id: 'cn-1',
          date: '2026-01-20',
          author: 'System Auto-Dunning',
          noteEn: 'Sent Level 1 Polite Payment Reminder via Email & SMS',
          noteAr: 'تم إرسال تذكير الدفع الودي المستوى 1 عبر البريد الإلكتروني والرسائل النصية'
        },
        {
          id: 'cn-2',
          date: '2026-02-03',
          author: 'Tariq Al-Mansoor',
          noteEn: 'Spoke with Treasury Manager. Customer promised full wire transfer on Feb 12.',
          noteAr: 'تم التحدث مع مدير الخزينة. وعد العميل بتحويل كامل المبلغ في 12 فبراير.'
        }
      ]
    }
  ];

  private badDebtProvisions: BadDebtProvision[] = [
    {
      id: 'bd-001',
      customerId: 'cust-103',
      customerNameEn: 'Almarai Logistics Division',
      invoiceId: 'inv-003',
      invoiceNumber: 'INV-SA-2026-00512',
      invoiceAmountSAR: 368000,
      overdueDays: 27,
      provisionPercent: 20,
      provisionAmountSAR: 73600,
      status: 'PROVISIONED',
      writeOffReasonEn: 'Conservative IFRS 9 Expected Credit Loss (ECL) Provision',
      writeOffReasonAr: 'مخصص الخسائر الائتمانية المتوقعة للتحفظ المحاسبي المعيار الدولي 9',
      createdAt: '2026-01-31'
    }
  ];

  private aiInsights: AIReceivablesInsight[] = [
    {
      id: 'ai-ar-1',
      category: 'LATE_PAYMENT_RISK',
      titleEn: 'Almarai Account High Delay Risk',
      titleAr: 'مخاطر تأخير عالية لحساب شركة المراعي',
      descriptionEn: 'Payment pattern analysis predicts 84% likelihood of payment delay beyond 45 days based on recent quarterly audit holds.',
      descriptionAr: 'يتوقع تحليل نمط السداد احتمالية 84% لتأخير السداد لأكثر من 45 يومًا بناءً على المراجعات الأخيرة.',
      riskLevel: 'HIGH',
      impactSAR: 368000,
      recommendedActionEn: 'Trigger automated credit hold on new shipment bookings until 50% settlement received.',
      recommendedActionAr: 'تفعيل إيقاف الائتمان الآلي لحجوزات الشحنات الجديدة حتى استلام 50% من المبلغ.',
      confidenceScore: 91
    },
    {
      id: 'ai-ar-2',
      category: 'REVENUE_FORECAST',
      titleEn: 'Projected Cash Inflow Feb 2026',
      titleAr: 'تدفقات نقدية متوقعة لشهر فبراير 2026',
      descriptionEn: 'AI engine projects SAR 1,180,000 cash collection during February based on payment terms and Adyen auto-debit arrangements.',
      descriptionAr: 'يتوقع محرك الذكاء الاصطناعي تحصيل 1,180,000 ريال خلال فبراير بناءً على شروط السداد وسحوبات أديين.',
      riskLevel: 'LOW',
      impactSAR: 1180000,
      recommendedActionEn: 'Optimize liquidity allocation for Q1 capital logistics fleet expansion.',
      recommendedActionAr: 'تحسين تخصيص السيولة للتوسع اللوجستي للأسطول في الربع الأول.',
      confidenceScore: 95
    },
    {
      id: 'ai-ar-3',
      category: 'CREDIT_LIMIT',
      titleEn: 'SABIC Credit Limit Expansion Eligibility',
      titleAr: 'أهلية شركة سابك لتوسيع الحد الائتماني',
      descriptionEn: 'SABIC exhibits 98% on-time settlement history. Recommended credit limit increase from SAR 5.0M to SAR 7.5M.',
      descriptionAr: 'تتمتع سابك بسجل سداد في الوقت المحدد بنسبة 98%. يوصى بزيادة الحد الائتماني إلى 7.5 مليون ريال.',
      riskLevel: 'LOW',
      impactSAR: 2500000,
      recommendedActionEn: 'Submit credit limit revision proposal to C-Suite approval committee.',
      recommendedActionAr: 'تقديم مقترح تعديل الحد الائتماني للجنة الموافقات التنفيذية.',
      confidenceScore: 96
    }
  ];

  public static getInstance(): AccountsReceivableRepository {
    if (!AccountsReceivableRepository.instance) {
      AccountsReceivableRepository.instance = new AccountsReceivableRepository();
    }
    return AccountsReceivableRepository.instance;
  }

  // --- INVOICES ---
  public getInvoices(): CustomerInvoice[] {
    return [...this.invoices];
  }

  public getInvoiceById(id: string): CustomerInvoice | undefined {
    return this.invoices.find(inv => inv.id === id || inv.invoiceNumber === id);
  }

  public addInvoice(newInvoiceData: Omit<CustomerInvoice, 'id' | 'paidAmountSAR' | 'balanceDueSAR' | 'statusHistory' | 'createdAt' | 'updatedAt'>): CustomerInvoice {
    const nextSeq = this.invoices.length + 489;
    const invoiceNumber = newInvoiceData.invoiceNumber || `${newInvoiceData.series}-2026-0${nextSeq}`;

    const paidAmountSAR = 0;
    const balanceDueSAR = newInvoiceData.totalAmountSAR;

    const created: CustomerInvoice = {
      ...newInvoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      paidAmountSAR,
      balanceDueSAR,
      statusHistory: [
        { status: newInvoiceData.status || 'DRAFT', changedBy: 'Billing Engine', changedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.invoices.unshift(created);

    // If Revenue Schedule needed
    if (newInvoiceData.billingType === 'MILESTONE' || newInvoiceData.billingType === 'RECURRING') {
      this.revenueSchedules.push({
        id: `rev-${Date.now()}`,
        invoiceId: created.id,
        invoiceNumber: created.invoiceNumber,
        customerId: created.customerId,
        customerNameEn: created.customerNameEn,
        performanceObligationDescriptionEn: `Performance obligation for ${created.invoiceNumber}`,
        performanceObligationDescriptionAr: `التزام الأداء للفاتورة ${created.invoiceNumber}`,
        totalContractValueSAR: created.subtotalSAR,
        deferredRevenueBalanceSAR: created.subtotalSAR,
        recognizedRevenueBalanceSAR: 0,
        revRecRule: 'IFRS15_PERFORMANCE_OBLIGATION',
        recognitionPeriodStart: created.issueDate,
        recognitionPeriodEnd: created.dueDate,
        milestones: [
          {
            milestoneId: `m1-${Date.now()}`,
            nameEn: 'Milestone 1 Initial Recognition',
            nameAr: 'المرحلة 1 الاعتراف الأولي',
            targetPercent: 100,
            amountSAR: created.subtotalSAR,
            status: 'PENDING'
          }
        ],
        status: 'DEFERRED'
      });
    }

    return created;
  }

  public updateInvoiceStatus(id: string, status: InvoiceStatus, noteEn?: string, noteAr?: string, changedBy: string = 'AR Finance Officer'): CustomerInvoice {
    const inv = this.invoices.find(i => i.id === id);
    if (!inv) throw new Error('Invoice not found');

    inv.status = status;
    inv.updatedAt = new Date().toISOString().split('T')[0];
    inv.statusHistory.unshift({
      status,
      changedBy,
      changedAt: new Date().toISOString(),
      noteEn,
      noteAr
    });

    return inv;
  }

  // --- REVENUE RECOGNITION (IFRS 15) ---
  public getRevenueSchedules(): RevenueSchedule[] {
    return [...this.revenueSchedules];
  }

  public recognizeMilestone(scheduleId: string, milestoneId: string): RevenueSchedule {
    const sched = this.revenueSchedules.find(s => s.id === scheduleId);
    if (!sched) throw new Error('Revenue Schedule not found');

    const milestone = sched.milestones.find(m => m.milestoneId === milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    if (milestone.status === 'RECOGNIZED') throw new Error('Milestone already recognized');

    milestone.status = 'RECOGNIZED';
    milestone.recognizedDate = new Date().toISOString().split('T')[0];
    milestone.glPostingJvRef = `JV-REV-${Math.floor(Math.random() * 9000 + 1000)}`;

    sched.recognizedRevenueBalanceSAR += milestone.amountSAR;
    sched.deferredRevenueBalanceSAR = Math.max(0, sched.deferredRevenueBalanceSAR - milestone.amountSAR);

    if (sched.deferredRevenueBalanceSAR === 0) {
      sched.status = 'RECOGNIZED';
    } else {
      sched.status = 'PARTIALLY_RECOGNIZED';
    }

    sched.lastPostingDate = milestone.recognizedDate;
    return sched;
  }

  // --- PAYMENTS & ALLOCATION ---
  public getPayments(): CustomerPayment[] {
    return [...this.payments];
  }

  public createPayment(paymentData: Omit<CustomerPayment, 'id' | 'paymentNumber' | 'status' | 'unallocatedAmountSAR' | 'allocations'>): CustomerPayment {
    const nextSeq = this.payments.length + 841;
    const paymentNumber = `PAY-2026-0${nextSeq}`;

    const newPayment: CustomerPayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      paymentNumber,
      unallocatedAmountSAR: paymentData.paymentAmountSAR,
      status: 'PENDING',
      allocations: []
    };

    this.payments.unshift(newPayment);
    return newPayment;
  }

  public allocatePayment(paymentId: string, invoiceId: string, amountSAR: number): CustomerPayment {
    const pay = this.payments.find(p => p.id === paymentId);
    if (!pay) throw new Error('Payment record not found');

    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Target Invoice not found');

    if (amountSAR > pay.unallocatedAmountSAR) {
      throw new Error(`Allocated amount (${amountSAR} SAR) exceeds available unallocated payment balance (${pay.unallocatedAmountSAR} SAR).`);
    }

    // Apply to invoice
    inv.paidAmountSAR += amountSAR;
    inv.balanceDueSAR = Math.max(0, inv.totalAmountSAR - inv.paidAmountSAR);
    if (inv.balanceDueSAR === 0) {
      inv.status = 'PAID';
    } else {
      inv.status = 'PARTIALLY_PAID';
    }
    inv.updatedAt = new Date().toISOString().split('T')[0];

    // Apply to payment
    pay.unallocatedAmountSAR -= amountSAR;
    pay.status = pay.unallocatedAmountSAR === 0 ? 'ALLOCATED' : 'PARTIALLY_ALLOCATED';

    pay.allocations.push({
      id: `alloc-${Date.now()}`,
      paymentId: pay.id,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      allocatedAmountSAR: amountSAR,
      allocationDate: new Date().toISOString().split('T')[0],
      allocationType: 'MANUAL'
    });

    return pay;
  }

  // --- CREDIT MANAGEMENT ---
  public getCreditProfiles(): CustomerCreditProfile[] {
    return [...this.creditProfiles];
  }

  public updateCreditLimit(customerId: string, newLimitSAR: number, approvedBy: string): CustomerCreditProfile {
    const profile = this.creditProfiles.find(c => c.customerId === customerId);
    if (!profile) throw new Error('Customer credit profile not found');

    profile.creditLimitSAR = newLimitSAR;
    profile.availableCreditSAR = Math.max(0, newLimitSAR - profile.currentExposureSAR);
    profile.lastReviewedAt = new Date().toISOString().split('T')[0];
    profile.approvalMatrix.unshift({
      level: 'Credit Limit Revision',
      approverName: approvedBy,
      approvedAt: new Date().toISOString().split('T')[0],
      limitApprovedSAR: newLimitSAR
    });

    return profile;
  }

  public toggleCreditHold(customerId: string, hold: boolean, reasonEn?: string, reasonAr?: string): CustomerCreditProfile {
    const profile = this.creditProfiles.find(c => c.customerId === customerId);
    if (!profile) throw new Error('Customer credit profile not found');

    profile.creditHold = hold;
    if (hold) {
      profile.holdReasonEn = reasonEn || 'Manual credit hold imposed by Finance Director';
      profile.holdReasonAr = reasonAr || 'إيقاف ائتماني يدوي بقرار مدير المالية';
    } else {
      profile.holdReasonEn = undefined;
      profile.holdReasonAr = undefined;
    }

    return profile;
  }

  // --- COLLECTIONS & DUNNING ---
  public getCollectionCases(): CollectionCase[] {
    return [...this.collectionCases];
  }

  public addCollectionNote(caseNumber: string, noteEn: string, noteAr: string, author: string): CollectionCase {
    const colCase = this.collectionCases.find(c => c.caseNumber === caseNumber);
    if (!colCase) throw new Error('Collection case not found');

    colCase.notes.unshift({
      id: `cn-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author,
      noteEn,
      noteAr
    });

    return colCase;
  }

  public updateDunningLevel(caseNumber: string, newLevel: DunningLevel): CollectionCase {
    const colCase = this.collectionCases.find(c => c.caseNumber === caseNumber);
    if (!colCase) throw new Error('Collection case not found');

    colCase.dunningLevel = newLevel;
    colCase.lastContactDate = new Date().toISOString().split('T')[0];
    return colCase;
  }

  public updatePromiseToPay(caseNumber: string, promisedDate: string, promisedAmountSAR: number): CollectionCase {
    const colCase = this.collectionCases.find(c => c.caseNumber === caseNumber);
    if (!colCase) throw new Error('Collection case not found');

    colCase.promisedPaymentDate = promisedDate;
    colCase.promisedAmountSAR = promisedAmountSAR;
    colCase.notes.unshift({
      id: `cn-promise-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: 'Collections Agent',
      noteEn: `Registered Promise-to-Pay SAR ${promisedAmountSAR.toLocaleString()} due on ${promisedDate}`,
      noteAr: `تسجيل وعد بالسداد بمبلغ ${promisedAmountSAR.toLocaleString()} ريال بتاريخ ${promisedDate}`
    });

    return colCase;
  }

  // --- STATEMENTS ---
  public getCustomerStatement(customerId: string, periodStart: string, periodEnd: string): CustomerStatement {
    const custInvoices = this.invoices.filter(i => i.customerId === customerId);

    const openInvoices = custInvoices.filter(i => i.balanceDueSAR > 0 && i.status !== 'CANCELLED' && i.status !== 'VOIDED');
    const paidInvoices = custInvoices.filter(i => i.balanceDueSAR === 0 && i.status === 'PAID');

    const totalInvoicedSAR = custInvoices.reduce((sum, i) => sum + i.totalAmountSAR, 0);
    const totalPaidSAR = custInvoices.reduce((sum, i) => sum + i.paidAmountSAR, 0);
    const closingBalanceSAR = openInvoices.reduce((sum, i) => sum + i.balanceDueSAR, 0);

    const sampleNameEn = custInvoices[0]?.customerNameEn || 'Enterprise Customer';
    const sampleNameAr = custInvoices[0]?.customerNameAr || 'عميل الشركات';

    return {
      customerId,
      customerNameEn: sampleNameEn,
      customerNameAr: sampleNameAr,
      statementPeriodStart: periodStart,
      statementPeriodEnd: periodEnd,
      openingBalanceSAR: 0,
      totalInvoicedSAR,
      totalPaidSAR,
      totalCreditsSAR: 0,
      closingBalanceSAR,
      openInvoices,
      paidInvoices
    };
  }

  // --- BAD DEBT ---
  public getBadDebtProvisions(): BadDebtProvision[] {
    return [...this.badDebtProvisions];
  }

  public createBadDebtProvision(provisionData: Omit<BadDebtProvision, 'id' | 'createdAt'>): BadDebtProvision {
    const created: BadDebtProvision = {
      ...provisionData,
      id: `bd-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.badDebtProvisions.unshift(created);
    return created;
  }

  public approveWriteOff(id: string, approvedBy: string): BadDebtProvision {
    const provision = this.badDebtProvisions.find(p => p.id === id);
    if (!provision) throw new Error('Bad debt provision record not found');

    provision.status = 'APPROVED_WRITE_OFF';
    provision.approvedBy = approvedBy;

    // Update invoice status if applicable
    const inv = this.invoices.find(i => i.id === provision.invoiceId);
    if (inv) {
      inv.status = 'VOIDED';
      inv.updatedAt = new Date().toISOString().split('T')[0];
    }

    return provision;
  }

  // --- ANALYTICS ---
  public getARAnalytics(): ARAnalytics {
    const totalReceivablesSAR = this.invoices.reduce((sum, i) => sum + i.balanceDueSAR, 0);
    const totalCreditLimitsSAR = this.creditProfiles.reduce((sum, c) => sum + c.creditLimitSAR, 0);
    const currentExposureSAR = this.creditProfiles.reduce((sum, c) => sum + c.currentExposureSAR, 0);

    return {
      totalReceivablesSAR: totalReceivablesSAR + 836400, // Total open + overdue portfolio
      currentReceivablesSAR: 470400,
      overdue1_30SAR: 368000,
      overdue31_60SAR: 148000,
      overdue61_90SAR: 82000,
      overdue90PlusSAR: 168000,
      dsoDays: 32,
      collectionEfficiencyPercent: 91.4,
      totalCreditLimitsSAR,
      creditUtilizationPercent: Math.round((currentExposureSAR / (totalCreditLimitsSAR || 1)) * 100),
      highRiskCustomersCount: this.creditProfiles.filter(c => c.riskRating === 'HIGH' || c.creditHold).length,
      predictedCollection30DaysSAR: 1180000
    };
  }

  // --- AI INSIGHTS ---
  public getAIInsights(): AIReceivablesInsight[] {
    return [...this.aiInsights];
  }
}

export const accountsReceivableRepository = AccountsReceivableRepository.getInstance();
export const accountsReceivableRepo = accountsReceivableRepository;
