
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { extractCandidateDetails } from "@/utils/extractCandidateDetails";
import { supabase } from "@/integrations/supabase/client";

export interface ResumeUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onExtract: (fields: { full_name?: string; email?: string; phone?: string }) => void;
}

export function ResumeUploader({ value, onChange, onExtract }: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedResumeLoading, setParsedResumeLoading] = useState(false);
  const [parsedResumeError, setParsedResumeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setUploading(true);
    setUploadError(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("candidate-resumes")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });
    setUploading(false);

    if (error) {
      setUploadError("Failed to upload. " + error.message);
      return;
    }
    if (data) {
      const { data: urlData } = supabase
        .storage
        .from("candidate-resumes")
        .getPublicUrl(data.path);
      if (urlData?.publicUrl) onChange(urlData.publicUrl);
    }
  };

  const handleCustomFileBtnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleExtractFromResume = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setParsedResumeLoading(true);
    setParsedResumeError(null);
    if (!resumeFile) {
      setParsedResumeError("No resume file found.");
      setParsedResumeLoading(false);
      return;
    }
    try {
      const data = await extractCandidateDetails(resumeFile);
      onExtract({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
      });
    } catch (err: any) {
      setParsedResumeError("Unable to extract info from resume.");
    } finally {
      setParsedResumeLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="resume_url" className="text-white">Resume</Label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Button
          type="button"
          onClick={handleCustomFileBtnClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 font-medium"
          disabled={uploading}
        >
          <UploadCloud className="mr-1" size={18} />
          {uploading ? "Uploading..." : "Upload Resume"}
        </Button>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          ref={fileInputRef}
          id="resume_upload"
          name="resume_upload"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
          tabIndex={-1}
        />
        {value && (
          <a
            href={value}
            className="underline text-blue-600 text-sm truncate max-w-[160px]"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={0}
          >
            View Resume
          </a>
        )}
      </div>
      {/* Extract from Resume button AFTER file upload */}
      {resumeFile && (
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleExtractFromResume}
            disabled={parsedResumeLoading}
          >
            {parsedResumeLoading ? "Extracting..." : "Extract from Resume"}
          </Button>
          {parsedResumeError && (
            <span className="text-xs text-red-500">{parsedResumeError}</span>
          )}
        </div>
      )}
      {uploadError && <span className="block text-xs text-red-500">{uploadError}</span>}
      <Input
        id="resume_url"
        value={value || ""}
        placeholder="http:// or /uploads/..."
        className="mt-1 border-gray-300"
        readOnly
      />
    </div>
  );
}
