import { AdaptiveAuthRiskAssessment } from '../types/identity';
import { getIdentityByUserId } from '../db/repositories/identityRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';

export class AdaptiveAuthService {

  /**
   * Evaluates session risk score based on location, device reputation, impossible travel, and branch policies
   */
  public static async evaluateSessionRisk(
    userId: string,
    ipAddress: string,
    userAgent: string,
    currentLocation?: { country: string; city: string }
  ): Promise<AdaptiveAuthRiskAssessment> {
    const profile = await getIdentityByUserId(userId);
    let riskScore = 10; // Base baseline low risk
    const reasons: string[] = [];
    let isUnknownDevice = false;
    let isImpossibleTravel = false;

    // Check user agent / device
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
    const isKnownBrowser = /Chrome|Firefox|Safari|Edge/i.test(userAgent);
    if (!isKnownBrowser) {
      riskScore += 25;
      reasons.push('متصفح غير معروف أو نادراً ما يتم استخدامه');
      isUnknownDevice = true;
    }

    // Location & Impossible travel simulation
    const country = currentLocation?.country || 'SA';
    const city = currentLocation?.city || 'Riyadh';

    const allowedCountries = ['SA', 'AE', 'KW', 'BH', 'OM', 'QA', 'EG', 'JO'];
    if (!allowedCountries.includes(country)) {
      riskScore += 45;
      reasons.push(`محاولة تسجيل دخول من دولة غير مصرح بها: ${country}`);
    }

    // Check last login time / location anomalies (impossible travel mock)
    if (profile?.lastLogin) {
      const lastLoginDate = new Date(profile.lastLogin);
      const diffHours = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60);
      if (diffHours < 1 && country !== 'SA') {
        riskScore += 50;
        isImpossibleTravel = true;
        reasons.push('اكتشاف سفر غير ممكن في وقت قياسي (Impossible Travel)');
      }
    }

    // Determine Risk Level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let requiresMFA = false;
    let blocked = false;

    if (riskScore >= 75) {
      riskLevel = 'CRITICAL';
      blocked = true;
      reasons.push('تم حظر الوصول مؤقتاً بسبب تجاوز حد الخطورة المسموح');
    } else if (riskScore >= 50) {
      riskLevel = 'HIGH';
      requiresMFA = true;
      reasons.push('مطلوب تفعيل التحقق الإضافي (MFA) لإكمال عملية الدخول');
    } else if (riskScore >= 30) {
      riskLevel = 'MEDIUM';
      requiresMFA = true;
    }

    const assessment: AdaptiveAuthRiskAssessment = {
      assessmentId: `risk_${userId}_${Date.now()}`,
      userId,
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      reasons: reasons.length > 0 ? reasons : ['تم التحقق من مؤشرات الأمان بنجاح'],
      requiresMFA,
      blocked,
      locationDetails: {
        ip: ipAddress,
        country,
        city,
        isImpossibleTravel,
        isUnknownDevice
      },
      evaluatedAt: new Date().toISOString()
    };

    if (riskScore >= 50) {
      await createAuditLog({
        actorUserId: userId,
        action: 'SECURITY_UPDATE',
        entityType: 'ADAPTIVE_RISK_ASSESSMENT',
        entityId: assessment.assessmentId,
        after: { details: `Adaptive Auth triggered ${riskLevel} risk assessment (${riskScore}/100)`, assessment }
      });
    }

    return assessment;
  }
}
