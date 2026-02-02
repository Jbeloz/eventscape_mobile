import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";

// Project Card Component
interface ProjectCardProps {
  id: number;
  title: string;
  imageUri: string;
  onEditProject: (projectId: number) => void;
}

const ProjectCard = ({
  id,
  title,
  imageUri,
  onEditProject,
}: ProjectCardProps) => {
  return (
    <Pressable
      onPress={() => onEditProject(id)}
      style={styles.projectCardContainer}
    >
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.projectImage}
      >
        {/* Semi-transparent Dark Overlay */}
        <View style={styles.overlay}>
          {/* Overlay Content */}
          <View style={styles.overlayContent}>
            <Text style={styles.projectTitle}>{title}</Text>
            <Pressable
              style={styles.editButton}
              onPress={() => onEditProject(id)}
            >
              <Text style={styles.editButtonText}>Edit Project</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default function CustomerMyEdit() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(1);

  // Sample Projects Data
  const projects: ProjectCardProps[] = [
    {
      id: 1,
      title: "My Wedding (RJ X Diane)",
      imageUri:
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=220&fit=crop",
      onEditProject: (projectId) =>
        console.log(`Edit project ${projectId}`),
    },
    {
      id: 2,
      title: "Company Annual Event",
      imageUri:
        "https://images.unsplash.com/photo-1540575467063-178f50002c4b?w=400&h=220&fit=crop",
      onEditProject: (projectId) =>
        console.log(`Edit project ${projectId}`),
    },
    {
      id: 3,
      title: "Birthday Bash 2026",
      imageUri:
        "https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=400&h=220&fit=crop",
      onEditProject: (projectId) =>
        console.log(`Edit project ${projectId}`),
    },
    {
      id: 4,
      title: "Tech Conference Meetup",
      imageUri:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=220&fit=crop",
      onEditProject: (projectId) =>
        console.log(`Edit project ${projectId}`),
    },
  ];

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    console.log("Create new project");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Create Button Row */}
        <View style={styles.headerRow}>
          <Text style={styles.mainTitle}>My Edit</Text>
          <Pressable
            style={styles.createButton}
            onPress={handleCreateProject}
          >
            <Text style={styles.createButtonText}>Create Project</Text>
          </Pressable>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Update and refine your project details...
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Theme.colors.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Theme.colors.muted}
          />
        </View>

        {/* Recent Projects Section */}
        <View style={styles.recentProjectsSection}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>

          {/* Projects Grid */}
          <View style={styles.projectsList}>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="folder-outline"
                  size={48}
                  color={Theme.colors.muted}
                />
                <Text style={styles.emptyStateText}>No projects found</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNavRenderer role="customer" activeTab="my_edit" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header Row (Title + Create Button)
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Theme.colors.text,
  },

  // Create Button
  createButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Subtitle
  subtitle: {
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: 20,
  },

  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: Theme.colors.background,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text,
  },

  // Recent Projects Section
  recentProjectsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Theme.colors.text,
    marginBottom: 15,
  },

  // Projects List
  projectsList: {
    gap: 20,
  },

  // Project Card
  projectCardContainer: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 0,
  },
  projectImage: {
    flex: 1,
    justifyContent: "flex-end",
  },

  // Overlay
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 16,
  },
  overlayContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },

  // Edit Button
  editButton: {
    backgroundColor: "#D9D9D9",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Theme.colors.muted,
    marginTop: 12,
  },
});
