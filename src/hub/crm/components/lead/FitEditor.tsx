import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, FormDialog, inputClass } from "../../../components/form";
import { FIT_FACTORS, FIT_FACTOR_HINT, FIT_FACTOR_LABEL, computeFit, type FitFactor } from "../../lib/fitScore";
import { useOrg, useSaveLead } from "../../lib/queries";
import type { CrmLead, FitInput } from "../../lib/types";
import { SelectField } from "../bits";

const RATED = FIT_FACTORS.filter((f) => f !== "recency") as Exclude<FitFactor, "recency">[];

/** Rate each prospect-fit factor 0-4, or leave it unknown. Unknown is never scored as zero. */
export function FitEditor({ lead, open, onOpenChange }: { lead: CrmLead; open: boolean; onOpenChange: (o: boolean) => void }) {
  const org = useOrg();
  const save = useSaveLead();
  const [inputs, setInputs] = useState<Partial<Record<string, FitInput>>>(lead.fit_inputs);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setInputs(lead.fit_inputs);
      setError(null);
    }
  }, [open, lead.fit_inputs]);

  const update = (f: string, patch: Partial<FitInput>) =>
    setInputs((s) => {
      const prev = s[f] ?? { rating: null, verified: false };
      const next = { ...prev, ...patch };
      if (patch.verified === true && !next.checked_on) next.checked_on = format(new Date(), "yyyy-MM-dd");
      return { ...s, [f]: next };
    });

  const preview = computeFit(inputs, org.data?.fit_weights);

  const submit = () => {
    const fit = computeFit(inputs, org.data?.fit_weights);
    save.mutate(
      { id: lead.id, values: { fit_inputs: inputs, fit_score: fit.score, fit_factors_known: fit.known } },
      { onSuccess: () => onOpenChange(false), onError: (e) => setError(e.message) },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Prospect fit"
      description="Rate what you've checked yourself. Tick Verified only for things you've confirmed; notes on verified factors can be used as facts in AI drafts."
      onSubmit={submit}
      pending={save.isPending}
      error={error}
      wide
      footerExtra={
        <span className="hub-tabular text-sm">
          {preview.score === null ? "Not scored" : `${Math.round(preview.score)}/100`}
          <span className="ml-1 text-xs text-muted-foreground">
            {preview.known} of {preview.total} known
          </span>
        </span>
      }
    >
      {RATED.map((f) => {
        const input = inputs[f];
        return (
          <div key={f} className="rounded-2xl border border-border/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{FIT_FACTOR_LABEL[f]}</p>
                {FIT_FACTOR_HINT[f] && <p className="text-xs text-muted-foreground">{FIT_FACTOR_HINT[f]}</p>}
              </div>
              <SelectField
                label={`${FIT_FACTOR_LABEL[f]} rating`}
                className="w-36"
                value={input?.rating == null ? "" : String(input.rating)}
                onChange={(v) => update(f, { rating: v === "" ? null : Number(v) })}
                options={[
                  { value: "", label: "Unknown" },
                  { value: "0", label: "0 · Poor" },
                  { value: "1", label: "1" },
                  { value: "2", label: "2 · OK" },
                  { value: "3", label: "3" },
                  { value: "4", label: "4 · Strong" },
                ]}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
              <Field label="Evidence" htmlFor={`fit-${f}-note`}>
                <Input
                  id={`fit-${f}-note`}
                  value={input?.note ?? ""}
                  onChange={(e) => update(f, { note: e.target.value.slice(0, 500) })}
                  placeholder="What you saw, and where"
                  className={inputClass}
                />
              </Field>
              <label className="flex h-11 items-center gap-2 text-sm">
                <Checkbox checked={!!input?.verified} onCheckedChange={(v) => update(f, { verified: v === true })} />
                Verified
              </label>
              <Field label="Checked on" htmlFor={`fit-${f}-date`}>
                <Input
                  id={`fit-${f}-date`}
                  type="date"
                  value={input?.checked_on ?? ""}
                  onChange={(e) => update(f, { checked_on: e.target.value || null })}
                  className={`${inputClass} w-40`}
                />
              </Field>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">
        "{FIT_FACTOR_LABEL.recency}" is worked out from the latest Checked on date of a verified factor.
      </p>
    </FormDialog>
  );
}
