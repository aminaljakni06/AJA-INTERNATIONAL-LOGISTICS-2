export type ProductResourceEntity = 'product' | 'service' | 'vehicle' | 'container' | 'uom' | 'commodity';
export type ProductResourceValidationMode = 'create' | 'update';

export interface ProductResourceValidationIssue {
  field: string;
  messageEn: string;
  messageAr: string;
}

export interface ProductResourceValidationResult {
  valid: boolean;
  issues: ProductResourceValidationIssue[];
}

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const BARCODE_PATTERN = /^\d{8,14}$/;

function hasOwn(payload: Record<string, unknown>, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, field);
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function addIssue(
  issues: ProductResourceValidationIssue[],
  field: string,
  messageEn: string,
  messageAr: string
): void {
  issues.push({ field, messageEn, messageAr });
}

function validatePositiveNumber(
  issues: ProductResourceValidationIssue[],
  payload: Record<string, unknown>,
  field: string,
  labelEn: string,
  labelAr: string,
  required: boolean
): void {
  if (!required && !hasOwn(payload, field)) return;
  const value = payload[field];

  if (!isFiniteNumber(value) || value <= 0) {
    addIssue(
      issues,
      field,
      `${labelEn} must be greater than zero.`,
      `يجب أن تكون قيمة ${labelAr} أكبر من صفر.`
    );
  }
}

function validateNonNegativeNumber(
  issues: ProductResourceValidationIssue[],
  payload: Record<string, unknown>,
  field: string,
  labelEn: string,
  labelAr: string,
  required: boolean
): void {
  if (!required && !hasOwn(payload, field)) return;
  const value = payload[field];

  if (!isFiniteNumber(value) || value < 0) {
    addIssue(
      issues,
      field,
      `${labelEn} cannot be negative.`,
      `لا يمكن أن تكون قيمة ${labelAr} سالبة.`
    );
  }
}

function validateRequiredText(
  issues: ProductResourceValidationIssue[],
  payload: Record<string, unknown>,
  field: string,
  labelEn: string,
  labelAr: string,
  required: boolean
): void {
  if (!required && !hasOwn(payload, field)) return;

  if (!asTrimmedString(payload[field])) {
    addIssue(issues, field, `${labelEn} is required.`, `${labelAr} مطلوب.`);
  }
}

export function normalizeVin(value: unknown): string {
  return asTrimmedString(value).toUpperCase();
}

export function isValidVin(value: string): boolean {
  return VIN_PATTERN.test(value);
}

export function isValidBarcode(value: string): boolean {
  return BARCODE_PATTERN.test(value);
}

export function formatProductResourceValidationMessage(
  result: ProductResourceValidationResult,
  language: 'en' | 'ar' = 'en'
): string {
  return result.issues
    .map(issue => (language === 'ar' ? issue.messageAr : issue.messageEn))
    .join(' ');
}

export function validateProductResourcePayload(
  entity: ProductResourceEntity,
  payload: Record<string, unknown>,
  mode: ProductResourceValidationMode
): ProductResourceValidationResult {
  const issues: ProductResourceValidationIssue[] = [];
  const isCreate = mode === 'create';

  if (entity === 'product') {
    const barcode = asTrimmedString(payload.barcode);
    if ((isCreate || hasOwn(payload, 'barcode')) && barcode && !isValidBarcode(barcode)) {
      addIssue(
        issues,
        'barcode',
        'Barcode must contain 8 to 14 digits.',
        'يجب أن يحتوي الباركود على 8 إلى 14 رقمًا.'
      );
    }

    validatePositiveNumber(issues, payload, 'weightKg', 'Weight', 'الوزن', isCreate);
  }

  if (entity === 'service') {
    validateNonNegativeNumber(issues, payload, 'defaultRate', 'Default rate', 'التعرفة الأساسية', isCreate);
  }

  if (entity === 'vehicle') {
    const vin = normalizeVin(payload.vin);
    if ((isCreate || hasOwn(payload, 'vin')) && !isValidVin(vin)) {
      addIssue(
        issues,
        'vin',
        'VIN must be 17 characters and cannot contain I, O, or Q.',
        'يجب أن يتكون رقم الهيكل من 17 خانة ولا يحتوي على I أو O أو Q.'
      );
    }

    validatePositiveNumber(issues, payload, 'maxPayloadKg', 'Vehicle payload', 'حمولة المركبة', isCreate);
  }

  if (entity === 'container') {
    validateRequiredText(issues, payload, 'ownerName', 'Owner', 'المالك', isCreate);
    validateRequiredText(issues, payload, 'operatorName', 'المشغل', 'المشغل', isCreate);
    validatePositiveNumber(issues, payload, 'tareWeightKg', 'Tare weight', 'وزن الحاوية', isCreate);
    validatePositiveNumber(issues, payload, 'maxPayloadKg', 'Container payload', 'حمولة الحاوية', isCreate);
    validatePositiveNumber(issues, payload, 'maxVolumeCbm', 'Container volume', 'حجم الحاوية', isCreate);
  }

  if (entity === 'uom') {
    validateRequiredText(issues, payload, 'code', 'UOM code', 'رمز وحدة القياس', isCreate);
    validateRequiredText(issues, payload, 'nameEn', 'English UOM name', 'اسم وحدة القياس بالإنجليزية', isCreate);
    validateRequiredText(issues, payload, 'nameAr', 'Arabic UOM name', 'اسم وحدة القياس بالعربية', isCreate);
    validatePositiveNumber(
      issues,
      payload,
      'conversionFactorToBase',
      'Conversion factor to base',
      'معامل التحويل للوحدة الأساسية',
      isCreate
    );
  }

  if (entity === 'commodity') {
    validateRequiredText(issues, payload, 'hsCode', 'HS code', 'رمز HS الجمركي', isCreate);
    validateRequiredText(issues, payload, 'titleEn', 'English commodity title', 'اسم السلعة بالإنجليزية', isCreate);
    validateRequiredText(issues, payload, 'titleAr', 'Arabic commodity title', 'اسم السلعة بالعربية', isCreate);
    validateNonNegativeNumber(
      issues,
      payload,
      'importDutyRatePercent',
      'Import duty rate',
      'نسبة الرسوم الجمركية',
      isCreate
    );
    validateNonNegativeNumber(
      issues,
      payload,
      'vatRatePercent',
      'VAT rate',
      'نسبة ضريبة القيمة المضافة',
      isCreate
    );
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
