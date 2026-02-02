import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Theme } from "../../../../constants/theme";
import TopBar from "../../../components/top_bar";

const PACKAGE_OPTIONS = [
  { id: "1", label: "Venue Rental" },
  { id: "2", label: "Catering Service" },
  { id: "3", label: "Decoration" },
  { id: "4", label: "Photography" },
  { id: "5", label: "Audio/Visual" },
  { id: "6", label: "Full Package" },
];

export default function AddSchedule() {
  const router = useRouter();
  const [notificationCount] = useState(0);
  const [packageName, setPackageName] = useState("");
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [price, setPrice] = useState("");
  const [guestName, setGuestName] = useState("");
  const [overtimeCharges, setOvertimeCharges] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [organizerName1, setOrganizerName1] = useState("");
  const [contactNumber1, setContactNumber1] = useState("");
  const [email1, setEmail1] = useState("");
  const [organizerName2, setOrganizerName2] = useState("");
  const [contactNumber2, setContactNumber2] = useState("");
  const [email2, setEmail2] = useState("");
  const [notes, setNotes] = useState("");
  const [discounts, setDiscounts] = useState("");
  const [extraCharges, setExtraCharges] = useState("");

  const handleSelectPackage = (packageLabel: string) => {
    setPackageName(packageLabel);
    setShowPackageDropdown(false);
  };

  const handleSave = () => {
    console.log({
      packageName,
      price,
      guestName,
      overtimeCharges,
      overtimeHours,
      organizerName1,
      contactNumber1,
      email1,
      organizerName2,
      contactNumber2,
      email2,
      notes,
      discounts,
      extraCharges,
    });
    // TODO: Save to Supabase
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar notificationCount={notificationCount} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={Theme.colors.primary} />
          </Pressable>
          <Text style={styles.title}>Add Schedule</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Package Name Dropdown */}
          <View style={styles.field}>
            <Text style={styles.label}>Package Name/Type</Text>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => setShowPackageDropdown(true)}
            >
              <Text style={[styles.dropdownText, !packageName && { color: Theme.colors.muted }]}>
                {packageName || "Package Name/Type"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Theme.colors.muted} />
            </Pressable>
          </View>

          {/* Package Dropdown Modal */}
          <Modal
            visible={showPackageDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPackageDropdown(false)}
          >
            <View style={styles.dropdownOverlay}>
              <View style={styles.dropdownMenu}>
                <FlatList
                  data={PACKAGE_OPTIONS}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => handleSelectPackage(item.label)}
                    >
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                    </Pressable>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Price & Guest Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="₱"
                placeholderTextColor={Theme.colors.muted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Guest</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter guest name"
                placeholderTextColor={Theme.colors.muted}
                value={guestName}
                onChangeText={setGuestName}
              />
            </View>
          </View>

          {/* Overtime Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Over Time Charges</Text>
              <TextInput
                style={styles.input}
                placeholder="(Optional) ₱"
                placeholderTextColor={Theme.colors.muted}
                value={overtimeCharges}
                onChangeText={setOvertimeCharges}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Over Time Hour(s)</Text>
              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="00:00"
                  placeholderTextColor={Theme.colors.muted}
                  value={overtimeHours}
                  onChangeText={setOvertimeHours}
                  keyboardType="number-pad"
                />
                <Text style={styles.timeLabel}>AM</Text>
                <Text style={styles.timeLabel}>PM</Text>
              </View>
            </View>
          </View>

          {/* Event Organizer 1 */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Event Organizer Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter here Name"
                  placeholderTextColor={Theme.colors.muted}
                  value={organizerName1}
                  onChangeText={setOrganizerName1}
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+63 9392843915"
                  placeholderTextColor={Theme.colors.muted}
                  value={contactNumber1}
                  onChangeText={setContactNumber1}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="user@example.com"
                placeholderTextColor={Theme.colors.muted}
                value={email1}
                onChangeText={setEmail1}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Event Organizer 2 */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Event Organizer Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter here Name"
                  placeholderTextColor={Theme.colors.muted}
                  value={organizerName2}
                  onChangeText={setOrganizerName2}
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Contact Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+63 9392843915"
                  placeholderTextColor={Theme.colors.muted}
                  value={contactNumber2}
                  onChangeText={setContactNumber2}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="user@example.com"
                placeholderTextColor={Theme.colors.muted}
                value={email2}
                onChangeText={setEmail2}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="user@example.com"
              placeholderTextColor={Theme.colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Discounts & Extra Charges Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Discounts</Text>
              <TextInput
                style={styles.input}
                placeholder="discounts"
                placeholderTextColor={Theme.colors.muted}
                value={discounts}
                onChangeText={setDiscounts}
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Extra Service Charges</Text>
              <TextInput
                style={styles.input}
                placeholder="₱"
                placeholderTextColor={Theme.colors.muted}
                value={extraCharges}
                onChangeText={setExtraCharges}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Schedule</Text>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  form: {
    gap: 16,
  },
  field: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  label: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Theme.colors.text,
    backgroundColor: "#FAFAFA",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  dropdownText: {
    fontSize: 13,
    color: Theme.colors.text,
    flex: 1,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    width: "80%",
    maxHeight: 300,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownItemText: {
    fontSize: 13,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
  },
  textarea: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#27AE60",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
});
