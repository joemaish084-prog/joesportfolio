import { Suspense, lazy, type ReactNode } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  BarChart3,
  CalendarClock,
  Columns3,
  DatabaseZap,
  Flag,
  LayoutDashboard,
  Send,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHubAuth } from "../auth/HubAuthProvider";
import { EmptyState, SkeletonBlock } from "../components/ui";
import { ROLE_LABEL } from "./lib/types";

// Agency Command Centre: the outreach CRM at /hub/crm. Loaded as its own chunk
// the first time someone opens it. Access comes from crm_memberships; every
// page reads through RLS, so what each role sees is decided by the database.

const OverviewPage = lazy(() => import("./pages/OverviewPage"));
const LeadsPage = lazy(() => import("./pages/LeadsPage"));
const LeadPage = lazy(() => import("./pages/LeadPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));
const CampaignsPage = lazy(() => import("./pages/CampaignsPage"));
const OutreachPage = lazy(() => import("./pages/OutreachPage"));
const FollowUpsPage = lazy(() => import("./pages/FollowUpsPage"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

type Item = { to: string; label: string; icon: LucideIcon; end?: boolean };

const NAV: Item[] = [
  { to: "/hub/crm", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/hub/crm/leads", label: "Leads", icon: Users },
  { to: "/hub/crm/campaigns", label: "Campaigns", icon: Flag },
  { to: "/hub/crm/outreach", label: "Outreach", icon: Send },
  { to: "/hub/crm/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { to: "/hub/crm/pipeline", label: "Pipeline", icon: Columns3 },
  { to: "/hub/crm/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/hub/crm/settings", label: "Settings", icon: Settings },
];

const fallback = (
  <div className="space-y-6">
    <SkeletonBlock className="h-12 w-64" />
    <SkeletonBlock className="h-72 rounded-[20px]" />
  </div>
);
const page = (node: ReactNode) => <Suspense fallback={fallback}>{node}</Suspense>;

function CrmNav() {
  const { crm } = useHubAuth();
  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-150",
      isActive ? "bg-tint font-medium text-on-tint" : "text-foreground/80 hover:bg-secondary hover:text-foreground",
    );
  return (
    <>
      {/* Wide screens: a sidebar beside the page */}
      <aside className="hidden lg:block lg:w-48 lg:shrink-0" aria-label="CRM">
        <div className="sticky top-10">
          <div className="mb-4 px-3">
            <p className="text-[0.9375rem] font-semibold leading-tight">Command Centre</p>
            {crm && (
              <p className="text-[0.6875rem] text-muted-foreground">
                {crm.org_name} · {ROLE_LABEL[crm.role]}
              </p>
            )}
          </div>
          <nav>
            <ul className="space-y-0.5">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={link}>
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Narrower screens: the same sections as a scrolling strip */}
      <nav aria-label="CRM" className="-mx-4 mb-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
        <ul className="flex gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={link}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default function CrmApp() {
  const { crm } = useHubAuth();

  if (!crm) {
    return (
      <div className="hub-card">
        <EmptyState
          icon={DatabaseZap}
          title="The CRM isn't set up yet"
          description="Apply the crm_core migration in Supabase. It creates the organisation and makes the hub's admins its owners. Then sign out and back in."
        />
      </div>
    );
  }

  if (!crm.mfa_ok) {
    return (
      <div className="hub-card">
        <EmptyState
          icon={DatabaseZap}
          title="Two-step verification needed"
          description="This organisation requires a verified second factor. Ask an owner to help you set up an authenticator, then sign in again."
        />
      </div>
    );
  }

  return (
    <div className="lg:flex lg:gap-8">
      <CrmNav />
      <div className="min-w-0 flex-1">
        <Routes>
          <Route index element={page(<OverviewPage />)} />
          <Route path="leads" element={page(<LeadsPage />)} />
          <Route path="leads/:id" element={page(<LeadPage />)} />
          <Route path="import" element={page(<ImportPage />)} />
          <Route path="campaigns" element={page(<CampaignsPage />)} />
          <Route path="outreach" element={page(<OutreachPage />)} />
          <Route path="follow-ups" element={page(<FollowUpsPage />)} />
          <Route path="pipeline" element={page(<PipelinePage />)} />
          <Route path="analytics" element={page(<AnalyticsPage />)} />
          <Route path="settings" element={page(<SettingsPage />)} />
          <Route path="*" element={<Navigate to="/hub/crm" replace />} />
        </Routes>
      </div>
    </div>
  );
}
