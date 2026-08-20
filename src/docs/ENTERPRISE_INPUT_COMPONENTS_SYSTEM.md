# AJA INTERNATIONAL LOGISTICS — Enterprise Input Components System Documentation
**Phase:** Enterprise UI System  
**Module:** Enterprise Input Components System  
**Version:** 1.0  

---

## 1. Executive Summary & Architecture Philosophy
The **Enterprise Input Components System** standardizes every input control across all business modules in the AJA INTERNATIONAL LOGISTICS platform (Customer Portal, Admin Dashboard, Logistics Control Tower, MDM, Finance, and Fleet Management).

### Input System Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                   ENTERPRISE INPUT COMPONENTS LIBRARY                  │
│                                                                        │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ EnterpriseTextInput   │   │ EnterpriseSelectInput                │  │
│  │ (Text, Mail, Pass,    │   │ (Select, Combobox, Radio, Checkbox,  │  │
│  │ Phone, Currency, etc.)│   │  Switch, Segmented, Tags/Chips)      │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
│  │ EnterprisePicker      │   │ EnterpriseFileUpload                 │  │
│  │ (Date, Time, DateTime,│   │ (Drag&Drop, File Preview, Size/Type  │  │
│  │ Range, Timezone)      │   │  Validation, Progress Bar)           │  │
│  └───────────────────────┘   └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ EnterpriseAdvancedInputs (OTP, Rating, Slider, Color, Map, QR)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE INPUT WRAPPER                          │
│  - Localization (English & Arabic RTL/LTR)                             │
│  - Permission Enforcement (canView, canEdit, isHidden, isReadOnly)     │
│  - Validation Severity & Error / Warning Messages                     │
│  - Character Counters & Tooltips & Automation IDs                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Components Summary

| Component | File Path | Key Features |
| :--- | :--- | :--- |
| **`EnterpriseInputWrapper`** | `/src/components/inputs/EnterpriseInputWrapper.tsx` | Labeling, required/optional indicators, tooltips, character counter, error/warning severity messages, permission guards. |
| **`EnterpriseTextInput`** | `/src/components/inputs/EnterpriseTextInput.tsx` | Text, Email, Password reveal, Search, Phone, Currency, Percentage, Masked, Copy value, Clear button, Multiline textarea. |
| **`EnterpriseSelectInput`** | `/src/components/inputs/EnterpriseSelectInput.tsx` | Single Select, Multi Select, Combobox with live filtering, Radio Group, Checkbox Group, Toggle Switch, Segmented Control, Tag/Chip selector. |
| **`EnterpriseDateTimePicker`** | `/src/components/inputs/EnterpriseDateTimePicker.tsx` | Date, Time, DateTime, Date Range, Month, Year, Timezone Selector, and preset shortcuts. |
| **`EnterpriseFileUpload`** | `/src/components/inputs/EnterpriseFileUpload.tsx` | Drag & Drop box, Category file types (PDF, Excel, Images), file size checking, preview list, multi-file upload. |
| **`EnterpriseAdvancedInputs`** | `/src/components/inputs/EnterpriseAdvancedInputs.tsx` | OTP/PIN numeric boxes, Star rating, Slider range, Hex color picker, Map location pin picker, Barcode/QR scanner simulator. |

---

## 3. Usage Examples

### 3.1 Text Input with Password Reveal & Validation
```tsx
import { EnterpriseTextInput } from '../components/inputs';

<EnterpriseTextInput
  fieldId="user_password"
  fieldName="password"
  labelEn="Password"
  labelAr="كلمة المرور"
  type="password"
  required
  copyable
  showCharacterCount
  maxLength={32}
  errorEn={validationErrorEn}
  errorAr={validationErrorAr}
  isAr={isArabic}
  onChange={(val) => setPassword(val)}
/>
```

### 3.2 Segmented Option Selector
```tsx
import { EnterpriseSelectInput } from '../components/inputs';

<EnterpriseSelectInput
  fieldId="shipment_mode"
  fieldName="shipmentMode"
  labelEn="Transport Mode"
  labelAr="وسيلة النقل"
  mode="segmented"
  options={[
    { value: 'AIR', labelEn: 'Air Freight', labelAr: 'شحن جوي' },
    { value: 'SEA', labelEn: 'Sea Freight', labelAr: 'شحن بحري' },
    { value: 'LAND', labelEn: 'Land Transport', labelAr: 'نقل بري' },
  ]}
  value={selectedMode}
  onChange={(val) => setSelectedMode(val)}
  isAr={isArabic}
/>
```

---

## 4. Accessibility & Localization Standards
- **RTL / LTR Automatic Direction:** Input elements automatically switch alignment and icon positions when `isAr={true}`.
- **ARIA Compliance:** Inputs emit `aria-invalid`, `aria-describedby`, `aria-required`, `aria-disabled`, and `aria-readonly`.
- **Keyboard Navigation:** Full support for Tab traversal, Escape key dismissal, Arrow key navigation in dropdowns, and Backspace auto-focus in OTP boxes.
