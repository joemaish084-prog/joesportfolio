import { useState } from "react";
import { Check, Copy, Landmark, MapPin, MessageCircle, Phone, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import portrait from "@/assets/joseph-maina-portrait.webp";
import { usePortal } from "../auth/PortalData";
import { contactFor } from "../lib/contact";
import type { PortalBusiness } from "../lib/types";

/** Your portrait as a round avatar, framed in the portal's orange. */
export function ManagerAvatar({ className }: { className?: string }) {
  return (
    <img
      src={portrait}
      alt=""
      width={96}
      height={96}
      loading="lazy"
      decoding="async"
      className={cn("h-11 w-11 shrink-0 rounded-full object-cover object-[50%_18%] ring-2 ring-primary/70 ring-offset-2 ring-offset-card", className)}
    />
  );
}

/**
 * "Your growth partner": your photo and the two ways Kenyan clients actually
 * reach you, WhatsApp and a phone call. WhatsApp opens with a message that
 * already says who's writing.
 */
export function ManagerCard({ variant = "card", className }: { variant?: "card" | "compact"; className?: string }) {
  const { business, me, client } = usePortal();
  const c = contactFor(business);
  const who = me.full_name || client.contact_person || "";
  const hello = `Hi ${c.firstName}, it's ${who ? `${who} from ` : ""}${client.business_name || client.name}. `;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/40 p-2.5", className)}>
        <ManagerAvatar className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{c.name}</p>
          <p className="truncate text-[0.6875rem] text-muted-foreground">Your growth partner</p>
        </div>
        <a
          href={c.whatsapp(hello)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Message ${c.firstName} on WhatsApp`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white transition-transform hover:scale-105"
        >
          <MessageCircle className="h-[1.125rem] w-[1.125rem]" />
        </a>
      </div>
    );
  }

  return (
    <section className={cn("portal-card overflow-hidden p-5", className)}>
      <div className="flex items-center gap-4">
        <ManagerAvatar className="h-16 w-16" />
        <div className="min-w-0">
          <p className="portal-eyebrow">Your growth partner</p>
          <p className="portal-display mt-0.5 text-lg font-semibold leading-tight">{c.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {c.location}
          </p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Got a question, an idea, or something you want to change? Message {c.firstName} directly. We keep it simple.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Button asChild className="h-11 rounded-xl bg-[#25D366] font-semibold text-white hover:bg-[#1ebe5b]">
          <a href={c.whatsapp(hello)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <a href={c.tel}>
            <Phone className="mr-1.5 h-4 w-4" /> Call
          </a>
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground portal-tabular">{c.phone}</p>
    </section>
  );
}

// ---------------------------------------------------------------- paying

function CopyValue({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="portal-display portal-tabular truncate text-lg font-semibold tracking-wide">{value}</p>
      </div>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={() => {
          void navigator.clipboard
            .writeText(value)
            .then(() => {
              setDone(true);
              toast.success(`${label} copied`);
              setTimeout(() => setDone(false), 1800);
            })
            .catch(() => toast.error("Couldn't copy. Select the number and copy it."));
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      >
        {done ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

export const hasPaymentDetails = (b: PortalBusiness) =>
  !!(b.mpesa_till || b.mpesa_paybill || b.bank_account_number);

/**
 * How to pay, in the way Kenyan clients expect: M-Pesa Till or Paybill with
 * one-tap copy, the bank account, and the KRA PIN for tax invoices. Shows only
 * what you've filled in under Settings.
 */
export function PayCard({ reference, className }: { reference?: string; className?: string }) {
  const { business: b } = usePortal();
  if (!hasPaymentDetails(b)) return null;
  const account = b.mpesa_account || reference;
  return (
    <section className={cn("portal-card p-5", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366] ring-1 ring-[#25D366]/25">
          <Smartphone className="h-5 w-5" />
        </span>
        <div>
          <h2 className="portal-display font-semibold">How to pay</h2>
          <p className="text-xs text-muted-foreground">M-Pesa or bank, whichever is easier for you</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {b.mpesa_till && <CopyValue label="M-Pesa Buy Goods Till" value={b.mpesa_till} />}
        {b.mpesa_paybill && (
          <>
            <CopyValue label="M-Pesa Paybill business no." value={b.mpesa_paybill} />
            {account && <CopyValue label="Paybill account no." value={account} />}
          </>
        )}
        {b.bank_account_number && (
          <>
            <CopyValue label={`Bank account${b.bank_name ? ` · ${b.bank_name}` : ""}`} value={b.bank_account_number} />
            {(b.bank_account_name || b.bank_branch) && (
              <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                <Landmark className="h-3.5 w-3.5" /> {[b.bank_account_name, b.bank_branch].filter(Boolean).join(" · ")}
              </p>
            )}
          </>
        )}
      </div>

      {(b.mpesa_till || b.mpesa_paybill) && (
        <details className="group mt-4 rounded-xl border border-border/70 px-3.5 py-2.5 text-sm">
          <summary className="cursor-pointer list-none font-medium text-primary marker:hidden">
            Steps on your phone <span className="text-muted-foreground group-open:hidden">· show</span>
          </summary>
          <ol className="mt-2.5 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Open M-Pesa and choose Lipa na M-PESA.</li>
            <li>
              {b.mpesa_till ? "Buy Goods and Services, then enter the Till number above." : "Pay Bill, then enter the business number and account number above."}
            </li>
            <li>Enter the amount from your invoice and your M-Pesa PIN.</li>
            <li>You'll get an SMS confirmation. Send us the code if we don't see it within a few minutes.</li>
          </ol>
        </details>
      )}

      {b.kra_pin && (
        <p className="mt-4 text-xs text-muted-foreground">
          KRA PIN <span className="portal-tabular font-medium text-foreground">{b.kra_pin}</span> · quote it for your tax records.
        </p>
      )}
    </section>
  );
}
