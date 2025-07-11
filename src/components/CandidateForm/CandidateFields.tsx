import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface CandidateFieldsProps {
  values: {
    full_name: string;
    email?: string;
    phone?: string;
    status?: string;
  };
  errors: Record<string, any>;
  onChange: (field: string, value: string) => void;
}

export function CandidateFields({ values, errors, onChange }: CandidateFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-white">Full Name</Label>
        <Input
          id="full_name"
          value={values.full_name ?? ""}
          onChange={e => onChange("full_name", e.target.value)}
          required
          pattern="^[A-Za-z' -]+$"
          minLength={2}
          maxLength={60}
          className="bg-black/40 border-pink-400/30 text-white"
        />
        {errors.full_name && (
          <span className="text-xs text-red-500">{errors.full_name.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email ?? ""}
          onChange={e => onChange("email", e.target.value)}
          className="bg-black/40 border-pink-400/30 text-white"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white">Phone</Label>
        <Input
          id="phone"
          value={values.phone ?? ""}
          onChange={e => onChange("phone", e.target.value)}
          pattern="^\+?\d{7,20}$"
          className="bg-black/40 border-pink-400/30 text-white"
        />
        {errors.phone && (
          <span className="text-xs text-red-500">{errors.phone.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="status" className="text-white">Status</Label>
        <select
          id="status"
          value={values.status ?? ""}
          onChange={e => onChange("status", e.target.value)}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white"
        >  
          <option value="">(default)</option>
          <option>Applied</option>
          <option>Shortlisted</option>
          <option>Interview Scheduled</option>
          <option>Interviewed</option>
          <option>Offer Extended</option>
          <option>Hired</option>
          <option>Rejected</option>
        </select>
      </div>
    </>
  );
}
