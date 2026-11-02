import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  WHATSAPP_SOURCES,
  WHATSAPP_SOURCE_LABEL,
  WHATSAPP_STATUSES,
  WHATSAPP_STATUS_LABEL,
  useLogWhatsAppLead,
  type WhatsAppLeadInput,
} from "../../lib/website";
import { Field, FormDialog, inputClass } from "../form";
import { DatePicker } from "../pickers";

/** Logs a WhatsApp chat by hand, since WhatsApp messages never reach the site. */
export function WhatsAppLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const log = useLogWhatsAppLead();
  const [day, setDay] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState<WhatsAppLeadInput["source"]>("website");
  const [status, setStatus] = useState<WhatsAppLeadInput["status"]>("new");
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDay(format(new Date(), "yyyy-MM-dd"));
    setName("");
    setPhone("");
    setBusiness("");
    setDetail("");
    setSource("website");
    setStatus("new");
    setBooked(false);
    setError(null);
  }, [open]);

  const submit = () => {
    if (!name.trim() && !phone.trim()) return setError("Add a name or a phone number.");
    const today = format(new Date(), "yyyy-MM-dd");
    if (day && day > today) return setError("The chat date can't be in the future.");
    const blank = (v: string) => v.trim() || null;
    // Today keeps the current time; an earlier day is logged at midday so it
    // lands on that day in the charts.
    const created_at = !day || day === today ? new Date().toISOString() : new Date(`${day}T12:00:00`).toISOString();
    log.mutate(
      {
        created_at,
        name: blank(name),
        phone: blank(phone),
        business_name: blank(business),
        detail: blank(detail),
        source,
        status,
        booked,
      },
      {
        onSuccess: () => {
          toast.success("WhatsApp chat logged");
          onOpenChange(false);
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Log WhatsApp chat"
      onSubmit={submit}
      submitLabel="Log chat"
      pending={log.isPending}
      error={error}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="wa-name">
          <Input id="wa-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoFocus />
        </Field>
        <Field label="Phone" htmlFor="wa-phone">
          <Input
            id="wa-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07…"
            className={inputClass}
          />
        </Field>
        <Field label="Business" htmlFor="wa-business">
          <Input id="wa-business" value={business} onChange={(e) => setBusiness(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Chat started">
          <DatePicker value={day} onChange={setDay} clearable={false} />
        </Field>
        <Field label="Found you through">
          <Select value={source} onValueChange={(v) => setSource(v as WhatsAppLeadInput["source"])}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WHATSAPP_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {WHATSAPP_SOURCE_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onValueChange={(v) => setStatus(v as WhatsAppLeadInput["status"])}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WHATSAPP_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {WHATSAPP_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <p className="-mt-1 text-xs text-muted-foreground">
        Pick Website when their first message was "Hi Joseph! I was on josephmaina.co.ke…".
      </p>
      <Field label="What they want" htmlFor="wa-detail">
        <Textarea
          id="wa-detail"
          rows={3}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          className="rounded-xl bg-background"
        />
      </Field>
      <label htmlFor="wa-booked" className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3.5 py-3">
        <span className="text-sm">Booked a call</span>
        <Switch id="wa-booked" checked={booked} onCheckedChange={setBooked} />
      </label>
    </FormDialog>
  );
}
