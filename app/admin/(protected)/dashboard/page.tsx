import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CalendarClock, CalendarX2, CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { EventTable } from "@/components/admin/event-table";
import { getEventStats, getRecentEvents } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [stats, recentEvents] = await Promise.all([
    getEventStats(),
    getRecentEvents(5),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan event di EventSpace.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <Plus className="size-4" aria-hidden="true" />
            Tambah event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total event" value={stats.total} icon={CalendarDays} />
        <StatCard label="Published" value={stats.PUBLISHED} icon={CalendarCheck} />
        <StatCard label="Draft" value={stats.DRAFT} icon={CalendarClock} />
        <StatCard label="Cancelled" value={stats.CANCELLED} icon={CalendarX2} />
        <StatCard label="Finished" value={stats.FINISHED} icon={CalendarCheck} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Event terbaru</h2>
          <Link href="/admin/events" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            Lihat semua
          </Link>
        </div>
        <EventTable
          events={recentEvents}
          emptyAction={
            <Button asChild size="sm">
              <Link href="/admin/events/create">Tambah event pertama</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
