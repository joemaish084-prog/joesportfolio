// Types for the Client Hub tables. Kept here rather than in the generated
// integrations/supabase/types.ts so regenerating that file never breaks the hub.

export const CLIENT_STATUSES = ["prospect", "onboarding", "active", "paused", "ended"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const STATUS_LABEL: Record<ClientStatus, string> = {
  prospect: "Prospect",
  onboarding: "Onboarding",
  active: "Active",
  paused: "Paused",
  ended: "Ended",
};

export const SERVICES = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "SEO",
  "Social media",
  "Content",
  "Web design",
  "Other",
] as const;

export const MAIN_GOALS = ["sales", "leads", "messages", "brand"] as const;
export type MainGoal = (typeof MAIN_GOALS)[number];

export const GOAL_LABEL: Record<MainGoal, string> = {
  sales: "Sales",
  leads: "Leads",
  messages: "Messages",
  brand: "Brand",
};

export const KPI_UNITS = ["number", "kes", "percent"] as const;
export type KpiUnit = (typeof KPI_UNITS)[number];

export const KPI_UNIT_LABEL: Record<KpiUnit, string> = {
  number: "Number",
  kes: "KES",
  percent: "%",
};

export type FieldType = "text" | "textarea" | "number" | "currency" | "percent" | "url" | "select" | "multiselect";

export type FieldDefinition = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
};

export type KpiDefinition = {
  name: string;
  unit: KpiUnit;
};

export type CustomFieldValue = string | number | string[] | null;
export type CustomFields = Record<string, CustomFieldValue>;

export type ClientType = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  field_definitions: FieldDefinition[];
  default_kpis: KpiDefinition[];
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  client_type_id: string | null;
  name: string;
  business_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  status: ClientStatus;
  start_date: string | null;
  monthly_fee: number | null;
  currency: string;
  services: string[];
  main_goal: MainGoal | null;
  notes: string | null;
  custom_fields: CustomFields;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientKpi = {
  id: string;
  client_id: string;
  name: string;
  unit: KpiUnit;
  target: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type OnboardingTemplate = {
  id: string;
  client_type_id: string | null;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OnboardingItem = {
  id: string;
  client_id: string;
  template_id: string | null;
  title: string;
  sort_order: number;
  is_done: boolean;
  done_at: string | null;
  due_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------- phase 2

export const DOCUMENT_KINDS = [
  "contract",
  "proposal",
  "quotation",
  "invoice",
  "report",
  "brief",
  "receipt",
  "other",
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];
export const DOCUMENT_KIND_LABEL: Record<DocumentKind, string> = {
  contract: "Contract",
  proposal: "Proposal",
  quotation: "Quotation",
  invoice: "Invoice",
  report: "Report",
  brief: "Brief",
  receipt: "Receipt",
  other: "Other",
};

export const DOCUMENT_STATUSES = ["draft", "sent", "signed", "approved", "declined", "final"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  signed: "Signed",
  approved: "Approved",
  declined: "Declined",
  final: "Final",
};

export type HubDocument = {
  id: string;
  client_id: string | null;
  kind: DocumentKind;
  title: string;
  status: DocumentStatus;
  is_template: boolean;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const WORK_CATEGORIES = [
  "ads",
  "content",
  "seo",
  "design",
  "web",
  "meeting",
  "reporting",
  "admin",
  "other",
] as const;
export type WorkCategory = (typeof WORK_CATEGORIES)[number];
export const WORK_CATEGORY_LABEL: Record<WorkCategory, string> = {
  ads: "Ads",
  content: "Content",
  seo: "SEO",
  design: "Design",
  web: "Web",
  meeting: "Meeting",
  reporting: "Reporting",
  admin: "Admin",
  other: "Other",
};

export type WorkLogEntry = {
  id: string;
  client_id: string;
  worked_on: string;
  title: string;
  details: string | null;
  category: WorkCategory;
  minutes: number | null;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: string;
  client_id: string;
  title: string;
  period_start: string;
  period_end: string;
  summary: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportMetric = {
  id: string;
  report_id: string;
  client_kpi_id: string;
  value: number;
  created_at: string;
  updated_at: string;
};

export type InvoiceLineItem = { description: string; quantity: number; unit_price: number };
export const INVOICE_STATUSES = ["draft", "sent", "void"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type Invoice = {
  id: string;
  client_id: string;
  number: string;
  title: string | null;
  issue_date: string;
  due_date: string | null;
  line_items: InvoiceLineItem[];
  amount: number;
  currency: string;
  status: InvoiceStatus;
  notes: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
};

export const PAYMENT_METHODS = ["mpesa", "bank", "cash", "card", "cheque", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  mpesa: "M-Pesa",
  bank: "Bank transfer",
  cash: "Cash",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

export type Payment = {
  id: string;
  client_id: string;
  invoice_id: string | null;
  amount: number;
  paid_on: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const EXPENSE_CATEGORIES = [
  "ad_spend",
  "software",
  "contractor",
  "equipment",
  "internet",
  "transport",
  "marketing",
  "office",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  ad_spend: "Ad spend",
  software: "Software",
  contractor: "Contractor",
  equipment: "Equipment",
  internet: "Internet & phone",
  transport: "Transport",
  marketing: "Marketing",
  office: "Office",
  other: "Other",
};

export type Expense = {
  id: string;
  client_id: string | null;
  spent_on: string;
  category: ExpenseCategory;
  description: string;
  vendor: string | null;
  amount: number;
  receipt_document_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const LEAD_STAGES = ["new", "contacted", "meeting", "proposal", "won", "lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  meeting: "Meeting",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export const LEAD_SOURCES = [
  "referral",
  "website",
  "instagram",
  "facebook",
  "tiktok",
  "linkedin",
  "whatsapp",
  "google",
  "event",
  "other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  referral: "Referral",
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  google: "Google",
  event: "Event",
  other: "Other",
};

export type Lead = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  client_type_id: string | null;
  source: LeadSource;
  stage: LeadStage;
  estimated_value: number | null;
  services: string[];
  next_follow_up: string | null;
  lost_reason: string | null;
  notes: string | null;
  converted_client_id: string | null;
  position: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------- phase 3

export type BusinessProfile = {
  name?: string;
  tagline?: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  kra_pin?: string;
  mpesa_till?: string;
  mpesa_paybill?: string;
  mpesa_account?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_branch?: string;
};

export type InvoiceDefaults = {
  due_days?: number;
  /** Extra line under the payment details, e.g. "Thank you for your business". */
  footer?: string;
};

export type HubSettings = {
  id: boolean;
  business: BusinessProfile;
  invoice_defaults: InvoiceDefaults;
  revenue_goal: number | null;
  created_at: string;
  updated_at: string;
};

type Generated = "id" | "created_at" | "updated_at";

type TableDef<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Omit<Row, Generated>> & Pick<Row, Required>;
  Update: Partial<Omit<Row, Generated>>;
  Relationships: [];
};

export type HubDatabase = {
  public: {
    Tables: {
      client_types: TableDef<ClientType, "slug" | "name">;
      clients: TableDef<Client, "name">;
      client_kpis: TableDef<ClientKpi, "client_id" | "name">;
      onboarding_templates: TableDef<OnboardingTemplate, "title">;
      onboarding_items: TableDef<OnboardingItem, "client_id" | "title">;
      documents: TableDef<HubDocument, "title" | "storage_path" | "file_name">;
      work_log: TableDef<WorkLogEntry, "client_id" | "title">;
      reports: TableDef<Report, "client_id" | "title" | "period_start" | "period_end">;
      report_metrics: TableDef<ReportMetric, "report_id" | "client_kpi_id" | "value">;
      invoices: TableDef<Invoice, "client_id" | "number" | "amount">;
      payments: TableDef<Payment, "client_id" | "amount">;
      expenses: TableDef<Expense, "description" | "amount">;
      leads: TableDef<Lead, "name">;
      hub_settings: {
        Row: HubSettings;
        Insert: Partial<HubSettings>;
        Update: Partial<Omit<HubSettings, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_hub_admin: { Args: never; Returns: boolean };
      hub_apply_onboarding_template: { Args: { p_client_id: string }; Returns: number };
      hub_merge_clients: { Args: { p_keep: string; p_drop: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
