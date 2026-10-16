import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Check, ChevronsUpDown, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useClients } from "../lib/queries";
import { inputClass } from "./form";

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
    () =>
      (clients.data ?? []).filter((c) => !c.archived_at || c.id === value).sort((a, b) => a.name.localeCompare(b.name)),
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
          <span className="flex-1 truncate">
            {current?.name ?? (allowNone && value === null ? noneLabel : placeholder)}
          </span>
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
