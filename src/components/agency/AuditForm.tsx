import { useRef, useState, type FormEvent } from "react";
import { PRIVACY_PATH, AUDIT_WHATSAPP } from "@/data/agencyHome";
import { Link } from "react-router-dom";
import { Check, MessageCircle } from "lucide-react";

const budgets = [
  "Under KES 50,000",
  "KES 50,000 to 99,999",
  "KES 100,000 to 249,999",
  "KES 250,000 or more",
  "Still deciding",
];

export function AuditForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const phoneField = useRef<HTMLInputElement>(null);
  const sending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const fields = new FormData(event.currentTarget);
    const get = (field: string) => String(fields.get(field) ?? "").trim();
    if (get("website")) {
      setStatus("sent");
      return;
    }
    const phone = get("phone").replace(/[\s().-]/g, "");
    if (!/^\+?[0-9]{8,15}$/.test(phone)) {
      phoneField.current?.setCustomValidity("Enter a phone number with 8 to 15 digits.");
      phoneField.current?.reportValidity();
      return;
    }
    if (!get("name") || !get("business")) return;
    sending.current = true;
    setStatus("sending");
    try {
      const { saveAgencyLead } = await import("@/lib/saveAgencyLead");
      await saveAgencyLead({
        name: get("name"),
        email: null,
        phone,
        business_name: get("business"),
        budget_range: get("budget"),
        service_interest: "Free Marketing Audit",
      }, "agency_audit");
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  return (
    <div className="studio-audit-panel" data-track-location="agency_audit">
      <p aria-live="polite" className={status === "sent" ? "studio-success" : "sr-only"}>
        {status === "sent" && <><Check aria-hidden /> Audit request received. I’ll follow up using the number you provided.</>}
      </p>
      {status !== "sent" && (
        <form method="post" onSubmit={submit} aria-label="Free audit request" aria-busy={status === "sending"}>
          <div className="studio-fields">
            <label>Your name<input name="name" autoComplete="name" maxLength={100} pattern=".*\S.*" required /></label>
            <label>WhatsApp or phone<input ref={phoneField} name="phone" type="tel" autoComplete="tel" maxLength={25}
              onInput={event => event.currentTarget.setCustomValidity("")} required /></label>
            <label>Business name<input name="business" autoComplete="organization" maxLength={120} pattern=".*\S.*" required /></label>
            <label>Monthly marketing budget<select name="budget" defaultValue="" required>
              <option value="" disabled>Select a range</option>
              {budgets.map(budget => <option key={budget}>{budget}</option>)}
            </select></label>
          </div>
          <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {status === "error" && <p role="alert" className="studio-form-error">Your request couldn’t be sent. Try again or message me on WhatsApp.</p>}
          <button type="submit" className="studio-button studio-button-primary" disabled={status === "sending"}>
            {status === "sending" ? "Sending request…" : "Request My Free Audit"}
          </button>
          <p className="studio-form-note">I’ll use your details to respond to this request. <Link to={PRIVACY_PATH}>Privacy policy</Link></p>
        </form>
      )}
      <a href={AUDIT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="studio-whatsapp">
        <MessageCircle size={18} aria-hidden /> Message me on WhatsApp
      </a>
    </div>
  );
}
