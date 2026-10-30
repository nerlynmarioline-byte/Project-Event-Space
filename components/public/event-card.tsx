import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Event } from "@prisma/client";

import { FavoriteButton } from "@/components/public/favorite-button";
import { formatEventDateRange, formatPrice } from "@/lib/events/format";

type EventCardProps = {
  event: Event;
  distanceKm?: number;
  isFavorited?: boolean;
  showFavorite?: boolean;
};

export function EventCard({
  event,
  distanceKm,
  isFavorited = false,
  showFavorite = true,
}: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__visual group">
        <Link href={`/events/${event.slug}`} className="event-card__image-link">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={event.image}
              alt={event.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="event-card__image"
            />
            <span className="event-card__category">{event.category}</span>
              {event.status === "CANCELLED" ? (
                <span className="event-card__status">Dibatalkan</span>
              ) : null}
              {event.status === "FINISHED" ? <span className="event-card__status">Selesai</span> : null}
            {distanceKm != null ? (
                <div className="event-card__distance">
                {distanceKm < 1
                  ? `${Math.round(distanceKm * 1000)} m`
                  : `${distanceKm.toFixed(1)} km`}
              </div>
            ) : null}
            <span className="event-card__arrow"><ArrowUpRight size={17} /></span>
          </div>
        </Link>
        {showFavorite ? (
          <div className="event-card__favorite">
            <FavoriteButton eventId={event.id} initialFavorited={isFavorited} />
          </div>
        ) : null}
      </div>

      <div className="event-card__body">
        <p className="event-card__date">
          {formatEventDateRange(event.startDate, event.endDate)} <span>&middot;</span> {event.startTime}
        </p>
        <Link href={`/events/${event.slug}`} className="event-card__title">
          <h3>
            {event.title}
          </h3>
        </Link>
        <p className="event-card__place">
          <MapPin size={14} aria-hidden="true" />
          <span className="truncate">
            {event.location}, {event.city}
          </span>
        </p>
        <div className="event-card__foot"><span>{formatPrice(event.price)}</span><span className="event-card__foot-rule" /><span className="event-card__small-category">{event.performer || event.category}</span></div>
      </div>
    </article>
  );
}
