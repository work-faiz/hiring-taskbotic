import React, { useState } from "react";
import { Edit, Trash } from "lucide-react";
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
const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-gray-500 text-white",
  Shortlisted: "bg-blue-500 text-white",
  "Interview Scheduled": "bg-yellow-500 text-white",
  Interviewed: "bg-indigo-500 text-white",
  "Offer Extended": "bg-teal-500 text-white",
  Hired: "bg-pink-500 text-white",
  Rejected: "bg-red-400 text-white",
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

  return (
    <div className="overflow-x-auto rounded-xl glass-table min-h-[220px]">
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <Button variant="destructive" onClick={handleBulkDelete}>
            Delete Selected ({selectedIds.length})
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="bg-pink-500/80 text-white hover:bg-pink-600">
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
      {isLoading ? (
        <div className="text-center py-10 text-pink-200">Loading...</div>
      ) : error ? (
        <div className="text-red-400 text-center py-10">
          Error loading candidates.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-pink-600/20">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left text-sm text-pink-100">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all candidates"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-pink-100">Name</th>
                  <th className="px-4 py-2 text-left text-sm text-pink-100">Contact</th>
                  <th className="px-4 py-2 text-left text-sm text-pink-100">Date</th>
                  <th className="px-4 py-2 text-left text-sm text-pink-100">Status</th>
                  <th className="px-4 py-2 text-left text-sm text-pink-100">Resume</th>
                  <th className="px-4 py-2 text-left text-sm text-pink-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(candidates) && candidates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-white/60">
                      No candidates found.
                    </td>
                  </tr>
                )}
                {Array.isArray(candidates) &&
                  candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-pink-200/5 transition-all group">
                      <td className="px-2 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          aria-label={`Select candidate ${c.full_name}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-white/90">
                        {c.full_name}
                      </td>
                      <td className="px-4 py-3 text-white/75">
                        <div className="flex flex-col gap-2">
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              className="inline-flex items-center text-pink-200 hover:text-pink-300 hover:underline transition-colors"
                              title={`Send email to ${c.email}`}
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {c.email}
                            </a>
                          )}
                          {c.phone && (
                            <a
                              href={`tel:${c.phone}`}
                              className="inline-flex items-center text-pink-200 hover:text-pink-300 hover:underline transition-colors"
                              title={`Call ${c.phone}`}
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              {c.phone}
                            </a>
                          )}
                          {!c.email && !c.phone && (
                            <span className="text-white/40 text-xs">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {c.application_date}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                            STATUS_COLORS[c.status] || "bg-gray-800 text-white"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.resume_url ? (
                          <a
                            href={c.resume_url}
                            className="inline-flex items-center text-pink-200 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Edit size={18} className="mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-white/40 text-xs">(No resume)</span>
                        )}
                      </td>
                      {/* Actions cell with both Edit & Delete */}
                      <td className="px-4 py-3 text-left min-w-[130px]">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(c)}>
                          <Edit className="h-4 w-4 text-pink-300" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCandidateId(c.id)}
                        >
                          <Trash className="h-4 w-4 text-red-400" />
                        </Button>
                        <AlertDialog open={deleteCandidateId === c.id} onOpenChange={(open) => setDeleteCandidateId(open ? c.id : null)}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete{" "}
                                <span className="font-bold">{c.full_name}</span>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel asChild>
                                <button
                                  className="px-4 py-2 rounded-lg border border-pink-300 text-pink-700 bg-transparent hover:bg-pink-50 transition-all"
                                  onClick={() => setDeleteCandidateId(null)}
                                >
                                  Cancel
                                </button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <button
                                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition-all"
                                  onClick={() => onDelete(c.id)}
                                >
                                  Delete
                                </button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Card List */}
          <div className="block sm:hidden">
            {Array.isArray(candidates) && candidates.length === 0 && (
              <div className="text-center py-6 text-white/60">No candidates found.</div>
            )}
            {Array.isArray(candidates) && candidates.map((c) => (
              <div key={c.id} className="mb-4 rounded-xl bg-pink-900/30 border border-pink-400/20 p-4 shadow flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-lg">{c.full_name}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${STATUS_COLORS[c.status] || "bg-gray-800 text-white"}`}>{c.status}</span>
                </div>
                <div className="flex flex-col gap-1 text-white/80">
                  <div><span className="font-semibold">Contact: </span>
                    <span className="flex flex-col gap-1">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="inline-flex items-center text-pink-200 hover:text-pink-300 hover:underline transition-colors" title={`Send email to ${c.email}`}>{c.email}</a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center text-pink-200 hover:text-pink-300 hover:underline transition-colors" title={`Call ${c.phone}`}>{c.phone}</a>
                      )}
                      {!c.email && !c.phone && (<span className="text-white/40 text-xs">No contact info</span>)}
                    </span>
                  </div>
                  <div><span className="font-semibold">Applied: </span>{c.application_date}</div>
                  <div><span className="font-semibold">Resume: </span>
                    {c.resume_url ? (
                      <a href={c.resume_url} className="text-pink-200 hover:underline" target="_blank" rel="noopener noreferrer">View Resume</a>
                    ) : (
                      <span className="text-white/40 text-xs">(No resume)</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" onClick={() => onEdit(c)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteCandidateId(c.id)}>Delete</Button>
                  <AlertDialog open={deleteCandidateId === c.id} onOpenChange={(open) => setDeleteCandidateId(open ? c.id : null)}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete{" "}
                          <span className="font-bold">{c.full_name}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <button
                            className="px-4 py-2 rounded-lg border border-pink-300 text-pink-700 bg-transparent hover:bg-pink-50 transition-all"
                            onClick={() => setDeleteCandidateId(null)}
                          >
                            Cancel
                          </button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <button
                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition-all"
                            onClick={() => onDelete(c.id)}
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
        </>
      )}
    </div>
  );
};
