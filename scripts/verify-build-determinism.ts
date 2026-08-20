import cp from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function hashDirectory(dir: string): Record<string, { size: number; sha256: string }> {
  const result: Record<string, { size: number; sha256: string }> = {};
  if (!fs.existsSync(dir)) return result;

  function walk(current: string) {
    const files = fs.readdirSync(current);
    for (const file of files) {
      const fullPath = path.join(current, file);
      const relPath = path.relative(dir, fullPath).replace(/\\/g, '/');
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
      } else {
        const buf = fs.readFileSync(fullPath);
        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        result[relPath] = { size: stats.size, sha256: hash };
      }
    }
  }
  walk(dir);
  return result;
}

// 1. Build A
console.log('--- STARTING CLEAN PRODUCTION BUILD A ---');
const startA = Date.now();
if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true, force: true });
cp.execSync('npm run build', { stdio: 'inherit' });
const durationA = Date.now() - startA;
const inventoryA = hashDirectory('dist');
fs.writeFileSync('inventoryA.json', JSON.stringify({ durationMs: durationA, files: inventoryA }, null, 2));
console.log(`BUILD A completed in ${durationA}ms. Total artifacts: ${Object.keys(inventoryA).length}`);

// 2. Build B
console.log('--- STARTING CLEAN PRODUCTION BUILD B ---');
const startB = Date.now();
if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true, force: true });
cp.execSync('npm run build', { stdio: 'inherit' });
const durationB = Date.now() - startB;
const inventoryB = hashDirectory('dist');
fs.writeFileSync('inventoryB.json', JSON.stringify({ durationMs: durationB, files: inventoryB }, null, 2));
console.log(`BUILD B completed in ${durationB}ms. Total artifacts: ${Object.keys(inventoryB).length}`);

// 3. Determinism Analysis
const filesA = Object.keys(inventoryA).sort();
const filesB = Object.keys(inventoryB).sort();

let identicalCount = 0;
let sizeMatchCount = 0;
const diffs: any[] = [];

for (const f of filesA) {
  if (!inventoryB[f]) {
    diffs.push({ file: f, status: 'MISSING_IN_B' });
  } else {
    const a = inventoryA[f];
    const b = inventoryB[f];
    if (a.size === b.size) sizeMatchCount++;
    if (a.sha256 === b.sha256) {
      identicalCount++;
    } else {
      diffs.push({
        file: f,
        status: 'HASH_DIFF',
        sizeA: a.size,
        sizeB: b.size,
        shaA: a.sha256.slice(0, 12),
        shaB: b.sha256.slice(0, 12),
      });
    }
  }
}

for (const f of filesB) {
  if (!inventoryA[f]) {
    diffs.push({ file: f, status: 'MISSING_IN_A' });
  }
}

console.log('\n=== BUILD DETERMINISM ANALYSIS ===');
console.log(`Artifact count A: ${filesA.length} | Artifact count B: ${filesB.length}`);
console.log(`Identical byte-for-byte files: ${identicalCount} / ${filesA.length}`);
console.log(`Exact size matching files: ${sizeMatchCount} / ${filesA.length}`);
console.log(`Differences count: ${diffs.length}`);
if (diffs.length > 0) {
  console.log('Diff details:', JSON.stringify(diffs, null, 2));
} else {
  console.log('100% BYTE-FOR-BYTE IDENTICAL REPRODUCIBLE BUILDS CONFIRMED!');
}
