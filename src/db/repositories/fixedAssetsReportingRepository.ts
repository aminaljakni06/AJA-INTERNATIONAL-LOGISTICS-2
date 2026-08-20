import {
  FixedAsset,
  DepreciationEntry,
  IFRS16Lease,
  ZATCAInvoiceRecord,
  FinancialStatementLine,
  ConsolidatedEntity,
  AIFinanceAssetInsight,
  AssetStatus
} from '../../types/fixedAssetsReporting';

class FixedAssetsReportingRepository {
  private assets: FixedAsset[] = [
    {
      id: 'ast-101',
      assetNumber: 'AST-2026-RIG-001',
      assetNameEn: 'Volvo FH16 Heavy Multi-Axle Freight Truck',
      assetNameAr: 'شاحنة فولفو FH16 الشديدة لخدمات النقل الثقيل',
      assetClass: 'TRANSPORT_FLEET',
      serialNumber: 'VOL-8894102-KSA',
      barcode: 'BAR-771001',
      qrCode: 'QR-AST-771001',
      companyName: 'AJA International Logistics Co.',
      branchLocation: 'Riyadh Logistics Hub - Central Terminal',
      costCenterCode: 'CC-301-FLEET',
      custodian: 'Capt. Faisal Al-Harbi',
      purchaseCostSAR: 750000,
      salvageValueSAR: 120000,
      usefulLifeYears: 8,
      depreciationMethod: 'STRAIGHT_LINE',
      accumulatedDepreciationSAR: 157500,
      netBookValueSAR: 592500,
      acquisitionDate: '2024-03-15',
      commissionDate: '2024-04-01',
      status: 'OPERATIONAL'
    },
    {
      id: 'ast-102',
      assetNumber: 'AST-2026-SOLAR-002',
      assetNameEn: 'Riyadh Mega-Hub Automated Cold Chain Refrigeration Unit',
      assetNameAr: 'وحدة التبريد والتحكم بالتكييف الآلي بمركز الرياض',
      assetClass: 'WAREHOUSE_EQUIPMENT',
      serialNumber: 'COLD-SOLAR-4491-RYD',
      barcode: 'BAR-771002',
      qrCode: 'QR-AST-771002',
      companyName: 'AJA International Logistics Co.',
      branchLocation: 'Riyadh Solar Warehouse Zone 4',
      costCenterCode: 'CC-401-WH',
      custodian: 'Eng. Mansour Al-Qahtani',
      purchaseCostSAR: 3200000,
      salvageValueSAR: 400000,
      usefulLifeYears: 12,
      depreciationMethod: 'DOUBLE_DECLINING_BALANCE',
      accumulatedDepreciationSAR: 466666,
      netBookValueSAR: 2733334,
      acquisitionDate: '2024-01-10',
      commissionDate: '2024-02-01',
      status: 'OPERATIONAL'
    },
    {
      id: 'ast-103',
      assetNumber: 'AST-2026-IT-003',
      assetNameEn: 'High-Performance Edge AI Telematics Server Cluster',
      assetNameAr: 'خوادم الذكاء الاصطناعي لمعالجة وتتبع الشحنات والأسطول',
      assetClass: 'IT_HARDWARE_SOFTWARE',
      serialNumber: 'NV-DGX-90021-KSA',
      barcode: 'BAR-771003',
      qrCode: 'QR-AST-771003',
      companyName: 'AJA Tech Systems Co.',
      branchLocation: 'HQ Data Center - Riyadh',
      costCenterCode: 'CC-102-IT',
      custodian: 'Sami Al-Otaibi',
      purchaseCostSAR: 1200000,
      salvageValueSAR: 100000,
      usefulLifeYears: 5,
      depreciationMethod: 'STRAIGHT_LINE',
      accumulatedDepreciationSAR: 220000,
      netBookValueSAR: 980000,
      acquisitionDate: '2025-01-05',
      commissionDate: '2025-01-15',
      status: 'OPERATIONAL'
    }
  ];

  private depreciationSchedule: DepreciationEntry[] = [
    {
      id: 'dep-1',
      assetNumber: 'AST-2026-RIG-001',
      periodLabel: 'Q1 2026 Depreciation',
      bookDepreciationSAR: 19687.5,
      taxDepreciationSAR: 21500.0,
      accumulatedTotalSAR: 157500,
      remainingBookValueSAR: 592500,
      postingStatus: 'POSTED'
    },
    {
      id: 'dep-2',
      assetNumber: 'AST-2026-SOLAR-002',
      periodLabel: 'Q1 2026 Depreciation',
      bookDepreciationSAR: 58333.3,
      taxDepreciationSAR: 62000.0,
      accumulatedTotalSAR: 466666,
      remainingBookValueSAR: 2733334,
      postingStatus: 'POSTED'
    }
  ];

  private leaseContracts: IFRS16Lease[] = [
    {
      id: 'lease-101',
      leaseContractCode: 'LEASE-2026-WH-RYD',
      lessorNameEn: 'MODON Industrial Logistics Real Estate',
      lessorNameAr: 'هيئة المدن الصناعية والمناطق التقنية (مدن)',
      underlyingAssetDescription: 'Riyadh Automated Cold Storage Terminal (15,000 SQM)',
      startDate: '2023-01-01',
      expiryDate: '2033-12-31',
      monthlyPaymentSAR: 185000,
      discountRatePercent: 4.8,
      initialRightOfUseAssetSAR: 18500000,
      currentLeaseLiabilitySAR: 14200000,
      status: 'ACTIVE'
    }
  ];

  private zatcaInvoices: ZATCAInvoiceRecord[] = [
    {
      id: 'zat-1',
      invoiceNumber: 'INV-2026-9041',
      buyerNameEn: 'SABIC Petrochemicals Global Co.',
      buyerNameAr: 'شركة سابك للصناعات البتروكيماوية',
      vatRegistrationNumber: '310123456700003',
      issueTimestamp: '2026-08-04T14:30:00Z',
      totalBeforeVATSAR: 150000,
      vatAmountSAR: 22500,
      totalWithVATSAR: 172500,
      cryptographicStamp: 'MEQCIE9a8...ZATCA_ECDSA_STAMP_99012',
      zatcaQrCode: 'https://zatca.gov.sa/verify?qr=01020304050607080900',
      status: 'CLEARED'
    }
  ];

  private financialStatements: FinancialStatementLine[] = [
    { id: 'fs-1', accountCategory: 'ASSETS', accountNameEn: 'Property, Plant & Equipment (PPE)', accountNameAr: 'الممتلكات والآلات والمعدات', currentPeriodSAR: 142500000, priorPeriodSAR: 131000000, variancePercent: 8.78 },
    { id: 'fs-2', accountCategory: 'ASSETS', accountNameEn: 'IFRS 16 Right-of-Use Assets', accountNameAr: 'أصول أصل حق الاستخدام (IFRS 16)', currentPeriodSAR: 18500000, priorPeriodSAR: 20000000, variancePercent: -7.5 },
    { id: 'fs-3', accountCategory: 'LIABILITIES', accountNameEn: 'Lease Liabilities (IFRS 16)', accountNameAr: 'التزامات عقود الإيجار (IFRS 16)', currentPeriodSAR: 14200000, priorPeriodSAR: 16100000, variancePercent: -11.8 },
    { id: 'fs-4', accountCategory: 'REVENUE', accountNameEn: 'Logistics Operations Revenue', accountNameAr: 'إيرادات العمليات اللوجستية', currentPeriodSAR: 294700000, priorPeriodSAR: 256800000, variancePercent: 14.76 }
  ];

  private consolidatedEntities: ConsolidatedEntity[] = [
    { id: 'ent-1', entityCode: 'AJA-KSA-HQ', entityNameEn: 'AJA Logistics Parent Co. (KSA)', entityNameAr: 'شركة عجا الدولية اللوجستية (المملكة)', ownershipPercentage: 100, functionalCurrency: 'SAR', standaloneRevenueSAR: 240000000, intercompanyEliminationSAR: -15000000, consolidatedRevenueSAR: 225000000 },
    { id: 'ent-2', entityCode: 'AJA-UAE-BR', entityNameEn: 'AJA Gulf Freight Services (UAE)', entityNameAr: 'عجا لخدمات الشحن الخليجي (الإمارات)', ownershipPercentage: 100, functionalCurrency: 'AED', standaloneRevenueSAR: 54700000, intercompanyEliminationSAR: -2000000, consolidatedRevenueSAR: 52700000 }
  ];

  private aiInsights: AIFinanceAssetInsight[] = [
    {
      id: 'ai-fa-1',
      category: 'DEPRECIATION_OPTIMIZATION',
      titleEn: 'Transition Fleet Rigs to Double Declining Method to Match Wear Rate',
      titleAr: 'تحويل إهلاك الشاحنات إلى القسط المتناقص المزدوج ليتوافق مع معدل الاستهلاك الفعلي',
      descriptionEn: 'Analysis of Volvo fleet telemetry shows 65% of wear occurs in years 1-3. Accelerating tax depreciation will optimize cash flow by SAR 1.8M.',
      descriptionAr: 'بيانات تتبع الشاحنات تشير إلى أن 65% من الاستهلاك يتم في أول 3 سنوات. تعجيل الإهلاك يوفّر 1.8 مليون ريال نقدياً.',
      confidencePercent: 97,
      estimatedImpactSAR: 1800000,
      actionRequiredEn: 'Approve Depreciation Policy Amendment in System',
      actionRequiredAr: 'اعتماد تعديل سياسة الإهلاك في النظام'
    },
    {
      id: 'ai-fa-2',
      category: 'ZATCA_AUDIT_RISK',
      titleEn: '100% ZATCA Phase 2 Cryptographic Clearance Compliance Rate Verified',
      titleAr: 'التحقق بنسبة 100% من مطابقة الفواتير للختم المشفر وهيئة الزكاة والضريبة (زاتكا)',
      descriptionEn: 'Realtime validation engine confirmed zero discrepancies between General Ledger posted invoices and ZATCA Phase 2 Fatoora clearing API.',
      descriptionAr: 'محرك التحقق الفوري يربط بنسبة 100% بين فواتير الدفتر العام وبوابة الربط الإلكتروني لزاتكا.',
      confidencePercent: 99,
      estimatedImpactSAR: 0,
      actionRequiredEn: 'Maintain Automated XML Clearance Workflow',
      actionRequiredAr: 'الاستمرار في الاعتماد الآلي لربط الفواتير'
    }
  ];

  // Getters
  getAssets(): FixedAsset[] {
    return [...this.assets];
  }

  getDepreciationSchedule(): DepreciationEntry[] {
    return [...this.depreciationSchedule];
  }

  getLeaseContracts(): IFRS16Lease[] {
    return [...this.leaseContracts];
  }

  getZatcaInvoices(): ZATCAInvoiceRecord[] {
    return [...this.zatcaInvoices];
  }

  getFinancialStatements(): FinancialStatementLine[] {
    return [...this.financialStatements];
  }

  getConsolidatedEntities(): ConsolidatedEntity[] {
    return [...this.consolidatedEntities];
  }

  getAIFinanceAssetInsights(): AIFinanceAssetInsight[] {
    return [...this.aiInsights];
  }

  // Mutators
  addAsset(asset: FixedAsset): void {
    this.assets.unshift(asset);
  }

  updateAssetStatus(id: string, status: AssetStatus): void {
    const a = this.assets.find(x => x.id === id);
    if (a) {
      a.status = status;
    }
  }

  getSummaryMetrics() {
    const totalCost = this.assets.reduce((acc, curr) => acc + curr.purchaseCostSAR, 0);
    const totalAccumDep = this.assets.reduce((acc, curr) => acc + curr.accumulatedDepreciationSAR, 0);
    const netBookVal = totalCost - totalAccumDep;
    const totalLeaseLiabilities = this.leaseContracts.reduce((acc, curr) => acc + curr.currentLeaseLiabilitySAR, 0);

    return {
      totalAssetCount: this.assets.length,
      totalGrossCostSAR: totalCost,
      totalAccumulatedDepreciationSAR: totalAccumDep,
      netBookValueSAR: netBookVal,
      totalLeaseLiabilitiesSAR: totalLeaseLiabilities,
      zatcaComplianceRatePercent: 100
    };
  }
}

export const fixedAssetsReportingRepository = new FixedAssetsReportingRepository();
