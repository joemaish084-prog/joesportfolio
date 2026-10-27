import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Command as CommandIcon, Eye, LogOut, Menu, Moon, Search, Sun, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { usePortalAuth } from "../auth/PortalAuthProvider";
import { usePortal } from "../auth/PortalData";
import { isDemo, stopPreview } from "../lib/api";
import { MODULES } from "../lib/modules";
import type { PortalTheme } from "../theme/usePortalTheme";
import { Avatar } from "./ui";
import { WelcomeTour } from "./WelcomeTour";

function useNavItems() {
  const { settings } = usePortal();
  return useMemo(() => MODULES.filter((m) => m.locked || settings.modules.includes(m.id)), [settings.modules]);
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo/jm-mark.png" alt="" width={260} height={260} className="h-9 w-9" />
      <span className="portal-display text-[1.0625rem] font-semibold">JM Creative</span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const items = useNavItems();
  return (
    <nav aria-label="Portal sections" className="space-y-1">
      {items.map(({ id, label, path, icon: Icon }) => (
        <NavLink
          key={id}
          to={path}
          end={path === "/portal"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] font-medium transition-colors",
              isActive ? "bg-tint text-on-tint" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <span aria-hidden className="absolute -left-3 top-2 h-6 w-1 rounded-r-full bg-primary" />}
              <Icon className="h-[1.125rem] w-[1.125rem]" />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter({ theme, onTheme }: { theme: PortalTheme; onTheme: (t: PortalTheme) => void }) {
  const { signOut } = usePortalAuth();
  const { me, client } = usePortal();
  const navigate = useNavigate();
  const name = me.full_name || client.contact_person || me.email || "You";
  return (
    <div className="space-y-3 border-t border-border/70 pt-4">
      <div className="flex items-center gap-3 px-1">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{me.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        {!isDemo() && !me.preview && (
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate("/portal/login", { replace: true });
            }}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        )}
      </div>
    </div>
  );
}

function ClientChip() {
  const { client } = usePortal();
  return (
    <div className="mb-6 rounded-2xl border border-border/70 bg-secondary/50 p-3.5">
      <p className="portal-eyebrow">Your account</p>
      <p className="portal-display mt-1 truncate text-base font-semibold">{client.business_name || client.name}</p>
      {client.services.length > 0 && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{client.services.join(" · ")}</p>
      )}
    </div>
  );
}

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const items = useNavItems();
  const navigate = useNavigate();
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to a page…" />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        <CommandGroup heading="Go to">
          {items.map(({ id, label, path, icon: Icon, blurb }) => (
            <CommandItem
              key={id}
              value={`${label} ${blurb}`}
              onSelect={() => {
                onOpenChange(false);
                navigate(path);
              }}
              className="gap-3 py-2.5"
            >
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-medium">{label}</span>
              <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">{blurb}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function PortalShell({ theme, onThemeChange }: { theme: PortalTheme; onThemeChange: (t: PortalTheme) => void }) {
  const { me } = usePortal();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A new page starts at the top, like a fresh screen.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const banner = isDemo() ? "Demo data. Nothing here is real." : me.preview ? "Preview: this is exactly what your client sees." : null;

  return (
    <div className="portal-root portal-backdrop">
      {banner && (
        <div className="flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
          <Eye className="h-4 w-4 shrink-0" />
          <span>{banner}</span>
          {me.preview && (
            <a
              href="/hub/clients"
              onClick={stopPreview}
              className="shrink-0 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold hover:bg-white/30"
            >
              Back to hub
            </a>
          )}
        </div>
      )}

      {/* ---- desktop sidebar */}
      <aside className="portal-glass fixed bottom-0 left-0 top-0 z-30 hidden w-64 flex-col border-r border-border/70 p-5 lg:flex" style={{ top: banner ? "2.375rem" : 0 }}>
        <div className="mb-6 px-1">
          <Brand />
        </div>
        <ClientChip />
        <div className="-mx-1 flex-1 overflow-y-auto px-1 pl-4">
          <NavList />
        </div>
        <SidebarFooter theme={theme} onTheme={onThemeChange} />
      </aside>

      {/* ---- mobile / tablet top bar */}
      <header className="portal-glass sticky top-0 z-30 flex items-center justify-between border-b border-border/70 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMenu(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Brand />
        <button
          type="button"
          onClick={() => setPalette(true)}
          aria-label="Search pages"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border"
        >
          <Search className="h-5 w-5" />
        </button>
      </header>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="portal-scope flex w-[19rem] flex-col border-border bg-card p-5 [&>button]:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="mb-5 flex items-center justify-between">
            <Brand />
            <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ClientChip />
          <div className="flex-1 overflow-y-auto">
            <NavList onNavigate={() => setMenu(false)} />
          </div>
          <SidebarFooter theme={theme} onTheme={onThemeChange} />
        </SheetContent>
      </Sheet>

      {/* ---- page */}
      <div className="lg:pl-64">
        <div className="hidden items-center justify-end px-8 pt-6 lg:flex">
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-portal transition-colors hover:text-foreground"
          >
            <Search className="h-4 w-4" /> Jump to…
            <kbd className="ml-2 flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 text-[0.6875rem]">
              <CommandIcon className="h-3 w-3" />K
            </kbd>
          </button>
        </div>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 lg:pt-4">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={palette} onOpenChange={setPalette} />
      <WelcomeTour />
    </div>
  );
}
