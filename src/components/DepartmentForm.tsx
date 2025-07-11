
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters."),
  department_head_id: z.string().nullable().optional().transform(val => val === 'none' ? null : val),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export function DepartmentForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: DepartmentFormValues) => void;
  initialValues?: Partial<DepartmentFormValues> & { id?: string; department_head_id?: string | null };
}) {
  const { employees } = useEmployees();
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues || { name: '', department_head_id: null });
    }
  }, [open, initialValues, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md z-50 bg-black/70 backdrop-blur-xl border border-pink-500/30"
        style={{
          backgroundColor: "rgba(18, 18, 22, 0.9)",
          boxShadow: "0 6px 32px 0 rgba(90,0,100,0.45)",
          borderRadius: "1rem",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-pink-300">{initialValues?.id ? "Edit Department" : "Add Department"}</DialogTitle>
          <DialogDescription className="text-white/80">
            {initialValues?.id ? "Update the department name and head." : "Create a new department."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => {
            onSubmit(data);
            onOpenChange(false);
          })}
          className="space-y-4 py-2"
        >
          <div>
            <Label htmlFor="name" className="text-white">Department Name</Label>
            <Input
              id="name"
              {...register("name")}
              className="bg-black/40 border-pink-400/30 text-white"
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="department_head_id" className="text-white">Department Head</Label>
            <Controller
              name="department_head_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? 'none'}>
                  <SelectTrigger className="bg-black/40 border-pink-400/30 text-white">
                    <SelectValue placeholder="Select a department head" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 text-white z-[1001]">
                    <SelectItem value="none">
                      None
                    </SelectItem>
                    {employees?.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department_head_id && <p className="text-destructive text-sm mt-1">{errors.department_head_id.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
