import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type OpenPlaySkill = "all" | "2.5-3.0" | "3.5" | "4.0+";
export type OpenPlayRegistrationStatus =
  | "registered"
  | "waitlisted"
  | "cancelled"
  | "checked_in"
  | "no_show";

export interface OpenPlaySessionRow {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  court_ids: string[];
  skill: OpenPlaySkill;
  max_players: number;
  price_php: number;
  cancel_cutoff_hours: number;
  status: string;
  title: string | null;
  notes: string | null;
  registered_count: number;
  waitlist_count: number;
  my_status: OpenPlayRegistrationStatus | null;
  my_waitlist_position: number | null;
}

export function useOpenPlaySessions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("open-play-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "open_play_sessions" },
        () => queryClient.invalidateQueries({ queryKey: ["open-play", "sessions"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "open_play_registrations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["open-play", "sessions"] });
          queryClient.invalidateQueries({ queryKey: ["open-play", "roster"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["open-play", "sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_open_play_sessions");
      if (error) throw error;
      return (data ?? []) as unknown as OpenPlaySessionRow[];
    },
  });
}

export function useOpenPlayRoster(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["open-play", "roster", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const { data, error } = await supabase.rpc("get_open_play_roster", {
        p_session_id: sessionId,
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!sessionId,
  });
}

export function useRegisterOpenPlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { sessionId: string; paymentReference?: string }) => {
      const { data, error } = await supabase.rpc("register_for_open_play", {
        p_session_id: args.sessionId,
        p_payment_reference: args.paymentReference ?? null,
      });
      if (error) throw error;
      return data as { registration_id: string; status: string; waitlist_position: number | null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-play"] });
    },
  });
}

export function useCancelOpenPlayRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (registrationId: string) => {
      const { data, error } = await supabase.rpc("cancel_open_play_registration", {
        p_registration_id: registrationId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-play"] });
    },
  });
}

export function useMyOpenPlayRegistrations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["open-play", "mine", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("open_play_registrations")
        .select("*, open_play_sessions(*)")
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useAdminOpenPlaySessions() {
  return useQuery({
    queryKey: ["admin", "open-play", "sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("open_play_sessions")
        .select("*")
        .order("session_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateOpenPlaySession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (session: {
      session_date: string;
      start_time: string;
      end_time: string;
      court_ids: string[];
      skill: OpenPlaySkill;
      max_players: number;
      price_php: number;
      cancel_cutoff_hours: number;
      title?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("open_play_sessions")
        .insert({ ...session, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-play"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "open-play"] });
    },
  });
}

export function useCancelOpenPlaySession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("open_play_sessions")
        .update({ status: "cancelled" })
        .eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-play"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "open-play"] });
    },
  });
}

export function useAdminUpdateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      registrationId: string;
      status?: OpenPlayRegistrationStatus;
      paymentStatus?: "pending" | "completed" | "failed" | "refunded";
    }) => {
      const { error } = await supabase.rpc("admin_update_open_play_registration", {
        p_registration_id: args.registrationId,
        p_status: args.status ?? null,
        p_payment_status: args.paymentStatus ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["open-play"] });
    },
  });
}
