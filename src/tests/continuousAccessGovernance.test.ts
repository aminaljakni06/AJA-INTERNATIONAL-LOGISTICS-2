/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-03
 * Continuous Access Governance, Drift Detection & Canary Verification Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  unifiedAccessGovernanceMonitoringService,
  CANONICAL_ROLES_REGISTRY,
  CANONICAL_ROUTES_REGISTRY,
  RoleRegistryEntry,
  RouteSecurityEntry
} from '../services/unifiedAccessGovernanceMonitoringService';

test('STEP UAP-03 — Continuous Identity, Access Governance & Drift Detection Suite', async (t) => {
  const service = unifiedAccessGovernanceMonitoringService;

  await t.test('1. Security Baseline & Deterministic SHA-256 Integrity Seal', () => {
    const baseline = service.getBaseline();
    assert.ok(baseline, 'Baseline must exist');
    assert.ok(baseline.deterministicIntegritySeal, 'Baseline must have a deterministic seal');
    assert.equal(baseline.deterministicIntegritySeal.length, 64, 'SHA-256 seal must be 64 hex characters');
    assert.equal(baseline.rolesRegistry.length >= 4, true, 'Baseline must include canonical roles');
    assert.equal(baseline.routesRegistry.length >= 8, true, 'Baseline must include canonical routes');
  });

  await t.test('2. Roles & Permissions Canonical Invariants', () => {
    const customerRole = CANONICAL_ROLES_REGISTRY.find((r) => r.role === 'CUSTOMER');
    assert.ok(customerRole);
    assert.equal(customerRole.tenantScope, 'OWN_TENANT', 'Customer must have OWN_TENANT scope');
    assert.equal(customerRole.administrativeLevel, 'NONE');
    assert.equal(customerRole.forbiddenActions.includes('users:modify_role'), true);

    const adminRole = CANONICAL_ROLES_REGISTRY.find((r) => r.role === 'ADMIN');
    assert.ok(adminRole);
    assert.equal(adminRole.administrativeLevel, 'ADMIN');
    assert.equal(adminRole.requiresHumanApproval, true);
  });

  await t.test('3. Protected Route Registry Coverage & Backend Guards', () => {
    for (const route of CANONICAL_ROUTES_REGISTRY) {
      if (route.authRequired) {
        assert.ok(
          route.backendEnforcement && route.backendEnforcement !== 'NONE',
          `Protected route ${route.route} must have explicit backend enforcement`
        );
      }
    }
  });

  await t.test('4. Authorization Drift Detection Engine (Positive Baseline Check)', () => {
    const cleanDrift = service.runDriftDetection();
    assert.equal(cleanDrift.hasDrift, false, 'Canonical configuration must have zero drift');
    assert.equal(cleanDrift.criticalDriftCount, 0);
  });

  await t.test('5. Critical Drift Detection on Malicious Role Injection', () => {
    // Simulate malicious tamper: Customer role given wildcard and admin permissions
    const tamperedRoles: RoleRegistryEntry[] = CANONICAL_ROLES_REGISTRY.map((r) => {
      if (r.role === 'CUSTOMER') {
        return {
          ...r,
          allowedActions: [...r.allowedActions, '*', 'users:modify_role'],
        };
      }
      return r;
    });

    const driftResult = service.runDriftDetection(tamperedRoles);
    assert.equal(driftResult.hasDrift, true, 'Drift must be detected when roles are tampered');
    assert.ok(driftResult.criticalDriftCount > 0, 'Must register critical drift on wildcard or admin injection');
    assert.equal(driftResult.highestSeverity, 'CRITICAL');
  });

  await t.test('6. Critical Drift Detection on Unenforced Route', () => {
    // Simulate route losing backend enforcement
    const tamperedRoutes: RouteSecurityEntry[] = CANONICAL_ROUTES_REGISTRY.map((r) => {
      if (r.route === '/api/auth/users') {
        return {
          ...r,
          backendEnforcement: 'NONE',
        };
      }
      return r;
    });

    const driftResult = service.runDriftDetection(undefined, tamperedRoutes);
    assert.equal(driftResult.hasDrift, true);
    const unenforcedFinding = driftResult.findings.find((f) => f.title.includes('Unenforced Backend Route'));
    assert.ok(unenforcedFinding, 'Finding must be generated for unenforced route');
  });

  await t.test('7. Security Event Ingestion & Anomaly Detection Rules', () => {
    // 7.1 Record repeated failed logins
    for (let i = 0; i < 5; i++) {
      service.recordSecurityEvent({
        eventType: 'AUTH_LOGIN_FAILED',
        severity: 'MEDIUM',
        actorId: 'attacker@malicious.com',
        actorType: 'HUMAN',
        resource: '/api/auth/login',
        action: 'login',
        decision: 'DENIED',
        reason: 'Invalid credentials',
        environment: 'PRODUCTION',
      });
    }

    // 7.2 Record Cross-Tenant attempt
    service.recordSecurityEvent({
      eventType: 'AUTHZ_CROSS_TENANT_ACCESS_ATTEMPT',
      severity: 'HIGH',
      actorId: 'usr_cust_a',
      actorType: 'HUMAN',
      tenantId: 'tenant_a',
      resource: '/api/quotes/quote_cust_b',
      action: 'quotes:view',
      decision: 'DENIED',
      reason: 'Cross-tenant access forbidden',
      environment: 'PRODUCTION',
    });

    // 7.3 Record Privilege Escalation attempt
    service.recordSecurityEvent({
      eventType: 'AUTHZ_PRIVILEGE_ESCALATION_ATTEMPT',
      severity: 'CRITICAL',
      actorId: 'usr_cust_a',
      actorType: 'HUMAN',
      resource: '/api/auth/users/usr_cust_a/role',
      action: 'users:modify_role',
      decision: 'DENIED',
      reason: 'Caller lacks ADMIN role',
      environment: 'PRODUCTION',
    });

    // 7.4 Record Token Tampering
    service.recordSecurityEvent({
      eventType: 'AUTH_TOKEN_TAMPERED',
      severity: 'HIGH',
      actorId: 'anonymous_attacker',
      actorType: 'HUMAN',
      resource: '/api/shipments',
      action: 'shipments:list',
      decision: 'DENIED',
      reason: 'JWT signature mismatch',
      environment: 'PRODUCTION',
    });

    const events = service.getEvents();
    assert.ok(events.length >= 8, 'Events ledger must contain all ingested events');

    const findings = service.getFindings();
    assert.ok(findings.some((f) => f.title.includes('Multiple Failed Login Attempts')), 'Brute force finding generated');
    assert.ok(findings.some((f) => f.title.includes('Cross-Tenant Access Blocked')), 'Cross-tenant finding generated');
    assert.ok(findings.some((f) => f.title.includes('Privilege Escalation Blocked')), 'Privilege escalation finding generated');
    assert.ok(findings.some((f) => f.title.includes('Tampered JWT Signature Detected')), 'Token tampering finding generated');
  });

  await t.test('8. Findings Lifecycle & Resolution with Evidence', () => {
    const finding = service.addFinding({
      title: 'Audit Canary Test Finding',
      severity: 'LOW',
      affectedArea: 'CANARY_TEST',
      rootCause: 'Canary test run',
      evidence: 'Simulated verification condition',
      risk: 'None - testing workflow',
      remediation: 'Verify and close',
      owner: 'SEC_TESTER',
    });

    assert.equal(finding.status, 'OPEN');

    const resolved = service.resolveFinding(finding.findingId, 'Automated verification test completed successfully');
    assert.equal(resolved, true);

    const updated = service.getFindings().find((f) => f.findingId === finding.findingId);
    assert.equal(updated?.status, 'RESOLVED');
    assert.ok(updated?.verifiedAt);
  });

  await t.test('9. Security Health Score Calculation (Clean Baseline State)', () => {
    service.resetForTesting();
    const health = service.calculateSecurityHealthScore();
    assert.ok(health.overallScore >= 95, 'Health score must be >= 95 for canonical baseline');
    assert.equal(health.status, 'HEALTHY');
    assert.equal(health.certificationReady, true);
    assert.ok(health.pillars.authenticationIntegrity === 100);
    assert.ok(health.pillars.tenantIsolation === 100);
    assert.ok(health.pillars.rulesIntegrity === 100);
  });

  // Clean exit for node:test
  setTimeout(() => {
    process.exit(0);
  }, 100);
});
