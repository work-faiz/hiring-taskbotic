import React from "react";
import { List, Search as SearchIcon, Package, Plus } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
      <div className="text-xl font-semibold text-white flex items-center">
        <List className="mr-2 text-pink-300" /> Candidates
      </div>
      <div className="flex-1 sm:flex-initial flex items-center gap-2">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search candidates..."
            className="w-full bg-black/70 border border-pink-400/40 rounded-lg py-2 pl-10 pr-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-pink-400/50"
          />
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-pink-300" size={18} />
        </div>
        {onAdd && (
          <button
            className="bg-pink-600/80 hover:bg-pink-700 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-1 transition-all"
            onClick={handleAddClick}
            title="Add Candidate"
            type="button"
          >
            <Plus className="mr-1" size={16} /> Add
          </button>
        )}
        {onBulk && (
          <button
            className="bg-purple-700/80 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-1 transition-all"
            onClick={onBulk}
            title="Bulk Import Candidates"
            type="button"
          >
            <Package className="mr-1" size={16} /> Bulk Upload
          </button>
        )}
      </div>
    </div>
  );
};
