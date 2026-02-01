import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../../constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: Theme.spacing.xl,
  },
  checkmark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
    textAlign: "center",
    marginBottom: Theme.spacing.md,
  },
  subtitleText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 16,
    color: Theme.colors.text,
    textAlign: "center",
    marginBottom: Theme.spacing.lg,
  },
  descriptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.background,
  },
});

interface SuccessfulVerificationProps {
  verificationType: "register" | "forgot" | "login";
  onContinue: () => void;
}

export default function SuccessfulVerification({
  verificationType,
  onContinue,
}: SuccessfulVerificationProps) {
  const router = useRouter();

  const handleNavigate = () => {
    if (verificationType === "register") {
      router.push("/auth");
    } else if (verificationType === "login") {
      // For login verification, call onContinue to switch back to signin tab
      onContinue();
    } else {
      onContinue();
    }
  };

  return (
    <View style={styles.container}>
      {/* Checkmark Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.checkmark}>
          <Ionicons name="checkmark" size={48} color="#4CAF50" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.titleText}>Successful Verification</Text>

      {/* Subtitle */}
      <Text style={styles.subtitleText}>Email Verified Successfully</Text>

      {/* Description */}
      <Text style={styles.descriptionText}>
        {verificationType === "register"
          ? "Your email address has been verified. You may now proceed to sign in with your account."
          : verificationType === "login"
          ? "Your email address has been verified. You may now proceed to log in with your account."
          : "Your email address has been verified. You may now proceed to reset your password."}
      </Text>

      {/* Continue Button */}
      <Pressable style={styles.button} onPress={handleNavigate}>
        <Text style={styles.buttonText}>
          {verificationType === "register"
            ? "Continue to Sign In"
            : verificationType === "login"
            ? "Continue to Sign In"
            : "Continue to Reset Password"}
        </Text>
      </Pressable>
    </View>
  );
}
