import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../types/user';
import { CorporateGovernanceService } from '../services/corporateGovernanceService';
import { CorporateDecisionService } from '../services/corporateDecisionService';
import { CorporateDecisionExecutionService } from '../services/corporateDecisionExecutionService';
import { 
  CorporateDecision, 
  BoardMeeting, 
  CorporateResolution, 
  DecisionExecutionRecord 
} from '../types/corporateGovernance';
import { listAuditLogs } from '../db/repositories/auditLogRepository';

describe('STEP GOV-06 — Corporate Decision Register, Board Resolutions, Meetings, Voting & Controlled Execution Engine Suite', () => {

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
        id: 'apt_ceo_101',
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
    statutoryAppointments: [
      {
        id: 'apt_cfo_101',
        legalEntityId: 'le-holding-101',
        status: 'ACTIVE',
        effectiveFrom: '2020-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const cooPrincipal: User = {
    id: 'user_coo_01',
    email: 'coo@aja.com',
    fullName: 'Aja Group COO',
    phone: '+44123456782',
    role: 'COO',
    companyId: 'company_aja_uk',
    legalEntityId: 'le-holding-101',
    departmentId: 'dept_ops',
    securityLevel: 4,
    statutoryAppointments: [
      {
        id: 'apt_coo_101',
        legalEntityId: 'le-holding-101',
        status: 'ACTIVE',
        effectiveFrom: '2020-01-01T00:00:00Z',
        effectiveUntil: '2030-01-01T00:00:00Z'
      }
    ],
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

  const legalEntityId = 'le-holding-101';
  let createdDecisionId = '';
  let createdMeetingId = '';
  let createdResolutionId = '';
  let createdExecutionId = '';
  let aptCeoId = '';
  let aptCfoId = '';
  let aptCooId = '';

  // Setup prerequisites: Register active director appointments for legal entity
  it('0. Pre-requisite Setup: Establish Active Statutory Director Appointments', async () => {
    // 1. CEO Director Appointment
    const aptCeo = await CorporateGovernanceService.createAppointment(
      {
        legalEntityId,
        personReference: {
          userId: ceoPrincipal.id,
          fullNameEn: 'Aja CEO Director',
          nationality: 'British',
          countryOfResidence: 'United Kingdom'
        },
        statutoryRole: 'MANAGING_DIRECTOR',
        titleEn: 'Managing Director & CEO',
        authorityScope: 'LEGAL_ENTITY',
        appointmentDate: '2020-01-01T00:00:00Z',
        effectiveFrom: '2020-01-01T00:00:00Z',
        status: 'ACTIVE',
        supportingDecisionId: 'dec_initial_01',
        supportingDocumentIds: []
      },
      { principal: ceoPrincipal }
    );
    aptCeoId = aptCeo.id;

    // 2. CFO Director Appointment
    const aptCfo = await CorporateGovernanceService.createAppointment(
      {
        legalEntityId,
        personReference: {
          userId: cfoPrincipal.id,
          fullNameEn: 'Aja CFO Director',
          nationality: 'British',
          countryOfResidence: 'United Kingdom'
        },
        statutoryRole: 'FINANCE_DIRECTOR',
        titleEn: 'Finance Director & CFO',
        authorityScope: 'LEGAL_ENTITY',
        appointmentDate: '2020-01-01T00:00:00Z',
        effectiveFrom: '2020-01-01T00:00:00Z',
        status: 'ACTIVE',
        supportingDecisionId: 'dec_initial_02',
        supportingDocumentIds: []
      },
      { principal: ceoPrincipal }
    );
    aptCfoId = aptCfo.id;

    // 3. COO Director Appointment
    const aptCoo = await CorporateGovernanceService.createAppointment(
      {
        legalEntityId,
        personReference: {
          userId: cooPrincipal.id,
          fullNameEn: 'Aja COO Director',
          nationality: 'British',
          countryOfResidence: 'United Kingdom'
        },
        statutoryRole: 'DIRECTOR',
        titleEn: 'Executive Director & COO',
        authorityScope: 'LEGAL_ENTITY',
        appointmentDate: '2020-01-01T00:00:00Z',
        effectiveFrom: '2020-01-01T00:00:00Z',
        status: 'ACTIVE',
        supportingDecisionId: 'dec_initial_03',
        supportingDocumentIds: []
      },
      { principal: ceoPrincipal }
    );
    aptCooId = aptCoo.id;

    const appointments = await CorporateGovernanceService.listAppointments(legalEntityId, 'ACTIVE', { principal: ceoPrincipal });
    assert.equal(appointments.length >= 3, true);
  });

  // ==================== 1. Decision Creation & State Machine ====================
  describe('1. Corporate Decision Register & Lifecycle Transitions', () => {
    it('CEO drafts a new Corporate Decision with deterministic DEC-YYYY-#### numbering', async () => {
      const decision = await CorporateDecisionService.createDecision(
        {
          legalEntityId,
          decisionType: 'BANK_ACCOUNT_OPENING',
          title: 'Opening HSBC Corporate Treasury Account in London',
          description: 'Board approval for establishing a new operational sterling treasury account with HSBC UK.',
          jurisdictionContext: 'GB',
          relatedDepartmentId: 'dept_finance',
          decisionDate: new Date().toISOString(),
          meetingModality: 'HYBRID',
          eventTimeZone: 'Europe/London',
          decisionLocationContext: {
            country: 'GB',
            city: 'London',
            timeZone: 'Europe/London',
            meetingModality: 'HYBRID'
          },
          effectiveDate: '2026-03-01T00:00:00Z',
          riskLevel: 'HIGH',
          resolutionText: 'IT IS HEREBY RESOLVED that the Company open a new Corporate Treasury Account with HSBC UK Bank plc.',
          supportingDocumentIds: ['doc_hsbc_mandate_01']
        },
        { principal: ceoPrincipal }
      );

      assert.ok(decision.id);
      assert.ok(decision.decisionNumber.startsWith('DEC-'));
      assert.equal(decision.lifecycleStatus, 'DRAFT');
      assert.equal(decision.executionStatus, 'NOT_APPLICABLE');
      assert.equal(decision.legalEntityId, legalEntityId);

      createdDecisionId = decision.id;
    });

    it('Staff member lacks permission to create corporate decisions', async () => {
      await assert.rejects(
        async () => {
          await CorporateDecisionService.createDecision(
            {
              legalEntityId,
              decisionType: 'OFFICER_APPOINTMENT',
              title: 'Unauthorized decision',
              description: 'Staff attempt',
              jurisdictionContext: 'GB',
              decisionDate: new Date().toISOString(),
              meetingModality: 'FULLY_REMOTE',
              eventTimeZone: 'Europe/London',
              decisionLocationContext: {
                country: 'GB',
                timeZone: 'Europe/London',
                meetingModality: 'FULLY_REMOTE'
              },
              effectiveDate: '2026-03-01T00:00:00Z',
              riskLevel: 'LOW',
              resolutionText: 'Unauthorized resolution'
            },
            { principal: staffEmployeeUser }
          );
        },
        /Access Denied/
      );
    });

    it('Cross-entity manager cannot view decisions belonging to another entity', async () => {
      await assert.rejects(
        async () => {
          await CorporateDecisionService.getDecision(createdDecisionId, { principal: foreignEntityUser });
        },
        /Access Denied/
      );
    });

    it('Transitions decision from DRAFT -> REVIEW -> APPROVAL properly', async () => {
      // 1. Submit for Review
      const inReview = await CorporateDecisionService.submitForReview(createdDecisionId, { principal: ceoPrincipal });
      assert.equal(inReview.lifecycleStatus, 'REVIEW');

      // 2. Complete Review (Approved for Voting)
      const inApproval = await CorporateDecisionService.completeReview(
        createdDecisionId,
        true,
        'Legal and statutory compliance review completed with zero findings.',
        { principal: cfoPrincipal }
      );
      assert.equal(inApproval.lifecycleStatus, 'APPROVAL');
      assert.equal(inApproval.reviewedByUserId, cfoPrincipal.id);
    });

    it('Prohibits invalid state jump (e.g. DRAFT cannot jump directly to RESOLUTION without review and approval)', async () => {
      const draft = await CorporateDecisionService.createDecision(
        {
          legalEntityId,
          decisionType: 'FINANCIAL_POLICY_APPROVAL',
          title: 'Direct jump test',
          description: 'Test invalid transition',
          jurisdictionContext: 'GB',
          decisionDate: new Date().toISOString(),
          meetingModality: 'FULLY_REMOTE',
          eventTimeZone: 'Europe/London',
          decisionLocationContext: {
            country: 'GB',
            timeZone: 'Europe/London',
            meetingModality: 'FULLY_REMOTE'
          },
          effectiveDate: '2026-03-01T00:00:00Z',
          riskLevel: 'LOW',
          resolutionText: 'Invalid resolution'
        },
        { principal: ceoPrincipal }
      );

      await assert.rejects(
        async () => {
          await CorporateDecisionService.adoptResolution(draft.id, 'BOARD_RESOLUTION', { principal: ceoPrincipal });
        },
        /Cannot adopt resolution in 'DRAFT' state/
      );
    });
  });

  // ==================== 2. Board Meetings & Participants ====================
  describe('2. Board Meetings Management & Participant Registry', () => {
    it('Schedules a Board of Directors Meeting with MTG-YYYY-#### sequence', async () => {
      const meeting = await CorporateDecisionService.createBoardMeeting(
        {
          legalEntityId,
          title: 'Q1 2026 Board of Directors Statutory Meeting',
          meetingType: 'BOARD_OF_DIRECTORS',
          scheduledAtUtc: '2026-03-15T10:00:00Z',
          eventLocalTime: '2026-03-15 10:00',
          timeZone: 'Europe/London',
          meetingModality: 'HYBRID',
          physicalLocation: 'AJA Logistics Headquarters, London Boardroom',
          remoteMeetingContext: {
            platform: 'Secure Corporate Portal',
            hostCountry: 'GB',
            hostCity: 'London',
            timeZone: 'Europe/London'
          },
          chairpersonUserId: ceoPrincipal.id,
          secretaryUserId: cfoPrincipal.id,
          chairpersonName: 'Aja CEO',
          secretaryName: 'Aja CFO',
          quorumRequired: 2
        },
        { principal: ceoPrincipal }
      );

      assert.ok(meeting.id);
      assert.ok(meeting.meetingNumber.startsWith('MTG-'));
      assert.equal(meeting.status, 'SCHEDULED');
      assert.equal(meeting.quorumRequired, 2);

      createdMeetingId = meeting.id;
    });

    it('Adds Director and Observer participants to the meeting', async () => {
      // Add CEO Director Participant
      const ptc1 = await CorporateDecisionService.addMeetingParticipant(
        createdMeetingId,
        {
          participantUserId: ceoPrincipal.id,
          fullNameEn: 'Aja CEO',
          statutoryAppointmentId: aptCeoId,
          roleInMeeting: 'CHAIR',
          attendanceStatus: 'ATTENDED',
          joiningMethod: 'PHYSICAL',
          country: 'GB',
          city: 'London',
          timeZone: 'Europe/London',
          votingEligibility: true,
          hasConflictOfInterest: false,
          recusedFromVoting: false
        },
        { principal: ceoPrincipal }
      );

      assert.ok(ptc1.id);
      assert.equal(ptc1.votingEligibility, true);

      // Add CFO Director Participant
      const ptc2 = await CorporateDecisionService.addMeetingParticipant(
        createdMeetingId,
        {
          participantUserId: cfoPrincipal.id,
          fullNameEn: 'Aja CFO',
          statutoryAppointmentId: aptCfoId,
          roleInMeeting: 'DIRECTOR',
          attendanceStatus: 'ATTENDED',
          joiningMethod: 'PHYSICAL',
          country: 'GB',
          city: 'London',
          timeZone: 'Europe/London',
          votingEligibility: true,
          hasConflictOfInterest: false,
          recusedFromVoting: false
        },
        { principal: ceoPrincipal }
      );

      assert.ok(ptc2.id);

      const participants = await CorporateDecisionService.listMeetingParticipants(createdMeetingId, { principal: ceoPrincipal });
      assert.equal(participants.length, 2);
    });
  });

  // ==================== 3. Statutory Voting & Resolution Adoption ====================
  describe('3. Statutory Voting Engine, Recusal & Resolution Adoption', () => {
    it('Directors cast valid binding votes on decision in APPROVAL state', async () => {
      // CEO casts FOR vote
      const vote1 = await CorporateDecisionService.castVote(
        createdDecisionId,
        {
          voterAppointmentId: aptCeoId,
          vote: 'FOR',
          votingMethod: 'IN_PERSON_BALLOT',
          comment: 'Approved for Treasury modernization'
        },
        { principal: ceoPrincipal }
      );
      assert.equal(vote1.vote, 'FOR');
      assert.equal(vote1.recused, false);

      // CFO casts FOR vote
      const vote2 = await CorporateDecisionService.castVote(
        createdDecisionId,
        {
          voterAppointmentId: aptCfoId,
          vote: 'FOR',
          votingMethod: 'IN_PERSON_BALLOT',
          comment: 'Financial terms verified'
        },
        { principal: cfoPrincipal }
      );
      assert.equal(vote2.vote, 'FOR');

      // COO declares conflict of interest and is recused
      const vote3 = await CorporateDecisionService.castVote(
        createdDecisionId,
        {
          voterAppointmentId: aptCooId,
          vote: 'FOR',
          votingMethod: 'IN_PERSON_BALLOT',
          conflictDeclared: true,
          comment: 'Declared conflict of interest regarding third-party supplier'
        },
        { principal: cooPrincipal }
      );
      assert.equal(vote3.vote, 'ABSTAIN');
      assert.equal(vote3.recused, true);

      const votes = await CorporateDecisionService.getDecisionVotes(createdDecisionId, { principal: ceoPrincipal });
      assert.equal(votes.length, 3);
    });

    it('Blocks duplicate vote from the same director appointment', async () => {
      await assert.rejects(
        async () => {
          await CorporateDecisionService.castVote(
            createdDecisionId,
            {
              voterAppointmentId: aptCeoId,
              vote: 'FOR',
              votingMethod: 'IN_PERSON_BALLOT'
            },
            { principal: ceoPrincipal }
          );
        },
        /Duplicate Vote Blocked/
      );
    });

    it('Blocks System Administrator from voting without active statutory director appointment', async () => {
      const sysAdminWithView: User = {
        ...systemAdminUser,
        customPermissions: ['governance:decision:view']
      };

      await assert.rejects(
        async () => {
          await CorporateDecisionService.castVote(
            createdDecisionId,
            {
              vote: 'FOR',
              votingMethod: 'REMOTE_ELECTRONIC'
            },
            { principal: sysAdminWithView }
          );
        },
        /System Administrator .* cannot cast statutory corporate votes/
      );
    });

    it('Adopts Board Resolution (RES-YYYY-####) upon meeting Quorum and Majority threshold', async () => {
      const outcome = await CorporateDecisionService.adoptResolution(
        createdDecisionId,
        'BOARD_RESOLUTION',
        { principal: cfoPrincipal } // Co-director adoption (Separation of Duties respected)
      );

      assert.ok(outcome.resolution.id);
      assert.ok(outcome.resolution.resolutionNumber.startsWith('RES-'));
      assert.equal(outcome.resolution.status, 'ACTIVE');
      assert.equal(outcome.resolution.votingOutcome.quorumMet, true);
      assert.equal(outcome.resolution.votingOutcome.votesFor, 2);
      assert.equal(outcome.decision.lifecycleStatus, 'RESOLUTION');
      assert.equal(outcome.decision.executionStatus, 'PENDING_DISPATCH');

      createdResolutionId = outcome.resolution.id;
    });
  });

  // ==================== 4. Controlled Execution Engine ====================
  describe('4. Controlled Downstream Execution Engine & Idempotency', () => {
    const idempotencyKey = `idemp_bank_hsbc_${Date.now()}`;

    it('Executes resolution side-effects to FINANCE_TREASURY domain', async () => {
      const execution = await CorporateDecisionExecutionService.dispatchExecution(
        {
          decisionId: createdDecisionId,
          resolutionId: createdResolutionId,
          legalEntityId,
          targetDomain: 'FINANCE_TREASURY',
          executionType: 'OPEN_BANK_ACCOUNT',
          idempotencyKey,
          payloadData: {
            bankName: 'HSBC UK Bank plc',
            currency: 'GBP',
            mandateType: 'DUAL_SIGNATORY'
          }
        },
        { principal: cfoPrincipal }
      );

      assert.ok(execution.id);
      assert.equal(execution.executionStatus, 'EXECUTED');
      assert.ok(execution.resultReference?.includes('FIN-SUCCESS'));
      assert.equal(execution.idempotencyKey, idempotencyKey);

      createdExecutionId = execution.id;
    });

    it('Idempotency Guarantee: Re-dispatching with same key returns existing execution without re-mutating', async () => {
      const duplicateExecution = await CorporateDecisionExecutionService.dispatchExecution(
        {
          decisionId: createdDecisionId,
          resolutionId: createdResolutionId,
          legalEntityId,
          targetDomain: 'FINANCE_TREASURY',
          executionType: 'OPEN_BANK_ACCOUNT',
          idempotencyKey,
          payloadData: {
            bankName: 'HSBC UK Bank plc'
          }
        },
        { principal: cfoPrincipal }
      );

      assert.equal(duplicateExecution.id, createdExecutionId);
      assert.equal(duplicateExecution.executionStatus, 'EXECUTED');
    });

    it('Separation of Duties in Verification: Executor cannot verify their own execution', async () => {
      await assert.rejects(
        async () => {
          await CorporateDecisionExecutionService.verifyExecutionEvidence(
            createdExecutionId,
            'doc_bank_confirmation_01',
            { principal: cfoPrincipal } // CFO was the executor
          );
        },
        /Separation of Duties Violation: Executor .* cannot verify their own decision execution/
      );
    });

    it('Independent Officer verifies execution proof and attaches evidence document', async () => {
      const verified = await CorporateDecisionExecutionService.verifyExecutionEvidence(
        createdExecutionId,
        'doc_bank_confirmation_01',
        { principal: ceoPrincipal } // CEO is independent verifier
      );

      assert.equal(verified.executionStatus, 'VERIFIED');
      assert.equal(verified.verifiedByUserId, ceoPrincipal.id);
      assert.equal(verified.evidenceDocumentId, 'doc_bank_confirmation_01');
    });

    it('Completes lifecycle from EVIDENCE -> VERIFICATION -> AUDIT -> CLOSED', async () => {
      // Transition to EXECUTION & attach evidence
      await CorporateDecisionService.transitionToExecution(createdDecisionId, { principal: ceoPrincipal });
      await CorporateDecisionService.attachExecutionEvidence(createdDecisionId, ['doc_bank_confirmation_01'], { principal: cfoPrincipal });
      
      // Verify Decision
      const verified = await CorporateDecisionService.verifyDecision(createdDecisionId, { principal: ceoPrincipal });
      assert.equal(verified.lifecycleStatus, 'VERIFICATION');

      // Audit Decision
      const audited = await CorporateDecisionService.auditDecision(
        createdDecisionId,
        'Complete regulatory compliance, mandate signatures and bank verification verified.',
        { principal: cfoPrincipal }
      );
      assert.equal(audited.lifecycleStatus, 'AUDIT');

      // Close Decision
      const closed = await CorporateDecisionService.closeDecision(createdDecisionId, { principal: ceoPrincipal });
      assert.equal(closed.lifecycleStatus, 'CLOSED');
      assert.ok(closed.closedAt);
    });
  });

  // ==================== 5. Historical Preservation & Supersession ====================
  describe('5. Historical Preservation & Supersession', () => {
    it('Blocks hard delete on decisions and generates audit alert', async () => {
      await assert.rejects(
        async () => {
          await CorporateDecisionService.deleteDecisionProhibited(createdDecisionId, { principal: ceoPrincipal });
        },
        /Hard deletion of corporate governance DECISION records/
      );
    });

    it('Supersedes decision with a newer decision referencing the successor ID', async () => {
      const superseded = await CorporateDecisionService.supersedeDecision(
        createdDecisionId,
        'dec_successor_2026_999',
        'Superseded by new group-wide banking mandate',
        { principal: ceoPrincipal }
      );

      assert.equal(superseded.lifecycleStatus, 'SUPERSEDED');
      assert.equal(superseded.supersededByDecisionId, 'dec_successor_2026_999');
    });
  });

  // ==================== 6. Search, Export & Audit Assurance ====================
  describe('6. Search, Export & Audit Trail Assurance', () => {
    it('Searches decisions safely with legal entity scoping', async () => {
      const results = await CorporateDecisionService.searchDecisions(
        legalEntityId,
        'HSBC',
        { principal: ceoPrincipal }
      );

      assert.equal(results.length >= 1, true);
      assert.ok(results[0].title.includes('HSBC'));
    });

    it('Exports decision register with governance:decision:export permission', async () => {
      const exportData = await CorporateDecisionService.exportDecisionRegister(
        legalEntityId,
        { principal: ceoPrincipal }
      );

      assert.equal(exportData.legalEntityId, legalEntityId);
      assert.ok(exportData.totalDecisions >= 1);
      assert.ok(exportData.exportedAt);
    });

    it('Audit trail contains end-to-end telemetry for all actions', async () => {
      const auditLogs = await listAuditLogs();
      const decisionLogs = auditLogs.filter(
        (log) => log.entityType === 'CORPORATE_DECISION' || log.entityType === 'DECISION_EXECUTION' || log.entityType === 'DECISION_VOTE'
      );

      assert.equal(decisionLogs.length >= 5, true);
    });
  });
});
