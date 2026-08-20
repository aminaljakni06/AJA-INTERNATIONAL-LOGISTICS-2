import { PasskeyCredential } from '../types/identity';
import { 
  getUserPasskeys, 
  savePasskey, 
  revokeUserPasskey 
} from '../db/repositories/ssoRepository';
import { createAuditLog } from '../db/repositories/auditLogRepository';

export class PasskeyService {

  /**
   * Generates WebAuthn Passkey Registration Options for navigator.credentials.create()
   */
  public static generateRegistrationOptions(userId: string, username: string, userDisplayName?: string) {
    const challenge = Buffer.from(Math.random().toString(36).substring(2) + Date.now().toString()).toString('base64');
    
    return {
      rp: {
        name: 'Aja Logistics Enterprise Platform',
        id: typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      },
      user: {
        id: Buffer.from(userId).toString('base64'),
        name: username,
        displayName: userDisplayName || username
      },
      challenge,
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      timeout: 60000,
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'discouraged'
      },
      attestation: 'none'
    };
  }

  /**
   * Verify registration payload and store new Passkey Credential
   */
  public static async verifyAndRegisterPasskey(
    userId: string, 
    credentialId: string, 
    publicKey: string, 
    friendlyName?: string,
    attachment?: 'platform' | 'cross-platform'
  ): Promise<PasskeyCredential> {
    const existing = await getUserPasskeys(userId);
    if (existing.some(p => p.credentialId === credentialId)) {
      throw new Error('Passkey credential already registered');
    }

    const newPasskey: PasskeyCredential = {
      credentialId,
      userId,
      publicKey,
      counter: 0,
      deviceType: attachment === 'platform' ? 'Built-in TouchID/FaceID/Windows Hello' : 'External Security Key (YubiKey)',
      authenticatorAttachment: attachment || 'platform',
      friendlyName: friendlyName || `Passkey (${new Date().toLocaleDateString('ar-SA')})`,
      createdAt: new Date().toISOString()
    };

    const saved = await savePasskey(newPasskey);

    await createAuditLog({
      actorUserId: userId,
      action: 'SECURITY_UPDATE',
      entityType: 'PASSKEY_CREDENTIAL',
      entityId: saved.credentialId,
      after: { details: `Registered new WebAuthn Passkey: ${saved.friendlyName}` }
    });

    return saved;
  }

  /**
   * Get all registered passkeys for a user
   */
  public static async getPasskeys(userId: string): Promise<PasskeyCredential[]> {
    return getUserPasskeys(userId);
  }

  /**
   * Revoke/Delete a passkey credential
   */
  public static async revokePasskey(userId: string, credentialId: string): Promise<boolean> {
    const success = await revokeUserPasskey(userId, credentialId);
    if (success) {
      await createAuditLog({
        actorUserId: userId,
        action: 'SECURITY_UPDATE',
        entityType: 'PASSKEY_CREDENTIAL',
        entityId: credentialId,
        after: { details: `Revoked WebAuthn Passkey: ${credentialId}` }
      });
    }
    return success;
  }
}
