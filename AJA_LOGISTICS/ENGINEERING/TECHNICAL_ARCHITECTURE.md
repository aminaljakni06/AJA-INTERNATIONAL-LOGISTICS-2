# TECHNICAL ARCHITECTURE - AJA LOGISTICS

## Stack Overview
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, Motion animations.
- **Backend / API Proxy**: Node.js + Express (`server.ts`) serving as client SPA fallback & server-side API handler.
- **AI Integration**: Server-side Google GenAI (Gemini SDK) via API route `/api/ai/assistant`.
- **Database & Storage**: Firebase Firestore database & Firebase Authentication.
