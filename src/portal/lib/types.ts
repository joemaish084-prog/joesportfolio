import type {
  Client,
  ClientKpi,
  DocumentKind,
  DocumentStatus,
  Invoice,
  Payment,
  Report,
  ReportMetric,
  WorkCategory,
} from "@/hub/lib/types";

export const MODULE_IDS = ["overview", "results", "reports", "work", "roadmap", "billing", "documents", "book", "help"] as const;
export type ModuleId = (typeof MODULE_IDS)[number];

// What portal_snapshot() returns. Rows keep the hub's shapes (so the hub's
// own KPI and billing maths work on them) minus the columns clients never get.

export type PortalClient = Pick<
  Client,
  | "id"
  | "name"
  | "business_name"
  | "contact_person"
  | "website"
  | "industry"
  | "status"
  | "start_date"
  | "services"
  | "main_goal"
  | "currency"
  | "engagement_type"
  | "end_date"
  | "monthly_fee"
  | "project_fee"
>;

export type PortalKpi = Pick<ClientKpi, "id" | "client_id" | "name" | "unit" | "target" | "sort_order">;
export type PortalReport = Pick<
  Report,
  "id" | "client_id" | "title" | "period_start" | "period_end" | "summary" | "document_id" | "created_at"
>;
export type PortalMetric = Pick<ReportMetric, "id" | "report_id" | "client_kpi_id" | "value">;
export type PortalWork = { id: string; worked_on: string; title: string; details: string | null; category: WorkCategory };
export type MilestoneStatus = "planned" | "in_progress" | "done";
export type PortalMilestone = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: MilestoneStatus;
  completed_at: string | null;
  sort_order: number;
};
export type PortalUpdate = {
  id: string;
  kind: "update" | "action";
  title: string;
  body: string | null;
  link_url: string | null;
  resolved_at: string | null;
  created_at: string;
};
export type PortalInvoice = Pick<
  Invoice,
  "id" | "client_id" | "number" | "title" | "issue_date" | "due_date" | "line_items" | "amount" | "currency" | "status" | "document_id"
>;
export type PortalPayment = Pick<Payment, "id" | "client_id" | "invoice_id" | "amount" | "paid_on" | "method" | "reference">;
export type PortalDocument = {
  id: string;
  client_id: string;
  kind: DocumentKind;
  title: string;
  status: DocumentStatus;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};
export type MessageKind = "question" | "request" | "feedback";
export type PortalMessage = {
  id: string;
  kind: MessageKind;
  subject: string;
  body: string;
  status: "new" | "read" | "done";
  created_at: string;
};

export type PortalSnapshot = {
  client: PortalClient;
  settings: { modules: ModuleId[]; welcome_message: string | null; call_link: string | null };
  me: { email: string | null; full_name: string | null; preview: boolean };
  kpis: PortalKpi[];
  reports: PortalReport[];
  report_metrics: PortalMetric[];
  work: PortalWork[];
  milestones: PortalMilestone[];
  updates: PortalUpdate[];
  invoices: PortalInvoice[];
  payments: PortalPayment[];
  documents: PortalDocument[];
  messages: PortalMessage[];
};
