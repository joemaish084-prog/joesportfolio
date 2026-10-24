// Email provider seam. The CRM talks to this interface only, so Gmail (or an
// approved email API) can be connected later without changing the CRM.
//
// No provider is implemented yet: outbound sending is off by design. Before
// adding one, check that provider's terms allow individually written B2B
// prospecting emails; many transactional services (Postmark, Resend and
// others) forbid or restrict cold outreach. Sending one-to-one from your own
// Google Workspace mailbox through the Gmail API is the likeliest fit.

export type OutboundEmail = {
  to: string;
  from: string;
  subject: string;
  text: string;
  /** Becomes the provider's idempotency key where supported. */
  idempotencyKey: string;
  /** e.g. List-Unsubscribe */
  headers?: Record<string, string>;
};

export type SendResult = { providerMessageId: string; threadId?: string };

export interface EmailProvider {
  readonly name: string;
  /** Per-provider ceiling, applied on top of the org's daily limit. */
  readonly maxPerDay: number;
  send(email: OutboundEmail): Promise<SendResult>;
}

/** Returns the provider for a name, or null when none is connected or built. */
export function getEmailProvider(name: string): EmailProvider | null {
  switch (name) {
    // case "gmail": return gmailProvider(...)   // not built yet
    default:
      return null;
  }
}
