import { Fragment, Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Filter,
  Globe,
  LayoutGrid,
  ListChecks,
  LogOut,
  Monitor,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  SquareKanban,
  Eye,
  EyeOff,
  Sun,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useHubAuth } from "../auth/HubAuthProvider";
import { usePrivacy } from "../lib/privacy";
import type { HubTheme } from "../theme/useHubTheme";
import { Dock, DockIcon, DockSeparator } from "./motion/dock";

// The palette (and cmdk) loads the first time it's opened.
const CommandPalette = lazy(() => import("./CommandPalette"));

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const WORK_NAV: NavItem[] = [
  { to: "/hub", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/hub/tasks", label: "Tasks", icon: SquareKanban },
  { to: "/hub/clients", label: "Clients", icon: Users },
  { to: "/hub/onboarding", label: "Onboarding", icon: ListChecks },
  { to: "/hub/pipeline", label: "Pipeline", icon: Filter },
];

const RECORDS_NAV: NavItem[] = [
  { to: "/hub/documents", label: "Documents", icon: FileText },
  { to: "/hub/reports", label: "Reports", icon: BarChart3 },
  { to: "/hub/finance", label: "Finance", icon: Wallet },
  { to: "/hub/website", label: "Website", icon: Globe },
];

const SETTINGS_NAV: NavItem = { to: "/hub/settings", label: "Settings", icon: Settings };

const NAV = [...WORK_NAV, ...RECORDS_NAV, SETTINGS_NAV];
// Phones get the four most-used sections in the dock; the rest live under More.
const MOBILE_NAV = ["/hub", "/hub/tasks", "/hub/clients", "/hub/finance"].map(
  (to) => NAV.find((n) => n.to === to) as NavItem,
);

const THEMES: { value: HubTheme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
];

type ShellProps = { theme: HubTheme; onThemeChange: (theme: HubTheme) => void };

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-[0.8125rem] font-bold text-primary-foreground shadow-hub">
        JM
      </div>
      <div className="leading-tight">
        <p className="text-[0.9375rem] font-semibold">Client Hub</p>
        <p className="text-[0.6875rem] text-muted-foreground">Joseph Maina</p>
      </div>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-6">
      <ul className="space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[0.9375rem] transition-colors duration-150",
                  isActive
                    ? "bg-tint font-medium text-on-tint"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AccountControls({ theme, onThemeChange }: ShellProps) {
  const { session, signOut } = useHubAuth();
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={theme === value}
            onClick={() => onThemeChange(value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs transition-all duration-150",
              theme === value
                ? "bg-card font-medium text-foreground shadow-hub"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void signOut("manual")}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span className="min-w-0 flex-1">
          Sign out
          {session?.user.email && (
            <span className="block truncate text-[0.6875rem] text-muted-foreground/80">{session.user.email}</span>
          )}
        </span>
      </button>
    </div>
  );
}

const dockIconClass = "relative transition-colors duration-150";

function DockNavItem({ item, side, active }: { item: NavItem; side: "right" | "top"; active: boolean }) {
  const { to, label, icon: Icon, end } = item;
  return (
    <DockIcon
      className={cn(
        dockIconClass,
        active ? "bg-tint text-on-tint" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={to}
            end={end}
            aria-label={label}
            className="flex size-full items-center justify-center rounded-full"
          >
            <Icon className="size-full" strokeWidth={1.75} />
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side={side} className="rounded-lg">
          {label}
        </TooltipContent>
      </Tooltip>
      {active && (
        <span
          aria-hidden
          className={cn(
            "absolute h-1 w-1 rounded-full bg-primary",
            side === "right" ? "-left-1.5 top-1/2 -translate-y-1/2" : "-bottom-1 left-1/2 -translate-x-1/2",
          )}
        />
      )}
    </DockIcon>
  );
}

function useIsActive() {
  const { pathname } = useLocation();
  return (item: NavItem) =>
    item.end ? pathname === item.to || pathname === `${item.to}/` : pathname.startsWith(item.to);
}

// ---------------------------------------------------------------- desktop dock sizing

// One dock icon is 40px plus the 8px gap. The fixed parts are the dock's padding
// and border, the JM button, three separators, Search and Hide amounts, plus a
// little room for the hover magnification.
const DOCK_SLOT = 48;
const DOCK_FIXED = 18 + 48 + 3 * 17 + 2 * DOCK_SLOT + 20;
const DOCK_NAV = [...WORK_NAV, ...RECORDS_NAV];
// What stays in the dock longest when space runs out (first = last to fold into More).
const DOCK_PRIORITY = ["/hub", "/hub/tasks", "/hub/clients", "/hub/finance", "/hub/pipeline", "/hub/onboarding", "/hub/website", "/hub/documents", "/hub/reports"];

/**
 * Which sections fit in the dock at the current window height (browser zoom
 * shrinks it). The rest go under More; the page you're on always stays visible.
 */
function useDockNav(isActive: (item: NavItem) => boolean) {
  const [height, setHeight] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const slots = Math.max(2, Math.floor((height - 24 - DOCK_FIXED) / DOCK_SLOT));
  if (slots >= DOCK_NAV.length) return { shown: DOCK_NAV, hidden: [] as NavItem[] };
  const keep = slots - 1; // one slot for More
  const byPriority = DOCK_PRIORITY.map((to) => DOCK_NAV.find((n) => n.to === to) as NavItem);
  let picked = byPriority.slice(0, keep);
  const current = DOCK_NAV.find(isActive);
  if (current && !picked.includes(current)) picked = [...picked.slice(0, keep - 1), current];
  // Shown in the usual dock order, not priority order.
  return { shown: DOCK_NAV.filter((n) => picked.includes(n)), hidden: DOCK_NAV.filter((n) => !picked.includes(n)) };
}

/** The JM badge: settings, light/dark and sign out, out of the way until needed. */
function AccountMenu({
  theme,
  onThemeChange,
  settingsActive,
}: ShellProps & { settingsActive: boolean }) {
  const { session, signOut } = useHubAuth();
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account, settings and appearance"
              className="relative mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-primary text-[0.8125rem] font-bold text-primary-foreground transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:scale-105"
            >
              JM
              {settingsActive && (
                <span aria-hidden className="absolute -left-2.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-primary" />
              )}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" className="rounded-lg">
          Account &amp; settings
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="right" align="start" sideOffset={14} className="w-64 rounded-2xl p-1.5">
        <DropdownMenuLabel className="px-2.5 py-2 font-normal">
          <span className="block text-sm font-semibold">Joseph Maina</span>
          {session?.user.email && (
            <span className="block truncate text-xs text-muted-foreground">{session.user.email}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-lg">
          <NavLink to={SETTINGS_NAV.to} className="flex items-center gap-2.5">
            <Settings className="h-4 w-4" /> Settings
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2.5 text-xs font-normal text-muted-foreground">Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => onThemeChange(v as HubTheme)}>
          {THEMES.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="rounded-lg">
              <Icon className="mr-2 h-4 w-4" /> {label === "Auto" ? "Match my device" : label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOut("manual")} className="rounded-lg">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Sections that didn't fit in the dock, with their names. */
function MoreNav({ items, isActive }: { items: NavItem[]; isActive: (item: NavItem) => boolean }) {
  const anyActive = items.some(isActive);
  return (
    <DropdownMenu>
      <DockIcon
        className={cn(
          dockIconClass,
          anyActive ? "bg-tint text-on-tint" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`More: ${items.map((i) => i.label).join(", ")}`}
                className="flex size-full items-center justify-center"
              >
                <MoreHorizontal className="size-full" strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="rounded-lg">
            More
          </TooltipContent>
        </Tooltip>
      </DockIcon>
      <DropdownMenuContent side="right" align="center" sideOffset={14} className="w-52 rounded-2xl p-1.5">
        {items.map((item) => (
          <DropdownMenuItem key={item.to} asChild className="rounded-lg">
            <NavLink
              to={item.to}
              end={item.end}
              className={cn("flex items-center gap-2.5", isActive(item) && "bg-tint font-medium text-on-tint")}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} /> {item.label}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HubShell(props: ShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  if (paletteOpen && !paletteLoaded) setPaletteLoaded(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const isActive = useIsActive();
  const privacy = usePrivacy();
  const dockNav = useDockNav(isActive);

  return (
    <div className="hub-root bg-background text-foreground">
      {/* Desktop: vertical dock, sized to the window so nothing falls off when zoomed in */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden items-center pl-4 md:flex print:!hidden">
        <Dock
          orientation="vertical"
          className="hub-glass max-h-[calc(100dvh-1.5rem)] shadow-hub-lg"
          iconMagnification={46}
        >
          <AccountMenu
            theme={props.theme}
            onThemeChange={props.onThemeChange}
            settingsActive={isActive(SETTINGS_NAV)}
          />
          <DockSeparator />
          {dockNav.shown.map((item, i) => (
            <Fragment key={item.to}>
              {i > 0 && RECORDS_NAV.includes(item) && WORK_NAV.includes(dockNav.shown[i - 1]) && <DockSeparator />}
              <DockNavItem item={item} side="right" active={isActive(item)} />
            </Fragment>
          ))}
          {dockNav.hidden.length > 0 && <MoreNav items={dockNav.hidden} isActive={isActive} />}
          <DockSeparator />
          <DockIcon className={cn(dockIconClass, "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Search (Ctrl+K)"
                  className="flex size-full items-center justify-center"
                >
                  <Search className="size-full" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-lg">
                Search <kbd className="ml-1 rounded bg-secondary px-1 text-[0.625rem]">Ctrl K</kbd>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
          <DockIcon
            className={cn(
              dockIconClass,
              privacy.hidden
                ? "bg-tint text-on-tint"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={privacy.toggle}
                  aria-pressed={privacy.hidden}
                  aria-label={privacy.hidden ? "Show amounts" : "Hide amounts"}
                  className="flex size-full items-center justify-center"
                >
                  {privacy.hidden ? (
                    <EyeOff className="size-full" strokeWidth={1.75} />
                  ) : (
                    <Eye className="size-full" strokeWidth={1.75} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-lg">
                {privacy.hidden ? "Show amounts" : "Hide amounts"}{" "}
                <kbd className="ml-1 rounded bg-secondary px-1 text-[0.625rem]">Ctrl Shift H</kbd>
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </aside>

      {/* Mobile top bar */}
      <header className="hub-glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 px-4 md:hidden print:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={privacy.toggle}
            aria-pressed={privacy.hidden}
            aria-label={privacy.hidden ? "Show amounts" : "Hide amounts"}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full",
              privacy.hidden ? "bg-tint text-on-tint" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {privacy.hidden ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <main className="md:pl-24 print:p-0">
        <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 md:px-10 md:pb-16 md:pt-10 print:max-w-none print:p-0">
          <Outlet />
        </div>
      </main>

      {/* Mobile: bottom dock */}
      <nav
        aria-label="Hub"
        className="hub-safe-bottom fixed inset-x-0 bottom-3 z-30 flex justify-center md:hidden print:hidden"
      >
        <Dock className="hub-glass gap-2 shadow-hub-lg" iconSize={44} iconMagnification={44}>
          {MOBILE_NAV.map((item) => (
            <DockNavItem key={item.to} item={item} side="top" active={isActive(item)} />
          ))}
          <DockSeparator />
          <DockIcon className={cn(dockIconClass, "text-muted-foreground")}>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="More"
              className="flex size-full items-center justify-center"
            >
              <MoreHorizontal className="size-full" strokeWidth={1.75} />
            </button>
          </DockIcon>
        </Dock>
      </nav>

      {paletteLoaded && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        </Suspense>
      )}

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-3xl border-border/70 bg-card">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <NavList onNavigate={() => setMenuOpen(false)} />
            <AccountControls {...props} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
