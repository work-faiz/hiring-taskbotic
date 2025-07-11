import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
  email: string;
  phone: string;
  department: string;
  job_title: string;
  date_of_joining: string;
  employment_status: string;
}

interface EmployeesTableProps {
  isLoading: boolean;
  error: any;
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({
  isLoading,
  error,
  employees,
  onEdit,
  onDelete,
  onBulkDelete,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = employees.length > 0 && selectedIds.length === employees.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(employees.map(e => e.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.length > 0) {
      if (window.confirm(`Delete ${selectedIds.length} selected employees? This cannot be undone.`)) {
        onBulkDelete(selectedIds);
        setSelectedIds([]);
      }
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl glass-table">
      {selectedIds.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <Button variant="destructive" onClick={handleBulkDelete}>
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}
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
                  aria-label="Select all employees"
                />
              </th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Name</th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Employee ID</th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Contact</th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Department</th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Job Title</th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Joined</th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Status</th>
              <th className="px-4 py-2 text-left text-sm text-pink-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-pink-200 font-medium">
                  Loading employees...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-red-400 font-medium">
                  Error fetching employees.
                </td>
              </tr>
            )}
            {!isLoading &&
              !error &&
              (!employees || employees.length === 0) && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-pink-200 font-medium">
                    No employees found.
                  </td>
                </tr>
              )}
            {!isLoading &&
              employees &&
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-pink-200/5 transition-all">
                  <td className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                      aria-label={`Select employee ${emp.full_name}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-white/90">{emp.full_name}</td>
                  <td className="px-4 py-3 text-white/85">{emp.employee_id}</td>
                  <td className="px-4 py-3 text-white/75">
                    <div>
                      <span>{emp.email}</span>
                      <br />
                      <span className="text-xs text-white/50">{emp.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{emp.department}</td>
                  <td className="px-4 py-3 text-white/70">{emp.job_title}</td>
                  <td className="px-4 py-3 text-white/70">{emp.date_of_joining}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                        emp.employment_status === "Active"
                          ? "bg-green-600 text-white"
                          : emp.employment_status === "On Leave"
                          ? "bg-yellow-400 text-black"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {emp.employment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(emp)}>
                      <Edit className="h-4 w-4 text-pink-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(emp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card List */}
      <div className="block sm:hidden">
        {isLoading && (
          <div className="text-center py-8 text-pink-200 font-medium">Loading employees...</div>
        )}
        {error && (
          <div className="text-center py-8 text-red-400 font-medium">Error fetching employees.</div>
        )}
        {!isLoading && !error && (!employees || employees.length === 0) && (
          <div className="text-center py-8 text-pink-200 font-medium">No employees found.</div>
        )}
        {!isLoading && employees && employees.map((emp) => (
          <div key={emp.id} className="mb-4 rounded-xl bg-pink-900/30 border border-pink-400/20 p-4 shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-lg">{emp.full_name}</div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                  emp.employment_status === "Active"
                    ? "bg-green-600 text-white"
                    : emp.employment_status === "On Leave"
                    ? "bg-yellow-400 text-black"
                    : "bg-red-500 text-white"
                }`}
              >
                {emp.employment_status}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-white/80">
              <div><span className="font-semibold">Employee ID: </span>{emp.employee_id}</div>
              <div><span className="font-semibold">Contact: </span>
                <span className="flex flex-col gap-1">
                  <a href={`mailto:${emp.email}`} className="text-pink-200 hover:text-pink-300 hover:underline transition-colors">{emp.email}</a>
                  <a href={`tel:${emp.phone}`} className="text-pink-200 hover:text-pink-300 hover:underline transition-colors">{emp.phone}</a>
                </span>
              </div>
              <div><span className="font-semibold">Department: </span>{emp.department}</div>
              <div><span className="font-semibold">Job Title: </span>{emp.job_title}</div>
              <div><span className="font-semibold">Joined: </span>{emp.date_of_joining}</div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="secondary" onClick={() => onEdit(emp)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(emp.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesTable;
