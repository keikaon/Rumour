# Rumour-App: Copilot Instructions

## Project Overview
Rumour is a hyper-local, ephemeral discovery tool featuring real-time location-based events with a 4-hour auto-expiry. Built with React/Vite frontend and Node.js/Express backend, using Firestore and Mapbox for real-time event visualization and proximity-gated content.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, Mapbox GL JS
- **Backend**: Node.js, Express, Firebase Admin SDK
- **Database**: Firestore (Free Tier)
- **Maps**: Mapbox GL JS for heatmap visualization
- **Authentication**: Firebase Auth
- **Deployment**: Vercel (Frontend), Render/Railway (Backend)

## Key Features
- **Pulse Map**: Real-time heat clustering of active events
- **Ephemeral Content**: 4-hour auto-expiry using Firestore TTL
- **Proximity Gate**: Blur/unblur based on GPS location (100m radius)
- **AI Moderation**: Google Gemini API for content safety
- **Explorer Mode**: Dynamic city-based UI theming
- **Community Flagging**: 3-flag auto-removal protocol

## Project Structure
```
/frontend           - React + Vite app
  /src
  /public
  package.json
/backend            - Node.js Express server
  /routes
  /controllers
  /middleware
  package.json
README.md
.env.example
```

## Setup Checklist
- [ ] Install dependencies (backend & frontend)
- [ ] Configure Firebase credentials (.env files)
- [ ] Setup Mapbox API key
- [ ] Install VS Code extensions (ESLint, Prettier)
- [ ] Run dev servers (frontend & backend)
- [ ] Test heatmap rendering
- [ ] Verify proximity logic
