/**
 * AJA INTERNATIONAL LOGISTICS — Corporate Authority, Policies, DoA & PoA Routes
 * Step GOV-10: Enterprise Policies, Internal Controls, Delegation of Authority, Financial Authority Matrix & Power of Attorney
 */

import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { requireGovernanceApiAccess } from '../middleware/governanceApiAuthMiddleware';
import { CorporateAuthorityService } from '../../services/corporateAuthorityService';
import {
  getCorporatePolicies,
  getCorporatePolicyById,
  getCorporatePolicyVersions,
  getInternalControls,
  getDelegations,
  getFinancialAuthorityRules,
  getPowersOfAttorney
} from '../../db/repositories/corporateAuthorityRepository';
import { UserContext } from '../../types/permissions';

const router = Router();

router.use(requireAuth, requireGovernanceApiAccess);

function getUserContext(req: AuthenticatedRequest): UserContext {
  const user = req.user as any;
  return {
    userId: user.userId || user.uid || 'usr_anonymous',
    role: user.role || 'GUEST',
    companyId: user.companyId || user.organizationId,
    legalEntityId: user.legalEntityId || user.companyId,
    branchId: user.branchId,
    departmentId: user.departmentId,
    attributes: user.attributes || {}
  };
}

// ============================================================================
// 1. CORPORATE POLICIES & POLICY VERSIONS
// ============================================================================

// GET /api/governance/authority/policies
router.get('/policies', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { legalEntityId, category, lifecycleStatus } = req.query;
    const policies = await getCorporatePolicies({
      legalEntityId: legalEntityId as string,
      category: category as any,
      lifecycleStatus: lifecycleStatus as string
    });
    res.json(policies);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve corporate policies';
    res.status(500).json({ error: msg });
  }
});

// GET /api/governance/authority/policies/:id
router.get('/policies/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const policy = await getCorporatePolicyById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: `Policy ${req.params.id} not found` });
    }
    const versions = await getCorporatePolicyVersions(policy.id);
    res.json({ policy, versions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve policy details';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/authority/policies
router.post('/policies', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const policy = await CorporateAuthorityService.createPolicy(req.body, ctx);
    res.status(201).json(policy);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create corporate policy';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/governance/authority/policies/:id/versions
router.post('/policies/:id/versions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const version = await CorporateAuthorityService.draftPolicyVersion(
      { ...req.body, policyId: req.params.id },
      ctx
    );
    res.status(201).json(version);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to draft policy version';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/governance/authority/policies/versions/:versionId/publish
router.post('/policies/versions/:versionId/publish', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const result = await CorporateAuthorityService.approveAndPublishPolicyVersion(
      { versionId: req.params.versionId },
      ctx
    );
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to publish policy version';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 2. INTERNAL CONTROLS
// ============================================================================

// GET /api/governance/authority/controls
router.get('/controls', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { legalEntityId, policyId, status, controlType } = req.query;
    const controls = await getInternalControls({
      legalEntityId: legalEntityId as string,
      policyId: policyId as string,
      status: status as string,
      controlType: controlType as string
    });
    res.json(controls);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve internal controls';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/authority/controls
router.post('/controls', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const control = await CorporateAuthorityService.registerInternalControl(req.body, ctx);
    res.status(201).json(control);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to register internal control';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/governance/authority/controls/:id/test
router.post('/controls/:id/test', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const control = await CorporateAuthorityService.testInternalControl(
      { ...req.body, controlId: req.params.id },
      ctx
    );
    res.json(control);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to test internal control';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 3. DELEGATION OF AUTHORITY (DoA)
// ============================================================================

// GET /api/governance/authority/delegations
router.get('/delegations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { legalEntityId, delegateUserId, delegatorUserId, status } = req.query;
    const delegations = await getDelegations({
      legalEntityId: legalEntityId as string,
      delegateUserId: delegateUserId as string,
      delegatorUserId: delegatorUserId as string,
      status: status as string
    });
    res.json(delegations);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve delegations of authority';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/authority/delegations
router.post('/delegations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const delegation = await CorporateAuthorityService.grantDelegation(req.body, ctx);
    res.status(201).json(delegation);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to grant delegation of authority';
    const status = msg.includes('lacks required permission') || msg.includes('prohibited') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/governance/authority/delegations/:id/revoke
router.post('/delegations/:id/revoke', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const delegation = await CorporateAuthorityService.revokeDelegation(
      { delegationId: req.params.id, revocationReason: req.body.revocationReason },
      ctx
    );
    res.json(delegation);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke delegation';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 4. FINANCIAL AUTHORITY MATRIX & TRANSACTION EVALUATION
// ============================================================================

// GET /api/governance/authority/rules
router.get('/rules', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { legalEntityId, departmentId, transactionType, status } = req.query;
    const rules = await getFinancialAuthorityRules({
      legalEntityId: legalEntityId as string,
      departmentId: departmentId as string,
      transactionType: transactionType as any,
      status: status as string
    });
    res.json(rules);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve authority rules';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/authority/rules
router.post('/rules', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const rule = await CorporateAuthorityService.configureAuthorityRule(req.body, ctx);
    res.status(201).json(rule);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to configure authority rule';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/governance/authority/evaluate
router.post('/evaluate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const { request, recentHistory } = req.body;
    const actorBoundRequest = {
      ...request,
      approverUserId: ctx.userId,
      approverRole: ctx.role,
      approverLegalEntityId: ctx.legalEntityId
    };
    const result = await CorporateAuthorityService.evaluateAuthority(actorBoundRequest, recentHistory || []);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to evaluate transaction authority';
    res.status(400).json({ error: msg });
  }
});

// ============================================================================
// 5. POWER OF ATTORNEY (PoA)
// ============================================================================

// GET /api/governance/authority/poa
router.get('/poa', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { legalEntityId, granteeUserId, status, scopeCategory } = req.query;
    const poas = await getPowersOfAttorney({
      legalEntityId: legalEntityId as string,
      granteeUserId: granteeUserId as string,
      status: status as string,
      scopeCategory: scopeCategory as string
    });
    res.json(poas);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve powers of attorney';
    res.status(500).json({ error: msg });
  }
});

// POST /api/governance/authority/poa
router.post('/poa', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const poa = await CorporateAuthorityService.issuePowerOfAttorney(req.body, ctx);
    res.status(201).json(poa);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to issue power of attorney';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// POST /api/governance/authority/poa/:id/revoke
router.post('/poa/:id/revoke', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    const poa = await CorporateAuthorityService.revokePowerOfAttorney(
      { poaId: req.params.id, revocationReason: req.body.revocationReason },
      ctx
    );
    res.json(poa);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke power of attorney';
    const status = msg.includes('lacks required permission') ? 403 : 400;
    res.status(status).json({ error: msg });
  }
});

// ============================================================================
// 6. PROHIBITED HARD DELETE BLOCKER
// ============================================================================

router.delete('/:recordType/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ctx = getUserContext(req);
    await CorporateAuthorityService.deleteRecordProhibited(
      req.params.recordType as any,
      req.params.id,
      ctx
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete operation prohibited';
    res.status(403).json({ error: msg });
  }
});

export default router;
