
/**
 * Invokes the /resume-parse edge function, sending a resume file,
 * and returns structured details (full_name, email, phone)
 */
export async function extractCandidateDetails(resume: File): Promise<{ full_name?: string; email?: string; phone?: string }> {
  const formData = new FormData();
  formData.append("resume", resume);

  const res = await fetch(
    "https://xjqtgearnshqhcgqonxc.functions.supabase.co/resume-parse",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) throw new Error("Resume extraction failed");
  const { result } = await res.json();
  return result;
}
