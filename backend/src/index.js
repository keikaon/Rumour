const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { fetchBuzzesFromFirestore } = require('./firestore');
const { getMockUserBuzzes } = require('./services/buzzService');
const buzzRoutes = require('./routes/buzzes');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const USE_MOCK = process.env.USE_MOCK !== 'false';

// Dynamic demo dataset (tier distances relative to user lat/lng)
const generateDynamicMockData = (lat, lng) => {
  const now = Date.now();
  const ONE_HOUR = 3600000;

  return [
    { id: 1, type: 'Party', title: 'Faraway Festival', lat: lat + 0.0666, lng: lng + 0.0, expiresAt: now + ONE_HOUR * 5 },
    { id: 2, type: 'Party', title: 'Distant Rave', lat: lat + 0.0350, lng: lng + 0.0050, expiresAt: now + ONE_HOUR * 3 },
    { id: 21, type: 'Art', title: 'Distant Exhibit', lat: lat + 0.0420, lng: lng - 0.0030, expiresAt: now + ONE_HOUR * 2.5 },
    { id: 22, type: 'Music', title: 'Secret Gig', lat: lat + 0.0290, lng: lng + 0.0080, expiresAt: now + ONE_HOUR * 1.5 },
    { id: 23, type: 'Gaming', title: 'LAN Party', lat: lat + 0.0310, lng: lng - 0.0070, expiresAt: now + ONE_HOUR * 4 },
    { id: 24, type: 'Food', title: 'Pop-up Kitchen', lat: lat + 0.0380, lng: lng + 0.0090, expiresAt: now + ONE_HOUR * 2 },
    {
      id: 3,
      type: 'Art',
      icon: '🎨',
      lat: lat + 0.0150,
      lng: lng + 0.0100,
      zone: 'Kavaklıdere Arts District',
      teaser: 'Bring your own spray paint. Canvas provided.',
      title: 'Street Mural Unveiling',
      host: '@urban_canvas',
      description: 'Live painting session finishing up our newest street piece.',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80',
      expiresAt: now + ONE_HOUR * 2.2,
    },
    {
      id: 4,
      type: 'Party',
      icon: '🍸',
      lat: lat - 0.0050,
      lng: lng + 0.0050,
      zone: 'Skyline Towers',
      teaser: 'Sunset mixer. Tech house. Dress to impress.',
      title: 'Rooftop Mixer',
      host: '@skyline_events',
      description: 'Exclusive sunset mixer. Good vibes and networking.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      expiresAt: now + ONE_HOUR * 0.8,
    },
    {
      id: 5,
      type: 'Music',
      title: 'Local Indie Gallery',
      icon: '🎸',
      isSecret: false,
      lat: lat - 0.0006,
      lng: lng - 0.0007,
      zone: 'Çankaya Center',
      teaser: 'Acoustic sets and local student art.',
      host: '@çankaya_arts',
      description:
        'A pop-up visual arts gallery featuring 5 local university students. Wine and cheese provided.',
      image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80',
      isVerifiedSource: true,
      expiresAt: now + ONE_HOUR * 3.5,
    },
    {
      id: 6,
      type: 'Party',
      title: 'Underground Rave',
      icon: '🕺',
      isSecret: true,
      password: 'Fidelio!',
      lat: lat + 0.0005,
      lng: lng + 0.0008,
      zone: 'Industrial Alleys',
      teaser: 'Industrial techno all night. Entrance through the alleyway door.',
      host: '@unknown_frequency',
      description:
        'Industrial techno all night. Entrance is through the alleyway door. Do not post photos.',
      image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=500&q=80',
      isVerifiedSource: false,
      expiresAt: now + ONE_HOUR * 5.5,
    },
  ];
};

async function resolveBuzzes(lat, lng) {
  if (USE_MOCK) {
    const userCreated = getMockUserBuzzes();
    return {
      buzzes: [...generateDynamicMockData(lat, lng), ...userCreated],
      source: 'mock',
    };
  }

  try {
    const firestoreBuzzes = await fetchBuzzesFromFirestore();
    if (firestoreBuzzes && firestoreBuzzes.length > 0) {
      return { buzzes: firestoreBuzzes, source: 'firestore' };
    }
    if (firestoreBuzzes) {
      return { buzzes: [], source: 'firestore' };
    }
  } catch (err) {
    console.warn('[RUMOUR] Firestore fetch failed, falling back to mock:', err.message);
  }

  return { buzzes: generateDynamicMockData(lat, lng), source: 'mock-fallback' };
}

app.get('/api/health', (req, res) =>
  res.json({
    status: 'Rumour Backend is alive.',
    dataSource: USE_MOCK ? 'mock' : 'firestore',
    useMock: USE_MOCK,
  })
);

app.use('/api/buzzes', buzzRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/buzzes', async (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);
  if (isNaN(userLat) || isNaN(userLng)) return res.json({ buzzes: [], source: 'none' });

  const { buzzes, source } = await resolveBuzzes(userLat, userLng);
  res.json({ buzzes, source });
});

  // Seed demo data when running in mock mode for demoing the app locally
  if (USE_MOCK) {
    try {
      const { seedDemoBuzzes } = require('./services/buzzService');
      seedDemoBuzzes();
      console.log('[RUMOUR] Demo buzzes seeded for mock mode');
    } catch (err) {
      console.warn('[RUMOUR] Failed to seed demo buzzes:', err.message || err);
    }
  }

app.get('/', (req, res) => {
  res.send(
    '<h2>Rumour Backend</h2><p>API server running. Use <a href="/api/health">/api/health</a> or the frontend at port 3000.</p>'
  );
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`📡 [RUMOUR ENGINE] Transmitting on ${HOST}:${PORT} (USE_MOCK=${USE_MOCK})`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[RUMOUR] Unhandled error:', err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  res.status(status).json({ error: err && err.message ? err.message : 'Server error' });
});
