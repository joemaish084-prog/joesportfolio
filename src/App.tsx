import { Suspense, lazy, useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { CookieConsent } from "@/components/CookieConsent";
import { MetaPixelRouteTracker } from "@/components/MetaPixelRouteTracker";
import { ConversionTracker } from "@/components/ConversionTracker";
import { PulseTracker } from "@/components/PulseTracker";
import { preloadHomeSections } from "./pages/homeSections";
const Index = lazy(() => import("./pages/Index"));
const Agency = lazy(() => import("./pages/Agency"));
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
const WorkVideos = lazy(() => import("./pages/WorkVideos"));
const WorkCaseStudies = lazy(() => import("./pages/WorkCaseStudies"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
// Image-heavy brand books load on demand so they stay out of the main bundle.
const WorkBranding = lazy(() => import("./pages/WorkBranding"));
const WorkBrand = lazy(() => import("./pages/WorkBrand"));
// Private back office. Lazy, unlinked and noindexed; see src/hub.
const HubApp = lazy(() => import("./hub/HubApp"));
// Retain the trusted build-generated page while its route chunk loads. The
// initial createRoot render would otherwise replace visible HTML with a blank.
const initialPath = window.location.pathname;
// The homepage sections are the bulk of the page; fetch them alongside Index.
if (initialPath === "/") preloadHomeSections();
let initialMarkup = document.getElementById("root")?.innerHTML ?? "";
function RouteFallback() {
  const { pathname } = useLocation();
  useEffect(() => () => { initialMarkup = ""; }, []);
  return pathname === initialPath && initialMarkup
    ? <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: initialMarkup }} />
    : <div className="min-h-screen bg-background" />;
}
const pageFallback = <RouteFallback />;

const isHubPath = (path: string) => path === "/hub" || path.startsWith("/hub/");

// Keeps analytics, the pixel and the cookie banner off the private hub.
const PublicOnly = ({ children }: { children: ReactNode }) =>
  isHubPath(useLocation().pathname) ? null : <>{children}</>;

const skipHubEvents = <T extends { url: string }>(event: T) =>
  isHubPath(new URL(event.url, window.location.origin).pathname) ? null : event;


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PublicOnly>
            <MetaPixelRouteTracker />
            <ConversionTracker />
            <PulseTracker />
          </PublicOnly>
          <Suspense fallback={pageFallback}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agency" element={<Agency />} />
            <Route path="/agency/services" element={<Agency pageKey="services" />} />
            <Route path="/agency/results" element={<Agency pageKey="results" />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <PublicOnly>
            <CookieConsent />
          </PublicOnly>
        </BrowserRouter>
        <Analytics beforeSend={skipHubEvents} />
        <SpeedInsights beforeSend={skipHubEvents} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
