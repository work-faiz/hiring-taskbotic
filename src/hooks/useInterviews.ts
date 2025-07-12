import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { sendInterviewUpdateEmail } from '@/utils/sendInterviewEmail';

// export type InterviewWithRelations = Tables<'interviews'> & {
//   candidates: { full_name: string } | null;
//   employees: { full_name: string } | null;
// };
export type InterviewWithRelations = any;

// Fetch all interviews with candidate and employee names
const fetchInterviews = async (search: string = "") => {
  let query = supabase
    .from('interviews')
    .select(`
      *,
      candidates ( full_name ),
      employees ( full_name )
    `)
    .order('interview_date', { ascending: false });
  if (search && search.trim() !== "") {
    query = query.or(
      `candidates.full_name.ilike.%${search.trim()}%,employees.full_name.ilike.%${search.trim()}%,location.ilike.%${search.trim()}%,type.ilike.%${search.trim()}%,status.ilike.%${search.trim()}%`
    );
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as InterviewWithRelations[];
};

export const useInterviews = (search: string = "") => {
  return useQuery<InterviewWithRelations[], Error>({
    queryKey: ['interviews', search],
    queryFn: () => fetchInterviews(search),
  });
};

// Hook for creating an interview
export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (interview: any) => {
      const { data, error } = await supabase.from('interviews').insert([interview]).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['interviews-total-count'] });
      toast({ title: 'Success', description: 'Interview scheduled successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Hook for updating an interview
export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any & { id: string }) => {
      const { data, error } = await supabase.from('interviews').update(updateData).eq('id', id).select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({ title: 'Success', description: 'Interview updated successfully.' });

      // Fetch candidate details and send email
      const interview = data?.[0];
      if (interview?.candidate_id) {
        const { data: candidate } = await supabase
          .from('candidates')
          .select('email, full_name')
          .eq('id', interview.candidate_id)
          .single();

        if (candidate?.email) {
          await sendInterviewUpdateEmail({
            to_email: candidate.email,
            to_name: candidate.full_name,
            interview_date: interview.interview_date,
            interview_link: interview.location,
            login_url: `${window.location.origin}/candidate-login`,
            company_name: 'TaskBotic AI Solutions',
          });
        }
      }
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Hook for deleting an interview
export const useDeleteInterview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('interviews').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast({ title: 'Success', description: 'Interview deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Hook to get the total count of interviews (ignores search/pagination)
export function useTotalInterviews() {
  return useQuery({
    queryKey: ["interviews-total-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("interviews")
        .select("*", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      return count || 0;
    },
  });
}
