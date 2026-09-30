import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import Agency from "./pages/Agency";
import AgencyBlog from "./pages/AgencyBlog";
import AgencyBlogHub from "./pages/AgencyBlogHub";
import AgencyService from "./pages/AgencyService";
import AgencyBlogPost from "./pages/AgencyBlogPost";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Terms from "./pages/Terms";
import Connect from "./pages/Connect";
import NotFound from "./pages/NotFound";
import { CookieConsent } from "@/components/CookieConsent";
import { MetaPixelRouteTracker } from "@/components/MetaPixelRouteTracker";
import { ConversionTracker } from "@/components/ConversionTracker";
import { PulseTracker } from "@/components/PulseTracker";
const Admin = lazy(() => import("./pages/Admin"));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MetaPixelRouteTracker />
          <ConversionTracker />
          <PulseTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agency" element={<Agency />} />
            <Route path="/agency/blog" element={<AgencyBlog />} />
            <Route path="/agency/blog/topics/:hub" element={<AgencyBlogHub />} />
            <Route path="/agency/blog/:slug" element={<AgencyBlogPost />} />
            {/* Service "money pages". Declared after the blog routes, which are
                more specific, so /agency/blog is never captured by :service. */}
            <Route path="/agency/:service" element={<AgencyService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/connect" element={<Connect />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                  <Admin />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
        <Analytics />
        <SpeedInsights />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
