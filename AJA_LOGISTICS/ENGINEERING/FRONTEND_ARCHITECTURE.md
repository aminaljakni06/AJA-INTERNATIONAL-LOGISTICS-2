# FRONTEND ARCHITECTURE - AJA LOGISTICS

## Structure
- `/src/components/common`: Shared atomic UI components (Button, Card, Input, Modal, Table, Badge).
- `/src/components/layout`: Main framework layouts (Header, Footer, Sidebar, BottomNav, CustomerLayout, AdminLayout).
- `/src/context`: AuthContext (state management for roles, users, sessions) & LanguageContext (i18n).
- `/src/i18n`: `ar.ts`, `en.ts`, and `LanguageContext.tsx`.
- `/src/pages/public`: Public marketing pages (HomePage, Services, Tracking, Quotes, DownloadApp, Contact, Legal).
- `/src/pages/customer`: Portal screens for cargo owners.
- `/src/pages/admin`: Operational dashboards for staff & admins.
