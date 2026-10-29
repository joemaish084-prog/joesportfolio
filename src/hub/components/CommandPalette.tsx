import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  Eye,
  EyeOff,
  BarChart3,
  CalendarDays,
  FileText,
  FileUp,
  Filter,
  Globe,
  LayoutGrid,
  ListChecks,
  Plus,
  Receipt,
  Settings,
  SquareKanban,
  Target,
  Upload,
  User,
  Users,
  Wallet,
  PiggyBank,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { useRows } from "../lib/data";
import { usePrivacy } from "../lib/privacy";
import { useClients } from "../lib/queries";
import { LEAD_STAGE_LABEL } from "../lib/types";

const PAGES = [
  { label: "Overview", to: "/hub", icon: LayoutGrid },
  { label: "Tasks", to: "/hub/tasks", icon: SquareKanban },
  { label: "Calendar", to: "/hub/calendar", icon: CalendarDays },
  { label: "Clients", to: "/hub/clients", icon: Users },
  { label: "Onboarding", to: "/hub/onboarding", icon: ListChecks },
  { label: "Documents", to: "/hub/documents", icon: FileText },
  { label: "Reports", to: "/hub/reports", icon: BarChart3 },
  { label: "Finance", to: "/hub/finance", icon: Wallet },
  { label: "Business Funds", to: "/hub/funds", icon: PiggyBank },
  { label: "Pipeline", to: "/hub/pipeline", icon: Filter },
  { label: "Website", to: "/hub/website", icon: Globe },
  { label: "Settings", to: "/hub/settings", icon: Settings },
  { label: "Clean up duplicates", to: "/hub/settings?tab=cleanup", icon: Users },
];

const ACTIONS = [
  { label: "New task", to: "/hub/tasks?new=task", icon: SquareKanban },
  { label: "New client", to: "/hub/clients/new", icon: Plus },
  { label: "New lead", to: "/hub/pipeline?new=lead", icon: Target },
  { label: "New invoice", to: "/hub/finance?new=invoice", icon: FileText },
  { label: "Record payment", to: "/hub/finance?new=payment", icon: Banknote },
  { label: "Import past invoices", to: "/hub/finance?new=import", icon: FileUp },
  { label: "Add expense", to: "/hub/finance?new=expense", icon: Receipt },
  { label: "Upload document", to: "/hub/documents?new=upload", icon: Upload },
  { label: "New report", to: "/hub/reports?new=report", icon: BarChart3 },
];

/** shadcn Command palette: jump to any page, client or lead, or start an action. Opened with ⌘K / Ctrl+K from the shell. */
export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const clients = useClients();
  const leads = useRows("leads", "position", true);
  const privacy = usePrivacy();

  const liveClients = useMemo(() => (clients.data ?? []).filter((c) => !c.archived_at), [clients.data]);
  const liveLeads = useMemo(
    () => (leads.data ?? []).filter((l) => !l.archived_at && !l.converted_client_id),
    [leads.data],
  );

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search the hub</DialogTitle>
      <CommandInput placeholder="Search clients, leads, pages or actions…" />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>Nothing found.</CommandEmpty>
        <CommandGroup heading="Actions">
          {ACTIONS.map(({ label, to, icon: Icon }) => (
            <CommandItem key={to} value={`action ${label}`} onSelect={() => go(to)}>
              <Icon className="mr-2" />
              {label}
            </CommandItem>
          ))}
          <CommandItem
            value="action hide show amounts privacy money"
            onSelect={() => {
              privacy.toggle();
              onOpenChange(false);
            }}
          >
            {privacy.hidden ? <Eye className="mr-2" /> : <EyeOff className="mr-2" />}
            {privacy.hidden ? "Show amounts" : "Hide amounts"}
            <CommandShortcut>Ctrl Shift H</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {PAGES.map(({ label, to, icon: Icon }) => (
            <CommandItem key={to} value={`page ${label}`} onSelect={() => go(to)}>
              <Icon className="mr-2" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        {liveClients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Clients">
              {liveClients.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`client ${c.name} ${c.contact_person ?? ""} ${c.id}`}
                  onSelect={() => go(`/hub/clients/${c.id}`)}
                >
                  <User className="mr-2" />
                  {c.name}
                  {c.contact_person && (
                    <span className="ml-2 truncate text-xs text-muted-foreground">{c.contact_person}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {liveLeads.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Leads">
              {liveLeads.map((l) => (
                <CommandItem
                  key={l.id}
                  value={`lead ${l.name} ${l.contact_person ?? ""} ${l.id}`}
                  onSelect={() => go("/hub/pipeline")}
                >
                  <Target className="mr-2" />
                  {l.name}
                  <CommandShortcut>{LEAD_STAGE_LABEL[l.stage]}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
