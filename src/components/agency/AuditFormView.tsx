import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { PRIVACY_PATH, AUDIT_WHATSAPP, auditBudgets } from "@/data/agencyHome";
import { Link } from "react-router-dom";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditFields } from "./auditValidation";
import "./audit-form.css";

type AuditFormViewProps = {
  register?: UseFormRegister<AuditFields>;
  errors?: FieldErrors<AuditFields>;
  status: "loading" | "idle" | "sent" | "error" | "unavailable";
  isSubmitting?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  onRetry?: () => void;
};

export function AuditFormView({ register, errors = {}, status, isSubmitting = false, onSubmit, onRetry }: AuditFormViewProps) {
  const field = (name: keyof AuditFields) => register ? register(name) : { name };
  const invalid = (name: keyof AuditFields) => ({
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": [name === "phone" ? "audit-phone-hint" : "", errors[name] ? `audit-error-${name}` : ""].filter(Boolean).join(" ") || undefined,
  });
  const errorFor = (name: keyof AuditFields) => errors[name] && (
    <span id={`audit-error-${name}`} className="studio-field-error" role="alert">{errors[name]?.message}</span>
  );

  return (
    <div className="studio-audit-panel" data-track-location="agency_audit">
      <p role="status" className={status === "sent" ? "studio-success" : "sr-only"}>
        {status === "sent" && <><Check aria-hidden /> Audit request received. I’ll follow up using the number you provided.</>}
        {isSubmitting && "Sending your audit request."}
      </p>
      {status !== "sent" && (
        <form method="post" noValidate onSubmit={onSubmit}
          aria-label="Free audit request" aria-busy={isSubmitting || status === "loading"}>
          <fieldset disabled={!register} className="studio-fields">
            <div className="studio-field">
              <label htmlFor="audit-name">Your name</label>
              <input id="audit-name" {...field("name")} {...invalid("name")} autoComplete="name" maxLength={100} required />
              {errorFor("name")}
            </div>
            <div className="studio-field">
              <label htmlFor="audit-phone">WhatsApp or phone</label>
              <input id="audit-phone" {...field("phone")} {...invalid("phone")} type="tel" autoComplete="tel" maxLength={25} required />
              <span id="audit-phone-hint" className="text-sm text-muted-foreground">For example, 0712 345 678 or +254 712 345 678.</span>
              {errorFor("phone")}
            </div>
            <div className="studio-field">
              <label htmlFor="audit-business">Business name</label>
              <input id="audit-business" {...field("business")} {...invalid("business")} autoComplete="organization" maxLength={120} required />
              {errorFor("business")}
            </div>
            <div className="studio-field">
              <label htmlFor="audit-budget">Monthly marketing budget</label>
              <select id="audit-budget" {...field("budget")} {...invalid("budget")} defaultValue="" required>
                <option value="" disabled>Select a range</option>
                {auditBudgets.map(budget => <option key={budget}>{budget}</option>)}
              </select>
              {errorFor("budget")}
            </div>
          </fieldset>
          <div hidden aria-hidden="true"><label>Website<input {...field("website")} tabIndex={-1} autoComplete="off" /></label></div>
          {status === "error" && <p role="alert" className="studio-form-error">Your request couldn’t be sent. Try again or message me on WhatsApp.</p>}
          {status === "unavailable" ? <>
            <p role="alert" className="studio-form-error">The audit form couldn’t load. Try again or message me on WhatsApp.</p>
            <Button type="button" size="lg" className="w-full rounded-full" onClick={onRetry}>Try loading the form again</Button>
          </> : <Button type="submit" size="lg" className="w-full rounded-full" disabled={!register || isSubmitting}>
            {status === "loading" ? "Loading audit form…" : isSubmitting ? "Sending request…" : "Request My Free Audit"}
          </Button>}
          <p className="studio-form-note">I’ll use your details to respond to this request. <Link to={PRIVACY_PATH}>Privacy policy</Link></p>
        </form>
      )}
      <a href={AUDIT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="studio-whatsapp">
        <MessageCircle size={18} aria-hidden /> Message me on WhatsApp
      </a>
    </div>
  );
}
