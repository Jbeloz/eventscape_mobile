import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Theme } from "../../constants/theme";

interface DoorDropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

const DoorDropdown = ({ label, value, options, onSelect }: DoorDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <>
      <Text style={styles.smallLabel}>{label}</Text>
      <Pressable
        style={styles.miniDropdown}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.miniDropdownText}>{value}</Text>
        <Ionicons name="chevron-down" size={16} color={Theme.colors.primary} />
      </Pressable>

      <Modal
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        />
        <View style={styles.dropdownContainer}>
          <ScrollView style={styles.optionsList}>
            {options.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.option,
                  value === option && styles.optionSelected,
                ]}
                onPress={() => handleSelect(option)}
              >
                {value === option && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={Theme.colors.primary}
                    style={styles.checkmark}
                  />
                )}
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  smallLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
    marginBottom: 6,
  },
  miniDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
  },
  miniDropdownText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  dropdownContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: 300,
  },
  optionsList: {
    paddingVertical: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionSelected: {
    backgroundColor: "#F9F9F9",
  },
  checkmark: {
    marginRight: 12,
  },
  optionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  optionTextSelected: {
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.primary,
  },
});

export default DoorDropdown;
