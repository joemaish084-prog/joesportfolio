import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkPageLayout } from "@/components/WorkPageLayout";
import { MetaTurnaroundDetail } from "@/components/case-studies/MetaTurnaroundDetail";
import { SocialCampaignDetail } from "@/components/case-studies/SocialCampaignDetail";
import { caseStudies } from "@/data/caseStudies";
import { getHubBySlug, getHubPosts } from "@/data/blogHubs";
import { metaTurnaround } from "@/data/metaTurnaroundCaseStudy";

const DETAILS: Record<string, () => ReactNode> = {
  "meta-ads-turnaround": () => <MetaTurnaroundDetail />,
  "social-media-2025": () => <SocialCampaignDetail />,
};

// Written campaign breakdowns from the blog, newest first. The Meta turnaround
// is left out because it is already shown in full above.
const hub = getHubBySlug("case-studies");
const writeUps = (hub ? getHubPosts(hub) : [])
  .filter((p) => p.slug !== metaTurnaround.slug)
  .sort((a, b) => b.date.localeCompare(a.date));

const WorkCaseStudies = () => {
  const { hash } = useLocation();

  // Arriving from a homepage card: jump to that case study once it has rendered.
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <WorkPageLayout
      seo={{
        title: "Digital Marketing Case Studies | Joseph Maina, Nairobi",
        description:
          "Campaign case studies with real numbers: a Meta Ads turnaround, a year of video-first social media and more work for Kenyan brands. Newest first.",
        path: "/work/case-studies",
      }}
      backHref="/#case-study"
      eyebrow="Case studies"
      title={
        <>
          Case <span className="text-gradient">Studies</span>
        </>
      }
      intro="Campaigns with the numbers behind them, including what did not work. The newest is always first."
      meta={[`${caseStudies.length} in-depth`, `${writeUps.length} written breakdowns`, "Newest first"]}
    >
      <nav aria-label="Case studies on this page" className="mt-8 grid gap-3 sm:grid-cols-2">
        {caseStudies.map((cs, i) => (
          <a
            key={cs.id}
            href={`#${cs.id}`}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/60"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold tabular-nums text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {cs.tag} · {cs.period}
              </span>
              <span className="mt-0.5 block font-semibold leading-snug group-hover:text-primary">{cs.title}</span>
            </span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-10">
        {caseStudies.map((cs, i) => (
          <section
            key={cs.id}
            id={cs.id}
            className="on-dark dot-grid scroll-mt-24 rounded-3xl border p-5 sm:p-10"
            style={{ background: "hsl(var(--case-study-bg))", borderColor: "hsl(var(--case-study-card-border))" }}
          >
            <header className="mb-8 max-w-3xl sm:mb-10">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span>
                  {cs.tag} · {cs.period}
                </span>
                {i === 0 && (
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold tracking-wider text-primary-foreground">
                    Latest
                  </span>
                )}
              </p>
              <h2
                className="mt-3 text-2xl sm:text-4xl font-display font-bold tracking-tight"
                style={{ color: "hsl(var(--case-study-text))" }}
              >
                {cs.title}
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "hsl(var(--case-study-muted))" }}>
                {cs.summary}
              </p>
            </header>
            {DETAILS[cs.id]?.()}
          </section>
        ))}
      </div>

      {writeUps.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">More campaign breakdowns</h2>
          <p className="mt-2 text-muted-foreground">Written case studies from the blog.</p>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {writeUps.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/agency/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-elegant"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.thumbnailAlt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs text-muted-foreground">
                      {post.dateLabel} · {post.readTime}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read the breakdown
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-16 rounded-3xl border border-border bg-card/60 p-8 text-center sm:p-12">
        <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">Want results like these?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Tell me about your brand and your numbers, and I will tell you plainly what I would change first.
        </p>
        <Button variant="gradient" size="lg" asChild className="mt-7">
          <a href="/#contact" className="gap-2">
            Let's work together
            <ArrowRight className="h-5 w-5" />
          </a>
        </Button>
      </section>
    </WorkPageLayout>
  );
};

export default WorkCaseStudies;
