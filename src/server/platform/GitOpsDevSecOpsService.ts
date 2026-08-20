import { DevSecOpsPipelineRun } from './types';

export class GitOpsDevSecOpsService {
  private static readonly PIPELINE_RUNS: DevSecOpsPipelineRun[] = [
    {
      pipelineId: 'PIPE-2026-8801',
      appName: 'aja-core-logistics-backend',
      gitCommitHash: 'a89c1f2b',
      branch: 'main',
      triggeredBy: 'GitOps (ArgoCD Auto-Sync)',
      status: 'SUCCESS',
      stages: [
        { stageName: 'Source Checkout & Lint', status: 'PASSED', durationSeconds: 12 },
        { stageName: 'SAST CodeQL & SonarQube', status: 'PASSED', durationSeconds: 45 },
        { stageName: 'Dependency Audit (Snyk & Trivy)', status: 'PASSED', durationSeconds: 28 },
        { stageName: 'OCI Image Build & Cosign Sign', status: 'PASSED', durationSeconds: 62 },
        { stageName: 'Container Vulnerability Scan', status: 'PASSED', durationSeconds: 30 },
        { stageName: 'Generate SBOM (CycloneDX)', status: 'PASSED', durationSeconds: 14 },
        { stageName: 'ArgoCD Production Progressive Rollout', status: 'PASSED', durationSeconds: 90 },
      ],
      sastVulnerabilitiesCount: 0,
      containerScanResult: 'CLEAN',
      sbomGenerated: true,
      startedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      pipelineId: 'PIPE-2026-8798',
      appName: 'aja-zatca-invoicing-service',
      gitCommitHash: '992f441e',
      branch: 'release/v4.2',
      triggeredBy: 'CISO-ReleaseApproval',
      status: 'SUCCESS',
      stages: [
        { stageName: 'Source Checkout & Lint', status: 'PASSED', durationSeconds: 10 },
        { stageName: 'SAST CodeQL', status: 'PASSED', durationSeconds: 40 },
        { stageName: 'mTLS Crypto Compliance Test', status: 'PASSED', durationSeconds: 25 },
        { stageName: 'Cosign Keyless Signature Verification', status: 'PASSED', durationSeconds: 18 },
        { stageName: 'ArgoCD Blue-Green Deploy to K8S-PROD-RUH-01', status: 'PASSED', durationSeconds: 80 },
      ],
      sastVulnerabilitiesCount: 0,
      containerScanResult: 'CLEAN',
      sbomGenerated: true,
      startedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ];

  public static getPipelineRuns(): DevSecOpsPipelineRun[] {
    return this.PIPELINE_RUNS;
  }

  public static triggerPipeline(appName: string, branch: string) {
    const newPipe: DevSecOpsPipelineRun = {
      pipelineId: `PIPE-2026-${Math.floor(8800 + Math.random() * 1000)}`,
      appName,
      gitCommitHash: Math.random().toString(16).substring(2, 10),
      branch,
      triggeredBy: 'Enterprise-DevSecOps-Console',
      status: 'SUCCESS',
      stages: [
        { stageName: 'Source Checkout & Lint', status: 'PASSED', durationSeconds: 11 },
        { stageName: 'SAST CodeQL & SonarQube', status: 'PASSED', durationSeconds: 38 },
        { stageName: 'Dependency Audit (Snyk)', status: 'PASSED', durationSeconds: 20 },
        { stageName: 'Cosign Signed OCI Push', status: 'PASSED', durationSeconds: 45 },
        { stageName: 'ArgoCD Sync to Riyadh Cluster', status: 'PASSED', durationSeconds: 60 },
      ],
      sastVulnerabilitiesCount: 0,
      containerScanResult: 'CLEAN',
      sbomGenerated: true,
      startedAt: new Date().toISOString(),
    };
    this.PIPELINE_RUNS.unshift(newPipe);
    return newPipe;
  }
}
