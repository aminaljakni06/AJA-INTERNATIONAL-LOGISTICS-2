import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../types/user';
import { CorporateGovernanceService } from '../services/corporateGovernanceService';
import { CorporateLegalProfile, DirectorOfficerRecord, PSCRecord } from '../types/corporateGovernance';
import { listAuditLogs } from '../db/repositories/auditLogRepository';

describe('STEP GOV-05 — Enterprise Corporate Governance Core, Legal Profile, Directors, Officers & PSC Implementation Suite', () => {

  // Test Principals Setup
  const ceoPrincipal: User = {
    id: 'user_ceo_01',
    email: 'ceo@aja.com',
    fullName: 'Aja Chief Executive Officer',
    phone: '+44123456780',
    role: 'CEO',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    securityLevel: 5,
    approvalLimit: 1000000,
    statutoryAppointments: [
      {
        id: 'apt_ceo_01',
        legalEntityId: 'le-holding-101',
        status: 'ACTIVE',
        effectiveFrom: '2020-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const cfoPrincipal: User = {
    id: 'user_cfo_01',
    email: 'cfo@aja.com',
    fullName: 'Aja Group CFO',
    phone: '+44123456781',
    role: 'CFO',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    departmentId: 'dept_finance',
    securityLevel: 4,
    approvalLimit: 500000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const systemAdminUser: User = {
    id: 'user_sysadmin_01',
    email: 'sysadmin@aja.com',
    fullName: 'Technical System Administrator',
    phone: '+44123456789',
    role: 'SYSTEM_ADMIN',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    securityLevel: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const staffEmployeeUser: User = {
    id: 'user_staff_01',
    email: 'staff@aja.com',
    fullName: 'Operations Staff UK',
    phone: '+44123456783',
    role: 'STAFF',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    departmentId: 'dept_ops',
    securityLevel: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const foreignEntityUser: User = {
    id: 'user_saudi_mgr_01',
    email: 'saudi_mgr@aja.com',
    fullName: 'Saudi Branch Manager',
    phone: '+966112004000',
    role: 'BRANCH_MANAGER',
    companyId: 'company_aja_ksa',
    legalEntityId: 'le-saudi-branch-202', // Different Legal Entity
    securityLevel: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // ==================== 1. Corporate Legal Profile Tests ====================
  describe('1. Corporate Legal Profile & Organization Master Anchoring', () => {
    it('CEO/CFO is authorized to view and update corporate legal profile', async () => {
      const updatedProfile = await CorporateGovernanceService.updateLegalProfile(
        {
          legalEntityId: 'le-holding-101',
          legalCompanyName: 'AJA International Logistics Ltd',
          companyNumber: '12345678',
          incorporationJurisdiction: 'GB',
          companyType: 'Private Limited Company',
          incorporationDate: '2020-01-01T00:00:00Z',
          taxRegistrations: {
            corporationTaxUtr: '1234567890',
            vatNumber: 'GB998877665',
            taxResidenceJurisdiction: 'GB'
          }
        },
        { principal: ceoPrincipal }
      );

      assert.ok(updatedProfile);
      assert.equal(updatedProfile.legalCompanyName, 'AJA International Logistics Ltd');
      assert.equal(updatedProfile.companyNumber, '12345678');
      assert.equal(updatedProfile.incorporationJurisdiction, 'GB');
    });

    it('Cross-Entity Scope Isolation: User from Entity B cannot update Profile of Entity A', async () => {
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.updateLegalProfile(
            {
              legalEntityId: 'le-holding-101',
              legalCompanyName: 'Malicious Overwrite Attempt'
            },
            { principal: foreignEntityUser }
          );
        },
        /Access Denied/
      );
    });

    it('Field-Level Masking: Non-executive staff receives masked tax identifiers (UTR)', async () => {
      // Direct grant of view permission to staff for testing masking
      const staffWithView: User = {
        ...staffEmployeeUser,
        customPermissions: ['governance:profile:view']
      };

      const profile = await CorporateGovernanceService.getLegalProfile('le-holding-101', {
        principal: staffWithView
      });

      assert.ok(profile);
      assert.equal(profile?.taxRegistrations?.corporationTaxUtr, '*** MASKED BY GOVERNANCE POLICY ***');
    });

    it('Executive (CEO) receives unmasked tax registration data', async () => {
      const profile = await CorporateGovernanceService.getLegalProfile('le-holding-101', {
        principal: ceoPrincipal
      });

      assert.ok(profile);
      assert.equal(profile?.taxRegistrations?.corporationTaxUtr, '1234567890');
    });
  });

  // ==================== 2. Directors & Officers Registry Tests ====================
  describe('2. Directors & Officers Registry & Statutory Corporate Appointments', () => {
    let createdAppointmentId: string;

    it('Technical SYSTEM_ADMIN without statutory authority is strictly DENIED appointing directors', async () => {
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.createAppointment(
            {
              legalEntityId: 'le-holding-101',
              personReference: {
                fullNameEn: 'Unauthorized Director',
                nationality: 'British',
                countryOfResidence: 'United Kingdom'
              },
              statutoryRole: 'DIRECTOR',
              titleEn: 'Statutory Director',
              authorityScope: 'LEGAL_ENTITY',
              appointmentDate: '2026-08-15T00:00:00Z',
              effectiveFrom: '2026-08-15T00:00:00Z',
              status: 'DRAFT',
              supportingDecisionId: 'dec_res_001',
              supportingDocumentIds: ['doc_consent_001']
            },
            { principal: systemAdminUser }
          );
        },
        /Access Denied/
      );
    });

    it('Statutory Corporate Appointment requires a mandatory Supporting Board Resolution', async () => {
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.createAppointment(
            {
              legalEntityId: 'le-holding-101',
              personReference: {
                fullNameEn: 'Sir John Smith',
                nationality: 'British',
                countryOfResidence: 'United Kingdom'
              },
              statutoryRole: 'DIRECTOR',
              titleEn: 'Executive Director',
              authorityScope: 'LEGAL_ENTITY',
              appointmentDate: '2026-08-15T00:00:00Z',
              effectiveFrom: '2026-08-15T00:00:00Z',
              status: 'PENDING_APPROVAL',
              supportingDecisionId: '', // EMPTY RESOLUTION REFERENCE
              supportingDocumentIds: []
            },
            { principal: ceoPrincipal }
          );
        },
        /Board Resolution \/ Corporate Decision reference/
      );
    });

    it('CEO creates a valid Director Corporate Appointment in PENDING_APPROVAL state', async () => {
      const appointment = await CorporateGovernanceService.createAppointment(
        {
          legalEntityId: 'le-holding-101',
          personReference: {
            fullNameEn: 'Dr. Arthur Pendelton',
            fullNameAr: 'د. آرثر بندلتون',
            nationality: 'British',
            countryOfResidence: 'United Kingdom',
            dateOfBirthMonthYear: '04/1975',
            occupation: 'Managing Director'
          },
          statutoryRole: 'DIRECTOR',
          titleEn: 'Managing Director & Board Member',
          authorityScope: 'LEGAL_ENTITY',
          appointmentDate: '2026-08-15T00:00:00Z',
          effectiveFrom: '2026-08-15T00:00:00Z',
          status: 'PENDING_APPROVAL',
          supportingDecisionId: 'dec_board_2026_01',
          supportingDocumentIds: ['doc_consent_ap01']
        },
        { principal: ceoPrincipal }
      );

      assert.ok(appointment);
      assert.ok(appointment.id.startsWith('apt_'));
      assert.equal(appointment.status, 'PENDING_APPROVAL');
      assert.equal(appointment.personReference.fullNameEn, 'Dr. Arthur Pendelton');
      createdAppointmentId = appointment.id;
    });

    it('Separation of Duties (SoD): The creator of an appointment cannot approve/activate their own draft', async () => {
      // CEO created it, CEO attempts to activate it
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.transitionAppointmentStatus(
            createdAppointmentId,
            'ACTIVE',
            'CEO Self-Activation',
            { principal: ceoPrincipal }
          );
        },
        /Separation of Duties \(SoD\) Violation/
      );
    });

    it('Independent Officer (CFO with appointment:create permission) activates the appointment', async () => {
      const cfoWithAppointAuth: User = {
        ...cfoPrincipal,
        customPermissions: ['governance:appointment:create']
      };

      const activated = await CorporateGovernanceService.transitionAppointmentStatus(
        createdAppointmentId,
        'ACTIVE',
        'Approved by Independent Board Member',
        { principal: cfoWithAppointAuth },
        'dec_board_resolution_approval_01'
      );

      assert.equal(activated.status, 'ACTIVE');
    });

    it('Illegal State Machine Transitions are rejected (e.g. ACTIVE directly to DRAFT)', async () => {
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.transitionAppointmentStatus(
            createdAppointmentId,
            'DRAFT',
            'Illegal revert attempt',
            { principal: ceoPrincipal }
          );
        },
        /Illegal State Transition/
      );
    });

    it('Resigned appointment preserves historical record and cannot be hard-deleted', async () => {
      const resigned = await CorporateGovernanceService.transitionAppointmentStatus(
        createdAppointmentId,
        'RESIGNED',
        'Statutory term conclusion',
        { principal: ceoPrincipal }
      );

      assert.equal(resigned.status, 'RESIGNED');
      assert.ok(resigned.resignationDate);

      // Attempt prohibited hard deletion
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.deleteRecord('APPOINTMENT', createdAppointmentId, {
            principal: ceoPrincipal
          });
        },
        /Hard deletion of corporate governance APPOINTMENT records/
      );
    });
  });

  // ==================== 3. PSC / Beneficial Control Registry Tests ====================
  describe('3. PSC / Beneficial Control Registry & Privacy Controls', () => {
    let createdPscId: string;

    it('CEO/Authorized Officer records PSC with valid UK control bands', async () => {
      const psc = await CorporateGovernanceService.savePSCRecord(
        {
          legalEntityId: 'le-holding-101',
          jurisdiction: 'GB',
          subjectType: 'INDIVIDUAL',
          subjectReference: {
            nameEn: 'Ahmad Al-Jaloud',
            nameAr: 'أحمد الجلود',
            nationalityOrLegalForm: 'British',
            governingLawOrResidence: 'United Kingdom',
            registrationNumber: 'PASSPORT_GB_998811'
          },
          natureOfControlCodes: [
            'OWNERSHIP_OF_SHARES_75_TO_100',
            'VOTING_RIGHTS_75_TO_100',
            'RIGHT_TO_APPOINT_REMOVE_DIRECTORS'
          ],
          ownershipPercentageMin: 75,
          ownershipPercentageMax: 100,
          votingPercentageMin: 75,
          votingPercentageMax: 100,
          hasSignificantInfluence: true,
          notifiedDate: '2026-01-01T00:00:00Z',
          effectiveFrom: '2026-01-01T00:00:00Z',
          status: 'ACTIVE',
          filingReference: 'PSC01_2026_001',
          supportingDocumentIds: ['doc_psc_declaration']
        },
        { principal: ceoPrincipal }
      );

      assert.ok(psc);
      assert.ok(psc.id.startsWith('psc_'));
      assert.equal(psc.ownershipPercentageMin, 75);
      assert.equal(psc.hasSignificantInfluence, true);
      createdPscId = psc.id;
    });

    it('Invalid PSC percentage range (< 0 or > 100) is rejected by validation', async () => {
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.savePSCRecord(
            {
              legalEntityId: 'le-holding-101',
              jurisdiction: 'GB',
              subjectType: 'INDIVIDUAL',
              subjectReference: {
                nameEn: 'Invalid Person',
                nationalityOrLegalForm: 'British',
                governingLawOrResidence: 'UK'
              },
              natureOfControlCodes: ['OWNERSHIP_OF_SHARES_25_TO_50'],
              ownershipPercentageMin: 120, // ILLEGAL PERCENTAGE
              ownershipPercentageMax: 150,
              votingPercentageMin: 10,
              votingPercentageMax: 20,
              hasSignificantInfluence: false,
              notifiedDate: '2026-01-01T00:00:00Z',
              effectiveFrom: '2026-01-01T00:00:00Z',
              status: 'ACTIVE',
              supportingDocumentIds: []
            },
            { principal: ceoPrincipal }
          );
        },
        /Invalid ownership percentage range/
      );
    });

    it('PSC Field-Level Privacy: Non-executive viewers receive masked registration references', async () => {
      const staffWithPscView: User = {
        ...staffEmployeeUser,
        customPermissions: ['governance:psc:view']
      };

      const pscList = await CorporateGovernanceService.listPSCRecords('le-holding-101', undefined, {
        principal: staffWithPscView
      });

      assert.ok(pscList.length > 0);
      assert.equal(pscList[0].subjectReference.registrationNumber, '*** MASKED ***');
      assert.equal(pscList[0].subjectReference.governingLawOrResidence, 'CONFIDENTIAL');
    });

    it('Executive Director views full unmasked PSC registration details', async () => {
      const pscList = await CorporateGovernanceService.listPSCRecords('le-holding-101', undefined, {
        principal: ceoPrincipal
      });

      assert.ok(pscList.length > 0);
      assert.equal(pscList[0].subjectReference.registrationNumber, 'PASSPORT_GB_998811');
    });

    it('Hard deletion of PSC records is strictly prohibited to preserve historical filings', async () => {
      await assert.rejects(
        async () => {
          await CorporateGovernanceService.deleteRecord('PSC', createdPscId, {
            principal: ceoPrincipal
          });
        },
        /Hard deletion of corporate governance PSC records/
      );
    });
  });

  // ==================== 4. Audit Engine & Correlation Validation ====================
  describe('4. Audit Engine Integration & Immutable Event Generation', () => {
    it('All corporate governance mutations generate correlated audit records', async () => {
      const auditLogs = await listAuditLogs(20);
      const govLogs = auditLogs.filter((log) => 
        log.entityType === 'CORPORATE_LEGAL_PROFILE' || 
        log.entityType === 'CORPORATE_APPOINTMENT' || 
        log.entityType === 'PSC_CONTROL_RECORD'
      );

      assert.ok(govLogs.length >= 3, `Expected at least 3 governance audit events, found ${govLogs.length}`);
      assert.ok(govLogs.some((l) => l.action.includes('APPOINTMENT')));
      assert.ok(govLogs.some((l) => l.action.includes('PSC')));
    });
  });
});
