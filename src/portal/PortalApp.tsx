import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
import { Loader2, LockKeyhole, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./portal.css";
import { PortalAuthProvider, usePortalAuth } from "./auth/PortalAuthProvider";
import { PortalDataProvider, usePortal } from "./auth/PortalData";
import { PortalShell } from "./components/PortalShell";
import { Skeleton } from "./components/ui";
import { captureEntryParams, touchPortal, usePortalSnapshot } from "./lib/api";
import type { ModuleId } from "./lib/types";
import { usePortalTheme } from "./theme/usePortalTheme";
import LoginPage from "./pages/LoginPage";

const OverviewPage = lazy(() => import("./pages/OverviewPage"));
const PerformancePage = lazy(() => import("./pages/PerformancePage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const WorkPage = lazy(() => import("./pages/WorkPage"));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const BookPage = lazy(() => import("./pages/BookPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));

const pageFallback = (
  <div className="space-y-5">
    <Skeleton className="h-10 w-64" />
    <Skeleton className="h-72" />
    <div className="grid gap-4 sm:grid-cols-3">
      <Skeleton className="h-36" />
      <Skeleton className="h-36" />
      <Skeleton className="h-36" />
    </div>
  </div>
);

/** The portal is private: switch the page's robots tag to noindex while it's open. */
function PortalHead() {
  useEffect(() => {
    const tags = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="robots"]:not([data-rh])'));
    const previous = tags.map((t) => t.content);
    tags.forEach((t) => (t.content = "noindex, nofollow"));
    return () => tags.forEach((t, i) => (t.content = previous[i]!));
  }, []);
  return (
    <Helmet>
      <title>Client Portal | JM Creative</title>
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Helmet>
  );
}

function FullScreen({ children }: { children: ReactNode }) {
  return <div className="portal-root portal-backdrop flex items-center justify-center px-5">{children}</div>;
}

function NoAccess() {
  const { signOut } = usePortalAuth();
  return (
    <FullScreen>
      <div className="portal-card max-w-md p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-on-tint ring-1 ring-primary/20">
          <LockKeyhole className="h-7 w-7" />
        </span>
        <h1 className="portal-display mt-5 text-2xl font-bold">No portal for this account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in, but this email isn't linked to a client portal yet. If you expected access, email{" "}
          <a href="mailto:joemaish084@gmail.com" className="font-medium text-foreground hover:underline">
            joemaish084@gmail.com
          </a>{" "}
          and we'll sort it out.
        </p>
        <Button variant="outline" className="mt-6 rounded-xl" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </FullScreen>
  );
}

/** Signed in and linked to a client: loads their snapshot once and shares it with every page. */
function Gate({ theme, onThemeChange }: { theme: "light" | "dark"; onThemeChange: (t: "light" | "dark") => void }) {
  const { status } = usePortalAuth();
  const location = useLocation();
  const snapshot = usePortalSnapshot(status === "signed-in");

  useEffect(() => {
    if (snapshot.data) void touchPortal();
  }, [snapshot.data]);

  if (status === "loading") {
    return (
      <FullScreen>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </FullScreen>
    );
  }
  if (status === "signed-out") return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />;

  if (snapshot.isLoading) {
    return (
      <FullScreen>
        <div className="w-full max-w-5xl space-y-5 py-10">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-72" />
        </div>
      </FullScreen>
    );
  }
  if (snapshot.isError) {
    return (
      <FullScreen>
        <div className="portal-card max-w-md p-8 text-center">
          <h1 className="portal-display text-xl font-bold">Couldn't load your portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">Check your connection and try again.</p>
          <Button className="mt-5 rounded-xl" onClick={() => void snapshot.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try again
          </Button>
        </div>
      </FullScreen>
    );
  }
  if (!snapshot.data) return <NoAccess />;

  return (
    <PortalDataProvider snapshot={snapshot.data}>
      <PortalShell theme={theme} onThemeChange={onThemeChange} />
    </PortalDataProvider>
  );
}

/** Sends the client home when a section has been switched off for them. */
function Module({ id, children }: { id: ModuleId; children: ReactNode }) {
  const { settings } = usePortal();
  if (id !== "overview" && id !== "help" && !settings.modules.includes(id)) return <Navigate to="/portal" replace />;
  return <Suspense fallback={pageFallback}>{children}</Suspense>;
}

function Guarded({ id, children }: { id: ModuleId; children: ReactNode }) {
  return <Module id={id}>{children}</Module>;
}

/** Entry point for /portal/*. Lazy-loaded, so none of this ships with the public site. */
export default function PortalApp() {
  const { theme, setTheme } = usePortalTheme();
  // Reads ?preview and ?demo from the entry URL once, before anything fetches.
  useState(() => captureEntryParams());

  return (
    <MotionConfig reducedMotion="user">
      <PortalHead />
      <PortalAuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<Gate theme={theme} onThemeChange={setTheme} />}>
            <Route index element={<Guarded id="overview"><OverviewPage /></Guarded>} />
            <Route path="performance" element={<Guarded id="results"><PerformancePage /></Guarded>} />
            <Route path="reports" element={<Guarded id="reports"><ReportsPage /></Guarded>} />
            <Route path="work" element={<Guarded id="work"><WorkPage /></Guarded>} />
            <Route path="roadmap" element={<Guarded id="roadmap"><RoadmapPage /></Guarded>} />
            <Route path="billing" element={<Guarded id="billing"><BillingPage /></Guarded>} />
            <Route path="documents" element={<Guarded id="documents"><DocumentsPage /></Guarded>} />
            <Route path="book" element={<Guarded id="book"><BookPage /></Guarded>} />
            <Route path="help" element={<Guarded id="help"><HelpPage /></Guarded>} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Route>
        </Routes>
        <Outlet />
      </PortalAuthProvider>
    </MotionConfig>
  );
}
