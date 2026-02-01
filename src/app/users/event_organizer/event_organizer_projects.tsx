import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import EventOrganizerNavigation from "../../../components/user_navigation/event_organizer/event_organizer_navigation";

interface Project {
  id: number;
  title: string;
  eventType: string;
  date: string;
  status: string;
  emoji: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Summer Wedding",
    eventType: "Wedding",
    date: "June 15, 2024",
    status: "In Progress",
    emoji: "💍",
  },
  {
    id: 2,
    title: "Corporate Gala",
    eventType: "Corporate Event",
    date: "July 22, 2024",
    status: "Completed",
    emoji: "🎩",
  },
  {
    id: 3,
    title: "Birthday Celebration",
    eventType: "Birthday Party",
    date: "August 10, 2024",
    status: "Planning",
    emoji: "🎉",
  },
];

const { width } = Dimensions.get("window");

export default function EventOrganizerProjects() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const handleCreateProject = () => {
    console.log("Create new project");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>My Projects</Text>
          <Pressable
            style={styles.createButton}
            onPress={handleCreateProject}
          >
            <Ionicons name="add" size={20} color={Theme.colors.background} />
            <Text style={styles.createButtonText}>Create Project</Text>
          </Pressable>
        </View>

        {/* Projects Grid */}
        <View style={styles.projectsGrid}>
          {PROJECTS.map((project) => (
            <View key={project.id} style={styles.projectCard}>
              <View style={styles.projectImageContainer}>
                <Text style={styles.projectImageEmoji}>{project.emoji}</Text>
              </View>

              <View style={styles.projectDetails}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectType}>{project.eventType}</Text>
                <View style={styles.projectMetaRow}>
                  <Ionicons name="calendar-outline" size={12} color={Theme.colors.muted} />
                  <Text style={styles.projectDate}>{project.date}</Text>
                </View>
                <View style={styles.projectStatus}>
                  <Text style={styles.projectStatusText}>{project.status}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={16} color={Theme.colors.primary} />
                  <Text style={styles.actionButtonText}>Details</Text>
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="image-outline" size={16} color={Theme.colors.primary} />
                  <Text style={styles.actionButtonText}>Preview</Text>
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="pencil-outline" size={16} color={Theme.colors.primary} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <EventOrganizerNavigation activeTab="activities" />
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
  header: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 12,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  createButtonText: {
    fontSize: 13,
    fontFamily: Theme.fonts.semibold,
    color: "#FFFFFF",
  },
  projectsGrid: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  projectImageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#E8F8F5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 16,
  },
  projectImageEmoji: {
    fontSize: 48,
  },
  projectDetails: {
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  projectType: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
    marginBottom: 12,
  },
  projectMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  projectDate: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
  },
  projectStatus: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3CD",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  projectStatusText: {
    fontSize: 10,
    fontFamily: Theme.fonts.semibold,
    color: "#856404",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionButtonText: {
    fontSize: 10,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.primary,
  },
});
