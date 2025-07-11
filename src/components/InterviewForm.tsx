import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCandidates } from '@/hooks/useCandidates';
import { useEmployees } from '@/hooks/useEmployees';
import { useCreateInterview, useUpdateInterview } from '@/hooks/useInterviews';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SimpleSearchBar } from "./SimpleSearchBar";

const interviewFormSchema = z.object({
  candidate_id: z.string().uuid('Please select a candidate.'),
  interviewer_id: z.string().uuid().optional().nullable(),
  interview_date: z.date(),
  type: z.string().min(1, 'Type is required'),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']),
  location: z.string().optional().nullable(),
  duration: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
});

type InterviewFormValues = z.infer<typeof interviewFormSchema>;

interface InterviewFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  interview?: Tables<'interviews'>;
}

const InterviewForm: React.FC<InterviewFormProps> = ({ isOpen, setIsOpen, interview }) => {
  const { candidates, isLoading: isLoadingCandidates } = useCandidates();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const createInterview = useCreateInterview();
  const updateInterview = useUpdateInterview();
  const [searchTerm, setSearchTerm] = React.useState("");
  const {
    candidates: searchedCandidates,
    isLoading: isSearchingCandidates,
  } = useCandidates(15, 0, searchTerm);

  const defaultValues = {
    candidate_id: '',
    interviewer_id: null,
    interview_date: new Date(),
    type: '',
    status: 'Scheduled' as const,
    location: '',
    duration: 60,
    notes: '',
    feedback: '',
  };

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: interview
      ? {
          ...interview,
          interview_date: new Date(interview.interview_date),
        }
      : defaultValues,
  });

  React.useEffect(() => {
    if (isOpen) {
      if (interview) {
        form.reset({
          ...interview,
          interview_date: new Date(interview.interview_date),
        });
      } else {
        form.reset(defaultValues);
      }
      setSearchTerm("");
    }
  }, [interview, isOpen, form]);

  const onSubmit = (values: InterviewFormValues) => {
    const payload = {
      ...values,
      interview_date: values.interview_date.toISOString(),
    };

    if (interview) {
      updateInterview.mutate({ id: interview.id, ...payload });
    } else {
      // Zod validation ensures these fields are present. This assertion helps TypeScript.
      createInterview.mutate(payload as TablesInsert<'interviews'>);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[525px] bg-black/70 backdrop-blur-xl border border-pink-500/30 text-gray-100 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "rgba(18, 18, 22, 0.9)",
          boxShadow: "0 6px 32px 0 rgba(90,0,100,0.45)",
          borderRadius: "1rem",
        }}
      >
        <DialogHeader>
          <DialogTitle>{interview ? 'Edit Interview' : 'Schedule Interview'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
            <FormField
              control={form.control}
              name="candidate_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate</FormLabel>
                  <div className="flex gap-2 items-center">
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCandidates}>
                      <FormControl>
                        <SelectTrigger className="!text-white focus:!text-white bg-black/60 border-pink-400/30">
                          <SelectValue placeholder="Select a candidate" className="!text-white placeholder:text-pink-200" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="!text-white bg-black/90 border-pink-400/30">
                        {/* Inline search input at the top of the dropdown */}
                        <div className="px-2 pt-2 pb-1 sticky top-0 bg-black/90 z-10">
                          <Input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search candidates by name or email..."
                            className="w-full px-3 py-2 text-sm bg-black/60 border border-pink-400/30 text-white placeholder:text-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400/50 rounded mb-2"
                            autoFocus
                          />
                        </div>
                        {/* Divider */}
                        <div className="border-b border-pink-400/20 my-1" />
                        {/* Show searched candidates if searchTerm, else show default candidates */}
                        {(searchTerm ? searchedCandidates : candidates)?.length > 0 ? (
                          (searchTerm ? searchedCandidates : candidates)?.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="!text-white data-[state=checked]:bg-pink-800/60">
                              {c.full_name}
                              {c.email && <span className="ml-2 text-xs text-pink-300">{c.email}</span>}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="text-pink-200 py-4 text-center text-sm">No candidates found.</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interviewer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interviewer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ''} disabled={isLoadingEmployees}>
                    <FormControl>
                      <SelectTrigger className="!text-white focus:!text-white bg-black/60 border-pink-400/30">
                        <SelectValue placeholder="Select an interviewer" className="!text-white placeholder:text-pink-200" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="!text-white bg-black/90 border-pink-400/30">
                      {employees?.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="!text-white data-[state=checked]:bg-pink-800/60">
                          {e.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interview_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Interview Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-black/60 border-pink-400/30 !text-white focus:!text-white",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-white" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black/90 border-pink-400/30" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="!text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Technical, HR" {...field} className="!text-white bg-black/60 border-pink-400/30 placeholder:text-pink-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="!text-white focus:!text-white bg-black/60 border-pink-400/30">
                        <SelectValue placeholder="Select status" className="!text-white placeholder:text-pink-200" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="!text-white bg-black/90 border-pink-400/30">
                      {['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'].map(status => (
                        <SelectItem key={status} value={status} className="!text-white data-[state=checked]:bg-pink-800/60">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Google Meet Link or Office Address" {...field} value={field.value || ''} className="!text-white bg-black/60 border-pink-400/30 placeholder:text-pink-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value || ''} className="!text-white bg-black/60 border-pink-400/30 placeholder:text-pink-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any notes for the interview" {...field} value={field.value || ''} className="!text-white bg-black/60 border-pink-400/30 placeholder:text-pink-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Interviewer feedback after completion" {...field} value={field.value || ''} className="!text-white bg-black/60 border-pink-400/30 placeholder:text-pink-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="destructive">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                {interview ? 'Save Changes' : 'Schedule Interview'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewForm;
