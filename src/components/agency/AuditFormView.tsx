import type { FormEventHandler } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { PRIVACY_PATH, AUDIT_WHATSAPP, auditBudgets } from "@/data/agencyHome";
import { Link } from "react-router-dom";
import { Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditFields } from "./auditValidation";

type AuditFormViewProps = {
  register?: UseFormRegister<AuditFields>;
  errors?: FieldErrors<AuditFields>;
  status: "loading" | "idle" | "sent" | "error";
  isSubmitting?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export function AuditFormView({ register, errors = {}, status, isSubmitting = false, onSubmit }: AuditFormViewProps) {
  const field = (name: keyof AuditFields) => register ? register(name) : { name };
  const invalid = (name: keyof AuditFields) => ({
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `audit-error-${name}` : undefined,
  });
  const errorFor = (name: keyof AuditFields) => errors[name] && (
    <span id={`audit-error-${name}`} className="studio-field-error" role="alert">{errors[name]?.message}</span>
  );

  return (
    <div className="studio-audit-panel" data-track-location="agency_audit">
      <p aria-live="polite" className={status === "sent" ? "studio-success" : "sr-only"}>
        {status === "sent" && <><Check aria-hidden /> Audit request received. I’ll follow up using the number you provided.</>}
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
          <Button type="submit" className="w-full rounded-full" disabled={!register || isSubmitting}>
            {isSubmitting ? "Sending request…" : "Request My Free Audit"}
          </Button>
          <p className="studio-form-note">I’ll use your details to respond to this request. <Link to={PRIVACY_PATH}>Privacy policy</Link></p>
        </form>
      )}
      <a href={AUDIT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="studio-whatsapp">
        <MessageCircle size={18} aria-hidden /> Message me on WhatsApp
      </a>
    </div>
  );
}
