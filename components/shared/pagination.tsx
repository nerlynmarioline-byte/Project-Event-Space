import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const paginationLinkClassName =
  "group relative isolate inline-flex min-h-9 items-center justify-center gap-2 overflow-hidden whitespace-nowrap select-none rounded-lg border border-input bg-background px-3 text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent hover:text-accent-foreground hover:shadow-lg active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 touch-manipulation motion-reduce:transform-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-center gap-2"
    >
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(paginationLinkClassName, page <= 1 && "pointer-events-none opacity-50")}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Sebelumnya
      </Link>
      <span className="px-2 text-sm text-muted-foreground">
        Halaman {page} dari {totalPages}
      </span>
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(paginationLinkClassName, page >= totalPages && "pointer-events-none opacity-50")}
      >
        Berikutnya
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
