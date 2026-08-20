/**
 * AJA INTERNATIONAL LOGISTICS — STEP UAP-06
 * Identity Lifecycle Governance, Access Certification, JIT Privilege & Automated Deprovisioning Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  identityLifecycleGovernanceService,
} from '../services/identityLifecycleGovernanceService';
import { 
  identityIncidentResponseService 
} from '../services/identityIncidentResponseService';
import { 
  continuousAccessEvaluationService 
} from '../services/continuousAccessEvaluationService';

test('STEP UAP-06 — Identity Lifecycle Governance, Access Certification & JIT Privilege Suite', async (t) => {
  const lifecycleService = identityLifecycleGovernanceService;
  const incidentService = identityIncidentResponseService;
  const caeService = continuousAccessEvaluationService;

  lifecycleService.resetForTesting();
  incidentService.resetForTesting();
  caeService.resetForTesting();

  await t.test('1. Joiner Workflow: Least Privilege & Valid Customer/Staff Provisioning', () => {
    // 1.1 Valid Customer Provisioning
    const custRes = lifecycleService.provisionIdentity({
      principalId: 'usr_new_cust_101',
      category: 'HUMAN',
      subCategory: 'CUSTOMER',
      email: 'customer101@example.com',
      displayName: 'Ahmad Logistics Client',
      tenantId: 'tenant_client_101',
      actorId: 'usr_onboarding_lead',
    });

    assert.equal(custRes.success, true);
    assert.equal(custRes.identity?.assignedRoles[0], 'CUSTOMER');
    assert.equal(custRes.identity?.status, 'ACTIVE');

    // 1.2 Valid Staff Provisioning
    const staffRes = lifecycleService.provisionIdentity({
      principalId: 'usr_new_staff_202',
      category: 'HUMAN',
      subCategory: 'STAFF',
      email: 'staff202@ajalogistics.com',
      displayName: 'Fatima Ops Specialist',
      tenantId: 'tenant_internal',
      baseRole: 'STAFF',
      actorId: 'usr_ops_manager',
    });

    assert.equal(staffRes.success, true);
    assert.equal(staffRes.identity?.assignedRoles[0], 'STAFF');
  });

  await t.test('2. Joiner Negative Security: Anti-Self-Provisioning of Admin Roles', () => {
    const adminAttempt = lifecycleService.provisionIdentity({
      principalId: 'usr_sneaky_admin_303',
      category: 'HUMAN',
      subCategory: 'ADMIN',
      email: 'sneaky@ajalogistics.com',
      displayName: 'Sneaky User',
      baseRole: 'ADMIN',
      actorId: 'usr_sneaky_admin_303', // Self-provisioning attempt
      approverId: 'usr_sneaky_admin_303', // Self-approval
    });

    assert.equal(adminAttempt.success, false);
    assert.ok(adminAttempt.error?.includes('requires approval from a separate designated Administrator'));
  });

  await t.test('3. Mover Workflow: Role Transition & Privilege Accumulation Prevention', () => {
    const staffId = 'usr_mover_staff_404';
    lifecycleService.provisionIdentity({
      principalId: staffId,
      category: 'HUMAN',
      subCategory: 'STAFF',
      email: 'mover@ajalogistics.com',
      displayName: 'Omar Shift Lead',
      baseRole: 'STAFF',
      actorId: 'usr_hr_lead',
    });

    // Move to CUSTOMER_SUCCESS_LEAD (replaces STAFF to prevent accumulation)
    const moveRes = lifecycleService.transitionIdentityRole({
      principalId: staffId,
      newRole: 'CUSTOMER_SUCCESS_LEAD',
      actorId: 'usr_hr_lead',
      reason: 'Department transfer',
    });

    assert.equal(moveRes.success, true);
    assert.equal(moveRes.identity?.assignedRoles.length, 1);
    assert.equal(moveRes.identity?.assignedRoles[0], 'CUSTOMER_SUCCESS_LEAD');
  });

  await t.test('4. Leaver Workflow: Immediate Deprovisioning & Session Revocation', () => {
    const employeeId = 'usr_terminated_emp_505';
    lifecycleService.provisionIdentity({
      principalId: employeeId,
      category: 'HUMAN',
      subCategory: 'STAFF',
      email: 'terminated@ajalogistics.com',
      displayName: 'Former Employee',
      baseRole: 'STAFF',
      actorId: 'usr_hr_lead',
    });

    // Create a JIT grant for this employee prior to termination
    lifecycleService.requestJitGrant({
      principalId: employeeId,
      role: 'TEMP_OPS_ADMIN',
      tenantScope: 'OWN_TENANT',
      businessReason: 'Shift coverage',
      durationMinutes: 60,
      actorId: employeeId,
      approverId: 'usr_ciso_approver',
    });

    // Execute Immediate Termination
    const termRes = lifecycleService.terminateIdentity(employeeId, 'usr_security_officer', 'Contract End');
    assert.equal(termRes.success, true);

    const terminatedIdentity = lifecycleService.getIdentity(employeeId);
    assert.equal(terminatedIdentity?.status, 'TERMINATED');
    assert.equal(terminatedIdentity?.assignedRoles.length, 0);

    // Verify session is revoked in Incident Service
    const isTokenValid = incidentService.isTokenValid(employeeId);
    assert.equal(isTokenValid, false);

    // Verify JIT grant was automatically revoked
    const isJitActive = lifecycleService.isJitGrantActive(employeeId, 'TEMP_OPS_ADMIN');
    assert.equal(isJitActive, false);
  });

  await t.test('5. Just-In-Time (JIT) Privileged Access Lifecycle & TTL Expiry', () => {
    const engineerId = 'usr_cloud_eng_606';
    lifecycleService.provisionIdentity({
      principalId: engineerId,
      category: 'HUMAN',
      subCategory: 'STAFF',
      email: 'cloudeng@ajalogistics.com',
      displayName: 'Cloud Support Engineer',
      baseRole: 'STAFF',
      actorId: 'usr_devops_lead',
    });

    // 5.1 Anti-Self-Approval on JIT
    const selfJit = lifecycleService.requestJitGrant({
      principalId: engineerId,
      role: 'ADMIN',
      tenantScope: 'GLOBAL',
      businessReason: 'Database index tuning',
      durationMinutes: 30,
      actorId: engineerId,
      approverId: engineerId, // Self-approval
    });
    assert.equal(selfJit.success, false);
    assert.ok(selfJit.error?.includes('Anti-Self-Approval'));

    // 5.2 Valid Approval by Admin
    const approvedJit = lifecycleService.requestJitGrant({
      principalId: engineerId,
      role: 'ADMIN',
      tenantScope: 'GLOBAL',
      businessReason: 'Database index tuning',
      durationMinutes: 30,
      actorId: engineerId,
      approverId: 'usr_lead_admin_777',
    });
    assert.equal(approvedJit.success, true);
    assert.ok(approvedJit.grant?.jitGrantId);

    // 5.3 Active check
    const isActiveNow = lifecycleService.isJitGrantActive(engineerId, 'ADMIN');
    assert.equal(isActiveNow, true);

    // 5.4 Simulate TTL expiration
    const rawGrant = (lifecycleService as any).jitGrants.get(approvedJit.grant?.jitGrantId);
    rawGrant.expiresAt = new Date(Date.now() - 1000).toISOString();

    const isExpiredNow = lifecycleService.isJitGrantActive(engineerId, 'ADMIN');
    assert.equal(isExpiredNow, false);
  });

  await t.test('6. Delegation of Authority Governance & Expiration', () => {
    const managerId = 'usr_delegator_mgr';
    const deputyId = 'usr_delegatee_deputy';

    lifecycleService.provisionIdentity({
      principalId: managerId,
      category: 'HUMAN',
      subCategory: 'STAFF',
      email: 'mgr@ajalogistics.com',
      displayName: 'Operations Manager',
      baseRole: 'STAFF',
      actorId: 'usr_hr',
    });

    lifecycleService.provisionIdentity({
      principalId: deputyId,
      category: 'HUMAN',
      subCategory: 'STAFF',
      email: 'deputy@ajalogistics.com',
      displayName: 'Deputy Lead',
      baseRole: 'STAFF',
      actorId: 'usr_hr',
    });

    // 6.1 Create valid delegation
    const delRes = lifecycleService.createDelegation({
      delegatorId: managerId,
      delegateeId: deputyId,
      delegatedRole: 'FINANCE_APPROVER',
      reason: 'Manager on annual leave',
      durationHours: 48,
    });
    assert.equal(delRes.success, true);

    const isDelActive = lifecycleService.isDelegationActive(deputyId, 'FINANCE_APPROVER');
    assert.equal(isDelActive, true);

    // 6.2 Self-delegation rejection
    const selfDel = lifecycleService.createDelegation({
      delegatorId: managerId,
      delegateeId: managerId,
      delegatedRole: 'FINANCE_APPROVER',
      reason: 'Self delegation',
      durationHours: 24,
    });
    assert.equal(selfDel.success, false);
    assert.ok(selfDel.error?.includes('Self-delegation is prohibited'));
  });

  await t.test('7. Access Certification Campaigns & Role Revocation', () => {
    const empReviewId = 'usr_review_emp_808';
    lifecycleService.provisionIdentity({
      principalId: empReviewId,
      category: 'HUMAN',
      subCategory: 'STAFF',
      email: 'review808@ajalogistics.com',
      displayName: 'Tariq Logistics Specialist',
      baseRole: 'STAFF',
      actorId: 'usr_hr',
    });

    // Start quarterly campaign
    const campaign = lifecycleService.createCertificationCampaign('Q3 Identity Review Campaign');
    assert.equal(campaign.status, 'ACTIVE');
    assert.ok(campaign.items.length > 0);

    const empItem = campaign.items.find((i) => i.principalId === empReviewId);
    assert.ok(empItem);

    // Revoke excess role during review
    const revDecision = lifecycleService.submitReviewDecision(
      campaign.campaignId,
      empItem.itemId,
      'usr_compliance_lead',
      'REVOKE',
      'Role no longer aligned with responsibilities'
    );
    assert.equal(revDecision.success, true);

    // Verify role was automatically removed on identity
    const updatedEmp = lifecycleService.getIdentity(empReviewId);
    assert.equal(updatedEmp?.assignedRoles.length, 0);
  });

  await t.test('8. Segregation of Duties (SoD) Conflict Detection', () => {
    const conflicts = lifecycleService.checkSodViolations(['ADMIN', 'CUSTOMER']);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].ruleId, 'SOD-01-ADMIN-CUSTOMER');
    assert.equal(conflicts[0].severity, 'CRITICAL');
  });

  await t.test('9. Access Reconciliation Engine: Orphan & Unowned Service Detection', () => {
    // 9.1 Create Orphan State: Terminated user with residual role in mock state
    const orphanId = 'usr_orphan_909';
    (lifecycleService as any).identities.set(orphanId, {
      principalId: orphanId,
      category: 'HUMAN',
      email: 'orphan@ajalogistics.com',
      displayName: 'Orphan User',
      status: 'TERMINATED',
      assignedRoles: ['ADMIN'], // Residual anomaly
      assignedPermissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 9.2 Create Unowned Service Account
    const serviceId = 'svc_unowned_api';
    (lifecycleService as any).identities.set(serviceId, {
      principalId: serviceId,
      category: 'SERVICE',
      email: 'service@ajalogistics.com',
      displayName: 'Automated Invoice Service',
      status: 'ACTIVE',
      assignedRoles: ['SERVICE_ROLE'],
      assignedPermissions: [],
      // ownerId omitted intentionally
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const discrepancies = lifecycleService.runAccessReconciliation();
    assert.ok(discrepancies.length >= 2);

    const orphanDisc = discrepancies.find((d) => d.principalId === orphanId && d.type === 'ORPHAN_ACCESS');
    assert.ok(orphanDisc);
    assert.equal(orphanDisc.severity, 'CRITICAL');

    const svcDisc = discrepancies.find((d) => d.principalId === serviceId && d.type === 'ORPHAN_ACCESS');
    assert.ok(svcDisc);
  });

  // Clean exit
  setTimeout(() => {
    process.exit(0);
  }, 100);
});
