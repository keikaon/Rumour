# Rumour-App README

## Overview
Rumour is a hyper-local, ephemeral discovery tool designed to combat digital isolation by encouraging real-world community interaction.

**Core Concept**: Real-time, location-based events that disappear after 4 hours.

### Key Features
- **Pulse Map**: Real-time heat clustering of active "Buzzes"
- **Ephemeral Content**: Events auto-expire after 4 hours
- **Proximity Gate**: Content unlocks only within 100m radius
- **AI Safety**: Automated content moderation
- **Explorer Mode**: Dynamic city-based UI themes

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Mapbox GL JS
- **Backend**: Node.js, Express, Firebase
- **Database**: Firestore (Free Tier)
- **Auth**: Firebase Authentication
- **Maps**: Mapbox GL JS

## Project Structure
```
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
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
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git
- Mapbox Account (free tier: 50k map loads/month)
- Firebase Project (Spark plan: $0/month)

### Installation

1. **Clone and navigate to project**
   ```bash
   cd Rumour-App
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Fill in your Firebase and Mapbox credentials
   ```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### Building for Production

**Backend:**
```bash
cd backend
npm run build
```

**Frontend:**
```bash
cd frontend
npm run build
```

## MVP Features (Phase 1)

- [x] Project scaffold
- [ ] Mapbox heatmap integration
- [ ] Firestore buzzes collection
- [ ] GPS proximity detection (Haversine formula)
- [ ] Blur/unblur UI logic
- [ ] Firebase authentication
- [ ] 4-hour auto-expiry logic
- [ ] AI content moderation (Gemini API)
- [ ] 3-flag community removal

## Zero-Cost Deployment

- **Frontend**: Vercel (Free Tier)
- **Backend**: Render or Railway (Free Tier - no CC required for hobby)
- **Database**: Firebase Spark Plan ($0/month)
- **Maps**: Mapbox Free Tier (50k loads/month)

## Contributing

See the project scope and implementation plan for detailed guidelines.

## License

MIT
