import { 
  SSOProviderConfig, 
  LinkedAccount, 
  SSOProviderType, 
  OAuth20PKCERequest, 
  OIDCDiscoveryConfiguration, 
  SAMLMetadataConfig 
} from '../types/identity';
import { 
  getAllSSOProviders, 
  getSSOProviderById, 
  saveSSOProvider, 
  getUserLinkedAccounts, 
  linkUserAccount, 
  unlinkUserAccount 
} from '../db/repositories/ssoRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';
import { EventBusService } from './eventBusService';

export class SSOService {

  /**
   * Retrieves all registered SSO Identity Providers
   */
  public static async getProviders(): Promise<SSOProviderConfig[]> {
    return getAllSSOProviders();
  }

  /**
   * Retrieves enabled public SSO providers for login UI
   */
  public static async getEnabledPublicProviders(): Promise<SSOProviderConfig[]> {
    const providers = await getAllSSOProviders();
    return providers
      .filter(p => p.enabled)
      .map(p => ({
        providerId: p.providerId,
        type: p.type,
        name: p.name,
        enabled: p.enabled,
        icon: p.icon,
        redirectUri: p.redirectUri,
        displayOrder: p.displayOrder,
        updatedAt: p.updatedAt
      }));
  }

  /**
   * Update or configure an SSO Provider
   */
  public static async updateProviderConfig(
    providerId: string, 
    updates: Partial<SSOProviderConfig>, 
    actorUserId: string
  ): Promise<SSOProviderConfig> {
    const existing = await getSSOProviderById(providerId);
    if (!existing) {
      throw new Error(`SSO Provider ${providerId} not found.`);
    }

    const updated = await saveSSOProvider({
      ...existing,
      ...updates,
      providerId
    });

    await createAuditLog({
      actorUserId,
      action: 'SYSTEM_SETTINGS_UPDATE',
      entityType: 'SSO_PROVIDER',
      entityId: providerId,
      after: { details: `Updated SSO Provider configuration for ${providerId}`, updates }
    });

    EventBusService.publish({
      name: 'SystemAlertGenerated',
      aggregateId: providerId,
      aggregateType: 'IDENTITY_PROVIDER',
      module: 'HR' as any,
      triggeredBy: { userId: actorUserId },
      payload: { action: 'SSO_PROVIDER_UPDATED', providerId }
    });

    return updated;
  }

  /**
   * Toggle SSO Provider state (Enable/Disable)
   */
  public static async toggleProvider(providerId: string, enabled: boolean, actorUserId: string): Promise<SSOProviderConfig> {
    return this.updateProviderConfig(providerId, { enabled }, actorUserId);
  }

  /**
   * Get connected/linked accounts for a user
   */
  public static async getLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
    return getUserLinkedAccounts(userId);
  }

  /**
   * Link an external SSO identity provider to user profile
   */
  public static async linkAccount(
    userId: string, 
    provider: SSOProviderType, 
    providerUserId: string, 
    providerEmail: string,
    displayName?: string
  ): Promise<LinkedAccount> {
    const existing = await getUserLinkedAccounts(userId);
    const isAlreadyLinked = existing.some(a => a.provider === provider);
    if (isAlreadyLinked) {
      throw new Error(`Account is already linked with ${provider}`);
    }

    const linked = await linkUserAccount({
      userId,
      provider,
      providerUserId,
      providerEmail,
      providerDisplayName: displayName
    });

    await createAuditLog({
      actorUserId: userId,
      action: 'SECURITY_UPDATE',
      entityType: 'USER_IDENTITY',
      entityId: userId,
      after: { details: `Linked external identity provider: ${provider} (${providerEmail})` }
    });

    return linked;
  }

  /**
   * Unlink an external SSO provider
   */
  public static async unlinkAccount(userId: string, provider: SSOProviderType): Promise<boolean> {
    if (provider === 'INTERNAL') {
      throw new Error('Internal credentials cannot be unlinked.');
    }

    const linkedAccounts = await getUserLinkedAccounts(userId);
    if (linkedAccounts.length <= 1) {
      throw new Error('Cannot unlink the only active authentication method.');
    }

    const success = await unlinkUserAccount(userId, provider);
    if (success) {
      await createAuditLog({
        actorUserId: userId,
        action: 'SECURITY_UPDATE',
        entityType: 'USER_IDENTITY',
        entityId: userId,
        after: { details: `Unlinked external identity provider: ${provider}` }
      });
    }

    return success;
  }

  /**
   * OAuth 2.1 PKCE Authorization URL & Challenge Generator
   */
  public static generateOAuth21AuthorizationUrl(req: OAuth20PKCERequest): { url: string; state: string } {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: req.clientId,
      redirect_uri: req.redirectUri,
      scope: req.scope,
      state: req.state,
      code_challenge: req.codeChallenge,
      code_challenge_method: req.codeChallengeMethod
    });

    return {
      url: `/api/sso/oauth/authorize?${params.toString()}`,
      state: req.state
    };
  }

  /**
   * OpenID Connect (OIDC) Well-Known Discovery Provider
   */
  public static getOIDCDiscoveryConfig(): OIDCDiscoveryConfiguration {
    const baseUrl = 'https://sso.ajalogistics.com';
    return {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/api/sso/oauth/authorize`,
      token_endpoint: `${baseUrl}/api/sso/oauth/token`,
      userinfo_endpoint: `${baseUrl}/api/sso/oauth/userinfo`,
      jwks_uri: `${baseUrl}/api/sso/oauth/.well-known/jwks.json`,
      scopes_supported: ['openid', 'profile', 'email', 'roles', 'organization'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token', 'urn:ietf:params:oauth:grant-type:token-exchange'],
      subject_types_supported: ['public', 'pairwise'],
      id_token_signing_alg_values_supported: ['RS256']
    };
  }

  /**
   * SAML 2.0 Metadata Generator
   */
  public static getSAMLMetadata(entityId?: string): SAMLMetadataConfig {
    return {
      entityId: entityId || 'https://sso.ajalogistics.com/saml/metadata',
      ssoServiceUrl: 'https://sso.ajalogistics.com/api/sso/saml/sso',
      sloServiceUrl: 'https://sso.ajalogistics.com/api/sso/saml/slo',
      x509Certificate: '-----BEGIN CERTIFICATE-----\nMIICXzCCAcegAwIBAgIJAJ123AJA...AJA_ENTERPRISE_SAML_KEY...\n-----END CERTIFICATE-----',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
    };
  }

  /**
   * Perform Token Exchange (OAuth 2.1 RFC 8693)
   */
  public static exchangeToken(subjectToken: string): { accessToken: string; tokenType: string; expiresIn: number } {
    if (!subjectToken) {
      throw new Error('Subject token is required for token exchange');
    }

    return {
      accessToken: `aja_sso_exchanged_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      tokenType: 'Bearer',
      expiresIn: 3600
    };
  }
}
