import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate, Tables } from "@/integrations/supabase/types";

// Define types based on Supabase schema.
type Candidate = Tables<"candidates">;
type CandidateInsert = TablesInsert<"candidates">;
type CandidateUpdate = TablesUpdate<"candidates">;

export function useCandidates(limit: number = 15, offset: number = 0, search: string = "") {
  const queryClient = useQueryClient();

  // Fetch candidates with pagination
  const { data: candidates, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["candidates", limit, offset, search],
    queryFn: async () => {
      let query = supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });
      if (search && search.trim() !== "") {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
        );
      }
      const { data, error } = await query.range(offset, offset + limit - 1);
      if (error) throw error;
      return data as Candidate[];
    },
    keepPreviousData: true,
  });

  // Add candidate
  const addCandidate = useMutation({
    mutationFn: async (candidate: CandidateInsert) => {
      if (!candidate.full_name) {
        throw new Error("Candidate 'full_name' is required");
      }
      const { data, error } = await supabase
        .from("candidates")
        .insert(candidate)
        .select()
        .single();
      if (error) throw error;
      return data as Candidate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  // Edit candidate - expects { id, ...updates }
  const editCandidate = useMutation({
    mutationFn: async (input: { id: string } & CandidateUpdate) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("candidates")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  // Delete candidate
  const deleteCandidate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidates").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  // Helper to fetch more candidates
  const fetchMore = async (newOffset: number) => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false })
      .range(newOffset, newOffset + limit - 1);
    if (error) throw error;
    return data as Candidate[];
  };

  // Bulk status change
  const bulkStatusChange = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      if (!ids.length) throw new Error("No candidate IDs provided");
      const { error } = await supabase
        .from("candidates")
        .update({ status })
        .in("id", ids);
      if (error) throw error;
      return { ids, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  return {
    candidates,
    isLoading,
    error,
    addCandidate,
    editCandidate,
    deleteCandidate,
    fetchMore,
    isFetching,
    refetch,
    bulkStatusChange,
  };
}

// Hook to get the total count of candidates (ignores search/pagination)
export function useTotalCandidates() {
  return useQuery({
    queryKey: ["candidates-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
}
