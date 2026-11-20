import { Suspense, lazy, startTransition, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { CookieConsent } from "@/components/CookieConsent";
import { MetaPixelRouteTracker } from "@/components/MetaPixelRouteTracker";
import { ConversionTracker } from "@/components/ConversionTracker";
import { PulseTracker } from "@/components/PulseTracker";
import { preloadHomeSections } from "./pages/homeSections";
import { AgencyHomeView, PortfolioView } from "./pages/primaryViews";
import { PORTFOLIO_PATH, isLegacyPortfolioAnchor, legacyAgencyTarget } from "@/lib/publicViews";
const Agency = lazy(() => import("./pages/Agency"));
const AgencyResults = lazy(() => import("./pages/AgencyResults"));
const AgencyBlog = lazy(() => import("./pages/AgencyBlog"));
const AgencyBlogHub = lazy(() => import("./pages/AgencyBlogHub"));
const AgencyService = lazy(() => import("./pages/AgencyService"));
const AgencyBlogPost = lazy(() => import("./pages/AgencyBlogPost"));
const AgencyCalculator = lazy(() => import("./pages/AgencyCalculator"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Connect = lazy(() => import("./pages/Connect"));
const WorkDesign = lazy(() => import("./pages/WorkDesign"));
const WorkMockups = lazy(() => import("./pages/WorkMockups"));
const WorkVideos = lazy(() => import("./pages/WorkVideos"));
const WorkCaseStudies = lazy(() => import("./pages/WorkCaseStudies"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
// Image-heavy brand books load on demand so they stay out of the main bundle.
const WorkBranding = lazy(() => import("./pages/WorkBranding"));
const WorkBrand = lazy(() => import("./pages/WorkBrand"));
// Private back office. Lazy, unlinked and noindexed; see src/hub.
const HubApp = lazy(() => import("./hub/HubApp"));
// Client portal for signed-in clients. Lazy, unlinked and noindexed; see src/portal.
const PortalApp = lazy(() => import("./portal/PortalApp"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton").then((m) => ({ default: m.WhatsAppButton })));
// Retain the trusted build-generated page while its route chunk loads. The
// initial createRoot render would otherwise replace visible HTML with a blank.
if (window.location.pathname === "/agency" && (!window.location.hash || window.location.hash === "#audit")) {
  window.history.replaceState(window.history.state, "", `/${window.location.search}${window.location.hash}`);
}
const initialPath = window.location.pathname;
// An old portfolio deep link needs its archive section as soon as possible.
if (initialPath === PORTFOLIO_PATH && window.location.hash && window.location.hash !== "#selected-work") preloadHomeSections();
let initialMarkup = document.getElementById("root")?.innerHTML ?? "";
function RouteFallback() {
  const { pathname } = useLocation();
  useEffect(() => () => { initialMarkup = ""; }, []);
  return pathname === initialPath && initialMarkup
    ? <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: initialMarkup }} />
    : <div className="min-h-screen bg-background" />;
}
const pageFallback = <RouteFallback />;

function AgencyEntry({ legacy = false }: { legacy?: boolean }) {
  const { hash, search } = useLocation();
  if (legacy) {
    const destination = new URL(legacyAgencyTarget(hash) ?? "/", window.location.origin);
    return <Navigate replace to={{ pathname: destination.pathname, search, hash: destination.hash || (destination.pathname === "/" ? hash : "") }} />;
  }
  if (isLegacyPortfolioAnchor(hash)) return <Navigate replace to={{ pathname: PORTFOLIO_PATH, hash, search }} />;
  return <AgencyHomeView />;
}

function PrimaryViewScroll() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(pathname);
  useEffect(() => {
    if (![PORTFOLIO_PATH, "/agency/overview", "/agency/services", "/work/case-studies"].includes(pathname) ||
        document.getElementById("legacy-serif-font")) return;
    const stylesheet = document.createElement("link");
    stylesheet.id = "legacy-serif-font";
    stylesheet.rel = "stylesheet";
    stylesheet.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap";
    document.head.append(stylesheet);
  }, [pathname]);
  useLayoutEffect(() => {
    const primary = (path: string) => path === "/" || path === PORTFOLIO_PATH;
    const switching = previous.current !== pathname && primary(previous.current) && primary(pathname);
    previous.current = pathname;
    const main = document.querySelector<HTMLElement>("main[tabindex='-1']");
    if (pathname === "/" && (hash === "#audit" || hash === "#customer-journey" || hash.startsWith("#agency-"))) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start", behavior: navigationType === "POP" ? "auto" : "instant" });
    } else if (primary(pathname) && !hash && navigationType !== "POP") {
      window.scrollTo({ top: 0, behavior: "instant" });
      main?.focus({ preventScroll: true });
    }
    if (switching && (navigationType === "POP" || !document.startViewTransition) &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const animation = main?.animate?.([{ opacity: 0.7, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
        { duration: 260, easing: "cubic-bezier(.22, 1, .36, 1)" });
      return () => animation?.cancel();
    }
  }, [pathname, hash, navigationType]);
  return null;
}

const isHubPath = (path: string) =>
  path === "/hub" || path.startsWith("/hub/") || path === "/portal" || path.startsWith("/portal/");

// Keeps analytics, the pixel and the cookie banner off the private hub and client portal.
const PublicOnly = ({ children }: { children: ReactNode }) =>
  isHubPath(useLocation().pathname) ? null : <>{children}</>;

const skipHubEvents = <T extends { url: string }>(event: T) =>
  isHubPath(new URL(event.url, window.location.origin).pathname) ? null : event;


const queryClient = new QueryClient();
const isLocalPreview = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(window.location.hostname);

function ViewReady({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

const App = ({ hydratePrimary = false }: { hydratePrimary?: boolean }) => {
  // Each primary route is prerendered. Mount client widgets after
  // the route has hydrated so React can keep the original first-paint DOM.
  const [widgetsReady, setWidgetsReady] = useState(!hydratePrimary);
  const showWidgets = useCallback(() => startTransition(() => setWidgetsReady(true)), []);
  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        {widgetsReady && <Toaster />}
        {widgetsReady && <Sonner />}
        <BrowserRouter>
          <PublicOnly>
            <MetaPixelRouteTracker />
            <ConversionTracker />
            <PulseTracker />
          </PublicOnly>
          <Suspense fallback={pageFallback}>
          <Routes>
            <Route path="/" element={<AgencyEntry />} />
            <Route path={PORTFOLIO_PATH} element={<PortfolioView />} />
            <Route path="/agency" element={<AgencyEntry legacy />} />
            <Route path="/agency/overview" element={<Agency />} />
            <Route path="/agency/services" element={<Agency pageKey="services" />} />
            <Route path="/agency/results" element={<AgencyResults />} />
            <Route path="/agency/pricing" element={<Agency pageKey="pricing" />} />
            <Route path="/agency/contact" element={<Agency pageKey="contact" />} />
            <Route path="/agency/blog" element={<AgencyBlog />} />
            <Route path="/agency/blog/topics/:hub" element={<AgencyBlogHub />} />
            <Route path="/agency/blog/:slug" element={<AgencyBlogPost />} />
            <Route path="/agency/ad-budget-calculator" element={<AgencyCalculator />} />
            {/* Service "money pages". Declared after the blog routes, which are
                more specific, so /agency/blog is never captured by :service. */}
            <Route path="/agency/:service" element={<AgencyService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/work/design" element={<WorkDesign />} />
            <Route path="/work/mockups" element={<WorkMockups />} />
            <Route path="/work/videos" element={<WorkVideos />} />
            <Route path="/work/case-studies" element={<WorkCaseStudies />} />
            <Route path="/work/branding" element={<Suspense fallback={pageFallback}><WorkBranding /></Suspense>} />
            <Route path="/work/branding/:slug" element={<Suspense fallback={pageFallback}><WorkBrand /></Suspense>} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                  <Admin />
                </Suspense>
              }
            />
            <Route path="/hub/*" element={<HubApp />} />
            <Route path="/portal/*" element={<PortalApp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PrimaryViewScroll />
          {!widgetsReady && <ViewReady onReady={showWidgets} />}
          </Suspense>
          {widgetsReady && <PublicOnly>
            <Suspense fallback={null}><WhatsAppButton /></Suspense>
            <CookieConsent />
          </PublicOnly>}
        </BrowserRouter>
        {!isLocalPreview && <Analytics beforeSend={skipHubEvents} />}
        {!isLocalPreview && <SpeedInsights beforeSend={skipHubEvents} />}
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
