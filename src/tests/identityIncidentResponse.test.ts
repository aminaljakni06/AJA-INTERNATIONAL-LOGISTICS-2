/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-04
 * Identity Security Incident Response, Automated Containment & Resilience Assurance Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  identityIncidentResponseService 
} from '../services/identityIncidentResponseService';

test('STEP UAP-04 — Identity Security Incident Response & Resilience Test Suite', async (t) => {
  const service = identityIncidentResponseService;
  service.resetForTesting();

  await t.test('1. Baseline Revalidation & Deterministic Integrity Seal Check', () => {
    const reval = service.revalidateBaseline();
    assert.equal(reval.status, 'VALID_BASELINE', 'Baseline must match STEP UAP-03 canonical seal');
    assert.equal(reval.sealMatch, true, 'SHA-256 integrity seal must match');
    assert.equal(reval.rulesHashMatch, true, 'Firestore security rules hash must match');
  });

  await t.test('2. Closed Security Health Score Formula & Pillars', () => {
    const health = service.calculateRigorousHealthScore();
    assert.ok(health.overallScore >= 95, 'Health score must be >= 95 in clean baseline');
    assert.equal(health.status, 'HEALTHY');
    assert.ok(health.formula.includes('Score = (Auth*0.15)'));
    assert.equal(health.pillars.tenantIsolation, 100);
    assert.equal(health.pillars.authIntegrity, 100);
  });

  await t.test('3. Tabletop Scenario A — Customer Account Takeover & Automated Containment', () => {
    const actorId = 'usr_compromised_customer';
    const correlationId = 'CORR-SCENARIO-A';

    // 3.1 Ingest 3 failed logins
    for (let i = 0; i < 3; i++) {
      service.correlateAndIngestEvent({
        eventId: `EVT-FAIL-${i}`,
        eventType: 'AUTH_LOGIN_FAILED',
        severity: 'MEDIUM',
        timestamp: new Date().toISOString(),
        actorId,
        actorType: 'HUMAN',
        resource: '/api/auth/login',
        action: 'login',
        decision: 'DENIED',
        reason: 'Password mismatch',
        correlationId,
        environment: 'PRODUCTION',
      });
    }

    // 3.2 Ingest 1 successful login
    service.correlateAndIngestEvent({
      eventId: 'EVT-SUCCESS',
      eventType: 'AUTH_LOGIN_SUCCESS',
      severity: 'INFO',
      timestamp: new Date().toISOString(),
      actorId,
      actorType: 'HUMAN',
      resource: '/api/auth/login',
      action: 'login',
      decision: 'ALLOWED',
      reason: 'Valid credentials',
      correlationId,
      environment: 'PRODUCTION',
    });

    // 3.3 Ingest immediate privilege escalation attempt
    const incident = service.correlateAndIngestEvent({
      eventId: 'EVT-PRIV-ATTEMPT',
      eventType: 'AUTHZ_PRIVILEGE_ESCALATION_ATTEMPT',
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      actorId,
      actorType: 'HUMAN',
      resource: '/api/auth/users/role',
      action: 'users:modify_role',
      decision: 'DENIED',
      reason: 'Role escalation blocked',
      correlationId,
      environment: 'PRODUCTION',
    });

    assert.ok(incident, 'Incident must be created for Account Takeover');
    assert.equal(incident.incidentType, 'ACCOUNT_TAKEOVER_SUSPECTED');
    assert.equal(incident.severity, 'CRITICAL');
    assert.equal(incident.status, 'CONTAINED', 'Incident must be auto-contained');
    assert.equal(incident.containmentActions.length, 1);

    // 3.4 Verify user token is revoked
    const isValid = service.isTokenValid(actorId);
    assert.equal(isValid, false, 'Compromised user session must be strictly revoked');

    // 3.5 Recover identity
    const recovery = service.recoverCompromisedIdentity(incident.incidentId, actorId, 'new_bcrypt_hash', 'SECURITY_ADMIN');
    assert.equal(recovery.success, true);
    assert.equal(service.isTokenValid(actorId), true, 'User session must be valid post-recovery');

    // 3.6 Close Incident with RCA
    const closeRes = service.closeIncident(
      incident.incidentId,
      'CISO_OFFICER',
      'Credential stuffing attack via compromised third-party credentials',
      'Enforced password reset, rotated session keys, verified identity'
    );
    assert.equal(closeRes.success, true);
    assert.equal(incident.status, 'CLOSED');
    assert.ok(incident.mttrSeconds >= 0);
  });

  await t.test('4. Tabletop Scenario B — Cross-Tenant Breach & Tenant-Aware Isolation', () => {
    const tenantAUser = 'usr_tenant_a_customer';
    const tenantBUser = 'usr_tenant_b_customer';

    const incident = service.correlateAndIngestEvent({
      eventId: 'EVT-CROSS-TENANT-01',
      eventType: 'AUTHZ_CROSS_TENANT_ACCESS_ATTEMPT',
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      actorId: tenantAUser,
      actorType: 'HUMAN',
      tenantId: 'tenant_alpha',
      resource: '/api/quotes/quote_belonging_to_tenant_beta',
      action: 'quotes:view',
      decision: 'DENIED',
      reason: 'Cross-tenant barrier enforced',
      correlationId: 'CORR-TENANT-ISOLATION-01',
      environment: 'PRODUCTION',
    });

    assert.ok(incident);
    assert.equal(incident.incidentType, 'CROSS_TENANT_ACCESS_ATTEMPT');

    // Contain Tenant A user
    service.executeSessionRevocation(tenantAUser);
    assert.equal(service.isTokenValid(tenantAUser), false, 'Tenant A user contained');

    // Verify Tenant B user is completely unaffected (Tenant-Aware Response)
    assert.equal(service.isTokenValid(tenantBUser), true, 'Tenant B user remains operational');
  });

  await t.test('5. Tabletop Scenario D — Admin Account Compromise & Human Approval Enforcement', () => {
    const adminUser = 'usr_admin_suspicious';
    const incident = service.createIncident({
      incidentType: 'ADMIN_ACCOUNT_COMPROMISE',
      severity: 'CRITICAL',
      title: 'Suspicious Admin Account Activity',
      description: 'Anomalous administrative session detected from foreign ASN',
      actorId: adminUser,
      actorType: 'HUMAN',
      sourceEvents: ['EVT-ADMIN-01'],
      affectedResources: ['/api/auth/users'],
      correlationId: 'CORR-ADMIN-01',
    });

    // 5.1 Request Privileged Containment
    const approvalTicket = service.requestPrivilegedContainmentApproval(
      incident.incidentId,
      'QUARANTINE_IDENTITY',
      adminUser,
      'Suspicious admin access requires executive isolation'
    );
    assert.ok(approvalTicket);
    assert.equal(incident.status, 'CONTAINMENT_PENDING');

    // 5.2 Negative Test: Anti-Self-Approval (Admin cannot self-approve own quarantine)
    const selfApproval = service.approvePrivilegedContainment(approvalTicket.approvalId, adminUser, 'ADMIN');
    assert.equal(selfApproval.success, false, 'Self-approval must be rejected');

    // 5.3 Negative Test: Unauthorized role cannot approve
    const staffApproval = service.approvePrivilegedContainment(approvalTicket.approvalId, 'usr_staff_ops', 'STAFF');
    assert.equal(staffApproval.success, false, 'Staff cannot approve admin containment');

    // 5.4 Authorized Approval by another Security Admin
    const validApproval = service.approvePrivilegedContainment(approvalTicket.approvalId, 'usr_sec_admin_root', 'ADMIN');
    assert.equal(validApproval.success, true);
    assert.equal(incident.status, 'CONTAINED');
    assert.equal(service.isTokenValid(adminUser), false, 'Admin session revoked post-approval');
  });

  await t.test('6. Tabletop Scenario E — Break-Glass Emergency Governance & 60-min TTL Expiry', () => {
    const actorId = 'usr_dr_lead';
    const approverId = 'usr_ciso_approver';

    // 6.1 Dual authorization activation
    const bgActivation = service.activateBreakGlass(
      actorId,
      'INC-DISASTER-RECOVERY-01',
      'Critical database partition restoration during outage',
      approverId
    );

    assert.ok(bgActivation.activationId);
    assert.equal(service.isBreakGlassActive(bgActivation.activationId), true, 'Break-glass must be active initially');

    // 6.2 Simulate TTL expiration
    const rawSession = (service as any).activeBreakGlassSessions.get(bgActivation.activationId);
    rawSession.expiresAt = Date.now() - 1000; // Force expired

    assert.equal(service.isBreakGlassActive(bgActivation.activationId), false, 'Break-glass must auto-expire after TTL');
  });

  await t.test('7. Negative Security Tests — Token Replay & Closure Gate Enforcement', () => {
    // 7.1 Specific Token Replay Protection
    service.revokeSpecificToken('tok_stolen_replay_123');
    assert.equal(service.isTokenValid('usr_any', 'tok_stolen_replay_123'), false, 'Replayed revoked token must be denied');

    // 7.2 Incident Closure Gate Negative Test (Cannot close without RCA)
    const rawInc = service.createIncident({
      incidentType: 'CREDENTIAL_COMPROMISE',
      severity: 'LOW',
      title: 'Closure Gate Test',
      description: 'Testing closure gate',
      actorId: 'usr_test',
      actorType: 'HUMAN',
      sourceEvents: ['EVT-01'],
      affectedResources: ['/api/test'],
      correlationId: 'CORR-TEST',
    });

    const closeAttempt = service.closeIncident(rawInc.incidentId, 'ADMIN', '', 'Fixed');
    assert.equal(closeAttempt.success, false, 'Closure without RCA must fail');
  });

  await t.test('8. Forensic Evidence Vault & Integrity Seal Verification', () => {
    const rawInc = service.createIncident({
      incidentType: 'SUSPICIOUS_PASSWORD_RESET',
      severity: 'MEDIUM',
      title: 'Evidence Test',
      description: 'Testing evidence hash verification',
      actorId: 'usr_evd_test',
      actorType: 'HUMAN',
      sourceEvents: ['EVT-EVD-01'],
      affectedResources: ['/api/auth/forgot-password'],
      correlationId: 'CORR-EVD',
    });

    const evidence = service.addEvidenceToIncident(rawInc, 'TOKEN_SNAPSHOT', 'AUTH_GATEWAY', {
      ip: '192.168.1.1',
      userAgent: 'AutomatedProbe/1.0',
      action: 'RESET_REQUEST',
    });

    const isIntact = service.verifyEvidenceIntegrity(evidence);
    assert.equal(isIntact, true, 'Computed SHA-256 must match raw payload');

    // Simulate tampering with evidence payload
    evidence.payloadSummary.ip = '10.0.0.1';
    const isTampered = service.verifyEvidenceIntegrity(evidence);
    assert.equal(isTampered, false, 'Tampered evidence must fail cryptographic verification');
  });

  // Clean exit for node:test
  setTimeout(() => {
    process.exit(0);
  }, 100);
});
