import {
  EnterpriseIdentity,
  PrivilegedAccessRequest,
  ZeroTrustPolicy,
  SecretVaultItem,
} from './types';

export class IAMZeroTrustService {
  private static readonly IDENTITIES: EnterpriseIdentity[] = [
    {
      id: 'USR-SEC-01',
      username: 'aaljakni@aja.sa',
      fullNameAr: 'عبدالله الجقني - كبير ضباط أمن المعلومات (CISO)',
      fullNameEn: 'Abdullah Al-Jakni (CISO)',
      email: 'aaljakni@aja.sa',
      type: 'EMPLOYEE',
      status: 'ACTIVE',
      roles: ['CISO_SUPER_ADMIN', 'SECURITY_AUDITOR'],
      mfaMethod: 'PASSKEY_FIDO2',
      riskScore: 4,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      associatedDevicesCount: 2,
      ipAddressLocation: 'Riyadh HQ (185.192.12.14)',
    },
    {
      id: 'USR-OPS-88',
      username: 'f.harbi@aja.sa',
      fullNameAr: 'فهد الحربي - مدير عمليات ميناء جدة الإسلامي',
      fullNameEn: 'Fahad Al-Harbi (Jeddah Port Ops Manager)',
      email: 'f.harbi@aja.sa',
      type: 'EMPLOYEE',
      status: 'ACTIVE',
      roles: ['PORT_OPS_MANAGER', 'CUSTOMS_SUBMITTER'],
      mfaMethod: 'PASSKEY_FIDO2',
      riskScore: 12,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      associatedDevicesCount: 3,
      ipAddressLocation: 'Jeddah Port Gateway (82.205.10.4)',
    },
    {
      id: 'SVC-ZATCA-INTEG',
      username: 'svc_zatca_phase2_prod',
      fullNameAr: 'حساب خادم هيئة الزكاة والضريبة والجمارك (ZATCA mTLS)',
      fullNameEn: 'ZATCA E-Invoicing M2M Service Account',
      email: 'svc_zatca@sys.aja.sa',
      type: 'SERVICE_ACCOUNT',
      status: 'ACTIVE',
      roles: ['M2M_FINANCE_SIGNER'],
      mfaMethod: 'DISABLED',
      riskScore: 1,
      lastLoginAt: new Date().toISOString(),
      associatedDevicesCount: 1,
      ipAddressLocation: 'KSA Cloud Private Subnet (10.140.2.80)',
    },
    {
      id: 'AI-AGENT-LOGISTICS',
      username: 'agent_dispatch_ai_core',
      fullNameAr: 'عميل الذكاء الاصطناعي للتوزيع التلقائي (Autonomous Dispatch Agent)',
      fullNameEn: 'Autonomous Dispatch AI Agent',
      email: 'ai_dispatch@sys.aja.sa',
      type: 'AI_AGENT',
      status: 'ACTIVE',
      roles: ['AI_AUTONOMOUS_OPERATOR'],
      mfaMethod: 'DISABLED',
      riskScore: 8,
      lastLoginAt: new Date(Date.now() - 1000 * 15).toISOString(),
      associatedDevicesCount: 1,
      ipAddressLocation: 'AI Studio Container Mesh (10.240.0.12)',
    },
    {
      id: 'PARTNER-MAERSK-G3',
      username: 'b2b_maersk_api_client',
      fullNameAr: 'مرفق ربط شريك ميرسك العالمي (Maersk B2B EDI)',
      fullNameEn: 'Maersk B2B Gateway Identity',
      email: 'edi_security@maersk.com',
      type: 'PARTNER',
      status: 'ACTIVE',
      roles: ['B2B_SHIPMENT_API_WRITER'],
      mfaMethod: 'PASSKEY_FIDO2',
      riskScore: 15,
      lastLoginAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      associatedDevicesCount: 2,
      ipAddressLocation: 'Copenhagen Maersk API Proxy (195.137.20.2)',
    },
  ];

  private static readonly ZERO_TRUST_POLICIES: ZeroTrustPolicy[] = [
    {
      policyId: 'ZTP-01-CORE-PAYMENTS',
      policyNameAr: 'حظر الوصول لإنتاج المدفوعات بدون ممر mTLS ومعتمد Passkey',
      policyNameEn: 'Strict Core Financial & ZATCA Access Policy',
      resourceTarget: '/api/v1/finance/*',
      enforcementMode: 'STRICT_BLOCK',
      deviceComplianceRequired: true,
      mTLSEnforced: true,
      locationRestriction: 'Saudi Arabia IP Space / Private VPN Only',
      activeStatus: true,
    },
    {
      policyId: 'ZTP-02-FLEET-TELEMETRY',
      policyNameAr: 'التحقق المستمر من أجهزة وسائقي الأسطول الميداني',
      policyNameEn: 'Continuous IoT Fleet Terminal Verification Policy',
      resourceTarget: '/api/v1/fleet/telemetry/*',
      enforcementMode: 'STEP_UP_MFA',
      deviceComplianceRequired: true,
      mTLSEnforced: false,
      locationRestriction: 'GCC Region',
      activeStatus: true,
    },
    {
      policyId: 'ZTP-03-AI-AGENT-EVAL',
      policyNameAr: 'حدود الصلاحية المحدودة لقرارات الذكاء الاصطناعي التشغيلية',
      policyNameEn: 'AI Agent Autonomous Execution Boundary Policy',
      resourceTarget: '/api/v1/ai/dispatch/execute',
      enforcementMode: 'STRICT_BLOCK',
      deviceComplianceRequired: false,
      mTLSEnforced: true,
      locationRestriction: 'Internal Cloud Subnet',
      activeStatus: true,
    },
  ];

  private static readonly PAM_REQUESTS: PrivilegedAccessRequest[] = [
    {
      requestId: 'PAM-REQ-9902',
      targetIdentityId: 'USR-OPS-88',
      requesterName: 'فهد الحربي (Fahad Al-Harbi)',
      requestedRole: 'PORT_CUSTOMS_EMERGENCY_OVERRIDE',
      justificationReason: 'تجاوز طارئ لتحديث المستندات الجمركية لحاوية مواد طبية حساسة بميناء جدة',
      timeWindowMinutes: 60,
      status: 'APPROVED',
      approvedBy: 'aaljakni@aja.sa (CISO)',
      requestedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 35).toISOString(),
    },
  ];

  private static readonly SECRETS_VAULT: SecretVaultItem[] = [
    {
      secretId: 'SEC-VAULT-ZATCA-CERT',
      secretName: 'ZATCA Phase 2 Cryptographic Private Key & mTLS Cert',
      category: 'MTLS_CERTIFICATE',
      environment: 'PRODUCTION',
      lastRotatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      nextRotationDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 335).toISOString(),
      autoRotateEnabled: true,
      version: 'v4.1.0',
    },
    {
      secretId: 'SEC-VAULT-ADYEN-API',
      secretName: 'Adyen Enterprise Settlement API Secret Key',
      category: 'API_KEY',
      environment: 'PRODUCTION',
      lastRotatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      nextRotationDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 80).toISOString(),
      autoRotateEnabled: true,
      version: 'v8.0',
    },
    {
      secretId: 'SEC-VAULT-JWT-SIGNER',
      secretName: 'AJA Global Identity OAuth 2.1 RS256 Private Key',
      category: 'JWT_SIGNING_KEY',
      environment: 'PRODUCTION',
      lastRotatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      nextRotationDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
      autoRotateEnabled: true,
      version: 'v12.2',
    },
  ];

  public static getIdentities(): EnterpriseIdentity[] {
    return this.IDENTITIES;
  }

  public static getZeroTrustPolicies(): ZeroTrustPolicy[] {
    return this.ZERO_TRUST_POLICIES;
  }

  public static getPAMRequests(): PrivilegedAccessRequest[] {
    return this.PAM_REQUESTS;
  }

  public static getSecretsVault(): SecretVaultItem[] {
    return this.SECRETS_VAULT;
  }

  public static requestPrivilegedAccess(
    requesterName: string,
    requestedRole: string,
    justificationReason: string,
    timeWindowMinutes: number
  ): PrivilegedAccessRequest {
    const newReq: PrivilegedAccessRequest = {
      requestId: `PAM-REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      targetIdentityId: 'USR-OPS-88',
      requesterName,
      requestedRole,
      justificationReason,
      timeWindowMinutes,
      status: 'APPROVED',
      approvedBy: 'CISO-AutoPolicy-Engine',
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * timeWindowMinutes).toISOString(),
    };
    this.PAM_REQUESTS.unshift(newReq);
    return newReq;
  }
}
