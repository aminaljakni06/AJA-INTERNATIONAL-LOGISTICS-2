/**
 * AJA INTERNATIONAL LOGISTICS — STEP 24 WebAuthn / Passkey Certification Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { PasskeyService } from '../services/passkeyService';

test('STEP 24 — WebAuthn & Passkey Authentication Engine', async (t) => {
  const userId = 'usr_test_auth_01';
  const username = 'operations_director@aja-logistics.com';

  await t.test('1. Generates cryptographic registration options for navigator.credentials.create()', () => {
    const options = PasskeyService.generateRegistrationOptions(userId, username, 'Director Al-Otaibi');

    assert.equal(options.rp.name, 'Aja Logistics Enterprise Platform');
    assert.ok(options.challenge && options.challenge.length >= 16, 'Challenge must contain sufficient cryptographic entropy');
    assert.equal(options.user.name, username);
    assert.equal(options.user.displayName, 'Director Al-Otaibi');
    assert.ok(options.pubKeyCredParams.length >= 2, 'Must support both ES256 (-7) and RS256 (-257) algorithms');
    assert.equal(options.timeout, 60000);
  });

  await t.test('2. Verifies and stores new Passkey credential', async () => {
    const credentialId = `cred_test_${Date.now()}`;
    const publicKey = Buffer.from('mock_public_key_bytes_es256').toString('base64');

    const passkey = await PasskeyService.verifyAndRegisterPasskey(
      userId,
      credentialId,
      publicKey,
      'MacBook Pro TouchID',
      'platform'
    );

    assert.equal(passkey.credentialId, credentialId);
    assert.equal(passkey.userId, userId);
    assert.equal(passkey.friendlyName, 'MacBook Pro TouchID');
    assert.equal(passkey.authenticatorAttachment, 'platform');
  });

  await t.test('3. Rejects duplicate passkey credential ID registration', async () => {
    const credentialId = `cred_dup_${Date.now()}`;
    const publicKey = Buffer.from('mock_key').toString('base64');

    await PasskeyService.verifyAndRegisterPasskey(userId, credentialId, publicKey, 'Key 1');

    await assert.rejects(
      async () => {
        await PasskeyService.verifyAndRegisterPasskey(userId, credentialId, publicKey, 'Key 1 Duplicate');
      },
      /already registered/,
      'Duplicate credential ID must be rejected'
    );
  });
});
