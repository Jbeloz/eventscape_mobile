import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Theme } from "../../../../constants/theme";
import { useAuth } from "../../../hooks/use-auth";

const STATS = [
  { id: 1, number: "12", label: "Events", icon: "calendar-outline" },
  { id: 2, number: "8", label: "Completed", icon: "checkmark-done-outline" },
  { id: 3, number: "3", label: "In Progress", icon: "time-outline" },
  { id: 4, number: "1", label: "Upcoming", icon: "arrow-forward-outline" },
];

const RECENT_EVENTS = [
  { id: 1, title: "Corporate Gala", date: "Feb 15, 2026", status: "Confirmed" },
  { id: 2, title: "Wedding Planning", date: "Mar 20, 2026", status: "In Progress" },
  { id: 3, title: "Birthday Bash", date: "Feb 28, 2026", status: "Confirmed" },
];

export default function CoordinatorHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Coordinator";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeTitle}>Welcome Back, {firstName}!</Text>
        <Text style={styles.welcomeBody}>
          You're a Coordinator. Manage your events and projects here.
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Ionicons
                name={stat.icon as any}
                size={24}
                color={Theme.colors.primary}
              />
            </View>
            <Text style={styles.statNumber}>{stat.number}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent Events Section */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        <Text style={styles.sectionSubtitle}>
          Your latest coordinated events
        </Text>

        {RECENT_EVENTS.map((event) => (
          <Pressable key={event.id} style={styles.eventCard}>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{event.status}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtonsRow}>
          <Pressable style={styles.quickActionButton}>
            <Ionicons name="add-circle-outline" size={28} color={Theme.colors.primary} />
            <Text style={styles.quickActionLabel}>New Event</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <Ionicons name="document-outline" size={28} color={Theme.colors.primary} />
            <Text style={styles.quickActionLabel}>Templates</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Theme.spacing.md,
  },
  welcomeBanner: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  welcomeTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: "#FFFFFF",
    marginBottom: Theme.spacing.sm,
  },
  welcomeBody: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  statCardHeader: {
    marginBottom: Theme.spacing.sm,
  },
  statNumber: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    textAlign: "center",
  },
  recentSection: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  sectionSubtitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.md,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  eventDate: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
  },
  statusBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
  },
  statusText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 11,
    color: Theme.colors.primary,
  },
  quickActionsSection: {
    marginBottom: Theme.spacing.lg,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  quickActionLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.text,
    marginTop: Theme.spacing.sm,
  },
});
