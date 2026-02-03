import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Theme } from "../../../../constants/theme";
import MonthCalendar from "../../../components/month_calendar";
import WeekCalendar from "../../../components/week_calendar";

export default function CoordinatorCalendar() {
  const router = useRouter();
  const [viewType, setViewType] = useState<"week" | "month">("week");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const weekRange = "October 12-18, 2025";
  const weekDays = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  
  const weekEvents = [
    { day: "Sun", title: "Corporate Gala Planning", color: "#27AE60" },
    { day: "Sat", title: "Wedding Coordination", color: Theme.colors.primary },
  ];

  const calendarEvents = [
    { day: "Sun", title: "Corporate Gala Planning", color: "#27AE60" },
    { day: "Sat", title: "Wedding Coordination", color: Theme.colors.primary },
  ];

  const scheduledEvents = [
    {
      id: 1,
      title: "Corporate Gala Planning",
      type: "Corporate Event",
      date: "10/12/2025",
      time: "2:00 PM - 5:00 PM",
      guests: "200-300 guests",
      organizer: "Acme Corporation",
      status: "in Progress",
    },
    {
      id: 2,
      title: "Wedding Coordination",
      type: "Wedding",
      date: "10/18/2025",
      time: "3:00 PM - 11:00 PM",
      guests: "150-200 guests",
      organizer: "Sarah & John",
      status: "confirmed",
    },
  ];

  // Marked dates for calendar
  const markedDates = [
    { day: 12, color: "#27AE60" }, // Green for corporate gala
    { day: 18, color: Theme.colors.primary }, // Blue for wedding
    { day: 25, color: "#F39C12" }, // Orange for another event
  ];

  return (
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
  );
}

const styles = StyleSheet.create({
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
