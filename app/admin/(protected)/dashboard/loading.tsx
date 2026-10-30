import { StatCardSkeleton, TableSkeleton } from "@/components/shared/loading-state";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
