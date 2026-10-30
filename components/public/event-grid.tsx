import { CalendarX } from "lucide-react";
import type { Event } from "@prisma/client";

import { EventCard } from "@/components/public/event-card";
import { EmptyState } from "@/components/shared/empty-state";

export function EventGrid({
  events,
  emptyMessage = "Belum ada event untuk ditampilkan.",
  favoritedIds,
}: {
  events: Event[];
  emptyMessage?: string;
  favoritedIds?: Set<string>;
}) {
  if (events.length === 0) {
    return <EmptyState icon={CalendarX} title="Tidak ada event" description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} isFavorited={favoritedIds?.has(event.id)} />
      ))}
    </div>
  );
}
