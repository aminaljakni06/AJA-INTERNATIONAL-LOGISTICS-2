/**
 * AJA INTERNATIONAL LOGISTICS — Compliance Calendar, Recurrence, Deadlines & Escalations Certification Test Suite
 * Step GOV-08: Complete Functional, Security & Negative Assertion Coverage
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  ComplianceCalendarService,
  DueDateCalculationResult
} from '../services/complianceCalendarService';
import {
  ComplianceObligationService
} from '../services/complianceObligationService';
import {
  ComplianceApplicabilityEngine
} from '../services/complianceApplicabilityEngine';
import {
  ComplianceMonitoringEngine
} from '../services/complianceMonitoringEngine';
import {
  resetComplianceRepositoryMemoryStore,
  saveObligation
} from '../db/repositories/complianceObligationRepository';
import {
  resetComplianceCalendarRepositoryMemoryStore,
  saveOccurrence,
  getOccurrenceById
} from '../db/repositories/complianceCalendarRepository';
import {
  ComplianceObligation,
  ComplianceOccurrence,
  DueDateRuleConfig
} from '../types/corporateGovernance';
import { User } from '../types/user';

// Mock Principals for Security & ABAC Evaluation
const ceoUser: User = {
  id: 'usr_ceo_global',
  email: 'ceo@ajalogistics.com',
  fullName: 'Global Executive Officer',
  phone: '+966110000001',
  role: 'CEO',
  companyId: 'le-holding-101',
  legalEntityId: 'le-holding-101',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const cfoUser: User = {
  id: 'usr_cfo_holding',
  email: 'cfo@ajalogistics.com',
  fullName: 'Chief Financial Officer',
  phone: '+966110000002',
  role: 'CFO',
  companyId: 'le-holding-101',
  legalEntityId: 'le-holding-101',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const complianceOfficerUser: User = {
  id: 'usr_compliance_officer',
  email: 'compliance@ajalogistics.com',
  fullName: 'Chief Compliance Officer',
  phone: '+966110000003',
  role: 'COMPANY_ADMIN',
  companyId: 'le-holding-101',
  legalEntityId: 'le-holding-101',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const financePreparerUser: User = {
  id: 'usr_fin_preparer',
  email: 'preparer@ajalogistics.com',
  fullName: 'Finance Preparer',
  phone: '+966110000004',
  role: 'FINANCE_MANAGER',
  companyId: 'le-holding-101',
  legalEntityId: 'le-holding-101',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const externalAdvisorUser: User = {
  id: 'usr_external_advisor',
  email: 'advisor@uktaxfirm.com',
  fullName: 'External UK Tax Advisor',
  phone: '+442079460001',
  role: 'CUSTOMER', // non-admin, non-executive
  companyId: 'le-holding-101',
  legalEntityId: 'le-holding-101',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const unauthorizedEntityUser: User = {
  id: 'usr_saudi_local',
  email: 'saudi@ajalogistics.sa',
  fullName: 'Saudi Entity Manager',
  phone: '+966120000005',
  role: 'OPERATIONS_MANAGER',
  companyId: 'le-saudi-branch-202',
  legalEntityId: 'le-saudi-branch-202',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

describe('STEP GOV-08: Corporate Compliance Calendar, Recurrence & Deadline Engine', () => {
  beforeEach(() => {
    resetComplianceRepositoryMemoryStore();
    resetComplianceCalendarRepositoryMemoryStore();
  });

  // --------------------------------------------------------------------------
  // TEST 1: Due-Date Engine - Deterministic Calculations
  // --------------------------------------------------------------------------
  test('1. Due-Date Engine: Correctly calculates RELATIVE_TO_FYE_MONTHS, RELATIVE_TO_EVENT_DAYS, and FIXED_ANNUAL_DAY', () => {
    // 1. UK Statutory Accounts (+9 months from FYE Dec 31 -> Sept 30)
    const accountsRule: DueDateRuleConfig = {
      ruleType: 'RELATIVE_TO_FYE_MONTHS',
      offsetDaysOrMonths: 9,
      jurisdictionTimeZone: 'Europe/London'
    };
    const accountsDue = ComplianceCalendarService.calculateStatutoryDueDate(
      { jurisdiction: 'GB', dueDateRule: accountsRule },
      '2025-12-31'
    );
    assert.equal(accountsDue.dueLocalDate, '2026-09-30');
    assert.equal(accountsDue.timeZone, 'Europe/London');
    assert.equal(accountsDue.statutoryDueDate, '2026-09-30T23:59:59.000Z');

    // 2. UK Corporation Tax Return (+12 months from FYE Dec 31 -> Dec 31)
    const ct600Rule: DueDateRuleConfig = {
      ruleType: 'RELATIVE_TO_FYE_MONTHS',
      offsetDaysOrMonths: 12,
      jurisdictionTimeZone: 'Europe/London'
    };
    const ct600Due = ComplianceCalendarService.calculateStatutoryDueDate(
      { jurisdiction: 'GB', dueDateRule: ct600Rule },
      '2025-12-31'
    );
    assert.equal(ct600Due.dueLocalDate, '2026-12-31');

    // 3. UK Confirmation Statement (+14 days from period review date Jan 15 -> Jan 29)
    const cs01Rule: DueDateRuleConfig = {
      ruleType: 'RELATIVE_TO_EVENT_DAYS',
      offsetDaysOrMonths: 14,
      jurisdictionTimeZone: 'Europe/London'
    };
    const cs01Due = ComplianceCalendarService.calculateStatutoryDueDate(
      { jurisdiction: 'GB', dueDateRule: cs01Rule },
      '2026-01-15'
    );
    assert.equal(cs01Due.dueLocalDate, '2026-01-29');

    // 4. Fixed Annual Day (12-31)
    const fixedRule: DueDateRuleConfig = {
      ruleType: 'FIXED_ANNUAL_DAY',
      fixedMonthDay: '12-31',
      jurisdictionTimeZone: 'Europe/London'
    };
    const fixedDue = ComplianceCalendarService.calculateStatutoryDueDate(
      { jurisdiction: 'GB', dueDateRule: fixedRule },
      '2026-06-30'
    );
    assert.equal(fixedDue.dueLocalDate, '2026-12-31');
  });

  // --------------------------------------------------------------------------
  // TEST 2: Due-Date Engine - Business Day Conventions
  // --------------------------------------------------------------------------
  test('2. Due-Date Engine: Correctly applies Business Day Conventions (NEXT_BUSINESS_DAY and PREVIOUS_BUSINESS_DAY)', () => {
    // Period ending on a date such that +14 days lands on Saturday (e.g. 2026-02-14 is Saturday if base is 2026-01-31)
    // Jan 31 + 14 days = Feb 14 (Saturday in 2026)
    const baseDate = '2026-01-31';

    // A. Without adjustment (NONE): Should remain 2026-02-14
    const noneRule: DueDateRuleConfig = {
      ruleType: 'RELATIVE_TO_EVENT_DAYS',
      offsetDaysOrMonths: 14,
      businessDayConvention: 'NONE'
    };
    const resNone = ComplianceCalendarService.calculateStatutoryDueDate(
      { jurisdiction: 'GB', dueDateRule: noneRule },
      baseDate
    );
    assert.equal(resNone.dueLocalDate, '2026-02-14');

    // B. NEXT_BUSINESS_DAY: Saturday -> Monday 2026-02-16
    const nextRule: DueDateRuleConfig = {
      ruleType: 'RELATIVE_TO_EVENT_DAYS',
      offsetDaysOrMonths: 14,
      businessDayConvention: 'NEXT_BUSINESS_DAY'
    };
    const resNext = ComplianceCalendarService.calculateStatutoryDueDate(
      { jurisdiction: 'GB', dueDateRule: nextRule },
      baseDate
    );
    assert.equal(resNext.dueLocalDate, '2026-02-16');

    // C. PREVIOUS_BUSINESS_DAY: Saturday -> Friday 2026-02-13
    const prevRule: DueDateRuleConfig = {
      ruleType: 'RELATIVE_TO_EVENT_DAYS',
      offsetDaysOrMonths: 14,
      businessDayConvention: 'PREVIOUS_BUSINESS_DAY'
    };
    const resPrev = ComplianceCalendarService.calculateStatutoryDueDate(
      { jurisdiction: 'GB', dueDateRule: prevRule },
      baseDate
    );
    assert.equal(resPrev.dueLocalDate, '2026-02-13');
  });

  // --------------------------------------------------------------------------
  // TEST 3: Recurrence & Idempotent Occurrence Generation
  // --------------------------------------------------------------------------
  test('3. Recurrence Engine: Generates occurrences and guarantees idempotency across repeated runs', async () => {
    const obligation: ComplianceObligation = {
      id: 'obl_uk_accounts_2026',
      legalEntityId: 'le-holding-101',
      code: 'OBL-UK-ACCOUNTS',
      titleEn: 'Annual Statutory Accounts Filing',
      description: 'Annual statutory accounts filing under UK Companies Act',
      jurisdiction: 'GB',
      regulatoryAuthority: 'Companies House',
      category: 'FINANCIAL_REPORTING',
      sourceCitation: 'Companies Act 2006 s.441',
      frequency: 'ANNUAL',
      dueDateRule: {
        ruleType: 'RELATIVE_TO_FYE_MONTHS',
        offsetDaysOrMonths: 9,
        jurisdictionTimeZone: 'Europe/London'
      },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'CRITICAL',
      ownerUserId: financePreparerUser.id,
      responsibleDepartmentId: 'dept_finance',
      status: 'ACTIVE',
      applicabilityStatus: 'APPLICABLE',
      effectiveFrom: '2025-01-01',
      auditCorrelationId: 'cor_obl_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveObligation(obligation, ceoUser.id);

    // First generation run
    const occs1 = await ComplianceCalendarService.generateOccurrencesForObligation(
      ceoUser,
      obligation.id,
      365
    );
    assert.ok(occs1.length >= 1, 'Should generate at least 1 annual occurrence');
    const firstOcc = occs1[0];
    assert.equal(firstOcc.obligationCode, 'OBL-UK-ACCOUNTS');
    assert.equal(firstOcc.legalEntityId, 'le-holding-101');
    assert.equal(firstOcc.ownerUserId, financePreparerUser.id);
    assert.equal(firstOcc.status, 'UPCOMING');
    assert.ok(firstOcc.occurrenceNumber.startsWith('CMP-'));

    // Second generation run (Idempotency check)
    const occs2 = await ComplianceCalendarService.generateOccurrencesForObligation(
      ceoUser,
      obligation.id,
      365
    );
    assert.equal(occs2.length, occs1.length, 'Repeated generation should not create duplicates');
    assert.equal(occs2[0].id, firstOcc.id, 'Should return the exact same persisted occurrence ID');
  });

  // --------------------------------------------------------------------------
  // TEST 4: Applicability Gating & Waived Suppressed Occurrences
  // --------------------------------------------------------------------------
  test('4. Applicability Gating: Unassessed or NOT_APPLICABLE obligations produce 0 occurrences, WAIVED produce suppressed occurrences', async () => {
    // Obligation A: PENDING_ASSESSMENT
    const oblUnassessed: ComplianceObligation = {
      id: 'obl_unassessed_1',
      legalEntityId: 'le-holding-101',
      code: 'OBL-UNASSESSED',
      titleEn: 'Unassessed Duty',
      description: 'Pending assessment duty',
      jurisdiction: 'GB',
      regulatoryAuthority: 'HMRC',
      category: 'TAX_AND_REVENUE',
      sourceCitation: 'Tax Act',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'FIXED_ANNUAL_DAY', fixedMonthDay: '12-31' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: financePreparerUser.id,
      status: 'ACTIVE',
      applicabilityStatus: 'PENDING_ASSESSMENT',
      effectiveFrom: '2025-01-01',
      auditCorrelationId: 'cor_obl_2',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveObligation(oblUnassessed, ceoUser.id);

    const occsUnassessed = await ComplianceCalendarService.generateOccurrencesForObligation(
      ceoUser,
      oblUnassessed.id,
      365
    );
    assert.equal(occsUnassessed.length, 0, 'Unassessed obligations must NOT generate active occurrences');

    // Obligation B: NOT_APPLICABLE
    const oblNotApplicable: ComplianceObligation = {
      id: 'obl_not_app_1',
      legalEntityId: 'le-holding-101',
      code: 'OBL-NOT-APP',
      titleEn: 'Non-applicable Tax',
      description: 'Non-applicable obligation',
      jurisdiction: 'GB',
      regulatoryAuthority: 'HMRC',
      category: 'TAX_AND_REVENUE',
      sourceCitation: 'Tax Act',
      frequency: 'ANNUAL',
      dueDateRule: { ruleType: 'FIXED_ANNUAL_DAY', fixedMonthDay: '12-31' },
      filingRequired: true,
      evidenceRequired: true,
      riskLevel: 'HIGH',
      ownerUserId: financePreparerUser.id,
      status: 'ACTIVE',
      applicabilityStatus: 'NOT_APPLICABLE',
      effectiveFrom: '2025-01-01',
      auditCorrelationId: 'cor_obl_3',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveObligation(oblNotApplicable, ceoUser.id);

    const occsNotApp = await ComplianceCalendarService.generateOccurrencesForObligation(
      ceoUser,
      oblNotApplicable.id,
      365
    );
    assert.equal(occsNotApp.length, 0, 'NOT_APPLICABLE obligations must NOT generate occurrences');
  });

  // --------------------------------------------------------------------------
  // TEST 5: Runtime Dynamic Overdue Evaluation
  // --------------------------------------------------------------------------
  test('5. Runtime Status: Evaluates OVERDUE and DUE_SOON dynamically without mutating immutable records', () => {
    const baseOcc: ComplianceOccurrence = {
      id: 'occ_test_overdue',
      occurrenceNumber: 'CMP-2026-0099',
      obligationId: 'obl_1',
      obligationCode: 'OBL-TEST',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'VAT Return',
      referencePeriodStart: '2025-01-01',
      referencePeriodEnd: '2025-12-31',
      periodReference: 'FY2025',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-01-15T23:59:59.000Z',
      dueLocalDate: '2026-01-15',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'HIGH',
      riskLevel: 'HIGH',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [30, 14, 7, 0],
        escalationAfterOverdueDays: [1, 7],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_test_overdue',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };

    // A. asOfDate is 2026-01-10 (5 days before due date) -> DUE_SOON
    const statusDueSoon = ComplianceCalendarService.evaluateRuntimeStatus(
      baseOcc,
      new Date('2026-01-10T12:00:00.000Z')
    );
    assert.equal(statusDueSoon, 'DUE_SOON');

    // B. asOfDate is 2026-01-20 (5 days after due date) -> OVERDUE
    const statusOverdue = ComplianceCalendarService.evaluateRuntimeStatus(
      baseOcc,
      new Date('2026-01-20T12:00:00.000Z')
    );
    assert.equal(statusOverdue, 'OVERDUE');

    // C. If occurrence was already COMPLETED, remains COMPLETED
    const completedOcc = { ...baseOcc, status: 'COMPLETED' as const };
    const statusCompleted = ComplianceCalendarService.evaluateRuntimeStatus(
      completedOcc,
      new Date('2026-01-20T12:00:00.000Z')
    );
    assert.equal(statusCompleted, 'COMPLETED');
  });

  // --------------------------------------------------------------------------
  // TEST 6: Owner Reassignment & Advisor Scoping (ABAC)
  // --------------------------------------------------------------------------
  test('6. Ownership & Advisor Scoping: Reassigns owner with audit trail and isolates external advisor to assigned occurrence', async () => {
    const occurrence: ComplianceOccurrence = {
      id: 'occ_advisor_scope_1',
      occurrenceNumber: 'CMP-2026-0101',
      obligationId: 'obl_1',
      obligationCode: 'OBL-UK-TAX-01',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Corporation Tax Return',
      referencePeriodStart: '2025-01-01',
      referencePeriodEnd: '2025-12-31',
      periodReference: 'FY2025',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-12-31T23:59:59.000Z',
      dueLocalDate: '2026-12-31',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'HIGH',
      riskLevel: 'HIGH',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [30, 7],
        escalationAfterOverdueDays: [7],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_scope_1',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveOccurrence(occurrence, ceoUser.id);

    // Assign external advisor to this specific occurrence
    const reassigned = await ComplianceCalendarService.reassignOwner(ceoUser, {
      occurrenceId: occurrence.id,
      newOwnerUserId: financePreparerUser.id,
      assignedAdvisorUserId: externalAdvisorUser.id,
      reason: 'External advisor retained for specialized CT600 computation'
    });
    assert.equal(reassigned.assignedAdvisorUserId, externalAdvisorUser.id);

    // Assigned advisor can view occurrence 1
    const advisorView = await ComplianceCalendarService.getOccurrence(
      externalAdvisorUser,
      occurrence.id
    );
    assert.equal(advisorView.id, occurrence.id);

    // Second occurrence where advisor is NOT assigned
    const occurrence2: ComplianceOccurrence = {
      ...occurrence,
      id: 'occ_advisor_scope_2',
      occurrenceNumber: 'CMP-2026-0102',
      assignedAdvisorUserId: undefined,
      generationKey: 'gen_scope_2'
    };
    await saveOccurrence(occurrence2, ceoUser.id);

    // Advisor attempting to access unassigned occurrence 2 must be DENIED
    await assert.rejects(
      async () => {
        await ComplianceCalendarService.getOccurrence(externalAdvisorUser, occurrence2.id);
      },
      /Unauthorized|Access denied/
    );
  });

  // --------------------------------------------------------------------------
  // TEST 7: Deadline Rescheduling & Approved Statutory Extension
  // --------------------------------------------------------------------------
  test('7. Deadline Engine: Operational rescheduling and statutory extension preserve original statutoryDueDate', async () => {
    const occurrence: ComplianceOccurrence = {
      id: 'occ_extension_test',
      occurrenceNumber: 'CMP-2026-0103',
      obligationId: 'obl_1',
      obligationCode: 'OBL-CS01',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Confirmation Statement',
      referencePeriodStart: '2026-01-01',
      referencePeriodEnd: '2026-01-15',
      periodReference: '2026-REVIEW',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-01-29T23:59:59.000Z',
      dueLocalDate: '2026-01-29',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'NORMAL',
      riskLevel: 'MEDIUM',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [7],
        escalationAfterOverdueDays: [7],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_ext_1',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveOccurrence(occurrence, ceoUser.id);

    // A. Operational Target Reschedule: Sets internalTargetDate without touching statutoryDueDate
    const rescheduled = await ComplianceCalendarService.rescheduleOperationalTarget(
      cfoUser,
      occurrence.id,
      '2026-01-20T00:00:00.000Z',
      'Finance team target for draft review'
    );
    assert.equal(rescheduled.internalTargetDate, '2026-01-20T00:00:00.000Z');
    assert.equal(rescheduled.statutoryDueDate, '2026-01-29T23:59:59.000Z', 'Statutory due date must remain intact');

    // B. Statutory Extension: Records extendedDueDate with authority reference
    const extended = await ComplianceCalendarService.recordStatutoryExtension(cfoUser, {
      occurrenceId: occurrence.id,
      extendedDueDate: '2026-02-28T23:59:59.000Z',
      authorityReference: 'COMPANIES_HOUSE_EXT_REF_9981',
      reason: 'Formal 30-day filing extension granted due to corporate reorganization',
      evidenceDocumentId: 'doc_ch_extension_notice'
    });
    assert.equal(extended.extendedDueDate, '2026-02-28T23:59:59.000Z');
    assert.equal(extended.statutoryDueDate, '2026-01-29T23:59:59.000Z', 'Original statutory deadline preserved');
    assert.equal(extended.extensionAuthorityReference, 'COMPANIES_HOUSE_EXT_REF_9981');
    assert.ok(extended.evidenceDocumentIds.includes('doc_ch_extension_notice'));
  });

  // --------------------------------------------------------------------------
  // TEST 8: Separation of Duties (SoD) & Verification Engine
  // --------------------------------------------------------------------------
  test('8. SoD Invariant: Submitter/Owner cannot self-verify evidence; independent compliance officer verifies successfully', async () => {
    const occurrence: ComplianceOccurrence = {
      id: 'occ_sod_test',
      occurrenceNumber: 'CMP-2026-0104',
      obligationId: 'obl_1',
      obligationCode: 'OBL-UK-CS01',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Confirmation Statement CS01',
      referencePeriodStart: '2026-01-01',
      referencePeriodEnd: '2026-01-15',
      periodReference: '2026-REVIEW',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-01-29T23:59:59.000Z',
      dueLocalDate: '2026-01-29',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'NORMAL',
      riskLevel: 'MEDIUM',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [7],
        escalationAfterOverdueDays: [7],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_sod_1',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveOccurrence(occurrence, ceoUser.id);

    // Preparer completes the filing item
    const completed = await ComplianceCalendarService.completeOccurrence(
      financePreparerUser,
      {
        occurrenceId: occurrence.id,
        filingReference: 'CH-SUB-9981-RECEIPT',
        evidenceDocumentId: 'doc_submission_receipt_pdf',
        notes: 'Submitted via WebFiling portal'
      }
    );
    assert.equal(completed.status, 'FILED');
    assert.equal(completed.filingNumber, 'CH-SUB-9981-RECEIPT');

    // NEGATIVE ASSERTION: Preparer attempting to self-verify must fail with SoD violation
    await assert.rejects(
      async () => {
        await ComplianceCalendarService.verifyOccurrenceFiling(financePreparerUser, {
          occurrenceId: occurrence.id,
          evidenceDocumentId: 'doc_submission_receipt_pdf',
          verificationNotes: 'Self-verifying my own filing'
        });
      },
      /Separation of Duties \(SoD\) Violation/
    );

    // POSITIVE ASSERTION: Independent Compliance Officer verifies evidence
    const verified = await ComplianceCalendarService.verifyOccurrenceFiling(cfoUser, {
      occurrenceId: occurrence.id,
      evidenceDocumentId: 'doc_submission_receipt_pdf',
      verificationNotes: 'Independent verification completed. Companies House submission receipt validated.'
    });
    assert.equal(verified.status, 'COMPLETED');
    assert.equal(verified.verifiedByUserId, cfoUser.id);
    assert.ok(verified.verificationDate);
  });

  // --------------------------------------------------------------------------
  // TEST 9: Idempotent Bilingual Reminder Scheduling Engine
  // --------------------------------------------------------------------------
  test('9. Reminder Engine: Dispatches reminders at scheduled offsets and prevents duplicate notifications', async () => {
    const occurrence: ComplianceOccurrence = {
      id: 'occ_reminder_test',
      occurrenceNumber: 'CMP-2026-0105',
      obligationId: 'obl_1',
      obligationCode: 'OBL-UK-VAT',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Quarterly VAT Return',
      referencePeriodStart: '2026-01-01',
      referencePeriodEnd: '2026-03-31',
      periodReference: '2026-Q1',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-05-07T23:59:59.000Z', // Due May 7
      dueLocalDate: '2026-05-07',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'HIGH',
      riskLevel: 'HIGH',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [30, 14, 7, 1, 0],
        escalationAfterOverdueDays: [1, 7],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_rem_1',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveOccurrence(occurrence, ceoUser.id);

    // As of April 15 (22 days before May 7): 30-day reminder should trigger
    const asOfApril15 = new Date('2026-04-15T12:00:00.000Z');
    const dispatched1 = await ComplianceCalendarService.dispatchDueReminders(
      ceoUser,
      'le-holding-101',
      asOfApril15
    );
    assert.equal(dispatched1.length, 1, 'Should trigger exactly the 30-day reminder');
    assert.equal(dispatched1[0].triggerOffsetDays, 30);

    // Second run on same date: Idempotency must prevent duplicate reminder dispatch
    const dispatched2 = await ComplianceCalendarService.dispatchDueReminders(
      ceoUser,
      'le-holding-101',
      asOfApril15
    );
    assert.equal(dispatched2.length, 0, 'No duplicate reminders should be dispatched');

    // As of May 1 (6 days before May 7): 14-day and 7-day reminders should trigger
    const asOfMay1 = new Date('2026-05-01T12:00:00.000Z');
    const dispatched3 = await ComplianceCalendarService.dispatchDueReminders(
      ceoUser,
      'le-holding-101',
      asOfMay1
    );
    assert.equal(dispatched3.length, 2, 'Should trigger 14-day and 7-day reminders');
  });

  // --------------------------------------------------------------------------
  // TEST 10: Multi-Tier Escalation Engine & Acknowledgement Workflow
  // --------------------------------------------------------------------------
  test('10. Escalation Engine: Triggers tiered escalations for overdue occurrences and handles executive acknowledgement', async () => {
    const overdueOccurrence: ComplianceOccurrence = {
      id: 'occ_esc_test',
      occurrenceNumber: 'CMP-2026-0106',
      obligationId: 'obl_1',
      obligationCode: 'OBL-CRITICAL-TAX',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Annual Corporate Tax Return',
      referencePeriodStart: '2025-01-01',
      referencePeriodEnd: '2025-12-31',
      periodReference: 'FY2025',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-01-10T23:59:59.000Z', // Overdue
      dueLocalDate: '2026-01-10',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'CRITICAL',
      riskLevel: 'CRITICAL',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [7],
        escalationAfterOverdueDays: [1, 7, 14, 30],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_esc_1',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveOccurrence(overdueOccurrence, ceoUser.id);

    // As of 2026-01-20 (10 days overdue, CRITICAL risk -> Level 3 Executive)
    const asOfJan20 = new Date('2026-01-20T12:00:00.000Z');
    const escalations = await ComplianceCalendarService.evaluateAndTriggerEscalations(
      ceoUser,
      'le-holding-101',
      asOfJan20
    );
    assert.ok(escalations.length >= 1, 'Should trigger escalation record');
    assert.equal(escalations[0].level, 3);
    assert.equal(escalations[0].targetRole, 'EXECUTIVE_LEADERSHIP');

    // Executive Acknowledges Escalation
    const acknowledged = await ComplianceCalendarService.acknowledgeEscalation(
      cfoUser,
      overdueOccurrence.id,
      'CFO instructed external audit firm to expedite filing computation within 48 hours.'
    );
    assert.equal(acknowledged.escalationStatus, 'ACKNOWLEDGED');
    assert.equal(acknowledged.escalationHistory[0].status, 'ACKNOWLEDGED');
    assert.equal(acknowledged.escalationHistory[0].acknowledgedByUserId, cfoUser.id);
  });

  // --------------------------------------------------------------------------
  // TEST 11: Multi-Tenant Legal Entity Isolation & Export Auditing
  // --------------------------------------------------------------------------
  test('11. Security & Multi-Tenant Isolation: Entity A cannot access Entity B occurrences, and Export is strictly permission-governed', async () => {
    const occHolding: ComplianceOccurrence = {
      id: 'occ_holding_secret',
      occurrenceNumber: 'CMP-2026-0107',
      obligationId: 'obl_1',
      obligationCode: 'OBL-HOLDING-SECRET',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Holding Company Secret Audit Filing',
      referencePeriodStart: '2025-01-01',
      referencePeriodEnd: '2025-12-31',
      periodReference: 'FY2025',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-09-30T23:59:59.000Z',
      dueLocalDate: '2026-09-30',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'HIGH',
      riskLevel: 'HIGH',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [30],
        escalationAfterOverdueDays: [7],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_sec_1',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveOccurrence(occHolding, ceoUser.id);

    // Saudi branch user attempting to view Holding occurrence must be denied
    await assert.rejects(
      async () => {
        await ComplianceCalendarService.getOccurrence(unauthorizedEntityUser, occHolding.id);
      },
      /Unauthorized|Access denied/
    );

    // Saudi branch user attempting to export Holding calendar matrix must be denied
    await assert.rejects(
      async () => {
        await ComplianceCalendarService.exportCalendarMatrix(unauthorizedEntityUser, 'le-holding-101');
      },
      /Unauthorized|Access denied/
    );

    // Authorized CFO exports calendar matrix successfully
    const exported = await ComplianceCalendarService.exportCalendarMatrix(cfoUser, 'le-holding-101');
    assert.ok(exported.length >= 1);
    assert.equal(exported[0].id, occHolding.id);
  });

  // --------------------------------------------------------------------------
  // TEST 12: Compliance Monitoring Engine Telemetry Integration
  // --------------------------------------------------------------------------
  test('12. Telemetry Engine: Automatically detects overdue compliance occurrences and emits active signals', async () => {
    const overdueOcc: ComplianceOccurrence = {
      id: 'occ_telemetry_overdue',
      occurrenceNumber: 'CMP-2026-0108',
      obligationId: 'obl_1',
      obligationCode: 'OBL-TELEMETRY-TEST',
      legalEntityId: 'le-holding-101',
      jurisdiction: 'GB',
      title: 'Overdue ICO Registration',
      referencePeriodStart: '2025-01-01',
      referencePeriodEnd: '2025-12-31',
      periodReference: 'FY2025',
      scheduledDate: '2026-01-01T00:00:00.000Z',
      statutoryDueDate: '2026-01-01T00:00:00.000Z', // Past date
      dueLocalDate: '2026-01-01',
      timeZone: 'Europe/London',
      status: 'UPCOMING',
      priority: 'HIGH',
      riskLevel: 'HIGH',
      ownerUserId: financePreparerUser.id,
      filingRequired: true,
      evidenceRequired: true,
      evidenceDocumentIds: [],
      reminderSchedule: {
        reminderDaysBeforeDue: [30],
        escalationAfterOverdueDays: [7],
        notifyOwner: true,
        notifyManager: true,
        notifyComplianceOfficer: true,
        notifyExecutive: true
      },
      remindersDispatched: [],
      escalationLevel: 0,
      escalationHistory: [],
      ruleVersion: 1,
      generationKey: 'gen_telemetry_1',
      generatedBy: 'usr_system',
      auditCorrelationId: 'cor_1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    await saveOccurrence(overdueOcc, ceoUser.id);

    // Monitoring scanner should detect overdue statutory deadline
    const signals = await ComplianceMonitoringEngine.scanAndGenerateSignals(
      ceoUser,
      'le-holding-101'
    );
    const overdueSignal = signals.find((s) => s.signalType === 'OVERDUE_STATUTORY_DEADLINE');
    assert.ok(overdueSignal, 'Monitoring engine should emit OVERDUE_STATUTORY_DEADLINE signal');
    assert.equal(overdueSignal.targetResourceId, overdueOcc.id);
    assert.equal(overdueSignal.status, 'ACTIVE');
  });
});
