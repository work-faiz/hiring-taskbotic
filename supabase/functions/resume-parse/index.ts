import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Simple PDF text extraction using basic parsing
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(uint8Array);
    
    // Look for text between stream and endstream markers
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let extractedText = '';
    let match;
    
    while ((match = streamRegex.exec(text)) !== null) {
      const streamContent = match[1];
      // Remove binary data and extract readable text
      const readableText = streamContent
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ') // Keep only printable ASCII
        .replace(/\s+/g, ' ')
        .trim();
      
      if (readableText.length > 10) {
        extractedText += readableText + ' ';
      }
    }
    
    // Fallback: try to extract any readable text
    if (extractedText.length < 50) {
      extractedText = text
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    return extractedText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// DOCX text extraction
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Simple DOCX parsing - look for document.xml content
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(uint8Array);
    
    // Extract text between XML tags
    const xmlContent = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (xmlContent) {
      return xmlContent
        .map(match => match.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Fallback: extract any readable text
    return text
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Content-Type must be multipart/form-data" }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Missing resume file." }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    const arrayBuffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || "";
    const mimeType = file.type.toLowerCase();

    let extractedText = "";
    let typeRecognized = true;

    // Handle different file types
    if (fileExt === "pdf" || mimeType.includes("pdf")) {
      try {
        extractedText = await extractTextFromPDF(arrayBuffer);
      } catch (error) {
        console.error('PDF processing failed:', error);
        return new Response(
          JSON.stringify({ 
            error: `Failed to extract text from PDF: ${error.message}` 
          }), 
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else if (fileExt === "docx" || mimeType.includes("wordprocessingml")) {
      try {
        extractedText = await extractTextFromDocx(arrayBuffer);
      } catch (error) {
        console.error('DOCX processing failed:', error);
        return new Response(
          JSON.stringify({ 
            error: `Failed to extract text from DOCX: ${error.message}` 
          }), 
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else if (fileExt === "txt" || mimeType.includes("text/plain")) {
      extractedText = new TextDecoder().decode(arrayBuffer);
    } else {
      typeRecognized = false;
    }

    if (!typeRecognized) {
      return new Response(
        JSON.stringify({ 
          error: `Unsupported file type: ${fileExt}. Supported formats: PDF, DOCX, TXT` 
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Extracted text length: ${extractedText.length}`);

    if (!extractedText || extractedText.length < 20) {
      return new Response(
        JSON.stringify({ 
          error: "Could not extract sufficient text from resume. Please ensure the file contains readable text." 
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ 
          error: "Resume parsing service is not configured properly." 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare text for OpenAI (limit to prevent token overflow)
    const textForAnalysis = extractedText.slice(0, 4000);

    const prompt = `
Extract the candidate's personal information from this resume text and return ONLY a valid JSON object with these exact fields: full_name, email, phone.

Rules:
- If a field is not found, use null
- Return only the JSON object, no other text
- Ensure the JSON is properly formatted
- Extract only the candidate's information, ignore company details

Resume text:
${textForAnalysis}
`;

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Use the more cost-effective model
        messages: [
          { 
            role: "system", 
            content: "You are a precise resume parser. Return only valid JSON with the requested fields." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        max_tokens: 200,
        temperature: 0,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to process resume with AI service." 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response:', openAIData);

    let extractedData = {};
    
    try {
      const content = openAIData?.choices?.[0]?.message?.content?.trim() || "";
      if (!content) {
        throw new Error("Empty response from AI service");
      }

      // Clean up the response (remove code blocks if present)
      const cleanedContent = content
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      extractedData = JSON.parse(cleanedContent);
      
      // Validate the structure
      if (typeof extractedData !== 'object' || extractedData === null) {
        throw new Error("Invalid response format");
      }

    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content:', openAIData?.choices?.[0]?.message?.content);
      
      // Fallback: try basic regex extraction
      const emailMatch = extractedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      const phoneMatch = extractedText.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
      const nameMatch = extractedText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m);
      
      extractedData = {
        full_name: nameMatch ? nameMatch[1] : null,
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0] : null,
      };
    }

    console.log('Final extracted data:', extractedData);

    return new Response(
      JSON.stringify({ result: extractedData }), 
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Resume parsing error:", error);
    return new Response(
      JSON.stringify({ 
        error: `Resume parsing failed: ${error.message}` 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});