import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Theme } from "../../constants/theme";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  initialDate?: string;
  title?: string;
}

export default function DatePickerModal({
  visible,
  onClose,
  onSelect,
  initialDate,
  title = "Select Event Date",
}: DatePickerModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Normalize today to midnight for proper date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Minimum date is 1 month from today
  const minDate = new Date(today);
  minDate.setMonth(minDate.getMonth() + 1);

  useEffect(() => {
    if (visible) {
      if (initialDate) {
        const date = new Date(initialDate);
        setSelectedDate(date);
        setCurrentDate(date);
      } else {
        setCurrentDate(today);
        setSelectedDate(today);
      }
    }
  }, [visible]);


  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleSelectDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    
    if (date < minDate) {
      return;
    }
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onSelect(`${year}-${month}-${day}`);
      onClose();
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={styles.dayText}></Text>
        </View>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      date.setHours(0, 0, 0, 0);
      
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear();

      const isDisabled = date < minDate;

      days.push(
        <Pressable
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell,
            isDisabled && styles.disabledDayCell,
          ]}
          onPress={() => handleSelectDate(day)}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isDisabled && styles.disabledDayText,
            ]}
          >
            {day}
          </Text>
        </Pressable>
      );
    }

    return days;
  };

  const monthYear = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const formattedDate = selectedDate
    ? selectedDate.toLocaleString("default", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No date selected";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={Theme.colors.primary}
              />
            </Pressable>
          </View>

          {/* Selected Date Display */}
          <View style={styles.selectedDisplay}>
            <Text style={styles.selectedText}>{formattedDate}</Text>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            {/* Month/Year Header with Navigation */}
            <View style={styles.monthHeader}>
              <Pressable onPress={previousMonth}>
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={Theme.colors.primary}
                />
              </Pressable>
              <Text style={styles.monthYear}>{monthYear}</Text>
              <Pressable onPress={nextMonth}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Theme.colors.primary}
                />
              </Pressable>
            </View>

            {/* Day headers */}
            <View style={styles.weekHeader}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <View key={day} style={styles.dayHeaderCell}>
                  <Text style={styles.dayHeaderText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  selectedDisplay: {
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  selectedText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 16,
    color: Theme.colors.primary,
  },
  calendarContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthYear: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  dayHeaderCell: {
    width: "14.28%",
    alignItems: "center",
  },
  dayHeaderText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.muted,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 8,
  },
  selectedDayCell: {
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  dayText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  selectedDayText: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  disabledDayCell: {
    opacity: 0.4,
  },
  disabledDayText: {
    color: Theme.colors.muted,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  cancelButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  confirmButton: {
    backgroundColor: Theme.colors.primary,
  },
  confirmButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
