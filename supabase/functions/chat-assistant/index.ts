import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Joseph Maina's AI portfolio assistant, embedded inside a lead-qualifying chat widget on his site. Joseph is a Digital Marketing Specialist based in Nairobi, Kenya.

Services & pricing (Kenyan Shillings, monthly retainer + ad spend where noted):
- Meta Ads: KES 35,000/mo + ad spend — Facebook & Instagram campaigns: creative, targeting, retargeting, A/B testing.
- Google Ads: KES 40,000/mo + ad spend — Search, Performance Max & YouTube: keyword strategy, conversion tracking, weekly optimization.
- Social Media Management: KES 45,000/mo — strategy, content calendar, posting, community management, monthly reporting across 3–4 platforms.
- SEO & Content: KES 30,000/mo — keyword research, on-page SEO, technical audits, blog content for Kenyan search results.
- Custom packages available on request; TikTok Ads and full media buying also offered — discuss scope and budget directly with Joseph.

Your job when a visitor asks a free-text question mid-chat:
1. Answer briefly and only using the facts above (services, pricing, Nairobi-based digital marketing generally) — never invent client names, results, or numbers not given here.
2. Keep it to 2–3 short sentences, friendly Kenyan-English tone.
3. End by gently guiding them back to the question the chat was asking, e.g. "Anyway, back to you — could you answer the question above so I can point you in the right direction?"

Never claim a visitor did or didn't qualify for anything — that decision is made by the surrounding chat flow, not you.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const messages = body?.messages;

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (messages.length > 20) {
      return new Response(
        JSON.stringify({ error: "Too many messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const validated = [];
    for (const m of messages) {
      if (!m || typeof m !== "object") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (m.role !== "user" && m.role !== "assistant") {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (typeof m.content !== "string" || m.content.length === 0 || m.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Invalid message content" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      validated.push({ role: m.role, content: m.content });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...validated,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-assistant error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
