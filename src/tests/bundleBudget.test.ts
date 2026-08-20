import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

test('PRODUCTION BUILD ARTIFACT INTEGRITY & BUNDLE BUDGET GATE', async (t) => {
  const distPath = path.resolve(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');

  await t.test('GATE 01 — Required Production Deliverables Presence', () => {
    const requiredFiles = [
      'index.html',
      'manifest.webmanifest',
      'icon.svg',
      'sw.js',
      'server.cjs',
      'server.cjs.map',
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(distPath, file);
      assert(fs.existsSync(fullPath), `Required artifact missing: ${file}`);
      const stats = fs.statSync(fullPath);
      assert(stats.size > 0, `Artifact is empty: ${file}`);
    }
  });

  await t.test('GATE 02 — Client Sourcemap Exclusion Gate', () => {
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath);
      const leakedClientMaps = assetFiles.filter((f) => f.endsWith('.js.map') || f.endsWith('.css.map'));
      assert.strictEqual(
        leakedClientMaps.length,
        0,
        `Frontend client source maps must not be emitted to dist/assets: ${leakedClientMaps.join(', ')}`
      );
    }
  });

  await t.test('GATE 03 — Bundle Budget & Chunk Size Limits', () => {
    assert(fs.existsSync(assetsPath), 'dist/assets directory must exist');
    const assetFiles = fs.readdirSync(assetsPath);

    let totalJsRaw = 0;
    let totalJsGzip = 0;
    let mainEntrySize = 0;
    let mainEntryGzip = 0;

    for (const file of assetFiles) {
      if (file.endsWith('.js')) {
        const buffer = fs.readFileSync(path.join(assetsPath, file));
        const raw = buffer.length;
        const gzip = zlib.gzipSync(buffer).length;
        totalJsRaw += raw;
        totalJsGzip += gzip;

        if (file.startsWith('index-')) {
          mainEntrySize = raw;
          mainEntryGzip = gzip;
        }

        // No individual chunk should exceed 1.2MB raw
        assert(
          raw <= 1.2 * 1024 * 1024,
          `Chunk ${file} exceeds maximum raw chunk budget of 1.2MB (${(raw / 1024).toFixed(2)} KB)`
        );
      }
    }

    // Main entry chunk should be under 800 KB raw (< 180 KB gzip)
    assert(mainEntrySize > 0, 'Main entry chunk not found');
    assert(
      mainEntrySize < 800 * 1024,
      `Main entry chunk exceeds budget of 800KB: ${(mainEntrySize / 1024).toFixed(2)} KB`
    );
    assert(
      mainEntryGzip < 180 * 1024,
      `Main entry chunk exceeds gzip budget of 180KB: ${(mainEntryGzip / 1024).toFixed(2)} KB`
    );

    // Total JS budget < 12 MB
    assert(
      totalJsRaw < 12 * 1024 * 1024,
      `Total JS exceeds maximum budget of 12MB: ${(totalJsRaw / 1024 / 1024).toFixed(2)} MB`
    );
  });

  await t.test('GATE 04 — HTML Entrypoint & Static Resource Links', () => {
    const htmlContent = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
    assert(htmlContent.includes('<link rel="manifest" href="/manifest.webmanifest"'), 'HTML must link to /manifest.webmanifest');
    assert(htmlContent.includes('<link rel="icon" type="image/svg+xml" href="/icon.svg"'), 'HTML must link to /icon.svg');
    assert(htmlContent.includes('/assets/index-'), 'HTML must include hashed JS entry script');
    assert(htmlContent.includes('/assets/index-'), 'HTML must include hashed CSS link');
  });
});
