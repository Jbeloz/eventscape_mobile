import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

// Use localStorage for web, AsyncStorage for native
const storage = Platform.OS === 'web' 
  ? {
      getItem: (key: string) => Promise.resolve(typeof window !== 'undefined' ? localStorage.getItem(key) : null),
      setItem: (key: string, value: string) => { if (typeof window !== 'undefined') localStorage.setItem(key, value); return Promise.resolve() },
      removeItem: (key: string) => { if (typeof window !== 'undefined') localStorage.removeItem(key); return Promise.resolve() },
    }
  : AsyncStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Recover session from storage on app startup
export async function recoverSession() {
  try {
    const session = await supabase.auth.getSession()
    if (session?.data?.session) {
      console.log('✅ Session recovered from storage')
      return session.data.session
    } else {
      console.log('⚠️ No session found in storage')
      return null
    }
  } catch (error) {
    console.error('❌ Error recovering session:', error)
    return null
  }
}

// Handle auth errors globally
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_OUT') {
    // Clear storage when user signs out
    await AsyncStorage.removeItem('supabase.auth')
  } else if (event === 'TOKEN_REFRESHED' && session) {
    // Session refreshed successfully
    console.log('✅ Session token refreshed')
  } else if (event === 'SIGNED_IN') {
    console.log('✅ User signed in')
  }
})

// Handle app lifecycle for token refresh
if (Platform.OS !== 'web') {
  const subscription = AppState.addEventListener('change', async (state) => {
    if (state === 'active') {
      console.log('📱 App moved to foreground - starting auto refresh')
      supabase.auth.startAutoRefresh()
    } else {
      console.log('📱 App moved to background - stopping auto refresh')
      supabase.auth.stopAutoRefresh()
    }
  })
}

// ===== VENUE SERVICE FUNCTIONS =====

/**
 * Get all venues
 */
export async function getVenues() {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('venue_id, venue_name')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching venues:', error)
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error in getVenues:', error)
    return { data: null, error }
  }
}

// ===== SEASONAL PRICING SERVICE FUNCTIONS =====

/**
 * Fetch all seasonal pricing rules for a specific venue
 */
export async function getVenueSeasonalPricing(venueId: number) {
  try {
    const { data, error } = await supabase
      .from('venue_seasonal_pricing')
      .select('*')
      .eq('venue_id', venueId)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching seasonal pricing:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getVenueSeasonalPricing:', error)
    return { data: null, error }
  }
}

/**
 * Fetch active seasonal pricing rules for a specific venue
 */
export async function getActiveVenueSeasonalPricing(venueId: number) {
  try {
    const { data, error } = await supabase
      .from('venue_seasonal_pricing')
      .select('*')
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching active seasonal pricing:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getActiveVenueSeasonalPricing:', error)
    return { data: null, error }
  }
}

/**
 * Create a new seasonal pricing rule
 */
export async function createSeasonalPricing(seasonalPricingData: {
  venue_id: number
  rate_type: string
  season_name: string
  start_date: string
  end_date: string
  modifier_type: string
  modifier_value: number
  is_active: boolean
  package_id?: number | null
}) {
  try {
    const { data, error } = await supabase
      .from('venue_seasonal_pricing')
      .insert([seasonalPricingData])
      .select()

    if (error) {
      console.error('Error creating seasonal pricing:', error)
      return { data: null, error }
    }

    return { data: data?.[0], error: null }
  } catch (error) {
    console.error('Error in createSeasonalPricing:', error)
    return { data: null, error }
  }
}

/**
 * Update an existing seasonal pricing rule
 */
export async function updateSeasonalPricing(
  seasonalPriceId: number,
  updates: {
    season_name?: string
    start_date?: string
    end_date?: string
    modifier_type?: string
    modifier_value?: number
    is_active?: boolean
    rate_type?: string
  }
) {
  try {
    const { data, error } = await supabase
      .from('venue_seasonal_pricing')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('seasonal_price_id', seasonalPriceId)
      .select()

    if (error) {
      console.error('Error updating seasonal pricing:', error)
      return { data: null, error }
    }

    return { data: data?.[0], error: null }
  } catch (error) {
    console.error('Error in updateSeasonalPricing:', error)
    return { data: null, error }
  }
}

/**
 * Delete a seasonal pricing rule
 */
export async function deleteSeasonalPricing(seasonalPriceId: number) {
  try {
    const { error } = await supabase
      .from('venue_seasonal_pricing')
      .delete()
      .eq('seasonal_price_id', seasonalPriceId)

    if (error) {
      console.error('Error deleting seasonal pricing:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    console.error('Error in deleteSeasonalPricing:', error)
    return { error }
  }
}

/**
 * Toggle seasonal pricing active/inactive status
 */
export async function toggleSeasonalPricingStatus(
  seasonalPriceId: number,
  isActive: boolean
) {
  return updateSeasonalPricing(seasonalPriceId, { is_active: isActive })
}
/**
 * Create a new venue direct booking
 */
export async function createVenueDirectBooking(bookingData: {
  venue_id: number
  venue_admin_id: number
  client_name: string
  client_email: string
  client_contact: string
  event_name: string
  event_date: string
  time_start: string
  time_end: string
  guest_capacity: number
  organizer_name?: string
  organizer_contact?: string
  status?: string
  notes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('venue_direct_bookings')
      .insert([bookingData])
      .select()

    if (error) {
      console.error('Error creating venue direct booking:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createVenueDirectBooking:', error)
    return { data: null, error }
  }
}

/**
 * Get venue direct bookings for a venue
 */
export async function getVenueDirectBookings(venueId: number) {
  try {
    const { data, error } = await supabase
      .from('venue_direct_bookings')
      .select('*')
      .eq('venue_id', venueId)
      .order('event_date', { ascending: false })

    if (error) {
      console.error('Error fetching venue direct bookings:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getVenueDirectBookings:', error)
    return { data: null, error }
  }
}

/**
 * Update a venue direct booking
 */
export async function updateVenueDirectBooking(
  directBookingId: number,
  updates: Record<string, any>
) {
  try {
    const { data, error } = await supabase
      .from('venue_direct_bookings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('direct_booking_id', directBookingId)
      .select()

    if (error) {
      console.error('Error updating venue direct booking:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateVenueDirectBooking:', error)
    return { data: null, error }
  }
}

/**
 * Create a venue blocked date
 */
export async function createVenueBlockedDate(blockedDateData: {
  venue_id: number
  start_date: string
  end_date: string
  reason: string
  blocked_by: number
}) {
  try {
    const { data, error } = await supabase
      .from('venue_blocked_dates')
      .insert([blockedDateData])
      .select()

    if (error) {
      console.error('Error creating venue blocked date:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createVenueBlockedDate:', error)
    return { data: null, error }
  }
}

/**
 * Create a system-wide blocked date (affects all venues)
 */
export async function createSystemBlockedDate(blockedDateData: {
  start_date: string
  end_date: string
  reason: string
  blocked_by: number
}) {
  try {
    // First, get all venues
    const { data: venues, error: venuesError } = await getVenues()
    
    if (venuesError || !venues) {
      console.error('Error fetching venues:', venuesError)
      return { data: null, error: venuesError }
    }

    // Create blocked date for each venue
    const blockedDatesForAllVenues = venues.map((venue: any) => ({
      venue_id: venue.venue_id,
      start_date: blockedDateData.start_date,
      end_date: blockedDateData.end_date,
      reason: blockedDateData.reason,
      blocked_by: blockedDateData.blocked_by,
    }))

    const { data, error } = await supabase
      .from('venue_blocked_dates')
      .insert(blockedDatesForAllVenues)
      .select()

    if (error) {
      console.error('Error creating system-wide blocked dates:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createSystemBlockedDate:', error)
    return { data: null, error }
  }
}

/**
 * Get venue blocked dates
 */
export async function getVenueBlockedDates(venueId: number) {
  try {
    const { data, error } = await supabase
      .from('venue_blocked_dates')
      .select('*')
      .eq('venue_id', venueId)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching venue blocked dates:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getVenueBlockedDates:', error)
    return { data: null, error }
  }
}

/**
 * Delete a venue blocked date
 */
export async function deleteVenueBlockedDate(blockedId: number) {
  try {
    const { data, error } = await supabase
      .from('venue_blocked_dates')
      .delete()
      .eq('blocked_id', blockedId)
      .select()

    if (error) {
      console.error('Error deleting venue blocked date:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in deleteVenueBlockedDate:', error)
    return { data: null, error }
  }
}

/**
 * Get pending bookings for a venue
 * Joins with coordinators and users to get client details
 */
export async function getPendingVenueBookings(venueId: number) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        event_date,
        time_start,
        time_end,
        booking_status,
        guest_capacity,
        notes,
        coordinator_id,
        coordinators (
          coordinator_id,
          user_id,
          users (
            first_name,
            last_name
          )
        )
      `)
      .eq('venue_id', venueId)
      .eq('booking_status', 'pending')
      .order('event_date', { ascending: true })

    if (error) {
      console.error('Error fetching pending venue bookings:', error)
      return { data: null, error }
    }

    // Transform data to flatten structure
    const transformedData = data?.map((booking: any) => ({
      booking_id: booking.booking_id,
      client_name: booking.coordinators?.users 
        ? `${booking.coordinators.users.first_name} ${booking.coordinators.users.last_name}`
        : 'Unknown Client',
      event_date: booking.event_date,
      time_start: booking.time_start,
      time_end: booking.time_end,
      booking_status: booking.booking_status,
      guest_capacity: booking.guest_capacity,
      notes: booking.notes,
      coordinator_name: booking.coordinators?.users
        ? `${booking.coordinators.users.first_name} ${booking.coordinators.users.last_name}`
        : 'Unknown',
    })) || []

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getPendingVenueBookings:', error)
    return { data: null, error }
  }
}

/**
 * Get confirmed bookings for a venue
 */
export async function getConfirmedVenueBookings(venueId: number) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        event_date,
        time_start,
        time_end,
        booking_status,
        guest_capacity,
        coordinator_id,
        coordinators (
          coordinator_id,
          user_id,
          users (
            first_name,
            last_name
          )
        )
      `)
      .eq('venue_id', venueId)
      .in('booking_status', ['confirmed', 'rescheduled'])
      .order('event_date', { ascending: true })

    if (error) {
      console.error('Error fetching confirmed venue bookings:', error)
      return { data: null, error }
    }

    // Transform data to flatten structure
    const transformedData = data?.map((booking: any) => ({
      booking_id: booking.booking_id,
      client_name: booking.coordinators?.users 
        ? `${booking.coordinators.users.first_name} ${booking.coordinators.users.last_name}`
        : 'Unknown Client',
      event_date: booking.event_date,
      time_start: booking.time_start,
      time_end: booking.time_end,
      booking_status: booking.booking_status,
      guest_capacity: booking.guest_capacity,
    })) || []

    return { data: transformedData, error: null }
  } catch (error) {
    console.error('Error in getConfirmedVenueBookings:', error)
    return { data: null, error }
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: number,
  status: 'confirmed' | 'rejected' | 'cancelled' | 'pending'
) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ booking_status: status })
      .eq('booking_id', bookingId)
      .select()

    if (error) {
      console.error('Error updating booking status:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateBookingStatus:', error)
    return { data: null, error }
  }
}

/**
 * Get venue base rates
 */
export async function getVenueBaseRates(venueId: number) {
  try {
    const { data, error } = await supabase
      .from('venue_base_rates')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching venue base rates:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getVenueBaseRates:', error)
    return { data: null, error }
  }
}

/**
 * Create a booking pricing record (locks in the calculated price)
 */
export async function createBookingPricing(pricingData: {
  booking_id: number
  base_price: number
  seasonal_adjustment: number
  seasonal_pricing_id?: number | null
  final_price: number
  currency: string
}) {
  try {
    const { data, error } = await supabase
      .from('booking_pricing')
      .insert([pricingData])
      .select()

    if (error) {
      console.error('Error creating booking pricing:', error)
      return { data: null, error }
    }

    return { data: data?.[0], error: null }
  } catch (error) {
    console.error('Error in createBookingPricing:', error)
    return { data: null, error }
  }
}

/**
 * Update booking pricing record
 */
export async function updateBookingPricing(
  bookingId: number,
  updates: {
    base_price?: number
    seasonal_adjustment?: number
    seasonal_pricing_id?: number | null
    final_price?: number
  }
) {
  try {
    const { data, error } = await supabase
      .from('booking_pricing')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('booking_id', bookingId)
      .select()

    if (error) {
      console.error('Error updating booking pricing:', error)
      return { data: null, error }
    }

    return { data: data?.[0], error: null }
  } catch (error) {
    console.error('Error in updateBookingPricing:', error)
    return { data: null, error }
  }
}

/**
 * Get booking pricing record
 */
export async function getBookingPricing(bookingId: number) {
  try {
    const { data, error } = await supabase
      .from('booking_pricing')
      .select('*')
      .eq('booking_id', bookingId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching booking pricing:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getBookingPricing:', error)
    return { data: null, error }
  }
}

// ===== UNIFIED CALENDAR FETCHER =====

/**
 * Unified Calendar Event Interface
 */
export interface UnifiedCalendarEvent {
  id: string | number
  title: string
  event_date: string
  time_start?: string
  time_end?: string
  type: 'internal' | 'external' | 'blocked'
  color: string
  guest_capacity?: number
  client_name?: string
  status?: string
  reason?: string
}

/**
 * Fetch all calendar events (blocked dates, confirmed coordinator bookings, confirmed direct bookings)
 * and merge them into a single unified array.
 * 
 * @param venueId - The venue ID to fetch events for
 * @returns Array of unified calendar events
 */
export async function getUnifiedCalendarEvents(venueId: number) {
  try {
    const unifiedEvents: UnifiedCalendarEvent[] = []

    // Fetch 1: Confirmed External Bookings (from coordinators)
    const { data: confirmedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        event_date,
        time_start,
        time_end,
        booking_status,
        guest_capacity,
        coordinator_id,
        coordinators (
          coordinator_id,
          user_id,
          users (
            first_name,
            last_name
          )
        )
      `)
      .eq('venue_id', venueId)
      .in('booking_status', ['confirmed', 'rescheduled'])
      .order('event_date', { ascending: true })

    if (bookingsError) {
      console.error('❌ Error fetching confirmed bookings:', bookingsError)
    } else if (confirmedBookings && confirmedBookings.length > 0) {
      console.log(`✅ Fetched ${confirmedBookings.length} confirmed external bookings`)
      confirmedBookings.forEach((booking: any) => {
        const clientName = booking.coordinators?.users 
          ? `${booking.coordinators.users.first_name} ${booking.coordinators.users.last_name}`
          : 'Unknown Client'
        
        unifiedEvents.push({
          id: `external_${booking.booking_id}`,
          title: `👥 ${clientName} (Coordinator)`,
          event_date: booking.event_date,
          time_start: booking.time_start,
          time_end: booking.time_end,
          type: 'external',
          color: '#4CAF50', // Green for external
          guest_capacity: booking.guest_capacity,
          client_name: clientName,
          status: booking.booking_status,
        })
      })
    }

    // Fetch 2: Confirmed Direct Internal Bookings
    console.log(`🔍 Querying venue_direct_bookings for venue_id=${venueId} with status='confirmed'`)
    const { data: directBookings, error: directError } = await supabase
      .from('venue_direct_bookings')
      .select('*')
      .eq('venue_id', venueId)
      .eq('status', 'confirmed')
      .order('event_date', { ascending: true })

    if (directError) {
      console.error('❌ Error fetching direct bookings:', directError)
      console.error('   Error details:', JSON.stringify(directError))
    } else {
      console.log(`✅ Direct bookings query returned ${directBookings?.length || 0} records`)
      if (directBookings && directBookings.length > 0) {
        console.log(`✅ Processing ${directBookings.length} confirmed internal bookings`)
        directBookings.forEach((booking: any) => {
          console.log(`   > Adding internal booking: ID=${booking.direct_booking_id}, status=${booking.status}, date=${booking.event_date}`)
          unifiedEvents.push({
            id: `internal_${booking.direct_booking_id}`,
            title: `📌 ${booking.event_name} (${booking.client_name})`,
            event_date: booking.event_date,
            time_start: booking.time_start,
            time_end: booking.time_end,
            type: 'internal',
            color: '#2196F3', // Blue for internal
            guest_capacity: booking.guest_capacity,
            client_name: booking.client_name,
            status: booking.status,
          })
        })
      } else {
        console.log('⚠️  No confirmed internal bookings found for this venue')
      }
    }

    // Fetch 3: Blocked Dates
    const { data: blockedDates, error: blockedError } = await supabase
      .from('venue_blocked_dates')
      .select('*')
      .eq('venue_id', venueId)
      .order('start_date', { ascending: true })

    if (blockedError) {
      console.error('❌ Error fetching blocked dates:', blockedError)
    } else if (blockedDates && blockedDates.length > 0) {
      console.log(`✅ Fetched ${blockedDates.length} blocked date ranges`)
      blockedDates.forEach((blocked: any) => {
        unifiedEvents.push({
          id: `blocked_${blocked.blocked_id}`,
          title: `🚫 Blocked: ${blocked.reason || 'Maintenance'}`,
          event_date: blocked.start_date,
          type: 'blocked',
          color: '#F44336', // Red for blocked
          reason: blocked.reason,
        })
      })
    }

    // Sort all events by date and time
    unifiedEvents.sort((a, b) => {
      const dateA = new Date(`${a.event_date}T${a.time_start || '00:00:00'}`)
      const dateB = new Date(`${b.event_date}T${b.time_start || '00:00:00'}`)
      return dateA.getTime() - dateB.getTime()
    })

    console.log(`\n📅 ===== UNIFIED CALENDAR SUMMARY =====`)
    console.log(`📅 Total unified calendar events: ${unifiedEvents.length}`)
    console.log(`📅 Breakdown:`)
    const internalCount = unifiedEvents.filter(e => e.type === 'internal').length
    const externalCount = unifiedEvents.filter(e => e.type === 'external').length
    const blockedCount = unifiedEvents.filter(e => e.type === 'blocked').length
    console.log(`   - Internal: ${internalCount}`)
    console.log(`   - External: ${externalCount}`)
    console.log(`   - Blocked: ${blockedCount}`)
    console.log(`📅 Events to return: ${JSON.stringify(unifiedEvents.slice(0, 3))}${unifiedEvents.length > 3 ? '... [+' + (unifiedEvents.length - 3) + ' more]' : ''}`)
    console.log(`📅 =====================================\n`)
    
    return { data: unifiedEvents, error: null }
  } catch (error) {
    console.error('❌ Error in getUnifiedCalendarEvents:', error)
    return { data: null, error }
  }
}