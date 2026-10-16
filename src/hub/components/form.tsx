import { useMemo, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useClients } from "../lib/queries";

export const inputClass = "h-11 rounded-xl bg-background";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="hub-label block">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** "KES" prefix input; value is the raw text so "45,000" can be typed. */
export function MoneyInput({
  id,
  value,
  onChange,
  placeholder = "0",
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KES</span>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, "hub-tabular pl-12")}
      />
    </div>
  );
}

/** shadcn date picker: Popover + Calendar. Value is an ISO date ("2026-10-16") or null. */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  clearable = true,
  className,
}: {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative", className)}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-xl border border-input px-3.5 text-left text-sm transition-colors duration-150 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              inputClass,
              !value && "text-muted-foreground",
            )}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate">{selected ? format(selected, "d MMM yyyy") : placeholder}</span>
          </button>
        </PopoverTrigger>
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Clear date"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <PopoverContent className="w-auto rounded-2xl p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(day) => {
            onChange(day ? format(day, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/** shadcn combobox (Popover + Command) over live clients. */
export function ClientPicker({
  id,
  value,
  onChange,
  allowNone,
  noneLabel = "No client",
  placeholder = "Choose a client",
  className,
}: {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  allowNone?: boolean;
  noneLabel?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const clients = useClients();
  const options = useMemo(
    () => (clients.data ?? []).filter((c) => !c.archived_at || c.id === value).sort((a, b) => a.name.localeCompare(b.name)),
    [clients.data, value],
  );
  const current = options.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl border border-input px-3.5 text-left text-sm transition-colors duration-150 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            inputClass,
            !current && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex-1 truncate">{current?.name ?? (allowNone && value === null ? noneLabel : placeholder)}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 rounded-2xl p-0" align="start">
        <Command>
          <CommandInput placeholder="Search clients" />
          <CommandList>
            <CommandEmpty>No client found.</CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem
                  value={`__none ${noneLabel}`}
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === null ? "opacity-100" : "opacity-0")} />
                  {noneLabel}
                </CommandItem>
              )}
              {options.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.id}`}
                  onSelect={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === c.id ? "opacity-100" : "opacity-0")} />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** Form in a shadcn Dialog with hub styling, scrollable on small screens. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  pending,
  error,
  footerExtra,
  wide,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  pending?: boolean;
  error?: string | null;
  footerExtra?: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "hub-root max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl border-border/70 bg-card p-0 sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          noValidate
        >
          <DialogHeader className="px-6 pb-2 pt-6 text-left">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 px-6 py-4">{children}</div>
          {error && (
            <p role="alert" className="mx-6 mb-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="sticky bottom-0 gap-2 border-t border-border/60 bg-card px-6 py-4 sm:items-center sm:space-x-0">
            {footerExtra && <div className="mr-auto">{footerExtra}</div>}
            <Button type="button" variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="min-w-24 rounded-full" disabled={pending}>
              {pending ? "Saving…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
