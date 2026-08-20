import { SemanticBusinessMetric, ExecutiveBIDashboardData } from './types';

export class BusinessIntelligenceService {
  private static readonly SEMANTIC_METRICS: SemanticBusinessMetric[] = [
    {
      metricId: 'METRIC-FIN-01',
      nameEn: 'Net Freight Revenue (SAR)',
      nameAr: 'صافي إيرادات الشحن (ريال)',
      category: 'FINANCIAL',
      formulaDefinition: 'SUM(fact_financial_ledger.gross_revenue) - SUM(disbursements_and_rebates)',
      unit: 'SAR',
      currentValue: 28450000.0,
      targetValue: 30000000.0,
      trend: 'UPWARD',
      lastCalculatedAt: new Date().toISOString(),
    },
    {
      metricId: 'METRIC-FIN-02',
      nameEn: 'EBITDA Margin (%)',
      nameAr: 'هامش الأرباح قبل الفوائد والضرائب (EBITDA)',
      category: 'FINANCIAL',
      formulaDefinition: '(Operating_Income + Depreciation + Amortization) / Net_Revenue * 100',
      unit: '%',
      currentValue: 22.4,
      targetValue: 24.0,
      trend: 'UPWARD',
      lastCalculatedAt: new Date().toISOString(),
    },
    {
      metricId: 'METRIC-OPS-03',
      nameEn: 'On-Time In-Full (OTIF) Delivery (%)',
      nameAr: 'معدل التسليم التام في الوقت المحدد (OTIF)',
      category: 'OPERATIONAL',
      formulaDefinition: 'COUNT(shipments_delivered_on_time_and_intact) / COUNT(total_delivered_shipments) * 100',
      unit: '%',
      currentValue: 96.8,
      targetValue: 98.0,
      trend: 'STABLE',
      lastCalculatedAt: new Date().toISOString(),
    },
    {
      metricId: 'METRIC-WMS-04',
      nameEn: 'Warehouse Capacity Utilization (%)',
      nameAr: 'نسبة استغلال السعة التخزينية بالمستودعات',
      category: 'WAREHOUSE',
      formulaDefinition: 'SUM(occupied_pallet_positions) / SUM(total_available_pallet_positions) * 100',
      unit: '%',
      currentValue: 84.5,
      targetValue: 85.0,
      trend: 'UPWARD',
      lastCalculatedAt: new Date().toISOString(),
    },
    {
      metricId: 'METRIC-FLEET-05',
      nameEn: 'Fleet Fuel Efficiency Score',
      nameAr: 'مؤشر كفاءة استهلاك وقود الأسطول (L/100km)',
      category: 'FLEET',
      formulaDefinition: 'AVG(total_fuel_liters_consumed / distance_traveled_km * 100)',
      unit: 'L/100km',
      currentValue: 28.2,
      targetValue: 27.0,
      trend: 'UPWARD',
      lastCalculatedAt: new Date().toISOString(),
    },
    {
      metricId: 'METRIC-AI-06',
      nameEn: 'Autonomous AI Decision Adoption Rate (%)',
      nameAr: 'نسبة اعتماد القرارات الصادرة عن الذكاء الاصطناعي',
      category: 'AI',
      formulaDefinition: 'COUNT(ai_recommendations_accepted_by_managers) / COUNT(total_ai_recommendations) * 100',
      unit: '%',
      currentValue: 91.2,
      targetValue: 95.0,
      trend: 'UPWARD',
      lastCalculatedAt: new Date().toISOString(),
    },
  ];

  public static getExecutiveDashboardData(): ExecutiveBIDashboardData {
    return {
      summaryKpis: {
        totalRevenueSAR: 28450000,
        ebitdaSAR: 6372800,
        grossMarginPct: 34.8,
        otifDeliveryPct: 96.8,
        activeShipments: 1420,
        warehouseCapacityUtilizationPct: 84.5,
        fleetEfficiencyScore: 94.2,
        aiAdoptionPercentage: 91.2,
      },
      monthlyRevenueTrend: [
        { month: 'يناير 2026', revenueSAR: 22400000, targetSAR: 22000000, costSAR: 14800000 },
        { month: 'فبراير 2026', revenueSAR: 23800000, targetSAR: 23000000, costSAR: 15400000 },
        { month: 'مارس 2026', revenueSAR: 25100000, targetSAR: 24500000, costSAR: 16200000 },
        { month: 'أبريل 2026', revenueSAR: 26900000, targetSAR: 26000000, costSAR: 17100000 },
        { month: 'مايو 2026', revenueSAR: 27400000, targetSAR: 27000000, costSAR: 17600000 },
        { month: 'يونيو 2026', revenueSAR: 28450000, targetSAR: 28000000, costSAR: 18100000 },
      ],
      regionalShipmentDistribution: [
        { region: 'المنطقة الوسطى (الرياض)', count: 540, percentage: 38.0 },
        { region: 'المنطقة الغربية (جدة / مكة / المدينة)', count: 420, percentage: 29.5 },
        { region: 'المنطقة الشرقية (الدمام / الجبيل)', count: 310, percentage: 21.8 },
        { region: 'المنطقة الشمالية والجنوبية', count: 150, percentage: 10.7 },
      ],
      carrierPerformanceComparison: [
        { carrierName: 'MAERSK LINE', otifPct: 97.4, avgCostSAR: 6800, volume: 420 },
        { carrierName: 'COSCO SHIPPING', otifPct: 95.8, avgCostSAR: 6400, volume: 380 },
        { carrierName: 'MSC MEDITERRANEAN', otifPct: 94.2, avgCostSAR: 6600, volume: 310 },
        { carrierName: 'AJA FLEET EXPRESS', otifPct: 98.9, avgCostSAR: 4200, volume: 610 },
      ],
      dataQualityHealthScore: 98.6,
      pipelineHealthPct: 99.9,
    };
  }

  public static getSemanticMetrics(): SemanticBusinessMetric[] {
    return this.SEMANTIC_METRICS;
  }

  public static executeSelfServiceQuery(metricId: string, _groupBy: string) {
    const metric = this.SEMANTIC_METRICS.find((m) => m.metricId === metricId) || this.SEMANTIC_METRICS[0];
    return {
      metricName: metric.nameAr,
      formula: metric.formulaDefinition,
      resultValue: metric.currentValue,
      unit: metric.unit,
      executedAt: new Date().toISOString(),
      breakdown: [
        { dimension: 'القطاع التجاري (B2B Enterprise)', val: metric.currentValue * 0.62 },
        { dimension: 'قطاع الحكومة والشبه حكومي', val: metric.currentValue * 0.25 },
        { dimension: 'شحنات الأفراد والتجزئة', val: metric.currentValue * 0.13 },
      ],
    };
  }
}
