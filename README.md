# Rumour-App README

## Overview
Rumour is a hyper-local, ephemeral discovery tool designed to combat digital isolation by encouraging real-world community interaction. 

**Core Concept**: Real-time, location-based events that disappear after 4 hours.

### Key Features
- **Pulse Map**: Real-time interactive map clustering of active "Buzzes".
- **Gradient of Curiosity (Proximity Gate)**: Tiered content revealing based on the user's physical distance to an event:
  - **> 5km (Ghost Mode)**: Hidden completely for city privacy.
  - **3km - 5km (The Pulse)**: Color-coded, overlapping glowing auras indicating event type.
  - **200m - 3km (The Category)**: Expandable icons showing event categories (e.g., Art, Party).
  - **< 200m (The Reveal)**: Full event details, exact locations, and interactive elements.
- **Secret Events**: "Digital Speakeasy" functionality requiring a password (default: *Fidelio!*) upon physical arrival.
- **Identity Gate**: Mandatory authentication layer prior to map access (Low Dwell Time philosophy).
- **Ephemeral Content**: Events auto-expire after 4 hours.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Mapbox GL JS
- **Backend**: Node.js, Express, Firebase
- **Database**: Firestore (Free Tier)
- **Auth**: Firebase Authentication
- **Maps**: Mapbox GL JS

## Project Structure
```text
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   └── firebase.js
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/           # Node.js Express server
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md