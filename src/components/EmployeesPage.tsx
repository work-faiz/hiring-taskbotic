import React, { useState, useMemo } from "react";
import { Plus, User, Search, Edit, Trash2 } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeForm, EmployeeFormValues } from "./EmployeeForm";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import GlassCard from "./GlassCard";
import EmployeesToolbar from "./EmployeesToolbar";
import EmployeesTable from "./EmployeesTable";

const EmployeesPage = ({ onCountChange }: { onCountChange?: (n: number) => void } = {}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const {
    employees,
    isLoading,
    error,
    addEmployee,
    editEmployee,
    deleteEmployee,
  } = useEmployees(search);

  const handleEdit = (employee: any) => {
    setEditData(employee);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    deleteEmployee.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "Employee deleted" });
        setDeleteId(null);
      },
      onError: (err: any) => {
        toast({
          title: "Error deleting employee",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleSubmit = (formData: EmployeeFormValues) => {
    const isEditing = !!editData;
    const payload = isEditing ? { ...formData, id: editData.id } : formData;

    const options = {
      onSuccess: () => {
        toast({
          title: `Employee ${isEditing ? "updated" : "added"}`,
          description: `Successfully ${isEditing ? "updated" : "added"} employee record.`,
        });
      },
      onError: (err: any) => {
        toast({
          title: `Error ${isEditing ? "updating" : "adding"} employee`,
          description: err.message,
          variant: "destructive",
        });
      },
    };

    if (isEditing) {
      editEmployee.mutate(payload as any, options);
    } else {
      addEmployee.mutate(payload as any, options);
    }
  };

  React.useEffect(() => {
    if (onCountChange && Array.isArray(employees)) {
      onCountChange(employees.length);
    }
  }, [employees, onCountChange]);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-3xl font-extrabold text-pink-400 drop-shadow-lg mb-6">
        Employee Directory
      </h2>
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="bg-pink-600/90 rounded-lg p-2">
              <User className="text-white" size={22} />
            </span>
            <span className="text-xl font-semibold text-white/90">Employees</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 gap-4 items-stretch sm:items-center min-w-0 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-2.5 text-pink-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, department..."
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
              <Plus /> Add Employee
            </Button>
          </div>
        </div>
        <EmployeesTable
          isLoading={isLoading}
          error={error}
          employees={Array.isArray(employees) ? employees : []}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteId(id)}
          onBulkDelete={async (ids: string[]) => {
            for (const id of ids) {
              await new Promise((resolve) => {
                deleteEmployee.mutate(id, {
                  onSettled: resolve,
                });
              });
            }
            toast({
              title: "Bulk delete complete",
              description: `${ids.length} employee(s) deleted.`,
            });
          }}
        />
      </GlassCard>

      <EmployeeForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditData(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editData}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this employee's record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeesPage;
