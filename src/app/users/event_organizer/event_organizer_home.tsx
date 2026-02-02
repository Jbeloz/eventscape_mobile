import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";

const STATS = [
  { id: 1, number: "12", label: "Total Projects", icon: "briefcase-outline" },
  { id: 2, number: "5", label: "In Progress", icon: "time-outline" },
  { id: 3, number: "3", label: "For Approval", icon: "checkmark-circle-outline" },
  { id: 4, number: "8", label: "Confirmed", icon: "calendar-outline" },
];

const RECENT_PROJECTS = [
  { id: 1, title: "Corporate Meeting", eventType: "Business Event", image: "🏢" },
  { id: 2, title: "Tech Conference", eventType: "Conference", image: "💻" },
];

export default function EventOrganizerHome() {
  const [notificationCount] = useState(2);

  const handleEditProject = (projectId: number) => {
    console.log("Edit project:", projectId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - Fixed */}
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>Welcome back, Alex!</Text>
          <Text style={styles.welcomeBody}>
            Here's your event management overview.
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

        {/* Recent Projects Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <Pressable>
              <Text style={styles.viewAllLink}>View All</Text>
            </Pressable>
          </View>

          {RECENT_PROJECTS.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectImageContainer}>
                <Text style={styles.projectImageEmoji}>{project.image}</Text>
              </View>
              <View style={styles.projectContent}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectType}>{project.eventType}</Text>
              </View>
              <Pressable
                style={styles.editButton}
                onPress={() => handleEditProject(project.id)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavRenderer role="event_organizer" activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },

  // Welcome Banner
  welcomeBanner: {
    backgroundColor: "rgba(236, 168, 54, 0.12)",
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
  },
  welcomeTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  welcomeBody: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#666666",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardHeader: {
    marginBottom: 12,
    alignItems: "flex-end",
  },
  statNumber: {
    fontFamily: Theme.fonts.bold,
    fontSize: 32,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: "#999999",
  },

  // Recent Projects Section
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
  },
  viewAllLink: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.primary,
  },

  // Project Card
  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  projectImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F8F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  projectImageEmoji: {
    fontSize: 28,
  },
  projectContent: {
    flex: 1,
  },
  projectTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  projectType: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: "#999999",
  },
  editButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
    color: "#FFFFFF",
  },
});
