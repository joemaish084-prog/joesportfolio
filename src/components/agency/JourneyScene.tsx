import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, CheckCheck, Heart, MessageCircle, MoreHorizontal, MousePointer2, RotateCcw, Search, ShieldCheck, ShoppingBag, Sparkles, Star } from "lucide-react";

type JourneyStage = "discover" | "explore" | "compare" | "enquire" | "purchase";
type JourneyType = "product" | "service";
type SceneProps = { journeyType: JourneyType };

const actions: Record<JourneyType, Record<JourneyStage, string>> = {
  product: { discover: "Open the ad", explore: "Explore the offer", compare: "Ask a question", enquire: "Confirm the order", purchase: "Try again" },
  service: { discover: "View the service", explore: "Check the details", compare: "Start a conversation", enquire: "Confirm the booking", purchase: "Try again" },
};

function BrowserBar({ journeyType }: SceneProps) {
  return <div className="flex h-6 items-center gap-1 border-b border-white/10 px-2.5">
    <span className="h-1 w-1 rounded-full bg-[#fb8b63]" /><span className="h-1 w-1 rounded-full bg-[#d7c3fc]" /><span className="h-1 w-1 rounded-full bg-[#bde9d0]" />
    <span className="mx-auto flex items-center gap-1 rounded bg-white/[0.05] px-4 py-0.5 text-[7px] text-[#c4c8bd]"><ShieldCheck className="h-2 w-2" />{journeyType === "product" ? "example.store" : "example.studio"}</span>
  </div>;
}

function OfferObject({ journeyType }: SceneProps) {
  if (journeyType === "service") return <div className="relative flex h-full w-full flex-col justify-center rounded-xl border border-white/50 bg-[#f6ebd9] px-2 text-[#5c4b3e] shadow-lg">
    <CalendarDays className="h-6 w-6" strokeWidth={1.5} /><span className="mt-2 text-[8px] font-semibold leading-tight">A plan for<br />your next step.</span>
    <div className="mt-2 flex gap-1">{[0, 1, 2].map(n => <span key={n} className="h-1.5 w-1.5 rounded-full bg-[#f3844c]" />)}</div>
  </div>;
  return <div className="relative flex h-full w-full items-center justify-center rounded-t-[2rem] rounded-b-lg border border-white/50 bg-[#f6ebd9] shadow-lg"><ShoppingBag className="h-8 w-8 text-[#b66c42]" strokeWidth={1.4} /><span className="absolute inset-x-3 bottom-3 h-px bg-[#b66c42]/20" /></div>;
}

function DiscoverScene({ journeyType }: SceneProps) {
  return <>
    <div className="absolute inset-y-0 left-2 right-7 -rotate-3 overflow-hidden rounded-xl border border-white/15 bg-[#292c2b] shadow-[0_12px_24px_#0003]">
      <div className="flex h-7 items-center gap-1.5 px-2.5"><span className="grid h-4 w-4 place-items-center rounded-full bg-[#d7c3fc]"><Sparkles className="h-2.5 w-2.5 text-[#54416f]" /></span><span className="text-[8px] font-medium text-[#eeeae1]">A good find, in your feed</span><MoreHorizontal className="ml-auto h-3 w-3 text-[#abb2a6]" /></div>
      <div className="relative mx-1.5 h-[98px] overflow-hidden rounded-md bg-[#e5cbb7]">
        <div className="absolute -right-7 -top-9 h-36 w-36 rounded-full border-[22px] border-[#f88243]" />
        <p className="absolute left-3 top-3 max-w-[52%] font-display text-[15px] font-semibold leading-[1.08] tracking-tight text-[#2a251f]">{journeyType === "product" ? <>Small things.<br />Better days.</> : <>Big ideas.<br />A clear plan.</>}</p>
        <div className="absolute -bottom-2 right-5 h-24 w-[60px] -rotate-12"><OfferObject journeyType={journeyType} /></div>
        <span className="absolute bottom-3 left-3 rounded-full bg-[#28251e] px-2 py-1 text-[6px] uppercase tracking-[0.12em] text-[#f6ebd9]">{journeyType === "product" ? "Made for you" : "Built around you"}</span>
      </div>
      <div className="flex h-6 items-center gap-2 px-2.5 text-[#b5bcb0]"><Heart className="h-3 w-3" /><MessageCircle className="h-3 w-3" /><span className="ml-auto text-[7px]">Example ad</span></div>
    </div>
    <div className="absolute right-0 top-5 flex rotate-[7deg] items-center gap-1.5 rounded-full border border-white/15 bg-[#363239] px-2.5 py-2 shadow-xl"><Search className="h-3 w-3 text-[#d7c3fc]" /><span className="text-[8px] text-[#f0eaf5]">Just what I needed.</span></div>
    <MousePointer2 className="absolute bottom-0 right-5 h-7 w-7 -rotate-12 fill-[#ff934f] text-[#1c201f] drop-shadow-lg" strokeWidth={1.3} />
  </>;
}

function ExploreScene({ journeyType }: SceneProps) {
  return <div className="absolute inset-x-1 inset-y-0 -rotate-1 overflow-hidden rounded-xl border border-white/15 bg-[#292c2b] shadow-xl">
    <BrowserBar journeyType={journeyType} />
    <div className="relative grid h-[132px] grid-cols-[1.1fr_1fr] gap-2 overflow-hidden p-3">
      <div className="relative z-10 min-w-0"><p className="text-[6px] uppercase tracking-[0.12em] text-[#bde9d0]">A clear offer</p><p className="mt-2 font-display text-[17px] font-semibold leading-[1.05] tracking-tight text-[#faf5ed]">{journeyType === "product" ? <>Something<br />you'll love.</> : <>Your goals.<br />Our next step.</>}</p><div className="mt-2 h-1 w-[85%] rounded bg-white/15" /><div className="mt-1 h-1 w-[65%] rounded bg-white/10" /><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#ff8a4c] px-2 py-1 text-[7px] font-semibold text-[#251d17]">{journeyType === "product" ? "See the collection" : "See what's included"}<ArrowRight className="h-2 w-2" /></span></div>
      <div className="relative mt-1 h-[108px] rounded-t-full bg-[#d7c3fc]"><div className="absolute -bottom-2 right-3 h-[81px] w-[58px] rotate-[8deg]"><OfferObject journeyType={journeyType} /></div><Sparkles className="absolute right-4 top-3 h-4 w-4 text-[#64527e]" /></div>
      <span className="absolute bottom-2 right-1.5 flex items-center gap-1 rounded-md border border-[#bde9d0]/20 bg-[#303b34] px-2 py-1.5 text-[7px] text-[#bde9d0]"><Check className="h-2.5 w-2.5" />{journeyType === "product" ? "Details that make sense" : "A scope you can understand"}</span>
    </div>
  </div>;
}

function CompareScene({ journeyType }: SceneProps) {
  const points = journeyType === "product" ? ["The right features", "Clear delivery details", "Customer feedback"] : ["A clear scope", "Relevant experience", "Helpful answers"];
  return <>
    <div className="absolute inset-x-2 top-0 flex items-center justify-between text-[8px] text-[#b4bcaf]"><span>Confidence before commitment</span><Star className="h-3 w-3 fill-[#d7c3fc] text-[#d7c3fc]" /></div>
    <div className="absolute bottom-1 left-1 top-6 w-[45%] -rotate-3 rounded-xl border border-white/10 bg-[#292c2b] p-3"><span className="grid h-6 w-6 place-items-center rounded-lg bg-white/[0.06]"><Search className="h-3 w-3 text-[#a7afa0]" /></span><p className="mt-3 text-[11px] font-medium text-[#b9c0b3]">Other options</p><div className="mt-3 h-1 w-[80%] rounded bg-white/15" /><div className="mt-2 h-1 w-[65%] rounded bg-white/10" /><div className="mt-2 h-1 w-[45%] rounded bg-white/10" /></div>
    <div className="absolute bottom-0 right-1 top-5 w-[51%] rotate-3 rounded-xl border border-[#bde9d0]/50 bg-[#2b3831] p-3 shadow-xl"><span className="absolute -right-1 -top-2 grid h-6 w-6 place-items-center rounded-full border-[3px] border-[#1c201f] bg-[#bde9d0] text-[#25362c]"><Check className="h-3 w-3" /></span><ShieldCheck className="h-5 w-5 text-[#bde9d0]" /><p className="mt-3 text-[11px] font-semibold text-[#e9f5ee]">The right fit</p><div className="mt-2.5 space-y-2 text-[7px] text-[#d0dfd3]">{points.map(label => <p key={label} className="flex items-start gap-1"><Check className="mt-0.5 h-2 w-2 shrink-0 text-[#bde9d0]" />{label}</p>)}</div></div>
  </>;
}

function EnquireScene({ journeyType }: SceneProps) {
  return <div className="absolute inset-0 overflow-hidden rounded-xl border border-white/15 bg-[#292c2b] shadow-xl">
    <div className="flex h-8 items-center gap-2 border-b border-white/10 px-3"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#bde9d0]/15"><MessageCircle className="h-3 w-3 text-[#bde9d0]" /></span><span className="text-[9px] font-medium text-[#e4e8df]">An enquiry becomes a conversation</span></div>
    <div className="space-y-2 p-3"><p className="ml-auto w-fit max-w-[90%] rounded-xl rounded-br-sm bg-[#d7c3fc] px-3 py-2 text-[9px] text-[#32263e]">{journeyType === "product" ? "Hi! Is this available for delivery?" : "Hi! Can we discuss my project?"}<CheckCheck className="ml-auto mt-1 h-2.5 w-2.5 text-[#746180]" /></p><p className="w-fit max-w-[90%] rounded-xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] text-[#e0e5d9]">{journeyType === "product" ? "Yes! Here are the details for your order." : "Of course. Let's find the right next step."}</p><div className="flex items-center gap-1.5 text-[7px] text-[#bde9d0]"><ShieldCheck className="h-2.5 w-2.5" />Questions answered. Ready to move forward.</div></div>
  </div>;
}

function PurchaseScene({ journeyType }: SceneProps) {
  const OfferIcon = journeyType === "product" ? ShoppingBag : CalendarDays;
  return <>
    <div className="absolute inset-x-3 inset-y-1 -rotate-2 rounded-xl border border-white/15 bg-[#292c2b] px-4 py-3 text-center shadow-xl"><span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#bde9d0] text-[#293d30] shadow-[0_0_0_6px_#bde9d00d]"><Check className="h-4 w-4" strokeWidth={2.5} /></span><p className="mt-3 font-display text-[18px] font-semibold leading-tight tracking-tight text-[#faf5ed]">{journeyType === "product" ? "Order confirmed." : "Booking confirmed."}</p><p className="mt-1 text-[8px] text-[#b5bdaf]">A first click. Now a customer.</p><div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-white/15 pt-2 text-[7px]"><span className="flex items-center gap-1 text-[#b5bdaf]"><OfferIcon className="h-2.5 w-2.5" />Illustrative confirmation</span><span className="rounded-full bg-[#bde9d0]/10 px-2 py-1 text-[#bde9d0]">Journey complete</span></div></div>
    <Sparkles className="absolute left-0 top-3 h-5 w-5 -rotate-12 text-[#d7c3fc]" /><span className="absolute right-1 top-1 h-2 w-2 rotate-12 rounded-sm bg-[#ff8a4c]" /><span className="absolute bottom-4 left-0 h-1.5 w-1.5 rounded-full bg-[#bde9d0]" /><span className="absolute bottom-0 right-4 h-1.5 w-3 -rotate-12 rounded-full bg-[#d7c3fc]" />
  </>;
}

const scenes = { discover: DiscoverScene, explore: ExploreScene, compare: CompareScene, enquire: EnquireScene, purchase: PurchaseScene };

export function JourneyScene({ stage, journeyType, onAdvance }: { stage: JourneyStage; journeyType: JourneyType; onAdvance: () => void }) {
  const reducedMotion = useReducedMotion();
  const descriptionId = useId();
  const Scene = scenes[stage];
  return <div className="relative mx-auto h-[230px] w-full max-w-[330px]">
    <p id={descriptionId} className="flex items-center justify-between text-[11px] text-[#b5c0ad]"><span>Interactive demo</span><span className="text-[10px]">Try this moment <ArrowRight className="ml-1 inline h-2.5 w-2.5" /></span><span className="sr-only">An example only. This button advances the customer journey.</span></p>
    <motion.div key={`${journeyType}-${stage}`} aria-hidden="true" initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 0.35, ease: "easeOut" }} className="pointer-events-none absolute inset-x-0 top-6 h-[153px] select-none"><Scene journeyType={journeyType} /></motion.div>
    <motion.button data-journey-advance type="button" onClick={onAdvance} aria-describedby={descriptionId} whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} className="absolute inset-x-0 bottom-0 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[#ffad7b]/40 bg-[#ff934f] px-4 text-xs font-semibold text-[#282117] shadow-[0_5px_0_#a95b2d30] transition-colors hover:bg-[#ffad7b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffb17c] motion-reduce:transition-none"><span>{actions[journeyType][stage]}</span>{stage === "purchase" ? <RotateCcw className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}</motion.button>
  </div>;
}
