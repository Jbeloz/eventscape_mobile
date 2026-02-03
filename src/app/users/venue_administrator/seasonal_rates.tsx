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
import TopBar from "../../../components/top_bar";
import BottomNavRenderer from "../../../components/user_navigation/bottom_nav/BottomNavRenderer";
import { VenueSeasonalPricing } from "../../../models/types";
import {
  createSeasonalPricing,
  deleteSeasonalPricing,
  getActiveVenueSeasonalPricing,
  toggleSeasonalPricingStatus,
  updateSeasonalPricing,
} from "../../../services/supabase";

interface SeasonalRateFormData {
  season_name: string;
  start_date: string;
  end_date: string;
  modifier_type: "Fixed" | "Percentage";
  modifier_value: string;
  rate_type: "Hourly" | "Daily" | "Package" | "All";
}

const INITIAL_FORM_STATE: SeasonalRateFormData = {
  season_name: "",
  start_date: "",
  end_date: "",
  modifier_type: "Percentage",
  modifier_value: "",
  rate_type: "All",
};

export default function SeasonalRates() {
  const router = useRouter();
  const [notificationCount] = useState(0);
  const [venueId] = useState(1); // TODO: Get from navigation params or context
  const [seasonalRates, setSeasonalRates] = useState<VenueSeasonalPricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModifierTypeDropdown, setShowModifierTypeDropdown] = useState(false);
  const [showRateTypeDropdown, setShowRateTypeDropdown] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SeasonalRateFormData>(INITIAL_FORM_STATE);

  // Load seasonal rates on mount
  useEffect(() => {
    loadSeasonalRates();
  }, [venueId]);

  const loadSeasonalRates = async () => {
    setLoading(true);
    try {
      const { data, error } = await getActiveVenueSeasonalPricing(venueId);
      if (error) {
        console.error("Error loading seasonal rates:", error);
      } else if (data) {
        setSeasonalRates(data as VenueSeasonalPricing[]);
      }
    } catch (error) {
      console.error("Error in loadSeasonalRates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setShowAddModal(true);
  };

  const handleEditRate = (rate: VenueSeasonalPricing) => {
    setEditingId(rate.seasonal_price_id);
    setFormData({
      season_name: rate.season_name,
      start_date: rate.start_date,
      end_date: rate.end_date,
      modifier_type: rate.modifier_type as "Fixed" | "Percentage",
      modifier_value: rate.modifier_value.toString(),
      rate_type: rate.rate_type as "Hourly" | "Daily" | "Package" | "All",
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSaveRate = async () => {
    // Validation
    if (!formData.season_name.trim()) {
      Alert.alert("Validation", "Season name is required");
      return;
    }
    if (!formData.start_date) {
      Alert.alert("Validation", "Start date is required");
      return;
    }
    if (!formData.end_date) {
      Alert.alert("Validation", "End date is required");
      return;
    }
    if (!formData.modifier_value) {
      Alert.alert("Validation", "Modifier value is required");
      return;
    }

    // Validate date range
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (startDate > endDate) {
      Alert.alert("Validation", "Start date must be before end date");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update existing
        const { error } = await updateSeasonalPricing(editingId, {
          season_name: formData.season_name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          modifier_type: formData.modifier_type,
          modifier_value: parseFloat(formData.modifier_value),
          rate_type: formData.rate_type,
        });

        if (error) {
          Alert.alert("Error", "Failed to update seasonal rate");
          console.error(error);
        } else {
          handleCloseModal();
          await loadSeasonalRates();
        }
      } else {
        // Create new
        const { error } = await createSeasonalPricing({
          venue_id: venueId,
          season_name: formData.season_name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          modifier_type: formData.modifier_type,
          modifier_value: parseFloat(formData.modifier_value),
          rate_type: formData.rate_type,
          is_active: true,
        });

        if (error) {
          Alert.alert("Error", "Failed to create seasonal rate");
          console.error(error);
        } else {
          handleCloseModal();
          await loadSeasonalRates();
        }
      }
    } catch (error) {
      console.error("Error saving seasonal rate:", error);
      Alert.alert("Error", "Failed to save seasonal rate");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRate = async (id: number) => {
    Alert.alert(
      "Delete Seasonal Rate",
      "Are you sure you want to delete this seasonal rate?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await deleteSeasonalPricing(id);
              if (error) {
                Alert.alert("Error", "Failed to delete seasonal rate");
                console.error(error);
              } else {
                await loadSeasonalRates();
              }
            } catch (error) {
              console.error("Error deleting rate:", error);
              Alert.alert("Error", "Failed to delete seasonal rate");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await toggleSeasonalPricingStatus(id, !currentStatus);
      if (error) {
        console.error("Error toggling status:", error);
      } else {
        await loadSeasonalRates();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRates = seasonalRates.filter((rate) =>
    rate.season_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRateCard = ({ item }: { item: VenueSeasonalPricing }) => {
    const startDate = new Date(item.start_date).toLocaleDateString();
    const endDate = new Date(item.end_date).toLocaleDateString();
    const adjustmentText =
      item.modifier_type === "Percentage"
        ? `${item.modifier_value > 0 ? "+" : ""}${item.modifier_value}%`
        : `${item.modifier_value > 0 ? "+" : ""}₱${item.modifier_value}`;

    return (
      <View style={styles.rateCard}>
        <View style={styles.rateHeader}>
          <View style={styles.rateInfo}>
            <Text style={styles.seasonName}>{item.season_name}</Text>
            <Text style={styles.dateRange}>
              {startDate} - {endDate}
            </Text>
          </View>
          <View style={styles.rateActions}>
            <Pressable
              onPress={() => handleToggleStatus(item.seasonal_price_id, item.is_active)}
            >
              <Ionicons
                name={item.is_active ? "toggle" : "toggle-outline"}
                size={24}
                color={item.is_active ? Theme.colors.primary : Theme.colors.muted}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.rateDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{item.rate_type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Adjustment:</Text>
            <Text style={[
              styles.detailValue,
              {
                color: item.modifier_value > 0 ? "#E74C3C" : "#27AE60"
              }
            ]}>
              {adjustmentText}
            </Text>
          </View>
        </View>

        <View style={styles.rateActionButtons}>
          <Pressable
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditRate(item)}
          >
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteRate(item.seasonal_price_id)}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
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
          <Text style={styles.title}>Seasonal Rates</Text>
          <Pressable
            style={styles.addButton}
            onPress={handleOpenAddModal}
          >
            <Ionicons name="add-circle" size={32} color={Theme.colors.primary} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Theme.colors.muted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search seasons..."
            placeholderTextColor={Theme.colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Rates List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : filteredRates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Theme.colors.muted}
            />
            <Text style={styles.emptyText}>No seasonal rates yet</Text>
            <Text style={styles.emptySubText}>
              Tap the + button to add your first seasonal rate
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredRates}
            keyExtractor={(item) => item.seasonal_price_id.toString()}
            renderItem={renderRateCard}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Pressable onPress={handleCloseModal}>
              <Text style={styles.modalClose}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Seasonal Rate" : "Add Seasonal Rate"}
            </Text>
            <Pressable onPress={handleSaveRate} disabled={loading}>
              <Text style={[styles.modalSave, loading && { opacity: 0.5 }]}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Season Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Season Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Christmas Promo, Peak Season"
                placeholderTextColor={Theme.colors.muted}
                value={formData.season_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, season_name: text })
                }
              />
            </View>

            {/* Start Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-12-01"
                placeholderTextColor={Theme.colors.muted}
                value={formData.start_date}
                onChangeText={(text) =>
                  setFormData({ ...formData, start_date: text })
                }
              />
              <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
            </View>

            {/* End Date */}
            <View style={styles.field}>
              <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-12-31"
                placeholderTextColor={Theme.colors.muted}
                value={formData.end_date}
                onChangeText={(text) =>
                  setFormData({ ...formData, end_date: text })
                }
              />
              <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
            </View>

            {/* Rate Type Dropdown */}
            <View style={styles.field}>
              <Text style={styles.label}>Rate Type</Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowRateTypeDropdown(!showRateTypeDropdown)}
              >
                <Text style={styles.dropdownText}>{formData.rate_type}</Text>
                <Ionicons
                  name={showRateTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Theme.colors.muted}
                />
              </Pressable>
              {showRateTypeDropdown && (
                <View style={styles.dropdownList}>
                  {["Hourly", "Daily", "Package", "All"].map((type) => (
                    <Pressable
                      key={type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({
                          ...formData,
                          rate_type: type as "Hourly" | "Daily" | "Package" | "All",
                        });
                        setShowRateTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{type}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Modifier Type Dropdown */}
            <View style={styles.field}>
              <Text style={styles.label}>Adjustment Type</Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() =>
                  setShowModifierTypeDropdown(!showModifierTypeDropdown)
                }
              >
                <Text style={styles.dropdownText}>{formData.modifier_type}</Text>
                <Ionicons
                  name={showModifierTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Theme.colors.muted}
                />
              </Pressable>
              {showModifierTypeDropdown && (
                <View style={styles.dropdownList}>
                  {["Fixed", "Percentage"].map((type) => (
                    <Pressable
                      key={type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData({
                          ...formData,
                          modifier_type: type as "Fixed" | "Percentage",
                        });
                        setShowModifierTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{type}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Modifier Value */}
            <View style={styles.field}>
              <Text style={styles.label}>
                {formData.modifier_type === "Percentage"
                  ? "Percentage Change (%)"
                  : "Fixed Amount (₱)"}
              </Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.input}
                  placeholder={formData.modifier_type === "Percentage" ? "e.g., 10" : "e.g., 500"}
                  placeholderTextColor={Theme.colors.muted}
                  value={formData.modifier_value}
                  onChangeText={(text) =>
                    setFormData({ ...formData, modifier_value: text })
                  }
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unit}>
                  {formData.modifier_type === "Percentage" ? "%" : "₱"}
                </Text>
              </View>
              <Text style={styles.hint}>
                {formData.modifier_type === "Percentage"
                  ? "Positive = increase, Negative = decrease"
                  : "Positive = surcharge, Negative = discount"}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <BottomNavRenderer role="venue_administrator" activeTab="calendar" />
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
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginTop: 16,
  },
  emptySubText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
    marginTop: 8,
    textAlign: "center",
  },
  rateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  rateInfo: {
    flex: 1,
  },
  seasonName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  dateRange: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
  },
  rateActions: {
    marginLeft: 12,
  },
  rateDetails: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  detailRow__last: {
    marginBottom: 0,
  },
  detailLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: Theme.colors.text,
  },
  detailValue: {
    fontFamily: Theme.fonts.bold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  rateActionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: Theme.colors.primary,
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
  },
  actionButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#FFFFFF",
  },
  // Modal styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalClose: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  modalTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  modalSave: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 20,
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
    fontSize: 14,
    color: Theme.colors.text,
    backgroundColor: "#FAFAFA",
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
  },
  unit: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
    marginLeft: 8,
  },
  hint: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: Theme.colors.muted,
    marginTop: 4,
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
    fontSize: 14,
    color: Theme.colors.text,
    flex: 1,
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownItemText: {
    fontSize: 14,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.regular,
  },
});
