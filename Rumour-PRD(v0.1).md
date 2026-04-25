Rumour: Product Requirements Document (PRD)

1. Technical Requirements Matrix

F1: Pulse Map

Requirement: Display active events as heat clusters.

Technical Logic: Use Mapbox GL JS heatmap layer with point_count weight for dynamic scaling.

F2: Auto-Expiry

Requirement: Content must vanish instantly upon expiration.

Technical Logic: expires_at timestamp check; implement TTL (Time To Live) index in Firestore/MongoDB.

F3: Proximity Gate

Requirement: Unlocks text/media only when within range.

Technical Logic: Logic: if (haversineDistance(userLocation, eventLocation) < 100m) { blur: none }.

F4: The Vouch

Requirement: Proof of presence reputation system.

Technical Logic: Incremental score given upon successful proximity check plus a required 10-minute dwell time.

F5: AI Safety

Requirement: Automated input filtering for all text.

Technical Logic: Pre-save hook using Gemini-2.5-Flash to scan for toxicity, PII, or commercial spam.

F6: Themed Toggle

Requirement: Dynamic UI skinning for different cities.

Technical Logic: React useEffect monitors city_id change and updates Tailwind global variables/CSS variables.
2. Data Schema (Draft)
{
  "rumour_id": "string (uuid)",
  "creator_id": "string (verified_uid)",
  "location": {
    "lat": "float",
    "lng": "float"
  },
  "content": {
    "title": "string",
    "description": "string (blurred by default)",
    "category": "enum [music, art, game, food, rally]"
  },
  "timestamps": {
    "created_at": "ISO8601",
    "expires_at": "created_at + 4h"
  },
  "metadata": {
    "city_id": "string",
    "vouch_count": "integer"
  }
}

3. Infrastructure & Environment

Frontend: React / React Native + Tailwind CSS for responsive styling.

Backend: Node.js + Firestore for real-time sync and automatic TTL capabilities.

Maps: Mapbox SDK for custom heatmap styling and geospatial queries.

Auth: Firebase Auth combined with Stripe Identity for verified human checks.

Payments: Stripe Connect to facilitate "The Digital Tip Jar."

4. Safety & Standards

Verification: All posting accounts must pass a third-party ID check (Stripe Identity).

Flagging Protocol: 3 unique flags from verified users who are physically within the 100m geofence trigger an automatic purge.

Privacy Policy: No persistent public user profiles, no activity history, and no digital "follow" graph.

5. Implementation Roadmap

Phase 1: Map Shell setup, Heatmap Logic implementation, and Mock Data generation.

Phase 2: GPS Integration, Haversine Proximity Logic, and UI Blur/Unblur Engine.

Phase 3: User Verification flow and Ephemeral Database Purge background jobs.

Phase 4: Explorer Mode UI Skins and City Metadata API integration.
