import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, Table2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Action = () => void | Promise<void>;

/** One "Download" button offering whichever of PDF, Excel and CSV make sense for the data. */
export function ExportMenu({
  onPdf,
  onXlsx,
  onCsv,
  label = "Download",
  variant = "outline",
}: {
  onPdf?: Action;
  onXlsx?: Action;
  onCsv?: Action;
  label?: string;
  variant?: "outline" | "default";
}) {
  const [busy, setBusy] = useState(false);

  const run = (name: string, action?: Action) => async () => {
    if (!action) return;
    setBusy(true);
    try {
      await action();
      toast.success(`${name} downloaded`);
    } catch {
      toast.error(`Couldn't create the ${name}. Please try again.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} disabled={busy} className="h-10 gap-2 rounded-xl">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl">
        {onPdf && (
          <DropdownMenuItem onSelect={run("PDF", onPdf)} className="gap-2.5 py-2.5">
            <FileText className="h-4 w-4 text-primary" /> PDF report
          </DropdownMenuItem>
        )}
        {onXlsx && (
          <DropdownMenuItem onSelect={run("Excel file", onXlsx)} className="gap-2.5 py-2.5">
            <FileSpreadsheet className="h-4 w-4 text-primary" /> Excel (.xlsx)
          </DropdownMenuItem>
        )}
        {onCsv && (
          <DropdownMenuItem onSelect={run("CSV file", onCsv)} className="gap-2.5 py-2.5">
            <Table2 className="h-4 w-4 text-primary" /> CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
