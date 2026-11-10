import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Compass, Eye, MessageCircle, MousePointer2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionLabel } from "@/components/SectionLabel";

const stages = [
  {
    id: "discover", label: "Discover", phase: "Awareness", icon: Eye,
    title: "Get noticed by the right people.",
    thought: "I have a problem. Who can help?",
    customer: "Your future customer spots a useful post, sees an ad or searches for a solution. This is their first introduction to your brand.",
    action: "Put a clear message in front of a relevant audience with paid social, search and helpful content.",
    touchpoints: ["Social ads", "Google Search", "Short-form video"],
    signal: "Relevant people reach your website or profile.",
    example: "An ad introduces a product that solves a problem they recognise.",
  },
  {
    id: "explore", label: "Explore", phase: "Interest", icon: Compass,
    title: "Give curiosity somewhere to go.",
    thought: "Is this what I am looking for?",
    customer: "They visit your website or profile to understand your offer, who it is for and how it fits their needs.",
    action: "Connect the ad to a focused landing page with a clear offer, useful content and an obvious next step.",
    touchpoints: ["Landing pages", "Service pages", "Educational content"],
    signal: "Visitors engage with the offer and view key pages.",
    example: "They open the product page to learn how it works.",
  },
  {
    id: "compare", label: "Compare", phase: "Consideration", icon: MousePointer2,
    title: "Turn questions into confidence.",
    thought: "Why should I choose this business?",
    customer: "They compare options, check pricing and look for evidence that your business can deliver.",
    action: "Make the decision easier with case studies, customer reviews, clear pricing and retargeting that answers common questions.",
    touchpoints: ["Case studies & reviews", "Pricing & FAQs", "Retargeting ads"],
    signal: "Interested visitors return and check pricing or proof.",
    example: "They read a customer review and compare the available options.",
  },
  {
    id: "enquire", label: "Enquire", phase: "Intent", icon: MessageCircle,
    title: "Make the next step feel easy.",
    thought: "I am interested. How do I get started?",
    customer: "They send a WhatsApp message, fill in a form, book a call or add a product to their cart.",
    action: "Create a simple route to contact or checkout, capture enquiries and support timely, relevant follow-up.",
    touchpoints: ["WhatsApp & lead forms", "Booking calls", "Cart & checkout"],
    signal: "Qualified enquiries, bookings or checkout starts.",
    example: "They message your team to confirm availability before ordering.",
  },
  {
    id: "purchase", label: "Purchase", phase: "Conversion", icon: ShoppingBag,
    title: "Connect your marketing to a sale.",
    thought: "I am ready to buy.",
    customer: "With their questions answered, they complete payment, accept a proposal or confirm their order.",
    action: "Reduce friction at the final step and connect confirmed sales back to the campaigns that brought customers in.",
    touchpoints: ["Payment or deposit", "Order confirmation", "Sales tracking"],
    signal: "Confirmed purchases, revenue and cost per customer.",
    example: "They pay, receive confirmation and become a customer.",
  },
];

export function CustomerJourney() {
  const [selected, setSelected] = useState(stages[0].id);
  const activeIndex = stages.findIndex(stage => stage.id === selected);

  return (
    <section id="customer-journey" aria-labelledby="customer-journey-heading" className="container mx-auto scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel>THE CUSTOMER JOURNEY</SectionLabel>
            <h2 id="customer-journey-heading" className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              From first hello to <span className="font-serif font-normal italic text-primary">ready to buy.</span>
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">A click is only the beginning. Explore how your customers move from discovering your business to making a purchase, and how I help at each step.</p>
          </div>
          <p className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground"><MousePointer2 className="h-4 w-4 text-primary" aria-hidden />Select a step to explore</p>
        </div>

        <Tabs value={selected} onValueChange={setSelected} className="overflow-hidden rounded-3xl border border-border bg-card/40">
          <div className="relative px-3 pt-7 sm:px-8 sm:pt-9">
            <div aria-hidden className="absolute left-[10%] right-[10%] top-[3.25rem] h-px bg-border sm:left-[12%] sm:right-[12%] sm:top-[3.75rem]">
              <div className="h-full origin-left bg-primary transition-transform duration-300 motion-reduce:transition-none" style={{ transform: `scaleX(${activeIndex / (stages.length - 1)})` }} />
            </div>
            <TabsList aria-label="Customer journey stages" className="relative grid h-auto w-full grid-cols-5 items-start rounded-none bg-transparent p-0">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <TabsTrigger key={stage.id} value={stage.id} className="group flex min-w-0 flex-col whitespace-normal rounded-xl bg-transparent px-0.5 py-0 pb-6 text-foreground/70 shadow-none data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:pb-8">
                    <span className={`relative flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${index === activeIndex ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_6px_hsl(var(--primary)/0.1)]" : index < activeIndex ? "border-primary/50 bg-background text-primary" : "border-border bg-background text-muted-foreground"}`}>
                      <Icon className="h-5 w-5" aria-hidden />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background font-mono text-[10px] text-foreground" aria-hidden>{index + 1}</span>
                    </span>
                    <span className="mt-4 text-[11px] font-semibold min-[375px]:text-xs sm:text-base">{stage.label}</span>
                    <span className="mt-1 hidden text-xs font-normal text-muted-foreground sm:block">{stage.phase}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {stages.map((stage, index) => (
            <TabsContent key={stage.id} value={stage.id} className="m-0 border-t border-border focus-visible:ring-inset">
              <div className="grid lg:min-h-[340px] lg:grid-cols-[1fr_1.1fr]">
                <div className="relative overflow-hidden bg-primary/[0.06] p-6 sm:p-8">
                  <span aria-hidden className="pointer-events-none absolute -bottom-9 right-1 font-display text-[11rem] font-bold leading-none text-primary/[0.06]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="relative">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Step {String(index + 1).padStart(2, "0")} / {stage.phase}</p>
                    <h3 className="mt-3 max-w-sm font-display text-2xl font-semibold tracking-tight sm:text-3xl">{stage.title}</h3>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">In your customer's mind</p>
                    <blockquote className="mt-2 border-l-2 border-primary pl-4 font-serif text-xl italic">“{stage.thought}”</blockquote>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{stage.customer}</p>
                  </div>
                </div>
                <div className="flex flex-col p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How I help you move them forward</p>
                  <p className="mt-3 text-base leading-relaxed">{stage.action}</p>
                  <ul aria-label="Customer touchpoints" className="mt-5 flex flex-wrap gap-2">
                    {stage.touchpoints.map(touchpoint => <li key={touchpoint} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs">{touchpoint}</li>)}
                  </ul>
                  <div className="mt-6 flex items-start gap-3 border-t border-border pt-5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">What we measure</p><p className="mt-1 text-sm">{stage.signal}</p></div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground"><span className="font-semibold">Example:</span> {stage.example}</p>
                </div>
              </div>
            </TabsContent>
          ))}

          <div className="flex items-center justify-between gap-3 border-t border-border bg-background/60 px-5 py-4 sm:px-8">
            <p className="shrink-0 whitespace-nowrap text-xs text-muted-foreground" aria-live="polite" aria-atomic="true"><span className="sr-only sm:not-sr-only">Step </span>{activeIndex + 1}<span className="sm:hidden" aria-hidden> / </span><span className="sr-only sm:not-sr-only"> of </span>{stages.length}<span className="hidden sm:inline"> · {stages[activeIndex].label}</span></p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="min-h-11 rounded-full" disabled={activeIndex === 0} onClick={() => setSelected(stages[activeIndex - 1].id)}><ArrowLeft className="mr-1 h-4 w-4" aria-hidden />Back</Button>
              <Button type="button" size="sm" className="min-h-11 rounded-full" onClick={() => setSelected(stages[(activeIndex + 1) % stages.length].id)}>{activeIndex === stages.length - 1 ? "Start again" : "Next step"}<ArrowRight className="ml-1 h-4 w-4" aria-hidden /></Button>
            </div>
          </div>
        </Tabs>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">An example journey: customers may skip a step, return to compare or buy straight away. The right mix depends on your business.</p>
          <Link to="/agency/contact" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Let's map your customer journey<ArrowRight className="h-4 w-4 text-primary" aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}
