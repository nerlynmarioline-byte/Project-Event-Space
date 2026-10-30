import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Event } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventStatusBadge } from "@/components/admin/event-status-badge";
import { EventRowActions } from "@/components/admin/event-row-actions";
import { EmptyState } from "@/components/shared/empty-state";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function EventTable({
  events,
  emptyAction,
}: {
  events: Event[];
  emptyAction?: React.ReactNode;
}) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Belum ada event"
        description="Tambahkan event pertama untuk mulai mengisi EventSpace."
        action={emptyAction}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Poster</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Lokasi</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell>
              <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                <Image
                  src={event.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            </TableCell>
            <TableCell className="max-w-[220px]">
              <Link
                href={`/admin/events/${event.id}/edit`}
                className="line-clamp-1 font-medium hover:underline"
              >
                {event.title}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {event.category}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {dateFormatter.format(event.startDate)}
            </TableCell>
            <TableCell className="max-w-[160px] truncate text-muted-foreground">
              {event.city}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {event.price === 0 ? "Gratis" : currencyFormatter.format(event.price)}
            </TableCell>
            <TableCell>
              <EventStatusBadge status={event.status} />
            </TableCell>
            <TableCell className="text-right">
              <EventRowActions
                eventId={event.id}
                eventTitle={event.title}
                slug={event.slug}
                status={event.status}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
