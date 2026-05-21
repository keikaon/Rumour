# Rumour Mobile

Cross-platform React Native / Expo app for Rumour (iOS, Android).

**Stack:** Expo SDK 54, React Native 0.81, React 19.1. Requires **Node.js 20.19+** (see [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)).

## Prerequisites

- Node.js 20.19 or newer (LTS recommended)
- Backend running on port **5000** (`cd backend && npm start`)
- Firebase project (same as web frontend)
- **iOS Simulator / Mac**: `npm run ios`
- **Physical iPhone**: set `EXPO_PUBLIC_BACKEND_URL` to your computer's LAN IP

## Firebase / environment

Mobile uses the **same Firebase project** as the web app. You can maintain secrets in one place:

| Web ([`frontend/.env`](../frontend/.env)) | Mobile ([`mobile/.env`](.env)) |
|-------------------------------------------|--------------------------------|
| `VITE_FIREBASE_API_KEY` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `VITE_FIREBASE_PROJECT_ID` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |

[`app.config.js`](app.config.js) loads `frontend/.env` automatically and maps `VITE_FIREBASE_*` when `EXPO_PUBLIC_*` is not set. A [`mobile/.env`](.env) file is also provided with values copied from the web app.

After changing env files, restart Expo with a clean cache:

```bash
npx expo start -c
```

## Setup

1. Install dependencies:

```bash
cd mobile
npm install
npx expo install --fix   # after changing expo version
```

Do **not** run `npm audit fix --force` — it can bump `expo` to an incompatible major and break the project.

2. Environment (usually already done):

- **`mobile/.env`** — Expo variables (created from `frontend/.env`)
- Or only **`frontend/.env`** — mobile will read `VITE_FIREBASE_*` via `app.config.js`

To recreate `mobile/.env` from the example:

```bash
cp .env.example .env
```

Then copy the four `VITE_FIREBASE_*` values from `frontend/.env` into the matching `EXPO_PUBLIC_FIREBASE_*` keys.

3. Start the backend (port 5000), then Expo:

```bash
# Terminal 1 — repo root or backend/
cd backend && npm start

# Terminal 2
cd mobile && npm run start
```

4. Run on a target:

- `npm run ios` — iOS Simulator (uses `http://localhost:5000`)
- `npm run android` — Android emulator (uses `http://10.0.2.2:5000`)
- Scan QR with **Expo Go** on a physical device

## Physical iPhone / Android device

`localhost` on the phone points to the device itself, not your PC. In `mobile/.env`:

```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.42:5000
```

Replace with your machine's LAN IP. Ensure phone and PC are on the same Wi‑Fi and the backend listens on `0.0.0.0` (default for Express).

## iOS standalone / TestFlight

- Bundle ID: `com.rumour.mobile` (see `app.config.js`)
- Location permission strings and ATS for HTTP dev are configured in `app.config.js`
- Maps on iOS use **Apple Maps** (default); Android uses Google Maps in Expo Go
- Build with [EAS](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
eas build --platform ios --profile production   # TestFlight
eas submit --platform ios --profile production
```

Icons: `assets/icon.png` and `assets/splash.png` (regenerate with `node scripts/generate-assets.js`).

**Production API:** set EAS secrets / env for `EXPO_PUBLIC_BACKEND_URL` to your hosted backend (not LAN IP). Firebase vars via `eas secret:create` or `eas.json` env.

## Configuration reference

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_BACKEND_URL` | API base URL (default `http://localhost:5000`) |
| `EXPO_PUBLIC_FIREBASE_*` | Firebase Auth (`apiKey`, `authDomain`, `projectId` required) |

Config is loaded from repo-root `.env`, `mobile/.env`, and `frontend/.env` via `app.config.js`.

## Verified on device (checklist)

Run on a **physical iPhone** with Expo Go (Windows dev machine — no local iOS simulator):

| Step | Expected |
|------|----------|
| `cd backend && npm start` | `http://<LAN_IP>:5000/api/health` responds |
| `mobile/.env` → `EXPO_PUBLIC_BACKEND_URL=http://<LAN_IP>:5000` | Home status shows LAN URL, not `localhost` |
| `npx expo start -c` | QR opens app in Expo Go |
| Firebase sign-in | Same project as web |
| Location granted | Lat/lng on status card |
| **Initiate Scan** | Sonar overlay → Intel Report → tier-gated cards |
| Map pins | Tier 2 auras / zone pills / secret targets |
| Secret event (`Fidelio!`) | Password modal under 200m |

**LAN IP:** `ipconfig` → Wi‑Fi IPv4 (e.g. `192.168.x.x` or hotspot `172.20.x.x`). Allow Windows Firewall inbound TCP **5000** on private networks.

## Notes

- API path: `GET /api/buzzes?lat=&lng=` on the backend (no Vite proxy required)
- Tier gating, Intel Report, and secret unlock mirror `frontend/src/components/MapContainer.jsx`
- Buzz data is **mock** by default (`USE_MOCK=true` on backend). See root `.env.example` for Firestore mode.
