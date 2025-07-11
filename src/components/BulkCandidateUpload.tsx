import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCandidates } from "@/hooks/useCandidates";
import { useToast } from "@/hooks/use-toast";

type CandidateRow = {
  full_name: string;
  email?: string;
  phone?: string;
  application_date?: string;
  status?: string;
  resume_url?: string;
};

export const BulkCandidateUpload: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<CandidateRow[]>([]);
  const [importing, setImporting] = useState(false);
  const { addCandidate } = useCandidates();
  const { toast } = useToast();
  const [importedCount, setImportedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  console.log("BulkCandidateUpload rendering with open:", open);
  console.log("BulkCandidateUpload: addCandidate mutation available:", !!addCandidate);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log("File selected:", file.name);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("CSV parsing complete:", results);
        // Convert date format from DD-MM-YYYY to YYYY-MM-DD for database compatibility
        const validRows = (results.data as CandidateRow[]).map((row) => {
          let applicationDate = row.application_date || new Date().toISOString().slice(0, 10);
          
          // Check if date is in DD-MM-YYYY format and convert to YYYY-MM-DD
          if (applicationDate && applicationDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
            const [day, month, year] = applicationDate.split('-');
            applicationDate = `${year}-${month}-${day}`;
          }
          
          return {
            ...row,
            status: row.status || "Applied",
            application_date: applicationDate,
          };
        }).filter((row) => row.full_name);
        
        console.log("Valid rows after filtering:", validRows);
        setParsedData(validRows);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "Failed to parse file",
          description: "Please upload a valid CSV file.",
          variant: "destructive"
        });
      }
    });
  };

  const handleImportAll = async () => {
    console.log("Starting bulk import with", parsedData.length, "candidates");
    setImporting(true);
    let count = 0;
    let errors = 0;
    setImportedCount(0);
    setErrorCount(0);
    
    for (const candidate of parsedData) {
      try {
        console.log("Importing candidate:", candidate);
        await addCandidate.mutateAsync(candidate);
        count++;
        setImportedCount((prev) => prev + 1);
        console.log("Successfully imported candidate:", candidate.full_name);
      } catch (err: any) {
        console.error("Failed to import candidate:", candidate.full_name, err);
        errors++;
        setErrorCount((prev) => prev + 1);
      }
    }
    
    console.log("Bulk import complete. Success:", count, "Errors:", errors);
    setImporting(false);
    setParsedData([]);
    setImportedCount(0);
    setErrorCount(0);
    onOpenChange(false);
    
    if (count > 0) {
      toast({
        title: "Bulk Import Complete",
        description: `Successfully imported ${count} candidate${count !== 1 ? "s" : ""}${errors > 0 ? `. ${errors} failed.` : "."}`,
      });
    } else {
      toast({
        title: "Import Failed",
        description: "No candidates were imported. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const handleDialogClose = () => {
    console.log("Closing bulk upload dialog");
    setParsedData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-xl z-50" style={{ zIndex: 9999 }}>
        <DialogHeader>
          <DialogTitle>Bulk Import Candidates</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="text-white"
          />
          <div className="text-sm text-muted-foreground">
            CSV columns: <b>full_name</b>, email, phone, application_date, status, resume_url.<br />
            Only rows with <b>full_name</b> will be imported.<br />
            Date format should be YYYY-MM-DD or DD-MM-YYYY.<br />
            <a
              className="text-pink-400 underline"
              href="/sample-candidates.csv"
              download
              target="_blank" rel="noopener noreferrer"
            >Download sample CSV</a>
          </div>
          {parsedData.length > 0 && (
            <div className="border rounded-lg bg-black/20 text-pink-200 max-h-48 overflow-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-1 font-bold">Name</th>
                    <th className="p-1">Email</th>
                    <th className="p-1">Phone</th>
                    <th className="p-1">Date</th>
                    <th className="p-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, idx) => (
                    <tr key={idx} className="odd:bg-pink-900/10">
                      <td className="p-1">{row.full_name}</td>
                      <td className="p-1">{row.email}</td>
                      <td className="p-1">{row.phone}</td>
                      <td className="p-1">{row.application_date}</td>
                      <td className="p-1">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <DialogFooter>
          {importing && (
            <div className="w-full text-center text-pink-300 font-semibold mb-2">
              Importing {importedCount + errorCount} of {parsedData.length}...<br />
              Success: {importedCount} &nbsp; | &nbsp; Errors: {errorCount}
            </div>
          )}
          <Button variant="outline" onClick={handleDialogClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImportAll}
            disabled={parsedData.length === 0 || importing}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            {importing ? "Importing..." : `Import ${parsedData.length} Candidate${parsedData.length !== 1 ? "s" : ""}`} 
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
