# Tech Stack — Rumour

## Overview
Rumour uses a polyglot stack optimized for rapid development and cross-platform parity:

- **Frontend (Web):** React + Vite + Tailwind CSS. Handles map UI, create flow, and desktop demo.
- **Mobile:** React Native + Expo (managed). Shares UI patterns and features with the web app where possible.
- **Backend:** Node.js + Express. Serves REST endpoints (`/api/*`) and mediates access to Firestore.
- **Database/Auth:** Firebase (Firestore + Firebase Auth). Server uses the Firebase Admin SDK for privileged operations and token verification.
- **AI Moderation:** Google Gemini (server-side) to moderate new `buzz` content before publishing.

## Roles
- React/React Native: UI layer, map rendering, user flows (create, view, vote).
- Firebase Auth: Identity provider (email/password and anonymous flows) and ID tokens for backend auth.
- Firestore: Primary data store for `buzzes`, votes, and basic user reputation data.
- Express Backend: Verifies Firebase ID tokens with the Admin SDK, performs moderation calls, enforces business rules (proximity checks, TTL), and writes to Firestore.
- Gemini: Content moderation (toxicity, policy checks) to automatically accept/reject/pending new signals.

## Dev / Production Notes
- Local development runs the backend in `USE_MOCK=true` mode (no Firestore). The backend exposes `/api/health` for quick checks.
- For production, set `USE_MOCK=false`, `FIREBASE_PROJECT_ID`, and provide a `FIREBASE_SERVICE_ACCOUNT_JSON` (or `GOOGLE_APPLICATION_CREDENTIALS`) so the backend can initialize the Admin SDK.

## Security
- All create/vote endpoints require Firebase ID tokens. The backend middleware `requireAuth` validates tokens and decorates `req.user`.
- Firestore writes are performed server-side with the Admin SDK to avoid exposing privileged operations to clients.
- Keep service account JSON out of source control. Use environment variables or a secrets manager in CI/CD.

## How AI Accelerates Development
- Gemini automates content moderation which removes a large manual review bottleneck. It:
  - Prevents abusive or policy-violating content from appearing in the demo.
  - Enables rapid iteration by returning deterministic moderation decisions used to gate DB writes.
  - Reduces QA overhead; the backend marks uncertain items as `pending` rather than failing the whole flow.

- Practical benefits:
  - Faster safe launch: lower moderation staff needs for demo/live runs.
  - Consistent UX: moderation decisions are centralized and reproducible across platforms.

## Runbook (quick)
- Local dev (mock backend):
```powershell
cd Rumour-App/backend
$env:USE_MOCK = 'true'
npm start
```
- Production (Admin SDK):
```powershell
cd Rumour-App/backend
$env:FIREBASE_PROJECT_ID = 'your-project-id'
$env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content .\serviceAccountKey.json -Raw
npm start
```

## Further Reading
- See `backend/README-firestore.md` for TTL and rules scripts.
- See `prodocs/DesignSystem.md` for visual tokens and spacing rules.
