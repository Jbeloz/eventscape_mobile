import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Theme } from "../../../constants/theme";
import ErrorSuccessModal from "../../components/error_success_modal";
import { useAuth } from "../../hooks/use-auth";
import { supabase } from "../../services/supabase";
import EmailVerification from "./email_verification";

type ForgotPasswordState = "email" | "verification" | "reset";
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
  button: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
  },
  labelText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  buttonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.background,
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
  descriptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  eyeIcon: {
    marginLeft: Theme.spacing.sm,
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
});

export default function ForgotPassword() {
  const router = useRouter();
  const { sendPasswordResetEmail, resetPassword, resendPasswordResetEmail } = useAuth();
  const [forgotPasswordState, setForgotPasswordState] = useState<ForgotPasswordState>("email");
  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSendVerification = async () => {
    if (!email.trim()) {
      setStatus({ type: "error", message: "Please enter your email address" });
      return;
    }

    setLoading(true);
    setStatus({ type: "loading", message: "Sending verification code..." });
    try {
      await sendPasswordResetEmail(email);
      setStatus({ type: "success", message: "✅ Verification code sent! Check your email." });
      setTimeout(() => {
        setLoading(false);
        setStatus(null);
        setVerifiedEmail(email);
        setForgotPasswordState("verification");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send password reset email";
      setStatus({ type: "error", message: errorMessage });
      setLoading(false);
    }
  };

  const handleVerificationSuccess = (token?: string) => {
    // Move to password reset screen
    setForgotPasswordState("reset");
    setStatus(null);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setStatus({ type: "error", message: "Please enter your new password" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setStatus({ type: "loading", message: "Resetting password..." });
    try {
      await resetPassword(newPassword);
      setLoading(false);
      setStatus(null);
      // Show modal for success
      setShowResetModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
      setStatus({ type: "error", message: errorMessage });
      setLoading(false);
    }
  };

  const handleResetModalClose = async () => {
    setShowResetModal(false);
    // Sign out the user after successful password reset
    await supabase.auth.signOut();
    // Reset form and go back to email entry
    setEmail("");
    setVerifiedEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordState("email");
    // Redirect to login
    router.push('/auth');
  };

  return (
    <>
      <ErrorSuccessModal
        visible={showResetModal}
        type="success"
        title="Password Resetted"
        message="Your password has been successfully reset. Please log in with your new password."
        buttonText="Go to Login"
        onClose={handleResetModalClose}
        onConfirm={handleResetModalClose}
      />
      {forgotPasswordState === "email" ? (
        <>
          {/* Back Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => router.push('/auth')}
          >
            <View style={styles.backButtonContent}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={Theme.colors.primary}
              />
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </Pressable>

          {/* Description Text */}
          <Text style={styles.descriptionText}>
            Enter the email address associated with your account. We'll send you a verification code to reset your password.
          </Text>

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

          {/* Send Verification Code Button */}
          <Pressable 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={handleSendVerification}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.background} size="large" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </Pressable>
        </>
      ) : forgotPasswordState === "verification" ? (
        <EmailVerification
          email={verifiedEmail}
          verificationType="forgot"
          onVerificationSuccess={handleVerificationSuccess}
        />
      ) : (
        <>
          {/* Description Text */}
          <Text style={styles.descriptionText}>
            Enter your new password to reset your account password.
          </Text>

          {/* New Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.labelText}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your new password"
                placeholderTextColor={Theme.colors.muted}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
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
          </View>

          {/* Confirm Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.labelText}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your new password"
                placeholderTextColor={Theme.colors.muted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={Theme.colors.muted}
                  style={styles.eyeIcon}
                />
              </Pressable>
            </View>
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

          {/* Reset Password Button */}
          <Pressable 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.background} size="large" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </Pressable>
        </>
      )}
    </>
  );
}
