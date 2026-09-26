import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent, trackConversion } from "@/lib/analytics";
import { openCalendlyPopup } from "@/lib/calendly";
import {
  INDUSTRY_OPTIONS,
  NEED_OPTIONS,
  BUDGET_OPTIONS,
  START_OPTIONS,
  computeStatus,
  isValidEmail,
  normalizeKenyanPhone,
  buildCalendlyUrl,
  buildWhatsAppUrl,
  createChatLead,
  updateChatLead,
  markChatLeadBooked,
  notifyLeadByEmail,
  type ChatLeadFields,
} from "@/lib/chatLead";

interface Message {
  role: "bot" | "user";
  content: string;
  quickReplies?: string[];
  action?: "calendly" | "whatsapp";
}

type Step =
  | "name"
  | "business_name"
  | "what_they_sell"
  | "industry"
  | "need"
  | "budget_range"
  | "start_timeframe"
  | "email"
  | "whatsapp"
  | "website_or_social"
  | "done";

const STEP_ORDER: Step[] = [
  "name",
  "business_name",
  "what_they_sell",
  "industry",
  "need",
  "budget_range",
  "start_timeframe",
  "email",
  "whatsapp",
  "website_or_social",
  "done",
];

const GREETING = "Hey! 👋 I'm Joseph's assistant — mind if I ask a few quick questions so I can point you in the right direction? What's your name?";

const STEP_PROMPTS: Record<Step, string> = {
  name: GREETING,
  business_name: "Great to meet you, {name}! What's your business called?",
  what_they_sell: "Cool — and what does {business} sell or offer?",
  industry: "Got it. Which of these is closest to what you do?",
  need: "Nice. So what are you hoping to get help with?",
  budget_range: "Makes sense. And roughly what's your monthly budget for this — my fee plus ad spend, in KES?",
  start_timeframe: "Good to know. When are you thinking of starting?",
  email: "Perfect — what's the best email for you?",
  whatsapp: "And a WhatsApp number so we can carry this on directly? (e.g. 07XX XXX XXX)",
  website_or_social: "Last thing — got a website or Instagram I could take a quick look at? Totally optional.",
  done: "",
};

const NEED_REACTIONS: Record<string, string> = {
  SEO: "Smart move — SEO compounds over time and keeps paying off long after you stop paying for ads.",
  "Meta Ads": "Good pick — Meta Ads are great for fast visibility on Instagram & Facebook.",
  "Google Ads": "Solid choice — Google Ads catches people who are already searching for what you sell.",
  "TikTok Ads": "TikTok's blowing up in Kenya right now, good timing on that one.",
  "Content & social media": "Consistent content is honestly what builds real trust with an audience.",
  "Not sure": "No worries at all — that's exactly what this chat is for, let's figure it out together.",
};

const BUTTON_STEPS: Partial<Record<Step, readonly string[]>> = {
  industry: INDUSTRY_OPTIONS,
  need: NEED_OPTIONS,
  budget_range: BUDGET_OPTIONS,
  start_timeframe: START_OPTIONS,
};

const TEXT_STEPS = new Set<Step>(["name", "business_name", "what_they_sell", "email", "whatsapp", "website_or_social"]);

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

function looksLikeQuestion(text: string): boolean {
  const t = text.trim();
  return /\?$/.test(t) || /^(what|how|why|who|when|where|can you|do you|does|is it|are you|will you|which)\b/i.test(t);
}

// A human doesn't reply instantly, and a longer message takes longer to type.
function typingDelayFor(text: string): number {
  return Math.min(1800, 450 + text.length * 10 + Math.random() * 300);
}

function reactionFor(step: Step, fields: ChatLeadFields): string | null {
  if (step === "what_they_sell") return `Nice, ${fields.business_name} sounds like a great business to grow.`;
  if (step === "need") return NEED_REACTIONS[fields.need || ""] ?? null;
  if (step === "budget_range") return fields.budget_range === "Under 30k" ? null : "Great, that's a solid budget to work with.";
  return null;
}

async function askAI(question: string, onDelta: (chunk: string) => void): Promise<string> {
  let full = "";
  const resp = await fetch(AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: [{ role: "user", content: question }] }),
  });
  if (!resp.ok || !resp.body) throw new Error("AI request failed");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ") || line.trim() === "") continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          full += content;
          onDelta(full);
        }
      } catch {
        // partial JSON, ignore
      }
    }
  }
  return full;
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-xl px-3 py-2.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
      </div>
    </div>
  );
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("name");
  const [fields, setFields] = useState<ChatLeadFields>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const leadIdRef = useRef<string | null>(null);

  useEffect(() => {
    leadIdRef.current = leadId;
  }, [leadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isLoading]);

  // Listen for Calendly's postMessage once a booking is confirmed, so we can
  // mark the lead as booked even though the popup lives in an iframe we don't control.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.event !== "calendly.event_scheduled") return;
      if (!leadIdRef.current) return;
      void markChatLeadBooked(leadIdRef.current);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const botSay = async (content: string, quickReplies?: string[], action?: "calendly" | "whatsapp") => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, typingDelayFor(content)));
    setIsTyping(false);
    setMessages((prev) => [...prev, { role: "bot", content, quickReplies, action }]);
  };

  const openChat = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      trackEvent("chat_opened");
      void botSay(GREETING, ["I just have a question"]);
    }
  };

  const nextStepAfter = (current: Step): Step => STEP_ORDER[STEP_ORDER.indexOf(current) + 1];

  const askStep = async (target: Step, updatedFields: ChatLeadFields) => {
    if (target === "done") {
      await finishFlow(updatedFields);
      return;
    }
    let prompt = STEP_PROMPTS[target];
    prompt = prompt
      .replace("{name}", updatedFields.name || "there")
      .replace("{business}", updatedFields.business_name || "your business");

    const options = BUTTON_STEPS[target];
    if (options) {
      await botSay(prompt, [...options]);
    } else if (target === "website_or_social") {
      await botSay(prompt, ["Skip"]);
    } else {
      await botSay(prompt);
    }
    setStep(target);
  };

  const finishFlow = async (finalFields: ChatLeadFields) => {
    const status = computeStatus(finalFields);

    if (leadId) {
      await updateChatLead(leadId, finalFields, "done");
    }
    await notifyLeadByEmail(finalFields, status);
    trackEvent("lead_submitted", { status });

    const industryNote = finalFields.industry ? ` in ${finalFields.industry.toLowerCase()}` : "";

    if (status === "hot") {
      await botSay(
        `You're all set, ${finalFields.name}! What you've shared about ${finalFields.business_name || "your business"}${industryNote} tells me a quick strategy call is worth it. Pick a time that works for you and I'll be there.`,
        undefined,
        "calendly"
      );
    } else {
      await botSay(
        `Thanks so much, ${finalFields.name}! I've got your details and I'll personally follow up with some ideas for ${finalFields.business_name || "your business"}. In the meantime, feel free to message me directly on WhatsApp.`,
        undefined,
        "whatsapp"
      );
    }
    setStep("done");
  };

  const handleFieldAnswer = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    let fieldKey: keyof ChatLeadFields;
    let storedValue: string | undefined = trimmed;

    if (step === "email") {
      if (!isValidEmail(trimmed)) {
        setErrorText("That doesn't look like a valid email — mind double-checking it?");
        return;
      }
      fieldKey = "email";
    } else if (step === "whatsapp") {
      const normalized = normalizeKenyanPhone(trimmed);
      if (!normalized) {
        setErrorText("Please enter a valid Kenyan number, e.g. 0712 345 678 or +254712345678.");
        return;
      }
      fieldKey = "whatsapp";
      storedValue = normalized;
    } else if (step === "website_or_social") {
      fieldKey = "website_or_social";
      if (trimmed.toLowerCase() === "skip") storedValue = undefined;
    } else {
      fieldKey = step as keyof ChatLeadFields;
    }

    setErrorText(null);
    const updatedFields: ChatLeadFields = { ...fields, [fieldKey]: storedValue };
    setFields(updatedFields);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    if (!leadId && step === "name") {
      const id = await createChatLead(updatedFields);
      setLeadId(id);
    } else if (leadId) {
      void updateChatLead(leadId, updatedFields, step);
    }

    const reaction = reactionFor(step, updatedFields);
    if (reaction) await botSay(reaction);

    await askStep(nextStepAfter(step), updatedFields);
  };

  const handleQuickReply = async (value: string) => {
    if (value === "I just have a question" && step === "name" && messages.length === 1) {
      setMessages((prev) => [...prev, { role: "user", content: value }]);
      await botSay("Great question — Joe can answer that directly on WhatsApp.", undefined, "whatsapp");
      setStep("done");
      return;
    }
    await handleFieldAnswer(value);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || isTyping || step === "done") return;

    const options = BUTTON_STEPS[step];
    const isButtonStep = !!options;
    const matchedOption = options?.find((o) => o.toLowerCase() === text.toLowerCase());

    if (matchedOption) {
      void handleFieldAnswer(matchedOption);
      return;
    }

    if (looksLikeQuestion(text) || isButtonStep) {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setInput("");
      setIsLoading(true);
      try {
        let botIndex = -1;
        setMessages((prev) => {
          botIndex = prev.length;
          return [...prev, { role: "bot", content: "" }];
        });
        await askAI(text, (partial) => {
          setMessages((prev) => {
            const copy = [...prev];
            if (botIndex >= 0 && copy[botIndex]) copy[botIndex] = { role: "bot", content: partial };
            return copy;
          });
        });
      } catch (err) {
        console.error("Chat AI error:", err);
        setMessages((prev) => [...prev, { role: "bot", content: "Hmm, couldn't pull that up right now. Let's carry on below 👇" }]);
      } finally {
        setIsLoading(false);
        await askStep(step, fields);
      }
      return;
    }

    await handleFieldAnswer(text);
  };

  const handleBookCall = async () => {
    trackEvent("calendly_clicked");
    await openCalendlyPopup(buildCalendlyUrl(fields.name || "", fields.email || ""));
  };

  const handleWhatsAppClick = () => {
    trackConversion("Contact");
  };

  const isTextStep = TEXT_STEPS.has(step);
  const isBusy = isTyping || isLoading;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={openChat}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          >
            <Bot className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">Get a Free Quote</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 max-h-[560px] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold text-sm">Joseph's Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[400px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.quickReplies && (
                    <div className="mt-2 flex flex-wrap gap-2 max-w-[95%]">
                      {msg.quickReplies.map((opt) => (
                        <Button
                          key={opt}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => handleQuickReply(opt)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                  {msg.action === "calendly" && (
                    <Button size="sm" className="mt-2 text-xs h-9 gap-1.5" onClick={handleBookCall}>
                      <CalendarCheck className="h-3.5 w-3.5" />
                      Book your free strategy call
                    </Button>
                  )}
                  {msg.action === "whatsapp" && (
                    <a
                      href={buildWhatsAppUrl(fields.name, fields.business_name, fields.need)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleWhatsAppClick}
                      className="mt-2"
                    >
                      <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message me on WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              ))}
              {isBusy && <TypingDots />}
              <div ref={messagesEndRef} />
            </div>

            {errorText && <p className="px-4 text-xs text-destructive">{errorText}</p>}

            {step !== "done" && (
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={isTextStep ? "Type your answer..." : "Ask a question, or tap an option above"}
                  className="h-10 text-sm"
                  disabled={isBusy}
                />
                <Button size="icon" onClick={handleSend} disabled={isBusy || !input.trim()} className="h-10 w-10 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
