import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DepartmentWithHead = any;

export function useDepartments(search: string = "") {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["departments", search],
    queryFn: async () => {
      let query = supabase
        .from("departments")
        .select("*, department_head:employees(id, full_name)")
        .order("name", { ascending: true });
      if (search && search.trim() !== "") {
        query = query.or(
          `name.ilike.%${search.trim()}%,department_head.full_name.ilike.%${search.trim()}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as DepartmentWithHead[];
    },
  });

  const addDepartment = useMutation({
    mutationFn: async (department: any) => {
      const { data, error } = await supabase.from("departments").insert(department).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const editDepartment = useMutation({
    mutationFn: async (department: any) => {
      const { data, error } = await supabase.from("departments").update(department).eq("id", department.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  return { departments: data, isLoading, error, addDepartment, editDepartment, deleteDepartment };
}

// Hook to get the total count of departments (ignores search/pagination)
export function useTotalDepartments() {
  return useQuery({
    queryKey: ["departments-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("departments")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
}
