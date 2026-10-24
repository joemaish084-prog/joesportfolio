import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { BlurFade } from "../../components/motion/blur-fade";
import { PageHeader, Pill, Section, StatTile, TableCard } from "../../components/ui";
import { SelectField } from "../components/bits";
import {
  IMPORT_FIELDS,
  IMPORT_FIELD_LABEL,
  buildRows,
  commitPayload,
  reviewRows,
  suggestMapping,
  type Decision,
  type Mapping,
  type ReviewRow,
} from "../lib/importMapping";
import {
  useCampaigns,
  useClearImportRaw,
  useCommitImport,
  useCrm,
  useImportJobs,
  useIndustries,
  useLeads,
  useParseSheet,
  type ParsedUpload,
} from "../lib/queries";

const MAX_BYTES = 2 * 1024 * 1024;
const REASON = { name: "name", website: "website", email: "email", phone: "phone" } as const;

type Step = "upload" | "map" | "review" | "done";

function PastImports() {
  const jobs = useImportJobs(true);
  const clear = useClearImportRaw();
  if (!jobs.data?.length) return null;
  return (
    <Section title="Past imports" className="mt-8">
      <ul>
        {jobs.data.map((j) => (
          <li key={j.id} className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-3 text-sm last:border-b-0">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="font-medium">{j.filename}</span>
              <span className="block text-xs text-muted-foreground">
                {format(parseISO(j.created_at), "d MMM yyyy, HH:mm")} · {j.created_count} new, {j.merged_count} merged, {j.skipped_count} skipped,{" "}
                {j.error_count} errors
              </span>
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              disabled={clear.isPending}
              onClick={() =>
                window.confirm("Clear the raw spreadsheet rows kept for this import? The leads stay; only the stored copy of the source rows goes.") &&
                clear.mutate(j.id, { onSuccess: () => toast.success("Raw rows cleared"), onError: (e) => toast.error(e.message) })
              }
            >
              Clear raw rows
            </Button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default function ImportPage() {
  const { isOwner } = useCrm();
  const industries = useIndustries();
  const campaigns = useCampaigns();
  const leads = useLeads();
  const parse = useParseSheet();
  const commit = useCommitImport();

  const [step, setStep] = useState<Step>("upload");
  const [upload, setUpload] = useState<ParsedUpload | null>(null);
  const [sheetName, setSheetName] = useState("");
  const [methodologySheet, setMethodologySheet] = useState("");
  const [mapping, setMapping] = useState<Mapping>({});
  const [industryId, setIndustryId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [filter, setFilter] = useState<"all" | "duplicates" | "problems">("all");
  const [result, setResult] = useState<{ created: number; merged: number; skipped: number; errors: number } | null>(null);

  useEffect(() => {
    if (!industryId && industries.data) setIndustryId(industries.data.find((i) => i.slug === "car_dealership")?.id ?? "");
  }, [industries.data, industryId]);

  const sheet = upload?.sheets.find((s) => s.name === sheetName);
  const methodology = useMemo(() => {
    const s = upload?.sheets.find((x) => x.name === methodologySheet);
    if (!s) return [];
    return [s.headers.join(" ").trim(), ...s.rows.map((r) => r.filter(Boolean).join(" ").trim())].filter((line) => line && !/^Column \d+$/.test(line));
  }, [upload, methodologySheet]);

  if (!isOwner) return <Navigate to="/hub/crm/leads" replace />;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("Files can be up to 2 MB.");
      return;
    }
    if (!/\.(xlsx|csv)$/i.test(file.name)) {
      toast.error("Upload an .xlsx or .csv file.");
      return;
    }
    parse.mutate(file, {
      onSuccess: (data) => {
        setUpload(data);
        const leadsSheet = data.sheets.find((s) => /lead/i.test(s.name)) ?? data.sheets[0];
        setSheetName(leadsSheet.name);
        setMethodologySheet(data.sheets.find((s) => s !== leadsSheet && /how|read|method|notes|about/i.test(s.name))?.name ?? "");
        setMapping(suggestMapping(leadsSheet.headers));
        setStep("map");
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const toReview = async () => {
    if (!sheet) return;
    if (!Object.values(mapping).includes("name")) {
      toast.error("Choose which column holds the business name.");
      return;
    }
    setReviewing(true);
    try {
      const parsed = buildRows(sheet.headers, sheet.rows, mapping);
      setRows(await reviewRows(parsed, leads.data ?? []));
      setStep("review");
    } finally {
      setReviewing(false);
    }
  };

  const setDecision = (rowNumber: number, decision: Decision) =>
    setRows((rs) => rs.map((r) => (r.rowNumber === rowNumber ? { ...r, decision } : r)));

  const counts = {
    create: rows.filter((r) => r.decision === "create").length,
    merge: rows.filter((r) => r.decision === "merge").length,
    skip: rows.filter((r) => r.decision === "skip").length,
    error: rows.filter((r) => r.decision === "error").length,
    duplicates: rows.filter((r) => r.matches.length > 0).length,
    warnings: rows.filter((r) => r.warnings.length > 0).length,
  };

  const shownRows = rows.filter((r) =>
    filter === "duplicates" ? r.matches.length > 0 : filter === "problems" ? r.errors.length + r.warnings.length > 0 : true,
  );

  const doCommit = () => {
    if (!upload || !sheet) return;
    if (!window.confirm(`Save ${counts.create} new and ${counts.merge} merged leads? Skipped rows and rows with errors are recorded but not imported.`)) return;
    commit.mutate(
      commitPayload(
        {
          filename: upload.filename,
          fileSha256: upload.sha256,
          fileSize: upload.size,
          sheetName: sheet.name,
          mapping,
          methodology,
          industryId: industryId || null,
          campaignId: campaignId || null,
        },
        rows,
      ),
      {
        onSuccess: (r) => {
          setResult(r);
          setStep("done");
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Import leads"
          subtitle="Upload, check the columns, decide on duplicates. Nothing is saved until the last step."
        />
      </BlurFade>

      <ol className="mb-6 flex flex-wrap gap-2 text-sm" aria-label="Steps">
        {(["upload", "map", "review", "done"] as Step[]).map((s, i) => (
          <li key={s}>
            <Pill tone={s === step ? "accent" : "outline"}>
              {i + 1}. {s === "upload" ? "Upload" : s === "map" ? "Columns" : s === "review" ? "Review" : "Done"}
            </Pill>
          </li>
        ))}
      </ol>

      {step === "upload" && (
        <Section>
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center gap-3 px-6 py-14 text-center transition-colors hover:bg-secondary/50",
              parse.isPending && "pointer-events-none opacity-70",
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files[0]);
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-on-tint">
              {parse.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </span>
            <span className="text-[0.9375rem] font-semibold">{parse.isPending ? "Reading the file…" : "Choose or drop a spreadsheet"}</span>
            <span className="max-w-md text-sm text-muted-foreground">
              .xlsx or .csv, up to 2 MB. It's read on the server and not stored; only the rows you import are saved, with a copy of each source row.
            </span>
            <input
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="sr-only"
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </Section>
      )}

      {step === "map" && upload && sheet && (
        <div className="space-y-6">
          <Section title="File">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <p className="hub-label mb-1">Leads sheet</p>
                <SelectField
                  label="Leads sheet"
                  value={sheetName}
                  onChange={(v) => {
                    setSheetName(v);
                    const s = upload.sheets.find((x) => x.name === v);
                    if (s) setMapping(suggestMapping(s.headers));
                  }}
                  options={upload.sheets.map((s) => ({ value: s.name, label: `${s.name} (${s.rows.length} rows)` }))}
                />
                {sheet.truncated && <p className="mt-1 text-xs text-warning">Only the first 5,000 rows were read.</p>}
              </div>
              <div>
                <p className="hub-label mb-1">Scoring notes sheet</p>
                <SelectField
                  label="Scoring notes sheet"
                  value={methodologySheet}
                  onChange={setMethodologySheet}
                  options={[{ value: "", label: "None" }, ...upload.sheets.filter((s) => s.name !== sheetName).map((s) => ({ value: s.name, label: s.name }))]}
                />
                <p className="mt-1 text-xs text-muted-foreground">Kept with the source so the original scores can be explained later.</p>
              </div>
              <div>
                <p className="hub-label mb-1">Industry for these leads</p>
                <SelectField
                  label="Industry"
                  value={industryId}
                  onChange={setIndustryId}
                  options={[{ value: "", label: "Not set" }, ...(industries.data ?? []).map((i) => ({ value: i.id, label: i.name }))]}
                />
              </div>
              <div>
                <p className="hub-label mb-1">Add to campaign</p>
                <SelectField
                  label="Campaign"
                  value={campaignId}
                  onChange={setCampaignId}
                  options={[{ value: "", label: "No campaign" }, ...(campaigns.data ?? []).map((c) => ({ value: c.id, label: c.name }))]}
                />
              </div>
            </div>
          </Section>

          <Section title="Columns">
            <TableCard className="rounded-none border-0 shadow-none">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Spreadsheet column</TableHead>
                    <TableHead>Example</TableHead>
                    <TableHead className="w-64">Imports as</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sheet.headers.map((h, i) => {
                    const sample = sheet.rows.find((r) => r[i])?.[i];
                    return (
                      <TableRow key={h}>
                        <TableCell className="font-medium">{h}</TableCell>
                        <TableCell className="max-w-[18rem] truncate text-muted-foreground">{sample ?? "(blank)"}</TableCell>
                        <TableCell>
                          <SelectField
                            label={`Import ${h} as`}
                            value={mapping[h] ?? "ignore"}
                            onChange={(v) => setMapping((m) => ({ ...m, [h]: v as Mapping[string] }))}
                            options={[
                              { value: "ignore", label: "Keep in source row only" },
                              ...IMPORT_FIELDS.map((f) => ({
                                value: f,
                                label: IMPORT_FIELD_LABEL[f],
                              })),
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableCard>
            <p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
              Every column is kept in the stored source row, mapped or not. Blank cells stay blank.
            </p>
          </Section>

          <div className="flex justify-between gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setStep("upload")}>
              Back
            </Button>
            <Button className="rounded-full px-6" onClick={toReview} disabled={reviewing}>
              {reviewing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Review {sheet.rows.length} rows
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="New leads" hint="Will be created">
              <span className="hub-tabular">{counts.create}</span>
            </StatTile>
            <StatTile label="Look like duplicates" hint={`${counts.merge} merging, the rest skipped`} warn={counts.duplicates > 0}>
              <span className="hub-tabular">{counts.duplicates}</span>
            </StatTile>
            <StatTile label="Rows with errors" hint="Recorded, not imported" warn={counts.error > 0}>
              <span className="hub-tabular">{counts.error}</span>
            </StatTile>
            <StatTile label="Rows with warnings" hint="Imported; odd values left blank">
              <span className="hub-tabular">{counts.warnings}</span>
            </StatTile>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SelectField
              label="Show"
              className="w-48"
              value={filter}
              onChange={(v) => setFilter(v as typeof filter)}
              options={[
                { value: "all", label: `All rows (${rows.length})` },
                { value: "duplicates", label: `Duplicates (${counts.duplicates})` },
                { value: "problems", label: "Errors and warnings" },
              ]}
            />
            {counts.duplicates > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setRows((rs) => rs.map((r) => (r.matches.some((m) => m.leadId) && r.decision !== "error" ? { ...r, decision: "merge" } : r)))}
                >
                  Merge all matches with existing leads
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setRows((rs) => rs.map((r) => (r.matches.length && r.decision !== "error" ? { ...r, decision: "skip" } : r)))}
                >
                  Skip all duplicates
                </Button>
              </>
            )}
          </div>

          <TableCard>
            <Table className="min-w-[900px] text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Looks like</TableHead>
                  <TableHead>Problems</TableHead>
                  <TableHead className="w-44">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shownRows.map((r) => (
                  <TableRow key={r.rowNumber}>
                    <TableCell className="hub-tabular text-muted-foreground">{r.rowNumber}</TableCell>
                    <TableCell>
                      <p className="font-medium">{r.lead.name || "(no name)"}</p>
                      <p className="text-xs text-muted-foreground">{[r.lead.area, r.lead.phone, r.lead.email].filter(Boolean).join(" · ")}</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.matches.length === 0
                        ? "—"
                        : r.matches.slice(0, 2).map((m, i) => (
                            <p key={i}>
                              {m.leadId ? (
                                <Link to={`/hub/crm/leads/${m.leadId}`} target="_blank" className="font-medium hover:underline">
                                  {m.name}
                                </Link>
                              ) : (
                                <span className="font-medium">
                                  {m.name} (row {m.rowNumber})
                                </span>
                              )}{" "}
                              <span className="text-muted-foreground">same {m.reasons.map((x) => REASON[x]).join(", ")}</span>
                            </p>
                          ))}
                    </TableCell>
                    <TableCell className="text-xs">
                      {[...r.errors, ...r.warnings].length === 0 ? (
                        "—"
                      ) : (
                        <ul className="space-y-0.5">
                          {r.errors.map((e) => (
                            <li key={e} className="text-destructive">
                              {e}
                            </li>
                          ))}
                          {r.warnings.map((w) => (
                            <li key={w} className="text-warning">
                              {w}
                            </li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.decision === "error" ? (
                        <Pill tone="warning">Not imported</Pill>
                      ) : (
                        <SelectField
                          label={`Decision for row ${r.rowNumber}`}
                          value={r.decision}
                          onChange={(v) => setDecision(r.rowNumber, v as Decision)}
                          options={[
                            { value: "create", label: "Create new lead" },
                            ...(r.mergeLeadId ? [{ value: "merge", label: "Merge (fill blanks)" }] : []),
                            { value: "skip", label: "Skip" },
                          ]}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCard>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" className="rounded-full" onClick={() => setStep("map")}>
              Back
            </Button>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">Merging only fills blank fields; it never overwrites what's there.</p>
              <Button className="rounded-full px-6" onClick={doCommit} disabled={commit.isPending || counts.create + counts.merge === 0}>
                {commit.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Import {counts.create + counts.merge} leads
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "done" && result && (
        <Section>
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-tint text-on-tint">
              {result.errors ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </span>
            <p className="text-[0.9375rem] font-semibold">Import finished</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.created} created · {result.merged} merged · {result.skipped} skipped · {result.errors} errors
            </p>
            <div className="mt-5 flex gap-2">
              <Button asChild className="rounded-full">
                <Link to="/hub/crm/leads">See leads</Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setStep("upload");
                  setUpload(null);
                  setRows([]);
                  setResult(null);
                }}
              >
                Import another
              </Button>
            </div>
          </div>
        </Section>
      )}

      <PastImports />
    </>
  );
}
