## Goal
Guarantee that two users can never end up holding the same court/date/time slot, even when they click "Confirm" at the exact same moment, and give the losing user a clear message + refreshed availability.

## Current state
- `public.bookings` already has `UNIQUE (court_id, booking_date, start_time)` — good, but:
  - It ignores `status`, so a `cancelled` row permanently blocks that slot.
  - It only checks the start hour; a hypothetical multi-hour booking wouldn't detect overlap on its middle hours (today every row is 1h so it works, but it's fragile).
- Checkout inserts bookings **one at a time from the client** in a `for` loop. If the 3rd insert conflicts, the first 2 are already committed → orphan bookings + a charged GCash reference for a partial cart.
- Availability grid (`Courts.tsx`) is fetched once on date change; another user booking the same slot while you're picking is invisible until submit.
- The conflict error surfaces as a generic "Booking Failed" toast; user has no idea which slot lost.

## Approach

### 1. Database: correctness first
New migration:
- Drop the current `no_double_booking` unique constraint.
- Add a **partial unique index** so only active bookings reserve a slot:
  `UNIQUE (court_id, booking_date, start_time) WHERE status IN ('pending','confirmed')`.
  Cancelled/expired rows no longer block re-booking.
- Add an **exclusion constraint** (btree_gist) on `(court_id, booking_date, tsrange(start_time, end_time))` with the same `WHERE` clause, so any future multi-hour booking still can't overlap an existing one. This is the real concurrency guard — Postgres serializes overlap checks at commit time regardless of app-level races.

### 2. Atomic multi-slot checkout via RPC
Replace the client-side loop with a single `SECURITY DEFINER` function `create_bookings_atomic(p_date, p_reference, p_items jsonb)`:
- Runs inside one transaction.
- Iterates items, inserts each booking + its payment row.
- On any unique/exclusion violation, the whole transaction rolls back — no partial cart.
- Returns the created booking ids as `uuid[]` on success, or raises a structured error `{ code: 'SLOT_TAKEN', court_id, start_time }` that the client can parse.
- Enforces `user_id = auth.uid()` server-side so the client can't spoof another user.

Checkout.tsx changes:
- Replace the `for` loop with a single `supabase.rpc('create_bookings_atomic', …)` call.
- Parse `SLOT_TAKEN` errors and show "Court X at 5:00 PM was just booked by someone else. Please pick another slot." then navigate back to `/courts` with the availability query invalidated.

### 3. Live availability on the grid
In `Courts.tsx`, subscribe to Supabase Realtime on `public.bookings` filtered by the currently-selected date. On any insert/update/delete:
- Invalidate `useBookedSlotsAllCourts` so the grid repaints.
- If a slot the user has **currently selected** just became reserved, remove it from selection and toast "This slot was just taken."
- Cleanup the channel in `useEffect` return per realtime guidelines.

Enable realtime for the table via the migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;` and `ALTER TABLE public.bookings REPLICA IDENTITY FULL;`.

### 4. Optional short-lived hold (not in this plan)
A "hold slot for 5 minutes while I pay" flow would need a `holds` table + timer UI. Given GCash checkout is fast and the atomic RPC already prevents double-booking, we skip holds for now — call it out for the user to decide later.

## Files touched
- New migration: unique index swap + exclusion constraint + `create_bookings_atomic` RPC + realtime publication.
- `src/pages/Checkout.tsx` — swap loop for RPC, better conflict toast.
- `src/pages/Courts.tsx` (+ maybe `useBookings.tsx`) — realtime subscription, prune selection on conflict.

## Out of scope
- Slot-hold/reservation timer.
- Admin override for double-booking edge cases (already handled by admin RLS).

Confirm and I'll implement.