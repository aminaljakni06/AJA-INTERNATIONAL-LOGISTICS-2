/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Decision & Confirmation Service
 * Phase: Enterprise UI System
 * Module: Enterprise Confirmation, Alert & Decision Dialogs
 * Version: 1.0
 */

import {
  DecisionRequest,
  DecisionResult,
  AuditMetadata,
  RiskLevel,
  BusinessActionType,
  ProtectedActionConfig,
} from '../../types/decisionFramework';
import { DialogManagerService } from './dialogManager';

class DecisionServiceClass {
  private auditLogs: AuditMetadata[] = [];

  /**
   * Generates a unique correlation ID for audit tracing
   */
  public generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Helper to construct complete AuditMetadata
   */
  public createAuditMetadata(
    action: BusinessActionType | string,
    moduleName: string,
    recordId?: string,
    riskLevel: RiskLevel = 'NORMAL'
  ): AuditMetadata {
    return {
      userId: 'USR-CURRENT-LOGISTICS-ADMIN',
      userEmail: 'admin@ajalogistics.com',
      userRole: 'LOGISTICS_SUPERVISOR',
      timestamp: Date.now(),
      action,
      moduleName,
      recordId,
      riskLevel,
      correlationId: this.generateCorrelationId(),
      requestId: `req_${Date.now()}`,
      ipAddress: '10.0.4.18',
      tenantId: 'TENANT-SAUDI-ARABIA-HQ',
    };
  }

  /**
   * Log an audit record to internal telemetry
   */
  public recordAuditLog(meta: AuditMetadata): void {
    this.auditLogs.unshift(meta);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    console.log('[ENTERPRISE AUDIT LOG CAPTURED]', meta);
  }

  /**
   * Get recently recorded audit logs
   */
  public getAuditLogs(): AuditMetadata[] {
    return [...this.auditLogs];
  }

  /**
   * Executes a Decision / Approval Request workflow with full validation & audit trails
   */
  public async requestDecision(options: DecisionRequest): Promise<DecisionResult> {
    const startTime = Date.now();
    const correlationId = this.generateCorrelationId();
    const requestId = options.id || `dec_${Date.now()}`;
    const riskLevel = options.riskLevel || 'NORMAL';

    const auditMeta = this.createAuditMetadata(
      options.actionType,
      options.moduleName,
      options.recordSummary?.recordId,
      riskLevel
    );

    return new Promise<DecisionResult>((resolve, reject) => {
      DialogManagerService.showDialog({
        id: requestId,
        titleEn: options.titleEn,
        titleAr: options.titleAr,
        subtitleEn: options.descriptionEn,
        subtitleAr: options.descriptionAr,
        isAr: options.isAr,
        metadata: {
          moduleName: options.moduleName,
          recordId: options.recordSummary?.recordId,
        },
        config: {
          size: 'md',
          variant: 'confirmation',
          closeOnBackdropClick: riskLevel !== 'CRITICAL' && riskLevel !== 'HIGH',
          closeOnEscape: true,
        },
        onResult: (res) => {
          const durationMs = Date.now() - startTime;
          const result: DecisionResult = {
            requestId,
            decisionId: res.data?.decisionId || (res.status === 'completed' ? 'confirm' : 'cancel'),
            confirmed: res.status === 'completed',
            selectedReasonCode: res.data?.selectedReasonCode,
            comment: res.data?.comment,
            typedPhrase: res.data?.typedPhrase,
            auditMetadata: auditMeta,
            durationMs,
          };

          // Record audit log
          this.recordAuditLog(auditMeta);

          if (options.onDecision) {
            options.onDecision(result);
          }

          resolve(result);
        },
      });
    });
  }

  /**
   * Helper for quick Protected Actions with Risk-Level Safety Checks
   */
  public async executeProtectedAction(
    config: ProtectedActionConfig,
    moduleName: string,
    recordId: string,
    actionFn: () => Promise<void>
  ): Promise<boolean> {
    const auditMeta = this.createAuditMetadata(
      config.actionId,
      moduleName,
      recordId,
      config.riskLevel
    );

    const isHighRisk = config.riskLevel === 'HIGH' || config.riskLevel === 'CRITICAL' || config.riskLevel === 'SECURITY';

    const confirmed = await DialogManagerService.showConfirmation({
      titleEn: `Confirm Protected Action: ${config.actionNameEn}`,
      titleAr: `تأكيد الإجراء المحمي: ${config.actionNameAr}`,
      messageEn: `Warning: This is a ${config.riskLevel} risk action. Please confirm that you intend to proceed with ${config.actionNameEn} on record #${recordId}.`,
      messageAr: `تحذير: هذا إجراء ذو خطورة (${config.riskLevel}). يرجى التأكيد لمتابعة التنفيذ على السجل رقم #${recordId}.`,
      type: isHighRisk ? 'danger' : 'warning',
      requireExplicitWord: config.requirePhrase,
      onConfirm: async () => {
        await actionFn();
        this.recordAuditLog(auditMeta);
      },
    });

    return confirmed;
  }
}

export const DecisionService = new DecisionServiceClass();
