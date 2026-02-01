import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
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
import BottomNavigation from "../../../components/user_navigation/customer/customer_navigation";

// Event Card Component
interface EventCardProps {
  id: number;
  title: string;
  location: string;
  date: string;
  duration: string;
  status: "Pending" | "Booked" | "Finalization";
  onViewDetails: (eventId: number) => void;
  onViewPreview?: (eventId: number) => void;
  onViewLayout?: (eventId: number) => void;
  onApproveLayout?: (eventId: number) => void;
}

const EventCard = ({
  id,
  title,
  location,
  date,
  duration,
  status,
  onViewDetails,
  onViewPreview,
  onViewLayout,
  onApproveLayout,
}: EventCardProps) => {
  // Determine status icon and color
  const getStatusIcon = () => {
    switch (status) {
      case "Pending":
        return "ellipse";
      case "Booked":
        return "checkmark-circle";
      case "Finalization":
        return "ellipse";
      default:
        return "ellipse";
    }
  };

  return (
    <View style={styles.card}>
      {/* Event Title */}
      <Text style={styles.cardTitle}>{title}</Text>

      {/* Event Details Rows */}
      <View style={styles.detailRow}>
        <Ionicons
          name="location-outline"
          size={16}
          color={Theme.colors.muted}
          style={styles.detailIcon}
        />
        <Text style={styles.detailText}>{location}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={Theme.colors.muted}
          style={styles.detailIcon}
        />
        <Text style={styles.detailText}>{date}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons
          name="time-outline"
          size={16}
          color={Theme.colors.muted}
          style={styles.detailIcon}
        />
        <Text style={styles.detailText}>{duration}</Text>
      </View>

      <View style={[styles.detailRow, styles.statusRow]}>
        <Ionicons
          name={getStatusIcon()}
          size={16}
          color={Theme.colors.muted}
          style={styles.detailIcon}
        />
        <Text style={styles.detailText}>{status}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Primary Action: View Details */}
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => onViewDetails(id)}
        >
          <Ionicons name="eye-outline" size={16} color="white" />
          <Text style={styles.primaryButtonText}>View Details</Text>
        </Pressable>

        {/* Conditional Secondary Buttons for Finalization Status */}
        {status === "Finalization" && (
          <>
            {/* View Preview Button */}
            {onViewPreview && (
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={() => onViewPreview(id)}
              >
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color={Theme.colors.muted}
                />
                <Text style={styles.secondaryButtonText}>View Preview</Text>
              </Pressable>
            )}

            {/* View Layout Button */}
            {onViewLayout && (
              <Pressable
                style={[styles.button, styles.tertiaryButton]}
                onPress={() => onViewLayout(id)}
              >
                <Ionicons
                  name="layers-outline"
                  size={16}
                  color={Theme.colors.text}
                />
                <Text style={styles.tertiaryButtonText}>View Layout</Text>
              </Pressable>
            )}

            {/* Approve Layout Button */}
            {onApproveLayout && (
              <Pressable
                style={[styles.button, styles.successButton]}
                onPress={() => onApproveLayout(id)}
              >
                <Ionicons
                  name="checkmark-outline"
                  size={16}
                  color="#22C55E"
                />
                <Text style={styles.successButtonText}>Approve Layout</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default function CustomerMyEvents() {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample Events Data
  const events: EventCardProps[] = [
    {
      id: 1,
      title: "Year End Party 2025",
      location: "123 Mandaluyong City",
      date: "Sunday, Dec 28, 2025",
      duration: "10 Hours",
      status: "Pending",
      onViewDetails: (eventId) =>
        console.log(`View details for event ${eventId}`),
    },
    {
      id: 2,
      title: "Company Year End Party",
      location: "456 Makati Avenue",
      date: "Friday, Dec 27, 2025",
      duration: "8 Hours",
      status: "Finalization",
      onViewDetails: (eventId) =>
        console.log(`View details for event ${eventId}`),
      onViewPreview: (eventId) =>
        console.log(`View preview for event ${eventId}`),
      onViewLayout: (eventId) =>
        console.log(`View layout for event ${eventId}`),
      onApproveLayout: (eventId) =>
        console.log(`Approve layout for event ${eventId}`),
    },
    {
      id: 3,
      title: "Wedding Celebration",
      location: "789 BGC, Taguig",
      date: "Saturday, Jan 10, 2026",
      duration: "12 Hours",
      status: "Booked",
      onViewDetails: (eventId) =>
        console.log(`View details for event ${eventId}`),
    },
  ];

  // Filter events based on search query
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={1} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>My Events</Text>
          <Text style={styles.subtitle}>
            Browse your Events, Check Details...
          </Text>
        </View>

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
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Theme.colors.muted}
          />
          <Ionicons
            name="options-outline"
            size={18}
            color={Theme.colors.muted}
            style={styles.filterIcon}
          />
        </View>

        {/* Event Cards List */}
        <View style={styles.cardsContainer}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={Theme.colors.muted}
              />
              <Text style={styles.emptyStateText}>No events found</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <BottomNavigation activeTab="my_event" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1,
  },

  // Title Section
  titleSection: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.muted,
  },

  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text,
    paddingVertical: 8,
  },
  filterIcon: {
    marginLeft: 8,
  },

  // Cards Container
  cardsContainer: {
    paddingBottom: 20,
  },

  // Event Card Styles
  card: {
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Theme.colors.text,
    marginBottom: 10,
  },

  // Detail Rows
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusRow: {
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 13,
    color: Theme.colors.muted,
    flex: 1,
  },

  // Button Container
  buttonContainer: {
    marginTop: 16,
    gap: 8,
  },

  // Button Styles
  button: {
    flexDirection: "row",
    height: 40,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  // Primary Button (Gold)
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Secondary Button (Light Grey)
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  // Tertiary Button (Dark Grey/Blue)
  tertiaryButton: {
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  tertiaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },

  // Success Button (Green)
  successButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#22C55E",
  },
  successButtonText: {
    color: "#22C55E",
    fontSize: 14,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Theme.colors.muted,
    marginTop: 12,
  },
});
