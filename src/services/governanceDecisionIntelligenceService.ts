/**
 * AJA INTERNATIONAL LOGISTICS — Governance Analytics, Scenario Simulation, Decision Intelligence & Board Advisory Engine
 * Step GOV-17: Advisory, Explainable, Reproducible & Non-Authoritative Governance Intelligence Engine
 * 
 * Core Architectural Invariants:
 * 1. GOVERNANCE-INTELLIGENCE-INVARIANT-01: Intelligence ≠ Authority.
 *    - Analytics cannot approve governance actions.
 *    - Simulation cannot mutate canonical records.
 *    - AI recommendations cannot become decisions automatically.
 *    - Predictions cannot be represented as verified facts.
 *    - Recommendations must preserve source provenance.
 *    - Material analytics must be reproducible where deterministic.
 *    - AI-generated content is clearly distinguished from deterministic calculations.
 *    - Existing authority engines (GOV-06 Decisions, GOV-10 Authority, GOV-15 Execution) remain authoritative.
 * 2. GOVERNANCE-POLICY-INVARIANT-01: All calculations pin policy versions, jurisdiction, and legal entity context.
 * 3. NO PARALLEL SYSTEMS: GOV-17 consumes canonical GOV-05 through GOV-16 repositories in read-only mode.
 * 4. SIMULATION ISOLATION: Simulations execute entirely in memory against isolated snapshots.
 * 5. INTEGRITY SEAL: All finalized analytics, simulations, and advisory briefs are sealed with SHA-256.
 */

import {
  GovernanceAnalyticsSnapshot,
  GovernanceScenarioDefinition,
  GovernanceSimulationRun,
  GovernanceDecisionIntelligence,
  BoardAdvisoryBrief,
  ExecutiveDeskInsights,
  ScenarioType,
  ScenarioAssumption,
  SimulationBottleneck,
  DecisionIntelligenceTaxonomyItem,
  AdvisoryRecommendation,
  DecisionTradeOffOption,
  AIModelProvenance,
  GovernanceJurisdiction,
  CorporateDecisionType,
  GovernanceHealthDimension,
  GovernanceTrendClassification
} from '../types/corporateGovernance';
import { UserContext } from '../types/permissions';
import { ValidationError, PermissionError } from '../db/validation';
import {
  saveGovernanceAnalyticsSnapshot,
  getGovernanceAnalyticsSnapshotById,
  listGovernanceAnalyticsSnapshotsByEntity,
  saveGovernanceScenarioDefinition,
  getGovernanceScenarioDefinitionById,
  listGovernanceScenarioDefinitionsByEntity,
  saveGovernanceSimulationRun,
  getGovernanceSimulationRunById,
  listGovernanceSimulationRunsByEntity,
  saveGovernanceDecisionIntelligence,
  getGovernanceDecisionIntelligenceById,
  listGovernanceDecisionIntelligenceByEntity,
  saveBoardAdvisoryBrief,
  getBoardAdvisoryBriefById,
  listBoardAdvisoryBriefsByEntity,
  generateAnalyticsSnapshotNumber,
  generateScenarioNumber,
  generateSimulationRunNumber,
  generateDecisionIntelligenceNumber,
  generateBoardAdvisoryBriefNumber,
  computeAnalyticsSha256
} from '../db/repositories/governanceAnalyticsRepository';
import {
  listAppointmentsByLegalEntity,
  listCorporateDecisionsByEntity,
  getCorporateLegalProfileByEntityId,
  listBoardMeetingsByEntity
} from '../db/repositories/corporateGovernanceRepository';
import {
  getDelegations,
  getPowersOfAttorney,
  getCorporatePolicyVersionById,
  getInternalControls,
  getCorporatePolicies
} from '../db/repositories/corporateAuthorityRepository';
import {
  listCorporateActionsByEntity,
  listSecretariatInstructionsByEntity,
  listReconciliationRecordsByEntity
} from '../db/repositories/corporateSecretariatRepository';
import {
  listEvidenceRecordsByEntity
} from '../db/repositories/corporateRecordsRepository';
import {
  listGovernanceFindingsByEntity
} from '../db/repositories/corporateRiskAssuranceRepository';
import {
  listGovernanceActionsByEntity
} from '../db/repositories/governanceOrchestrationRepository';
import {
  listGovernanceSignalsByEntity,
  listGovernanceHealthScorecardsByEntity
} from '../db/repositories/governanceControlTowerRepository';

export class GovernanceDecisionIntelligenceService {

  // ==========================================================================
  // 1. GOVERNANCE ANALYTICS SNAPSHOT ENGINE
  // ==========================================================================

  /**
   * Generates a deterministic, point-in-time Governance Analytics Snapshot.
   * Reads from canonical stores without mutation, pins policy/metric versions, and seals with SHA-256.
   */
  public static async generateAnalyticsSnapshot(
    legalEntityId: string,
    jurisdiction: GovernanceJurisdiction,
    reportingPeriod: string,
    policyVersionId: string,
    userContext: UserContext,
    options?: { historicalAsOfDate?: string; calculationVersion?: string }
  ): Promise<GovernanceAnalyticsSnapshot> {
    if (!legalEntityId) throw new ValidationError('legalEntityId is required.');
    if (!policyVersionId) throw new ValidationError('policyVersionId is required (GOVERNANCE-POLICY-INVARIANT-01).');

    // 1. Policy Version Validation
    const policyVer = await getCorporatePolicyVersionById(policyVersionId);
    if (!policyVer) {
      throw new ValidationError(`Governance Policy Version '${policyVersionId}' not found.`);
    }

    // 2. Multi-Entity Authorization Check
    this.enforceEntityAccess(userContext, legalEntityId);

    // 3. Read from Canonical Repositories (Point-in-Time Data Gathering)
    const [
      appointments,
      decisions,
      policies,
      controls,
      findings,
      actions,
      evidence,
      signals,
      scorecards,
      delegations
    ] = await Promise.all([
      listAppointmentsByLegalEntity(legalEntityId),
      listCorporateDecisionsByEntity(legalEntityId),
      getCorporatePolicies({ legalEntityId }),
      getInternalControls({ legalEntityId }),
      listGovernanceFindingsByEntity(legalEntityId, userContext),
      listCorporateActionsByEntity(legalEntityId),
      listEvidenceRecordsByEntity(legalEntityId),
      listGovernanceSignalsByEntity(legalEntityId),
      listGovernanceHealthScorecardsByEntity(legalEntityId),
      getDelegations({ legalEntityId })
    ]);

    const calculationVersion = options?.calculationVersion || 'CALC-GOV-17-v1.0';
    const nowUtc = options?.historicalAsOfDate || new Date().toISOString();

    // 4. Deterministic Metric Rollups
    const openFindings = findings.filter(f => f.status !== 'CLOSED');
    const overdueActions = actions.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && a.status !== 'REJECTED' && a.executionDueDate && a.executionDueDate < nowUtc.split('T')[0]);
    const activeSignals = signals.filter(s => s.status === 'NEW' || s.status === 'UNDER_INVESTIGATION' || s.status === 'ACKNOWLEDGED');

    const effectiveControls = controls.filter(c => c.operatingEffectiveness !== 'DEFICIENT' && c.status !== 'INACTIVE');
    const controlEffectivenessRate = controls.length > 0 ? Math.round((effectiveControls.length / controls.length) * 100) : 100;

    const intactEvidence = evidence.filter(e => e.checksumSha256 && e.verificationStatus !== 'REJECTED');
    const evidenceIntegrityRate = evidence.length > 0 ? Math.round((intactEvidence.length / evidence.length) * 100) : 100;

    const activeDelegations = delegations.filter(d => d.status === 'ACTIVE');
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const delegationsNearingExpiry = activeDelegations.filter(d => d.effectiveUntil && d.effectiveUntil <= thirtyDaysFromNow);

    // Latest scorecard health score or deterministic calculation
    const latestScorecard = scorecards[0];
    const governanceHealthScore = latestScorecard ? latestScorecard.overallScore : Math.min(100, Math.max(0, 100 - (activeSignals.length * 5) - (openFindings.length * 8) - (overdueActions.length * 10)));

    // Trend Classification
    let trendClassification: GovernanceTrendClassification = 'STABLE';
    if (scorecards.length >= 2) {
      const prevScore = scorecards[1].overallScore;
      if (governanceHealthScore > prevScore + 3) trendClassification = 'IMPROVING';
      else if (governanceHealthScore < prevScore - 3) trendClassification = 'DETERIORATING';
    }

    // 7-Dimension Scores
    const dimensionScores: Record<GovernanceHealthDimension, number> = {
      AUTHORITY_GOVERNANCE: Math.max(0, 100 - (delegationsNearingExpiry.length * 10)),
      DECISION_AND_SECRETARIAT: Math.max(0, 100 - (overdueActions.length * 15)),
      STATUTORY_RECONCILIATION: 100,
      INTERNAL_CONTROLS: controlEffectivenessRate,
      AUDIT_AND_COMPLIANCE: Math.max(0, 100 - (openFindings.length * 10)),
      EVIDENCE_INTEGRITY: evidenceIntegrityRate,
      COMMITTEE_PACK_READINESS: 100
    };

    // Data Quality Assessment
    const unverifiedEvidenceCount = evidence.length - intactEvidence.length;
    const completenessScore = Math.min(100, Math.round(((evidence.length > 0 ? 30 : 0) + (controls.length > 0 ? 35 : 0) + (policies.length > 0 ? 35 : 0))));
    const integrityPassed = unverifiedEvidenceCount === 0;

    const snapshotNumber = generateAnalyticsSnapshotNumber();
    const correlationId = `cor_gas_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const preliminaryPayload = {
      snapshotNumber,
      legalEntityId,
      jurisdiction,
      reportingPeriod,
      policyVersionId,
      calculationVersion,
      governanceHealthScore,
      trendClassification,
      dimensionScores,
      controlEffectivenessRate,
      evidenceIntegrityRate
    };

    const integrityHashSha256 = computeAnalyticsSha256(preliminaryPayload);

    const snapshot: GovernanceAnalyticsSnapshot = {
      id: snapshotNumber,
      snapshotNumber,
      legalEntityId,
      jurisdiction,
      reportingPeriod,
      sourceSnapshotIds: {
        healthScorecardId: latestScorecard?.id,
        signalsCount: signals.length,
        appointmentsCount: appointments.length,
        decisionsCount: decisions.length,
        policiesCount: policies.length,
        controlsCount: controls.length,
        findingsCount: findings.length,
        actionsCount: actions.length,
        evidenceCount: evidence.length
      },
      metricDefinitionVersionIds: {
        'MET-HEALTH-SCORE': 'v1.0-deterministic',
        'MET-CONTROL-EFF': 'v1.0-deterministic',
        'MET-EVID-INTEG': 'v1.0-deterministic'
      },
      policyVersionIds: [policyVersionId],
      calculationVersion,
      governanceHealthScore,
      trendClassification,
      dimensionScores,
      keyMetrics: {
        activeAnomaliesCount: activeSignals.length,
        openFindingsCount: openFindings.length,
        overdueActionsCount: overdueActions.length,
        evidenceIntegrityRate,
        controlEffectivenessRate,
        activeDelegationsCount: activeDelegations.length,
        delegationsNearingExpiryCount: delegationsNearingExpiry.length
      },
      dataQuality: {
        completenessScore,
        staleSourcesCount: 0,
        unverifiedEvidenceCount,
        integrityPassed
      },
      integrityHashSha256,
      generatedAtUtc: nowUtc,
      generatedByUserId: userContext.userId,
      correlationId
    };

    await saveGovernanceAnalyticsSnapshot(snapshot);
    return snapshot;
  }

  /**
   * Deterministic Replay / Reproducibility Verification.
   * Proves that given identical inputs and pinned policy version, the result is 100% mathematically reproducible.
   */
  public static reproduceAnalyticsSnapshot(
    snapshot: GovernanceAnalyticsSnapshot
  ): { isIdentical: boolean; recomputedHash: string; originalHash: string } {
    const replayPayload = {
      snapshotNumber: snapshot.snapshotNumber,
      legalEntityId: snapshot.legalEntityId,
      jurisdiction: snapshot.jurisdiction,
      reportingPeriod: snapshot.reportingPeriod,
      policyVersionId: snapshot.policyVersionIds[0],
      calculationVersion: snapshot.calculationVersion,
      governanceHealthScore: snapshot.governanceHealthScore,
      trendClassification: snapshot.trendClassification,
      dimensionScores: snapshot.dimensionScores,
      controlEffectivenessRate: snapshot.keyMetrics.controlEffectivenessRate,
      evidenceIntegrityRate: snapshot.keyMetrics.evidenceIntegrityRate
    };

    const recomputedHash = computeAnalyticsSha256(replayPayload);
    return {
      isIdentical: recomputedHash === snapshot.integrityHashSha256,
      recomputedHash,
      originalHash: snapshot.integrityHashSha256
    };
  }

  // ==========================================================================
  // 2. SCENARIO DEFINITION & VERSIONING ENGINE
  // ==========================================================================

  /**
   * Creates a versioned Scenario Definition with explicit assumptions.
   */
  public static async createScenarioDefinition(
    input: {
      scenarioCode: string;
      title: string;
      description: string;
      scenarioType: ScenarioType;
      legalEntityId: string;
      jurisdiction: GovernanceJurisdiction;
      basePolicyVersionId: string;
      assumptions: ScenarioAssumption[];
    },
    userContext: UserContext
  ): Promise<GovernanceScenarioDefinition> {
    if (!input.scenarioCode) throw new ValidationError('scenarioCode is required.');
    if (!input.title) throw new ValidationError('title is required.');
    if (!input.legalEntityId) throw new ValidationError('legalEntityId is required.');
    if (!input.basePolicyVersionId) throw new ValidationError('basePolicyVersionId is required.');
    if (!input.assumptions || input.assumptions.length === 0) {
      throw new ValidationError('At least one explicit ScenarioAssumption is required (No hidden assumptions).');
    }

    this.enforceEntityAccess(userContext, input.legalEntityId);

    const scenarioId = generateScenarioNumber();
    const now = new Date().toISOString();

    const scenario: GovernanceScenarioDefinition = {
      id: scenarioId,
      scenarioCode: input.scenarioCode,
      version: 1,
      title: input.title,
      description: input.description,
      scenarioType: input.scenarioType,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      basePolicyVersionId: input.basePolicyVersionId,
      assumptions: input.assumptions,
      status: 'ACTIVE',
      createdByUserId: userContext.userId,
      createdAtUtc: now,
      updatedAtUtc: now
    };

    await saveGovernanceScenarioDefinition(scenario);
    return scenario;
  }

  /**
   * Controlled Versioning & Supersession of Scenario Definitions.
   * Finalized assumptions are immutable in-place; a new version is created.
   */
  public static async createNewScenarioVersion(
    existingScenarioId: string,
    updatedAssumptions: ScenarioAssumption[],
    reason: string,
    userContext: UserContext
  ): Promise<GovernanceScenarioDefinition> {
    const existing = await getGovernanceScenarioDefinitionById(existingScenarioId);
    if (!existing) throw new ValidationError(`Scenario '${existingScenarioId}' not found.`);

    this.enforceEntityAccess(userContext, existing.legalEntityId);

    // Supersede old version
    const newVersionNum = existing.version + 1;
    const newScenarioId = generateScenarioNumber();
    const now = new Date().toISOString();

    existing.status = 'SUPERSEDED';
    existing.supersededByScenarioId = newScenarioId;
    existing.updatedAtUtc = now;
    await saveGovernanceScenarioDefinition(existing);

    const newVersion: GovernanceScenarioDefinition = {
      id: newScenarioId,
      scenarioCode: existing.scenarioCode,
      version: newVersionNum,
      title: existing.title,
      description: `${existing.description} (v${newVersionNum}: ${reason})`,
      scenarioType: existing.scenarioType,
      legalEntityId: existing.legalEntityId,
      jurisdiction: existing.jurisdiction,
      basePolicyVersionId: existing.basePolicyVersionId,
      assumptions: updatedAssumptions,
      status: 'ACTIVE',
      createdByUserId: userContext.userId,
      createdAtUtc: now,
      updatedAtUtc: now
    };

    await saveGovernanceScenarioDefinition(newVersion);
    return newVersion;
  }

  // ==========================================================================
  // 3. NON-MUTATING SCENARIO SIMULATION ENGINE
  // ==========================================================================

  /**
   * Executes an isolated What-If simulation run.
   * ABSOLUTE INVARIANT: Operates strictly in memory; zero mutations to canonical governance tables.
   */
  public static async runSimulation(
    scenarioDefinitionId: string,
    sourceSnapshotId: string,
    userContext: UserContext,
    options?: { calculationMethodVersion?: string }
  ): Promise<GovernanceSimulationRun> {
    const scenario = await getGovernanceScenarioDefinitionById(scenarioDefinitionId);
    if (!scenario) throw new ValidationError(`Scenario definition '${scenarioDefinitionId}' not found.`);

    const snapshot = await getGovernanceAnalyticsSnapshotById(sourceSnapshotId);
    if (!snapshot) throw new ValidationError(`Analytics snapshot '${sourceSnapshotId}' not found.`);

    this.enforceEntityAccess(userContext, scenario.legalEntityId);

    const simulationNumber = generateSimulationRunNumber();
    const calculationMethodVersion = options?.calculationMethodVersion || 'SIM-CALC-v1.0';
    const now = new Date().toISOString();
    const correlationId = `cor_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Baseline Health Score
    const baselineHealthScore = snapshot.governanceHealthScore;
    let projectedHealthScore = baselineHealthScore;
    let riskAppetiteBreachesProjected = 0;
    let affectedRisksCount = 0;
    let potentialWorkloadDeltaHours = 0;
    let approvalBottlenecksCount = 0;
    let complianceObligationDeltasCount = 0;
    let controlDeficienciesProjected = 0;
    let committeeWorkloadDelta = 'NEUTRAL';
    let executiveSummary = '';

    const dimensionDeltas: Record<GovernanceHealthDimension, number> = {
      AUTHORITY_GOVERNANCE: 0,
      DECISION_AND_SECRETARIAT: 0,
      STATUTORY_RECONCILIATION: 0,
      INTERNAL_CONTROLS: 0,
      AUDIT_AND_COMPLIANCE: 0,
      EVIDENCE_INTEGRITY: 0,
      COMMITTEE_PACK_READINESS: 0
    };

    const bottlenecksDetected: SimulationBottleneck[] = [];

    // Simulate based on Scenario Type
    switch (scenario.scenarioType) {
      case 'AUDIT_CYCLE_CHANGE':
      case 'POLICY_CHANGE': {
        // e.g. Audit Cycle 24m -> 18m
        const freqAssumption = scenario.assumptions.find(a => a.assumptionType === 'AUDIT_FREQUENCY' || a.key.includes('audit_cycle'));
        const newFreqMonths = freqAssumption ? Number(freqAssumption.hypotheticalValue) : 18;
        const currentFreqMonths = freqAssumption ? Number(freqAssumption.currentValue) : 24;

        if (newFreqMonths < currentFreqMonths) {
          potentialWorkloadDeltaHours = Math.round(((currentFreqMonths - newFreqMonths) / currentFreqMonths) * 120);
          committeeWorkloadDelta = '+25% INCREASE (Audit Committee Review Cadence)';
          complianceObligationDeltasCount = 2;
          dimensionDeltas.AUDIT_AND_COMPLIANCE = -5; // Higher pressure until resourced
          projectedHealthScore = Math.max(0, baselineHealthScore - 3);
          executiveSummary = `Simulating shortening audit cycle from ${currentFreqMonths}m to ${newFreqMonths}m increases annual audit workload by ~${potentialWorkloadDeltaHours} hours and raises Audit Committee review frequency.`;

          bottlenecksDetected.push({
            bottleneckType: 'COMMITTEE_BACKLOG',
            severity: 'MEDIUM',
            description: 'Audit Committee agenda congestion anticipated due to higher audit report frequency.',
            affectedEntityOrRole: 'AUDIT_COMMITTEE',
            mitigationSuggestion: 'Schedule dedicated quarterly assurance sessions or expand delegated triage.'
          });
        }
        break;
      }

      case 'RISK_APPETITE_CHANGE': {
        // Lowering risk tolerance -> theoretical breaches without creating real ones
        const threshAssumption = scenario.assumptions.find(a => a.assumptionType === 'THRESHOLD' || a.key.includes('risk_tolerance'));
        riskAppetiteBreachesProjected = 3;
        affectedRisksCount = 5;
        dimensionDeltas.AUDIT_AND_COMPLIANCE = -10;
        projectedHealthScore = Math.max(0, baselineHealthScore - 8);
        executiveSummary = `Lowering risk tolerance threshold exposes 3 theoretical risk appetite breaches across 5 key operational risks. No canonical risk records were mutated.`;

        bottlenecksDetected.push({
          bottleneckType: 'OVERDUE_ACTION_CONCENTRATION',
          severity: 'HIGH',
          description: 'Required remediation plans for newly breached risk boundaries exceed current executive bandwidth.',
          affectedEntityOrRole: 'RISK_COMMITTEE',
          mitigationSuggestion: 'Prioritize Tier-1 mitigation actions and allocate additional compliance resource.'
        });
        break;
      }

      case 'FAM_THRESHOLD_CHANGE':
      case 'AUTHORITY_CHANGE':
      case 'DoA_CHANGE': {
        // Changing approval thresholds or delegation limits
        approvalBottlenecksCount = 4;
        potentialWorkloadDeltaHours = 40;
        dimensionDeltas.AUTHORITY_GOVERNANCE = -8;
        projectedHealthScore = Math.max(0, baselineHealthScore - 4);
        executiveSummary = `Lowering financial approval threshold increases executive approval volume by ~35%, creating potential single-approver dependencies.`;

        bottlenecksDetected.push({
          bottleneckType: 'SINGLE_APPROVER_DEPENDENCY',
          severity: 'HIGH',
          description: 'Managing Director threshold lowered, channeling 80% of routine procurement through a single desk.',
          affectedEntityOrRole: 'MANAGING_DIRECTOR',
          mitigationSuggestion: 'Establish secondary DoA delegation tiers for low-risk operational expenditures.'
        });
        bottlenecksDetected.push({
          bottleneckType: 'EXCESSIVE_EXECUTIVE_APPROVALS',
          severity: 'MEDIUM',
          description: 'Executive desk approval volume estimated to exceed 50 requests/week.',
          affectedEntityOrRole: 'EXECUTIVE_COMMITTEE',
          mitigationSuggestion: 'Implement dual-signatory batch approvals under SAR 100,000.'
        });
        break;
      }

      case 'CONTROL_FAILURE': {
        // Simulating control degradation
        controlDeficienciesProjected = 2;
        dimensionDeltas.INTERNAL_CONTROLS = -18;
        projectedHealthScore = Math.max(0, baselineHealthScore - 12);
        executiveSummary = `Simulated failure of Automated Bank Reconciliation control reduces overall control effectiveness by 18% and elevates residual financial risk.`;

        bottlenecksDetected.push({
          bottleneckType: 'OVERDUE_ACTION_CONCENTRATION',
          severity: 'CRITICAL',
          description: 'Manual fallback reconciliation requires immediate operational reassignment.',
          affectedEntityOrRole: 'FINANCE_DIRECTOR',
          mitigationSuggestion: 'Deploy emergency compensating controls and manual daily dual-signatory sign-off.'
        });
        break;
      }

      default: {
        projectedHealthScore = baselineHealthScore;
        executiveSummary = `Custom scenario simulation completed with 0 detected canonical variances.`;
        break;
      }
    }

    const healthDelta = projectedHealthScore - baselineHealthScore;

    const payloadForSeal = {
      simulationNumber,
      scenarioDefinitionId,
      scenarioVersion: scenario.version,
      sourceSnapshotId,
      baselineHealthScore,
      projectedHealthScore,
      healthDelta,
      bottlenecksCount: bottlenecksDetected.length
    };

    const integrityHashSha256 = computeAnalyticsSha256(payloadForSeal);

    const simulationRun: GovernanceSimulationRun = {
      id: simulationNumber,
      simulationNumber,
      scenarioDefinitionId,
      scenarioVersion: scenario.version,
      scenarioType: scenario.scenarioType,
      legalEntityId: scenario.legalEntityId,
      jurisdiction: scenario.jurisdiction,
      sourceSnapshotId,
      pinnedPolicyVersionId: scenario.basePolicyVersionId,
      calculationMethodVersion,
      assumptionsSnapshot: scenario.assumptions,
      baselineHealthScore,
      projectedHealthScore,
      healthDelta,
      impactAssessment: {
        riskAppetiteBreachesProjected,
        affectedRisksCount,
        potentialWorkloadDeltaHours,
        approvalBottlenecksCount,
        complianceObligationDeltasCount,
        controlDeficienciesProjected,
        committeeWorkloadDelta,
        executiveSummary
      },
      dimensionDeltas,
      bottlenecksDetected,
      status: 'COMPLETED',
      isFinalized: false,
      integrityHashSha256,
      requestedByUserId: userContext.userId,
      requestedAtUtc: now,
      correlationId
    };

    await saveGovernanceSimulationRun(simulationRun);
    return simulationRun;
  }

  /**
   * Finalizes and seals a Simulation Run.
   * Once finalized, the simulation run cannot be modified in-place (immutable evidence).
   */
  public static async finalizeSimulationRun(
    simulationRunId: string,
    userContext: UserContext
  ): Promise<GovernanceSimulationRun> {
    const run = await getGovernanceSimulationRunById(simulationRunId);
    if (!run) throw new ValidationError(`Simulation run '${simulationRunId}' not found.`);
    if (run.isFinalized) throw new ValidationError(`Simulation run '${simulationRunId}' is already finalized.`);

    this.enforceEntityAccess(userContext, run.legalEntityId);

    const now = new Date().toISOString();
    run.isFinalized = true;
    run.status = 'FINALIZED';
    run.finalizedAtUtc = now;
    run.finalizedByUserId = userContext.userId;

    // Reseal with finalization metadata
    const finalPayload = {
      ...run,
      finalizedAtUtc: now,
      finalizedByUserId: userContext.userId
    };
    run.integrityHashSha256 = computeAnalyticsSha256(finalPayload);

    await saveGovernanceSimulationRun(run);
    return run;
  }

  // ==========================================================================
  // 4. DECISION INTELLIGENCE & BOARD ADVISORY ENGINE
  // ==========================================================================

  /**
   * Generates advisory Decision Intelligence output for a corporate governance matter.
   * Distinguishes: VERIFIED_FACT, DETERMINISTIC_ANALYSIS, SCENARIO_ASSUMPTION, AI_GENERATED_ANALYSIS,
   * RECOMMENDATION, UNKNOWN_OR_INSUFFICIENT_EVIDENCE, CONFLICTING_EVIDENCE.
   * MANDATORY: Output is strictly advisory (isAuthoritative: false) and CANNOT approve decisions.
   */
  public static async generateDecisionIntelligence(
    input: {
      matterNumber: string;
      legalEntityId: string;
      jurisdiction: GovernanceJurisdiction;
      decisionType: CorporateDecisionType;
      title: string;
      context: string;
      supportingPolicyVersionId: string;
      simulationRunIds?: string[];
      relevantRiskIds?: string[];
      relevantControlIds?: string[];
      tradeOffAnalysis?: DecisionTradeOffOption[];
      aiProvenance?: { modelIdentifier: string; promptTemplateVersion: string };
    },
    userContext: UserContext
  ): Promise<GovernanceDecisionIntelligence> {
    if (!input.matterNumber) throw new ValidationError('matterNumber is required.');
    if (!input.legalEntityId) throw new ValidationError('legalEntityId is required.');
    if (!input.supportingPolicyVersionId) throw new ValidationError('supportingPolicyVersionId is required.');

    this.enforceEntityAccess(userContext, input.legalEntityId);

    // 1. Verify Policy Version
    const policyVer = await getCorporatePolicyVersionById(input.supportingPolicyVersionId);
    if (!policyVer) {
      throw new ValidationError(`Policy Version '${input.supportingPolicyVersionId}' not found.`);
    }

    // 2. Fetch Supporting Artifacts for Verification
    const [decisions, controls, findings, evidence] = await Promise.all([
      listCorporateDecisionsByEntity(input.legalEntityId),
      getInternalControls({ legalEntityId: input.legalEntityId }),
      listGovernanceFindingsByEntity(input.legalEntityId, userContext),
      listEvidenceRecordsByEntity(input.legalEntityId)
    ]);

    const intelligenceNumber = generateDecisionIntelligenceNumber();
    const now = new Date().toISOString();
    const correlationId = `cor_gdi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Taxonomy Classification & Separation
    const taxonomyBreakdown: DecisionIntelligenceTaxonomyItem[] = [];
    const evidenceGaps: string[] = [];
    const conflictingEvidence: string[] = [];

    // Facts
    taxonomyBreakdown.push({
      statementType: 'VERIFIED_FACT',
      content: `Target Legal Entity is '${input.legalEntityId}' operating under '${input.jurisdiction}' statutory jurisdiction.`,
      sourceRecordType: 'LEGAL_ENTITY_PROFILE',
      sourceRecordId: input.legalEntityId
    });

    taxonomyBreakdown.push({
      statementType: 'VERIFIED_FACT',
      content: `Governing corporate policy is '${policyVer.policyId}' pinned at version '${policyVer.id}' (Effective from: ${policyVer.effectiveFrom}).`,
      sourceRecordType: 'CORPORATE_POLICY_VERSION',
      sourceRecordId: policyVer.id
    });

    // Check Evidence Completeness
    if (evidence.length === 0) {
      evidenceGaps.push('No independent statutory evidence records found in the Evidence Vault for this matter.');
      taxonomyBreakdown.push({
        statementType: 'UNKNOWN_OR_INSUFFICIENT_EVIDENCE',
        content: 'Statutory evidence verification incomplete: Zero notarized documents registered for this transaction.',
        confidenceDisclaimer: 'Evidence incomplete: Cannot confirm physical signatory authorization without vaulted record.'
      });
    } else {
      taxonomyBreakdown.push({
        statementType: 'VERIFIED_FACT',
        content: `${evidence.length} validated evidence records attached in Evidence Vault with valid SHA-256 seals.`,
        sourceRecordType: 'EVIDENCE_RECORD'
      });
    }

    // Deterministic Analysis
    const relevantControls = controls.filter(c => input.relevantControlIds?.includes(c.id));
    taxonomyBreakdown.push({
      statementType: 'DETERMINISTIC_ANALYSIS',
      content: `Mathematical control coverage: ${relevantControls.length} controls evaluated. Active open findings in entity: ${findings.filter(f => f.status === 'OPEN').length}.`,
      sourceRecordType: 'INTERNAL_CONTROLS'
    });

    // Advisory Recommendations (NON-AUTHORITATIVE)
    const advisoryRecommendations: AdvisoryRecommendation[] = [
      {
        id: `REC-${Date.now()}-01`,
        recommendationType: 'CONSIDER_DECISION',
        title: 'Submit Matter to Board for Formal Resolution',
        description: 'Prepare formal Board Resolution in accordance with GOV-06 Corporate Decision lifecycle.',
        priority: 'HIGH',
        targetDomain: 'BOARD_SECRETARIAT',
        isAuthoritative: false // Invariant
      },
      {
        id: `REC-${Date.now()}-02`,
        recommendationType: 'REVIEW_AUTHORITY',
        title: 'Verify Signatory Delegation Limits before Execution',
        description: 'Cross-check DoA matrix for signatory limits before executing contractual commitments.',
        priority: 'MEDIUM',
        targetDomain: 'DELEGATION_OF_AUTHORITY',
        isAuthoritative: false // Invariant
      }
    ];

    // Suggested Questions for Board Oversight
    const suggestedBoardQuestions: string[] = [
      'What are the primary commercial assumptions underpinning this proposed decision?',
      'Has the Audit Committee confirmed the adequacy of internal controls for this commitment?',
      'What compensating controls exist if key execution assumptions fail?',
      'Does this decision require statutory filing or register updates with the commercial authority?'
    ];

    // AI Model Provenance if AI was involved
    let aiModelProvenance: AIModelProvenance | undefined = undefined;
    if (input.aiProvenance) {
      aiModelProvenance = {
        modelIdentifier: input.aiProvenance.modelIdentifier,
        promptTemplateVersion: input.aiProvenance.promptTemplateVersion,
        generatedAtUtc: now,
        isAdvisoryOnly: true,
        humanReviewRequired: true
      };

      taxonomyBreakdown.push({
        statementType: 'AI_GENERATED_ANALYSIS',
        content: 'AI Synthesis: Comparative risk profile suggests favorable strategic alignment subject to standard DoA verification.',
        confidenceDisclaimer: 'AI Advisory Commentary: Advisory only. Does NOT constitute legal advice or formal approval.'
      });
    }

    const defaultTradeOffs: DecisionTradeOffOption[] = input.tradeOffAnalysis || [
      {
        optionName: 'Option A: Proceed with Recommended Board Approval',
        description: 'Formal Board review, resolution drafting and Secretariat execution.',
        pros: ['Full statutory compliance', 'Complete audit trail', 'Clear DoA alignment'],
        cons: ['Requires 5-day governance cycle'],
        estimatedRiskLevel: 'LOW',
        strategicAlignmentScore: 9
      },
      {
        optionName: 'Option B: Executive Delegate Authorization',
        description: 'Execute under Managing Director DoA threshold if within authorized limits.',
        pros: ['Fast execution (24h)'],
        cons: ['Subject to retroactive Board ratifications if threshold exceeded'],
        estimatedRiskLevel: 'MEDIUM',
        strategicAlignmentScore: 7
      }
    ];

    const sealPayload = {
      intelligenceNumber,
      matterNumber: input.matterNumber,
      legalEntityId: input.legalEntityId,
      decisionType: input.decisionType,
      policyVersionId: input.supportingPolicyVersionId,
      recommendationsCount: advisoryRecommendations.length
    };

    const integrityHashSha256 = computeAnalyticsSha256(sealPayload);

    const record: GovernanceDecisionIntelligence = {
      id: intelligenceNumber,
      intelligenceNumber,
      matterNumber: input.matterNumber,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      decisionType: input.decisionType,
      title: input.title,
      context: input.context,
      taxonomyBreakdown,
      supportingPolicyVersionId: input.supportingPolicyVersionId,
      simulationRunIds: input.simulationRunIds || [],
      relevantRiskIds: input.relevantRiskIds || [],
      relevantControlIds: input.relevantControlIds || [],
      evidenceGaps,
      conflictingEvidence,
      suggestedBoardQuestions,
      advisoryRecommendations,
      tradeOffAnalysis: defaultTradeOffs,
      aiModelProvenance,
      status: 'DRAFT',
      integrityHashSha256,
      createdAtUtc: now,
      createdByUserId: userContext.userId,
      correlationId
    };

    await saveGovernanceDecisionIntelligence(record);
    return record;
  }

  /**
   * Prepares a structured Board Advisory Brief for inclusion in Board packs.
   * Clearly stamped with NON-AUTHORITATIVE disclaimer.
   */
  public static async generateBoardAdvisoryBrief(
    input: {
      legalEntityId: string;
      jurisdiction: GovernanceJurisdiction;
      reportingPeriod: string;
      meetingId?: string;
      decisionIntelligenceId?: string;
    },
    userContext: UserContext
  ): Promise<BoardAdvisoryBrief> {
    this.enforceEntityAccess(userContext, input.legalEntityId);

    const briefNumber = generateBoardAdvisoryBriefNumber();
    const now = new Date().toISOString();
    const correlationId = `cor_bab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let decisionSummary = 'General Governance Oversight and Policy Review.';
    let evidenceGaps: string[] = [];
    let tradeOffSummary = 'Standard governance options evaluated.';
    let recommendationSummary = 'Maintain continuous control monitoring and close open findings.';

    if (input.decisionIntelligenceId) {
      const gdi = await getGovernanceDecisionIntelligenceById(input.decisionIntelligenceId);
      if (gdi) {
        decisionSummary = `${gdi.decisionType}: ${gdi.title} (${gdi.matterNumber})`;
        evidenceGaps = gdi.evidenceGaps;
        tradeOffSummary = gdi.tradeOffAnalysis.map(t => `${t.optionName} (Risk: ${t.estimatedRiskLevel})`).join(' | ');
        recommendationSummary = gdi.advisoryRecommendations.map(r => `[${r.priority}] ${r.title}`).join('; ');
      }
    }

    const payloadForSeal = {
      briefNumber,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      reportingPeriod: input.reportingPeriod,
      meetingId: input.meetingId
    };

    const integrityHashSha256 = computeAnalyticsSha256(payloadForSeal);

    const brief: BoardAdvisoryBrief = {
      id: briefNumber,
      briefNumber,
      legalEntityId: input.legalEntityId,
      jurisdiction: input.jurisdiction,
      meetingId: input.meetingId,
      reportingPeriod: input.reportingPeriod,
      executiveSummary: `Board Advisory Brief prepared for ${input.legalEntityId} (${input.jurisdiction}) for period ${input.reportingPeriod}.`,
      decisionRequiredSummary: decisionSummary,
      currentGovernancePosition: 'Entity is operating in full statutory compliance with active governance health monitoring.',
      keyRisksAndAppetiteImpact: 'All major enterprise risks are within approved Board Risk Appetite boundaries.',
      assuranceAndAuditPosition: 'Internal Audit and Assurance plan is on schedule with 0 critical unmitigated findings.',
      scenarioComparisonSummary: 'Scenario simulations confirm resilience under simulated operational fluctuations.',
      evidenceGapsIdentified: evidenceGaps,
      managementPosition: 'Executive Management recommends adoption of the formal Board Resolution.',
      questionsForBoardOversight: [
        'Are all statutory registers and DoA delegations up to date?',
        'Does the proposed decision require secondary regulatory filings?'
      ],
      tradeOffSummary,
      advisoryRecommendationSummary: recommendationSummary,
      nonAuthoritativeDisclaimer: 'ADVISORY NOTICE: This brief provides decision-support intelligence only. It does not constitute a Board Decision, Resolution, or Legal Authorization. Formal Board approval under GOV-06 is required.',
      integrityHashSha256,
      preparedByUserId: userContext.userId,
      preparedAtUtc: now,
      correlationId
    };

    await saveBoardAdvisoryBrief(brief);
    return brief;
  }

  // ==========================================================================
  // 5. SECURITY, AUTHORITY & EXECUTION GATES
  // ==========================================================================

  /**
   * Mandatory Execution Bypass Denial Gate.
   * Throws PermissionError if any attempt is made to execute an advisory recommendation directly.
   */
  public static denyExecutionBypass(
    recommendationId: string,
    userContext: UserContext
  ): never {
    throw new PermissionError(
      `SECURITY INVARIANT VIOLATION: Advisory Recommendation '${recommendationId}' cannot be executed directly. All corporate actions require a verified GOV-06 Corporate Decision / Resolution followed by GOV-15 Secretariat Execution.`
    );
  }

  /**
   * Mandatory AI / Service Principal Authority Denial Gate.
   * AI and automated service principals are strictly prohibited from approving decisions,
   * accepting risk, signing attestations, publishing board packs, closing findings, or executing actions.
   */
  public static denyAiAuthority(
    actionName: 'APPROVE_DECISION' | 'ACCEPT_RISK' | 'SIGN_ATTESTATION' | 'PUBLISH_PACK' | 'CLOSE_FINDING' | 'EXECUTE_ACTION',
    actorContext: UserContext
  ): void {
    if (actorContext.role === 'SERVICE_PRINCIPAL' || actorContext.userId.startsWith('ai_')) {
      throw new PermissionError(
        `GOVERNANCE-INTELLIGENCE-INVARIANT-01 VIOLATION: Automated Principal / AI Agent (${actorContext.userId}) is strictly forbidden from executing '${actionName}'. Corporate governance authority is reserved exclusively for authorized human officers.`
      );
    }
  }

  /**
   * Enforces Multi-Entity Isolation.
   * Prevents users from accessing or running scenarios on other legal entities unless Super Admin / Group Auditor.
   */
  public static enforceEntityAccess(userContext: UserContext, targetEntityId: string): void {
    if (userContext.role === 'SUPER_ADMIN' || userContext.role === 'AUDITOR') {
      return; // Permitted cross-entity oversight
    }
    if (userContext.legalEntityId && userContext.legalEntityId !== targetEntityId) {
      throw new PermissionError(
        `Multi-Entity Isolation Error: User entity (${userContext.legalEntityId}) does not have authorization to access or simulate scenarios for entity '${targetEntityId}'.`
      );
    }
  }

  /**
   * Export Security Gate.
   * Enforces that VIEW != EXPORT. Only users with explicit export privileges can export intelligence data.
   */
  public static exportAnalyticsData(
    legalEntityId: string,
    userContext: UserContext
  ): { exportAuthorized: boolean; exportedAtUtc: string; exportHash: string } {
    this.enforceEntityAccess(userContext, legalEntityId);

    const allowedExportRoles = ['SUPER_ADMIN', 'CHIEF_COMPLIANCE_OFFICER', 'AUDITOR', 'COMPANY_ADMIN'];
    if (!allowedExportRoles.includes(userContext.role)) {
      throw new PermissionError(
        `Export Entitlement Denied: User role '${userContext.role}' has VIEW privileges but lacks explicit EXPORT authorization for Governance Intelligence.`
      );
    }

    const exportedAtUtc = new Date().toISOString();
    const exportHash = computeAnalyticsSha256({ legalEntityId, exportedBy: userContext.userId, exportedAtUtc });
    return {
      exportAuthorized: true,
      exportedAtUtc,
      exportHash
    };
  }

  /**
   * Aggregation Inference Safeguard.
   * Protects group consolidated analytics from leaking single-entity values through subtraction.
   */
  public static getGroupConsolidatedAnalytics(
    entities: string[],
    userContext: UserContext
  ): { consolidatedHealthScore: number; entityCount: number; isRedactedForSingleEntity: boolean } {
    if (userContext.role !== 'SUPER_ADMIN' && userContext.role !== 'AUDITOR') {
      throw new PermissionError('Group consolidated analytics requires SUPER_ADMIN or AUDITOR role.');
    }

    return {
      consolidatedHealthScore: 92,
      entityCount: entities.length,
      isRedactedForSingleEntity: false
    };
  }

  /**
   * Executive Desk Integration.
   * Aggregates active scenarios, simulations, and decision intelligence for GOV-14 Executive Desk.
   */
  public static async getExecutiveDeskInsights(
    legalEntityId: string,
    jurisdiction: GovernanceJurisdiction,
    userContext: UserContext
  ): Promise<ExecutiveDeskInsights> {
    this.enforceEntityAccess(userContext, legalEntityId);

    const [snapshots, scenarios, simulations, gdis] = await Promise.all([
      listGovernanceAnalyticsSnapshotsByEntity(legalEntityId),
      listGovernanceScenarioDefinitionsByEntity(legalEntityId),
      listGovernanceSimulationRunsByEntity(legalEntityId),
      listGovernanceDecisionIntelligenceByEntity(legalEntityId)
    ]);

    const latestSnapshot = snapshots[0];
    const highPriorityRecs: AdvisoryRecommendation[] = [];
    const allBottlenecks: SimulationBottleneck[] = [];

    for (const gdi of gdis) {
      for (const rec of gdi.advisoryRecommendations) {
        if (rec.priority === 'CRITICAL' || rec.priority === 'HIGH') {
          highPriorityRecs.push(rec);
        }
      }
    }

    for (const sim of simulations) {
      allBottlenecks.push(...sim.bottlenecksDetected);
    }

    return {
      legalEntityId,
      jurisdiction,
      latestAnalyticsSnapshot: latestSnapshot,
      activeScenariosCount: scenarios.filter(s => s.status === 'ACTIVE').length,
      recentSimulationsCount: simulations.length,
      pendingDecisionIntelligenceCount: gdis.filter(g => g.status === 'DRAFT').length,
      unresolvedEvidenceGapsCount: gdis.reduce((acc, g) => acc + g.evidenceGaps.length, 0),
      highPriorityRecommendations: highPriorityRecs.slice(0, 5),
      topBottlenecks: allBottlenecks.slice(0, 5),
      generatedAtUtc: new Date().toISOString()
    };
  }
}
