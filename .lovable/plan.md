# Open Play Sessions — Implementation Plan

Adds a drop-in "Open Play" flow next to the existing private court booking, based on how CourtReserve, PlayByPoint, Pickleheads, and PickleQ structure it.

## What Open Play means here

A scheduled session that an admin publishes on specific date/time using one or more of PKL1/PKL2/PKL3. Players register individually (not by renting a court), pay per head via GCash, and show up. Capacity is capped; overflow goes on a FIFO waitlist that auto-promotes when someone cancels.

Skill level, price, and court count are set per session (e.g., "Sat 7–9 PM · 3.0–3.5 · 3 courts · ₱150 · max 16 players").

## User-facing flow

### Player
1. New **Open Play** tab in the top nav (next to Courts). Public list/calendar of upcoming sessions with date, time, skill tag, price, and "8/16 registered" counter.
2. Session detail page shows roster (first names + avatars), courts allocated, cancellation window, and a state-driven CTA:
   - `Register — ₱150` → GCash reference input → `Registered · Cancel`
   - When full: `Join Waitlist (#3)` → `Waitlisted · Leave`
   - Promoted from waitlist: toast + email/in-app notification, status flips to `Registered`
3. My Bookings page gains an **Open Play** section listing sessions the user is registered/waitlisted for, with cancel action.
4. Free cancellation until N hours before start (session-configurable, default 2h). After that, cancel still works but marked no-refund.

### Admin
1. New **Open Play** page in admin sidebar.
2. "Create Session" form: date, start/end time, courts (multi-select PKL1/2/3), skill tag (all / 2.5–3.0 / 3.5 / 4.0+), max players, price, cancel-cutoff hours, optional weekly recurrence.
3. Session row expands to show live roster + waitlist. Actions per registrant: mark Checked-In / No-Show / Refunded, manually remove, verify GCash reference (same UX as current bookings).
4. Cancel session → refunds pending, notifies everyone.

### Interaction with existing private bookings
When an Open Play session is active on a court/time, that slot is blocked on the private-booking grid (shown as "Open Play" pill, non-selectable). Reverse also enforced: admins can't publish Open Play on a court that already has a paid private booking that hour.

## Technical details

### Database (new migration)

```sql
create type open_play_skill as enum ('all','2.5-3.0','3.5','4.0+');
create type open_play_registration_status as enum ('registered','waitlisted','cancelled','checked_in','no_show');

create table public.open_play_sessions (
  id uuid pk default gen_random_uuid(),
  session_date date not null,
  start_time time not null,
  end_time time not null,
  court_ids uuid[] not null,          -- refs public.courts.id
  skill open_play_skill not null default 'all',
  max_players int not null check (max_players > 0),
  price_php numeric not null default 0,
  cancel_cutoff_hours int not null default 2,
  status text not null default 'scheduled', -- scheduled|cancelled|completed
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create table public.open_play_registrations (
  id uuid pk default gen_random_uuid(),
  session_id uuid not null references public.open_play_sessions(id) on delete cascade,
  user_id uuid not null,
  status open_play_registration_status not null default 'registered',
  waitlist_position int,
  payment_reference text,
  payment_status payment_status not null default 'pending',
  registered_at timestamptz not null default now(),
  unique (session_id, user_id)         -- one row per user per session
);
```

Both tables get explicit `GRANT`s (SELECT to anon+authenticated on sessions for public listing; SELECT/INSERT/UPDATE to authenticated on registrations; ALL to service_role). RLS:
- `open_play_sessions`: anyone reads scheduled sessions; only admins insert/update/delete.
- `open_play_registrations`: users see their own rows + aggregate count via RPC; admins see all; users insert/update only their own; only RPC promotes waitlist.

Also add a foreign check so booking_slots / bookings and open_play_sessions can't overlap the same (court, date, hour). Implemented via a trigger on both tables that raises on conflict.

Enable realtime: `alter publication supabase_realtime add table open_play_sessions, open_play_registrations`.

### RPCs (SECURITY DEFINER)

- `register_for_open_play(p_session_id uuid, p_payment_reference text)` — locks session row, counts active registrations, inserts either `registered` (if room) or `waitlisted` with next position. Returns `{ status, position }`. Auth-only, `user_id := auth.uid()`.
- `cancel_open_play_registration(p_registration_id uuid)` — marks cancelled, then promotes head of waitlist to `registered` (all in one tx), returns promoted user_id if any so the client can notify.
- `admin_update_open_play_registration(p_registration_id, p_status)` — check-in/no-show; admin-only via `has_role`.
- `get_open_play_sessions(p_from date, p_to date)` — returns sessions + registered_count + user's own status, safe for public.

EXECUTE grants: `authenticated` only, revoked from `anon` and `PUBLIC`, matching current security memory.

### Frontend

- New pages: `src/pages/OpenPlay.tsx` (list), `src/pages/OpenPlaySession.tsx` (detail + register), `src/pages/admin/AdminOpenPlay.tsx` (manage).
- New hook file `src/hooks/useOpenPlay.tsx` mirroring `useBookings.tsx` patterns (queries + RPC mutations + realtime subscriptions to prune stale UI).
- `Courts.tsx` grid extended to render Open Play blocks as a distinct non-selectable state (new color token, "Open Play" label).
- Nav + admin sidebar gain the Open Play entries. Bookings page gets an Open Play tab.

### Notifications
Reuse existing `send-booking-notification` edge function pattern: extend it (or add `send-open-play-notification`) to email on `registered`, `waitlisted → promoted`, and `session cancelled`.

## Out of scope (deferred)
- DUPR rating sync / auto-eligibility gating
- Live in-session queue/rotation (PickleQ-style)
- Membership packages / bundled open-play punches
- Automated GCash refunds (admins mark refunded manually, same as today)
- Broadcast/first-to-claim waitlist mode (FIFO only for MVP)

Confirm and I'll implement.
