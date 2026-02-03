import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Theme } from "../../constants/theme";

interface BlockedDatesModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: BlockedDateData) => void;
}

export interface BlockedDateData {
  startMonth: string;
  startDay: string;
  startYear: string;
  endMonth: string;
  endDay: string;
  endYear: string;
  reason: string;
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

export default function BlockedDatesModal({
  visible,
  onClose,
  onSubmit,
}: BlockedDatesModalProps) {
  // Initialize with current date
  const getCurrentDateDefaults = () => {
    const today = new Date();
    return {
      month: MONTHS[today.getMonth()],
      day: String(today.getDate()).padStart(2, "0"),
      year: String(today.getFullYear()),
    };
  };

  const currentDate = getCurrentDateDefaults();
  const [startMonth, setStartMonth] = useState(currentDate.month);
  const [startDay, setStartDay] = useState(currentDate.day);
  const [startYear, setStartYear] = useState(currentDate.year);
  const [endMonth, setEndMonth] = useState(currentDate.month);
  const [endDay, setEndDay] = useState(currentDate.day);
  const [endYear, setEndYear] = useState(currentDate.year);
  const [reason, setReason] = useState("");
  const [showStartMonthPicker, setShowStartMonthPicker] = useState(false);
  const [showEndMonthPicker, setShowEndMonthPicker] = useState(false);

  const handleBlockedDates = () => {
    onSubmit({
      startMonth,
      startDay,
      startYear,
      endMonth,
      endDay,
      endYear,
      reason,
    });
    resetForm();
  };

  const resetForm = () => {
    const currentDate = getCurrentDateDefaults();
    setStartMonth(currentDate.month);
    setStartDay(currentDate.day);
    setStartYear(currentDate.year);
    setEndMonth(currentDate.month);
    setEndDay(currentDate.day);
    setEndYear(currentDate.year);
    setReason("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Blocked Dates</Text>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close-outline"
                size={24}
                color={Theme.colors.text}
              />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Start Date */}
            <View style={styles.section}>
              <Text style={styles.label}>Start Date</Text>
              <View style={styles.dateRow}>
                <Pressable 
                  style={styles.dateSelect}
                  onPress={() => setShowStartMonthPicker(true)}
                >
                  <Text style={styles.dateText}>{startMonth}</Text>
                </Pressable>
                <TextInput
                  style={styles.dateInput}
                  placeholder="05"
                  value={startDay}
                  onChangeText={setStartDay}
                  maxLength={2}
                />
                <TextInput
                  style={styles.dateInput}
                  placeholder="2025"
                  value={startYear}
                  onChangeText={setStartYear}
                  maxLength={4}
                />
                <Pressable>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={Theme.colors.primary}
                  />
                </Pressable>
              </View>
            </View>

            {/* End Date */}
            <View style={styles.section}>
              <Text style={styles.label}>End Date</Text>
              <View style={styles.dateRow}>
                <Pressable 
                  style={styles.dateSelect}
                  onPress={() => setShowEndMonthPicker(true)}
                >
                  <Text style={styles.dateText}>{endMonth}</Text>
                </Pressable>
                <TextInput
                  style={styles.dateInput}
                  placeholder="05"
                  value={endDay}
                  onChangeText={setEndDay}
                  maxLength={2}
                />
                <TextInput
                  style={styles.dateInput}
                  placeholder="2025"
                  value={endYear}
                  onChangeText={setEndYear}
                  maxLength={4}
                />
                <Pressable>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={Theme.colors.primary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Reason */}
            <View style={styles.section}>
              <Text style={styles.label}>Reason</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Enter reason..."
                placeholderTextColor={Theme.colors.muted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.blockedButton}
              onPress={handleBlockedDates}
            >
              <Text style={styles.blockedButtonText}>Blocked Dates</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Start Month Picker */}
      <Modal
        visible={showStartMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStartMonthPicker(false)}
      >
        <Pressable 
          style={styles.monthPickerOverlay}
          onPress={() => setShowStartMonthPicker(false)}
        >
          <View style={styles.monthPickerContainer}>
            <Text style={styles.monthPickerTitle}>Select Start Month</Text>
            <ScrollView>
              {MONTHS.map((month) => (
                <Pressable
                  key={month}
                  style={[
                    styles.monthOption,
                    startMonth === month && styles.monthOptionSelected,
                  ]}
                  onPress={() => {
                    setStartMonth(month);
                    setShowStartMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      startMonth === month && styles.monthOptionTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* End Month Picker */}
      <Modal
        visible={showEndMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndMonthPicker(false)}
      >
        <Pressable 
          style={styles.monthPickerOverlay}
          onPress={() => setShowEndMonthPicker(false)}
        >
          <View style={styles.monthPickerContainer}>
            <Text style={styles.monthPickerTitle}>Select End Month</Text>
            <ScrollView>
              {MONTHS.map((month) => (
                <Pressable
                  key={month}
                  style={[
                    styles.monthOption,
                    endMonth === month && styles.monthOptionSelected,
                  ]}
                  onPress={() => {
                    setEndMonth(month);
                    setShowEndMonthPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      endMonth === month && styles.monthOptionTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "85%",
    maxWidth: 400,
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: "80%",
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
  content: {
    marginBottom: 16,
    maxHeight: 300,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateSelect: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.text,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    width: 50,
    textAlign: "center",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: Theme.colors.text,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  blockedButton: {
    flex: 1,
    backgroundColor: "#27AE60",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  blockedButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  monthPickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  monthPickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "80%",
    maxHeight: "80%",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  monthPickerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  monthOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    backgroundColor: "#F5F5F5",
  },
  monthOptionSelected: {
    backgroundColor: Theme.colors.primary,
  },
  monthOptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  monthOptionTextSelected: {
    color: "#FFFFFF",
    fontFamily: Theme.fonts.semibold,
  },
});
