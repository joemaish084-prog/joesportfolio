import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The portal's one table: sortable, searchable and paged, built on TanStack
// Table. Columns can set `meta: { className }` for alignment or width.

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search",
  pageSize = 10,
  initialSorting = [],
  toolbar,
  empty,
  onRowClick,
}: {
  data: T[];
  columns: ColumnDef<T, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  searchPlaceholder?: string;
  pageSize?: number;
  initialSorting?: SortingState;
  toolbar?: ReactNode;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [filter, setFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    globalFilterFn: "includesString",
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize: size } = table.getState().pagination;

  return (
    <div className="portal-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 p-3.5">
        <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 rounded-xl bg-background/60 pl-9"
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-border/70 text-left">
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}
                      className={cn("whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground", header.column.columnDef.meta?.className)}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-foreground"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {dir === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-primary" />
                          ) : dir === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-primary" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(
                  "border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/50",
                  onRowClick && "cursor-pointer",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={cn("px-4 py-3.5 align-middle", cell.column.columnDef.meta?.className)}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">{filter ? "Nothing matches that search." : (empty ?? "Nothing here yet.")}</div>
        )}
      </div>

      {total > size && (
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 text-sm text-muted-foreground">
          <span className="portal-tabular">
            {pageIndex * size + 1}–{Math.min(total, (pageIndex + 1) * size)} of {total}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
