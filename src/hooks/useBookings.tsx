import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useUserBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, courts(name, description)")
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useBooking(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from("bookings")
        .select("*, courts(name, description, price_per_hour), payments(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: {
      user_id: string;
      court_id: string;
      booking_date: string;
      start_time: string;
      end_time: string;
      total_amount: number;
    }) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert(booking)
        .select("*, courts(name, description, price_per_hour)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: {
      booking_id: string;
      user_id: string;
      amount: number;
      payment_method: string;
      transaction_reference?: string;
    }) => {
      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useBookedSlots(courtId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ["booked-slots", courtId, date],
    queryFn: async () => {
      if (!courtId || !date) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("court_id", courtId)
        .eq("booking_date", date)
        .in("status", ["pending", "paid"]);
      if (error) throw error;
      return data;
    },
    enabled: !!courtId && !!date,
  });
}

export function useBookedSlotsAllCourts(date: string | undefined) {
  return useQuery({
    queryKey: ["booked-slots-all", date],
    queryFn: async () => {
      if (!date) return [];
      // booking_slots is readable to all authenticated users, so this
      // shows reservations from OTHER users too (bookings table is
      // RLS-restricted to the owner).
      const { data, error } = await supabase
        .from("booking_slots")
        .select("court_id, start_time")
        .eq("booking_date", date)
        .eq("is_reserved", true);
      if (error) throw error;
      return (data || []).map((s: any) => {
        const [h, m] = String(s.start_time).split(":").map(Number);
        const end = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
        return { court_id: s.court_id, start_time: s.start_time, end_time: end };
      }) as Array<{ court_id: string; start_time: string; end_time: string }>;
    },
    enabled: !!date,
  });
}

export function useBookingsByIds(ids: string[] | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bookings-by-ids", ids?.join(",")],
    queryFn: async () => {
      if (!ids?.length || !user) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, courts(name, description, price_per_hour), payments(*)")
        .in("id", ids)
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!ids?.length && !!user,
  });
}
