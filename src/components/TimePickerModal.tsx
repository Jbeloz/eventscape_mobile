import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  initialTime?: string;
  title?: string;
}

export default function TimePickerModal({
  visible,
  onClose,
  onSelect,
  initialTime,
  title = "Select Time",
}: TimePickerModalProps) {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isTypeable, setIsTypeable] = useState(false);
  const [hourInput, setHourInput] = useState("09");
  const [minuteInput, setMinuteInput] = useState("00");

  useEffect(() => {
    if (initialTime && visible) {
      const [hours, minutes] = initialTime.split(":").map(Number);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
      setHourInput(String(hours).padStart(2, "0"));
      setMinuteInput(String(minutes).padStart(2, "0"));
    } else if (visible) {
      setSelectedHour(9);
      setSelectedMinute(0);
      setHourInput("09");
      setMinuteInput("00");
    }
  }, [visible]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleHourChange = (value: string) => {
    setHourInput(value);
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 23) {
      setSelectedHour(parsed);
    }
  };

  const handleMinuteChange = (value: string) => {
    setMinuteInput(value);
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 59) {
      setSelectedMinute(parsed);
    }
  };

  const handleConfirm = () => {
    let hour = selectedHour;
    let minute = selectedMinute;

    if (isTypeable) {
      const h = parseInt(hourInput);
      if (isNaN(h) || h < 0 || h > 23) return;
      hour = h;

      const m = parseInt(minuteInput);
      if (isNaN(m) || m < 0 || m > 59) return;
      minute = m;
    }

    const formattedTime = `${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}`;
    onSelect(formattedTime);
    onClose();
  };

  const getAMPM = () => {
    return selectedHour < 12 ? "AM" : "PM";
  };

  const get12Hour = () => {
    const hour = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;
    return hour;
  };

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

          {/* Selected Time Display */}
          <View style={styles.selectedDisplay}>
            <Text style={styles.selectedText}>
              {String(get12Hour()).padStart(2, "0")}:{String(selectedMinute).padStart(2, "0")} {getAMPM()}
            </Text>
          </View>

          {/* Pickers Container with Toggle Icon */}
          <View style={styles.pickersWrapper}>
            <View style={styles.pickersContainer}>
            {/* Hour - Scrollable or Typeable */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>

              {isTypeable ? (
                <TextInput
                  style={styles.typeableInput}
                  placeholder="00"
                  placeholderTextColor={Theme.colors.muted}
                  value={hourInput}
                  onChangeText={handleHourChange}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              ) : (
                <ScrollView
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                >
                  {hours.map((hour) => (
                    <Pressable
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedHour(hour);
                        setHourInput(String(hour).padStart(2, "0"));
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour && styles.pickerItemTextSelected,
                        ]}
                      >
                        {String(hour).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Minute - Scrollable or Typeable */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>

              {isTypeable ? (
                <TextInput
                  style={styles.typeableInput}
                  placeholder="00"
                  placeholderTextColor={Theme.colors.muted}
                  value={minuteInput}
                  onChangeText={handleMinuteChange}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              ) : (
                <ScrollView
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={16}
                >
                  {minutes.map((minute) => (
                    <Pressable
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.pickerItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedMinute(minute);
                        setMinuteInput(String(minute).padStart(2, "0"));
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute && styles.pickerItemTextSelected,
                        ]}
                      >
                        {String(minute).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* AM/PM Display */}
            <View style={styles.ampmColumn}>
              <Text style={styles.pickerLabel}>Period</Text>
              <View style={styles.ampmDisplay}>
                <Text style={styles.ampmText}>{getAMPM()}</Text>
              </View>
            </View>
            </View>

            {/* Toggle Icon */}
            <Pressable
              onPress={() => setIsTypeable(!isTypeable)}
              style={styles.mainToggleButton}
            >
              <Ionicons
                name={isTypeable ? "keypad" : "list"}
                size={20}
                color={Theme.colors.primary}
              />
            </Pressable>
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
    fontSize: 18,
    color: Theme.colors.primary,
  },
  pickersWrapper: {
    marginBottom: 24,
    position: "relative",
  },
  pickersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  ampmColumn: {
    justifyContent: "center",
    alignItems: "center",
  },
  pickerLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: 8,
  },
  mainToggleButton: {
    position: "absolute",
    right: 0,
    top: -50,
    padding: 8,
  },
  typeableInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.primary,
    textAlign: "center",
    width: 60,
  },
  picker: {
    height: 150,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    alignItems: "center",
  },
  pickerItemSelected: {
    backgroundColor: Theme.colors.background,
    borderRadius: 6,
  },
  pickerItemText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  pickerItemTextSelected: {
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  minuteInputContainer: {
    marginBottom: 8,
    height: 40,
    justifyContent: "center",
  },
  minuteInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: Theme.fonts.semibold,
    fontSize: 16,
    color: Theme.colors.text,
    textAlign: "center",
  },
  minuteError: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: "#C62828",
    marginBottom: 4,
    textAlign: "center",
  },
  minuteHint: {
    fontFamily: Theme.fonts.regular,
    fontSize: 10,
    color: Theme.colors.muted,
    marginBottom: 8,
  },
  ampmDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  ampmText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
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
