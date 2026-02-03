# Seasonal Pricing & Promotions - Quick Start Guide

## What Was Implemented

You now have a complete seasonal pricing system with two main components:

### 1. **Seasonal Rates Management Screen** 
A dedicated screen where venue administrators can manage seasonal pricing rules.

**File:** `src/app/users/venue_administrator/seasonal_rates.tsx`

**To Access:**
Add this navigation link in your menu or bottom navigation:
```tsx
router.push('/users/venue_administrator/seasonal_rates')
```

**Features:**
- ✅ Add new seasonal rates
- ✅ Edit existing rates
- ✅ Delete rates
- ✅ Toggle Active/Inactive status
- ✅ Search by season name

### 2. **Smart Pricing in Add Schedule**
The Add Schedule form now automatically calculates dynamic prices.

**File:** `src/app/users/venue_administrator/add_schedule.tsx`

**What's New:**
- Start Date and End Date fields (YYYY-MM-DD format)
- Automatic price calculation when dates are selected
- Visual alert showing the adjustment applied
- Dynamic price is used when saving

---

## How It Works

### Creating a Seasonal Rate

1. Navigate to Seasonal Rates screen
2. Tap the **+** button in the header
3. Fill in the form:
   - **Season Name**: e.g., "Christmas 2024"
   - **Start Date**: e.g., "2024-12-15"
   - **End Date**: e.g., "2024-12-31"
   - **Rate Type**: Select Hourly, Daily, Package, or All
   - **Adjustment Type**: Choose between Percentage or Fixed
   - **Adjustment Value**: 
     - For Percentage: 20 means +20%, -10 means -10%
     - For Fixed: 2000 means +₱2000, -1000 means -₱1000
4. Tap **Save**

### Using Dynamic Pricing

1. Open Add Schedule form
2. Enter **Start Date** and **End Date**
3. Enter **Base Price**
4. The system automatically:
   - Checks if dates fall within any seasonal period
   - Calculates the adjusted price
   - Shows a blue alert with the new price
5. Submit the form with the calculated price

**Example:**
- Base Price: ₱5,000
- Dates: Dec 20-22 (Christmas season with 20% surcharge)
- Alert: "20% Holiday Surcharge Applied - ₱5,000 → ₱6,000"
- Saved Price: ₱6,000

---

## Key Files Created/Modified

### New Files
1. **`src/utils/seasonalPricingUtils.ts`** (235 lines)
   - Utility functions for date checking and price calculation
   
2. **`src/app/users/venue_administrator/seasonal_rates.tsx`** (550+ lines)
   - Complete CRUD screen for seasonal rates

### Modified Files
1. **`src/services/supabase.ts`**
   - Added 6 new service functions for seasonal pricing operations

2. **`src/app/users/venue_administrator/add_schedule.tsx`**
   - Added date fields (Start Date, End Date)
   - Added dynamic price calculation logic
   - Added visual price alert component
   - Imported seasonal pricing utilities

### Documentation
1. **`SEASONAL_PRICING_GUIDE.md`**
   - Comprehensive implementation guide
   - API documentation for all functions
   - Database schema details
   - Testing checklist

---

## Important Notes for Integration

### 1. Venue ID
Currently hardcoded as `1` in both files. Update to get the actual venue ID:
```tsx
// In seasonal_rates.tsx, line ~40
const [venueId] = useState(1); // TODO: Get from context/params

// In add_schedule.tsx, line ~38
const [venueId] = useState(1); // TODO: Get from context/params
```

### 2. Date Format
Uses YYYY-MM-DD format (e.g., "2024-12-25"). Consider adding a date picker library for better UX:
- `@react-native-community/datetimepicker`
- `react-native-date-picker`

### 3. Multiple Seasons
If booking dates overlap with multiple seasonal rates:
- Currently applies the **first matching season**
- Future enhancement: could combine adjustments or apply the most impactful one

### 4. Database Requirements
The system queries the `venue_seasonal_pricing` table directly. Ensure your Supabase database has this table with the schema as defined in your database migration files.

---

## Testing the Implementation

### Quick Test Flow

1. **Create a Test Season:**
   - Name: "Test Promo"
   - Start: "2025-02-03"
   - End: "2025-02-10"
   - Type: Daily
   - Adjustment: Percentage
   - Value: 15

2. **Create a Test Booking:**
   - Package: Any option
   - Start Date: "2025-02-05"
   - End Date: "2025-02-07"
   - Price: "5000"
   - Guest: "John Doe"

3. **Expected Result:**
   - Blue alert should appear
   - Alert text: "15% Holiday Surcharge Applied"
   - Price comparison: "₱5000 → ₱5750"

---

## Styling & Customization

All colors use the Theme system from your constants:
- Primary: `Theme.colors.primary` (Blue)
- Text: `Theme.colors.text` (Dark)
- Muted: `Theme.colors.muted` (Gray)
- Success: `#27AE60` (Green)
- Danger: `#E74C3C` (Red)

To customize colors, modify `constants/theme.ts` and they'll update across the app.

---

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution:** Run `npm install` or check that all imports are correct.

### Issue: Dynamic price not calculating
**Solution:** 
- Verify venue ID is correct
- Check that seasonal rates exist and are marked as active
- Ensure date format is YYYY-MM-DD
- Check Supabase connection in console logs

### Issue: Dates don't match seasonal periods
**Solution:** Verify date ranges in seasonal rates are inclusive (e.g., dates should be in YYYY-MM-DD format without time)

---

## Next Steps

1. **Navigation:** Add the seasonal_rates route to your bottom nav or header menu
2. **Venue ID:** Update to get venue ID from context/params
3. **Date Picker:** Consider integrating a date picker library
4. **Testing:** Run through the test flow above
5. **Error Handling:** Add toast notifications or better error messages
6. **Analytics:** Track which seasonal rates are used most

---

## Support & Documentation

Full documentation available in: `SEASONAL_PRICING_GUIDE.md`

API reference for all utility functions and service calls included.

---

**Implementation Date:** February 3, 2026
**Status:** ✅ Complete and Ready for Testing
