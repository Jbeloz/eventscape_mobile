import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

interface MarkedDate {
  day: number;
  color: string;
}

interface MonthCalendarProps {
  currentMonth?: number;
  currentYear?: number;
  markedDates?: MarkedDate[];
  onDateSelect?: (day: number, month: number, year: number) => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MonthCalendar({
  currentMonth = 9, // October (0-indexed)
  currentYear = 2025,
  markedDates = [],
  onDateSelect,
}: MonthCalendarProps) {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const getDaysInMonth = (m: number, y: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (m: number, y: number) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const daysInPrevMonth = getDaysInMonth(month - 1, year);

  const days: Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }> = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  const today = new Date();
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday =
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday,
    });
  }

  // Next month days
  const remainingDays = 42 - days.length; // 6 rows x 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const getMarkedDateColor = (day: number) => {
    const marked = markedDates.find((d) => d.day === day);
    return marked?.color;
  };

  return (
    <View style={styles.container}>
      {/* Navigation */}
      <View style={styles.navigation}>
        <Pressable onPress={handlePrevMonth}>
          <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
        </Pressable>
        <Text style={styles.monthYear}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={handleNextMonth}>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Theme.colors.primary}
          />
        </Pressable>
      </View>

      {/* Day Headers */}
      <View style={styles.daysHeader}>
        {DAYS_OF_WEEK.map((day) => (
          <Text key={day} style={styles.dayHeaderText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((dayObj, index) => {
          const markedColor = getMarkedDateColor(dayObj.day);
          return (
            <Pressable
              key={index}
              style={[
                styles.dayCell,
                !dayObj.isCurrentMonth && styles.dayOutOfMonth,
              ]}
              onPress={() => {
                if (onDateSelect && dayObj.isCurrentMonth) {
                  onDateSelect(dayObj.day, month, year);
                }
              }}
            >
              <View
                style={[
                  styles.dayContent,
                  dayObj.isToday && styles.todayCircle,
                  markedColor && {
                    borderWidth: 2,
                    borderColor: markedColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !dayObj.isCurrentMonth && styles.dayTextOutOfMonth,
                    dayObj.isToday && styles.dayTextToday,
                  ]}
                >
                  {dayObj.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    overflow: "hidden",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthYear: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  daysHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    fontFamily: Theme.fonts.semibold,
    fontSize: 11,
    color: Theme.colors.muted,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%", // 7 columns
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  dayOutOfMonth: {
    opacity: 0.4,
  },
  dayContent: {
    width: "90%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  todayCircle: {
    backgroundColor: "#20B2AA",
  },
  dayText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
  },
  dayTextOutOfMonth: {
    color: Theme.colors.muted,
  },
  dayTextToday: {
    color: "#FFFFFF",
  },
});
