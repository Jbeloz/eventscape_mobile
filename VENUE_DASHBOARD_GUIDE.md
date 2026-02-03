# Venue Dashboard Implementation Guide

## Overview

The VenueDashboard is a unified React Native component that allows venue administrators to manage two critical aspects of venue operations:

1. **Booking Requests Tab** - View and manage pending booking requests
2. **Calendar Tab** - View confirmed events and blocked dates on a calendar

## Components Created

### 1. VenueDashboard.tsx (`src/components/VenueDashboard.tsx`)

**Purpose:** Main dashboard component that handles both requests and calendar views

**Key Features:**
- Tab-based navigation (Requests/Calendar)
- Real-time data fetching from Supabase
- Booking request management (confirm/reject)
- Interactive calendar with marked dates
- Date information modal showing event details and blocked reasons

**Props:**
```typescript
interface VenueDashboardProps {
  venueId: number;  // Required: The venue ID to display dashboard for
}
```

**State Management:**
- `activeTab`: Tracks current active tab ('requests' | 'calendar')
- `pendingBookings`: Array of booking requests awaiting confirmation
- `confirmedEvents`: Array of confirmed/rescheduled bookings
- `blockedDates`: Array of blocked date ranges
- `selectedDateInfo`: Information about clicked calendar date
- `loading`: Loading state for data fetching
- `refreshing`: Pull-to-refresh indicator

**Data Flow:**
```
VenueDashboard Component
├── Requests Tab
│   ├── Fetch pending bookings (getPendingVenueBookings)
│   ├── Display booking cards
│   ├── Actions: View Details, Reject, Confirm
│   └── Update status (updateBookingStatus)
│
└── Calendar Tab
    ├── Fetch confirmed events (getConfirmedVenueBookings)
    ├── Fetch blocked dates (getVenueBlockedDates)
    ├── Display month calendar
    ├── Mark dates with colors:
    │   ├── Green: Confirmed events
    │   └── Red: Blocked dates
    └── Show event details on date click
```

### 2. venue_dashboard.tsx (`src/app/users/venue_administrator/venue_dashboard.tsx`)

**Purpose:** Screen wrapper that integrates VenueDashboard component with routing

**Features:**
- Route parameter handling for venueId
- Error handling for missing venueId
- Integration with useAuth hook

**Usage:**
```typescript
// Navigate from another screen
router.push({
  pathname: '/users/venue_administrator/venue_dashboard',
  params: { venueId: '5' }
})
```

## Supabase Service Functions

Added three new functions to `src/services/supabase.ts`:

### 1. `getPendingVenueBookings(venueId: number)`

**Purpose:** Fetch pending booking requests for a venue

**Database Query:**
- Joins `bookings` table with `coordinators` and `users`
- Filters by `venue_id` and `booking_status = 'pending'`
- Orders by `event_date` ascending

**Returns:**
```typescript
{
  data: PendingBooking[] | null,
  error: PostgrestError | null
}
```

**Data Structure:**
```typescript
interface PendingBooking {
  booking_id: number;
  client_name: string;        // From coordinator.user
  event_date: string;         // YYYY-MM-DD format
  time_start: string;         // HH:MM:SS format
  time_end: string;           // HH:MM:SS format
  booking_status: string;
  guest_capacity: number;
  notes?: string;
  coordinator_name?: string;
}
```

### 2. `getConfirmedVenueBookings(venueId: number)`

**Purpose:** Fetch confirmed/rescheduled bookings for calendar display

**Database Query:**
- Filters by `venue_id` and `booking_status IN ('confirmed', 'rescheduled')`
- Orders by `event_date` ascending

**Returns:**
```typescript
{
  data: ConfirmedEvent[] | null,
  error: PostgrestError | null
}
```

**Data Structure:**
```typescript
interface ConfirmedEvent {
  booking_id: number;
  client_name: string;
  event_date: string;
  time_start: string;
  time_end: string;
  booking_status: string;
  guest_capacity: number;
}
```

### 3. `updateBookingStatus(bookingId: number, status: BookingStatus)`

**Purpose:** Update a booking's status (confirm, reject, etc.)

**Parameters:**
- `bookingId`: The booking to update
- `status`: 'confirmed' | 'rejected' | 'cancelled' | 'pending'

**Returns:**
```typescript
{
  data: any | null,
  error: PostgrestError | null
}
```

## UI Components

### Requests Tab Layout

```
┌─────────────────────────────────────┐
│     Booking Request Card            │
├─────────────────────────────────────┤
│ Client Name                    Status│
│ 📅 Oct 15, 2025                    │
│ 🕐 2:00 PM - 6:00 PM               │
│ 👥 75 guests                        │
│ Note: Special setup required        │
├─────────────────────────────────────┤
│ [View Details] [Reject] [Confirm]  │
└─────────────────────────────────────┘
```

**Features:**
- Pull-to-refresh capability
- Empty state handling
- Color-coded status badges
- Quick-action buttons
- Request details display

### Calendar Tab Layout

```
┌─────────────────────────────────────┐
│      October 2025                   │
├─────────────────────────────────────┤
│ Su Mo Tu We Th Fr Sa                │
│        1  2  3  4  5  6             │
│  7  8  9 10 11 12 13                │
│ 14 15 16 17 18 19 20    (marked)   │
│ 21 22 23 24 25 26 27                │
│ 28 29 30 31                         │
├─────────────────────────────────────┤
│ ● Confirmed Events (Green)          │
│ ● Blocked Dates (Red)               │
├─────────────────────────────────────┤
│ Date Information Modal (on click)   │
└─────────────────────────────────────┘
```

**Features:**
- Month navigation arrows
- Color-coded date markers
- Legend for date types
- Click to view date details
- Event and block information display

### Date Information Modal

Displays when clicking a calendar date:

```
Date: Oct 15, 2025  [✕]
─────────────────────────
Events
  Client: John's Wedding
  Time: 2:00 PM - 6:00 PM
  Guests: 75

Blocked Reason
  Annual maintenance
```

## Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Primary | #ECA836 (Gold) | Active tabs, accents |
| Confirmed Events | #4CAF50 (Green) | Calendar marking |
| Blocked Dates | #F44336 (Red) | Calendar marking |
| Pending Status | #FFF3E0 (Orange) | Status badge |
| Confirm Button | #E8F5E9 (Light Green) | Confirm action |
| Reject Button | #FFEBEE (Light Red) | Reject action |
| View Button | #E3F2FD (Light Blue) | View details |

## Integration Examples

### 1. Navigate to Dashboard from Venue List

```typescript
import { useRouter } from 'expo-router'

export default function VenueList() {
  const router = useRouter()

  const handleVenueSelect = (venueId: number) => {
    router.push({
      pathname: '/users/venue_administrator/venue_dashboard',
      params: { venueId: venueId.toString() }
    })
  }

  return (
    // ... venue list UI
  )
}
```

### 2. Using VenueDashboard as Standalone Component

```typescript
import VenueDashboard from '@/src/components/VenueDashboard'

export default function MyScreen() {
  return (
    <VenueDashboard venueId={5} />
  )
}
```

### 3. Manual Refresh

```typescript
// In the component, you can trigger refresh by calling:
await loadPendingBookings()    // Refresh requests
await loadConfirmedEventsAndBlockedDates()  // Refresh calendar
```

## Database Schema References

### bookings table (key columns)
```sql
- booking_id: SERIAL PRIMARY KEY
- venue_id: INTEGER NOT NULL
- coordinator_id: INTEGER NOT NULL
- event_date: DATE NOT NULL
- time_start: TIME NOT NULL
- time_end: TIME NOT NULL
- guest_capacity: INTEGER NOT NULL
- booking_status: booking_status_enum
- notes: TEXT
```

### venue_blocked_dates table (key columns)
```sql
- blocked_id: SERIAL PRIMARY KEY
- venue_id: INTEGER NOT NULL
- start_date: DATE NOT NULL
- end_date: DATE NOT NULL
- reason: TEXT
- blocked_by: INTEGER NOT NULL
```

## Error Handling

All data fetching functions include:
- Try-catch blocks for unexpected errors
- Console logging for debugging
- Null data returns on errors
- Error propagation through return objects

**Example Error Response:**
```typescript
{
  data: null,
  error: {
    code: "PGRST200",
    message: "Failed to fetch data",
    details: "..."
  }
}
```

## Performance Considerations

1. **Data Fetching:**
   - Uses `useFocusEffect` to refresh only when screen is focused
   - Prevents unnecessary API calls when tab is inactive

2. **Rendering:**
   - FlatList for efficient request list rendering
   - Date information modal conditionally rendered
   - Lazy loading of calendar data

3. **Optimization:**
   - Memoized callbacks with useCallback
   - Tab state prevents redundant data fetches
   - Pull-to-refresh reduces background API calls

## Future Enhancements

1. **View Details Modal:** Implement detailed booking information display
2. **Filters:** Add date range and status filters
3. **Notifications:** Real-time push notifications for new requests
4. **Bulk Actions:** Select multiple bookings and perform batch actions
5. **Export:** Export bookings/calendar to PDF/CSV
6. **Analytics:** Display booking statistics and trends
7. **Custom Events:** Allow adding notes or custom events to calendar

## Testing Checklist

- [ ] Pending bookings list displays correctly
- [ ] Confirm button updates booking status
- [ ] Reject button removes booking from list
- [ ] Calendar displays marked dates
- [ ] Click date shows event details
- [ ] Blocked dates display with reason
- [ ] Pull-to-refresh works in requests tab
- [ ] Navigation works with different venueIds
- [ ] Empty states display appropriately
- [ ] Loading indicators appear during data fetch
- [ ] Time formatting is correct (12-hour format)
- [ ] Date formatting is consistent
