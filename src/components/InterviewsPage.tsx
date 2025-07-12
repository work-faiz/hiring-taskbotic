import React, { useState, useEffect } from 'react';
import { useInterviews, useDeleteInterview, InterviewWithRelations } from '@/hooks/useInterviews';
import { useCandidates } from '@/hooks/useCandidates';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Link, Search, MessageSquareDashed } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import InterviewForm from './InterviewForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link as RouterLink } from "react-router-dom";

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/60 backdrop-blur-md shadow-lg border border-pink-500/20 p-6 mb-6">
      {children}
    </div>
  );
}

const InterviewsPage = ({ onCountChange }: { onCountChange?: (n: number) => void } = {}) => {
  const [search, setSearch] = useState("");
  const { data: interviews, isLoading } = useInterviews(search);
  const deleteInterview = useDeleteInterview();
  const { editCandidate } = useCandidates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<any | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const allSelected = interviews && interviews.length > 0 && selectedIds.length === interviews.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(interviews.map((i: any) => i.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      if (window.confirm(`Delete ${selectedIds.length} selected interviews? This cannot be undone.`)) {
        selectedIds.forEach(id => handleDelete(id));
        setSelectedIds([]);
      }
    }
  };

  const handleEdit = (interview: any) => {
    setSelectedInterview(interview);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedInterview(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const interview = interviews.find((i: any) => i.id === id);
    if (interview && interview.candidate_id) {
      editCandidate.mutate({ id: interview.candidate_id, status: 'Rejected' });
    }
    deleteInterview.mutate(id);
  };

  useEffect(() => {
    if (onCountChange && Array.isArray(interviews)) {
      onCountChange(interviews.length);
    }
  }, [interviews, onCountChange]);

  if (isLoading) {
    return <div className="p-6 text-white">Loading interviews...</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Main Directory Heading at the very top */}
      <h2 className="text-3xl font-extrabold text-pink-400 drop-shadow-lg mb-6">
        Interviews
      </h2>
      <GlassCard>
        {/* Row with icon, "Interviews" label, search bar, and add button */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-pink-600/90 rounded-lg p-2">
              <MessageSquareDashed className="text-white" size={22} />
            </span>
            <span className="text-xl font-semibold text-white/90">Interviews</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 gap-4 items-stretch sm:items-center min-w-0 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-2.5 text-pink-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, interviewer, location..."
                className="bg-black/40 border border-pink-300/40 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-pink-200 focus:outline-pink-400 w-full transition-all"
              />
            </div>
            <Button
              onClick={handleAddNew}
              className="flex-shrink-0 bg-pink-500/80 hover:bg-pink-500 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-1 transition-all"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Interview
            </Button>
          </div>
        </div>

        {/* Bulk Delete Button */}
        {selectedIds.length > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected ({selectedIds.length})
            </Button>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl glass-table">
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="border-pink-300/20 hover:bg-white/10">
                  <TableHead className="px-2 py-2 text-left text-sm text-white">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all interviews"
                    />
                  </TableHead>
                  <TableHead className="text-white">Candidate</TableHead>
                  <TableHead className="text-white">Interviewer</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Time</TableHead>
                  <TableHead className="text-white">Location</TableHead>
                  <TableHead className="text-white">Type</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-200">Loading interviews...</TableCell>
                  </TableRow>
                )}
                {interviews && interviews.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-200">No interviews found.</TableCell>
                  </TableRow>
                )}
                {interviews && interviews.map((interview: any) => (
                  <TableRow key={interview.id} className="border-pink-300/20 hover:bg-white/10">
                    <TableCell className="px-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(interview.id)}
                        onChange={() => toggleSelect(interview.id)}
                        aria-label={`Select interview ${interview.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-white">{
                      interview.candidates?.full_name ? (
                        <span style={{ display: "inline-block", width: "100%" }}>
                          <RouterLink
                            to={`/candidate_view?id=${interview.candidate_id}`}
                            className="text-pink-300 hover:underline hover:text-pink-400 transition-colors"
                            role="link"
                            tabIndex={0}
                            style={{ cursor: "pointer" }}
                            onClick={e => e.stopPropagation()}
                          >
                            {interview.candidates.full_name}
                          </RouterLink>
                        </span>
                      ) : 'N/A'
                    }</TableCell>
                    <TableCell className="text-white">{interview.employees?.full_name || 'N/A'}</TableCell>
                    <TableCell className="text-white">{format(new Date(interview.interview_date), 'PP')}</TableCell>
                    <TableCell className="text-white">{new Date(interview.interview_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell className="text-white">
                      {interview.location && (interview.location.startsWith('http://') || interview.location.startsWith('https://')) ? (
                        <Button asChild variant="outline" size="sm" className="border-pink-400 text-pink-400 hover:bg-pink-500 hover:text-white">
                          <a
                            href={interview.location}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Link />
                            Join
                          </a>
                        </Button>
                      ) : (
                        interview.location || 'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-white">{interview.type}</TableCell>
                    <TableCell className="text-white">{interview.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(interview)}>
                        <Edit className="h-4 w-4 text-pink-300" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialogId(interview.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                      <AlertDialog open={deleteDialogId === interview.id} onOpenChange={(open) => setDeleteDialogId(open ? interview.id : null)}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Interview?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete this interview? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                              <button
                                className="px-4 py-2 rounded-lg border border-pink-300 text-pink-700 bg-transparent hover:bg-pink-50 transition-all"
                                onClick={() => setDeleteDialogId(null)}
                              >
                                Cancel
                              </button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <button
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition-all"
                                onClick={() => { handleDelete(interview.id); setDeleteDialogId(null); }}
                              >
                                Delete
                              </button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Card List */}
          <div className="block sm:hidden">
            {isLoading && (
              <div className="text-center py-8 text-gray-200">Loading interviews...</div>
            )}
            {interviews && interviews.length === 0 && (
              <div className="text-center py-8 text-gray-200">No interviews found.</div>
            )}
            {interviews && interviews.map((interview: any) => (
              <div key={interview.id} className="mb-4 rounded-xl bg-pink-900/30 border border-pink-400/20 p-4 shadow flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-lg">{interview.candidates?.full_name || 'N/A'}</div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold shadow bg-pink-600 text-white">
                    {interview.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-white/80">
                  <div><span className="font-semibold">Interviewer: </span>{interview.employees?.full_name || 'N/A'}</div>
                  <div><span className="font-semibold">Date: </span>{format(new Date(interview.interview_date), 'PP')}</div>
                  <div><span className="font-semibold">Type: </span>{interview.type}</div>
                  <div><span className="font-semibold">Location: </span>
                    {interview.location && (interview.location.startsWith('http://') || interview.location.startsWith('https://')) ? (
                      <Button asChild variant="outline" size="sm" className="border-pink-400 text-pink-400 hover:bg-pink-500 hover:text-white">
                        <a
                          href={interview.location}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Link className="mr-1 h-3 w-3" />
                          Join Meeting
                        </a>
                      </Button>
                    ) : (
                      interview.location || 'N/A'
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(interview)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteDialogId(interview.id)}>Delete</Button>
                  <AlertDialog open={deleteDialogId === interview.id} onOpenChange={(open) => setDeleteDialogId(open ? interview.id : null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Interview?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete this interview? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <button
                            className="px-4 py-2 rounded-lg border border-pink-300 text-pink-700 bg-transparent hover:bg-pink-50 transition-all"
                            onClick={() => setDeleteDialogId(null)}
                          >
                            Cancel
                          </button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <button
                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition-all"
                            onClick={() => { handleDelete(interview.id); setDeleteDialogId(null); }}
                          >
                            Delete
                          </button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <InterviewForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        interview={selectedInterview}
      />
    </div>
  );
};

export default InterviewsPage;
