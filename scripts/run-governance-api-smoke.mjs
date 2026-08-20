import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import jwt from 'jsonwebtoken';

const root = process.cwd();
const jwtSecret = 'dev-only-governance-api-smoke-jwt-secret-2026';
const resultPath = path.join(root, 'docs', 'governance-api-smoke-results-2026-08-20.json');
let port = Number(process.env.GOV_API_SMOKE_PORT || 0);
let baseUrl = '';

const adminToken = jwt.sign(
  {
    userId: 'usr_gov_smoke_admin',
    id: 'usr_gov_smoke_admin',
    email: 'governance.admin@aja-logistics.local',
    role: 'ADMIN',
    fullName: 'Governance Smoke Admin',
    legalEntityId: 'le-smoke-a',
    companyId: 'le-smoke-a',
    permissions: [
      'governance:compliance:view',
      'governance:compliance:manage',
      'governance:case:manage',
      'governance:record:create',
      'governance:record:view',
      'governance:export:authorized',
      'governance:legal:privileged',
    ],
    customPermissions: ['*'],
  },
  jwtSecret,
  { expiresIn: '1h' }
);

const lowPrivilegeToken = jwt.sign(
  {
    userId: 'usr_gov_smoke_customer',
    id: 'usr_gov_smoke_customer',
    email: 'customer@aja-logistics.local',
    role: 'CUSTOMER',
    fullName: 'Low Privilege Customer',
    legalEntityId: 'le-smoke-b',
    companyId: 'le-smoke-b',
    permissions: [],
    customPermissions: [],
  },
  jwtSecret,
  { expiresIn: '1h' }
);

const endpoints = [
  ['GET', '/api/corporate-governance/profiles/le-smoke-a'],
  ['PUT', '/api/corporate-governance/profiles/le-smoke-a', {}],
  ['GET', '/api/corporate-governance/appointments?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/appointments', {}],
  ['POST', '/api/corporate-governance/appointments/nonexistent/transition', {}],
  ['GET', '/api/corporate-governance/psc?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/psc', {}],
  ['DELETE', '/api/corporate-governance/appointment/nonexistent'],
  ['GET', '/api/corporate-governance/analytics/snapshots?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/analytics/snapshots', {}],
  ['GET', '/api/corporate-governance/scenarios?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/scenarios', {}],
  ['POST', '/api/corporate-governance/scenarios/nonexistent/supersede', {}],
  ['GET', '/api/corporate-governance/simulations?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/simulations', {}],
  ['POST', '/api/corporate-governance/simulations/nonexistent/finalize', {}],
  ['GET', '/api/corporate-governance/decision-intelligence?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/decision-intelligence', {}],
  ['GET', '/api/corporate-governance/board-advisory-briefs?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/board-advisory-briefs', {}],
  ['GET', '/api/corporate-governance/executive-insights?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-governance/analytics/export', {}],

  ['GET', '/api/corporate-records?legalEntityId=le-smoke-a'],
  ['POST', '/api/corporate-records', {}],
  ['GET', '/api/corporate-records/nonexistent'],
  ['POST', '/api/corporate-records/nonexistent/supersede', {}],
  ['POST', '/api/corporate-records/nonexistent/invalidate', {}],
  ['DELETE', '/api/corporate-records/nonexistent'],
  ['GET', '/api/corporate-records/nonexistent/disposition-check'],
  ['POST', '/api/corporate-records/evidence/submit', {}],
  ['POST', '/api/corporate-records/evidence/nonexistent/verify', {}],
  ['POST', '/api/corporate-records/evidence/nonexistent/invalidate', {}],
  ['GET', '/api/corporate-records/evidence/nonexistent/download'],
  ['GET', '/api/corporate-records/registers/le-smoke-a/DIRECTORS'],
  ['POST', '/api/corporate-records/registers/le-smoke-a/DIRECTORS/snapshot', {}],
  ['POST', '/api/corporate-records/legal-holds', {}],
  ['POST', '/api/corporate-records/legal-holds/nonexistent/release', {}],

  ['GET', '/api/governance/regulatory/sources'],
  ['POST', '/api/governance/regulatory/sources', {}],
  ['POST', '/api/governance/regulatory/sources/verify', {}],
  ['GET', '/api/governance/regulatory/changes?legalEntityId=le-smoke-a'],
  ['POST', '/api/governance/regulatory/changes', {}],
  ['POST', '/api/governance/regulatory/applicability', {}],
  ['POST', '/api/governance/regulatory/impact-assessment', {}],
  ['POST', '/api/governance/regulatory/impact-assessment/review', {}],
  ['POST', '/api/governance/regulatory/adoption-plans', {}],
  ['POST', '/api/governance/regulatory/adoption-plans/route-approval', {}],
  ['POST', '/api/governance/regulatory/adoption-plans/execute', {}],
  ['POST', '/api/governance/regulatory/adoption-plans/verify', {}],
  ['GET', '/api/governance/regulatory/reconcile?changeId=missing&legalEntityId=le-smoke-a'],
  ['GET', '/api/governance/regulatory/replay?asOfDate=2026-08-20&legalEntityId=le-smoke-a&jurisdiction=SA'],

  ['GET', '/api/governance/regulatory-cases?legalEntityId=le-smoke-a'],
  ['POST', '/api/governance/regulatory-cases', {}],
  ['GET', '/api/governance/regulatory-cases/nonexistent'],
  ['POST', '/api/governance/regulatory-cases/nonexistent/response-plan', {}],
  ['POST', '/api/governance/regulatory-cases/nonexistent/submissions/draft', {}],
  ['POST', '/api/governance/regulatory-cases/nonexistent/submissions/nonexistent/approve', {}],
  ['POST', '/api/governance/regulatory-cases/nonexistent/submissions/nonexistent/execute', {}],
  ['POST', '/api/governance/regulatory-cases/nonexistent/feedback', {}],
  ['POST', '/api/governance/regulatory-cases/nonexistent/commitments', {}],
  ['POST', '/api/governance/regulatory-cases/nonexistent/commitments/nonexistent/verify', {}],
  ['POST', '/api/governance/regulatory-cases/nonexistent/close', {}],
  ['GET', '/api/governance/regulatory-cases/nonexistent/reconcile'],
  ['GET', '/api/governance/regulatory-cases/nonexistent/replay'],
  ['GET', '/api/governance/regulatory-cases/nonexistent/export'],

  ['POST', '/api/governance/compliance-certifications/evaluate-readiness', {}],
  ['POST', '/api/governance/compliance-certifications/draft', {}],
  ['POST', '/api/governance/compliance-certifications/attest-control', {}],
  ['POST', '/api/governance/compliance-certifications/certify', {}],
  ['POST', '/api/governance/compliance-certifications/independently-verify', {}],
  ['POST', '/api/governance/compliance-certifications/close', {}],
  ['POST', '/api/governance/compliance-certifications/reopen', {}],
  ['POST', '/api/governance/compliance-certifications/supersede', {}],
  ['GET', '/api/governance/compliance-certifications/entity/le-smoke-a'],
  ['GET', '/api/governance/compliance-certifications/nonexistent'],
  ['POST', '/api/governance/compliance-certifications/nonexistent/replay', {}],
  ['POST', '/api/governance/compliance-certifications/nonexistent/export', {}],

  ['GET', '/api/governance/authority/policies?legalEntityId=le-smoke-a'],
  ['GET', '/api/governance/authority/policies/nonexistent'],
  ['POST', '/api/governance/authority/policies', {}],
  ['POST', '/api/governance/authority/policies/nonexistent/versions', {}],
  ['POST', '/api/governance/authority/policies/versions/nonexistent/publish', {}],
  ['GET', '/api/governance/authority/controls?legalEntityId=le-smoke-a'],
  ['POST', '/api/governance/authority/controls', {}],
  ['POST', '/api/governance/authority/controls/nonexistent/test', {}],
  ['GET', '/api/governance/authority/delegations?legalEntityId=le-smoke-a'],
  ['POST', '/api/governance/authority/delegations', {}],
  ['POST', '/api/governance/authority/delegations/nonexistent/revoke', {}],
  ['GET', '/api/governance/authority/rules?legalEntityId=le-smoke-a'],
  ['POST', '/api/governance/authority/rules', {}],
  ['POST', '/api/governance/authority/evaluate', {}],
  ['GET', '/api/governance/authority/poa?legalEntityId=le-smoke-a'],
  ['POST', '/api/governance/authority/poa', {}],
  ['POST', '/api/governance/authority/poa/nonexistent/revoke', {}],
  ['DELETE', '/api/governance/authority/policy/nonexistent'],
];

const positiveGetSmoke = [
  ['Corporate Governance API', 'GET', '/api/corporate-governance/appointments?legalEntityId=le-smoke-a'],
  ['Corporate Records API', 'GET', '/api/corporate-records?legalEntityId=le-smoke-a'],
  ['Regulatory API', 'GET', '/api/governance/regulatory/changes?legalEntityId=le-smoke-a'],
  ['Regulatory Cases API', 'GET', '/api/governance/regulatory-cases?legalEntityId=le-smoke-a'],
  ['Compliance Certifications API', 'GET', '/api/governance/compliance-certifications/entity/le-smoke-a'],
  ['Governance Authority API', 'GET', '/api/governance/authority/policies?legalEntityId=le-smoke-a'],
];

const lowerPrivilegeProbes = [
  ['Corporate Governance API', 'GET', '/api/corporate-governance/appointments?legalEntityId=le-smoke-a'],
  ['Corporate Records API', 'GET', '/api/corporate-records?legalEntityId=le-smoke-a'],
  ['Regulatory API', 'GET', '/api/governance/regulatory/changes?legalEntityId=le-smoke-a'],
  ['Regulatory Cases API', 'GET', '/api/governance/regulatory-cases?legalEntityId=le-smoke-a'],
  ['Compliance Certifications API', 'GET', '/api/governance/compliance-certifications/entity/le-smoke-a'],
  ['Governance Authority API', 'GET', '/api/governance/authority/policies?legalEntityId=le-smoke-a'],
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortAvailable(candidatePort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(candidatePort, '0.0.0.0');
  });
}

async function resolveSmokePort() {
  if (port > 0) {
    if (!(await isPortAvailable(port))) {
      throw new Error(`Configured GOV_API_SMOKE_PORT ${port} is already in use.`);
    }
    return port;
  }

  for (let candidate = 3197; candidate < 3297; candidate += 1) {
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error('No available governance API smoke port found in range 3197-3296.');
}

async function request(method, route, token, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.GOV_API_SMOKE_REQUEST_TIMEOUT_MS || 8000));
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    'x-correlation-id': 'gov-api-smoke',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${baseUrl}${route}`, {
      method,
      headers,
      signal: controller.signal,
      body: body === undefined || method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = { raw: text.slice(0, 500) };
    }
    return { status: res.status, json };
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { status: 598, json: { error: `Request timed out after ${process.env.GOV_API_SMOKE_REQUEST_TIMEOUT_MS || 8000}ms` } };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForServer(child) {
  for (let i = 0; i < 60; i += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited before becoming healthy with code ${child.exitCode}`);
    }
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return;
    } catch {}
    await sleep(500);
  }
  throw new Error('Server did not become healthy within 30 seconds');
}

function hasSensitiveLeak(body) {
  const serialized = JSON.stringify(body || {});
  return /(FIREBASE_SERVICE_ACCOUNT_JSON|GOOGLE_APPLICATION_CREDENTIALS|BEGIN PRIVATE KEY|private_key|JWT_SECRET|node_modules|firebase-admin\/app)/i.test(serialized);
}

async function main() {
  if (!fs.existsSync(path.join(root, 'dist', 'server.cjs'))) {
    throw new Error('dist/server.cjs not found. Run npm run build before smoke:governance-api.');
  }

  port = await resolveSmokePort();
  baseUrl = `http://127.0.0.1:${port}`;

  const command = process.execPath;
  const args = [path.join(root, 'dist', 'server.cjs')];

  const child = spawn(command, args, {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      JWT_SECRET: jwtSecret,
      SKIP_FIREBASE_SEED: 'true',
      FORCE_LOCAL_DATA_FALLBACK: 'true',
      FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'aja-logistics-smoke',
      FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || '(default)',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  child.stderr.on('data', (chunk) => logs.push(chunk.toString()));

  const results = [];
  let failed = false;

  try {
    await waitForServer(child);

    for (const [method, route, body] of endpoints) {
      const res = await request(method, route, null, body);
      const pass = res.status === 401;
      results.push({ group: 'unauthenticated', method, route, expected: 401, actual: res.status, pass, leaked: hasSensitiveLeak(res.json) });
      if (!pass || hasSensitiveLeak(res.json)) failed = true;

      const invalid = await request(method, route, 'not-a-valid-token', body);
      const invalidPass = invalid.status === 401;
      results.push({ group: 'invalid-token', method, route, expected: 401, actual: invalid.status, pass: invalidPass, leaked: hasSensitiveLeak(invalid.json) });
      if (!invalidPass || hasSensitiveLeak(invalid.json)) failed = true;
    }

    for (const [resource, method, route] of positiveGetSmoke) {
      const res = await request(method, route, adminToken);
      const pass = res.status >= 200 && res.status < 300;
      results.push({ group: 'positive-get-smoke', resource, method, route, expected: '2xx', actual: res.status, pass, leaked: hasSensitiveLeak(res.json) });
      if (!pass || hasSensitiveLeak(res.json)) failed = true;
    }

    for (const [resource, method, route] of lowerPrivilegeProbes) {
      const res = await request(method, route, lowPrivilegeToken);
      const pass = res.status === 403;
      results.push({ group: 'authorization-lower-privilege', resource, method, route, expected: 403, actual: res.status, pass, leaked: hasSensitiveLeak(res.json) });
      if (!pass || hasSensitiveLeak(res.json)) failed = true;
    }

    const validationProbes = [
      ['Corporate Governance API', 'POST', '/api/corporate-governance/appointments', {}],
      ['Corporate Records API', 'POST', '/api/corporate-records', {}],
      ['Regulatory API', 'POST', '/api/governance/regulatory/changes', {}],
      ['Regulatory Cases API', 'POST', '/api/governance/regulatory-cases', {}],
      ['Compliance Certifications API', 'POST', '/api/governance/compliance-certifications/draft', {}],
      ['Governance Authority API', 'POST', '/api/governance/authority/policies', {}],
    ];
    for (const [resource, method, route, body] of validationProbes) {
      const res = await request(method, route, adminToken, body);
      const pass = res.status >= 400 && res.status < 500;
      results.push({ group: 'validation-empty-payload', resource, method, route, expected: '4xx', actual: res.status, pass, leaked: hasSensitiveLeak(res.json) });
      if (!pass || hasSensitiveLeak(res.json)) failed = true;
    }
  } finally {
    child.kill('SIGTERM');
    await sleep(500);
    if (child.exitCode === null) child.kill('SIGKILL');
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    totals: {
      checks: results.length,
      passed: results.filter((r) => r.pass && !r.leaked).length,
      failed: results.filter((r) => !r.pass || r.leaked).length,
    },
    failed,
    results,
    serverLogTail: logs.join('').split(/\r?\n/).slice(-80),
  };

  fs.writeFileSync(resultPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`[governance-api-smoke] results written to ${resultPath}`);
  console.log(`[governance-api-smoke] ${summary.totals.passed}/${summary.totals.checks} checks passed`);
  if (failed) {
    const failedRows = results.filter((r) => !r.pass || r.leaked).slice(0, 20);
    console.error(JSON.stringify(failedRows, null, 2));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[governance-api-smoke] failed:', err);
  process.exit(1);
});
