import { copyFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import jwt from 'jsonwebtoken';

const serverEntry = 'dist/server.cjs';
const localDbSeedPath = 'data/db.json';
const jwtSecret = process.env.JWT_SECRET || 'local-product-resource-smoke-secret-32chars';
let port = Number(process.env.SMOKE_PORT || 0);
let baseUrl = '';
let smokeDataDir = '';
let smokeDbPath = '';

if (!existsSync(serverEntry)) {
  console.error(`[product-resource-smoke] Missing ${serverEntry}. Run npm run build first.`);
  process.exit(1);
}

if (existsSync(localDbSeedPath)) {
  smokeDataDir = mkdtempSync(join(tmpdir(), 'aja-product-resource-smoke-'));
  smokeDbPath = join(smokeDataDir, 'db.json');
  copyFileSync(localDbSeedPath, smokeDbPath);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => {
        if (typeof address === 'object' && address?.port) {
          resolve(address.port);
          return;
        }
        reject(new Error('Unable to allocate a smoke-test port'));
      });
    });
  });
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForHealth() {
  const deadline = Date.now() + 15000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/api/health`, {}, 2000);
      if (response.ok) return;
      lastError = new Error(`health returned ${response.status}`);
    } catch (err) {
      lastError = err;
    }

    await delay(500);
  }

  throw lastError || new Error(`server did not become healthy at ${baseUrl}`);
}

function createSmokeToken() {
  return jwt.sign(
    {
      userId: 'usr_product_resource_smoke',
      email: 'admin@aja-logistics.com',
      role: 'ADMIN',
      fullName: 'Product Resource Smoke Test',
    },
    jwtSecret,
    { expiresIn: '5m' }
  );
}

async function requestJson(path, init = {}) {
  const token = createSmokeToken();
  const response = await fetchWithTimeout(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function expectValidationFailure(path, body, expectedField) {
  const token = createSmokeToken();

  const response = await fetchWithTimeout(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status !== 400) {
    throw new Error(`${path} expected 400, received ${response.status}: ${JSON.stringify(payload)}`);
  }

  const fields = Array.isArray(payload.errors) ? payload.errors.map(error => error.field) : [];
  if (!fields.includes(expectedField)) {
    throw new Error(`${path} expected validation field ${expectedField}, received ${JSON.stringify(payload)}`);
  }
}

async function expectUpdateValidationFailure(listPath, updatePath, body, expectedField) {
  const list = await requestJson(listPath);
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`${listPath} returned no records to smoke-test validation`);
  }

  const token = createSmokeToken();
  const response = await fetchWithTimeout(`${baseUrl}${updatePath}/${encodeURIComponent(list[0].id)}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status !== 400) {
    throw new Error(`${updatePath} expected 400, received ${response.status}: ${JSON.stringify(payload)}`);
  }

  const fields = Array.isArray(payload.errors) ? payload.errors.map(error => error.field) : [];
  if (!fields.includes(expectedField)) {
    throw new Error(`${updatePath} expected validation field ${expectedField}, received ${JSON.stringify(payload)}`);
  }
}

async function expectMutableResourceUpdate(listPath, updatePath, expectedField, updates) {
  const list = await requestJson(listPath);
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`${listPath} returned no records to smoke-test`);
  }

  const updated = await requestJson(`${updatePath}/${encodeURIComponent(list[0].id)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  if (updated[expectedField] !== updates[expectedField]) {
    throw new Error(`${updatePath} did not persist ${expectedField}: ${JSON.stringify(updated)}`);
  }
}

async function expectResourceCreate(path, expectedField, body) {
  const created = await requestJson(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!created?.id || created[expectedField] !== body[expectedField]) {
    throw new Error(`${path} did not create ${expectedField}: ${JSON.stringify(created)}`);
  }

  return created;
}

async function expectResourceDelete(path, id) {
  const result = await requestJson(`${path}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (result?.success !== true) {
    throw new Error(`${path} did not confirm delete for ${id}: ${JSON.stringify(result)}`);
  }
}

async function expectMutableResourceDelete(listPath, deletePath) {
  const list = await requestJson(listPath);
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`${listPath} returned no records to smoke-test delete`);
  }

  await expectResourceDelete(deletePath, list[0].id);
}

port = port || await getFreePort();
baseUrl = `http://127.0.0.1:${port}`;

const server = spawn(
  process.execPath,
  [serverEntry],
  {
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'production',
      SKIP_FIREBASE_SEED: 'true',
      FORCE_LOCAL_DATA_FALLBACK: 'true',
      ...(smokeDbPath ? { LOCAL_DB_FILE: smokeDbPath } : {}),
      JWT_SECRET: jwtSecret,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  }
);

let output = '';
let serverExit;
server.stdout.on('data', chunk => {
  output += chunk.toString();
});
server.stderr.on('data', chunk => {
  output += chunk.toString();
});
server.once('exit', (code, signal) => {
  serverExit = { code, signal };
});

try {
  await waitForHealth();

  await expectValidationFailure('/api/product-resources/services', {
    serviceCode: 'SRV-SMOKE-INVALID-RATE',
    category: 'AIR_FREIGHT',
    nameAr: 'خدمة اختبار غير صالحة',
    nameEn: 'Invalid Rate Smoke Test',
    descriptionAr: 'خدمة اختبار غير صالحة',
    descriptionEn: 'Invalid Rate Smoke Test',
    baseCurrency: 'SAR',
    defaultRate: -1,
    rateUnit: 'PER_KG',
    leadTimeHours: 24,
    status: 'ACTIVE',
  }, 'defaultRate');

  await expectValidationFailure('/api/product-resources/vehicles', {
    vehicleCode: 'TRK-SMOKE-INVALID-VIN',
    type: 'TRUCK',
    vin: '1M8GDM9A2KP09812Q',
    licensePlate: 'SMOKE-1',
    engineNumber: 'ENG-SMOKE',
    makeBrand: 'Volvo Trucks',
    model: 'FH16',
    modelYear: 2026,
    fuelType: 'DIESEL',
    maxPayloadKg: 25000,
    maxVolumeCbm: 75,
    maintenanceStatus: 'ACTIVE',
    odometerKm: 0,
    status: 'ACTIVE',
  }, 'vin');

  await expectUpdateValidationFailure(
    '/api/product-resources/uoms',
    '/api/product-resources/uoms',
    { conversionFactorToBase: -1 },
    'conversionFactorToBase'
  );

  await expectUpdateValidationFailure(
    '/api/product-resources/commodities',
    '/api/product-resources/commodities',
    { vatRatePercent: -1 },
    'vatRatePercent'
  );

  const createdUom = await expectResourceCreate('/api/product-resources/uoms', 'code', {
    code: 'SMK',
    nameAr: 'وحدة اختبار',
    nameEn: 'Smoke Unit',
    category: 'QUANTITY',
    isBaseUnit: false,
    conversionFactorToBase: 1,
    status: 'ACTIVE',
  });

  const createdCommodity = await expectResourceCreate('/api/product-resources/commodities', 'hsCode', {
    hsCode: '9999.99.99',
    hazmatClass: 'NONE',
    titleAr: 'سلعة اختبار',
    titleEn: 'Smoke Test Commodity',
    categoryName: 'Smoke Tests',
    importDutyRatePercent: 0,
    vatRatePercent: 15,
    isRestrictedImport: false,
    requiresSpecialPermit: false,
    status: 'ACTIVE',
  });

  await expectMutableResourceUpdate(
    '/api/product-resources/equipment',
    '/api/product-resources/equipment',
    'operationalStatus',
    { status: 'INACTIVE', operationalStatus: 'DECOMMISSIONED' }
  );

  await expectMutableResourceUpdate(
    '/api/product-resources/drivers',
    '/api/product-resources/drivers',
    'availabilityStatus',
    { status: 'INACTIVE', availabilityStatus: 'OFF_DUTY' }
  );

  await expectMutableResourceUpdate(
    '/api/product-resources/assets',
    '/api/product-resources/assets',
    'status',
    { status: 'INACTIVE' }
  );

  await expectMutableResourceUpdate(
    '/api/product-resources/digital-assets',
    '/api/product-resources/digital-assets',
    'uploadedBy',
    { uploadedBy: 'Product Resource Smoke Test' }
  );

  await expectMutableResourceUpdate(
    '/api/product-resources/uoms',
    '/api/product-resources/uoms',
    'status',
    { status: 'INACTIVE' }
  );

  await expectMutableResourceUpdate(
    '/api/product-resources/commodities',
    '/api/product-resources/commodities',
    'status',
    { status: 'INACTIVE' }
  );

  await expectResourceDelete('/api/product-resources/uoms', createdUom.id);
  await expectResourceDelete('/api/product-resources/commodities', createdCommodity.id);

  await expectMutableResourceDelete('/api/product-resources/equipment', '/api/product-resources/equipment');
  await expectMutableResourceDelete('/api/product-resources/drivers', '/api/product-resources/drivers');
  await expectMutableResourceDelete('/api/product-resources/assets', '/api/product-resources/assets');
  await expectMutableResourceDelete('/api/product-resources/digital-assets', '/api/product-resources/digital-assets');

  console.log('[product-resource-smoke] Product resource API validation smoke passed.');
} catch (err) {
  console.error('[product-resource-smoke] Failed:', err instanceof Error ? err.message : err);
  if (serverExit) {
    console.error(`[product-resource-smoke] Server exited early: ${JSON.stringify(serverExit)}`);
  }
  if (output.trim()) {
    console.error('[product-resource-smoke] Server output:');
    console.error(output.trim());
  }
  process.exitCode = 1;
} finally {
  await new Promise(resolve => {
    server.once('exit', resolve);
    server.kill('SIGTERM');
    setTimeout(() => {
      if (!server.killed) server.kill('SIGKILL');
      resolve();
    }, 1000).unref();
  });

  if (smokeDataDir) {
    rmSync(smokeDataDir, { recursive: true, force: true });
  }
}
