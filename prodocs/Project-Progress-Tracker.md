# Rumour Project — Progress Tracker

Bitirme (graduation) delivery tracker: user-created rumours, AI moderation, graduation docs, and core vs UI boundaries.

**Last updated:** 2026-05-30

---

## Architecture snapshot

```text
mobile/frontend features/createBuzz/  →  POST /api/buzzes  →  buzzService  →  Gemini  →  Firestore/mock
core engine (unchanged): proximity.js, SignalMap, BuzzDetailModal, GET /api/buzzes, scan flow
```

---

## Core vs UI boundary

### Core engine — do not break

| File | Role |
|------|------|
| `mobile/src/lib/proximity.js` | Distance tiers, processBuzzes |
| `mobile/src/components/SignalMap.jsx` | Map markers |
| `mobile/src/components/BuzzDetailModal.jsx` | Detail modal |
| `frontend/src/components/MapContainer.jsx` | Map + scan (only thin CreateBuzzFeature mount) |
| `backend/src/index.js` | GET buzzes + mock generator |
| `backend/src/firestore.js` | Read path + createBuzz export |

### Feature UI — safe to iterate

| Path | Role |
|------|------|
| `mobile/src/features/createBuzz/` | Mobile create flow |
| `frontend/src/features/createBuzz/` | Web create flow |
| `backend/src/services/buzzService.js` | Create validation + orchestration |
| `backend/src/moderation/gemini.js` | AI moderation |
| `backend/src/routes/buzzes.js` | POST handler |
| `backend/src/middleware/auth.js` | Firebase token verify |

---

## Graduation documentation (`/prodocs`)

- [ ] **`prodocs/tech-stack.md`** — technologies, rationale, Gemini usage in dev
- [ ] **`prodocs/DesignSystem.md`** — colors, typography, component rules
- [ ] **`prodocs/Progress.md`** — dev journal (decisions, errors resolved)

---

## Feature A: Start a Rumour

### Backend

- [x] `POST /api/buzzes` with Firebase auth
- [x] Validation (type, title, lat/lng, duration 1–6h)
- [x] 50m proximity gate (server-side Haversine)
- [x] Mock mode: in-memory user buzzes merged on GET
- [x] Firestore `createBuzzInFirestore()` when `USE_MOCK=false`
- [x] Extended schema: `creatorId`, `createdAt`, `status`, `moderationStatus`

### Mobile UI (`mobile/src/features/createBuzz/`)

- [x] `CreateBuzzModal.jsx` — bottom sheet, dark theme
- [x] `useCreateBuzz.js` + `createBuzzApi.js`
- [x] `CreateBuzzFeature` FAB on HomeScreen (≤5 lines integration)
- [x] Keyboard: BuzzDetailModal pattern (listeners + ScrollView)

### Web UI (`frontend/src/features/createBuzz/`)

- [x] Modal with zinc Tailwind tokens
- [x] FAB + MapContainer integration
- [x] `max-h-[90dvh] overflow-y-auto` for mobile viewports

---

## Feature B: AI content moderation (Gemini)

- [x] `@google/generative-ai` in backend
- [x] `moderation/gemini.js` — pre-save scan
- [x] Policies: vulgar language, slurs, hate speech, racism, harassment, PII, spam
- [x] Turkish + English in prompt
- [x] Fail-closed when API errors; skip when `GOOGLE_AI_API_KEY` unset (dev warning)
- [ ] Add `GOOGLE_AI_API_KEY` to `backend/.env` for production moderation

---

## Feature C: Community flagging (future)

- [ ] `POST /api/buzzes/:id/flag`
- [ ] 3-flag auto-delete within 100m geofence
- [ ] Report UI in BuzzDetailModal

---

## Design & keyboard QA

### Color tokens (mandatory)

**Mobile:** `colors.background` `#09090b`, `surface` `#111827`, `surfaceElevated` `#18181b`, accent `#22c55e`, CTA white/black.

**Web:** `zinc-900/950/800`, green-500 CTA, red error banners like Login.

### Keyboard checklist

- [ ] iOS: last field visible above keyboard
- [ ] iOS: drag dismisses keyboard
- [ ] Android: padding correct on keyboard show
- [ ] Submit works with keyboard open
- [ ] No white flash in scroll/sheet areas
- [ ] Web: modal scroll on small viewport

---

## Environment setup

| Variable | Location | Purpose |
|----------|----------|---------|
| `USE_MOCK` | `backend/.env` | `true` = mock + in-memory creates |
| `FIREBASE_PROJECT_ID` | `backend/.env` | Firestore + auth verify |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `backend/.env` | Server writes + token verify |
| `GOOGLE_AI_API_KEY` | `backend/.env` | Gemini moderation |
| `EXPO_PUBLIC_BACKEND_URL` | `mobile/.env` | Phone → PC API |
| `EXPO_PUBLIC_FIREBASE_*` | `mobile/.env` | Mobile auth |

---

## Testing matrix

| Scenario | Expected |
|----------|----------|
| Clean title/description | 201, appears after scan |
| Slur in title | 400 + moderationReason |
| Post without auth | 401 |
| Post without GPS coords | 400 validation |
| Core map scan after create | Still works |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-30 | Initial create flow + Gemini moderation + feature module separation |
| 2026-05-30 | Verified backend auth + create buzz flow; marked plan statuses completed |
