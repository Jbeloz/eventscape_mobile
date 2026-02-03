import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import { VenueSeasonalPricing } from "../../../models/types";
import {
    createVenueDirectBooking,
    getActiveVenueSeasonalPricing
} from "../../../services/supabase";
import {
    calculateSeasonalPrice,
    findApplicableSeasons
} from "../../../utils/seasonalPricingUtils";

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
  const [venueId] = useState(1); // TODO: Get from navigation params or context
  const [venueAdminId] = useState(1); // TODO: Get from auth context
  const [packageName, setPackageName] = useState("");
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const [price, setPrice] = useState("");
  const [guestName, setGuestName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guestCapacity, setGuestCapacity] = useState("");
  const [overtimeCharges, setOvertimeCharges] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [contactNumber1, setContactNumber1] = useState("");
  const [email1, setEmail1] = useState("");
  const [organizerName2, setOrganizerName2] = useState("");
  const [contactNumber2, setContactNumber2] = useState("");
  const [notes, setNotes] = useState("");
  const [discounts, setDiscounts] = useState("");
  const [extraCharges, setExtraCharges] = useState("");
  const [seasonalRates, setSeasonalRates] = useState<VenueSeasonalPricing[]>([]);
  const [dynamicPrice, setDynamicPrice] = useState<number | null>(null);
  const [priceAlert, setPriceAlert] = useState<string>("");
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);

  // Load seasonal rates on mount
  useEffect(() => {
    loadSeasonalRates();
  }, [venueId]);

  // Recalculate price when dates or base price change
  useEffect(() => {
    if (startDate && price) {
      calculateDynamicPrice();
    } else {
      setDynamicPrice(null);
      setPriceAlert("");
    }
  }, [startDate, price, seasonalRates]);

  const loadSeasonalRates = async () => {
    try {
      const { data, error } = await getActiveVenueSeasonalPricing(venueId);
      if (error) {
        console.error("Error loading seasonal rates:", error);
      } else if (data) {
        setSeasonalRates(data as VenueSeasonalPricing[]);
      }
    } catch (error) {
      console.error("Error in loadSeasonalRates:", error);
    }
  };

  const calculateDynamicPrice = async () => {
    setLoadingPrices(true);
    try {
      const bookingStartDate = new Date(startDate);
      const basePrice = parseFloat(price);

      if (isNaN(basePrice) || basePrice <= 0) {
        setDynamicPrice(null);
        setPriceAlert("");
        return;
      }

      // Find applicable seasonal rates
      const applicableSeasons = findApplicableSeasons(
        bookingStartDate,
        bookingStartDate,
        seasonalRates
      );

      if (applicableSeasons.length > 0) {
        // Calculate seasonal price
        const result = calculateSeasonalPrice(
          basePrice,
          bookingStartDate,
          bookingStartDate,
          applicableSeasons
        );

        setDynamicPrice(result.adjustedPrice);
        setPriceAlert(result.description);
      } else {
        setDynamicPrice(null);
        setPriceAlert("");
      }
    } catch (error) {
      console.error("Error calculating dynamic price:", error);
      setDynamicPrice(null);
      setPriceAlert("");
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleSelectPackage = (packageLabel: string) => {
    setPackageName(packageLabel);
    setShowPackageDropdown(false);
  };

  const handleSave = async () => {
    // Validation
    if (!guestName.trim()) {
      Alert.alert("Error", "Guest name is required");
      return;
    }
    if (!email1.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    if (!contactNumber1.trim()) {
      Alert.alert("Error", "Contact number is required");
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
    if (!guestCapacity) {
      Alert.alert("Error", "Guest capacity is required");
      return;
    }
    if (!price) {
      Alert.alert("Error", "Price is required");
      return;
    }

    setSavingBooking(true);
    try {
      const finalPrice = dynamicPrice || parseFloat(price);
      
      // Build pricing breakdown for notes
      const pricingBreakdown = {
        basePrice: parseFloat(price),
        adjustedPrice: finalPrice,
        discount: discounts ? parseFloat(discounts) : 0,
        extraCharges: extraCharges ? parseFloat(extraCharges) : 0,
        overtimeHours: overtimeHours ? parseInt(overtimeHours) : 0,
        overtimeCharges: overtimeCharges ? parseFloat(overtimeCharges) : 0,
        seasonalRateApplied: priceAlert || "No seasonal rate applied",
      };

      const combinedNotes = [
        `Package: ${packageName}`,
        `Pricing: ${JSON.stringify(pricingBreakdown)}`,
        notes ? `Additional Notes: ${notes}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      // Create booking
      const { data, error } = await createVenueDirectBooking({
        venue_id: venueId,
        venue_admin_id: venueAdminId,
        client_name: guestName,
        client_email: email1,
        client_contact: contactNumber1,
        event_name: packageName || "Direct Booking",
        event_date: startDate,
        time_start: startTime,
        time_end: endTime,
        guest_capacity: parseInt(guestCapacity),
        organizer_name: organizerName2,
        organizer_contact: contactNumber2,
        status: "confirmed",
        notes: combinedNotes,
      });

      if (error) {
        Alert.alert("Error", "Failed to save booking. Please try again.");
        console.error("Booking error:", error);
        return;
      }

      Alert.alert("Success", "Booking saved successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
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

          {/* Event Date Picker */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Event Date</Text>
              <Pressable
                style={styles.dateButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Ionicons name="calendar" size={20} color={Theme.colors.primary} />
                <Text style={styles.dateButtonText}>
                  {startDate ? new Date(startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }) : "Select Date"}
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Base Price</Text>
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

          {/* Dynamic Price Alert */}
          {priceAlert && dynamicPrice && (
            <View style={styles.dynamicPriceAlert}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Theme.colors.primary}
                style={styles.alertIcon}
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{priceAlert}</Text>
                <Text style={styles.priceComparison}>
                  ₱{price} → ₱{dynamicPrice.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

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

          {/* Event Organizer */}
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
          </View>

          {/* Guest Capacity */}
          <View style={styles.field}>
            <Text style={styles.label}>Guest Capacity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter number of guests"
              placeholderTextColor={Theme.colors.muted}
              value={guestCapacity}
              onChangeText={setGuestCapacity}
              keyboardType="number-pad"
            />
          </View>

          {/* Time Pickers Row */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Start Time</Text>
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
              <Text style={styles.label}>End Time</Text>
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

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onSelect={setStartDate}
        initialDate={startDate}
        title="Select Event Date"
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
  hint: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  dynamicPriceAlert: {
    backgroundColor: "#E3F2FD",
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  alertIcon: {
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.primary,
    marginBottom: 4,
  },
  priceComparison: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
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
  buttonDisabled: {
    opacity: 0.6,
  },
});
