import { getAdminFirestore } from '../../server/firebaseAdmin';
import { 
  SSOProviderConfig, 
  LinkedAccount, 
  PasskeyCredential, 
  SSOProviderType 
} from '../../types/identity';

const SSO_PROVIDERS_COLLECTION = 'sso_providers';
const LINKED_ACCOUNTS_COLLECTION = 'linked_accounts';
const PASSKEYS_COLLECTION = 'passkey_credentials';
const REVOKED_TOKENS_COLLECTION = 'revoked_tokens';

// In-Memory Fallback Stores for High Performance & Offline operation
const memoryProviders = new Map<string, SSOProviderConfig>();
const memoryLinkedAccounts = new Map<string, LinkedAccount>();
const memoryPasskeys = new Map<string, PasskeyCredential>();
const memoryRevokedTokens = new Set<string>();

// Seed default providers if none exist
const defaultProviders: SSOProviderConfig[] = [
  {
    providerId: 'internal',
    type: 'INTERNAL',
    name: 'Internal Password Auth',
    enabled: true,
    displayOrder: 1,
    updatedAt: new Date().toISOString()
  },
  {
    providerId: 'google',
    type: 'GOOGLE',
    name: 'Google Workspace / OAuth 2.0',
    enabled: true,
    clientId: 'aja-logistics-google-client-id.apps.googleusercontent.com',
    redirectUri: '/api/sso/callback/google',
    scopes: ['openid', 'profile', 'email'],
    icon: 'google',
    displayOrder: 2,
    updatedAt: new Date().toISOString()
  },
  {
    providerId: 'microsoft',
    type: 'MICROSOFT',
    name: 'Microsoft Entra ID (Azure AD)',
    enabled: true,
    clientId: 'aja-microsoft-entra-app-id',
    redirectUri: '/api/sso/callback/microsoft',
    scopes: ['openid', 'profile', 'email', 'User.Read'],
    icon: 'microsoft',
    displayOrder: 3,
    updatedAt: new Date().toISOString()
  },
  {
    providerId: 'apple',
    type: 'APPLE',
    name: 'Sign in with Apple',
    enabled: false,
    clientId: 'com.ajalogistics.web.auth',
    redirectUri: '/api/sso/callback/apple',
    scopes: ['name', 'email'],
    icon: 'apple',
    displayOrder: 4,
    updatedAt: new Date().toISOString()
  },
  {
    providerId: 'github',
    type: 'GITHUB',
    name: 'GitHub Enterprise / OAuth',
    enabled: true,
    clientId: 'aja_github_oauth_client_id',
    redirectUri: '/api/sso/callback/github',
    scopes: ['user:email', 'read:user'],
    icon: 'github',
    displayOrder: 5,
    updatedAt: new Date().toISOString()
  },
  {
    providerId: 'linkedin',
    type: 'LINKEDIN',
    name: 'LinkedIn OpenID Connect',
    enabled: false,
    clientId: 'aja_linkedin_client_id',
    redirectUri: '/api/sso/callback/linkedin',
    scopes: ['openid', 'profile', 'email'],
    icon: 'linkedin',
    displayOrder: 6,
    updatedAt: new Date().toISOString()
  },
  {
    providerId: 'saml_corporate',
    type: 'SAML_CUSTOM',
    name: 'Corporate SAML 2.0 Single Sign-On',
    enabled: true,
    samlEntityId: 'https://sso.ajalogistics.com/saml/metadata',
    samlMetadataUrl: 'https://sso.ajalogistics.com/saml/metadata',
    icon: 'shield',
    displayOrder: 7,
    updatedAt: new Date().toISOString()
  }
];

// Initialize in-memory defaults
defaultProviders.forEach(p => memoryProviders.set(p.providerId, p));

// --- SSO PROVIDERS REPOSITORY ---

export async function getAllSSOProviders(): Promise<SSOProviderConfig[]> {
  try {
    const snap = await getAdminFirestore().collection(SSO_PROVIDERS_COLLECTION).get();
    if (!snap.empty) {
      const providers: SSOProviderConfig[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as SSOProviderConfig;
        providers.push(data);
        memoryProviders.set(data.providerId, data);
      });
      return providers.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  } catch (err) {
    console.warn('[SSORepository] Firestore fetch failed, using memory fallback:', err);
  }

  return Array.from(memoryProviders.values()).sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getSSOProviderById(providerId: string): Promise<SSOProviderConfig | null> {
  try {
    const snap = await getAdminFirestore().collection(SSO_PROVIDERS_COLLECTION).doc(providerId).get();
    if (snap.exists) {
      const data = snap.data() as SSOProviderConfig;
      memoryProviders.set(providerId, data);
      return data;
    }
  } catch (err) {
    console.warn('[SSORepository] Provider fetch error:', err);
  }
  return memoryProviders.get(providerId) || null;
}

export async function saveSSOProvider(config: SSOProviderConfig): Promise<SSOProviderConfig> {
  const updated: SSOProviderConfig = {
    ...config,
    updatedAt: new Date().toISOString()
  };

  memoryProviders.set(updated.providerId, updated);

  try {
    await getAdminFirestore().collection(SSO_PROVIDERS_COLLECTION).doc(updated.providerId).set(updated, { merge: true });
  } catch (err) {
    console.warn('[SSORepository] Failed to sync provider to Firestore:', err);
  }

  return updated;
}

// --- LINKED ACCOUNTS REPOSITORY ---

export async function getUserLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
  try {
    const snap = await getAdminFirestore()
      .collection(LINKED_ACCOUNTS_COLLECTION)
      .where('userId', '==', userId)
      .get();
    if (!snap.empty) {
      const list: LinkedAccount[] = [];
      snap.forEach(d => {
        const data = d.data() as LinkedAccount;
        list.push(data);
        memoryLinkedAccounts.set(data.id, data);
      });
      return list;
    }
  } catch (err) {
    console.warn('[SSORepository] Linked accounts fetch error:', err);
  }

  return Array.from(memoryLinkedAccounts.values()).filter(a => a.userId === userId);
}

export async function linkUserAccount(account: Omit<LinkedAccount, 'id' | 'linkedAt'>): Promise<LinkedAccount> {
  const id = `link_${account.userId}_${account.provider}_${Date.now()}`;
  const newLink: LinkedAccount = {
    ...account,
    id,
    linkedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  memoryLinkedAccounts.set(id, newLink);

  try {
    await getAdminFirestore().collection(LINKED_ACCOUNTS_COLLECTION).doc(id).set(newLink);
  } catch (err) {
    console.warn('[SSORepository] Failed to link account in Firestore:', err);
  }

  return newLink;
}

export async function unlinkUserAccount(userId: string, provider: SSOProviderType): Promise<boolean> {
  let foundId: string | null = null;
  for (const [id, acc] of memoryLinkedAccounts.entries()) {
    if (acc.userId === userId && acc.provider === provider) {
      foundId = id;
      memoryLinkedAccounts.delete(id);
      break;
    }
  }

  try {
    if (foundId) {
      await getAdminFirestore().collection(LINKED_ACCOUNTS_COLLECTION).doc(foundId).delete();
    }
    return true;
  } catch (err) {
    console.warn('[SSORepository] Unlink account error:', err);
    return true;
  }
}

// --- PASSKEYS REPOSITORY ---

export async function getUserPasskeys(userId: string): Promise<PasskeyCredential[]> {
  try {
    const snap = await getAdminFirestore()
      .collection(PASSKEYS_COLLECTION)
      .where('userId', '==', userId)
      .get();
    if (!snap.empty) {
      const list: PasskeyCredential[] = [];
      snap.forEach(d => {
        const data = d.data() as PasskeyCredential;
        list.push(data);
        memoryPasskeys.set(data.credentialId, data);
      });
      return list;
    }
  } catch (err) {
    console.warn('[SSORepository] Passkeys fetch error:', err);
  }

  return Array.from(memoryPasskeys.values()).filter(p => p.userId === userId);
}

export async function savePasskey(passkey: PasskeyCredential): Promise<PasskeyCredential> {
  memoryPasskeys.set(passkey.credentialId, passkey);

  try {
    await getAdminFirestore().collection(PASSKEYS_COLLECTION).doc(passkey.credentialId).set(passkey);
  } catch (err) {
    console.warn('[SSORepository] Failed to save passkey to Firestore:', err);
  }

  return passkey;
}

export async function revokeUserPasskey(userId: string, credentialId: string): Promise<boolean> {
  const passkey = memoryPasskeys.get(credentialId);
  if (passkey && passkey.userId === userId) {
    memoryPasskeys.delete(credentialId);
  }

  try {
    await getAdminFirestore().collection(PASSKEYS_COLLECTION).doc(credentialId).delete();
    return true;
  } catch (err) {
    console.warn('[SSORepository] Failed to delete passkey:', err);
    return true;
  }
}

// --- TOKEN REVOCATION REPOSITORY ---

export async function revokeToken(tokenId: string): Promise<void> {
  memoryRevokedTokens.add(tokenId);
  try {
    await getAdminFirestore().collection(REVOKED_TOKENS_COLLECTION).doc(tokenId).set({ tokenId, revokedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('[SSORepository] Failed to revoke token in Firestore:', err);
  }
}

export async function isTokenRevoked(tokenId: string): Promise<boolean> {
  if (memoryRevokedTokens.has(tokenId)) return true;
  try {
    const snap = await getAdminFirestore().collection(REVOKED_TOKENS_COLLECTION).doc(tokenId).get();
    if (snap.exists) {
      memoryRevokedTokens.add(tokenId);
      return true;
    }
  } catch (err) {
    // Ignore error
  }
  return false;
}
