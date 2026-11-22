import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgencyNavigation } from "@/components/agency/AgencyNavigation";
import { AgencyPhoto } from "@/components/agency/AgencyPhoto";
import { AgencyPageCta, AgencyPageFooter, AgencyPageHeader, SubHeading } from "@/components/agency/AgencyPageSections";
import { CardCover } from "@/components/agency/CardCover";
import { ResultsInsights } from "@/components/agency/ResultsInsights";
import { Seo } from "@/components/Seo";
import { agencyPages } from "@/data/agencyPages";
import { agencyHeroPhotos } from "@/data/agencyPageMedia";
import { blogSummaries } from "@/data/blogSummaries";
import { caseStudies } from "@/data/caseStudies";
import { combinedAds } from "@/data/combinedAdsCaseStudy";
import { formatKes } from "@/data/services";
import { trackSpotlight } from "@/lib/spotlight";
import { contentImageProps } from "@/lib/responsiveImage";
import { agencyHead } from "@/seo/agencyHeads";
import { TypePairScope } from "@/components/type/TypePair";
import { PAGE_TYPE_PAIRS } from "@/lib/typePairs";

export default function AgencyResults() {
  return (
    <div className="agency-page min-h-screen bg-background" data-agency-results>
      <Seo {...agencyHead("results")} />
      <AgencyNavigation />
      <TypePairScope as="main" pair={PAGE_TYPE_PAIRS.results.pair}>
        <AgencyPageHeader page={agencyPages.results} pairMain={PAGE_TYPE_PAIRS.results.main} visual={
          <figure className="surface-card overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden">
              <AgencyPhoto {...agencyHeroPhotos.results} sizes="(min-width: 1280px) 470px, (min-width: 1024px) 44vw, 100vw" priority className="object-bottom" />
            </div>
            <figcaption className="p-5 sm:p-6">
              <span className="block text-sm font-medium text-muted-foreground">Attributed revenue</span>
              <strong className="mt-1 block font-display text-3xl font-bold tracking-tight text-primary tabular-nums sm:text-4xl">
                KES {formatKes(combinedAds.after.value)}
              </strong>
              <span className="mt-2 block text-sm text-muted-foreground">{combinedAds.platform} · {combinedAds.period}</span>
            </figcaption>
          </figure>
        }>
          <Button className="mt-8 rounded-full" asChild><a href="#campaign-metrics">Explore campaign charts</a></Button>
        </AgencyPageHeader>
        <ResultsInsights />
        <section id="results" className="container mx-auto px-4 py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
          <SubHeading eyebrow="Case studies" title="Real Results for Real Brands"
            aside={<Link to="/work/case-studies" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">All case studies in full <ArrowRight className="h-4 w-4" aria-hidden /></Link>}>
            Tracked campaigns with the numbers, strategy and attribution behind them. Clients in these case studies are not named; the figures are real.
          </SubHeading>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs, i) => (
              <Link key={cs.id} to={`/work/case-studies#${cs.id}`} onMouseMove={trackSpotlight}
                className="spotlight surface-card group flex h-full flex-col overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                {/* Stock illustration, not the client: request a card-sized crop. */}
                <CardCover src={cs.cover.src} alt={cs.cover.alt} className="aspect-[16/9]">
                  {i === 0 && <span className="absolute left-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">Latest</span>}
                </CardCover>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{cs.tag} · {cs.period}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">{cs.title}</h3>
                  <p className="mt-2 mb-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{cs.summary}</p>
                  <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-border/60 pt-5">
                    {cs.stats.map((st) => (
                      <div key={st.label} className="min-w-0">
                        <dt className="sr-only">{st.label}</dt>
                        <dd className="whitespace-nowrap font-display text-base font-bold leading-tight text-gradient tabular-nums xl:text-lg">{st.value}</dd>
                        <dd className="mt-1 text-[11px] leading-snug text-muted-foreground">{st.label}</dd>
                      </div>
                    ))}
                  </dl>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Read the full case study <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          </div>
          <div className="max-w-6xl mx-auto mt-16">
            <SubHeading eyebrow="Go deeper" title="Read the campaign breakdowns">The portfolio contains the wider creative work. These articles explain the marketing decisions, campaign context and reported results.</SubHeading>
            <div className="grid sm:grid-cols-2 gap-4">{[
              "meta-ads-turnaround-case-study-kenya-2026", "convey-communications-case-study-10x-leads",
              "0-to-4-million-tiktok-views-behind-the-campaign", "nyeri-county-campaign-hyper-local-marketing",
            ].map(slug => blogSummaries.find(post => post.slug === slug)).filter(post => post !== undefined).map(post => <Link key={post.slug} to={`/agency/blog/${post.slug}`} onMouseMove={trackSpotlight} className="spotlight surface-card group flex flex-col overflow-hidden transition-colors hover:border-primary/40">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={post.thumbnail} {...contentImageProps(post.thumbnail, "(min-width: 1280px) 568px, (min-width: 640px) 50vw, 100vw")} alt={post.thumbnailAlt}
                  width={640} height={360} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Case study</p>
              <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{post.title}</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">Read the breakdown <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
              </div>
            </Link>)}</div>
            <p className="mt-6 text-sm text-muted-foreground">My work with Convey began as an employee and later continued as a consultant. Each linked case study provides its own context; these outcomes are not a promise of future results.</p>
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/work/case-studies">See All Case Studies <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </Button>
          </div>
        </section>
        <AgencyPageCta />
      </TypePairScope>
      <AgencyPageFooter />
    </div>
  );
}
