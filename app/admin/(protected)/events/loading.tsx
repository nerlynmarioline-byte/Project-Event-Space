import { TableSkeleton } from "@/components/shared/loading-state";

export default function EventsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <TableSkeleton rows={8} />
    </div>
  );
}
