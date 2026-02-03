import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Theme } from "../../../../constants/theme";

const PROJECTS_DATA = [
  {
    id: 1,
    title: "Corporate Annual Gala",
    client: "Tech Corp Inc",
    date: "Feb 15, 2026",
    status: "In Progress",
    progress: 75,
  },
  {
    id: 2,
    title: "Wedding Reception",
    client: "Sarah & John",
    date: "Mar 20, 2026",
    status: "Planning",
    progress: 40,
  },
  {
    id: 3,
    title: "Product Launch Event",
    client: "Innovation Labs",
    date: "Feb 28, 2026",
    status: "In Progress",
    progress: 60,
  },
  {
    id: 4,
    title: "Birthday Celebration",
    client: "Alex Morgan",
    date: "Mar 5, 2026",
    status: "Confirmed",
    progress: 85,
  },
];

export default function CoordinatorProjects() {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "planning" | "inprogress" | "confirmed">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchText.toLowerCase()) ||
      project.client.toLowerCase().includes(searchText.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return (
      matchesSearch &&
      project.status.toLowerCase().replace(" ", "") === filterStatus.toLowerCase()
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planning":
        return "#FFA726";
      case "In Progress":
        return "#42A5F5";
      case "Confirmed":
        return "#66BB6A";
      default:
        return Theme.colors.muted;
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={18}
            color={Theme.colors.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            placeholderTextColor={Theme.colors.muted}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <Pressable
          style={styles.filterButton}
          onPress={() => setShowFilterMenu(!showFilterMenu)}
        >
          <Ionicons name="funnel" size={20} color={Theme.colors.primary} />
        </Pressable>
      </View>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <Pressable
            style={[
              styles.filterOption,
              filterStatus === "all" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setFilterStatus("all");
              setShowFilterMenu(false);
            }}
          >
            <Text
              style={[
                styles.filterOptionText,
                filterStatus === "all" && styles.filterOptionTextActive,
              ]}
            >
              All Projects
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterOption,
              filterStatus === "planning" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setFilterStatus("planning");
              setShowFilterMenu(false);
            }}
          >
            <Text
              style={[
                styles.filterOptionText,
                filterStatus === "planning" && styles.filterOptionTextActive,
              ]}
            >
              Planning
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterOption,
              filterStatus === "inprogress" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setFilterStatus("inprogress");
              setShowFilterMenu(false);
            }}
          >
            <Text
              style={[
                styles.filterOptionText,
                filterStatus === "inprogress" && styles.filterOptionTextActive,
              ]}
            >
              In Progress
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterOption,
              filterStatus === "confirmed" && styles.filterOptionActive,
            ]}
            onPress={() => {
              setFilterStatus("confirmed");
              setShowFilterMenu(false);
            }}
          >
            <Text
              style={[
                styles.filterOptionText,
                filterStatus === "confirmed" && styles.filterOptionTextActive,
              ]}
            >
              Confirmed
            </Text>
          </Pressable>
        </View>
      )}

      {/* Projects List */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <View>
                <Text style={styles.projectTitle}>{item.title}</Text>
                <Text style={styles.clientName}>{item.client}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { borderColor: getStatusColor(item.status) },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.dateText}>📅 {item.date}</Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${item.progress}%`, backgroundColor: getStatusColor(item.status) },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable style={[styles.button, styles.viewButton]}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.editButton]}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color={Theme.colors.muted} />
            <Text style={styles.emptyText}>No projects found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  searchFilterContainer: {
    flexDirection: "row",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  filterMenu: {
    position: "absolute",
    top: 60,
    right: Theme.spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    elevation: 8,
    zIndex: 100,
    minWidth: 150,
  },
  filterOption: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  filterOptionActive: {
    backgroundColor: "#F5F5F5",
  },
  filterOptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  filterOptionTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.semibold,
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  projectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Theme.spacing.md,
  },
  projectTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 15,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  clientName: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: Theme.radius.sm,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  statusText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 11,
  },
  dateText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#EFEFEF",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
    minWidth: 35,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    alignItems: "center",
  },
  viewButton: {
    backgroundColor: "#E3F2FD",
  },
  viewButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  editButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  editButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    marginTop: Theme.spacing.md,
  },
});
