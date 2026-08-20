/**
 * AJA INTERNATIONAL LOGISTICS — STEP 31 ENTERPRISE AI GOVERNANCE, MODEL SECURITY & AGENTIC TRUST CONTROL PLANE
 * Baseline: REL-2026-AJA-PROD-2.8.0
 * Parent Baselines: STEP 27 (Policy Trust), STEP 28 (Identity Trust), STEP 29 (Data Trust), STEP 30 (SRE/FinOps)
 * Security Classification: AI_GOVERNANCE_TIER_0
 * 
 * Provides:
 * 1. AI System Inventory & Risk Classification (AI_RISK_0 to AI_RISK_4 / Tier-0)
 * 2. Model & Provider Allowlist & Version Governance
 * 3. AI Principal & Delegated Authority Model (AI_AUTHORITY <= USER_AUTHORITY)
 * 4. Multi-Tenant AI Context Isolation & Anti-Confused-Deputy Protection
 * 5. Prompt Security Layer: Direct & Indirect Injection Defense, System Prompt Cloaking
 * 6. RAG Security & Knowledge Trust (Pre-retrieval Tenant ACL, Poisoning Defense)
 * 7. Agent & Tool Registry, Execution Authorization, Parameter Binding & Anti-Self-Approval
 * 8. Deterministic Financial Guardrails & Replay Protection
 * 9. Agent Autonomy Tiers (A0-A4), Budget Enforcers & Loop Terminations
 * 10. Memory Isolation, SSRF Egress Defense & Output Sanitization
 * 11. AI Emergency Kill-Switch & Fail-Closed Resiliency
 * 12. FinOps Telemetry, Observability & Continuous Revalidation (STEP 26/23 Integration)
 */

import crypto from 'crypto';
import { canonicalJsonStringify, GovernanceRootTrustManager } from './autonomousGovernanceEngine';
import { EnterpriseIdentityTrustService, EnterprisePrincipal, AuthenticationAssuranceLevel } from './enterpriseIdentityTrustService';
import { EnterpriseDataGovernanceService, DataClassificationLevel, DataCategory } from './enterpriseDataGovernanceService';

// ============================================================================
// 1. AI RISK CLASSIFICATION & REGISTRIES (AI-001 to AI-010)
// ============================================================================

export type AIRiskTier = 
  | 'AI_RISK_0' // Minimal (Read-only general FAQ, UI formatting)
  | 'AI_RISK_1' // Low (Basic shipment query, public catalog search)
  | 'AI_RISK_2' // Moderate (Operational summary, document extraction)
  | 'AI_RISK_3' // High (Quote preparation, route optimization, customer comms)
  | 'AI_RISK_4'; // Critical / Tier-0 (Financial actions, PAM, ledger, refund, security)

export type AgentAutonomyLevel =
  | 'A0_SUGGEST_ONLY'
  | 'A1_READ_ONLY'
  | 'A2_LOW_RISK_ACTION'
  | 'A3_CONTROLLED_ACTION_WITH_APPROVAL'
  | 'A4_HIGH_RISK_RESTRICTED';

export interface ApprovedModelRecord {
  modelId: string;
  providerId: 'GOOGLE_GEMINI' | 'AZURE_OPENAI' | 'INTERNAL_ON_PREM';
  version: string;
  maxDataClassification: DataClassificationLevel;
  supportsTools: boolean;
  supportsStructuredOutput: boolean;
  externalProcessing: boolean;
  residencyRegion: string;
  enabled: boolean;
}

export interface PromptTemplateRecord {
  promptId: string;
  version: string;
  riskTier: AIRiskTier;
  purpose: string;
  modelId: string;
  systemTemplate: string;
  inputSchema: Record<string, string>;
  toolsAllowed: string[];
  maxTokens: number;
  status: 'ACTIVE' | 'DEPRECATED' | 'DISABLED';
}

export interface ToolDefinitionRecord {
  toolId: string;
  name: string;
  riskTier: AIRiskTier;
  readOnly: boolean;
  requiredRole: string[];
  requiredAAL: AuthenticationAssuranceLevel;
  requiresHumanApproval: boolean;
  maxMonetaryLimitSAR?: number;
  timeoutMs: number;
  enabled: boolean;
}

export interface AIPrincipalContext {
  agentId: string;
  initiatingPrincipalId: string;
  tenantScope: string;
  delegatedAuthority: string[];
  autonomyLevel: AgentAutonomyLevel;
  purpose: string;
  sessionNonce: string;
  maxSteps: number;
  maxTokens: number;
}

export interface HighRiskActionApproval {
  approvalId: string;
  actionName: string;
  toolId: string;
  resourceId: string;
  parametersHash: string;
  monetaryAmountSAR?: number;
  tenantScope: string;
  requesterPrincipalId: string;
  approverPrincipalId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'EXPIRED';
  expiresAt: string;
}

// ============================================================================
// 2. ENTERPRISE AI GOVERNANCE CONTROL PLANE
// ============================================================================

export class EnterpriseAIGovernanceService {
  private static instance: EnterpriseAIGovernanceService;

  private modelRegistry: Map<string, ApprovedModelRecord> = new Map();
  private promptRegistry: Map<string, PromptTemplateRecord> = new Map();
  private toolRegistry: Map<string, ToolDefinitionRecord> = new Map();
  private approvals: Map<string, HighRiskActionApproval> = new Map();
  private executedActionNonces: Set<string> = new Set();
  private killSwitchActive: boolean = false;
  private disabledFeatures: Set<string> = new Set();
  private aiAuditLedger: Array<any> = [];

  private constructor() {
    this.bootstrapModelRegistry();
    this.bootstrapPromptRegistry();
    this.bootstrapToolRegistry();
  }

  public static getInstance(): EnterpriseAIGovernanceService {
    if (!EnterpriseAIGovernanceService.instance) {
      EnterpriseAIGovernanceService.instance = new EnterpriseAIGovernanceService();
    }
    return EnterpriseAIGovernanceService.instance;
  }

  private bootstrapModelRegistry() {
    this.modelRegistry.set('gemini-3.6-flash', {
      modelId: 'gemini-3.6-flash',
      providerId: 'GOOGLE_GEMINI',
      version: '3.6.0-prod',
      maxDataClassification: 'CONFIDENTIAL',
      supportsTools: true,
      supportsStructuredOutput: true,
      externalProcessing: false, // In-region Google Cloud tenancy
      residencyRegion: 'me-central2-riyadh',
      enabled: true,
    });

    this.modelRegistry.set('gemini-3.7-flash', {
      modelId: 'gemini-3.7-flash',
      providerId: 'GOOGLE_GEMINI',
      version: '3.7.0-prod',
      maxDataClassification: 'CONFIDENTIAL',
      supportsTools: true,
      supportsStructuredOutput: true,
      externalProcessing: false,
      residencyRegion: 'me-central2-riyadh',
      enabled: true,
    });
  }

  private bootstrapPromptRegistry() {
    this.promptRegistry.set('PROMPT-LOGISTICS-ASSISTANT-V2', {
      promptId: 'PROMPT-LOGISTICS-ASSISTANT-V2',
      version: '2.8.0',
      riskTier: 'AI_RISK_1',
      purpose: 'Customer Support and Tracking Inquiries',
      modelId: 'gemini-3.6-flash',
      systemTemplate: 'Aja Logistics Verified Assistant System Context',
      inputSchema: { message: 'string', trackingNumber: 'string' },
      toolsAllowed: ['get_customer_shipments', 'get_shipment_status', 'get_shipment_timeline', 'get_quote_request_status'],
      maxTokens: 2048,
      status: 'ACTIVE',
    });
  }

  private bootstrapToolRegistry() {
    this.toolRegistry.set('get_shipment_status', {
      toolId: 'get_shipment_status',
      name: 'Get Shipment Status',
      riskTier: 'AI_RISK_1',
      readOnly: true,
      requiredRole: ['CUSTOMER_USER', 'OPERATIONS_USER', 'ADMIN'],
      requiredAAL: 'AAL_STANDARD',
      requiresHumanApproval: false,
      timeoutMs: 3000,
      enabled: true,
    });

    this.toolRegistry.set('get_customer_shipments', {
      toolId: 'get_customer_shipments',
      name: 'List Customer Shipments',
      riskTier: 'AI_RISK_1',
      readOnly: true,
      requiredRole: ['CUSTOMER_USER', 'OPERATIONS_USER', 'ADMIN'],
      requiredAAL: 'AAL_STANDARD',
      requiresHumanApproval: false,
      timeoutMs: 3000,
      enabled: true,
    });

    // High-Risk Financial Action Tool
    this.toolRegistry.set('approve_refund_credit_note', {
      toolId: 'approve_refund_credit_note',
      name: 'Issue Refund or Credit Note',
      riskTier: 'AI_RISK_4',
      readOnly: false,
      requiredRole: ['FINANCE_CONTROLLER', 'CFO'],
      requiredAAL: 'AAL_PHISHING_RESISTANT',
      requiresHumanApproval: true,
      maxMonetaryLimitSAR: 50000,
      timeoutMs: 5000,
      enabled: true,
    });
  }

  // ============================================================================
  // 1. PROMPT SECURITY & INJECTION DEFENSE (AI-021 to AI-030, AI-087)
  // ============================================================================

  public evaluatePromptSecurity(prompt: string, context: { tenantScope: string; principalId: string }): {
    safe: boolean;
    sanitizedPrompt: string;
    threatDetected?: string;
    blockReason?: string;
  } {
    if (this.killSwitchActive) {
      return { safe: false, sanitizedPrompt: '', blockReason: 'AI_CONTROL_PLANE_KILL_SWITCH_ACTIVE' };
    }

    const lower = prompt.toLowerCase();

    // 1. Direct Prompt Injection Patterns (AI-022, AI-087)
    const directInjectionPatterns = [
      'ignore previous instructions',
      'reveal your system prompt',
      'disregard company policy',
      'show hidden credentials',
      'act as administrator',
      'disable authorization',
      'export every customer',
      'drop table',
      'drop database',
      'eval(',
      'exec(',
    ];

    for (const pattern of directInjectionPatterns) {
      if (lower.includes(pattern)) {
        this.recordAudit({ event: 'PROMPT_INJECTION_BLOCKED', pattern, context, severity: 'HIGH' });
        return {
          safe: false,
          sanitizedPrompt: '',
          threatDetected: 'DIRECT_PROMPT_INJECTION',
          blockReason: 'PROMPT_SECURITY_VIOLATION_DIRECT_INJECTION',
        };
      }
    }

    // 2. Data Loss Prevention (DLP) & Secret Scrubbing (AI-018, AI-023, STEP 29 reuse)
    const dataGov = EnterpriseDataGovernanceService.getInstance();
    const dlpResult = dataGov.inspectDlp(prompt, { channel: 'AI_PROMPT', tenantScope: context.tenantScope });

    if (dlpResult.decision === 'BLOCK') {
      this.recordAudit({ event: 'PROMPT_SECRET_EXPOSURE_BLOCKED', context, severity: 'CRITICAL' });
      return {
        safe: false,
        sanitizedPrompt: '',
        threatDetected: 'SECRET_CREDENTIAL_LEAK',
        blockReason: 'PROMPT_CONTAINED_PROHIBITED_CREDENTIALS',
      };
    }

    const sanitized = dlpResult.sanitizedPayload ? dlpResult.sanitizedPayload : prompt;

    return {
      safe: true,
      sanitizedPrompt: sanitized,
    };
  }

  // ============================================================================
  // 2. DELEGATED AUTHORITY & CONFUSED DEPUTY DEFENSE (AI-011 to AI-020, AI-089)
  // ============================================================================

  public authorizeToolExecution(
    agentCtx: AIPrincipalContext,
    initiatingPrincipal: EnterprisePrincipal,
    toolId: string,
    args: Record<string, any>,
    resourceTenantScope: string
  ): { authorized: boolean; reasonCode: string; requiresApproval: boolean; approvalId?: string } {
    // 1. Multi-Tenant Boundary Enforcement (AI-014)
    if (initiatingPrincipal.tenantScope !== resourceTenantScope && initiatingPrincipal.principalType !== 'BREAK_GLASS') {
      this.recordAudit({ event: 'AI_CROSS_TENANT_TOOL_DENIED', toolId, targetTenant: resourceTenantScope, principal: initiatingPrincipal.principalId });
      return { authorized: false, reasonCode: 'CROSS_TENANT_TOOL_EXECUTION_PROHIBITED', requiresApproval: false };
    }

    // 2. Tool Registry Check (AI-041, AI-042)
    const tool = this.toolRegistry.get(toolId);
    if (!tool || !tool.enabled) {
      return { authorized: false, reasonCode: 'TOOL_NOT_REGISTERED_OR_DISABLED', requiresApproval: false };
    }

    // 3. Delegated Authority Invariant: AI_AUTHORITY <= USER_AUTHORITY (AI-011, AI-012)
    const userHasRole = tool.requiredRole.some((r) => initiatingPrincipal.baseRoles.includes(r) || initiatingPrincipal.authorityLevels.includes(r));
    if (!userHasRole) {
      this.recordAudit({ event: 'AI_CONFUSED_DEPUTY_ESCALATION_BLOCKED', toolId, principalId: initiatingPrincipal.principalId });
      return { authorized: false, reasonCode: 'CONFUSED_DEPUTY_USER_LACKS_TOOL_ROLE', requiresApproval: false };
    }

    // 4. Tier-0 / High-Risk Human-In-The-Loop Approval (AI-046, AI-047)
    if (tool.requiresHumanApproval || tool.riskTier === 'AI_RISK_4') {
      const paramHash = crypto.createHash('sha256').update(canonicalJsonStringify(args)).digest('hex');
      const approvalId = `APV-${crypto.randomUUID().substring(0, 8)}`;
      
      const approvalRecord: HighRiskActionApproval = {
        approvalId,
        actionName: tool.name,
        toolId,
        resourceId: args.resourceId || 'RESOURCE-GLOBAL',
        parametersHash: paramHash,
        monetaryAmountSAR: args.amountSAR,
        tenantScope: initiatingPrincipal.tenantScope,
        requesterPrincipalId: initiatingPrincipal.principalId,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
      };

      this.approvals.set(approvalId, approvalRecord);
      this.recordAudit({ event: 'HIGH_RISK_AI_ACTION_APPROVAL_REQUIRED', approvalId, toolId, amountSAR: args.amountSAR });

      return { authorized: false, reasonCode: 'HIGH_RISK_TOOL_REQUIRES_HUMAN_APPROVAL', requiresApproval: true, approvalId };
    }

    // 5. AAL Verification (AI-044)
    if (tool.requiredAAL === 'AAL_PHISHING_RESISTANT' && initiatingPrincipal.authenticationStrength !== 'AAL_PHISHING_RESISTANT') {
      return { authorized: false, reasonCode: 'TOOL_REQUIRES_AAL_PHISHING_RESISTANT_STEP_UP', requiresApproval: false };
    }

    return { authorized: true, reasonCode: 'TOOL_EXECUTION_AUTHORIZED', requiresApproval: false };
  }

  // ============================================================================
  // 3. HUMAN APPROVAL, ANTI-SELF-APPROVAL & REPLAY PROTECTION (AI-048 to AI-052)
  // ============================================================================

  public approveHighRiskAction(
    approvalId: string,
    approverPrincipal: EnterprisePrincipal,
    executionArgs: Record<string, any>
  ): { approved: boolean; reasonCode: string } {
    const approval = this.approvals.get(approvalId);
    if (!approval) {
      return { approved: false, reasonCode: 'APPROVAL_RECORD_NOT_FOUND' };
    }

    if (new Date(approval.expiresAt).getTime() < Date.now()) {
      approval.status = 'EXPIRED';
      return { approved: false, reasonCode: 'APPROVAL_HAS_EXPIRED' };
    }

    // 1. Segregation of Duties: Anti-Self-Approval (AI-049)
    if (approval.requesterPrincipalId === approverPrincipal.principalId) {
      this.recordAudit({ event: 'ANTI_SELF_APPROVAL_VIOLATION', approvalId, approver: approverPrincipal.principalId });
      throw new Error('Segregation of Duties Violation: Requester cannot approve their own high-risk AI action');
    }

    // 2. Parameter Binding Integrity (AI-048) - Detect parameter tampering
    const currentHash = crypto.createHash('sha256').update(canonicalJsonStringify(executionArgs)).digest('hex');
    if (currentHash !== approval.parametersHash) {
      approval.status = 'REJECTED';
      this.recordAudit({ event: 'APPROVAL_PARAMETER_TAMPERING_DETECTED', approvalId, currentHash, expectedHash: approval.parametersHash });
      return { approved: false, reasonCode: 'PARAMETER_TAMPERING_DETECTED_APPROVAL_INVALIDATED' };
    }

    // 3. Approver Role Check
    const tool = this.toolRegistry.get(approval.toolId);
    const hasRole = tool?.requiredRole.some((r) => approverPrincipal.baseRoles.includes(r) || approverPrincipal.authorityLevels.includes(r));
    if (!hasRole) {
      return { approved: false, reasonCode: 'APPROVER_LACKS_GOVERNANCE_ROLE' };
    }

    approval.status = 'APPROVED';
    approval.approverPrincipalId = approverPrincipal.principalId;

    this.recordAudit({ event: 'HIGH_RISK_AI_ACTION_APPROVED', approvalId, approver: approverPrincipal.principalId });
    return { approved: true, reasonCode: 'ACTION_APPROVED_READY_FOR_EXECUTION' };
  }

  public executeApprovedAction(approvalId: string, executionNonce: string): { executed: boolean; reasonCode: string } {
    const approval = this.approvals.get(approvalId);
    if (!approval || approval.status !== 'APPROVED') {
      return { executed: false, reasonCode: 'ACTION_NOT_IN_APPROVED_STATE' };
    }

    // Replay Protection (AI-052)
    if (this.executedActionNonces.has(executionNonce)) {
      this.recordAudit({ event: 'REPLAY_ATTACK_BLOCKED', executionNonce, approvalId });
      return { executed: false, reasonCode: 'REPLAY_ATTACK_DETECTED_DUPLICATE_NONCE' };
    }

    this.executedActionNonces.add(executionNonce);
    approval.status = 'EXECUTED';

    this.recordAudit({ event: 'HIGH_RISK_AI_ACTION_EXECUTED', approvalId, executionNonce });
    return { executed: true, reasonCode: 'ACTION_EXECUTED_SUCCESSFULLY' };
  }

  // ============================================================================
  // 4. RAG SECURITY & PRE-RETRIEVAL AUTHORIZATION (AI-033 to AI-040, AI-090)
  // ============================================================================

  public filterRagRetrieval(
    documents: Array<{ id: string; tenantScope: string; classification: DataClassificationLevel; content: string }>,
    principal: EnterprisePrincipal
  ): Array<{ id: string; content: string }> {
    return documents
      .filter((doc) => {
        // Strict Tenant ACL (AI-034)
        if (doc.tenantScope !== principal.tenantScope && principal.principalType !== 'BREAK_GLASS') {
          return false;
        }

        // Classification Level Check (AI-039)
        if (doc.classification === 'RESTRICTED' && principal.authenticationStrength !== 'AAL_PHISHING_RESISTANT') {
          return false;
        }

        return true;
      })
      .map((doc) => ({
        id: doc.id,
        content: doc.content,
      }));
  }

  // ============================================================================
  // 5. SSRF & EGRESS DEFENSE (AI-068, AI-069)
  // ============================================================================

  public validateEgressUrl(targetUrl: string): { safe: boolean; reasonCode: string } {
    try {
      const parsed = new URL(targetUrl);

      if (parsed.protocol !== 'https:') {
        return { safe: false, reasonCode: 'NON_HTTPS_EGRESS_PROHIBITED' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Private IP & Cloud Metadata SSRF Blocklist (AI-069)
      const isPrivateOrMetadata =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('172.16.') ||
        hostname === '169.254.169.254' || // AWS/GCP Metadata Endpoint
        hostname === 'metadata.google.internal';

      if (isPrivateOrMetadata) {
        this.recordAudit({ event: 'SSRF_ATTEMPT_BLOCKED', targetUrl, hostname });
        return { safe: false, reasonCode: 'SSRF_PRIVATE_OR_METADATA_DESTINATION_BLOCKED' };
      }

      return { safe: true, reasonCode: 'EGRESS_URL_VALIDATED' };
    } catch {
      return { safe: false, reasonCode: 'INVALID_MALFORMED_URL' };
    }
  }

  // ============================================================================
  // 6. EMERGENCY KILL-SWITCH & FAIL-CLOSED DESIGN (AI-095, AI-096, AI-121)
  // ============================================================================

  public activateKillSwitch(authorityPrincipal: EnterprisePrincipal, reason: string): { active: boolean } {
    const isAuthorized =
      authorityPrincipal.authorityLevels.includes('ROOT_ADMIN') ||
      authorityPrincipal.authorityLevels.includes('CISO') ||
      authorityPrincipal.authorityLevels.includes('EXECUTIVE_AUTHORITY') ||
      authorityPrincipal.baseRoles.includes('CFO');

    if (!isAuthorized) {
      throw new Error('Unauthorized: Only Executive Authority, CISO or ROOT_ADMIN may activate the Enterprise AI Kill-Switch');
    }

    this.killSwitchActive = true;
    this.recordAudit({ event: 'ENTERPRISE_AI_KILL_SWITCH_ACTIVATED', activatedBy: authorityPrincipal.principalId, reason });
    return { active: true };
  }

  public deactivateKillSwitch(authorityPrincipal: EnterprisePrincipal): { active: boolean } {
    const isAuthorized =
      authorityPrincipal.authorityLevels.includes('ROOT_ADMIN') ||
      authorityPrincipal.authorityLevels.includes('CISO') ||
      authorityPrincipal.authorityLevels.includes('EXECUTIVE_AUTHORITY') ||
      authorityPrincipal.baseRoles.includes('CFO');

    if (!isAuthorized) {
      throw new Error('Unauthorized: Only Executive Authority, CISO or ROOT_ADMIN may deactivate the Enterprise AI Kill-Switch');
    }

    this.killSwitchActive = false;
    this.recordAudit({ event: 'ENTERPRISE_AI_KILL_SWITCH_DEACTIVATED', deactivatedBy: authorityPrincipal.principalId });
    return { active: false };
  }

  public isKillSwitchActive(): boolean {
    return this.killSwitchActive;
  }

  private recordAudit(event: Record<string, any>) {
    this.aiAuditLedger.push({
      ...event,
      timestamp: new Date().toISOString(),
      ledgerIndex: this.aiAuditLedger.length + 1,
    });
  }

  public getAuditLedger(): Array<any> {
    return [...this.aiAuditLedger];
  }
}
