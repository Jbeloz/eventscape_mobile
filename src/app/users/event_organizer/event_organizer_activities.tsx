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

type ViewMode = "monthly" | "weekly";

const SCHEDULED_EVENTS = [
  { id: 1, title: "Wedding Ceremony", date: "Oct 15, 2024", time: "4:00 PM", guests: 150, status: "In Progress" },
  { id: 2, title: "Corporate Gala", date: "Oct 18, 2024", time: "6:30 PM", guests: 300, status: "Confirmed" },
  { id: 3, title: "Birthday Bash", date: "Oct 22, 2024", time: "7:00 PM", guests: 80, status: "In Progress" },
];

export default function EventOrganizerActivities() {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Page Title */}
        <Text style={styles.pageTitle}>Activities</Text>

        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggleButton, viewMode === "monthly" && styles.toggleButtonActive]}
            onPress={() => setViewMode("monthly")}
          >
            <Text
              style={[styles.toggleButtonText, viewMode === "monthly" && styles.toggleButtonTextActive]}
            >
              Monthly
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, viewMode === "weekly" && styles.toggleButtonActive]}
            onPress={() => setViewMode("weekly")}
          >
            <Text
              style={[styles.toggleButtonText, viewMode === "weekly" && styles.toggleButtonTextActive]}
            >
              Weekly
            </Text>
          </Pressable>
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          {viewMode === "monthly" ? (
            <View style={styles.monthlyCalendar}>
              <Text style={styles.calendarLabel}>October 2024</Text>
              <View style={styles.weekDaysRow}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>
              <View style={styles.daysGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => {
                  const isToday = day === 15;
                  const isBusy = [15, 18, 22].includes(day);
                  return (
                    <View
                      key={day}
                      style={[
                        styles.dayCell,
                        isToday && styles.todayCell,
                        isBusy && !isToday && styles.busyCell,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          (isToday || isBusy) && styles.dayTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.weeklyCalendar}>
              <Text style={styles.calendarLabel}>Oct 12 - Oct 18, 2024</Text>
              <View style={styles.weekDatesRow}>
                {["12", "13", "14", "15", "16", "17", "18"].map((date) => (
                  <Pressable
                    key={date}
                    style={[styles.dateButton, date === "15" && styles.dateButtonActive]}
                  >
                    <Text
                      style={[styles.dateButtonText, date === "15" && styles.dateButtonTextActive]}
                    >
                      {date}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Theme.colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor={Theme.colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Scheduled Events List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Events</Text>
          {SCHEDULED_EVENTS.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color={Theme.colors.muted} />
                    <Text style={styles.detailText}>{event.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color={Theme.colors.muted} />
                    <Text style={styles.detailText}>{event.time}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="people-outline" size={14} color={Theme.colors.muted} />
                    <Text style={styles.detailText}>{event.guests} guests</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusBadge, event.status === "In Progress" && styles.statusInProgress]}>
                <Text style={styles.statusText}>{event.status}</Text>
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
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  toggleButtonText: {
    fontSize: 13,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.muted,
  },
  toggleButtonTextActive: {
    color: Theme.colors.background,
  },
  calendarSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  monthlyCalendar: {
    width: "100%",
  },
  weeklyCalendar: {
    width: "100%",
  },
  calendarLabel: {
    fontSize: 14,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Theme.spacing.md,
  },
  weekDayText: {
    fontSize: 11,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.muted,
    width: "14.28%",
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.xs,
  },
  todayCell: {
    backgroundColor: Theme.colors.primary,
  },
  busyCell: {
    backgroundColor: "#FFE5E5",
  },
  dayText: {
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.text,
  },
  dayTextActive: {
    color: Theme.colors.background,
    fontFamily: Theme.fonts.semibold,
  },
  weekDatesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Theme.spacing.xs,
  },
  dateButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
  },
  dateButtonActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  dateButtonText: {
    fontSize: 12,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
  },
  dateButtonTextActive: {
    color: Theme.colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  eventCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  eventDetails: {
    gap: Theme.spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  detailText: {
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.muted,
  },
  statusBadge: {
    backgroundColor: "#E8F8F5",
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginLeft: Theme.spacing.md,
  },
  statusInProgress: {
    backgroundColor: "#FFF3CD",
  },
  statusText: {
    fontSize: 10,
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.primary,
  },
});
