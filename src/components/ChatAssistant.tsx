import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import {
  NEED_OPTIONS,
  BUDGET_OPTIONS,
  START_OPTIONS,
  isQualified,
  computeStatus,
  isValidEmail,
  normalizeKenyanPhone,
  buildCalendlyUrl,
  buildWhatsAppUrl,
  createChatLead,
  updateChatLead,
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
  | "need"
  | "budget_range"
  | "start_timeframe"
  | "email"
  | "whatsapp"
  | "done";

const STEP_PROMPTS: Record<Step, string> = {
  name: "Hi! I'm Joseph's assistant 👋 What's your name?",
  business_name: "Nice to meet you, {name}! What's your business called?",
  what_they_sell: "And what does {business} sell or offer?",
  need: "What do you need help with?",
  budget_range: "What's your monthly budget for this (my fee + ad spend), in KES?",
  start_timeframe: "When are you looking to start?",
  email: "Great! What's the best email to reach you on?",
  whatsapp: "Last one — what's your WhatsApp number? (e.g. 07XX XXX XXX)",
  done: "",
};

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

function looksLikeQuestion(text: string): boolean {
  const t = text.trim();
  return /\?$/.test(t) || /^(what|how|why|who|when|where|can you|do you|does|is it|are you|will you|which)\b/i.test(t);
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

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: STEP_PROMPTS.name },
  ]);
  const [step, setStep] = useState<Step>("name");
  const [fields, setFields] = useState<ChatLeadFields>({});
  const [leadId, setLeadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      trackEvent("chat_opened");
    }
  };

  const addBotMessage = (content: string, quickReplies?: string[], action?: "calendly" | "whatsapp") => {
    setMessages((prev) => [...prev, { role: "bot", content, quickReplies, action }]);
  };

  const nextStepAfter = (current: Step): Step => {
    const order: Step[] = [
      "name",
      "business_name",
      "what_they_sell",
      "need",
      "budget_range",
      "start_timeframe",
      "email",
      "whatsapp",
      "done",
    ];
    return order[order.indexOf(current) + 1];
  };

  const askStep = (target: Step, updatedFields: ChatLeadFields) => {
    if (target === "done") {
      void finishFlow(updatedFields);
      return;
    }
    let prompt = STEP_PROMPTS[target];
    prompt = prompt.replace("{name}", updatedFields.name || "there").replace("{business}", updatedFields.business_name || "your business");

    if (target === "need") {
      addBotMessage(prompt, [...NEED_OPTIONS]);
    } else if (target === "budget_range") {
      addBotMessage(prompt, [...BUDGET_OPTIONS]);
    } else if (target === "start_timeframe") {
      addBotMessage(prompt, [...START_OPTIONS]);
    } else {
      addBotMessage(prompt);
    }
    setStep(target);
  };

  const finishFlow = async (finalFields: ChatLeadFields) => {
    const qualified = isQualified(finalFields.budget_range, finalFields.start_timeframe);
    const status = computeStatus(finalFields);

    if (leadId) {
      await updateChatLead(leadId, finalFields, "done");
    }
    await notifyLeadByEmail(finalFields, status);
    trackEvent("lead_submitted", { qualified, status });

    if (qualified) {
      addBotMessage(
        `You're all set, ${finalFields.name}! Based on what you've shared, a quick strategy call makes sense. Pick a time that works for you and I'll be there.`,
        undefined,
        "calendly"
      );
    } else {
      addBotMessage(
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

    // Validate + normalize per-step
    let fieldKey: keyof ChatLeadFields;
    let storedValue = trimmed;

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
    } else if (step === "need") {
      fieldKey = "need";
    } else if (step === "budget_range") {
      fieldKey = "budget_range";
    } else if (step === "start_timeframe") {
      fieldKey = "start_timeframe";
    } else if (step === "business_name") {
      fieldKey = "business_name";
    } else if (step === "what_they_sell") {
      fieldKey = "what_they_sell";
    } else {
      fieldKey = "name";
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

    askStep(nextStepAfter(step), updatedFields);
  };

  const handleQuickReply = (value: string) => {
    void handleFieldAnswer(value);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || step === "done") return;

    const isButtonStep = step === "need" || step === "budget_range" || step === "start_timeframe";
    const options = step === "need" ? NEED_OPTIONS : step === "budget_range" ? BUDGET_OPTIONS : START_OPTIONS;
    const matchesOption = isButtonStep && options.some((o) => o.toLowerCase() === text.toLowerCase());

    if (matchesOption) {
      const match = options.find((o) => o.toLowerCase() === text.toLowerCase())!;
      void handleFieldAnswer(match);
      return;
    }

    if (looksLikeQuestion(text) || (isButtonStep && !matchesOption)) {
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
        addBotMessage("Sorry, I couldn't look that up right now. Let's continue below 👇");
      } finally {
        setIsLoading(false);
        // Re-ask the current step so they can pick up where they left off
        askStep(step, fields);
      }
      return;
    }

    void handleFieldAnswer(text);
  };

  const isTextStep = ["name", "business_name", "what_they_sell", "email", "whatsapp"].includes(step);

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
                    <a
                      href={buildCalendlyUrl(fields.name || "", fields.email || "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("calendly_clicked")}
                      className="mt-2"
                    >
                      <Button size="sm" className="text-xs h-9 gap-1.5">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        Book your free strategy call
                      </Button>
                    </a>
                  )}
                  {msg.action === "whatsapp" && (
                    <a
                      href={buildWhatsAppUrl(fields.name || "", fields.need)}
                      target="_blank"
                      rel="noopener noreferrer"
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
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-3 py-2 text-sm flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
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
                  disabled={isLoading}
                />
                <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="h-10 w-10 shrink-0">
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
