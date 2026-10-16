import { useCallback, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { MotionConfig } from "framer-motion";
import "./hub.css";
import { HubAuthProvider, useHubAuth } from "./auth/HubAuthProvider";
import { useIdleSignOut } from "./auth/useIdleSignOut";
import { HubNoIndex } from "./components/HubNoIndex";
import { HubShell } from "./components/HubShell";
import { useHubTheme } from "./theme/useHubTheme";
import LoginPage from "./pages/LoginPage";
import OverviewPage from "./pages/OverviewPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import ClientFormPage from "./pages/ClientFormPage";
import OnboardingPage from "./pages/OnboardingPage";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function FullScreenSpinner() {
  return (
    <div className="hub-root flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
    </div>
  );
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, signOut } = useHubAuth();
  const location = useLocation();
  const onIdle = useCallback(() => void signOut("idle"), [signOut]);
  useIdleSignOut(onIdle, IDLE_TIMEOUT_MS, status === "admin");

  if (status === "loading") return <FullScreenSpinner />;
  if (status !== "admin") return <Navigate to="/hub/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Entry point for /hub/*. Loaded with React.lazy, so none of this ships with the public site. */
export default function HubApp() {
  const { theme, setTheme } = useHubTheme();

  return (
    // reducedMotion="user" drops transform and layout animation app-wide for
    // people who ask the OS for less motion; components handle the rest.
    <MotionConfig reducedMotion="user">
      <HubAuthProvider>
        <HubNoIndex />
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route
            element={
              <RequireAdmin>
                <HubShell theme={theme} onThemeChange={setTheme} />
              </RequireAdmin>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/new" element={<ClientFormPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="clients/:id/edit" element={<ClientFormPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/hub" replace />} />
          </Route>
        </Routes>
      </HubAuthProvider>
    </MotionConfig>
  );
}
