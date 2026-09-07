import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function profileMap(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, any>();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, full_name, phone")
    .in("user_id", userIds);
  return new Map((data ?? []).map((p: any) => [p.user_id, p]));
}

export interface SessionAttendanceRecord {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  waitlist_position: number | null;
  registered_at: string;
  checked_in_at: string | null;
}

export function useSessionAttendance(sessionId?: string) {
  return useQuery({
    queryKey: ["admin", "attendance", "session", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<SessionAttendanceRecord[]> => {
      const { data, error } = await supabase
        .from("open_play_registrations")
        .select("*")
        .eq("session_id", sessionId!)
        .order("registered_at", { ascending: true });
      if (error) throw error;
      const rows = data ?? [];
      const profiles = await profileMap([...new Set(rows.map((r: any) => r.user_id))]);
      return rows.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        full_name: profiles.get(r.user_id)?.full_name || "Unknown",
        phone: profiles.get(r.user_id)?.phone || "—",
        status: r.status,
        payment_status: r.payment_status,
        payment_reference: r.payment_reference,
        waitlist_position: r.waitlist_position,
        registered_at: r.registered_at,
        checked_in_at: r.checked_in_at,
      }));
    },
  });
}

export interface BookingAttendanceRecord {
  id: string;
  reference_code: string | null;
  full_name: string;
  phone: string;
  court_name: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number;
  created_at: string;
  checked_in_at: string | null;
}

export function useBookingAttendance(date?: string) {
  return useQuery({
    queryKey: ["admin", "attendance", "bookings", date],
    enabled: !!date,
    queryFn: async (): Promise<BookingAttendanceRecord[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, courts(name)")
        .eq("booking_date", date!)
        .order("start_time", { ascending: true });
      if (error) throw error;
      const rows = data ?? [];
      const profiles = await profileMap([...new Set(rows.map((r: any) => r.user_id))]);
      return rows.map((r: any) => ({
        id: r.id,
        reference_code: r.reference_code,
        full_name: profiles.get(r.user_id)?.full_name || "Unknown",
        phone: profiles.get(r.user_id)?.phone || "—",
        court_name: r.courts?.name || "Unknown",
        start_time: r.start_time,
        end_time: r.end_time,
        status: r.status,
        total_amount: r.total_amount,
        created_at: r.created_at,
        checked_in_at: r.checked_in_at,
      }));
    },
  });
}
