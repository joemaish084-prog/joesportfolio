/* eslint-disable react-refresh/only-export-components -- build-time module, never hot-reloaded */
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { blogPosts, AUTHOR, type BlogPost } from "@/data/blogPosts";
import { blogHubs, getHubPosts, getRelatedByHub, getPrimaryHubForPost, getUnhubbedPosts } from "@/data/blogHubs";
import { servicePages, SERVICE_PROCESS, type ServicePage } from "@/data/servicePages";
import { brands, type Brand } from "@/data/brands";
import {
  STATIC_HEADS,
  blogHubHead,
  blogIndexHead,
  blogPostHead,
  brandHead,
  serviceHead,
  type PageHead,
} from "@/seo/heads";

/**
 * Build-time only. scripts/prerender.mjs bundles this file and writes one HTML
 * file per route, so pages are readable without JavaScript. The browser never
 * loads it: the React app replaces #root as soon as it mounts.
 */

import type { OgCard } from "@/prerender/ogCard";

export { SITE_URL, headTags } from "@/seo/heads";
export { renderOgCard } from "@/prerender/ogCard";

export interface PrerenderRoute {
  path: string;
  head: PageHead;
  /** Markup placed in #root. Omitted for the homepage, which has its own <noscript> summary. */
  body?: string;
  /** Text for the generated social card at /og/<path>.png (see ogCardImage). */
  card?: OgCard;
  sitemap?: { priority: number; changefreq: "weekly" | "monthly" | "yearly"; lastmod?: string };
}

// ------------------------------------------------------------------- markup

const NAV = [
  { href: "/", label: "Home" },
  { href: "/agency", label: "Agency" },
  { href: "/agency/blog", label: "Blog" },
  { href: "/work/case-studies", label: "Case Studies" },
  { href: "/work/videos", label: "Videos" },
  { href: "/work/design", label: "Design" },
  { href: "/work/branding", label: "Branding" },
];

function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      data-prerender=""
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui,-apple-system,sans-serif",
        lineHeight: 1.6,
      }}
    >
      <nav aria-label="Main">
        {NAV.map((item, i) => (
          <span key={item.href}>
            {i > 0 && " · "}
            <a href={item.href}>{item.label}</a>
          </span>
        ))}
      </nav>
      <main>{children}</main>
      <footer>
        <p>
          Joseph Maina · Digital Marketing Specialist · Nairobi, Kenya ·{" "}
          <a href="mailto:joemaish084@gmail.com">joemaish084@gmail.com</a> · WhatsApp{" "}
          <a href="https://wa.me/254704700160">+254 704 700 160</a>
        </p>
      </footer>
    </div>
  );
}

const PostLink = ({ post }: { post: BlogPost }) => (
  <li>
    <a href={`/agency/blog/${post.slug}`}>{post.title}</a> — {post.excerpt}
  </li>
);

function SimplePage({ head, children }: { head: PageHead; children?: ReactNode }) {
  return (
    <Shell>
      <h1>{head.ogTitle ?? head.title}</h1>
      <p>{head.description}</p>
      {children}
    </Shell>
  );
}

function PostPage({ post }: { post: BlogPost }) {
  const hub = getPrimaryHubForPost(post.slug);
  return (
    <Shell>
      <article>
        <p>
          <a href="/agency/blog">Blog</a>
          {hub && (
            <>
              {" › "}
              <a href={`/agency/blog/topics/${hub.slug}`}>{hub.name}</a>
            </>
          )}
        </p>
        <h1>{post.title}</h1>
        <p>
          By {AUTHOR} · <time dateTime={post.date}>{post.dateLabel}</time> · {post.readTime}
        </p>
        <img src={post.thumbnail} alt={post.thumbnailAlt} width={800} />
        <p>{post.intro}</p>
        {post.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {section.image && (
              <figure>
                <img src={section.image.src} alt={section.image.alt} width={800} />
                {section.image.caption && <figcaption>{section.image.caption}</figcaption>}
              </figure>
            )}
          </section>
        ))}
      </article>
      {hub && (
        <aside>
          <h2>{hub.cta.heading}</h2>
          <p>{hub.cta.body}</p>
          <p>
            <a href={hub.cta.href}>{hub.cta.label}</a>
          </p>
        </aside>
      )}
      <h2>Related articles</h2>
      <ul>
        {getRelatedByHub(post.slug).map((p) => (
          <PostLink key={p.slug} post={p} />
        ))}
      </ul>
    </Shell>
  );
}

function ServicePageBody({ page }: { page: ServicePage }) {
  const answered = page.faqs.filter((f) => !f.a.includes("[CONFIRM]"));
  const related = page.relatedPosts
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p));
  return (
    <Shell>
      <p>
        <a href="/agency">Agency</a> › {page.navLabel}
      </p>
      <h1>{page.name}</h1>
      <p>{page.standfirst}</p>
      <p>
        <strong>{page.price.amount}</strong> — {page.price.note}
      </p>
      <h2>Who this is for</h2>
      <ul>
        {page.whoFor.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <h2>What's included</h2>
      <ul>
        {page.included.map((item) => (
          <li key={item.title}>
            <strong>{item.title}</strong> — {item.desc}
          </li>
        ))}
      </ul>
      <h2>How it works</h2>
      <ol>
        {SERVICE_PROCESS.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong> — {step.desc}
          </li>
        ))}
      </ol>
      <h2>Case study: {page.caseStudy.name}</h2>
      <p>{page.caseStudy.challenge}</p>
      <p>{page.caseStudy.results}</p>
      {answered.length > 0 && (
        <>
          <h2>Frequently asked questions</h2>
          {answered.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </>
      )}
      {related.length > 0 && (
        <>
          <h2>Further reading</h2>
          <ul>
            {related.map((p) => (
              <PostLink key={p.slug} post={p} />
            ))}
          </ul>
        </>
      )}
      <p>
        <a href={page.cta.href}>{page.cta.label}</a>
      </p>
    </Shell>
  );
}

function BrandPageBody({ brand }: { brand: Brand }) {
  return (
    <Shell>
      <p>
        <a href="/work/branding">Branding</a> › {brand.name}
      </p>
      <h1>{brand.name} Brand Identity</h1>
      <p>{brand.tagline}</p>
      <p>
        {brand.sector} · {brand.year} · {brand.scope.join(", ")}
      </p>
      <p>{brand.brief}</p>
      {brand.approach.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </Shell>
  );
}

const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>);

const newest = (posts: BlogPost[]) => posts.map((p) => p.date).sort().pop();

// -------------------------------------------------------------------- routes

export function getPrerenderRoutes(): PrerenderRoute[] {
  const routes: PrerenderRoute[] = [
    { path: "/", head: STATIC_HEADS.home, sitemap: { priority: 1.0, changefreq: "monthly" } },
    {
      path: "/agency",
      head: STATIC_HEADS.agency,
      body: html(
        <SimplePage head={STATIC_HEADS.agency}>
          <h2>Read by topic</h2>
          <ul>
            {blogHubs.map((h) => (
              <li key={h.slug}>
                <a href={`/agency/blog/topics/${h.slug}`}>{h.name}</a> — {h.tagline}
              </li>
            ))}
          </ul>
          <p>
            <a href="https://calendly.com/joemaish084/30min">Book a free discovery call</a>
          </p>
        </SimplePage>,
      ),
      sitemap: { priority: 0.9, changefreq: "monthly" },
    },
    {
      path: "/agency/blog",
      head: blogIndexHead(),
      body: html(
        <SimplePage head={{ ...blogIndexHead(), ogTitle: "Digital Marketing Blog Kenya" }}>
          {blogHubs.map((h) => (
            <section key={h.slug}>
              <h2>
                <a href={`/agency/blog/topics/${h.slug}`}>{h.name}</a>
              </h2>
              <p>{h.tagline}</p>
              <ul>
                {getHubPosts(h).map((p) => (
                  <PostLink key={p.slug} post={p} />
                ))}
              </ul>
            </section>
          ))}
          {getUnhubbedPosts().length > 0 && (
            <section>
              <h2>More articles</h2>
              <ul>
                {getUnhubbedPosts().map((p) => (
                  <PostLink key={p.slug} post={p} />
                ))}
              </ul>
            </section>
          )}
        </SimplePage>,
      ),
      card: {
        eyebrow: "The Blog",
        title: "Digital marketing for Kenyan brands, written plainly.",
        meta: `${blogPosts.length} articles on Meta Ads, Google Ads, SEO and TikTok`,
      },
      sitemap: { priority: 0.8, changefreq: "weekly", lastmod: newest(blogPosts) },
    },
  ];

  for (const hub of blogHubs) {
    const head = blogHubHead(hub);
    const posts = getHubPosts(hub);
    routes.push({
      path: head.path,
      head,
      body: html(
        <Shell>
          <p>
            <a href="/agency/blog">Blog</a> › {hub.name}
          </p>
          <h1>{hub.metaTitle}</h1>
          {hub.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <ul>
            {posts.map((p) => (
              <PostLink key={p.slug} post={p} />
            ))}
          </ul>
          <p>
            <a href={hub.cta.href}>{hub.cta.label}</a>
          </p>
        </Shell>,
      ),
      card: { eyebrow: "Topic guide", title: hub.name, meta: hub.tagline },
      sitemap: { priority: 0.8, changefreq: "weekly", lastmod: newest(posts) },
    });
  }

  for (const post of blogPosts) {
    const head = blogPostHead(post);
    routes.push({
      path: head.path,
      head,
      body: html(<PostPage post={post} />),
      card: {
        eyebrow: getPrimaryHubForPost(post.slug)?.name ?? post.category,
        title: post.title,
        meta: `${post.readTime} · ${post.dateLabel}`,
      },
      sitemap: { priority: 0.7, changefreq: "monthly", lastmod: post.date },
    });
  }

  for (const page of servicePages) {
    const head = serviceHead(page);
    routes.push({
      path: head.path,
      head,
      body: html(<ServicePageBody page={page} />),
      card: { eyebrow: page.navLabel, title: page.name, meta: page.price.amount },
      // Drafts stay noindex and out of the sitemap until their [CONFIRM] markers are cleared.
      sitemap: page.draft ? undefined : { priority: 0.9, changefreq: "monthly" },
    });
  }

  const caseStudyPosts = blogHubs.find((h) => h.slug === "case-studies");
  routes.push(
    {
      path: STATIC_HEADS.workCaseStudies.path,
      head: STATIC_HEADS.workCaseStudies,
      body: html(
        <SimplePage head={STATIC_HEADS.workCaseStudies}>
          {caseStudyPosts && (
            <ul>
              {getHubPosts(caseStudyPosts).map((p) => (
                <PostLink key={p.slug} post={p} />
              ))}
            </ul>
          )}
        </SimplePage>,
      ),
      sitemap: { priority: 0.8, changefreq: "monthly" },
    },
    {
      path: STATIC_HEADS.workVideos.path,
      head: STATIC_HEADS.workVideos,
      body: html(<SimplePage head={STATIC_HEADS.workVideos} />),
      sitemap: { priority: 0.8, changefreq: "monthly" },
    },
    {
      path: STATIC_HEADS.workDesign.path,
      head: STATIC_HEADS.workDesign,
      body: html(<SimplePage head={STATIC_HEADS.workDesign} />),
      sitemap: { priority: 0.8, changefreq: "monthly" },
    },
    {
      path: STATIC_HEADS.workBranding.path,
      head: STATIC_HEADS.workBranding,
      body: html(
        <SimplePage head={STATIC_HEADS.workBranding}>
          <ul>
            {brands.map((b) => (
              <li key={b.slug}>
                <a href={`/work/branding/${b.slug}`}>{b.name}</a> — {b.tagline}
              </li>
            ))}
          </ul>
        </SimplePage>,
      ),
      sitemap: { priority: 0.8, changefreq: "monthly" },
    },
  );

  for (const brand of brands) {
    const head = brandHead(brand);
    routes.push({
      path: head.path,
      head,
      body: html(<BrandPageBody brand={brand} />),
      card: { eyebrow: "Brand identity", title: brand.name, meta: brand.tagline },
      sitemap: { priority: 0.7, changefreq: "yearly" },
    });
  }

  for (const head of [STATIC_HEADS.connect, STATIC_HEADS.privacy, STATIC_HEADS.cookies, STATIC_HEADS.terms]) {
    routes.push({
      path: head.path,
      head,
      body: html(<SimplePage head={head} />),
      sitemap: head === STATIC_HEADS.connect ? undefined : { priority: 0.3, changefreq: "yearly" },
    });
  }

  return routes;
}
