import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

interface PasswordRequirementItemProps {
  label: string;
  met: boolean;
}

function PasswordRequirementItem({ label, met }: PasswordRequirementItemProps) {
  return (
    <View style={styles.requirementItem}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={16}
        color={met ? "#4CAF50" : Theme.colors.muted}
        style={styles.icon}
      />
      <Text
        style={[
          styles.requirementText,
          met && styles.requirementTextMet,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const requirements = [
    {
      label: "Minimum of 8 characters",
      met: password.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "At least one lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "At least one number",
      met: /\d/.test(password),
    },
    {
      label: "At least one special character (!@#$%^&*)",
      met: /[!@#$%^&*]/.test(password),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password Requirements:</Text>
      {requirements.map((req, index) => (
        <PasswordRequirementItem
          key={index}
          label={req.label}
          met={req.met}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  title: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  icon: {
    marginRight: Theme.spacing.sm,
  },
  requirementText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
  },
  requirementTextMet: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
