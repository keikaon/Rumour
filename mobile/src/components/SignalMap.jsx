import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { categoryColor, getBuzzDisplay } from "../lib/proximity";
import colors from "../theme/colors";

const getMapProvider = () => {
  if (Platform.OS === "web") return undefined;
  if (Platform.OS === "android") return PROVIDER_GOOGLE;
  return undefined;
};

const AuraMarker = ({ buzz }) => (
  <View style={[styles.auraOuter, { borderColor: categoryColor(buzz.type) }]}>
    <View
      style={[styles.auraInner, { backgroundColor: categoryColor(buzz.type) }]}
    />
  </View>
);

const PillMarker = ({ buzz, label }) => (
  <View style={styles.pillMarker}>
    <Text style={styles.pillIcon}>{buzz.icon || "📍"}</Text>
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
    <Text style={styles.targetIcon}>{buzz.icon || "📍"}</Text>
    <Text
      style={[styles.targetLabel, secret && styles.targetSecretLabel]}
      numberOfLines={1}
    >
      {secret ? "SECRET EVENT" : buzz.title}
    </Text>
  </View>
);

const SignalMap = ({
  location,
  buzzes,
  onSelectBuzz,
  dimmed = false,
  hideMarkers = false,
}) => {
  if (!location) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Syncing local grid...</Text>
      </View>
    );
  }

  const region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  const visibleBuzzes = hideMarkers
    ? []
    : buzzes
        .map((buzz) => ({ buzz, display: getBuzzDisplay(buzz) }))
        .filter(({ display }) => display.visible);

  return (
    <View style={[styles.mapWrap, dimmed && styles.mapDimmed]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton={Platform.OS === "android"}
        provider={getMapProvider()}
        userInterfaceStyle="dark"
      >
        {visibleBuzzes.map(({ buzz, display }) => (
          <Marker
            key={buzz.id?.toString() || `${buzz.lat}-${buzz.lng}`}
            coordinate={{ latitude: buzz.lat, longitude: buzz.lng }}
            pinColor={
              display.markerMode === "aura" || display.markerMode === "echo"
                ? undefined
                : categoryColor(buzz.type)
            }
            onPress={() => onSelectBuzz?.(buzz)}
          >
            {display.markerMode === "aura" ? <AuraMarker buzz={buzz} /> : null}
            {display.markerMode === "echo" ? (
              <PillMarker buzz={buzz} label={buzz.zone || buzz.type} />
            ) : null}
            {display.markerMode === "hook" ? (
              <PillMarker buzz={buzz} label="Teaser" />
            ) : null}
            {display.markerMode === "target" ||
            display.markerMode === "secret" ? (
              <TargetMarker
                buzz={buzz}
                secret={display.markerMode === "secret"}
              />
            ) : null}
            <Callout onPress={() => onSelectBuzz?.(buzz)}>
              <View style={styles.calloutCard}>
                <Text style={styles.calloutTitle}>{display.calloutTitle}</Text>
                <Text style={styles.calloutSubtitle}>
                  {buzz.type?.toUpperCase()}
                </Text>
                <Text style={styles.calloutText}>{display.calloutBody}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  mapDimmed: {
    opacity: 0.35,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#c89aaf",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  auraOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.55,
  },
  auraInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.7,
  },
  pillMarker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(26,1,61,0.9)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "rgba(83,172,117,0.25)",
    maxWidth: 160,
  },
  pillIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  pillType: {
    color: "#c89aaf",
    fontSize: 8,
    fontWeight: "800",
  },
  pillLabel: {
    color: "#f9ddf4",
    fontSize: 10,
    fontWeight: "700",
    maxWidth: 100,
  },
  targetMarker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9ddf4",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: 180,
  },
  targetSecret: {
    backgroundColor: "#1a013d",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  targetIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  targetLabel: {
    color: "#1a013d",
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
    maxWidth: 120,
  },
  targetSecretLabel: {
    color: "#f9ddf4",
  },
  calloutCard: {
    maxWidth: 220,
  },
  calloutTitle: {
    color: "#1a013d",
    fontWeight: "700",
    marginBottom: 4,
  },
  calloutSubtitle: {
    color: "#c89aaf",
    fontSize: 12,
    marginBottom: 6,
  },
  calloutText: {
    color: "#1a013d",
    fontSize: 13,
  },
});

export default SignalMap;
