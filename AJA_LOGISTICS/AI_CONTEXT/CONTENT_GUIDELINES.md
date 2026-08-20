# CONTENT GUIDELINES - AJA LOGISTICS

## Bilingual Content Governance
- Every user-facing UI component must utilize `useLanguage()` from `LanguageContext` to retrieve localized strings from `src/i18n/ar.ts` and `src/i18n/en.ts`.
- Text directions (`rtl` for Arabic, `ltr` for English) must automatically adapt at the root level (`document.documentElement.dir`).
- Numbers, currencies (`SAR` / `ريال سعودي`), and dates must adapt appropriately to the active locale.
