# Seasonal Pricing & Promotions System - Implementation Guide

## Overview
This document describes the complete implementation of the Seasonal Pricing & Promotions system for the EventScape Mobile app. The system allows venue administrators to manage seasonal rates and automatically applies dynamic pricing to bookings based on date ranges.

---

## Part 1: Seasonal Rates Management Screen

### Location
`src/app/users/venue_administrator/seasonal_rates.tsx`

### Features

#### CRUD Operations
- **Create**: Add new seasonal pricing rules with an intuitive modal form
- **Read**: Display all active seasonal rates in a filterable list
- **Update**: Edit existing seasonal rates
- **Delete**: Remove seasonal rates with confirmation dialog

#### Form Fields
1. **Season Name** - Text field (e.g., "Christmas Promo", "Peak Season")
2. **Start Date** - Date field (format: YYYY-MM-DD)
3. **End Date** - Date field (format: YYYY-MM-DD)
4. **Rate Type** - Dropdown (Hourly, Daily, Package, All)
5. **Adjustment Type** - Dropdown (Fixed or Percentage)
6. **Adjustment Value** - Number field
   - For Percentage: positive = increase, negative = decrease
   - For Fixed: positive = surcharge, negative = discount
7. **Active Toggle** - Toggle switch to activate/deactivate seasons

#### UI Components
- **Header**: Title with add button (+ icon)
- **Search Bar**: Filter seasonal rates by name
- **Rate Cards**: Display each season with:
  - Season name and date range
  - Adjustment type and value
  - Active/Inactive toggle button
  - Edit and Delete action buttons
- **Empty State**: Shows when no seasonal rates exist
- **Modal Form**: Slides up from bottom for add/edit operations

#### Data Validation
- Season name is required
- Start date must be provided
- End date must be provided
- End date must be after start date
- Modifier value must be provided

---

## Part 2: Smart Price Calculation in Add Schedule

### Location
`src/app/users/venue_administrator/add_schedule.tsx`

### Features

#### Date Selection
- **Start Date Field**: YYYY-MM-DD format
- **End Date Field**: YYYY-MM-DD format
- Fields are placed before the price field for better UX

#### Dynamic Pricing Alert
When a user selects both start and end dates and enters a base price:

1. **Automatic Query**: The system queries the `venue_seasonal_pricing` table
2. **Date Range Overlap Check**: Checks if the booking dates fall within any active seasonal period
3. **Price Calculation**: If a match is found, calculates the new price based on the modifier
4. **Visual Alert**: Displays a blue alert box showing:
   - Adjustment description (e.g., "10% Holiday Surcharge Applied")
   - Price comparison (e.g., "₱5000 → ₱5500")

#### Alert Design
- Blue background (#E3F2FD) with left border
- Information icon on the left
- Two-line message:
  - Line 1: Adjustment description
  - Line 2: Price comparison with arrow

#### Final Price
When submitting the form, the system uses the dynamic price if available, otherwise uses the base price.

---

## Utility Functions

### Location
`src/utils/seasonalPricingUtils.ts`

### Key Functions

#### `isDateInSeason(date: Date, season: VenueSeasonalPricing): boolean`
Checks if a single date falls within a seasonal pricing period.

#### `dateRangeOverlapsSeason(startDate: Date, endDate: Date, season: VenueSeasonalPricing): boolean`
Checks if a date range overlaps with a seasonal pricing period.

#### `findApplicableSeasons(startDate: Date, endDate: Date, seasons: VenueSeasonalPricing[]): VenueSeasonalPricing[]`
Finds all active seasons that overlap with the given booking date range.

#### `calculateAdjustedPrice(basePrice: number, modifierType: ModifierType, modifierValue: number): number`
Calculates the adjusted price based on the modifier type and value.

#### `calculateSeasonalPrice(basePrice: number, startDate: Date, endDate: Date, applicableSeasons: VenueSeasonalPricing[]): SeasonalPricingResult`
Main function that calculates the final price considering all applicable seasonal adjustments. Returns an object with:
- `basePrice`: Original price
- `applicableSeasons`: Array of matching seasons
- `adjustedPrice`: Final calculated price
- `totalAdjustment`: Amount of change
- `adjustmentPercentage`: Percentage change
- `description`: Human-readable description of the adjustment

#### `generateSeasonalDescription(season: VenueSeasonalPricing, adjustmentPercentage: number): string`
Creates a user-friendly description of the seasonal adjustment.

#### `formatDateToString(date: Date): string` & `parseStringToDate(dateString: string): Date`
Helper functions for date formatting and parsing (YYYY-MM-DD format).

---

## Supabase Service Functions

### Location
`src/services/supabase.ts`

### Functions

#### `getVenueSeasonalPricing(venueId: number)`
Fetches all seasonal pricing rules for a venue (both active and inactive).

#### `getActiveVenueSeasonalPricing(venueId: number)`
Fetches only active seasonal pricing rules for a venue.

#### `createSeasonalPricing(seasonalPricingData: {...})`
Creates a new seasonal pricing rule.

#### `updateSeasonalPricing(seasonalPriceId: number, updates: {...})`
Updates an existing seasonal pricing rule.

#### `deleteSeasonalPricing(seasonalPriceId: number)`
Deletes a seasonal pricing rule.

#### `toggleSeasonalPricingStatus(seasonalPriceId: number, isActive: boolean)`
Toggles the active/inactive status of a seasonal pricing rule.

---

## Database Schema

### Table: `venue_seasonal_pricing`

| Column | Type | Description |
|--------|------|-------------|
| seasonal_price_id | SERIAL PRIMARY KEY | Unique identifier |
| venue_id | INTEGER | Reference to the venue |
| rate_type | ENUM | Type of rate (Hourly, Daily, Package, All) |
| package_id | INTEGER | Optional reference to a specific package |
| season_name | VARCHAR | Name of the seasonal period |
| start_date | DATE | Start date of the seasonal period |
| end_date | DATE | End date of the seasonal period |
| modifier_type | ENUM | Type of adjustment (Fixed, Percentage) |
| modifier_value | NUMERIC | Value of the adjustment |
| is_active | BOOLEAN | Whether this rule is active |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

---

## Usage Examples

### Creating a Seasonal Rate

```
Season Name: "Christmas Holiday"
Start Date: "2024-12-15"
End Date: "2024-12-31"
Rate Type: "All"
Adjustment Type: "Percentage"
Adjustment Value: "20" (20% surcharge)
Active: Yes
```

### Creating a Fixed Discount

```
Season Name: "Summer Promotion"
Start Date: "2024-06-01"
End Date: "2024-08-31"
Rate Type: "Daily"
Adjustment Type: "Fixed"
Adjustment Value: "-2000" (₱2000 discount)
Active: Yes
```

### Booking with Dynamic Pricing

1. Enter booking details
2. Select Start Date: "2024-12-20"
3. Select End Date: "2024-12-22"
4. Enter Base Price: "₱5000"
5. System automatically detects "Christmas Holiday" season is active
6. Alert appears: "20% Holiday Surcharge Applied - ₱5000 → ₱6000"
7. Final price saved as ₱6000

---

## Integration Points

### Venue Admin Calendar
The SeasonalRates screen can be accessed from the venue administrator's main navigation. Add a link in the bottom navigation or header.

### Add Schedule Screen
The seasonal pricing logic is fully integrated. When users select dates and enter a price, the system automatically:
1. Loads active seasonal rates
2. Checks for overlaps
3. Calculates and displays the adjusted price
4. Saves the final price to the database

### Future Enhancements
- Date picker integration (react-native-date-picker)
- Multiple seasonal adjustments (combine multiple seasons)
- Seasonal pricing history and reports
- Bulk operations (enable/disable multiple seasons)
- Conflict warnings (overlapping seasonal periods)

---

## Testing Checklist

- [ ] Create a new seasonal rate
- [ ] Edit an existing seasonal rate
- [ ] Delete a seasonal rate
- [ ] Toggle seasonal rate active/inactive
- [ ] Search for seasonal rates by name
- [ ] Verify dynamic price calculation with percentage adjustment
- [ ] Verify dynamic price calculation with fixed adjustment
- [ ] Verify no alert when dates don't overlap with any season
- [ ] Verify alert displays correct comparison price
- [ ] Verify final saved price is the adjusted price
- [ ] Test with multiple overlapping seasons
- [ ] Test date range validation

---

## Notes for Development

1. **Venue ID**: Currently hardcoded as `1`. Update to get from navigation params or context once auth is fully integrated.
2. **Date Format**: Using YYYY-MM-DD format. Consider integrating a proper date picker library for better UX.
3. **Multiple Seasons**: Currently applies the first matching season. Consider implementing logic to apply the most impactful adjustment or combine adjustments.
4. **Error Handling**: Add proper error messages for users when operations fail.
5. **Loading States**: Add loading indicators while fetching data from Supabase.
6. **Optimistic Updates**: Consider optimistic UI updates for better perceived performance.

---

## Dependencies

- React Native
- Expo Router (navigation)
- Supabase JS Client
- Ionicons (UI icons)
- React Hooks (useState, useEffect)

---

## Type Definitions

All types are defined in `src/models/types.ts`:
- `VenueSeasonalPricing`: Main seasonal pricing interface
- `ModifierType`: Union type for "Fixed" | "Percentage"
- `SeasonalRateType`: Union type for rate types
- `SeasonalPricingResult`: Result interface for price calculations

---

## Color Scheme

- **Primary Color**: `Theme.colors.primary` (Blue)
- **Success**: `#27AE60` (Green)
- **Danger**: `#E74C3C` (Red)
- **Alert Background**: `#E3F2FD` (Light Blue)
- **Muted Text**: `Theme.colors.muted` (Gray)

---

Generated: February 3, 2026
