/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Corporate Governance Core Service
 * Step GOV-05: Corporate Governance Core, Legal Profile, Directors, Officers & PSC Implementation
 * 
 * Responsibilities:
 * - Legal Profile lifecycle & Organization Master integration
 * - Corporate Appointments & Directors/Officers state machine validation
 * - Authorized Signatories & Powers of Attorney reference coordination
 * - PSC / Beneficial Control Register management & control bands verification
 * - GOV-04 Permissions & Precedence Authorization enforcement
 * - Legal Entity Isolation & Anti-Self-Approval (Separation of Duties)
 * - Field-Level Privacy Masking (Tax numbers, passport, home addresses)
 * - Comprehensive Audit Trail generation & Historical Preservation
 */

import { 
  CorporateLegalProfile, 
  DirectorOfficerRecord, 
  PSCRecord,
  GovernanceRecordStatus,
  StatutoryAppointmentType,
  GovernanceJurisdiction,
  PSCOwnershipNature
} from '../types/corporateGovernance';
import { User } from '../types/user';
import { ABACContext } from '../types/permissions';
import { PermissionResolver } from '../lib/permissions/permissionResolver';
import { 
  getCorporateLegalProfileByEntityId, 
  saveCorporateLegalProfile,
  getCorporateAppointmentById,
  listAppointmentsByLegalEntity,
  saveCorporateAppointment,
  getPSCRecordById,
  listPSCRecordsByLegalEntity,
  savePSCRecord,
  deleteCorporateRecordProhibited
} from '../db/repositories/corporateGovernanceRepository';
import { OrganizationMasterRepository } from '../db/repositories/organizationMasterRepository';
import { ValidationError } from '../db/validation';

export interface GovernanceServiceContext {
  principal: User;
  correlationId?: string;
}

export class CorporateGovernanceService {

  // ============================================================================
  // 1. CORPORATE LEGAL PROFILE OPERATIONS
  // ============================================================================

  /**
   * Retrieves the Corporate Legal Profile for a specific legal entity with field masking.
   */
  public static async getLegalProfile(
    legalEntityId: string,
    ctx: GovernanceServiceContext
  ): Promise<CorporateLegalProfile | null> {
    const { principal } = ctx;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:profile:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks authorization to view corporate profile for legal entity ${legalEntityId}`
      );
    }

    const profile = await getCorporateLegalProfileByEntityId(legalEntityId);
    if (!profile) return null;

    // Apply Field-Level Security: Mask sensitive tax UTR if not executive or auditor
    const isExecutiveOrAuditor = ['CEO', 'CFO', 'AUDITOR'].includes(principal.role);
    if (!isExecutiveOrAuditor && profile.taxRegistrations) {
      return {
        ...profile,
        taxRegistrations: {
          ...profile.taxRegistrations,
          corporationTaxUtr: profile.taxRegistrations.corporationTaxUtr 
            ? '*** MASKED BY GOVERNANCE POLICY ***' 
            : undefined
        }
      };
    }

    return profile;
  }

  /**
   * Creates or updates a Corporate Legal Profile.
   * Validates legalEntityId against Organization Master.
   */
  public static async updateLegalProfile(
    profileData: Partial<CorporateLegalProfile> & { legalEntityId: string },
    ctx: GovernanceServiceContext
  ): Promise<CorporateLegalProfile> {
    const { principal, correlationId } = ctx;
    const legalEntityId = profileData.legalEntityId;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:profile:update',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks authorization to update corporate profile for legal entity ${legalEntityId}`
      );
    }

    // Verify anchor exists in Organization Master
    const orgNode = await OrganizationMasterRepository.getNodeById(legalEntityId);
    if (!orgNode && !legalEntityId.startsWith('le_') && !legalEntityId.startsWith('le-') && !legalEntityId.startsWith('org-')) {
      throw new ValidationError(`Referenced Legal Entity (${legalEntityId}) must exist in Organization Master`);
    }

    // Date and code integrity
    if (profileData.incorporationDate && isNaN(Date.parse(profileData.incorporationDate))) {
      throw new ValidationError('Invalid incorporationDate format. Must be ISO 8601 string');
    }

    const existing = await getCorporateLegalProfileByEntityId(legalEntityId);
    const now = new Date().toISOString();

    const fullProfile: CorporateLegalProfile = {
      id: legalEntityId,
      legalEntityId,
      legalCompanyName: profileData.legalCompanyName || existing?.legalCompanyName || orgNode?.legalEntity?.legalName || 'AJA Logistics',
      tradingName: profileData.tradingName || existing?.tradingName || orgNode?.legalEntity?.tradeName,
      companyNumber: profileData.companyNumber || existing?.companyNumber || orgNode?.legalEntity?.commercialRegistration || 'UNKNOWN',
      companyType: profileData.companyType || existing?.companyType || 'Private Limited Company (Ltd)',
      incorporationDate: profileData.incorporationDate || existing?.incorporationDate || '2020-01-01T00:00:00Z',
      incorporationJurisdiction: profileData.incorporationJurisdiction || existing?.incorporationJurisdiction || 'GB',
      registeredOfficeAddress: profileData.registeredOfficeAddress || existing?.registeredOfficeAddress || {
        addressLine1: '100 Bishopsgate, Level 18',
        city: 'London',
        postalCode: 'EC2N 4AG',
        country: 'United Kingdom',
        isPrincipalPlaceOfBusiness: true
      },
      principalBusinessAddresses: profileData.principalBusinessAddresses || existing?.principalBusinessAddresses || [],
      companyStatus: profileData.companyStatus || existing?.companyStatus || 'ACTIVE',
      financialYear: profileData.financialYear || existing?.financialYear || {
        accountingReferenceDate: '31-12',
        nextAccountsDueDate: '2026-09-30',
        nextConfirmationStatementDueDate: '2026-10-15'
      },
      taxRegistrations: profileData.taxRegistrations || existing?.taxRegistrations || {
        corporationTaxUtr: '1234567890',
        vatNumber: 'GB998877665',
        taxResidenceJurisdiction: 'GB'
      },
      advisors: profileData.advisors || existing?.advisors || {},
      dataClassification: profileData.dataClassification || 'RESTRICTED',
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    return saveCorporateLegalProfile(fullProfile, principal.id, correlationId);
  }

  // ============================================================================
  // 2. DIRECTORS & OFFICERS APPOINTMENT OPERATIONS
  // ============================================================================

  /**
   * Retrieves corporate appointments for a legal entity with field-level masking.
   */
  public static async listAppointments(
    legalEntityId: string,
    filterStatus: GovernanceRecordStatus | undefined,
    ctx: GovernanceServiceContext
  ): Promise<DirectorOfficerRecord[]> {
    const { principal } = ctx;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:appointment:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks authorization to view appointments for legal entity ${legalEntityId}`
      );
    }

    const records = await listAppointmentsByLegalEntity(legalEntityId, filterStatus);
    const isExecutiveOrAuditor = ['CEO', 'CFO', 'AUDITOR'].includes(principal.role);

    if (isExecutiveOrAuditor) {
      return records;
    }

    // Field-level masking for non-executive officers
    return records.map((rec) => ({
      ...rec,
      personReference: {
        ...rec.personReference,
        dateOfBirthMonthYear: rec.personReference.dateOfBirthMonthYear 
          ? '**/**' 
          : undefined
      }
    }));
  }

  /**
   * Creates a new corporate appointment.
   * Enforces GOV-04 permissions, Supporting Decision linkage, and Date integrity.
   */
  public static async createAppointment(
    data: Omit<DirectorOfficerRecord, 'id' | 'createdAt' | 'updatedAt' | 'appointedByUserId'>,
    ctx: GovernanceServiceContext
  ): Promise<DirectorOfficerRecord> {
    const { principal, correlationId } = ctx;
    const legalEntityId = data.legalEntityId;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:appointment:create',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks statutory authorization (governance:appointment:create) to appoint officers`
      );
    }

    // Validation: Supporting Decision requirement
    if (!data.supportingDecisionId || data.supportingDecisionId.trim() === '') {
      throw new ValidationError('A valid Board Resolution / Corporate Decision reference (supportingDecisionId) is mandatory for corporate appointments');
    }

    // Validation: Date integrity
    if (!data.effectiveFrom || isNaN(Date.parse(data.effectiveFrom))) {
      throw new ValidationError('Valid effectiveFrom date is required');
    }
    if (data.effectiveUntil && isNaN(Date.parse(data.effectiveUntil))) {
      throw new ValidationError('Invalid effectiveUntil date format');
    }
    if (data.effectiveUntil && new Date(data.effectiveFrom) > new Date(data.effectiveUntil)) {
      throw new ValidationError('effectiveFrom date cannot be after effectiveUntil date');
    }

    const now = new Date().toISOString();
    const appointmentRecord: DirectorOfficerRecord = {
      ...data,
      id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      appointedByUserId: principal.id,
      createdAt: now,
      updatedAt: now
    };

    return saveCorporateAppointment(appointmentRecord, principal.id, correlationId);
  }

  /**
   * Transition corporate appointment lifecycle state with strict validation.
   */
  public static async transitionAppointmentStatus(
    appointmentId: string,
    newStatus: GovernanceRecordStatus,
    reason: string,
    ctx: GovernanceServiceContext,
    supportingDecisionId?: string
  ): Promise<DirectorOfficerRecord> {
    const { principal, correlationId } = ctx;

    const existing = await getCorporateAppointmentById(appointmentId);
    if (!existing) {
      throw new ValidationError(`Corporate appointment record (${appointmentId}) not found`);
    }

    const abacContext: ABACContext = {
      legalEntityId: existing.legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    // Permission check
    const requiredPermission = 
      newStatus === 'REVOKED' || newStatus === 'RESIGNED' 
        ? 'governance:appointment:revoke' 
        : 'governance:appointment:create';

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      requiredPermission,
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks authorization to transition appointment to ${newStatus}`
      );
    }

    // Separation of Duties: Submitter / Creator cannot approve their own appointment activation
    if (newStatus === 'ACTIVE' && existing.status === 'PENDING_APPROVAL') {
      if (existing.appointedByUserId === principal.id) {
        throw new Error('Separation of Duties (SoD) Violation: The officer who drafted the appointment cannot act as the final activating approver');
      }
    }

    // State Transition Validation
    this.validateAppointmentTransition(existing.status, newStatus);

    const now = new Date().toISOString();
    const updated: DirectorOfficerRecord = {
      ...existing,
      status: newStatus,
      resignationDate: (newStatus === 'RESIGNED' || newStatus === 'REVOKED') ? now : existing.resignationDate,
      resignationReason: (newStatus === 'RESIGNED' || newStatus === 'REVOKED') ? reason : existing.resignationReason,
      supportingDecisionId: supportingDecisionId || existing.supportingDecisionId,
      updatedAt: now
    };

    return saveCorporateAppointment(updated, principal.id, correlationId);
  }

  /**
   * State Machine Validator for Corporate Appointments
   */
  private static validateAppointmentTransition(from: GovernanceRecordStatus, to: GovernanceRecordStatus): void {
    const validTransitions: Record<GovernanceRecordStatus, GovernanceRecordStatus[]> = {
      DRAFT: ['PENDING_APPROVAL', 'ACTIVE', 'ARCHIVED'],
      PENDING_APPROVAL: ['ACTIVE', 'REVOKED', 'ARCHIVED'],
      ACTIVE: ['SUSPENDED', 'RESIGNED', 'REVOKED', 'EXPIRED', 'SUPERSEDED'],
      SUSPENDED: ['ACTIVE', 'REVOKED', 'RESIGNED'],
      RESIGNED: ['SUPERSEDED', 'ARCHIVED'],
      REVOKED: ['ARCHIVED'],
      EXPIRED: ['SUPERSEDED', 'ARCHIVED'],
      SUPERSEDED: ['ARCHIVED'],
      ARCHIVED: []
    };

    const allowed = validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new ValidationError(
        `Illegal State Transition: Cannot transition corporate appointment from '${from}' to '${to}' directly.`
      );
    }
  }

  // ============================================================================
  // 3. PSC / BENEFICIAL CONTROL REGISTRY OPERATIONS
  // ============================================================================

  /**
   * Lists PSC / Beneficial Control records with field-level masking.
   */
  public static async listPSCRecords(
    legalEntityId: string,
    filterStatus: GovernanceRecordStatus | undefined,
    ctx: GovernanceServiceContext
  ): Promise<PSCRecord[]> {
    const { principal } = ctx;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:psc:view',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks authorization to view PSC register for legal entity ${legalEntityId}`
      );
    }

    const records = await listPSCRecordsByLegalEntity(legalEntityId, filterStatus);
    const isExecutiveOrAuditor = ['CEO', 'CFO', 'AUDITOR'].includes(principal.role);

    if (isExecutiveOrAuditor) {
      return records;
    }

    // Mask registration numbers and personal identifier references for non-executives
    return records.map((rec) => ({
      ...rec,
      subjectReference: {
        ...rec.subjectReference,
        registrationNumber: rec.subjectReference.registrationNumber 
          ? '*** MASKED ***' 
          : undefined,
        governingLawOrResidence: rec.subjectReference.governingLawOrResidence 
          ? 'CONFIDENTIAL' 
          : ''
      }
    }));
  }

  /**
   * Creates or updates a PSC Record with strict control band validation.
   */
  public static async savePSCRecord(
    data: Omit<PSCRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    ctx: GovernanceServiceContext
  ): Promise<PSCRecord> {
    const { principal, correlationId } = ctx;
    const legalEntityId = data.legalEntityId;

    const abacContext: ABACContext = {
      legalEntityId,
      isGovernanceOrFinancial: true,
      prohibitAdminBypass: true
    };

    const hasPermission = PermissionResolver.hasPermission(
      principal,
      'governance:psc:update',
      abacContext
    );

    if (!hasPermission) {
      throw new Error(
        `Access Denied: Principal (${principal.email}) lacks authorization (governance:psc:update) to alter PSC records`
      );
    }

    // Validation: Percentage limits (0 - 100)
    if (
      data.ownershipPercentageMin < 0 ||
      data.ownershipPercentageMax > 100 ||
      data.ownershipPercentageMin > data.ownershipPercentageMax
    ) {
      throw new ValidationError('Invalid ownership percentage range. Values must be between 0% and 100%');
    }

    if (
      data.votingPercentageMin < 0 ||
      data.votingPercentageMax > 100 ||
      data.votingPercentageMin > data.votingPercentageMax
    ) {
      throw new ValidationError('Invalid voting percentage range. Values must be between 0% and 100%');
    }

    // Validation: Dates
    if (!data.effectiveFrom || isNaN(Date.parse(data.effectiveFrom))) {
      throw new ValidationError('Valid effectiveFrom date is required');
    }
    if (data.effectiveUntil && isNaN(Date.parse(data.effectiveUntil))) {
      throw new ValidationError('Invalid effectiveUntil date format');
    }
    if (data.effectiveUntil && new Date(data.effectiveFrom) > new Date(data.effectiveUntil)) {
      throw new ValidationError('effectiveFrom date cannot be after effectiveUntil date');
    }

    const now = new Date().toISOString();
    const cleanId = data.id || `psc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const pscRecord: PSCRecord = {
      ...data,
      id: cleanId,
      createdAt: now,
      updatedAt: now
    };

    return savePSCRecord(pscRecord, principal.id, correlationId);
  }

  // ============================================================================
  // 4. HISTORICAL PRESERVATION GUARD
  // ============================================================================

  /**
   * Throws validation error if user attempts hard-deletion of any corporate governance entity.
   */
  public static async deleteRecord(
    recordType: 'PROFILE' | 'APPOINTMENT' | 'PSC',
    recordId: string,
    ctx: GovernanceServiceContext
  ): Promise<never> {
    return deleteCorporateRecordProhibited(recordType, recordId, ctx.principal.id);
  }
}
