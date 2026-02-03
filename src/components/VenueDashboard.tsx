import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../constants/theme";
import { VenueBlockedDate } from "../models/types";
import {
  getConfirmedVenueBookings,
  getPendingVenueBookings,
  getVenueBlockedDates,
  updateBookingStatus,
} from "../services/supabase";
import MonthCalendar from "./month_calendar";
import BottomNavRenderer from "./user_navigation/bottom_nav/BottomNavRenderer";
import BlockedDatesModal, { BlockedDateData } from "./blocked_dates_modal";

interface PendingBooking {
  booking_id: number;
  client_name: string;
  event_date: string;
  time_start: string;
  time_end: string;
  booking_status: string;
  guest_capacity: number;
  notes?: string;
  coordinator_name?: string;
  organizer_name?: string;
  organizer_contact?: string;
}

interface ConfirmedEvent {
  booking_id: number;
  client_name: string;
  event_date: string;
  time_start: string;
  time_end: string;
  guest_capacity: number;
  booking_status: string;
}

interface VenueDashboardProps {
  venueId: number;
}

export default function VenueDashboard({ venueId }: VenueDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"requests" | "calendar">(
    "requests"
  );
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "confirmed"
  >("pending");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showBlockedDatesModal, setShowBlockedDatesModal] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [confirmedEvents, setConfirmedEvents] = useState<ConfirmedEvent[]>([]);
  const [blockedDates, setBlockedDates] = useState<VenueBlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    day: number;
    month: number;
    year: number;
    events: ConfirmedEvent[];
    blocked: VenueBlockedDate[];
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPendingBookings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getPendingVenueBookings(venueId);
      if (error) {
        console.error("Error fetching pending bookings:", error);
        return;
      }
      setPendingBookings(data || []);
    } catch (error) {
      console.error("Unexpected error fetching pending bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  const loadConfirmedEventsAndBlockedDates = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: events, error: eventsError }, { data: blocked, error: blockedError }] =
        await Promise.all([
          getConfirmedVenueBookings(venueId),
          getVenueBlockedDates(venueId),
        ]);

      if (eventsError) {
        console.error("Error fetching confirmed events:", eventsError);
      } else {
        setConfirmedEvents(events || []);
      }

      if (blockedError) {
        console.error("Error fetching blocked dates:", blockedError);
      } else {
        setBlockedDates(blocked || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === "requests") {
        loadPendingBookings();
      } else {
        loadConfirmedEventsAndBlockedDates();
      }
    }, [activeTab, loadPendingBookings, loadConfirmedEventsAndBlockedDates])
  );

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      const { error } = await updateBookingStatus(bookingId, "confirmed");
      if (error) {
        console.error("Error confirming booking:", error);
        return;
      }
      // Refresh the list
      await loadPendingBookings();
    } catch (error) {
      console.error("Unexpected error confirming booking:", error);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    try {
      const { error } = await updateBookingStatus(bookingId, "rejected");
      if (error) {
        console.error("Error rejecting booking:", error);
        return;
      }
      // Refresh the list
      await loadPendingBookings();
    } catch (error) {
      console.error("Unexpected error rejecting booking:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // timeString format: "HH:MM:SS"
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const minute = minutes;
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const getMarkedDates = () => {
    const marked: Array<{ day: number; color: string }> = [];

    // Mark confirmed events in green
    confirmedEvents.forEach((event) => {
      const date = new Date(event.event_date);
      const day = date.getDate();
      const existing = marked.find((m) => m.day === day);
      if (!existing) {
        marked.push({ day, color: "#4CAF50" }); // Green
      }
    });

    // Mark blocked dates in red/gray
    blockedDates.forEach((blocked) => {
      const startDate = new Date(blocked.start_date);
      const endDate = new Date(blocked.end_date);

      // Mark all days in the range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const day = d.getDate();
        const existing = marked.find((m) => m.day === day);
        // If there's already a confirmed event, use a different color or keep green
        if (!existing) {
          marked.push({ day, color: "#F44336" }); // Red
        }
      }
    });

    return marked;
  };

  const onDateSelect = (day: number, month: number, year: number) => {
    const selectedDate = new Date(year, month, day);
    const dateStr = selectedDate.toISOString().split("T")[0];

    const eventsOnDate = confirmedEvents.filter(
      (e) => e.event_date === dateStr
    );
    const blockedOnDate = blockedDates.filter(
      (b) =>
        new Date(b.start_date) <= selectedDate &&
        selectedDate <= new Date(b.end_date)
    );

    setSelectedDateInfo({
      day,
      month,
      year,
      events: eventsOnDate,
      blocked: blockedOnDate,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Venue Dashboard</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "requests" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("requests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            Requests
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "calendar" && styles.activeTab]}
          onPress={() => setActiveTab("calendar")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "calendar" && styles.activeTabText,
            ]}
          >
            Calendar
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {activeTab === "requests" ? (
          /* Requests Tab */
          <>
            {/* Search and Filter Bar */}
            <View style={styles.searchFilterContainer}>
              <View style={styles.searchBox}>
                <Ionicons
                  name="search"
                  size={18}
                  color={Theme.colors.muted}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by client name..."
                  placeholderTextColor={Theme.colors.muted}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              <Pressable
                style={styles.filterButton}
                onPress={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Ionicons name="funnel" size={20} color={Theme.colors.primary} />
              </Pressable>
            </View>

            {/* Filter Menu */}
            {showFilterMenu && (
              <View style={styles.filterMenu}>
                <Pressable
                  style={[
                    styles.filterOption,
                    filterStatus === "all" && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterStatus("all");
                    setShowFilterMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterStatus === "all" && styles.filterOptionTextActive,
                    ]}
                  >
                    All Requests
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterOption,
                    filterStatus === "pending" && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterStatus("pending");
                    setShowFilterMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterStatus === "pending" && styles.filterOptionTextActive,
                    ]}
                  >
                    Pending
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.filterOption,
                    filterStatus === "confirmed" && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterStatus("confirmed");
                    setShowFilterMenu(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterStatus === "confirmed" && styles.filterOptionTextActive,
                    ]}
                  >
                    Confirmed
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Requests List */}
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={pendingBookings.filter((booking) => {
                  const matchesSearch =
                    booking.client_name
                      .toLowerCase()
                      .includes(searchText.toLowerCase()) ||
                    booking.organizer_name
                      ?.toLowerCase()
                      .includes(searchText.toLowerCase());

                  if (filterStatus === "all") return matchesSearch;
                  return (
                    matchesSearch &&
                    booking.booking_status.toLowerCase() ===
                      filterStatus.toLowerCase()
                  );
                })}
                keyExtractor={(item) => item.booking_id.toString()}
                onRefresh={loadPendingBookings}
                refreshing={refreshing}
                renderItem={({ item }) => (
                  <View style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <Text style={styles.clientName}>{item.client_name}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                          {item.booking_status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requestDetails}>
                      <Text style={styles.detailText}>
                        📅 {formatDate(item.event_date)}
                      </Text>
                      <Text style={styles.detailText}>
                        🕐 {formatTime(item.time_start)} -{" "}
                        {formatTime(item.time_end)}
                      </Text>
                      <Text style={styles.detailText}>
                        👥 {item.guest_capacity} guests
                      </Text>
                      {item.notes && (
                        <Text style={styles.notesText}>
                          Note: {item.notes}
                        </Text>
                      )}
                    </View>

                    <View style={styles.actionButtons}>
                      <Pressable
                        style={[styles.button, styles.viewButton]}
                        onPress={() => {
                          // TODO: Navigate to detailed view
                        }}
                      >
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </Pressable>

                      <Pressable
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => handleRejectBooking(item.booking_id)}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </Pressable>

                      <Pressable
                        style={[styles.button, styles.confirmButton]}
                        onPress={() => handleConfirmBooking(item.booking_id)}
                      >
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No booking requests found
                    </Text>
                  </View>
                }
                contentContainerStyle={styles.listContent}
              />
            )}
          </>
        ) : loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          </View>
        ) : (
          <View style={styles.calendarContainer}>
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Pressable
                style={styles.actionButton}
                onPress={() => setShowBlockedDatesModal(true)}
              >
                <Ionicons name="calendar-outline" size={24} color={Theme.colors.primary} />
                <Text style={styles.actionButtonLabel}>Blocked Dates</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  router.push({
                    pathname: "/users/venue_administrator",
                    params: { page: "seasonal_rates" },
                  });
                }}
              >
                <Ionicons name="pricetag-outline" size={24} color={Theme.colors.primary} />
                <Text style={styles.actionButtonLabel}>Seasonal Rates</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  router.push({
                    pathname: "/users/venue_administrator",
                    params: { page: "add_schedule" },
                  });
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={Theme.colors.primary} />
                <Text style={styles.actionButtonLabel}>Add Schedule</Text>
              </Pressable>
            </View>

            {/* Calendar */}
            <ScrollView contentContainerStyle={styles.calendarContent}>
            <MonthCalendar
              markedDates={getMarkedDates()}
              onDateSelect={onDateSelect}
            />

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: "#4CAF50" }]} />
                <Text style={styles.legendText}>Confirmed Events</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: "#F44336" }]} />
                <Text style={styles.legendText}>Blocked Dates</Text>
              </View>
            </View>

            {/* Date Info Modal */}
            {selectedDateInfo && (
              <View style={styles.dateInfoBox}>
                <View style={styles.dateInfoHeader}>
                  <Text style={styles.dateInfoTitle}>
                    {formatDate(new Date(selectedDateInfo.year, selectedDateInfo.month, selectedDateInfo.day).toISOString())}
                  </Text>
                  <Pressable onPress={() => setSelectedDateInfo(null)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                {selectedDateInfo.events.length > 0 && (
                  <View style={styles.dateInfoSection}>
                    <Text style={styles.dateInfoSectionTitle}>Events</Text>
                    {selectedDateInfo.events.map((event) => (
                      <View key={event.booking_id} style={styles.eventSummary}>
                        <Text style={styles.summaryText}>
                          {event.client_name}
                        </Text>
                        <Text style={styles.summaryText}>
                          {formatTime(event.time_start)} - {formatTime(event.time_end)}
                        </Text>
                        <Text style={styles.summaryText}>
                          {event.guest_capacity} guests
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedDateInfo.blocked.length > 0 && (
                  <View style={styles.dateInfoSection}>
                    <Text style={styles.dateInfoSectionTitle}>Blocked Reason</Text>
                    {selectedDateInfo.blocked.map((block) => (
                      <View key={block.blocked_id} style={styles.blockedSummary}>
                        <Text style={styles.summaryText}>
                          {block.reason || "No reason provided"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedDateInfo.events.length === 0 &&
                  selectedDateInfo.blocked.length === 0 && (
                    <View style={styles.dateInfoSection}>
                      <Text style={styles.summaryText}>No events or blocks on this date</Text>
                    </View>
                  )}
              </View>
            )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNavRenderer role="venue_administrator" activeTab="dashboard" />

      {/* Blocked Dates Modal */}
      <BlockedDatesModal
        visible={showBlockedDatesModal}
        onClose={() => setShowBlockedDatesModal(false)}
        onSubmit={(data: BlockedDateData) => {
          // TODO: Submit blocked dates to Supabase
          console.log("Blocked dates submitted:", data);
          setShowBlockedDatesModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 16,
    color: Theme.colors.muted,
  },
  activeTabText: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.semibold,
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: Theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  clientName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.sm,
  },
  statusText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#F57C00",
  },
  requestDetails: {
    marginBottom: Theme.spacing.md,
  },
  detailText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  notesText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: Theme.spacing.sm,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Theme.spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButton: {
    backgroundColor: "#E3F2FD",
  },
  viewButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#1976D2",
  },
  rejectButton: {
    backgroundColor: "#FFEBEE",
  },
  rejectButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#C62828",
  },
  confirmButton: {
    backgroundColor: "#E8F5E9",
  },
  confirmButtonText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: "#2E7D32",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 16,
    color: Theme.colors.muted,
  },
  calendarContent: {
    padding: Theme.spacing.md,
  },
  legend: {
    marginTop: Theme.spacing.lg,
    padding: Theme.spacing.md,
    backgroundColor: "#F5F5F5",
    borderRadius: Theme.radius.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: Theme.spacing.sm,
  },
  legendText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  dateInfoBox: {
    marginTop: Theme.spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  dateInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  dateInfoTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  closeButton: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.muted,
  },
  dateInfoSection: {
    marginBottom: Theme.spacing.md,
  },
  dateInfoSectionTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  eventSummary: {
    backgroundColor: "#E8F5E9",
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.sm,
  },
  blockedSummary: {
    backgroundColor: "#FFEBEE",
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.sm,
  },
  summaryText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  searchFilterContainer: {
    flexDirection: "row",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  searchIcon: {
    marginRight: Theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  filterMenu: {
    position: "absolute",
    top: 80,
    right: Theme.spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    elevation: 8,
    zIndex: 100,
    minWidth: 150,
  },
  filterOption: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  filterOptionActive: {
    backgroundColor: "#F5F5F5",
  },
  filterOptionText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
  },
  filterOptionTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.semibold,
  },
  calendarContainer: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: "#F5F5F5",
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    minWidth: 90,
  },
  actionButtonLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 11,
    color: Theme.colors.primary,
    marginTop: 4,
  },});