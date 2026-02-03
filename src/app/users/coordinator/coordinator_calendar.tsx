import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Theme } from "../../../../constants/theme";
import MonthCalendar from "../../../components/month_calendar";

export default function CoordinatorCalendar() {
  const [selectedDateInfo, setSelectedDateInfo] = useState<any>(null);

  const getMarkedDates = () => {
    const marked: any = {};

    // Sample marked dates (you would fetch these from your data)
    const sampleDates = [
      new Date(2026, 1, 5),
      new Date(2026, 1, 15),
      new Date(2026, 2, 20),
    ];

    sampleDates.forEach((date) => {
      const dateStr = date.toISOString().split("T")[0];
      marked[dateStr] = {
        marked: true,
        dotColor: "#4CAF50",
      };
    });

    return marked;
  };

  const onDateSelect = (day: number, month: number, year: number) => {
    setSelectedDateInfo({
      day,
      month,
      year,
      events: [
        {
          id: 1,
          title: "Event Planning Session",
          time: "10:00 AM - 11:30 AM",
        },
      ],
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Events Calendar</Text>
        <Text style={styles.subtitle}>View all your coordinated events</Text>
      </View>

      <MonthCalendar
        markedDates={getMarkedDates()}
        onDateSelect={onDateSelect}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Event Scheduled</Text>
        </View>
      </View>

      {/* Date Info Modal */}
      {selectedDateInfo && (
        <View style={styles.dateInfoBox}>
          <View style={styles.dateInfoHeader}>
            <Text style={styles.dateInfoTitle}>
              {new Date(
                selectedDateInfo.year,
                selectedDateInfo.month,
                selectedDateInfo.day
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <Text
              style={styles.closeButton}
              onPress={() => setSelectedDateInfo(null)}
            >
              ✕
            </Text>
          </View>

          {selectedDateInfo.events.length > 0 && (
            <View style={styles.dateInfoSection}>
              <Text style={styles.dateInfoSectionTitle}>Events</Text>
              {selectedDateInfo.events.map((event: any) => (
                <View key={event.id} style={styles.eventItem}>
                  <Text style={styles.eventItemTitle}>{event.title}</Text>
                  <Text style={styles.eventItemTime}>{event.time}</Text>
                </View>
              ))}
            </View>
          )}

          {selectedDateInfo.events.length === 0 && (
            <View style={styles.dateInfoSection}>
              <Text style={styles.noEventsText}>No events scheduled</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Theme.spacing.md,
  },
  header: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 22,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  legend: {
    marginTop: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  dateInfoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  dateInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  dateInfoTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  closeButton: {
    fontSize: 18,
    color: Theme.colors.text,
  },
  dateInfoSection: {
    marginBottom: Theme.spacing.md,
  },
  dateInfoSectionTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  eventItem: {
    backgroundColor: "#F5F5F5",
    borderRadius: Theme.radius.sm,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  eventItemTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
  },
  eventItemTime: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: Theme.spacing.xs,
  },
  noEventsText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
  },
});
