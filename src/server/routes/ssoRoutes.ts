import { Router, Request, Response } from 'express';
import { requireAuth, requireRoles, AuthenticatedRequest } from '../auth';
import { SSOService } from '../../services/ssoService';
import { PasskeyService } from '../../services/passkeyService';
import { AdaptiveAuthService } from '../../services/adaptiveAuthService';

const router = Router();

// --- PUBLIC PROVIDERS ---

// GET /api/sso/providers
router.get('/providers', async (_req: Request, res: Response) => {
  try {
    const providers = await SSOService.getEnabledPublicProviders();
    res.json(providers);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch SSO providers';
    res.status(500).json({ error: msg });
  }
});

// --- ADMIN SSO PROVIDERS MANAGEMENT ---

// GET /api/sso/admin/providers
router.get('/admin/providers', requireAuth, requireRoles('ADMIN'), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const providers = await SSOService.getProviders();
    res.json(providers);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch admin providers';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/sso/admin/providers/:providerId
router.put('/admin/providers/:providerId', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { providerId } = req.params;
    const updates = req.body;
    const actorUserId = req.user!.userId;

    const updated = await SSOService.updateProviderConfig(providerId, updates, actorUserId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update provider config';
    res.status(500).json({ error: msg });
  }
});

// POST /api/sso/admin/providers/:providerId/toggle
router.post('/admin/providers/:providerId/toggle', requireAuth, requireRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { providerId } = req.params;
    const { enabled } = req.body;
    const actorUserId = req.user!.userId;

    const updated = await SSOService.toggleProvider(providerId, Boolean(enabled), actorUserId);
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle provider status';
    res.status(500).json({ error: msg });
  }
});

// --- CONNECTED & LINKED ACCOUNTS ---

// GET /api/sso/linked-accounts
router.get('/linked-accounts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const linked = await SSOService.getLinkedAccounts(userId);
    res.json(linked);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch linked accounts';
    res.status(500).json({ error: msg });
  }
});

// POST /api/sso/link
router.post('/link', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { provider, providerUserId, providerEmail, displayName } = req.body;

    if (!provider || !providerUserId || !providerEmail) {
      res.status(400).json({ error: 'بيانات مزود الهوية مطلوبة بالكامل (provider, providerUserId, providerEmail)' });
      return;
    }

    const linked = await SSOService.linkAccount(userId, provider, providerUserId, providerEmail, displayName);
    res.json({ message: 'تم ربط الحساب بنجاح', account: linked });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to link account';
    res.status(500).json({ error: msg });
  }
});

// POST /api/sso/unlink
router.post('/unlink', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { provider } = req.body;

    if (!provider) {
      res.status(400).json({ error: 'اسم مزود الهوية مطلوب إلغاء ربطه' });
      return;
    }

    await SSOService.unlinkAccount(userId, provider);
    res.json({ message: 'تم إلغاء ربط الحساب بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to unlink account';
    res.status(500).json({ error: msg });
  }
});

// --- OAUTH 2.1 & OIDC ---

// GET /api/sso/oidc/.well-known/openid-configuration
router.get('/oidc/.well-known/openid-configuration', (_req: Request, res: Response) => {
  const config = SSOService.getOIDCDiscoveryConfig();
  res.json(config);
});

// GET /api/sso/saml/metadata
router.get('/saml/metadata', (_req: Request, res: Response) => {
  const metadata = SSOService.getSAMLMetadata();
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${metadata.entityId}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="${metadata.ssoServiceUrl}"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`);
});

// POST /api/sso/oauth/token
router.post('/oauth/token', (req: Request, res: Response) => {
  try {
    const { subject_token } = req.body;
    const tokens = SSOService.exchangeToken(subject_token || 'demo_token');
    res.json(tokens);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to exchange token';
    res.status(400).json({ error: msg });
  }
});

// --- PASSKEYS (WEBAUTHN) ---

// GET /api/sso/passkeys
router.get('/passkeys', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const passkeys = await PasskeyService.getPasskeys(userId);
    res.json(passkeys);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch passkeys';
    res.status(500).json({ error: msg });
  }
});

// POST /api/sso/passkeys/register-options
router.post('/passkeys/register-options', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const email = req.user!.email;
    const options = PasskeyService.generateRegistrationOptions(userId, email, email);
    res.json(options);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate passkey options';
    res.status(500).json({ error: msg });
  }
});

// POST /api/sso/passkeys/register-verify
router.post('/passkeys/register-verify', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { credentialId, publicKey, friendlyName, attachment } = req.body;

    if (!credentialId || !publicKey) {
      res.status(400).json({ error: 'بيانات مفتاح المرور مطلوبة (credentialId, publicKey)' });
      return;
    }

    const passkey = await PasskeyService.verifyAndRegisterPasskey(userId, credentialId, publicKey, friendlyName, attachment);
    res.json({ message: 'تم تسجيل مفتاح المرور (Passkey) بنجاح', passkey });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to register passkey';
    res.status(500).json({ error: msg });
  }
});

// DELETE /api/sso/passkeys/:credentialId
router.delete('/passkeys/:credentialId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { credentialId } = req.params;

    await PasskeyService.revokePasskey(userId, credentialId);
    res.json({ message: 'تم إلغاء مفتاح المرور بنجاح' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to revoke passkey';
    res.status(500).json({ error: msg });
  }
});

// --- ADAPTIVE RISK ASSESSMENT ---

// POST /api/sso/adaptive/assess
router.post('/adaptive/assess', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const ipAddress = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    const { location } = req.body;

    const assessment = await AdaptiveAuthService.evaluateSessionRisk(userId, ipAddress, userAgent, location);
    res.json(assessment);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to perform risk assessment';
    res.status(500).json({ error: msg });
  }
});

export default router;
