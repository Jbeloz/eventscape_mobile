# VenueDashboard - Code Examples

## Example 1: Navigate from Venue List Screen

```typescript
import { useRouter } from 'expo-router'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useEffect, useState } from 'react'
import { getVenuesByAdmin } from '@/src/services/supabase'
import { useAuth } from '@/src/hooks/use-auth'

export default function VenueList() {
  const router = useRouter()
  const { user } = useAuth()
  const [venues, setVenues] = useState([])

  useEffect(() => {
    loadVenues()
  }, [])

  const loadVenues = async () => {
    // Fetch user's venues from database
    if (user?.user_id) {
      const { data } = await supabase
        .from('venues')
        .select('*')
        .eq('created_by', user.user_id)
      
      setVenues(data || [])
    }
  }

  const handleVenuePress = (venueId: number) => {
    // Navigate to VenueDashboard with venueId
    router.push({
      pathname: '/users/venue_administrator/venue_dashboard',
      params: { venueId: venueId.toString() }
    })
  }

  return (
    <FlatList
      data={venues}
      keyExtractor={(item) => item.venue_id.toString()}
      renderItem={({ item }) => (
        <Pressable onPress={() => handleVenuePress(item.venue_id)}>
          <View style={styles.venueCard}>
            <Text style={styles.venueName}>{item.venue_name}</Text>
            <Text style={styles.venueCapacity}>
              Capacity: {item.max_capacity}
            </Text>
          </View>
        </Pressable>
      )}
    />
  )
}
```

## Example 2: Use Dashboard as Component in Tab Navigator

```typescript
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import VenueDashboard from '@/src/components/VenueDashboard'
import VenueProfile from './VenueProfile'

const Tab = createMaterialBottomTabNavigator()

export default function VenueAdminTabs({ route }) {
  const { venueId } = route.params

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Dashboard"
        options={{ tabBarLabel: 'Dashboard' }}
      >
        {() => <VenueDashboard venueId={venueId} />}
      </Tab.Screen>
      
      <Tab.Screen
        name="Profile"
        options={{ tabBarLabel: 'Profile' }}
      >
        {() => <VenueProfile venueId={venueId} />}
      </Tab.Screen>
    </Tab.Navigator>
  )
}
```

## Example 3: Using Service Functions Directly

```typescript
import {
  getPendingVenueBookings,
  getConfirmedVenueBookings,
  updateBookingStatus,
  getVenueBlockedDates,
} from '@/src/services/supabase'

export async function VenueBookingManager(venueId: number) {
  // Fetch pending bookings
  const { data: pending, error: pendingError } = 
    await getPendingVenueBookings(venueId)
  
  if (pending) {
    console.log('Pending requests:', pending)
    pending.forEach(booking => {
      console.log(`${booking.client_name} - ${booking.event_date}`)
    })
  }

  // Fetch confirmed events
  const { data: confirmed, error: confirmedError } = 
    await getConfirmedVenueBookings(venueId)
  
  if (confirmed) {
    console.log('Confirmed events:', confirmed.length)
  }

  // Fetch blocked dates
  const { data: blocked, error: blockedError } = 
    await getVenueBlockedDates(venueId)
  
  if (blocked) {
    console.log('Blocked dates:', blocked.length)
  }

  // Confirm a booking
  const bookingId = 123
  const { data: updated, error: updateError } = 
    await updateBookingStatus(bookingId, 'confirmed')
  
  if (updated) {
    console.log('Booking confirmed!')
  }
}
```

## Example 4: Custom Hook for Venue Dashboard

```typescript
import { useCallback, useEffect, useState } from 'react'
import {
  getPendingVenueBookings,
  getConfirmedVenueBookings,
  getVenueBlockedDates,
} from '@/src/services/supabase'

interface UseVenueDashboardReturn {
  pending: any[]
  confirmed: any[]
  blocked: any[]
  loading: boolean
  error: any
  refresh: () => Promise<void>
}

export function useVenueDashboard(
  venueId: number
): UseVenueDashboardReturn {
  const [pending, setPending] = useState([])
  const [confirmed, setConfirmed] = useState([])
  const [blocked, setBlocked] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        { data: pendingData, error: pendingError },
        { data: confirmedData, error: confirmedError },
        { data: blockedData, error: blockedError },
      ] = await Promise.all([
        getPendingVenueBookings(venueId),
        getConfirmedVenueBookings(venueId),
        getVenueBlockedDates(venueId),
      ])

      if (pendingError || confirmedError || blockedError) {
        throw new Error('Failed to fetch data')
      }

      setPending(pendingData || [])
      setConfirmed(confirmedData || [])
      setBlocked(blockedData || [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [venueId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { pending, confirmed, blocked, loading, error, refresh }
}

// Usage in component:
export function MyComponent({ venueId }) {
  const { pending, confirmed, blocked, loading, refresh } =
    useVenueDashboard(venueId)

  if (loading) return <Text>Loading...</Text>

  return (
    <View>
      <Text>Pending: {pending.length}</Text>
      <Text>Confirmed: {confirmed.length}</Text>
      <Text>Blocked: {blocked.length}</Text>
      <Button title="Refresh" onPress={refresh} />
    </View>
  )
}
```

## Example 5: Integration with Existing Status Update

```typescript
import { updateBookingStatus } from '@/src/services/supabase'

async function handleBookingConfirmation(
  bookingId: number,
  onSuccess?: () => void
) {
  try {
    console.log('Confirming booking:', bookingId)
    
    const { data, error } = await updateBookingStatus(
      bookingId,
      'confirmed'
    )

    if (error) {
      console.error('Confirmation failed:', error.message)
      // Show error toast/alert to user
      return false
    }

    console.log('Booking confirmed successfully')
    
    // Optional: Trigger callback
    onSuccess?.()
    
    // Optional: Send notification
    await sendBookingConfirmationEmail(bookingId)
    
    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

async function handleBookingRejection(
  bookingId: number,
  reason?: string,
  onSuccess?: () => void
) {
  try {
    console.log('Rejecting booking:', bookingId, 'Reason:', reason)
    
    const { data, error } = await updateBookingStatus(
      bookingId,
      'rejected'
    )

    if (error) {
      console.error('Rejection failed:', error.message)
      return false
    }

    console.log('Booking rejected')
    
    onSuccess?.()
    
    // Optional: Send rejection email with reason
    if (reason) {
      await sendBookingRejectionEmail(bookingId, reason)
    }
    
    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}
```

## Example 6: Enhanced Card Component with Details

```typescript
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { Theme } from '@/constants/theme'

interface BookingCardProps {
  booking: {
    booking_id: number
    client_name: string
    event_date: string
    time_start: string
    time_end: string
    guest_capacity: number
    notes?: string
  }
  onConfirm: (id: number) => Promise<boolean>
  onReject: (id: number) => Promise<boolean>
}

export function BookingCard({
  booking,
  onConfirm,
  onReject,
}: BookingCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  const handleConfirm = async () => {
    setConfirming(true)
    const success = await onConfirm(booking.booking_id)
    setConfirming(false)
    
    if (success) {
      // Show success message
      console.log('Confirmed!')
    }
  }

  const handleReject = async () => {
    setRejecting(true)
    const success = await onReject(booking.booking_id)
    setRejecting(false)
    
    if (success) {
      // Show success message
      console.log('Rejected!')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const period = hour >= 12 ? 'PM' : 'AM'
    const display = hour % 12 || 12
    return `${display}:${minutes} ${period}`
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.clientName}>{booking.client_name}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.detail}>
          📅 {formatDate(booking.event_date)}
        </Text>
        <Text style={styles.detail}>
          🕐 {formatTime(booking.time_start)} - {formatTime(booking.time_end)}
        </Text>
        <Text style={styles.detail}>👥 {booking.guest_capacity} guests</Text>
        
        {booking.notes && (
          <Text style={styles.notes}>Note: {booking.notes}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.rejectButton]}
          onPress={handleReject}
          disabled={rejecting || confirming}
        >
          <Text style={styles.rejectText}>
            {rejecting ? '...' : 'Reject'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirm}
          disabled={confirming || rejecting}
        >
          <Text style={styles.confirmText}>
            {confirming ? '...' : 'Confirm'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  header: {
    marginBottom: Theme.spacing.sm,
  },
  clientName: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  details: {
    marginBottom: Theme.spacing.md,
  },
  detail: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  notes: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.muted,
    fontStyle: 'italic',
    marginTop: Theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#e8f5e9',
  },
  confirmText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: '#2e7d32',
  },
  rejectButton: {
    backgroundColor: '#ffebee',
  },
  rejectText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 12,
    color: '#c62828',
  },
})
```

## Example 7: Date Info Modal Standalone

```typescript
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Theme } from '@/constants/theme'

interface DateInfoModalProps {
  visible: boolean
  date: string
  events: Array<{
    booking_id: number
    client_name: string
    time_start: string
    time_end: string
  }>
  blocked: Array<{
    blocked_id: number
    reason?: string
  }>
  onClose: () => void
}

export function DateInfoModal({
  visible,
  date,
  events,
  blocked,
  onClose,
}: DateInfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{date}</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          {events.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Events</Text>
              {events.map((event) => (
                <View key={event.booking_id} style={styles.eventItem}>
                  <Text style={styles.itemText}>{event.client_name}</Text>
                  <Text style={styles.itemText}>
                    {event.time_start} - {event.time_end}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {blocked.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Blocked</Text>
              {blocked.map((block) => (
                <View key={block.blocked_id} style={styles.blockedItem}>
                  <Text style={styles.itemText}>
                    {block.reason || 'No reason provided'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {events.length === 0 && blocked.length === 0 && (
            <Text style={styles.emptyText}>
              No events or blocked dates
            </Text>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    width: '90%',
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: 16,
    color: Theme.colors.text,
  },
  closeButton: {
    fontFamily: Theme.fonts.bold,
    fontSize: 20,
    color: Theme.colors.muted,
  },
  section: {
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  eventItem: {
    backgroundColor: '#e8f5e9',
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.sm,
  },
  blockedItem: {
    backgroundColor: '#ffebee',
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing.sm,
  },
  itemText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 13,
    color: Theme.colors.text,
  },
  emptyText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: Theme.colors.muted,
    textAlign: 'center',
    paddingVertical: Theme.spacing.lg,
  },
})
```

## Example 8: Integration Test

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import VenueDashboard from '@/src/components/VenueDashboard'
import * as supabaseService from '@/src/services/supabase'

jest.mock('@/src/services/supabase')

describe('VenueDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display pending bookings', async () => {
    const mockBookings = [
      {
        booking_id: 1,
        client_name: 'John Doe',
        event_date: '2025-10-15',
        time_start: '14:00:00',
        time_end: '18:00:00',
        booking_status: 'pending',
        guest_capacity: 75,
      },
    ]

    supabaseService.getPendingVenueBookings.mockResolvedValue({
      data: mockBookings,
      error: null,
    })

    render(<VenueDashboard venueId={5} />)

    // Click Requests tab
    const requestsTab = screen.getByText('Requests')
    fireEvent.press(requestsTab)

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy()
    })
  })

  it('should confirm a booking', async () => {
    const mockBookings = [
      {
        booking_id: 1,
        client_name: 'John Doe',
        event_date: '2025-10-15',
        time_start: '14:00:00',
        time_end: '18:00:00',
        booking_status: 'pending',
        guest_capacity: 75,
      },
    ]

    supabaseService.getPendingVenueBookings.mockResolvedValue({
      data: mockBookings,
      error: null,
    })

    supabaseService.updateBookingStatus.mockResolvedValue({
      data: { ...mockBookings[0], booking_status: 'confirmed' },
      error: null,
    })

    render(<VenueDashboard venueId={5} />)

    const confirmButton = await screen.findByText('Confirm')
    fireEvent.press(confirmButton)

    await waitFor(() => {
      expect(supabaseService.updateBookingStatus).toHaveBeenCalledWith(
        1,
        'confirmed'
      )
    })
  })
})
```

These examples cover the most common integration scenarios for the VenueDashboard component.
