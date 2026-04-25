const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); 
app.use(express.json()); 

// 🧠 DYNAMIC GENERATOR: Now loaded with the "Sandwich of Details"
const generateDynamicMockData = (lat, lng) => {
  return [
    // 👻 TIER 1 (> 5km)
    { id: 1, type: "Party", title: "Faraway Festival", icon: "🎸", lat: lat + 0.0666, lng: lng + 0.0000 }, 

    // 🌟 TIER 2 (3km - 5km)
    { id: 2, type: "Party", title: "Distant Rave", lat: lat + 0.0316, lng: lng + 0.0003 }, 
    { id: 3, type: "Art", title: "Distant Exhibit", lat: lat + 0.0306, lng: lng + 0.0053 }, 
    { id: 4, type: "Giveaway", title: "Pop-up Shop", lat: lat - 0.0334, lng: lng + 0.0203 }, 

    // 📍 TIER 3 (200m - 3km) - These will be BLURRED on click
    { 
      id: 5, type: "Giveaway", title: "Free Coffee Promos", icon: "☕", 
      lat: lat + 0.0116, lng: lng + 0.0003,
      host: "@roasters_ankara", timeLimit: "Ends in 2h",
      description: "First 50 people to arrive get a free iced latte. We are testing our new summer beans!",
      image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80"
    }, 
    { 
      id: 6, type: "Party", title: "Rooftop Mixer", icon: "🍸", 
      lat: lat - 0.0034, lng: lng + 0.0203,
      host: "@skyline_events", timeLimit: "Ends in 4h",
      description: "Exclusive sunset mixer. Good vibes, tech house, and networking.",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80"
    }, 
    { 
      id: 7, type: "Art", title: "Street Mural Unveiling", icon: "🎨", 
      lat: lat + 0.0166, lng: lng - 0.0197,
      host: "@urban_canvas", timeLimit: "Ends in 1h",
      description: "Live painting session finishing up our newest street piece. Come grab a sticker.",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80"
    }, 

    // 🎯 TIER 4 (< 200m) - These will be CLEAR on click (or Password Locked)
    { 
      id: 8, type: "Art", title: "Local Indie Gallery", icon: "🖼️", isSecret: false, 
      lat: lat - 0.0006, lng: lng - 0.0007,
      host: "@çankaya_arts", timeLimit: "Ends in 3h",
      description: "A pop-up visual arts gallery featuring 5 local university students. Wine and cheese provided in the back room.",
      image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80"
    }, 
    { 
      id: 9, type: "Party", title: "Underground Rave", icon: "🕺", isSecret: true, password: "Fidelio!", 
      lat: lat + 0.0006, lng: lng + 0.0003,
      host: "@unknown_frequency", timeLimit: "Ends in 4h",
      description: "Industrial techno all night. Entrance is through the alleyway door. Do not post photos on social media.",
      image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=500&q=80"
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