# VenueDashboard - Quick Start Guide

## What Was Created

A complete venue management dashboard with two integrated tabs:

### Tab 1: Booking Requests
- Shows all pending booking requests for the venue
- Displays: Client name, date, time, guest count, and notes
- Actions: View Details, Reject, or Confirm each booking
- Pull-to-refresh to reload requests
- Auto-refreshes when you navigate back to the screen

### Tab 2: Calendar
- Visual month calendar showing all events and blocked dates
- **Green dates**: Confirmed/rescheduled events
- **Red dates**: Blocked date ranges
- Click any date to see detailed information
- Shows color legend for reference

## Files Created

```
📦 src/components/
   └── VenueDashboard.tsx          (Main dashboard component)

📦 src/app/users/venue_administrator/
   └── venue_dashboard.tsx          (Screen wrapper)

📄 VENUE_DASHBOARD_GUIDE.md         (Complete documentation)
```

## Files Modified

```
📄 src/services/supabase.ts         (Added 3 new functions)
📄 src/app/users/venue_administrator/_layout.tsx  (Added route)
```

## How to Use

### Option 1: Navigate via Router

```typescript
import { useRouter } from 'expo-router'

const router = useRouter()

// Navigate to dashboard for a specific venue
router.push({
  pathname: '/users/venue_administrator/venue_dashboard',
  params: { venueId: '5' }  // Replace 5 with actual venue ID
})
```

### Option 2: Import Component Directly

```typescript
import VenueDashboard from '@/src/components/VenueDashboard'

export default function MyScreen() {
  return <VenueDashboard venueId={5} />
}
```

## New Supabase Functions

Three new service functions were added to `src/services/supabase.ts`:

### 1. `getPendingVenueBookings(venueId: number)`
Gets all pending booking requests for a venue
```typescript
const { data, error } = await getPendingVenueBookings(5)
// Returns: Array of pending bookings with client details
```

### 2. `getConfirmedVenueBookings(venueId: number)`
Gets all confirmed and rescheduled bookings for calendar display
```typescript
const { data, error } = await getConfirmedVenueBookings(5)
// Returns: Array of confirmed events
```

### 3. `updateBookingStatus(bookingId: number, status: string)`
Updates a booking's status (confirm, reject, etc.)
```typescript
const { data, error } = await updateBookingStatus(123, 'confirmed')
// Status options: 'confirmed', 'rejected', 'cancelled', 'pending'
```

## Data Fetched

### Requests Tab Data
- From `bookings` table where `booking_status = 'pending'`
- Joined with `coordinators` and `users` to get client info
- Sorted by event date (oldest first)

### Calendar Tab Data
- Confirmed/rescheduled events from `bookings` table
- All blocked date ranges from `venue_blocked_dates` table
- Displays dates with color coding

## Key Features

✅ **Real-time Data** - Fetches from Supabase on screen focus
✅ **Tab Navigation** - Switch between Requests and Calendar
✅ **Booking Management** - Confirm or reject requests instantly
✅ **Interactive Calendar** - Click dates to see event details
✅ **Responsive Design** - Works on all screen sizes
✅ **Error Handling** - Graceful error displays
✅ **Loading States** - Activity indicators during fetch
✅ **Pull-to-Refresh** - Manual refresh on requests tab
✅ **Visual Indicators** - Color-coded dates and status badges

## Styling

Uses the app's existing theme system:
- **Primary Color**: #ECA836 (Gold)
- **Text Colors**: Dark gray and black
- **Confirmed Events**: Green (#4CAF50)
- **Blocked Dates**: Red (#F44336)
- **Borders**: Light gray (#EFEFEF)

All styles are in `VenueDashboard.tsx` at the bottom of the file.

## Component Flow

```
VenueDashboard
├── Header with title
├── Tab Navigation (Requests / Calendar)
└── Content Area
    ├── [Requests Tab]
    │  ├── Fetch pending bookings
    │  ├── Display as list of cards
    │  └── Show action buttons (View/Reject/Confirm)
    │
    └── [Calendar Tab]
       ├── Fetch confirmed events + blocked dates
       ├── Render MonthCalendar with marked dates
       ├── Show legend
       └── Display date info modal on click
```

## Integration Points

The dashboard integrates with:
- **React Navigation** - For screen routing and focus detection
- **Supabase** - For all data operations
- **useAuth Hook** - For user context (available if needed)
- **MonthCalendar Component** - For calendar rendering
- **Existing Theme System** - For consistent styling

## Testing the Dashboard

1. **Test Requests Tab:**
   - Should show pending bookings
   - Click "Confirm" - booking should disappear from list
   - Click "Reject" - booking should disappear from list
   - Pull down to refresh manually

2. **Test Calendar Tab:**
   - Should show month calendar
   - Green dates = confirmed events
   - Red dates = blocked ranges
   - Click a date with events/blocks to see details
   - Click a date with nothing to see empty state

3. **Test Data Accuracy:**
   - Event dates should match database
   - Guest counts should display
   - Client names should be complete
   - Blocked dates should span correct range

## Deployment Notes

- No additional dependencies required
- Uses existing React Navigation stack
- Compatible with Expo
- No platform-specific code
- Works on iOS, Android, and Web

## Troubleshooting

**No data showing?**
- Check that venueId is passed correctly
- Verify venue has bookings in database
- Check Supabase connection

**Wrong client names?**
- Verify coordinators are linked to users
- Check user first_name and last_name fields

**Calendar not showing events?**
- Check that bookings have `confirmed` status
- Verify event_date is in correct format (YYYY-MM-DD)

**Action buttons not working?**
- Check browser console for errors
- Verify venue_admin_id permissions
- Ensure Supabase write access enabled

## Next Steps

To complete the implementation:

1. **View Details Modal** - Implement detailed view for each booking
2. **Confirmation Dialog** - Add confirmation before rejecting
3. **Edit Booking** - Allow editing of booking details
4. **Send Notification** - Notify clients of status changes
5. **Add Notes** - Let admin add internal notes to bookings
6. **Set Blocked Dates** - Integrate with BlockedDatesModal

See the complete `VENUE_DASHBOARD_GUIDE.md` for more details.
