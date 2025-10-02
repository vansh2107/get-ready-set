import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentData, analysisType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (analysisType === "classify") {
      systemPrompt = "You are a document classification expert. Analyze the document details and suggest the most appropriate document type and category.";
      userPrompt = `Analyze this document and provide classification:
Name: ${documentData.name}
Current Type: ${documentData.document_type}
Issuing Authority: ${documentData.issuing_authority || 'Not specified'}
Notes: ${documentData.notes || 'None'}

Provide a JSON response with: suggestedType (license/passport/permit/insurance/certification/other), confidence (0-1), reasoning`;
    } else if (analysisType === "renewal_prediction") {
      systemPrompt = "You are a renewal prediction expert. Based on document history and patterns, predict optimal renewal timing.";
      userPrompt = `Analyze renewal patterns for this document:
Document: ${documentData.name}
Type: ${documentData.document_type}
Current Expiry: ${documentData.expiry_date}
Renewal Period: ${documentData.renewal_period_days} days
Historical Renewals: ${JSON.stringify(documentData.history || [])}

Provide JSON with: suggestedReminderDays (number), reasoning, urgencyLevel (low/medium/high)`;
    } else if (analysisType === "priority_scoring") {
      systemPrompt = "You are a document priority assessment expert. Score documents based on importance and urgency.";
      userPrompt = `Score this document's priority:
Name: ${documentData.name}
Type: ${documentData.document_type}
Days Until Expiry: ${documentData.daysUntilExpiry}
Issuing Authority: ${documentData.issuing_authority || 'Unknown'}

Provide JSON with: priorityScore (0-100), urgencyLevel (low/medium/high/critical), actionRecommendation`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_document",
            description: "Analyze document and provide structured insights",
            parameters: {
              type: "object",
              properties: analysisType === "classify" ? {
                suggestedType: { type: "string" },
                confidence: { type: "number" },
                reasoning: { type: "string" }
              } : analysisType === "renewal_prediction" ? {
                suggestedReminderDays: { type: "number" },
                reasoning: { type: "string" },
                urgencyLevel: { type: "string" }
              } : {
                priorityScore: { type: "number" },
                urgencyLevel: { type: "string" },
                actionRecommendation: { type: "string" }
              },
              required: analysisType === "classify" 
                ? ["suggestedType", "confidence", "reasoning"]
                : analysisType === "renewal_prediction"
                ? ["suggestedReminderDays", "reasoning", "urgencyLevel"]
                : ["priorityScore", "urgencyLevel", "actionRecommendation"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_document" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No analysis result from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-document-analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
