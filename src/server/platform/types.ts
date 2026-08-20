export interface K8sClusterInfo {
  clusterId: string;
  nameEn: string;
  nameAr: string;
  environment: 'PRODUCTION_RIYADH' | 'PRODUCTION_JEDDAH_DR' | 'STAGING' | 'TESTING';
  region: 'me-central1 (Riyadh)' | 'me-west1 (Jeddah DR)' | 'eu-west1 (Frankfurt Edge)';
  k8sVersion: string;
  nodeCount: number;
  totalCpuCores: number;
  totalMemoryGb: number;
  cpuUsagePct: number;
  memoryUsagePct: number;
  status: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE';
  activePodsCount: number;
  ingressTrafficMbPerSec: number;
}

export interface DevSecOpsPipelineRun {
  pipelineId: string;
  appName: string;
  gitCommitHash: string;
  branch: string;
  triggeredBy: string;
  status: 'SUCCESS' | 'IN_PROGRESS' | 'FAILED' | 'BLOCKED_SECURITY';
  stages: {
    stageName: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'RUNNING';
    durationSeconds: number;
  }[];
  sastVulnerabilitiesCount: number; // 0 critical
  containerScanResult: 'CLEAN' | 'NEEDS_PATCH';
  sbomGenerated: boolean;
  startedAt: string;
}

export interface SREMetricSLO {
  sloId: string;
  serviceName: string;
  sloNameAr: string;
  sloNameEn: string;
  targetAvailabilityPct: number; // e.g. 99.99%
  currentAvailabilityPct: number; // e.g. 99.992%
  errorBudgetRemainingPct: number; // e.g. 84.5%
  latencyP99Ms: number; // e.g. 42ms
  status: 'HEALTHY' | 'WARNING' | 'BREACHED';
}

export interface FinOpsCostReport {
  monthlyTotalBudgetUsd: number;
  currentSpendUsd: number;
  projectedEndMonthSpendUsd: number;
  costByService: {
    serviceName: string;
    costUsd: number;
    pctOfTotal: number;
  }[];
  optimizationOpportunitiesUsd: number;
  idleNodesCount: number;
}

export interface DisasterRecoveryStatus {
  drState: 'STANDBY_SYNC' | 'ACTIVE_FAILOVER' | 'FAILBACK_IN_PROGRESS';
  rpoSecondsCurrent: number; // Target < 1 sec
  rtoMinutesCurrent: number; // Target < 5 mins
  lastDrTestDate: string;
  lastTestStatus: 'PASSED_100_PERCENT';
  replicatedDatabasesCount: number;
}
