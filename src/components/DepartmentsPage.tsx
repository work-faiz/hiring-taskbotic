import React, { useState, useMemo } from "react";
import { useDepartments } from "@/hooks/useDepartments";
import { useEmployees } from "@/hooks/useEmployees";
import { DepartmentForm } from "./DepartmentForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Search, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-black/60 backdrop-blur-md shadow-lg border border-pink-500/20 p-6 mb-6">
      {children}
    </div>
  );
}

const DepartmentsPage = ({ onCountChange }: { onCountChange?: (n: number) => void } = {}) => {
  const { employees } = useEmployees();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { departments, isLoading, error, addDepartment, editDepartment, deleteDepartment } = useDepartments(search);

  const departmentEmployeeCounts = useMemo(() => {
    if (!employees) return {};
    return employees.reduce((acc, employee) => {
      if (employee.department) {
        acc[employee.department] = (acc[employee.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [employees]);

  const allSelected = departments && departments.length > 0 && selectedIds.length === departments.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(departments.map((d: any) => d.id));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      if (window.confirm(`Delete ${selectedIds.length} selected departments? This cannot be undone.`)) {
        selectedIds.forEach(id => handleDeleteConfirm(id));
        setSelectedIds([]);
      }
    }
  };

  const handleEdit = (dept: any) => {
    setEditData(dept);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async (id?: string) => {
    const deleteIdToUse = id || deleteId;
    if (!deleteIdToUse) return;
    deleteDepartment.mutate(deleteIdToUse, {
      onSuccess: () => {
        toast({ title: "Department deleted", description: "The department has been removed." });
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleSubmit = (data: any) => {
    const isEditing = !!editData;
    const payload = isEditing ? { ...data, id: editData.id } : data;
    
    const options = {
      onSuccess: () => {
        toast({ title: `Department ${isEditing ? 'updated' : 'added'}`, description: `Successfully ${isEditing ? 'updated' : 'added'} department.` });
        // The form closes itself now, and onOpenChange handles state updates.
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    };

    if (isEditing) {
      editDepartment.mutate(payload, options);
    } else {
      addDepartment.mutate(payload, options);
    }
  };

  React.useEffect(() => {
    if (onCountChange && Array.isArray(departments)) {
      onCountChange(departments.length);
    }
  }, [departments, onCountChange]);

  return (
    <div className="p-4 sm:p-6">
      {/* Main Directory Heading at the very top */}
      <h2 className="text-3xl font-extrabold text-pink-400 drop-shadow-lg mb-6">
        Departments
      </h2>
      <GlassCard>
        {/* Row with icon, "Departments" label, search bar, and add button */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-pink-600/90 rounded-lg p-2">
              <Building2 className="text-white" size={22} />
            </span>
            <span className="text-xl font-semibold text-white/90">Departments</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 gap-4 items-stretch sm:items-center min-w-0 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-2.5 text-pink-400" size={18} />
              <input
                type="text"
                placeholder="Search by department or head..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-black/40 border border-pink-300/40 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-pink-200 focus:outline-pink-400 w-full transition-all"
              />
            </div>
            <Button
              className="flex-shrink-0 bg-pink-500/80 hover:bg-pink-500 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-1 transition-all"
              onClick={() => {
                setEditData(null);
                setFormOpen(true);
              }}
            >
              <Plus /> Add Department
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
                <TableRow>
                  <TableHead className="px-2 py-2 text-left text-sm text-pink-100">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all departments"
                    />
                  </TableHead>
                  <TableHead className="text-pink-100">Department Name</TableHead>
                  <TableHead className="text-pink-100">Department Head</TableHead>
                  <TableHead className="text-pink-100">Employees</TableHead>
                  <TableHead className="text-right text-pink-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-pink-200 font-medium">
                      Loading departments...
                    </TableCell>
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-red-400 font-medium">
                      Error loading departments.
                    </TableCell>
                  </TableRow>
                )}
                {departments && departments.map((dept: any) => (
                  <TableRow key={dept.id}>
                    <TableCell className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(dept.id)}
                        onChange={() => toggleSelect(dept.id)}
                        aria-label={`Select department ${dept.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-white/90 font-semibold">{dept.name}</TableCell>
                    <TableCell className="text-white/80">{dept.department_head?.full_name || "-"}</TableCell>
                    <TableCell className="text-white/70">{departmentEmployeeCounts[dept.name] || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        className="text-pink-400 hover:bg-pink-500/10"
                        onClick={() => handleEdit(dept)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-400 hover:bg-red-500/10"
                        onClick={() => setDeleteId(dept.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Card List */}
          <div className="block sm:hidden">
            {isLoading && (
              <div className="text-center py-8 text-pink-200 font-medium">Loading departments...</div>
            )}
            {error && (
              <div className="text-center py-8 text-red-400 font-medium">Error loading departments.</div>
            )}
            {departments && departments.map((dept: any) => (
              <div key={dept.id} className="mb-4 rounded-xl bg-pink-900/30 border border-pink-400/20 p-4 shadow flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-lg">{dept.name}</div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold shadow bg-pink-600 text-white">
                    {departmentEmployeeCounts[dept.name] || 0} employees
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-white/80">
                  <div><span className="font-semibold">Department Head: </span>{dept.department_head?.full_name || "Not assigned"}</div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(dept)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(dept.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
      
      <DepartmentForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditData(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editData}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the department. Assign employees to another department first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteConfirm()} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentsPage;
