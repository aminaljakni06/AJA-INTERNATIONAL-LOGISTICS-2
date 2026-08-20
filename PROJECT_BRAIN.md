# AJA LOGISTICS ERP ENTERPRISE PROJECT BRAIN

## REGISTERED ARCHITECTURAL MODULES

### PACK 001 — FOUNDATION PLATFORM
- **ALBP-001.001**: Enterprise Event Bus & Event-Driven Architecture (`src/services/eventBusService.ts`)
- **ALBP-001.002**: Enterprise Audit Platform (`src/services/auditService.ts`)
- **ALBP-001.003**: Enterprise Configuration Engine (`src/services/configService.ts`)
- **ALBP-001.004**: Enterprise Workflow Engine (`src/services/workflowEngine.ts`)
- **ALBP-001.005**: Enterprise Organization Engine (`src/services/organizationService.ts`)

---

### PACK 002 — ENTERPRISE IDENTITY & ACCESS PLATFORM
- **ALBP-002.001**: Unified Identity Engine & Access Control Platform (`src/lib/identity/identityEngine.ts`, `src/services/identityService.ts`)
- **ALBP-002.002**: Enterprise Authentication & Single Sign-On (SSO) Platform (`src/services/ssoService.ts`, `src/services/passkeyService.ts`, `src/services/adaptiveAuthService.ts`)
- **ALBP-002.003**: Enterprise Multi-Factor Authentication (MFA), Passwordless & Zero Trust Security Platform (`src/services/adaptiveAuthService.ts`, `src/services/passkeyService.ts`, `src/components/identity/*`)
- **ALBP-002.004**: Enterprise User Lifecycle & Identity Governance (IGA) Platform (`src/services/governanceService.ts`, `src/components/identity/governance/*`)

---

### PACK 003 — ENTERPRISE MASTER DATA MANAGEMENT (MDM)
- **ALBP-003.001**: Enterprise Master Data Foundation (`src/services/masterDataService.ts`, `src/db/repositories/masterDataRepository.ts`, `src/components/mdm/*`, `src/pages/admin/AdminMasterDataManagement.tsx`)

---

## ALBP-002.003 IMPLEMENTATION DETAILS

### 1. Zero Trust Security Engine & Policy Enforcement
- Architectural Principles: "Never Trust, Always Verify", continuous verification, context-aware access, and identity-first security.
- Comprehensive security event dispatching over `EventBusService` (`LoginSucceeded`, `LoginFailed`, `MFARequested`, `MFASucceeded`, `MFAFailed`, `DeviceRegistered`, `DeviceRevoked`, `RiskDetected`, `ConditionalAccessDenied`).

### 2. Multi-Factor Authentication (MFA) & Step-Up Security
- Authenticator Apps (TOTP), Email OTP, SMS OTP, Push Approval, Security Keys (FIDO2), Emergency Backup Codes, and Emergency Recovery.
- Step-Up Authentication triggers for elevated sensitivity actions and high risk scores.

### 3. Passwordless & Biometric Passkey Engine
- WebAuthn & FIDO2 hardware/platform authenticators (FaceID, TouchID, YubiKey, Windows Hello).
- Trusted device passwordless login with fallback recovery mechanisms.

### 4. Device Trust & Fingerprinting
- Continuous device registration, OS/Browser fingerprinting, compromise detection, and trust status revocation (`DeviceManagerView`).

### 5. Conditional Access Engine & Security Policies
- Dynamic rule evaluation across Country, IP Range, Branch, Company, Role, Business Hours, and Adaptive Risk Score thresholds.
- Configurable Password Policies, MFA Enforcements, and Session Timeout Controls.

### 6. Continuous Session Security & Adaptive Risk Scoring
- Continuous token/session validation, idle & absolute timeouts, session rotation, and remote device logout (`SessionManagerView`).
- Impossible travel detection hooks, unknown location shifts, and risk score generation.

---

## ALBP-002.002 IMPLEMENTATION DETAILS

### 1. SSO & Identity Federation Platform
- Supported Built-in Providers: Internal Auth, Google Workspace / OAuth 2.0, Microsoft Entra ID (Azure AD), Apple Sign-In, GitHub Enterprise, LinkedIn, Corporate SAML 2.0.
- Configuration-driven provider activation with admin controls.
- Single Sign-On, Account Linking, and Unlinking workflows with safeguards against unlinking sole credentials.

### 2. OAuth 2.1 & OpenID Connect (OIDC)
- Authorization Code Flow with PKCE (S256 challenge validation).
- OIDC Well-Known Discovery Provider (`/api/sso/oidc/.well-known/openid-configuration`).
- RFC 8693 Token Exchange endpoint support.

### 3. SAML 2.0 Integration Infrastructure
- Metadata generator (`/api/sso/saml/metadata`) and assertion validation structure.

### 4. Passkeys (WebAuthn / FIDO2)
- Hardware and platform biometric registration options (`navigator.credentials.create`).
- Passkey verification, storage, and credential revocation controls (`PasskeyManagerView`).

### 5. Adaptive & Risk-Based Authentication
- Continuous risk score evaluation (0-100) evaluating unknown devices, location anomalies, impossible travel, and branch policies.
- Adaptive step-up MFA or temporary access blocking when risk exceeds policy thresholds (`AdaptiveSecurityMonitorView`).

### 6. Repositories & Security Audit
- `ssoRepository.ts` providing Firestore persistence with memory fallbacks for providers, linked accounts, passkeys, and revoked tokens.
- Auditing for all identity provider updates, account links/unlinks, passkey registrations, and adaptive security events.
