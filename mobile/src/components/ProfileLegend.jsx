import React from "react";
import { StyleSheet, Text, View } from "react-native";

const categories = [
  { label: "Party", color: "#53ac75" },
  { label: "Music", color: "#f59e0b" },
  { label: "Art", color: "#ec4899" },
  { label: "Food", color: "#fb923c" },
  { label: "Gaming", color: "#06b6d4" },
  { label: "Giveaway", color: "#f9ddf4" },
];

const ProfileLegend = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Signal Legend</Text>
      {categories.map((item) => (
        <View style={styles.legendRow} key={item.label}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
      <Text style={styles.detailText}>
        Five-tier proximity gating: beyond 5km signals are hidden; 3–5km auras;
        1–3km zone echoes; 200m–1km teasers; under 200m full reveal (password
        for secret doors).
      </Text>
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
    marginBottom: 14,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  legendLabel: {
    color: "#c89aaf",
    fontSize: 15,
  },
  detailText: {
    color: "#c89aaf",
    marginTop: 12,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default ProfileLegend;
