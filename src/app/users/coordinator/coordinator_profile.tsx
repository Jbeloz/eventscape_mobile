import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
import { Theme } from "../../../../constants/theme";
import { useAuth } from "../../../hooks/use-auth";
import { supabase } from "../../../services/supabase";

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

const ACCOUNT_ACTIONS = [
  { id: 1, label: "Change Password", icon: "lock-closed-outline" },
  { id: 2, label: "Log Out", icon: "log-out-outline", isDestructive: true },
];

export default function CoordinatorProfile() {
  const { user, signOut } = useAuth();
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
    if (!user?.email) return;
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("phone_number, user_id")
        .eq("email", user.email.toLowerCase())
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

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;
      setUploading(true);

      const userId = user?.id || "unknown";
      const fileName = `coordinator_profile_pic_${userId}_${Date.now()}`;
      const cloudName = "eventscape";
      const uploadPreset = "eventscape_web_upload";

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("file", blob, `${fileName}.jpg`);
      } else {
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: `${fileName}.jpg`,
        } as any);
      }

      formData.append("upload_preset", uploadPreset);
      formData.append("folder", `eventscape/profiles/${userId}`);
      formData.append("public_id", fileName);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadResponse.json();
      const fileUrl = uploadData.secure_url;

      try {
        await supabase
          .from("user_photos")
          .delete()
          .eq("user_id", userId);
      } catch (deleteError) {
        console.warn("Could not delete old photo:", deleteError);
      }

      await supabase
        .from("user_photos")
        .insert({
          user_id: userId,
          profile_photo: uploadData.public_id,
          file_name: `coordinator_profile_pic_${userId}`,
          file_url: fileUrl,
          is_primary: true,
        })
        .select();

      await loadUserData();
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to update photo");
    } finally {
      setUploading(false);
    }
  };

  const handleEditProfile = () => {
    setEditFormData({
      firstName: userData.firstName,
      lastName: userData.lastName,
      contactNumber: userData.contactNumber,
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editFormData.firstName.trim() || !editFormData.lastName.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (user?.email) {
        await supabase
          .from("users")
          .update({
            first_name: editFormData.firstName,
            last_name: editFormData.lastName,
            phone_number: editFormData.contactNumber || null,
            updated_at: new Date().toISOString(),
          })
          .eq("email", user.email.toLowerCase());
      }

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

  const handleAccountAction = (actionId: number) => {
    if (actionId === 1) {
      console.log("Change password pressed");
    } else if (actionId === 2) {
      setShowLogoutModal(true);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.roleText}>Coordinator</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar with Camera Button */}
        <View style={styles.avatarContainer}>
          {userData.profilePhotoUrl ? (
            <Image
              source={{ uri: userData.profilePhotoUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData.firstName.charAt(0)}
                {userData.lastName.charAt(0)}
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
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>
            {userData.firstName} {userData.lastName}
          </Text>
          <Text style={styles.email}>{userData.email}</Text>
          <Text style={styles.phone}>{userData.contactNumber || "No phone number"}</Text>
        </View>

        {/* Edit Button */}
        <Pressable
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="pencil" size={16} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Account Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        {ACCOUNT_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            style={[
              styles.actionItem,
              action.isDestructive && styles.destructiveAction,
            ]}
            onPress={() => handleAccountAction(action.id)}
          >
            <Ionicons
              name={action.icon as any}
              size={20}
              color={action.isDestructive ? "#E74C3C" : Theme.colors.text}
            />
            <Text
              style={[
                styles.actionLabel,
                action.isDestructive && styles.destructiveLabel,
              ]}
            >
              {action.label}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Theme.colors.muted}
            />
          </Pressable>
        ))}
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutContent}>
          <Text style={styles.aboutLabel}>Role</Text>
          <Text style={styles.aboutValue}>Event Coordinator</Text>
        </View>
        <View style={styles.aboutContent}>
          <Text style={styles.aboutLabel}>Member Since</Text>
          <Text style={styles.aboutValue}>February 2026</Text>
        </View>
      </View>
    </ScrollView>

    {/* Edit Profile Modal */}
    <EditProfileModal
      visible={showEditModal}
      data={editFormData}
      onClose={() => setShowEditModal(false)}
      onSave={handleSaveProfile}
      onDataChange={setEditFormData}
      saving={saving}
    />

    {/* Logout Confirmation Modal */}
    <Modal visible={showLogoutModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <Text style={styles.confirmTitle}>Log Out?</Text>
          <Text style={styles.confirmMessage}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.confirmButtons}>
            <Pressable
              style={[styles.confirmButton, styles.logoutButton]}
              onPress={handleConfirmLogout}
            >
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, styles.cancelConfirmButton]}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={styles.cancelConfirmButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    marginBottom: Theme.spacing.lg,
  },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  roleText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 32,
    color: "#FFFFFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  fullName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  email: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.xs,
  },
  phone: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
  },
  editButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.sm,
    width: "100%",
    justifyContent: "center",
  },
  editButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  actionsSection: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  actionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  destructiveAction: {
    backgroundColor: "#FFF5F5",
  },
  actionLabel: {
    flex: 1,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  destructiveLabel: {
    color: "#E74C3C",
    fontFamily: Theme.fonts.semibold,
  },
  aboutSection: {
    marginBottom: Theme.spacing.lg,
  },
  aboutContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  aboutLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.xs,
  },
  aboutValue: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    width: "85%",
    maxWidth: 350,
  },
  confirmTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  confirmMessage: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    marginBottom: Theme.spacing.lg,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
  },
  logoutButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  cancelConfirmButton: {
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  cancelConfirmButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
  },
});

/* Edit Profile Modal */

interface EditModalProps {
  visible: boolean;
  data: EditFormData;
  onClose: () => void;
  onSave: () => void;
  onDataChange: (data: EditFormData) => void;
  saving?: boolean;
}

function EditProfileModal({
  visible,
  data,
  onClose,
  onSave,
  onDataChange,
  saving,
}: EditModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Edit Profile</Text>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close-outline"
                size={24}
                color={Theme.colors.text}
              />
            </Pressable>
          </View>

          <View style={modalStyles.modalBody}>
            <View style={modalStyles.formGroup}>
              <Text style={modalStyles.label}>First Name</Text>
              <TextInput
                style={modalStyles.input}
                value={data.firstName}
                onChangeText={(text) =>
                  onDataChange({ ...data, firstName: text })
                }
                placeholder="Enter first name"
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={modalStyles.label}>Last Name</Text>
              <TextInput
                style={modalStyles.input}
                value={data.lastName}
                onChangeText={(text) =>
                  onDataChange({ ...data, lastName: text })
                }
                placeholder="Enter last name"
              />
            </View>

            <View style={modalStyles.formGroup}>
              <Text style={modalStyles.label}>Contact Number</Text>
              <TextInput
                style={modalStyles.input}
                value={data.contactNumber}
                onChangeText={(text) =>
                  onDataChange({ ...data, contactNumber: text })
                }
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={modalStyles.modalFooter}>
            <Pressable
              style={[modalStyles.button, modalStyles.saveButton]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={modalStyles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
            <Pressable
              style={[modalStyles.button, modalStyles.cancelButton]}
              onPress={onClose}
            >
              <Text style={modalStyles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.lg,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  modalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text,
  },
  modalBody: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
  },
  formGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  button: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
  },
  saveButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  cancelButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
});
