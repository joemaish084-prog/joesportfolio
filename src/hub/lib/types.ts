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
    };
    Views: Record<string, never>;
    Functions: {
      is_hub_admin: { Args: never; Returns: boolean };
      hub_apply_onboarding_template: { Args: { p_client_id: string }; Returns: number };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
