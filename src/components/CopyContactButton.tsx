import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function CopyContactButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const { toast } = useToast();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      clearTimeout(timer.current);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Please copy manually", description: value });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0 text-muted-foreground hover:text-primary"
        onClick={copy}
        aria-label={`Copy ${label}`}
        title={copied ? "Copied" : `Copy ${label}`}
      >
        {copied ? <Check className="h-4 w-4 text-primary" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </Button>
      <span className="sr-only" role="status">{copied ? `${label} copied to clipboard` : ""}</span>
    </>
  );
}
