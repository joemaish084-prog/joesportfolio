import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRows, useSaveReport } from "../../lib/data";
import { toNumberOrNull } from "../../lib/format";
import { useClientKpis } from "../../lib/queries";
import { KPI_UNIT_LABEL, type Report } from "../../lib/types";
import { ClientPicker, DatePicker, Field, FormDialog, inputClass } from "../form";

/** Create or edit a report: the period, a value per KPI, a summary and an optional attached file. */
export function ReportDialog({
  open,
  onOpenChange,
  clientId,
  report,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  report?: Report | null;
}) {
  const save = useSaveReport();
  const metrics = useRows("report_metrics");
  const docs = useRows("documents");
  const [client, setClient] = useState<string | null>(clientId ?? null);
  const kpis = useClientKpis(client ?? undefined);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // New reports default to last month, the usual reporting rhythm.
    const last = subMonths(new Date(), 1);
    setClient(report?.client_id ?? clientId ?? null);
    setTitle(report?.title ?? `${format(last, "MMMM yyyy")} report`);
    setStart(report?.period_start ?? format(startOfMonth(last), "yyyy-MM-dd"));
    setEnd(report?.period_end ?? format(endOfMonth(last), "yyyy-MM-dd"));
    setSummary(report?.summary ?? "");
    setDocumentId(report?.document_id ?? null);
    const existing: Record<string, string> = {};
    if (report) {
      for (const m of metrics.data ?? []) if (m.report_id === report.id) existing[m.client_kpi_id] = String(m.value);
    }
    setValues(existing);
    setError(null);
    // metrics.data intentionally omitted: only seed values when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, report, clientId]);

  const clientDocs = useMemo(() => (docs.data ?? []).filter((d) => d.client_id === client), [docs.data, client]);

  const submit = () => {
    if (!client) return setError("Choose a client.");
    if (!title.trim()) return setError("Give the report a title.");
    if (!start || !end) return setError("Set the report period.");
    if (end < start) return setError("The period ends before it starts.");
    const parsed: Record<string, number | null> = {};
    for (const kpi of kpis.data ?? []) {
      const text = values[kpi.id] ?? "";
      const n = toNumberOrNull(text.replace(/%|kes/gi, ""));
      if (text.trim() && n === null) return setError(`${kpi.name} should be a number.`);
      parsed[kpi.id] = n;
    }
    save.mutate(
      {
        id: report?.id,
        client_id: client,
        title: title.trim(),
        period_start: start,
        period_end: end,
        summary: summary.trim() || null,
        document_id: documentId,
        values: parsed,
      },
      {
        onSuccess: () => {
          toast.success(report ? "Report updated" : "Report saved");
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
      title={report ? "Edit report" : "New report"}
      description="Record this period's results. They feed the client's progress charts."
      onSubmit={submit}
      pending={save.isPending}
      error={error}
      wide
    >
      {!clientId && !report && (
        <Field label="Client">
          <ClientPicker value={client} onChange={setClient} />
        </Field>
      )}
      <Field label="Title" htmlFor="rp-title">
        <Input id="rp-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From">
          <DatePicker value={start} onChange={setStart} clearable={false} />
        </Field>
        <Field label="To">
          <DatePicker value={end} onChange={setEnd} clearable={false} />
        </Field>
      </div>

      {client && (
        <div className="rounded-2xl bg-secondary/50 p-4">
          <p className="mb-3 text-sm font-medium">Results</p>
          {kpis.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading KPIs…</p>
          ) : !kpis.data?.length ? (
            <p className="text-sm text-muted-foreground">
              This client has no KPIs yet.{" "}
              <Link to={`/hub/clients/${client}/edit`} className="font-medium text-primary hover:underline">
                Add KPIs
              </Link>{" "}
              to track results over time.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {kpis.data.map((kpi) => (
                <Field key={kpi.id} label={`${kpi.name} (${KPI_UNIT_LABEL[kpi.unit]})`} htmlFor={`kpi-${kpi.id}`}>
                  <Input
                    id={`kpi-${kpi.id}`}
                    inputMode="decimal"
                    value={values[kpi.id] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [kpi.id]: e.target.value }))}
                    placeholder={kpi.unit === "kes" ? "e.g. 120,000" : kpi.unit === "percent" ? "e.g. 3.5" : "e.g. 42"}
                    className={`${inputClass} hub-tabular bg-card`}
                  />
                </Field>
              ))}
            </div>
          )}
        </div>
      )}

      <Field label="Summary" htmlFor="rp-summary" hint="What happened, what worked, what's next.">
        <Textarea id="rp-summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} className="rounded-xl bg-background" />
      </Field>
      {client && clientDocs.length > 0 && (
        <Field label="Attach a document">
          <Select value={documentId ?? "__none"} onValueChange={(v) => setDocumentId(v === "__none" ? null : v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">None</SelectItem>
              {clientDocs.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    </FormDialog>
  );
}
