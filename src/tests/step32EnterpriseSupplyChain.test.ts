/**
 * AJA INTERNATIONAL LOGISTICS — STEP 32 ENTERPRISE SUPPLY CHAIN SECURITY & SOFTWARE INTEGRITY TEST SUITE
 * Baseline: REL-2026-AJA-PROD-2.8.0
 * Security Classification: SOFTWARE_SUPPLY_CHAIN_TIER_0
 * 
 * Tests all key Supply Chain Governance Domains (SC-001 to SC-130):
 * - Component inventory, classification & license compliance
 * - Lockfile presence & deterministic dependency resolution
 * - Dependency confusion & typosquatting protection
 * - CycloneDX v1.5 & SPDX v2.3 SBOM generation, cryptographic signing & tamper detection
 * - SLSA Level 3 in-toto build provenance attestation
 * - Artifact cryptographic digesting (SHA-256) & ECDSA signing
 * - Release gate integration & artifact substitution defense
 * - Supply chain emergency release freeze / kill-switch
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { EnterpriseSupplyChainService } from '../services/enterpriseSupplyChainService';
import { EnterpriseIdentityTrustService } from '../services/enterpriseIdentityTrustService';

test('STEP 32 — COMPONENT INVENTORY, LOCKFILES & DEPENDENCY CONFUSION (SC-001 to SC-020, SC-111, SC-120)', async (t) => {
  const supplyChain = EnterpriseSupplyChainService.getInstance();

  await t.test('SC-001 to SC-003: Software Component Inventory & Classification', () => {
    const components = supplyChain.getAllComponents();
    assert.ok(components.length >= 5);

    const react = supplyChain.getComponent('react');
    assert.ok(react);
    assert.equal(react.classification, 'DIRECT_PRODUCTION');
    assert.equal(react.licenseCategory, 'APPROVED_PERMISSIVE');

    const genai = supplyChain.getComponent('@google/genai');
    assert.ok(genai);
    assert.equal(genai.classification, 'DIRECT_PRODUCTION');
    assert.equal(genai.approvedSourceRegistry, 'https://registry.npmjs.org');
  });

  await t.test('SC-004 & SC-005: Lockfile Presence and Determinism Verification', () => {
    const lockResult = supplyChain.verifyLockfileIntegrity();
    assert.equal(lockResult.valid, true);
    assert.ok(lockResult.lockfilesDiscovered.includes('package-lock.json') || lockResult.lockfilesDiscovered.includes('bun.lock'));
    assert.equal(lockResult.integrityStatus, 'DETERMINISTIC_LOCKFILE_VERIFIED');
  });

  await t.test('SC-007, SC-008 & SC-120: Typosquatting & Dependency Confusion Defense', () => {
    // 1. Typosquatting
    const typoCheck = supplyChain.auditDependencyConfusionAndTypos('reaact');
    assert.equal(typoCheck.safe, false);
    assert.equal(typoCheck.reasonCode, 'TYPOSQUATTING_SIGNATURE_DETECTED');

    // 2. Dependency Confusion
    const confusionCheck = supplyChain.auditDependencyConfusionAndTypos('@aja-internal/shadow-pkg');
    assert.equal(confusionCheck.safe, false);
    assert.equal(confusionCheck.reasonCode, 'UNAUTHORIZED_PRIVATE_NAMESPACE_SHADOWING');

    // 3. Approved Package
    const approvedCheck = supplyChain.auditDependencyConfusionAndTypos('express');
    assert.equal(approvedCheck.safe, true);
    assert.equal(approvedCheck.reasonCode, 'PACKAGE_SOURCE_APPROVED');
  });
});

test('STEP 32 — CYCLONEDX SBOM GENERATION, INTEGRITY & TAMPER DEFENSE (SC-021 to SC-030, SC-123, SC-124)', async (t) => {
  const supplyChain = EnterpriseSupplyChainService.getInstance();
  const commitSha = 'c91f4e083ba4128d8';
  const artifactDigest = crypto.createHash('sha256').update('server.cjs-bundle-artifact').digest('hex');

  await t.test('SC-021 & SC-023: Generate CycloneDX v1.5 SBOM Bound to Build & Digest', () => {
    const sbom = supplyChain.generateCycloneDxSbom('BUILD-PROD-2026-0814', commitSha, artifactDigest);
    assert.ok(sbom.sbomId.startsWith('SBOM-CDX-'));
    assert.equal(sbom.format, 'CycloneDX_1.5');
    assert.equal(sbom.releaseBaseline, 'REL-2026-AJA-PROD-2.8.0');
    assert.equal(sbom.artifactDigest, artifactDigest);
    assert.ok(sbom.signature);

    // Verify Integrity
    const verified = supplyChain.verifySbomIntegrity(sbom);
    assert.equal(verified, true);
  });

  await t.test('SC-028 & SC-124: SBOM Tamper Detection and Invalid Signature Rejection', () => {
    const sbom = supplyChain.generateCycloneDxSbom('BUILD-PROD-2026-0814', commitSha, artifactDigest);

    // Tamper with component list
    const tamperedSbom = {
      ...sbom,
      components: [
        ...sbom.components,
        {
          componentId: 'npm-malicious',
          name: 'malicious-injected-pkg',
          version: '1.0.0',
          purl: 'pkg:npm/malicious-injected-pkg@1.0.0',
          ecosystem: 'npm' as const,
          classification: 'DIRECT_PRODUCTION' as const,
          license: 'MIT',
          licenseCategory: 'APPROVED_PERMISSIVE' as const,
          approvedSourceRegistry: 'https://evil.org',
          directDependency: true,
          hasLifecycleScripts: true,
          securityAdvisoriesCount: 0,
        },
      ],
    };

    const verified = supplyChain.verifySbomIntegrity(tamperedSbom);
    assert.equal(verified, false);
  });
});

test('STEP 32 — BUILD PROVENANCE, SLSA LEVEL 3 & ARTIFACT SIGNING (SC-046 to SC-070, SC-113, SC-114, SC-115)', async (t) => {
  const supplyChain = EnterpriseSupplyChainService.getInstance();
  const commitSha = 'c91f4e083ba4128d8';
  const artifactDigest = crypto.createHash('sha256').update('dist-prod-server-2026').digest('hex');

  await t.test('SC-046 & SC-067: SLSA Level 3 Build Provenance Generation', () => {
    const prov = supplyChain.generateBuildProvenance('BUILD-PROD-2026-0814', commitSha, artifactDigest);
    assert.ok(prov.provenanceId.startsWith('PROV-'));
    assert.equal(prov.builderIdentity, 'BUILDER-AJA-CI-RUNNER-01');
    assert.equal(prov.slsaLevel, 'SLSA_LEVEL_3');
    assert.equal(prov.artifactDigest, artifactDigest);
    assert.equal(prov.reproducible, true);
  });

  await t.test('SC-063 & SC-064: Cryptographic ECDSA Artifact Signing & Verification', () => {
    const signature = supplyChain.signArtifact(artifactDigest, 'SIGNER-IDENTITY-KMS-ROOT');
    assert.ok(signature.signatureId.startsWith('SIG-'));
    assert.equal(signature.artifactDigest, artifactDigest);
    assert.equal(signature.signingAlgorithm, 'ECDSA_SHA256');

    // 1. Genuine Verification
    const verified = supplyChain.verifyArtifactSignature(artifactDigest, signature.signature);
    assert.equal(verified, true);

    // 2. Invalid / Tampered Digest Signature Verification (SC-114)
    const tamperedDigest = crypto.createHash('sha256').update('tampered-bundle').digest('hex');
    const tamperedVerified = supplyChain.verifyArtifactSignature(tamperedDigest, signature.signature);
    assert.equal(tamperedVerified, false);
  });
});

test('STEP 32 — RELEASE GATE INTEGRATION & ARTIFACT SUBSTITUTION DEFENSE (SC-071 to SC-110, SC-116)', async (t) => {
  const supplyChain = EnterpriseSupplyChainService.getInstance();
  const commitSha = 'c91f4e083ba4128d8';
  const artifactDigest = crypto.createHash('sha256').update('release-valid-server-bundle').digest('hex');

  const sbom = supplyChain.generateCycloneDxSbom('BUILD-PROD-2026-0814', commitSha, artifactDigest);
  const prov = supplyChain.generateBuildProvenance('BUILD-PROD-2026-0814', commitSha, artifactDigest);
  const sig = supplyChain.signArtifact(artifactDigest, 'SIGNER-IDENTITY-KMS-ROOT');

  await t.test('SC-077 & SC-101: Release Gate Evaluates Valid Artifact Chain Successfully', () => {
    const gateResult = supplyChain.evaluateSupplyChainReleaseGate(commitSha, artifactDigest, sbom, prov, sig);
    assert.equal(gateResult.eligible, true);
    assert.equal(gateResult.reasonCode, 'SUPPLY_CHAIN_GATES_PASSED_RELEASE_ELIGIBLE');
  });

  await t.test('SC-072 & SC-116: Artifact Substitution Attack Hard Blocked', () => {
    const substitutedArtifactDigest = crypto.createHash('sha256').update('unauthorized-injected-binary').digest('hex');
    const gateResult = supplyChain.evaluateSupplyChainReleaseGate(
      commitSha,
      substitutedArtifactDigest, // Substituted Digest
      sbom,
      prov,
      sig
    );

    assert.equal(gateResult.eligible, false);
    assert.equal(gateResult.reasonCode, 'ARTIFACT_SUBSTITUTION_DETECTED');
  });
});

test('STEP 32 — EMERGENCY SUPPLY CHAIN RELEASE FREEZE / KILL-SWITCH (SC-111, SC-129)', async (t) => {
  const supplyChain = EnterpriseSupplyChainService.getInstance();
  const identityService = EnterpriseIdentityTrustService.getInstance();

  const dev = identityService.getPrincipal('usr_dev_01')!;
  const cfo = identityService.getPrincipal('usr_cfo_01')!;

  const commitSha = 'c91f4e083ba4128d8';
  const artifactDigest = crypto.createHash('sha256').update('release-bundle-testing').digest('hex');
  const sbom = supplyChain.generateCycloneDxSbom('BUILD-PROD-2026-0814', commitSha, artifactDigest);
  const prov = supplyChain.generateBuildProvenance('BUILD-PROD-2026-0814', commitSha, artifactDigest);
  const sig = supplyChain.signArtifact(artifactDigest, 'SIGNER-IDENTITY-KMS-ROOT');

  await t.test('SC-111: Non-Executive Principal Cannot Trigger Release Freeze', () => {
    assert.throws(() => {
      supplyChain.activateSupplyChainFreeze(dev, 'Unauthorized Freeze Attempt');
    }, /Unauthorized: Only Executive Authority/);
  });

  await t.test('SC-111: Executive Activates Supply Chain Freeze and Blocks Release Gate', () => {
    supplyChain.activateSupplyChainFreeze(cfo, 'Zero-Day Third-Party Dependency Vulnerability Alert');
    assert.equal(supplyChain.isFreezeActive(), true);

    const gateResult = supplyChain.evaluateSupplyChainReleaseGate(commitSha, artifactDigest, sbom, prov, sig);
    assert.equal(gateResult.eligible, false);
    assert.equal(gateResult.reasonCode, 'SUPPLY_CHAIN_RELEASE_FREEZE_ACTIVE');

    // Deactivate after test
    supplyChain.deactivateSupplyChainFreeze(cfo);
    assert.equal(supplyChain.isFreezeActive(), false);
  });
});
