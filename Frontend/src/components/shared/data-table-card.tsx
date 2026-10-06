"use client";

import { Search, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { PaginationMeta } from "@/types/api";
import { DataPagination } from "./data-pagination";
import { EmptyState } from "./empty-state";

interface DataTableCardProps {
  /** Search box on the left of the toolbar. */
  search?: { value: string; onChange: (value: string) => void; placeholder?: string };
  /** Filters, placed right after the search box. */
  filters?: ReactNode;
  /** The primary action ("Add …"), always on the right of the toolbar. */
  action?: ReactNode;
  /** Shown instead of the table when there are no rows. */
  empty?: { icon?: LucideIcon; title: string; description?: string };
  isEmpty?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  /** The `<Table>`. */
  children: ReactNode;
}

/**
 * The one layout every list screen uses: toolbar (search · filters ··· action),
 * then the table (or an empty state), then pagination.
 */
export function DataTableCard({
  search,
  filters,
  action,
  empty,
  isEmpty,
  meta,
  onPageChange,
  children,
}: DataTableCardProps) {
  const hasToolbar = Boolean(search || filters || action);

  return (
    <Card className="gap-0 py-0">
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2 border-b p-3">
          {search && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder={search.placeholder ?? "Search…"}
                value={search.value}
                onChange={(event) => search.onChange(event.target.value)}
              />
            </div>
          )}
          {filters}
          {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
        </div>
      )}

      {isEmpty && empty ? <EmptyState icon={empty.icon} title={empty.title} description={empty.description} /> : children}

      {meta && onPageChange && <DataPagination meta={meta} onPageChange={onPageChange} />}
    </Card>
  );
}
