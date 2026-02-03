# Add Schedule Module - Database Table Mapping

## Recommended Table: `venue_direct_bookings`

The `venue_direct_bookings` table is the correct choice for the Add Schedule module because:
- It's designed for venue administrators to create direct bookings
- It has all essential event booking fields
- It tracks the venue admin who created the booking

## Field Mapping

### Form Fields → Database Fields

| Form Field | Table Field | Notes |
|-----------|-------------|-------|
| Guest Name | `client_name` | Primary client/guest name |
| Contact Number 1 | `client_contact` | Client contact number |
| Email 1 | `client_email` | Client email address |
| Start Date | `event_date` | Event date (use start date) |
| Start Time | `time_start` | Event start time |
| End Time | `time_end` | Event end time |
| Guest Capacity | `guest_capacity` | Number of guests |
| Organizer Name 2 | `organizer_name` | Event organizer name |
| Contact Number 2 | `organizer_contact` | Organizer contact number |
| Package Name | N/A | Store in `notes` field |
| Notes | `notes` | Additional notes |

### Fields Without Direct Mapping

These fields need to be handled separately (stored in notes or additional tables):

| Form Field | Recommended Solution |
|-----------|----------------------|
| Price | Store in `notes` or create booking record |
| Overtime Charges | Store in `notes` with pricing breakdown |
| Overtime Hours | Store in `notes` |
| Discounts | Store in `notes` or separate `booking_adjustments` table |
| Extra Charges | Store in `notes` or separate `booking_adjustments` table |
| Package Name/Type | Store in `notes` |
| Seasonal Rate Info | Store in `notes` |

## Database Schema: `venue_direct_bookings`

```sql
CREATE TABLE venue_direct_bookings (
    direct_booking_id SERIAL PRIMARY KEY,
    venue_id INTEGER NOT NULL,
    venue_admin_id INTEGER NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_contact VARCHAR(20) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    guest_capacity INTEGER NOT NULL,
    organizer_name VARCHAR(255),
    organizer_contact VARCHAR(20),
    status venue_direct_booking_status_enum NOT NULL DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    FOREIGN KEY (venue_admin_id) REFERENCES venue_administrators(venue_admin_id) ON DELETE CASCADE
);
```

## Implementation Steps

1. **Create Service Function**: Add `createVenueDirectBooking()` to supabase.ts
2. **Update Form**: Map form fields to venue_direct_bookings fields
3. **Handle Extra Data**: 
   - Create pricing breakdown in JSON format for `notes` field
   - Or create separate records in `booking_adjustments` table for pricing modifications
4. **Update handleSave()**: Call the new service function instead of just console.log

## Alternative Approach for Pricing

If detailed pricing tracking is needed, you could also:
- Create a booking record in `bookings` table (generic bookings)
- Create pricing details in `booking_pricing` table
- Create adjustments in `booking_adjustments` table

But since this is a direct booking by venue admin, `venue_direct_bookings` is simpler and more appropriate.
