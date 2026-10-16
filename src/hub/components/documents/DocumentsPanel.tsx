import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Copy,
  Download,
  ExternalLink,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  openDocument,
  useCreateFromTemplate,
  useDeleteDocument,
  useRows,
  useSaveRow,
  useUploadDocument,
} from "../../lib/data";
import { formatDate } from "../../lib/format";
import { useClients } from "../../lib/queries";
import {
  DOCUMENT_KINDS,
  DOCUMENT_KIND_LABEL,
  DOCUMENT_STATUSES,
  DOCUMENT_STATUS_LABEL,
  type DocumentKind,
  type DocumentStatus,
  type HubDocument,
} from "../../lib/types";
import { ClientPicker, Field, FormDialog, inputClass } from "../form";
import { EmptyState, Pill, SkeletonBlock, TableCard, type PillTone } from "../ui";

const MAX_BYTES = 25 * 1024 * 1024;

const STATUS_TONE: Record<DocumentStatus, PillTone> = {
  draft: "muted",
  sent: "neutral",
  signed: "accent",
  approved: "accent",
  declined: "warning",
  final: "accent",
};

function fileIcon(doc: Pick<HubDocument, "mime_type" | "file_name">) {
  const m = doc.mime_type ?? "";
  if (m.startsWith("image/")) return FileImage;
  if (m.includes("sheet") || m.includes("excel") || /\.(xlsx?|csv)$/i.test(doc.file_name)) return FileSpreadsheet;
  if (m.includes("pdf") || m.includes("word") || m.startsWith("text/") || /\.(pdf|docx?|txt)$/i.test(doc.file_name))
    return FileText;
  return File;
}

export function formatBytes(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const titleFromFile = (name: string) =>
  name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();

// ---------------------------------------------------------------- upload

function UploadDialog({
  open,
  onOpenChange,
  clientId,
  asTemplate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  asTemplate?: boolean;
}) {
  const upload = useUploadDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DocumentKind>("contract");
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [client, setClient] = useState<string | null>(clientId ?? null);
  const [isTemplate, setIsTemplate] = useState(!!asTemplate);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setTitle("");
    setKind("contract");
    setStatus("draft");
    setClient(clientId ?? null);
    setIsTemplate(!!asTemplate);
    setNotes("");
    setError(null);
  }, [open, clientId, asTemplate]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError("That file is over 25 MB.");
      return;
    }
    setError(null);
    setFile(f);
    setTitle((t) => t || titleFromFile(f.name));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const submit = () => {
    if (!file) return setError("Choose a file to upload.");
    if (!title.trim()) return setError("Give the document a title.");
    upload.mutate(
      { file, title, kind, status, clientId: client, isTemplate, notes: notes.trim() || null },
      {
        onSuccess: () => {
          toast.success(isTemplate ? "Template saved" : "Document uploaded");
          onOpenChange(false);
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  const FileIcon = file ? fileIcon({ mime_type: file.type, file_name: file.name }) : Upload;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isTemplate ? "Upload template" : "Upload document"}
      description="Files are stored privately and open through short-lived links."
      onSubmit={submit}
      submitLabel="Upload"
      pending={upload.isPending}
      error={error}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors duration-150",
          dragging ? "border-primary bg-tint" : "border-border hover:border-primary/50 hover:bg-secondary/50",
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint text-on-tint">
          <FileIcon className="h-5 w-5" />
        </span>
        {file ? (
          <>
            <span className="max-w-full truncate text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground">{formatBytes(file.size)} · click to change</span>
          </>
        ) : (
          <>
            <span className="text-sm font-medium">Drop a file here or click to browse</span>
            <span className="text-xs text-muted-foreground">PDF, Word, Excel, images · up to 25 MB</span>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />

      <Field label="Title" htmlFor="doc-title">
        <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <Select value={kind} onValueChange={(v) => setKind(v as DocumentKind)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {DOCUMENT_KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {DOCUMENT_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <label className="flex items-center justify-between gap-4 rounded-xl bg-secondary/60 px-4 py-3">
        <span>
          <span className="block text-sm font-medium">Save as a template</span>
          <span className="block text-xs text-muted-foreground">Reusable for any client, e.g. your standard contract.</span>
        </span>
        <Switch checked={isTemplate} onCheckedChange={setIsTemplate} />
      </label>
      {!isTemplate && (
        <Field label="Client">
          <ClientPicker value={client} onChange={setClient} allowNone noneLabel="General (no client)" />
        </Field>
      )}
      <Field label="Notes" htmlFor="doc-notes">
        <Textarea id="doc-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl bg-background" />
      </Field>
    </FormDialog>
  );
}

// ---------------------------------------------------------------- edit / use template

function EditDialog({ doc, onClose }: { doc: HubDocument | null; onClose: () => void }) {
  const save = useSaveRow("documents");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DocumentKind>("other");
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [client, setClient] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doc) return;
    setTitle(doc.title);
    setKind(doc.kind);
    setStatus(doc.status);
    setClient(doc.client_id);
    setNotes(doc.notes ?? "");
    setError(null);
  }, [doc]);

  const submit = () => {
    if (!doc) return;
    if (!title.trim()) return setError("Give the document a title.");
    save.mutate(
      {
        id: doc.id,
        values: { title: title.trim(), kind, status, client_id: doc.is_template ? null : client, notes: notes.trim() || null },
      },
      {
        onSuccess: () => {
          toast.success("Saved");
          onClose();
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <FormDialog open={!!doc} onOpenChange={(o) => !o && onClose()} title="Edit document" onSubmit={submit} pending={save.isPending} error={error}>
      <Field label="Title" htmlFor="edit-title">
        <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <Select value={kind} onValueChange={(v) => setKind(v as DocumentKind)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {DOCUMENT_KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {DOCUMENT_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      {!doc?.is_template && (
        <Field label="Client">
          <ClientPicker value={client} onChange={setClient} allowNone noneLabel="General (no client)" />
        </Field>
      )}
      <Field label="Notes" htmlFor="edit-notes">
        <Textarea id="edit-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl bg-background" />
      </Field>
    </FormDialog>
  );
}

function UseTemplateDialog({ template, clientId, onClose }: { template: HubDocument | null; clientId?: string; onClose: () => void }) {
  const create = useCreateFromTemplate();
  const clients = useClients();
  const [client, setClient] = useState<string | null>(clientId ?? null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!template) return;
    setClient(clientId ?? null);
    setTitle(template.title);
    setError(null);
  }, [template, clientId]);

  // Suggest "Contract – Select Gadgets" once a client is picked.
  const clientName = clients.data?.find((c) => c.id === client)?.name;
  useEffect(() => {
    if (template && clientName) setTitle(`${template.title} – ${clientName}`);
  }, [template, clientName]);

  const submit = () => {
    if (!template) return;
    if (!client) return setError("Choose the client this copy is for.");
    create.mutate(
      { template, clientId: client, title: title || template.title },
      {
        onSuccess: () => {
          toast.success(`Copied to ${clientName ?? "client"} as a draft`);
          onClose();
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <FormDialog
      open={!!template}
      onOpenChange={(o) => !o && onClose()}
      title="Use template"
      description="Makes a copy of the file in the client's documents as a draft. The template stays as it is."
      onSubmit={submit}
      submitLabel="Create copy"
      pending={create.isPending}
      error={error}
    >
      <Field label="Client">
        <ClientPicker value={client} onChange={setClient} />
      </Field>
      <Field label="Title" htmlFor="tpl-title">
        <Input id="tpl-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
    </FormDialog>
  );
}

// ---------------------------------------------------------------- panel

/**
 * Documents list with upload, open, download, templates and status. With a
 * clientId it shows only that client's files (the client page tab); without
 * one it's the full library with client files and templates side by side.
 */
export function DocumentsPanel({ clientId }: { clientId?: string }) {
  const docs = useRows("documents");
  const clients = useClients();
  const save = useSaveRow("documents");
  const remove = useDeleteDocument();
  const [params, setParams] = useSearchParams();

  const [view, setView] = useState<"files" | "templates">("files");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<DocumentKind | "all">("all");
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<HubDocument | null>(null);
  const [usingTemplate, setUsingTemplate] = useState<HubDocument | null>(null);
  const [deleting, setDeleting] = useState<HubDocument | null>(null);

  // ⌘K "Upload document" lands here with ?new=upload.
  useEffect(() => {
    if (params.get("new") === "upload") {
      setUploadOpen(true);
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const clientName = useMemo(() => new Map((clients.data ?? []).map((c) => [c.id, c.name])), [clients.data]);
  const showTemplates = !clientId && view === "templates";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (docs.data ?? []).filter((d) => {
      if (clientId ? d.client_id !== clientId : d.is_template !== showTemplates) return false;
      if (!clientId && !showTemplates && clientFilter && d.client_id !== clientFilter) return false;
      if (kind !== "all" && d.kind !== kind) return false;
      if (!q) return true;
      return [d.title, d.file_name, d.notes, d.client_id && clientName.get(d.client_id)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [docs.data, clientId, showTemplates, clientFilter, kind, query, clientName]);

  const templates = (docs.data ?? []).filter((d) => d.is_template);

  const open = (doc: HubDocument, download = false) =>
    openDocument(doc, download).catch((e: Error) => toast.error(e.message));

  const setStatus = (doc: HubDocument, status: DocumentStatus) =>
    save.mutate(
      { id: doc.id, values: { status } },
      { onSuccess: () => toast.success(`Marked ${DOCUMENT_STATUS_LABEL[status].toLowerCase()}`), onError: (e) => toast.error(e.message) },
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {!clientId && (
          <Tabs value={view} onValueChange={(v) => setView(v as "files" | "templates")}>
            <TabsList className="h-auto rounded-xl bg-secondary p-1">
              <TabsTrigger value="files" className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub">
                Client files
              </TabsTrigger>
              <TabsTrigger value="templates" className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub">
                Templates
                <span className="hub-tabular ml-1.5 text-xs text-muted-foreground">{templates.length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
            aria-label="Search documents"
            className="h-10 rounded-xl border-transparent bg-secondary pl-10 focus-visible:bg-card"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={kind} onValueChange={(v) => setKind(v as DocumentKind | "all")}>
            <SelectTrigger className="h-10 w-40 rounded-xl border-transparent bg-secondary" aria-label="Type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {DOCUMENT_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {DOCUMENT_KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!clientId && !showTemplates && (
            <ClientPicker
              value={clientFilter}
              onChange={setClientFilter}
              allowNone
              noneLabel="All clients"
              className="h-10 w-48 border-transparent bg-secondary"
            />
          )}
          <Button className="h-10 rounded-full px-4" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-1.5 h-4 w-4" /> {showTemplates ? "Add template" : "Upload"}
          </Button>
        </div>
      </div>

      {docs.error && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">Couldn't load documents: {docs.error.message}</p>
      )}

      {docs.isLoading ? (
        <SkeletonBlock className="h-56 rounded-[20px]" />
      ) : rows.length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={FolderOpen}
            title={query || kind !== "all" || clientFilter ? "No matches" : showTemplates ? "No templates yet" : "No documents yet"}
            description={
              showTemplates
                ? "Upload your standard contract, proposal or quotation once, then copy it for each client."
                : "Contracts, proposals, quotations and briefs live here, stored privately."
            }
            action={
              <Button size="sm" className="rounded-full" onClick={() => setUploadOpen(true)}>
                {showTemplates ? "Add a template" : "Upload a document"}
              </Button>
            }
          />
        </div>
      ) : (
        <TableCard>
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Document</TableHead>
                {!clientId && !showTemplates && <TableHead>Client</TableHead>}
                <TableHead>Type</TableHead>
                {!showTemplates && <TableHead>Status</TableHead>}
                <TableHead className="text-right">Size</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((doc) => {
                const Icon = fileIcon(doc);
                return (
                  <TableRow key={doc.id} className="group">
                    <TableCell>
                      <button type="button" onClick={() => open(doc)} className="flex min-w-0 items-center gap-3 text-left">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tint text-on-tint">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[18rem] truncate font-medium group-hover:text-primary">{doc.title}</span>
                          <span className="block max-w-[18rem] truncate text-xs text-muted-foreground">{doc.file_name}</span>
                        </span>
                      </button>
                    </TableCell>
                    {!clientId && !showTemplates && (
                      <TableCell className="text-muted-foreground">{doc.client_id ? clientName.get(doc.client_id) ?? "—" : "General"}</TableCell>
                    )}
                    <TableCell>
                      <Pill tone="outline">{DOCUMENT_KIND_LABEL[doc.kind]}</Pill>
                    </TableCell>
                    {!showTemplates && (
                      <TableCell>
                        <Pill tone={STATUS_TONE[doc.status]}>{DOCUMENT_STATUS_LABEL[doc.status]}</Pill>
                      </TableCell>
                    )}
                    <TableCell className="hub-tabular text-right text-muted-foreground">{formatBytes(doc.size_bytes)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(doc.created_at, "d MMM yyyy")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label={`Actions for ${doc.title}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem onSelect={() => open(doc)}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => open(doc, true)}>
                            <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          {doc.is_template && (
                            <DropdownMenuItem onSelect={() => setUsingTemplate(doc)}>
                              <Copy className="mr-2 h-4 w-4" /> Use for a client
                            </DropdownMenuItem>
                          )}
                          {!doc.is_template && (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>Set status</DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="rounded-xl">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Status</DropdownMenuLabel>
                                {DOCUMENT_STATUSES.map((s) => (
                                  <DropdownMenuItem key={s} disabled={s === doc.status} onSelect={() => setStatus(doc, s)}>
                                    {DOCUMENT_STATUS_LABEL[s]}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          )}
                          <DropdownMenuItem onSelect={() => setEditing(doc)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setDeleting(doc)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableCard>
      )}

      {clientId && templates.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-sm">
          <span className="text-muted-foreground">Start from a template:</span>
          {templates.slice(0, 6).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setUsingTemplate(t)}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium transition-colors duration-150 hover:bg-tint hover:text-on-tint"
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} clientId={clientId} asTemplate={showTemplates} />
      <EditDialog doc={editing} onClose={() => setEditing(null)} />
      <UseTemplateDialog template={usingTemplate} clientId={clientId} onClose={() => setUsingTemplate(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="hub-root rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>The file is removed from storage for good. This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleting &&
                remove.mutate(deleting, {
                  onSuccess: () => toast.success("Document deleted"),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
