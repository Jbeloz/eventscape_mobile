import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
// Fix TypeScript cache - v2
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
import { Theme } from "../../constants/theme";
import { VenueBlockedDate } from "../models/types";
import {
    createBookingPricing,
    createSystemBlockedDate,
    getPendingVenueBookings,
    getUnifiedCalendarEvents,
    getVenueBaseRates,
    getVenueSeasonalPricing,
    getVenues,
    supabase,
    updateBookingStatus
} from "../services/supabase";
import { calculateSeasonalPrice, formatCurrency } from "../utils/pricing";
import BlockedDatesModal, { BlockedDateData } from "./blocked_dates_modal";
import MonthCalendar from "./month_calendar";
import TopBar from "./top_bar";
import BottomNavRenderer from "./user_navigation/bottom_nav/BottomNavRenderer";
import WeekCalendar from "./week_calendar";

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
  event_name?: string;
  conflict_warning?: string;
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

interface DirectBooking {
  direct_booking_id: number;
  client_name: string;
  event_date: string;
  time_start: string;
  time_end: string;
  guest_capacity: number;
  status: string;
  event_name: string;
  organizer_name?: string;
}

// Unified Calendar Event for displaying all types of bookings
interface UnifiedCalendarEvent {
  id: string | number;
  title: string;
  event_date: string;
  time_start?: string;
  time_end?: string;
  type: "internal" | "external" | "blocked";
  color: string;
  guest_capacity?: number;
  client_name?: string;
  status?: string;
  reason?: string;
}

interface VenueDashboardProps {
  venueId: number;
}

export default function VenueDashboard({ venueId: initialVenueId }: VenueDashboardProps) {
  const router = useRouter();
  const [venueId, setVenueId] = useState(initialVenueId);
  const [activeTab, setActiveTab] = useState<"requests" | "calendar">(
    "requests"
  );
  const [searchText, setSearchText] = useState("");
  const [viewType, setViewType] = useState<"week" | "month">("week");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "confirmed"
  >("pending");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showBlockedDatesModal, setShowBlockedDatesModal] = useState(false);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);

  // Sync parent's venueId prop with local state
  useEffect(() => {
    setVenueId(initialVenueId);
  }, [initialVenueId]);
  const [confirmedEvents, setConfirmedEvents] = useState<ConfirmedEvent[]>([]);
  const [directBookings, setDirectBookings] = useState<DirectBooking[]>([]);
  const [blockedDates, setBlockedDates] = useState<VenueBlockedDate[]>([]);
  const [unifiedCalendarEvents, setUnifiedCalendarEvents] = useState<UnifiedCalendarEvent[]>([]);
  const [seasonalPricings, setSeasonalPricings] = useState<any[]>([]);
  const [baseRates, setBaseRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSwitchingVenue, setIsSwitchingVenue] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState<{
    day: number;
    month: number;
    year: number;
    events: ConfirmedEvent[];
    directEvents: DirectBooking[];
    blocked: VenueBlockedDate[];
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount] = useState(0);
  const [venues, setVenues] = useState<Array<{ venue_id: number; venue_name: string }>>([]);
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  // Initialize to today's date (February 2026 = month 1, year 2026)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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

  // Clear calendar data immediately when venue changes
  useEffect(() => {
    if (isSwitchingVenue) {
      setIsSwitchingVenue(false);
    }
  }, [venueId, isSwitchingVenue]);

  // Load all venues for dropdown selector
  useEffect(() => {
    const loadVenues = async () => {
      try {
        const { data, error } = await getVenues();
        if (!error && data) {
          setVenues(data.map((v: any) => ({ venue_id: v.venue_id, venue_name: v.venue_name })));
        }
      } catch (err) {
        console.error("Error loading venues:", err);
      }
    };
    loadVenues();
  }, []);

  const loadConfirmedEventsAndBlockedDates = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use unified calendar fetcher for all three sources
      const { data: unifiedEvents, error: unifiedError } = await getUnifiedCalendarEvents(venueId);

      if (unifiedError) {
        console.error("Error fetching calendar events:", unifiedError);
        setUnifiedCalendarEvents([]);
      } else {
        setUnifiedCalendarEvents(unifiedEvents || []);
      }

      // Fetch seasonal pricing and base rates
      const [
        { data: seasonalData, error: seasonalError },
        { data: baseRatesData, error: baseRatesError },
      ] = await Promise.all([
        getVenueSeasonalPricing(venueId),
        getVenueBaseRates(venueId),
      ]);

      if (seasonalError) {
        console.error("Error fetching seasonal pricing:", seasonalError);
      } else {
        setSeasonalPricings(seasonalData || []);
      }

      if (baseRatesError) {
        console.error("Error fetching base rates:", baseRatesError);
      } else {
        setBaseRates(baseRatesData || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useFocusEffect(
    useCallback(() => {
      // Always load both pending bookings and calendar data when screen is focused
      loadPendingBookings();
      loadConfirmedEventsAndBlockedDates();
    }, [loadPendingBookings, loadConfirmedEventsAndBlockedDates])
  );

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      // Find the booking to get details
      const booking = pendingBookings.find(b => b.booking_id === bookingId);
      if (!booking) {
        console.error("Booking not found");
        return;
      }

      // Check for conflicts with internal bookings
      const internalConflicts = unifiedCalendarEvents.filter(event => {
        if (event.type !== "internal") return false;
        if (event.event_date !== booking.event_date) return false;
        
        // Parse times for overlap checking
        const newStart = booking.time_start;
        const newEnd = booking.time_end;
        const existingStart = event.time_start || "00:00";
        const existingEnd = event.time_end || "23:59";
        
        // Check if times overlap
        return !(newEnd <= existingStart || newStart >= existingEnd);
      });

      if (internalConflicts.length > 0) {
        console.error("Conflict found with existing internal bookings");
        alert(`Cannot confirm: Your venue already has an internal booking on ${formatDate(booking.event_date)} at that time.`);
        return;
      }

      // Check for conflicts with blocked dates
      const bookingDate = new Date(booking.event_date);
      const blockedConflicts = unifiedCalendarEvents.filter(event => {
        if (event.type !== "blocked") return false;
        // For blocked dates, just check if the date falls within the blocked range
        // Since our unified events already have start_date, we treat it as a single day block
        return event.event_date === booking.event_date;
      });

      if (blockedConflicts.length > 0) {
        console.error("Conflict found with blocked dates");
        alert(`Cannot confirm: This date (${formatDate(booking.event_date)}) is blocked for maintenance or other reasons.`);
        return;
      }

      // Calculate pricing for this booking (only affects pending requests)
      if (baseRates.length > 0) {
        const baseRate = baseRates[0]?.base_price || 0;
        const priceBreakdown = calculateSeasonalPrice(
          baseRate,
          booking.event_date,
          seasonalPricings
        );

        // Find the seasonal pricing ID if applicable
        let seasonalPricingId: number | null = null;
        const applicableSeason = seasonalPricings.find((season) => {
          if (!season.is_active) return false;
          const startDate = new Date(season.start_date);
          const endDate = new Date(season.end_date);
          endDate.setHours(23, 59, 59, 999);
          return bookingDate >= startDate && bookingDate <= endDate;
        });

        if (applicableSeason) {
          seasonalPricingId = applicableSeason.seasonal_price_id;
        }

        // Save the pricing information
        const { error: pricingError } = await createBookingPricing({
          booking_id: bookingId,
          base_price: priceBreakdown.basePrice,
          seasonal_adjustment: priceBreakdown.seasonalAdjustment,
          seasonal_pricing_id: seasonalPricingId,
          final_price: priceBreakdown.finalPrice,
          currency: 'USD',
        });

        if (pricingError) {
          console.error("Error saving pricing:", pricingError);
          alert("Failed to save pricing information. Please try again.");
          return;
        }
      }

      // If no conflicts and pricing saved, proceed with confirmation
      const { error } = await updateBookingStatus(bookingId, "confirmed");
      if (error) {
        console.error("Error confirming booking:", error);
        alert("Failed to confirm booking. Please try again.");
        return;
      }

      alert("Booking confirmed successfully! Price has been locked.");
      // Refresh the list
      await loadPendingBookings();
    } catch (error) {
      console.error("Unexpected error confirming booking:", error);
      alert("An unexpected error occurred. Please try again.");
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

  // Find pending bookings that conflict with a date range
  const findConflictingPendingBookings = (startDate: string, endDate: string): PendingBooking[] => {
    const blockStart = new Date(startDate);
    const blockEnd = new Date(endDate);

    return pendingBookings.filter((booking) => {
      if (booking.booking_status !== "pending") return false;

      const bookingDate = new Date(booking.event_date);
      // Check if booking date falls within blocked date range
      return bookingDate >= blockStart && bookingDate <= blockEnd;
    });
  };

  // Check if a pending booking conflicts with any blocked dates
  const hasBlockedDateConflict = (booking: PendingBooking): boolean => {
    return blockedDates.some((blocked) => {
      const blockStart = new Date(blocked.start_date);
      const blockEnd = new Date(blocked.end_date);
      const bookingDate = new Date(booking.event_date);
      return bookingDate >= blockStart && bookingDate <= blockEnd;
    });
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

  const getMarkedDates = (month: number = 9, year: number = 2025) => {
    const marked: Array<{ day: number; color: string }> = [];

    // Use unified calendar events to mark dates
    unifiedCalendarEvents.forEach((event) => {
      const date = new Date(event.event_date);
      const eventDay = date.getDate();
      const eventMonth = date.getMonth();
      const eventYear = date.getFullYear();

      // Only mark if the event is in the currently viewed month/year
      if (eventMonth === month && eventYear === year) {
        if (event.type === "blocked") {
          // For blocked dates, mark the entire date
          const existing = marked.find((m) => m.day === eventDay);
          if (!existing) {
            marked.push({ day: eventDay, color: "#F44336" }); // Red for blocked
          }
        } else if (event.type === "internal" || event.type === "external") {
          // For bookings, mark with their respective colors
          const existing = marked.find((m) => m.day === eventDay);
          if (!existing) {
            // Use the event's color or default to green
            marked.push({ day: eventDay, color: event.color || "#4CAF50" });
          }
        }
      }
    });

    return marked;
  };

  const onDateSelect = (day: number, month: number, year: number) => {
    const selectedDate = new Date(year, month, day);
    const dateStr = selectedDate.toISOString().split("T")[0];

    // Filter unified calendar events for this date
    const externalEventsOnDate = unifiedCalendarEvents.filter(
      (e) => e.type === "external" && e.event_date === dateStr
    );
    const internalEventsOnDate = unifiedCalendarEvents.filter(
      (e) => e.type === "internal" && e.event_date === dateStr
    );
    const blockedOnDate = unifiedCalendarEvents.filter(
      (e) => e.type === "blocked" && e.event_date === dateStr
    );

    // Convert external events back to confirmedEvents format for backwards compatibility
    const eventsOnDate = externalEventsOnDate.map(e => ({
      booking_id: parseInt(e.id.toString().split('_')[1]),
      client_name: e.client_name || '',
      event_date: e.event_date,
      time_start: e.time_start || '',
      time_end: e.time_end || '',
      booking_status: e.status || 'confirmed',
      guest_capacity: e.guest_capacity || 0,
    }));

    // Convert internal events back to directBookings format
    const directEventsOnDate = internalEventsOnDate.map(e => ({
      direct_booking_id: parseInt(e.id.toString().split('_')[1]),
      client_name: e.client_name || '',
      event_date: e.event_date,
      time_start: e.time_start || '',
      time_end: e.time_end || '',
      guest_capacity: e.guest_capacity || 0,
      status: 'confirmed',
      event_name: e.title.split('(')[0].replace('📌', '').trim(),
    }));

    // Convert blocked events back to VenueBlockedDate format
    const blocked = blockedOnDate.map(e => ({
      blocked_id: parseInt(e.id.toString().split('_')[1]),
      venue_id: venueId,
      start_date: e.event_date,
      end_date: e.event_date,
      reason: e.reason || '',
      blocked_by: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    setSelectedDateInfo({
      day,
      month,
      year,
      events: eventsOnDate,
      directEvents: directEventsOnDate,
      blocked: blocked,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <TopBar notificationCount={notificationCount} />

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
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                scrollEnabled={true}
                nestedScrollEnabled={true}
                ListHeaderComponent={
                  <>
                    {/* Week/Month Toggle and Calendar */}
                    <View style={styles.calendarSection}>
                      <View style={styles.toggleContainer}>
                        <Pressable
                          style={[styles.toggleButton, viewType === "week" && styles.toggleButtonActive]}
                          onPress={() => setViewType("week")}
                        >
                          <Text style={[styles.toggleText, viewType === "week" && styles.toggleTextActive]}>
                            Week
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[styles.toggleButton, viewType === "month" && styles.toggleButtonActive]}
                          onPress={() => setViewType("month")}
                        >
                          <Text style={[styles.toggleText, viewType === "month" && styles.toggleTextActive]}>
                            Month
                          </Text>
                        </Pressable>
                      </View>

                      {/* Calendar Grid */}
                      {viewType === "week" ? (
                        <WeekCalendar
                          weekRange="October 12-18, 2025"
                          weekDays={["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"]}
                          events={[
                            { day: "Sun", title: "Corporate Gala Planning", color: "#27AE60" },
                            { day: "Sat", title: "Wedding Coordination", color: Theme.colors.primary },
                          ]}
                          onPrevWeek={() => console.log("Previous week")}
                          onNextWeek={() => console.log("Next week")}
                        />
                      ) : (
                        <MonthCalendar
                          currentMonth={currentMonth}
                          currentYear={currentYear}
                          markedDates={getMarkedDates(currentMonth, currentYear)}
                          onDateSelect={onDateSelect}
                          onMonthChange={(month, year) => {
                            setCurrentMonth(month);
                            setCurrentYear(year);
                          }}
                        />
                      )}
                    </View>

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

                      <View style={{ position: "relative" }}>
                        <Pressable
                          style={styles.filterButton}
                          onPress={() => setShowFilterMenu(!showFilterMenu)}
                        >
                          <Ionicons name="funnel" size={20} color={Theme.colors.primary} />
                        </Pressable>

                        {/* Filter Menu Modal */}
                        <Modal
                          visible={showFilterMenu}
                          transparent={true}
                          animationType="fade"
                          onRequestClose={() => setShowFilterMenu(false)}
                        >
                          <Pressable
                            style={styles.filterMenuOverlay}
                            onPress={() => setShowFilterMenu(false)}
                          >
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
                          </Pressable>
                        </Modal>
                      </View>
                    </View>
                  </>
                }
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
                      <View style={styles.headerLeft}>
                        <Text style={styles.clientName}>{item.client_name}</Text>
                        {item.coordinator_name && (
                          <Text style={styles.coordinatorName}>
                            Requested by: {item.coordinator_name}
                          </Text>
                        )}
                      </View>
                      <View style={styles.badgeContainer}>
                        {hasBlockedDateConflict(item) && (
                          <View style={[styles.statusBadge, { backgroundColor: "#FF6B6B" }]}>
                            <Text style={[styles.statusText, { color: "#FFFFFF" }]}>
                              Conflict Found
                            </Text>
                          </View>
                        )}
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>
                            {item.booking_status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.requestDetails}>
                      {item.event_name && (
                        <Text style={styles.eventNameText}>
                          📌 {item.event_name}
                        </Text>
                      )}
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

                      {/* Pricing Breakdown for Pending Requests */}
                      {item.booking_status === "pending" && baseRates.length > 0 && (
                        <View style={styles.pricingBreakdown}>
                          {(() => {
                            const baseRate = baseRates[0]?.base_price || 0;
                            const priceBreakdown = calculateSeasonalPrice(
                              baseRate,
                              item.event_date,
                              seasonalPricings
                            );
                            return (
                              <>
                                <Text style={styles.pricingLabel}>
                                  💰 Base Price: {formatCurrency(priceBreakdown.basePrice)}
                                </Text>
                                {priceBreakdown.seasonalAdjustment !== 0 && (
                                  <>
                                    <Text style={styles.pricingLabel}>
                                      {priceBreakdown.seasonalName}: {priceBreakdown.seasonalAdjustment > 0 ? '+' : ''}{formatCurrency(priceBreakdown.seasonalAdjustment)}
                                    </Text>
                                    <Text style={styles.pricingTotal}>
                                      Total: {formatCurrency(priceBreakdown.finalPrice)}
                                    </Text>
                                  </>
                                )}
                                {priceBreakdown.seasonalAdjustment === 0 && (
                                  <Text style={styles.pricingTotal}>
                                    Total: {formatCurrency(priceBreakdown.finalPrice)}
                                  </Text>
                                )}
                              </>
                            );
                          })()}
                        </View>
                      )}

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
        ) : loading || isSwitchingVenue ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
          </View>
        ) : (
          <View key={`venue-${venueId}`} style={styles.calendarContainer}>
            {/* Venue Selector */}
            <View style={styles.venueSelectorContainer}>
              <Text style={styles.venueSelectorLabel}>Select Venue:</Text>
              <Pressable 
                style={styles.venueSelectorButton}
                onPress={() => setShowVenueDropdown(!showVenueDropdown)}
              >
                <Text style={styles.venueSelectorButtonText}>
                  {venues.find(v => v.venue_id === venueId)?.venue_name || 'Select Venue'}
                </Text>
                <Ionicons 
                  name={showVenueDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={Theme.colors.primary} 
                />
              </Pressable>
              
              {showVenueDropdown && (
                <View style={styles.venueSelectorDropdown}>
                  <ScrollView style={styles.venueDropdownScroll}>
                    {venues.map((venue) => (
                      <Pressable
                        key={venue.venue_id}
                        style={[
                          styles.venueSelectorOption,
                          venue.venue_id === venueId && styles.venueSelectorOptionActive
                        ]}
                        onPress={() => {
                          // Mark as switching to prevent stale renders
                          setIsSwitchingVenue(true);
                          // Clear data IMMEDIATELY before state updates to prevent stale renders
                          setUnifiedCalendarEvents([]);
                          setPendingBookings([]);
                          setSeasonalPricings([]);
                          setBaseRates([]);
                          // Then change venue
                          setVenueId(venue.venue_id);
                          setShowVenueDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.venueSelectorOptionText,
                          venue.venue_id === venueId && styles.venueSelectorOptionTextActive
                        ]}>
                          {venue.venue_name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

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
              key={`calendar-${venueId}`}
              currentMonth={currentMonth}
              currentYear={currentYear}
              markedDates={getMarkedDates(currentMonth, currentYear)}
              onDateSelect={onDateSelect}
              onMonthChange={(month, year) => {
                setCurrentMonth(month);
                setCurrentYear(year);
              }}
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

            {/* All Scheduled Events Section */}
            <View style={styles.eventsSection}>
              <Text style={styles.sectionTitle}>All Scheduled Events</Text>

              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color={Theme.colors.muted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Here..."
                  placeholderTextColor={Theme.colors.muted}
                  value={searchText}
                  onChangeText={setSearchText}
                />
                <Ionicons name="settings-outline" size={18} color={Theme.colors.muted} />
              </View>

              {unifiedCalendarEvents.length > 0 ? (
                unifiedCalendarEvents.map((event) => (
                  <View key={event.id} style={[styles.eventCard, { borderLeftColor: event.color, borderLeftWidth: 4 }]}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitleText}>{event.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: event.color + "20" }]}>
                        <Text style={[styles.statusText, { color: event.color }]}>
                          {event.type === "internal" ? "Direct" : event.type === "external" ? "Coordinator" : "Blocked"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.eventDetail}>
                      <Ionicons name="calendar-outline" size={16} color={Theme.colors.muted} />
                      <Text style={styles.detailText}>{formatDate(event.event_date)}</Text>
                      {event.time_start && (
                        <>
                          <Text style={styles.detailSeparator}>•</Text>
                          <Text style={styles.detailText}>
                            {formatTime(event.time_start)} {event.time_end ? `- ${formatTime(event.time_end)}` : ""}
                          </Text>
                        </>
                      )}
                    </View>

                    {event.guest_capacity && (
                      <View style={styles.eventDetail}>
                        <Ionicons name="people-outline" size={16} color={Theme.colors.muted} />
                        <Text style={styles.detailText}>{event.guest_capacity} guests</Text>
                      </View>
                    )}

                    {event.client_name && (
                      <View style={styles.eventDetail}>
                        <Text style={styles.organizerLabel}>
                          {event.type === "internal" ? "Client: " : "Requested by: "}{event.client_name}
                        </Text>
                      </View>
                    )}

                    {event.reason && (
                      <View style={styles.eventDetail}>
                        <Text style={styles.organizerLabel}>Reason: {event.reason}</Text>
                      </View>
                    )}

                    {event.type !== "blocked" && (
                      <Pressable style={styles.viewDetailsLink}>
                        <Ionicons name="eye-outline" size={16} color={Theme.colors.primary} />
                        <Text style={styles.viewDetailsText}>View Details</Text>
                      </Pressable>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No events scheduled</Text>
                </View>
              )}
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

                {selectedDateInfo.directEvents && selectedDateInfo.directEvents.length > 0 && (
                  <View style={styles.dateInfoSection}>
                    <Text style={styles.dateInfoSectionTitle}>Direct Bookings</Text>
                    {selectedDateInfo.directEvents.map((booking) => (
                      <View key={booking.direct_booking_id} style={styles.eventSummary}>
                        <Text style={styles.summaryText}>
                          {booking.event_name} - {booking.client_name}
                        </Text>
                        <Text style={styles.summaryText}>
                          {formatTime(booking.time_start)} - {formatTime(booking.time_end)}
                        </Text>
                        <Text style={styles.summaryText}>
                          {booking.guest_capacity} guests • {booking.status}
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
                  (!selectedDateInfo.directEvents || selectedDateInfo.directEvents.length === 0) &&
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
        onSubmit={async (data: BlockedDateData) => {
          try {
            // Convert month names to month numbers
            const monthMap: { [key: string]: number } = {
              January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
              July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
            };

            const startMonth = monthMap[data.startMonth] || 1;
            const endMonth = monthMap[data.endMonth] || 1;

            // Create ISO date strings (YYYY-MM-DD)
            const startDate = `${data.startYear}-${String(startMonth).padStart(2, "0")}-${String(data.startDay).padStart(2, "0")}`;
            const endDate = `${data.endYear}-${String(endMonth).padStart(2, "0")}-${String(data.endDay).padStart(2, "0")}`;

            // Find conflicting pending bookings
            const conflictingBookings = findConflictingPendingBookings(startDate, endDate);

            // If there are conflicts, show warning dialog
            if (conflictingBookings.length > 0) {
              return new Promise<void>((resolve) => {
                Alert.alert(
                  "Conflict Warning",
                  `You have ${conflictingBookings.length} pending request${conflictingBookings.length > 1 ? "s" : ""} on this date.\n\nBlocking this date will auto-reject ${conflictingBookings.length === 1 ? "this request" : "these requests"}.\n\nContinue?`,
                  [
                    {
                      text: "Cancel",
                      onPress: () => resolve(),
                      style: "cancel",
                    },
                    {
                      text: "Continue",
                      onPress: async () => {
                        // Get venue_admin_id by venue_id
                        const { data: adminData } = await supabase
                          .from("venue_administrators")
                          .select("venue_admin_id")
                          .eq("venue_id", venueId)
                          .single();

                        const venueAdminId = adminData?.venue_admin_id || 1;

                        // Create the system-wide blocked date record (affects all venues)
                        const { error: blockedError } = await createSystemBlockedDate({
                          start_date: startDate,
                          end_date: endDate,
                          reason: data.reason || "Unavailable",
                          blocked_by: venueAdminId,
                        });

                        if (blockedError) {
                          alert("Failed to create blocked dates. Please try again.");
                          resolve();
                          return;
                        }

                        // Auto-reject all conflicting pending bookings
                        for (const booking of conflictingBookings) {
                          await updateBookingStatus(
                            booking.booking_id,
                            "rejected"
                          );
                        }

                        // Reload data
                        await loadPendingBookings();
                        await loadConfirmedEventsAndBlockedDates();

                        setShowBlockedDatesModal(false);
                        alert(
                          `Blocked dates created successfully!\n${conflictingBookings.length} pending request${conflictingBookings.length > 1 ? "s" : ""} rejected due to conflict.`
                        );
                        resolve();
                      },
                      style: "default",
                    },
                  ]
                );
              });
            } else {
              // No conflicts - proceed directly
              // Get venue_admin_id by venue_id
              const { data: adminData } = await supabase
                .from("venue_administrators")
                .select("venue_admin_id")
                .eq("venue_id", venueId)
                .single();

              const venueAdminId = adminData?.venue_admin_id || 1;

              // Create the system-wide blocked date record (affects all venues)
              const { error: blockedError } = await createSystemBlockedDate({
                start_date: startDate,
                end_date: endDate,
                reason: data.reason || "Unavailable",
                blocked_by: venueAdminId,
              });

              if (blockedError) {
                alert("Failed to create blocked dates. Please try again.");
                return;
              }

              // Reload data
              await loadPendingBookings();
              await loadConfirmedEventsAndBlockedDates();

              setShowBlockedDatesModal(false);
              alert("Blocked dates created successfully!");
            }
          } catch (error) {
            console.error("Error saving blocked dates:", error);
            alert("An unexpected error occurred. Please try again.");
          }
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
  calendarSection: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: "transparent",
  },
  toggleButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  toggleText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  toggleTextActive: {
    color: "#FFFFFF",
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
    alignItems: "flex-start",
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  clientName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  coordinatorName: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: "row",
    gap: Theme.spacing.xs,
    alignItems: "center",
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
  eventNameText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  detailText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  pricingBreakdown: {
    backgroundColor: "#F5F5F5",
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginVertical: Theme.spacing.sm,
  },
  pricingLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  pricingTotal: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.primary,
    marginTop: Theme.spacing.xs,
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
    paddingTop: 0,
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
  filterMenuOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: Theme.spacing.md,
  },
  filterMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    elevation: 15,
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
  },
  // All Scheduled Events Styles
  eventsSection: {
    marginBottom: 16,
    marginTop: Theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 1,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitleText: {
    fontFamily: Theme.fonts.bold,
    fontSize: 14,
    color: Theme.colors.text,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  detailSeparator: {
    color: Theme.colors.muted,
  },
  organizerLabel: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.muted,
  },
  viewDetailsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  viewDetailsText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.primary,
  },
  venueSelectorContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    position: "relative",
    zIndex: 10,
  },
  venueSelectorLabel: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  venueSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 8,
    backgroundColor: Theme.colors.background,
  },
  venueSelectorButtonText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
    flex: 1,
  },
  venueSelectorDropdown: {
    position: "absolute",
    top: "100%",
    left: Theme.spacing.md,
    right: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    borderRadius: 8,
    maxHeight: 250,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  venueDropdownScroll: {
    maxHeight: 250,
  },
  venueSelectorOption: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  venueSelectorOptionActive: {
    backgroundColor: "#F0F7FF",
  },
  venueSelectorOptionText: {
    fontFamily: Theme.fonts.medium,
    fontSize: 14,
    color: Theme.colors.text,
  },
  venueSelectorOptionTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.semibold,
  },
});