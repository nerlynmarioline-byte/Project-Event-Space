
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, CalendarDays, SlidersHorizontal } from "lucide-react";
import type { EventStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventTable } from "@/components/admin/event-table";
import { Pagination } from "@/components/shared/pagination";
import { ToastOnParam } from "@/components/admin/toast-on-param";
import { getAdminEvents } from "@/lib/data/events";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kelola Event | EventSpace",
  robots: { index: false, follow: false },
};

const STATUS_TABS: {
  label: string;
  value: EventStatus | "ALL";
}[] = [
  { label: "Semua Event", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Finished", value: "FINISHED" },
];

type EventsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function AdminEventsPage({
  searchParams,
}: EventsPageProps) {
  const params = await searchParams;

  const parsedPage = Number(params.page);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const search = params.search?.trim() || undefined;

  const validStatuses = STATUS_TABS.map((tab) => tab.value);
  const requestedStatus = params.status;

  const status = validStatuses.includes(
    requestedStatus as EventStatus | "ALL"
  )
    ? (requestedStatus as EventStatus | "ALL")
    : "ALL";

  const { events, totalPages } = await getAdminEvents({
    page,
    search,
    status,
  });

  function buildHref(overrides: {
    page?: number;
    status?: string;
  }) {
    const next = new URLSearchParams();

    if (search) {
      next.set("search", search);
    }

    const nextStatus = overrides.status ?? status;

    if (nextStatus !== "ALL") {
      next.set("status", nextStatus);
    }

    next.set("page", String(overrides.page ?? page));

    return `/admin/events?${next.toString()}`;
  }

  return (
    <main className="min-w-0 space-y-6 pb-8 sm:space-y-8">
      <ToastOnParam
        param="created"
        message="Event berhasil dibuat"
      />

      <ToastOnParam
        param="updated"
        message="Event berhasil diperbarui"
      />

      {/* HEADER */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays
              className="size-4"
              aria-hidden="true"
            />
            <span>Manajemen EventSpace</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kelola Event
          </h1>

          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Kelola, pantau, dan perbarui semua event yang ada
            di platform EventSpace.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="w-full shrink-0 sm:w-auto"
        >
          <Link href="/admin/events/create">
            <Plus
              className="size-4"
              aria-hidden="true"
            />
            Tambah Event
          </Link>
        </Button>
      </section>

      {/* FILTER DAN PENCARIAN */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />

          <h2 className="text-sm font-semibold">
            Filter dan Pencarian
          </h2>
        </div>

        {/* STATUS TABS */}
        <nav
          aria-label="Filter status event"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.value;

            return (
              <Link
                key={tab.value}
                href={buildHref({
                  status: tab.value,
                  page: 1,
                })}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center",
                  "justify-center rounded-xl border px-4 py-2",
                  "text-sm font-medium transition-all duration-200",
                  "hover:-translate-y-0.5 active:scale-[0.98]",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* SEARCH */}
        <form
          method="GET"
          action="/admin/events"
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          {status !== "ALL" && (
            <input
              type="hidden"
              name="status"
              value={status}
            />
          )}

          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Cari nama event..."
              aria-label="Cari nama event"
              className={cn(
                "h-11 w-full rounded-xl bg-background pl-10",
                "transition-shadow focus-visible:ring-2"
              )}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <Search
              className="size-4"
              aria-hidden="true"
            />
            Cari Event
          </Button>

          {search && (
            <Button
              asChild
              variant="ghost"
              className="w-full sm:w-auto"
            >
              <Link
                href={
                  status === "ALL"
                    ? "/admin/events"
                    : `/admin/events?status=${status}`
                }
              >
                Reset
              </Link>
            </Button>
          )}
        </form>
      </section>

      {/* EVENT TABLE */}
      <section className="min-w-0 space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Daftar Event
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? `Hasil pencarian untuk "${search}"`
                : "Informasi event yang tersedia untuk dikelola."}
            </p>
          </div>

          {status !== "ALL" && (
            <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Status:{" "}
              {STATUS_TABS.find(
                (tab) => tab.value === status
              )?.label ?? status}
            </span>
          )}
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
          <EventTable
            events={events}
            emptyAction={
              <Button asChild size="sm">
                <Link href="/admin/events/create">
                  <Plus
                    className="size-4"
                    aria-hidden="true"
                  />
                  Tambah Event
                </Link>
              </Button>
            }
          />
        </div>

        {totalPages > 1 && (
          <div className="border-t border-border pt-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(targetPage) =>
                buildHref({ page: targetPage })
              }
            />
          </div>
        )}
      </section>
    </main>
  );
}
