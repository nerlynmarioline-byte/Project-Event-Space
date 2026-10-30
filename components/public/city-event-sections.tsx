import type { Event } from "@prisma/client";

import { EventGrid } from "@/components/public/event-grid";
import { EVENT_CITIES } from "@/lib/validation/event";

export function CityEventSections({
  events,
  favoritedIds,
}: {
  events: Event[];
  favoritedIds?: Set<string>;
}) {
  if (!events.length) {
    return <EventGrid events={events} emptyMessage="Coba ubah kata kunci atau filter yang kamu pakai." favoritedIds={favoritedIds} />;
  }

  const groups = EVENT_CITIES.map((city) => ({
    city,
    events: events.filter((event) => event.city === city),
  })).filter((group) => group.events.length > 0);

  return (
    <div className="city-event-sections">
      {groups.map(({ city, events: cityEvents }) => {
        return (
          <section className="city-event-section" key={city} aria-label={`Event di ${city}`}>
            <div className="city-event-section__heading">
              <div className="city-event-section__title">
                <h3>{city}</h3>
                <span>{cityEvents.length} agenda</span>
              </div>
            </div>
            <EventGrid events={cityEvents} favoritedIds={favoritedIds} />
          </section>
        );
      })}
    </div>
  );
}
