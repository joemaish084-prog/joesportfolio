import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  Route,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ModuleId } from "./types";

export type ModuleInfo = {
  id: ModuleId;
  label: string;
  path: string;
  icon: LucideIcon;
  blurb: string;
  /** Always shown; the admin can't switch these off. */
  locked?: boolean;
};

// One entry per portal section. Each client gets the subset you switch on.
export const MODULES: ModuleInfo[] = [
  { id: "overview", label: "Overview", path: "/portal", icon: LayoutDashboard, blurb: "Your results at a glance", locked: true },
  { id: "results", label: "Performance", path: "/portal/performance", icon: BarChart3, blurb: "Charts and month-by-month numbers" },
  { id: "reports", label: "Reports", path: "/portal/reports", icon: FileText, blurb: "Monthly reports to read and download" },
  { id: "work", label: "Work done", path: "/portal/work", icon: Wrench, blurb: "What we've been doing for you" },
  { id: "roadmap", label: "Roadmap", path: "/portal/roadmap", icon: Route, blurb: "What's planned, under way and done" },
  { id: "billing", label: "Billing", path: "/portal/billing", icon: CreditCard, blurb: "Invoices and payments" },
  { id: "documents", label: "Documents", path: "/portal/documents", icon: FolderOpen, blurb: "Contracts, proposals and files" },
  { id: "book", label: "Book a call", path: "/portal/book", icon: CalendarCheck, blurb: "Pick a time to talk strategy" },
  { id: "help", label: "Help", path: "/portal/help", icon: LifeBuoy, blurb: "Ask a question or make a request", locked: true },
];

export const moduleById = (id: ModuleId) => MODULES.find((m) => m.id === id)!;
