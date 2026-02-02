import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

interface WeekEvent {
  day: string;
  title: string;
  color: string;
}

interface WeekCalendarProps {
  weekRange?: string;
  weekDays?: string[];
  events?: WeekEvent[];
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export default function WeekCalendar({
  weekRange = "October 12-18, 2025",
  weekDays = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"],
  events = [],
  onPrevWeek,
  onNextWeek,
}: WeekCalendarProps) {
  return (
    <View style={styles.container}>
      {/* Calendar Navigation */}
      <View style={styles.calendarNav}>
        <Pressable onPress={onPrevWeek}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </Pressable>
        <Text style={styles.dateRange}>{weekRange}</Text>
        <Pressable onPress={onNextWeek}>
          <Ionicons name="chevron-forward" size={24} color={Theme.colors.primary} />
        </Pressable>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        <View style={styles.daysHeader}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.dayHeader}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.weekGrid}>
          {weekDays.map((day) => {
            const event = events.find((e) => e.day === day);
            return (
              <View
                key={day}
                style={[
                  styles.dayCell,
                  event && { backgroundColor: event.color },
                ]}
              >
                {event && <Text style={styles.eventTitle}>{event.title}</Text>}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  calendarNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dateRange: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  daysHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 8,
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
  },
  weekGrid: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    minHeight: 100,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  eventTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#FFFFFF",
  },
});
