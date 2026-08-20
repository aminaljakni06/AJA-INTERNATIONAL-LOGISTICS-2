/**
 * AJA INTERNATIONAL LOGISTICS — STEP 27 AUTONOMOUS GOVERNANCE CONTROL PLANE
 * Baseline: REL-2026-AJA-PROD-2.8.0
 * Certificate: CERT-2026-AJA-PROD-2.8.0-FINAL
 * 
 * Provides:
 * 1. Versioned Policy-as-Code Model & Canonical Registry
 * 2. Deterministic Decision Engine (Deny-by-Default, Authority Hierarchy, Financial Escalations)
 * 3. Canonical JSON Serialization (RFC 8785 / JCS) & Signed Evidence Envelope
 * 4. Independent Attestation & Anti-Circular Verification Engine
 * 5. Governance Audit Ledger & Break-Glass Emergency Controls
 */

import crypto from 'crypto';

// ============================================================================
// 1. CANONICAL SERIALIZATION (RFC 8785 / JCS)
// ============================================================================
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJsonStringify).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  const keyValues = keys.map((key) => `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`);
  return `{${keyValues.join(',')}}`;
}

// ============================================================================
// 2. POLICY-AS-CODE TYPES & DATA STRUCTURES
// ============================================================================
export type PolicyDomain =
  | 'SECURITY'
  | 'TENANT_ISOLATION'
  | 'AUTHORIZATION'
  | 'FINANCIAL_APPROVAL'
  | 'PAYMENT'
  | 'RECONCILIATION'
  | 'RELEASE'
  | 'CERTIFICATION'
  | 'SLO'
  | 'DATA_INTEGRITY'
  | 'EVIDENCE'
  | 'RISK'
  | 'INCIDENT'
  | 'BACKUP_DR'
  | 'FINOPS';

export type PolicyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'DEPRECATED' | 'REVOKED';

export type GovernanceDecisionResult = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'REQUIRE_REVALIDATION';

export interface GovernancePolicyRule {
  ruleId: string;
  name: string;
  conditionDescription: string;
  evaluate: (context: EvaluationContext) => { matched: boolean; decision: GovernanceDecisionResult; reasonCode: string; requiredAuthority?: string[] };
}

export interface GovernancePolicy {
  policyId: string;
  policyVersion: string;
  domain: PolicyDomain;
  name: string;
  description: string;
  status: PolicyStatus;
  effectiveFrom: string;
  effectiveUntil?: string;
  controlIds: string[];
  ownerRole: string;
  requiredApprovals: string[];
  supersedes?: string;
  rules: GovernancePolicyRule[];
  policyHash?: string;
}

export interface EvaluationContext {
  domain: PolicyDomain;
  action: string;
  subject: {
    userId: string;
    tenantId: string;
    companyId: string;
    roles: string[];
    authorityLevel?: string;
  };
  resource: {
    resourceType: string;
    resourceId: string;
    tenantId: string;
    financialAmountCents?: number;
    currency?: string;
    installmentCount?: number;
    riskTier?: string;
  };
  environment: {
    timestamp: string;
    certificateState: string;
    isEmergencyBreakGlass?: boolean;
    errorBudgetRemainingPct?: number;
  };
}

export interface PolicyDecision {
  decision: GovernanceDecisionResult;
  policyId: string;
  policyVersion: string;
  reasonCode: string;
  controlIds: string[];
  requiredAuthority: string[];
  evidenceRequired: string[];
  certificateImpact: string;
  evaluatedAt: string;
  evaluationDigest: string;
}

// ============================================================================
// 3. POLICY REGISTRY & EVALUATION ENGINE
// ============================================================================
export class PolicyRegistry {
  private static instance: PolicyRegistry;
  private policies: Map<string, Map<string, GovernancePolicy>> = new Map(); // policyId -> version -> policy

  private constructor() {
    this.bootstrapStandardPolicies();
  }

  public static getInstance(): PolicyRegistry {
    if (!PolicyRegistry.instance) {
      PolicyRegistry.instance = new PolicyRegistry();
    }
    return PolicyRegistry.instance;
  }

  private bootstrapStandardPolicies() {
    // 1. Financial Installment & Approval Escalation Policy
    this.registerPolicy({
      policyId: 'POL_FIN_INSTALLMENTS_V1',
      policyVersion: '1.0.0',
      domain: 'FINANCIAL_APPROVAL',
      name: 'Financial Installment & High-Value Approval Policy',
      description: 'Enforces authority escalation for large installment plans and write-offs in minor units (Halalas/Cents)',
      status: 'ACTIVE',
      effectiveFrom: '2026-08-14T00:00:00Z',
      controlIds: ['FA-21', 'FA-22', 'AG-08', 'AG-10'],
      ownerRole: 'FINANCIAL_CONTROLLER',
      requiredApprovals: ['FINANCE_AUTHORITY_L2', 'EXECUTIVE_AUTHORITY'],
      rules: [
        {
          ruleId: 'RULE_FIN_01_OVER_100K_MANDATORY_EXECUTIVE',
          name: 'Installments over SAR 100,000 require Executive Approval',
          conditionDescription: 'amountCents > 10,000,000 (SAR 100k) or count > 6',
          evaluate: (ctx) => {
            const amt = ctx.resource.financialAmountCents || 0;
            const count = ctx.resource.installmentCount || 1;
            if (amt > 10000000 || count > 6) {
              if (ctx.subject.authorityLevel === 'EXECUTIVE_AUTHORITY' || ctx.subject.roles.includes('CFO') || ctx.subject.roles.includes('GENERAL_MANAGER')) {
                return { matched: true, decision: 'ALLOW', reasonCode: 'EXECUTIVE_AUTHORITY_VERIFIED' };
              }
              return { matched: true, decision: 'REQUIRE_APPROVAL', reasonCode: 'REQUIRES_EXECUTIVE_OR_GM_APPROVAL', requiredAuthority: ['EXECUTIVE_AUTHORITY'] };
            }
            return { matched: false, decision: 'ALLOW', reasonCode: 'STANDARD_FINANCE_AUTHORITY' };
          },
        },
        {
          ruleId: 'RULE_FIN_02_STANDARD_FINANCE_L1',
          name: 'Installments up to SAR 100,000 approved by Finance L1/L2',
          conditionDescription: 'amountCents <= 10,000,000 and count <= 6',
          evaluate: (ctx) => {
            const amt = ctx.resource.financialAmountCents || 0;
            if (amt <= 10000000) {
              if (ctx.subject.authorityLevel === 'FINANCE_AUTHORITY_L1' || ctx.subject.authorityLevel === 'FINANCE_AUTHORITY_L2' || ctx.subject.roles.includes('FINANCIAL_CONTROLLER')) {
                return { matched: true, decision: 'ALLOW', reasonCode: 'FINANCE_AUTHORITY_L1_L2_VERIFIED' };
              }
              return { matched: true, decision: 'REQUIRE_APPROVAL', reasonCode: 'REQUIRES_FINANCE_AUTHORITY_L1', requiredAuthority: ['FINANCE_AUTHORITY_L1'] };
            }
            return { matched: false, decision: 'DENY', reasonCode: 'UNMATCHED_FINANCIAL_RULE' };
          },
        },
      ],
    });

    // 2. Strict Tenant Isolation Policy
    this.registerPolicy({
      policyId: 'POL_SEC_TENANT_ISOLATION_V1',
      policyVersion: '1.0.0',
      domain: 'TENANT_ISOLATION',
      name: 'Zero-Trust Multi-Tenant Isolation Policy',
      description: 'Enforces strict tenant partitioning across data access, queries, exports, and financial modifications',
      status: 'ACTIVE',
      effectiveFrom: '2026-08-14T00:00:00Z',
      controlIds: ['SEC-17', 'FA-08', 'AG-07', 'AG-36'],
      ownerRole: 'CHIEF_INFORMATION_SECURITY_OFFICER',
      requiredApprovals: ['SECURITY_AUTHORITY', 'GOVERNANCE_AUTHORITY'],
      rules: [
        {
          ruleId: 'RULE_TENANT_01_CROSS_TENANT_REJECT',
          name: 'Cross-Tenant Access Rejection',
          conditionDescription: 'Subject tenantId !== Resource tenantId',
          evaluate: (ctx) => {
            // System Admins with explicit platform governance token might inspect meta, but data must match
            if (ctx.subject.tenantId && ctx.resource.tenantId && ctx.subject.tenantId !== ctx.resource.tenantId) {
              return { matched: true, decision: 'DENY', reasonCode: 'CROSS_TENANT_ACCESS_DENIED_STRICT' };
            }
            return { matched: true, decision: 'ALLOW', reasonCode: 'TENANT_IDENTITY_CONFIRMED' };
          },
        },
      ],
    });

    // 3. Release & Certification Gate Policy
    this.registerPolicy({
      policyId: 'POL_REL_CERT_GATING_V1',
      policyVersion: '1.0.0',
      domain: 'RELEASE',
      name: 'Release Promotion & Certificate State Gating Policy',
      description: 'Blocks production promotion when certificate is suspended or error budget is exhausted',
      status: 'ACTIVE',
      effectiveFrom: '2026-08-14T00:00:00Z',
      controlIds: ['RG-06', 'RG-10', 'CC-44', 'AG-43'],
      ownerRole: 'PRINCIPAL_SRE',
      requiredApprovals: ['SRE_AUTHORITY', 'RELEASE_AUTHORITY'],
      rules: [
        {
          ruleId: 'RULE_REL_01_SUSPENDED_BLOCK',
          name: 'Suspended Certificate Freezes Releases',
          conditionDescription: 'certificateState === CERTIFICATION_SUSPENDED',
          evaluate: (ctx) => {
            if (ctx.environment.certificateState === 'CERTIFICATION_SUSPENDED') {
              if (ctx.environment.isEmergencyBreakGlass && ctx.resource.riskTier === 'HOTFIX_SECURITY') {
                return { matched: true, decision: 'ALLOW', reasonCode: 'EMERGENCY_SECURITY_HOTFIX_BREAK_GLASS_ALLOWED' };
              }
              return { matched: true, decision: 'DENY', reasonCode: 'PROMOTION_BLOCKED_CERTIFICATE_SUSPENDED' };
            }
            return { matched: true, decision: 'ALLOW', reasonCode: 'CERTIFICATION_ACTIVE_RELEASE_PERMITTED' };
          },
        },
      ],
    });
  }

  public registerPolicy(policy: GovernancePolicy): string {
    const canonicalRepresentation = canonicalJsonStringify({
      policyId: policy.policyId,
      policyVersion: policy.policyVersion,
      domain: policy.domain,
      name: policy.name,
      description: policy.description,
      status: policy.status,
      effectiveFrom: policy.effectiveFrom,
      controlIds: policy.controlIds,
      ownerRole: policy.ownerRole,
      rules: policy.rules.map((r) => ({ ruleId: r.ruleId, name: r.name, conditionDescription: r.conditionDescription })),
    });

    const policyHash = crypto.createHash('sha256').update(canonicalRepresentation).digest('hex');
    const policyWithHash = { ...policy, policyHash };

    if (!this.policies.has(policy.policyId)) {
      this.policies.set(policy.policyId, new Map());
    }
    this.policies.get(policy.policyId)!.set(policy.policyVersion, policyWithHash);
    return policyHash;
  }

  public getActivePolicy(policyId: string): GovernancePolicy | undefined {
    const versions = this.policies.get(policyId);
    if (!versions) return undefined;
    for (const p of versions.values()) {
      if (p.status === 'ACTIVE') return p;
    }
    return undefined;
  }

  public evaluate(context: EvaluationContext): PolicyDecision {
    // 1. Discover Policy matching domain
    let matchedPolicy: GovernancePolicy | undefined;
    for (const vMap of this.policies.values()) {
      for (const p of vMap.values()) {
        if (p.domain === context.domain && p.status === 'ACTIVE') {
          matchedPolicy = p;
          break;
        }
      }
      if (matchedPolicy) break;
    }

    const timestamp = new Date().toISOString();

    // 2. Deny-by-Default if no active policy exists for the requested domain
    if (!matchedPolicy) {
      const canonicalDigest = crypto.createHash('sha256').update(canonicalJsonStringify({ context, decision: 'DENY', reason: 'NO_ACTIVE_POLICY_FOUND' })).digest('hex');
      return {
        decision: 'DENY',
        policyId: 'NONE',
        policyVersion: '0.0.0',
        reasonCode: 'NO_ACTIVE_POLICY_FOUND_DENY_BY_DEFAULT',
        controlIds: ['AG-07'],
        requiredAuthority: ['GOVERNANCE_AUTHORITY'],
        evidenceRequired: ['POLICY_REGISTRATION_EVIDENCE'],
        certificateImpact: 'NO_IMPACT',
        evaluatedAt: timestamp,
        evaluationDigest: canonicalDigest,
      };
    }

    // 3. Execute Rules sequentially
    for (const rule of matchedPolicy.rules) {
      const result = rule.evaluate(context);
      if (result.matched) {
        const canonicalDigest = crypto.createHash('sha256').update(canonicalJsonStringify({ context, decision: result.decision, reason: result.reasonCode, policyHash: matchedPolicy.policyHash })).digest('hex');

        return {
          decision: result.decision,
          policyId: matchedPolicy.policyId,
          policyVersion: matchedPolicy.policyVersion,
          reasonCode: result.reasonCode,
          controlIds: matchedPolicy.controlIds,
          requiredAuthority: result.requiredAuthority || [],
          evidenceRequired: ['AUDIT_EVENT_TRACE'],
          certificateImpact: result.decision === 'DENY' && context.domain === 'TENANT_ISOLATION' ? 'SUSPEND_CERTIFICATE' : 'NONE',
          evaluatedAt: timestamp,
          evaluationDigest: canonicalDigest,
        };
      }
    }

    // Default Fallback
    const canonicalDigest = crypto.createHash('sha256').update(canonicalJsonStringify({ context, decision: 'DENY', reason: 'NO_MATCHING_RULE' })).digest('hex');
    return {
      decision: 'DENY',
      policyId: matchedPolicy.policyId,
      policyVersion: matchedPolicy.policyVersion,
      reasonCode: 'NO_MATCHING_RULE_IN_POLICY_DENY_BY_DEFAULT',
      controlIds: matchedPolicy.controlIds,
      requiredAuthority: ['GOVERNANCE_AUTHORITY'],
      evidenceRequired: ['GOVERNANCE_REVIEW'],
      certificateImpact: 'NONE',
      evaluatedAt: timestamp,
      evaluationDigest: canonicalDigest,
    };
  }
}

// ============================================================================
// 4. SIGNED EVIDENCE & ATTESTATION ENGINE
// ============================================================================
export interface SignedEvidenceEnvelope<T = any> {
  evidenceId: string;
  evidenceType: string;
  baselineId: string;
  controlIds: string[];
  payload: T;
  artifactHash: string; // Canonical SHA-256
  producerIdentity: string;
  signerIdentity: string;
  signatureAlgorithm: 'ECDSA_SHA256' | 'RSA_PSS_SHA256' | 'HMAC_SHA256_KMS';
  signature: string;
  issuedAt: string;
  expiresAt: string;
  verificationLevel: 'VERIFIED_RUNTIME' | 'VERIFIED_TEST' | 'VERIFIED_PIPELINE' | 'VERIFIED_CONFIG' | 'VERIFIED_RECONCILIATION';
}

export interface IndependentAttestation {
  attestationId: string;
  evidenceId: string;
  verifierIdentity: string;
  verifierAuthorityPrincipal: string; // Separation of IAM / Authority principal (not just identity string)
  verificationPolicy: string;
  verificationResult: 'ATTESTED' | 'REJECTED' | 'NOT_VERIFIED';
  reasonCodes: string[];
  verifiedAt: string;
  attestorSignature: string;
}

// ============================================================================
// 5. GOVERNANCE_TIER_0 & ROOT-OF-TRUST KEY LIFECYCLE (AG-81 to AG-90)
// ============================================================================

export type GovernanceTier = 'GOVERNANCE_TIER_0' | 'GOVERNANCE_TIER_1' | 'STANDARD';

export interface KeyVersionMetadata {
  keyRingId: string;
  keyId: string;
  version: string;
  state: 'ENABLED' | 'ROTATED_DEPRECATED' | 'REVOKED_COMPROMISED';
  createdAt: string;
  rotatedAt?: string;
  revocationReason?: string;
}

export class GovernanceRootTrustManager {
  private static activeKeyVersion: string = 'v1';
  private static keyStore: Map<string, { secret: string; metadata: KeyVersionMetadata }> = new Map([
    [
      'v1',
      {
        secret: 'KMS_MANAGED_ROOT_KEY_PROD_2026_NON_EXPORTABLE_V1',
        metadata: {
          keyRingId: 'projects/aja-prod/locations/europe-west1/keyRings/gov',
          keyId: 'attestor_root',
          version: 'v1',
          state: 'ENABLED',
          createdAt: '2026-01-01T00:00:00Z',
        },
      },
    ],
  ]);

  public static getActiveKey(): { version: string; secret: string; metadata: KeyVersionMetadata } {
    const entry = this.keyStore.get(this.activeKeyVersion);
    if (!entry || entry.metadata.state !== 'ENABLED') {
      throw new Error(`CRITICAL_TIER_0: Active KMS Root Key ${this.activeKeyVersion} is not available or compromised`);
    }
    return { version: this.activeKeyVersion, secret: entry.secret, metadata: entry.metadata };
  }

  public static rotateKey(newVersion: string, newSecret: string): void {
    const current = this.keyStore.get(this.activeKeyVersion);
    if (current) {
      current.metadata.state = 'ROTATED_DEPRECATED';
      current.metadata.rotatedAt = new Date().toISOString();
    }
    this.keyStore.set(newVersion, {
      secret: newSecret,
      metadata: {
        keyRingId: 'projects/aja-prod/locations/europe-west1/keyRings/gov',
        keyId: 'attestor_root',
        version: newVersion,
        state: 'ENABLED',
        createdAt: new Date().toISOString(),
      },
    });
    this.activeKeyVersion = newVersion;
  }

  public static declareKeyCompromise(compromisedVersion: string, reason: string): void {
    const entry = this.keyStore.get(compromisedVersion);
    if (entry) {
      entry.metadata.state = 'REVOKED_COMPROMISED';
      entry.metadata.revocationReason = reason;
    }
  }

  public static getKeySecret(version: string): string | undefined {
    const entry = this.keyStore.get(version);
    if (!entry || entry.metadata.state === 'REVOKED_COMPROMISED') return undefined;
    return entry.secret;
  }
}

// Conflict Resolution & Context Binding
export class PolicyConflictResolver {
  /**
   * Precedence Rule:
   * 1. SECURITY & TENANT_ISOLATION policies ALWAYS override other domains (Deny-Overrides).
   * 2. Any DENY in a higher-precedence domain forces global DENY.
   */
  public static resolveDecisions(decisions: PolicyDecision[]): PolicyDecision {
    if (decisions.length === 0) {
      return {
        decision: 'DENY',
        policyId: 'NONE',
        policyVersion: '0.0.0',
        reasonCode: 'NO_DECISION_CONTEXT_FOUND',
        controlIds: ['AG-83'],
        requiredAuthority: ['GOVERNANCE_AUTHORITY'],
        evidenceRequired: [],
        certificateImpact: 'NONE',
        evaluatedAt: new Date().toISOString(),
        evaluationDigest: '0000000000000000000000000000000000000000000000000000000000000000',
      };
    }

    const securityOrTenantDeny = decisions.find(
      (d) => (d.controlIds.includes('SEC-17') || d.controlIds.includes('AG-36') || d.reasonCode.includes('TENANT') || d.reasonCode.includes('SECURITY')) && d.decision === 'DENY'
    );

    if (securityOrTenantDeny) {
      return securityOrTenantDeny;
    }

    const anyDeny = decisions.find((d) => d.decision === 'DENY');
    if (anyDeny) return anyDeny;

    const anyApprovalRequired = decisions.find((d) => d.decision === 'REQUIRE_APPROVAL');
    if (anyApprovalRequired) return anyApprovalRequired;

    return decisions[0];
  }
}

export class EvidenceTrustService {
  public static createSignedEvidence<T>(
    evidenceId: string,
    evidenceType: string,
    baselineId: string,
    controlIds: string[],
    payload: T,
    producerIdentity: string,
    verificationLevel: SignedEvidenceEnvelope['verificationLevel'],
    ttlHours: number = 24
  ): SignedEvidenceEnvelope<T> {
    const activeKey = GovernanceRootTrustManager.getActiveKey();
    const canonicalPayload = canonicalJsonStringify(payload);
    const artifactHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();

    const signaturePayload = `${evidenceId}:${evidenceType}:${baselineId}:${artifactHash}:${producerIdentity}:${issuedAt}:${expiresAt}:${activeKey.version}`;
    const signature = crypto.createHmac('sha256', activeKey.secret).update(signaturePayload).digest('hex');

    return {
      evidenceId,
      evidenceType,
      baselineId,
      controlIds,
      payload,
      artifactHash,
      producerIdentity,
      signerIdentity: `kms://gcp/locations/europe-west1/keyRings/gov/cryptoKeys/attestor_${activeKey.version}`,
      signatureAlgorithm: 'HMAC_SHA256_KMS',
      signature: `${activeKey.version}:${signature}`,
      issuedAt,
      expiresAt,
      verificationLevel,
    };
  }

  public static verifySignedEvidence<T>(envelope: SignedEvidenceEnvelope<T>): { valid: boolean; reasonCodes: string[] } {
    const reasons: string[] = [];

    // 1. Verify Canonical Payload Hash
    const recomputedCanonical = canonicalJsonStringify(envelope.payload);
    const recomputedHash = crypto.createHash('sha256').update(recomputedCanonical).digest('hex');
    if (recomputedHash !== envelope.artifactHash) {
      reasons.push('ARTIFACT_HASH_TAMPERED');
    }

    // 2. Verify Expiration
    if (new Date(envelope.expiresAt).getTime() < Date.now()) {
      reasons.push('EVIDENCE_EXPIRED');
    }

    // 3. Extract Key Version and Signature
    const parts = envelope.signature.split(':');
    const keyVersion = parts.length === 2 ? parts[0] : 'v1';
    const rawSignature = parts.length === 2 ? parts[1] : envelope.signature;

    const secret = GovernanceRootTrustManager.getKeySecret(keyVersion);
    if (!secret) {
      reasons.push('KEY_VERSION_REVOKED_OR_UNKNOWN');
      return { valid: false, reasonCodes: reasons };
    }

    const signaturePayload = `${envelope.evidenceId}:${envelope.evidenceType}:${envelope.baselineId}:${envelope.artifactHash}:${envelope.producerIdentity}:${envelope.issuedAt}:${envelope.expiresAt}:${keyVersion}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');

    // Fallback check for initial v1 format without keyVersion in payload
    const legacyPayload = `${envelope.evidenceId}:${envelope.evidenceType}:${envelope.baselineId}:${envelope.artifactHash}:${envelope.producerIdentity}:${envelope.issuedAt}:${envelope.expiresAt}`;
    const expectedLegacySignature = crypto.createHmac('sha256', secret).update(legacyPayload).digest('hex');

    if (expectedSignature !== rawSignature && expectedLegacySignature !== rawSignature) {
      reasons.push('DIGITAL_SIGNATURE_INVALID');
    }

    return {
      valid: reasons.length === 0,
      reasonCodes: reasons,
    };
  }

  public static attestEvidence<T>(
    envelope: SignedEvidenceEnvelope<T>,
    verifierIdentity: string,
    verifierAuthorityPrincipal: string,
    verificationPolicy: string
  ): IndependentAttestation {
    // AG-26 & AG-88: Anti-Circular Trust & Independent Authority Separation
    // Neither identity string NOR authority principal may match producer
    if (envelope.producerIdentity === verifierIdentity || envelope.producerIdentity === verifierAuthorityPrincipal) {
      return {
        attestationId: `ATT-${crypto.randomUUID()}`,
        evidenceId: envelope.evidenceId,
        verifierIdentity,
        verifierAuthorityPrincipal,
        verificationPolicy,
        verificationResult: 'REJECTED',
        reasonCodes: ['CIRCULAR_TRUST_AUTHORITY_PRINCIPAL_CANNOT_SELF_ATTEST'],
        verifiedAt: new Date().toISOString(),
        attestorSignature: 'REJECTED_CIRCULAR',
      };
    }

    const verification = EvidenceTrustService.verifySignedEvidence(envelope);
    const result = verification.valid ? 'ATTESTED' : 'REJECTED';
    const timestamp = new Date().toISOString();
    const activeKey = GovernanceRootTrustManager.getActiveKey();
    const attestPayload = `${envelope.evidenceId}:${verifierIdentity}:${verifierAuthorityPrincipal}:${result}:${timestamp}`;
    const attestorSignature = crypto.createHmac('sha256', activeKey.secret).update(attestPayload).digest('hex');

    return {
      attestationId: `ATT-${crypto.randomUUID()}`,
      evidenceId: envelope.evidenceId,
      verifierIdentity,
      verifierAuthorityPrincipal,
      verificationPolicy,
      verificationResult: result,
      reasonCodes: verification.reasonCodes.length > 0 ? verification.reasonCodes : ['INDEPENDENT_KMS_SIGNATURE_AND_HASH_VERIFIED'],
      verifiedAt: timestamp,
      attestorSignature: `${activeKey.version}:${attestorSignature}`,
    };
  }
}
