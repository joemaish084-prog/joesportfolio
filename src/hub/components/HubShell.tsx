import { useState } from "react";
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

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const NAV: NavItem[] = [
  { to: "/hub", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/hub/clients", label: "Clients", icon: Users },
  { to: "/hub/onboarding", label: "Onboarding", icon: ListChecks },
];

const COMING_SOON: { label: string; icon: LucideIcon }[] = [
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
  { label: "Finance", icon: Wallet },
  { label: "Pipeline", icon: Filter },
];

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
      <div>
        <p className="px-3 pb-1.5 text-[0.6875rem] font-medium text-muted-foreground">Coming soon</p>
        <ul className="space-y-0.5">
          {COMING_SOON.map(({ label, icon: Icon }) => (
            <li
              key={label}
              aria-disabled
              className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[0.9375rem] text-muted-foreground/60"
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {label}
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
                Soon
              </span>
            </li>
          ))}
        </ul>
      </div>
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
  const isActive = useIsActive();
  const { signOut } = useHubAuth();
  const theme = THEMES.find((t) => t.value === props.theme) ?? THEMES[2];

  return (
    <div className="hub-root bg-background text-foreground">
      {/* Desktop: vertical dock */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden items-center pl-4 md:flex">
        <Dock orientation="vertical" className="hub-glass shadow-hub-lg">
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary text-[0.8125rem] font-bold text-primary-foreground">
            JM
          </div>
          <DockSeparator />
          {NAV.map((item) => (
            <DockNavItem key={item.to} item={item} side="right" active={isActive(item)} />
          ))}
          <DockSeparator />
          {COMING_SOON.map(({ label, icon: Icon }) => (
            <DockIcon key={label} className="text-muted-foreground/40">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    aria-label={`${label}, coming soon`}
                    aria-disabled
                    className="flex size-full cursor-default items-center justify-center"
                  >
                    <Icon className="size-full" strokeWidth={1.75} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded-lg">
                  {label} · coming soon
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
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
      <header className="hub-glass sticky top-0 z-30 flex h-14 items-center border-b border-border/70 px-4 md:hidden">
        <Brand />
      </header>

      <main className="md:pl-24">
        <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 md:px-10 md:pb-16 md:pt-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile: bottom dock */}
      <nav aria-label="Hub" className="hub-safe-bottom fixed inset-x-0 bottom-3 z-30 flex justify-center md:hidden">
        <Dock className="hub-glass gap-3 shadow-hub-lg" iconSize={44} iconMagnification={44}>
          {NAV.map((item) => (
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

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="hub-root max-h-[85dvh] overflow-y-auto rounded-t-3xl border-border/70 bg-card"
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
