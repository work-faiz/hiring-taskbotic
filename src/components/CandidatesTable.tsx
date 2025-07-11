import React, { useState } from "react";
import { Edit, Trash2, Mail, Phone, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  Applied: "status-applied",
  Shortlisted: "status-shortlisted",
  "Interview Scheduled": "status-interview-scheduled",
  Interviewed: "status-interviewed",
  "Offer Extended": "status-offer-extended",
  Hired: "status-hired",
  Rejected: "status-rejected",
};

interface Candidate {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  application_date: string;
  status: string;
  resume_url?: string;
}

interface CandidatesTableProps {
  candidates: Candidate[];
  isLoading: boolean;
  error: unknown;
  onDelete: (id: string) => void;
  deleteCandidateId: string | null;
  setDeleteCandidateId: (id: string | null) => void;
  onEdit: (candidate: Candidate) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkStatusChange?: (ids: string[], status: string) => void;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  isLoading,
  error,
  onDelete,
  deleteCandidateId,
  setDeleteCandidateId,
  onEdit,
  onBulkDelete,
  onBulkStatusChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = candidates.length > 0 && selectedIds.length === candidates.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(candidates.map(c => c.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.length > 0) {
      if (window.confirm(`Delete ${selectedIds.length} selected candidates? This cannot be undone.`)) {
        onBulkDelete(selectedIds);
        setSelectedIds([]);
      }
    }
  };
  const handleBulkStatusChange = (status: string) => {
    if (onBulkStatusChange && selectedIds.length > 0 && status) {
      onBulkStatusChange(selectedIds, status);
      setSelectedIds([]);
    }
  };

  if (isLoading) {
    return (
      <div className="professional-table">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="professional-table">
        <div className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">Error loading candidates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {selectedIds.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="action-button action-button-destructive h-8 px-3"
          >
            Delete Selected
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="action-button action-button-secondary h-8 px-3"
              >
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleBulkStatusChange("Applied")}>Applied</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange("Shortlisted")}>Shortlisted</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange("Interview Scheduled")}>Interview Scheduled</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange("Interviewed")}>Interviewed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange("Offer Extended")}>Offer Extended</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange("Hired")}>Hired</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkStatusChange("Rejected")}>Rejected</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block professional-table">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                  aria-label="Select all candidates"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                Applied
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                Resume
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  No candidates found.
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={() => toggleSelect(candidate.id)}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                      aria-label={`Select candidate ${candidate.full_name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {candidate.full_name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {candidate.email && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="w-4 h-4 mr-2" />
                          <a
                            href={`mailto:${candidate.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {candidate.email}
                          </a>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Phone className="w-4 h-4 mr-2" />
                          <a
                            href={`tel:${candidate.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {candidate.phone}
                          </a>
                        </div>
                      )}
                      {!candidate.email && !candidate.phone && (
                        <span className="text-sm text-slate-400">No contact info</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(candidate.application_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`status-badge ${STATUS_STYLES[candidate.status] || "status-applied"}`}>
                      {candidate.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {candidate.resume_url ? (
                      <a
                        href={candidate.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Resume
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400">No resume</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(candidate)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCandidateId(candidate.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-4">
        {candidates.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No candidates found.
          </div>
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="glass-card rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(candidate.id)}
                    onChange={() => toggleSelect(candidate.id)}
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      {candidate.full_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Applied {new Date(candidate.application_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={`status-badge ${STATUS_STYLES[candidate.status] || "status-applied"}`}>
                  {candidate.status}
                </Badge>
              </div>

              <div className="space-y-2">
                {candidate.email && (
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-primary transition-colors">
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-primary transition-colors">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.resume_url && (
                  <div className="flex items-center text-sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(candidate)}
                  className="action-button action-button-secondary h-8 px-3"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteCandidateId(candidate.id)}
                  className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCandidateId} onOpenChange={(open) => !open && setDeleteCandidateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this candidate? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCandidateId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCandidateId && onDelete(deleteCandidateId)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};