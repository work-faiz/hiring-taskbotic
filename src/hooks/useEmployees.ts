import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// type Employee = Tables<"employees">;
type Employee = any;

export function useEmployees(search: string = "") {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["employees", search],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });
      if (search && search.trim() !== "") {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,department.ilike.%${search.trim()}%,job_title.ilike.%${search.trim()}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Employee[];
    },
  });

  const addEmployee = useMutation({
    mutationFn: async (employee: any) => {
      const { data, error } = await supabase.from("employees").insert(employee).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const editEmployee = useMutation({
    mutationFn: async (employee: any) => {
      const { data, error } = await supabase.from("employees").update(employee).eq("id", employee.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return { employees: data, isLoading, error, addEmployee, editEmployee, deleteEmployee };
}

// Hook to get the total count of employees (ignores search/pagination)
export function useTotalEmployees() {
  return useQuery({
    queryKey: ["employees-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });
}
