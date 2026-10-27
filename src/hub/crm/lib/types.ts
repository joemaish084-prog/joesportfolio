// Types for the Agency Command Centre (crm_* tables). Kept beside the hub's own
// types rather than in the generated Supabase types, for the same reason.

export type CrmRole = "owner" | "manager" | "viewer";

export const ROLE_LABEL: Record<CrmRole, string> = {
  owner: "Owner",
  manager: "Manager",
  viewer: "Viewer",
};

export const STAGES = [
  "new",
  "researching",
  "qualified",
  "ready_for_outreach",
  "contacted",
  "replied",
  "interested",
  "meeting_booked",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
  "not_interested",
  "do_not_contact",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  new: "New",
  researching: "Researching",
  qualified: "Qualified",
  ready_for_outreach: "Ready for outreach",
  contacted: "Contacted",
  replied: "Replied",
  interested: "Interested",
  meeting_booked: "Meeting booked",
  proposal_sent: "Proposal sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
  not_interested: "Not interested",
  do_not_contact: "Do not contact",
};

/** Stages where the conversation is over, one way or the other. */
export const CLOSED_STAGES: Stage[] = ["won", "lost", "not_interested", "do_not_contact"];

export const QUALIFICATION = ["unqualified", "researching", "qualified", "disqualified"] as const;
export type Qualification = (typeof QUALIFICATION)[number];
export const QUALIFICATION_LABEL: Record<Qualification, string> = {
  unqualified: "Not assessed",
  researching: "Researching",
  qualified: "Qualified",
  disqualified: "Disqualified",
};

export const DRAFT_KINDS = [
  "initial_email",
  "whatsapp_intro",
  "instagram_dm",
  "follow_up_1",
  "follow_up_2",
  "discovery_prep",
] as const;
export type DraftKind = (typeof DRAFT_KINDS)[number];

export const DRAFT_KIND_LABEL: Record<DraftKind, string> = {
  initial_email: "Cold email",
  whatsapp_intro: "WhatsApp intro",
  instagram_dm: "Instagram DM",
  follow_up_1: "Follow-up 1",
  follow_up_2: "Follow-up 2",
  discovery_prep: "Discovery call notes",
};

export type DraftChannel = "email" | "whatsapp" | "instagram" | "notes";

export const DRAFT_KIND_CHANNEL: Record<DraftKind, DraftChannel> = {
  initial_email: "email",
  whatsapp_intro: "whatsapp",
  instagram_dm: "instagram",
  follow_up_1: "email",
  follow_up_2: "email",
  discovery_prep: "notes",
};

export type DraftStatus = "draft" | "approved" | "rejected" | "used" | "superseded";

export type MessageChannel = "email" | "whatsapp" | "instagram" | "phone" | "other";
export type MessageStatus = "sent_manually" | "queued" | "sent" | "delivered" | "failed" | "bounced" | "received";

export const MESSAGE_STATUS_LABEL: Record<MessageStatus, string> = {
  sent_manually: "Sent by hand",
  queued: "Queued",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed",
  bounced: "Bounced",
  received: "Reply received",
};

export type CrmOrganisation = {
  id: string;
  name: string;
  timezone: string;
  require_mfa: boolean;
  sending_enabled: boolean;
  email_provider: "none" | "gmail" | "brevo";
  /** Verified sender the email comes from; replies go to sender_email. */
  from_email: string | null;
  sending_mode: "manual_approval" | "batch_approval";
  automation_mode: "draft_only";
  daily_send_limit: number;
  send_window_start: string;
  send_window_end: string;
  send_days: number[];
  sender_name: string | null;
  sender_business: string | null;
  sender_email: string | null;
  sender_phone: string | null;
  sender_signature: string | null;
  follow_up_sequence: { kind: string; business_days: number }[];
  fit_weights: Partial<Record<string, number>>;
  retention_months: number;
  created_at: string;
  updated_at: string;
};

export type CrmAccess = {
  org_id: string;
  org_name: string;
  role: CrmRole;
  require_mfa: boolean;
  mfa_ok: boolean;
};

export type CrmMember = { user_id: string; email: string; role: CrmRole; created_at: string };

export type Industry = { id: string; org_id: string; slug: string; name: string };

export type Campaign = {
  id: string;
  org_id: string;
  name: string;
  industry_id: string | null;
  status: "draft" | "active" | "paused" | "completed";
  starts_on: string | null;
  ends_on: string | null;
  description: string | null;
  paused_at: string | null;
  created_at: string;
  updated_at: string;
};

export const CAMPAIGN_STATUS_LABEL: Record<Campaign["status"], string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

export type FitInput = { rating: number | null; verified: boolean; checked_on?: string | null; note?: string };

export type CrmLead = {
  id: string;
  org_id: string;
  industry_id: string | null;
  source_id: string | null;
  name: string;
  area: string | null;
  business_type: string | null;
  email: string | null;
  email_status: "unverified" | "verified" | "bounced" | "invalid";
  phone: string | null;
  phone_status: "unverified" | "verified" | "invalid";
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  socials_verified: boolean;
  google_rating: number | null;
  google_reviews: number | null;
  original_priority: string | null;
  weakness_score: number | null;
  source_data: { imports?: { job_id: string; filename: string; row: number; raw: Record<string, unknown> }[] };
  qualification_status: Qualification;
  stage: Stage;
  stage_changed_at: string;
  owner_id: string | null;
  tags: string[];
  notes: string | null;
  research_notes: string | null;
  fit_inputs: Partial<Record<string, FitInput>>;
  fit_score: number | null;
  fit_factors_known: number;
  do_not_contact: boolean;
  name_key: string | null;
  domain_key: string | null;
  email_key: string | null;
  phone_key: string | null;
  last_contacted_at: string | null;
  next_follow_up_on: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadContact = {
  id: string;
  lead_id: string;
  name: string | null;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  is_decision_maker: boolean;
  verification: "unverified" | "verified";
  verified_at: string | null;
  source: string | null;
  notes: string | null;
  opted_out: boolean;
  created_at: string;
};

export type LeadCampaign = {
  id: string;
  lead_id: string;
  campaign_id: string;
  status: "active" | "paused" | "completed" | "removed";
  added_at: string;
};

export type OutreachDraft = {
  id: string;
  lead_id: string;
  contact_id: string | null;
  campaign_id: string | null;
  kind: DraftKind;
  channel: DraftChannel;
  subject: string | null;
  body: string;
  assumptions: string[];
  facts_used: string[];
  warnings: string[];
  model: string | null;
  status: DraftStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OutreachMessage = {
  id: string;
  lead_id: string;
  draft_id: string | null;
  campaign_id: string | null;
  channel: MessageChannel;
  direction: "outbound" | "inbound";
  status: MessageStatus;
  to_address: string | null;
  subject: string | null;
  body: string | null;
  sent_at: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  lead_id: string;
  actor_id: string | null;
  type: string;
  summary: string;
  data: Record<string, unknown>;
  occurred_at: string;
};

export type FollowUpTask = {
  id: string;
  lead_id: string;
  campaign_id: string | null;
  step: number;
  kind: "follow_up_1" | "follow_up_2" | "custom";
  channel: MessageChannel;
  title: string;
  due_on: string;
  status: "pending" | "done" | "cancelled" | "paused";
  status_reason: string | null;
  assigned_to: string | null;
  completed_at: string | null;
  created_at: string;
};

export type Deal = {
  id: string;
  lead_id: string;
  proposed_service: string;
  quoted_management_fee: number | null;
  expected_monthly_retainer: number | null;
  expected_ad_budget: number | null;
  proposal_date: string | null;
  probability: number | null;
  expected_close_date: string | null;
  status: "open" | "won" | "lost";
  won_on: string | null;
  lost_reason: string | null;
  notes: string | null;
  converted_client_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Suppression = {
  id: string;
  kind: "email" | "phone" | "domain";
  value: string;
  reason: "opted_out" | "bounced" | "complaint" | "manual" | "do_not_contact";
  lead_id: string | null;
  note: string | null;
  created_at: string;
};

export const SUPPRESSION_REASON_LABEL: Record<Suppression["reason"], string> = {
  opted_out: "Opted out",
  bounced: "Bounced",
  complaint: "Complaint",
  manual: "Added by hand",
  do_not_contact: "Do not contact",
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type ImportJob = {
  id: string;
  filename: string;
  file_sha256: string;
  sheet_name: string | null;
  total_rows: number;
  created_count: number;
  merged_count: number;
  skipped_count: number;
  error_count: number;
  created_at: string;
};

export type DashboardMetrics = {
  total_leads: number;
  leads_added: number;
  contacted: number;
  replies: number;
  positive_replies: number;
  meetings_booked: number;
  proposals_sent: number;
  clients_won: number;
  revenue_won: number;
  won_missing_value: number;
  response_rate: number | null;
  meeting_rate: number | null;
  tracking_since: string | null;
  stages: Partial<Record<Stage, number>>;
};
