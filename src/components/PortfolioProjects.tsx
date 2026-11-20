import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { caseStudies, portfolioLeadCover } from "@/data/caseStudies";
import { shopifyProject } from "@/data/shopify";
import seoImage from "@/assets/marquee/beautysquare.webp";
import shopifyCard from "@/assets/agency/babyshop-dansar-card.webp";
import "@/components/agency/studio.css";

const filters = ["All", "Meta Ads", "Google Ads", "TikTok Ads", "SEO", "Social Media Management", "Media Buying", "Shopify"] as const;
type Service = Exclude<typeof filters[number], "All">;

interface Project {
  id: string;
  title: string;
  services: Service[];
  image: string;
  alt?: string;
  problem: string;
  work: string;
  result: string;
  more: string;
}

const paidAndSocial: Record<string, Pick<Project, "services" | "problem" | "work">> = {
  "property-lead-funnel": {
    services: ["Meta Ads", "Media Buying"],
    problem: "A residential developer needed to see how many ad enquiries turned into serious buyers.",
    work: "Reviewed Meta lead forms and Instagram conversations, then mapped how many people progressed at each step.",
  },
  "meta-google-combined": {
    services: ["Meta Ads", "Google Ads", "Media Buying"],
    problem: "A Kenyan beauty retailer wanted to reach new customers and capture shoppers already searching for its products.",
    work: "Ran Meta and Google campaigns and combined the platform reports into one view of spend, orders, and attributed revenue.",
  },
  "google-ads-launch": {
    services: ["Google Ads", "Media Buying"],
    problem: "A Kenyan retailer had never run Google Search or Shopping ads.",
    work: "Started with one Search campaign, then added Shopping once the Search campaign had enough data.",
  },
  "meta-ads-turnaround": {
    services: ["Meta Ads", "Media Buying"],
    problem: "A Nairobi beauty retailer needed its Facebook and Instagram campaigns to drive purchases.",
    work: "Reviewed campaign performance, focused spend on the strongest product campaigns, and tracked purchases in Meta Ads Manager.",
  },
  "instagram-spike": {
    services: ["Social Media Management"],
    problem: "A skincare clinic needed more people to discover its Instagram content.",
    work: "Reviewed the posts behind the spike, separating views and reach from follower growth to understand which pieces contributed.",
  },
  "awareness-campaigns": {
    services: ["Meta Ads", "Media Buying"],
    problem: "A small budget had to reach as many people as possible across several campaigns.",
    work: "Ran four awareness campaigns and compared reach, spending, and cost per thousand impressions.",
  },
  "social-media-2025": {
    services: ["Social Media Management"],
    problem: "iClear needed a consistent stream of content across TikTok, Instagram, and Facebook.",
    work: "Planned, filmed, and edited a year of video-first content, then measured the response by channel.",
  },
};

const projects: Project[] = [
  ...caseStudies.flatMap(study => {
    const detail = paidAndSocial[study.id];
    if (!detail) return [];
    return [{
      ...detail, id: study.id, title: study.title, image: study.cover.src, alt: study.cover.alt,
      result: study.stats.slice(0, 2).map(({ value, label }) => `${value} ${label.toLowerCase()}`).join(" · "),
      more: `/work/case-studies#${study.id}`,
    }];
  }),
  {
    id: "beauty-square-search", title: "Beauty Square Kenya in organic search", image: seoImage, services: ["SEO"],
    problem: "Beauty Square Kenya wanted more visibility in organic search.",
    work: "Worked on improving the site’s organic search visibility. [PLACEHOLDER] Add the specific SEO changes made for this project.",
    result: "The reported search position improved from 20 to 14, then to 9.",
    more: "/agency/seo-services-nairobi",
  },
  {
    id: "babyshop-dansar", title: shopifyProject.name, image: shopifyCard, services: ["Shopify"],
    problem: "Shoppers needed a place to browse baby and maternity essentials online.",
    work: shopifyProject.description,
    result: "A live Shopify storefront featuring product collections, new arrivals, best sellers, and mobile product pages.",
    more: "/portfolio#shopify",
  },
];

export function PortfolioProjects() {
  const [filter, setFilter] = useState<typeof filters[number]>("All");
  const visible = projects.filter(project => filter === "All" || project.services.includes(filter));

  return (
    <section className="studio studio-portfolio" id="selected-work" aria-labelledby="portfolio-heading">
      <div className="studio-container">
        <p className="studio-kicker">Joseph Maina · Portfolio</p>
        <h2 id="portfolio-heading">Selected work.</h2>
        <p className="studio-portfolio-intro">Explore the brief, the work, and the result behind campaigns and storefronts I’ve worked on.</p>
        <div className="studio-project-filters" role="group" aria-label="Filter projects by service">
          {filters.map(service => <button key={service} type="button" aria-pressed={filter === service} onClick={() => setFilter(service)}>{service}</button>)}
        </div>
        <p className="sr-only" role="status">{visible.length} {visible.length === 1 ? "project" : "projects"} shown</p>
        {visible.length ? (
          <ul className="studio-project-grid">
            {visible.map(project => <li key={project.id}>
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="studio-project-card" aria-controls={`project-detail-${project.id}`}>
                    <img src={project.image} alt={project.alt ?? ""} width={400} height={225} decoding="async"
                      loading="lazy"
                      {...(project.id === projects[0].id ? {
                        ...portfolioLeadCover,
                      } : {})} />
                    <span className="studio-project-body">
                      <span className="studio-kicker">{project.services[0]}</span>
                      <span className="studio-project-title">{project.title}</span>
                      <span className="studio-project-result">{project.result}</span>
                      <span className="studio-text-link">View project</span>
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent id={`project-detail-${project.id}`} className="studio studio-project-dialog">
                  <DialogTitle>{project.title}</DialogTitle>
                  <DialogDescription>{project.services.join(" · ")}</DialogDescription>
                  <dl>
                    <div><dt>The problem</dt><dd>{project.problem}</dd></div>
                    <div><dt>What I did</dt><dd>{project.work}</dd></div>
                    <div><dt>The result</dt><dd>{project.result}</dd></div>
                  </dl>
                  <DialogClose asChild>
                    <Link className="studio-text-link" to={project.more}>
                      {project.more.startsWith("/portfolio#") ? "See the storefront" : "Read the full breakdown"}
                    </Link>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </li>)}
          </ul>
        ) : (
          <p className="studio-project-note">Explore <Link className="studio-text-link" to="/work/videos">short-form video work</Link> or <Link className="studio-text-link" to="/agency/services#service-tiktok-ads">TikTok Ads management</Link>.</p>
        )}
      </div>
    </section>
  );
}
