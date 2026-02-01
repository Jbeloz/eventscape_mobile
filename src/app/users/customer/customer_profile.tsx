import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";
import BottomNavigation from "../../../components/user_navigation/customer/customer_navigation";
import { useAuth } from "../../../hooks/use-auth";
import { supabase } from "../../../services/supabase";

const ACCOUNT_ACTIONS = [
  { id: 1, label: "Change Password", icon: "lock-closed-outline" },
  { id: 2, label: "Log Out", icon: "log-out-outline", isDestructive: true },
];

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  profilePhotoUrl?: string;
}

interface EditFormData {
  firstName: string;
  lastName: string;
  contactNumber: string;
}

export default function CustomerProfile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notificationCount] = useState(1);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  });
  const [editFormData, setEditFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      const firstName = user.name?.split(" ")[0] || "";
      const lastName = user.name?.split(" ")[1] || "";
      setUserData({
        firstName,
        lastName,
        email: user.email || "",
        contactNumber: "",
        profilePhotoUrl: undefined,
      });
      setEditFormData({
        firstName,
        lastName,
        contactNumber: "",
      });
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) return;
    try {
      // Load user phone number and photo using auth_id
      const { data: userData } = await supabase
        .from("users")
        .select("phone_number, user_id")
        .eq("auth_id", user.id)
        .single();

      const phoneNumber = userData?.phone_number || "";
      const userId = userData?.user_id;
      
      setUserData((prev) => ({
        ...prev,
        contactNumber: phoneNumber,
      }));
      
      setEditFormData((prev) => ({
        ...prev,
        contactNumber: phoneNumber,
      }));

      // Load profile photo
      if (userId) {
        const { data: photoData } = await supabase
          .from("user_photos")
          .select("file_url")
          .eq("user_id", userId)
          .single();

        if (photoData?.file_url) {
          setUserData((prev) => ({
            ...prev,
            profilePhotoUrl: photoData.file_url,
          }));
        }
      }
      setLoading(false);
    } catch (error) {
      console.log("Error loading user data:", error);
      setLoading(false);
    }
  };

  const handleSettings = () => {
    console.log("Settings pressed");
  };

  const handleEditProfile = () => {
    setEditFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      contactNumber: userData.contactNumber,
    });
    setShowEditModal(true);
  };

  const handleUploadPhoto = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        await uploadAndSavePhoto(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to pick image");
    }
  };

  const uploadAndSavePhoto = async (imageUri: string) => {
    if (!user?.id) return;

    setUploading(true);
    try {
      // First, get the actual user_id from the database
      const { data: userData } = await supabase
        .from("users")
        .select("user_id")
        .eq("auth_id", user.id)
        .single();

      if (!userData?.user_id) {
        throw new Error("User not found in database");
      }

      const userId = userData.user_id;
      const timestamp = Date.now();
      const fileName = `customer_profile_pic_${userId}_${timestamp}`;

      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary credentials not configured");
      }

      console.log("Starting Cloudinary upload for", fileName);

      const formData = new FormData();

      if (Platform.OS === 'web') {
        // Web: fetch and upload as blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("file", blob, `${fileName}.jpg`);
      } else {
        // Mobile: use file URI directly (React Native fetch supports this)
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: `${fileName}.jpg`,
        } as any);
      }

      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `eventscape/profiles/${userId}`);
      formData.append("public_id", fileName);

      console.log("Uploading to Cloudinary...");

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("Upload response error:", errorData);
        throw new Error(`Upload failed: ${errorData.error?.message || uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      const fileUrl = uploadData.secure_url;
      // Add cache-bust parameter to prevent image caching
      const cacheBustUrl = `${fileUrl}?t=${Date.now()}`;

      console.log("Cloudinary upload successful:", fileUrl);

      // Upsert photo record (update if exists, insert if not)
      const { data: upsertData, error: upsertError } = await supabase
        .from("user_photos")
        .upsert({
          user_id: userId,
          profile_photo: uploadData.public_id,
          file_name: `customer_profile_pic_${userId}`,
          file_url: fileUrl,
        }, {
          onConflict: "user_id"
        })
        .select();

      if (upsertError) {
        console.error("Upsert error:", upsertError);
        throw upsertError;
      }

      console.log("Photo record upserted:", upsertData);

      // Reload data from database to ensure we have the latest
      await loadUserData();

      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to update photo: " + (error as any).message);
    } finally {
      setUploading(false);
    }
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

  const handleSaveProfile = async () => {
    if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Update in Supabase users table using auth_id
      if (user?.id) {
        const { error } = await supabase
          .from("users")
          .update({
            first_name: editFormData.firstName,
            last_name: editFormData.lastName,
            phone_number: editFormData.contactNumber || null,
            updated_at: new Date().toISOString(),
          })
          .eq("auth_id", user.id);

        if (error) {
          throw error;
        }
      }

      // Update local state after successful database update
      setUserData({
        ...userData,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        contactNumber: editFormData.contactNumber,
      });

      setShowEditModal(false);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - Fixed */}
      <TopBar notificationCount={notificationCount} />

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
            {userData.profilePhotoUrl ? (
              <Image
                key={userData.profilePhotoUrl}
                source={{ uri: userData.profilePhotoUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                </Text>
              </View>
            )}
            <Pressable
              style={styles.cameraButton}
              onPress={handleUploadPhoto}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="camera"
                  size={16}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </View>

          {/* Name and Role */}
          <Text style={styles.profileName}>
            {userData.firstName} {userData.lastName}
          </Text>
          <Text style={styles.profileRole}>Customer</Text>

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

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* First Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                  value={editFormData.firstName}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, firstName: text })
                  }
                  editable={!saving}
                />
              </View>

              {/* Last Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                  value={editFormData.lastName}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, lastName: text })
                  }
                  editable={!saving}
                />
              </View>

              {/* Contact Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={editFormData.contactNumber}
                  onChangeText={(text) =>
                    setEditFormData({ ...editFormData, contactNumber: text })
                  }
                  editable={!saving}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
      <BottomNavigation activeTab="profile" />
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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
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

  // Edit Modal Styles
  editModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    backgroundColor: "#FAFAFA",
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
  },
  saveButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
