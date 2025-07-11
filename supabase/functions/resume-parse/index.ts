
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import Unzip and docx parser for DOCX extraction
import * as JSZip from "https://deno.land/x/jszip@0.11.0/mod.ts";
import { extractText } from "npm:unpdf@0.10.1";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PDF extraction is no longer supported due to missing dependency

// Minimal DOCX parser for text extraction
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const xml = await zip.file("word/document.xml")?.async("string");
    if (!xml) return "";
    // Remove tags to get text
    return xml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  } catch (e) {
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = await req.formData();
    const file = body.get("resume") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "Missing resume file." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || "";

    let extractedText = "";
    let typeRecognized = true;

    if (fileExt === "pdf") {
      try {
        // Use unpdf to extract text from PDF
        const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
        extractedText = text;
      } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to extract text from PDF: " + (e?.message || e) }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (fileExt === "docx") {
      extractedText = await extractTextFromDocx(arrayBuffer);
    } else if (fileExt === "txt") {
      extractedText = new TextDecoder().decode(arrayBuffer);
    } else {
      typeRecognized = false;
    }

    if (!typeRecognized) {
      return new Response(JSON.stringify({ error: "Unsupported file type. Only DOCX or TXT allowed (PDF temporarily unavailable)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!extractedText || extractedText.length < 50) {
      return new Response(JSON.stringify({ error: "Could not extract text from resume. Is it valid?" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compose OpenAI prompt for extracted text
    const prompt = `
You are a very accurate resume parser. Extract the candidate details from the following resume TEXT and return them as a compact JSON object with these fields: full_name, email, phone.
If any field is missing, use null.
Ignore all cover letter content and job descriptions, only extract the applicant's details.

Resume text:
${extractedText.slice(0, 6000) /* prevent runaway context */}
`;

    // Call OpenAI (gpt-4o)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant for extracting candidate details from resumes." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0,
      }),
    });

    const data = await response.json();
    console.log("OpenAI raw response:", data);
    let extracted = {};
    try {
      let text = data?.choices?.[0]?.message?.content?.trim() || "";
      if (!text) throw new Error("OpenAI returned empty content");
      text = text.replace(/^```json/, "").replace(/```$/, "").trim();
      extracted = JSON.parse(text);
    } catch (e) {
      extracted = { error: "Failed to parse OpenAI response", raw: data?.choices?.[0]?.message?.content || "" };
    }

    return new Response(JSON.stringify({ result: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Resume Parse Error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
