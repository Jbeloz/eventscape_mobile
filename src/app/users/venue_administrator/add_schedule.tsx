import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import DatePickerModal from "../../../components/DatePickerModal";
import TimePickerModal from "../../../components/TimePickerModal";
import TopBar from "../../../components/top_bar";
import { useAuth } from "../../../hooks/use-auth";
import { createVenueDirectBooking, supabase } from "../../../services/supabase";

interface Venue {
  venue_id: number;
  venue_name: string;
}

export default function AddSchedule() {
  const router = useRouter();
  const { user } = useAuth();
  const [notificationCount] = useState(0);
  const [venueAdminId, setVenueAdminId] = useState<number | null>(null);
  
  // Venue Selection
  const [venueId, setVenueId] = useState<number | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  
  // Client Information
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientContact, setClientContact] = useState("");
  
  // Event Details
  const [eventName, setEventName] = useState("");
  const [guestCapacity, setGuestCapacity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Organizer Information (Optional)
  const [organizerName, setOrganizerName] = useState("");
  const [organizerContact, setOrganizerContact] = useState("");
  
  // Notes
  const [notes, setNotes] = useState("");
  
  // UI States
  const [savingBooking, setSavingBooking] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // Load venues on mount
  useEffect(() => {
    if (user?.id) {
      loadVenues(user.id);
    }
  }, [user]);

  const loadVenues = async (authId: string) => {
    try {
      setLoadingVenues(true);

      // Get auth user to verify identity (this gives us UUID)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        Alert.alert("Error", "Authentication failed. Please log in again.");
        setLoadingVenues(false);
        return;
      }

      console.log("Auth User UUID:", authUser.id);

      // Step 1: Look up user_id (INTEGER) from users table using auth UUID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id")
        .eq("auth_id", authUser.id)
        .limit(1);

      if (userError || !userData || userData.length === 0) {
        console.error("Error fetching user by auth ID:", userError);
        Alert.alert("Error", "Could not find user record. Please contact support.");
        setLoadingVenues(false);
        return;
      }

      const userId = userData[0].user_id;
      console.log("Found user_id:", userId);

      // Step 2: Query venues using the integer user_id
      const { data: venuesData, error: venuesError } = await supabase
        .from("venues")
        .select("venue_id, venue_name")
        .eq("created_by", userId)
        .order("venue_name", { ascending: true });

      if (venuesError) {
        console.error("Error fetching venues:", venuesError);
        Alert.alert("Error", "Failed to load venues");
        setLoadingVenues(false);
        return;
      }

      console.log("✅ Loaded venues:", venuesData?.length || 0);
      setVenues(venuesData || []);

      // Step 3: Try to get venue_admin_id for reference (optional)
      try {
        const { data: adminData } = await supabase
          .from("venue_administrators")
          .select("venue_admin_id")
          .eq("user_id", userId)
          .limit(1);

        if (adminData && adminData.length > 0) {
          setVenueAdminId(adminData[0].venue_admin_id);
          console.log("✅ Loaded venue_admin_id:", adminData[0].venue_admin_id);
        }
      } catch (err) {
        console.log("ℹ️ Could not load venue_admin_id, continuing anyway");
      }
    } catch (err) {
      console.error("Error in loadVenues:", err);
      Alert.alert("Error", "Failed to load venues");
    } finally {
      setLoadingVenues(false);
    }
  };

  // Validate that selected date is at least 1 month from today
  const isDateValid = (date: string): boolean => {
    if (!date) return false;
    
    const selectedDate = new Date(date);
    const today = new Date();
    const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    return selectedDate >= oneMonthLater;
  };

  const handleDateSelect = (date: string) => {
    if (!isDateValid(date)) {
      Alert.alert(
        "Invalid Date",
        "Event date must be at least 1 month from today."
      );
      return;
    }
    setStartDate(date);
    setDatePickerVisible(false);
  };

  const handleSave = async () => {
    // Validation
    if (!venueAdminId) {
      Alert.alert("Error", "Venue admin ID not loaded. Please go back and try again.");
      return;
    }
    if (!venueId) {
      Alert.alert("Error", "Please select a venue");
      return;
    }
    if (!clientName.trim()) {
      Alert.alert("Error", "Client name is required");
      return;
    }
    if (!clientEmail.trim()) {
      Alert.alert("Error", "Client email is required");
      return;
    }
    if (!clientContact.trim()) {
      Alert.alert("Error", "Client contact is required");
      return;
    }
    if (!eventName.trim()) {
      Alert.alert("Error", "Event name is required");
      return;
    }
    if (!guestCapacity.trim()) {
      Alert.alert("Error", "Guest capacity is required");
      return;
    }
    if (!startDate) {
      Alert.alert("Error", "Event date is required");
      return;
    }
    if (!startTime) {
      Alert.alert("Error", "Start time is required");
      return;
    }
    if (!endTime) {
      Alert.alert("Error", "End time is required");
      return;
    }

    setSavingBooking(true);
    try {
      // If venue_admin_id is not set, try to get it from the venue assignment
      let adminId = venueAdminId;
      if (!adminId) {
        console.warn("venue_admin_id not loaded, attempting to fetch from venue assignments");
        const { data: assignmentData } = await supabase
          .from("venue_admin_assignments")
          .select("venue_admin_id")
          .eq("venue_id", venueId)
          .limit(1);

        if (assignmentData && assignmentData.length > 0) {
          adminId = assignmentData[0].venue_admin_id;
          console.log("Fetched venue_admin_id from assignments:", adminId);
        }
      }

      if (!adminId) {
        Alert.alert("Error", "No venue administrator assigned. Please contact support.");
        setSavingBooking(false);
        return;
      }

      // Create booking with direct mapping to schema
      const { error } = await createVenueDirectBooking({
        venue_id: venueId,
        venue_admin_id: adminId,
        client_name: clientName,
        client_email: clientEmail,
        client_contact: clientContact,
        event_name: eventName,
        event_date: startDate,
        time_start: startTime,
        time_end: endTime,
        guest_capacity: parseInt(guestCapacity),
        organizer_name: organizerName || undefined,
        organizer_contact: organizerContact || undefined,
        status: 'confirmed', // Set to confirmed so it shows in calendar
        notes: notes || undefined,
      });

      if (error) {
        console.error("Booking creation error:", error);
        Alert.alert("Error", `Failed to save booking: ${JSON.stringify(error)}`);
        return;
      }

      console.log("✅ Booking created successfully with status: confirmed");
      Alert.alert("Success", "Booking saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.push({
              pathname: "/users/venue_administrator",
              params: { page: "venue_dashboard", venueId: venueId.toString() },
            });
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Unexpected error:", err);
    } finally {
      setSavingBooking(false);
    }
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
          {/* Venue Selection Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Venue</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Venue *</Text>
            {loadingVenues ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Theme.colors.primary} />
              </View>
            ) : (
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowVenueDropdown(true)}
              >
                <Text style={[styles.dropdownText, !venueId && { color: Theme.colors.muted }]}>
                  {venues.find(v => v.venue_id === venueId)?.venue_name || "Select Venue"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Theme.colors.muted} />
              </Pressable>
            )}
          </View>

          {/* Venue Dropdown Modal */}
          <Modal
            visible={showVenueDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowVenueDropdown(false)}
          >
            <View style={styles.dropdownOverlay}>
              <View style={styles.dropdownMenu}>
                <FlatList
                  data={venues}
                  keyExtractor={(item) => item.venue_id.toString()}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.dropdownItem}
                      onPress={() => {
                        setVenueId(item.venue_id);
                        setShowVenueDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item.venue_name}</Text>
                    </Pressable>
                  )}
                />
              </View>
            </View>
          </Modal>

          {/* Client Information Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Client Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Client Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter client name"
              placeholderTextColor={Theme.colors.muted}
              value={clientName}
              onChangeText={setClientName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Client Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor={Theme.colors.muted}
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Client Contact Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+63 9392843915"
              placeholderTextColor={Theme.colors.muted}
              value={clientContact}
              onChangeText={setClientContact}
              keyboardType="phone-pad"
            />
          </View>

          {/* Event Details Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Event Details</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Event Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Wedding Reception"
              placeholderTextColor={Theme.colors.muted}
              value={eventName}
              onChangeText={setEventName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Guest Capacity *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number of guests"
              placeholderTextColor={Theme.colors.muted}
              value={guestCapacity}
              onChangeText={setGuestCapacity}
              keyboardType="number-pad"
            />
          </View>

          {/* Date & Time Selection */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Event Date *</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Ionicons name="calendar" size={20} color={Theme.colors.primary} />
                <Text style={styles.dateButtonText}>
                  {startDate
                    ? new Date(startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Select Date"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Start Time *</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setStartTimePickerVisible(true)}
              >
                <Ionicons name="time" size={20} color={Theme.colors.primary} />
                <Text style={styles.dateButtonText}>
                  {startTime || "Select Time"}
                </Text>
              </Pressable>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>End Time *</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setEndTimePickerVisible(true)}
              >
                <Ionicons name="time" size={20} color={Theme.colors.primary} />
                <Text style={styles.dateButtonText}>
                  {endTime || "Select Time"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Organizer Information Section (Optional) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Organizer Information (Optional)</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Organizer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter organizer name"
              placeholderTextColor={Theme.colors.muted}
              value={organizerName}
              onChangeText={setOrganizerName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Organizer Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="+63 9392843915"
              placeholderTextColor={Theme.colors.muted}
              value={organizerContact}
              onChangeText={setOrganizerContact}
              keyboardType="phone-pad"
            />
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add any additional notes..."
              placeholderTextColor={Theme.colors.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.saveButton, savingBooking && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={savingBooking}
            >
              <Text style={styles.saveButtonText}>
                {savingBooking ? "Saving..." : "Save Schedule"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.cancelButton, savingBooking && styles.buttonDisabled]}
              onPress={() => router.back()}
              disabled={savingBooking}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal with validation */}
      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelect={handleDateSelect}
        initialDate={startDate}
        title="Select Event Date (1 month from today onwards)"
      />

      {/* Start Time Picker Modal */}
      <TimePickerModal
        visible={startTimePickerVisible}
        onClose={() => setStartTimePickerVisible(false)}
        onSelect={setStartTime}
        initialTime={startTime}
        title="Select Start Time"
      />

      {/* End Time Picker Modal */}
      <TimePickerModal
        visible={endTimePickerVisible}
        onClose={() => setEndTimePickerVisible(false)}
        onSelect={setEndTime}
        initialTime={endTime}
        title="Select End Time"
      />
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
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
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
    fontFamily: Theme.fonts.regular,
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
  loadingContainer: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textarea: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  dateButtonText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
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
  buttonDisabled: {
    opacity: 0.6,
  },
});
