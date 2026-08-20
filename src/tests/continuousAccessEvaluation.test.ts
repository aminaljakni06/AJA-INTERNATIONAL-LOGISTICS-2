/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-05
 * Adaptive Zero-Trust Identity Defense, Continuous Access Evaluation & Security Orchestration Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  continuousAccessEvaluationService,
  CANONICAL_SENSITIVE_ACTIONS,
} from '../services/continuousAccessEvaluationService';
import { 
  identityIncidentResponseService 
} from '../services/identityIncidentResponseService';

test('STEP UAP-05 — Adaptive Zero-Trust Identity Defense & Continuous Access Evaluation Suite', async (t) => {
  const service = continuousAccessEvaluationService;
  const incidentService = identityIncidentResponseService;

  service.resetForTesting();
  incidentService.resetForTesting();

  await t.test('1. Deterministic Policy Integrity Seal Verification', () => {
    const seal = service.getPolicySeal();
    assert.ok(seal, 'Policy seal must exist');
    assert.equal(seal.length, 64, 'SHA-256 seal must be 64 characters');
    const recalculated = service.calculatePolicyIntegritySeal();
    assert.equal(seal, recalculated, 'Policy seal must be deterministic and repeatable');
  });

  await t.test('2. Canary Test: Customer Normal Authorized Access', () => {
    const decision = service.evaluateAccess({
      principalId: 'usr_valid_cust_01',
      principalRole: 'CUSTOMER',
      principalCategory: 'HUMAN',
      tenantId: 'tenant_omega',
      resource: '/api/quotes/quote_omega_100',
      action: 'quotes:view_own',
      targetTenantId: 'tenant_omega',
    });

    assert.equal(decision.decision, 'ALLOW');
    assert.equal(decision.allowed, true);
    assert.equal(decision.riskTier, 'TRUSTED');
    assert.ok(decision.policySeal.length === 64);
  });

  await t.test('3. Canary Test: Cross-Tenant Barrier Violation Denial', () => {
    const decision = service.evaluateAccess({
      principalId: 'usr_tenant_a_cust',
      principalRole: 'CUSTOMER',
      principalCategory: 'HUMAN',
      tenantId: 'tenant_alpha',
      resource: '/api/quotes/quote_beta_999',
      action: 'quotes:view_own',
      targetTenantId: 'tenant_beta',
    });

    assert.equal(decision.decision, 'DENY');
    assert.equal(decision.allowed, false);
    assert.ok(decision.reasonCodes.includes('CROSS_TENANT_BARRIER_VIOLATION'));
  });

  await t.test('4. Immediate Mid-Session Role Revocation Enforcement', () => {
    const userId = 'usr_demoted_admin';

    // 4.1 Initially Admin
    service.setLiveUserRole(userId, 'ADMIN');
    const firstCheck = service.evaluateAccess({
      principalId: userId,
      principalRole: 'ADMIN',
      principalCategory: 'HUMAN',
      resource: '/api/auth/users/role',
      action: 'users:modify_role',
      stepUpCompleted: true,
    });
    assert.equal(firstCheck.allowed, true);

    // 4.2 Demote user live to STAFF mid-session
    service.setLiveUserRole(userId, 'STAFF');

    // 4.3 Attempt same admin operation with old token/claims
    const secondCheck = service.evaluateAccess({
      principalId: userId,
      principalRole: 'ADMIN', // Stale claim from token
      principalCategory: 'HUMAN',
      resource: '/api/auth/users/role',
      action: 'users:modify_role',
      stepUpCompleted: true,
    });

    assert.equal(secondCheck.decision, 'DENY');
    assert.equal(secondCheck.allowed, false);
    assert.ok(secondCheck.reasonCodes.includes('STALE_PRIVILEGE_SESSION_REVOKED'));
  });

  await t.test('5. Sensitive Action Step-Up Authentication Challenge Workflow', () => {
    const adminId = 'usr_admin_stepup_test';
    service.setLiveUserRole(adminId, 'ADMIN');

    // 5.1 Request sensitive action without step-up
    const initialEval = service.evaluateAccess({
      principalId: adminId,
      principalRole: 'ADMIN',
      principalCategory: 'HUMAN',
      resource: '/api/auth/users/role',
      action: 'users:modify_role',
      stepUpCompleted: false, // Step-up not yet performed
    });

    assert.equal(initialEval.decision, 'STEP_UP_REQUIRED');
    assert.equal(initialEval.allowed, false);

    // 5.2 Generate Step-Up challenge
    const challenge = service.createStepUpChallenge(adminId);
    assert.ok(challenge.challengeCode);

    // 5.3 Complete Step-Up verification
    const verified = service.completeStepUpChallenge(adminId, challenge.challengeCode);
    assert.equal(verified, true);

    // 5.4 Re-evaluate with stepUpCompleted = true
    const postStepUpEval = service.evaluateAccess({
      principalId: adminId,
      principalRole: 'ADMIN',
      principalCategory: 'HUMAN',
      resource: '/api/auth/users/role',
      action: 'users:modify_role',
      stepUpCompleted: true,
    });

    assert.equal(postStepUpEval.allowed, true);
  });

  await t.test('6. Incident-Aware Authorization (Active Critical Incident -> Containment)', () => {
    const compromisedUser = 'usr_compromised_victim';

    // 6.1 Create Active Critical Incident on user in Incident Service
    incidentService.createIncident({
      incidentType: 'ACCOUNT_TAKEOVER_SUSPECTED',
      severity: 'CRITICAL',
      title: 'Active Takeover Detected',
      description: 'Multiple anomalous login attempts detected',
      actorId: compromisedUser,
      actorType: 'HUMAN',
      sourceEvents: ['EVT-ATO-01'],
      affectedResources: ['/api/auth/profile'],
      correlationId: 'CORR-ATO-TEST',
    });

    // 6.2 Evaluate access
    const decision = service.evaluateAccess({
      principalId: compromisedUser,
      principalRole: 'CUSTOMER',
      principalCategory: 'HUMAN',
      tenantId: 'tenant_victim',
      resource: '/api/quotes',
      action: 'quotes:view_own',
      targetTenantId: 'tenant_victim',
    });

    assert.equal(decision.decision, 'CONTAIN');
    assert.equal(decision.allowed, false);
    assert.ok(decision.reasonCodes.includes('ACTIVE_INCIDENT_ACCOUNT_TAKEOVER_SUSPECTED'));
  });

  await t.test('7. Tenant-Aware Risk Isolation (Tenant A High Risk vs Tenant B Normal)', () => {
    const tenantA = 'tenant_compromised_corp';
    const tenantB = 'tenant_clean_corp';

    // Set Tenant A risk to high
    service.setTenantRiskScore(tenantA, 75);

    // User A from Tenant A
    const evalA = service.evaluateAccess({
      principalId: 'usr_tenant_a',
      principalRole: 'CUSTOMER',
      principalCategory: 'HUMAN',
      tenantId: tenantA,
      resource: '/api/quotes',
      action: 'quotes:view_own',
      targetTenantId: tenantA,
    });
    assert.ok(evalA.riskScore > 30);

    // User B from Tenant B (completely isolated and clean)
    const evalB = service.evaluateAccess({
      principalId: 'usr_tenant_b',
      principalRole: 'CUSTOMER',
      principalCategory: 'HUMAN',
      tenantId: tenantB,
      resource: '/api/quotes',
      action: 'quotes:view_own',
      targetTenantId: tenantB,
    });
    assert.equal(evalB.decision, 'ALLOW');
    assert.equal(evalB.riskTier, 'TRUSTED');
  });

  await t.test('8. Break-Glass Continuous Evaluation & Expiration Denial', () => {
    const bgActor = 'usr_emergency_lead';
    const activation = incidentService.activateBreakGlass(
      bgActor,
      'INC-DR-999',
      'Emergency maintenance on database clusters',
      'usr_ciso_approver'
    );

    // 8.1 In-window Break-Glass access
    const activeEval = service.evaluateAccess({
      principalId: bgActor,
      principalRole: 'ADMIN',
      principalCategory: 'BREAK_GLASS',
      resource: '/api/security/rules',
      action: 'security:modify_rules',
      stepUpCompleted: true,
      breakGlassActivationId: activation.activationId,
    });
    assert.equal(activeEval.allowed, true);

    // 8.2 Force Break-Glass session expiration
    const rawSession = (incidentService as any).activeBreakGlassSessions.get(activation.activationId);
    rawSession.expiresAt = Date.now() - 1000;

    // 8.3 Post-expiration Break-Glass access attempt
    const expiredEval = service.evaluateAccess({
      principalId: bgActor,
      principalRole: 'ADMIN',
      principalCategory: 'BREAK_GLASS',
      resource: '/api/security/rules',
      action: 'security:modify_rules',
      stepUpCompleted: true,
      breakGlassActivationId: activation.activationId,
    });
    assert.equal(expiredEval.decision, 'DENY');
    assert.equal(expiredEval.allowed, false);
    assert.ok(expiredEval.reasonCodes.includes('EXPIRED_BREAK_GLASS_SESSION'));
  });

  await t.test('9. Adversarial Test: Role Injection & Privilege Escalation Denial', () => {
    // Customer claiming ADMIN role without backing live registry
    service.setLiveUserRole('usr_attacker', 'CUSTOMER');
    const evalResult = service.evaluateAccess({
      principalId: 'usr_attacker',
      principalRole: 'ADMIN', // Injected role in header/claim
      principalCategory: 'HUMAN',
      resource: '/api/auth/users/role',
      action: 'users:modify_role',
      stepUpCompleted: true,
    });

    assert.equal(evalResult.decision, 'DENY');
    assert.equal(evalResult.allowed, false);
  });

  // Clean exit
  setTimeout(() => {
    process.exit(0);
  }, 100);
});
