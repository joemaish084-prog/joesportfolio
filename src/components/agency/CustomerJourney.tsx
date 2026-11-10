import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Compass, Eye, Flag, LayoutPanelLeft, Map, MessageCircle, MousePointer2, Pause, Play, RotateCcw, ShoppingBag, Store, UserRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionLabel } from "@/components/SectionLabel";
import { JourneyScene } from "@/components/agency/JourneyScene";
import { journeyScenarios, type JourneyType } from "@/components/agency/journey-scenarios";
import "./customer-journey.css";

const stages = [
  {
    id: "discover", label: "Discover", phase: "Awareness", icon: Eye, caption: "Catch their eye", color: "#ff934f", mapThought: "Oh, that's interesting.",
    title: "Get noticed by the right people.",
    thought: "I have a problem. Who can help?",
    customer: "Your future customer spots a useful post, sees an ad or searches for a solution. This is their first introduction to your brand.",
    action: "Put a clear message in front of a relevant audience with paid social, search and helpful content.",
    touchpoints: ["Social ads", "Google Search", "Short-form video"],
    signal: "Relevant people reach your website or profile.",
    example: "An ad introduces a product that solves a problem they recognise.",
  },
  {
    id: "explore", label: "Explore", phase: "Interest", icon: Compass, caption: "Spark curiosity", color: "#bdabef", mapThought: "Tell me a little more.",
    title: "Give curiosity somewhere to go.",
    thought: "Is this what I am looking for?",
    customer: "They visit your website or profile to understand your offer, who it is for and how it fits their needs.",
    action: "Connect the ad to a focused landing page with a clear offer, useful content and an obvious next step.",
    touchpoints: ["Landing pages", "Service pages", "Educational content"],
    signal: "Visitors engage with the offer and view key pages.",
    example: "They open the product page to learn how it works.",
  },
  {
    id: "compare", label: "Compare", phase: "Consideration", icon: MousePointer2, caption: "Earn their trust", color: "#9bc8e9", mapThought: "Is this right for me?",
    title: "Turn questions into confidence.",
    thought: "Why should I choose this business?",
    customer: "They compare options, check pricing and look for evidence that your business can deliver.",
    action: "Make the decision easier with case studies, customer reviews, clear pricing and retargeting that answers common questions.",
    touchpoints: ["Case studies & reviews", "Pricing & FAQs", "Retargeting ads"],
    signal: "Interested visitors return and check pricing or proof.",
    example: "They read a customer review and compare the available options.",
  },
  {
    id: "enquire", label: "Enquire", phase: "Intent", icon: MessageCircle, caption: "Start a conversation", color: "#efd18a", mapThought: "Let's talk.",
    title: "Make the next step feel easy.",
    thought: "I am interested. How do I get started?",
    customer: "They send a WhatsApp message, fill in a form, book a call or add a product to their cart.",
    action: "Create a simple route to contact or checkout, capture enquiries and support timely, relevant follow-up.",
    touchpoints: ["WhatsApp & lead forms", "Booking calls", "Cart & checkout"],
    signal: "Qualified enquiries, bookings or checkout starts.",
    example: "They message your team to confirm availability before ordering.",
  },
  {
    id: "purchase", label: "Purchase", phase: "Conversion", icon: ShoppingBag, caption: "Make it happen", color: "#a5d9ba", mapThought: "This is the one.",
    title: "Connect your marketing to a sale.",
    thought: "I am ready to buy.",
    customer: "With their questions answered, they complete payment, accept a proposal or confirm their order.",
    action: "Reduce friction at the final step and connect confirmed sales back to the campaigns that brought customers in.",
    touchpoints: ["Payment or deposit", "Order confirmation", "Sales tracking"],
    signal: "Confirmed purchases, revenue and cost per customer.",
    example: "They pay, receive confirmation and become a customer.",
  },
] as const;

// The same coordinates place both the SVG route and its HTML milestone buttons.
const stops = [{ x: 95, y: 145 }, { x: 380, y: 95 }, { x: 485, y: 275 }, { x: 185, y: 315 }, { x: 400, y: 450 }];
const routeSegments = [
  "M95 145 C90 45 290 15 380 95",
  "M380 95 C480 165 575 200 485 275",
  "M485 275 C405 355 245 220 185 315",
  "M185 315 C75 485 260 550 400 450",
];
const fullRoute = routeSegments.join(" ");

export function CustomerJourney() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [journeyType, setJourneyType] = useState<JourneyType>("product");
  const [visited, setVisited] = useState([0]);
  const [mobileView, setMobileView] = useState<"map" | "story">("map");
  const [playing, setPlaying] = useState(false);
  const [distances, setDistances] = useState([0, 0.25, 0.5, 0.75, 1]);
  const sectionRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const focusNextScene = useRef(false);
  const pathRef = useRef<SVGPathElement>(null);
  const segmentRefs = useRef<(SVGPathElement | null)[]>([]);
  const inView = useInView(sectionRef, { amount: 0.25 });
  const reducedMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const dwellProgress = useMotionValue(0);
  const travellerX = useMotionValue(stops[0].x);
  const travellerY = useMotionValue(stops[0].y);
  const scenario = journeyScenarios[journeyType];
  const currentStage = scenario.stages[activeIndex];

  useEffect(() => {
    setVisited(previous => previous.includes(activeIndex) ? previous : [...previous, activeIndex]);
    if (focusNextScene.current) {
      const frame = window.requestAnimationFrame(() => {
        boardRef.current?.querySelector<HTMLButtonElement>('[role="tabpanel"][data-state="active"] [data-journey-advance]')?.focus({ preventScroll: true });
        focusNextScene.current = false;
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [activeIndex]);

  useEffect(() => {
    const lengths = segmentRefs.current.map(segment => segment?.getTotalLength() ?? 0);
    const total = lengths.reduce((sum, length) => sum + length, 0);
    if (!total) return;
    let cumulative = 0;
    setDistances([0, ...lengths.map(length => (cumulative += length) / total)]);
  }, []);

  useMotionValueEvent(progress, "change", value => {
    const path = pathRef.current;
    if (!path) return;
    const point = path.getPointAtLength(value * path.getTotalLength());
    travellerX.set(point.x);
    travellerY.set(point.y);
  });

  useEffect(() => {
    const controls = animate(progress, distances[activeIndex], { duration: reducedMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [activeIndex, distances, progress, reducedMotion]);

  useEffect(() => {
    dwellProgress.set(0);
    if (!playing) return;
    const controls = animate(dwellProgress, 1, {
      duration: 5.5,
      ease: "linear",
    });
    const timer = window.setTimeout(() => {
      if (activeIndex === stages.length - 1) setPlaying(false);
      else setActiveIndex(index => index + 1);
    }, 5500);
    return () => { window.clearTimeout(timer); controls.stop(); };
  }, [playing, activeIndex, dwellProgress]);

  useEffect(() => { if (!inView) setPlaying(false); }, [inView]);
  useEffect(() => {
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  const selectStage = (index: number) => { setPlaying(false); setActiveIndex(index); };
  const togglePlayback = () => {
    if (!playing && activeIndex === stages.length - 1) setActiveIndex(0);
    setPlaying(value => !value);
  };
  const selectJourney = (type: JourneyType) => {
    if (type === journeyType) return;
    setPlaying(false);
    setActiveIndex(0);
    setVisited([0]);
    setJourneyType(type);
  };
  const showMobileView = (view: "map" | "story") => {
    setPlaying(false);
    setMobileView(view);
    if (window.matchMedia("(max-width: 767px)").matches) {
      window.requestAnimationFrame(() => boardRef.current?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" }));
    }
  };
  const advanceDemo = () => {
    focusNextScene.current = true;
    selectStage((activeIndex + 1) % stages.length);
  };

  return (
    <section ref={sectionRef} id="customer-journey" aria-labelledby="customer-journey-heading" className="customer-journey container mx-auto scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel>THE CUSTOMER JOURNEY</SectionLabel>
            <h2 id="customer-journey-heading" className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Strangers. Visitors.<br /><span className="font-serif font-normal italic text-primary">Your next customers.</span>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">Good marketing connects the dots. Follow the moments that turn a first impression into a purchase.</p>
          </div>
          <p className="journey-instruction"><MousePointer2 className="h-4 w-4" aria-hidden />Don't just follow the story. Try it.</p>
        </div>

        <div className="journey-scenario-picker">
          <div><p className="journey-scenario-label">ONE JOURNEY. TWO PERSPECTIVES.</p><p className="journey-scenario-description">{scenario.description}</p></div>
          <div role="group" aria-label="Choose an example journey" className="journey-scenario-buttons">
            <button type="button" aria-pressed={journeyType === "product"} onClick={() => selectJourney("product")}><Store className="h-4 w-4" aria-hidden />Sell a product</button>
            <button type="button" aria-pressed={journeyType === "service"} onClick={() => selectJourney("service")}><BriefcaseBusiness className="h-4 w-4" aria-hidden />Win a client</button>
          </div>
        </div>

        <Tabs ref={boardRef} value={stages[activeIndex].id} onValueChange={value => selectStage(stages.findIndex(stage => stage.id === value))} className="journey-atlas" data-mobile-view={mobileView} style={{ "--journey-accent": stages[activeIndex].color } as CSSProperties}>
          <div className="journey-topline">
            <span className="journey-breadcrumb">{scenario.business}<ArrowRight className="h-3 w-3" aria-hidden /><strong>{currentStage.label}</strong></span>
            <div className="journey-progress" aria-hidden>{stages.map((stage, index) => <span key={stage.id} data-active={index === activeIndex} data-visited={visited.includes(index)}><motion.i style={{ backgroundColor: stage.color, scaleX: index === activeIndex && playing && !reducedMotion ? dwellProgress : visited.includes(index) ? 1 : 0 }} /></span>)}</div>
            <span className="journey-play-status">{playing ? "Playing" : "Explore at your pace"}</span>
          </div>
          <div className="journey-mobile-switch" role="group" aria-label="Journey view">
            <button type="button" aria-pressed={mobileView === "map"} onClick={() => showMobileView("map")}><Map className="h-4 w-4" aria-hidden />Explore the map</button>
            <button type="button" aria-pressed={mobileView === "story"} onClick={() => showMobileView("story")}><LayoutPanelLeft className="h-4 w-4" aria-hidden />Try the story</button>
          </div>
          <div className="journey-map">
            <div className="journey-map-heading">
              <div><p className="journey-kicker">FIVE MOMENTS THAT MATTER</p><p className="font-display text-xl font-semibold sm:text-2xl">The path to purchase<span className="text-orange-600">.</span></p></div>
              <span className="journey-map-stamp" aria-label={`${visited.length} of 5 stops explored`}><svg viewBox="0 0 48 48" aria-hidden><circle cx="24" cy="24" r="21" fill="none" stroke="#d7d3c7" strokeWidth="2" /><motion.circle cx="24" cy="24" r="21" fill="none" stroke="#514c3d" strokeWidth="2" strokeLinecap="round" initial={false} animate={{ pathLength: visited.length / 5 }} transition={{ duration: reducedMotion ? 0 : 0.4 }} transform="rotate(-90 24 24)" /></svg><span aria-hidden>{visited.length}<small>/5</small></span></span>
            </div>
            <div className="journey-route">
              <svg viewBox="0 0 600 550" preserveAspectRatio="none" aria-hidden className="journey-route-svg">
                <path ref={pathRef} d={fullRoute} fill="none" stroke="#dedbd3" strokeWidth="12" strokeLinecap="round" />
                <path d={fullRoute} fill="none" stroke="#f7f4eb" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
                {routeSegments.map((segment, index) => <path key={segment} ref={element => { segmentRefs.current[index] = element; }} d={segment} fill="none" stroke="none" />)}
                <motion.path d={fullRoute} fill="none" stroke="#ec762c" strokeWidth="4" strokeLinecap="round" style={{ pathLength: progress }} />
                <motion.g style={{ x: travellerX, y: travellerY }}><circle r="13" fill="#ec762c" fillOpacity="0.15" /><circle r="6" fill="#ec762c" stroke="#fffaf1" strokeWidth="3" /></motion.g>
              </svg>
              <div className="journey-route-note" aria-hidden><span className="journey-mindset-avatar"><UserRound className="h-4 w-4" /></span><span className="journey-mindset-label">IN THEIR MIND</span><span className="journey-mindset-quote">“{currentStage.mapThought}”</span></div>
              <TabsList aria-label="Customer journey stages" className="journey-stops">
                {stages.map((stage, index) => {
                  const Icon = stage.icon;
                  const content = scenario.stages[index];
                  return <TabsTrigger key={stage.id} value={stage.id} onClick={() => selectStage(index)} className="journey-stop" data-visited={visited.includes(index)} style={{ left: `${stops[index].x / 6}%`, top: `${stops[index].y / 5.5}%` }}>
                    <span className="journey-stop-disc" style={{ backgroundColor: stage.color }}><Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden /><span className="journey-stop-number" aria-hidden>{String(index + 1).padStart(2, "0")}</span></span>
                    <span className="journey-stop-label">{content.label}</span>
                    <span className="journey-stop-caption">{content.caption}</span>
                    {visited.includes(index) && index !== activeIndex && <span className="journey-explored" aria-label="Explored"><Check className="h-2.5 w-2.5" aria-hidden /></span>}
                    {index === activeIndex && <span className="journey-here" aria-hidden>YOU ARE HERE</span>}
                  </TabsTrigger>;
                })}
              </TabsList>
              <span className="journey-route-finish" aria-hidden><Flag className="h-3.5 w-3.5" /> {scenario.outcome}</span>
            </div>
            <div className="journey-map-controls">
              <button type="button" className="journey-play" onClick={togglePlayback}>{playing ? <Pause className="h-4 w-4" aria-hidden /> : activeIndex === 4 ? <RotateCcw className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}{playing ? "Pause journey" : activeIndex === 4 ? "Replay journey" : "Play journey"}</button>
              <span className="journey-map-hint">{visited.length} of 5 stops explored</span>
              <button type="button" onClick={() => showMobileView("story")} className="journey-read-step">Try this stop<ArrowRight className="h-3.5 w-3.5" aria-hidden /></button>
            </div>
          </div>

          <div id="journey-story" className="journey-story scroll-mt-24">
            {stages.map((stage, index) => <TabsContent key={stage.id} value={stage.id} className="journey-story-panel">
              <motion.div key={`${journeyType}-${stage.id}`} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="journey-story-eyebrow"><span style={{ color: stage.color }}>{String(index + 1).padStart(2, "0")} / {stage.phase}</span><span className="journey-example-label">EXAMPLE JOURNEY</span></div>
                <h3 className="journey-story-title">{stage.title}</h3>
                <p className="journey-thought">“{scenario.stages[index].thought}”</p>
                <JourneyScene stage={stage.id} journeyType={journeyType} onAdvance={advanceDemo} />
                <p className="journey-action-label">THIS IS WHERE I COME IN</p>
                <p className="journey-action">{scenario.stages[index].action}</p>
                <ul aria-label="Customer touchpoints" className="journey-touchpoints">{scenario.stages[index].touchpoints.map(touchpoint => <li key={touchpoint}>{touchpoint}</li>)}</ul>
                <p className="journey-signal"><Check className="h-4 w-4" aria-hidden /><span><strong>What we measure</strong>{scenario.stages[index].signal}</span></p>
              </motion.div>
            </TabsContent>)}
            <div className="journey-story-controls">
              <p className="journey-counter" aria-live="polite" aria-atomic="true"><span className="sr-only">Step </span><span>{String(activeIndex + 1).padStart(2, "0")}</span> / 05<span className="sr-only">: {currentStage.label}, {scenario.business}</span></p>
              <div className="flex gap-2">
                <button type="button" aria-label="Previous stage" className="journey-nav-button" disabled={activeIndex === 0} onClick={() => selectStage(activeIndex - 1)}><ArrowLeft className="h-4 w-4" aria-hidden /></button>
                <button type="button" className="journey-next" onClick={() => selectStage((activeIndex + 1) % stages.length)}>{activeIndex === 4 ? "Start again" : "Next stop"}<ArrowRight className="h-4 w-4" aria-hidden /></button>
              </div>
            </div>
          </div>
        </Tabs>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">Every customer takes their own route. They might skip a stop, come back to compare or go straight to buying.</p>
          <Link to="/agency/contact" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Let's map your customer journey<ArrowRight className="h-4 w-4 text-primary" aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}
