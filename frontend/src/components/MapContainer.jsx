import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { auth } from '../firebase';

// 🔑 Mapbox Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * 🧮 MATH ENGINE: HAVERSINE FORMULA
 */
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 🎨 VISUAL ENGINE: NEON GLOWS
 */
const getGlowStyle = (type) => {
  const category = type?.toLowerCase();
  if (category === 'art') return 'bg-pink-500/70 shadow-[0_0_60px_30px_rgba(236,72,153,0.5)]';
  if (category === 'party') return 'bg-gradient-to-tr from-green-500/70 via-blue-500/70 to-purple-500/70 shadow-[0_0_60px_30px_rgba(59,130,246,0.5)]';
  if (category === 'giveaway') return 'bg-white/70 shadow-[0_0_60px_30px_rgba(255,255,255,0.5)]';
  return 'bg-zinc-500/50 shadow-[0_0_50px_20px_rgba(113,113,122,0.5)]';
};

const MapContainer = () => {
  // --- REFS ---
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const geolocateControlRef = useRef(null);

  // --- STATE ---
  const [userCoords, setUserCoords] = useState(null);
  const [buzzes, setBuzzes] = useState([]);
  const [selectedBuzz, setSelectedBuzz] = useState(null);
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [locationStatus, setLocationStatus] = useState('locating'); 
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showError, setShowError] = useState(false); // New: For built-in Access Denied UI

  /**
   * 📡 DATA ACTION: FETCH BUZZES
   */
  const loadBuzzesFromBackend = async (lat, lng) => {
    console.log("📡 [NETWORK] Fetching events from server...");
    try {
      const response = await fetch(`http://localhost:5000/api/buzzes?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      
      const processed = data.buzzes.map(buzz => ({
        ...buzz,
        distance: getDistanceInMeters(lat, lng, buzz.lat, buzz.lng)
      })).sort((a, b) => b.distance - a.distance);

      setBuzzes(processed);
      setLocationStatus('success');
      setTimeout(() => setLocationStatus('ready'), 1500);
    } catch (error) {
      console.error("🚨 [NETWORK] Fetch failed:", error);
      setLocationStatus('error');
    }
  };

  /**
   * 🗺️ MAPBOX INITIALIZATION
   */
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [32.8597, 39.9334], 
      zoom: 14,
      pitch: 45
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showUserLocation: true 
    });

    map.addControl(geolocate);
    geolocateControlRef.current = geolocate;

    map.on('load', () => {
      mapRef.current = map;
      geolocate.trigger();

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          loadBuzzesFromBackend(lat, lng);
        },
        (err) => console.warn("⚠️ [GPS] Native lock failed."),
        { enableHighAccuracy: true }
      );
    });

    geolocate.on('geolocate', (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserCoords({ lat, lng });
      loadBuzzesFromBackend(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /**
   * 📍 MARKER RENDERING ENGINE
   */
  useEffect(() => {
    if (!mapRef.current || buzzes.length === 0) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    buzzes.forEach(buzz => {
      if (buzz.distance > 5000) return;

      const el = document.createElement('div');
      
      if (buzz.distance > 3000) {
        el.className = `flex items-center justify-center rounded-full w-32 h-32 blur-[12px] mix-blend-screen animate-pulse cursor-pointer ${getGlowStyle(buzz.type)}`;
      } 
      else if (buzz.distance > 200) {
        el.className = 'h-12 rounded-full flex items-center bg-zinc-900/90 border border-zinc-700 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-500 max-w-[48px] cursor-pointer hover:bg-zinc-800';
        el.innerHTML = `
          <div class="w-12 h-12 shrink-0 flex items-center justify-center pointer-events-none"><span class="text-2xl">${buzz.icon || "📍"}</span></div>
          <div class="text-content flex flex-col justify-center opacity-0 whitespace-nowrap pl-1 pr-5 pointer-events-none">
            <span class="text-xs font-black text-white uppercase tracking-widest">${buzz.type}</span>
          </div>
        `;
        let expanded = false;
        el.onclick = (e) => {
          e.stopPropagation();
          const txt = el.querySelector('.text-content');
          if (!expanded) {
            el.classList.replace('max-w-[48px]', 'max-w-[220px]');
            txt.classList.replace('opacity-0', 'opacity-100');
            expanded = true;
          } else {
            setSelectedBuzz(buzz);
            setIsUnlocked(false);
            setIsCheckedIn(false);
            setShowError(false);
          }
        };
      } 
      else {
        el.className = 'h-12 rounded-full flex items-center bg-white text-black font-black text-xs shadow-2xl ring-4 ring-white/10 uppercase tracking-widest cursor-pointer transition-all hover:scale-110 pl-2 pr-5';
        el.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center mr-3 pointer-events-none"><span>${buzz.icon || "📍"}</span></div>
          <span class="pointer-events-none">${buzz.isSecret ? 'SECRET EVENT' : buzz.title}</span>
        `;
        el.onclick = (e) => {
          e.stopPropagation();
          setSelectedBuzz(buzz);
          setIsUnlocked(false);
          setIsCheckedIn(false);
          setShowError(false);
          setPasswordAttempt("");
        };
      }

      const m = new mapboxgl.Marker({ element: el }).setLngLat([buzz.lng, buzz.lat]).addTo(mapRef.current);
      markersRef.current.push(m);
    });
  }, [buzzes]);

  // --- ACTIONS ---
  const handleRecenter = () => {
    if (mapRef.current && userCoords) {
      // Logic: Preserve current zoom/pitch by only providing center
      mapRef.current.flyTo({ 
        center: [userCoords.lng, userCoords.lat], 
        essential: true 
      });
    }
  };

  const handlePassword = (e) => {
    e.preventDefault();
    const correctPass = (selectedBuzz.password || "fidelio").toLowerCase();
    if (passwordAttempt.toLowerCase() === correctPass) {
      setIsUnlocked(true);
      setShowError(false);
      setIsInputFocused(false);
    } else {
      setShowError(true);
      setPasswordAttempt("");
      // Auto-hide error after 3s
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-zinc-950 text-white font-sans antialiased">
      
      {/* 🗺️ MAP */}
      <div className={`absolute inset-0 transition-all duration-1000 ${locationStatus !== 'ready' ? 'blur-2xl opacity-30 scale-110' : 'blur-0 opacity-100'}`}>
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* 🎬 LOADING OVERLAY */}
      {locationStatus !== 'ready' && (
        <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center pointer-events-none bg-black/40">
          <h1 className="text-7xl font-black italic uppercase text-white/5 absolute top-1/4">Rumour</h1>
          {locationStatus === 'locating' && (
            <div className="flex flex-col items-center animate-fadeIn">
              <div className="w-14 h-14 border-4 border-zinc-800 border-t-white rounded-full animate-spin mb-6" />
              <p className="text-xs font-black uppercase tracking-[0.4em] animate-pulse">Syncing City Grid...</p>
            </div>
          )}
          {locationStatus === 'success' && (
            <div className="flex flex-col items-center animate-bounceScale">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <span className="text-black text-3xl font-black">✓</span>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.4em]">Grid Locked</p>
            </div>
          )}
        </div>
      )}

      {/* HEADER */}
      <header className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-40 transition-opacity duration-700 ${locationStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white drop-shadow-2xl">Rumour</h1>
        <button onClick={() => auth.signOut()} className="bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Leave</button>
      </header>

      {/* RE-CENTER */}
      <button 
        onClick={handleRecenter}
        className={`absolute top-24 right-6 z-40 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all ${locationStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="text-black text-xl">🎯</span>
      </button>

      {/* 🥪 THE MODAL */}
      {selectedBuzz && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center pb-6 px-4 pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={() => setSelectedBuzz(null)} />
          
          <div className={`relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto transition-transform duration-500 animate-slideUp ${isInputFocused ? '-translate-y-44' : ''}`}>
            
            {isCheckedIn ? (
              <div className="relative flex flex-col items-center justify-center p-10 text-center bg-zinc-950 min-h-[450px]">
                <div className="absolute inset-0 opacity-40 blur-3xl scale-150 bg-cover bg-center animate-fadeIn" style={{ backgroundImage: `url(${selectedBuzz.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-transparent" />
                <div className="relative z-10 animate-bounceScale flex flex-col items-center w-full">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl"><span className="text-4xl">{selectedBuzz.icon}</span></div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">You're Here.</h2>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest bg-black/50 px-5 py-2 rounded-full border border-zinc-800 mb-12">Confirmed: {selectedBuzz.title}</p>
                  <button onClick={() => auth.signOut()} className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all mb-4">Lock Phone & Dive In</button>
                  <button onClick={() => setIsCheckedIn(false)} className="text-zinc-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">Return to map</button>
                </div>
              </div>
            ) : (
              <>
                {selectedBuzz.distance > 200 && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl p-8 text-center">
                    <span className="text-6xl mb-6">🔒</span>
                    <h3 className="text-white font-black text-3xl uppercase tracking-widest mb-2 leading-none">Locked</h3>
                    <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-widest mb-8 bg-zinc-800 px-4 py-2 rounded-lg border border-zinc-700">{(selectedBuzz.distance / 1000).toFixed(1)}km Away</p>
                    <p className="text-zinc-500 text-xs px-6 leading-relaxed">This Rumour is visible to verified physical users within 200 meters.</p>
                    <button onClick={() => setSelectedBuzz(null)} className="mt-10 bg-white text-black px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Got it</button>
                  </div>
                )}

                {/* 🔒 SECRET PASSWORD SCREEN */}
                {selectedBuzz.distance <= 200 && selectedBuzz.isSecret && !isUnlocked && (
                  <div 
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center p-10 text-center border-b-[6px] border-red-500 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedBuzz.image})` }}
                  >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />
                    
                    <div className="relative z-10 w-full flex flex-col items-center">
                      <span className="text-6xl mb-6 animate-pulse">🤫</span>
                      <h3 className="text-red-500 font-black text-3xl uppercase tracking-widest mb-2 leading-none">Secret Door</h3>
                      
                      {/* BUILT-IN ERROR UI */}
                      <div className={`transition-all duration-300 mb-6 ${showError ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                        <p className="text-white bg-red-600/80 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                          Access Denied
                        </p>
                      </div>

                      <form onSubmit={handlePassword} className="w-full flex flex-col gap-4">
                        <input 
                          type="text" value={passwordAttempt} onChange={e => setPasswordAttempt(e.target.value)} 
                          onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)} 
                          placeholder="PASSWORD..." 
                          className={`w-full bg-zinc-900/90 border rounded-2xl py-5 text-white text-center uppercase font-black outline-none transition-all text-xs tracking-widest ${showError ? 'border-red-500 animate-shake' : 'border-zinc-800 focus:border-red-500'}`} 
                        />
                        <button type="submit" className="bg-red-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Knock</button>
                      </form>
                      <button onClick={() => setSelectedBuzz(null)} className="mt-8 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Go Back</button>
                    </div>
                  </div>
                )}

                <div className={`transition-all duration-700 ${selectedBuzz.distance > 200 ? 'blur-2xl opacity-20 scale-110 pointer-events-none' : 'opacity-100'}`}>
                  <div className="w-full aspect-[4/5] bg-cover bg-center" style={{ backgroundImage: `url(${selectedBuzz.image})` }}>
                    <div className="absolute top-6 left-6 bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> LIVE NOW
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">{selectedBuzz.host}</p>
                    <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">{selectedBuzz.title}</h2>
                    <p className="text-zinc-400 text-sm mt-5 leading-relaxed">{selectedBuzz.description}</p>
                    <div className="mt-10 pt-8 border-t border-zinc-800 flex gap-4">
                      <button onClick={() => setSelectedBuzz(null)} className="flex-1 bg-zinc-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase transition-all">Close</button>
                      <button onClick={() => setIsCheckedIn(true)} className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl transition-all">I'm Here</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🧪 CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounceScale { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounceScale { animation: bounceScale 0.4s cubic-bezier(0.17, 0.88, 0.32, 1.2) forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default MapContainer;