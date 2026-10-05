import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";

interface LegalPageProps {
  title: string;
  description: string;
  path: string;
  heading: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPage({ title, description, path, heading, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <Seo title={title} description={description} path={path} />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">{heading}</h1>
            <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>
            <article className="prose prose-invert max-w-none space-y-6 text-foreground/90 leading-relaxed">
              {children}
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl md:text-2xl font-display font-semibold text-primary">{title}</h2>
      <div className="space-y-3 text-base">{children}</div>
    </section>
  );
}
