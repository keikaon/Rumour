import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { categoryColor, getBuzzDisplay } from '../lib/proximity';

const getMapProvider = () => {
  if (Platform.OS === 'web') return undefined;
  if (Platform.OS === 'android') return PROVIDER_GOOGLE;
  return undefined;
};

const AuraMarker = ({ buzz }) => (
  <View style={[styles.auraOuter, { borderColor: categoryColor(buzz.type) }]}>
    <View style={[styles.auraInner, { backgroundColor: categoryColor(buzz.type) }]} />
  </View>
);

const PillMarker = ({ buzz, label }) => (
  <View style={styles.pillMarker}>
    <Text style={styles.pillIcon}>{buzz.icon || '📍'}</Text>
    <View>
      <Text style={styles.pillType}>{buzz.type?.toUpperCase()}</Text>
      <Text style={styles.pillLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  </View>
);

const TargetMarker = ({ buzz, secret }) => (
  <View style={[styles.targetMarker, secret && styles.targetSecret]}>
    <Text style={styles.targetIcon}>{buzz.icon || '📍'}</Text>
    <Text
      style={[styles.targetLabel, secret && styles.targetSecretLabel]}
      numberOfLines={1}
    >
      {secret ? 'SECRET' : buzz.title}
    </Text>
  </View>
);

const SignalMap = ({ location, buzzes, onSelectBuzz }) => {
  if (!location) {
    return (
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderText}>Waiting for location to show the map.</Text>
      </View>
    );
  }

  const region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  const visibleBuzzes = buzzes
    .map(buzz => ({ buzz, display: getBuzzDisplay(buzz) }))
    .filter(({ display }) => display.visible);

  return (
    <View style={styles.mapCard}>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}
        provider={getMapProvider()}
      >
        {visibleBuzzes.map(({ buzz, display }) => (
          <Marker
            key={buzz.id?.toString() || `${buzz.lat}-${buzz.lng}`}
            coordinate={{ latitude: buzz.lat, longitude: buzz.lng }}
            pinColor={
              display.markerMode === 'aura' || display.markerMode === 'echo'
                ? undefined
                : categoryColor(buzz.type)
            }
            onPress={() => onSelectBuzz?.(buzz)}
          >
            {display.markerMode === 'aura' ? <AuraMarker buzz={buzz} /> : null}
            {display.markerMode === 'echo' ? (
              <PillMarker buzz={buzz} label={buzz.zone || buzz.type} />
            ) : null}
            {display.markerMode === 'hook' ? (
              <PillMarker buzz={buzz} label="Teaser" />
            ) : null}
            {display.markerMode === 'target' || display.markerMode === 'secret' ? (
              <TargetMarker buzz={buzz} secret={display.markerMode === 'secret'} />
            ) : null}
            <Callout onPress={() => onSelectBuzz?.(buzz)}>
              <View style={styles.calloutCard}>
                <Text style={styles.calloutTitle}>{display.calloutTitle}</Text>
                <Text style={styles.calloutSubtitle}>{buzz.type?.toUpperCase()}</Text>
                <Text style={styles.calloutText}>{display.calloutBody}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <Text style={styles.mapHint}>Tap pins for tier-gated signal details.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
  },
  map: {
    height: 280,
    width: '100%',
  },
  mapHint: {
    color: '#94a3b8',
    padding: 12,
    fontSize: 13,
  },
  placeholderCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  placeholderText: {
    color: '#cbd5e1',
    textAlign: 'center',
  },
  auraOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  auraInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.7,
  },
  pillMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24,24,27,0.9)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
    maxWidth: 160,
  },
  pillIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  pillType: {
    color: '#71717a',
    fontSize: 8,
    fontWeight: '800',
  },
  pillLabel: {
    color: '#e4e4e7',
    fontSize: 10,
    fontWeight: '700',
    maxWidth: 100,
  },
  targetMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: 180,
  },
  targetSecret: {
    backgroundColor: '#18181b',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  targetIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  targetLabel: {
    color: '#09090b',
    fontWeight: '900',
    fontSize: 11,
    textTransform: 'uppercase',
    maxWidth: 120,
  },
  targetSecretLabel: {
    color: '#f8fafc',
  },
  calloutCard: {
    maxWidth: 220,
  },
  calloutTitle: {
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutSubtitle: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 6,
  },
  calloutText: {
    color: '#0f172a',
    fontSize: 13,
  },
});

export default SignalMap;
