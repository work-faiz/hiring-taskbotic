/**
 * Invokes the /resume-parse edge function, sending a resume file,
 * and returns structured details (full_name, email, phone)
 */
export async function extractCandidateDetails(resume: File): Promise<{ full_name?: string; email?: string; phone?: string }> {
  try {
    console.log('Starting resume extraction for file:', resume.name, 'Size:', resume.size);
    
    const formData = new FormData();
    formData.append("resume", resume);

    const response = await fetch(
      "https://xjqtgearnshqhcgqonxc.functions.supabase.co/resume-parse",
      {
        method: "POST",
        body: formData,
      }
    );

    console.log('Resume extraction response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resume extraction failed:', errorText);
      
      let errorMessage = "Resume extraction failed";
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If not JSON, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Resume extraction response data:', responseData);

    if (!responseData || !responseData.result) {
      throw new Error("Invalid response format from resume extraction service");
    }

    const result = responseData.result;

    // Validate the result structure
    if (typeof result !== 'object') {
      throw new Error("Invalid data format returned from extraction service");
    }

    // Check if there's an error in the result
    if (result.error) {
      throw new Error(result.error);
    }

    // Return the extracted data, ensuring we have the expected structure
    return {
      full_name: result.full_name || undefined,
      email: result.email || undefined,
      phone: result.phone || undefined,
    };

  } catch (error) {
    console.error('Resume extraction error:', error);
    
    // Re-throw with a more user-friendly message if needed
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred during resume extraction");
    }
  }
}