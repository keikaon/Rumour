# Rumour-App

## Overview
Rumour is a hyper-local, ephemeral discovery tool designed to combat digital isolation by encouraging real-world community interaction. 

**Core Concept**: Real-time, location-based events with a customizable lifespan of up to 6 hours, protected by a sophisticated 5-tier proximity-gated encryption system.

## Future Roadmap: Mobile Architecture
To fully realize Rumour's potential as a hyper-local, on-the-go discovery platform, the application is currently scheduled for a comprehensive mobile rewrite. For right now it is build as a web-app for easy-early access for me (as a non-Mac user) and faster updates.
Stay tight!

### 📡 Key Features

- **5-Tier Gradient of Curiosity**: Content is decrypted based on physical proximity to the source:
  - **Tier 1 (> 5km) - Ghost Mode**: Events are completely hidden to protect city-wide privacy.
  - **Tier 2 (3km - 5km) - The Pulse**: Massive, color-coded glowing auras indicate the category/vibe of the event.
  - **Tier 3 (1km - 3km) - The Echo**: Faint signals reveal the specific neighborhood or "Zone."
  - **Tier 4 (200m - 1km) - The Hook**: Users intercept a cryptic text teaser from the host to encourage final approach.
  - **Tier 5 (< 200m) - The Target**: Full decryption. Reveals exact titles, host details, and check-in functionality.

- **Tactical Signal Scanner**: A "Sonar Sweep" UI that allows users to refresh the local grid. It identifies active signals and generates an **Intel Report**, prioritizing the closest connections and listing nearby signatures.

- **Ephemeral Live Clocks**: Real-time `HH:MM:SS` countdown timers for every event. To drive urgency (FOMO), timers shift to a pulsing neon red when less than 1 hour remains.

- **Digital Speakeasy (Secret Doors)**: High-security events that remain locked even at < 200m. Users must enter a strictly case-sensitive password to reveal the final details.

- **Signal Spectrum (Color Coding)**: A vibrant visual language for the map:
  - **Party**: Blue/Green/Purple Gradient
  - **Art**: Neon Pink
  - **Music**: Glowing Amber
  - **Food**: Spicy Orange
  - **Gaming**: Cyber Cyan
  - **Giveaway**: Pure White

- **Verified Source System**: A reputation protocol for hosts. Reliable users earn a "Verified Source" badge (★) after successfully hosting 5+ events with high attendance.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Mapbox GL JS
- **Backend**: Node.js, Express
- **Database/Auth**: Firebase Firestore & Firebase Authentication
- **Animations**: Custom CSS Keyframes & Tailwind Transitions

## Project Structure
```text
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapContainer.jsx    # Master map engine, scanning logic & modals
│   │   │   ├── ProfileLegend.jsx   # Interactive Field Guide & Protocol Manual
│   │   │   └── HostReputation.jsx  # Trust & Badge logic
│   │   ├── App.jsx
│   │   └── firebase.js
├── backend/           # Node.js Express server
│   ├── src/
│   │   └── index.js       # Signal generator & Mock Data API
└── README.md