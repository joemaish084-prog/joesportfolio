import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Client Hub: reads one past invoice (text pulled from a PDF in the browser, or
// page images for scanned PDFs) and returns its details as structured data.
// Admin only: the caller's own session must hold the hub admin role. Nothing is
// stored here; the hub shows the result for review before saving anything.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_TEXT = 20000;
const MAX_IMAGES = 2;
const MAX_IMAGE_CHARS = 2_500_000; // ~1.8 MB per page image as a data URL

const SYSTEM_PROMPT = `You read invoices issued by Joseph Maina, a digital marketing consultant in Nairobi, Kenya, to his clients.
Extract the invoice details exactly as written. Rules:
- client_name is the business being billed (the "Bill to" / "Billed to" / "To" party), never Joseph Maina himself.
- If a list of known clients is given and the billed business is clearly one of them (allowing for small spelling or case differences), return that exact known name.
- Dates must be YYYY-MM-DD. Dates on Kenyan invoices are written day first (05/03/2025 is 5 March 2025).
- Amounts are plain numbers without currency symbols or commas. total is the final amount payable including any VAT.
- Only fill amount_paid, paid_date, payment_method and payment_reference if the document itself shows a payment (e.g. "PAID" stamp, receipt, M-Pesa code, "amount paid"). Otherwise leave them null.
- Use null for anything you cannot find. Never guess numbers.
- confidence is "high" when number, client, date and total are all clearly present, "medium" if one is unclear, otherwise "low".`;

const TOOL = {
  type: "function",
  function: {
    name: "record_invoice",
    description: "Record the details read from one invoice.",
    parameters: {
      type: "object",
      properties: {
        invoice_number: { type: ["string", "null"] },
        client_name: { type: ["string", "null"] },
        issue_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
        due_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
        currency: { type: ["string", "null"], description: "e.g. KES, USD" },
        line_items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              quantity: { type: "number" },
              unit_price: { type: "number" },
            },
            required: ["description", "quantity", "unit_price"],
          },
        },
        total: { type: ["number", "null"] },
        amount_paid: { type: ["number", "null"] },
        paid_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
        payment_method: { type: ["string", "null"], enum: ["mpesa", "bank", "cash", "card", "cheque", "other", null] },
        payment_reference: { type: ["string", "null"] },
        notes: { type: ["string", "null"], description: "Anything worth flagging, e.g. foreign currency or a credit note." },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
      },
      required: ["invoice_number", "client_name", "issue_date", "total", "line_items", "confidence"],
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // Only the hub admin may use this.
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: isAdmin, error: roleError } = await supabase.rpc("is_hub_admin");
    if (roleError || isAdmin !== true) return json({ error: "Not allowed" }, 403);

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.slice(0, MAX_TEXT) : "";
    const images: string[] = Array.isArray(body?.images)
      ? body.images
          .filter((i: unknown) => typeof i === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(i) && i.length <= MAX_IMAGE_CHARS)
          .slice(0, MAX_IMAGES)
      : [];
    const clients: string[] = Array.isArray(body?.clients)
      ? body.clients.filter((c: unknown) => typeof c === "string").slice(0, 300).map((c: string) => c.slice(0, 120))
      : [];
    if (!text.trim() && images.length === 0) return json({ error: "Nothing to read" }, 400);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return json({ error: "Reading service not configured" }, 503);
    }

    const intro = `${clients.length ? `Known clients: ${clients.join("; ")}\n\n` : ""}${
      text.trim() ? `Invoice text:\n${text}` : "The invoice is attached as page images."
    }`;
    const content: unknown[] = [{ type: "text", text: intro }];
    for (const url of images) content.push({ type: "image_url", image_url: { url } });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "record_invoice" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      if (response.status === 429) return json({ error: "Too many requests, try again in a moment" }, 429);
      if (response.status === 402) return json({ error: "AI credits exhausted" }, 402);
      return json({ error: "Reading service error" }, 502);
    }

    const result = await response.json();
    const args = result?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return json({ error: "Couldn't read this invoice" }, 422);
    const invoice = typeof args === "string" ? JSON.parse(args) : args;
    return json({ invoice });
  } catch (e) {
    console.error("hub-read-invoice error:", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
