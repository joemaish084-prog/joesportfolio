import { Suspense, lazy, useCallback, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MotionConfig } from "framer-motion";
import "./hub.css";
import { HubAuthProvider, useHubAuth } from "./auth/HubAuthProvider";
import { useIdleSignOut } from "./auth/useIdleSignOut";
import { HubNoIndex } from "./components/HubNoIndex";
import { HubShell } from "./components/HubShell";
import { PrivacyProvider } from "./components/privacy";
import { useHubTheme } from "./theme/useHubTheme";
import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import ClientFormPage from "./pages/ClientFormPage";
import OnboardingPage from "./pages/OnboardingPage";
import { SkeletonBlock } from "./components/ui";

// Heavier sections (charts, tables, dialogs) load on first visit.
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const FinancePage = lazy(() => import("./pages/FinancePage"));
const BusinessFundsPage = lazy(() => import("./pages/BusinessFundsPage"));
const InvoicePage = lazy(() => import("./pages/InvoicePage"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const WebsitePage = lazy(() => import("./pages/WebsitePage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
// Agency Command Centre (outreach CRM), its own chunk.
const CrmApp = lazy(() => import("./crm/CrmApp"));

const sectionFallback = (
  <div className="space-y-6">
    <SkeletonBlock className="h-12 w-64" />
    <SkeletonBlock className="h-72 rounded-[20px]" />
  </div>
);
const section = (node: ReactNode) => <Suspense fallback={sectionFallback}>{node}</Suspense>;

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function FullScreenSpinner() {
  return (
    <div className="hub-root flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  );
}

/** Signed in and past any second factor: admins, editors and CRM members. */
function RequireSignedIn({ children }: { children: ReactNode }) {
  const { status, signOut } = useHubAuth();
  const location = useLocation();
  const onIdle = useCallback(() => void signOut("idle"), [signOut]);
  useIdleSignOut(onIdle, IDLE_TIMEOUT_MS, status === "admin" || status === "member" || status === "crm");

  if (status === "loading") return <FullScreenSpinner />;
  if (status !== "admin" && status !== "member" && status !== "crm") return <Navigate to="/hub/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Privileged pages remain admin-only; editors return to their overview. */
function AdminOnly({ children }: { children: ReactNode }) {
  const { status } = useHubAuth();
  if (status !== "admin") return <Navigate to={status === "crm" ? "/hub/crm" : "/hub"} replace />;
  return <>{children}</>;
}

const admin = (node: ReactNode) => <AdminOnly>{node}</AdminOnly>;
function HubOnly({ children }: { children: ReactNode }) {
  const { status } = useHubAuth();
  if (status !== "admin" && status !== "member") return <Navigate to="/hub/crm" replace />;
  return <>{children}</>;
}
const hub = (node: ReactNode) => <HubOnly>{node}</HubOnly>;

/** Entry point for /hub/*. Loaded with React.lazy, so none of this ships with the public site. */
export default function HubApp() {
  const { theme, setTheme } = useHubTheme();

  return (
    // reducedMotion="user" drops transform and layout animation app-wide for
    // people who ask the OS for less motion; components handle the rest.
    <MotionConfig reducedMotion="user">
      <HubAuthProvider>
        <PrivacyProvider>
          <HubNoIndex />
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route path="reset-password" element={section(<ResetPasswordPage />)} />
            <Route
              element={
                <RequireSignedIn>
                  <HubShell theme={theme} onThemeChange={setTheme} />
                </RequireSignedIn>
              }
            >
              <Route index element={hub(<OverviewPage />)} />
              <Route path="clients" element={hub(<ClientsPage />)} />
              <Route path="clients/new" element={hub(<ClientFormPage />)} />
              <Route path="clients/:id" element={hub(<ClientDetailPage />)} />
              <Route path="clients/:id/edit" element={hub(<ClientFormPage />)} />
              <Route path="onboarding" element={hub(<OnboardingPage />)} />
              <Route path="documents" element={hub(section(<DocumentsPage />))} />
              <Route path="reports" element={hub(section(<ReportsPage />))} />
              <Route path="finance" element={hub(section(<FinancePage />))} />
              <Route path="funds" element={admin(section(<BusinessFundsPage />))} />
              <Route path="finance/invoices/:id" element={hub(section(<InvoicePage />))} />
              <Route path="pipeline" element={hub(section(<PipelinePage />))} />
              <Route path="settings" element={hub(section(<SettingsPage />))} />
              <Route path="website" element={admin(section(<WebsitePage />))} />
              <Route path="tasks" element={hub(section(<TasksPage />))} />
              <Route path="calendar" element={hub(section(<CalendarPage />))} />
              <Route path="crm/*" element={section(<CrmApp />)} />
              <Route path="*" element={<Navigate to="/hub" replace />} />
            </Route>
          </Routes>
        </PrivacyProvider>
      </HubAuthProvider>
    </MotionConfig>
  );
}
