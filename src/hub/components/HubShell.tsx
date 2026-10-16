import { Suspense, lazy, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Filter,
  LayoutGrid,
  ListChecks,
  LogOut,
  Monitor,
  Moon,
  MoreHorizontal,
  Search,
  Sun,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useHubAuth } from "../auth/HubAuthProvider";
import type { HubTheme } from "../theme/useHubTheme";
import { Dock, DockIcon, DockSeparator } from "./motion/dock";

// The palette (and cmdk) loads the first time it's opened.
const CommandPalette = lazy(() => import("./CommandPalette"));

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const WORK_NAV: NavItem[] = [
  { to: "/hub", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/hub/clients", label: "Clients", icon: Users },
  { to: "/hub/onboarding", label: "Onboarding", icon: ListChecks },
  { to: "/hub/pipeline", label: "Pipeline", icon: Filter },
];

const RECORDS_NAV: NavItem[] = [
  { to: "/hub/documents", label: "Documents", icon: FileText },
  { to: "/hub/reports", label: "Reports", icon: BarChart3 },
  { to: "/hub/finance", label: "Finance", icon: Wallet },
];

const NAV = [...WORK_NAV, ...RECORDS_NAV];
// Phones get the four most-used sections in the dock; the rest live under More.
const MOBILE_NAV = [NAV[0], NAV[1], NAV[3], RECORDS_NAV[2]];

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

const NEXT_THEME: Record<HubTheme, HubTheme> = { light: "dark", dark: "system", system: "light" };

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
  const { signOut } = useHubAuth();
  const theme = THEMES.find((t) => t.value === props.theme) ?? THEMES[2];

  return (
    <div className="hub-root bg-background text-foreground">
      {/* Desktop: vertical dock */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden items-center pl-4 md:flex print:!hidden">
        <Dock orientation="vertical" className="hub-glass shadow-hub-lg">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary text-[0.8125rem] font-bold text-primary-foreground">
            JM
          </div>
          <DockSeparator />
          {WORK_NAV.map((item) => (
            <DockNavItem key={item.to} item={item} side="right" active={isActive(item)} />
          ))}
          <DockSeparator />
          {RECORDS_NAV.map((item) => (
            <DockNavItem key={item.to} item={item} side="right" active={isActive(item)} />
          ))}
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
          <DockSeparator />
          <DockIcon className={cn(dockIconClass, "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => props.onThemeChange(NEXT_THEME[props.theme])}
                  aria-label={`Appearance: ${theme.label}`}
                  className="flex size-full items-center justify-center"
                >
                  <theme.icon className="size-full" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-lg">
                Appearance: {theme.label}
              </TooltipContent>
            </Tooltip>
          </DockIcon>
          <DockIcon className={cn(dockIconClass, "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => void signOut("manual")}
                  aria-label="Sign out"
                  className="flex size-full items-center justify-center"
                >
                  <LogOut className="size-full" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-lg">
                Sign out
              </TooltipContent>
            </Tooltip>
          </DockIcon>
        </Dock>
      </aside>

      {/* Mobile top bar */}
      <header className="hub-glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 px-4 md:hidden print:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <Search className="h-5 w-5" strokeWidth={1.75} />
        </button>
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
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-3xl border-border/70 bg-card"
        >
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
