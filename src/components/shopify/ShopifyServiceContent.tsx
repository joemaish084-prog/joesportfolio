import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, MessageCircle } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { AgencyNavigation } from "@/components/agency/AgencyNavigation";
import { Button } from "@/components/ui/button";
import { serviceHead } from "@/seo/pageHeads";
import type { ServicePage } from "@/data/servicePages";
import { SHOPIFY_BRIEF, migrationReasons, shopifyOffers, shopifyProject } from "@/data/shopify";
import { track } from "@/lib/track";
import { ShopifyProjectVisual } from "./ShopifyProjectVisual";

export function ShopifyServiceContent({ page }: { page: ServicePage }) {
  const location = useLocation();
  const [selected, setSelected] = useState<string>("create");
  const [reason, setReason] = useState<string>("");
  const offer = shopifyOffers.find(item => item.id === selected) ?? shopifyOffers[0];

  useEffect(() => {
    const key = location.hash.slice(1);
    if (shopifyOffers.some(item => item.id === key)) setSelected(key);
    if (!key) { window.scrollTo(0, 0); return; }
    const frame = requestAnimationFrame(() => document.getElementById(key)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  const migrationBrief = `/agency/contact?service=shopify-migrate${reason ? `&reason=${encodeURIComponent(reason)}` : ""}#brief`;

  return (
    <div className="service-page min-h-screen bg-background text-foreground">
      <Seo {...serviceHead(page)} />
      <AgencyNavigation />
      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm"><Link to="/agency" className="inline-flex min-h-9 items-center gap-1.5 hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Agency</Link><ChevronRight className="h-3 w-3" aria-hidden="true" /><Link to="/agency/services" className="inline-flex min-h-9 items-center hover:text-primary">Services</Link><ChevronRight className="h-3 w-3" aria-hidden="true" /><span>Shopify</span></nav>

        <header data-track-location="shopify_hero" className="pb-12 pt-8 sm:pb-16 sm:pt-12">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />Shopify creation & management</p>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-12">
            <div><h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">Launch. Migrate.<br /><span className="text-primary">Manage your<br />Shopify store.</span></h1><p className="mb-7 mt-6 max-w-lg leading-relaxed text-muted-foreground">{page.standfirst}</p><div className="flex flex-wrap items-center gap-3"><Button asChild size="lg" className="rounded-full text-[#1c140b]"><Link to={SHOPIFY_BRIEF}>{page.cta.label}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button><a href="#shopify-options" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium hover:text-primary">Explore the services<ArrowRight className="h-4 w-4" aria-hidden="true" /></a></div><p className="mt-5 text-xs leading-relaxed text-muted-foreground">Based in Nairobi. Working with businesses in Kenya and worldwide.</p></div>
            <div className="min-w-0"><ShopifyProjectVisual priority /><p className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>Featured work: {shopifyProject.name}</span><a href={shopifyProject.url} target="_blank" rel="noopener noreferrer" data-track="shopify_store_visit" className="inline-flex min-h-9 items-center gap-1 underline underline-offset-4 hover:text-foreground">Visit live store<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a></p></div>
          </div>
        </header>

        <section id="shopify-options" aria-labelledby="shopify-options-title" className="scroll-mt-24 border-y border-border py-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Build · Migrate · Manage</p><h2 id="shopify-options-title" className="mb-6 mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">What does your store need?</h2>
          <div className="divide-y divide-border border-y border-border">
            {shopifyOffers.map(item => <button key={item.id} id={item.id} type="button" aria-expanded={selected === item.id} aria-controls="shopify-offer-detail" onClick={() => { setSelected(item.id); track("shopify_service_select", { service: item.id }); }} className="group grid min-h-20 w-full scroll-mt-24 grid-cols-[24px_1fr_20px] items-center gap-x-3 gap-y-1 py-5 text-left focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[32px_120px_1fr_20px]"><span className="col-start-1 row-start-1 text-xs text-muted-foreground">{item.number}</span><span className={`col-start-2 row-start-1 font-display text-2xl font-medium transition-colors ${selected === item.id ? "text-primary" : "group-hover:text-primary"}`}>{item.title}</span><span className="col-start-2 row-start-2 text-sm text-muted-foreground sm:col-start-3 sm:row-start-1">{item.summary}</span><ArrowUpRight className={`col-start-3 row-start-1 h-4 w-4 transition-transform motion-reduce:transition-none sm:col-start-4 ${selected === item.id ? "rotate-45" : ""}`} aria-hidden="true" /></button>)}
          </div>
          <div id="shopify-offer-detail" aria-live="polite" className="grid gap-7 pt-7 md:grid-cols-2 md:gap-12"><div><h3 className="font-display text-xl font-medium sm:text-2xl">{offer.heading}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{offer.description}</p><Link to={`/agency/contact?service=${offer.service}#brief`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:text-primary">{offer.cta}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></div><ul className="space-y-3">{offer.included.map(item => <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{item}</li>)}</ul></div>
        </section>

        <section aria-labelledby="shopify-migration-title" className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[5fr_7fr] lg:gap-14"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Moving from WooCommerce?</p><h2 id="shopify-migration-title" className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">Start with what<br />is making you move.</h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">A platform change should fit your business. We review the features you need, the costs involved, and what needs to move before agreeing a plan.</p></div><div><label htmlFor="shopify-migration-reason" className="mb-3 block text-sm font-medium">What is prompting the change?</label><select id="shopify-migration-reason" value={reason} onChange={event => setReason(event.target.value)} className="flex min-h-12 w-full rounded-xl border border-input bg-background px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Choose a reason (optional)</option>{migrationReasons.map(item => <option key={item} value={item}>{item}</option>)}</select><ol className="my-6 space-y-4 text-sm text-muted-foreground"><li><span className="mr-2 font-medium text-foreground">01</span>Review your store, catalogue, and integrations.</li><li><span className="mr-2 font-medium text-foreground">02</span>Plan data mapping, important-page redirects, and testing.</li><li><span className="mr-2 font-medium text-foreground">03</span>Agree the launch plan and post-launch checks.</li></ol><Button asChild variant="outline" className="rounded-full"><Link to={migrationBrief}>Discuss my migration<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Customer passwords cannot transfer. Reviews, historical orders, and other data may require extra tools. <a href="https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-woocommerce" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Shopify migration guidance</a></p></div></section>

        <section aria-labelledby="shopify-scope-title" className="border-y border-border py-10 sm:py-12"><div className="grid gap-7 md:grid-cols-2 md:gap-12"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Scope & pricing</p><h2 id="shopify-scope-title" className="mt-3 font-display text-3xl font-medium tracking-tight">{page.price.amount}</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{page.price.note}</p></div><div><h3 className="font-display text-xl font-medium">A practical next step</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Share your store link, product count, the changes you need, and your intended launch date. You will receive a proposal with deliverables, costs, and a timeline.</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Need help bringing visitors to your store too? <Link to="/agency/seo-services-nairobi" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">SEO</Link> and <Link to="/agency/google-ads-management" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">paid advertising</Link> can be scoped alongside the store work.</p></div></div></section>

        <section aria-labelledby="service-faqs" className="py-14 sm:py-20"><h2 id="service-faqs" className="font-display text-3xl font-medium tracking-tight">Questions about Shopify services</h2><dl className="mt-7 divide-y divide-border border-y border-border">{page.faqs.map(faq => <div key={faq.q} className="py-5 sm:py-6"><dt className="font-medium">{faq.q}</dt><dd className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{faq.a}</dd></div>)}</dl></section>

        <section data-track-location="shopify_contact" aria-labelledby="shopify-contact-title" className="border-t border-border pt-10"><h2 id="shopify-contact-title" className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{page.cta.heading}</h2><p className="mb-6 mt-4 max-w-xl text-muted-foreground">{page.cta.body}</p><div className="flex flex-wrap items-center gap-4"><Button asChild size="lg" className="rounded-full text-[#1c140b]"><Link to={SHOPIFY_BRIEF}>{page.cta.label}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button><a href="https://wa.me/254704700160?text=Hi%20Joseph%2C%20I%27d%20like%20to%20discuss%20my%20Shopify%20store." target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-primary"><MessageCircle className="h-4 w-4" aria-hidden="true" />Message on WhatsApp</a></div></section>
      </main>
      <Footer />
    </div>
  );
}
