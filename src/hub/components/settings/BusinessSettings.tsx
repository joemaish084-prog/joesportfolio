import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toNumberOrNull } from "../../lib/format";
import { paymentLines, useSaveSettings, useSettings } from "../../lib/settings";
import type { BusinessProfile } from "../../lib/types";
import { Field, MoneyInput, inputClass } from "../form";
import { SkeletonBlock } from "../ui";

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="hub-section-title">{title}</h2>
      <div className="hub-card space-y-4 p-5 sm:p-6">
        {hint && <p className="-mt-1 text-sm text-muted-foreground">{hint}</p>}
        {children}
      </div>
    </section>
  );
}

const TEXT_FIELDS: { key: keyof BusinessProfile; label: string; placeholder?: string; wide?: boolean }[] = [
  { key: "name", label: "Business name" },
  { key: "tagline", label: "Tagline", placeholder: "Digital Marketing" },
  { key: "email", label: "Email", placeholder: "hello@josephmaina.co.ke" },
  { key: "phone", label: "Phone", placeholder: "0712 345 678" },
  { key: "website", label: "Website" },
  { key: "kra_pin", label: "KRA PIN", placeholder: "A000000000X" },
  { key: "location", label: "Town", placeholder: "Nairobi, Kenya" },
  { key: "address", label: "Address", placeholder: "Building, street", wide: true },
];

const PAY_FIELDS: { key: keyof BusinessProfile; label: string; placeholder?: string }[] = [
  { key: "mpesa_till", label: "M-Pesa Buy Goods till", placeholder: "123456" },
  { key: "mpesa_paybill", label: "M-Pesa Paybill", placeholder: "247247" },
  { key: "mpesa_account", label: "Paybill account number", placeholder: "Your account no." },
  { key: "bank_name", label: "Bank", placeholder: "e.g. Equity Bank" },
  { key: "bank_account_name", label: "Account name" },
  { key: "bank_account_number", label: "Account number" },
  { key: "bank_branch", label: "Branch" },
];

/** Business profile, payment details, invoice defaults and the monthly goal. */
export function BusinessSettings() {
  const { settings, isLoading } = useSettings();
  const save = useSaveSettings();
  const [business, setBusiness] = useState<BusinessProfile>({});
  const [dueDays, setDueDays] = useState("14");
  const [footer, setFooter] = useState("");
  const [goal, setGoal] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isLoading || loaded) return;
    setBusiness(settings.business);
    setDueDays(String(settings.invoice.due_days));
    setFooter(settings.invoice.footer ?? "");
    setGoal(settings.revenueGoal ? String(settings.revenueGoal) : "");
    setLoaded(true);
  }, [isLoading, loaded, settings]);

  if (isLoading || !loaded) return <SkeletonBlock className="h-96 rounded-[20px]" />;

  const set = (key: keyof BusinessProfile, value: string) => setBusiness((b) => ({ ...b, [key]: value }));

  const submit = () => {
    const days = Number(dueDays);
    const goalValue = toNumberOrNull(goal);
    if (goal.trim() && (!goalValue || goalValue <= 0)) return toast.error("The goal should be an amount, e.g. 300,000");
    const cleaned = Object.fromEntries(
      Object.entries(business)
        .map(([k, v]) => [k, (v ?? "").trim()])
        .filter(([, v]) => v),
    );
    save.mutate(
      {
        business: cleaned,
        invoice_defaults: {
          due_days: Number.isFinite(days) && days >= 0 ? days : 14,
          footer: footer.trim() || undefined,
        },
        revenue_goal: goalValue,
      },
      {
        onSuccess: () => toast.success("Settings saved"),
        onError: (e) =>
          toast.error(/hub_settings/.test(e.message) ? "Settings need the phase 3 database update first." : e.message),
      },
    );
  };

  const preview = paymentLines(business);

  return (
    <div className="space-y-8">
      {!settings.available && (
        <p className="rounded-2xl bg-warning-soft px-4 py-3 text-sm text-warning">
          Settings can't be saved until the phase 3 database update is applied. The hub is using the defaults below.
        </p>
      )}

      <Group title="Your business" hint="Printed at the top of every invoice.">
        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={`biz-${f.key}`} className={cn(f.wide && "sm:col-span-2")}>
              <Input
                id={`biz-${f.key}`}
                value={business[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={inputClass}
              />
            </Field>
          ))}
        </div>
      </Group>

      <Group title="How clients pay you" hint="Shown on every invoice and in payment reminders. Fill in what you use.">
        <div className="grid gap-4 sm:grid-cols-2">
          {PAY_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={`pay-${f.key}`}>
              <Input
                id={`pay-${f.key}`}
                value={business[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={cn(inputClass, "hub-tabular")}
              />
            </Field>
          ))}
        </div>
        {preview.length > 0 && (
          <div className="rounded-xl bg-secondary/60 px-4 py-3 text-sm">
            <p className="hub-label mb-1">On invoices this reads</p>
            {preview.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        )}
      </Group>

      <Group title="Invoices and goals">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Payment terms" hint="New invoices are due this many days after the invoice date.">
            <Select value={dueDays} onValueChange={setDueDays}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["0", "7", "14", "21", "30"].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d === "0" ? "Due on receipt" : `${d} days`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Monthly revenue goal" htmlFor="goal" hint="Shown on the Finance dashboard.">
            <MoneyInput id="goal" value={goal} onChange={setGoal} placeholder="e.g. 300,000" />
          </Field>
          <Field label="Invoice footer" htmlFor="footer" className="sm:col-span-2">
            <Textarea
              id="footer"
              rows={2}
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="Thank you for your business."
              className="rounded-xl bg-background"
            />
          </Field>
        </div>
      </Group>

      <div className="sticky bottom-24 z-10 flex justify-end md:bottom-6">
        <Button className="rounded-full px-6 shadow-hub-lg" onClick={submit} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
