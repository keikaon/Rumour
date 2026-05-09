const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 DYNAMIC GENERATOR: The Master Demo Dataset
const generateDynamicMockData = (lat, lng) => {
  const now = Date.now();
  const ONE_HOUR = 3600000;

  return [
    // 👻 TIER 1 (> 5km) - Invisible Ghost Mode
    { id: 1, type: "Party", title: "Faraway Festival", lat: lat + 0.0666, lng: lng + 0.0000, expiresAt: now + ONE_HOUR * 5 }, 

    // 🌪️ TIER 2 (3km - 5km) - THE AURA CLUSTER (Spread out ~800m to prevent mud)
    { id: 2, type: "Party", title: "Distant Rave", lat: lat + 0.0350, lng: lng + 0.0050, expiresAt: now + ONE_HOUR * 3 }, 
    { id: 21, type: "Art", title: "Distant Exhibit", lat: lat + 0.0420, lng: lng - 0.0030, expiresAt: now + ONE_HOUR * 2.5 }, 
    { id: 22, type: "Music", title: "Secret Gig", lat: lat + 0.0290, lng: lng + 0.0080, expiresAt: now + ONE_HOUR * 1.5 }, 
    { id: 23, type: "Gaming", title: "LAN Party", lat: lat + 0.0310, lng: lng - 0.0070, expiresAt: now + ONE_HOUR * 4 }, 
    { id: 24, type: "Food", title: "Pop-up Kitchen", lat: lat + 0.0380, lng: lng + 0.0090, expiresAt: now + ONE_HOUR * 2 }, 

    // 📍 TIER 3 (1km - 3km) - The Echo (Faint Signal)
    { 
      id: 3, type: "Art", icon: "🎨", 
      lat: lat + 0.0150, lng: lng + 0.0100, 
      zone: "Kavaklıdere Arts District", teaser: "Bring your own spray paint. Canvas provided.",
      title: "Street Mural Unveiling", host: "@urban_canvas", description: "Live painting session finishing up our newest street piece.",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80",
      expiresAt: now + ONE_HOUR * 2.2 
    }, 

    // 🪝 TIER 4 (200m - 1km) - The Hook (Teaser Reveal)
    { 
      id: 4, type: "Party", icon: "🍸", 
      lat: lat - 0.0050, lng: lng + 0.0050, 
      zone: "Skyline Towers", teaser: "Sunset mixer. Tech house. Dress to impress.",
      title: "Rooftop Mixer", host: "@skyline_events", description: "Exclusive sunset mixer. Good vibes and networking.",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
      expiresAt: now + (ONE_HOUR * 0.8) // UNDER 1 HOUR!
    },

    // 🎯 TIER 5A (< 200m) - NORMAL TARGET (No Password)
    { 
      id: 5, type: "Music", title: "Local Indie Gallery", icon: "🎸", isSecret: false, 
      lat: lat - 0.0006, lng: lng - 0.0007, 
      zone: "Çankaya Center", teaser: "Acoustic sets and local student art.",
      host: "@çankaya_arts", description: "A pop-up visual arts gallery featuring 5 local university students. Wine and cheese provided.",
      image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80",
      isVerifiedSource: true,
      expiresAt: now + ONE_HOUR * 3.5
    },

    // 🤫 TIER 5B (< 200m) - SECRET TARGET (Strictly Locked)
    { 
      id: 6, type: "Party", title: "Underground Rave", icon: "🕺", isSecret: true, password: "Fidelio!", 
      lat: lat + 0.0005, lng: lng + 0.0008, 
      zone: "Industrial Alleys", teaser: "Industrial techno all night. Entrance through the alleyway door.",
      host: "@unknown_frequency", description: "Industrial techno all night. Entrance is through the alleyway door. Do not post photos.",
      image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=500&q=80",
      isVerifiedSource: false,
      expiresAt: now + ONE_HOUR * 5.5
    }
  ];
};

app.get('/api/health', (req, res) => res.json({ status: 'Rumour Backend is alive.' }));

app.get('/api/buzzes', (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);
  if (!userLat || !userLng || isNaN(userLat) || isNaN(userLng)) return res.json({ buzzes: [] });
  res.json({ buzzes: generateDynamicMockData(userLat, userLng) });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📡 [RUMOUR ENGINE] Transmitting on port ${PORT}`));