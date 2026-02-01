import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated, BackHandler, KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../constants/theme";
import Header from "../../components/sign_header";
import { useAuth } from "../../hooks/use-auth";
import { recoverSession } from "../../services/supabase";
import EmailVerification from "./email_verification";
import ForgotPassword from "./forgot_password";
import Login from "./login";
import Register from "./register";

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, getCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "forgot" | "verify">(
    (params.tab as any) || "signin"
  );
  const [verifyEmail, setVerifyEmail] = useState(params.email as string || "");
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Initialize auth and check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First, recover session from storage
        const session = await recoverSession();
        
        // Then fetch current user
        await getCurrentUser();
        
        // If user exists, redirect to home
        if (user || session) {
          console.log('✅ User already authenticated, redirecting...');
        }
      } catch (err) {
        console.error("❌ Auth init error:", err);
      }
    };

    initAuth();
  }, []);

  // NOTE: Redirect to customer home is handled in login/register components
  // This prevents double redirects when signing in

  const handleTabChange = (tab: "signin" | "signup" | "forgot" | "verify") => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tab);
  };


  // Handle Android back button
  
  useEffect(() => {
    const backAction = () => {
      if (activeTab === "forgot") {
        handleTabChange("signin");
        return true;
      } else if (activeTab === "signin") {
        router.push("/public/landing_screen");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Header />

          {/* Welcome Section */}
          <View style={styles.welcomeContainer}>
            <Text style={[styles.titleText, { marginBottom: Theme.spacing.sm }]}>
              {activeTab === "signin" ? "Welcome to EventScape" : activeTab === "signup" ? "Create Your Account" : activeTab === "verify" ? "Verify Your Email" : "Forgot Password"}
            </Text>
            <Text style={styles.subtitleText}>
              {activeTab === "verify" ? "Enter the verification code sent to your email." : "Join now and start managing your events efficiently."}
            </Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {/* Tabs - Only show for Sign In and Sign Up (not for forgot or verify) */}
            {activeTab !== "forgot" && activeTab !== "verify" && (
              <View style={styles.tabsContainer}>
                <Pressable
                  style={[
                    styles.tab,
                    activeTab === "signin" && styles.activeTab,
                  ]}
                  onPress={() => handleTabChange("signin")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "signin" && styles.activeTabText,
                    ]}
                  >
                    Sign In
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.tab,
                    activeTab === "signup" && styles.activeTab,
                  ]}
                  onPress={() => handleTabChange("signup")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "signup" && styles.activeTabText,
                    ]}
                  >
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Form Content */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              {activeTab === "signin" ? (
                <Login onForgotPasswordPress={() => handleTabChange("forgot")} />
              ) : activeTab === "signup" ? (
                <Register />
              ) : activeTab === "verify" ? (
                <EmailVerification
                  email={verifyEmail}
                  verificationType="login"
                  onVerificationSuccess={() => handleTabChange("signin")}
                />
              ) : (
                <ForgotPassword />
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
  },
  welcomeContainer: {
    marginBottom: Theme.spacing.xl,
  },
  titleText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 26,
    color: Theme.colors.text,
    textAlign: "center" as const,
  },
  subtitleText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    textAlign: "center" as const,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  activeTab: {
    backgroundColor: "#ECA83620",
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  activeTabText: {
    color: Theme.colors.primary,
  },
  formContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
  },
});
