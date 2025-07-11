
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDepartments } from "@/hooks/useDepartments";
import { format, parseISO } from "date-fns";

const employeeSchema = z.object({
  full_name: z.string().min(2, "Full name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  employee_id: z.string().min(1, "Employee ID is required."),
  department: z.string().optional(),
  manager: z.string().optional(),
  job_title: z.string().optional(),
  date_of_joining: z.string().min(1, "Date of joining is required."),
  employment_status: z.string().optional().default("Active"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export function EmployeeForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: EmployeeFormValues) => void;
  initialValues?: Partial<EmployeeFormValues> & { id?: string };
}) {
  const { departments } = useDepartments();
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
  });

  useEffect(() => {
    if (open) {
      const defaultValues = initialValues 
        ? { ...initialValues, date_of_joining: initialValues.date_of_joining ? format(parseISO(initialValues.date_of_joining), 'yyyy-MM-dd') : '' } 
        : { date_of_joining: format(new Date(), 'yyyy-MM-dd'), employment_status: 'Active' };
      reset(defaultValues as any);
    }
  }, [open, initialValues, reset]);
  
  const handleFormSubmit = (data: EmployeeFormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

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
          <DialogTitle className="text-pink-300">{initialValues ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription className="text-white/80">
            {initialValues ? "Update employee details." : "Add a new employee to the directory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name" className="text-white">Full Name</Label>
              <Input id="full_name" {...register("full_name")} className="bg-black/40 border-pink-400/30 text-white" />
              {errors.full_name && <p className="text-destructive text-sm mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="employee_id" className="text-white">Employee ID</Label>
              <Input id="employee_id" {...register("employee_id")} className="bg-black/40 border-pink-400/30 text-white" />
              {errors.employee_id && <p className="text-destructive text-sm mt-1">{errors.employee_id.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input id="email" type="email" {...register("email")} className="bg-black/40 border-pink-400/30 text-white" />
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone" className="text-white">Phone</Label>
            <Input id="phone" {...register("phone")} className="bg-black/40 border-pink-400/30 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job_title" className="text-white">Job Title</Label>
              <Input id="job_title" {...register("job_title")} className="bg-black/40 border-pink-400/30 text-white" />
            </div>
            <div>
              <Label htmlFor="department" className="text-white">Department</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-black/40 border-pink-400/30 text-white">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 text-white z-[1001]">
                      {departments?.map(d => (
                        <SelectItem
                          key={d.id}
                          value={d.name}
                        >
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manager" className="text-white">Manager</Label>
              <Input id="manager" {...register("manager")} className="bg-black/40 border-pink-400/30 text-white" />
            </div>
            <div>
              <Label htmlFor="date_of_joining" className="text-white">Date of Joining</Label>
              <Input id="date_of_joining" type="date" {...register("date_of_joining")} className="bg-black/40 border-pink-400/30 text-white" />
              {errors.date_of_joining && <p className="text-destructive text-sm mt-1">{errors.date_of_joining.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="employment_status" className="text-white">Status</Label>
            <Controller
              name="employment_status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value ?? "Active"}>
                  <SelectTrigger className="bg-black/40 border-pink-400/30 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 text-white z-[1001]">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
              Save Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
