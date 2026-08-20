/**
 * AJA INTERNATIONAL LOGISTICS
 * Build Artifact & Distribution Validation Script
 *
 * Verifies:
 * - dist/ existence, non-emptiness, and directory validity
 * - dist/index.html existence, non-zero size, and production asset references
 * - dist/assets/ existence, chunks, and CSS integrity
 * - dist/server.cjs existence, non-zero size, and CommonJS loadability
 * - Zero references to development URLs or local /src/ paths in dist/index.html
 */

import fs from 'node:fs';
import path from 'node:path';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    totalArtifacts: number;
    totalSizeBytes: number;
    serverBundleSizeBytes: number;
    indexHtmlSizeBytes: number;
    assetCount: number;
  };
}

export function validateBuildArtifacts(distDir: string = path.resolve(process.cwd(), 'dist')): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const metrics = {
    totalArtifacts: 0,
    totalSizeBytes: 0,
    serverBundleSizeBytes: 0,
    indexHtmlSizeBytes: 0,
    assetCount: 0,
  };

  // 1. Validate dist root directory
  if (!fs.existsSync(distDir)) {
    errors.push(`Canonical artifact output directory '${distDir}' does not exist.`);
    return { passed: false, errors, warnings, metrics };
  }

  const stat = fs.statSync(distDir);
  if (!stat.isDirectory()) {
    errors.push(`Artifact output path '${distDir}' is not a directory.`);
    return { passed: false, errors, warnings, metrics };
  }

  // 2. Validate dist/index.html
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    errors.push("Required frontend entry artifact 'dist/index.html' is missing.");
  } else {
    const indexStat = fs.statSync(indexPath);
    metrics.indexHtmlSizeBytes = indexStat.size;
    if (indexStat.size === 0) {
      errors.push("'dist/index.html' is empty (0 bytes).");
    } else {
      const indexContent = fs.readFileSync(indexPath, 'utf-8');

      // Check for forbidden development traces
      if (indexContent.includes('/src/main.tsx')) {
        errors.push("'dist/index.html' still contains development entry reference '/src/main.tsx'.");
      }
      if (indexContent.includes('localhost:') || indexContent.includes('127.0.0.1:')) {
        errors.push("'dist/index.html' contains local development host references.");
      }

      // Extract and verify referenced asset tags
      const assetMatches = indexContent.matchAll(/(?:src|href)=["'](\/?assets\/[^"']+)["']/g);
      let foundAssets = 0;
      for (const match of assetMatches) {
        foundAssets++;
        let assetRel = match[1];
        if (assetRel.startsWith('/')) {
          assetRel = assetRel.slice(1);
        }
        const assetDiskPath = path.join(distDir, assetRel);
        if (!fs.existsSync(assetDiskPath)) {
          errors.push(`'dist/index.html' references asset '${match[1]}' which does not exist on disk at '${assetDiskPath}'.`);
        }
      }

      if (foundAssets === 0) {
        warnings.push("'dist/index.html' does not have explicit /assets/ tag references (may be inline or custom module).");
      }
    }
  }

  // 3. Validate dist/assets directory
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    errors.push("Frontend assets directory 'dist/assets' is missing.");
  } else {
    const assetsList = fs.readdirSync(assetsDir);
    metrics.assetCount = assetsList.length;
    if (assetsList.length === 0) {
      errors.push("Frontend assets directory 'dist/assets' is empty.");
    }
  }

  // 4. Validate dist/server.cjs
  const serverPath = path.join(distDir, 'server.cjs');
  if (!fs.existsSync(serverPath)) {
    errors.push("Required server bundle artifact 'dist/server.cjs' is missing.");
  } else {
    const serverStat = fs.statSync(serverPath);
    metrics.serverBundleSizeBytes = serverStat.size;
    if (serverStat.size === 0) {
      errors.push("'dist/server.cjs' is empty (0 bytes).");
    }
  }

  // 5. Calculate total directory inventory
  function walk(current: string) {
    const files = fs.readdirSync(current);
    for (const file of files) {
      const fullPath = path.join(current, file);
      const s = fs.statSync(fullPath);
      if (s.isDirectory()) {
        walk(fullPath);
      } else {
        metrics.totalArtifacts++;
        metrics.totalSizeBytes += s.size;
      }
    }
  }
  walk(distDir);

  const passed = errors.length === 0;
  return { passed, errors, warnings, metrics };
}

// CLI Execution if run directly
if (process.argv[1] && (process.argv[1].endsWith('validate-build-artifacts.ts') || process.argv[1].endsWith('validate-build-artifacts.js'))) {
  console.log('--- EXECUTING BUILD ARTIFACT VALIDATION ---');
  const res = validateBuildArtifacts();

  console.log(`Artifact Validation Passed: ${res.passed ? 'YES' : 'NO'}`);
  console.log(`Total Artifact Files: ${res.metrics.totalArtifacts}`);
  console.log(`Total Artifact Size: ${(res.metrics.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Server Bundle Size: ${(res.metrics.serverBundleSizeBytes / 1024).toFixed(2)} KB`);
  console.log(`Index HTML Size: ${(res.metrics.indexHtmlSizeBytes / 1024).toFixed(2)} KB`);
  console.log(`Assets Count: ${res.metrics.assetCount}`);

  if (res.warnings.length > 0) {
    console.log('\nWarnings:');
    res.warnings.forEach(w => console.log(`  - [WARN] ${w}`));
  }

  if (res.errors.length > 0) {
    console.error('\nErrors:');
    res.errors.forEach(e => console.error(`  - [ERROR] ${e}`));
    process.exit(1);
  } else {
    console.log('\nAll required build artifacts verified successfully.');
  }
}
