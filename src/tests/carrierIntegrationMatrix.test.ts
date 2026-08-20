/**
 * AJA INTERNATIONAL LOGISTICS — STEP 24 Carrier Integration & Capability Matrix Test Suite
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ExternalCarrierManager,
  fetchFasahClearanceStatus,
  fetchLiveGpsTelemetry,
} from '../services/externalLogisticsApi';

test('STEP 24 — Carrier Integration & Logistics Capability Matrix', async (t) => {
  await t.test('1. Carrier Capability Matrix returns registered carriers and active modes', () => {
    const carriers = ExternalCarrierManager.getAllCarriers();
    assert.ok(carriers.length >= 4, 'Must register standard logistics carriers');

    const aramex = ExternalCarrierManager.getCarrierCapabilities('ARAMEX');
    assert.ok(aramex);
    assert.equal(aramex?.carrierCode, 'ARAMEX');
    assert.equal(aramex?.capabilities.createBooking, true);
    assert.equal(aramex?.capabilities.getTracking, true);

    const dhl = ExternalCarrierManager.getCarrierCapabilities('DHL_EXPRESS');
    assert.ok(dhl);
    assert.equal(dhl?.mode, 'SANDBOX');
  });

  await t.test('2. Dynamic mode switching and health status updates', () => {
    const success = ExternalCarrierManager.setCarrierMode('ARAMEX', 'LIVE');
    assert.equal(success, true);

    const updated = ExternalCarrierManager.getCarrierCapabilities('ARAMEX');
    assert.equal(updated?.mode, 'LIVE');
    assert.equal(updated?.healthStatus, 'HEALTHY');

    // Reset back to SANDBOX
    ExternalCarrierManager.setCarrierMode('ARAMEX', 'SANDBOX');
  });

  await t.test('3. FASAH Customs status resolution returns structured response and source mode', async () => {
    const status = await fetchFasahClearanceStatus('DEC-2026-99182', 'SIMULATOR');
    assert.ok(status);
    assert.equal(status?.declarationNumber, 'DEC-2026-99182');
    assert.equal(status?.dutyPaid, true);
    assert.equal(status?.clearanceStatus, 'RELEASED');
    assert.equal(status?.sourceMode, 'SIMULATOR');
  });

  await t.test('4. Live GPS Telemetry returns valid coordinates and vehicle status', async () => {
    const telemetry = await fetchLiveGpsTelemetry('TRUCK-SA-0442', 'SIMULATOR');
    assert.ok(telemetry);
    assert.equal(telemetry?.truckId, 'TRUCK-SA-0442');
    assert.ok(telemetry?.coordinates.lat > 0);
    assert.ok(telemetry?.coordinates.lng > 0);
    assert.ok(telemetry?.speedKmh >= 0);
    assert.equal(telemetry?.sourceMode, 'SIMULATOR');
  });

  await t.test('5. Disabled mode returns null cleanly without throwing exceptions', async () => {
    const status = await fetchFasahClearanceStatus('DEC-DISABLED', 'DISABLED');
    assert.equal(status, null, 'Disabled carrier integration must return null');
  });
});
