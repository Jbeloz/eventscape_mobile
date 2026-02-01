import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import EventOrganizerNavigation from "../../../components/user_navigation/event_organizer/event_organizer_navigation";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "rejected" | "completed";

interface VenueBooking {
  id: number;
  clientName: string;
  contact: string;
  venueName: string;
  date: string;
  time: string;
  status: BookingStatus;
}

const BOOKINGS: VenueBooking[] = [
  {
    id: 1,
    clientName: "Sarah Johnson",
    contact: "sarah@email.com | +1-555-0101",
    venueName: "Grand Ballroom",
    date: "Oct 20, 2024",
    time: "6:00 PM",
    status: "confirmed",
  },
  {
    id: 2,
    clientName: "Michael Chen",
    contact: "michael@email.com | +1-555-0102",
    venueName: "Riverside Gardens",
    date: "Oct 25, 2024",
    time: "4:30 PM",
    status: "pending",
  },
  {
    id: 3,
    clientName: "Emma Wilson",
    contact: "emma@email.com | +1-555-0103",
    venueName: "Downtown Convention",
    date: "Oct 28, 2024",
    time: "7:00 PM",
    status: "cancelled",
  },
];

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case "confirmed":
      return { bg: "#E8F8F5", text: "#16A085" };
    case "pending":
      return { bg: "#FFF3CD", text: "#856404" };
    case "cancelled":
      return { bg: "#F8E5E5", text: "#C53030" };
    case "rejected":
      return { bg: "#FFE5E5", text: "#C53030" };
    case "completed":
      return { bg: "#E8F8F5", text: "#16A085" };
    default:
      return { bg: "#F0F0F0", text: "#666" };
  }
};

export default function EventOrganizerVenueBooking() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Event Venue Booking</Text>
        </View>

        {/* Search Bar with Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Theme.colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bookings..."
              placeholderTextColor={Theme.colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Ionicons name="filter" size={20} color={Theme.colors.primary} />
          </Pressable>
        </View>

        {/* Status Cards */}
        <View style={styles.bookingsList}>
          {BOOKINGS.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            return (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingContent}>
                  <Text style={styles.clientName}>{booking.clientName}</Text>
                  <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="mail-outline" size={14} color={Theme.colors.muted} />
                      <Text style={styles.detailText}>{booking.contact}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={14} color={Theme.colors.muted} />
                      <Text style={styles.detailText}>{booking.venueName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={14} color={Theme.colors.muted} />
                      <Text style={styles.detailText}>{booking.date} at {booking.time}</Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColor.bg },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons - Only for confirmed status */}
                {booking.status === "confirmed" && (
                  <View style={styles.actionButtons}>
                    <Pressable style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.rescheduleButton}>
                      <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
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
  },
  searchSection: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  bookingsList: {
    gap: 16,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bookingContent: {
    marginBottom: 16,
  },
  clientName: {
    fontSize: 15,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
    marginBottom: 12,
  },
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: "#999999",
    flex: 1,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: Theme.fonts.semibold,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#C53030",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 12,
    fontFamily: Theme.fonts.semibold,
    color: "#FFFFFF",
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.text,
    alignItems: "center",
  },
  rescheduleButtonText: {
    fontSize: 12,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
  },
});
