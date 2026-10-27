// Email provider seam. The CRM talks to this interface only, so another
// provider can replace Brevo later without changing the CRM.
//
// Brevo is reached over its HTTP API, not SMTP: Supabase Edge Functions block
// outgoing SMTP ports (25 and 587). The API needs a v3 API key (xkeysib-…),
// stored as the BREVO_API_KEY secret; the SMTP key (xsmtpsib-…) won't work here.
//
// Policy note: Brevo's anti-spam policy prohibits sending to lists scraped from
// the internet, transactional or marketing. Sending to scraped leads risks the
// account being suspended. Sends are one at a time, approved, with an opt-out.

export type OutboundEmail = {
  to: string;
  from: { email: string; name?: string };
  replyTo?: string;
  subject: string;
  text: string;
  /** Lets the provider (or a retry) recognise the same send. */
  idempotencyKey: string;
  headers?: Record<string, string>;
  tags?: string[];
};

export type SendResult = { providerMessageId: string };

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export interface EmailProvider {
  readonly name: string;
  /** Per-provider ceiling, on top of the org's daily limit (Brevo free plan: 300/day). */
  readonly maxPerDay: number;
  send(email: OutboundEmail): Promise<SendResult>;
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export function brevoProvider(apiKey: string, fetchImpl: FetchLike = fetch): EmailProvider {
  return {
    name: "brevo",
    maxPerDay: 300,
    async send(email) {
      const response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          sender: { email: email.from.email, ...(email.from.name ? { name: email.from.name } : {}) },
          to: [{ email: email.to }],
          ...(email.replyTo ? { replyTo: { email: email.replyTo } } : {}),
          subject: email.subject,
          textContent: email.text,
          headers: { ...email.headers, "X-Idempotency-Key": email.idempotencyKey },
          tags: email.tags,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        // Brevo's messages are safe to show (no key or content echoed back).
        const reason = typeof body?.message === "string" ? body.message : `HTTP ${response.status}`;
        if (response.status === 401) throw new ProviderError("Brevo rejected the API key", 502);
        if (response.status === 429) throw new ProviderError("Brevo rate limit reached; try again shortly", 429);
        throw new ProviderError(`Brevo refused the email: ${reason}`, 502);
      }
      if (typeof body?.messageId !== "string") throw new ProviderError("Brevo didn't return a message id", 502);
      return { providerMessageId: body.messageId };
    },
  };
}

/** The provider for a name, or null when none is connected or its key is missing. */
export function getEmailProvider(name: string, env: { BREVO_API_KEY?: string }): EmailProvider | null {
  switch (name) {
    case "brevo":
      return env.BREVO_API_KEY ? brevoProvider(env.BREVO_API_KEY) : null;
    default:
      return null;
  }
}

/** Plain text with the opt-out line Brevo and Kenyan marketing rules expect. */
export function withOptOut(text: string, replyTo: string | null) {
  if (/no thanks|unsubscribe|won'?t (contact|email) you again|rather not hear/i.test(text)) return text;
  return `${text.trimEnd()}\n\nIf you'd rather not hear from me, just reply "no thanks"${replyTo ? ` (${replyTo})` : ""} and I won't contact you again.`;
}
