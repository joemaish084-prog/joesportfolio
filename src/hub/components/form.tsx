import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Form building blocks. The date and client pickers live in ./pickers so the
// calendar and command libraries load only with the screens that use them.

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
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        KES
      </span>
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
          "max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl border-border/70 bg-card p-0 sm:rounded-3xl",
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

/** Multi-select as toggle chips. */
export function Chips({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== option) : [...value, option])}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150",
              on
                ? "border-primary/40 bg-tint font-medium text-on-tint"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {on && <Check className="h-3.5 w-3.5" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}
