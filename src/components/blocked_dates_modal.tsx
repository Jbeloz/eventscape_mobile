import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
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
  description: string;
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
  const [startMonth, setStartMonth] = useState("January");
  const [startDay, setStartDay] = useState("05");
  const [startYear, setStartYear] = useState("2025");
  const [endMonth, setEndMonth] = useState("January");
  const [endDay, setEndDay] = useState("05");
  const [endYear, setEndYear] = useState("2025");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");

  const handleBlockedDates = () => {
    onSubmit({
      startMonth,
      startDay,
      startYear,
      endMonth,
      endDay,
      endYear,
      description,
      reason,
    });
    resetForm();
  };

  const resetForm = () => {
    setStartMonth("January");
    setStartDay("05");
    setStartYear("2025");
    setEndMonth("January");
    setEndDay("05");
    setEndYear("2025");
    setDescription("");
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
          <View style={styles.content}>
            {/* Start Date */}
            <View style={styles.section}>
              <Text style={styles.label}>Start Date</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateSelect}>
                  <Text style={styles.dateText}>{startMonth}</Text>
                </View>
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
                <View style={styles.dateSelect}>
                  <Text style={styles.dateText}>{endMonth}</Text>
                </View>
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

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Description / Remarks</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Enter description..."
                placeholderTextColor={Theme.colors.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
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
          </View>

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
});
