import 'dotenv/config';

const mode = process.env.ENV_AUDIT_MODE || process.env.NODE_ENV || 'production';
const isProductionLike = ['production', 'staging'].includes(mode);

const failures = [];
const warnings = [];

function valueOf(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function requireSecret(name, { minLength = 32, placeholders = [] } = {}) {
  const value = valueOf(name);
  const lower = value.toLowerCase();

  if (!value) {
    failures.push(`${name} is required.`);
    return;
  }

  if (value.length < minLength) {
    failures.push(`${name} must be at least ${minLength} characters.`);
  }

  if (
    placeholders.some((placeholder) => lower.includes(placeholder)) ||
    lower.includes('placeholder') ||
    lower.includes('replace_with') ||
    lower.includes('your_')
  ) {
    failures.push(`${name} must not use a placeholder/demo value.`);
  }
}

function requireHttpsUrl(name) {
  const value = valueOf(name);
  if (!value) {
    failures.push(`${name} is required.`);
    return;
  }

  if (!value.startsWith('https://')) {
    failures.push(`${name} must use https:// in production-like environments.`);
  }
}

requireSecret('JWT_SECRET', {
  minLength: 32,
  placeholders: ['dev-only', 'local-product-resource-smoke-secret'],
});

if (isProductionLike && valueOf('FIRESTORE_EMULATOR_HOST')) {
  failures.push('FIRESTORE_EMULATOR_HOST must not be set for production-like environments.');
}

if (isProductionLike && valueOf('FORCE_LOCAL_DATA_FALLBACK') === 'true') {
  failures.push('FORCE_LOCAL_DATA_FALLBACK must not be true for production-like environments.');
}

if (isProductionLike && !valueOf('FIREBASE_SERVICE_ACCOUNT_JSON') && !valueOf('GOOGLE_APPLICATION_CREDENTIALS')) {
  failures.push(
    'Firebase Admin credentials are required: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

if (isProductionLike && valueOf('FIREBASE_SERVICE_ACCOUNT_JSON')) {
  try {
    JSON.parse(valueOf('FIREBASE_SERVICE_ACCOUNT_JSON'));
  } catch {
    failures.push('FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.');
  }
}

if (isProductionLike && valueOf('SKIP_FIREBASE_SEED') !== 'true') {
  for (const name of ['DEFAULT_ADMIN_PASSWORD', 'DEFAULT_STAFF_PASSWORD', 'DEFAULT_CUSTOMER_PASSWORD']) {
    requireSecret(name, { minLength: 16 });
  }
}

if (valueOf('ADYEN_ENVIRONMENT').toUpperCase() === 'LIVE') {
  requireSecret('ADYEN_API_KEY', { minLength: 24 });
  requireSecret('ADYEN_CLIENT_KEY', { minLength: 12 });
  requireSecret('ADYEN_HMAC_KEY', { minLength: 24 });
  requireSecret('ADYEN_LIVE_ENDPOINT_PREFIX', { minLength: 3 });
  if (!valueOf('ADYEN_MERCHANT_ACCOUNT')) {
    failures.push('ADYEN_MERCHANT_ACCOUNT is required when ADYEN_ENVIRONMENT=LIVE.');
  }
  requireHttpsUrl('APP_URL');
  requireHttpsUrl('ADYEN_RETURN_URL');
  requireHttpsUrl('ADYEN_WEBHOOK_URL');
}

if (!valueOf('GEMINI_API_KEY')) {
  warnings.push('GEMINI_API_KEY is not configured; AI routes that call Gemini will return configuration errors.');
}

if (failures.length > 0) {
  console.error(`Production environment audit failed for mode: ${mode}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  if (warnings.length > 0) {
    console.error('Warnings:');
    for (const warning of warnings) {
      console.error(`- ${warning}`);
    }
  }
  process.exit(1);
}

console.log(`Production environment audit passed for mode: ${mode}`);
if (warnings.length > 0) {
  console.warn('Warnings:');
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}
