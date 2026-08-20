# AJA INTERNATIONAL LOGISTICS — Enterprise Validation Framework Documentation
**Phase:** Enterprise Shared Infrastructure Foundation  
**Module:** Enterprise Validation Framework  
**Version:** 1.0  

---

## 1. Executive Summary & Architecture Philosophy
The **Enterprise Validation Framework** provides a single, unified, strongly typed validation engine across the client UI, Express API routes, AI services, and background services for the AJA International Logistics platform.

### Core Architecture Pipeline
Every input payload passes through a standardized, multi-stage pipeline:

`Input Data` ➔ `Sanitization (XSS & Unicode)` ➔ `Field Rules` ➔ `Cross-Field Business Rules` ➔ `Localization` ➔ `Result (Clean Payload / Standardized Errors)`

### Key Principles
1. **Single Definition:** Validation rules are defined once in shared schemas and reused across both client React forms and server Express route middlewares.
2. **Deep Sanitization:** Automatic XSS escaping, space trimming, and Unicode NFC normalization for all input strings.
3. **Logistics & Financial Specialization:** Built-in Modulo 11 check digit verification for ISO containers, Modulo 7 check for Air Waybills, and Modulo 97 check for IBAN numbers.
4. **Bilingual Messages:** All validation errors produce native English and Arabic messages (`messageEn`, `messageAr`).

---

## 2. Core Validation Rules (`/src/utils/validationRules.ts`)

| Rule Function | Description / Use Case |
| :--- | :--- |
| `requiredRule` | Ensures field is non-empty and non-null |
| `emailRule` | RFC 5322 email syntax check |
| `phoneRule` | E.164 international phone number format |
| `minLengthRule` / `maxLengthRule` | String length boundaries |
| `numericRangeRule` | Min / Max numeric range |
| `taxIdRule` | GCC 15-digit Tax / VAT ID (ZATCA / UAE FTA) |
| `commercialRegistrationRule` | GCC 10-digit Commercial Registration (CR) |
| `urlRule` / `dateRule` | Web URL and ISO Date validation |

---

## 3. Supply Chain & Logistics Validation Suite (`/src/utils/logisticsValidators.ts`)

### 3.1 ISO 6346 Container Check Digit Verification
Validates container numbers (e.g., `MSKU1234567`) using the ISO 6346 Modulo 11 algorithm with letter weighting.

```typescript
import { validateISOContainerNumber, isoContainerRule } from './utils/logisticsValidators';

const result = validateISOContainerNumber('MSKU1234567');
// Returns { isValid: true, ownerCode: 'MSK', checkDigit: 7, calculatedCheckDigit: 7 }
```

### 3.2 Air Waybill (AWB) Check Digit Verification
Validates 11-digit AWB numbers using the Modulo 7 algorithm.

```typescript
import { validateAirWaybill } from './utils/logisticsValidators';

const res = validateAirWaybill('05712345675');
// Returns { isValid: true, prefix: '057', serialNumber: '1234567', checkDigit: 5 }
```

### 3.3 Other Logistics Rules
- **`hsCodeRule`:** 6-to-10 digit Customs HS Commodity Code check.
- **`incotermRule`:** Incoterms 2020 validation (`EXW`, `FCA`, `CPT`, `CIP`, `DAP`, `DPU`, `DDP`, `FAS`, `FOB`, `CFR`, `CIF`).
- **`iataAirportRule`:** 3-letter IATA Airport Code check (e.g., `RUH`, `JED`, `DXB`).
- **`unLocodeRule`:** 5-character UN/LOCODE sea port code check (e.g., `SAJED`).
- **`imoDangerousGoodsRule`:** IMO hazardous material class check (Class 1.1 through Class 9).

---

## 4. Financial & Treasury Validation Suite (`/src/utils/financialValidators.ts`)

- **`validateIBAN`:** ISO 13616 IBAN validation using Modulo 97 checksum division.
- **`swiftBicRule`:** 8 or 11 character SWIFT/BIC code format check.
- **`currencyCodeRule`:** ISO 4217 Currency Code check (`SAR`, `USD`, `AED`, `EUR`, `GBP`, etc.).
- **`validateInvoiceTotalsCrossField`:** Cross-field arithmetic verification ($Subtotal + VAT - Discount = Total$).

---

## 5. React Form Integration (`useEnterpriseValidation`)

```tsx
import { useEnterpriseValidation } from './hooks/useEnterpriseValidation';
import { requiredRule, emailRule } from './utils/validationRules';

const shipmentSchema = {
  schemaName: 'CreateShipmentForm',
  fields: {
    customerEmail: {
      field: 'customerEmail',
      labelEn: 'Customer Email',
      labelAr: 'البريد الإلكتروني للعميل',
      rules: [requiredRule('customerEmail', 'Customer Email', 'البريد الإلكتروني للعميل'), emailRule('customerEmail', 'Customer Email', 'البريد الإلكتروني للعميل')],
      sanitize: true,
    },
  },
};

function CreateShipmentForm() {
  const { validateForm, getErrorMessage, hasFieldError } = useEnterpriseValidation({
    schema: shipmentSchema,
    isAr: false,
  });

  const handleSubmit = async (formData) => {
    const result = await validateForm(formData);
    if (result.isValid) {
      // Process sanitized payload
      console.log('Sanitized Data:', result.sanitizedValue);
    }
  };
}
```

---

## 6. Express API Validation Middleware (`enterpriseValidationMiddleware`)

```typescript
import { validateRequestBody } from './middleware/enterpriseValidationMiddleware';

app.post('/api/shipments', validateRequestBody(shipmentSchema), async (req, res) => {
  // req.body is already sanitized and validated!
});
```
