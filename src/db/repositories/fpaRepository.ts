import {
  BudgetVersion,
  DepartmentBudgetLine,
  CapexProject,
  ForecastPeriod,
  ScenarioModel,
  VarianceItem,
  CostAllocationRule,
  ProfitabilitySegment,
  ExecutiveFinancialKPI,
  AIFPAInsight,
  BudgetStatus,
  CapexStatus
} from '../../types/fpa';

class FPARepository {
  private budgetVersions: BudgetVersion[] = [
    {
      id: 'bud-v1',
      versionCode: 'BUD-2026-V1-APPROVED',
      fiscalYear: 2026,
      budgetNameEn: '2026 Master Operating & Capital Budget',
      budgetNameAr: 'الميزانية التشغيلية والرأسمالية المعتمدة لعام 2026',
      budgetType: 'ANNUAL',
      status: 'APPROVED',
      totalBudgetSAR: 185000000,
      allocatedCapexSAR: 45000000,
      allocatedOpexSAR: 140000000,
      createdBy: 'Fahad Al-Otaibi (CFO)',
      approvedBy: 'Board of Directors',
      approvedDate: '2025-12-20'
    },
    {
      id: 'bud-v2',
      versionCode: 'BUD-2026-Q2-REVISION',
      fiscalYear: 2026,
      budgetNameEn: '2026 Q2 Strategic Mid-Year Adjustment',
      budgetNameAr: 'تعديل الميزانية النصف سنوي للربع الثاني 2026',
      budgetType: 'QUARTERLY',
      status: 'UNDER_REVIEW',
      totalBudgetSAR: 192000000,
      allocatedCapexSAR: 48000000,
      allocatedOpexSAR: 144000000,
      createdBy: 'Sara Al-Ghamdi (FP&A Director)'
    }
  ];

  private departmentBudgets: DepartmentBudgetLine[] = [
    {
      id: 'dept-1',
      budgetId: 'bud-v1',
      departmentNameEn: 'Transport & Fleet Logistics',
      departmentNameAr: 'النقل والنظافة والخدمات اللوجستية للأساطيل',
      costCenterCode: 'CC-301-FLEET',
      annualBudgetSAR: 62000000,
      actualSpentSAR: 34100000,
      encumberedSAR: 4200000,
      remainingSAR: 23700000,
      varianceSAR: -1100000,
      variancePercent: -1.8
    },
    {
      id: 'dept-2',
      budgetId: 'bud-v1',
      departmentNameEn: 'Smart Warehousing & Cold Chain Operations',
      departmentNameAr: 'المستودعات الذكية وسلسلة التبريد',
      costCenterCode: 'CC-401-WH',
      annualBudgetSAR: 48000000,
      actualSpentSAR: 24500000,
      encumberedSAR: 3100000,
      remainingSAR: 20400000,
      varianceSAR: 2100000,
      variancePercent: 4.4
    },
    {
      id: 'dept-3',
      budgetId: 'bud-v1',
      departmentNameEn: 'Digital Transformation & Enterprise IT',
      departmentNameAr: 'التحول الرقمي وتقنية المعلومات ERP',
      costCenterCode: 'CC-102-IT',
      annualBudgetSAR: 18500000,
      actualSpentSAR: 9200000,
      encumberedSAR: 1800000,
      remainingSAR: 7500000,
      varianceSAR: 800000,
      variancePercent: 4.3
    },
    {
      id: 'dept-4',
      budgetId: 'bud-v1',
      departmentNameEn: 'Procurement & Supply Chain Management',
      departmentNameAr: 'المشتريات وإدارة سلاسل الإمداد',
      costCenterCode: 'CC-201-PROC',
      annualBudgetSAR: 11500000,
      actualSpentSAR: 5800000,
      encumberedSAR: 750000,
      remainingSAR: 4950000,
      varianceSAR: 150000,
      variancePercent: 1.3
    }
  ];

  private capexProjects: CapexProject[] = [
    {
      id: 'cap-101',
      projectCode: 'CAP-2026-EV-FLEET',
      projectNameEn: 'Electric Heavy Fleet Expansion (50 Trucks)',
      projectNameAr: 'توسعة الأسطول الثقيل بالشاحنات الكهربائية (50 شاحنة)',
      department: 'Transport & Fleet Operations',
      requestedAmountSAR: 24000000,
      approvedAmountSAR: 24000000,
      spentToDateSAR: 18500000,
      projectedRoiPercent: 22.4,
      npvSAR: 8400000,
      irrPercent: 19.8,
      paybackPeriodMonths: 32,
      status: 'IN_PROGRESS',
      sponsor: 'Tariq Al-Mansoor (VP Logistics)'
    },
    {
      id: 'cap-102',
      projectCode: 'CAP-2026-SOLAR-WH',
      projectNameEn: 'Riyadh Mega-Hub Solar & Cold Storage Automation',
      projectNameAr: 'مشروع أتمتة الطاقة الشمسية والمستودعات في مركز الرياض',
      department: 'Warehouse Infrastructure',
      requestedAmountSAR: 16500000,
      approvedAmountSAR: 16500000,
      spentToDateSAR: 12000000,
      projectedRoiPercent: 28.5,
      npvSAR: 6200000,
      irrPercent: 24.1,
      paybackPeriodMonths: 28,
      status: 'IN_PROGRESS',
      sponsor: 'Khaled Al-Harbi (Infrastructure Director)'
    }
  ];

  private forecastPeriods: ForecastPeriod[] = [
    {
      id: 'fc-q1',
      periodLabel: 'Q1 2026 (Actuals Cleared)',
      budgetRevenueSAR: 62000000,
      forecastRevenueSAR: 64500000,
      actualRevenueSAR: 64800000,
      budgetExpenseSAR: 45000000,
      forecastExpenseSAR: 44200000,
      actualExpenseSAR: 44100000,
      forecastEbitdaSAR: 20700000,
      ebitdaMarginPercent: 31.9
    },
    {
      id: 'fc-q2',
      periodLabel: 'Q2 2026 (Current Period)',
      budgetRevenueSAR: 68000000,
      forecastRevenueSAR: 71200000,
      actualRevenueSAR: 71500000,
      budgetExpenseSAR: 48000000,
      forecastExpenseSAR: 47800000,
      actualExpenseSAR: 47600000,
      forecastEbitdaSAR: 23900000,
      ebitdaMarginPercent: 33.4
    },
    {
      id: 'fc-q3',
      periodLabel: 'Q3 2026 (Rolling Forecast)',
      budgetRevenueSAR: 72000000,
      forecastRevenueSAR: 75800000,
      actualRevenueSAR: 0,
      budgetExpenseSAR: 51000000,
      forecastExpenseSAR: 50200000,
      actualExpenseSAR: 0,
      forecastEbitdaSAR: 25600000,
      ebitdaMarginPercent: 33.8
    },
    {
      id: 'fc-q4',
      periodLabel: 'Q4 2026 (Rolling Forecast)',
      budgetRevenueSAR: 78000000,
      forecastRevenueSAR: 82400000,
      actualRevenueSAR: 0,
      budgetExpenseSAR: 54000000,
      forecastExpenseSAR: 53100000,
      actualExpenseSAR: 0,
      forecastEbitdaSAR: 29300000,
      ebitdaMarginPercent: 35.6
    }
  ];

  private scenarioModels: ScenarioModel[] = [
    {
      id: 'scen-1',
      scenarioNameEn: 'Base Case Growth Model (Organic Regional Expansion)',
      scenarioNameAr: 'نموذج النمو الأساسي - التوسع الإقليمي الطبيعي',
      scenarioType: 'BASE_CASE',
      revenueGrowthAssumptionPercent: 12.5,
      fuelCostIncreasePercent: 2.0,
      laborInflationPercent: 3.5,
      projectedEbitdaSAR: 99500000,
      projectedNetMarginPercent: 21.8,
      riskAssessmentEn: 'Stable macroeconomic conditions in KSA & GCC logistics corridors.',
      riskAssessmentAr: 'ظروف اقتصادية مستقرة في قطاع اللوجستيات بالمملكة ودول الخليج.'
    },
    {
      id: 'scen-2',
      scenarioNameEn: 'Optimistic High-Yield E-Commerce Surge',
      scenarioNameAr: 'السيناريو المتفائل - طفرة عقود التجارة الإلكترونية الشاملة',
      scenarioType: 'OPTIMISTIC',
      revenueGrowthAssumptionPercent: 22.0,
      fuelCostIncreasePercent: 1.5,
      laborInflationPercent: 4.0,
      projectedEbitdaSAR: 124000000,
      projectedNetMarginPercent: 26.4,
      riskAssessmentEn: 'High demand for cold chain & automated fulfillment solutions.',
      riskAssessmentAr: 'إقبال مرتفع جداً على خدمات المستودعات المؤتمتة والتبريد.'
    },
    {
      id: 'scen-3',
      scenarioNameEn: 'Pessimistic Stress Test (Fuel Spike & Freight Rate Drop)',
      scenarioNameAr: 'اختبار الضغط التحفظي - ارتفاع أسعار الوقود وتراجع الشحن',
      scenarioType: 'PESSIMISTIC_STRESS',
      revenueGrowthAssumptionPercent: 3.0,
      fuelCostIncreasePercent: 18.0,
      laborInflationPercent: 6.5,
      projectedEbitdaSAR: 68000000,
      projectedNetMarginPercent: 14.2,
      riskAssessmentEn: 'Requires immediate cost-cutting & route consolidation contingency.',
      riskAssessmentAr: 'يتطلب تفعيل خطة الطوارئ لتقليل المصاريف ودمج المسارات.'
    }
  ];

  private varianceItems: VarianceItem[] = [
    {
      id: 'var-1',
      costCenterCode: 'CC-301-FLEET',
      accountNameEn: 'Diesel Fuel & Lubricants Maintenance',
      accountNameAr: 'وقود الديزل وزيوت صيانة الأسطول',
      budgetAmountSAR: 14500000,
      actualAmountSAR: 15900000,
      varianceSAR: -1400000,
      varianceType: 'UNFAVORABLE',
      variancePercent: -9.65,
      rootCauseEn: 'Global diesel price fluctuation & long haul volume increase to NEOM corridor.',
      rootCauseAr: 'ارتفاع أسعار الوقود وزيادة حركات النقل الثقيل إلى مشروع نيوم.'
    },
    {
      id: 'var-2',
      costCenterCode: 'CC-401-WH',
      accountNameEn: 'Warehouse Power & Utility Refrigeration',
      accountNameAr: 'كهرباء وطاقة المستودعات المجمدة',
      budgetAmountSAR: 8200000,
      actualAmountSAR: 7100000,
      varianceSAR: 1100000,
      varianceType: 'FAVORABLE',
      variancePercent: 13.41,
      rootCauseEn: 'Solar panel installation in Riyadh Hub yielded 22% energy savings.',
      rootCauseAr: 'تركيب الألواح الشمسية وفر 22% من تكاليف استهلاك الكهرباء.'
    }
  ];

  private costAllocationRules: CostAllocationRule[] = [
    {
      id: 'rule-1',
      ruleCode: 'ALLOC-OVERHEAD-FLEET',
      sourcePoolEn: 'Central Fleet Maintenance & Hub Overhead Pool',
      sourcePoolAr: 'مجمع مخصصات صيانة الأسطول والمراكز الرئيسية',
      poolAmountSAR: 12000000,
      allocationDriverEn: 'Total Fleet Kilometers Driven',
      allocationDriverAr: 'إجمالي الكيلومترات المقطوعة بواسطة الأسطول',
      targetDepartments: [
        { departmentEn: 'Cross-Border Freight', departmentAr: 'الشحن الدولي عابر الحدود', percentage: 45, allocatedAmountSAR: 5400000 },
        { departmentEn: 'Domestic Express Delivery', departmentAr: 'النقل السريع المحلي', percentage: 35, allocatedAmountSAR: 4200000 },
        { departmentEn: 'Last-Mile E-Commerce', departmentAr: 'التوصيل للوجهة الأخيرة', percentage: 20, allocatedAmountSAR: 2400000 }
      ]
    }
  ];

  private profitabilitySegments: ProfitabilitySegment[] = [
    {
      id: 'prof-1',
      segmentType: 'CUSTOMER',
      segmentNameEn: 'SABIC Petrochemicals Global Logistics',
      segmentNameAr: 'سابك للصناعات البتروكيماوية العالمية',
      grossRevenueSAR: 42500000,
      directCostSAR: 26800000,
      allocatedOverheadSAR: 4100000,
      netProfitSAR: 11600000,
      netMarginPercent: 27.29,
      profitabilityRank: 1
    },
    {
      id: 'prof-2',
      segmentType: 'ROUTE',
      segmentNameEn: 'Riyadh to Dammam Heavy Freight Corridor',
      segmentNameAr: 'مسار النقل الثقيل: الرياض - الدمام',
      grossRevenueSAR: 38000000,
      directCostSAR: 24200000,
      allocatedOverheadSAR: 3900000,
      netProfitSAR: 9900000,
      netMarginPercent: 26.05,
      profitabilityRank: 2
    },
    {
      id: 'prof-3',
      segmentType: 'BRANCH',
      segmentNameEn: 'Jeddah Islamic Port Logistics Hub',
      segmentNameAr: 'مركز خدمات ميناء جدة الإسلامي',
      grossRevenueSAR: 31500000,
      directCostSAR: 21000000,
      allocatedOverheadSAR: 3200000,
      netProfitSAR: 7300000,
      netMarginPercent: 23.17,
      profitabilityRank: 3
    }
  ];

  private executiveKPIs: ExecutiveFinancialKPI[] = [
    { id: 'kpi-1', kpiNameEn: 'Annual Operating Revenue', kpiNameAr: 'إجمالي الإيرادات التشغيلية السنوية', currentValue: 294700000, targetValue: 280000000, unit: 'SAR', status: 'EXCEEDING', yoyGrowthPercent: 14.8 },
    { id: 'kpi-2', kpiNameEn: 'EBITDA Margin', kpiNameAr: 'هامش الأرباح قبل الفوائد والضرائب (EBITDA)', currentValue: 33.7, targetValue: 30.0, unit: 'PERCENT', status: 'EXCEEDING', yoyGrowthPercent: 3.2 },
    { id: 'kpi-3', kpiNameEn: 'Return on Invested Capital (ROIC)', kpiNameAr: 'العائد على رأس المال المستثمر', currentValue: 21.4, targetValue: 18.5, unit: 'PERCENT', status: 'ON_TRACK', yoyGrowthPercent: 2.1 },
    { id: 'kpi-4', kpiNameEn: 'Budget Expense Variance Ratio', kpiNameAr: 'نسبة انحراف المصاريف عن الميزانية', currentValue: 1.4, targetValue: 2.5, unit: 'PERCENT', status: 'ON_TRACK', yoyGrowthPercent: -0.8 }
  ];

  private aiInsights: AIFPAInsight[] = [
    {
      id: 'ai-fp-1',
      category: 'COST_REDUCTION',
      titleEn: 'Fleet Route Optimization Can Save SAR 2.4M Annually',
      titleAr: 'تحسين مسارات الأسطول بالذكاء الاصطناعي يوفر 2.4 مليون ريال سنوياً',
      descriptionEn: 'Machine learning analysis of NEOM & Western region transport corridors indicates 14% redundant mileage. Re-routing heavy rigs will reduce fuel variance.',
      descriptionAr: 'تحليل خوارزميات التعلم الآلي يظهر 14% كفائض في الكيلومترات المقطوعة. إعادة توزيع المسارات يقلل انحراف الوقود.',
      confidenceScore: 96,
      impactSAR: 2400000,
      recommendedActionEn: 'Implement Dynamic Dispatch Allocation Rules',
      recommendedActionAr: 'اعتماد قواعد التوزيع الديناميكي للشاحنات'
    },
    {
      id: 'ai-fp-2',
      category: 'PROFITABILITY_DRIVERS',
      titleEn: 'Cold Storage Expansion in Dammam Delivers Highest IRR (28.5%)',
      titleAr: 'توسعة مستودعات التبريد بالدمام تحقق أعلى عائد استثماري (28.5%)',
      descriptionEn: 'Predictive demand modeling suggests pharma & food contracts in the Eastern Province will yield payback in under 24 months.',
      descriptionAr: 'النماذج التنبؤية تشير إلى أن عقود الأدوية والأغذية بالمنطقة الشرقية ستحقق استرداد رأس المال خلال أقل من 24 شهراً.',
      confidenceScore: 98,
      impactSAR: 8500000,
      recommendedActionEn: 'Approve CAPEX Phase II Allocation',
      recommendedActionAr: 'اعتماد الميزانية الرأسمالية المرحلة الثانية'
    }
  ];

  // Getters
  getBudgetVersions(): BudgetVersion[] {
    return [...this.budgetVersions];
  }

  getDepartmentBudgets(): DepartmentBudgetLine[] {
    return [...this.departmentBudgets];
  }

  getCapexProjects(): CapexProject[] {
    return [...this.capexProjects];
  }

  getForecastPeriods(): ForecastPeriod[] {
    return [...this.forecastPeriods];
  }

  getScenarioModels(): ScenarioModel[] {
    return [...this.scenarioModels];
  }

  getVarianceItems(): VarianceItem[] {
    return [...this.varianceItems];
  }

  getCostAllocationRules(): CostAllocationRule[] {
    return [...this.costAllocationRules];
  }

  getProfitabilitySegments(): ProfitabilitySegment[] {
    return [...this.profitabilitySegments];
  }

  getExecutiveKPIs(): ExecutiveFinancialKPI[] {
    return [...this.executiveKPIs];
  }

  getAIFPAInsights(): AIFPAInsight[] {
    return [...this.aiInsights];
  }

  // Mutators
  addBudgetVersion(version: BudgetVersion): void {
    this.budgetVersions.unshift(version);
  }

  updateBudgetStatus(id: string, status: BudgetStatus, approverName?: string): void {
    const b = this.budgetVersions.find(v => v.id === id);
    if (b) {
      b.status = status;
      if (approverName) {
        b.approvedBy = approverName;
        b.approvedDate = new Date().toISOString().slice(0, 10);
      }
    }
  }

  addCapexProject(project: CapexProject): void {
    this.capexProjects.unshift(project);
  }

  updateCapexStatus(id: string, status: CapexStatus): void {
    const cp = this.capexProjects.find(p => p.id === id);
    if (cp) {
      cp.status = status;
    }
  }

  getFPASummaryMetrics() {
    const masterBudget = this.budgetVersions.find(b => b.status === 'APPROVED') || this.budgetVersions[0];
    const totalSpentSAR = this.departmentBudgets.reduce((acc, curr) => acc + curr.actualSpentSAR, 0);
    const totalEncumberedSAR = this.departmentBudgets.reduce((acc, curr) => acc + curr.encumberedSAR, 0);
    const netVarianceSAR = this.departmentBudgets.reduce((acc, curr) => acc + curr.varianceSAR, 0);

    return {
      masterBudgetTotalSAR: masterBudget.totalBudgetSAR,
      totalSpentSAR,
      totalEncumberedSAR,
      remainingBudgetSAR: masterBudget.totalBudgetSAR - totalSpentSAR - totalEncumberedSAR,
      netVarianceSAR,
      capexApprovedTotalSAR: this.capexProjects.reduce((acc, curr) => acc + curr.approvedAmountSAR, 0),
      avgEbitdaMarginPercent: 33.7
    };
  }
}

export const fpaRepository = new FPARepository();
