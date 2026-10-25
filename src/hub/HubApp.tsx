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

/** Signed in and past any second factor: hub admins and CRM members. */
function RequireSignedIn({ children }: { children: ReactNode }) {
  const { status, signOut } = useHubAuth();
  const location = useLocation();
  const onIdle = useCallback(() => void signOut("idle"), [signOut]);
  useIdleSignOut(onIdle, IDLE_TIMEOUT_MS, status === "admin" || status === "crm");

  if (status === "loading") return <FullScreenSpinner />;
  if (status !== "admin" && status !== "crm") return <Navigate to="/hub/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** The rest of the hub (clients, finance…) stays admin-only; CRM members go to the CRM. */
function AdminOnly({ children }: { children: ReactNode }) {
  const { status } = useHubAuth();
  if (status !== "admin") return <Navigate to="/hub/crm" replace />;
  return <>{children}</>;
}

const admin = (node: ReactNode) => <AdminOnly>{node}</AdminOnly>;

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
              <Route index element={admin(<OverviewPage />)} />
              <Route path="clients" element={admin(<ClientsPage />)} />
              <Route path="clients/new" element={admin(<ClientFormPage />)} />
              <Route path="clients/:id" element={admin(<ClientDetailPage />)} />
              <Route path="clients/:id/edit" element={admin(<ClientFormPage />)} />
              <Route path="onboarding" element={admin(<OnboardingPage />)} />
              <Route path="documents" element={admin(section(<DocumentsPage />))} />
              <Route path="reports" element={admin(section(<ReportsPage />))} />
              <Route path="finance" element={admin(section(<FinancePage />))} />
              <Route path="funds" element={admin(section(<BusinessFundsPage />))} />
              <Route path="finance/invoices/:id" element={admin(section(<InvoicePage />))} />
              <Route path="pipeline" element={admin(section(<PipelinePage />))} />
              <Route path="settings" element={admin(section(<SettingsPage />))} />
              <Route path="website" element={admin(section(<WebsitePage />))} />
              <Route path="tasks" element={admin(section(<TasksPage />))} />
              <Route path="crm/*" element={section(<CrmApp />)} />
              <Route path="*" element={<Navigate to="/hub" replace />} />
            </Route>
          </Routes>
        </PrivacyProvider>
      </HubAuthProvider>
    </MotionConfig>
  );
}
