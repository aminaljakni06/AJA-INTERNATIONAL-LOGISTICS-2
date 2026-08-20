import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatProductResourceValidationMessage,
  normalizeVin,
  validateProductResourcePayload
} from './productResourceValidators';

test('product resource validators reject invalid product barcode and weight', () => {
  const result = validateProductResourcePayload('product', { barcode: 'ABC123', weightKg: 0 }, 'create');

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues.map(issue => issue.field), ['barcode', 'weightKg']);
  assert.match(formatProductResourceValidationMessage(result, 'en'), /Barcode must contain 8 to 14 digits/);
});

test('product resource validators reject negative service default rate', () => {
  const result = validateProductResourcePayload('service', { defaultRate: -1 }, 'update');

  assert.equal(result.valid, false);
  assert.deepEqual(result.issues.map(issue => issue.field), ['defaultRate']);
});

test('product resource validators normalize and validate VINs', () => {
  assert.equal(normalizeVin(' 1m8gdm9a2kp098123 '), '1M8GDM9A2KP098123');

  const invalidVin = validateProductResourcePayload('vehicle', { vin: '1M8GDM9A2KP09812Q', maxPayloadKg: 25000 }, 'create');
  assert.equal(invalidVin.valid, false);
  assert.equal(invalidVin.issues[0].field, 'vin');

  const validVin = validateProductResourcePayload('vehicle', { vin: '1M8GDM9A2KP098123', maxPayloadKg: 25000 }, 'create');
  assert.equal(validVin.valid, true);
});

test('product resource validators allow partial status-only updates', () => {
  const product = validateProductResourcePayload('product', { status: 'INACTIVE' }, 'update');
  const service = validateProductResourcePayload('service', { status: 'INACTIVE' }, 'update');
  const vehicle = validateProductResourcePayload('vehicle', { status: 'INACTIVE', maintenanceStatus: 'OUT_OF_SERVICE' }, 'update');
  const container = validateProductResourcePayload('container', { status: 'INACTIVE' }, 'update');
  const uom = validateProductResourcePayload('uom', { status: 'INACTIVE' }, 'update');
  const commodity = validateProductResourcePayload('commodity', { status: 'INACTIVE' }, 'update');

  assert.equal(product.valid, true);
  assert.equal(service.valid, true);
  assert.equal(vehicle.valid, true);
  assert.equal(container.valid, true);
  assert.equal(uom.valid, true);
  assert.equal(commodity.valid, true);
});

test('product resource validators reject invalid container ownership and capacity', () => {
  const result = validateProductResourcePayload(
    'container',
    {
      ownerName: ' ',
      operatorName: '',
      tareWeightKg: 0,
      maxPayloadKg: -1,
      maxVolumeCbm: 0
    },
    'update'
  );

  assert.equal(result.valid, false);
  assert.deepEqual(
    result.issues.map(issue => issue.field),
    ['ownerName', 'operatorName', 'tareWeightKg', 'maxPayloadKg', 'maxVolumeCbm']
  );
  assert.match(formatProductResourceValidationMessage(result, 'ar'), /المالك مطلوب/);
});

test('product resource validators reject invalid UOM and commodity financial rules', () => {
  const uom = validateProductResourcePayload('uom', { code: '', conversionFactorToBase: 0 }, 'update');
  const commodity = validateProductResourcePayload(
    'commodity',
    { hsCode: ' ', importDutyRatePercent: -1, vatRatePercent: -1 },
    'update'
  );

  assert.equal(uom.valid, false);
  assert.deepEqual(uom.issues.map(issue => issue.field), ['code', 'conversionFactorToBase']);

  assert.equal(commodity.valid, false);
  assert.deepEqual(
    commodity.issues.map(issue => issue.field),
    ['hsCode', 'importDutyRatePercent', 'vatRatePercent']
  );
});
