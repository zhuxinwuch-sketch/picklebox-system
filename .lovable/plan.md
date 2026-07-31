# QR Code Check-In for Bookings & Open Play

Players show a QR code at the court; an admin scans it and the system verifies and marks them checked in. QR codes are only issued when payment is settled.

## Eligibility rule
- Court booking: QR appears only when `bookings.status = 'paid'`.
- Open Play: QR appears only when the registration is `registered`/`checked_in` AND `payment_status = 'completed'` (admin-approved). Waitlisted, pending-payment, or cancelled entries show "QR available once your payment is approved."

## Player experience
- **My Bookings** page: each eligible booking card gets a "Show QR" button opening a dialog with the QR, court name, date, time, reference code, and a status badge (Valid / Already checked in / Expired after the session date).
- **Open Play** page and the Open Play section of My Bookings: same dialog for eligible registrations.
- Confirmation page after checkout shows the QR immediately if the booking is already paid, otherwise a note that it unlocks after approval.

## Admin experience
- New **Check-In** page at `/admin/check-in`:
  - Camera scanner (rear camera, with permission fallback) plus a manual code entry field for phones that block camera access.
  - On scan: shows player name, what they booked (court + time, or Open Play session), payment status, then a **Confirm Check-In** button.
  - Result states: success, already checked in (with timestamp), not paid, wrong date, invalid/unknown code.
  - Recent check-ins list for the day.
- Existing Open Play roster keeps its manual "Check in" action; both write the same fields.

## Technical details

### Database (one migration)
- `bookings`: add `checked_in_at timestamptz`, `qr_token text unique default encode(gen_random_bytes(16),'hex')` (backfilled for existing rows).
- `open_play_registrations`: add `checked_in_at timestamptz`, `qr_token text unique` with the same default/backfill.
- Tokens are random and unguessable; they are the only thing encoded in the QR (no PII, no raw IDs).
- RPC `get_my_qr_token(p_kind text, p_id uuid)` — SECURITY DEFINER, returns the token only to the owning user and only when the paid/approved rule above holds.
- RPC `lookup_checkin(p_token text)` — admin-only via `has_role`; returns player name, type, court/session, date/time, payment status, and current check-in state without mutating anything.
- RPC `perform_checkin(p_token text)` — admin-only; validates payment status and session date, sets `checked_in_at` (and Open Play `status = 'checked_in'`), and is idempotent — a second scan returns "already checked in" instead of erroring.
- EXECUTE granted to `authenticated` only, revoked from `anon`/`PUBLIC`, matching existing conventions.

### Frontend
- Add `qrcode.react` for rendering and `html5-qrcode` for scanning.
- New `src/components/checkin/QRCodeDialog.tsx` (shared by bookings and Open Play) and `src/pages/admin/AdminCheckIn.tsx`.
- New hooks in `src/hooks/useCheckIn.tsx`: `useMyQrToken`, `useLookupCheckin`, `usePerformCheckin`.
- Route `/admin/check-in` added in `App.tsx` behind `ProtectedRoute requireAdmin`, plus a sidebar entry in `AdminLayout.tsx`.
- Styling follows the existing glassmorphism cards; QR rendered on a solid light surface so scanners read it reliably in both themes.

## Out of scope
- Offline scanning, printed/PDF passes, Apple/Google Wallet
- Self check-in by players (geofence or kiosk mode)
- Emailing the QR code
