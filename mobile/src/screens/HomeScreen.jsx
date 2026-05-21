import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import BuzzDetailModal from '../components/BuzzDetailModal';
import IntelReportModal from '../components/IntelReportModal';
import ProfileLegend from '../components/ProfileLegend';
import HostReputation from '../components/HostReputation';
import SignalMap from '../components/SignalMap';
import { getBackendUrl } from '../config/backendUrl';
import {
  formatDistance,
  getBuzzDisplay,
  processBuzzes,
} from '../lib/proximity';
import colors from '../theme/colors';

const formatTime = (expiresAt, now) => {
  if (!expiresAt) return '00:00:00';
  const diff = expiresAt - now;
  if (diff <= 0) return '00:00:00';
  const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
  const minutes = Math.floor((diff % 3600000) / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((diff % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const HomeScreen = ({ user, onSignOut }) => {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [buzzes, setBuzzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [showIntelReport, setShowIntelReport] = useState(false);
  const [selectedBuzz, setSelectedBuzz] = useState(null);
  const [now, setNow] = useState(Date.now());

  const backendUrl = getBackendUrl();

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setError('');
    setLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Location permission denied. Enable it to view nearby buzzes.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      setLocation(currentLocation.coords);
      await fetchBuzzes(currentLocation.coords);
    } catch (err) {
      setError('Unable to access location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuzzes = async coords => {
    try {
      const response = await fetch(
        `${backendUrl}/api/buzzes?lat=${coords.latitude}&lng=${coords.longitude}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data?.buzzes) ? data.buzzes : [];
      const processed = processBuzzes(list, coords.latitude, coords.longitude);
      setBuzzes(processed);
      setError('');
      return processed;
    } catch (err) {
      setBuzzes([]);
      const hint =
        Platform.OS === 'ios' && !backendUrl.includes('192.168') && !backendUrl.includes('10.')
          ? " On a physical iPhone, set EXPO_PUBLIC_BACKEND_URL to your computer's LAN IP (port 5000)."
          : '';
      setError(`Failed to load nearby signals from ${backendUrl}.${hint}`);
      return [];
    }
  };

  const scanArea = async () => {
    if (!location) {
      await requestLocation();
      return;
    }

    setIsScanning(true);
    setFoundCount(0);
    setShowIntelReport(false);
    setLoading(true);

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
          setLoading(false);
          if (results.length > 0) {
            setShowIntelReport(true);
          }
        }, 1000);
      }
    }, 300);
  };

  const visibleBuzzes = buzzes.filter(b => getBuzzDisplay(b).visible);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      overScrollMode="never"
      bounces={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rumour</Text>
          <Text style={styles.subtitle}>Hyper-local signals in your pocket</Text>
        </View>
        <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Location status</Text>
        <Text style={styles.statusValue}>
          {permissionStatus === 'granted' ? 'Active' : 'Disabled'}
        </Text>
        <Text style={styles.statusDetail}>
          {location
            ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
            : 'Waiting for GPS...'}
        </Text>
        <Text style={styles.apiHint}>API: {backendUrl}</Text>
      </View>

      {isScanning ? (
        <View style={styles.scanOverlay}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.scanTitle}>Intercepting Signals...</Text>
          <Text style={styles.scanCount}>
            {foundCount} <Text style={styles.scanCountDim}>FOUND</Text>
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.scanButton, isScanning && styles.scanButtonDisabled]}
        onPress={scanArea}
        disabled={loading || isScanning}
      >
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning…' : loading ? 'Loading…' : 'Initiate Scan'}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <SignalMap
        location={location}
        buzzes={buzzes}
        onSelectBuzz={buzz => setSelectedBuzz(buzz)}
      />

      <View style={styles.cardsContainer}>
        {visibleBuzzes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No visible signals in range. Tier 1 ghosts stay hidden beyond 5km.
            </Text>
          </View>
        ) : (
          visibleBuzzes.map(item => {
            const display = getBuzzDisplay(item);
            const urgent = item.expiresAt && item.expiresAt - now < 3600000;
            return (
              <TouchableOpacity
                key={item.id?.toString() || `${item.lat}-${item.lng}`}
                style={styles.buzzCard}
                onPress={() => setSelectedBuzz(item)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.buzzTitle}>{display.headline}</Text>
                  {item.isVerifiedSource && display.tier === 5 && !display.canUnlock ? (
                    <View style={styles.verifiedChip}>
                      <Text style={styles.verifiedChipText}>★</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.buzzMeta}>
                  {display.subtitle} • {formatDistance(item.distance)}
                </Text>
                <Text style={styles.buzzDescription} numberOfLines={3}>
                  {display.body || 'Encrypted field report.'}
                </Text>
                <Text style={[styles.timer, urgent && styles.timerUrgent]}>
                  {formatTime(item.expiresAt, now)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <ProfileLegend />
      <HostReputation />

      <IntelReportModal
        visible={showIntelReport}
        buzzes={buzzes}
        onClose={() => setShowIntelReport(false)}
        onSelectBuzz={buzz => {
          setShowIntelReport(false);
          setSelectedBuzz(buzz);
        }}
      />

      <BuzzDetailModal
        buzz={selectedBuzz}
        visible={!!selectedBuzz}
        onClose={() => setSelectedBuzz(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 4,
  },
  signOutButton: {
    justifyContent: 'center',
  },
  signOutText: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  statusCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  statusValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  statusDetail: {
    color: '#cbd5e1',
    marginTop: 6,
  },
  apiHint: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 8,
  },
  scanOverlay: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  scanTitle: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  scanCount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 8,
  },
  scanCountDim: {
    color: 'rgba(34,197,94,0.5)',
  },
  scanButton: {
    backgroundColor: '#22c55e',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#0f172a',
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
  errorText: {
    color: '#fecaca',
    marginBottom: 12,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  emptyCard: {
    borderRadius: 20,
    backgroundColor: '#111827',
    padding: 18,
  },
  emptyText: {
    color: '#cbd5e1',
  },
  buzzCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buzzTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    flex: 1,
  },
  verifiedChip: {
    backgroundColor: 'rgba(6,182,212,0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  verifiedChipText: {
    color: '#22d3ee',
    fontWeight: '800',
  },
  buzzMeta: {
    color: '#94a3b8',
    marginBottom: 12,
    fontSize: 12,
  },
  buzzDescription: {
    color: '#cbd5e1',
    marginBottom: 10,
    lineHeight: 20,
  },
  timer: {
    color: '#f8fafc',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  timerUrgent: {
    color: '#ef4444',
  },
});

export default HomeScreen;
