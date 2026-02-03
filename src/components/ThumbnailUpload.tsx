import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "../../constants/theme";

interface ThumbnailUploadProps {
  label: string;
  thumbnailUri: string;
  onThumbnailChange: (uri: string) => void;
  onImageZoom: (uri: string) => void;
  isOptional?: boolean;
}

export default function ThumbnailUpload({
  label,
  thumbnailUri,
  onThumbnailChange,
  onImageZoom,
  isOptional = true,
}: ThumbnailUploadProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      onThumbnailChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.formGroup}>
      <Text style={[styles.formLabel, { color: Theme.colors.text }]}>
        {label} {isOptional ? "(Optional)" : "*"}
      </Text>
      <View style={styles.thumbnailSection}>
        {thumbnailUri ? (
          <>
            <TouchableOpacity onPress={() => onImageZoom(thumbnailUri)}>
              <Image source={{ uri: thumbnailUri }} style={styles.thumbnailPreview} />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[styles.changeThumbnailButton, { flex: 1, borderColor: Theme.colors.primary }]}
                onPress={pickImage}
              >
                <Ionicons name="cloud-upload" size={16} color={Theme.colors.primary} />
                <Text style={{ color: Theme.colors.primary, marginLeft: 4, fontWeight: "600", fontSize: 12 }}>
                  Change
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.changeThumbnailButton, { flex: 1, borderColor: "#FF4444" }]}
                onPress={() => onThumbnailChange("")}
              >
                <Ionicons name="close" size={16} color="#FF4444" />
                <Text style={{ color: "#FF4444", marginLeft: 4, fontWeight: "600", fontSize: 12 }}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.uploadThumbnailButton, { borderColor: "#D0D0D0" }]}
            onPress={pickImage}
          >
            <Ionicons name="cloud-upload" size={32} color={Theme.colors.primary} />
            <Text style={[styles.uploadButtonText, { color: Theme.colors.text, marginTop: 8 }]}>
              Click to upload
            </Text>
            <Text style={[styles.uploadButtonSubtext, { color: "#999" }]}>
              PNG, JPG up to 5MB
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  thumbnailSection: {
    gap: 8,
  },
  thumbnailPreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  changeThumbnailButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadThumbnailButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 32,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  uploadButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
