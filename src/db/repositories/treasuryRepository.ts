import {
  BankAccount,
  CashMovement,
  TreasuryDeal,
  PaymentBatch,
  BankStatement,
  LiquidityForecastItem,
  FXRate,
  FXExposure,
  FinancialSettlement,
  AITreasuryInsight,
  PaymentBatchStatus,
  ReconMatchStatus
} from '../../types/treasury';

class TreasuryRepository {
  private bankAccounts: BankAccount[] = [
    {
      id: 'bank-101',
      accountNumber: '102938475601',
      accountNameEn: 'Saudi National Bank - Primary Corporate Treasury',
      accountNameAr: 'البنك الأهلي السعودي - حساب الخزينة الرئيسي للشركة',
      bankNameEn: 'Saudi National Bank (SNB)',
      bankNameAr: 'البنك الأهلي السعودي',
      swiftCode: 'NCBKSARIXXX',
      iban: 'SA031000000102938475601',
      branchNameEn: 'King Abdullah Financial District Branch, Riyadh',
      branchNameAr: 'فرع مركز الملك عبد الله المالي، الرياض',
      currency: 'SAR',
      accountType: 'TREASURY',
      status: 'ACTIVE',
      currentBalance: 42850000,
      availableBalance: 41200000,
      unreconciledAmount: 125000,
      glAccountCode: '1010-01-001',
      signatories: [
        { id: 'sig-1', nameEn: 'Fahad Al-Otaibi', nameAr: 'فهد العتيبي', role: 'Group CFO', approvalLimitSAR: 50000000, status: 'ACTIVE' },
        { id: 'sig-2', nameEn: 'Sara Al-Ghamdi', nameAr: 'سارة الغامدي', role: 'Treasury Director', approvalLimitSAR: 15000000, status: 'ACTIVE' }
      ],
      creditLimitSAR: 100000000
    },
    {
      id: 'bank-102',
      accountNumber: '998877665502',
      accountNameEn: 'Al Rajhi Bank - Vendor Disbursement & Payroll',
      accountNameAr: 'مصرف الراجحي - مدفوعات الموردين والرواتب',
      bankNameEn: 'Al Rajhi Bank',
      bankNameAr: 'مصرف الراجحي',
      swiftCode: 'RJHISARIXXX',
      iban: 'SA808000000998877665502',
      branchNameEn: 'Olaya Corporate Center, Riyadh',
      branchNameAr: 'مركز العلياء للشركات، الرياض',
      currency: 'SAR',
      accountType: 'PAYROLL',
      status: 'ACTIVE',
      currentBalance: 14600000,
      availableBalance: 14600000,
      unreconciledAmount: 48000,
      glAccountCode: '1010-01-002',
      signatories: [
        { id: 'sig-3', nameEn: 'Tariq Al-Harbi', nameAr: 'طارق الحربي', role: 'Payroll Manager', approvalLimitSAR: 5000000, status: 'ACTIVE' }
      ]
    },
    {
      id: 'bank-103',
      accountNumber: '445566778803',
      accountNameEn: 'HSBC Middle East - International Trade & USD Escrow',
      accountNameAr: 'بنك إتش إس بي سي الشرق الأوسط - التجارة الدولية بالدولار',
      bankNameEn: 'HSBC Saudi Arabia',
      bankNameAr: 'إتش إس بي سي السعودية',
      swiftCode: 'HSBCSARIXXX',
      iban: 'SA552000000445566778803',
      branchNameEn: 'DIFC & Riyadh Global Banking Unit',
      branchNameAr: 'وحدة الخدمات المصرفية العالمية، الرياض',
      currency: 'USD',
      accountType: 'ESCROW',
      status: 'ACTIVE',
      currentBalance: 5400000, // USD
      availableBalance: 5100000,
      unreconciledAmount: 15000,
      glAccountCode: '1010-02-001',
      signatories: [
        { id: 'sig-1', nameEn: 'Fahad Al-Otaibi', nameAr: 'فهد العتيبي', role: 'Group CFO', approvalLimitSAR: 50000000, status: 'ACTIVE' }
      ]
    },
    {
      id: 'bank-104',
      accountNumber: 'ADYEN-TREASURY-01',
      accountNameEn: 'Adyen N.V. Corporate Gateway Clearing Pool',
      accountNameAr: 'حساب التسويات والتخليص - بوابة أدين العالمية',
      bankNameEn: 'Adyen N.V. Merchant Bank',
      bankNameAr: 'بنك أدين للخدمات التاجرية',
      swiftCode: 'ADYNNL2AXXX',
      iban: 'NL91ADYN0102938475',
      branchNameEn: 'Amsterdam Tech & Payment Hub',
      branchNameAr: 'مركز أمستردام للتقنية والدفع',
      currency: 'EUR',
      accountType: 'SWEEP',
      status: 'ACTIVE',
      currentBalance: 1250000, // EUR
      availableBalance: 1250000,
      unreconciledAmount: 0,
      glAccountCode: '1010-03-001',
      signatories: [
        { id: 'sig-2', nameEn: 'Sara Al-Ghamdi', nameAr: 'سارة الغامدي', role: 'Treasury Director', approvalLimitSAR: 15000000, status: 'ACTIVE' }
      ]
    }
  ];

  private cashMovements: CashMovement[] = [
    {
      id: 'mov-001',
      movementDate: '2026-02-04',
      bankAccountId: 'bank-101',
      accountNameEn: 'Saudi National Bank - Primary Corporate Treasury',
      amount: 1484000,
      currency: 'SAR',
      amountSAR: 1484000,
      direction: 'INFLOW',
      category: 'CUSTOMER_COLLECTION',
      referenceNumber: 'REF-SABIC-8891',
      descriptionEn: 'Wire Transfer from SABIC Petrochemicals - Invoice #INV-2026-001',
      descriptionAr: 'حوالة واردة من سابك للصناعات البتروكيماوية - فاتورة INV-2026-001',
      counterpartyName: 'SABIC Petrochemicals Co.',
      reconciled: true
    },
    {
      id: 'mov-002',
      movementDate: '2026-02-04',
      bankAccountId: 'bank-102',
      accountNameEn: 'Al Rajhi Bank - Vendor Disbursement & Payroll',
      amount: 520000,
      currency: 'SAR',
      amountSAR: 520000,
      direction: 'OUTFLOW',
      category: 'VENDOR_PAYMENT',
      referenceNumber: 'PAY-WPS-2026-02',
      descriptionEn: 'Batch Supplier Transfer to Arabian Logistics Fleet Maintenance',
      descriptionAr: 'دفعة سداد موردين لصالح العربية لصيانة أساطيل النقل',
      counterpartyName: 'Arabian Fleet Maintenance LLC',
      reconciled: true
    },
    {
      id: 'mov-003',
      movementDate: '2026-02-03',
      bankAccountId: 'bank-101',
      accountNameEn: 'Saudi National Bank - Primary Corporate Treasury',
      amount: 189750,
      currency: 'SAR',
      amountSAR: 189750,
      direction: 'INFLOW',
      category: 'ADYEN_SETTLEMENT',
      referenceNumber: 'ADY-SETTL-9921',
      descriptionEn: 'Daily Automated Merchant Settlement from Adyen E-Commerce Gateway',
      descriptionAr: 'تسوية يومية مجتمعة من بوابة أدين للتجارة الإلكترونية',
      counterpartyName: 'Adyen N.V.',
      reconciled: true
    },
    {
      id: 'mov-004',
      movementDate: '2026-02-02',
      bankAccountId: 'bank-103',
      accountNameEn: 'HSBC Middle East - International Trade',
      amount: 450000,
      currency: 'USD',
      amountSAR: 1687500,
      direction: 'OUTFLOW',
      category: 'TREASURY_TRANSFER',
      referenceNumber: 'SWIFT-HSBC-00182',
      descriptionEn: 'Cross-Border Freight Charter Settlement to Maersk Line AS',
      descriptionAr: 'تسوية شحن بحري عابر للحدود لصالح شركة ميرسك للخطوط البحرية',
      counterpartyName: 'Maersk Line A/S Denmark',
      reconciled: false
    }
  ];

  private treasuryDeals: TreasuryDeal[] = [
    {
      id: 'deal-501',
      dealNumber: 'TD-2026-009',
      dealType: 'TERM_DEPOSIT',
      counterpartyBankEn: 'Saudi National Bank (SNB)',
      counterpartyBankAr: 'البنك الأهلي السعودي',
      principalAmountSAR: 25000000,
      interestRatePercent: 5.85,
      startDate: '2026-01-15',
      maturityDate: '2026-07-15',
      accruedInterestSAR: 85250,
      currency: 'SAR',
      status: 'ACTIVE',
      traderName: 'Sara Al-Ghamdi'
    },
    {
      id: 'deal-502',
      dealNumber: 'SUK-2026-003',
      dealType: 'SUKUK',
      counterpartyBankEn: 'Al Rajhi Capital',
      counterpartyBankAr: 'الراجحي المالية',
      principalAmountSAR: 15000000,
      interestRatePercent: 6.20,
      startDate: '2025-11-01',
      maturityDate: '2026-11-01',
      accruedInterestSAR: 232500,
      currency: 'SAR',
      status: 'ACTIVE',
      traderName: 'Fahad Al-Otaibi'
    }
  ];

  private paymentBatches: PaymentBatch[] = [
    {
      id: 'batch-701',
      batchNumber: 'BATCH-SARIE-2026-042',
      createdDate: '2026-02-04',
      bankAccountId: 'bank-102',
      sourceAccountNameEn: 'Al Rajhi Bank - Vendor Disbursement',
      paymentMethod: 'SARIE_LOCAL',
      totalAmountSAR: 845000,
      totalItemsCount: 3,
      status: 'PENDING_APPROVAL',
      preparedBy: 'Salem Al-Mansoor',
      fileFormat: 'SARIE_MT103',
      items: [
        {
          id: 'item-1',
          vendorOrBeneficiaryNameEn: 'Middle East Warehouse Equipment Co.',
          vendorOrBeneficiaryNameAr: 'شركة الشرق الأوسط لعدّات المستودعات',
          ibanOrAccount: 'SA128000000112233445566',
          swiftCode: 'RJHISARIXXX',
          amount: 320000,
          currency: 'SAR',
          amountSAR: 320000,
          invoiceRef: 'INV-ME-9011',
          purposeCode: 'SUPP'
        },
        {
          id: 'item-2',
          vendorOrBeneficiaryNameEn: 'Saudi Fuel Distribution & Transport',
          vendorOrBeneficiaryNameAr: 'السعودية لتوزيع ونقل الوقود',
          ibanOrAccount: 'SA031000000778899001122',
          swiftCode: 'NCBKSARIXXX',
          amount: 525000,
          currency: 'SAR',
          amountSAR: 525000,
          invoiceRef: 'INV-FUEL-4410',
          purposeCode: 'SUPP'
        }
      ]
    },
    {
      id: 'batch-702',
      batchNumber: 'BATCH-SWIFT-2026-018',
      createdDate: '2026-02-03',
      bankAccountId: 'bank-103',
      sourceAccountNameEn: 'HSBC Middle East - International USD',
      paymentMethod: 'SWIFT_INTL',
      totalAmountSAR: 1687500,
      totalItemsCount: 1,
      status: 'APPROVED',
      preparedBy: 'Salem Al-Mansoor',
      approvedBy: 'Fahad Al-Otaibi',
      approvedDate: '2026-02-03 14:30',
      fileFormat: 'ISO20022_XML',
      items: [
        {
          id: 'item-3',
          vendorOrBeneficiaryNameEn: 'Volvo Trucks Global Spare Parts AB',
          vendorOrBeneficiaryNameAr: 'فولفو لقطع غيار الشاحنات العالمية',
          ibanOrAccount: 'SE508000089201928374',
          swiftCode: 'HANDSEESSXXX',
          amount: 450000,
          currency: 'USD',
          amountSAR: 1687500,
          invoiceRef: 'INV-VOLVO-8812',
          purposeCode: 'SUPP'
        }
      ]
    }
  ];

  private bankStatements: BankStatement[] = [
    {
      id: 'stmt-901',
      statementNumber: 'STMT-SNB-2026-02',
      bankAccountId: 'bank-101',
      bankNameEn: 'Saudi National Bank (SNB)',
      statementDate: '2026-02-04',
      openingBalance: 41176250,
      closingBalance: 42850000,
      totalDebits: 0,
      totalCredits: 1673750,
      lines: [
        {
          id: 'line-1',
          statementId: 'stmt-901',
          valueDate: '2026-02-04',
          bookingDate: '2026-02-04',
          reference: 'FT-2026-SABIC',
          descriptionEn: 'Wire Transfer IN - SABIC Petrochemicals Invoice Settlement',
          descriptionAr: 'إيداع حوالة واردة - تسوية فاتورة سابك',
          amount: 1484000,
          direction: 'CREDIT',
          balanceAfter: 42660250,
          matchStatus: 'AUTO_MATCHED',
          matchedGlJournalRef: 'JV-2026-00109',
          matchedArApRef: 'INV-2026-001'
        },
        {
          id: 'line-2',
          statementId: 'stmt-901',
          valueDate: '2026-02-04',
          bookingDate: '2026-02-04',
          reference: 'ADYEN-BATCH-09',
          descriptionEn: 'Adyen Gateway Net Merchant Settlement Batch',
          descriptionAr: 'دفعة تسوية صافي مبيعات أدين للبطاقات',
          amount: 189750,
          direction: 'CREDIT',
          balanceAfter: 42850000,
          matchStatus: 'AUTO_MATCHED',
          matchedGlJournalRef: 'JV-2026-00110',
          matchedArApRef: 'ADY-SETTL-9921'
        },
        {
          id: 'line-3',
          statementId: 'stmt-901',
          valueDate: '2026-02-04',
          bookingDate: '2026-02-04',
          reference: 'CHQ-001928',
          descriptionEn: 'Unidentified Wire Deposit - Customer Branch Reference #982',
          descriptionAr: 'إيداع نقدي غير معرّف - مرجع الفرع 982',
          amount: 125000,
          direction: 'CREDIT',
          balanceAfter: 42975000,
          matchStatus: 'UNMATCHED'
        }
      ]
    }
  ];

  private liquidityForecasts: LiquidityForecastItem[] = [
    {
      id: 'liq-1',
      forecastDate: '2026-02-09',
      periodLabel: 'Week 1 (Feb 5 - Feb 11)',
      projectedInflowSAR: 8450000,
      projectedOutflowSAR: 4200000,
      netCashFlowSAR: 4250000,
      endingCashPositionSAR: 68350000,
      liquidityGapSAR: 0,
      confidenceLevelPercent: 96
    },
    {
      id: 'liq-2',
      forecastDate: '2026-02-16',
      periodLabel: 'Week 2 (Feb 12 - Feb 18)',
      projectedInflowSAR: 12200000,
      projectedOutflowSAR: 9500000,
      netCashFlowSAR: 2700000,
      endingCashPositionSAR: 71050000,
      liquidityGapSAR: 0,
      confidenceLevelPercent: 92
    },
    {
      id: 'liq-3',
      forecastDate: '2026-02-23',
      periodLabel: 'Week 3 (Feb 19 - Feb 25)',
      projectedInflowSAR: 6100000,
      projectedOutflowSAR: 14800000,
      netCashFlowSAR: -8700000,
      endingCashPositionSAR: 62350000,
      liquidityGapSAR: 0,
      confidenceLevelPercent: 88
    },
    {
      id: 'liq-4',
      forecastDate: '2026-03-02',
      periodLabel: 'Week 4 (Feb 26 - Mar 04)',
      projectedInflowSAR: 18500000,
      projectedOutflowSAR: 8100000,
      netCashFlowSAR: 10400000,
      endingCashPositionSAR: 72750000,
      liquidityGapSAR: 0,
      confidenceLevelPercent: 84
    }
  ];

  private fxRates: FXRate[] = [
    { id: 'fx-1', pair: 'USD/SAR', baseCurrency: 'USD', targetCurrency: 'SAR', spotRate: 3.7500, previousCloseRate: 3.7500, dailyChangePercent: 0.00, lastUpdated: '2026-02-04 16:00' },
    { id: 'fx-2', pair: 'EUR/SAR', baseCurrency: 'EUR', targetCurrency: 'SAR', spotRate: 4.0825, previousCloseRate: 4.0710, dailyChangePercent: 0.28, lastUpdated: '2026-02-04 16:00' },
    { id: 'fx-3', pair: 'AED/SAR', baseCurrency: 'AED', targetCurrency: 'SAR', spotRate: 1.0210, previousCloseRate: 1.0210, dailyChangePercent: 0.00, lastUpdated: '2026-02-04 16:00' }
  ];

  private fxExposures: FXExposure[] = [
    {
      id: 'exp-1',
      currency: 'USD',
      assetExposureSAR: 20250000,
      liabilityExposureSAR: 16875000,
      netExposureSAR: 3375000,
      unrealizedGainLossSAR: 0,
      recommendedHedgeActionEn: 'Natural hedge balanced against USD-denominated freight contracts.',
      recommendedHedgeActionAr: 'تحوّط طبيعي متوازن مقابل عقود الشحن المسعّرة بالدولار.'
    },
    {
      id: 'exp-2',
      currency: 'EUR',
      assetExposureSAR: 5103125,
      liabilityExposureSAR: 1200000,
      netExposureSAR: 3903125,
      unrealizedGainLossSAR: 44800,
      recommendedHedgeActionEn: 'Execute EUR/SAR Forward Cover for Q2 equipment procurements.',
      recommendedHedgeActionAr: 'تغطيّة عقود مستقبلية EUR/SAR لمشتريات المعدات للربع الثاني.'
    }
  ];

  private financialSettlements: FinancialSettlement[] = [
    {
      id: 'set-101',
      settlementRef: 'SET-ADYEN-2026-88',
      settlementDate: '2026-02-04',
      type: 'ADYEN_GATEWAY_NET',
      channel: 'ADYEN_CARD',
      grossAmountSAR: 195000,
      feeAmountSAR: 5250,
      netAmountSAR: 189750,
      status: 'MATCHED',
      arApDocumentRef: 'BATCH-ECOM-0029',
      bankAccountRef: 'bank-101',
      matchedJournalId: 'JV-2026-00110'
    },
    {
      id: 'set-102',
      settlementRef: 'SET-SARIE-2026-19',
      settlementDate: '2026-02-04',
      type: 'INCOMING',
      channel: 'BANK_SARIE',
      grossAmountSAR: 1484000,
      feeAmountSAR: 0,
      netAmountSAR: 1484000,
      status: 'MATCHED',
      arApDocumentRef: 'INV-2026-001',
      bankAccountRef: 'bank-101',
      matchedJournalId: 'JV-2026-00109'
    }
  ];

  private aiInsights: AITreasuryInsight[] = [
    {
      id: 'ai-tr-1',
      category: 'CASH_FORECAST',
      titleEn: 'Optimal Sweep Recommendation for Term Deposit Yield',
      titleAr: 'توصية بإحالة وتجميع السيولة لزيادة عائد الودائع الأجل',
      descriptionEn: 'SNB primary account maintains SAR 42.8M in idle cash. Shifting SAR 15M to 90-day Sukuk yields an additional SAR 232,500 annualized.',
      descriptionAr: 'الحساب الرئيسي في الأهلي يحتوي على 42.8 مليون ريال سيولة خاملة. تحويل 15 مليون ريال لصكوك 90 يوماً يحقق عائداً إضافياً بقيمة 232,500 ريال.',
      confidenceScore: 97,
      impactSAR: 232500,
      recommendedActionEn: 'Authorize 90-day Treasury Sukuk Allocation',
      recommendedActionAr: 'اعتماد تخصيص صكوك خزانة لمدة 90 يوماً'
    },
    {
      id: 'ai-tr-2',
      category: 'LIQUIDITY_RISK',
      titleEn: 'Predictive Liquidity Surplus in Week 4',
      titleAr: 'التنبؤ بفائض سيولة ممتاز في الأسبوع الرابع',
      descriptionEn: 'Confirmed SABIC & Panda remittances expected to raise cash reserves to SAR 72.7M by Mar 4, neutralizing short-term vendor payment pressure.',
      descriptionAr: 'تحويلات سابك وبندة المؤكدة ترفع احتياطي السيولة إلى 72.7 مليون ريال بحلول 4 مارس، مما يلغي أي ضغوط سداد.',
      confidenceScore: 94,
      impactSAR: 10400000,
      recommendedActionEn: 'Accelerate Early Vendor Discount Opportunities',
      recommendedActionAr: 'الاستفادة من خصومات السداد المبكر للموردين'
    },
    {
      id: 'ai-tr-3',
      category: 'AUTO_RECONCILIATION',
      titleEn: 'Smart Matching Engine Cleared 98.2% of Bank Lines',
      titleAr: 'محرك المطابقة الذكي أتم مطابقة 98.2% من كشوف الحساب',
      descriptionEn: 'High-precision pattern recognition matched 14 bank credits directly to General Ledger journals and Adyen settlement files without manual intervention.',
      descriptionAr: 'التعرف الذكي على الأنماط طابق 14 حركة إيداع مباشرة مع دفاتر الحسابات وتسويات أدين بدون تدخل يدوي.',
      confidenceScore: 99,
      impactSAR: 1673750,
      recommendedActionEn: 'Review Single Unmatched Deposit Line (SAR 125,000)',
      recommendedActionAr: 'مراجعة الحركة المتبقية غير المطابقة (125,000 ريال)'
    }
  ];

  // Methods
  getBankAccounts(): BankAccount[] {
    return [...this.bankAccounts];
  }

  getCashMovements(): CashMovement[] {
    return [...this.cashMovements];
  }

  getTreasuryDeals(): TreasuryDeal[] {
    return [...this.treasuryDeals];
  }

  getPaymentBatches(): PaymentBatch[] {
    return [...this.paymentBatches];
  }

  getBankStatements(): BankStatement[] {
    return [...this.bankStatements];
  }

  getLiquidityForecasts(): LiquidityForecastItem[] {
    return [...this.liquidityForecasts];
  }

  getFXRates(): FXRate[] {
    return [...this.fxRates];
  }

  getFXExposures(): FXExposure[] {
    return [...this.fxExposures];
  }

  getFinancialSettlements(): FinancialSettlement[] {
    return [...this.financialSettlements];
  }

  getAITreasuryInsights(): AITreasuryInsight[] {
    return [...this.aiInsights];
  }

  // Action methods
  addPaymentBatch(batch: PaymentBatch): void {
    this.paymentBatches.unshift(batch);
  }

  updatePaymentBatchStatus(batchId: string, status: PaymentBatchStatus, approverName?: string): void {
    const batch = this.paymentBatches.find(b => b.id === batchId);
    if (batch) {
      batch.status = status;
      if (approverName) {
        batch.approvedBy = approverName;
        batch.approvedDate = new Date().toISOString().slice(0, 16).replace('T', ' ');
      }
    }
  }

  matchStatementLine(statementId: string, lineId: string, status: ReconMatchStatus, glRef?: string): void {
    const stmt = this.bankStatements.find(s => s.id === statementId);
    if (stmt) {
      const line = stmt.lines.find(l => l.id === lineId);
      if (line) {
        line.matchStatus = status;
        if (glRef) {
          line.matchedGlJournalRef = glRef;
        }
      }
    }
  }

  addTreasuryDeal(deal: TreasuryDeal): void {
    this.treasuryDeals.unshift(deal);
  }

  getTreasurySummaryMetrics() {
    const totalCashSAR = this.bankAccounts.reduce((acc, curr) => {
      const fx = curr.currency === 'USD' ? 3.75 : curr.currency === 'EUR' ? 4.08 : 1;
      return acc + curr.currentBalance * fx;
    }, 0);

    const activeDealsSAR = this.treasuryDeals
      .filter(d => d.status === 'ACTIVE')
      .reduce((acc, curr) => acc + curr.principalAmountSAR, 0);

    const pendingPaymentsSAR = this.paymentBatches
      .filter(b => b.status === 'PENDING_APPROVAL' || b.status === 'APPROVED')
      .reduce((acc, curr) => acc + curr.totalAmountSAR, 0);

    const unreconciledSAR = this.bankAccounts.reduce((acc, curr) => acc + curr.unreconciledAmount, 0);

    return {
      totalCashSAR,
      activeDealsSAR,
      pendingPaymentsSAR,
      unreconciledSAR,
      bankAccountsCount: this.bankAccounts.length,
      liquidityRatio: 3.85
    };
  }
}

export const treasuryRepository = new TreasuryRepository();
