import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Theme } from "../../../constants/theme";
import ErrorSuccessModal from "../../components/error_success_modal";
import { useAuth } from "../../hooks/use-auth";
import { validateEmail } from "../../utils/validation";

type StatusType = "loading" | "success" | "error";

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: Theme.spacing.lg,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: Theme.spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text,
  },
  inputIcon: {
    marginRight: Theme.spacing.sm,
  },
  eyeIcon: {
    marginLeft: Theme.spacing.sm,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    opacity: 0.6,
  },
  labelText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  subheadingText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  buttonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.background,
  },
  linkText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: Theme.spacing.md,
  },
  passwordHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  passwordHeader: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  forgotPasswordLinkContainer: {
    alignItems: "flex-end",
    marginTop: Theme.spacing.sm,
  },
  forgotPasswordLink: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  statusContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: 8,
    marginBottom: Theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  statusText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    flex: 1,
  },
  statusSuccess: {
    backgroundColor: "#E8F5E9",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  statusError: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  statusLoading: {
    backgroundColor: "#E3F2FD",
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  statusTextSuccess: {
    color: "#2E7D32",
  },
  statusTextError: {
    color: "#C62828",
  },
  statusTextLoading: {
    color: "#1565C0",
  },
  backButton: {
    marginBottom: Theme.spacing.lg,
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
  },
  backButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  verificationModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  verificationModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  verificationModalIcon: {
    marginBottom: 16,
  },
  verificationModalTitle: {
    fontSize: 18,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  verificationModalMessage: {
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    color: Theme.colors.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  verificationModalButtonContainer: {
    width: "100%",
    gap: 12,
  },
  verificationModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  verificationModalPrimaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  verificationModalSecondaryButton: {
    backgroundColor: "#F0F0F0",
  },
  verificationModalButtonText: {
    fontSize: 14,
    fontFamily: Theme.fonts.semibold,
  },
  verificationModalPrimaryButtonText: {
    color: "#FFFFFF",
  },
  verificationModalSecondaryButtonText: {
    color: Theme.colors.text,
  },
});

const createEmailState = (email: string) => {
  return email;
};

interface LoginProps {
  onForgotPasswordPress?: () => void;
}

export default function Login({ onForgotPasswordPress }: LoginProps) {
  const router = useRouter();
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [modal, setModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });
  const [verificationModal, setVerificationModal] = useState<{
    visible: boolean;
    email: string;
  }>({
    visible: false,
    email: "",
  });

  // Validation checks
  const isEmailValid = email.trim().length > 0 && validateEmail(email);
  const isPasswordValid = password.trim().length > 0; // Login only requires non-empty password
  const isFormValid = isEmailValid && isPasswordValid && !loading;

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setModal({
        visible: true,
        type: "error",
        title: "Missing Information",
        message: "Please enter both email and password",
      });
      return;
    }

    setStatus({ type: "loading", message: "Signing in..." });
    try {
      await signIn(email, password);
      setModal({
        visible: true,
        type: "success",
        title: "Success",
        message: "You have logged in successfully!",
      });
      // Give user time to see the success message
      setTimeout(() => {
        setStatus(null);
        // Navigate based on user role - will be handled by splash screen
        router.replace("/public/splash_screen");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : error || "An unexpected error occurred";
      
      // Determine error type and show appropriate modal
      let modalTitle = "Login Failed";
      let modalMessage = errorMessage;
      let modalType: "error" | "info" = "error";

      if (
        errorMessage.includes("verify your email") ||
        errorMessage.includes("not confirmed") ||
        errorMessage.includes("not verified") ||
        errorMessage.includes("email verification") ||
        errorMessage.includes("Email not confirmed")
      ) {
        // Show custom verification modal instead of error modal
        setVerificationModal({
          visible: true,
          email: email,
        });
        setStatus(null);
        return;
      } else if (errorMessage.includes("Invalid login credentials")) {
        modalTitle = "Invalid Credentials";
        modalMessage = "The email or password you entered is incorrect. Please try again.";
      } else if (errorMessage.includes("Not authorized")) {
        modalTitle = "Access Denied";
        modalMessage = errorMessage;
      }

      setModal({
        visible: true,
        type: modalType,
        title: modalTitle,
        message: modalMessage,
      });
      setStatus(null);
    }
  };

  return (
    <>
      {/* Subheading */}
      <Text style={styles.subheadingText}>Welcome Back! Please log in to continue.</Text>

      {/* Email Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.labelText}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={Theme.colors.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Email Address"
            placeholderTextColor={Theme.colors.muted}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>

      {/* Password Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.labelText}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Theme.colors.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={Theme.colors.muted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={Theme.colors.muted}
              style={styles.eyeIcon}
            />
          </Pressable>
        </View>
        <Pressable style={styles.forgotPasswordLinkContainer} onPress={onForgotPasswordPress}>
          <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
        </Pressable>
      </View>

      {/* Status Display */}
      {status && (
        <View style={[
          styles.statusContainer,
          status.type === "success" ? styles.statusSuccess :
          status.type === "error" ? styles.statusError :
          styles.statusLoading
        ]}>
          <Ionicons
            name={
              status.type === "success" ? "checkmark-circle" :
              status.type === "error" ? "alert-circle" :
              "information-circle"
            }
            size={20}
            color={
              status.type === "success" ? "#4CAF50" :
              status.type === "error" ? "#F44336" :
              "#2196F3"
            }
          />
          <Text style={[
            styles.statusText,
            status.type === "success" ? styles.statusTextSuccess :
            status.type === "error" ? styles.statusTextError :
            styles.statusTextLoading
          ]}>
            {status.message}
          </Text>
        </View>
      )}

      {/* Sign In Button */}
      <Pressable 
        style={[styles.button, !isFormValid && styles.buttonDisabled]} 
        onPress={handleSignIn}
        disabled={!isFormValid}
      >
        {loading ? (
          <ActivityIndicator color={Theme.colors.background} size="large" />
        ) : (
          <Text style={styles.buttonText}>SIGN IN</Text>
        )}
      </Pressable>

      {/* Error/Success Modal */}
      <ErrorSuccessModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, visible: false })}
      />

      {/* Email Verification Modal */}
      <Modal
        visible={verificationModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVerificationModal({ ...verificationModal, visible: false })}
      >
        <View style={styles.verificationModalOverlay}>
          <View style={styles.verificationModalContent}>
            <View style={styles.verificationModalIcon}>
              <Ionicons
                name="mail-unread-outline"
                size={48}
                color={Theme.colors.primary}
              />
            </View>

            <Text style={styles.verificationModalTitle}>
              Email Not Verified
            </Text>

            <Text style={styles.verificationModalMessage}>
              Your email hasn't been verified yet. Please check your inbox for the verification code and verify your email to continue.
            </Text>

            <View style={styles.verificationModalButtonContainer}>
              <Pressable
                style={[styles.verificationModalButton, styles.verificationModalPrimaryButton]}
                onPress={() => {
                  setVerificationModal({ ...verificationModal, visible: false });
                  // Navigate back to auth index with verify tab
                  router.push({
                    pathname: "/auth",
                    params: { tab: "verify", email: verificationModal.email, type: "login" },
                  });
                }}
              >
                <Text style={[styles.verificationModalButtonText, styles.verificationModalPrimaryButtonText]}>
                  Verify Email
                </Text>
              </Pressable>

              <Pressable
                style={[styles.verificationModalButton, styles.verificationModalSecondaryButton]}
                onPress={() => setVerificationModal({ ...verificationModal, visible: false })}
              >
                <Text style={[styles.verificationModalButtonText, styles.verificationModalSecondaryButtonText]}>
                  Go Back
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
