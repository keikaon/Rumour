import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../theme/colors";

const DRAWER_WIDTH = 340;

const FREQUENCIES = [
  { label: "Party", color: "#53ac75" },
  { label: "Art", color: "#ec4899" },
  { label: "Giveaway", color: "#f9ddf4" },
  { label: "Music", color: "#f59e0b" },
  { label: "Food", color: "#fb923c" },
  { label: "Gaming", color: "#06b6d4" },
  { label: "Fitness", color: "#10b981" },
  { label: "Meetup", color: "#c89aaf" },
];

const TIERS = [
  {
    icon: "?",
    title: "Ghost Mode",
    range: "> 5km",
    body: "Invisible. Protects city-wide privacy.",
  },
  {
    icon: "●",
    title: "The Pulse",
    range: "3km - 5km",
    body: "Massive glowing auras. Reveals event category only.",
    pulse: true,
  },
  {
    icon: "📡",
    title: "Faint Signal",
    range: "1km - 3km",
    body: "Reveals the general neighborhood/zone.",
  },
  {
    icon: "🪝",
    title: "The Hook",
    range: "200m - 1km",
    body: "Intercepts a cryptic text teaser from the host.",
  },
  {
    icon: "🎯",
    title: "The Target",
    range: "< 200m",
    body: "Full decryption. Exact location and check-in access.",
    target: true,
  },
];

const FieldGuideDrawer = ({ visible, onClose, user }) => {
  const insets = useSafeAreaInsets();

  const profile = useMemo(() => {
    const name =
      user?.displayName || user?.email?.split("@")[0] || "Field Agent";
    const email = user?.email || "demo@rumour.app";
    const isVerified = user?.emailVerified;
    const createdAt = user?.metadata?.creationTime
      ? new Date(user.metadata.creationTime).toLocaleDateString()
      : "Unknown";
    const lastSignIn = user?.metadata?.lastSignInTime
      ? new Date(user.metadata.lastSignInTime).toLocaleString()
      : "Unknown";
    return { name, email, isVerified, createdAt, lastSignIn };
  }, [user]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <BlurView
          intensity={30}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.drawer, { paddingTop: insets.top }]}>
          <View style={styles.accentBar} />
          <View style={styles.drawerHeader}>
            <View>
              <Text style={styles.kicker}>FIELD PROTOCOL</Text>
              <Text style={styles.drawerTitle}>Field Guide</Text>
              <Text style={styles.version}>Rumour Protocol v3.0</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profile.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.agentLabel}>Field Agent</Text>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileEmail}>{profile.email}</Text>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Joined</Text>
                  <Text style={styles.statValue}>{profile.createdAt}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Last Active</Text>
                  <Text style={styles.statValue} numberOfLines={2}>
                    {profile.lastSignIn}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text
                    style={[
                      styles.statValue,
                      profile.isVerified && styles.verifiedText,
                    ]}
                  >
                    {profile.isVerified ? "Verified" : "Unverified"}
                  </Text>
                </View>
              </View>
            </View>

            <Section title="1. The Proximity Gate">
              <Text style={styles.sectionIntro}>
                Signals are encrypted based on your physical distance. You must
                walk to decrypt the data.
              </Text>
              {TIERS.map((tier) => (
                <View style={styles.tierRow} key={tier.title}>
                  <View
                    style={[
                      styles.tierIcon,
                      tier.target && styles.tierIconTarget,
                    ]}
                  >
                    <Text style={styles.tierIconText}>{tier.icon}</Text>
                  </View>
                  <View style={styles.tierCopy}>
                    <Text style={styles.tierTitle}>
                      {tier.title}{" "}
                      <Text style={styles.tierRange}>({tier.range})</Text>
                    </Text>
                    <Text style={styles.tierBody}>{tier.body}</Text>
                  </View>
                </View>
              ))}
            </Section>

            <Section title="2. Signal Frequencies">
              <View style={styles.freqGrid}>
                {FREQUENCIES.map((f) => (
                  <View style={styles.freqRow} key={f.label}>
                    <View
                      style={[styles.freqDot, { backgroundColor: f.color }]}
                    />
                    <Text style={styles.freqLabel}>{f.label}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="3. Field Tools">
              <ToolItem color="#53ac75" icon="📡" title="Signal Scanner">
                Initiate a Sonar Sweep to intercept all active frequencies in
                the city grid. Generates an Intel Report prioritizing the
                closest connections.
              </ToolItem>
              <ToolItem color="#ef4444" icon="🤫" title="Secret Doors">
                Highly classified events. Even at under 200m, details remain
                locked until the correct passphrase is entered at the gate.
              </ToolItem>
              <ToolItem color="#f9ddf4" icon="●" title="Ephemeral Clocks">
                All data self-destructs. Watch the live countdown timers. Timers
                turn red when an event has less than 1 hour remaining.
              </ToolItem>
            </Section>

            <Section title="4. Trust & Security">
              <View style={styles.trustCard}>
                <Text style={styles.trustStar}>★</Text>
                <View style={styles.trustCopy}>
                  <Text style={styles.verifiedBadge}>Verified Source</Text>
                  <Text style={styles.trustBody}>
                    Hosts bearing this badge have successfully completed 5+
                    confirmed Rumours with over 30 verified participants. They
                    are highly reliable.
                  </Text>
                </View>
              </View>
            </Section>
          </ScrollView>
        </View>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ToolItem = ({ icon, title, color, children }) => (
  <View style={styles.toolItem}>
    <Text style={[styles.toolTitle, { color }]}>
      {icon} {title}
    </Text>
    <Text style={styles.toolBody}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: DRAWER_WIDTH,
    maxWidth: "88%",
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  accentBar: {
    height: 4,
    backgroundColor: "#53ac75",
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kicker: {
    color: "#c89aaf",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 3,
  },
  drawerTitle: {
    color: "#f9ddf4",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
  },
  version: {
    color: "#c89aaf",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 2,
    marginTop: 4,
    textTransform: "uppercase",
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a013d",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: "#c89aaf",
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#1a013d",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 28,
  },
  profileRow: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#470107",
    borderWidth: 1,
    borderColor: "rgba(83,172,117,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#f9ddf4",
    fontWeight: "900",
    fontSize: 16,
  },
  profileText: {
    flex: 1,
  },
  agentLabel: {
    color: "#c89aaf",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },
  profileName: {
    color: "#f9ddf4",
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 2,
  },
  profileEmail: {
    color: "#c89aaf",
    fontSize: 9,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  statBox: {
    width: "47%",
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: "center",
  },
  statLabel: {
    color: "#c89aaf",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    color: "#f9ddf4",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
  verifiedText: {
    color: "#53ac75",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#c89aaf",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 14,
  },
  sectionIntro: {
    color: "#c89aaf",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  tierRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  tierIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1a013d",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tierIconTarget: {
    backgroundColor: "#f9ddf4",
  },
  tierIconText: {
    fontSize: 12,
  },
  tierCopy: {
    flex: 1,
  },
  tierTitle: {
    color: "#f9ddf4",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tierRange: {
    color: "#c89aaf",
    fontFamily: "monospace",
  },
  tierBody: {
    color: "#c89aaf",
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  freqGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  freqRow: {
    width: "45%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  freqDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  freqLabel: {
    color: "#f9ddf4",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  toolItem: {
    marginBottom: 18,
  },
  toolTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  toolBody: {
    color: "#c89aaf",
    fontSize: 10,
    lineHeight: 15,
  },
  trustCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#1a013d",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(83,172,117,0.25)",
    padding: 16,
  },
  trustStar: {
    fontSize: 22,
    color: "#f59e0b",
  },
  trustCopy: {
    flex: 1,
  },
  verifiedBadge: {
    color: "#fcd34d",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  trustBody: {
    color: "#c89aaf",
    fontSize: 10,
    lineHeight: 15,
  },
});

export default FieldGuideDrawer;
