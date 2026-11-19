import { useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import type { AuditFields } from "./auditValidation";
import { AuditFormView } from "./AuditFormView";

// Validation and Zod load after the user interacts with the form.
const resolveAudit: Resolver<AuditFields> = async (values, context, options) => {
  const [{ auditSchema }, { zodResolver }] = await Promise.all([
    import("./auditValidation"),
    import("@hookform/resolvers/zod"),
  ]);
  return zodResolver(auditSchema)(values, context, options);
};

export default function AuditFormController() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const sending = useRef(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuditFields>({
    resolver: resolveAudit,
    defaultValues: { name: "", phone: "", business: "", budget: "", website: "" },
  });

  async function submit(fields: AuditFields) {
    if (sending.current) return;
    if (fields.website?.trim()) {
      setStatus("sent");
      return;
    }
    sending.current = true;
    setStatus("idle");
    try {
      const [{ saveAgencyLead }, { normalizeKenyanPhone }] = await Promise.all([
        import("@/lib/saveAgencyLead"),
        import("./auditValidation"),
      ]);
      await saveAgencyLead({
        name: fields.name,
        email: null,
        phone: normalizeKenyanPhone(fields.phone),
        business_name: fields.business,
        budget_range: fields.budget,
        service_interest: "Free Marketing Audit",
      }, "agency_audit");
      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  }

  return <AuditFormView register={register} errors={errors} status={status} isSubmitting={isSubmitting}
    onSubmit={handleSubmit(submit, () => setStatus("idle"))} />;
}
