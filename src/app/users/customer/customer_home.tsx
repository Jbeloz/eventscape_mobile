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
import BottomNavigation from "../../../components/user_navigation/customer/customer_navigation";

const STATS = [
  { id: 1, number: "4", label: "My Events", icon: "calendar-outline" },
  { id: 2, number: "3", label: "Completed", icon: "checkmark-done-outline" },
  { id: 3, number: "2", label: "In Progress", icon: "time-outline" },
  { id: 4, number: "1", label: "Upcoming", icon: "arrow-forward-outline" },
];

const MY_EDIT_PROJECTS = [
  { id: 1, title: "My 23rd Birthday", eventType: "Birthday Party" },
  { id: 2, title: "Wedding Reception", eventType: "Wedding" },
];

export default function CustomerHome() {
  const [notificationCount] = useState(1);

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
          <Text style={styles.welcomeTitle}>Welcome Back, JB!</Text>
          <Text style={styles.welcomeBody}>
            We're glad to have you back. Let's create amazing events together.
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

        {/* My Edit Section */}
        <View style={styles.myEditSection}>
          <Text style={styles.sectionTitle}>My Edit</Text>
          <Text style={styles.sectionSubtitle}>
            Update and refine your project details...
          </Text>

          {MY_EDIT_PROJECTS.map((project) => (
            <Pressable
              key={project.id}
              style={styles.projectCard}
              onPress={() => handleEditProject(project.id)}
            >
              <View style={styles.projectImagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={50}
                  color={Theme.colors.muted}
                />
              </View>
              <View style={styles.projectOverlay}>
                <View>
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
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
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

  // My Edit Section
  myEditSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#999999",
    marginBottom: 16,
  },

  // Project Card
  projectCard: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  projectImagePlaceholder: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  projectOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  projectType: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: "#DDDDDD",
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
