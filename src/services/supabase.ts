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