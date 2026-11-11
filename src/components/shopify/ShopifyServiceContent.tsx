import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Asterisk, Check, ChevronRight, MessageCircle, Plus } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { AgencyNavigation } from "@/components/agency/AgencyNavigation";
import { Button } from "@/components/ui/button";
import { serviceHead } from "@/seo/pageHeads";
import type { ServicePage } from "@/data/servicePages";
import { SHOPIFY_BRIEF, SHOPIFY_PATH, migrationReasons, shopifyOffers, shopifyProject } from "@/data/shopify";
import { track } from "@/lib/track";
import { ShopifyProjectVisual } from "./ShopifyProjectVisual";

export function ShopifyServiceContent({ page }: { page: ServicePage }) {
  const location = useLocation();
  const [selected, setSelected] = useState<string>("create");
  const [reason, setReason] = useState<string>("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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
    <div className="shopify-premium service-page min-h-screen bg-background text-foreground">
      <Seo {...serviceHead(page)} />
      <AgencyNavigation />
      <main className="container mx-auto max-w-7xl px-5 pb-20 pt-5 sm:px-8 lg:px-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link to="/agency" className="inline-flex min-h-9 items-center gap-1.5 hover:text-primary"><ArrowLeft className="h-3 w-3" aria-hidden="true" />Agency</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link to="/agency/services" className="inline-flex min-h-9 items-center hover:text-primary">Services</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" /><span>Shopify</span>
        </nav>

        <header data-track-location="shopify_hero" className="shopify-hero">
          <div className="shopify-hero-top">
            <p className="shopify-kicker">Shopify creation & management</p>
            <span className="hidden text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:block">Nairobi, Kenya / Working worldwide</span>
          </div>
          <div className="shopify-hero-grid">
            <div>
              <h1 className="shopify-display">Shopify stores.<br />Made to <span className="shopify-serif shopify-headline-cutout">stand out.</span></h1>
              <p className="shopify-intro">{page.standfirst}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button asChild size="lg" className="shopify-action"><Link to={SHOPIFY_BRIEF}>Discuss your store<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
                <a href="#shopify-options" className="shopify-text-link">Find your service<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
              </div>
              <p className="mt-7 text-[11px] text-muted-foreground">One person to work with. From the first brief to what comes next.</p>
            </div>
            <div className="min-w-0">
              <ShopifyProjectVisual priority />
              <div className="shopify-project-meta">
                <span>Featured work / {shopifyProject.name}</span>
                <a href={shopifyProject.url} target="_blank" rel="noopener noreferrer" data-track="shopify_store_visit" className="inline-flex min-h-9 items-center gap-1 underline underline-offset-4 hover:text-foreground">Visit live store<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a>
              </div>
            </div>
          </div>
          <nav className="shopify-creative-ribbon" aria-label="Jump to a Shopify service">
            {shopifyOffers.map(item => <Link key={item.id} to={`${SHOPIFY_PATH}#${item.id}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="shopify-ribbon-index">{item.number}</span><span>{item.title}</span><Asterisk className="h-6 w-6" aria-hidden="true" /></Link>)}
          </nav>
        </header>

        <section id="shopify-options" aria-labelledby="shopify-options-title" className="scroll-mt-24 border-t border-foreground/15 pt-9 sm:pt-12">
          <p className="shopify-section-number"><span>01</span> / Available services</p>
          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <h2 id="shopify-options-title" className="shopify-heading">The right support.<br /><span className="shopify-serif">At the right stage.</span></h2>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Starting fresh, changing platforms, or keeping things running. Choose where you are today.</p>
          </div>
          <div className="shopify-offers-layout">
            <div>
              {shopifyOffers.map(item => (
                <button key={item.id} id={item.id} type="button" aria-expanded={selected === item.id} aria-controls="shopify-offer-detail" onClick={() => { setSelected(item.id); track("shopify_service_select", { service: item.id }); }} className="shopify-offer-button group scroll-mt-24 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="self-start pt-3 text-[10px] text-muted-foreground">{item.number}</span>
                  <span><span className="shopify-offer-name">{item.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{item.summary}</span></span>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${selected === item.id ? "border-primary bg-primary text-[#21170d]" : "border-border"}`}><ArrowUpRight className={`h-4 w-4 transition-transform motion-reduce:transition-none ${selected === item.id ? "rotate-45" : ""}`} aria-hidden="true" /></span>
                </button>
              ))}
            </div>
            <div id="shopify-offer-detail" aria-live="polite" className="shopify-offer-detail">
              <span className="shopify-offer-watermark" aria-hidden="true">{offer.number}</span>
              <div key={offer.id} className="shopify-offer-detail-content">
                <p className="mb-5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{offer.number} / {offer.title} with Joseph</p>
                <h3 className="font-display text-2xl font-medium leading-tight tracking-tight sm:text-3xl">{offer.heading}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
                <ul className="my-6 space-y-3 border-y border-foreground/10 py-5">{offer.included.map(item => <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />{item}</li>)}</ul>
                <Link to={`/agency/contact?service=${offer.service}#brief`} className="shopify-text-link">{offer.cta}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="shopify-migration-title" className="shopify-migration">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5 border-b border-white/15 pb-6">
            <p className="shopify-kicker">Moving from WooCommerce?</p>
            <span className="inline-flex items-center gap-3 text-[11px] text-[#c6c6b9]">WooCommerce<ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden="true" />Shopify</span>
          </div>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 id="shopify-migration-title" className="shopify-heading">A fresh start.<br /><span className="shopify-serif">A careful move.</span></h2>
              <p className="mt-5 max-w-sm text-sm leading-relaxed">A platform change should fit your business. We review the features you need, the costs involved, and what needs to move before agreeing a plan.</p>
              <p className="mt-7 max-w-sm text-xs leading-relaxed">Customer passwords cannot transfer. Reviews, historical orders, and other data may require extra tools. <a href="https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-woocommerce" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">Shopify migration guidance</a></p>
            </div>
            <div>
              <label htmlFor="shopify-migration-reason" className="mb-3 block text-sm font-medium">What is prompting the change?</label>
              <select id="shopify-migration-reason" value={reason} onChange={event => setReason(event.target.value)} className="shopify-migration-select focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Choose a reason (optional)</option>{migrationReasons.map(item => <option key={item} value={item}>{item}</option>)}</select>
              <ol className="my-6">
                <li className="shopify-migration-step"><span>01</span><span>Review your store, catalogue, and integrations.</span></li>
                <li className="shopify-migration-step"><span>02</span><span>Plan data mapping, important-page redirects, and testing.</span></li>
                <li className="shopify-migration-step"><span>03</span><span>Agree the launch plan and post-launch checks.</span></li>
              </ol>
              <Button asChild variant="outline" className="shopify-migration-action min-h-12 rounded-full px-6"><Link to={migrationBrief}>Discuss my migration<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="shopify-scope-title" className="border-b border-foreground/15 pb-12 sm:pb-20">
          <p className="shopify-section-number"><span>02</span> / Scope & pricing</p>
          <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-16">
            <div><h2 id="shopify-scope-title" className="shopify-heading">Your project.<br /><span className="shopify-serif">Your scope.</span></h2><p className="mt-5 text-sm font-medium">{page.price.amount}</p><p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{page.price.note}</p></div>
            <div className="md:pt-2"><h3 className="font-display text-xl font-medium tracking-tight">A practical next step</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Share your store link, product count, the changes you need, and your intended launch date. You will receive a proposal with deliverables, costs, and a timeline.</p><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Need help bringing visitors to your store too? <Link to="/agency/seo-services-nairobi" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">SEO</Link> and <Link to="/agency/google-ads-management" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">paid advertising</Link> can be scoped alongside the store work.</p></div>
          </div>
        </section>

        <section aria-labelledby="service-faqs" className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
          <div><p className="shopify-section-number"><span>03</span> / The details</p><h2 id="service-faqs" className="shopify-heading mt-6">Good questions.<br /><span className="shopify-serif">Clear answers.</span></h2></div>
          <dl className="divide-y divide-foreground/15 border-y border-foreground/15">
            {page.faqs.map((faq, index) => (
              <div key={faq.q}>
                <dt><button type="button" aria-expanded={openFaq === index} aria-controls={`shopify-faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="shopify-faq-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span>{faq.q}</span><Plus className="h-[18px] w-[18px]" aria-hidden="true" /></button></dt>
                <dd id={`shopify-faq-${index}`} hidden={openFaq !== index} className="pb-6 pr-7 text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section data-track-location="shopify_contact" aria-labelledby="shopify-contact-title" className="shopify-closing">
          <h2 id="shopify-contact-title" className="shopify-heading">Let’s talk<br /><span className="shopify-serif">about your store.</span></h2>
          <div><p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">{page.cta.body}</p><div className="flex flex-wrap items-center gap-x-5 gap-y-3"><Button asChild size="lg" className="shopify-action"><Link to={SHOPIFY_BRIEF}>{page.cta.label}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button><a href="https://wa.me/254704700160?text=Hi%20Joseph%2C%20I%27d%20like%20to%20discuss%20my%20Shopify%20store." target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-xs font-medium hover:text-primary"><MessageCircle className="h-4 w-4" aria-hidden="true" />WhatsApp</a></div></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
