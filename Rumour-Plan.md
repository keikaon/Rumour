Rumour: Implementation Plan (Zero-Cost MVP v1.0)

This document outlines the technical implementation for Rumour while ensuring $0 operating costs by utilizing free tiers and open-source alternatives.

1. Project Initialization & Architecture

Goal: Set up a decoupled architecture on free hosting platforms.

[ ] 1.1 Workspace Setup

Initialize separate directories: /frontend and /backend.

[ ] 1.2 Backend Initialization (Node.js)

Initialize Node.js in /backend.

Install dependencies: express, firebase-admin, cors, dotenv.

Zero-Cost Strategy: Plan for deployment on Render or Railway (Free Tier) which does not require a credit card for basic hobby projects.

[ ] 1.3 Frontend Initialization (React + Vite)

Initialize React with Vite in /frontend.

Zero-Cost Strategy: Deploy on Vercel or Netlify (Free Tier).

Setup Tailwind CSS using CSS variables for the "Explorer Mode" skins.

2. Infrastructure & Data Layer (Free Tiers)

Goal: Use the Firebase "Spark" (Free) plan for all database and auth needs.

[ ] 2.1 Database Schema (Firestore)

Implement the "Buzz" collection.

Zero-Cost Tip: Use Firestore's native TTL (Time-To-Live) if available in your region, or a simple get query filtering by expires_at to save on "Reads" by not fetching expired data.

[ ] 2.2 Authentication (Alternative to Stripe Identity)

Change: Replace Stripe Identity with Firebase Email/Social Auth.

Verification Logic: Users start as "Unverified." They become "Community Verified" only after their first "Proof of Presence" (staying at a Buzz for 10 minutes). This costs $0.

[ ] 2.3 Map Provider Setup

Register for Mapbox (Free tier covers 50k map loads/month).

Fallback: Leaflet.js + OpenStreetMap (100% free/open source).

3. Core Feature: The Pulse Map (F1)

Goal: Real-time visualization without heavy API costs.

[ ] 3.1 Heatmap Implementation

Use mapbox-gl heatmap layer.

Optimize costs by limiting map re-renders. Only fetch data when the user moves the map significantly (Debouncing).

[ ] 3.2 Real-time Buzz Feed

Use Firestore onSnapshot for real-time updates. (Firebase Spark plan allows 50,000 reads/day for free).

4. Ephemerality & Proximity Logic (F2, F3)

Goal: Client-side processing to reduce backend compute time.

[ ] 4.1 Post Creation

Logic: expires_at = Date.now() + 14400000 (4 hours).

Prevent "Remote Posting": Frontend must verify GPS coordinates are within 50m of the "Buzz" location before allowing the POST request.

[ ] 4.2 The Blur Engine

Implement proximity check using the Haversine Formula on the client side to save server CPU cycles.

CSS Logic: Use Tailwind blur-md and pointer-events-none for users > 100m away.

5. Safety & Community Moderation (F4, F5)

Goal: Use free AI credits for automated safety.

[ ] 5.1 AI Moderation (Google AI Studio)

Integrate gemini-1.5-flash via the Google AI Studio Free API.

Use it to scan for commercial spam/toxicity. (Free tier allows ample requests per minute for an MVP).

[ ] 5.2 Community Flagging (The 3-Flag Rule)

Logic: If a post receives 3 flags from users within the 100m geofence, the backend auto-deletes the document.

[ ] 5.3 The Vouch System

Reward physical presence. A "Vouch" is only valid if the user's last_known_location is within the Buzz radius.

6. Explorer Mode: City Skins (F6)

Goal: High-end UI feel with zero asset costs.

[ ] 6.1 Dynamic Theming

Create a themes.json file.

Use CSS Variables (--primary, --bg-color) that change based on the user's detected city.

Use Lucide-React (Free icons) and standard system fonts to avoid hosting/licensing fees.

7. Deployment & Launch

[ ] 7.1 Cost Monitoring

Set budget alerts in Firebase at $0.01 to ensure you stay in the free tier.

[ ] 7.2 Mock Data

Use a script to populate local Firestore emulator with "Buzzes" for testing before pushing to production.