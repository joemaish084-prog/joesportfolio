import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ExternalLink, Mail, RefreshCw, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type ProspectStatus = "new" | "qualified" | "not_a_fit" | "contacted";

interface Prospect {
  id: string;
  business_name: string;
  website: string;
  description: string;
  source_url: string;
  search_query: string;
  contact_name: string | null;
  contact_email: string | null;
  status: ProspectStatus;
  fit_score: number | null;
  fit_reason: string | null;
  email_subject: string | null;
  email_body: string | null;
  created_at: string;
  updated_at: string;
}

interface AgentResponse {
  prospects?: Prospect[];
  prospect?: Prospect;
  message?: string;
  error?: string;
}

const AGENT_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prospect-agent`
  : "";

const STATUS_LABELS: Record<ProspectStatus, string> = {
  new: "New",
  qualified: "Qualified",
  not_a_fit: "Not a fit",
  contacted: "Contacted",
};

interface ProspectAgentPanelProps {
  passcode: string;
  onAuthFailure: () => void;
}

function isProspectStatus(value: string): value is ProspectStatus {
  return value === "new" || value === "qualified" || value === "not_a_fit" || value === "contacted";
}

export function ProspectAgentPanel({ passcode, onAuthFailure }: ProspectAgentPanelProps) {
  const { toast } = useToast();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const request = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
    if (!AGENT_URL) throw new Error("VITE_SUPABASE_URL is not configured.");
    const response = await fetch(AGENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": passcode,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    const result: AgentResponse | null = await response.json().catch(() => null);
    if (response.status === 401) {
      onAuthFailure();
      throw new Error("Your admin session expired. Unlock the dashboard and try again.");
    }
    if (!response.ok) throw new Error(result?.error || "The prospect request failed.");
    return result ?? {};
  }, [onAuthFailure, passcode]);

  const loadProspects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await request("list");
      setProspects(result.prospects ?? []);
      setLoadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load saved prospects.";
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    void loadProspects();
  }, [loadProspects]);

  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    setProspects((current) => current.map((prospect) =>
      prospect.id === id ? { ...prospect, ...updates } : prospect,
    ));
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearching(true);
    try {
      const result = await request("search", { query: query.trim() });
      await loadProspects();
      toast({
        title: result.prospects?.length ? "Search complete" : "No results found",
        description: result.message ?? `${result.prospects?.length ?? 0} public web results saved.`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Try again later.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleDraft = async (prospect: Prospect) => {
    setDraftingId(prospect.id);
    try {
      const result = await request("draft", { id: prospect.id });
      if (!result.prospect) throw new Error("The agent did not return a draft.");
      updateProspect(prospect.id, result.prospect);
      toast({ title: "Draft ready", description: "Review and edit it before opening your email app." });
    } catch (error) {
      toast({
        title: "Could not create a draft",
        description: error instanceof Error ? error.message : "Try again later.",
        variant: "destructive",
      });
    } finally {
      setDraftingId(null);
    }
  };

  const handleSave = async (prospect: Prospect) => {
    try {
      const result = await request("update", {
        id: prospect.id,
        contact_name: prospect.contact_name ?? "",
        contact_email: prospect.contact_email ?? "",
        email_subject: prospect.email_subject ?? "",
        email_body: prospect.email_body ?? "",
      });
      if (!result.prospect) throw new Error("The saved prospect was not returned.");
      updateProspect(prospect.id, result.prospect);
      toast({ title: "Prospect saved" });
    } catch (error) {
      toast({
        title: "Could not save prospect",
        description: error instanceof Error ? error.message : "Try again later.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (prospect: Prospect, status: ProspectStatus) => {
    const previousStatus = prospect.status;
    updateProspect(prospect.id, { status });
    try {
      await request("update", { id: prospect.id, status });
    } catch (error) {
      updateProspect(prospect.id, { status: previousStatus });
      toast({
        title: "Could not update status",
        description: error instanceof Error ? error.message : "Try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-5">
      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-primary" />
            Find potential clients
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search public web pages worldwide for businesses that may need digital marketing.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. independent hotels in Kenya with outdated social media"
              maxLength={300}
              minLength={3}
              required
              aria-label="Describe the businesses to find"
            />
            <Button type="submit" disabled={searching || query.trim().length < 3} className="shrink-0">
              {searching ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {searching ? "Searching…" : "Search web"}
            </Button>
          </form>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Results are leads to review, not verified prospects. Confirm each business and use a publicly listed business
            contact. The agent only prepares drafts; it never sends email.
          </p>
        </CardContent>
      </Card>

      {loadError && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Saved prospects</h2>
          <p className="text-xs text-muted-foreground">{prospects.length} shown · up to 100 most recently updated</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadProspects()} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {prospects.length === 0 && !loading ? (
        <Card className="border-dashed border-border/70 shadow-none">
          <CardContent className="py-10 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No saved prospects yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Search for a type of business to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {prospects.map((prospect) => {
            const emailHref = prospect.contact_email && prospect.email_subject && prospect.email_body
              ? `mailto:${encodeURIComponent(prospect.contact_email)}?subject=${encodeURIComponent(prospect.email_subject)}&body=${encodeURIComponent(prospect.email_body)}`
              : undefined;

            return (
              <Card key={prospect.id} className="border-border/60 shadow-none">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base leading-snug">{prospect.business_name}</CardTitle>
                      <a
                        href={prospect.website}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-primary hover:underline"
                      >
                        {prospect.website}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {prospect.fit_score === null ? "Not scored" : `${prospect.fit_score}/100 fit`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`status-${prospect.id}`} className="sr-only">Prospect status</Label>
                    <select
                      id={`status-${prospect.id}`}
                      value={prospect.status}
                      onChange={(event) => {
                        const status = event.target.value;
                        if (isProspectStatus(status)) void handleStatusChange(prospect, status);
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <span className="text-xs text-muted-foreground">Search: {prospect.search_query}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {prospect.description || "No description was returned by the search provider."}
                  </p>
                  <a
                    href={prospect.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    View search source <ExternalLink className="h-3 w-3" />
                  </a>

                  {prospect.fit_reason && (
                    <p className="rounded-lg bg-muted/50 p-3 text-xs leading-relaxed">
                      <span className="font-semibold">Agent assessment: </span>{prospect.fit_reason}
                    </p>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`contact-name-${prospect.id}`} className="text-xs">Contact name (optional)</Label>
                      <Input
                        id={`contact-name-${prospect.id}`}
                        value={prospect.contact_name ?? ""}
                        onChange={(event) => updateProspect(prospect.id, { contact_name: event.target.value })}
                        maxLength={120}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`contact-email-${prospect.id}`} className="text-xs">Public business email</Label>
                      <Input
                        id={`contact-email-${prospect.id}`}
                        type="email"
                        value={prospect.contact_email ?? ""}
                        onChange={(event) => updateProspect(prospect.id, { contact_email: event.target.value })}
                        maxLength={254}
                        placeholder="name@business.com"
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void handleSave(prospect)}>
                    Save prospect details
                  </Button>

                  {prospect.email_subject !== null && (
                    <div className="space-y-3 rounded-lg border border-border/70 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        Email draft — review before sending
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`subject-${prospect.id}`} className="text-xs">Subject</Label>
                        <Input
                          id={`subject-${prospect.id}`}
                          value={prospect.email_subject ?? ""}
                          onChange={(event) => updateProspect(prospect.id, { email_subject: event.target.value })}
                          maxLength={200}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`body-${prospect.id}`} className="text-xs">Message</Label>
                        <Textarea
                          id={`body-${prospect.id}`}
                          value={prospect.email_body ?? ""}
                          onChange={(event) => updateProspect(prospect.id, { email_body: event.target.value })}
                          maxLength={3000}
                          className="min-h-32"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" disabled={!emailHref}>
                          <a href={emailHref ?? undefined}>
                            <Mail className="mr-2 h-3.5 w-3.5" />
                            Open in email app
                          </a>
                        </Button>
                      </div>
                      {!prospect.contact_email && (
                        <p className="text-xs text-muted-foreground">Add a publicly listed business email to open this draft in your email app.</p>
                      )}
                    </div>
                  )}

                  <Button
                    variant={prospect.email_subject ? "outline" : "default"}
                    size="sm"
                    onClick={() => void handleDraft(prospect)}
                    disabled={draftingId !== null}
                  >
                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                    {draftingId === prospect.id ? "Preparing draft…" : prospect.email_subject ? "Regenerate draft" : "Assess & draft email"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
