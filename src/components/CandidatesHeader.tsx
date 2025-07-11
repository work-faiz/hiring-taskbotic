import React from "react";
import { Search, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidatesHeaderProps {
  search: string;
  setSearch: (s: string) => void;
  onBulk?: () => void;
  onAdd?: () => void;
}

export const CandidatesHeader: React.FC<CandidatesHeaderProps> = ({
  search,
  setSearch,
  onBulk,
  onAdd,
}) => {
  const handleAddClick = () => {
    console.log("CandidatesHeader: Add button clicked, calling onAdd");
    if (onAdd) {
      onAdd();
    } else {
      console.error("CandidatesHeader: onAdd function is not provided");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Candidates
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage and track candidate applications
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="search-input pl-10 w-full sm:w-64"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {onBulk && (
            <Button
              onClick={onBulk}
              variant="outline"
              className="action-button action-button-secondary h-10 px-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          )}
          {onAdd && (
            <Button
              onClick={handleAddClick}
              className="action-button action-button-primary h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};