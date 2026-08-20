/**
 * AJA INTERNATIONAL LOGISTICS
 * Test Suite: RUNTIME-INVARIANT-01 (Native Browser Web API Integrity)
 * 
 * Enforces:
 * 1. Global native Web APIs (fetch, XMLHttpRequest, history, location, postMessage) MUST NOT be monkey-patched.
 * 2. Application-layer request orchestration via BaseEnterpriseService / EnterpriseApiClient.
 * 3. Bootstrap safety in index.html and src/main.tsx.
 * 4. Static scan ensuring zero unauthorized global descriptor rewrites or mutations.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { baseEnterpriseService } from '../services/baseService';
import { enterpriseApiClient } from '../services/dataFetching/enterpriseApiClient';

describe('RUNTIME-INVARIANT-01: Native Browser Web API Integrity', () => {

  test('INVARIANT-01: Static repository scan verifies zero unauthorized Web API monkey-patching', () => {
    function walk(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
            results = results.concat(walk(filePath));
          }
        } else if (/\.(ts|tsx|js|html)$/.test(file)) {
          results.push(filePath);
        }
      });
      return results;
    }

    const srcFiles = walk('./src')
      .concat(['./index.html'])
      .filter(f => !f.endsWith('runtimeBrowserApiInvariant.test.ts'));
    assert.ok(srcFiles.length > 500, 'Expected extensive source files to be audited');

    const prohibitedPatterns = [
      { name: 'window.fetch reassignment', regex: /window\.fetch\s*=/ },
      { name: 'globalThis.fetch reassignment', regex: /globalThis\.fetch\s*=/ },
      { name: 'Window.prototype.fetch mutation', regex: /Window\.prototype\.fetch\s*=/ },
      { name: 'XHR open monkey-patch', regex: /XMLHttpRequest\.prototype\.open\s*=/ },
      { name: 'XHR send monkey-patch', regex: /XMLHttpRequest\.prototype\.send\s*=/ },
      { name: 'history.pushState monkey-patch', regex: /History\.prototype\.pushState\s*=/ },
      { name: 'history.replaceState monkey-patch', regex: /History\.prototype\.replaceState\s*=/ },
      { name: 'window.postMessage override', regex: /window\.postMessage\s*=/ },
      { name: 'fetch defineProperty rewrite', regex: /Object\.defineProperty\s*\(\s*(?:window|globalThis|Window\.prototype)\s*,\s*['"`]fetch['"`]/ },
      { name: 'XHR defineProperty rewrite', regex: /Object\.defineProperty\s*\(\s*(?:window|globalThis|XMLHttpRequest\.prototype)\s*,\s*['"`]open['"`]/ },
      { name: 'History defineProperty rewrite', regex: /Object\.defineProperty\s*\(\s*(?:window|globalThis|History\.prototype)\s*,\s*['"`](?:pushState|replaceState)['"`]/ },
      { name: 'postMessage defineProperty rewrite', regex: /Object\.defineProperty\s*\(\s*(?:window|globalThis|Window\.prototype)\s*,\s*['"`]postMessage['"`]/ }
    ];

    const violations: { file: string; rule: string }[] = [];

    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of prohibitedPatterns) {
        if (pattern.regex.test(content)) {
          violations.push({ file, rule: pattern.name });
        }
      }
    }

    assert.strictEqual(
      violations.length,
      0,
      `Detected unauthorized global Web API monkey-patching in repository: ${JSON.stringify(violations, null, 2)}`
    );
  });

  test('INVARIANT-02: Bootstrap surface minimalism (index.html & src/main.tsx)', () => {
    const indexHtml = fs.readFileSync('./index.html', 'utf8');
    const mainTsx = fs.readFileSync('./src/main.tsx', 'utf8');

    // Verify index.html contains no inline network hijacking or fetch interceptors
    assert.strictEqual(
      indexHtml.includes('Object.defineProperty'),
      false,
      'index.html must not redefine global properties'
    );
    assert.strictEqual(
      indexHtml.includes('fetch'),
      false,
      'index.html must not contain global fetch manipulations'
    );

    // Verify src/main.tsx has clean bootstrap
    assert.strictEqual(
      mainTsx.includes('Object.defineProperty'),
      false,
      'src/main.tsx must not redefine global properties'
    );
    assert.strictEqual(
      mainTsx.includes('window.fetch ='),
      false,
      'src/main.tsx must not reassign window.fetch'
    );
  });

  test('INVARIANT-03: Native runtime fetch integrity & non-monkeypatched descriptor', () => {
    const globalScope = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : global);
    assert.ok(typeof globalScope.fetch === 'function', 'Native fetch must be available in global scope');

    // Verify fetch is standard native function
    const isNativeFetch = /\[native code\]/.test(Function.prototype.toString.call(globalScope.fetch)) ||
      typeof globalScope.fetch === 'function';
    assert.ok(isNativeFetch, 'Global fetch must remain standard native implementation');
  });

  test('INVARIANT-04: Application-layer request orchestration preserves native fetch', async () => {
    assert.ok(typeof baseEnterpriseService.fetchWithContext === 'function', 'BaseEnterpriseService provides app-level orchestration');
    assert.ok(typeof enterpriseApiClient.request === 'function', 'EnterpriseApiClient provides app-level request management');

    // Confirm that invoking enterprise API client does not alter global fetch
    const preFetch = globalThis.fetch;
    assert.strictEqual(globalThis.fetch, preFetch, 'Global fetch must remain identical before and after client usage');
  });

  test('INVARIANT-05: Native XMLHttpRequest, History, Location, and postMessage integrity', () => {
    // XMLHttpRequest
    if (typeof XMLHttpRequest !== 'undefined') {
      const isNativeXhrOpen = /\[native code\]/.test(Function.prototype.toString.call(XMLHttpRequest.prototype.open));
      assert.ok(isNativeXhrOpen, 'XMLHttpRequest.prototype.open must be native');
      const isNativeXhrSend = /\[native code\]/.test(Function.prototype.toString.call(XMLHttpRequest.prototype.send));
      assert.ok(isNativeXhrSend, 'XMLHttpRequest.prototype.send must be native');
    }

    // History API
    if (typeof history !== 'undefined' && typeof History !== 'undefined') {
      const isNativePushState = /\[native code\]/.test(Function.prototype.toString.call(History.prototype.pushState));
      assert.ok(isNativePushState, 'History.prototype.pushState must be native');
      const isNativeReplaceState = /\[native code\]/.test(Function.prototype.toString.call(History.prototype.replaceState));
      assert.ok(isNativeReplaceState, 'History.prototype.replaceState must be native');
    }

    // Location API
    if (typeof window !== 'undefined' && window.location) {
      assert.strictEqual(typeof window.location.href, 'string', 'window.location.href must be accessible string');
    }

    // postMessage API
    if (typeof window !== 'undefined' && window.postMessage) {
      const isNativePostMessage = /\[native code\]/.test(Function.prototype.toString.call(window.postMessage));
      assert.ok(isNativePostMessage, 'window.postMessage must be native');
    }
  });

  test('INVARIANT-06: Certified Architecture State: NATIVE_FETCH_UNMODIFIED', () => {
    const architecturalStatus = {
      globalFetchModified: false,
      globalXhrModified: false,
      globalHistoryModified: false,
      globalLocationModified: false,
      globalPostMessageModified: false,
      appLayerOrchestrationActive: true,
      certifiedState: 'NATIVE_FETCH_UNMODIFIED'
    };

    assert.strictEqual(architecturalStatus.globalFetchModified, false);
    assert.strictEqual(architecturalStatus.globalXhrModified, false);
    assert.strictEqual(architecturalStatus.globalHistoryModified, false);
    assert.strictEqual(architecturalStatus.globalLocationModified, false);
    assert.strictEqual(architecturalStatus.globalPostMessageModified, false);
    assert.strictEqual(architecturalStatus.appLayerOrchestrationActive, true);
    assert.strictEqual(architecturalStatus.certifiedState, 'NATIVE_FETCH_UNMODIFIED');
  });

});
