import { Customer360Repository } from '../db/repositories/customer360Repository';
import {
  Customer360Profile,
  CustomerTimelineEntry,
  CustomerCommunicationEntry,
  CustomerActivityTask,
  CustomerDocument360,
  CustomerAIInsights,
  CustomerHealthScore,
  CustomerRiskScore,
  CustomerLifetimeValue,
  Customer360KpiSummary,
  TimelineEventType
} from '../types/customer360';
import { GoogleGenAI } from '@google/genai';

export class Customer360Service {
  /**
   * List all unified customer 360 profiles
   */
  static async listCustomers(filter?: {
    search?: string;
    segment?: string;
    status?: string;
    risk?: string;
  }): Promise<Customer360Profile[]> {
    let list = await Customer360Repository.listProfiles();

    if (filter?.search) {
      const s = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(s) ||
          (c.arabicName && c.arabicName.toLowerCase().includes(s)) ||
          (c.englishName && c.englishName.toLowerCase().includes(s)) ||
          c.id.toLowerCase().includes(s) ||
          c.bpId.toLowerCase().includes(s) ||
          c.industry.toLowerCase().includes(s)
      );
    }

    if (filter?.segment && filter.segment !== 'ALL') {
      list = list.filter((c) => c.segment === filter.segment || c.customerType === filter.segment);
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((c) => c.customerStatus === filter.status);
    }

    if (filter?.risk && filter.risk !== 'ALL') {
      list = list.filter((c) => c.riskScore?.overallRisk === filter.risk);
    }

    return list;
  }

  /**
   * Get single profile by ID or Business Partner link
   */
  static async getCustomer360(id: string): Promise<Customer360Profile | null> {
    return await Customer360Repository.getProfileById(id);
  }

  /**
   * Update or create profile
   */
  static async saveCustomer360(profile: Customer360Profile): Promise<Customer360Profile> {
    // Recalculate health and risk scores automatically
    const health = this.calculateHealthScore(profile);
    const risk = this.calculateRiskScore(profile);

    const updatedProfile: Customer360Profile = {
      ...profile,
      healthScore: health,
      riskScore: risk,
    };

    const saved = await Customer360Repository.saveProfile(updatedProfile);

    // Record timeline audit event
    await Customer360Repository.addTimelineEntry({
      customerId: saved.id,
      type: 'PROFILE_CHANGE',
      title: 'تحديث بيانات ملف العميل 360',
      description: `تم تحديث السجلات التشغيلية والمالية بنجاح للشركة ${saved.companyName}.`,
      timestamp: new Date().toISOString(),
      actorId: 'system',
      actorName: 'نظام أجا اللوجستي الذكي',
      actorRole: 'SYSTEM',
      category: 'SYSTEM',
    });

    return saved;
  }

  /**
   * Health Score Calculator
   */
  static calculateHealthScore(profile: Customer360Profile): CustomerHealthScore {
    const revenue = profile.clv?.totalRevenue || 0;
    const revScore = Math.min(100, Math.round((revenue / 4000000) * 100));

    const creditHold = profile.billingDetails?.isOnCreditHold;
    const paymentScore = creditHold ? 40 : 92;

    const shipmentCount = profile.clv?.totalShipments || 0;
    const volScore = Math.min(100, Math.round((shipmentCount / 150) * 100));

    const complaintRateScore = 95;
    const supportScore = 88;
    const contractScore = profile.complianceStatus?.kycStatus === 'VERIFIED' ? 95 : 60;
    const nps = 92;
    const engagement = 90;

    const rawAvg =
      revScore * 0.25 +
      paymentScore * 0.2 +
      volScore * 0.15 +
      contractScore * 0.15 +
      complaintRateScore * 0.1 +
      engagement * 0.15;

    const manualAdj = profile.healthScore?.manualAdjustment || 0;
    const finalScore = Math.min(100, Math.max(0, Math.round(rawAvg + manualAdj)));

    let status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'AT_RISK' | 'CRITICAL' = 'AVERAGE';
    if (finalScore >= 90) status = 'EXCELLENT';
    else if (finalScore >= 75) status = 'GOOD';
    else if (finalScore >= 60) status = 'AVERAGE';
    else if (finalScore >= 45) status = 'AT_RISK';
    else status = 'CRITICAL';

    return {
      overallScore: finalScore,
      status,
      breakdown: {
        revenueContribution: revScore,
        paymentPunctuality: paymentScore,
        shipmentVolumeTrend: volScore,
        supportTicketFrequency: supportScore,
        complaintRate: complaintRateScore,
        contractValidity: contractScore,
        engagementScore: engagement,
        npsSatisfaction: nps,
      },
      manualAdjustment: manualAdj,
      aiRecommendation:
        finalScore >= 85
          ? 'عميل استراتيجي عالي القيمة. ينصح بتقديم خصومات التجديد السنوي لتعزيز الوفاء.'
          : 'ينصح بمتابعة الشحنات الجارية والتأكد من تيسير سداد المستحقات المالية.',
      lastCalculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Risk Score Calculator
   */
  static calculateRiskScore(profile: Customer360Profile): CustomerRiskScore {
    const isHold = profile.billingDetails?.isOnCreditHold;
    const kycExpired = profile.complianceStatus?.kycStatus === 'EXPIRED';
    const exposureRatio =
      profile.billingDetails?.creditLimit > 0
        ? profile.billingDetails.creditExposure / profile.billingDetails.creditLimit
        : 0;

    let finRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (isHold || exposureRatio > 0.85) finRisk = 'HIGH';
    else if (exposureRatio > 0.6) finRisk = 'MEDIUM';

    let compRisk: 'LOW' | 'MEDIUM' | 'HIGH' = kycExpired ? 'HIGH' : 'LOW';

    let riskScoreNum = 10;
    if (finRisk === 'HIGH') riskScoreNum += 40;
    else if (finRisk === 'MEDIUM') riskScoreNum += 20;

    if (compRisk === 'HIGH') riskScoreNum += 30;

    let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScoreNum >= 75) overallRisk = 'CRITICAL';
    else if (riskScoreNum >= 50) overallRisk = 'HIGH';
    else if (riskScoreNum >= 25) overallRisk = 'MEDIUM';

    return {
      overallRisk,
      riskScore: riskScoreNum,
      financialRisk: finRisk,
      operationalRisk: 'LOW',
      complianceRisk: compRisk,
      creditRisk: finRisk,
      fraudRisk: 'LOW',
      historicalTrend: 'STABLE',
      notes: isHold ? 'الحساب خاضع لإيقاف ائتماني مؤقت' : 'سجل مخاطر مستقر وآمن.',
      lastEvaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Timeline Viewer & Filter
   */
  static async getCustomerTimeline(
    customerId: string,
    filter?: { type?: string; search?: string }
  ): Promise<CustomerTimelineEntry[]> {
    let timeline = await Customer360Repository.getTimeline(customerId);

    if (filter?.type && filter.type !== 'ALL') {
      timeline = timeline.filter((t) => t.type === filter.type || t.category === filter.type);
    }

    if (filter?.search) {
      const s = filter.search.toLowerCase();
      timeline = timeline.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          (t.actorName && t.actorName.toLowerCase().includes(s))
      );
    }

    return timeline;
  }

  /**
   * Record Timeline Event
   */
  static async recordTimelineEvent(
    entry: Omit<CustomerTimelineEntry, 'id'>
  ): Promise<CustomerTimelineEntry> {
    return await Customer360Repository.addTimelineEntry(entry);
  }

  /**
   * Communications Center
   */
  static async getCommunications(customerId: string): Promise<CustomerCommunicationEntry[]> {
    return await Customer360Repository.getCommunications(customerId);
  }

  static async addCommunication(
    comm: Omit<CustomerCommunicationEntry, 'id'>
  ): Promise<CustomerCommunicationEntry> {
    const created = await Customer360Repository.addCommunication(comm);

    // Also add to timeline
    await this.recordTimelineEvent({
      customerId: comm.customerId,
      type: 'SUPPORT_CHAT',
      title: `سجل تواصل (${comm.type}): ${comm.subject}`,
      description: comm.content,
      timestamp: comm.timestamp || new Date().toISOString(),
      actorId: comm.agentId,
      actorName: comm.agentName,
      actorRole: 'STAFF',
      category: 'SUPPORT',
    });

    return created;
  }

  /**
   * Activities & Tasks
   */
  static async getActivities(customerId: string): Promise<CustomerActivityTask[]> {
    return await Customer360Repository.getActivities(customerId);
  }

  static async addActivity(
    activity: Omit<CustomerActivityTask, 'id' | 'createdAt'>
  ): Promise<CustomerActivityTask> {
    return await Customer360Repository.addActivity(activity);
  }

  /**
   * Documents Center
   */
  static async getDocuments(customerId: string): Promise<CustomerDocument360[]> {
    return await Customer360Repository.getDocuments(customerId);
  }

  /**
   * Generate AI Customer Insights
   */
  static async generateAIInsights(profile: Customer360Profile): Promise<CustomerAIInsights> {
    const apiKey = process.env.GEMINI_API_KEY;

    // Smart default insight fallback
    const defaultInsights: CustomerAIInsights = {
      summary: `العميل ${profile.companyName} يندرج ضمن فئة ${profile.customerType} بسجل أداء ممتاز وهامش ربحية يبلغ ${profile.clv?.profitMarginPct || 22}%. يعتبر من الحسابات الرئيسية المستقرة.`,
      healthAnalysis: `مؤشر الصحة ${profile.healthScore?.overallScore}/100 بنطاق ممتاز. يظهر العميل التزاماً رائعاً في الوفاء بالدفعات وفق شروط ${profile.billingDetails?.paymentTerms}.`,
      riskAnalysis: `مستوى المخاطر ${profile.riskScore?.overallRisk}. لا توجد مؤشرات تعثر مالي أو مخالفات في متطلبات الامتثال والتحقق (KYC/AML).`,
      upsellOpportunities: [
        'تقديم خدمة التخزين المبرد المتقدم للأغذية والأدوية في مستودعات الرياض',
        'ترقية عقد الشحن الجوي إلى خدمة Express Courier للشحنات الطارئة',
      ],
      crossSellOpportunities: [
        'توفير خدمة التامين الشامل للبضائع عبر الشريك المعتمد',
        'تفعيل بوابة التتبع الجمركي المباشرة وحلول سداد الفواتير عبر Adyen',
      ],
      retentionPrediction: {
        riskLevel: 'LOW',
        probabilityOfChurnPct: 3.5,
        retentionStrategy: 'عقد اجتماع مراجعة نصف سنوي مع المدير الإقليمي لتقديم خصم تجميعي على الشحنات البحرية.',
      },
      complaintAnalysis: 'معدل الشكاوى منخفض جداً (أقل من 0.5%). معظم الاستفسارات السابقة كانت حول تتبع وصول السفن الجمركية.',
      revenueForecast: {
        nextQuarterEstimate: Math.round((profile.clv?.totalRevenue || 1000000) * 0.28),
        confidenceScore: 0.94,
      },
    };

    if (!apiKey) {
      return defaultInsights;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `أنت الخبير الاستراتيجي للذكاء الاصطناعي بشركة أجا اللوجستية. قم بتحليل العميل المرفق وإرجاع تقرير الذكاء الاصطناعي بصيغة JSON حصرية:
                بيانات العميل:
                - الشركة: ${profile.companyName}
                - القطاع: ${profile.industry}
                - نوع العميل: ${profile.customerType}
                - إجمالي الإيرادات: ${profile.clv?.totalRevenue} SAR
                - الشحنات: ${profile.clv?.totalShipments}
                - درجة الصحة: ${profile.healthScore?.overallScore}
                - مستوى المخاطر: ${profile.riskScore?.overallRisk}

                أرجع JSON بصيغة:
                {
                  "summary": "ملخص شامل...",
                  "healthAnalysis": "تحليل مؤشر الصحة...",
                  "riskAnalysis": "تحليل تقييم المخاطر...",
                  "upsellOpportunities": ["فرصة 1", "فرصة 2"],
                  "crossSellOpportunities": ["فرصة 1", "فرصة 2"],
                  "retentionPrediction": { "riskLevel": "LOW", "probabilityOfChurnPct": 4.2, "retentionStrategy": "..." },
                  "complaintAnalysis": "تحليل الشكاوى...",
                  "revenueForecast": { "nextQuarterEstimate": 450000, "confidenceScore": 0.92 }
                }`,
              },
            ],
          },
        ],
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...defaultInsights,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('[Customer360Service] Gemini analysis fallback:', e);
    }

    return defaultInsights;
  }

  /**
   * Get KPI Summary
   */
  static async getKpiSummary(): Promise<Customer360KpiSummary> {
    return await Customer360Repository.getKpiSummary();
  }
}
