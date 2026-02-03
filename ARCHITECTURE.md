# Seasonal Pricing System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EVENTSCAPE MOBILE APP                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         VENUE ADMINISTRATOR INTERFACE                        │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  SeasonalRates Screen                              │   │ │
│  │  │  ├── List all seasonal rates                       │   │ │
│  │  │  ├── Add new rate (Modal Form)                    │   │ │
│  │  │  ├── Edit existing rate                           │   │ │
│  │  │  ├── Delete rate with confirmation               │   │ │
│  │  │  └── Toggle Active/Inactive                       │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  AddSchedule Screen                                │   │ │
│  │  │  ├── Start Date (YYYY-MM-DD)                       │   │ │
│  │  │  ├── End Date (YYYY-MM-DD)                         │   │ │
│  │  │  ├── Base Price                                    │   │ │
│  │  │  ├── [Dynamic Price Alert] ← Calculated           │   │ │
│  │  │  └── Other booking details...                      │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                          ↓ ↓                                       │
└──────────────────────────────────────────────────────────────────────
                          ↓ ↓
        ┌─────────────────────────────────────────┐
        │      SERVICE LAYER (Supabase)           │
        ├─────────────────────────────────────────┤
        │                                         │
        │  • getActiveVenueSeasonalPricing()     │
        │  • createSeasonalPricing()             │
        │  • updateSeasonalPricing()             │
        │  • deleteSeasonalPricing()             │
        │  • toggleSeasonalPricingStatus()       │
        │                                         │
        └──────────────────┬──────────────────────┘
                          ↓
        ┌─────────────────────────────────────────┐
        │      UTILITY LAYER                      │
        ├─────────────────────────────────────────┤
        │                                         │
        │  seasonalPricingUtils.ts                │
        │  ├── isDateInSeason()                   │
        │  ├── dateRangeOverlapsSeason()         │
        │  ├── findApplicableSeasons()            │
        │  ├── calculateAdjustedPrice()          │
        │  ├── calculateSeasonalPrice()          │
        │  ├── generateSeasonalDescription()    │
        │  ├── formatDateToString()              │
        │  └── parseStringToDate()               │
        │                                         │
        └──────────────────┬──────────────────────┘
                          ↓
        ┌─────────────────────────────────────────┐
        │      DATABASE (Supabase PostgreSQL)     │
        ├─────────────────────────────────────────┤
        │                                         │
        │  venue_seasonal_pricing                 │
        │  ├── seasonal_price_id (PK)            │
        │  ├── venue_id (FK)                     │
        │  ├── season_name                       │
        │  ├── start_date                        │
        │  ├── end_date                          │
        │  ├── rate_type                         │
        │  ├── modifier_type                     │
        │  ├── modifier_value                    │
        │  ├── is_active                         │
        │  ├── package_id (FK, optional)         │
        │  ├── created_at                        │
        │  └── updated_at                        │
        │                                         │
        └─────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Creating a Seasonal Rate

```
┌─────────────────────┐
│  Admin Clicks +     │
│  Add New Rate       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  SeasonalRates.tsx                  │
│  ├── Opens Modal Form                │
│  ├── User fills form                │
│  └── Clicks Save                    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Form Validation                    │
│  ├── Check all fields filled         │
│  ├── Validate date range             │
│  └── Error if invalid               │
└──────────┬──────────────────────────┘
           │ (Valid)
           ▼
┌─────────────────────────────────────┐
│  createSeasonalPricing()            │
│  (supabase.ts)                      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  INSERT into                        │
│  venue_seasonal_pricing             │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Reload List                        │
│  loadSeasonalRates()                │
│  Display new rate in list           │
└─────────────────────────────────────┘
```

### Applying Dynamic Pricing

```
┌──────────────────────────────┐
│  User in AddSchedule Screen  │
│  Enters Start Date           │
└─────────┬────────────────────┘
          │
          ▼
┌──────────────────────────────────────────┐
│  useEffect Hook Triggered                │
│  (startDate, endDate, price changed)     │
└─────────┬────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────┐
│  calculateDynamicPrice()                 │
│  ├── Parse dates                        │
│  ├── Parse base price                   │
│  └── Check if all values valid          │
└─────────┬────────────────────────────────┘
          │ (Valid)
          ▼
┌──────────────────────────────────────────┐
│  findApplicableSeasons()                 │
│  Check date overlap with active seasons  │
└─────────┬────────────────────────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
(Match)     (No Match)
    │           │
    ▼           ▼
Calculate   Clear Alert
Price       & Price
    │           │
    ▼           ▼
Show Alert  setDynamicPrice(null)
Update UI   setPriceAlert("")
    │           │
    └─────┬─────┘
          ▼
┌──────────────────────────────────────────┐
│  User sees:                              │
│  - Blue alert box                        │
│  - Adjustment description                │
│  - Price comparison                      │
│  - Can now save booking                 │
└──────────────────────────────────────────┘
```

---

## Component Interaction

### SeasonalRates.tsx

```
SeasonalRates Component
├── State
│   ├── seasonalRates[]
│   ├── searchQuery
│   ├── showAddModal
│   ├── editingId
│   └── formData
├── Effects
│   └── loadSeasonalRates() on mount
├── Event Handlers
│   ├── handleOpenAddModal()
│   ├── handleEditRate()
│   ├── handleSaveRate()
│   ├── handleDeleteRate()
│   └── handleToggleStatus()
├── UI Components
│   ├── Header with search
│   ├── FlatList of rate cards
│   ├── Modal for add/edit
│   └── Rate card children
└── Service Calls
    ├── getActiveVenueSeasonalPricing()
    ├── createSeasonalPricing()
    ├── updateSeasonalPricing()
    ├── deleteSeasonalPricing()
    └── toggleSeasonalPricingStatus()
```

### AddSchedule.tsx Enhanced

```
AddSchedule Component (Enhanced)
├── State
│   ├── ... (existing fields)
│   ├── startDate (NEW)
│   ├── endDate (NEW)
│   ├── seasonalRates[] (NEW)
│   ├── dynamicPrice (NEW)
│   ├── priceAlert (NEW)
│   └── loadingPrices (NEW)
├── Effects
│   ├── loadSeasonalRates() on mount (NEW)
│   └── calculateDynamicPrice() on date/price change (NEW)
├── Functions
│   ├── ... (existing)
│   ├── loadSeasonalRates() (NEW)
│   └── calculateDynamicPrice() (NEW)
├── Utility Functions Used
│   ├── getActiveVenueSeasonalPricing()
│   ├── findApplicableSeasons()
│   ├── calculateSeasonalPrice()
│   └── formatDateToString()
└── UI Components
    ├── ... (existing)
    ├── Date input fields (NEW)
    └── Dynamic price alert (NEW)
```

---

## Modifier Type Calculation Logic

### Percentage Modifier
```
Formula: Adjusted Price = Base Price × (1 + modifier_value/100)

Examples:
  Modifier: +20%  → Final = Base × 1.20  (20% increase)
  Modifier: -15%  → Final = Base × 0.85  (15% decrease)
  Modifier: +0%   → Final = Base × 1.00  (no change)

Implementation:
  if (modifierType === "Percentage") {
    return basePrice * (1 + modifierValue / 100);
  }
```

### Fixed Modifier
```
Formula: Adjusted Price = Base Price + modifier_value

Examples:
  Modifier: +2000  → Final = Base + 2000    (₱2000 surcharge)
  Modifier: -1500  → Final = Base - 1500    (₱1500 discount)
  Modifier: +0     → Final = Base + 0       (no change)

Implementation:
  if (modifierType === "Fixed") {
    return basePrice + modifierValue;
  }
```

---

## Date Overlap Detection Algorithm

```
Function: dateRangeOverlapsSeason(
  bookingStart: Date,
  bookingEnd: Date,
  season: VenueSeasonalPricing
): boolean

Logic:
  seasonStart = parse(season.start_date)
  seasonEnd = parse(season.end_date)
  
  // Two ranges overlap if:
  // Start1 <= End2 AND End1 >= Start2
  
  return bookingStart <= seasonEnd AND bookingEnd >= seasonStart

Examples:
  Season:   [Jan 1 -------- Jan 31]
  
  Booking 1: [Jan 5 --- Jan 10]      ✓ Overlaps
  Booking 2: [Dec 25 - Jan 5]        ✓ Overlaps
  Booking 3: [Jan 28 - Feb 5]        ✓ Overlaps
  Booking 4: [Feb 1 - Feb 28]        ✗ No overlap
  Booking 5: [Dec 1 - Dec 31]        ✗ No overlap
```

---

## Error Handling Flow

```
┌─────────────────────────────┐
│  Operation Initiated        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Try Block                  │
│  Execute Operation          │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Success    Error
    │         │
    ▼         ▼
 Return   Log Error
 Data     Return
          Error
          Object
    │         │
    └────┬────┘
         │
         ▼
┌─────────────────────────────┐
│  Finally Block              │
│  ├── setLoading(false)      │
│  └── Update UI State        │
└─────────────────────────────┘
```

---

## State Management Strategy

### SeasonalRates Component

```
useState Hooks:
  seasonalRates: VenueSeasonalPricing[]
    Purpose: Store all seasonal rates from DB
    Updated: After CRUD operations
    
  searchQuery: string
    Purpose: Filter rates by name
    Updated: User input in search box
    
  showAddModal: boolean
    Purpose: Control modal visibility
    Updated: Add/Cancel/Save actions
    
  editingId: number | null
    Purpose: Track which rate is being edited
    Updated: When opening edit mode
    
  formData: SeasonalRateFormData
    Purpose: Store form field values
    Updated: User input or edit initialization
    
  loading: boolean
    Purpose: Show loading indicators
    Updated: During async operations
```

### AddSchedule Component

```
useState Hooks:
  startDate: string
    Purpose: Store booking start date
    Updated: User input (YYYY-MM-DD)
    
  endDate: string
    Purpose: Store booking end date
    Updated: User input (YYYY-MM-DD)
    
  price: string
    Purpose: Store base price
    Updated: User input
    
  seasonalRates: VenueSeasonalPricing[]
    Purpose: Store applicable seasonal rates
    Updated: On component mount
    
  dynamicPrice: number | null
    Purpose: Store calculated adjusted price
    Updated: By calculateDynamicPrice()
    
  priceAlert: string
    Purpose: Store alert message
    Updated: By calculateDynamicPrice()
    
  loadingPrices: boolean
    Purpose: Show loading during calculation
    Updated: During price calculation
```

---

## Performance Optimizations

1. **Database Query Optimization**
   - Indexes on `venue_id` for fast lookups
   - `is_active` filter to reduce result set
   - Sorted by `start_date` for logical ordering

2. **Component Rendering**
   - Conditional rendering of alert only when needed
   - FlatList with proper key extraction
   - useCallback memoization for handlers

3. **Calculation Efficiency**
   - Single pass through seasonal rates
   - Direct JavaScript date comparisons
   - No unnecessary re-renders via proper dependencies

4. **Memory Management**
   - State cleanup in cleanup functions
   - No memory leaks from event listeners
   - Proper effect cleanup

---

## Security Considerations

### Row-Level Security (RLS)
```sql
-- Seasonal rates should only be readable/writable by:
-- 1. The venue owner
-- 2. Assigned venue administrators
-- 3. Platform administrators

-- Example RLS Policy:
CREATE POLICY "Venue admins can manage their venue's seasonal rates"
ON venue_seasonal_pricing
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM venue_admin_assignments
    WHERE venue_admin_assignments.venue_id = venue_seasonal_pricing.venue_id
    AND venue_admin_assignments.venue_admin_id = auth.uid()
  )
);
```

### Input Validation
- All form inputs validated before submission
- Date format validation
- Price range validation
- No SQL injection possible (parameterized queries)

---

## Integration Points

### Required Exports
- `SeasonalRates` component (default export from seasonal_rates.tsx)
- All utility functions from seasonalPricingUtils.ts
- Service functions from supabase.ts

### Navigation Integration
```tsx
// Add to your navigation setup
import SeasonalRates from '@/app/users/venue_administrator/seasonal_rates';

// Add route link
<Pressable onPress={() => router.push('/users/venue_administrator/seasonal_rates')}>
  <Text>Manage Seasonal Rates</Text>
</Pressable>
```

---

This architecture document provides a comprehensive view of how all components work together to create the seasonal pricing system.
