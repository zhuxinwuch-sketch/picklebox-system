-- 1. Columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS qr_token text;

ALTER TABLE public.open_play_registrations
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS qr_token text;

UPDATE public.bookings SET qr_token = encode(gen_random_bytes(16), 'hex') WHERE qr_token IS NULL;
UPDATE public.open_play_registrations SET qr_token = encode(gen_random_bytes(16), 'hex') WHERE qr_token IS NULL;

ALTER TABLE public.bookings
  ALTER COLUMN qr_token SET DEFAULT encode(gen_random_bytes(16), 'hex'),
  ALTER COLUMN qr_token SET NOT NULL;
ALTER TABLE public.open_play_registrations
  ALTER COLUMN qr_token SET DEFAULT encode(gen_random_bytes(16), 'hex'),
  ALTER COLUMN qr_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_qr_token_key ON public.bookings(qr_token);
CREATE UNIQUE INDEX IF NOT EXISTS open_play_registrations_qr_token_key ON public.open_play_registrations(qr_token);

-- 2. Player fetches own token, only when paid/approved
CREATE OR REPLACE FUNCTION public.get_my_qr_token(p_kind text, p_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_token text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED' USING ERRCODE = 'P0001'; END IF;

  IF p_kind = 'booking' THEN
    SELECT b.qr_token INTO v_token
    FROM public.bookings b
    WHERE b.id = p_id AND b.user_id = v_user AND b.status = 'paid';
  ELSIF p_kind = 'open_play' THEN
    SELECT r.qr_token INTO v_token
    FROM public.open_play_registrations r
    WHERE r.id = p_id AND r.user_id = v_user
      AND r.status IN ('registered', 'checked_in')
      AND r.payment_status = 'completed';
  ELSE
    RAISE EXCEPTION 'INVALID_QR_KIND' USING ERRCODE = 'P0001';
  END IF;

  IF v_token IS NULL THEN RAISE EXCEPTION 'QR_NOT_AVAILABLE' USING ERRCODE = 'P0001'; END IF;
  RETURN v_token;
END;
$$;

-- 3. Admin lookup (read-only)
CREATE OR REPLACE FUNCTION public.lookup_checkin(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  SELECT jsonb_build_object(
    'kind', 'booking',
    'id', b.id,
    'player_name', COALESCE(p.full_name, 'Player'),
    'title', COALESCE(c.name, 'Court'),
    'reference_code', b.reference_code,
    'event_date', b.booking_date,
    'start_time', b.start_time,
    'end_time', b.end_time,
    'payment_ok', (b.status = 'paid'),
    'status', b.status::text,
    'checked_in_at', b.checked_in_at
  ) INTO v_result
  FROM public.bookings b
  LEFT JOIN public.courts c ON c.id = b.court_id
  LEFT JOIN public.profiles p ON p.user_id = b.user_id
  WHERE b.qr_token = p_token;

  IF v_result IS NOT NULL THEN RETURN v_result; END IF;

  SELECT jsonb_build_object(
    'kind', 'open_play',
    'id', r.id,
    'player_name', COALESCE(p.full_name, 'Player'),
    'title', COALESCE(s.title, 'Open Play'),
    'reference_code', r.payment_reference,
    'event_date', s.session_date,
    'start_time', s.start_time,
    'end_time', s.end_time,
    'payment_ok', (r.payment_status = 'completed'),
    'status', r.status::text,
    'checked_in_at', r.checked_in_at
  ) INTO v_result
  FROM public.open_play_registrations r
  JOIN public.open_play_sessions s ON s.id = r.session_id
  LEFT JOIN public.profiles p ON p.user_id = r.user_id
  WHERE r.qr_token = p_token;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'QR_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;
  RETURN v_result;
END;
$$;

-- 4. Admin performs check-in (idempotent)
CREATE OR REPLACE FUNCTION public.perform_checkin(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_b public.bookings;
  v_r public.open_play_registrations;
  v_session public.open_play_sessions;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'ADMIN_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_b FROM public.bookings WHERE qr_token = p_token FOR UPDATE;
  IF FOUND THEN
    IF v_b.status <> 'paid' THEN
      RAISE EXCEPTION 'PAYMENT_NOT_APPROVED' USING ERRCODE = 'P0001';
    END IF;
    IF v_b.checked_in_at IS NOT NULL THEN
      RETURN jsonb_build_object('already', true, 'checked_in_at', v_b.checked_in_at, 'kind', 'booking');
    END IF;
    UPDATE public.bookings SET checked_in_at = now() WHERE id = v_b.id;
    RETURN jsonb_build_object('already', false, 'checked_in_at', now(), 'kind', 'booking');
  END IF;

  SELECT * INTO v_r FROM public.open_play_registrations WHERE qr_token = p_token FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'QR_NOT_FOUND' USING ERRCODE = 'P0001';
  END IF;
  IF v_r.payment_status <> 'completed' THEN
    RAISE EXCEPTION 'PAYMENT_NOT_APPROVED' USING ERRCODE = 'P0001';
  END IF;
  IF v_r.status NOT IN ('registered', 'checked_in') THEN
    RAISE EXCEPTION 'REGISTRATION_NOT_ACTIVE' USING ERRCODE = 'P0001';
  END IF;
  IF v_r.checked_in_at IS NOT NULL THEN
    RETURN jsonb_build_object('already', true, 'checked_in_at', v_r.checked_in_at, 'kind', 'open_play');
  END IF;
  UPDATE public.open_play_registrations
  SET checked_in_at = now(), status = 'checked_in'
  WHERE id = v_r.id;
  RETURN jsonb_build_object('already', false, 'checked_in_at', now(), 'kind', 'open_play');
END;
$$;

-- 5. Execute grants
REVOKE EXECUTE ON FUNCTION public.get_my_qr_token(text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lookup_checkin(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.perform_checkin(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_qr_token(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_checkin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_checkin(text) TO authenticated;