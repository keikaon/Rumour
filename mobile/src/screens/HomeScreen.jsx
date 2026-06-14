import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import BuzzDetailModal from "../components/BuzzDetailModal";
import FieldGuideDrawer from "../components/FieldGuideDrawer";
import IntelReportModal from "../components/IntelReportModal";
import SignalMap from "../components/SignalMap";
import { CreateBuzzFeature } from "../features/createBuzz";
import { getBackendUrl } from "../config/backendUrl";
import { processBuzzes } from "../lib/proximity";
import colors from "../theme/colors";

const HomeScreen = ({ user, onSignOut }) => {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("locating");
  const [buzzes, setBuzzes] = useState([]);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [showIntelReport, setShowIntelReport] = useState(false);
  const [selectedBuzz, setSelectedBuzz] = useState(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const backendUrl = getBackendUrl();
  const isReady = locationStatus === "ready";

  useEffect(() => {
    if (locationStatus === "locating") {
      const interval = setInterval(() => {
        setLoadingProgress((prev) =>
          prev >= 90 ? prev : prev + Math.random() * 15,
        );
      }, 400);
      return () => clearInterval(interval);
    }
    if (locationStatus === "success" || locationStatus === "ready") {
      setLoadingProgress(100);
    }
    return undefined;
  }, [locationStatus]);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setError("");
    setLocationStatus("locating");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationStatus("permission");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation(currentLocation.coords);
      await fetchBuzzes(currentLocation.coords);
      setLocationStatus("success");
      setTimeout(() => setLocationStatus("ready"), 1500);
    } catch (err) {
      setLocationStatus("error");
      setError("Unable to access location. Please try again.");
    }
  };

  const generateLocalMockBuzzes = (lat, lng) => {
    const now = Date.now();
    const ONE_HOUR = 3600000;

    return [
      {
        id: 101,
        type: "Art",
        icon: "🎨",
        title: "Street Mural Unveiling",
        zone: "Kavaklıdere Arts District",
        teaser: "Bring your own spray paint. Canvas provided.",
        host: "@urban_canvas",
        description:
          "Live painting session finishing up our newest street piece.",
        image:
          "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80",
        lat: lat + 0.015,
        lng: lng + 0.01,
        expiresAt: now + ONE_HOUR * 2.2,
      },
      {
        id: 102,
        type: "Party",
        icon: "🍸",
        title: "Rooftop Mixer",
        zone: "Skyline Towers",
        teaser: "Sunset mixer. Tech house. Dress to impress.",
        host: "@skyline_events",
        description: "Exclusive sunset mixer. Good vibes and networking.",
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
        lat: lat - 0.005,
        lng: lng + 0.005,
        expiresAt: now + ONE_HOUR * 0.8,
      },
      {
        id: 103,
        type: "Music",
        icon: "🎸",
        title: "Local Indie Gallery",
        zone: "Çankaya Center",
        teaser: "Acoustic sets and local student art.",
        host: "@çankaya_arts",
        description:
          "A pop-up visual arts gallery featuring 5 local university students.",
        image:
          "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&q=80",
        lat: lat - 0.0006,
        lng: lng - 0.0007,
        expiresAt: now + ONE_HOUR * 3.5,
      },
      {
        id: 104,
        type: "Party",
        icon: "🕺",
        title: "Underground Rave",
        zone: "Industrial Alleys",
        teaser:
          "Industrial techno all night. Entrance through the alleyway door.",
        host: "@unknown_frequency",
        description: "Industrial techno all night. Do not post photos.",
        image:
          "https://images.unsplash.com/photo-1574169208507-84376144848b?w=500&q=80",
        isSecret: true,
        password: "Fidelio!",
        lat: lat + 0.0005,
        lng: lng + 0.0008,
        expiresAt: now + ONE_HOUR * 5.5,
      },
    ];
  };

  const fetchBuzzes = async (coords) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/buzzes?lat=${coords.latitude}&lng=${coords.longitude}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data?.buzzes) ? data.buzzes : [];
      const processed = processBuzzes(list, coords.latitude, coords.longitude);
      if (processed.length === 0) {
        throw new Error("No buzzes returned from backend");
      }
      setBuzzes(processed);
      setError("");
      return processed;
    } catch (err) {
      const hint =
        Platform.OS === "ios" &&
        !backendUrl.includes("192.168") &&
        !backendUrl.includes("10.")
          ? " Set EXPO_PUBLIC_BACKEND_URL to your PC's LAN IP (port 5000)."
          : "";
      const fallback = processBuzzes(
        generateLocalMockBuzzes(coords.latitude, coords.longitude),
        coords.latitude,
        coords.longitude,
      );
      setBuzzes(fallback);
      setError(`Unable to reach backend. Showing offline demo signals.${hint}`);
      return fallback;
    }
  };

  const initiateScan = async () => {
    if (!location) {
      await requestLocation();
      return;
    }

    setIsScanning(true);
    setFoundCount(0);
    setShowIntelReport(false);
    setSelectedBuzz(null);

    const results = await fetchBuzzes(location);

    let counter = 0;
    const interval = setInterval(() => {
      if (counter < results.length) {
        counter += 1;
        setFoundCount(counter);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          if (results.length > 0) {
            setShowIntelReport(true);
          }
        }, 1000);
      }
    }, 300);
  };

  const closeEverything = () => {
    setSelectedBuzz(null);
    setShowIntelReport(false);
  };

  return (
    <View style={styles.root}>
      <SignalMap
        location={location}
        buzzes={buzzes}
        onSelectBuzz={(buzz) => setSelectedBuzz(buzz)}
        dimmed={!isReady || isScanning}
        hideMarkers={isScanning}
      />

      {isScanning ? (
        <View style={styles.scanOverlay} pointerEvents="none">
          <View style={styles.sonarRingOuter} />
          <View style={styles.sonarRingInner} />
          <View style={styles.scanCard}>
            <Text style={styles.scanEmoji}>📡</Text>
            <Text style={styles.scanLabel}>Intercepting Signals...</Text>
            <Text style={styles.scanCount}>
              {foundCount} <Text style={styles.scanCountDim}>FOUND</Text>
            </Text>
          </View>
        </View>
      ) : null}

      {!isReady && !isScanning && locationStatus !== "permission" ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <Text style={styles.loadingTitle}>Rumour</Text>
          {locationStatus === "locating" ? (
            <>
              <ActivityIndicator
                size="large"
                color="#f9ddf4"
                style={styles.loadingSpinner}
              />
              <Text style={styles.loadingHint}>Syncing local grid...</Text>
            </>
          ) : locationStatus === "success" ? (
            <View style={styles.successBadge}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
          ) : null}
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${loadingProgress}%` }]}
            />
          </View>
        </View>
      ) : null}

      {locationStatus === "permission" ? (
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>Cannot get location</Text>
            <Text style={styles.permissionBody}>
              Rumour requires access to your device's location to show nearby
              events. Please allow location access in Settings.
            </Text>
            <TouchableOpacity
              style={styles.permissionPrimary}
              onPress={requestLocation}
            >
              <Text style={styles.permissionPrimaryText}>
                Retry / Request Permission
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {isReady ? (
        <View
          style={[styles.header, { paddingTop: insets.top + 12 }]}
          pointerEvents="box-none"
        >
          <Text style={styles.headerTitle}>Rumour</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
              onPress={initiateScan}
              disabled={isScanning}
            >
              <Text style={styles.scanBtnText}>
                {isScanning ? "Scanning..." : "Initiate Scan"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.leaveBtn} onPress={onSignOut}>
              <Text style={styles.leaveBtnText}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {isReady && !isLegendOpen ? (
        <TouchableOpacity
          style={[styles.fieldProtocolBtn, { bottom: insets.bottom + 24 }]}
          onPress={() => setIsLegendOpen(true)}
          activeOpacity={0.9}
        >
          <View style={styles.fieldProtocolIcon}>
            <Text style={styles.fieldProtocolEmoji}>📖</Text>
          </View>
          <View>
            <Text style={styles.fieldProtocolLabel}>Field Protocol</Text>
            <Text style={styles.fieldProtocolVersion}>v3.0.48</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {isReady ? (
        <CreateBuzzFeature
          backendUrl={backendUrl}
          location={location}
          locationReady={isReady}
          onSuccess={() => location && fetchBuzzes(location)}
        />
      ) : null}

      {error && isReady ? (
        <View style={[styles.errorBanner, { top: insets.top + 80 }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FieldGuideDrawer
        visible={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
        user={user}
      />

      <IntelReportModal
        visible={showIntelReport}
        buzzes={buzzes}
        onClose={() => setShowIntelReport(false)}
        onSelectBuzz={(buzz) => {
          setShowIntelReport(false);
          setSelectedBuzz(buzz);
        }}
      />

      <BuzzDetailModal
        buzz={selectedBuzz}
        visible={!!selectedBuzz}
        onClose={closeEverything}
        onSignOut={onSignOut}
        location={location}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26,1,61,0.35)",
    zIndex: 50,
  },
  sonarRingOuter: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: "rgba(83,172,117,0.2)",
  },
  sonarRingInner: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(83,172,117,0.4)",
  },
  scanCard: {
    backgroundColor: "rgba(26,1,61,0.6)",
    borderRadius: 48,
    borderWidth: 1,
    borderColor: "rgba(83,172,117,0.3)",
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  scanEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  scanLabel: {
    color: "#53ac75",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  scanCount: {
    color: "#f9ddf4",
    fontSize: 40,
    fontWeight: "900",
    fontStyle: "italic",
  },
  scanCountDim: {
    color: "rgba(83,172,117,0.5)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(26,1,61,0.4)",
    zIndex: 70,
  },
  loadingTitle: {
    color: "rgba(255,255,255,0.15)",
    fontSize: 56,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: -2,
    marginBottom: 32,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingHint: {
    color: "#c89aaf",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  successBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f9ddf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successCheck: {
    color: "#1a013d",
    fontSize: 24,
    fontWeight: "900",
  },
  progressTrack: {
    width: 200,
    height: 4,
    backgroundColor: "#470107",
    borderRadius: 2,
    marginTop: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f9ddf4",
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26,1,61,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 90,
  },
  permissionCard: {
    backgroundColor: "#1a013d",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    maxWidth: 400,
  },
  permissionTitle: {
    color: "#f9ddf4",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionBody: {
    color: "#c89aaf",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  permissionPrimary: {
    backgroundColor: "#53ac75",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  permissionPrimaryText: {
    color: "#1a013d",
    fontWeight: "800",
    fontSize: 13,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    zIndex: 40,
  },
  headerTitle: {
    color: "#f9ddf4",
    fontSize: 36,
    fontWeight: "900",
    fontStyle: "italic",
    textTransform: "uppercase",
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  scanBtn: {
    backgroundColor: "#53ac75",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#53ac75",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  scanBtnDisabled: {
    opacity: 0.5,
  },
  scanBtnText: {
    color: "#1a013d",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  leaveBtn: {
    backgroundColor: "#1a013d",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  leaveBtnText: {
    color: "#f9ddf4",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  fieldProtocolBtn: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(26,1,61,0.9)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 20,
    zIndex: 40,
  },
  fieldProtocolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#470107",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldProtocolEmoji: {
    fontSize: 20,
  },
  fieldProtocolLabel: {
    color: "#f9ddf4",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  fieldProtocolVersion: {
    color: "#c89aaf",
    fontSize: 8,
    fontFamily: "monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 2,
  },
  errorBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(127,29,29,0.9)",
    borderRadius: 12,
    padding: 12,
    zIndex: 45,
  },
  errorText: {
    color: "#fecaca",
    fontSize: 12,
    textAlign: "center",
  },
});

export default HomeScreen;
