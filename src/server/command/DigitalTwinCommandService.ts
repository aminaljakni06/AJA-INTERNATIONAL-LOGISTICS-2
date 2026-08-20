import {
  DigitalTwinEntity,
  ExecutiveCockpitKPIs,
  AIDecisionRecommendation,
  CrisisManagementIncident,
  WhatIfSimulationScenario,
} from './types';

export class DigitalTwinCommandService {
  private static readonly DIGITAL_TWIN_ENTITIES: DigitalTwinEntity[] = [
    {
      entityId: 'TWIN-WH-RUH-01',
      category: 'WAREHOUSE',
      nameAr: 'مستودع الرياض المتقدم اللوجستي (Riyadh Logistics Mega-Hub)',
      nameEn: 'Riyadh Mega Logistics Hub',
      locationGeographic: { lat: 24.7136, lng: 46.6753, address: 'Riyadh Dry Port Zone, KSA' },
      status: 'OPTIMAL',
      utilizationPct: 84.5,
      activeLoadUnits: 18450,
      temperatureCelsius: 18.5,
      syncTimestamp: new Date().toISOString(),
    },
    {
      entityId: 'TWIN-PORT-[#01]',
      category: 'CUSTOMS_PORT',
      nameAr: 'ميناء الملك عبد الله الإسلامي بجدة (Jeddah Islamic Port Gate)',
      nameEn: 'Jeddah Port & Customs Gateway',
      locationGeographic: { lat: 21.4858, lng: 39.1925, address: 'Red Sea Coast, Jeddah' },
      status: 'WARNING_CONGESTION',
      utilizationPct: 91.2,
      activeLoadUnits: 3420,
      syncTimestamp: new Date().toISOString(),
    },
    {
      entityId: 'TWIN-FLEET-TRK-901',
      category: 'FLEET_TRUCK',
      nameAr: 'شاحنة النقل البارد رقم 901 (Cold Chain Autonomous Ready)',
      nameEn: 'Refrigerated Transport Unit #901',
      locationGeographic: { lat: 26.4207, lng: 50.0888, address: 'Dammam Highway En Route' },
      status: 'OPTIMAL',
      utilizationPct: 96.0,
      activeLoadUnits: 1,
      temperatureCelsius: 4.2,
      syncTimestamp: new Date().toISOString(),
    },
    {
      entityId: 'TWIN-AI-CLUSTER-01',
      category: 'AI_AGENT_CLUSTER',
      nameAr: 'عنقود الذكاء الاصطناعي لتتبع الشحنات والجمارك',
      nameEn: 'AI Operations & Customs Swarm',
      locationGeographic: { lat: 24.7136, lng: 46.6753, address: 'AJA Cloud Center, Riyadh' },
      status: 'OPTIMAL',
      utilizationPct: 68.4,
      activeLoadUnits: 12000,
      syncTimestamp: new Date().toISOString(),
    },
  ];

  private static readonly EXECUTIVE_KPIS: ExecutiveCockpitKPIs = {
    grossRevenueMonthlySar: 48500000, // 48.5M SAR
    operatingMarginPct: 24.8,
    cashPositionSar: 128400000, // 128.4M SAR
    workingCapitalSar: 64200000,
    activeOrdersCount: 14280,
    fleetAvailabilityPct: 98.4,
    warehouseUtilizationPct: 86.2,
    customerSatisfactionScore: 4.94,
    complianceScorePct: 99.9,
    aiAgentDecisionAccuracyPct: 98.8,
    overallRiskScore: 'LOW_NORMAL',
  };

  private static readonly AI_RECOMMENDATIONS: AIDecisionRecommendation[] = [
    {
      recommendationId: 'AI-REC-801',
      domain: 'LOGISTICS_ROUTING',
      titleAr: 'تحويل 45 شاحنة من ميناء جدة إلى ميناء ينبع الصناعي لتفادي ازدحام الميناء',
      titleEn: 'Reroute 45 Freight Trucks from Jeddah to Yanbu Industrial Port',
      impactEstimateSar: 340000,
      confidencePct: 96.4,
      supportingEvidenceAr: 'تحليل الرادار الفضائي ومستشعرات وقت انتظار الحاويات يبين انخفاض زمن الفسح بـ 3.2 ساعة في ينبع.',
      aiAgentModel: 'Gemini-3.6-Pro-Logistics-Planner',
      status: 'PENDING_APPROVAL',
    },
    {
      recommendationId: 'AI-REC-802',
      domain: 'TREASURY_LIQUIDITY',
      titleAr: 'استثمار 15 مليون ريال في صكوك سيادية قصيرة الأجل لمدة 30 يوماً',
      titleEn: 'Allocate 15M SAR Excess Cash into Short-Term Sovereign Sukuk',
      impactEstimateSar: 185000,
      confidencePct: 98.1,
      supportingEvidenceAr: 'التنبؤ اللحظي للسيولة يشير إلى فائض نقدي مؤكد بقيمة 22 مليون ريال حتى نهاية الشهر.',
      aiAgentModel: 'Gemini-3.6-Treasury-Agent',
      status: 'EXECUTED_AUTO',
    },
  ];

  private static readonly INCIDENTS: CrisisManagementIncident[] = [
    {
      incidentId: 'CRISIS-2026-004',
      severity: 'LEVEL_2_ELEVATED',
      titleAr: 'عاصفة ترابية على طريق الرياض - الدمام السريع وإغلاق جزئي',
      affectedRegion: 'Eastern Province, KSA',
      status: 'WAR_ROOM_ACTIVE',
      leadCommander: 'CISO / Head of Logistics Operations',
      declaredAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      actionItems: [
        { actionAr: 'تفعيل مسارات الالتفاف عبر طريق الهفوف - الخرج', owner: 'Fleet Command', completed: true },
        { actionAr: 'تنبيه السائقين وتخفيض السرعة الآلية عبر أنظمة GPS', owner: 'Safety Team', completed: true },
        { actionAr: 'تطبيق التحديث التلقائي للعملاء بشأن تأخير 45 دقيقة', owner: 'Customer Experience AI', completed: false },
      ],
    },
  ];

  private static readonly SIMULATIONS: WhatIfSimulationScenario[] = [
    {
      scenarioId: 'SIM-001',
      titleAr: 'محاكاة زيادة أسطول النقل الذاتي بنسبة 30% في المنطقة الشرقية',
      titleEn: '30% Autonomous Fleet Scale-up in Eastern Region',
      parameterAdjustments: 'Autonomous Trucks +30, Driver Shifts -20%',
      simulatedMarginChangePct: +3.8,
      simulatedDeliveryTimeChangeHours: -2.4,
      riskReductionScorePct: 92.5,
      recommendationNote: 'تحسين الربحية التشغيلية وتقليل الوقود بنسبة 14%',
    },
    {
      scenarioId: 'SIM-002',
      titleAr: 'محاكاة فتح مركز توزيع لوجستي سيناريو بالمنطقة الشمالية (نيوم)',
      titleEn: 'Establishment of NEOM Logistics Hub Center Scenario',
      parameterAdjustments: 'Capex 25M SAR, Regional Orders +45%',
      simulatedMarginChangePct: +5.2,
      simulatedDeliveryTimeChangeHours: -5.1,
      riskReductionScorePct: 88.0,
      recommendationNote: 'العائد المالي الاستثماري (ROI) يتحقق خلال 18 شهراً.',
    },
  ];

  public static getDigitalTwinEntities(): DigitalTwinEntity[] {
    return this.DIGITAL_TWIN_ENTITIES;
  }

  public static getExecutiveKPIs(): ExecutiveCockpitKPIs {
    return this.EXECUTIVE_KPIS;
  }

  public static getAIRecommendations(): AIDecisionRecommendation[] {
    return this.AI_RECOMMENDATIONS;
  }

  public static getIncidents(): CrisisManagementIncident[] {
    return this.INCIDENTS;
  }

  public static getSimulations(): WhatIfSimulationScenario[] {
    return this.SIMULATIONS;
  }

  public static approveAIRecommendation(recommendationId: string) {
    const rec = this.AI_RECOMMENDATIONS.find((r) => r.recommendationId === recommendationId);
    if (rec) {
      rec.status = 'EXECUTED_AUTO';
    }
    return {
      success: true,
      recommendationId,
      status: 'EXECUTED_AUTO',
      message: 'تمت الموافقة التنفيذية وتنفيذ التوصية عبر أنظمة القيادة الذاتية بنجاح.',
      timestamp: new Date().toISOString(),
    };
  }

  public static runSimulationScenario(scenarioId: string) {
    const sim = this.SIMULATIONS.find((s) => s.scenarioId === scenarioId) || this.SIMULATIONS[0];
    return {
      success: true,
      scenario: sim,
      executionLogsAr: 'تم تشغيل سيناريو المحاكاة عبر المحرك الرقمي (Digital Twin Physics & Financial Engine) وتأكيد الدقة بنسبة 99.2%.',
      timestamp: new Date().toISOString(),
    };
  }
}
