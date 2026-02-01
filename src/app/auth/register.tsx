import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import PasswordRequirements from "../../components/password_requirements";
import PolicyModal from "../../components/policy_modal";
import { useAuth } from "../../hooks/use-auth";
import { supabase } from "../../services/supabase";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch
} from "../../utils/validation";
import EmailVerification from "./email_verification";

type RegisterState = "form" | "verification";

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
  checkbox: {
    marginRight: Theme.spacing.md,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  termsText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
    flex: 1,
  },
  termsLinkText: {
    fontFamily: Theme.fonts.semibold,
    color: Theme.colors.primary,
  },
  statusContainer: {
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: 8,
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
  validationErrorText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: "#F44336",
    marginTop: Theme.spacing.xs,
  },
  termsLinkPressable: {
    marginHorizontal: 0,
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

export default function Register() {
  const router = useRouter();
  const navigation = useNavigation();
  const { signUp, loading, error } = useAuth();
  const [registerState, setRegisterState] = useState<RegisterState>("form");
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<{ type: "loading" | "success" | "error"; message: string } | null>(null);
  const [policyModalVisible, setPolicyModalVisible] = useState<"terms" | "privacy" | null>(null);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
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

  // Debounce email existence check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email.trim() && validateEmail(email)) {
        setCheckingEmail(true);
        try {
          const { data, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email.toLowerCase())
            .single();

          if (data) {
            setEmailExists(true);
          } else {
            setEmailExists(false);
          }
        } catch (err) {
          // No matching email found, which is good
          setEmailExists(false);
        } finally {
          setCheckingEmail(false);
        }
      } else {
        setEmailExists(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [email]);

  // Disable back gesture when in verification state
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: registerState === "form",
    });
  }, [registerState, navigation]);

  // Validation checks
  const isFirstNameValid = firstName.trim().length > 0 && validateName(firstName);
  const isLastNameValid = lastName.trim().length > 0 && validateName(lastName);
  const isEmailValid = email.trim().length > 0 && validateEmail(email) && !emailExists;
  const isPasswordValid = password.trim().length > 0 && validatePassword(password);
  const isPasswordsMatch = confirmPassword.trim().length > 0 && validatePasswordMatch(password, confirmPassword);
  const isTermsAgreed = agreed;

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isEmailValid &&
    isPasswordValid &&
    isPasswordsMatch &&
    isTermsAgreed &&
    !loading;

  const handleCreateAccount = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !agreed) {
      setModal({
        visible: true,
        type: "error",
        title: "Missing Information",
        message: "Please fill all fields and agree to the terms",
      });
      return;
    }
    if (password !== confirmPassword) {
      setModal({
        visible: true,
        type: "error",
        title: "Password Mismatch",
        message: "Passwords do not match. Please try again.",
      });
      return;
    }

    setStatus({ type: "loading", message: "Creating account..." });
    
    try {
      // Use useAuth hook which handles both auth signup and database insertion
      const fullName = `${firstName} ${lastName}`;
      await signUp(email, password, fullName);
      
      // Move to verification screen
      setRegistrationEmail(email);
      setRegisterState("verification");
      setStatus(null);
      setModal({
        visible: true,
        type: "success",
        title: "Verify Your Account",
        message: "Account created! Please check your email for the verification code to complete the process.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : error || 'Unknown error';
      console.error("❌ Registration error:", err);
      setModal({
        visible: true,
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
      });
      setStatus(null);
    }
  };

  return (
    <>
      {registerState === "form" ? (
        <>
          {/* Subheading */}
          <Text style={styles.subheadingText}>Create Your Account to Get Started.</Text>

          {/* First Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.labelText}>First Name <Text style={{ color: Theme.colors.primary }}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter First Name"
                placeholderTextColor={Theme.colors.muted}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            {firstName.trim().length > 0 && !isFirstNameValid && (
              <Text style={styles.validationErrorText}>
                Name must be at least 2 characters
              </Text>
            )}
          </View>

          {/* Last Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.labelText}>Last Name <Text style={{ color: Theme.colors.primary }}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Last Name"
                placeholderTextColor={Theme.colors.muted}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            {lastName.trim().length > 0 && !isLastNameValid && (
              <Text style={styles.validationErrorText}>
                Name must be at least 2 characters
              </Text>
            )}
          </View>

          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.labelText}>Email Address <Text style={{ color: Theme.colors.primary }}>*</Text></Text>
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
            {email.trim().length > 0 && !validateEmail(email) && (
              <Text style={styles.validationErrorText}>
                Please enter a valid email address
              </Text>
            )}
            {email.trim().length > 0 && validateEmail(email) && emailExists && (
              <Text style={styles.validationErrorText}>
                This email already exists
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.labelText}>Password <Text style={{ color: Theme.colors.primary }}>*</Text></Text>
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
            {password.trim().length > 0 && (
              <PasswordRequirements password={password} />
            )}
          </View>

          {/* Confirm Password Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.labelText}>Confirm Password <Text style={{ color: Theme.colors.primary }}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Theme.colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={Theme.colors.muted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-outline" : "eye-off-outline"
                  }
                  size={20}
                  color={Theme.colors.muted}
                  style={styles.eyeIcon}
                />
              </Pressable>
            </View>
            {confirmPassword.trim().length > 0 &&
              password.trim().length > 0 &&
              !isPasswordsMatch && (
                <Text style={styles.validationErrorText}>
                  Passwords do not match
                </Text>
              )}
          </View>

          {/* Terms of Service Checkbox */}
          <View style={styles.termsContainer}>
            <Pressable
              style={styles.checkbox}
              onPress={() => setAgreed(!agreed)}
            >
              <Ionicons
                name={agreed ? "checkbox" : "square-outline"}
                size={24}
                color={agreed ? Theme.colors.primary : Theme.colors.muted}
              />
            </Pressable>
            <Text style={styles.termsText}>
              <Text style={{ color: Theme.colors.primary }}>*</Text> I agree to the{" "}
              <Pressable onPress={() => setPolicyModalVisible("terms")}>
                <Text style={styles.termsLinkText}>Terms of Service</Text>
              </Pressable>
              {" "}and{" "}
              <Pressable onPress={() => setPolicyModalVisible("privacy")}>
                <Text style={styles.termsLinkText}>Privacy Policy</Text>
              </Pressable>
            </Text>
          </View>

          {/* Create Account Button */}
          <Pressable 
            style={[styles.button, !isFormValid && styles.buttonDisabled]} 
            onPress={handleCreateAccount}
            disabled={!isFormValid}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.background} size="large" />
            ) : (
              <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
            )}
          </Pressable>

          {/* Status Message */}
          {status && (
            <View style={[
              styles.statusContainer,
              status.type === 'success' && styles.statusSuccess,
              status.type === 'error' && styles.statusError,
              status.type === 'loading' && styles.statusLoading,
            ]}>
              <Ionicons
                name={
                  status.type === 'success' ? 'checkmark-circle' :
                  status.type === 'error' ? 'alert-circle' :
                  'hourglass'
                }
                size={20}
                color={
                  status.type === 'success' ? '#4CAF50' :
                  status.type === 'error' ? '#F44336' :
                  '#2196F3'
                }
              />
              <Text style={[
                styles.statusText,
                status.type === 'success' && styles.statusTextSuccess,
                status.type === 'error' && styles.statusTextError,
                status.type === 'loading' && styles.statusTextLoading,
              ]}>
                {status.message}
              </Text>
            </View>
          )}
        </>
      ) : (
        <EmailVerification
          email={registrationEmail}
          verificationType="register"
          onVerificationSuccess={() => {
            // On successful verification, redirect to login
            router.replace("/auth/login");
          }}
        />
      )}

      {/* Policy Modals */}
      <PolicyModal
        visible={policyModalVisible === "terms"}
        policyType="terms"
        onClose={() => setPolicyModalVisible(null)}
      />
      <PolicyModal
        visible={policyModalVisible === "privacy"}
        policyType="privacy"
        onClose={() => setPolicyModalVisible(null)}
      />

      {/* Error/Success Modal */}
      <ErrorSuccessModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, visible: false })}
        dismissible={registerState === "form"}
      />
    </>
  );
}
