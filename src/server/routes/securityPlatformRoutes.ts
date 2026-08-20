import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth';
import { IAMZeroTrustService } from '../security/IAMZeroTrustService';
import { SIEMSOARSOCService } from '../security/SIEMSOARSOCService';

const router = Router();

/**
 * GET /api/security/overview
 * Combined Executive Security Overview, Zero Trust & SOC Dashboard Metrics
 */
router.get('/overview', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const socDashboard = SIEMSOARSOCService.getSOCDashboard();
  const identities = IAMZeroTrustService.getIdentities();
  const zeroTrustPolicies = IAMZeroTrustService.getZeroTrustPolicies();
  const pamRequests = IAMZeroTrustService.getPAMRequests();
  const secretsVault = IAMZeroTrustService.getSecretsVault();
  const siemEvents = SIEMSOARSOCService.getSIEMEvents();
  const soarPlaybooks = SIEMSOARSOCService.getSOARPlaybooks();

  res.json({
    socDashboard,
    counts: {
      identitiesCount: identities.length,
      zeroTrustPoliciesCount: zeroTrustPolicies.length,
      pamRequestsCount: pamRequests.length,
      secretsVaultCount: secretsVault.length,
      siemEventsCount: siemEvents.length,
      soarPlaybooksCount: soarPlaybooks.length,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/security/iam/identities
 * Enterprise Identities (Employees, Service Accounts, AI Agents, IoT Devices)
 */
router.get('/iam/identities', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const identities = IAMZeroTrustService.getIdentities();
  res.json({ total: identities.length, identities });
});

/**
 * GET /api/security/zero-trust/policies
 * NIST SP 800-207 Zero Trust Micro-Segmentation Policies
 */
router.get('/zero-trust/policies', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const policies = IAMZeroTrustService.getZeroTrustPolicies();
  res.json({ total: policies.length, policies });
});

/**
 * GET /api/security/pam/requests
 * Privileged Access Management (PAM) Just-In-Time Elevation Requests
 */
router.get('/pam/requests', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const requests = IAMZeroTrustService.getPAMRequests();
  res.json({ total: requests.length, requests });
});

/**
 * POST /api/security/pam/request
 * Submit a Just-In-Time Privileged Access Elevation Request
 */
router.post('/pam/request', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requesterName, requestedRole, justificationReason, timeWindowMinutes } = req.body;
    if (!requesterName || !requestedRole || !justificationReason) {
      res.status(400).json({ error: 'requesterName, requestedRole, and justificationReason are required' });
      return;
    }

    const pamReq = IAMZeroTrustService.requestPrivilegedAccess(
      requesterName,
      requestedRole,
      justificationReason,
      timeWindowMinutes || 60
    );
    res.json({ success: true, pamReq });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing PAM request' });
  }
});

/**
 * GET /api/security/secrets/vault
 * Centralized Secrets Vault & mTLS PKI Certificates Rotation
 */
router.get('/secrets/vault', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const vaultItems = IAMZeroTrustService.getSecretsVault();
  res.json({ total: vaultItems.length, vaultItems });
});

/**
 * GET /api/security/siem/events
 * SIEM Normalized Security Events Stream & Threat Intel
 */
router.get('/siem/events', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const events = SIEMSOARSOCService.getSIEMEvents();
  res.json({ total: events.length, events });
});

/**
 * GET /api/security/soar/playbooks
 * Automated Incident Response Playbooks
 */
router.get('/soar/playbooks', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const playbooks = SIEMSOARSOCService.getSOARPlaybooks();
  res.json({ total: playbooks.length, playbooks });
});

/**
 * POST /api/security/soar/trigger
 * Execute automated SOAR Incident Containment Playbook
 */
router.post('/soar/trigger', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { playbookId } = req.body;
    const result = SIEMSOARSOCService.triggerSOARPlaybook(playbookId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing SOAR playbook' });
  }
});

/**
 * GET /api/security/soc/dashboard
 * SOC Executive Overview & Compliance Framework Status (NIST, ISO 27001, PCI-DSS)
 */
router.get('/soc/dashboard', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const socDashboard = SIEMSOARSOCService.getSOCDashboard();
  res.json(socDashboard);
});

export default router;
