// AI provider seam for the CRM. One adapter today (the Lovable AI gateway the
// hub already uses for invoices); another provider slots in behind the same
// function without touching the callers.

export type StructuredRequest = {
  system: string;
  user: string;
  tool: { type: "function"; function: { name: string; description: string; parameters: unknown } };
};

export type AiConfig = { provider: "lovable"; apiKey: string; model: string };

export class AiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function generateStructured(config: AiConfig, req: StructuredRequest): Promise<Record<string, unknown>> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      tools: [req.tool],
      tool_choice: { type: "function", function: { name: req.tool.function.name } },
    }),
  });

  if (!response.ok) {
    // Log the status only; the body can echo the prompt.
    console.error("AI gateway error:", response.status);
    if (response.status === 429) throw new AiError("Too many requests, try again in a moment", 429);
    if (response.status === 402) throw new AiError("AI credits exhausted", 402);
    throw new AiError("Drafting service error", 502);
  }

  const result = await response.json();
  const args = result?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new AiError("The drafting service returned nothing usable", 422);
  return typeof args === "string" ? JSON.parse(args) : args;
}
