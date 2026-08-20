import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const startedAt = new Date().toISOString();
const evidencePath = path.join(repoRoot, 'docs', 'governance-e2e-workflow-results-2026-08-20.json');
const localDbPath = path.join(os.tmpdir(), `aja-governance-e2e-${process.pid}.json`);

const testFiles = [
  'src/tests/step38CorporateGovernanceCore.test.ts',
  'src/tests/step42CorporateRecordsEvidenceVault.test.ts',
  'src/tests/step43CorporateAuthorityDoAPoA.test.ts',
  'src/tests/step51RegulatoryIntelligenceService.test.ts',
  'src/tests/step52RegulatoryCaseManagement.test.ts',
  'src/tests/step53ComplianceCertification.test.ts'
];

const workflowCoverage = [
  'corporate-governance-appointments-approvals-audit',
  'records-evidence-vault-legal-hold-versioning-tamper-control',
  'authority-matrix-delegation-poa-cross-entity-isolation',
  'regulatory-intelligence-source-verification-impact-adoption',
  'regulatory-case-response-approval-submission-commitment-tracking',
  'compliance-certification-attestation-verification-filing-control'
];

const command = process.execPath;
const args = [path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs'), '--test', '--test-reporter=spec', ...testFiles];
const result = spawnSync(command, args, {
  cwd: repoRoot,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    FORCE_LOCAL_DATA_FALLBACK: 'true',
    SKIP_FIREBASE_SEED: 'true',
    LOCAL_DB_FILE: localDbPath,
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'governance-e2e-admin-placeholder',
    DEFAULT_STAFF_PASSWORD: process.env.DEFAULT_STAFF_PASSWORD || 'governance-e2e-staff-placeholder',
    DEFAULT_CUSTOMER_PASSWORD: process.env.DEFAULT_CUSTOMER_PASSWORD || 'governance-e2e-customer-placeholder'
  },
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 24
});

const completedAt = new Date().toISOString();
const stdout = result.stdout || '';
const stderr = result.stderr || '';
const output = `${stdout}\n${stderr}`;
const summaryMatch = output.match(/(?:#|ℹ)\s*tests\s+(\d+)[\s\S]*?(?:#|ℹ)\s*pass\s+(\d+)[\s\S]*?(?:#|ℹ)\s*fail\s+(\d+)/);

const evidence = {
  step: 'GOV-API-02',
  title: 'Governance end-to-end workflow, approval, audit trail and business rule verification',
  status: result.status === 0 ? 'PASS' : 'FAIL',
  startedAt,
  completedAt,
  command: `node node_modules/tsx/dist/cli.mjs --test --test-reporter=spec ${testFiles.join(' ')}`,
  environment: {
    NODE_ENV: 'test',
    FORCE_LOCAL_DATA_FALLBACK: 'true',
    SKIP_FIREBASE_SEED: 'true',
    LOCAL_DB_FILE: '<os-temp-file>',
    DEFAULT_ADMIN_PASSWORD: '<test-placeholder>',
    DEFAULT_STAFF_PASSWORD: '<test-placeholder>',
    DEFAULT_CUSTOMER_PASSWORD: '<test-placeholder>'
  },
  testFiles,
  workflowCoverage,
  businessRuleAttacks: [
    'self-approval-prohibited',
    'technical-admin-financial-approval-blocked',
    'cross-entity-approval-without-poa-blocked',
    'split-transaction-circumvention-flagged',
    'fake-regulatory-source-denied',
    'ai-agent-final-authority-denied',
    'tampered-or-expired-evidence-blocked',
    'tenant-isolation-and-export-permission-enforced'
  ],
  parsedSummary: summaryMatch
    ? {
        tests: Number(summaryMatch[1]),
        pass: Number(summaryMatch[2]),
        fail: Number(summaryMatch[3])
      }
    : null,
  exitCode: result.status,
  signal: result.signal,
  spawnError: result.error
    ? {
        name: result.error.name,
        message: result.error.message,
        code: result.error.code
      }
    : null,
  outputTail: output.split(/\r?\n/).slice(-80)
};

fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');

try {
  fs.rmSync(localDbPath, { force: true });
} catch {
  // Best-effort cleanup only; evidence intentionally redacts the temp path.
}

process.stdout.write(stdout);
process.stderr.write(stderr);
process.exit(result.status ?? 1);
