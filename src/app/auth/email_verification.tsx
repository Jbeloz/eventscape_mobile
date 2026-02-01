import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Theme } from "../../../constants/theme";
import { useAuth } from "../../hooks/use-auth";
import { supabase } from "../../services/supabase";
import SuccessfulVerification from "./successful_verification";

type StatusType = "loading" | "success" | "error";
type VerificationState = "input" | "success";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
  },
  descriptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  emailText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    textAlign: "center",
    marginBottom: Theme.spacing.lg,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.text,
    backgroundColor: "#F5F5F5",
  },
  otpInputFocused: {
    borderColor: Theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },
  button: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Theme.spacing.lg,
  },
  buttonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.background,
  },
  disabledButton: {
    opacity: 0.6,
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
  expirationText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    textAlign: "center",
    marginTop: Theme.spacing.sm,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: Theme.spacing.lg,
  },
  resendText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  resendLink: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  resendLinkDisabled: {
    color: Theme.colors.muted,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
});

interface EmailVerificationProps {
  email?: string;
  verificationType?: "register" | "forgot" | "login"; // Track if this is for registration, password reset, or login verification
  onVerificationSuccess?: (token?: string) => void;
}

export default function EmailVerification({
  email: propEmail,
  verificationType: propVerificationType,
  onVerificationSuccess,
}: EmailVerificationProps) {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Use route params or props (prioritize props from component usage in register)
  const email = propEmail || (params.email as string) || "";
  const verificationType = (propVerificationType || (params.type as string) || "register") as "register" | "forgot" | "login";
  
  const { verifyEmail, resendVerificationEmail, resendPasswordResetEmail } = useAuth();
  const [verificationState, setVerificationState] = useState<VerificationState>("input");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [resendCountdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(0, 1); // Only one digit
    setOtp(newOtp);

    // Move to next input if a digit is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setStatus({ type: "error", message: "Please enter a 6-digit code" });
      return;
    }

    setLoading(true);
    setStatus({ type: "loading", message: "Verifying code..." });
    try {
      // Use the verifyEmail function from the auth hook which updates the database
      await verifyEmail(email, code);

      // Different behavior based on verification type
      if (verificationType === "register") {
        // For registration, sign out so user must manually sign in
        await supabase.auth.signOut();
      } else if (verificationType === "login") {
        // For login verification, sign out first then user can login again
        await supabase.auth.signOut();
      }
      // For forgot password, keep session so user can reset password
      
      setStatus({ type: "success", message: "✅ Email verified successfully!" });
      setTimeout(() => {
        setLoading(false);
        setStatus(null);
        // Show success screen instead of redirecting immediately
        setVerificationState("success");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setStatus({ type: "error", message: errorMessage });
      setLoading(false);
    }
  };

  const handleContinueFromSuccess = () => {
    if (onVerificationSuccess) {
      onVerificationSuccess();
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return; // Don't allow resend during countdown
    
    setStatus({ type: "loading", message: "Resending code..." });
    try {
      if (verificationType === "register" || verificationType === "login") {
        await resendVerificationEmail(email);
      } else {
        await resendPasswordResetEmail(email);
      }
      setStatus({ type: "success", message: "✅ Code resent! Check your email." });
      setOtp(["", "", "", "", "", ""]);
      setResendCountdown(60); // Start 60 second countdown
      setTimeout(() => {
        setStatus(null);
      }, 2000);
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to resend code",
      });
    }
  };

  return (
    <>
      {verificationState === "input" ? (
        <>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name="mail-open-outline"
          size={48}
          color={Theme.colors.primary}
        />
      </View>

      {/* Description Text */}
      <Text style={styles.descriptionText}>
        We've sent a verification code to your email address. Please enter the code below to continue
        {verificationType === "forgot" ? " resetting your password" : ""}.
      </Text>

      {/* Email Display */}
      <Text style={styles.emailText}>{email}</Text>

      {/* Expiration Notice */}
      <Text style={styles.expirationText}>Code expires in 1 hour</Text>

      {/* OTP Input Fields */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[styles.otpInput, digit && styles.otpInputFocused]}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleOtpKeyPress(e, index)}
            placeholder="-"
            placeholderTextColor={Theme.colors.muted}
          />
        ))}
      </View>

      {/* Status Display */}
      {status && (
        <View
          style={[
            styles.statusContainer,
            status.type === "success"
              ? styles.statusSuccess
              : status.type === "error"
              ? styles.statusError
              : styles.statusLoading,
          ]}
        >
          <Ionicons
            name={
              status.type === "success"
                ? "checkmark-circle"
                : status.type === "error"
                ? "alert-circle"
                : "hourglass"
            }
            size={20}
            color={
              status.type === "success"
                ? "#4CAF50"
                : status.type === "error"
                ? "#F44336"
                : "#2196F3"
            }
          />
          <Text
            style={[
              styles.statusText,
              status.type === "success"
                ? styles.statusTextSuccess
                : status.type === "error"
                ? styles.statusTextError
                : styles.statusTextLoading,
            ]}
          >
            {status.message}
          </Text>
        </View>
      )}

      {/* Verify Code Button */}
      <Pressable
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Theme.colors.background} size="large" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </Pressable>

      {/* Resend Code */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Didn't receive the code?{" "}
          <Pressable 
            onPress={handleResendCode}
            disabled={resendCountdown > 0}
          >
            <Text style={[
              styles.resendLink,
              resendCountdown > 0 && styles.resendLinkDisabled
            ]}>
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
            </Text>
          </Pressable>
        </Text>
      </View>
        </>
      ) : (
        <SuccessfulVerification
          verificationType={verificationType}
          onContinue={handleContinueFromSuccess}
        />
      )}
    </>
  );
}
