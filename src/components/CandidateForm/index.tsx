import React, { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ResumeUploader } from "./ResumeUploader";
import { CandidateFields } from "./CandidateFields";
import { ApplicationDatePicker } from "./ApplicationDatePicker";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const candidateFormSchema = z.object({
  full_name: z.string().min(1, { message: "Full name is required." }),
  email: z.union([z.string().email({ message: "Invalid email address." }), z.literal("")]).optional(),
  phone: z.string().optional(),
  resume_url: z.union([z.string().url({ message: "Invalid URL." }), z.literal("")]).optional(),
  application_date: z.string().optional(),
  status: z.string().optional(),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

// Default application_date to today for new candidates
  const todayIso = format(new Date(), "yyyy-MM-dd");
  const defaultFormValues = {
    full_name: "",
    email: "",
    phone: "",
    resume_url: "",
    application_date: todayIso,
    status: "Applied",
  };
  
export function CandidateForm({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: CandidateFormValues) => void;
  initialValues?: Partial<CandidateFormValues>;
}) {
  console.log("CandidateForm rendering, open:", open);

  const { handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: defaultFormValues,
  });

  // Reset form when modal opens/closes or initialValues change
  useEffect(() => {
    console.log("CandidateForm useEffect - open changed:", open, "initialValues:", initialValues);
    if (open) {
      const formValues = initialValues ? { ...defaultFormValues, ...initialValues } : defaultFormValues;
      console.log("Form is opening, resetting form with values:", formValues);
      reset(formValues);
    }
  }, [open, initialValues, reset, defaultFormValues]);

  const applicationDate = watch("application_date");
  const values = {
    full_name: watch("full_name") ?? "",
    email: watch("email") ?? "",
    phone: watch("phone") ?? "",
    status: watch("status") ?? "",
    resume_url: watch("resume_url") ?? "",
  };

  // Handler for updating individual fields
  const handleFieldChange = (field: keyof CandidateFormValues, value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  const handleFormSubmit = (data: CandidateFormValues) => {
    console.log("CandidateForm handleFormSubmit called with:", data);
    onSubmit(data);
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md z-50 bg-black/70 backdrop-blur-xl border border-pink-500/30 max-h-[80vh] overflow-y-auto"
      style={{
        backgroundColor: "rgba(18, 18, 22, 0.9)",
        boxShadow: "0 6px 32px 0 rgba(90,0,100,0.45)",
        borderRadius: "1rem",
      }}
      >
        <DialogHeader>
          <DialogTitle className="text-pink-300">
            {initialValues ? "Edit Candidate" : "Add Candidate"}
          </DialogTitle>
          <DialogDescription className="text-white/80">
            Add or edit candidate profile details.
          </DialogDescription>
        </DialogHeader>
        
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          <CandidateFields
            values={values}
            errors={errors}
            onChange={handleFieldChange}
          />
          <ResumeUploader
            value={values.resume_url}
            onChange={url => setValue("resume_url", url, { shouldValidate: true })}
            onExtract={fields => {
              if (fields.full_name) setValue("full_name", fields.full_name, { shouldValidate: true });
              if (fields.email) setValue("email", fields.email, { shouldValidate: true });
              if (fields.phone) setValue("phone", fields.phone, { shouldValidate: true });
            }}
          />
          <ApplicationDatePicker
            value={applicationDate}
            onChange={date => setValue("application_date", date, { shouldValidate: true })}
          />
          <DialogFooter>
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
              Save Candidate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
