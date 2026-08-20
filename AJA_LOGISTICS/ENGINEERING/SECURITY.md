# SECURITY SPECIFICATION - AJA LOGISTICS

## Principles
1. **Zero Secret Exposure**: All API keys (e.g. Gemini API key) are strictly kept server-side in `server.ts`.
2. **Database Security**: Firestore Security Rules enforce access control based on user identity (`request.auth != null`) and roles.
3. **Role-Based Access Control (RBAC)**: Enforced across client navigation and backend API endpoints.
