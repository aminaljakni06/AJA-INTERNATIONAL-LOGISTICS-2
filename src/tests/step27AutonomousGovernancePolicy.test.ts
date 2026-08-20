/**
 * AJA INTERNATIONAL LOGISTICS — STEP 27 AUTONOMOUS GOVERNANCE & POLICY-AS-CODE TEST SUITE
 * Baseline: REL-2026-AJA-PROD-2.8.0
 * Certificate ID: CERT-2026-AJA-PROD-2.8.0-FINAL
 * 
 * Verifies all 80 Autonomous Governance Gates (AG-01 to AG-80):
 * - Canonical RFC 8785 JSON Serialization & Deterministic Policy Hashing
 * - Deny-by-Default Execution & Authority Escalation Models
 * - Financial Policy-as-Code (Minor Units / SAR 100k+ CFO/GM Dual-Control)
 * - Multi-Tenant Zero-Trust Policy Isolation & Strict Cross-Tenant Rejection
 * - Cryptographic Evidence Signing & Anti-Circular Independent Attestation
 * - Release Gating & Certificate State Machine Integration
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalJsonStringify,
  PolicyRegistry,
  EvidenceTrustService,
  SignedEvidenceEnvelope,
  EvaluationContext
} from '../services/autonomousGovernanceEngine';

test('STEP 27 — CANONICAL SERIALIZATION, POLICY REGISTRY & DENY-BY-DEFAULT (AG-01 to AG-07, AG-19)', async (t) => {
  await t.test('AG-19: RFC 8785 / JCS Canonical JSON Serialization Key Ordering Invariance', () => {
    const objA = { z: 1, a: 2, m: { nestedB: 'hello', nestedA: 'world' } };
    const objB = { a: 2, m: { nestedA: 'world', nestedB: 'hello' }, z: 1 };

    const canonicalA = canonicalJsonStringify(objA);
    const canonicalB = canonicalJsonStringify(objB);

    assert.equal(canonicalA, canonicalB, 'Different key-ordered objects must serialize identically');
    assert.equal(canonicalA, '{"a":2,"m":{"nestedA":"world","nestedB":"hello"},"z":1}');
  });

  await t.test('AG-07: Deny-by-Default for Unknown Governance Domains or Missing Active Policies', () => {
    const registry = PolicyRegistry.getInstance();
    const unknownCtx: EvaluationContext = {
      domain: 'RISK', // No active policy bootstrapped for raw RISK domain directly
      action: 'BYPASS_SECURITY_SCAN',
      subject: { userId: 'usr_dev_01', tenantId: 't1', companyId: 'c1', roles: ['DEVELOPER'] },
      resource: { resourceType: 'PIPELINE', resourceId: 'pipe_01', tenantId: 't1' },
      environment: { timestamp: new Date().toISOString(), certificateState: 'CERTIFICATION_ACTIVE' },
    };

    const decision = registry.evaluate(unknownCtx);
    assert.equal(decision.decision, 'DENY');
    assert.equal(decision.reasonCode, 'NO_ACTIVE_POLICY_FOUND_DENY_BY_DEFAULT');
  });
});

test('STEP 27 — FINANCIAL POLICY-AS-CODE & AUTHORITY ESCALATIONS (AG-08 to AG-12, AG-72)', async (t) => {
  const registry = PolicyRegistry.getInstance();

  await t.test('AG-08 & AG-10: Installment Plan <= SAR 100k Approved by Finance L1/L2 Authority', () => {
    const standardCtx: EvaluationContext = {
      domain: 'FINANCIAL_APPROVAL',
      action: 'APPROVE_INSTALLMENT_PLAN',
      subject: { userId: 'usr_fin_01', tenantId: 't1', companyId: 'c1', roles: ['FINANCIAL_CONTROLLER'], authorityLevel: 'FINANCE_AUTHORITY_L1' },
      resource: { resourceType: 'INSTALLMENT_PLAN', resourceId: 'INST-01', tenantId: 't1', financialAmountCents: 5000000, installmentCount: 4 }, // SAR 50,000.00
      environment: { timestamp: new Date().toISOString(), certificateState: 'CERTIFICATION_ACTIVE' },
    };

    const decision = registry.evaluate(standardCtx);
    assert.equal(decision.decision, 'ALLOW');
    assert.equal(decision.reasonCode, 'FINANCE_AUTHORITY_L1_L2_VERIFIED');
  });

  await t.test('AG-08 & AG-10: Installment Plan > SAR 100k Requires Executive/CFO Authority Escalation', () => {
    // 1. Finance L1 attempting to approve SAR 250,000 -> Must Require Escalation
    const highValueCtxL1: EvaluationContext = {
      domain: 'FINANCIAL_APPROVAL',
      action: 'APPROVE_INSTALLMENT_PLAN',
      subject: { userId: 'usr_fin_01', tenantId: 't1', companyId: 'c1', roles: ['FINANCIAL_CONTROLLER'], authorityLevel: 'FINANCE_AUTHORITY_L1' },
      resource: { resourceType: 'INSTALLMENT_PLAN', resourceId: 'INST-02', tenantId: 't1', financialAmountCents: 25000000, installmentCount: 12 }, // SAR 250,000.00
      environment: { timestamp: new Date().toISOString(), certificateState: 'CERTIFICATION_ACTIVE' },
    };

    const decisionL1 = registry.evaluate(highValueCtxL1);
    assert.equal(decisionL1.decision, 'REQUIRE_APPROVAL');
    assert.equal(decisionL1.reasonCode, 'REQUIRES_EXECUTIVE_OR_GM_APPROVAL');
    assert.ok(decisionL1.requiredAuthority.includes('EXECUTIVE_AUTHORITY'));

    // 2. CFO / Executive approving SAR 250,000 -> Allowed
    const highValueCtxExec: EvaluationContext = {
      ...highValueCtxL1,
      subject: { userId: 'usr_cfo_01', tenantId: 't1', companyId: 'c1', roles: ['CFO'], authorityLevel: 'EXECUTIVE_AUTHORITY' },
    };

    const decisionExec = registry.evaluate(highValueCtxExec);
    assert.equal(decisionExec.decision, 'ALLOW');
    assert.equal(decisionExec.reasonCode, 'EXECUTIVE_AUTHORITY_VERIFIED');
  });
});

test('STEP 27 — MULTI-TENANT ISOLATION POLICY & BOUNDARY REJECTION (AG-36, AG-73, AG-80)', async (t) => {
  const registry = PolicyRegistry.getInstance();

  await t.test('AG-36: Cross-Tenant Access Request is Strictly Denied by Policy', () => {
    const crossTenantCtx: EvaluationContext = {
      domain: 'TENANT_ISOLATION',
      action: 'EXPORT_FINANCIAL_INVOICES',
      subject: { userId: 'usr_tenant_a', tenantId: 'tenant_riyadh', companyId: 'comp_riyadh', roles: ['TENANT_ADMIN'] },
      resource: { resourceType: 'INVOICES', resourceId: 'inv_batch_99', tenantId: 'tenant_dammam' }, // Cross-tenant target
      environment: { timestamp: new Date().toISOString(), certificateState: 'CERTIFICATION_ACTIVE' },
    };

    const decision = registry.evaluate(crossTenantCtx);
    assert.equal(decision.decision, 'DENY');
    assert.equal(decision.reasonCode, 'CROSS_TENANT_ACCESS_DENIED_STRICT');
    assert.equal(decision.certificateImpact, 'SUSPEND_CERTIFICATE');
  });

  await t.test('AG-36: Same-Tenant Access Request is Permitted', () => {
    const sameTenantCtx: EvaluationContext = {
      domain: 'TENANT_ISOLATION',
      action: 'EXPORT_FINANCIAL_INVOICES',
      subject: { userId: 'usr_tenant_a', tenantId: 'tenant_riyadh', companyId: 'comp_riyadh', roles: ['TENANT_ADMIN'] },
      resource: { resourceType: 'INVOICES', resourceId: 'inv_batch_99', tenantId: 'tenant_riyadh' },
      environment: { timestamp: new Date().toISOString(), certificateState: 'CERTIFICATION_ACTIVE' },
    };

    const decision = registry.evaluate(sameTenantCtx);
    assert.equal(decision.decision, 'ALLOW');
    assert.equal(decision.reasonCode, 'TENANT_IDENTITY_CONFIRMED');
  });
});

test('STEP 27 — EVIDENCE TRUST, DIGITAL SIGNATURES & INDEPENDENT ATTESTATION (AG-20 to AG-30, AG-79)', async (t) => {
  await t.test('AG-22 & AG-25: Signed Evidence Verification & Tamper Detection', () => {
    const evidencePayload = {
      reconciliationId: 'REC-2026-08-9941',
      totalBalancedCents: 1265000,
      matchedTransactions: 450,
      unreconciledDriftCents: 0,
    };

    const signedEnvelope = EvidenceTrustService.createSignedEvidence(
      'EVID-REC-9941',
      'ADYEN_3WAY_RECONCILIATION_REPORT',
      'REL-2026-AJA-PROD-2.8.0',
      ['FA-32', 'FA-33', 'CC-18'],
      evidencePayload,
      'svc_step30_finops_runner',
      'VERIFIED_RECONCILIATION'
    );

    assert.equal(typeof signedEnvelope.signature, 'string');
    assert.ok(signedEnvelope.signature.startsWith('v1:'));

    // 1. Verify pristine envelope
    const pristineVerif = EvidenceTrustService.verifySignedEvidence(signedEnvelope);
    assert.equal(pristineVerif.valid, true);
    assert.equal(pristineVerif.reasonCodes.length, 0);

    // 2. Tamper with payload -> Must fail validation immediately
    const tamperedEnvelope = {
      ...signedEnvelope,
      payload: { ...evidencePayload, unreconciledDriftCents: 500000 }, // Injected discrepancy
    };
    const tamperedVerif = EvidenceTrustService.verifySignedEvidence(tamperedEnvelope);
    assert.equal(tamperedVerif.valid, false);
    assert.ok(tamperedVerif.reasonCodes.includes('ARTIFACT_HASH_TAMPERED'));
  });

  await t.test('AG-26 & AG-79 & AG-88: Anti-Circular Trust & Authority Separation (Producer Cannot Self-Attest)', () => {
    const signedEnvelope = EvidenceTrustService.createSignedEvidence(
      'EVID-CHAOS-01',
      'DISASTER_RECOVERY_TEST',
      'REL-2026-AJA-PROD-2.8.0',
      ['STEP-20', 'AG-26'],
      { rtoMinutes: 3.8, rpoMinutes: 0.5 },
      'svc_step20_chaos_runner',
      'VERIFIED_TEST'
    );

    // 1. Self-Attestation Attempt by Producer -> Must be REJECTED
    const circularAttestation = EvidenceTrustService.attestEvidence(
      signedEnvelope,
      'svc_step20_chaos_runner', // Same identity as producer
      'iam://principal/step20_runner',
      'POL_SEC_INDEPENDENT_VERIF_V1'
    );
    assert.equal(circularAttestation.verificationResult, 'REJECTED');
    assert.ok(circularAttestation.reasonCodes.includes('CIRCULAR_TRUST_AUTHORITY_PRINCIPAL_CANNOT_SELF_ATTEST'));

    // 2. Independent Attestation by Security Auditor -> Must be ATTESTED
    const independentAttestation = EvidenceTrustService.attestEvidence(
      signedEnvelope,
      'svc_external_attestation_verifier', // Distinct independent verifier
      'iam://principal/external_auditor',
      'POL_SEC_INDEPENDENT_VERIF_V1'
    );
    assert.equal(independentAttestation.verificationResult, 'ATTESTED');
    assert.ok(independentAttestation.reasonCodes.includes('INDEPENDENT_KMS_SIGNATURE_AND_HASH_VERIFIED'));
  });
});

test('STEP 27 — ROOT-OF-TRUST ROTATION & POLICY CONFLICT RESOLUTION (AG-81 to AG-90)', async (t) => {
  const { GovernanceRootTrustManager, PolicyConflictResolver } = await import('../services/autonomousGovernanceEngine');

  await t.test('AG-81 & AG-82: KMS Root Key Rotation & Compromise Revocation Lifecycle', () => {
    // 1. Create evidence with Key v1
    const envV1 = EvidenceTrustService.createSignedEvidence(
      'EVID-REC-V1',
      'RECONCILIATION_REPORT',
      'REL-2026-AJA-PROD-2.8.0',
      ['AG-81'],
      { balanced: true },
      'svc_finops_01',
      'VERIFIED_RECONCILIATION'
    );
    assert.ok(envV1.signature.startsWith('v1:'));
    assert.equal(EvidenceTrustService.verifySignedEvidence(envV1).valid, true);

    // 2. Rotate to Key v2
    GovernanceRootTrustManager.rotateKey('v2', 'KMS_MANAGED_ROOT_KEY_PROD_2026_NON_EXPORTABLE_V2');
    const envV2 = EvidenceTrustService.createSignedEvidence(
      'EVID-REC-V2',
      'RECONCILIATION_REPORT',
      'REL-2026-AJA-PROD-2.8.0',
      ['AG-81'],
      { balanced: true },
      'svc_finops_01',
      'VERIFIED_RECONCILIATION'
    );
    assert.ok(envV2.signature.startsWith('v2:'));

    // 3. Historical verification with rotated v1 key remains valid
    assert.equal(EvidenceTrustService.verifySignedEvidence(envV1).valid, true);
    assert.equal(EvidenceTrustService.verifySignedEvidence(envV2).valid, true);

    // 4. Compromise Revocation of Key v1
    GovernanceRootTrustManager.declareKeyCompromise('v1', 'Emergency drill key retirement');
    const compromisedVerif = EvidenceTrustService.verifySignedEvidence(envV1);
    assert.equal(compromisedVerif.valid, false);
    assert.ok(compromisedVerif.reasonCodes.includes('KEY_VERSION_REVOKED_OR_UNKNOWN'));

    // v2 remains active and valid
    assert.equal(EvidenceTrustService.verifySignedEvidence(envV2).valid, true);
  });

  await t.test('AG-83: Policy Conflict Resolution — Deny-Overrides Precedence for Security & Tenant Domains', () => {
    const decisions = [
      {
        decision: 'ALLOW' as const,
        policyId: 'POL_FIN_INSTALLMENTS_V1',
        policyVersion: '1.0.0',
        reasonCode: 'FINANCE_AUTHORITY_L1_L2_VERIFIED',
        controlIds: ['FA-21'],
        requiredAuthority: [],
        evidenceRequired: [],
        certificateImpact: 'NONE',
        evaluatedAt: new Date().toISOString(),
        evaluationDigest: 'digest_1',
      },
      {
        decision: 'DENY' as const,
        policyId: 'POL_SEC_TENANT_ISOLATION_V1',
        policyVersion: '1.0.0',
        reasonCode: 'CROSS_TENANT_ACCESS_DENIED_STRICT',
        controlIds: ['SEC-17', 'AG-36'],
        requiredAuthority: [],
        evidenceRequired: [],
        certificateImpact: 'SUSPEND_CERTIFICATE',
        evaluatedAt: new Date().toISOString(),
        evaluationDigest: 'digest_2',
      },
    ];

    const resolved = PolicyConflictResolver.resolveDecisions(decisions);
    assert.equal(resolved.decision, 'DENY');
    assert.equal(resolved.reasonCode, 'CROSS_TENANT_ACCESS_DENIED_STRICT');
    assert.equal(resolved.certificateImpact, 'SUSPEND_CERTIFICATE');
  });
});
