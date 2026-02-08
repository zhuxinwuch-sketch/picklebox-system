import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Court = Tables<"courts">;

export function useCourts() {
  return useQuery({
    queryKey: ["courts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Court[];
    },
  });
}

export function useCourt(id: string | undefined) {
  return useQuery({
    queryKey: ["court", id],
    queryFn: async () => {
      if (!id) throw new Error("No court ID provided");
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Court;
    },
    enabled: !!id,
  });
}

export function useAllCourts() {
  return useQuery({
    queryKey: ["courts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Court[];
    },
  });
}
