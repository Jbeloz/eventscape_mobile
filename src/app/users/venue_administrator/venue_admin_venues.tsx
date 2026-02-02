import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";

export default function VenueAdminVenues() {
  const [notificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "reschedule">("all");

  const handleViewDetails = () => {
    console.log("View details clicked");
  };

  const handleReject = () => {
    console.log("Reject clicked");
  };

  const handleConfirm = () => {
    console.log("Confirm clicked");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Booking Requests</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Theme.colors.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name or event..."
            placeholderTextColor={Theme.colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <Pressable
            style={[
              styles.filterButton,
              filterStatus === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("all")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "all" && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              filterStatus === "pending" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("pending")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "pending" && styles.filterButtonTextActive,
              ]}
            >
              Pending
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              filterStatus === "confirmed" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("confirmed")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "confirmed" && styles.filterButtonTextActive,
              ]}
            >
              Confirmed
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterButton,
              filterStatus === "reschedule" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus("reschedule")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "reschedule" && styles.filterButtonTextActive,
              ]}
            >
              Reschedule
            </Text>
          </Pressable>
        </View>

        {/* Booking Card - Mockup */}
        <View style={styles.bookingCard}>
          <Text style={styles.eventName}>Year End Party 2025</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Client Name:</Text>
            <Text style={styles.detailValue}>Maria Cruz</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Contact Number:</Text>
            <Text style={styles.detailValue}>09876543211</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Event Organizer:</Text>
            <Text style={styles.detailValue}>Jose Alcantara</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>Sunday, Dec 28, 2025</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>1:00 PM - 5:00 PM</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, styles.statusPending]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          </View>

          {/* View Details Button */}
          <Pressable style={styles.viewDetailsButton} onPress={handleViewDetails}>
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </Pressable>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <Pressable style={styles.rejectButton} onPress={handleReject}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomNavRenderer role="venue_administrator" activeTab="venues" />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
    color: Theme.colors.text,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  filterButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.primary,
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
  },
  detailValue: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  statusPending: {
    backgroundColor: "#FFF3CD",
  },
  statusConfirmed: {
    backgroundColor: "#D4EDDA",
  },
  statusReschedule: {
    backgroundColor: "#FCE4EC",
  },
  statusText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#856404",
  },
  viewDetailsButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  viewDetailsButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.background,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  rejectButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#27AE60",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
