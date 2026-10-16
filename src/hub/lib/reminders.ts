import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { formatKES } from "./format";
import { paymentLines } from "./settings";
import type { BusinessProfile, Client, Invoice } from "./types";

// Ready-to-send payment reminders: opens WhatsApp or the mail app with the
// message written. Nothing is sent from the hub itself.

/** Kenyan numbers to international digits: 0712 345 678 → 254712345678. */
export function whatsappDigits(phone: string | null | undefined) {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) d = `254${d.slice(1)}`;
  if ((d.startsWith("7") || d.startsWith("1")) && d.length === 9) d = `254${d}`;
  return d.length >= 10 ? d : null;
}

export function invoiceReminder({
  invoice,
  client,
  balance,
  business,
  today = new Date(),
}: {
  invoice: Invoice;
  client: Client | undefined;
  balance: number;
  business: BusinessProfile;
  today?: Date;
}) {
  const greetingName = client?.contact_person?.split(" ")[0] || client?.name || "there";
  const due = invoice.due_date ? parseISO(invoice.due_date) : null;
  const late = due ? differenceInCalendarDays(today, due) : 0;
  const when = !due
    ? ""
    : late > 0
      ? ` was due on ${format(due, "d MMM yyyy")} (${late} ${late === 1 ? "day" : "days"} ago)`
      : late === 0
        ? " is due today"
        : ` is due on ${format(due, "d MMM yyyy")}`;
  const pay = paymentLines(business);
  const text = [
    `Hi ${greetingName}, a friendly reminder that invoice ${invoice.number} for ${formatKES(balance)}${when}.`,
    pay.length ? `You can pay via:\n${pay.join("\n")}` : null,
    "Kindly share the payment confirmation once done. Thank you!",
    business.name ? `– ${business.name}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const digits = whatsappDigits(client?.phone);
  const subject = `Payment reminder: invoice ${invoice.number}`;
  return {
    text,
    whatsapp: digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null,
    email: client?.email
      ? `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
      : null,
  };
}
