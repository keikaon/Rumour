import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { auth } from '../firebase';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// MATH ENGINE: Calculates distance in meters
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

// COLOR ENGINE: Returns specific glow styles based on event type
const getGlowStyle = (type) => {
  switch (type?.toLowerCase()) {
    case 'art':
      return 'bg-pink-500/70 shadow-[0_0_60px_30px_rgba(236,72,153,0.5)]'; // Pinkish
    case 'party':
      return 'bg-gradient-to-tr from-green-500/70 via-blue-500/70 to-purple-500/70 shadow-[0_0_60px_30px_rgba(59,130,246,0.5)]'; // Disco gradient
    case 'giveaway':
      return 'bg-white/70 shadow-[0_0_60px_30px_rgba(255,255,255,0.5)]'; // White
    default:
      return 'bg-zinc-500/50 shadow-[0_0_50px_20px_rgba(113,113,122,0.5)]'; // Default gray
  }
};

const MapContainer = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]); 
  
  const [userCoords, setUserCoords] = useState(null);
  const [buzzes, setBuzzes] = useState([]);

  useEffect(() => {
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [32.8597, 39.9334], 
      zoom: 13,
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });

    mapRef.current.addControl(geolocate);

    geolocate.on('geolocate', (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      setUserCoords({ lat, lng });

      // NEW MOCK DATA: Designed to test overlapping glows and categories
      setBuzzes((prev) => {
        if (prev.length > 0) return prev; 
        return [
          // Ghost/Pulse Tier (~4km away) - Overlapping to test Z-index!
          { id: 1, type: "Party", title: "Distant Rave", lat: lat + 0.035, lng: lng + 0.035 },
          { id: 2, type: "Art", title: "Distant Exhibit", lat: lat + 0.034, lng: lng + 0.036 },
          
          // Category Tier (~1.5km away) - Clickable to expand!
          { id: 3, type: "Giveaway", title: "Free Coffee", icon: "☕", lat: lat + 0.015, lng: lng + 0.015 },
          { id: 4, type: "Art", title: "Street Mural", icon: "🎨", lat: lat + 0.012, lng: lng - 0.015 },
          
          // Reveal Tier (< 200m away) - Secret Party!
          { id: 5, type: "Party", title: "Underground Rave", icon: "🕺", isSecret: true, password: "Fidelio!", lat: lat + 0.0005, lng: lng + 0.0005 }
        ];
      });
    });

    mapRef.current.on('load', () => geolocate.trigger());

    return () => mapRef.current.remove();
  }, []);

 // 3. THE PROXIMITY GATE & RENDERER (Updated for Smooth Animations)
  useEffect(() => {
    if (!mapRef.current || !userCoords || buzzes.length === 0) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // STEP 1: SORT BY DISTANCE (Furthest first, closest last). 
    const sortedBuzzes = [...buzzes].map(buzz => ({
      ...buzz,
      distance: getDistance(userCoords.lat, userCoords.lng, buzz.lat, buzz.lng)
    })).sort((a, b) => b.distance - a.distance);

    sortedBuzzes.forEach(buzz => {
      if (buzz.distance > 5000) return; // Ghost Mode

      const el = document.createElement('div');
      
      // TIER 2: THE PULSE (3000m - 5000m) - Overlapping Glows
      if (buzz.distance > 3000) {
        el.className = `flex items-center justify-center rounded-full transition-all duration-1000 ease-in-out cursor-pointer w-32 h-32 blur-[12px] mix-blend-screen animate-pulse ${getGlowStyle(buzz.type)}`;
      } 
      
      // TIER 3: THE CATEGORY (200m - 3000m) - The "Subtle Reveal" Expandable Icon
      else if (buzz.distance > 200) {
        // Base classes: Notice we use max-w-[48px] to start it as a perfect circle (48x48)
        // We use duration-500 and a custom cubic-bezier for a very premium, elastic slide.
        el.className = 'h-12 rounded-full flex items-center bg-zinc-800/90 border border-zinc-600 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] max-w-[48px] cursor-pointer hover:bg-zinc-700/90';
        
        // We pre-load both the icon and the text. The text starts at opacity-0.
        el.innerHTML = `
          <div class="w-12 h-12 shrink-0 flex items-center justify-center">
            <span class="text-2xl">${buzz.icon || "📍"}</span>
          </div>
          <div class="text-content flex flex-col justify-center transition-all duration-700 opacity-0 whitespace-nowrap pl-1 pr-5">
            <span class="text-xs font-bold text-white uppercase tracking-widest">${buzz.type} Event</span>
            <span class="text-[9px] text-zinc-400">Tap to close</span>
          </div>
        `;
        
        // INTERACTIVE STATE: Smooth CSS class swapping
        let isExpanded = false;
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevents map from zooming when clicking the marker
          const textContent = el.querySelector('.text-content');
          
          if (!isExpanded) {
            el.classList.remove('max-w-[48px]');
            el.classList.add('max-w-[250px]'); // Expands width smoothly
            textContent.classList.remove('opacity-0');
            textContent.classList.add('opacity-100'); // Fades text in
            isExpanded = true;
          } else {
            el.classList.remove('max-w-[250px]');
            el.classList.add('max-w-[48px]'); // Shrinks width back
            textContent.classList.remove('opacity-100');
            textContent.classList.add('opacity-0'); // Fades text out
            isExpanded = false;
          }
        });
      } 
      
      // TIER 4: THE REVEAL (< 200m) - Full Action Button
      else {
        // Added an inner glow ring and a gentle bounce hover effect to make it feel "active"
        el.className = 'h-12 rounded-full flex items-center bg-white text-black font-black text-sm shadow-[0_0_30px_rgba(255,255,255,0.4)] ring-4 ring-white/20 uppercase tracking-widest cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] pl-2 pr-5';
        
        el.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center mr-3">
            <span class="text-lg">${buzz.icon || "📍"}</span>
          </div>
          ${buzz.isSecret ? 'Secret Event' : buzz.title}
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (buzz.isSecret) {
            const pass = window.prompt("The door is locked. What is the password?");
            if (pass === (buzz.password || "Fidelio!")) {
              alert(`Access Granted: ${buzz.title} is at this exact location.`);
            } else {
              alert("Access Denied. You are not on the list.");
            }
          } else {
            alert(`You have arrived at: ${buzz.title}`);
          }
        });
      }

      // Attach the marker to the map
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([buzz.lng, buzz.lat])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [userCoords, buzzes]);
  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="pointer-events-auto">
          <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase leading-none drop-shadow-lg">Rumour</h1>
          <p className="text-zinc-300 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 drop-shadow-md">
            {userCoords ? "Verified In-Range" : "Triangulating..."}
          </p>
        </div>
        <button onClick={() => auth.signOut()} className="pointer-events-auto bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md text-white text-[10px] font-bold px-5 py-2.5 rounded-full border border-zinc-700/50 transition-all shadow-lg active:scale-95">
          Leave
        </button>
      </header>
    </div>
  );
};

export default MapContainer;