import { useLocation } from "react-router-dom";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const { pathname } = useLocation();
  return (
    <>
      <Seo title="Page Not Found (404) | Joseph Maina"
        description="This page could not be found. Explore Joseph Maina's portfolio, services and blog."
        path={pathname} noindex />
      <main className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404 ? Page not found</h1>
          <p className="mb-4 text-xl text-muted-foreground">This page may have moved or the address may be incorrect.</p>
          <a href="/" className="text-primary underline hover:text-primary/90">Return to Home</a>
        </div>
      </main>
    </>
  );
};

export default NotFound;
