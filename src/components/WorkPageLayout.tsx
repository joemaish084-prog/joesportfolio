import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import type { PageHead } from "@/seo/heads";

interface WorkPageLayoutProps {
  seo: PageHead;
  /** Where "Back to portfolio" returns to, e.g. "/#graphic-design". */
  backHref: string;
  eyebrow: string;
  title: ReactNode;
  intro: string;
  /** Short facts shown beside the title, e.g. "33 designs". */
  meta?: string[];
  children: ReactNode;
}

/** Shared shell for the dedicated portfolio pages under /work. */
export function WorkPageLayout({ seo, backHref, eyebrow, title, intro, meta, children }: WorkPageLayoutProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Seo {...seo} />
      <SiteHeader />
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-20 sm:pb-28">
          <Link
            to={backHref}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to portfolio
          </Link>

          <header className="mt-6 flex flex-col gap-6 border-b border-border pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
                {title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{intro}</p>
            </div>
            {meta && meta.length > 0 && (
              <ul className="flex flex-wrap gap-2 lg:justify-end">
                {meta.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </header>

          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
