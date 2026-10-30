import type { EventStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<EventStatus, { label: string; dot: string }> = {
  DRAFT: { label: "Draft", dot: "bg-status-draft" },
  PUBLISHED: { label: "Published", dot: "bg-status-published" },
  CANCELLED: { label: "Cancelled", dot: "bg-status-cancelled" },
  FINISHED: { label: "Finished", dot: "bg-status-finished" },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">
      <span className={cn("size-1.5 rounded-full", config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}
