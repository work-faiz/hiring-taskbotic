import React, { useState, useMemo, useEffect } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { useToast } from "@/hooks/use-toast";
import { CandidatesHeader } from "./CandidatesHeader";
import { CandidatesTable } from "./CandidatesTable";
import { BulkCandidateUpload } from "./BulkCandidateUpload";
import { CandidateForm } from "./CandidateForm";
import { ResumeExtractAndAddDialog } from "./ResumeExtractAndAddDialog";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateInterview } from "@/hooks/useInterviews";
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 15;

const CandidatesPage = ({ onCountChange }: { onCountChange?: (n: number) => void } = {}) => {
  // Try to restore from localStorage
  const getInitialOffset = () => {
    const stored = localStorage.getItem("candidates_offset");
    return stored ? parseInt(stored, 10) : 0;
  };
  const getInitialAllCandidates = () => {
    const stored = localStorage.getItem("candidates_allCandidates");
    return stored ? JSON.parse(stored) : [];
  };
  const getInitialHasMore = () => {
    const stored = localStorage.getItem("candidates_hasMore");
    return stored ? JSON.parse(stored) : true;
  };

  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(getInitialOffset);
  const [allCandidates, setAllCandidates] = useState<any[]>(getInitialAllCandidates);
  const [hasMore, setHasMore] = useState(getInitialHasMore);
  const {
    candidates,
    isLoading,
    error,
    deleteCandidate,
    addCandidate,
    editCandidate,
    fetchMore,
    isFetching,
    refetch,
    bulkStatusChange,
  } = useCandidates(PAGE_SIZE, offset, search);

  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [extractDialogOpen, setExtractDialogOpen] = useState(false);
  const [editCandidateData, setEditCandidateData] = useState<any | null>(null);
  const { toast } = useToast();
  const createInterview = useCreateInterview();

  console.log("CandidatesPage rendering");
  console.log("Form open state:", formOpen);
  console.log("Add candidate mutation available:", !!addCandidate);

  React.useEffect(() => {
    if (onCountChange && Array.isArray(candidates)) {
      onCountChange(candidates.length);
    }
  }, [candidates, onCountChange]);

  // Accumulate loaded candidates
  useEffect(() => {
    if (candidates && candidates.length > 0) {
      setAllCandidates(prev => {
        // Avoid duplicates
        const ids = new Set(prev.map(c => c.id));
        return [...prev, ...candidates.filter(c => !ids.has(c.id))];
      });
      if (candidates.length < PAGE_SIZE) setHasMore(false);
      else setHasMore(true);
    } else if (offset === 0 && candidates && candidates.length === 0) {
      setAllCandidates([]);
      setHasMore(false);
    }
  }, [candidates, offset]);

  // Reset on search or bulk add
  useEffect(() => {
    setOffset(0);
    setAllCandidates([]);
    setHasMore(true);
    refetch();
  }, [search]);

  // Persist offset, allCandidates, and hasMore to localStorage
  useEffect(() => {
    localStorage.setItem("candidates_offset", String(offset));
  }, [offset]);
  useEffect(() => {
    localStorage.setItem("candidates_allCandidates", JSON.stringify(allCandidates));
  }, [allCandidates]);
  useEffect(() => {
    localStorage.setItem("candidates_hasMore", JSON.stringify(hasMore));
  }, [hasMore]);

  const handleDelete = async (id: string) => {
    deleteCandidate.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Candidate deleted",
          description: "The candidate entry has been successfully removed.",
        });
        setDeleteCandidateId(null);
      },
      onError: (err: any) => {
        toast({
          title: "Error deleting candidate",
          description: err?.message || "Failed to delete candidate.",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditCandidate = (candidate: any) => {
    console.log("handleEditCandidate called with:", candidate);
    setEditCandidateData(candidate);
    setFormOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    console.log("handleSubmit called with:", formData, "editData:", editCandidateData);
    const isEditing = !!editCandidateData;
    const payload = isEditing ? { ...formData, id: editCandidateData.id } : formData;

    const options = {
      onSuccess: async () => {
        toast({
          title: `Candidate ${isEditing ? "updated" : "added"}`,
          description: `Successfully ${isEditing ? "updated" : "added"} candidate record.`,
        });
        // If status is 'Interview Scheduled', create interview
        if (formData.status === "Interview Scheduled") {
          const candidateId = isEditing ? editCandidateData.id : (addCandidate.data?.id || null);
          if (candidateId) {
            // Check for existing interview for this candidate
            const { data: existingInterviews, error } = await supabase
              .from('interviews')
              .select('id')
              .eq('candidate_id', candidateId);
            if (!error && existingInterviews && existingInterviews.length === 0) {
              createInterview.mutate({
                candidate_id: candidateId,
                interview_date: new Date().toISOString(),
                type: "General",
                status: "Scheduled",
                location: null,
                duration: 60,
                notes: null,
                feedback: null,
                interviewer_id: null,
              });
            } else if (existingInterviews && existingInterviews.length > 0) {
              toast({
                title: 'Interview already scheduled',
                description: 'This candidate already has an interview scheduled.',
                variant: 'destructive',
              });
            }
          }
        }
      },
      onError: (err: any) => {
        toast({
          title: `Error ${isEditing ? "updating" : "adding"} candidate`,
          description: err?.message || `Failed to ${isEditing ? "update" : "add"} candidate.`,
          variant: "destructive",
        });
      },
    };

    if (isEditing) {
      editCandidate.mutate({ id: editCandidateData.id, ...formData }, options);
    } else {
      addCandidate.mutate(formData, options);
    }
  };

  const handleExtractSubmit = async (fields: { full_name?: string; email?: string; phone?: string }) => {
    if (!fields.full_name || fields.full_name.trim() === "") {
      toast({
        title: "Full Name Required",
        description: "The extracted resume did not include a full name. Please add it.",
        variant: "destructive"
      });
      return;
    }
    try {
      await addCandidate.mutateAsync({
        full_name: fields.full_name,
        email: fields.email,
        phone: fields.phone,
        application_date: new Date().toISOString().slice(0,10),
        status: "Applied",
      });
      toast({
        title: "Candidate added",
        description: "Candidate extracted from PDF has been added.",
      });
    } catch (err: any) {
      toast({
        title: "Error adding candidate",
        description: "Could not add candidate extracted from PDF.",
        variant: "destructive"
      });
    }
    setExtractDialogOpen(false);
  };

  const handleAddButtonClick = () => {
    console.log("CandidatesPage: Add button clicked, current state:", formOpen);
    console.log("CandidatesPage: Setting formOpen to true");
    setEditCandidateData(null);
    setFormOpen(true);
    console.log("CandidatesPage: State should now be true");
  };

  const handleFormOpenChange = (open: boolean) => {
    console.log("CandidatesPage: Form open change requested:", open);
    setFormOpen(open);
    if (!open) {
      console.log("CandidatesPage: Clearing edit data");
      setEditCandidateData(null);
    }
  };

  const handleLoadMore = async () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    // fetchMore will be triggered by useCandidates hook
  };

  return (
    <div className="space-y-6">
      {/* Header with Extract Resume Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CandidatesHeader
          search={search}
          setSearch={setSearch}
          onBulk={() => setBulkOpen(true)}
          onAdd={handleAddButtonClick}
        />
        <Button
          variant="outline"
          onClick={() => setExtractDialogOpen(true)}
          className="action-button action-button-secondary h-10 px-4 self-start sm:self-auto"
        >
          <FileSearch className="w-4 h-4 mr-2" />
          Extract from Resume
        </Button>
      </div>

      {/* Table */}
      <CandidatesTable
        candidates={Array.isArray(candidates) ? candidates : []}
        isLoading={isLoading && offset === 0}
        error={error}
        onDelete={handleDelete}
        deleteCandidateId={deleteCandidateId}
        setDeleteCandidateId={setDeleteCandidateId}
        onEdit={handleEditCandidate}
        onBulkDelete={async (ids: string[]) => {
          for (const id of ids) {
            await new Promise((resolve) => {
              deleteCandidate.mutate(id, {
                onSettled: resolve,
              });
            });
          }
        }}
        onBulkStatusChange={async (ids: string[], status: string) => {
          bulkStatusChange.mutate(
            { ids, status },
            {
              onSuccess: () => {
                toast({
                  title: "Status Updated",
                  description: `Status changed to '${status}' for ${ids.length} candidate(s).`,
                });
                setOffset(0);
                setAllCandidates([]);
                setHasMore(true);
                refetch();
              },
              onError: (err: any) => {
                toast({
                  title: "Error updating status",
                  description: err?.message || "Failed to update status.",
                  variant: "destructive",
                });
              },
            }
          );
          // Automatically create interview if status is 'Interview Scheduled'
          if (status === "Interview Scheduled") {
            for (const candidateId of ids) {
              // Check for existing interview for this candidate
              const { data: existingInterviews, error } = await supabase
                .from('interviews')
                .select('id')
                .eq('candidate_id', candidateId);
              if (!error && existingInterviews && existingInterviews.length === 0) {
                createInterview.mutate({
                  candidate_id: candidateId,
                  interview_date: new Date().toISOString(),
                  type: "General",
                  status: "Scheduled",
                  location: null,
                  duration: 60,
                  notes: null,
                  feedback: null,
                  interviewer_id: null,
                });
              } else if (existingInterviews && existingInterviews.length > 0) {
                toast({
                  title: 'Interview already scheduled',
                  description: 'This candidate already has an interview scheduled.',
                  variant: 'destructive',
                });
              }
            }
          }
        }}
      />

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isFetching}
            variant="outline"
            className="action-button action-button-secondary h-10 px-6"
          >
            {isFetching ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <BulkCandidateUpload open={bulkOpen} onOpenChange={setBulkOpen} />
      <CandidateForm 
        open={formOpen} 
        onOpenChange={handleFormOpenChange}
        onSubmit={handleSubmit}
        initialValues={editCandidateData || undefined}
      />
      <ResumeExtractAndAddDialog
        open={extractDialogOpen}
        onOpenChange={setExtractDialogOpen}
        onSubmit={handleExtractSubmit}
      />
    </div>
  );
};

export default CandidatesPage;