
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Import } from "lucide-react";
import { extractCandidateDetails } from "@/utils/extractCandidateDetails";
import { useToast } from "@/hooks/use-toast";

type ExtractedFields = {
  full_name?: string;
  email?: string;
  phone?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (fields: ExtractedFields) => void;
};

export const ResumeExtractAndAddDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fields, setFields] = useState<ExtractedFields>({});
  const [uploading, setUploading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setExtractError(null);
    setPdfFile(null);
    setFields({});
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setExtractError("Only PDF files are supported.");
      return;
    }
    setUploading(true);
    try {
      // Try/catch at this level to capture all errors
      const res = await extractCandidateDetails(file);

      // Defensive: Ensure res is an object
      if (!res || typeof res !== "object") {
        setExtractError("Resume parsing failed: Unexpected response from extraction service.");
        toast({
          title: "Extraction Failed",
          description: "Unexpected response from the extraction service.",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      // Defensive: If the backend sent 'error' in result, display that to user
      // (The edge function sometimes returns {error: string, ...})
      if ('error' in res && typeof res.error === "string") {
        setExtractError(`Extraction API error: ${res.error}`);
        toast({
          title: "Extraction Failed",
          description: res.error,
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      setFields({
        full_name: res.full_name ?? "",
        email: res.email ?? "",
        phone: res.phone ?? "",
      });
      setPdfFile(file);
    } catch (err: any) {
      // If err.message exists, show it; else generic msg
      let msg = "Failed to extract details from PDF.";
      if (err?.message) msg += " " + err.message;
      setExtractError(msg);
      toast({
        title: "Extraction Failed",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: keyof ExtractedFields, value: string) => {
    setFields(f => ({ ...f, [field]: value }));
  };

  const handleSave = () => {
    if (!fields.full_name) {
      setExtractError("Full name is required.");
      return;
    }
    onSubmit(fields);
    setFields({});
    setPdfFile(null);
    setExtractError(null);
    onOpenChange(false);
  };

  const handleDialogClose = () => {
    setFields({});
    setPdfFile(null);
    setExtractError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-md z-50" style={{ zIndex: 9999 }}>
        <DialogHeader>
          <DialogTitle>Extract from Resume (PDF)</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-fuchsia-700 text-white"
            >
              <UploadCloud className="mr-2" size={18} />
              {uploading ? "Extracting..." : "Upload PDF Resume"}
            </Button>
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              tabIndex={-1}
            />
            {pdfFile && (
              <span className="text-xs text-pink-200 ml-3">{pdfFile.name}</span>
            )}
          </div>
          {extractError && <span className="text-xs text-red-400">{extractError}</span>}
          <div>
            <label className="block text-xs text-pink-300 font-semibold mb-1">Full Name</label>
            <Input
              value={fields.full_name || ""}
              placeholder="Full name"
              onChange={e => handleInputChange("full_name", e.target.value)}
              className="bg-black/40 text-white"
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-xs text-pink-300 font-semibold mb-1">Email</label>
            <Input
              value={fields.email || ""}
              placeholder="Email address"
              onChange={e => handleInputChange("email", e.target.value)}
              className="bg-black/40 text-white"
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-xs text-pink-300 font-semibold mb-1">Phone</label>
            <Input
              value={fields.phone || ""}
              placeholder="Phone number"
              onChange={e => handleInputChange("phone", e.target.value)}
              className="bg-black/40 text-white"
              disabled={uploading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={uploading || !fields.full_name}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Import className="mr-2" size={18} />
            Add Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
