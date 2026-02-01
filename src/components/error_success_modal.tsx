import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

export type ModalType = "success" | "error" | "info";

interface ErrorSuccessModalProps {
  visible: boolean;
  type: ModalType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  buttonText?: string;
  dismissible?: boolean; // Allow controlling whether modal can be dismissed by back button
}

export default function ErrorSuccessModal({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
  buttonText = "OK",
  dismissible = true,
}: ErrorSuccessModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "info":
        return "information-circle";
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "info":
        return "#2196F3";
      default:
        return "#2196F3";
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#E8F5E9";
      case "error":
        return "#FFEBEE";
      case "info":
        return "#E3F2FD";
      default:
        return "#E3F2FD";
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={dismissible ? onClose : undefined}
    >
      <View style={styles.backdrop}>
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
          {/* Icon */}
          <Ionicons
            name={getIcon()}
            size={60}
            color={getIconColor()}
            style={styles.icon}
          />

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <Pressable
            style={styles.button}
            onPress={() => {
              if (onConfirm) {
                onConfirm();
              }
              onClose();
            }}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.lg,
  },
  container: {
    borderRadius: 16,
    padding: Theme.spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
  },
  icon: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    textAlign: "center",
  },
  message: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    textAlign: "center",
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: "#FFFFFF",
  },
});
