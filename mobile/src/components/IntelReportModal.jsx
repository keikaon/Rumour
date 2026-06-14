import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { formatDistance, getIntelLabel } from "../lib/proximity";
import colors from "../theme/colors";

const IntelReportModal = ({ visible, buzzes, onClose, onSelectBuzz }) => {
  if (!buzzes?.length) return null;

  const closest = buzzes[0];
  const others = buzzes.slice(1, 5);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView
          intensity={35}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Signal Intel Report Locked</Text>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            overScrollMode="never"
            bounces={false}
          >
            <View style={styles.closestCard}>
              <Text style={styles.closestLabel}>Closest Connection</Text>
              <View style={styles.closestRow}>
                <View style={styles.closestText}>
                  <Text style={styles.closestTitle}>
                    {getIntelLabel(closest)}
                  </Text>
                  <Text style={styles.closestDistance}>
                    {formatDistance(closest.distance)} away
                  </Text>
                </View>
                <Text style={styles.closestIcon}>{closest.icon || "📍"}</Text>
              </View>
              <TouchableOpacity
                style={styles.openButton}
                onPress={() => onSelectBuzz?.(closest)}
              >
                <Text style={styles.openButtonText}>Open signal</Text>
              </TouchableOpacity>
            </View>

            {others.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Other Nearby Signatures</Text>
                {others.map((buzz) => (
                  <TouchableOpacity
                    key={buzz.id?.toString() || `${buzz.lat}-${buzz.lng}`}
                    style={styles.rowCard}
                    onPress={() => onSelectBuzz?.(buzz)}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowIcon}>{buzz.icon || "📍"}</Text>
                      <View>
                        <Text style={styles.rowTitle}>
                          {getIntelLabel(buzz)}
                        </Text>
                        <Text style={styles.rowZone}>
                          {buzz.zone || "Zone redacted"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.rowDistance}>
                      {formatDistance(buzz.distance)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
              <Text style={styles.dismissText}>Dismiss Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "85%",
    overflow: "hidden",
  },
  banner: {
    backgroundColor: "#53ac75",
    paddingVertical: 8,
    alignItems: "center",
  },
  bannerText: {
    color: "#1a013d",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  scroll: {
    maxHeight: 500,
    backgroundColor: colors.surfaceElevated,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: colors.surfaceElevated,
  },
  closestCard: {
    backgroundColor: "#f9ddf4",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  closestLabel: {
    color: "#c89aaf",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  closestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closestText: {
    flex: 1,
  },
  closestTitle: {
    color: "#1a013d",
    fontSize: 22,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  closestDistance: {
    color: "#c89aaf",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
  },
  closestIcon: {
    fontSize: 36,
  },
  openButton: {
    backgroundColor: "#1a013d",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  openButtonText: {
    color: "#f9ddf4",
    fontWeight: "800",
    fontSize: 11,
    textTransform: "uppercase",
  },
  sectionLabel: {
    color: "#c89aaf",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a013d",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(83,172,117,0.2)",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    fontSize: 22,
  },
  rowTitle: {
    color: "#f9ddf4",
    fontWeight: "800",
    fontSize: 13,
    textTransform: "uppercase",
  },
  rowZone: {
    color: "#c89aaf",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
    textTransform: "uppercase",
  },
  rowDistance: {
    color: "#c89aaf",
    fontFamily: "monospace",
    fontSize: 11,
  },
  dismissButton: {
    backgroundColor: "#470107",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 16,
  },
  dismissText: {
    color: "#f9ddf4",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
});

export default IntelReportModal;
