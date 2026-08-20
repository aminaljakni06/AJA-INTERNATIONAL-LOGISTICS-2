import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import cp from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

test('STEP 35.1A — PRODUCTION ARTIFACT RUNTIME VERIFICATION SUITE', async (t) => {
  const distPath = path.resolve(process.cwd(), 'dist');
  const serverPath = path.join(distPath, 'server.cjs');

  assert(fs.existsSync(serverPath), 'dist/server.cjs must exist before running runtime tests');

  // Spawn production server on a dedicated isolated test port
  const TEST_PORT = 3396;
  let serverProcess: cp.ChildProcess | null = null;

  await t.test('BOOT — Spawn Production Server (node dist/server.cjs)', async () => {
    return new Promise<void>((resolve, reject) => {
      serverProcess = cp.spawn('node', [serverPath], {
        env: {
          ...process.env,
          PORT: String(TEST_PORT),
          NODE_ENV: 'production',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let startupLogs = '';
      let isResolved = false;

      let pollInterval: NodeJS.Timeout | null = null;
      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (pollInterval) clearInterval(pollInterval);
      };

      const timer = setTimeout(() => {
        if (!isResolved) {
          cleanup();
          reject(new Error(`Server failed to boot within 15 seconds. Logs: ${startupLogs}`));
        }
      }, 15000);

      serverProcess.stdout?.on('data', (chunk) => {
        startupLogs += chunk.toString();
        if (startupLogs.includes('running') || startupLogs.includes(String(TEST_PORT)) || startupLogs.includes('Port')) {
          if (!isResolved) {
            isResolved = true;
            cleanup();
            resolve();
          }
        }
      });

      serverProcess.stderr?.on('data', (chunk) => {
        startupLogs += chunk.toString();
      });

      serverProcess.on('error', (err) => {
        if (!isResolved) {
          cleanup();
          reject(err);
        }
      });

      // Poll port
      pollInterval = setInterval(() => {
        const req = http.get(`http://127.0.0.1:${TEST_PORT}/api/health`, (res) => {
          if (!isResolved) {
            isResolved = true;
            cleanup();
            resolve();
          }
        });
        req.on('error', () => {});
      }, 300);
    });
  });

  const fetchHttp = (reqPath: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> => {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${TEST_PORT}${reqPath}`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk.toString()));
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body }));
      });
      req.on('error', reject);
    });
  };

  await t.test('RT-01 & RT-02 — Health Endpoint Verification', async () => {
    const res = await fetchHttp('/api/health');
    assert.strictEqual(res.status, 200, `Health endpoint should return 200, got ${res.status}`);
    assert(res.body.includes('ok') || res.body.includes('status'), `Health body unexpected: ${res.body}`);
  });

  await t.test('RT-03 — Root Application Response & HTML Entry', async () => {
    const res = await fetchHttp('/');
    assert.strictEqual(res.status, 200, `Root endpoint should return 200, got ${res.status}`);
    assert(res.body.includes('<!doctype html>') || res.body.includes('<!DOCTYPE html>'), 'Root must return HTML doctype');
    assert(res.body.includes('/assets/index-'), 'Root HTML must reference hashed JS asset');
    assert(res.body.includes('/assets/index-'), 'Root HTML must reference hashed CSS asset');
  });

  await t.test('RT-04 & RT-05 — Static Asset Integrity (Main JS & CSS)', async () => {
    const rootRes = await fetchHttp('/');
    const jsMatch = rootRes.body.match(/src="(\/assets\/index-[^"]+\.js)"/);
    assert(jsMatch && jsMatch[1], 'Main JS asset tag not found in root HTML');

    const cssMatch = rootRes.body.match(/href="(\/assets\/index-[^"]+\.css)"/);
    assert(cssMatch && cssMatch[1], 'Main CSS asset link not found in root HTML');

    const jsRes = await fetchHttp(jsMatch[1]);
    assert.strictEqual(jsRes.status, 200, `Main JS asset failed: ${jsRes.status}`);
    assert(jsRes.body.length > 10000, `Main JS body too small: ${jsRes.body.length} bytes`);

    const cssRes = await fetchHttp(cssMatch[1]);
    assert.strictEqual(cssRes.status, 200, `Main CSS asset failed: ${cssRes.status}`);
    assert(cssRes.body.length > 1000, `Main CSS body too small: ${cssRes.body.length} bytes`);
  });

  await t.test('RT-06 — SPA Route Fallback & Direct Navigation', async () => {
    const routes = ['/login', '/tracking', '/admin/dashboard', '/services', '/contact'];
    for (const r of routes) {
      const res = await fetchHttp(r);
      assert.strictEqual(res.status, 200, `Route ${r} failed with status ${res.status}`);
      assert(res.body.includes('id="root"'), `Route ${r} did not return SPA HTML`);
    }
  });

  await t.test('RT-07 — Dynamic Lazy Chunk Resolution', async () => {
    const assetsDir = path.join(distPath, 'assets');
    const assetFiles = fs.readdirSync(assetsDir);
    const vendorChunks = assetFiles.filter((f) => f.startsWith('vendor-') && f.endsWith('.js'));

    assert(vendorChunks.length >= 8, `Expected at least 8 vendor chunks, found ${vendorChunks.length}`);

    // Request first 5 vendor chunks over HTTP
    for (const chunk of vendorChunks.slice(0, 5)) {
      const res = await fetchHttp(`/assets/${chunk}`);
      assert.strictEqual(res.status, 200, `Vendor chunk /assets/${chunk} failed with ${res.status}`);
      assert(res.body.length > 100, `Chunk /assets/${chunk} body is empty`);
    }
  });

  await t.test('RT-09 — PWA Manifest Verification', async () => {
    const res = await fetchHttp('/manifest.webmanifest');
    assert.strictEqual(res.status, 200, `Manifest failed: ${res.status}`);
    const manifest = JSON.parse(res.body);
    assert(manifest.name, 'Manifest missing name');
    assert(manifest.start_url, 'Manifest missing start_url');
    assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'Manifest missing icons');
  });

  await t.test('RT-10 — Service Worker Verification', async () => {
    const res = await fetchHttp('/sw.js');
    assert.strictEqual(res.status, 200, `Service worker failed: ${res.status}`);
    assert(res.body.includes('self.addEventListener'), 'sw.js missing service worker lifecycle handlers');
    assert(res.body.includes('/manifest.webmanifest'), 'sw.js must cache /manifest.webmanifest');
    assert(res.body.includes('/icon.svg'), 'sw.js must cache /icon.svg');
  });

  await t.test('RT-11 & RT-12 — Sensitive Backend Artifact Protection Gate', async () => {
    const blockedPaths = [
      '/server.cjs',
      '/server.cjs.map',
      '/dist/server.cjs',
      '/dist/server.cjs.map',
      '/.env',
      '/package.json',
    ];

    for (const p of blockedPaths) {
      const res = await fetchHttp(p);
      assert(
        res.status === 404 || res.status === 403,
        `Sensitive path ${p} was NOT blocked! Status: ${res.status}`
      );
    }
  });

  await t.test('TEARDOWN — Stop Production Server', () => {
    if (serverProcess) {
      serverProcess.stdout?.destroy();
      serverProcess.stderr?.destroy();
      serverProcess.kill('SIGTERM');
      serverProcess.unref();
    }
  });
});
