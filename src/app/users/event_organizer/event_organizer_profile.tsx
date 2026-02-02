import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import { useAuth } from "../../../hooks/use-auth";

const ACCOUNT_ACTIONS = [
  { id: 1, label: "Change Password", icon: "lock-closed-outline" },
  { id: 2, label: "Log Out", icon: "log-out-outline", isDestructive: true },
];

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
}

export default function EventOrganizerProfile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ")[1] || "",
        email: user.email || "",
        contactNumber: "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleSettings = () => {
    console.log("Settings pressed");
  };

  const handleEditProfile = () => {
    console.log("Edit Profile pressed");
  };

  const handleUploadPhoto = () => {
    console.log("Upload photo pressed");
  };

  const handleAccountAction = async (actionId: number) => {
    if (actionId === 1) {
      // Change Password
      console.log("Change password pressed");
    } else if (actionId === 2) {
      // Show logout confirmation modal
      setShowLogoutModal(true);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      router.replace("/auth");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - Fixed */}
      <TopBar notificationCount={0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* My Profile Header with Settings Button */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Pressable
            style={styles.settingsButton}
            onPress={handleSettings}
          >
            <Ionicons
              name="settings-outline"
              size={16}
              color="#FFFFFF"
              style={styles.settingsIcon}
            />
            <Text style={styles.settingsText}>Settings</Text>
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar with Camera Button */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
              </Text>
            </View>
            <Pressable
              style={styles.cameraButton}
              onPress={handleUploadPhoto}
            >
              <Ionicons
                name="camera"
                size={16}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {/* Name and Role */}
          <Text style={styles.profileName}>
            {userData.firstName} {userData.lastName}
          </Text>
          <Text style={styles.profileRole}>Event Organizer</Text>

          {/* Contact Info List */}
          <View style={styles.contactInfoContainer}>
            {/* Email */}
            <View style={styles.contactRow}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Theme.colors.primary}
                style={styles.contactIcon}
              />
              <Text style={styles.contactText}>{userData.email}</Text>
            </View>

            {/* Phone */}
            {userData.contactNumber && (
              <View style={styles.contactRow}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={Theme.colors.primary}
                  style={styles.contactIcon}
                />
                <Text style={styles.contactText}>{userData.contactNumber}</Text>
              </View>
            )}
          </View>

          {/* Edit Profile Button */}
          <Pressable
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#FFFFFF"
              style={styles.editIcon}
            />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          {ACCOUNT_ACTIONS.map((action, index) => (
            <Pressable
              key={action.id}
              style={[
                styles.accountActionRow,
                index !== ACCOUNT_ACTIONS.length - 1 &&
                  styles.accountActionBorder,
              ]}
              onPress={() => handleAccountAction(action.id)}
            >
              <View style={styles.accountActionLeft}>
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={action.isDestructive ? "#FF4444" : Theme.colors.primary}
                  style={styles.actionIcon}
                />
                <Text
                  style={[
                    styles.accountActionText,
                    action.isDestructive && styles.destructiveText,
                  ]}
                >
                  {action.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={action.isDestructive ? "#FF4444" : Theme.colors.muted}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log out of your account?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.logoutButton]}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation - Fixed */}
      <BottomNavRenderer role="event_organizer" activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Theme.spacing.md,
    paddingBottom: 100,
  },

  // Header Section
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
  },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: 20,
    gap: 6,
  },
  settingsIcon: {
    marginRight: 4,
  },
  settingsText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#FFFFFF",
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: Theme.spacing.xl,
  },

  // Avatar
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ECA83620",
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 36,
    color: Theme.colors.primary,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  // Profile Info
  profileName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: 20,
  },

  // Contact Info
  contactInfoContainer: {
    width: "100%",
    marginBottom: 24,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: Theme.spacing.md,
  },
  contactText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#666666",
  },

  // Edit Profile Button
  editProfileButton: {
    width: "100%",
    height: 45,
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  editIcon: {
    marginRight: 4,
  },
  editProfileText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  // Account Section
  accountSection: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.md,
    textTransform: "uppercase",
  },
  accountActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Theme.spacing.lg,
  },
  accountActionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  accountActionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    marginRight: Theme.spacing.md,
  },
  accountActionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  destructiveText: {
    color: "#FF4444",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: 12,
  },
  modalMessage: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  logoutButton: {
    backgroundColor: "#FF4444",
  },
  logoutButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
