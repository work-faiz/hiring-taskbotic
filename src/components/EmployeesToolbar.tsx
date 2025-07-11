
import React from "react";
import { Plus, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeesToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  onAddEmployee: () => void;
}

const EmployeesToolbar: React.FC<EmployeesToolbarProps> = ({ search, setSearch, onAddEmployee }) => (
  <div className="flex flex-wrap items-center gap-4 mb-6">
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="bg-pink-600/90 rounded-lg p-2">
        <User className="text-white" size={22} />
      </span>
      <span className="text-xl font-semibold text-white/90">Employees</span>
    </div>
    <div className="flex flex-1 gap-4 items-center min-w-0">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-2.5 text-pink-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-black/40 border border-pink-300/40 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-pink-200 focus:outline-pink-400 w-full transition-all"
        />
      </div>
      <Button
        onClick={onAddEmployee}
        className="flex-shrink-0 bg-pink-500/80 hover:bg-pink-500 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-1 transition-all"
      >
        <Plus /> Add Employee
      </Button>
    </div>
  </div>
);

export default EmployeesToolbar;
