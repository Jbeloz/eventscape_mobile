import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Theme } from "../../../../constants/theme";
import BlockedDatesModal, { BlockedDateData } from "../../../components/blocked_dates_modal";
import MonthCalendar from "../../../components/month_calendar";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import WeekCalendar from "../../../components/week_calendar";

export default function VenueAdminCalendar() {
  const router = useRouter();
  const [notificationCount] = useState(0);
  const [viewType, setViewType] = useState<"week" | "month">("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [blockedDatesModalVisible, setBlockedDatesModalVisible] = useState(false);

  // Mock data - will be replaced with Supabase data
  const weekRange = "October 12-18, 2025";
  const weekDays = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  
  const weekEvents = [
    { day: "Sun", title: "Summer Wedding Reception", color: "#27AE60" },
    { day: "Sat", title: "Tech Conference", color: Theme.colors.primary },
  ];

  const calendarEvents = [
    { day: "Sun", title: "Summer Wedding Reception", color: "#27AE60" },
    { day: "Sat", title: "Tech Conference", color: Theme.colors.primary },
  ];

  const scheduledEvents = [
    {
      id: 1,
      title: "Summer Wedding Reception",
      type: "Wedding",
      date: "10/12/2025",
      time: "1:00 PM - 9:00 PM",
      guests: "80-150 guests",
      organizer: "Laine Cruz",
      status: "in Progress",
    },
  ];

  const handleBlockedDatesSubmit = (data: BlockedDateData) => {
    console.log("Blocked Dates Data:", data);
    // TODO: Send to Supabase
    setBlockedDatesModalVisible(false);
  };

  // Marked dates for calendar - map events to dates
  const markedDates = [
    { day: 12, color: "#27AE60" }, // Green for wedding
    { day: 18, color: Theme.colors.primary }, // Blue for tech conference
    { day: 25, color: "#F39C12" }, // Orange for another event
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Calendar</Text>
        </View>

        {/* Week/Month Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleButton, viewType === "week" && styles.toggleButtonActive]}
            onPress={() => setViewType("week")}
          >
            <Text style={[styles.toggleText, viewType === "week" && styles.toggleTextActive]}>
              Week
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, viewType === "month" && styles.toggleButtonActive]}
            onPress={() => setViewType("month")}
          >
            <Text style={[styles.toggleText, viewType === "month" && styles.toggleTextActive]}>
              Month
            </Text>
          </Pressable>

          <View style={styles.actionButtons}>
            <Pressable onPress={() => setBlockedDatesModalVisible(true)} style={styles.actionButton}>
              <Ionicons name="close-circle-outline" size={24} color={Theme.colors.primary} />
            </Pressable>
            <Pressable 
              onPress={() => router.push({
                pathname: "/users/venue_administrator",
                params: { page: "seasonal_rates" },
              } as any)}
              style={styles.actionButton}
            >
              <Ionicons name="pricetag-outline" size={24} color={Theme.colors.primary} />
            </Pressable>
            <Pressable 
              onPress={() => router.push({
                pathname: "/users/venue_administrator",
                params: { page: "add_schedule" },
              } as any)}
              style={styles.actionButton}
            >
              <Ionicons name="add-circle-outline" size={24} color={Theme.colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Calendar Grid */}
        {viewType === "week" ? (
          <WeekCalendar
            weekRange={weekRange}
            weekDays={weekDays}
            events={weekEvents}
            onPrevWeek={() => console.log("Previous week")}
            onNextWeek={() => console.log("Next week")}
          />
        ) : (
          <MonthCalendar
            currentMonth={9}
            currentYear={2025}
            markedDates={markedDates}
            onDateSelect={(day, month, year) => {
              console.log(`Selected: ${day}/${month + 1}/${year}`);
            }}
          />
        )}

        {/* All Scheduled Events */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>All Scheduled Events</Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={Theme.colors.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Here..."
              placeholderTextColor={Theme.colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="settings-outline" size={18} color={Theme.colors.muted} />
          </View>

          {scheduledEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitleText}>{event.title}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{event.status}</Text>
                </View>
              </View>

              <View style={styles.eventDetail}>
                <Ionicons name="calendar-outline" size={16} color={Theme.colors.muted} />
                <Text style={styles.detailText}>{event.type}</Text>
                <Text style={styles.detailSeparator}>•</Text>
                <Text style={styles.detailText}>{event.date}</Text>
              </View>

              <View style={styles.eventDetail}>
                <Ionicons name="time-outline" size={16} color={Theme.colors.muted} />
                <Text style={styles.detailText}>{event.time}</Text>
                <Text style={styles.detailSeparator}>•</Text>
                <Text style={styles.detailText}>{event.guests}</Text>
              </View>

              <View style={styles.eventDetail}>
                <Text style={styles.organizerLabel}>Event Organizer: {event.organizer}</Text>
              </View>

              <Pressable style={styles.viewDetailsLink}>
                <Ionicons name="eye-outline" size={16} color={Theme.colors.primary} />
                <Text style={styles.viewDetailsText}>View Details</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNavRenderer role="venue_administrator" activeTab="calendar" />

      <BlockedDatesModal
        visible={blockedDatesModalVisible}
        onClose={() => setBlockedDatesModalVisible(false)}
        onSubmit={handleBlockedDatesSubmit}
      />
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
    marginBottom: 16,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: "transparent",
  },
  toggleButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  toggleText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  toggleTextActive: {
    color: "#FFFFFF",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginLeft: "auto",
    alignItems: "center",
  },
  actionButton: {
    padding: 4,
  },
  eventsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitleText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 11,
    color: "#27AE60",
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  detailText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
  },
  detailSeparator: {
    color: Theme.colors.muted,
  },
  organizerLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
  },
  viewDetailsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  viewDetailsText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
});
