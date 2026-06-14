import React from "react";
import { StyleSheet, Text, View } from "react-native";

const HostReputation = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Host Reputation</Text>
      <Text style={styles.paragraph}>
        Verified hosts have a stronger signal and higher trust. Build your
        reputation by hosting events, collecting check-ins, and staying within
        the local grid.
      </Text>
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>★ Trusted</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚡ Active</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 Local</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1a013d",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  title: {
    color: "#f9ddf4",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 12,
  },
  paragraph: {
    color: "#c89aaf",
    lineHeight: 20,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badge: {
    backgroundColor: "#470107",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  badgeText: {
    color: "#f9ddf4",
    fontWeight: "700",
  },
});

export default HostReputation;
