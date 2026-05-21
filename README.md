# Rumour-App

## Overview
Rumour is a hyper-local, ephemeral discovery tool designed to combat digital isolation by encouraging real-world community interaction.

**Core Concept**: Real-time, location-based events with a customizable lifespan of up to 6 hours, protected by a sophisticated 5-tier proximity-gated encryption system.

## Apps in this repo

| App | Stack | Purpose |
|-----|-------|---------|
| [`frontend/`](frontend/) | Vite + React + Mapbox | Production web UX (full tier UI, sonar, intel) |
| [`mobile/`](mobile/) | Expo SDK 54 + React Native 0.81 | iOS/Android companion — tier parity, Firebase auth, Apple/Google maps |
| [`backend/`](backend/) | Express | `GET /api/buzzes` — mock generator by default; optional Firestore |

See **[mobile/README.md](mobile/README.md)** for Expo setup, physical iPhone LAN IP, and EAS builds.

## Run locally

| Service | Command | URL |
|---------|---------|-----|
| Backend | `cd backend && npm start` | `http://localhost:5000` — `/api/buzzes`, `/api/health` |
| Web | `cd frontend && npm run dev` | `http://localhost:3000` — proxies `/api` → 5000 |
| Mobile | `cd mobile && npx expo start -c` | Expo Go / emulator; API default `localhost:5000` |

**Physical phone:** set `EXPO_PUBLIC_BACKEND_URL=http://<PC_LAN_IP>:5000` in `mobile/.env`. On Windows, use `ipconfig` for your Wi‑Fi IPv4 and allow firewall inbound on port **5000**.

## Data source

- **Default:** backend generates dynamic mock buzzes relative to `lat`/`lng` (`USE_MOCK=true`).
- **Firestore:** set `USE_MOCK=false`, `FIREBASE_PROJECT_ID`, and `FIREBASE_SERVICE_ACCOUNT_JSON` in backend env (see [`.env.example`](.env.example)). Collection: `buzzes` with `expiresAt` as Firestore Timestamp.

Auth uses Firebase (web + mobile). Buzz persistence is optional until Firestore is configured.

### Key features

- **5-Tier Gradient of Curiosity**: Content is decrypted based on physical proximity to the source:
  - **Tier 1 (> 5km) - Ghost Mode**: Events are completely hidden to protect city-wide privacy.
  - **Tier 2 (3km - 5km) - The Pulse**: Massive, color-coded glowing auras indicate the category/vibe of the event.
  - **Tier 3 (1km - 3km) - The Echo**: Faint signals reveal the specific neighborhood or "Zone."
  - **Tier 4 (200m - 1km) - The Hook**: Users intercept a cryptic text teaser from the host to encourage final approach.
  - **Tier 5 (< 200m) - The Target**: Full decryption. Reveals exact titles, host details, and check-in functionality.

- **Tactical Signal Scanner**: Sonar sweep + **Intel Report** (web and mobile).
- **Ephemeral Live Clocks**: Countdown timers; urgent styling under 1 hour.
- **Digital Speakeasy (Secret Doors)**: Case-sensitive password unlock at Tier 5.
- **Verified Source System**: Host reputation badges.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Mapbox GL JS
- **Mobile**: Expo SDK 54, React Native 0.81, React Native Maps, Firebase Auth
- **Backend**: Node.js, Express, firebase-admin (optional Firestore)
- **Database/Auth**: Firebase Firestore & Firebase Authentication

## Project Structure
```text
├── frontend/          # React + Vite application
│   └── src/components/MapContainer.jsx   # Reference tier UX
├── mobile/            # Expo app (see mobile/README.md)
├── backend/           # Express API
│   └── src/index.js   # Mock + optional Firestore
├── .env.example       # Root env template
└── README.md
```
