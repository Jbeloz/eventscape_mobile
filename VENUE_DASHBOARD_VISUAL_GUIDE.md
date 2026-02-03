# VenueDashboard - Visual Architecture & User Flow

## 🎨 Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    VenueDashboard Component                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Header Section                                        │  │
│  │ ┌─────────────────────────────────────────────────┐  │  │
│  │ │ "Venue Dashboard"                              │  │  │
│  │ └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Tab Navigation                                        │  │
│  │ ┌──────────────────┐  ┌──────────────────┐           │  │
│  │ │ [Requests] (↓)   │  │ [Calendar]       │           │  │
│  │ └──────────────────┘  └──────────────────┘           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Content Area - Dynamic                                │  │
│  │                                                        │  │
│  │ ┌─────────────────────────────────────────────────┐  │  │
│  │ │ Requests Tab (FlatList)                         │  │  │
│  │ │                                                 │  │  │
│  │ │ ┌─────────────────────────────────────────────┐ │  │  │
│  │ │ │ Card 1: John Doe                            │ │  │  │
│  │ │ │ Oct 15, 2025 | 2:00 PM - 6:00 PM | 75 guests│ │  │  │
│  │ │ │ [View] [Reject] [Confirm]                   │ │  │  │
│  │ │ └─────────────────────────────────────────────┘ │  │  │
│  │ │                                                 │  │  │
│  │ │ ┌─────────────────────────────────────────────┐ │  │  │
│  │ │ │ Card 2: Jane Smith                          │ │  │  │
│  │ │ │ Oct 16, 2025 | 3:00 PM - 7:00 PM | 50 guests│ │  │  │
│  │ │ │ [View] [Reject] [Confirm]                   │ │  │  │
│  │ │ └─────────────────────────────────────────────┘ │  │  │
│  │ │                                                 │  │  │
│  │ └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │ ┌─────────────────────────────────────────────────┐  │  │
│  │ │ Calendar Tab (MonthCalendar + Modal)            │  │  │
│  │ │                                                 │  │  │
│  │ │  October 2025                                  │  │  │
│  │ │  Su Mo Tu We Th Fr Sa                          │  │  │
│  │ │       1  2  3  4  5                            │  │  │
│  │ │   6  7  8  9 10 11 12                          │  │  │
│  │ │  13 14 15🟢 16 17 18 19  (marked dates)        │  │  │
│  │ │  20 21 22 23 24 25 26                          │  │  │
│  │ │  27 28 29 30 31🔴                              │  │  │
│  │ │                                                 │  │  │
│  │ │  ● Green = Confirmed  ● Red = Blocked         │  │  │
│  │ │                                                 │  │  │
│  │ │  [Date Info Modal - appears on date click]    │  │  │
│  │ │  ┌─────────────────────────────────────────┐  │  │  │
│  │ │  │ Oct 15, 2025                         [✕] │  │  │  │
│  │ │  ├─────────────────────────────────────────┤  │  │  │
│  │ │  │ Events                                  │  │  │  │
│  │ │  │ └─ John's Wedding                       │  │  │  │
│  │ │  │   2:00 PM - 6:00 PM, 75 guests         │  │  │  │
│  │ │  │                                         │  │  │  │
│  │ │  │ Blocked                                 │  │  │  │
│  │ │  │ └─ None                                 │  │  │  │
│  │ │  └─────────────────────────────────────────┘  │  │  │
│  │ │                                                 │  │  │
│  │ └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### Requests Tab Data Flow

```
User Opens Dashboard
        ↓
useFocusEffect Hook Triggers
        ↓
loadPendingBookings() Function Called
        ↓
Supabase Query:
  FROM: bookings
  JOIN: coordinators (ON coordinator_id)
  JOIN: users (ON user_id)
  WHERE: venue_id = X AND booking_status = 'pending'
  ORDER BY: event_date ASC
        ↓
Response: Array of Pending Bookings
  {
    booking_id: 1,
    client_name: "John Doe",
    event_date: "2025-10-15",
    time_start: "14:00:00",
    time_end: "18:00:00",
    guest_capacity: 75,
    notes: "..."
  }
        ↓
Transform & Flatten Data
        ↓
Update State: setPendingBookings()
        ↓
Component Re-renders
        ↓
FlatList Renders Booking Cards
        ↓
User Sees Requests List
        ↓
User Clicks "Confirm" or "Reject"
        ↓
updateBookingStatus(bookingId, newStatus)
        ↓
Supabase UPDATE Query
  UPDATE bookings
  SET booking_status = 'confirmed' or 'rejected'
  WHERE booking_id = X
        ↓
List Auto-Refreshes
        ↓
Booking Removed from List (status changed)
```

### Calendar Tab Data Flow

```
User Switches to Calendar Tab
        ↓
loadConfirmedEventsAndBlockedDates() Called
        ↓
Parallel Queries:
  ┌─────────────────────────────────────────┐
  │ Query 1: Confirmed Events               │
  │ FROM bookings                           │
  │ WHERE booking_status IN                 │
  │   ('confirmed', 'rescheduled')          │
  └─────────────────────────────────────────┘
                    ║
  ┌─────────────────────────────────────────┐
  │ Query 2: Blocked Dates                  │
  │ FROM venue_blocked_dates                │
  │ WHERE venue_id = X                      │
  └─────────────────────────────────────────┘
        ↓ (Both Complete)
Combine Results
        ↓
Process Data:
  - Extract dates from events
  - Extract date ranges from blocked
  - Create marked dates array
        ↓
getMarkedDates() Function
  Input: events[], blocked[]
  Output: [
    { day: 15, color: '#4CAF50' },  // Green
    { day: 16, color: '#F44336' },  // Red
    ...
  ]
        ↓
Update State:
  - setConfirmedEvents()
  - setBlockedDates()
        ↓
Component Re-renders
        ↓
MonthCalendar Renders
  - Display calendar
  - Apply color markers
  - Show legend
        ↓
User Sees Calendar View
        ↓
User Clicks Date (e.g., Oct 15)
        ↓
onDateSelect(15, 9, 2025) Called
        ↓
Filter Events & Blocked for That Date:
  - events.filter(e => e.event_date == '2025-10-15')
  - blocked.filter(b => date in range)
        ↓
setSelectedDateInfo() Updates State
        ↓
DateInfoModal Appears
        ↓
User Sees:
  - Event details (client, time, guests)
  - Blocked reasons
        ↓
User Clicks Close (✕)
        ↓
Modal Disappears
```

---

## 🎬 User Journey Map

### Path 1: Check Pending Bookings

```
START: VenueDashboard Screen
   ↓
TAB: "Requests" (already selected)
   ↓
VIEW: List of pending booking requests
   ├─ Client Name
   ├─ Date & Time
   ├─ Guest Count
   └─ Action Buttons
   ↓
CHOOSE: Confirm / Reject / View Details
   ↓
ACTION: Booking status updated
   ↓
RESULT: List refreshes automatically
   ↓
END: Booking no longer in pending list
```

### Path 2: Check Calendar

```
START: VenueDashboard Screen
   ↓
TAB: Click "Calendar"
   ↓
WAIT: Load confirmed events & blocked dates
   ↓
VIEW: Month calendar with:
   ├─ Green dates (events)
   ├─ Red dates (blocked)
   └─ Color legend
   ↓
INTERACTION: Click on a date
   ↓
MODAL: Date Information Appears
   ├─ Shows events on that date
   ├─ Shows blocked reasons
   └─ Option to close
   ↓
ACTION: Review information
   ↓
CLOSE: Click ✕ button
   ↓
END: Back to calendar view
```

### Path 3: Manage Venue Availability

```
START: VenueDashboard Calendar Tab
   ↓
VIEW: Current month calendar
   ↓
NAVIGATE: Use arrows to change months
   ↓
OBSERVE: Where your dates are:
   ├─ Green = Already booked (can't add)
   ├─ Red = Intentionally blocked
   └─ White = Available
   ↓
DECISION: What to do
   ├─ Accept pending → Click Confirm in Requests tab
   ├─ Reject pending → Click Reject in Requests tab
   ├─ Add blocked dates → Use calendar UI (future feature)
   └─ View event details → Click on green date
   ↓
ACTION: Make changes as needed
   ↓
END: Venue availability managed
```

---

## 🔄 State Management Diagram

```
VenueDashboard Component State

┌──────────────────────────────────────────────────────────┐
│ activeTab: "requests" | "calendar"                       │
│ Controls which content is displayed                      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ pendingBookings: PendingBooking[]                         │
│ Array of pending booking requests                        │
│ Updated by: loadPendingBookings()                        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ confirmedEvents: ConfirmedEvent[]                        │
│ Array of confirmed/rescheduled events                   │
│ Updated by: loadConfirmedEventsAndBlockedDates()        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ blockedDates: VenueBlockedDate[]                         │
│ Array of blocked date ranges                            │
│ Updated by: loadConfirmedEventsAndBlockedDates()        │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ loading: boolean                                         │
│ Shows during data fetch                                 │
│ Set by: loadPendingBookings(), etc.                     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ selectedDateInfo: DateInfo | null                        │
│ Information about clicked calendar date                 │
│ Updated by: onDateSelect()                              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ refreshing: boolean                                      │
│ Pull-to-refresh state                                   │
│ Set by: Pull-to-refresh interaction                     │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Component Hierarchy

```
SafeAreaView
├── Header
│   ├── Text: "Venue Dashboard"
│   └── Styling: Border bottom
│
├── Tab Navigation Container
│   ├── Requests Tab Button
│   │   ├── Text: "Requests"
│   │   ├── Active indicator (gold underline)
│   │   └── Onpress: setActiveTab('requests')
│   │
│   └── Calendar Tab Button
│       ├── Text: "Calendar"
│       ├── Active indicator (gold underline)
│       └── Onpress: setActiveTab('calendar')
│
└── Content Container (flex: 1)
    │
    ├─── REQUESTS TAB CONTENT (if activeTab === 'requests')
    │    │
    │    ├── FlatList
    │    │   ├── keyExtractor: booking_id
    │    │   ├── onRefresh: loadPendingBookings
    │    │   ├── refreshing: refreshing state
    │    │   │
    │    │   └── renderItem: RequestCard
    │    │       ├── Card Container
    │    │       │   ├── Header
    │    │       │   │   ├── ClientName (bold)
    │    │       │   │   └── StatusBadge (color-coded)
    │    │       │   │
    │    │       │   ├── Details Section
    │    │       │   │   ├── Date: "📅 Oct 15, 2025"
    │    │       │   │   ├── Time: "🕐 2:00 PM - 6:00 PM"
    │    │       │   │   ├── Guests: "👥 75 guests"
    │    │       │   │   └── Notes: "Note: Special setup..."
    │    │       │   │
    │    │       │   └── Actions (Flex Row)
    │    │       │       ├── Button: "View Details" (blue)
    │    │       │       ├── Button: "Reject" (red)
    │    │       │       └── Button: "Confirm" (green)
    │    │       │
    │    │       └── Onpress handlers
    │    │
    │    └── Empty State (if no data)
    │        ├── Text: "No pending booking requests"
    │        └── Centered alignment
    │
    └─── CALENDAR TAB CONTENT (else)
         │
         ├── ScrollView
         │   │
         │   ├── MonthCalendar Component
         │   │   ├── Calendar Grid
         │   │   │   ├── Month/Year header
         │   │   │   ├── Day headers (Su-Sa)
         │   │   │   ├── Date cells
         │   │   │   │   ├── Marked dates (colored dots)
         │   │   │   │   └── Onpress: onDateSelect()
         │   │   │   │
         │   │   └── Navigation arrows
         │   │       ├── Previous month
         │   │       └── Next month
         │   │
         │   ├── Legend
         │   │   ├── Color dot + "Confirmed Events" (green)
         │   │   └── Color dot + "Blocked Dates" (red)
         │   │
         │   └── Date Info Modal (conditional)
         │       └── (if selectedDateInfo !== null)
         │           │
         │           ├── Modal Overlay
         │           │   └── Modal Box
         │           │       │
         │           │       ├── Header
         │           │       │   ├── Date: "Oct 15, 2025"
         │           │       │   └── Close Button (✕)
         │           │       │
         │           │       ├── Events Section (if any)
         │           │       │   ├── Title: "Events"
         │           │       │   └── Event Items
         │           │       │       ├── Client name
         │           │       │       ├── Time range
         │           │       │       └── Guest count
         │           │       │
         │           │       ├── Blocked Section (if any)
         │           │       │   ├── Title: "Blocked Reason"
         │           │       │   └── Reason text
         │           │       │
         │           │       └── Empty State (if neither)
         │           │           └── "No events or blocks on this date"
         │           │
         │           └── Onpress outside: close modal
```

---

## 📡 API Request/Response Diagram

### Request: Get Pending Bookings

```
REQUEST:
┌─────────────────────────────────────────────────────┐
│ Function: getPendingVenueBookings                   │
│ Params: venueId = 5                                 │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Supabase Query:                                     │
│                                                     │
│ SELECT *, coordinators(*), users(*)                │
│ FROM bookings                                       │
│ WHERE venue_id = 5                                  │
│   AND booking_status = 'pending'                    │
│ ORDER BY event_date ASC                            │
└─────────────────────────────────────────────────────┘

RESPONSE:
┌─────────────────────────────────────────────────────┐
│ {                                                   │
│   data: [                                           │
│     {                                               │
│       booking_id: 1,                               │
│       client_name: "John Doe",                     │
│       event_date: "2025-10-15",                    │
│       time_start: "14:00:00",                      │
│       time_end: "18:00:00",                        │
│       booking_status: "pending",                   │
│       guest_capacity: 75,                          │
│       notes: "Special setup required"              │
│     },                                              │
│     { ... more bookings ... }                      │
│   ],                                                │
│   error: null                                       │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

### Request: Update Booking Status

```
REQUEST:
┌─────────────────────────────────────────────────────┐
│ Function: updateBookingStatus                       │
│ Params:                                             │
│   - bookingId = 1                                   │
│   - status = 'confirmed'                            │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Supabase Query:                                     │
│                                                     │
│ UPDATE bookings                                    │
│ SET booking_status = 'confirmed'                   │
│ WHERE booking_id = 1                               │
│ RETURNING *                                         │
└─────────────────────────────────────────────────────┘

RESPONSE:
┌─────────────────────────────────────────────────────┐
│ {                                                   │
│   data: {                                           │
│     booking_id: 1,                                 │
│     ... all fields ...,                            │
│     booking_status: 'confirmed',                   │
│     updated_at: "2025-02-03T10:30:00Z"            │
│   },                                                │
│   error: null                                       │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Component Interaction Flow

```
VenueDashboard
├── Tab Switch (activeTab state)
│   ├── Requests → Load pending bookings
│   └── Calendar → Load events + blocked dates
│
├── Requests Tab Interactions
│   ├── Confirm Button
│   │   └── updateBookingStatus(id, 'confirmed')
│   │       └── Refresh list → Remove from display
│   │
│   ├── Reject Button
│   │   └── updateBookingStatus(id, 'rejected')
│   │       └── Refresh list → Remove from display
│   │
│   ├── View Details Button
│   │   └── (Placeholder - navigate to detail screen)
│   │
│   └── Pull-to-Refresh
│       └── loadPendingBookings()
│           └── Reload list
│
└── Calendar Tab Interactions
    ├── Navigate Months
    │   ├── Previous Month Button
    │   └── Next Month Button
    │
    ├── Click Date
    │   └── onDateSelect(day, month, year)
    │       ├── Filter events for date
    │       ├── Filter blocked for date
    │       └── Show modal
    │
    └── Date Info Modal
        └── Close Button (✕)
            └── Close modal
```

---

## 🎯 State Transitions

```
Component Mount
    ↓
Initialize State
├─ activeTab: 'requests'
├─ pendingBookings: []
├─ confirmedEvents: []
├─ blockedDates: []
├─ loading: false
├─ selectedDateInfo: null
└─ refreshing: false
    ↓
useFocusEffect Trigger
    ↓
Load Data (Requests Tab)
    ├─ loading: true
    ├─ Fetch data
    ├─ loading: false
    └─ pendingBookings: [data]
    ↓
User Switch to Calendar
    ├─ activeTab: 'calendar'
    └─ Load Data (Calendar Tab)
       ├─ loading: true
       ├─ Parallel fetch
       ├─ loading: false
       ├─ confirmedEvents: [data]
       └─ blockedDates: [data]
    ↓
User Click Date
    ├─ onDateSelect triggered
    └─ selectedDateInfo: { date info }
    ↓
User Close Modal
    └─ selectedDateInfo: null
    ↓
User Press Confirm
    ├─ updateBookingStatus called
    ├─ Data updated in DB
    └─ loadPendingBookings called
    ↓
User Switch Tabs (repeat)
```

---

This visual guide helps understand the complete data flow, component structure, and user interactions within the VenueDashboard system.
