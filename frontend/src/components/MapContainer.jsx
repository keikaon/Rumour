import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { auth } from "../firebase";
import ProfileLegend from "./ProfileLegend";
import { CreateBuzzFeature } from "../features/createBuzz";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// 🧮 MATH ENGINE: Distance calculation
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🎨 THE MASTER COLOR ENGINE
const getGlowStyle = (type) => {
  const category = type?.toLowerCase();

  if (category === "art")
    return "bg-pink-500/70 shadow-[0_0_60px_30px_rgba(236,72,153,0.5)]";
  if (category === "party")
    return "bg-gradient-to-tr from-green-500/70 via-blue-500/70 to-purple-500/70 shadow-[0_0_60px_30px_rgba(59,130,246,0.5)]";
  if (category === "giveaway")
    return "bg-plain-100/70 shadow-[0_0_60px_30px_rgba(249,221,244,0.5)]";
  if (category === "music")
    return "bg-amber-500/70 shadow-[0_0_60px_30px_rgba(245,158,11,0.5)]";
  if (category === "food")
    return "bg-orange-500/70 shadow-[0_0_60px_30px_rgba(249,115,22,0.5)]";
  if (category === "gaming")
    return "bg-cyan-500/70 shadow-[0_0_60px_30px_rgba(6,182,212,0.5)]";
  if (category === "fitness")
    return "bg-emerald-500/70 shadow-[0_0_60px_30px_rgba(16,185,129,0.5)]";

  return "bg-secondary-500/50 shadow-[0_0_50px_20px_rgba(83,172,117,0.25)]";
};

const MapContainer = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // States
  const [userCoords, setUserCoords] = useState(null);
  const [buzzes, setBuzzes] = useState([]);
  const [selectedBuzz, setSelectedBuzz] = useState(null);
  const [passwordAttempt, setPasswordAttempt] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [locationStatus, setLocationStatus] = useState("locating");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [hostReputation, setHostReputation] = useState(null);

  // 📡 SCANNING LOGIC
  const [isScanning, setIsScanning] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [showIntelReport, setShowIntelReport] = useState(false);

  // ⏱️ TIMER ENGINE
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (expiresAt) => {
    const diff = expiresAt - now;
    if (diff <= 0) return "00:00:00";
    const h = Math.floor(diff / 3600000)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((diff % 3600000) / 60000)
      .toString()
      .padStart(2, "0");
    const s = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Loading Progress Simulator
  useEffect(() => {
    if (locationStatus === "locating") {
      const interval = setInterval(() => {
        setLoadingProgress((prev) =>
          prev >= 90 ? prev : prev + Math.random() * 15,
        );
      }, 400);
      return () => clearInterval(interval);
    } else if (locationStatus === "success" || locationStatus === "ready") {
      setLoadingProgress(100);
    }
  }, [locationStatus]);

  const generateLocalMockData = (lat, lng) => {
    const now = Date.now();
    const ONE_HOUR = 3600000;

    return [
      {
        id: 1,
        type: "Party",
        title: "Faraway Festival",
        lat: lat + 0.0666,
        lng: lng + 0.0,
        expiresAt: now + ONE_HOUR * 5,
      },
      {
        id: 2,
        type: "Party",
        title: "Distant Rave",
        lat: lat + 0.035,
        lng: lng + 0.005,
        expiresAt: now + ONE_HOUR * 3,
      },
      {
        id: 21,
        type: "Art",
        title: "Distant Exhibit",
        lat: lat + 0.042,
        lng: lng - 0.003,
        expiresAt: now + ONE_HOUR * 2.5,
      },
      {
        id: 22,
        type: "Music",
        title: "Secret Gig",
        lat: lat + 0.029,
        lng: lng + 0.008,
        expiresAt: now + ONE_HOUR * 1.5,
      },
      {
        id: 23,
        type: "Gaming",
        title: "LAN Party",
        lat: lat + 0.031,
        lng: lng - 0.007,
        expiresAt: now + ONE_HOUR * 4,
      },
      {
        id: 24,
        type: "Food",
        title: "Pop-up Kitchen",
        lat: lat + 0.038,
        lng: lng + 0.009,
        expiresAt: now + ONE_HOUR * 2,
      },
      {
        id: 3,
        type: "Art",
        icon: "🎨",
        lat: lat + 0.015,
        lng: lng + 0.01,
        zone: "Kavaklıdere Arts District",
        teaser: "Bring your own spray paint. Canvas provided.",
        title: "Street Mural Unveiling",
        host: "@urban_canvas",
        description:
          "Live painting session finishing up our newest street piece.",
        image:
          "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80",
        expiresAt: now + ONE_HOUR * 2.2,
      },
      {
        id: 4,
        type: "Party",
        icon: "🍸",
        lat: lat - 0.005,
        lng: lng + 0.005,
        zone: "Skyline Towers",
        teaser: "Sunset mixer. Tech house. Dress to impress.",
        title: "Rooftop Mixer",
        host: "@skyline_events",
        description: "Exclusive sunset mixer. Good vibes and networking.",
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
        expiresAt: now + ONE_HOUR * 0.8,
      },
      {
        id: 5,
        type: "Music",
        title: "Local Indie Gallery",
        icon: "🎸",
        isSecret: false,
        lat: lat - 0.0006,
        lng: lng - 0.0007,
        zone: "Çankaya Center",
        teaser: "Acoustic sets and local student art.",
        host: "@çankaya_arts",
        description:
          "A pop-up visual arts gallery featuring 5 local university students. Wine and cheese provided.",
        image:
          "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80",
        isVerifiedSource: true,
        expiresAt: now + ONE_HOUR * 3.5,
      },
      {
        id: 6,
        type: "Party",
        title: "Underground Rave",
        icon: "🕺",
        isSecret: true,
        password: "Fidelio!",
        lat: lat + 0.0005,
        lng: lng + 0.0008,
        zone: "Industrial Alleys",
        teaser:
          "Industrial techno all night. Entrance through the alleyway door.",
        host: "@unknown_frequency",
        description:
          "Industrial techno all night. Entrance is through the alleyway door. Do not post photos.",
        image:
          "https://images.unsplash.com/photo-1574169208507-84376144848b?w=500&q=80",
        isVerifiedSource: false,
        expiresAt: now + ONE_HOUR * 5.5,
      },
    ];
  };

  const loadBuzzesFromBackend = async (lat, lng) => {
    const fallback = generateLocalMockData(lat, lng)
      .map((buzz) => ({
        ...buzz,
        distance: getDistanceInMeters(lat, lng, buzz.lat, buzz.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    try {
      const response = await fetch(`/api/buzzes?lat=${lat}&lng=${lng}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data?.buzzes) ? data.buzzes : [];
      if (list.length === 0) {
        throw new Error("No buzzes returned from backend");
      }

      const processed = list
        .map((buzz) => ({
          ...buzz,
          distance: getDistanceInMeters(lat, lng, buzz.lat, buzz.lng),
        }))
        .sort((a, b) => a.distance - b.distance);

      if (processed.length === 0) {
        throw new Error("No buzzes returned from backend");
      }

      setBuzzes(processed);
      return processed;
    } catch (error) {
      console.error("Fetch failed", error);
      setBuzzes(fallback);
      return fallback;
    }
  };

  // 🛰️ THE SCAN COMMAND
  const initiateScan = async () => {
    if (!userCoords) return;
    setIsScanning(true);
    setFoundCount(0);
    setShowIntelReport(false);

    const results = await loadBuzzesFromBackend(userCoords.lat, userCoords.lng);

    let counter = 0;
    const interval = setInterval(() => {
      if (counter < results.length) {
        counter++;
        setFoundCount(counter);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setShowIntelReport(true);
        }, 1000);
      }
    }, 300);
  };

  // Request geolocation with proper permission handling
  const requestLocation = () => {
    setLocationStatus("locating");
    if (!navigator.geolocation) {
      setLocationStatus("error");
      // fallback to map center
      const fallbackLat = 39.9334;
      const fallbackLng = 32.8597;
      setUserCoords({ lat: fallbackLat, lng: fallbackLng });
      loadBuzzesFromBackend(fallbackLat, fallbackLng).then(() => {
        setLocationStatus("success");
        setTimeout(() => setLocationStatus("ready"), 1500);
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        loadBuzzesFromBackend(lat, lng).then(() => {
          setLocationStatus("success");
          setTimeout(() => setLocationStatus("ready"), 1500);
        });
      },
      (err) => {
        // Permission denied — show permission overlay instead of falling back
        if (err && err.code === 1) {
          setLocationStatus("permission");
        } else {
          // other errors: fallback to map center
          setLocationStatus("error");
          const fallbackLat = 39.9334;
          const fallbackLng = 32.8597;
          setUserCoords({ lat: fallbackLat, lng: fallbackLng });
          loadBuzzesFromBackend(fallbackLat, fallbackLng).then(() => {
            setLocationStatus("success");
            setTimeout(() => setLocationStatus("ready"), 1500);
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const openLocationSettings = () => {
    const ua = (navigator.userAgent || "").toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isEdge =
      ua.includes("edg/") || ua.includes("edga") || ua.includes("edgios");
    const isChrome = ua.includes("chrome") || ua.includes("crios");
    const isFirefox =
      ua.includes("firefox") || ua.includes("fennec") || ua.includes("fxios");
    const isSafari = !isChrome && !isFirefox && ua.includes("safari");
    const isOpera = ua.includes("opr/") || ua.includes("opera");
    const isSamsung = ua.includes("samsungbrowser");
    const isBrave = ua.includes("brave");
    const isUC = ua.includes("ucbrowser");
    const isWebView =
      ua.includes("wv") ||
      ua.includes("webview") ||
      (isAndroid && ua.includes("version/") && !ua.includes("chrome"));

    // Build platform-specific, browser-aware guidance
    let instructions = "";

    if (isAndroid) {
      if (isChrome) {
        instructions =
          "Chrome (Android): Tap the lock icon in the address bar → Site settings → Location → Allow. Or open Chrome → Settings → Site settings → Location and allow for this site.";
      } else if (isSamsung) {
        instructions =
          "Samsung Internet: Menu → Settings → Sites and downloads → Site permissions → Location → Allow for this site.";
      } else if (isFirefox) {
        instructions =
          "Firefox (Android): Tap the lock icon → Permissions → Location and allow this site, or open Firefox → Settings → Site permissions → Location.";
      } else if (isEdge) {
        instructions =
          "Edge (Android): Open Edge → Settings → Site permissions → Location and allow for this site.";
      } else if (isOpera) {
        instructions =
          "Opera (Android): Open Opera → Settings → Site settings → Location and allow this site.";
      } else if (isBrave) {
        instructions =
          "Brave (Android): Tap the lock icon → Site settings → Location → Allow, or open Brave settings → Site settings → Location.";
      } else if (isUC) {
        instructions =
          "UC Browser (Android): Open browser settings → Privacy & security → Site permissions → Location and allow this site.";
      } else if (isWebView) {
        instructions =
          "Android WebView / in-app browser: Open device Settings → Apps → find the app (e.g., Chrome or host app) → Permissions → Location → Allow. Or open the site in a full browser.";
      } else {
        instructions =
          "Android: Open the lock icon (left of the address bar) → Site settings → Location and allow this site, or open your browser settings → Site settings → Location.";
      }
      instructions +=
        "\n\nAlso make sure Android system Location is enabled: Settings → Location.";
    } else if (isIOS) {
      if (isSafari) {
        instructions =
          'Safari (iOS): Open iOS Settings → Safari → Location → Set to "While Using the App" or open Settings → Privacy & Security → Location Services → Safari Websites → Allow.';
      } else if (isChrome) {
        instructions =
          "Chrome (iOS / CriOS): iOS controls Chrome permissions. Open iOS Settings → Chrome → Location → While Using the App.";
      } else if (isFirefox) {
        instructions =
          "Firefox (iOS): Open iOS Settings → Firefox → Location → While Using the App.";
      } else if (isWebView) {
        instructions =
          "iOS WebView / in-app browser: Open iOS Settings → Privacy & Security → Location Services and ensure the host app has Location permission, or open the site in Safari.";
      } else {
        instructions =
          "iOS: Open the iOS Settings app → find your browser (Safari/Chrome/Firefox) → Location → While Using the App; also ensure Location Services is enabled.";
      }
      instructions +=
        "\n\nTip: On iOS you may need to change the permission from the system Settings app rather than within the browser.";
    } else {
      // Desktop/unknown fallback
      if (isEdge) {
        instructions =
          "Edge: Open Edge → Settings → Cookies and site permissions → Location → Allow for this site.";
      } else if (isChrome) {
        instructions =
          "Chrome: Open Chrome → Settings → Privacy and security → Site Settings → Location → Allow for this site.";
      } else if (isFirefox) {
        instructions =
          "Firefox: Open Firefox → Settings → Privacy & Security → Permissions → Location → Settings... and allow this site.";
      } else if (isOpera) {
        instructions =
          "Opera: Open Opera → Settings → Advanced → Privacy & security → Site settings → Location → Allow for this site.";
      } else if (isSafari) {
        instructions =
          "Safari (macOS): Open Safari → Preferences → Websites → Location and allow this site, or use System Settings → Privacy & Security → Location Services.";
      } else {
        instructions =
          "Open your browser settings and enable Location/Geolocation permissions for this site.";
      }
      instructions +=
        "\n\nAfter enabling Location, return to this page and click Retry.";
    }

    // Try deep-link for desktop browsers where supported. Mobile browsers usually do not allow deep-links.
    try {
      if (!isAndroid && !isIOS) {
        if (isEdge) window.open("edge://settings/content/location", "_blank");
        else if (isChrome)
          window.open("chrome://settings/content/location", "_blank");
        else if (isFirefox) window.open("about:preferences#privacy", "_blank");
        else if (isOpera)
          window.open("opera://settings/content/location", "_blank");
      }
    } catch (e) {
      // ignore
    }

    // Provide clear, actionable guidance to the user.
    alert(
      instructions +
        "\n\nIf you still see issues, try opening this site in the browser's main app (not an in-app browser) and retry.",
    );
  };

  useEffect(() => {
    if (mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [32.8597, 39.9334],
      zoom: 14,
      pitch: 45,
    });

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate);

    map.on("load", () => {
      mapRef.current = map;
      geolocate.trigger();
      // Request location (handles permission vs other errors)
      requestLocation();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw Markers
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (isScanning) return;

    buzzes.forEach((buzz) => {
      if (buzz.distance > 5000) return;

      const el = document.createElement("div");

      if (buzz.distance > 3000) {
        el.className = `flex items-center justify-center rounded-full w-32 h-32 blur-[12px] mix-blend-screen animate-pulse cursor-pointer pointer-events-none ${getGlowStyle(buzz.type)}`;
      } else if (buzz.distance > 1000) {
        el.className =
          "h-10 rounded-full flex items-center bg-secondary-900/60 border border-secondary-700/50 shadow-xl backdrop-blur-md px-3 cursor-pointer hover:bg-secondary-800 transition-all";
        el.innerHTML = `<span class="text-lg mr-2">${buzz.icon || "📍"}</span><div class="flex flex-col"><span class="text-[8px] font-black text-plain-300 uppercase tracking-widest">${buzz.type}</span><span class="text-[9px] font-bold text-plain-300 truncate max-w-[100px]">${buzz.zone || "Unknown"}</span></div>`;
        el.onclick = () => setSelectedBuzz(buzz);
      } else if (buzz.distance > 200) {
        el.className =
          "h-12 rounded-full flex items-center bg-secondary-900 border border-secondary-600 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-500 max-w-[48px] cursor-pointer hover:border-plain-100/50";
        el.innerHTML = `
          <div class="w-12 h-12 shrink-0 flex items-center justify-center"><span class="text-2xl">${buzz.icon || "📍"}</span></div>
          <div class="text-content flex flex-col justify-center opacity-0 whitespace-nowrap pl-1 pr-5">
            <span class="text-[9px] font-black text-plain-300 uppercase tracking-widest">${buzz.zone}</span>
            <span class="text-xs font-black text-white uppercase tracking-widest mt-0.5">Teaser Unlocked</span>
          </div>`;
        let expanded = false;
        el.onclick = () => {
          if (!expanded) {
            el.classList.replace("max-w-[48px]", "max-w-[220px]");
            el.querySelector(".text-content").classList.replace(
              "opacity-0",
              "opacity-100",
            );
            expanded = true;
          } else {
            setSelectedBuzz(buzz);
          }
        };
      } else {
        el.className =
          "h-12 rounded-full flex items-center bg-plain-100 text-secondary-900 font-black text-xs shadow-2xl ring-4 ring-white/10 uppercase tracking-widest cursor-pointer transition-all hover:scale-110 pl-2 pr-5";
        el.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-tertiary-500/10 flex items-center justify-center mr-3"><span>${buzz.icon || "📍"}</span></div>
          <span>${buzz.isSecret ? "SECRET EVENT" : buzz.title}</span>`;
        el.onclick = () => {
          setSelectedBuzz(buzz);
          setIsUnlocked(false);
          setPasswordAttempt("");
          setPasswordError(false);
        };
      }

      const m = new mapboxgl.Marker({ element: el })
        .setLngLat([buzz.lng, buzz.lat])
        .addTo(mapRef.current);
      markersRef.current.push(m);
    });
  }, [buzzes, isScanning]);

  const closeEverything = () => {
    setSelectedBuzz(null);
    setIsCheckedIn(false);
    setIsUnlocked(false);
    setIsInputFocused(false);
    setPasswordError(false);
    setShowIntelReport(false);
    setHostReputation(null);
  };

  const getIdToken = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    } catch (e) {
      return null;
    }
  };

  const voteBuzz = async (buzzId, type) => {
    const token = await getIdToken();
    const res = await fetch(`/api/buzzes/${buzzId}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ type }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Vote failed");
    }
    const data = await res.json();
    return data.vote;
  };

  const unvoteBuzz = async (buzzId) => {
    const token = await getIdToken();
    const res = await fetch(`/api/buzzes/${buzzId}/vote`, {
      method: "DELETE",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Remove vote failed");
    }
    const data = await res.json();
    return data.result;
  };

  const reportBuzz = async (buzzId) => {
    const token = await getIdToken();
    if (!userCoords) {
      throw new Error("Current location required to report a signal.");
    }
    const res = await fetch(`/api/buzzes/${buzzId}/flag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userLat: userCoords.lat,
        userLng: userCoords.lng,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Report failed");
    }
    const data = await res.json();
    return data.report;
  };

  const fetchHostReputation = async (userId) => {
    if (!userId) return null;
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/users/${userId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) return null;
      const d = await res.json();
      setHostReputation(d.reputation ?? 0);
      return d.reputation ?? 0;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (selectedBuzz && selectedBuzz.creatorId) {
      fetchHostReputation(selectedBuzz.creatorId);
    } else {
      setHostReputation(null);
    }
  }, [selectedBuzz]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-secondary-900 text-white font-sans antialiased">
      {/* 🗺️ MAP LAYER */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${locationStatus !== "ready" || isScanning ? "blur-2xl opacity-30 scale-110" : "blur-0 opacity-100"}`}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* 📡 SONAR SCANNING OVERLAY */}
      {isScanning && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute w-[600px] h-[600px] border border-primary-500/20 rounded-full animate-[ping_4s_linear_infinite]" />
          <div
            className="absolute w-[400px] h-[400px] border border-primary-500/40 rounded-full animate-[ping_4s_linear_infinite]"
            style={{ animationDelay: "1s" }}
          />

          <div className="relative z-10 flex flex-col items-center bg-secondary-900/60 backdrop-blur-xl px-10 py-8 rounded-[3rem] border border-primary-500/30 shadow-[0_0_50px_rgba(83,172,117,0.2)]">
            <span
              className="text-5xl mb-4 animate-spin"
              style={{ animationDuration: "3s" }}
            >
              📡
            </span>
            <h2 className="text-primary-500 font-mono text-xs font-black uppercase tracking-[0.3em] mb-2">
              Intercepting Signals...
            </h2>
            <p className="text-white font-black text-4xl italic tracking-tighter">
              {foundCount} <span className="text-primary-500/50">FOUND</span>
            </p>
          </div>
        </div>
      )}

      {/* 🎬 INITIAL LOADING OVERLAY */}
      {locationStatus !== "ready" && !isScanning && (
        <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center pointer-events-none bg-secondary-900/40 backdrop-blur-sm">
          <div className="relative text-7xl font-black italic uppercase tracking-tighter select-none mb-16">
            <h1 className="opacity-0">Rumour</h1>
            <h1 className="absolute left-0 top-0 text-white/10 w-full text-center">
              Rumour
            </h1>
            <h1
              className="absolute left-0 -top-6 pt-6 pb-6 text-white overflow-hidden whitespace-nowrap transition-all duration-300 ease-out text-left [text-shadow:0_0_8px_rgba(255,255,255,1),0_0_20px_rgba(255,255,255,0.6)]"
              style={{ width: `${loadingProgress}%` }}
            >
              Rumour
            </h1>
          </div>

          <div className="h-24 flex flex-col items-center justify-center">
            {locationStatus === "locating" ? (
              <div className="flex flex-col items-center animate-fadeIn">
                <div className="w-12 h-12 border-4 border-secondary-800 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-plain-300 animate-pulse">
                  Syncing local grid...
                </p>
              </div>
            ) : locationStatus === "success" ? (
              <div className="flex flex-col items-center animate-bounceScale">
                <div className="w-12 h-12 bg-plain-100 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                  <span className="text-secondary-900 text-2xl font-black">
                    ✓
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">
                  Grid Locked
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ⚠️ PERMISSION ERROR OVERLAY */}
      {locationStatus === "permission" && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-secondary-900/85 pointer-events-auto">
          <div className="max-w-md w-full mx-6 p-8 bg-secondary-900 border border-secondary-800 rounded-2xl text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-3">Cannot get location</h2>
            <p className="text-plain-300 mb-6">
              Rumour requires access to your device's location to show nearby
              events. Please allow location access for this site.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => requestLocation()}
                className="px-4 py-2 bg-primary-500 text-secondary-900 rounded-full font-black"
              >
                Retry / Request Permission
              </button>
              <button
                onClick={() => openLocationSettings()}
                className="px-4 py-2 bg-secondary-800 text-white rounded-full"
              >
                Open Location Settings
              </button>
            </div>
            <p className="text-xs text-plain-400 mt-4">
              If you previously blocked the permission, open your browser's site
              settings and allow Location/Geolocation, then retry.
            </p>
          </div>
        </div>
      )}

      {/* HEADER UI */}
      <header
        className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-40 transition-opacity duration-700 ${locationStatus === "ready" ? "opacity-100" : "opacity-0"}`}
      >
        <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white drop-shadow-2xl">
          Rumour
        </h1>

        <div className="flex gap-2">
          <button
            onClick={initiateScan}
            disabled={isScanning}
            className="bg-primary-500 text-secondary-900 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(83,172,117,0.4)] active:scale-95 transition-all disabled:opacity-50"
          >
            {isScanning ? "Scanning..." : "Initiate Scan"}
          </button>

          <button
            onClick={() => auth.signOut()}
            className="bg-secondary-900 border border-secondary-800 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl"
          >
            Leave
          </button>
        </div>
      </header>

      {/* 🥪 INTEL REPORT (Scan Results) */}
      {showIntelReport && buzzes.length > 0 && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center pb-8 px-4 pointer-events-none">
          <div
            className="absolute inset-0 backdrop-blur-md pointer-events-auto"
            onClick={() => setShowIntelReport(false)}
          />

          <div className="relative w-full max-w-md bg-secondary-900 border border-secondary-800 rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto animate-slideUp">
            <div className="bg-primary-500 py-2 text-center">
              <p className="text-[9px] font-black text-secondary-900 uppercase tracking-[0.3em]">
                Signal Intel Report Locked
              </p>
            </div>

            <div className="p-8">
              <div className="mb-8 p-6 bg-plain-100 rounded-3xl text-secondary-900 shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-plain-300 mb-1">
                  Closest Connection
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">
                      {buzzes[0].distance < 200
                        ? buzzes[0].title
                        : `${buzzes[0].type} In ${buzzes[0].zone}`}
                    </h3>
                    <p className="text-[10px] font-bold text-plain-300 uppercase">
                      {buzzes[0].distance < 1000
                        ? `${Math.round(buzzes[0].distance)}m`
                        : `${(buzzes[0].distance / 1000).toFixed(1)}km`}{" "}
                      Away
                    </p>
                  </div>
                  <span className="text-4xl">{buzzes[0].icon}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-plain-300 px-2 mb-4">
                  Other Nearby Signatures
                </p>
                {buzzes.slice(1, 5).map((buzz) => (
                  <div
                    key={buzz.id}
                    className="flex items-center justify-between bg-secondary-900/50 border border-secondary-800/50 p-4 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{buzz.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tracking-tight">
                          {buzz.distance < 200
                            ? buzz.title
                            : `${buzz.type} Reveal`}
                        </span>
                        <span className="text-[9px] text-plain-400 font-bold uppercase">
                          {buzz.zone || "Zone Redacted"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-plain-300">
                      {buzz.distance < 1000
                        ? `${Math.round(buzz.distance)}m`
                        : `${(buzz.distance / 1000).toFixed(1)}km`}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowIntelReport(false)}
                className="w-full mt-8 bg-secondary-800 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary-700 transition-all"
              >
                Dismiss Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🥪 THE MODALS (Standard Event Details) */}
      {selectedBuzz && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center pb-6 px-4 pointer-events-none">
          <div
            className="absolute inset-0 backdrop-blur-xl pointer-events-auto"
            onClick={closeEverything}
          />
          <div
            className={`relative w-full max-w-md bg-secondary-900 border border-secondary-800 rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto transition-transform duration-500 animate-slideUp ${isInputFocused ? "-translate-y-44" : ""}`}
          >
            {isCheckedIn ? (
              <div className="relative flex flex-col items-center justify-center p-10 text-center bg-secondary-900 min-h-[450px]">
                <div
                  className="absolute inset-0 opacity-40 blur-3xl scale-150 bg-cover bg-center animate-fadeIn"
                  style={{ backgroundImage: `url(${selectedBuzz.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tertiary-900 via-tertiary-800/40 to-transparent" />
                <div className="relative z-10 animate-bounceScale flex flex-col items-center w-full">
                  <div className="w-20 h-20 bg-plain-100 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                    <span className="text-4xl">{selectedBuzz.icon}</span>
                  </div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                    You're Here.
                  </h2>
                  <p className="text-plain-300 font-mono text-[10px] uppercase tracking-widest bg-tertiary-500/50 px-5 py-2 rounded-full border border-secondary-800 mb-12">
                    Confirmed: {selectedBuzz.title}
                  </p>
                  <button
                    onClick={() => auth.signOut()}
                    className="w-full bg-plain-100 text-secondary-900 py-5 rounded-2xl font-black text-xs uppercase shadow-2xl active:scale-95 transition-all mb-4"
                  >
                    Lock Phone & Dive In
                  </button>
                  <button
                    onClick={() => setIsCheckedIn(false)}
                    className="text-plain-400 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Return to map
                  </button>
                </div>
              </div>
            ) : (
              <>
                {selectedBuzz.distance > 1000 ? (
                  <div className="relative min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-secondary-900/95">
                    <span className="text-5xl mb-6 opacity-50 animate-pulse">
                      📡
                    </span>
                    <h3 className="text-plain-300 font-black text-2xl uppercase tracking-widest mb-2">
                      Faint Signal
                    </h3>
                    <p className="text-plain-300 text-xs px-4">
                      Signals in{" "}
                      <span className="text-white font-black">
                        {selectedBuzz.zone}
                      </span>
                      . Move closer to intercept data.
                    </p>
                    <button
                      onClick={closeEverything}
                      className="mt-10 bg-secondary-800 text-white px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-widest"
                    >
                      Keep Walking
                    </button>
                  </div>
                ) : selectedBuzz.distance > 200 ? (
                  <div className="relative min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-secondary-900/95 border-b-[6px] border-primary-500">
                    <span className="text-5xl mb-6">🪝</span>
                    <h3 className="text-white font-black text-3xl uppercase tracking-widest mb-6">
                      Teaser Intercepted
                    </h3>
                    <div className="bg-secondary-900 border border-secondary-700 rounded-xl p-6 w-full mb-6">
                      <p className="text-white font-mono text-sm leading-relaxed italic">
                        "{selectedBuzz.teaser}"
                      </p>
                    </div>
                    <button
                      onClick={closeEverything}
                      className="mt-4 bg-plain-100 text-secondary-900 px-10 py-3 rounded-full font-black text-[10px] uppercase"
                    >
                      Understood
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedBuzz.isSecret && !isUnlocked ? (
                      <div className="relative flex flex-col items-center justify-center p-10 text-center min-h-[450px] bg-secondary-900 border-b-[6px] border-red-500 overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-30 blur-xl scale-125 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${selectedBuzz.image})`,
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-tertiary-900 via-tertiary-900/40 to-transparent" />
                        <div className="relative z-10 w-full flex flex-col items-center">
                          <span className="text-6xl mb-6 animate-pulse">
                            🤫
                          </span>
                          <h3 className="text-red-500 font-black text-3xl uppercase tracking-widest mb-8">
                            Secret Door
                          </h3>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (passwordAttempt === selectedBuzz.password) {
                                setIsUnlocked(true);
                                setPasswordError(false);
                              } else {
                                setPasswordError(true);
                                setPasswordAttempt("");
                              }
                            }}
                            className="w-full flex flex-col gap-4"
                          >
                            {passwordError && (
                              <div className="bg-secondary-700/10 border border-red-500/30 py-2 rounded-xl animate-pulse">
                                <p className="text-red-500 font-mono text-[10px] uppercase font-black">
                                  ⚠️ Access Denied
                                </p>
                              </div>
                            )}
                            <input
                              type="text"
                              value={passwordAttempt}
                              onChange={(e) => {
                                setPasswordAttempt(e.target.value);
                                setPasswordError(false);
                              }}
                              placeholder="Password..."
                              className="w-full bg-secondary-900 border border-secondary-800 rounded-2xl py-5 text-white text-center font-mono outline-none focus:border-red-500 transition-all text-sm tracking-widest"
                            />
                            <button
                              type="submit"
                              className="bg-secondary-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest"
                            >
                              Knock
                            </button>
                          </form>
                          <button
                            onClick={closeEverything}
                            className="mt-6 text-plain-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                          >
                            Walk away
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div
                          className="w-full aspect-[4/5] bg-cover bg-center relative"
                          style={{
                            backgroundImage: `url(${selectedBuzz.image})`,
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-tertiary-800 via-transparent to-transparent" />
                          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full border bg-secondary-900/60 border-white/20 text-white backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full animate-pulse bg-primary-500" />
                            <span className="text-[10px] font-mono font-black tracking-widest">
                              {formatTime(selectedBuzz.expiresAt)}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 bg-secondary-900 flex flex-col">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <p className="text-plain-300 text-[10px] font-black uppercase tracking-widest">
                              {selectedBuzz.host}
                            </p>
                            {selectedBuzz.isVerifiedSource && (
                              <div className="bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                <span className="text-cyan-500 text-[8px]">
                                  ★
                                </span>
                                <span className="text-cyan-400 text-[8px] font-black uppercase tracking-widest">
                                  Verified
                                </span>
                              </div>
                            )}
                            <div className="bg-secondary-700/10 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                              ⚠ {selectedBuzz.flags || 0} flagged
                            </div>
                          </div>
                          <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter mb-3">
                            {selectedBuzz.title}
                          </h2>
                          <p className="text-plain-300 text-sm mb-4 leading-relaxed flex-1">
                            {selectedBuzz.description}
                          </p>
                          <div className="mt-auto pt-4 border-t border-secondary-800 space-y-3">
                            <div className="flex gap-2">
                              <button
                                onClick={closeEverything}
                                className="flex-1 bg-secondary-800 text-white py-2 rounded-lg font-black text-[9px] uppercase transition-all hover:bg-secondary-700"
                              >
                                Close
                              </button>
                              <button
                                onClick={() => setIsCheckedIn(true)}
                                className="flex-1 bg-plain-100 text-secondary-900 py-2 rounded-lg font-black text-[9px] uppercase shadow-lg transition-all hover:bg-plain-200"
                              >
                                I'm Here
                              </button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={async () => {
                                  try {
                                    await voteBuzz(selectedBuzz.id, "up");
                                    setSelectedBuzz((prev) => ({
                                      ...prev,
                                      upvotes: (prev.upvotes || 0) + 1,
                                    }));
                                    setBuzzes((prev) =>
                                      prev.map((b) =>
                                        b.id === selectedBuzz.id
                                          ? {
                                              ...b,
                                              upvotes: (b.upvotes || 0) + 1,
                                            }
                                          : b,
                                      ),
                                    );
                                    if (selectedBuzz?.creatorId)
                                      await fetchHostReputation(
                                        selectedBuzz.creatorId,
                                      );
                                  } catch (e) {
                                    alert(e.message);
                                  }
                                }}
                                className="px-3 py-1.5 bg-primary-500 text-secondary-900 rounded-md font-black text-[8px]"
                              >
                                ↑
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await voteBuzz(selectedBuzz.id, "down");
                                    setSelectedBuzz((prev) => ({
                                      ...prev,
                                      downvotes: (prev.downvotes || 0) + 1,
                                    }));
                                    setBuzzes((prev) =>
                                      prev.map((b) =>
                                        b.id === selectedBuzz.id
                                          ? {
                                              ...b,
                                              downvotes: (b.downvotes || 0) + 1,
                                            }
                                          : b,
                                      ),
                                    );
                                    if (selectedBuzz?.creatorId)
                                      await fetchHostReputation(
                                        selectedBuzz.creatorId,
                                      );
                                  } catch (e) {
                                    alert(e.message);
                                  }
                                }}
                                className="px-3 py-1.5 bg-secondary-500 text-white rounded-md font-black text-[8px]"
                              >
                                ↓
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await unvoteBuzz(selectedBuzz.id);
                                    setSelectedBuzz((prev) => ({
                                      ...prev,
                                      upvotes: Math.max(
                                        (prev.upvotes || 0) - 1,
                                        0,
                                      ),
                                      downvotes: Math.max(
                                        (prev.downvotes || 0) - 1,
                                        0,
                                      ),
                                    }));
                                    setBuzzes((prev) =>
                                      prev.map((b) =>
                                        b.id === selectedBuzz.id
                                          ? {
                                              ...b,
                                              upvotes: Math.max(
                                                (b.upvotes || 0) - 1,
                                                0,
                                              ),
                                              downvotes: Math.max(
                                                (b.downvotes || 0) - 1,
                                                0,
                                              ),
                                            }
                                          : b,
                                      ),
                                    );
                                    if (selectedBuzz?.creatorId)
                                      await fetchHostReputation(
                                        selectedBuzz.creatorId,
                                      );
                                  } catch (e) {
                                    alert(e.message);
                                  }
                                }}
                                className="px-3 py-1.5 bg-secondary-700 text-white rounded-md font-black text-[8px]"
                              >
                                ✕
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const report = await reportBuzz(
                                      selectedBuzz.id,
                                    );
                                    alert(
                                      `Reported signal. Flags: ${report.flags}${report.removed ? " — removed from map" : ""}`,
                                    );
                                    if (report.removed) {
                                      setSelectedBuzz(null);
                                      setBuzzes((prev) =>
                                        prev.filter(
                                          (b) => b.id !== selectedBuzz.id,
                                        ),
                                      );
                                    } else {
                                      setSelectedBuzz((prev) => ({
                                        ...prev,
                                        flags: (prev.flags || 0) + 1,
                                      }));
                                      setBuzzes((prev) =>
                                        prev.map((b) =>
                                          b.id === selectedBuzz.id
                                            ? {
                                                ...b,
                                                flags: (b.flags || 0) + 1,
                                              }
                                            : b,
                                        ),
                                      );
                                    }
                                  } catch (e) {
                                    alert(e.message);
                                  }
                                }}
                                className="px-3 py-1.5 bg-orange-500 text-secondary-900 rounded-md font-black text-[8px]"
                              >
                                !
                              </button>
                              <span className="text-[9px] text-plain-300 ml-auto self-center">
                                Rep: {hostReputation ?? "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 📖 FIELD PROTOCOL TAB */}
      <div
        className={`absolute bottom-8 left-4 z-40 transition-all duration-500 ${isLegendOpen ? "opacity-0 pointer-events-none -translate-x-14" : "opacity-100 translate-x-0"}`}
      >
        <button
          onClick={() => setIsLegendOpen(true)}
          className="group flex items-center gap-3 bg-secondary-900/90 border border-secondary-800 p-3 pr-6 rounded-full backdrop-blur-xl shadow-2xl hover:border-primary-500 transition-all active:scale-95"
        >
          <div className="w-10 h-10 bg-secondary-800 rounded-full flex items-center justify-center text-xl group-hover:bg-secondary-700 transition-colors">
            📖
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Field Protocol
            </span>
            <span className="text-[8px] font-mono text-plain-300 uppercase tracking-widest">
              v3.0.48
            </span>
          </div>
        </button>
      </div>

      {/* FIELD GUIDE DRAWER */}
      <ProfileLegend
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />

      {locationStatus === "ready" && userCoords ? (
        <CreateBuzzFeature
          location={userCoords}
          locationReady={locationStatus === "ready"}
          onSuccess={() =>
            loadBuzzesFromBackend(userCoords.lat, userCoords.lng)
          }
        />
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounceScale { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounceScale { animation: bounceScale 0.4s cubic-bezier(0.17, 0.88, 0.32, 1.2) forwards; }
      `,
        }}
      />
    </div>
  );
};

export default MapContainer;
